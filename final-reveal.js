class FinalReveal {
  constructor(element) {
    this.element = element;
    this.revealTimer = null;
    this.flipTimer = null;
    this.isFading = false;

    element.addEventListener('click', event => {
      if (!this.element.classList.contains('visible')) return;
      if (event.target.closest('#birthday-action')) return;
      if (this.element.classList.contains('revealed')) {
        this.returnToBirthday();
      }
    });

    element.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (!this.element.classList.contains('revealed')) return;
      event.preventDefault();
      this.returnToBirthday();
    });

    const celebrateButton = element.querySelector('#birthday-action');
    celebrateButton?.addEventListener('click', event => {
      event.stopPropagation();
      document.dispatchEvent(new CustomEvent('birthday:celebrate'));
      this.flipToReveal();
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
    this.element.classList.remove(
      'hidden',
      'visible',
      'revealed',
      'birthday-visible',
      'flipped',
      'revealing',
      'fading'
    );

    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });

    // Keep scene 27 visible and fade the birthday message over it.
    // Scene 28 is revealed only when the birthday button is clicked.
    this.flipTimer = setTimeout(() => {
      this.showBirthdayMessage();
    }, 2600);
  }

  showBirthdayMessage() {
    if (this.element.classList.contains('birthday-visible')) return;
    this.element.classList.add('birthday-visible');
  }

  flipToReveal() {
    if (this.isFading || !this.element.classList.contains('birthday-visible')) return;
    this.fadeSwap(() => {
      this.element.classList.remove('birthday-visible');
      this.element.classList.add('revealed');
    });
  }

  returnToBirthday() {
    if (this.isFading || !this.element.classList.contains('revealed')) return;
    this.fadeSwap(() => {
      this.element.classList.remove('revealed');
      this.element.classList.add('birthday-visible');
    });
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
    }, 350);
  }
}