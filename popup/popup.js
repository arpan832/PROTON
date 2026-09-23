/* Left-side slideshow. Add image filenames to SLIDES below. */
(function initPicturePopup() {
  const SLIDES = [
    // Add your files here, for example: 'popup/images/my-picture.jpg'
    'popup/images/slide-1.jpg',
    'popup/images/slide-2.jpg',
    'popup/images/slide-3.jpg',
    'popup/images/slide-4.jpg',
    'popup/images/slide-5.jpg'


  ];

  function init() {
    const popup = document.getElementById('picture-popup');
    const image = document.getElementById('picture-popup-image');
    const empty = document.getElementById('picture-popup-empty');
    const counter = document.getElementById('picture-popup-counter');
    const dots = document.getElementById('picture-popup-dots');
    const prev = document.getElementById('picture-popup-prev');
    const next = document.getElementById('picture-popup-next');
    const close = document.getElementById('picture-popup-close');
    if (!popup || !image || !empty) return;

    let current = 0;
    let timer;

    function renderDots() {
      dots.innerHTML = SLIDES.map((_, index) =>
        `<button class="picture-popup-dot ${index === current ? 'active' : ''}" type="button" aria-label="Show picture ${index + 1}" data-index="${index}"></button>`
      ).join('');
    }

    function show(index) {
      if (!SLIDES.length) {
        image.hidden = true;
        empty.hidden = false;
        counter.textContent = '0 / 0';
        prev.hidden = true;
        next.hidden = true;
        return;
      }

      current = (index + SLIDES.length) % SLIDES.length;
      image.hidden = false;
      empty.hidden = true;
      image.src = SLIDES[current];
      counter.textContent = `${current + 1} / ${SLIDES.length}`;
      prev.hidden = SLIDES.length < 2;
      next.hidden = SLIDES.length < 2;
      renderDots();
    }

    function restartTimer() {
      clearInterval(timer);
      if (SLIDES.length > 1) timer = setInterval(() => show(current + 1), 5000);
    }

    image.addEventListener('error', () => {
      image.hidden = true;
      empty.hidden = false;
      empty.innerHTML = `Could not load <code>${SLIDES[current]}</code>`;
    });
    prev.addEventListener('click', () => { show(current - 1); restartTimer(); });
    next.addEventListener('click', () => { show(current + 1); restartTimer(); });
    dots.addEventListener('click', (event) => {
      const dot = event.target.closest('[data-index]');
      if (!dot) return;
      show(Number(dot.dataset.index));
      restartTimer();
    });
    close.addEventListener('click', () => {
      popup.classList.add('is-hidden');
      clearInterval(timer);
    });

    show(0);
    restartTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
