/* TreeQuote — shared site behavior: icon sprite, header, quick start, reveal */

(function () {
  const ICONS = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h5"/>',
    crew: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M15.5 14.3c2.6-.2 4.5 1.4 5 4.2"/>',
    removal: '<path d="M12 21v-6"/><path d="M12 15c-3.9 0-6.5-2.3-6.5-5.4C5.5 6.3 8.4 3 12 3s6.5 3.3 6.5 6.6c0 3.1-2.6 5.4-6.5 5.4z"/><path d="M8.5 19.5l7-2.5"/>',
    trimming: '<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8.3 15.7L18 4M15.7 15.7L6 4"/>',
    stump: '<ellipse cx="12" cy="8.5" rx="7" ry="3"/><path d="M5 8.5V16c0 1.7 3.1 3 7 3s7-1.3 7-3V8.5"/><path d="M5 16l-2 2.5M19 16l2 2.5M12 19v2"/><path d="M10 8.5c0-.6.9-1 2-1s2 .4 2 1"/>',
    planting: '<path d="M12 21v-9"/><path d="M12 12c0-4 2.7-6.5 7-6.5 0 4-2.7 6.5-7 6.5z"/><path d="M12 14.5c0-3.2-2.2-5.2-5.6-5.2 0 3.2 2.2 5.2 5.6 5.2z"/><path d="M7 21h10"/>',
    emergency: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z"/>',
    health: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3L21 21"/><path d="M7.5 10.5h1.6l1-2 1.8 4 1-2h1.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    sparkle: '<path d="M11 3l1.8 4.9 4.7 1.8-4.7 1.8L11 16.5l-1.8-5-4.7-1.8 4.7-1.8z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
    house: '<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
    bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z"/>',
    fence: '<path d="M5 20V7l2-2.5L9 7v13M15 20V7l2-2.5L19 7v13M9 10h6M9 16h6"/>',
    slope: '<path d="M3 19L21 8v11z"/>',
    gate: '<path d="M4 20V5M20 20V5M4 9h16M4 15h16M9 9v6M15 9v6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/>',
    dollar: '<path d="M12 3v18"/><path d="M16.5 7.5c-.8-1.3-2.4-2-4.5-2-2.6 0-4.3 1.2-4.3 3.1 0 4.4 9 2.3 9 6.8 0 1.9-1.9 3.1-4.7 3.1-2.2 0-3.9-.8-4.8-2.2"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-4 6-6.5 10-8.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>',
    alert: '<path d="M12 3.5L21.5 20h-19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/>',
    ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2"/>',
    handshake: '<path d="M3 11l4-4 5 2 5-2 4 4"/><path d="M7 7l-4 4 5 5c1 1 2.4 1 3.4 0l.6-.6"/><path d="M17 7l4 4-6.5 6.5c-.8.8-2 .8-2.8 0L9 15"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5l3-3a4 4 0 0 0-5 5"/>'
  };

  const sprite =
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    Object.entries(ICONS)
      .map(([id, d]) => '<symbol id="i-' + id + '" viewBox="0 0 24 24">' + d + '</symbol>')
      .join('') +
    '</svg>';
  document.body.insertAdjacentHTML('afterbegin', sprite);

  window.TQ = window.TQ || {};
  window.TQ.icon = function (id, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>';
  };

  /* Header shadow + mobile menu */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = header.querySelector('.menu-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = header.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      header.querySelectorAll('.nav-links a').forEach((a) =>
        a.addEventListener('click', () => {
          header.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        })
      );
    }
  }

  /* Hero quick start: pick a service + ZIP, jump into the quote flow */
  const quick = document.querySelector('[data-quick]');
  if (quick) {
    const chips = quick.querySelectorAll('.chip');
    let service = '';
    chips.forEach((chip) =>
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        service = chip.dataset.service;
      })
    );
    quick.addEventListener('submit', (e) => {
      e.preventDefault();
      const zip = (quick.querySelector('input[name="zip"]').value || '').replace(/\D/g, '').slice(0, 5);
      const params = new URLSearchParams();
      if (service) params.set('service', service);
      if (zip) params.set('zip', zip);
      const qs = params.toString();
      window.location.href = 'quote.html' + (qs ? '?' + qs : '');
    });
  }

  /* Crew application (demo: validates, then shows a confirmation) */
  const apply = document.querySelector('[data-apply]');
  if (apply) {
    const err = document.querySelector('[data-apply-error]');
    const done = document.querySelector('[data-apply-done]');
    apply.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(apply);
      const missing = ['company', 'name', 'email', 'area'].find((k) => !String(fd.get(k) || '').trim());
      let msg = '';
      if (missing) msg = 'Fill in every required field.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fd.get('email')).trim())) msg = 'Add a valid email address.';
      else if (!fd.get('insured')) msg = 'Confirm that you carry liability and workers’ comp.';
      if (msg) {
        err.querySelector('span').textContent = msg;
        err.classList.add('show');
        return;
      }
      err.classList.remove('show');
      apply.hidden = true;
      done.hidden = false;
    });
  }

  /* Reveal on scroll */
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && items.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
