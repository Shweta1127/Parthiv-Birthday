const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

class HatSequence {
  constructor({ container, frame, bubble, dialogue, onStepStart, onStepAudioEnd, onStart, onComplete }) {
    this.container = container;
    this.frame = frame;
    this.bubble = bubble;
    this.dialogue = dialogue;
    this.onStepStart = onStepStart;
    this.onStepAudioEnd = onStepAudioEnd; // (stepIndex) => Promise — resolves when audio finishes
    this.onStart = onStart;
    this.onComplete = onComplete;
    this.started = false;

    if (this.dialogue) {
      this.dialogue.textContent = 'Click to start';
      this.bubble.classList.remove('hidden');
    }

    const start = () => this.start();
    container.addEventListener('click', start);
    container.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); start(); }
    });
  }

  async start() {
    if (this.started) return;
    this.started = true;
    if (this.onStart) this.onStart();
    this.container.classList.add('started');
    this.bubble.classList.remove('hidden');
    for (let i = 0; i < timeline.length; i++) {
      const step = timeline[i];
      const musicId = i + 1; // 1, 2, 3, 4, 5, 6, 7, 8
      if (this.onStepStart) {
        this.onStepStart(i, musicId, step);
      }
      if (step.text) { this.dialogue.textContent = step.text; this.bubble.classList.remove('hidden'); }
      else this.bubble.classList.add('hidden');
      for (const frame of step.frames) { this.frame.src = CONFIG.getSceneUrl(frame.id); await wait(frame.delay); }
      // If this step requests it, wait until its audio track naturally ends (15 s safety cap).
      if (step.waitForAudio && this.onStepAudioEnd) {
        await this.onStepAudioEnd(i);
      }
    }
    this.bubble.classList.add('hidden');
    this.onComplete();
    this.frame.classList.add('final-fade-out');
    await wait(1050);
    this.frame.style.visibility = 'hidden';
  }
}

