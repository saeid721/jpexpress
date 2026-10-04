(function () {
"use strict";
document.documentElement.classList.add('js');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* Load sequence */
window.addEventListener('load', () => document.body.classList.add('loaded'));
setTimeout(() => document.body.classList.add('loaded'), 900); /* fallback */

/* ---------- Fixed header height sync (prevents content jump) ---------- */
const siteHeader = document.getElementById('siteHeader');
function setHeaderHeight() {
  document.documentElement.style.setProperty('--jp-header-h', siteHeader.offsetHeight + 'px');
}
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
document.getElementById('topBar').addEventListener('transitionend', e => {
  if (e.propertyName === 'max-height') setHeaderHeight();
});

/* ---------- Scroll reveal (IntersectionObserver) ---------- */
const revealEls = document.querySelectorAll('[data-reveal]');
if (reduced || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('revealed'));
} else {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  const ioLow = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); ioLow.unobserve(e.target); }
    });
  }, { threshold: 0.05 });
  revealEls.forEach(el => {
    (el.offsetHeight > window.innerHeight * 0.75 ? ioLow : io).observe(el);
  });
}

/* ---------- Counters (animate once) ---------- */
const counters = document.querySelectorAll('[data-counter]');
const runCounter = el => {
  const target = parseInt(el.dataset.counter, 10);
  if (reduced) { el.textContent = target.toLocaleString('en-US'); return; }
  const dur = 1600, t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if ('IntersectionObserver' in window && !reduced) {
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
  }), { threshold: 0.5 });
  counters.forEach(c => cio.observe(c));
} else counters.forEach(runCounter);

/* ---------- Navbar state + floating side (single rAF scroll handler) ---------- */
const navbar = document.querySelector('.jp-navbar');
const fabSide = document.getElementById('fabSide');
const topBar = document.getElementById('topBar');
const scrollCue = document.getElementById('scrollCue');
let ticking = false;
/* Assigned by the "Premium scroll interaction" block below. It runs inside
   this same rAF pass, so there is still ONE scroll listener and ONE rAF loop.
   It returns true when it needs another frame (mouse easing). */
let premiumFrame = null;

function requestTick() {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle('is-scrolled', y > 12);
  if (y > 90) topBar.classList.add('tb-hide');
  else if (y < 30) topBar.classList.remove('tb-hide');
  if (fabSide) fabSide.classList.toggle('show', y > 560);
  if (scrollCue) scrollCue.classList.toggle('is-hidden', y > 80);
  ticking = false;
  if (premiumFrame && premiumFrame(y)) requestTick();
}
window.addEventListener('scroll', requestTick, { passive: true });
onScroll();

/* ---------- Hero parallax (desktop only) ---------- */
const hero = document.querySelector('.hero');
if (hero && finePointer && window.innerWidth >= 992 && !reduced) {
  const layers = hero.querySelectorAll('[data-parallax]');
  let px = 0, py = 0, raf = null;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width - 0.5) * 2;
    py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(() => {
      layers.forEach(l => {
        const d = parseFloat(l.dataset.parallax);
        l.style.translate = (px * d * -1) + 'px ' + (py * d * -1) + 'px';
      });
      raf = null;
    });
  });
  hero.addEventListener('mouseleave', () => layers.forEach(l => l.style.translate = '0px 0px'));
}

/* ---------- Premium scroll interaction ---------- */
/* Native scrolling is never touched: no wheel listener, no preventDefault,
   no snapping. The scroll position is only read as a visual input, inside
   the single rAF pass above. Only transform-family properties, opacity and
   CSS variables are animated. Individual `translate` / `scale` properties are
   used so nothing collides with existing `transform` hover/reveal rules.
   Reduced motion or missing browser support => nothing here runs and all
   content stays visible. */
const sfxSupported = !reduced &&
  'IntersectionObserver' in window &&
  !!(window.CSS && CSS.supports && CSS.supports('translate', '0 0') && CSS.supports('scale', '1'));

