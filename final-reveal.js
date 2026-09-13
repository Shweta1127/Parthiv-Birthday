class FinalReveal {
  constructor(element) {
    this.element = element;
    this.revealTimer = null;
    this.flipTimer = null;
    this.isFading = false;

    element.addEventListener('click', () => {
      if (!this.element.classList.contains('visible')) return;
      this.toggleFlip();
    });

    element.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      this.element.click();
    });

    const celebrateButton = element.querySelector('#birthday-action');
    celebrateButton?.addEventListener('click', event => {
      event.stopPropagation();
      document.dispatchEvent(new CustomEvent('birthday:celebrate'));

      const subject = encodeURIComponent('Happy Birthday Parthiv! 🎉');
      const body = encodeURIComponent(
        'HAPPY BIRTHDAY PARTHIV! 🎂\n\n' +
        'Wishing you a wonderful birthday filled with happiness and magic!\n\n' +
        'From : [Your Name]'
      );
      window.location.href = `mailto:kparthiv13@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  show() {
    clearTimeout(this.revealTimer);
    clearTimeout(this.flipTimer);
    const blankUrl = CONFIG.getSceneUrl(27);
    const revealUrl = CONFIG.getSceneUrl(28);
    this.element.style.setProperty('--paper-image-blank', `url(${blankUrl})`);
    this.element.style.setProperty('--paper-image-reveal', `url(${revealUrl})`);
    this.element.style.setProperty('--paper-image-front', `url(${revealUrl})`);
    // The reverse face is the birthday note, not the revealed scene mirrored
    // through the front face.
    this.element.style.setProperty('--paper-image-back', `url(${blankUrl})`);
    this.element.querySelector('.note-back')?.style.setProperty('background-image', `url(${blankUrl})`);
    this.element.classList.remove('hidden', 'visible', 'revealed', 'flipped', 'revealing', 'fading');

    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });

    this.revealTimer = setTimeout(() => {
      this.element.classList.add('revealed');
    }, 2600);

    // Let the layered reveal finish before restoring the original note flip.
    this.flipTimer = setTimeout(() => {
      this.flipToBack();
    }, 6200);
  }

  toggleFlip() {
    if (this.isFading) return;
    this.fadeSwap(() => this.element.classList.toggle('flipped'));
  }

  flipToBack() {
    if (this.isFading || this.element.classList.contains('flipped')) return;
    this.fadeSwap(() => this.element.classList.add('flipped'));
  }

  fadeSwap(changeFace) {
    this.isFading = true;
    this.element.classList.add('fading');
    setTimeout(() => {
      changeFace();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        this.element.classList.remove('fading');
        this.isFading = false;
      }));
    }, 700);
  }
}