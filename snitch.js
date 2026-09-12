class GoldenSnitch {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.snitch = wrapper.querySelector('.snitch');
    this.snitchRoamTimer = null;
  }

  show() {
    this.wrapper.classList.add('visible');
    // Sit at the note's spot briefly before wandering off (exact logic from bday (1).html)
    setTimeout(() => this.startSnitchRoam(), 1800);
  }

  startSnitchRoam() {
    if (!this.snitch) return;

    const nextMove = () => {
      const x = (Math.random() * 76 - 38).toFixed(1);          // -38vw .. 38vw
      const y = (Math.random() * 64 - 32).toFixed(1);          // -32vh .. 32vh
      const scale = (0.45 + Math.random() * 1.0);               // 0.45 (far) .. 1.45 (close)
      const closeness = (scale - 0.45) / 1.0;                   // 0 = far, 1 = close
      const opacity = (0.6 + closeness * 0.4).toFixed(2);
      const blur = closeness < 0.3 ? ((0.3 - closeness) * 2).toFixed(2) : 0;
      const duration = (1.8 + Math.random() * 2.8);             // 1.8s - 4.6s, irregular pacing

      this.snitch.style.transitionDuration = `${duration}s`;
      this.snitch.style.transform = `translate(${x}vw, ${y}vh) scale(${scale.toFixed(2)})`;
      this.snitch.style.opacity = opacity;
      this.snitch.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';

      this.snitchRoamTimer = setTimeout(nextMove, duration * 1000);
    };

    nextMove();
  }
}