if (sfxSupported) {
  const html = document.documentElement;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  html.classList.add('sfx');

  /* ----- 1. Scroll progress bar (created once, no HTML change) ----- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  const barFill = bar.firstChild;
  let lastProgress = -1;

  /* ----- 2. Content-aware reveal (extends, does not replace, data-reveal) ----- */
  const SR_GROUPS = [
    ['fade',   '.testimonial-nav'],
    ['left',   '.section-heading > div, .solution-copy, .testimonial-copy, .partners-copy, .cta-copy, #faqLeft .accordion-item, .resources-section .col-md-4:first-child .resource-card, .footer .row > div:first-child'],
    ['right',  '.section-heading > .section-link, .solution-cases, .testimonial-card, .cta-actions, #faqRight .accordion-item, .resources-section .col-md-4:last-child .resource-card, .footer-contact'],
    ['card',   '.quick-item, .trust-item, .mini-card, .image-card, .need-card, .industry-card, .partner-logos span, .resources-section .col-md-4:nth-child(2) .resource-card, .footer .row > .col-lg-2'],
    ['step',   '.process-step'],
    ['visual', '.solution-media, .destination-carousel, .testimonial-avatar, .partner-map img, .map-pin']
  ];
  const vh0 = window.innerHeight;
  const candidates = [];
  SR_GROUPS.forEach(g => document.querySelectorAll(g[1]).forEach(el => {
    if (el.hasAttribute('data-reveal') || el.closest('[data-reveal]')) return;
    candidates.push({ el: el, type: g[0] });
  }));
  /* read all rects first, write afterwards (no layout thrash) */
  candidates.forEach(c => { c.r = c.el.getBoundingClientRect(); });
  const srEls = [];
  candidates.forEach(c => {
    /* anything already on screen at load is left alone => no flash */
    if (c.r.top < vh0 * 0.92 && c.r.bottom > 0) return;
    c.el.classList.add('sr');
    c.el.setAttribute('data-sr', c.type);
    srEls.push(c.el);
  });
  const srIO = new IntersectionObserver(entries => {
    let n = 0;
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      srIO.unobserve(el);
      const delay = el.getAttribute('data-sr') === 'fade' ? 0 : Math.min(n++, 6) * 60;
      el.style.setProperty('--sr-d', delay + 'ms');
      el.classList.add('is-in');
      /* hand the element back to its original CSS once the reveal is done */
      setTimeout(() => {
        el.classList.remove('sr', 'is-in');
        el.removeAttribute('data-sr');
        el.style.removeProperty('--sr-d');
      }, delay + 1200);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  srEls.forEach(el => srIO.observe(el));

  /* ----- 3. Scroll depth targets (desktop, fine pointer only) ----- */
  const DEPTH_MAX = { 1: 8, 2: 9, 3: 28 };            /* max px travel per depth level */
  const DEPTH_TARGETS = [                              /* selector, depth, needs image bleed */
    ['.track-card .track-bg',   1, true],
    ['.destination-thumb img',  1, true],
    ['.solution-media img',     2, true],
    ['.partner-map',            3, false]
  ];
  const depthItems = [];
  DEPTH_TARGETS.forEach(t => document.querySelectorAll(t[0]).forEach(el => {
    el.setAttribute('data-scroll-depth', t[1]);
    if (t[2]) el.setAttribute('data-scroll-bleed', '');
    depthItems.push({ el: el, max: DEPTH_MAX[t[1]], c: 0, h: 0, last: null });
  }));

  /* ----- 4. Section edge transitions (pseudo-elements, opacity only) ----- */
  const edgeItems = [];
  ['.destination-section', '.process-section', '.solution-section', '.partners-section', '.final-cta']
    .forEach(sel => document.querySelectorAll(sel).forEach(el => {
      el.setAttribute('data-scroll-edge', '');
      edgeItems.push({ el: el, t: 0, last: null });
    }));

  /* ----- 5. Hero depth ----- */
  const heroBg    = hero && hero.querySelector('.hero-bg');
  const heroCopy  = hero && hero.querySelector('.hero-copy');
  const heroStack = hero && hero.querySelector('.hero-feature-stack');
  const heroWrap  = hero && hero.querySelector('.container-fluid');
  const heroOk    = !!(heroBg && heroCopy && heroStack && heroWrap);
  let tx = 0, ty = 0, mx = 0, my = 0, lastP = -1;

  /* ----- cached geometry (re-measured only on resize / layout change) ----- */
  let vh = window.innerHeight, maxScroll = 1, heroH = 1, heroTop = 0;
  function measure() {
    const sy = window.scrollY;
    vh = window.innerHeight;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    if (hero) {
      const hr = hero.getBoundingClientRect();
      heroH = Math.max(1, hr.height);
      heroTop = hr.top + sy;
    }
    depthItems.forEach(it => {
      const r = it.el.getBoundingClientRect();
      it.h = r.height;
      it.c = r.top + sy + r.height / 2;
    });
    edgeItems.forEach(it => { it.t = it.el.getBoundingClientRect().top + sy; });
  }
  let mTimer = 0;
  function scheduleMeasure() {
    clearTimeout(mTimer);
    mTimer = setTimeout(() => { measure(); requestTick(); }, 120);
  }
  window.addEventListener('resize', scheduleMeasure);
  window.addEventListener('load', scheduleMeasure);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleMeasure).observe(document.body);

  /* ----- desktop / fine-pointer mode switch (reuses `finePointer`) ----- */
  const mqWide = window.matchMedia('(min-width: 992px)');
  let depthOn = false;
  function resetDepth() {
    depthItems.forEach(it => { it.el.style.removeProperty('--parallax-y'); it.last = null; });
    edgeItems.forEach(it => { it.el.style.removeProperty('--edge'); it.last = null; });
    if (heroOk) {
      heroBg.style.translate = '';
      heroCopy.style.translate = '';
      heroStack.style.scale = '';
      heroWrap.style.opacity = '';
    }
    lastP = -1; tx = ty = mx = my = 0;
  }
  function applyMode() {
    const on = finePointer && mqWide.matches;
    if (on === depthOn) return;
    depthOn = on;
    html.classList.toggle('sfx-depth', on);
    if (!on) resetDepth();
    measure();
    requestTick();
  }
  if (mqWide.addEventListener) mqWide.addEventListener('change', applyMode);
  else if (mqWide.addListener) mqWide.addListener(applyMode);

  /* mouse depth: hero background only (never text, buttons, forms or nav) */
  if (hero && finePointer) {
    hero.addEventListener('mousemove', e => {
      if (!depthOn) return;
      tx = clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY + window.scrollY - heroTop) / heroH - 0.5) * 2, -1, 1);
      requestTick();
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; requestTick(); });
  }

  /* ----- the per-frame update, called from the shared onScroll rAF pass ----- */
  premiumFrame = function (y) {
    let more = false;

    /* progress bar */
    const prog = Math.round(clamp(y / maxScroll, 0, 1) * 1000) / 1000;
    if (prog !== lastProgress) {
      lastProgress = prog;
      barFill.style.setProperty('--scroll-progress', prog);
    }

    if (!depthOn) return false;

    /* hero: copy rises, background lags, panel eases down, slight fade */
    if (heroOk) {
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) more = true;
      else { mx = tx; my = ty; }

      const p = clamp(y / heroH, 0, 1);
      if (y < heroH + 40 || lastP !== 1) {
        heroBg.style.translate = (-mx * 10).toFixed(2) + 'px ' + (p * 10 - my * 6).toFixed(2) + 'px';
        heroCopy.style.translate = '0 ' + (-p * 20).toFixed(2) + 'px';
        heroStack.style.scale = (1 - p * 0.025).toFixed(4);
        heroWrap.style.opacity = (1 - p * 0.08).toFixed(3);
        lastP = p;
      }
    }

    /* depth items: only those near the viewport are touched */
    const mid = y + vh / 2;
    for (let i = 0; i < depthItems.length; i++) {
      const it = depthItems[i];
      const half = vh / 2 + it.h / 2;
      const off = it.c - mid;
      if (off > half + 80 || off < -half - 80) continue;
      const v = Math.round(clamp(-off / half, -1, 1) * it.max * 10) / 10;
      if (v !== it.last) {
        it.last = v;
        it.el.style.setProperty('--parallax-y', v + 'px');
      }
    }

    /* section edges: opacity of a pseudo-element, driven by section position */
    for (let j = 0; j < edgeItems.length; j++) {
      const ed = edgeItems[j];
      const v = Math.round(clamp((vh * 0.92 - (ed.t - y)) / (vh * 0.5), 0, 1) * 100) / 100;
      if (v !== ed.last) {
        ed.last = v;
        ed.el.style.setProperty('--edge', v);
      }
    }
    return more;
  };

  /* ----- 6. Mobile quick bar: mark "Quote" while the quote tools are dominant ----- */
  const quoteSec = document.getElementById('quote');
  const quoteLink = document.querySelector('.fab-bar a[href="#quote"]');
  if (quoteSec && quoteLink) {
    new IntersectionObserver(es => es.forEach(e => {
      quoteLink.classList.toggle('is-active', e.isIntersecting);
    }), { rootMargin: '-35% 0px -35% 0px' }).observe(quoteSec);
  }

  applyMode();
  measure();
  requestTick();
}

