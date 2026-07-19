(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.main-nav');
  const modal = document.querySelector('#status-modal');
  const modalCard = modal?.querySelector('.modal-card');
  const modalCopy = modal?.querySelector('[data-modal-copy]');
  let lastFocused = null;

  const closeMenu = () => {
    nav?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  };

  menuButton?.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const openModal = (copy) => {
    if (!modal) return;
    lastFocused = document.activeElement;
    if (copy && modalCopy) modalCopy.textContent = copy;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => modalCard?.focus());
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    lastFocused?.focus?.();
  };

  document.querySelectorAll('.js-open-ticket').forEach((button) => button.addEventListener('click', () => {
    openModal('Мы подключаем безопасную оплату и выпуск именного электронного билета. Цена уже зафиксирована — 1 000 ₽.');
  }));

  document.querySelectorAll('.js-close-modal').forEach((button) => button.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 })
    : null;
  document.querySelectorAll('.reveal').forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add('visible');
  });

  const ticketVideo = document.querySelector('.ticket-video');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ticketVideo && !reducedMotion) {
    ticketVideo.muted = true;
    const videoObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) ticketVideo.play().catch(() => {});
          else ticketVideo.pause();
        }, { threshold: .15 })
      : null;
    if (videoObserver) videoObserver.observe(ticketVideo);
    else ticketVideo.play().catch(() => {});
  }

  const countdown = document.querySelector('[data-countdown]');
  const updateCountdown = () => {
    if (!countdown) return;
    const target = new Date(countdown.dataset.countdown).getTime();
    const distance = Math.max(0, target - Date.now());
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    countdown.querySelector('[data-days]').textContent = String(days).padStart(3, '0');
    countdown.querySelector('[data-hours]').textContent = String(hours).padStart(2, '0');
    countdown.querySelector('[data-minutes]').textContent = String(minutes).padStart(2, '0');
  };
  updateCountdown();
  window.setInterval(updateCountdown, 60000);

  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();
