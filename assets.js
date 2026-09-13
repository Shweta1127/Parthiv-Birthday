const timeline = [
  { text: 'Huhh..', frames: [{ id: 1, delay: 800 }, { id: 2, delay: 100 }] },
  { text: 'Ohh..', frames: [{ id: 3, delay: 1000 }] },
  { text: "It's that time...", frames: [{ id: 6, delay: 200 }, { id: 7, delay: 200 }, { id: 9, delay: 400 }, { id: 10, delay: 200 }, { id: 11, delay: 1000 }] },
  { text: 'of the year', frames: [{ id: 12, delay: 150 }, { id: 13, delay: 350 }, { id: 14, delay: 200 }, { id: 15, delay: 800 }] },
  { text: 'again...', frames: [{ id: 17, delay: 150 }, { id: 18, delay: 200 }, { id: 19, delay: 1000 }] },
  { text: 'Ok...', frames: [{ id: 2, delay: 600 }], waitForAudio: true },
  { text: 'Here we go', frames: [{ id: 20, delay: 200 }, { id: 21, delay: 500 }, { id: 22, delay: 1000 }], waitForAudio: true },
  // Scene 27 is the blank note base for the final reveal, not a separate hat frame.
  { frames: [{ id: 23, delay: 200 }, { id: 24, delay: 500 }, { id: 1, delay: 200 }, { id: 25, delay: 300 }, { id: 26, delay: 500 }] }
];

// The final reveal uses frames 27 and 28 as layered note artwork.
// Include them here so both images are ready before the surprise is shown.
const frameIds = [...new Set([
  ...timeline.flatMap(step => step.frames.map(frame => frame.id)),
  27,
  28
])];
const musicTrackIds = [1, 2, 3, 4, 5, 6, 7, 8];
const backgroundMusicFiles = ['bg01.mp3', 'bg02.mp3'];

function preloadFrames(onProgress) {
  let loaded = 0;
  const totalAssets = frameIds.length + musicTrackIds.length + backgroundMusicFiles.length;
  const markLoaded = () => {
    loaded += 1;
    onProgress(loaded, totalAssets);
  };

  const imagePromises = frameIds.map(id => new Promise(resolve => {
    const image = new Image();
    image.onload = image.onerror = () => { markLoaded(); resolve(); };
    image.src = CONFIG.getSceneUrl(id);
  }));

  const musicPromises = musicTrackIds.map(id => new Promise(resolve => {
    preloadAudio(CONFIG.getMusicUrl(id), markLoaded).then(resolve);
  }));

  const backgroundMusicPromises = backgroundMusicFiles.map(filename => new Promise(resolve => {
    preloadAudio(CONFIG.getBackgroundMusicUrl(filename), markLoaded).then(resolve);
  }));

  return Promise.all([...imagePromises, ...musicPromises, ...backgroundMusicPromises]);
}

// iOS Safari may not fire canplaythrough for media that cannot be preloaded
// before a user gesture. Always settle these checks so the site can continue
// silently and let playback begin from the user's later tap.
function preloadAudio(source, onLoaded) {
  return new Promise(resolve => {
    let settled = false;
    let timeoutId;
    let audio;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if (audio) {
        audio.oncanplaythrough = null;
        audio.onloadedmetadata = null;
        audio.onerror = null;
      }
      onLoaded();
      resolve();
    };

    try {
      audio = new Audio();
      audio.preload = 'metadata';
      audio.oncanplaythrough = finish;
      audio.onloadedmetadata = finish;
      audio.onerror = finish;
      audio.src = source;
      timeoutId = setTimeout(finish, 4500);
      audio.load();
    } catch (error) {
      finish();
    }
  });
}