/* ---------- Map reveal ---------- */
const mapPanel = document.getElementById('mapPanel');
if (mapPanel && 'IntersectionObserver' in window && !reduced) {
  const mio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { mapPanel.classList.add('revealed'); mio.disconnect(); }
  }), { threshold: 0.25 });
  mio.observe(mapPanel);
} else if (mapPanel) mapPanel.classList.add('revealed');

/* ---------- Duo network line reveal ---------- */
const duoNetwork = document.getElementById('duoNetwork');
if (duoNetwork && 'IntersectionObserver' in window && !reduced) {
  const dio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { duoNetwork.classList.add('in-view'); dio.disconnect(); }
  }), { threshold: 0.4 });
  dio.observe(duoNetwork);
} else if (duoNetwork) duoNetwork.classList.add('in-view');

/* ---------- How-it-works timeline progress ---------- */
const steps = Array.from(document.querySelectorAll('.step'));
const fill = document.getElementById('stepsFill');
if (steps.length && fill && 'IntersectionObserver' in window) {
  let active = 0;
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('active');
      active = Math.max(active, steps.indexOf(e.target) + 1);
      const isMobile = window.innerWidth < 768;
      const pct = ((active - 1) / (steps.length - 1)) * 100;
      if (isMobile) fill.style.height = pct + '%'; else fill.style.width = pct + '%';
      sio.unobserve(e.target);
    }
  }), { threshold: 0.55 });
  steps.forEach(s => sio.observe(s));
}

