const timeline = [
  { text: 'Huhh..', frames: [{ id: 1, delay: 800 }, { id: 2, delay: 100 }] },
  { text: 'Ohh..', frames: [{ id: 3, delay: 1000 }] },
  { text: "It's that time...", frames: [{ id: 6, delay: 200 }, { id: 7, delay: 200 }, { id: 9, delay: 400 }, { id: 10, delay: 200 }, { id: 11, delay: 1000 }] },
  { text: 'of the year', frames: [{ id: 12, delay: 150 }, { id: 13, delay: 350 }, { id: 14, delay: 200 }, { id: 15, delay: 800 }] },
  { text: 'again...', frames: [{ id: 17, delay: 150 }, { id: 18, delay: 200 }, { id: 19, delay: 1000 }] },
  { text: 'Ok...', frames: [{ id: 2, delay: 600 }], waitForAudio: true },
  { text: 'Here we go', frames: [{ id: 20, delay: 200 }, { id: 21, delay: 500 }, { id: 22, delay: 1000 }], waitForAudio: true },
  { frames: [{ id: 23, delay: 200 }, { id: 24, delay: 500 }, { id: 1, delay: 200 }, { id: 25, delay: 300 }, { id: 26, delay: 500 }, { id: 27, delay: 1000 }] }
];

// The final reveal uses frames 28 and 27 as the two sides of the note.
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

  const imagePromises = frameIds.map(id => new Promise(resolve => {
    const image = new Image();
    image.onload = image.onerror = () => { loaded += 1; onProgress(loaded, totalAssets); resolve(); };
    image.src = CONFIG.getSceneUrl(id);
  }));

  const musicPromises = musicTrackIds.map(id => new Promise(resolve => {
    try {
      const audio = new Audio();
      audio.oncanplaythrough = audio.onerror = () => { loaded += 1; onProgress(loaded, totalAssets); resolve(); };
      audio.preload = 'auto';
      audio.src = CONFIG.getMusicUrl(id);
    } catch(e) {
      loaded += 1; onProgress(loaded, totalAssets); resolve();
    }
  }));

  const backgroundMusicPromises = backgroundMusicFiles.map(filename => new Promise(resolve => {
    try {
      const audio = new Audio();
      audio.oncanplaythrough = audio.onerror = () => { loaded += 1; onProgress(loaded, totalAssets); resolve(); };
      audio.preload = 'auto';
      audio.src = CONFIG.getBackgroundMusicUrl(filename);
    } catch(e) {
      loaded += 1; onProgress(loaded, totalAssets); resolve();
    }
  }));

  return Promise.all([...imagePromises, ...musicPromises, ...backgroundMusicPromises]);
}
