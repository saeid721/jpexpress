(function () {
"use strict";
document.documentElement.classList.add('js');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* Load sequence */
window.addEventListener('load', () => document.body.classList.add('loaded'));
setTimeout(() => document.body.classList.add('loaded'), 900); /* fallback */

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
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle('is-scrolled', y > 12);
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
document.getElementById('newsForm').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('newsOk').classList.remove('d-none');
  e.target.reset();
});

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
})();