/* ---------- Shipping calculator (demo only) ---------- */
const calcForm = document.getElementById('calcForm');
const calcResult = document.getElementById('calcResult');
if (calcForm) calcForm.addEventListener('submit', e => {
  e.preventDefault();
  const w = Math.max(parseFloat(document.getElementById('cWeight').value) || 1, 0.5);
  const vol = ((+document.getElementById('cL').value || 0) * (+document.getElementById('cW').value || 0) * (+document.getElementById('cH').value || 0)) / 5000;
  const cw = Math.max(w, vol);
  const method = document.getElementById('cMethod').value;
  const rates = { 'International Courier': [25, 9.5, '4–7 days'], 'Domestic Courier': [2, 1.2, '1–3 days'], 'Air Freight': [45, 6.8, '5–10 days'], 'Sea Freight': [65, 1.6, '25–40 days'] };
  const [base, per, transit] = rates[method];
  const mid = base + cw * per, lo = Math.round(mid * 0.9), hi = Math.round(mid * 1.12);
  calcResult.classList.remove('d-none');
  calcResult.innerHTML =
    '<div class="position-relative"><div class="d-flex flex-wrap justify-content-between gap-3 align-items-center">' +
    '<div><div class="font-mono" style="font-size:.66rem;letter-spacing:.14em;color:#9FE2F2">ESTIMATED COST</div>' +
    '<div class="amt">$' + lo + ' – $' + hi + ' <small>USD</small></div></div>' +
    '<div class="font-mono" style="font-size:.72rem;line-height:1.9">CHARGEABLE WT: ' + cw.toFixed(1) + ' KG<br>METHOD: ' + method.toUpperCase() + '<br>TYPICAL TRANSIT: ' + transit + '</div></div>' +
    '<p class="demo-note mt-3 mb-0" style="color:#8FA1BC">INDICATIVE DEMO ESTIMATE ONLY — FINAL PRICING CONFIRMED BY OUR LOGISTICS TEAM.</p></div>';
});

/* ---------- Tracking demo ---------- */
const fillDemoBtn = document.getElementById('fillDemo');
if (fillDemoBtn) fillDemoBtn.addEventListener('click', () => { document.getElementById('trackInput').value = 'JPE123456789'; });

const trackForm = document.getElementById('trackForm');
if (trackForm) trackForm.addEventListener('submit', e => {
  e.preventDefault();
  const val = document.getElementById('trackInput').value.trim();
  if (!val) { document.getElementById('trackInput').focus(); return; }

  /* Route "View Details" to the new Track Shipment page with this number */
  const viewBtn = document.querySelector('.track-view-btn');
  if (viewBtn) viewBtn.href = 'track-shipment.html?tracking=' + encodeURIComponent(val);

  const box = document.getElementById('trackResult');
  const tl = document.getElementById('trackTimeline');
  const items = tl.querySelectorAll('li');
  box.classList.remove('d-none');
  tl.classList.remove('run');
  items.forEach(li => li.classList.remove('done'));
  if (reduced) { items.forEach(li => li.classList.add('done')); tl.classList.add('run'); return; }
  tl.classList.add('run');
  items.forEach((li, i) => setTimeout(() => li.classList.add('done'), 350 + i * 430));
});

/* ---------- Demo forms ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) contactForm.addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('formSuccess').classList.remove('d-none');
  e.target.reset();
});
const newsForm = document.getElementById('newsForm');
if (newsForm) {
  newsForm.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('newsOk').classList.remove('d-none');
    e.target.reset();
  });
}

/* ---------- Language toggle (visual placeholder) ---------- */
document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.lang-btn').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
  b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
}));

