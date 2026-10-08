/* TreeQuote — quote wizard and ballpark estimator.
   Prices are national ballpark ranges for a concept demo, not a pricing engine. */

(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const icon = (id) => window.TQ.icon(id);

  const form = $('#quote-form');
  if (!form) return;

  const STEPS = ['service', 'details', 'photos', 'timing', 'contact'];
  const backBtn = $('[data-back]', form);
  const nextBtn = $('[data-next]', form);
  const nav = $('[data-nav]', form);
  const errorEl = $('[data-error]', form);

  const ui = {
    range: $('[data-est-range]'),
    sub: $('[data-est-sub]'),
    lines: $('[data-est-lines]'),
    widen: $('[data-est-widen]'),
    confLabel: $('[data-conf-label]'),
    confBars: $$('[data-conf] span'),
    confHint: $('[data-conf-hint]'),
    miniRange: $('[data-mini-range]'),
    miniBars: $$('[data-conf-mini] span')
  };

  let current = 0;
  let photos = []; // { url, sample }
  let autoUrgency = false;
  let aiTimers = [];

  /* ---------- Pricing tables (national ballpark) ---------- */
  const HEIGHT = {
    xs: { label: 'under 20 ft', remove: [200, 375], trim: [150, 300] },
    sm: { label: '20–40 ft', remove: [425, 750], trim: [275, 550] },
    md: { label: '40–60 ft', remove: [850, 1350], trim: [525, 950] },
    lg: { label: '60 ft+', remove: [1500, 2600], trim: [900, 1600] }
  };
  const TRUNK = {
    xs: { label: 'under 12 in', mult: 0.85, stump: [100, 175] },
    sm: { label: '12–24 in', mult: 1, stump: [150, 275] },
    md: { label: '24–36 in', mult: 1.2, stump: [225, 425] },
    lg: { label: '36 in+', mult: 1.45, stump: [375, 650] }
  };
  const NEARBY = {
    house: { label: 'Near the house', pct: 0.2 },
    lines: { label: 'Near power lines', pct: 0.35 },
    fence: { label: 'Over fence, deck, or drive', pct: 0.1 },
    access: { label: 'Tight or backyard access', pct: 0.15 },
    slope: { label: 'On a slope', pct: 0.1 }
  };
  const CONDITION = {
    healthy: { remove: 0, trim: 0 },
    dead: { label: 'Dead wood, careful rigging', trimLabel: 'Deadwood removal', remove: 0.1, trim: 0.15 },
    leaning: { label: 'Leaning tree', trimLabel: 'Weight reduction', remove: 0.15, trim: 0.1 },
    storm: { label: 'Storm damage', trimLabel: 'Storm damage cleanup', remove: 0.25, trim: 0.25 }
  };
  const SITUATION = {
    structure: { label: 'Lifting off a structure', pct: 0.4, text: 'On the house, car, or fence' },
    hanging: { label: 'Split or hanging limbs', pct: 0.2, text: 'Split or hanging' },
    blocking: { label: '', pct: 0, text: 'Blocking the driveway or road' },
    down: { label: 'Already on the ground', pct: -0.15, text: 'Down in the yard' }
  };
  const PLANT = {
    small: { label: 'small, 5–6 ft', each: [175, 350] },
    medium: { label: 'medium, 8–10 ft', each: [350, 750] },
    large: { label: 'large, 12–15 ft', each: [800, 1600] },
    unsure: { label: 'size to be recommended', each: [350, 750] }
  };
  const SERVICE = {
    removal: { label: 'Tree removal', title: 'Tell us about the tree' },
    trimming: { label: 'Trimming & pruning', title: 'Tell us about the tree' },
    stump: { label: 'Stump grinding', title: 'Tell us about the stumps' },
    planting: { label: 'Tree planting', title: 'What would you like planted?' },
    emergency: { label: 'Storm damage', title: 'What happened?' },
    health: { label: 'Tree health check', title: "What's worrying you?" }
  };
  const URGENCY = { emergency: 'Emergency — today', soon: 'Within 1–2 weeks', flexible: 'Flexible, within a month', planning: 'Just planning' };
  const PROPERTY = { house: 'House', hoa: 'Townhome / HOA', rental: 'Rental', commercial: 'Business' };
  const CONTACT = { text: 'text', call: 'phone', email: 'email' };
  const CONCERNS = { thinning: 'Thinning leaves', cracks: 'Cracks or fungus', leaning: 'New lean', falling: 'Dropping branches', pests: 'Pest signs', general: 'General checkup' };

  /* ---------- Helpers ---------- */
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const r25 = (n) => Math.round(n / 25) * 25;
  const r5 = (n) => Math.round(n / 5) * 5;
  const scale = (r, k) => [r[0] * k, r[1] * k];
  const plural = (n, word) => (n >= 4 ? '4+' : n) + ' ' + word + (n > 1 ? 's' : '');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const zipOk = (z) => /^\d{5}$/.test(z);

  function read() {
    const fd = new FormData(form);
    const one = (k) => (fd.get(k) || '').toString();
    const many = (k) => fd.getAll(k).map(String);
    return {
      service: one('service'),
      situation: one('situation'),
      trees: +one('trees') || 1,
      height: one('height'),
      trunk: one('trunk'),
      nearby: many('nearby'),
      condition: one('condition') || 'healthy',
      stumpgrind: one('stumpgrind'),
      wood: one('wood') || 'haul',
      stumps: +one('stumps') || 1,
      stumpsize: one('stumpsize'),
      stumpextras: many('stumpextras'),
      plantcount: +one('plantcount') || 1,
      plantsize: one('plantsize'),
      plantextras: many('plantextras'),
      concerns: many('concerns'),
      report: one('report') || 'no',
      urgency: one('urgency'),
      zip: one('zip').trim(),
      property: one('property') || 'house',
      notes: one('notes').trim(),
      first: one('first').trim(),
      last: one('last').trim(),
      email: one('email').trim(),
      phone: one('phone').trim(),
      contact: one('contact') || 'text'
    };
  }

  /* ---------- Estimator ---------- */
  function estimate(s) {
    const lines = [];
    let lo = 0;
    let hi = 0;
    const push = (label, r, cls) => {
      lines.push({ label, lo: r[0], hi: r[1], cls: cls || '' });
      lo += r[0];
      hi += r[1];
    };

    switch (s.service) {
      case 'removal':
      case 'emergency': {
        if (!s.height || !s.trunk) return null;
        if (s.service === 'emergency' && !s.situation) return null;
        const n = s.trees;
        const base = scale(HEIGHT[s.height].remove, TRUNK[s.trunk].mult * (1 + 0.85 * (n - 1)));
        push('Removal · ' + plural(n, 'tree') + ', ' + HEIGHT[s.height].label, base);
        s.nearby.forEach((k) => NEARBY[k] && push(NEARBY[k].label, scale(base, NEARBY[k].pct)));
        if (s.service === 'emergency') {
          const sit = SITUATION[s.situation];
          if (sit.pct) push(sit.label, scale(base, sit.pct), sit.pct < 0 ? 'minus' : '');
        } else {
          const c = CONDITION[s.condition];
          if (c && c.remove) push(c.label, scale(base, c.remove));
        }
        if (s.wood === 'firewood') push('Leave logs for firewood', scale([lo, hi], -0.1), 'minus');
        if (s.stumpgrind === 'yes') push('Stump grinding · ' + plural(n, 'stump'), scale(TRUNK[s.trunk].stump, 1 + 0.7 * (n - 1)));
        break;
      }
      case 'trimming': {
        if (!s.height) return null;
        const n = s.trees;
        const base = scale(HEIGHT[s.height].trim, 1 + 0.85 * (n - 1));
        push('Pruning · ' + plural(n, 'tree') + ', ' + HEIGHT[s.height].label, base);
        s.nearby.forEach((k) => NEARBY[k] && push(NEARBY[k].label, scale(base, NEARBY[k].pct * 0.5)));
        const c = CONDITION[s.condition];
        if (c && c.trim) push(c.trimLabel, scale(base, c.trim));
        break;
      }
      case 'stump': {
        if (!s.stumpsize) return null;
        const n = s.stumps;
        let base = scale(TRUNK[s.stumpsize].stump, 1 + 0.7 * (n - 1));
        if (base[0] < 150) base = [150, Math.max(base[1], 225)]; // minimum trip charge
        push('Grinding · ' + plural(n, 'stump') + ', ' + TRUNK[s.stumpsize].label, base);
        if (s.stumpextras.includes('access')) push('Tight or backyard access', scale(base, 0.15));
        if (s.stumpextras.includes('backfill')) push('Haul grindings + topsoil', [60 * n, 120 * n]);
        break;
      }
      case 'planting': {
        if (!s.plantsize) return null;
        const n = s.plantcount;
        const p = PLANT[s.plantsize];
        push('Planting · ' + plural(n, 'tree') + ', ' + p.label, scale(p.each, 1 + 0.9 * (n - 1)));
        if (s.plantextras.includes('species')) push('Arborist species pick', [0, 0]);
        if (s.plantextras.includes('removeold')) push('Remove old tree or stump', [150, 350]);
        break;
      }
      case 'health': {
        push('Arborist site visit', [150, 300]);
        if (s.report === 'yes') push('Written risk report', [125, 250]);
        break;
      }
      default:
        return null;
    }

    if (s.urgency === 'emergency') push(s.service === 'health' ? 'Same-day visit' : 'Emergency priority', scale([lo, hi], 0.5));
    else if (s.urgency === 'flexible') push('Flexible scheduling', scale([lo, hi], -0.05), 'minus');

    lines.forEach((l) => { l.lo = r5(l.lo); l.hi = r5(l.hi); });
    return { lines, lo: r25(lo), hi: r25(hi) };
  }

  function lineValue(l, i) {
    if (l.lo === 0 && l.hi === 0) return 'Free';
    if (l.hi < 0) return '−' + fmt(-l.lo) + '–' + fmt(-l.hi).slice(1);
    return (i === 0 ? '' : '+') + fmt(l.lo) + '–' + fmt(l.hi).slice(1);
  }
  const linesHTML = (est) =>
    est.lines
      .map((l, i) => '<li class="' + l.cls + '"><span>' + esc(l.label) + '</span><span>' + lineValue(l, i) + '</span></li>')
      .join('');

  function displayRange(est) {
    if (!est) return null;
    if (photos.length) return { lo: est.lo, hi: est.hi, widened: false };
    return { lo: r25(est.lo * 0.95), hi: r25(est.hi * 1.1), widened: true };
  }

  /* ---------- Live update ---------- */
  function update() {
    const s = read();

    $$('[data-for]', form).forEach((el) => {
      el.hidden = !el.dataset.for.split(' ').includes(s.service);
    });
    const linesTip = $('[data-tip="lines"]', form);
    linesTip.hidden = !(s.nearby.includes('lines') && ['removal', 'trimming', 'emergency'].includes(s.service));
    if (s.service) $('[data-details-title]', form).textContent = SERVICE[s.service].title;

    const est = estimate(s);
    const shown = displayRange(est);
    if (shown) {
      ui.range.textContent = fmt(shown.lo) + ' – ' + fmt(shown.hi);
      ui.range.classList.remove('empty');
      ui.sub.textContent = SERVICE[s.service].label + (zipOk(s.zip) ? ' · ZIP ' + s.zip : '');
      ui.lines.innerHTML = linesHTML(est);
      ui.miniRange.textContent = fmt(shown.lo) + ' – ' + fmt(shown.hi);
    } else {
      ui.range.textContent = '$— – $—';
      ui.range.classList.add('empty');
      ui.sub.textContent = s.service ? 'A few more answers and your range shows up here.' : 'Answer a few questions to see a price range.';
      ui.lines.innerHTML = '';
      ui.miniRange.textContent = 'Answer to see';
    }
    ui.widen.hidden = !(shown && shown.widened);

    const timingOk = !!s.urgency && zipOk(s.zip);
    const level = est ? 1 + (photos.length ? 1 : 0) + (timingOk ? 1 : 0) : 0;
    ui.confLabel.textContent = ['—', 'Rough', 'Good', 'Strong'][level];
    ui.confBars.forEach((b, i) => b.classList.toggle('on', i < level));
    ui.miniBars.forEach((b, i) => b.classList.toggle('on', i < level));
    ui.confHint.textContent = !est
      ? s.service ? 'Answer the detail questions to see a range.' : 'Pick a service to start.'
      : !photos.length ? 'Add photos to tighten your range.'
      : !timingOk ? 'Add your timing and ZIP code.'
      : 'Ready for arborist review.';

    if (STEPS[current] === 'photos') setNextLabel(photos.length ? 'Continue' : 'Skip for now');
    return s;
  }

  /* ---------- Navigation ---------- */
  function setNextLabel(text) {
    nextBtn.innerHTML = text + ' ' + icon('arrow');
  }

  function showError(msg) {
    $('span', errorEl).textContent = msg;
    errorEl.classList.add('show');
  }
  function hideError() {
    errorEl.classList.remove('show');
  }

  function go(i) {
    current = i;
    const name = STEPS[i] || 'done';
    $$('.step', form).forEach((el) => el.classList.toggle('active', el.dataset.step === name));
    $$('.progress li').forEach((li, j) => {
      li.classList.toggle('done', j < i);
      li.classList.toggle('current', j === i);
    });
    backBtn.hidden = i === 0 || name === 'done';
    nav.hidden = name === 'done';
    setNextLabel(i === STEPS.length - 1 ? 'Get my quote' : 'Continue');
    hideError();
    update();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const h = $('.step.active h1', form);
    if (h) {
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    }
  }

  function validate(step, s) {
    switch (step) {
      case 'service':
        return s.service ? '' : 'Choose a service to continue.';
      case 'details':
        if (s.service === 'emergency' && !s.situation) return 'Tell us what happened.';
        if (['removal', 'trimming', 'emergency'].includes(s.service) && !s.height) return 'Pick an approximate height.';
        if (['removal', 'emergency'].includes(s.service) && !s.trunk) return 'Pick a trunk size.';
        if (s.service === 'stump' && !s.stumpsize) return 'Pick a stump size.';
        if (s.service === 'planting' && !s.plantsize) return 'Pick a tree size.';
        return '';
      case 'timing':
        if (!s.urgency) return 'Tell us how soon you need this.';
        if (!zipOk(s.zip)) return 'Enter a 5-digit ZIP code.';
        return '';
      case 'contact':
        if (!s.first) return 'Add your first name.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) return 'Add a valid email address.';
        if (s.contact !== 'email' && s.phone.replace(/\D/g, '').length < 10) return 'Add a mobile number so we can ' + (s.contact === 'text' ? 'text' : 'call') + ' you.';
        return '';
      default:
        return '';
    }
  }

  const FIELD_FOR_ERROR = { 'ZIP': 'zip', 'first name': 'first', 'email': 'email', 'mobile': 'phone' };
  function focusField(msg) {
    const key = Object.keys(FIELD_FOR_ERROR).find((k) => msg.includes(k));
    if (!key) return;
    const el = $('#' + FIELD_FOR_ERROR[key]);
    if (el) {
      el.classList.add('invalid');
      el.focus();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = read();
    const err = validate(STEPS[current], s);
    if (err) {
      showError(err);
      focusField(err);
      return;
    }
    if (current < STEPS.length - 1) go(current + 1);
    else finish(s);
  });
  backBtn.addEventListener('click', () => go(Math.max(0, current - 1)));

  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'service') syncEmergency(t.value);
    if (t.name === 'urgency') autoUrgency = false;
    hideError();
    update();
  });
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
    if (e.target.name === 'zip') {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
      update();
    }
  });

  /* Picking a service with a pointer moves straight to the details */
  $$('[data-step="service"] .opt', form).forEach((opt) =>
    opt.addEventListener('pointerup', () => setTimeout(() => { if (current === 0 && read().service) go(1); }, 220))
  );

  function syncEmergency(service) {
    const em = $('input[name="urgency"][value="emergency"]', form);
    const anyUrgency = $('input[name="urgency"]:checked', form);
    if (service === 'emergency' && !anyUrgency) {
      em.checked = true;
      autoUrgency = true;
    } else if (service !== 'emergency' && autoUrgency) {
      em.checked = false;
      autoUrgency = false;
    }
  }

  /* ---------- Photos ---------- */
  const fileInput = $('#photo-input');
  const drop = $('.dropzone', form);
  const thumbs = $('[data-thumbs]', form);
  const aiBox = $('[data-ai]', form);
  const aiList = $('[data-ai-list]', form);
  const aiResult = $('[data-ai-result]', form);
  const samplesBtn = $('[data-samples]', form);

  const SAMPLES = [
    'https://images.unsplash.com/photo-1709560723503-538158e48db8?auto=format&fit=crop&w=400&h=400&q=60',
    'https://images.unsplash.com/photo-1626828476637-5bd713ef9f22?auto=format&fit=crop&w=400&h=400&q=60',
    'https://images.unsplash.com/photo-1765064520296-1e56ebb82e17?auto=format&fit=crop&w=400&h=400&q=60'
  ];

  function addPhotos(entries) {
    const room = 8 - photos.length;
    photos = photos.concat(entries.slice(0, room));
    renderThumbs();
    update();
    if (photos.length) runAiCheck();
  }

  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files || []).filter((f) => f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name));
    addPhotos(files.map((f) => ({ url: URL.createObjectURL(f), sample: false })));
    fileInput.value = '';
  });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    addPhotos(files.map((f) => ({ url: URL.createObjectURL(f), sample: false })));
  });
  samplesBtn.addEventListener('click', () => {
    addPhotos(SAMPLES.map((url) => ({ url, sample: true })));
    samplesBtn.hidden = true;
  });

  function renderThumbs() {
    thumbs.innerHTML = photos
      .map((p, i) => '<div class="thumb"><img src="' + esc(p.url) + '" alt="Photo ' + (i + 1) + '"><button type="button" data-remove="' + i + '" aria-label="Remove photo ' + (i + 1) + '">' + icon('x') + '</button></div>')
      .join('');
  }
  thumbs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    const [p] = photos.splice(+b.dataset.remove, 1);
    if (p && !p.sample) URL.revokeObjectURL(p.url);
    renderThumbs();
    if (!photos.length) {
      aiTimers.forEach(clearTimeout);
      aiBox.hidden = true;
      samplesBtn.hidden = false;
    }
    update();
  });

  const AI_STEPS = {
    tree: ['Finding the tree in your photos', 'Estimating height against the house', 'Checking trunk width', 'Looking for roofs, wires, and fences'],
    trimming: ['Finding the tree in your photos', 'Estimating height against the house', 'Spotting deadwood and crossing limbs', 'Checking clearance from the roof and wires'],
    stump: ['Finding stumps in your photos', 'Estimating stump width', 'Checking grinder access', 'Looking for sprinklers and utilities nearby'],
    planting: ['Mapping the planting spot', 'Checking overhead wires and clearance', 'Estimating sun exposure', 'Checking distance from the house'],
    health: ['Finding the tree in your photos', 'Reading canopy density', 'Looking for cracks, cavities, and fungus', 'Flagging spots for the arborist']
  };

  function runAiCheck() {
    aiTimers.forEach(clearTimeout);
    aiTimers = [];
    const s = read();
    const key = s.service === 'removal' || s.service === 'emergency' ? 'tree' : s.service || 'tree';
    aiList.innerHTML = (AI_STEPS[key] || AI_STEPS.tree)
      .map((t) => '<li><span class="spin"></span>' + icon('check').replace('class="ic"', 'class="ic ok"') + '<span>' + t + '</span></li>')
      .join('');
    aiBox.hidden = false;
    aiResult.hidden = true;
    const items = $$('li', aiList);
    items.forEach((li, i) => {
      aiTimers.push(setTimeout(() => li.classList.add('busy'), i * 650));
      aiTimers.push(setTimeout(() => {
        li.classList.remove('busy');
        li.classList.add('done');
        if (i === items.length - 1) {
          aiResult.textContent = aiSummary(read());
          aiResult.hidden = false;
        }
      }, i * 650 + 600));
    });
  }

  function aiSummary(s) {
    const bits = [];
    if (s.height && ['removal', 'trimming', 'emergency'].includes(s.service)) bits.push('about ' + HEIGHT[s.height].label);
    if (s.trunk && ['removal', 'emergency'].includes(s.service)) bits.push('trunk ' + TRUNK[s.trunk].label);
    if (s.nearby.includes('house')) bits.push('close to the house');
    const detail = bits.length ? ' (' + bits.join(', ') + ')' : '';
    return 'Your photos line up with your answers' + detail + '. An arborist confirms every detail before you’re matched.';
  }

  /* ---------- Finish ---------- */
  function detailText(s) {
    switch (s.service) {
      case 'removal':
      case 'emergency': {
        const parts = [plural(s.trees, 'tree'), HEIGHT[s.height].label, 'trunk ' + TRUNK[s.trunk].label];
        if (s.service === 'emergency') parts.unshift(SITUATION[s.situation].text);
        s.nearby.forEach((k) => parts.push(NEARBY[k].label.toLowerCase()));
        if (s.stumpgrind === 'yes') parts.push('stump grinding');
        return parts.join(' · ');
      }
      case 'trimming':
        return [plural(s.trees, 'tree'), HEIGHT[s.height].label].concat(s.nearby.map((k) => NEARBY[k].label.toLowerCase())).join(' · ');
      case 'stump':
        return plural(s.stumps, 'stump') + ' · up to ' + TRUNK[s.stumpsize].label;
      case 'planting':
        return plural(s.plantcount, 'tree') + ' · ' + PLANT[s.plantsize].label;
      case 'health':
        return (s.concerns.length ? s.concerns.map((c) => CONCERNS[c]).join(', ') : 'General checkup') + (s.report === 'yes' ? ' · written report' : '');
      default:
        return '';
    }
  }

  function finish(s) {
    const est = estimate(s);
    const shown = displayRange(est);
    const ref = 'TQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const how = CONTACT[s.contact];
    const name = esc(s.first);
    const review = s.urgency === 'emergency' ? 'Within the hour for emergencies' : 'Usually within 2 business hours';

    $('[data-step="done"]', form).innerHTML =
      '<div class="result-head">' +
        '<span class="ic-wrap">' + icon('check') + '</span>' +
        '<h1>You’re all set, ' + name + '.</h1>' +
        '<p>An arborist will review your request and send you one firm, written quote by ' + how + '. Here’s your ballpark in the meantime.</p>' +
        '<span class="ref">Request ' + ref + '</span>' +
      '</div>' +
      '<div class="result-range">' +
        '<div class="label">Ballpark estimate</div>' +
        '<div class="big">' + fmt(shown.lo) + ' – ' + fmt(shown.hi) + '</div>' +
        '<div>' + esc(SERVICE[s.service].label) + ' · ZIP ' + esc(s.zip) + (shown.widened ? ' · add photos later to tighten this range' : '') + '</div>' +
        '<ul class="est-lines">' + linesHTML(est) + '</ul>' +
      '</div>' +
      '<div class="result-cols">' +
        '<div><h3>What happens next</h3><ol class="timeline">' +
          '<li><span class="t-dot">' + icon('clipboard') + '</span><div><b>Arborist review</b><small>' + review + '. We may text you a quick question.</small></div></li>' +
          '<li><span class="t-dot">' + icon('chat') + '</span><div><b>Firm quote by ' + how + '</b><small>A written scope and one price from a vetted crew near ' + esc(s.zip) + '.</small></div></li>' +
          '<li><span class="t-dot">' + icon('calendar') + '</span><div><b>You pick the date</b><small>Approve the quote and choose a day that works.</small></div></li>' +
          '<li><span class="t-dot">' + icon('check') + '</span><div><b>Job done, yard cleaned up</b><small>Photos when the crew finishes, and TreeQuote checks in after.</small></div></li>' +
        '</ol></div>' +
        '<div><h3>Your request</h3><div class="summary"><dl>' +
          '<dt>Service</dt><dd>' + esc(SERVICE[s.service].label) + '</dd>' +
          '<dt>Details</dt><dd>' + esc(detailText(s)) + '</dd>' +
          '<dt>Photos</dt><dd>' + (photos.length ? photos.length + ' added' : 'None yet — text them anytime') + '</dd>' +
          '<dt>Timing</dt><dd>' + esc(URGENCY[s.urgency]) + '</dd>' +
          '<dt>Property</dt><dd>' + esc(PROPERTY[s.property]) + ' · ' + esc(s.zip) + '</dd>' +
          '<dt>Contact</dt><dd>' + esc(s.email) + (s.phone ? '<br>' + esc(s.phone) : '') + '</dd>' +
        '</dl></div>' +
        '<div class="demo-note">' + icon('info') + '<span><b>Concept demo:</b> nothing was sent. In the live version, this request lands in TreeQuote’s dashboard and the arborist gets a text.</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="result-actions"><a class="btn btn-dark" href="quote.html">Start another request</a><a class="btn btn-ghost" href="index.html">Back to home</a></div>';

    go(STEPS.length);
  }

  /* ---------- Start: honor ?service= and ?zip= from the home page ---------- */
  const params = new URLSearchParams(window.location.search);
  const zipParam = (params.get('zip') || '').replace(/\D/g, '').slice(0, 5);
  if (zipParam) $('#zip').value = zipParam;
  const serviceParam = params.get('service');
  const serviceInput = serviceParam && $('input[name="service"][value="' + CSS.escape(serviceParam) + '"]', form);
  if (serviceInput) {
    serviceInput.checked = true;
    syncEmergency(serviceParam);
    go(1);
  } else {
    go(0);
  }
})();
