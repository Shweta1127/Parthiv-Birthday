class FinalReveal {
  constructor(element) {
    this.element = element;
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
        'Wishing you a wonderful birthday filled with happiness and magic!'
      );
      window.location.href = `mailto:kparthiv13@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  show() {
    clearTimeout(this.flipTimer);
    this.isFading = false;
    this.element.style.setProperty('--paper-image-front', `url(${CONFIG.getSceneUrl(28)})`);
    this.element.style.setProperty('--paper-image-back', `url(${CONFIG.getSceneUrl(27)})`);
    this.element.classList.remove('hidden', 'visible', 'flipped', 'revealing', 'fading');

    requestAnimationFrame(() => {
      this.element.classList.add('visible', 'revealing');
    });

    this.flipTimer = setTimeout(() => {
      this.flipToBack();
    }, 4000);
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
      requestAnimationFrame(() => {
        this.element.classList.remove('fading');
        this.isFading = false;
      });
    }, 850);
  }
}