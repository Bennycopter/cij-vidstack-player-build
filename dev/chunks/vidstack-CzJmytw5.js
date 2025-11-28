const CROSS_ORIGIN = Symbol("TEXT_TRACK_CROSS_ORIGIN" ), READY_STATE = Symbol("TEXT_TRACK_READY_STATE" ), UPDATE_ACTIVE_CUES = Symbol("TEXT_TRACK_UPDATE_ACTIVE_CUES" ), CAN_LOAD = Symbol("TEXT_TRACK_CAN_LOAD" ), ON_MODE_CHANGE = Symbol("TEXT_TRACK_ON_MODE_CHANGE" ), NATIVE = Symbol("TEXT_TRACK_NATIVE" ), NATIVE_HLS = Symbol("TEXT_TRACK_NATIVE_HLS" );
const TextTrackSymbol = {
  crossOrigin: CROSS_ORIGIN,
  readyState: READY_STATE,
  updateActiveCues: UPDATE_ACTIVE_CUES,
  canLoad: CAN_LOAD,
  onModeChange: ON_MODE_CHANGE,
  native: NATIVE,
  nativeHLS: NATIVE_HLS
};

export { TextTrackSymbol };