/* ---------- Close offcanvas on link click ---------- */
document.querySelectorAll('#jpMenu .nav-link').forEach(a => a.addEventListener('click', () => {
  const oc = bootstrap.Offcanvas.getInstance(document.getElementById('jpMenu'));
  if (oc) oc.hide();
}));

/* ---------- Quote/Track buttons open the matching #tools tab ---------- */
document.querySelectorAll('[data-open-tab]').forEach(el => {
  el.addEventListener('click', () => {
    const wantsCalc = el.getAttribute('data-open-tab') === 'calc';
    const triggerEl = document.getElementById(wantsCalc ? 'tab-calc' : 'tab-track');
    if (triggerEl) bootstrap.Tab.getOrCreateInstance(triggerEl).show();
  });
});

/* ---------- Hero typewriter (3 rotating titles) ---------- */
const typeTextEl = document.getElementById('typeText');
if (typeTextEl) {
  const titles = [
    'Ship Worldwide with Confidence.',
    'Fast International Delivery.',
    'Reliable Courier, Every Time.'
  ];
  if (reduced) {
    typeTextEl.textContent = titles[0];
  } else {
    let ti = 0, ci = 0, deleting = false;
    const TYPE_SPEED = 55, DELETE_SPEED = 30, HOLD = 1800, GAP = 400;
    function tick() {
      const full = titles[ti];
      if (!deleting) {
        ci++;
        typeTextEl.textContent = full.slice(0, ci);
        if (ci === full.length) { setTimeout(() => { deleting = true; tick(); }, HOLD); return; }
        setTimeout(tick, TYPE_SPEED);
      } else {
        ci--;
        typeTextEl.textContent = full.slice(0, ci);
        if (ci === 0) { deleting = false; ti = (ti + 1) % titles.length; setTimeout(tick, GAP); return; }
        setTimeout(tick, DELETE_SPEED);
      }
    }
    setTimeout(tick, 700);
  }
}

/* ---------- Hero shipment card rotator ---------- */
const shipCardFade = document.getElementById('shipCardFade');
if (shipCardFade) {
  const shipments = [
    { id: 'JPE123456789', origin: 'DAC', dest: 'JFK', status: 'IN TRANSIT',       eta: 'ETA 2 DAYS',  progress: 62 },
    { id: 'JPE998877665', origin: 'DAC', dest: 'LHR', status: 'CUSTOMS',          eta: 'ETA 1 DAY',   progress: 78 },
    { id: 'JPE554433221', origin: 'DAC', dest: 'DXB', status: 'OUT FOR DELIVERY', eta: 'ETA TODAY',   progress: 92 }
  ];
  let si = 0;
  const shipId       = document.getElementById('shipId');
  const shipOrigin   = document.getElementById('shipOrigin');
  const shipDest     = document.getElementById('shipDest');
  const shipStatus   = document.getElementById('shipStatus');
  const shipEta      = document.getElementById('shipEta');
  const shipProgress = document.getElementById('shipProgress');

  function renderShipment(s) {
    shipId.textContent = 'SHIPMENT #' + s.id;
    shipOrigin.textContent = s.origin;
    shipDest.textContent = s.dest;
    shipStatus.textContent = s.status;
    shipEta.textContent = s.eta;
    if (shipProgress) shipProgress.style.width = s.progress + '%';
  }
  renderShipment(shipments[0]);

  if (!reduced) {
    setInterval(() => {
      shipCardFade.classList.add('fading');
      setTimeout(() => {
        si = (si + 1) % shipments.length;
        renderShipment(shipments[si]);
        shipCardFade.classList.remove('fading');
      }, 350);
    }, 3200);
  }
}

/* ---------- WhatsApp smart-link: skip landing page on desktop ---------- */
const WA_PHONE = '8801681637836';
const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
document.querySelectorAll('.wa-link').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const msg = encodeURIComponent(a.getAttribute('data-wa-text') || '');
    const url = isMobileDevice
      ? 'https://wa.me/' + WA_PHONE + '?text=' + msg
      : 'https://web.whatsapp.com/send?phone=' + WA_PHONE + '&text=' + msg;
    window.open(url, '_blank', 'noopener');
  });
});

/* ---------- Email smart-link: open Gmail compose directly on desktop ---------- */
document.querySelectorAll('.email-link').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const to = a.getAttribute('data-email-to') || 'jpexpress09@gmail.com';
    const subject = encodeURIComponent(a.getAttribute('data-email-subject') || '');
    if (isMobileDevice) {
      window.location.href = 'mailto:' + to + '?subject=' + subject;
    } else {
      window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) + '&su=' + subject, '_blank', 'noopener');
    }
  });
});

})();
