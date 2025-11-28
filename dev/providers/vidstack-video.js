import { onDispose, EventsController, listenEvent, DOMEvent, scoped } from '../chunks/vidstack-Bu2kfzUd.js';
import { canUsePictureInPicture, canUseVideoPresentation, canPlayHLSNatively } from '../chunks/vidstack-CjhKISI0.js';
import { HTMLMediaProvider } from './vidstack-html.js';
import { HTMLAirPlayAdapter } from '../chunks/vidstack-Bo5OTJ06.js';
import { TextTrackSymbol } from '../chunks/vidstack-CzJmytw5.js';
import '../chunks/vidstack-qh1N5_f_.js';
import '../chunks/vidstack-Dihypf8P.js';
import '../chunks/vidstack-Dv_LIPFu.js';

class NativeHLSTextTracks {
  #video;
  #ctx;
  constructor(video, ctx) {
    this.#video = video;
    this.#ctx = ctx;
    video.textTracks.onaddtrack = this.#onAddTrack.bind(this);
    onDispose(this.#onDispose.bind(this));
  }
  #onAddTrack(event) {
    return;
  }
  #onDispose() {
    this.#video.textTracks.onaddtrack = null;
    for (const track of this.#ctx.textTracks) {
      const nativeTrack = track[TextTrackSymbol.native]?.track;
      if (nativeTrack?.oncuechange) nativeTrack.oncuechange = null;
    }
  }
}

class VideoPictureInPicture {
  #video;
  #media;
  constructor(video, media) {
    this.#video = video;
    this.#media = media;
    new EventsController(video).add("enterpictureinpicture", this.#onEnter.bind(this)).add("leavepictureinpicture", this.#onExit.bind(this));
  }
  get active() {
    return document.pictureInPictureElement === this.#video;
  }
  get supported() {
    return canUsePictureInPicture(this.#video);
  }
  async enter() {
    return this.#video.requestPictureInPicture();
  }
  exit() {
    return document.exitPictureInPicture();
  }
  #onEnter(event) {
    this.#onChange(true, event);
  }
  #onExit(event) {
    this.#onChange(false, event);
  }
  #onChange = (active, event) => {
    this.#media.notify("picture-in-picture-change", active, event);
  };
}

class VideoPresentation {
  #video;
  #media;
  #mode = "inline";
  get mode() {
    return this.#mode;
  }
  constructor(video, media) {
    this.#video = video;
    this.#media = media;
    listenEvent(video, "webkitpresentationmodechanged", this.#onModeChange.bind(this));
  }
  get supported() {
    return canUseVideoPresentation(this.#video);
  }
  async setPresentationMode(mode) {
    if (this.#mode === mode) return;
    this.#video.webkitSetPresentationMode(mode);
  }
  #onModeChange(event) {
    const prevMode = this.#mode;
    this.#mode = this.#video.webkitPresentationMode;
    {
      this.#media.logger?.infoGroup("presentation mode change").labelledLog("Mode", this.#mode).labelledLog("Event", event).dispatch();
    }
    this.#media.player?.dispatch(
      new DOMEvent("video-presentation-change", {
        detail: this.#mode,
        trigger: event
      })
    );
    ["fullscreen", "picture-in-picture"].forEach((type) => {
      if (this.#mode === type || prevMode === type) {
        this.#media.notify(`${type}-change`, this.#mode === type, event);
      }
    });
  }
}
class FullscreenPresentationAdapter {
  #presentation;
  get active() {
    return this.#presentation.mode === "fullscreen";
  }
  get supported() {
    return this.#presentation.supported;
  }
  constructor(presentation) {
    this.#presentation = presentation;
  }
  async enter() {
    this.#presentation.setPresentationMode("fullscreen");
  }
  async exit() {
    this.#presentation.setPresentationMode("inline");
  }
}
class PIPPresentationAdapter {
  #presentation;
  get active() {
    return this.#presentation.mode === "picture-in-picture";
  }
  get supported() {
    return this.#presentation.supported;
  }
  constructor(presentation) {
    this.#presentation = presentation;
  }
  async enter() {
    this.#presentation.setPresentationMode("picture-in-picture");
  }
  async exit() {
    this.#presentation.setPresentationMode("inline");
  }
}

class VideoProvider extends HTMLMediaProvider {
  $$PROVIDER_TYPE = "VIDEO";
  get type() {
    return "video";
  }
  airPlay;
  fullscreen;
  pictureInPicture;
  constructor(video, ctx) {
    super(video, ctx);
    scoped(() => {
      this.airPlay = new HTMLAirPlayAdapter(video, ctx);
      if (canUseVideoPresentation(video)) {
        const presentation = new VideoPresentation(video, ctx);
        this.fullscreen = new FullscreenPresentationAdapter(presentation);
        this.pictureInPicture = new PIPPresentationAdapter(presentation);
      } else if (canUsePictureInPicture(video)) {
        this.pictureInPicture = new VideoPictureInPicture(video, ctx);
      }
    }, this.scope);
  }
  setup() {
    super.setup();
    if (canPlayHLSNatively(this.video)) {
      new NativeHLSTextTracks(this.video, this.ctx);
    }
    this.ctx.textRenderers.attachVideo(this.video);
    onDispose(() => {
      this.ctx.textRenderers.attachVideo(null);
    });
    if (this.type === "video") this.ctx.notify("provider-setup", this);
  }
  /**
   * The native HTML `<video>` element.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement}
   */
  get video() {
    return this.media;
  }
}

export { VideoProvider };
