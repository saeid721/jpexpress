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
  if (reduced) { el.textContent = target; return; }
  const dur = 1600, t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
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
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle('is-scrolled', y > 12);
  topBar.classList.toggle('tb-hide', y > 60);
  fabSide.classList.toggle('show', y > 560);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
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
calcForm.addEventListener('submit', e => {
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
document.getElementById('fillDemo').addEventListener('click', () => { document.getElementById('trackInput').value = 'JPE123456789'; });
document.getElementById('trackForm').addEventListener('submit', e => {
  e.preventDefault();
  const val = document.getElementById('trackInput').value.trim();
  if (!val) { document.getElementById('trackInput').focus(); return; }
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
document.getElementById('contactForm').addEventListener('submit', e => {
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

})();