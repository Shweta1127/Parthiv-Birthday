// Future MP3 players subscribe to this event and mute/pause themselves when disabled.
let enabled = false;

function setAudioEnabled(nextEnabled) {
  enabled = Boolean(nextEnabled);
  document.documentElement.dataset.audio = enabled ? 'on' : 'off';
  window.dispatchEvent(new CustomEvent('audio-preference-change', { detail: { enabled } }));
}

function isAudioEnabled() {
  return enabled;
}
