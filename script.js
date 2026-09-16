(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.main-nav');
  const modal = document.querySelector('#status-modal');
  const modalCard = modal?.querySelector('.modal-card');
  const modalCopy = modal?.querySelector('[data-modal-copy]');
  const purchaseForm = modal?.querySelector('[data-purchase-form]');
  const offerConsent = modal?.querySelector('[data-offer-consent]');
  const paymentButton = modal?.querySelector('[data-payment-button]');
  const paymentStatus = modal?.querySelector('[data-payment-status]');
  const modalTitle = modal?.querySelector('#modal-title');
  let activeTicketType = 'onsite';
  const tickets = {
    onsite: { price: '1 000 ₽', copy: 'Очное участие — 1 000 ₽. 11 декабря, 09:00–18:00 МСК. Клиника Фомина, Москва, Мичуринский проспект, д. 15А. Вместимость — 125 участников.' },
    online: { price: '500 ₽', copy: 'Онлайн-доступ — 500 ₽. 11 декабря, 09:00–18:00 МСК. Посещение площадки и кадавер-курс не включены. Платформа и порядок подключения будут опубликованы до открытия продаж.' }
  };
  const paymentUrl = () => {
    const value = window.POCUS_PAYMENTS?.[activeTicketType];
    if (!value) return null;
    try {
      const url = new URL(value);
      const expectedOrder = activeTicketType === 'online' ? '#order:Онлайн участие=500' : '#order:Очное участие=1000';
      return url.origin === 'https://shoulderacademy.ru' && url.pathname === '/' && !url.search && decodeURIComponent(url.hash) === expectedOrder ? url.href : null;
    } catch { return null; }
  };
  const updateTicket = () => {
    const ticket = tickets[activeTicketType];
    if (modalTitle) modalTitle.textContent = activeTicketType === 'online' ? 'Онлайн-доступ' : 'Очное участие';
    if (modalCopy) modalCopy.textContent = ticket.copy;
    if (paymentButton) {
      paymentButton.disabled = !offerConsent?.checked || !paymentUrl();
      paymentButton.textContent = `Оплатить ${ticket.price}`;
    }
    if (paymentStatus) paymentStatus.textContent = paymentUrl() ? 'Вы перейдёте к оформлению заказа на shoulderacademy.ru.' : 'Продажи этого формата пока не открыты.';
  };
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

  const openModal = (type) => {
    if (!modal) return;
    lastFocused = document.activeElement;
    activeTicketType = type === 'online' ? 'online' : 'onsite';
    if (offerConsent) offerConsent.checked = false;
    if (paymentButton) paymentButton.disabled = true;
    updateTicket();
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
    openModal(button.dataset.ticketType || 'onsite');
  }));

  offerConsent?.addEventListener('change', updateTicket);
  purchaseForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!offerConsent?.checked || !purchaseForm.reportValidity()) return;
    const url = paymentUrl();
    if (url) window.location.assign(url);
  });

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
