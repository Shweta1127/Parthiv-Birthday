const pesteringLines = [
  ['The portraits whisper in the dark.', 'Break the curse?'],
  ['Even the Sorting Hat prefers to be heard.', 'Unsilence the room?'],
  ['Mischief is best managed with sound.', 'Awaken the magic?'],
  ['Are you afraid of what you might hear?', 'Cast Lumos Audio?']
];
const MINIMUM_NO_PROMPTS = 3;
const QUIET_OPTION_GRACE_MS = 200;

document.addEventListener('DOMContentLoaded', () => {
  const consent = document.getElementById('audio-consent');
  const title = document.getElementById('consent-title');
  const message = document.getElementById('audio-consent-message');
  const status = document.getElementById('loading-status');
  const yesButton = document.getElementById('consent-continue');
  const noButton = document.getElementById('audio-no');
  const actions = document.querySelector('.audio-consent-actions');
  let loading = true;
  let noCount = 0;
  let firstYesAccepted = false;
  let finalScreen = false;
  let quietOptionTimer = null;

  const hatFrame = document.getElementById('hat-frame');
  if (hatFrame) hatFrame.src = CONFIG.getSceneUrl(1);

  // Safe MP3 audio preloading from S3 (never halts app if MP3 fails to load)
  const musicAudioMap = {};
  let currentStepAudio = null;
  const backgroundAudioMap = {};
  let currentBackgroundAudio = null;
  let revealAudio = null;

  musicTrackIds.forEach(id => {
    try {
      const audio = new Audio(CONFIG.getMusicUrl(id));
      audio.preload = 'auto';
      audio.onerror = () => { console.warn(`Hat music scene/music/${id}.mp3 failed to load; proceeding silently.`); };
      musicAudioMap[id] = audio;
    } catch (e) {
      console.warn(`Hat music init fallback for track ${id}:`, e);
    }
  });

  backgroundMusicFiles.forEach(filename => {
    try {
      const audio = new Audio(CONFIG.getBackgroundMusicUrl(filename));
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0.45;
      audio.onerror = () => { console.warn(`Background music scene/music/${filename} failed to load; proceeding silently.`); };
      backgroundAudioMap[filename] = audio;
    } catch (e) {
      console.warn(`Background music init fallback for ${filename}:`, e);
    }
  });

  try {
    revealAudio = new Audio(CONFIG.getAudioUrl(CONFIG.sound2));
    revealAudio.preload = 'auto';
    revealAudio.onerror = () => { console.warn('Reveal sound failed to load; proceeding silently.'); };
  } catch (e) {
    console.warn('Reveal audio init fallback:', e);
  }

  function stopBackgroundMusic() {
    if (!currentBackgroundAudio) return;
    try {
      currentBackgroundAudio.pause();
      currentBackgroundAudio.currentTime = 0;
    } catch (e) {}
    currentBackgroundAudio = null;
  }

  function playBackgroundMusic(filename) {
    if (!isAudioEnabled()) return;
    stopBackgroundMusic();
    const audio = backgroundAudioMap[filename];
    if (audio) {
      currentBackgroundAudio = audio;
      try {
        audio.currentTime = 0;
        audio.play().catch(err => console.warn(`Background music ${filename} playback restricted:`, err));
      } catch (e) {}
    }
  }

  function playStepMusic(musicId) {
    if (!isAudioEnabled()) return;
    stopStepMusic();
    const audio = musicAudioMap[musicId];
    if (audio) {
      currentStepAudio = audio;
      try {
        audio.currentTime = 0;
        audio.play().catch(err => console.warn(`Hat music ${musicId}.mp3 playback restricted:`, err));
      } catch (e) {}
    }
  }

  function stopStepMusic() {
    if (!currentStepAudio) return;
    try {
      currentStepAudio.pause();
      currentStepAudio.currentTime = 0;
    } catch (e) {}
    currentStepAudio = null;
  }

  function playRevealSound() {
    if (!isAudioEnabled()) return;
    stopStepMusic();
    try {
      if (revealAudio) {
        revealAudio.currentTime = 0;
        revealAudio.play().catch(err => console.warn('Reveal audio playback restricted:', err));
      }
    } catch (e) {}
  }

  // Returns a Promise that resolves when the current hat track ends (or after a 15 s safety cap).
  function waitForCurrentAudio() {
    const SAFETY_TIMEOUT_MS = 15000;
    return new Promise(resolve => {
      const audio = currentStepAudio;
      if (!audio || !isAudioEnabled()) { resolve(); return; }
      if (audio.ended || audio.paused) { resolve(); return; }
      let settled = false;
      const done = () => { if (!settled) { settled = true; resolve(); } };
      audio.addEventListener('ended', done, { once: true });
      audio.addEventListener('error', done, { once: true });
      setTimeout(done, SAFETY_TIMEOUT_MS);
    });
  }

  const reveal = new FinalReveal(document.getElementById('final-card'));
  const snitch = new GoldenSnitch(document.getElementById('snitch-wrapper'));
  const fireworks = new Fireworks(document.getElementById('fireworks-canvas'));
  document.addEventListener('birthday:celebrate', () => fireworks.start());

  const hat = new HatSequence({
    container: document.getElementById('hat-container'), frame: hatFrame,
    bubble: document.getElementById('speech-bubble'), dialogue: document.getElementById('dialogue-text'),
    onStart: () => { playBackgroundMusic(CONFIG.backgroundMusicStart); },
    onStepStart: (_stepIndex, musicId) => { playStepMusic(musicId); },
    onStepAudioEnd: (_stepIndex) => waitForCurrentAudio(),
    onComplete: () => {
      reveal.show();
      playBackgroundMusic(CONFIG.backgroundMusicReveal);
      playRevealSound();
      snitch.show();
      fireworks.start();
    }
  });


  function showFinalConsent() {
    finalScreen = true;
    title.textContent = 'Dare break the silence?';
    message.textContent = 'The Sorting Hat awaits your command.';
    status.textContent = 'The magic is prepared.';
    yesButton.textContent = 'ENTER THE GREAT HALL';
    noButton.textContent = 'Nox (Keep silent)';
    actions.classList.remove('loading');
    actions.classList.add('final');
  }

  function leaveConsent(audioOn) {
    clearTimeout(quietOptionTimer);
    setAudioEnabled(audioOn);
    consent.classList.add('dismissed');
    // The hat remains idle until the visitor chooses to click it for the surprise.
  }

  function showLoadingDots() {
    title.textContent = 'The hat is considering.';
    message.textContent = 'Do not look away.';
    yesButton.disabled = true;
    actions.classList.add('loading');
    yesButton.textContent = 'SUMMONING…';
    let dots = 0;
    const timer = setInterval(() => {
      if (!loading) { clearInterval(timer); return; }
      dots = (dots % 3) + 1;
      status.textContent = `Preparing the surprise${'.'.repeat(dots)}`;
    }, 340);
  }

  yesButton.addEventListener('click', () => {
    try {
      musicTrackIds.forEach(id => { if (musicAudioMap[id]) musicAudioMap[id].load(); });
      backgroundMusicFiles.forEach(filename => {
        if (backgroundAudioMap[filename]) backgroundAudioMap[filename].load();
      });
      if (revealAudio) revealAudio.load();
    } catch (e) {}
    if (!loading) { leaveConsent(true); return; }
    firstYesAccepted = true;
    setAudioEnabled(true);
    showLoadingDots();
  });

  noButton.addEventListener('click', () => {
    if (firstYesAccepted) return;
    if (finalScreen) { leaveConsent(false); return; }
    const [nextTitle, nextMessage] = pesteringLines[noCount % pesteringLines.length];
    noCount += 1;
    title.textContent = nextTitle;
    message.textContent = nextMessage;
    if (!loading && noCount >= MINIMUM_NO_PROMPTS) showFinalConsent();
  });

  function showQuietOption() {
    if (!finalScreen) return;
    clearTimeout(quietOptionTimer);
    actions.classList.add('final-no-visible');
  }

  function startQuietOptionCountdown() {
    if (!finalScreen) return;
    clearTimeout(quietOptionTimer);
    quietOptionTimer = setTimeout(() => actions.classList.remove('final-no-visible'), QUIET_OPTION_GRACE_MS);
  }

  yesButton.addEventListener('mouseenter', showQuietOption);
  yesButton.addEventListener('mouseleave', startQuietOptionCountdown);
  yesButton.addEventListener('focus', showQuietOption);
  yesButton.addEventListener('blur', startQuietOptionCountdown);

  preloadFrames((loaded, total) => { status.textContent = `Preparing the surprise… ${Math.min(loaded,30)}/${Math.min(total,30)}`; }).then(() => {
    loading = false;
    if (firstYesAccepted) leaveConsent(true);
    else if (noCount >= MINIMUM_NO_PROMPTS) showFinalConsent();
  });

});
