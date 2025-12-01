import { EventsController } from './vidstack-Bu2kfzUd.js';

class CaptionsTextRenderer {
  // Region [CIJ] forceRefreshCaptions
  forceRefresh(textTracks) {
    const currentTrack = this.#track;
    textTracks.add({ kind: "captions" });
    const tempTrack = [...textTracks].at(-1);
    this.changeTrack(tempTrack);
    this.changeTrack(currentTrack);
    textTracks.remove(tempTrack);
  }
  // End [CIJ]
  priority = 10;
  #track = null;
  #renderer;
  #events;
  constructor(renderer) {
    this.#renderer = renderer;
  }
  attach() {
  }
  canRender() {
    return true;
  }
  detach() {
    this.#events?.abort();
    this.#events = void 0;
    this.#renderer.reset();
    this.#track = null;
  }
  changeTrack(track) {
    if (!track || this.#track === track) return;
    this.#events?.abort();
    this.#events = new EventsController(track);
    if (track.readyState < 2) {
      this.#renderer.reset();
      this.#events.add("load", () => this.#changeTrack(track), { once: true });
    } else {
      this.#changeTrack(track);
    }
    this.#events.add("add-cue", (event) => {
      this.#renderer.addCue(event.detail);
    }).add("remove-cue", (event) => {
      this.#renderer.removeCue(event.detail);
    });
    this.#track = track;
  }
  #changeTrack(track) {
    this.#renderer.changeTrack({
      cues: [...track.cues],
      regions: [...track.regions]
    });
  }
}

export { CaptionsTextRenderer };
