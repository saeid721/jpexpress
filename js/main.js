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
      ['fade', '.testimonial-nav'],
      ['left', '.section-heading > div, .solution-copy, .testimonial-copy, .partners-copy, .cta-copy, #faqLeft .accordion-item, .resources-section .col-md-4:first-child .resource-card, .footer .row > div:first-child'],
      ['right', '.section-heading > .section-link, .solution-cases, .testimonial-card, .cta-actions, #faqRight .accordion-item, .resources-section .col-md-4:last-child .resource-card, .footer-contact'],
      ['card', '.quick-item, .trust-item, .mini-card, .image-card, .need-card, .industry-card, .partner-logos span, .resources-section .col-md-4:nth-child(2) .resource-card, .footer .row > .col-lg-2'],
      ['step', '.process-step'],
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
      ['.track-card .track-bg', 1, true],
      ['.destination-thumb img', 1, true],
      ['.solution-media img', 2, true],
      ['.partner-map', 3, false]
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
    const heroBg = hero && hero.querySelector('.hero-bg');
    const heroCopy = hero && hero.querySelector('.hero-copy');
    const heroStack = hero && hero.querySelector('.hero-feature-stack');
    const heroWrap = hero && hero.querySelector('.container-fluid');
    const heroOk = !!(heroBg && heroCopy && heroStack && heroWrap);
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
  /* Home page calculator/tracking are initialized in the dedicated Home section below.
     This avoids duplicate handlers and preserves the existing Home UI behavior. */

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
      { id: 'JPE123456789', origin: 'DAC', dest: 'JFK', status: 'IN TRANSIT', eta: 'ETA 2 DAYS', progress: 62 },
      { id: 'JPE998877665', origin: 'DAC', dest: 'LHR', status: 'CUSTOMS', eta: 'ETA 1 DAY', progress: 78 },
      { id: 'JPE554433221', origin: 'DAC', dest: 'DXB', status: 'OUT FOR DELIVERY', eta: 'ETA TODAY', progress: 92 }
    ];
    let si = 0;
    const shipId = document.getElementById('shipId');
    const shipOrigin = document.getElementById('shipOrigin');
    const shipDest = document.getElementById('shipDest');
    const shipStatus = document.getElementById('shipStatus');
    const shipEta = document.getElementById('shipEta');
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


/* ---------- Testimonials auto-rotator ---------- */
const testimonialsData = [
  {
    name: 'Tanvir Ahmed',
    role: 'Managing Director, Dhaka, Bangladesh',
    quote: '“Reliable service and excellent support. JP Express made our export process smooth and easy. Highly recommended.”',
    stars: '★★★★★',
    avatar: 'assets/teams/founder02.jpg'
  },
  {
    name: 'Sarah Mitchell',
    role: 'E-commerce Owner, London, UK',
    quote: '“Fast, secure and transparent. My parcels always reach on time and the tracking updates are spot-on.”',
    stars: '★★★★★',
    avatar: 'assets/teams/02.jpg'
  },
  {
    name: 'Mohammad Rahman',
    role: 'Export Manager, Chittagong',
    quote: '“Best logistics partner for our garment exports. Customs handling is seamless and pricing is fair.”',
    stars: '★★★★★',
    avatar: 'assets/teams/03.jpg'
  },
  {
    name: 'Emily Carter',
    role: 'Small Business, Toronto, Canada',
    quote: '“JP Express handles our international shipments professionally. Customer support is always responsive.”',
    stars: '★★★★☆',
    avatar: 'assets/teams/08.jpg'
  },
  {
    name: 'Fatima Noor',
    role: 'Freelancer, Dubai, UAE',
    quote: '“Affordable rates and reliable delivery. I trust JP Express for all my document and parcel shipments.”',
    stars: '★★★★★',
    avatar: 'assets/teams/07.jpg'
  }
];

const testimonialCard = document.getElementById('testimonialCard');
const testimonialAvatar = document.getElementById('testimonialAvatar');
const testimonialQuote = document.getElementById('testimonialQuote');
const testimonialName = document.getElementById('testimonialName');
const testimonialRole = document.getElementById('testimonialRole');
const testimonialStars = document.getElementById('testimonialStars');
const testimonialDots = document.getElementById('testimonialDots');
const testimonialPrev = document.getElementById('testimonialPrev');
const testimonialNext = document.getElementById('testimonialNext');

if (testimonialCard && testimonialsData.length > 1) {
  let currentIndex = 0;
  let autoTimer = null;
  const INTERVAL = 3000;

  // Build dots
  testimonialsData.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goToReview(i));
    testimonialDots.appendChild(dot);
  });

  function updateDots() {
    const dots = testimonialDots.querySelectorAll('span');
    dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIndex));
  }

  function goToReview(index) {
    if (index === currentIndex) return;
    currentIndex = index;
    renderReview(true);
    resetAuto();
  }

  function nextReview() {
    currentIndex = (currentIndex + 1) % testimonialsData.length;
    renderReview(true);
  }

  function prevReview() {
    currentIndex = (currentIndex - 1 + testimonialsData.length) % testimonialsData.length;
    renderReview(true);
  }

  function renderReview(animate) {
    const data = testimonialsData[currentIndex];

    if (animate) {
      testimonialCard.classList.add('is-changing');
      testimonialAvatar.classList.add('is-changing');
      setTimeout(() => {
        applyData(data);
        testimonialCard.classList.remove('is-changing');
        testimonialAvatar.classList.remove('is-changing');
      }, 350);
    } else {
      applyData(data);
    }
    updateDots();
  }

  function applyData(data) {
    testimonialQuote.textContent = data.quote;
    testimonialName.textContent = data.name;
    testimonialRole.textContent = data.role;
    testimonialStars.textContent = data.stars;
    testimonialAvatar.src = data.avatar;
    testimonialAvatar.alt = data.name;
  }

  function startAuto() {
    if (autoTimer) return;
    autoTimer = setInterval(nextReview, INTERVAL);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
    startAuto();
  }

  // Pause on hover
  testimonialCard.addEventListener('mouseenter', () => clearInterval(autoTimer));
  testimonialCard.addEventListener('mouseleave', startAuto);

  // Manual nav
  if (testimonialNext) testimonialNext.addEventListener('click', nextReview);
  if (testimonialPrev) testimonialPrev.addEventListener('click', prevReview);

  // Init
  renderReview(false);
  startAuto();
}

/* ---------- Destinations auto-scroll (right → left, non-stop) ---------- */
(function () {
  const destRow = document.querySelector('.destination-row');
  if (!destRow) return;

  const cards = Array.from(destRow.querySelectorAll('.destination-card'));
  if (cards.length === 0) return;

  // Clone cards for a seamless infinite loop (2x set)
  cards.forEach(c => destRow.appendChild(c.cloneNode(true)));
  destRow.classList.add('is-auto');

  const SPEED = 45;          // px per second (tune for feel)
  const NAV_JUMP = 280;      // px per nav-button click
  const NAV_PAUSE_MS = 2500; // how long nav keeps auto paused

  let paused = false;
  let raf = null;
  let lastTime = 0;

  function tick(time) {
    if (!lastTime) lastTime = time;
    // Cap delta so a background tab doesn't cause a huge jump
    const delta = Math.min(time - lastTime, 50);
    lastTime = time;

    if (!paused) {
      destRow.scrollLeft += (SPEED * delta) / 1000;
      const halfWidth = destRow.scrollWidth / 2;
      // Seamless reset when we've scrolled one full set
      if (destRow.scrollLeft >= halfWidth) {
        destRow.scrollLeft -= halfWidth;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  // Pause on hover (desktop)
  destRow.addEventListener('mouseenter', () => paused = true);
  destRow.addEventListener('mouseleave', () => { paused = false; lastTime = 0; });

  // Pause on touch (mobile)
  destRow.addEventListener('touchstart', () => paused = true, { passive: true });
  destRow.addEventListener('touchend', () => { paused = false; lastTime = 0; });
  destRow.addEventListener('touchcancel', () => { paused = false; lastTime = 0; });

  // Manual nav buttons — pause auto, smooth-scroll, then resume
  const prevBtn = document.querySelector('.dest-prev');
  const nextBtn = document.querySelector('.dest-next');

  function handleNav(direction) {
    paused = true;
    destRow.classList.remove('is-auto'); // allow snap to engage at end
    destRow.scrollBy({ left: direction * NAV_JUMP, behavior: 'smooth' });
    setTimeout(() => {
      destRow.classList.add('is-auto');
      paused = false;
      lastTime = 0;
    }, NAV_PAUSE_MS);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => handleNav(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => handleNav(1));

  // Start the loop
  raf = requestAnimationFrame(tick);
})();



(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-jp-reveal]").forEach(el => {
    if (reduced) { el.classList.add("revealed"); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target) } }), { threshold: .08 });
    io.observe(el);
  });
  document.querySelectorAll(".jp-accordion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".jp-accordion-item"), open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  const search = document.querySelector("[data-jp-search]");
  const filterButtons = [...document.querySelectorAll("[data-jp-filter]")];
  const items = [...document.querySelectorAll("[data-jp-item]")];
  function applyFilters() {
    const q = (search?.value || "").trim().toLowerCase();
    const active = document.querySelector("[data-jp-filter].active")?.dataset.jpFilter || "all";
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const cat = (item.dataset.category || "all").toLowerCase();
      item.hidden = !!(q && !text.includes(q)) || (active !== "all" && cat !== active);
    });
  }
  search?.addEventListener("input", applyFilters);
  filterButtons.forEach(btn => btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active")); btn.classList.add("active"); applyFilters();
  }));
  document.querySelectorAll(".jp-legal-tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".jp-legal-tab").forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false") });
    document.querySelectorAll(".jp-legal-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
    document.getElementById(tab.dataset.target)?.classList.add("active");
  }));
  document.querySelectorAll("[data-career-open]").forEach(btn => btn.addEventListener("click", () => {
    const title = btn.dataset.careerOpen;
    const field = document.querySelector("#careerRole");
    if (field) field.value = title;
  }));
  const back = document.querySelector("[data-jp-top]");
  window.addEventListener("scroll", () => back?.classList.toggle("d-none", window.scrollY < 600), { passive: true });
  back?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
  document.querySelectorAll("[data-service-option]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-service-option]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const target = document.querySelector("[data-service-result]");
    if (target) target.textContent = btn.dataset.serviceOption;
  }));
})();

/* =========================================================
   JP EXPRESS - CENTRALIZED JAVASCRIPT
   Single source of truth: this file contains all first-party
   JavaScript logic. No page HTML contains executable JS.

   PAGE MAP
   - ALL PAGES: core header, reveal, counters, scroll, links, shared UI
   - HOME (index.html): calculator, tracking preview, destination controls,
     country selector, hero title typing
   - SERVICES (services.html): category navigation + service search
   - INDUSTRIES (industries.html): industry filters/search
   - COUNTRIES (countries.html): country data, directory search/filter/sort
   - COUNTRY DETAIL (country.html): dynamic destination detail rendering
   - BLOG (blog.html): blog data, filtering, pagination, structured data
   - RESOURCES (resources.html): category scrollspy + guide/transit search
   - PRICING (pricing.html): pricing calculator
   - TRACK SHIPMENT (track-shipment.html): tracking lookup/demo
   - CONTACT (contact.html): inquiry form + WhatsApp fallback
   - CAREERS / LEGAL / RELATED PAGES: shared page interactions

   Rules:
   - Keep one implementation per feature.
   - Prefer page guards so unused page code exits immediately.
   - Do not add inline executable JavaScript to HTML.
   ========================================================= */

/* ---------- Shared initialization: ALL PAGES ---------- */
(function initSharedTypingState() {
  var root = document.documentElement;
  root.classList.add('typing-js');
  window.setTimeout(function () {
    root.classList.remove('typing-js');
  }, 3000);
})();

/* ---------- HOME PAGE: calculator + tracking preview ---------- */
(function initHomeTools() {
  var calcForm = document.getElementById('calcForm');
  var calcResult = document.getElementById('calcResult');

  if (calcForm && calcResult) {
    calcForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var weight = Math.max(parseFloat(document.getElementById('cWeight').value) || 1, 0.5);
      var type = document.getElementById('cType').value;
      var method = type === 'Commercial Cargo' ? 'Commercial Cargo' : 'International Courier';

      var low = Math.round(50 + weight * (method === 'Commercial Cargo' ? 7 : 9));
      var high = Math.round(low * 1.18);

      calcResult.classList.remove('d-none');
      calcResult.innerHTML =
        '<strong>Estimated shipping range: ৳' + low + ' – ৳' + high + '</strong>' +
        '<small>Indicative demo estimate. Final pricing is confirmed by our logistics team.</small>';
    });
  }

  var trackForm = document.getElementById('trackForm');
  var trackResult = document.getElementById('trackResult');

  if (trackForm && trackResult) {
    trackForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var input = document.getElementById('trackInput');
      if (!input.value.trim()) {
        input.focus();
        return;
      }

      trackResult.classList.remove('d-none');
    });
  }
})();

/* ---------- HOME PAGE: destination carousel controls ---------- */
/* Uses the existing centralized auto-scroll implementation in the core
   main.js above; this section only adds accessibility-safe button state
   when the carousel is not running in infinite-scroll mode. */
(function initHomeDestinationFallback() {
  var track = document.getElementById('destTrack');
  var prev = document.getElementById('destPrev');
  var next = document.getElementById('destNext');

  if (!track || !prev || !next || track.classList.contains('is-auto')) return;

  var stepSize = function () {
    var card = track.querySelector('.destination-card');
    var gap = parseFloat(getComputedStyle(track).columnGap) || 14;
    return card ? card.getBoundingClientRect().width + gap : 200;
  };

  var updateButtons = function () {
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };

  prev.addEventListener('click', function () {
    track.scrollBy({ left: -stepSize(), behavior: 'smooth' });
  });
  next.addEventListener('click', function () {
    track.scrollBy({ left: stepSize(), behavior: 'smooth' });
  });
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
})();

/* ---------- HOME PAGE: country selector dropdown ---------- */
(function initHomeCountrySelectors() {
  var boxes = document.querySelectorAll('.country-select');
  if (!boxes.length) return;

  var closeAll = function (except) {
    boxes.forEach(function (box) {
      if (box !== except) {
        var button = box.querySelector('.cs-btn');
        box.classList.remove('open');
        if (button) button.setAttribute('aria-expanded', 'false');
      }
    });
  };

  boxes.forEach(function (box) {
    var btn = box.querySelector('.cs-btn');
    var input = box.querySelector('input[type="hidden"]');
    var flag = box.querySelector('.cs-flag');
    var text = box.querySelector('.cs-text');
    var items = box.querySelectorAll('.cs-list li');

    if (!btn || !input || !flag || !text) return;

    btn.addEventListener('click', function () {
      var open = !box.classList.contains('open');
      closeAll(box);
      box.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });

    var choose = function (li) {
      input.value = li.dataset.value || '';
      flag.src = 'https://flagcdn.com/w80/' + (li.dataset.flag || '') + '.png';
      flag.hidden = false;
      text.textContent = li.dataset.value || '';
      text.classList.remove('is-placeholder');
      items.forEach(function (item) { item.classList.remove('is-selected'); });
      li.classList.add('is-selected');
      box.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    };

    items.forEach(function (li) {
      li.addEventListener('click', function () { choose(li); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          choose(li);
        }
      });
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.country-select')) closeAll();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });
})();

/* ---------- HOME PAGE: hero title typing/rotation ---------- */
(function initHomeHeroTitle() {
  var root = document.documentElement;
  var title = document.getElementById('heroTitle');
  if (!title) return;

  var slides = Array.prototype.slice.call(title.querySelectorAll('.ht-slide'));
  if (!slides.length) return;

  var SPEED = 45;
  var DELAY = 350;
  var HOLD = 2200;
  var FADE = 450;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  title.setAttribute('aria-label', slides[0].textContent.replace(/\s+/g, ' ').trim());

  var wrap = function (node, chars) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          var word = document.createElement('span');
          word.className = 'tword';
          Array.prototype.forEach.call(part, function (ch) {
            var span = document.createElement('span');
            span.className = 'tchar';
            span.textContent = ch;
            word.appendChild(span);
            chars.push(span);
          });
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        wrap(child, chars);
      }
    });
  };

  slides.forEach(function (slide) {
    slide.setAttribute('aria-hidden', 'true');
    slide.chars = [];
    wrap(slide, slide.chars);
  });

  if (reduced) {
    slides[0].classList.add('active');
    title.classList.add('is-ready');
    root.classList.remove('typing-js');
    return;
  }

  var idx = 0;
  var timer = null;

  var typeSlide = function (i) {
    var chars = slides[idx].chars;
    if (i < chars.length) {
      if (i > 0) chars[i - 1].classList.remove('is-caret');
      chars[i].classList.add('on', 'is-caret');
      timer = setTimeout(function () { typeSlide(i + 1); }, SPEED);
    } else if (slides.length === 1) {
      timer = setTimeout(function () {
        if (chars.length) chars[chars.length - 1].classList.remove('is-caret');
      }, 1500);
    } else {
      timer = setTimeout(function () {
        slides[idx].classList.add('out');
        timer = setTimeout(function () { show((idx + 1) % slides.length); }, FADE);
      }, HOLD);
    }
  };

  var show = function (n) {
    clearTimeout(timer);
    idx = n;
    slides.forEach(function (slide, k) {
      slide.classList.toggle('active', k === n);
      slide.classList.remove('out');
      slide.chars.forEach(function (char) {
        char.classList.remove('on', 'is-caret');
      });
    });
    typeSlide(0);
  };

  title.classList.add('is-ready');
  root.classList.remove('typing-js');
  slides[0].classList.add('active');
  timer = setTimeout(function () { typeSlide(0); }, DELAY);
})();


/* =========================================================
   CONSOLIDATED MODULE: blog-data.js
   ========================================================= */
/* JP Express blog – content data. Add an article = add one object.
   c category | t title | x excerpt | fx long excerpt (featured) | d date (YYYY-MM-DD) | r read minutes
   i FontAwesome icon | k tone (red|blue|amber|navy|green|cyan) | h link | a link label | f featured | q search keywords
   When full article pages exist, set h to "blog/your-slug.html" (or /blog/your-slug/ on Laravel). */
const BLOG_CATS = {
  'export-tips': 'Export Tips', 'country-guide': 'Country Shipping Guides', 'packaging': 'Packaging',
  'logistics': 'Logistics', 'customs': 'Customs', 'business-growth': 'Business Growth',
  'courier-news': 'Courier News', 'international-trade': 'International Trade'
};
const BLOG_POSTS = [
  { c: 'export-tips', t: 'How to prepare your first export shipment from Bangladesh', x: 'The essential steps before your goods leave Dhaka.',
    fx: 'A clear, practical checklist for documents, packaging, customs and the decisions that make an international shipment run smoothly.',
    d: '2026-08-18', r: 8, i: 'fa-box-open', k: 'red', h: 'services.html#export', a: 'Read the guide', f: 1, q: 'export shipment bangladesh documents checklist first export' },
  { c: 'country-guide', t: 'Shipping to the USA: documents, duties and delivery times', x: 'What Bangladeshi shippers should know before booking.',
    d: '2026-08-12', r: 6, i: 'fa-flag-usa', k: 'blue', h: 'country.html?c=usa', a: 'View country guide', q: 'shipping to usa united states country guide customs delivery' },
  { c: 'packaging', t: '7 packaging mistakes that cause shipping damage', x: 'Protect fragile products and reduce avoidable delivery issues.',
    d: '2026-08-08', r: 5, i: 'fa-box', k: 'amber', h: 'resources.html#packaging-guide', a: 'Read packaging guide', q: 'packaging fragile parcel box ecommerce shipping guide' },
  { c: 'logistics', t: 'Air freight vs sea freight: which route fits your cargo?', x: 'A practical comparison of speed, cost and shipment volume.',
    d: '2026-08-03', r: 7, i: 'fa-plane-departure', k: 'navy', h: 'services.html#freight', a: 'Compare services', q: 'air sea freight logistics compare cargo business' },
  { c: 'customs', t: 'Commercial invoice basics for international shipments', x: 'The information customs teams need to clear your goods.',
    d: '2026-07-28', r: 6, i: 'fa-file-invoice', k: 'green', h: 'resources.html#customs-info', a: 'Explore resources', q: 'customs commercial invoice clearance export import documents' },
  { c: 'business-growth', t: 'How better delivery experiences help e-commerce brands grow', x: 'Turn shipping from a cost center into customer confidence.',
    d: '2026-07-21', r: 4, i: 'fa-chart-line', k: 'cyan', h: 'services.html', a: 'Explore solutions', q: 'ecommerce business growth delivery customer experience shipping' },
  { c: 'courier-news', t: 'What real-time shipment tracking should tell you', x: 'From pickup to delivery, understand every useful status.',
    d: '2026-07-15', r: 3, i: 'fa-location-dot', k: 'red', h: 'track-shipment.html', a: 'Track a shipment', q: 'courier news express delivery tracking shipment update' },
  { c: 'international-trade', t: 'Finding your next international market: a starter framework', x: 'Use demand, route and compliance signals to plan expansion.',
    d: '2026-07-09', r: 9, i: 'fa-globe', k: 'blue', h: 'contact.html', a: 'Talk to an expert', q: 'international trade bangladesh market export buyer trade growth' }
];

/* =========================================================
   CONSOLIDATED MODULE: countries-data.js
   ========================================================= */
/* JP Express – destinations dataset. Add a country = add one object.
   v: service letters (e express, o economy, d door-to-door, a air, s sea, x export, c customs)
   Transit = express estimate only. Verify rules before publishing. */
const SERVICES = {
  e: { n: 'Express Courier', i: 'fa-bolt', u: 'services.html#intl-courier', f: 'Time-sensitive documents and parcels', c: 'Speed vs. cost' },
  o: { n: 'Economy Courier', i: 'fa-box', u: 'services.html#intl-courier', f: 'Less urgent parcels', c: 'Longer transit, lower cost' },
  d: { n: 'Door-to-Door Delivery', i: 'fa-door-open', u: 'services.html#intl-courier', f: 'Pickup in Bangladesh to recipient address', c: 'Address accuracy' },
  a: { n: 'Air Freight', i: 'fa-plane', u: 'services.html#freight', f: 'Commercial cargo', c: 'Weight / volume' },
  s: { n: 'Sea Freight', i: 'fa-ship', u: 'services.html#freight', f: 'Large, non-urgent cargo', c: 'Transit time / volume' },
  x: { n: 'Commercial Export', i: 'fa-file-export', u: 'services.html#export', f: 'Samples, B2B and export shipments', c: 'Export documents' },
  c: { n: 'Customs Clearance', i: 'fa-stamp', u: 'services.html#import', f: 'Declarations and clearance support', c: 'Duties and taxes' }
};
const ALL = 'eodasxc';
const COUNTRY_DATA = {
  usa: { n: 'United States', c: 'us', r: 'North America', cap: 'Washington, D.C.', cur: 'USD', t: '3–5 days', pop: 1, v: ALL,
    ov: 'One of our busiest routes, used by families sending gifts and documents as well as exporters sending samples and commercial cargo.',
    cu: 'Personal and commercial shipments are handled differently, so declare contents and value accurately. Duties, taxes and importer details depend on the goods and current US import rules.',
    rs: ['Food, plant and animal products', 'Medicines and supplements', 'Lithium batteries and liquids'],
    ch: 'A complete street address, ZIP code and reachable phone number prevent most delays. Remote areas may need extra time.',
    ind: ['Garments & Textile', 'E-commerce', 'Leather & Handicrafts'], ci: 'New York, Los Angeles, Chicago, Houston, Dallas' },
  uk: { n: 'United Kingdom', c: 'gb', r: 'Europe', cap: 'London', cur: 'GBP', t: '3–5 days', pop: 1, v: ALL,
    ov: 'A key destination for Bangladeshi families, students and online sellers, with regular document, parcel and commercial shipments.',
    cu: 'Shipments need an accurate customs declaration. Import VAT and duty depend on value and goods; commercial importers may need an EORI number.',
    rs: ['Meat, dairy and plant products', 'Medicines and cosmetics', 'Batteries and aerosols'],
    ch: 'Recipients may be asked to pay import charges before delivery, so share their contact details early.',
    ind: ['Garments & Textile', 'E-commerce', 'Buying Houses'], ci: 'London, Birmingham, Manchester, Leeds' },
  canada: { n: 'Canada', c: 'ca', r: 'North America', cap: 'Ottawa', cur: 'CAD', t: '4–6 days', pop: 1, v: ALL,
    ov: 'Popular with families and students sending personal parcels, plus small businesses shipping samples and stock.',
    cu: 'Duties and taxes depend on declared value, goods and current Canadian import rules. A correct description and value avoid clearance delays.',
    rs: ['Food and agricultural items', 'Medicines and health products', 'Firearms, weapons and replicas'],
    ch: 'Winter weather and long rural distances can add time outside major cities.',
    ind: ['E-commerce', 'Garments & Textile', 'SMEs'], ci: 'Toronto, Vancouver, Montreal, Calgary' },
  australia: { n: 'Australia', c: 'au', r: 'Asia-Pacific', cap: 'Canberra', cur: 'AUD', t: '5–7 days', pop: 1, v: ALL,
    ov: 'A strong route for personal parcels and gifts, with a growing number of business and sample shipments.',
    cu: 'Biosecurity is strict: food, plant, seed and wooden items must be declared. Import GST and duty depend on value and goods.',
    rs: ['Food, seeds and plant material', 'Wooden and bamboo items', 'Medicines and supplements'],
    ch: 'Remote and regional addresses can take longer than capital cities.',
    ind: ['Garments & Textile', 'Handicrafts', 'E-commerce'], ci: 'Sydney, Melbourne, Brisbane, Perth' },
  uae: { n: 'United Arab Emirates', c: 'ae', r: 'Middle East', cap: 'Abu Dhabi', cur: 'AED', t: '2–3 days', pop: 1, v: ALL,
    ov: 'Our fastest-moving Gulf route, widely used by expatriate families, freelancers and traders.',
    cu: 'Customs may ask for recipient ID or company details, and a clear invoice for goods. Charges depend on goods and value.',
    rs: ['Alcohol, pork and tobacco products', 'Medicines and supplements', 'Religious or restricted media'],
    ch: 'Use a precise delivery location and a phone number the courier can reach; many addresses are landmark-based.',
    ind: ['Garments & Textile', 'E-commerce', 'Food & Agro (subject to rules)'], ci: 'Dubai, Abu Dhabi, Sharjah' },
  saudi: { n: 'Saudi Arabia', c: 'sa', r: 'Middle East', cap: 'Riyadh', cur: 'SAR', t: '3–4 days', pop: 1, v: ALL,
    ov: 'A major destination for expatriate families and importers of apparel, household and consumer goods.',
    cu: 'Some goods need conformity certification (such as SASO/SABER) and commercial invoices must be precise. Confirm before booking.',
    rs: ['Alcohol, pork and religious items', 'Medicines and supplements', 'Electronics needing certification'],
    ch: 'Recipient identification and a detailed national address make final delivery smoother.',
    ind: ['Garments & Textile', 'Handicrafts', 'SMEs'], ci: 'Riyadh, Jeddah, Dammam' },
  germany: { n: 'Germany', c: 'de', r: 'Europe', cap: 'Berlin', cur: 'EUR', t: '3–5 days', v: ALL,
    ov: 'An important EU gateway for garment buyers, e-commerce sellers and families.',
    cu: 'Imports into the EU involve customs declarations and import VAT. Commercial shipments may need an EORI number.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
    ch: 'Clear recipient name and street details reduce redelivery attempts.',
    ind: ['Garments & Textile', 'Leather', 'E-commerce'], ci: 'Berlin, Hamburg, Munich, Frankfurt' },
  france: { n: 'France', c: 'fr', r: 'Europe', cap: 'Paris', cur: 'EUR', t: '3–5 days', v: ALL,
    ov: 'A steady route for personal parcels, fashion samples and small commercial shipments.',
    cu: 'EU customs declarations and import VAT apply. Commercial shipments may need an EORI number and a detailed invoice.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Batteries and liquids'],
    ch: 'Share an apartment/door code where relevant so the courier can deliver first time.',
    ind: ['Garments & Textile', 'Handicrafts', 'E-commerce'], ci: 'Paris, Lyon, Marseille' },
  italy: { n: 'Italy', c: 'it', r: 'Europe', cap: 'Rome', cur: 'EUR', t: '4–6 days', v: ALL,
    ov: 'A well-used European route with a large Bangladeshi community and active apparel trade.',
    cu: 'EU customs declarations and import VAT apply; invoices should describe fabric and goods clearly.',
    rs: ['Food and animal products', 'Medicines and cosmetics', 'Counterfeit-brand goods'],
    ch: 'Southern regions and islands can add transit time.',
    ind: ['Garments & Textile', 'Leather', 'Buying Houses'], ci: 'Rome, Milan, Naples' },
  japan: { n: 'Japan', c: 'jp', r: 'Asia-Pacific', cap: 'Tokyo', cur: 'JPY', t: '3–5 days', v: ALL,
    ov: 'Used for documents, student parcels and business samples to a quality-focused market.',
    cu: 'Plant and food quarantine is strict, and customs expects accurate descriptions and values.',
    rs: ['Food, plants and seeds', 'Medicines and supplements', 'Counterfeit or imitation goods'],
    ch: 'Japanese-format addresses and a recipient phone number help delivery.',
    ind: ['Garments & Textile', 'Jute Products', 'Handicrafts'], ci: 'Tokyo, Osaka, Nagoya' },
  southkorea: { n: 'South Korea', c: 'kr', r: 'Asia-Pacific', cap: 'Seoul', cur: 'KRW', t: '3–5 days', v: ALL,
    ov: 'A fast-growing route for students, workers and business samples.',
    cu: 'Individual recipients may need a personal customs clearance code. Duties depend on goods and value.',
    rs: ['Food and agricultural items', 'Medicines and supplements', 'Cosmetics in volume'],
    ch: 'Keep the recipient’s Korean contact details ready for customs.',
    ind: ['Garments & Textile', 'E-commerce', 'SMEs'], ci: 'Seoul, Busan, Incheon' },
  china: { n: 'China', c: 'cn', r: 'Asia-Pacific', cap: 'Beijing', cur: 'CNY', t: '3–5 days', v: 'eodaxc', 
    ov: 'A major sourcing and trade route, mostly business samples, documents and parcels.',
    cu: 'Some commercial goods need import licences or certificates; confirm requirements before dispatch.',
    rs: ['Restricted publications and media', 'Food and medicines', 'Goods needing import licences'],
    ch: 'Provide recipient details in a format customs can verify; address language matters.',
    ind: ['Buying Houses', 'Manufacturing', 'E-commerce'], ci: 'Guangzhou, Shanghai, Beijing' },
  singapore: { n: 'Singapore', c: 'sg', r: 'Asia-Pacific', cap: 'Singapore', cur: 'SGD', t: '2–4 days', v: ALL,
    ov: 'A fast regional hub for documents, parcels and business shipments.',
    cu: 'GST and duty depend on goods and value; controlled items need permits.',
    rs: ['Chewing gum and e-cigarettes', 'Medicines and supplements', 'Controlled or regulated goods'],
    ch: 'Include unit/postcode details for apartments and offices.',
    ind: ['E-commerce', 'SMEs', 'Garments & Textile'], ci: 'Singapore' },
  malaysia: { n: 'Malaysia', c: 'my', r: 'Asia-Pacific', cap: 'Kuala Lumpur', cur: 'MYR', t: '3–5 days', v: ALL,
    ov: 'A popular route for workers, students and traders with strong two-way links.',
    cu: 'Duties and taxes depend on goods and value; certain goods need permits.',
    rs: ['Pork and alcohol products', 'Medicines and supplements', 'Controlled or regulated goods'],
    ch: 'Add postcode and a reachable mobile number for last-mile delivery.',
    ind: ['Garments & Textile', 'E-commerce', 'SMEs'], ci: 'Kuala Lumpur, Penang, Johor Bahru' }
};
const REGIONS = ['North America', 'Europe', 'Middle East', 'Asia-Pacific'];

/* =========================================================
   CONSOLIDATED MODULE: services.js
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var behavior = reduced ? "auto" : "smooth";
  var $ = function (id) { return document.getElementById(id); };

  var inner = document.querySelector(".svp-catnav-inner");
  var links = Array.prototype.slice.call(document.querySelectorAll(".svp-catlink"));
  var sections = Array.prototype.slice.call(document.querySelectorAll(".svp-cat"));
  var byId = {};
  links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });

  /* ---------- Category nav: active state + keep chip visible on mobile ---------- */
  var lockUntil = 0;

  function setActive(link) {
    if (!link) return;
    links.forEach(function (l) {
      var on = l === link;
      l.classList.toggle("active", on);
      if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });
    if (inner && inner.scrollWidth > inner.clientWidth) {
      var left = link.offsetLeft - (inner.clientWidth - link.offsetWidth) / 2;
      inner.scrollTo({ left: Math.max(0, left), behavior: behavior });
    }
  }

  if (links.length && sections.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (Date.now() < lockUntil) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(byId[entry.target.id]);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  links.forEach(function (l) {
    l.addEventListener("click", function () {
      lockUntil = Date.now() + 900; // ignore scroll-spy while the smooth scroll runs
      setActive(l);
    });
  });

  /* ---------- Live service search + quick picks ---------- */
  var input = $("svcSearch");
  if (!input) return;

  var clear = $("svcClear");
  var count = $("svcCount");
  var empty = $("svcEmpty");
  var items = Array.prototype.slice.call(document.querySelectorAll(".svp-item"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".svp-chip"));

  items.forEach(function (el) {
    el._text = (el.textContent + " " + (el.getAttribute("data-tags") || "")).toLowerCase().replace(/\s+/g, " ");
  });

  function apply() {
    var q = input.value.trim().toLowerCase();
    var terms = q.split(/\s+/).filter(Boolean);
    var shown = 0;

    items.forEach(function (el) {
      var ok = terms.every(function (t) { return el._text.indexOf(t) > -1; });
      el.hidden = !ok;
      if (ok) shown++;
    });

    sections.forEach(function (s) {
      var any = !!s.querySelector(".svp-item:not([hidden])");
      s.hidden = !any;
      if (byId[s.id]) byId[s.id].hidden = !any;
    });

    clear.hidden = !q;
    empty.hidden = shown !== 0;
    count.textContent = q && shown ? "Showing " + shown + " of " + items.length + " services" : "";
    chips.forEach(function (c) { c.classList.toggle("active", !!q && c.getAttribute("data-q") === q); });

    var firstVisible = links.filter(function (l) { return !l.hidden; })[0];
    if (firstVisible) setActive(firstVisible);
  }

  function goToResults() {
    var first = sections.filter(function (s) { return !s.hidden; })[0];
    if (first) first.scrollIntoView({ behavior: behavior, block: "start" });
  }

  input.addEventListener("input", apply);

  clear.addEventListener("click", function () {
    input.value = "";
    apply();
    input.focus();
  });

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var q = c.getAttribute("data-q");
      var same = input.value.trim().toLowerCase() === q;
      input.value = same ? "" : q;
      apply();
      if (!same) goToResults();
    });
  });
})();

/* =========================================================
   CONSOLIDATED MODULE: industries.js
   ========================================================= */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var input = $("indSearch");
  if (!input) return;

  var clear = $("indClear"), count = $("indCount"), empty = $("indEmpty"), reset = $("indReset");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".ind-card"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".ind-tab"));
  var needs = Array.prototype.slice.call(document.querySelectorAll(".ind-need"));
  var state = { cat: "all", need: "", q: "" };

  cards.forEach(function (c) {
    c._text = (c.textContent + " " + (c.getAttribute("data-tags") || "")).toLowerCase().replace(/\s+/g, " ");
  });

  function apply() {
    var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;

    cards.forEach(function (c) {
      var okCat = state.cat === "all" || c.getAttribute("data-cat") === state.cat;
      var okNeed = !state.need || (" " + c.getAttribute("data-needs") + " ").indexOf(" " + state.need + " ") > -1;
      var okText = terms.every(function (t) { return c._text.indexOf(t) > -1; });
      var ok = okCat && okNeed && okText;
      c.hidden = !ok;
      if (ok) shown++;
    });

    tabs.forEach(function (t) {
      var on = t.getAttribute("data-cat") === state.cat;
      t.classList.toggle("active", on);
      t.setAttribute("aria-pressed", on);
    });
    needs.forEach(function (n) {
      var on = n.getAttribute("data-need") === state.need;
      n.classList.toggle("active", on);
      n.setAttribute("aria-pressed", on);
    });

    clear.hidden = !state.q;
    empty.hidden = shown !== 0;
    var filtered = state.cat !== "all" || state.need || state.q;
    count.textContent = shown ? (filtered ? "Showing " + shown + " of " + cards.length + " industries" : "") : "";
  }

  input.addEventListener("input", function () { state.q = input.value.trim(); apply(); });
  clear.addEventListener("click", function () { input.value = ""; state.q = ""; apply(); input.focus(); });
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { state.cat = t.getAttribute("data-cat"); apply(); });
  });
  needs.forEach(function (n) {
    n.addEventListener("click", function () {
      var v = n.getAttribute("data-need");
      state.need = state.need === v ? "" : v;
      apply();
    });
  });
  if (reset) reset.addEventListener("click", function () {
    state = { cat: "all", need: "", q: "" };
    input.value = "";
    apply();
  });
  apply();
})();

/* =========================================================
   CONSOLIDATED MODULE: countries.js
   ========================================================= */
(function () {
  'use strict';
  const grid = document.getElementById('ctrGrid');
  if (!grid || typeof COUNTRY_DATA === 'undefined') return;

  const $ = id => document.getElementById(id);
  const search = $('ctrSearch'), clearBtn = $('ctrClear'), count = $('ctrCount'),
        empty = $('ctrEmpty'), sortSel = $('ctrSort'), filters = $('ctrFilters');
  const list = Object.keys(COUNTRY_DATA).map(s => Object.assign({ s: s }, COUNTRY_DATA[s]));
  let region = 'All';

  const card = c => {
    const names = c.v.split('').map(k => SERVICES[k].n);
    return '<a class="ctr-card" href="country.html?c=' + c.s + '" aria-label="Shipping guide: Bangladesh to ' + c.n + '">' +
      '<span class="ctr-card-top"><img src="https://flagcdn.com/w80/' + c.c + '.png" width="44" height="44" alt="" loading="lazy">' +
      '<span><strong>' + c.n + '</strong><small>' + c.r + '</small></span></span>' +
      '<span class="ctr-card-meta"><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + c.t + '</span>' +
      '<span><i class="fa-solid fa-layer-group" aria-hidden="true"></i> ' + names.length + ' services</span></span>' +
      '<span class="ctr-tags">' + names.slice(0, 3).map(n => '<em>' + n + '</em>').join('') + '</span>' +
      '<span class="ctr-card-go">View shipping guide <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></a>';
  };

  // Popular destinations
  const pop = $('ctrPopular');
  if (pop) pop.innerHTML = list.filter(c => c.pop).map(card).join('');

  // Region filter chips
  filters.innerHTML = ['All'].concat(REGIONS).map((r, i) =>
    '<button type="button" class="ctr-chip' + (i ? '' : ' active') + '" data-r="' + r + '" aria-pressed="' + (i ? 'false' : 'true') + '">' +
    r + ' <b>' + (i ? list.filter(c => c.r === r).length : list.length) + '</b></button>').join('');

  function render() {
    const q = search.value.trim().toLowerCase();
    let out = list.filter(c => (region === 'All' || c.r === region) &&
      (!q || (c.n + ' ' + c.cap + ' ' + c.r + ' ' + c.cur + ' ' + c.ci).toLowerCase().includes(q)));
    if (sortSel.value === 'az') out.sort((a, b) => a.n.localeCompare(b.n));
    else if (sortSel.value === 'fast') out.sort((a, b) => parseInt(a.t) - parseInt(b.t) || a.n.localeCompare(b.n));
    else out.sort((a, b) => (b.pop || 0) - (a.pop || 0) || a.n.localeCompare(b.n));
    grid.innerHTML = out.map(card).join('');
    empty.hidden = out.length > 0;
    clearBtn.hidden = !q;
    count.textContent = out.length + (out.length === 1 ? ' destination' : ' destinations') + (region !== 'All' ? ' in ' + region : '');
    const fb = $('ctrNoneQ'); if (fb) fb.textContent = q ? '“' + search.value.trim() + '”' : 'that destination';
  }

  search.addEventListener('input', render);
  sortSel.addEventListener('change', render);
  clearBtn.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  filters.addEventListener('click', e => {
    const b = e.target.closest('.ctr-chip'); if (!b) return;
    region = b.dataset.r;
    filters.querySelectorAll('.ctr-chip').forEach(x => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
    render();
  });
  // Quick search buttons in hero
  document.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
    search.value = b.dataset.q; render();
    $('directory').scrollIntoView({ behavior: 'smooth' });
  }));
  // Allow /countries.html?q=uk
  const qp = new URLSearchParams(location.search).get('q');
  if (qp) search.value = qp;
  render();
})();

/* =========================================================
   CONSOLIDATED MODULE: country-details.js
   ========================================================= */
(function () {
  'use strict';
  const root = document.getElementById('cdRoot');
  if (!root || typeof COUNTRY_DATA === 'undefined') return;

  const q = new URLSearchParams(location.search);
  const slug = (q.get('c') || q.get('country') || '').toLowerCase();
  const d = COUNTRY_DATA[slug];
  const WA = 'https://wa.me/8801681637836?text=';
  const flag = (c, w) => `<img src="https://flagcdn.com/w80/${c}.png" width="${w}" height="${w}" alt="" loading="lazy">`;
  const ul = (a, ic) => `<ul class="cd-list">${a.map(x => `<li><i class="fa-solid ${ic || 'fa-check'}" aria-hidden="true"></i>${x}</li>`).join('')}</ul>`;
  const ask = (t) => `${WA}${encodeURIComponent(t)}`;

  /* ---------- Not found ---------- */
  if (!d) {
    document.title = 'Destination Not Found | JP Express';
    root.innerHTML = `<section class="pg-hero"><div class="container-fluid"><h1>We couldn’t find that destination</h1>
      <p>Browse the destinations we serve, or message us to check if we can ship to your country.</p>
      <div class="cd-cta"><a class="btn-main btn-red" href="countries.html">Browse Destinations</a>
      <a class="btn-main btn-dark-outline" target="_blank" rel="noopener" href="${ask('Hi JP Express, can you ship to my country?')}">Ask on WhatsApp</a></div></div></section>`;
    return;
  }

  const keys = d.v.split('');
  const sv = keys.map(k => SERVICES[k]);
  const first = d.rs[0].toLowerCase();
  const related = Object.keys(COUNTRY_DATA).filter(s => s !== slug)
    .sort((a, b) => (COUNTRY_DATA[b].r === d.r) - (COUNTRY_DATA[a].r === d.r) || (COUNTRY_DATA[b].pop || 0) - (COUNTRY_DATA[a].pop || 0)).slice(0, 4);
  const faqs = [
    [`Does JP Express ship from Bangladesh to ${d.n}?`, `Yes. ${d.n} is a destination we serve, with ${sv.length} service options including ${sv.slice(0, 3).map(s => s.n).join(', ')}. Request a quote to confirm service, price and requirements for your shipment.`],
    [`How long does shipping to ${d.n} take?`, `Express courier is typically estimated at ${d.t}. This is an estimate: actual time depends on service, shipment type, customs processing, remote areas, weekends/holidays and peak periods.`],
    [`How is the cost to ${d.n} calculated?`, `Cost depends on actual or volumetric weight (whichever is higher), dimensions, shipment type, service level, pickup needs, surcharges and any destination duties or taxes. Use the calculator on this page or request a quote.`],
    ['What documents are required?', `Personal shipments usually need sender and recipient details, a contents description and declared value. Commercial shipments typically need a commercial invoice and packing list, plus export documents. ${d.cu}`],
    [`Are customs duties or taxes applicable in ${d.n}?`, `They may be. Duties and import taxes are separate from shipping charges and depend on goods, value and current ${d.n} rules. We can’t promise “no customs charges” for any destination.`],
    [`Can I send food or medicine to ${d.n}?`, `Often restricted. For ${d.n}, pay special attention to: ${d.rs.join('; ').toLowerCase()}. Always confirm with our team before booking.`],
    ['Can I track my shipment?', 'Yes. Use your tracking number on our Track Shipment page for shipment status updates.'],
    ['Can JP Express pick up from my address?', 'Pickup availability depends on your area in Bangladesh. Share your location when you request a quote and we will confirm options.']
  ];
  const steps = [['Request a quote', 'Share route, weight and contents.'], ['Confirm shipment', 'Service, price and requirements are agreed.'], ['Pickup or drop-off', 'We collect or receive your parcel.'], ['Documents & checks', 'Paperwork and contents are reviewed.'], ['Dispatch from Bangladesh', 'Shipment enters the international network.'], [`Processing in ${d.n}`, 'Destination-side handling and customs where applicable.'], ['Final delivery', 'Delivered to the recipient.'], ['Track & confirm', 'Follow status and delivery updates.']];
  const nav = [['overview', 'Overview'], ['services', 'Services'], ['process', 'Process'], ['quote', 'Cost & Transit'], ['docs', 'Documents'], ['restrict', 'Restrictions'], ['delivery', 'Pickup & Delivery'], ['business', 'Business'], ['faq', 'FAQ']];
  const sec = (id, t, body, alt) => `<section class="pg-sec cx${alt ? ' pg-alt' : ''}" id="${id}" aria-labelledby="${id}T"><div class="container-fluid"><h2 class="pg-h" id="${id}T">${t}</h2>${body}</div></section>`;

  root.innerHTML = `
  <section class="pg-hero cd-hero"><div class="container-fluid">
    <nav class="pg-crumb" aria-label="Breadcrumb"><a href="index.html">Home</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><a href="countries.html">Countries</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><span aria-current="page">${d.n}</span></nav>
    <div class="cd-route" aria-hidden="true"><span>${flag('bd', 28)}Bangladesh</span><i class="fa-solid fa-plane"></i><span>${flag(d.c, 28)}${d.n}</span></div>
    <h1>International Shipping from Bangladesh to ${d.n}</h1>
    <p class="cd-lead">${d.ov} Courier and freight options, documents, customs notes and a quote path — all in one place.</p>
    <div class="cd-cta"><a class="btn-main btn-red" href="#quote">Get a Quote <i class="fa-solid fa-arrow-right"></i></a>
      <a class="btn-main btn-dark-outline" target="_blank" rel="noopener" href="${ask(`Hi JP Express, I want to ship from Bangladesh to ${d.n}.`)}"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      <a class="cd-link" href="tel:+8801681637836"><i class="fa-solid fa-phone"></i> Call</a><a class="cd-link" href="track-shipment.html"><i class="fa-solid fa-location-dot"></i> Track</a></div>
  </div></section>
  <div class="container-fluid cd-stats-wrap"><div class="cd-stats">
    <div><i class="fa-regular fa-clock"></i><b>${d.t}</b><small>Express estimate</small></div>
    <div><i class="fa-solid fa-layer-group"></i><b>${sv.length}</b><small>Services</small></div>
    <div><i class="fa-solid fa-location-dot"></i><b>${d.cap}</b><small>Capital</small></div>
    <div><i class="fa-solid fa-coins"></i><b>${d.cur}</b><small>Currency</small></div></div></div>
  <div class="cd-nav" id="cdNav"><div class="container-fluid"><div class="cd-nav-in">${nav.map(n => `<a href="#${n[0]}">${n[1]}</a>`).join('')}</div></div></div>

  ${sec('overview', `Shipping to ${d.n} at a glance`, `
    <div class="cd-grid3">
      <div class="cd-card"><h3><i class="fa-solid fa-users"></i> Who ships here</h3>${ul(['Families, students and gift senders', 'Exporters, SMEs and e-commerce sellers', 'Buying houses and corporate customers'])}</div>
      <div class="cd-card"><h3><i class="fa-solid fa-box-open"></i> What you can ship</h3>${ul(['Documents and paperwork', 'Personal parcels and gifts', 'Samples and commercial cargo'])}<p class="cd-note">Subject to JP Express policy and ${d.n} rules.</p></div>
      <div class="cd-card cd-trust"><h3><i class="fa-solid fa-shield-halved"></i> Based in Dhaka</h3>${ul(['Bangladesh-based courier & logistics team', 'Hotline 9am – 11pm: +880 1681 637836', 'WhatsApp support for quotes'])}</div>
    </div>`)}

  ${sec('services', `Shipping services to ${d.n}`, `
    <div class="cd-table-wrap"><table class="cd-table"><thead><tr><th>Service</th><th>Suitable for</th><th>Main consideration</th><th><span class="visually-hidden">Action</span></th></tr></thead><tbody>
    ${sv.map(s => `<tr><td data-l="Service"><a href="${s.u}"><i class="fa-solid ${s.i}"></i> ${s.n}</a></td><td data-l="Suitable for">${s.f}</td><td data-l="Consideration">${s.c}</td><td><a class="cd-mini" href="#quote">Get quote</a></td></tr>`).join('')}
    </tbody></table></div>`, 1)}

  ${sec('process', `How shipping from Bangladesh to ${d.n} works`, `<ol class="cd-steps">${steps.map(s => `<li><b>${s[0]}</b><span>${s[1]}</span></li>`).join('')}</ol>`)}

  <section class="pg-sec pg-alt cx" id="quote" aria-labelledby="quoteT"><div class="container-fluid">
    <h2 class="pg-h" id="quoteT">Cost, transit time & quote</h2>
    <div class="cd-grid2">
      <div class="cd-card"><h3><i class="fa-regular fa-clock"></i> Transit time</h3>
        <p class="cd-big">${d.t}<small> estimated, express</small></p>
        <p>This is an estimate, not a guarantee. It varies with service, shipment type, origin and destination processing, customs, remote areas, weekends/holidays and peak periods.</p>
        <h3 class="mt-3"><i class="fa-solid fa-sliders"></i> What affects cost</h3>
        ${ul(['Actual vs. volumetric weight', 'Dimensions and number of pieces', 'Shipment type and service level', 'Pickup and packaging needs', `Customs, duties and taxes in ${d.n}`, 'Fuel or applicable surcharges'])}</div>
      <div class="cd-card cd-tool"><h3><i class="fa-solid fa-calculator"></i> Weight check & quote request</h3>
        <form id="qForm" novalidate><div class="cd-fields">
          <label>Type<select id="qType"><option>Documents</option><option selected>Parcel</option><option>Commercial</option></select></label>
          <label>Service<select id="qSvc">${sv.map(s => `<option>${s.n}</option>`).join('')}</select></label>
          <label>Weight (kg)<input id="qW" type="number" inputmode="decimal" min="0" step="0.1" placeholder="2"></label>
          <label>Length (cm)<input id="qL" type="number" inputmode="decimal" min="0" placeholder="30"></label>
          <label>Width (cm)<input id="qWd" type="number" inputmode="decimal" min="0" placeholder="20"></label>
          <label>Height (cm)<input id="qH" type="number" inputmode="decimal" min="0" placeholder="15"></label></div></form>
        <div class="cd-result" aria-live="polite"><span>Chargeable weight</span><b id="qOut">—</b></div>
        <p class="cd-note">Volumetric = L × W × H (cm) ÷ 5000. Final rules follow the service used. We confirm the exact price on request.</p>
        <div class="cd-actions"><a id="qWa" class="btn-main btn-red" target="_blank" rel="noopener" href="#"><i class="fa-brands fa-whatsapp"></i> Request quote on WhatsApp</a>
        <a class="btn-main cd-ghost" href="index.html?dest=${encodeURIComponent(d.n)}#quote">Full quote form</a></div></div>
    </div></div></section>

  ${sec('docs', 'Documents, customs & duties', `
    <div class="cd-grid2"><div class="cd-card"><div class="cd-tabs" role="tablist"><button class="on" data-t="p" role="tab" aria-selected="true">Personal</button><button data-t="b" role="tab" aria-selected="false">Commercial</button></div>
      <div data-p="p">${ul(['Sender and recipient name, address, phone', 'Description of contents', 'Declared value', 'ID where required'])}</div>
      <div data-p="b" hidden>${ul(['Commercial invoice', 'Packing list', 'Export documentation', 'Product details / HS code where applicable', 'Other destination or carrier documents'])}</div></div>
      <div class="cd-card"><h3><i class="fa-solid fa-stamp"></i> Customs in ${d.n}</h3><p>${d.cu}</p>
        <h3 class="mt-3"><i class="fa-solid fa-receipt"></i> Duties & taxes</h3><p>Shipping charges, customs duties, import taxes and clearance fees are different. Who pays depends on the arrangement for your shipment. Rules change, so confirm before booking.</p></div></div>`)}

  ${sec('restrict', `Restricted & prohibited items for ${d.n}`, `
    <div class="cd-grid3">
      <div class="cd-card cd-bad"><h3><i class="fa-solid fa-ban"></i> Prohibited</h3>${ul(['Cash and negotiable instruments', 'Weapons and explosives', 'Illegal drugs and counterfeit goods', 'Hazardous or flammable materials'], 'fa-xmark')}</div>
      <div class="cd-card cd-warn"><h3><i class="fa-solid fa-triangle-exclamation"></i> Restricted</h3>${ul(['Batteries and electronics', 'Liquids, cosmetics and aerosols', 'Food and medicines', 'Valuables'], 'fa-circle-exclamation')}<p class="cd-note">May need conditions or documents.</p></div>
      <div class="cd-card cd-dest"><h3><i class="fa-solid fa-location-crosshairs"></i> Specific to ${d.n}</h3>${ul(d.rs, 'fa-flag')}</div></div>
    <p class="cd-note mt-3">Always check JP Express’s current restricted-items policy before booking. We are not a customs authority.</p>`, 1)}

  ${sec('delivery', 'Pickup, packaging, tracking & delivery', `
    <div class="cd-grid2x">
      <div class="cd-card"><h3><i class="fa-solid fa-truck-pickup"></i> Pickup in Bangladesh</h3><p>Request home, office or business pickup, or ask about drop-off. Availability depends on your area; we confirm when you request a quote.</p></div>
      <div class="cd-card"><h3><i class="fa-solid fa-box"></i> Packaging</h3><p>Use a strong box, cushion fragile items, seal liquids and label clearly with full recipient details.</p></div>
      <div class="cd-card"><h3><i class="fa-solid fa-location-dot"></i> Tracking</h3><form action="track-shipment.html" method="get" class="cd-track"><label class="visually-hidden" for="tk">Tracking number</label><input id="tk" name="tracking" placeholder="Tracking number" required><button class="btn-main btn-red" type="submit">Track</button></form></div>
      <div class="cd-card"><h3><i class="fa-solid fa-house-circle-check"></i> Delivery in ${d.n}</h3><p>${d.ch}</p><p class="cd-cities"><b>Cities:</b> ${d.ci}</p></div></div>`)}

  ${sec('business', `Business shipping to ${d.n}`, `
    <div class="cd-biz"><div><p>Exporters, manufacturers, e-commerce brands, buying houses and SMEs can ship samples and commercial cargo with documentation and customs support.</p>
      <div class="cd-tags">${d.ind.map(i => `<a href="industries.html">${i}</a>`).join('')}</div></div>
      <a class="btn-main btn-red" target="_blank" rel="noopener" href="${ask(`Hi JP Express, I need a business shipping quote from Bangladesh to ${d.n}.`)}">Request Business Quote</a></div>`, 1)}

  ${sec('faq', `${d.n} shipping FAQs`, `<div class="accordion" id="cdFaq">${faqs.map((f, i) => `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button${i ? ' collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#f${i}" aria-expanded="${!i}" aria-controls="f${i}">${f[0]}</button></h3><div id="f${i}" class="accordion-collapse collapse${i ? '' : ' show'}" data-bs-parent="#cdFaq"><div class="accordion-body">${f[1]}</div></div></div>`).join('')}</div>`)}

  <section class="pg-sec pg-alt cx"><div class="container-fluid"><h2 class="pg-h">Other destinations</h2>
    <div class="ctr-grid">${related.map(s => { const c = COUNTRY_DATA[s]; return `<a class="ctr-card" href="country.html?c=${s}"><span class="ctr-card-top">${flag(c.c, 44)}<span><strong>${c.n}</strong><small>${c.r}</small></span></span><span class="ctr-card-meta"><span><i class="fa-regular fa-clock"></i> ${c.t}</span></span><span class="ctr-card-go">View guide <i class="fa-solid fa-arrow-right"></i></span></a>`; }).join('')}</div>
    <div class="cd-res"><a href="resources.html">Shipping guide</a><a href="resources.html">Customs guide</a><a href="resources.html">Restricted items</a><a href="resources.html">Export documentation</a><a href="countries.html">All destinations</a></div></div></section>

  <section class="final-cta"><div class="container-fluid"><div class="cta-inner"><div class="cta-copy"><h2>Ready to ship to ${d.n}?</h2><p>Get a quote or talk to our team about your shipment.</p></div>
    <div class="cta-actions"><a class="btn-main btn-white" href="#quote">Get a Quote</a><a class="btn-main btn-white-outline" target="_blank" rel="noopener" href="${ask(`Hi JP Express, I want to ship to ${d.n}.`)}">WhatsApp</a></div></div></div></section>`;

  /* ---------- SEO (title, meta, canonical, JSON-LD) ---------- */
  const title = `Shipping from Bangladesh to ${d.n} | JP Express`;
  const desc = `Courier and freight from Bangladesh to ${d.n}: services, estimated ${d.t} transit, documents, customs notes, restricted items and a quote path.`;
  const url = `https://www.jpex.com.bd/country.html?c=${slug}`;
  document.title = title;
  const meta = (sel, attr, val) => { const e = document.querySelector(sel); if (e) e.setAttribute(attr, val); };
  meta('meta[name="description"]', 'content', desc); meta('link[rel="canonical"]', 'href', url);
  meta('meta[property="og:title"]', 'content', title); meta('meta[property="og:description"]', 'content', desc); meta('meta[property="og:url"]', 'content', url);
  const ld = o => { const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(o); document.head.appendChild(s); };
  ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', 'index.html'], ['Countries', 'countries.html'], [d.n, 'country.html?c=' + slug]].map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: 'https://www.jpex.com.bd/' + x[1] })) });
  ld({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } })) });
  ld({ '@context': 'https://schema.org', '@type': 'Service', name: `International shipping from Bangladesh to ${d.n}`, provider: { '@type': 'Organization', name: 'JP Express', telephone: '+8801681637836' }, areaServed: d.n });

  /* ---------- Interactions ---------- */
  const $ = id => document.getElementById(id);
  const f = ['qW', 'qL', 'qWd', 'qH', 'qType', 'qSvc'].map($);
  function calc() {
    const n = i => parseFloat(f[i].value) || 0;
    const vol = n(1) * n(2) * n(3) / 5000, ch = Math.max(n(0), vol);
    $('qOut').textContent = ch ? ch.toFixed(2) + ' kg' : '—';
    const dims = n(1) && n(2) && n(3) ? `${n(1)}×${n(2)}×${n(3)} cm` : 'not provided';
    $('qWa').href = ask(`Hi JP Express, I'd like a quote.\nRoute: Bangladesh → ${d.n}\nType: ${f[4].value}\nService: ${f[5].value}\nWeight: ${n(0) || 'not provided'} kg\nDimensions: ${dims}\nChargeable weight: ${ch ? ch.toFixed(2) + ' kg' : 'n/a'}`);
  }
  f.forEach(e => e.addEventListener('input', calc)); calc();
  $('qForm').addEventListener('submit', e => e.preventDefault());

  root.querySelectorAll('.cd-tabs button').forEach(b => b.addEventListener('click', () => {
    const box = b.closest('.cd-card');
    box.querySelectorAll('.cd-tabs button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    box.querySelectorAll('[data-p]').forEach(p => p.hidden = p.dataset.p !== b.dataset.t);
  }));

  // Scroll-spy for the sticky section nav
  const links = [...root.querySelectorAll('#cdNav a')];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => {
        const on = a.getAttribute('href') === '#' + e.target.id;
        a.classList.toggle('on', on);
        if (on) a.parentElement.scrollTo({ left: a.offsetLeft - 24, behavior: 'smooth' });
      });
    }), { rootMargin: '-35% 0px -60% 0px' });
    nav.forEach(n => { const s = $(n[0]); if (s) spy.observe(s); });
    const rev = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { threshold: 0.08 });
    root.querySelectorAll('.cx').forEach(s => rev.observe(s));
  } else root.querySelectorAll('.cx').forEach(s => s.classList.add('in'));
})();

/* =========================================================
   CONSOLIDATED MODULE: blog.js
   ========================================================= */
(function () {
  'use strict';
  const grid = document.getElementById('blGrid');
  if (!grid || typeof BLOG_POSTS === 'undefined') return;

  const $ = id => document.getElementById(id);
  const search = $('blSearch'), clear = $('blClear'), sortSel = $('blSort'), chips = $('blChips'),
        count = $('blCount'), more = $('blMore'), empty = $('blEmpty'), featWrap = $('blFeatWrap');
  const PAGE = 6;
  const params = new URLSearchParams(location.search);
  let cat = BLOG_CATS[params.get('cat')] ? params.get('cat') : 'all';
  let q = (params.get('q') || '').trim();
  let limit = PAGE;
  search.value = q;

  const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const meta = p => `<div class="bl-meta"><span>${BLOG_CATS[p.c]}</span><time datetime="${p.d}">${fmt(p.d)}</time><span>${p.r} min read</span></div>`;
  const card = p => `<article class="bl-card"><div class="bl-art t-${p.k}"><i class="fa-solid ${p.i}" aria-hidden="true"></i></div>
    <div class="bl-body">${meta(p)}<h3>${p.t}</h3><p>${p.x}</p>
    <a class="bl-link" href="${p.h}">${p.a} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i><span class="visually-hidden">: ${p.t}</span></a></div></article>`;

  // Stats (computed from real data, no invented numbers)
  const used = Object.keys(BLOG_CATS).filter(k => BLOG_POSTS.some(p => p.c === k));
  $('blStats').textContent = BLOG_POSTS.length + ' articles · ' + used.length + ' topics';

  // Category chips
  chips.innerHTML = [['all', 'All Articles', BLOG_POSTS.length]].concat(used.map(k => [k, BLOG_CATS[k], BLOG_POSTS.filter(p => p.c === k).length]))
    .map(c => `<button type="button" class="bl-chip" data-c="${c[0]}" aria-pressed="false">${c[1]} <b>${c[2]}</b></button>`).join('');

  // Featured
  const f = BLOG_POSTS.find(p => p.f);
  if (f) $('blFeat').innerHTML = `<div class="bl-feat"><div class="bl-feat-art t-${f.k}"><span>FEATURED · ${BLOG_CATS[f.c].toUpperCase()}</span><i class="fa-solid ${f.i}" aria-hidden="true"></i>
    <div class="bl-route"><b>DAC</b><i class="fa-solid fa-arrow-right" aria-hidden="true"></i><b>WORLD</b></div></div>
    <div class="bl-feat-copy">${meta(f)}<h2>${f.t}</h2><p>${f.fx || f.x}</p>
    <a class="btn-main btn-red" href="${f.h}">${f.a} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
    <div class="bl-share" aria-label="Share"><a href="https://wa.me/?text=${encodeURIComponent(f.t + ' ' + location.href.split('#')[0])}" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href.split('#')[0])}" target="_blank" rel="noopener" aria-label="Share on LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href.split('#')[0])}" target="_blank" rel="noopener" aria-label="Share on Facebook"><i class="fa-brands fa-facebook-f"></i></a>
    <button type="button" id="blCopy" aria-label="Copy link"><i class="fa-solid fa-link"></i></button></div></div></div>`;

  function render() {
    const s = q.toLowerCase(), filtering = !!s || cat !== 'all';
    const list = BLOG_POSTS.filter(p => (cat === 'all' || p.c === cat) && (!s || (p.t + ' ' + p.x + ' ' + p.q + ' ' + BLOG_CATS[p.c]).toLowerCase().includes(s)) && (filtering || !p.f));
    list.sort(sortSel.value === 'read' ? (a, b) => a.r - b.r : (a, b) => b.d.localeCompare(a.d));
    const shown = list.slice(0, limit);
    grid.innerHTML = shown.map(card).join('');
    count.textContent = list.length ? `Showing ${shown.length} of ${list.length} article${list.length === 1 ? '' : 's'}` : '';
    empty.hidden = list.length > 0;
    more.hidden = shown.length >= list.length;
    clear.hidden = !q;
    if (featWrap) featWrap.hidden = filtering || !f;
    chips.querySelectorAll('.bl-chip').forEach(b => { const on = b.dataset.c === cat; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
    const u = new URLSearchParams(); if (cat !== 'all') u.set('cat', cat); if (q) u.set('q', q);
    history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash);
  }

  chips.addEventListener('click', e => { const b = e.target.closest('.bl-chip'); if (!b) return; cat = b.dataset.c; limit = PAGE; render(); });
  search.addEventListener('input', () => { q = search.value.trim(); limit = PAGE; render(); });
  clear.addEventListener('click', () => { search.value = ''; q = ''; render(); search.focus(); });
  sortSel.addEventListener('change', render);
  more.addEventListener('click', () => { limit += PAGE; render(); });
  $('blReset').addEventListener('click', () => { search.value = ''; q = ''; cat = 'all'; limit = PAGE; render(); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('#blCopy'); if (!b || !navigator.clipboard) return;
    navigator.clipboard.writeText(location.href.split('#')[0]).then(() => {
      b.innerHTML = '<i class="fa-solid fa-check"></i>'; setTimeout(() => { b.innerHTML = '<i class="fa-solid fa-link"></i>'; }, 1500);
    });
  });

  // Blog structured data
  const s = document.createElement('script'); s.type = 'application/ld+json';
  s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Blog', name: 'JP Express Shipping & Logistics Blog', url: 'https://www.jpex.com.bd/blog.html',
    publisher: { '@type': 'Organization', name: 'JP Express' },
    blogPost: BLOG_POSTS.map(p => ({ '@type': 'BlogPosting', headline: p.t, description: p.x, datePublished: p.d, articleSection: BLOG_CATS[p.c], author: { '@type': 'Organization', name: 'JP Express' } })) });
  document.head.appendChild(s);

  render();
})();

/* =========================================================
   CONSOLIDATED MODULE: resources.js
   ========================================================= */
(function () {
"use strict";

/* ---------- Sticky category nav: smooth scroll + scrollspy ---------- */
var catlinks = Array.from(document.querySelectorAll('.res-catlink'));
var sections = catlinks
  .map(function (l) { return document.querySelector(l.getAttribute('href')); })
  .filter(Boolean);

if (catlinks.length && sections.length && 'IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = '#' + entry.target.id;
        catlinks.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(function (s) { io.observe(s); });
}

/* ---------- Hero search: filters guide/article cards by title ---------- */
var heroSearch = document.getElementById('resHeroSearch');
if (heroSearch) {
  heroSearch.addEventListener('input', function () {
    var q = heroSearch.value.trim().toLowerCase();
    document.querySelectorAll('.res-card[data-title]').forEach(function (card) {
      var match = !q || card.getAttribute('data-title').toLowerCase().indexOf(q) !== -1;
      card.style.display = match ? '' : 'none';
    });
  });
}

/* ---------- Transit time table search ---------- */
var tableSearch = document.getElementById('resTransitSearch');
var tableBody = document.getElementById('resTransitBody');
var tableEmpty = document.getElementById('resTransitEmpty');
if (tableSearch && tableBody) {
  tableSearch.addEventListener('input', function () {
    var q = tableSearch.value.trim().toLowerCase();
    var rows = Array.from(tableBody.querySelectorAll('tr'));
    var visible = 0;
    rows.forEach(function (row) {
      var match = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (tableEmpty) tableEmpty.style.display = visible ? 'none' : 'block';
  });
}

})();

/* =========================================================
   CONSOLIDATED MODULE: pricing.js
   ========================================================= */
/* =========================================================
   JP EXPRESS: PRICING / SHIPPING CALCULATOR
   Calculates actual, volumetric and chargeable weight.
   A price is shown ONLY when real rates are added to
   CONFIG.rates below. Until then the result is "Quote Required".
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- BUSINESS RULES (edit these) ---------------- */
  var CONFIG = {
    currency: "৳",
    ratesNote: "",          // e.g. "Rates effective 1 Nov 2026, valid for 30 days"
    roundStep: 0,           // chargeable-weight rounding in kg (0 = no rounding, 0.5 = nearest 0.5 kg up)
    maxCourierKg: 70,       // above this, manual quote
    maxSideCm: 120,         // any side above this, manual quote
    /* CONFIRM these divisors with JP Express / the carrier. Common industry values shown. */
    divisors: { courier: 5000, air: 6000 },

    /* Add real rates to switch estimates on. Keys are lowercase.
       Example:
       rates: {
         courier: {
           "united states": { base: 0, perKg: 0, fuelPct: 0, transit: "4–6 business days" }
         }
       }
    */
    rates: null
  };

  var SERVICES = {
    courier: "International Courier",
    air: "Air Freight",
    sea: "Sea Freight"
  };
  var MODES = {
    document:   { label: "Document",   services: ["courier"],               dims: false, quote: false, hint: "For letters and paperwork. Dimensions are not needed." },
    parcel:     { label: "Parcel",     services: ["courier", "air"],        dims: true,  quote: false, hint: "For personal parcels and gifts." },
    commercial: { label: "Commercial", services: ["courier", "air", "sea"], dims: true,  quote: true,  hint: "Commercial shipments are normally priced by quote." },
    freight:    { label: "Freight",    services: ["air", "sea"],            dims: true,  quote: true,  hint: "Larger cargo is priced by quote." }
  };

  /* ---------------- helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var form = $("prcForm");
  if (!form) return;

  var els = {
    to: $("prcTo"), service: $("prcService"), weight: $("prcWeight"),
    l: $("prcL"), w: $("prcW"), h: $("prcH"), pcs: $("prcPcs"),
    dims: $("prcDims"), hint: $("prcHint"), err: $("prcError"), result: $("prcResult")
  };
  var placeholder = els.result.innerHTML;
  var calculated = false;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function kg(n) { return (Math.round(n * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " kg"; }
  function money(n) { return CONFIG.currency + " " + Math.round(n).toLocaleString("en-US"); }
  function mode() { return MODES[form.elements.mode.value]; }

  /* ---------------- mode handling ---------------- */
  function applyMode() {
    var m = mode();
    var prev = els.service.value;
    els.service.innerHTML = m.services.map(function (k) {
      return '<option value="' + k + '">' + SERVICES[k] + "</option>";
    }).join("");
    if (m.services.indexOf(prev) > -1) els.service.value = prev;
    els.dims.hidden = !m.dims;
    els.hint.textContent = m.hint;
    els.err.hidden = true;
    if (calculated) run();
  }

  /* ---------------- calculation ---------------- */
  function read() {
    var num = function (el) { var v = parseFloat(el.value); return isNaN(v) ? 0 : v; };
    return {
      mode: form.elements.mode.value, svc: els.service.value, dest: els.to.value.trim(),
      weight: num(els.weight), l: num(els.l), w: num(els.w), h: num(els.h),
      pcs: Math.max(parseInt(els.pcs.value, 10) || 1, 1)
    };
  }

  function validate(d) {
    var m = MODES[d.mode];
    if (!d.dest) return "Please enter the destination country.";
    if (!(d.weight > 0)) return "Please enter the shipment weight in kg.";
    if (m.dims) {
      var filled = [d.l, d.w, d.h].filter(function (x) { return x > 0; }).length;
      if (filled > 0 && filled < 3) return "Enter length, width and height together, or leave all three empty.";
      if (d.svc === "sea" && filled < 3) return "Sea freight needs dimensions so we can work out volume (CBM).";
    }
    return "";
  }

  function compute(d) {
    var m = MODES[d.mode];
    var hasDims = m.dims && d.l > 0 && d.w > 0 && d.h > 0;
    var cm3 = hasDims ? d.l * d.w * d.h * d.pcs : 0;
    var divisor = CONFIG.divisors[d.svc];
    var vol = hasDims && divisor ? cm3 / divisor : 0;
    var cw = Math.max(d.weight, vol);
    if (CONFIG.roundStep > 0) cw = Math.ceil(cw / CONFIG.roundStep) * CONFIG.roundStep;

    var reasons = [];
    if (m.quote) reasons.push("Commercial and freight shipments are priced by quote.");
    if (d.svc === "sea") reasons.push("Sea freight is priced by volume and route, so a quote is needed.");
    if (d.svc === "courier" && cw > CONFIG.maxCourierKg) reasons.push("Shipments over " + CONFIG.maxCourierKg + " kg need a manual review.");
    if (hasDims && Math.max(d.l, d.w, d.h) > CONFIG.maxSideCm) reasons.push("Large dimensions need a manual review.");

    var rate = null;
    if (!reasons.length && CONFIG.rates && CONFIG.rates[d.svc]) {
      rate = CONFIG.rates[d.svc][d.dest.toLowerCase()] || null;
    }
    if (!reasons.length && !rate) reasons.push("We need to review your shipment details to provide an accurate quote.");

    var out = { d: d, vol: vol, cw: cw, cbm: cm3 / 1000000, hasDims: hasDims, reasons: reasons, rate: rate };
    if (rate && !reasons.length) {
      var sub = (rate.base || 0) + (rate.perKg || 0) * cw;
      var fuel = sub * ((rate.fuelPct || 0) / 100);
      out.base = rate.base || 0; out.weightCharge = (rate.perKg || 0) * cw;
      out.fuelPct = rate.fuelPct || 0; out.fuel = fuel; out.total = sub + fuel;
    }
    return out;
  }

  /* ---------------- render ---------------- */
  function row(label, value) {
    return '<div class="prc-kv"><span>' + label + "</span><strong>" + value + "</strong></div>";
  }

  function render(r) {
    var d = r.d, estimated = r.total !== undefined;
    var wa = "Hello JP Express, I'd like a shipping quote.\n" +
      "Shipment type: " + MODES[d.mode].label + "\nService: " + SERVICES[d.svc] + "\nDestination: " + d.dest +
      "\nActual weight: " + kg(d.weight) + "\nChargeable weight: " + kg(r.cw) +
      (r.hasDims ? "\nSize: " + d.l + " x " + d.w + " x " + d.h + " cm x " + d.pcs + " pc" : "");

    var head = estimated
      ? '<span class="prc-badge is-est">Estimated</span><div class="prc-price">' + money(r.total) + '</div><p class="prc-sub">Estimated shipping cost. Final price is confirmed in your quote.</p>'
      : '<span class="prc-badge is-quote">Quote Required</span><div class="prc-price prc-price--quote">Request a Quote</div><p class="prc-sub">' + esc(r.reasons[0]) + "</p>";

    var rows = row("Service", esc(SERVICES[d.svc])) + row("Destination", esc(d.dest)) +
      row("Actual weight", kg(d.weight)) +
      (r.hasDims ? (d.svc === "sea" ? row("Volume", (Math.round(r.cbm * 1000) / 1000) + " CBM") : row("Volumetric weight", kg(r.vol))) : "") +
      row("Chargeable weight", kg(r.cw)) +
      row("Estimated transit", r.rate && r.rate.transit ? esc(r.rate.transit) : "Confirmed in quote");

    var breakdown = estimated
      ? '<div class="prc-break"><h4>Breakdown</h4>' + row("Base charge", money(r.base)) + row("Weight charge", money(r.weightCharge)) +
        (r.fuelPct ? row("Fuel surcharge (" + r.fuelPct + "%)", money(r.fuel)) : "") + row("Total (estimate)", money(r.total)) + "</div>"
      : "";

    els.result.innerHTML =
      '<div class="prc-res">' + head + '<div class="prc-kvs">' + rows + "</div>" + breakdown +
      '<p class="prc-fine"><i class="fa-solid fa-circle-info"></i> Duties, taxes, customs charges and extra services are not included unless stated in your quote.' +
      (CONFIG.ratesNote ? " " + esc(CONFIG.ratesNote) : "") + "</p>" +
      '<div class="prc-cta">' +
      '<a class="btn-main btn-red" href="index.html#quote">Request a Quote <i class="fa-solid fa-arrow-right"></i></a>' +
      '<a class="btn-main btn-dark-outline prc-wa" target="_blank" rel="noopener" href="https://wa.me/8801681637836?text=' + encodeURIComponent(wa) + '"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>' +
      '<a class="prc-call" href="tel:+8801681637836"><i class="fa-solid fa-phone"></i> Call us</a></div></div>';
  }

  function run() {
    var d = read();
    var msg = validate(d);
    els.err.hidden = !msg;
    els.err.textContent = msg;
    if (msg) return false;
    render(compute(d));
    calculated = true;
    return true;
  }

  /* ---------------- events ---------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (run() && window.matchMedia("(max-width: 991px)").matches) {
      els.result.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  });
  form.addEventListener("reset", function () {
    calculated = false;
    setTimeout(function () { els.result.innerHTML = placeholder; applyMode(); }, 0);
  });
  form.addEventListener("change", function (e) {
    if (e.target.name === "mode") applyMode(); else if (calculated) run();
  });
  form.addEventListener("input", function () { if (calculated) run(); });

  applyMode();
})();

/* =========================================================
   CONSOLIDATED MODULE: tracking.js
   ========================================================= */
(function () {
"use strict";

/* ============ DEMO DATA ============ */
/* Replace this block with a real API call (fetch) once the backend endpoint exists.
   Keying is uppercase tracking number -> shipment record. */
const STAGES = ['Order Received', 'Picked Up', 'In Transit', 'Customs', 'Out for Delivery', 'Delivered'];

const DEMO_SHIPMENTS = {
  'JPE123456789': {
    status: 'In Transit', badgeClass: 'st-transit', currentStage: 2,
    sender: 'Anisur Rahman', receiver: 'Michael Carter',
    origin: 'Bangladesh — Dhaka', destination: 'United States — New York',
    service: 'International Courier', weight: '2.4 kg', booked: 'Aug 14, 2026', eta: 'Aug 24, 2026',
    history: [
      { title: 'In Transit', date: 'Aug 16, 2026 · 6:15 PM', location: 'Hazrat Shahjalal Intl Airport, Dhaka', note: 'Departed origin facility, en route to transit hub.' },
      { title: 'Picked Up', date: 'Aug 15, 2026 · 9:40 AM', location: 'Gulshan-1, Dhaka', note: 'Parcel collected from sender address.' },
      { title: 'Order Received', date: 'Aug 14, 2026 · 11:20 AM', location: 'Dhaka HQ', note: 'Shipment booked and confirmed.' }
    ],
    notifications: [
      { tag: 'delivery_alert', alert: true, title: 'In Transit Update', text: 'Your shipment has left Dhaka and is en route to the transit hub.', time: 'Aug 16, 2026 · 6:20 PM' },
      { tag: 'info', title: 'Pickup Confirmed', text: 'Our courier collected your parcel successfully.', time: 'Aug 15, 2026 · 9:45 AM' }
    ],
    proof: { delivered: false }
  },
  'JPE998877665': {
    status: 'Customs', badgeClass: 'st-customs', currentStage: 3,
    sender: 'Shirin Akter', receiver: 'Oliver Bennett',
    origin: 'Bangladesh — Dhaka', destination: 'United Kingdom — London',
    service: 'International Courier', weight: '1.1 kg', booked: 'Aug 12, 2026', eta: 'Aug 21, 2026',
    history: [
      { title: 'Customs', date: 'Aug 19, 2026 · 2:05 PM', location: 'London Gateway Customs', note: 'Shipment held for routine customs clearance.' },
      { title: 'In Transit', date: 'Aug 17, 2026 · 8:30 AM', location: 'Dhaka → London', note: 'Departed origin facility.' },
      { title: 'Picked Up', date: 'Aug 13, 2026 · 10:15 AM', location: 'Chattogram', note: 'Parcel collected from sender address.' },
      { title: 'Order Received', date: 'Aug 12, 2026 · 4:50 PM', location: 'Dhaka HQ', note: 'Shipment booked and confirmed.' }
    ],
    notifications: [
      { tag: 'delivery_alert', alert: true, title: 'Customs Hold', text: 'Your parcel is undergoing routine customs clearance.', time: 'Aug 19, 2026 · 2:10 PM' }
    ],
    proof: { delivered: false }
  },
  'JPE554433221': {
    status: 'Delivered', badgeClass: 'st-delivered', currentStage: 5,
    sender: 'Rahim Khan', receiver: 'Sara Al Marri',
    origin: 'Bangladesh — Dhaka', destination: 'UAE — Dubai',
    service: 'Air Freight', weight: '5.8 kg', booked: 'Aug 9, 2026', eta: 'Delivered Aug 17, 2026',
    history: [
      { title: 'Delivered', date: 'Aug 17, 2026 · 1:40 PM', location: 'Al Barsha, Dubai', note: 'Parcel delivered and signed for by receiver.' },
      { title: 'Out for Delivery', date: 'Aug 17, 2026 · 9:00 AM', location: 'Dubai Local Hub', note: 'With courier for final delivery.' },
      { title: 'Customs', date: 'Aug 15, 2026 · 3:20 PM', location: 'Dubai Customs', note: 'Cleared customs successfully.' },
      { title: 'In Transit', date: 'Aug 11, 2026 · 7:00 AM', location: 'Dhaka → Dubai', note: 'Departed origin facility.' },
      { title: 'Picked Up', date: 'Aug 9, 2026 · 2:30 PM', location: 'Sylhet', note: 'Parcel collected from sender address.' },
      { title: 'Order Received', date: 'Aug 9, 2026 · 10:05 AM', location: 'Dhaka HQ', note: 'Shipment booked and confirmed.' }
    ],
    notifications: [
      { tag: 'delivery_alert', alert: true, title: 'Delivered', text: 'Your parcel was delivered successfully. Thank you for shipping with JP Express!', time: 'Aug 17, 2026 · 1:45 PM' }
    ],
    proof: {
      delivered: true,
      receivedBy: 'Sara Al Marri',
      deliveredAt: 'Aug 17, 2026 · 1:40 PM',
      location: 'Al Barsha, Dubai',
      note: 'Parcel left with receiver at front door. ID verified by courier.'
    }
  }
};

/* Deterministic fallback so ANY tracking number typed in the demo still renders a result. */
function buildFallback(id) {
  const seed = Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const stageIdx = seed % 5; // 0..4, avoid always "Delivered"
  const labels = ['st-pending', 'st-pending', 'st-transit', 'st-customs', 'st-transit'];
  return {
    status: STAGES[stageIdx], badgeClass: labels[stageIdx], currentStage: stageIdx,
    sender: 'Demo Sender', receiver: 'Demo Receiver',
    origin: 'Bangladesh — Dhaka', destination: 'Demo Destination Country',
    service: 'International Courier', weight: '1.8 kg', booked: 'Aug 12, 2026', eta: 'Aug 22, 2026',
    history: STAGES.slice(0, stageIdx + 1).reverse().map((s, i) => ({
      title: s, date: 'Aug ' + (12 + stageIdx - i) + ', 2026 · 10:00 AM', location: 'Dhaka HQ', note: s + ' stage update.'
    })),
    notifications: [
      { tag: 'info', title: 'Status Update', text: 'This is demo tracking data for an unrecognized ID.', time: 'Just now' }
    ],
    proof: { delivered: false }
  };
}

/* ============ RENDER ============ */
const els = {
  input: document.getElementById('trkInput'),
  form: document.getElementById('trkSearchForm'),
  content: document.getElementById('trkContent'),
  empty: document.getElementById('trkEmpty'),
  parcelId: document.getElementById('trkParcelId'),
  badge: document.getElementById('trkBadge'),
  badgeText: document.getElementById('trkBadgeText'),
  eta: document.getElementById('trkEta'),
  stageList: document.getElementById('trkStageList'),
  stageFill: document.getElementById('trkStageFill'),
  histList: document.getElementById('trkHistList'),
  histCount: document.getElementById('trkHistCount'),
  proofBody: document.getElementById('trkProofBody'),
  infoList: document.getElementById('trkInfoList'),
  notifList: document.getElementById('trkNotifList')
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function renderStages(currentStage) {
  els.stageList.innerHTML = STAGES.map((s, i) =>
    '<li class="' + (i <= currentStage ? 'done' : '') + '"><span class="t-dot"><i class="bi bi-check"></i></span><span class="t-lbl">' + s + '</span></li>'
  ).join('');
  const pct = (currentStage / (STAGES.length - 1)) * 100;
  const isMobile = window.innerWidth < 768;
  if (els.stageFill) { isMobile ? els.stageFill.style.height = pct + '%' : els.stageFill.style.width = pct + '%'; }
}

function renderHistory(history, pendingStages) {
  els.histCount.textContent = history.length + pendingStages.length;
  const done = history.map((h, i) =>
    '<li class="is-done' + (i === 0 ? ' is-current' : '') + '">' +
      '<div class="trk-hist-title">' + escapeHtml(h.title) + '</div>' +
      '<div class="trk-hist-meta"><span><i class="bi bi-calendar3"></i>' + escapeHtml(h.date) + '</span><span><i class="bi bi-geo-alt-fill"></i>' + escapeHtml(h.location) + '</span></div>' +
      '<div class="trk-hist-note"><i class="bi bi-chat-left-text"></i>' + escapeHtml(h.note) + '</div>' +
    '</li>'
  ).join('');
  const pending = pendingStages.map(s =>
    '<li class="is-pending">' +
      '<div class="trk-hist-title">' + escapeHtml(s) + '</div>' +
      '<div class="trk-hist-meta"><span><i class="bi bi-hourglass-split"></i>Pending</span></div>' +
    '</li>'
  ).join('');
  els.histList.innerHTML = done + pending;
}

function renderInfo(id, data) {
  const rows = [
    ['Parcel ID', id], ['Sender Name', data.sender], ['Receiver Name', data.receiver],
    ['Origin', data.origin], ['Destination', data.destination],
    ['Service', data.service], ['Weight', data.weight], ['Booked On', data.booked]
  ];
  els.infoList.innerHTML = rows.map(r => '<li><span class="lbl">' + r[0] + '</span><span class="val">' + escapeHtml(r[1]) + '</span></li>').join('');
}

function renderNotifications(list) {
  els.notifList.innerHTML = list.map(n =>
    '<li><span class="trk-notif-tag' + (n.alert ? ' tag-alert' : '') + '">' + escapeHtml(n.tag) + '</span>' +
      '<strong>' + escapeHtml(n.title) + '</strong>' +
      '<p>' + escapeHtml(n.text) + '</p>' +
      '<time>' + escapeHtml(n.time) + '</time></li>'
  ).join('');
}

function renderProof(data) {
  if (!els.proofBody) return;
  const p = data.proof;
  if (p && p.delivered) {
    els.proofBody.innerHTML =
      '<div class="trk-proof-grid">' +
        '<div class="trk-proof-tile"><i class="bi bi-camera-fill"></i><span>Delivery Photo Captured</span></div>' +
        '<div class="trk-proof-tile"><i class="bi bi-pen-fill"></i><span>Signature Captured</span></div>' +
      '</div>' +
      '<ul class="trk-info-list">' +
        '<li><span class="lbl">Received By</span><span class="val">' + escapeHtml(p.receivedBy) + '</span></li>' +
        '<li><span class="lbl">Delivered On</span><span class="val">' + escapeHtml(p.deliveredAt) + '</span></li>' +
        '<li><span class="lbl">Location</span><span class="val">' + escapeHtml(p.location) + '</span></li>' +
      '</ul>' +
      '<div class="trk-hist-note mt-2"><i class="bi bi-chat-left-text"></i>' + escapeHtml(p.note) + '</div>';
  } else {
    els.proofBody.innerHTML =
      '<div class="trk-proof-empty"><i class="bi bi-hourglass-split"></i>' +
      '<p>Delivery proof — photo &amp; signature — will appear here once this parcel is marked <strong>Delivered</strong>.</p></div>';
  }
}

function badgeIcon(status) {
  if (status === 'Delivered') return 'bi-patch-check-fill';
  if (status === 'Customs') return 'bi-clipboard2-check';
  if (status === 'Out for Delivery') return 'bi-truck';
  return 'bi-geo-alt-fill';
}

function renderShipment(id, data) {
  els.empty.classList.add('d-none');
  els.content.classList.remove('d-none');
  els.parcelId.textContent = id;
  els.badge.className = 'trk-badge ' + data.badgeClass;
  els.badge.innerHTML = '<span class="dot"></span> ' + escapeHtml(data.status.toUpperCase());
  els.eta.textContent = data.eta;
  renderStages(data.currentStage);
  renderHistory(data.history, STAGES.slice(data.currentStage + 1));
  renderProof(data);
  renderInfo(id, data);
  renderNotifications(data.notifications);
}

function showEmpty() {
  els.content.classList.add('d-none');
  els.empty.classList.remove('d-none');
}

function lookup(rawId) {
  const id = rawId.trim().toUpperCase();
  if (!id) { showEmpty(); return; }
  const data = DEMO_SHIPMENTS[id] || buildFallback(id);
  renderShipment(id, data);
  const url = new URL(window.location);
  url.searchParams.set('tracking', id);
  window.history.replaceState({}, '', url);
}

/* ============ INIT ============ */
const params = new URLSearchParams(window.location.search);
const initial = params.get('tracking') || '';
if (els.input) els.input.value = initial;
if (initial) lookup(initial); else showEmpty();

if (els.form) {
  els.form.addEventListener('submit', e => {
    e.preventDefault();
    lookup(els.input.value);
  });
}

window.addEventListener('resize', () => {
  const id = (els.input && els.input.value) || initial;
  const data = id ? (DEMO_SHIPMENTS[id.toUpperCase()] || buildFallback(id.toUpperCase())) : null;
  if (data) renderStages(data.currentStage);
});

})();

/* =========================================================
   CONSOLIDATED MODULE: contact.js
   ========================================================= */
(function () {
"use strict";

/* =========================================================
   JP EXPRESS - CONTACT PAGE LOGIC
   Load AFTER js/main.js
   ========================================================= */

/* ---------- Settings (edit here) ---------- */
var CONFIG = {
  /* Laravel route that stores the lead, e.g. '/contact'.
     Leave '' until the backend exists: the form then sends the
     inquiry to WhatsApp so no lead is lost. */
  endpoint: '',
  waPhone: '8801681637836',
  openHour: 9,        /* Asia/Dhaka, from the footer: "9am to 11pm" */
  closeHour: 23,
  closedDays: []      /* 0=Sun ... 6=Sat, e.g. [5] if Friday is closed */
};

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* ---------- Request types ---------- */
var INTENTS = {
  general:  { label: 'General Inquiry',  hint: 'Ask us anything about JP Express services.',                                  ph: 'Tell us how we can help',                              show: [] },
  quote:    { label: 'Get a Quote',      hint: 'Tell us what you are shipping and where, and we will prepare a quote.',        ph: 'What are you shipping? Add size or quantity if you know', show: ['company', 'ship', 'dest', 'weight'] },
  pickup:   { label: 'Book Pickup',      hint: 'Add your pickup address and shipment details so we can confirm the pickup.',   ph: 'Preferred pickup date or time, and anything we should know', show: ['ship', 'dest', 'weight', 'pickup'], need: ['pickup'] },
  business: { label: 'Business Inquiry', hint: 'For regular shippers, sellers and companies needing ongoing logistics support.', ph: 'Tell us about your business and shipping needs',      show: ['company', 'ship', 'dest'] },
  export:   { label: 'Export Inquiry',   hint: 'Tell us what you export and where it is going.',                               ph: 'Product, destination and any documents you already have', show: ['company', 'ship', 'dest', 'weight'] },
  import:   { label: 'Import Inquiry',   hint: 'Tell us what you want to import and where it ships from.',                     ph: 'Product, supplier country and quantity',               show: ['company', 'ship', 'dest', 'weight'], destLabel: 'Origin Country' },
  support:  { label: 'Shipment Support', hint: 'Already shipping with us? Add your tracking number so we can find your shipment.', ph: 'What do you need help with?',                       show: ['track'] }
};
var FIELD_ORDER = ['company', 'ship', 'dest', 'weight', 'pickup', 'track'];

/* ---------- Live support hours (Asia/Dhaka) ---------- */
function dhakaNow() {
  try {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: 'numeric', weekday: 'short', hourCycle: 'h23' }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return { h: parseInt(o.hour, 10) % 24, d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
  } catch (e) {
    var n = new Date();
    return { h: n.getHours(), d: n.getDay() };
  }
}
function updateHours() {
  var badge = $('#cntBadge'), text = $('#cntBadgeText'), msg = $('#cntLiveMsg');
  if (!badge || !text || !msg) return;
  var t = dhakaNow();
  var open = CONFIG.closedDays.indexOf(t.d) === -1 && t.h >= CONFIG.openHour && t.h < CONFIG.closeHour;
  badge.className = 'cnt-badge ' + (open ? 'is-open' : 'is-closed');
  text.textContent = open ? 'We are open now' : 'Currently closed';
  msg.textContent = open
    ? 'Our team is available now. Call, WhatsApp or send an inquiry below.'
    : 'We are outside hotline hours. Send an inquiry or a WhatsApp message and we will reply when the team is back at 9:00 AM.';
}
updateHours();
setInterval(updateHours, 60000);

/* ---------- Form ---------- */
var form = $('#cntForm');
if (!form) return;

var hint = $('#cntHint'), msgField = $('#fMsg'), destLabel = $('#lDest');
var submitBtn = $('#cntSubmit'), waBtn = $('#cntWaBtn'), statusEl = $('#cntStatus');
var current = 'general';

function val(id) { var el = document.getElementById(id); return el && !el.closest('[hidden]') ? el.value.trim() : ''; }

function applyIntent(key) {
  if (!INTENTS[key]) key = 'general';
  current = key;
  var cfg = INTENTS[key];
  hint.textContent = cfg.hint;
  msgField.placeholder = cfg.ph;
  destLabel.textContent = cfg.destLabel || 'Destination Country';
  FIELD_ORDER.forEach(function (f) {
    var wrap = $('[data-field="' + f + '"]');
    if (!wrap) return;
    var on = cfg.show.indexOf(f) !== -1;
    wrap.hidden = !on;
    $$('input,select,textarea', wrap).forEach(function (el) { el.disabled = !on; });
    if (!on) wrap.classList.remove('has-error');
  });
  var r = $('input[name="intent"][value="' + key + '"]');
  if (r) r.checked = true;
}
$$('input[name="intent"]').forEach(function (r) {
  r.addEventListener('change', function () { applyIntent(r.value); });
});

/* Prefill from the link: contact.html?intent=quote&dest=Canada */
(function prefill() {
  var q = new URLSearchParams(window.location.search);
  applyIntent(q.get('intent') || 'general');
  if (q.get('dest') && $('#fDest')) $('#fDest').value = q.get('dest').slice(0, 60);
  if (q.get('intent') && window.location.hash !== '#inquiry') {
    var s = $('#inquiry');
    if (s) setTimeout(function () { s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 350);
  }
})();

/* Primary button wording depends on whether a backend is connected */
if (CONFIG.endpoint) {
  waBtn.hidden = false;
} else {
  $('.cnt-btn-label', submitBtn).textContent = 'Send via WhatsApp';
  submitBtn.querySelector('i').className = 'fa-brands fa-whatsapp';
}

/* ---------- Validation ---------- */
function setError(fieldKey, text) {
  var wrap = $('[data-f="' + fieldKey + '"]');
  if (!wrap) return;
  var err = $('.cnt-err', wrap);
  wrap.classList.toggle('has-error', !!text);
  if (err) err.textContent = text || '';
  $$('input,select,textarea', wrap).forEach(function (el) {
    if (text) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  });
}
function setPickupError(text) {
  var wrap = $('[data-field="pickup"]');
  if (!wrap) return;
  wrap.classList.toggle('has-error', !!text);
  $('.cnt-err', wrap).textContent = text || '';
}
function validate() {
  var cfg = INTENTS[current], bad = [];
  var name = $('#fName').value.trim(), phone = $('#fPhone').value.trim();
  var email = $('#fEmail').value.trim(), msg = msgField.value.trim();
  var weight = $('#fWeight').value;

  setError('name',  name.length < 2 ? 'Please enter your name.' : '');
  if (name.length < 2) bad.push('#fName');

  var digits = phone.replace(/\D/g, '');
  var phoneOk = /^[+0-9\s().-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
  setError('phone', phoneOk ? '' : 'Enter a valid phone number, e.g. +880 1XXX XXXXXX.');
  if (!phoneOk) bad.push('#fPhone');

  var emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  setError('email', emailOk ? '' : 'Enter a valid email address.');
  if (!emailOk) bad.push('#fEmail');

  var wOk = !weight || (parseFloat(weight) > 0 && parseFloat(weight) < 100000);
  var wWrap = $('[data-field="weight"]');
  if (wWrap && !wWrap.hidden) {
    wWrap.classList.toggle('has-error', !wOk);
    $('.cnt-err', wWrap).textContent = wOk ? '' : 'Enter a weight above 0.';
    if (!wOk) bad.push('#fWeight');
  }

  if (cfg.need && cfg.need.indexOf('pickup') !== -1) {
    var pk = $('#fPickup').value.trim();
    setPickupError(pk.length < 6 ? 'Please add the pickup address.' : '');
    if (pk.length < 6) bad.push('#fPickup');
  } else {
    setPickupError('');
  }

  setError('message', msg.length < 10 ? 'Please write at least 10 characters.' : '');
  if (msg.length < 10) bad.push('#fMsg');

  var consent = $('#fConsent').checked;
  setError('consent', consent ? '' : 'Please tick the box so we can contact you.');
  if (!consent) bad.push('#fConsent');

  /* focus the first invalid field in page order */
  if (bad.length) {
    var first = bad.map(function (s) { return $(s); }).sort(function (a, b) {
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    })[0];
    if (first) first.focus();
  }
  return bad.length === 0;
}
/* clear an error as soon as the user fixes it */
$$('.cnt-field input,.cnt-field textarea,.cnt-field select', form).forEach(function (el) {
  var evt = el.type === 'checkbox' ? 'change' : 'input';
  el.addEventListener(evt, function () {
    var w = el.closest('.cnt-field');
    if (w && w.classList.contains('has-error')) { w.classList.remove('has-error'); el.removeAttribute('aria-invalid'); }
  });
});

/* ---------- Build the message ---------- */
function collect() {
  return {
    intent: INTENTS[current].label,
    name: $('#fName').value.trim(),
    phone: $('#fPhone').value.trim(),
    email: $('#fEmail').value.trim(),
    company: val('fCompany'),
    shipment_type: val('fShip'),
    country: val('fDest'),
    weight: val('fWeight'),
    pickup_address: val('fPickup'),
    tracking_number: val('fTrack'),
    message: msgField.value.trim()
  };
}
function buildText(d) {
  var rows = [
    ['Request', d.intent], ['Name', d.name], ['Phone', d.phone], ['Email', d.email], ['Company', d.company],
    ['Shipment type', d.shipment_type], [current === 'import' ? 'Origin country' : 'Destination', d.country],
    ['Weight', d.weight ? d.weight + ' kg' : ''], ['Pickup address', d.pickup_address],
    ['Tracking no.', d.tracking_number], ['Message', d.message]
  ];
  return 'Hi JP Express, I would like to send an inquiry.\n' + rows.filter(function (r) { return r[1]; })
    .map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
}
function openWhatsApp(text) {
  var m = encodeURIComponent(text);
  var url = isMobile ? 'https://wa.me/' + CONFIG.waPhone + '?text=' + m
                     : 'https://web.whatsapp.com/send?phone=' + CONFIG.waPhone + '&text=' + m;
  window.open(url, '_blank', 'noopener');
}

/* ---------- Status box ---------- */
function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function showStatus(type, title, body) {
  statusEl.className = 'cnt-status is-' + type;
  statusEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
  statusEl.innerHTML = '<strong></strong><span></span>';
  statusEl.firstChild.textContent = title;
  statusEl.lastChild.innerHTML = body;
  statusEl.hidden = false;
  statusEl.focus({ preventScroll: true });
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function track(intent) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'contact_form_submit', form_id: 'contact', request_type: intent });
}
function setLoading(on) {
  submitBtn.classList.toggle('is-loading', on);
  submitBtn.disabled = on;
}
function resetForm() {
  form.reset();
  applyIntent('general');
  $$('.cnt-field.has-error', form).forEach(function (w) { w.classList.remove('has-error'); });
}

/* ---------- Submit ---------- */
function sendToServer(data) {
  var fd = new FormData(form);
  fd.set('intent', current);
  var token = $('meta[name="csrf-token"]');
  var headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
  if (token) headers['X-CSRF-TOKEN'] = token.getAttribute('content');
  setLoading(true);
  fetch(CONFIG.endpoint, { method: 'POST', headers: headers, body: fd, credentials: 'same-origin' })
    .then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, status: res.status, json: j }; });
    })
    .then(function (r) {
      setLoading(false);
      if (r.ok) {
        track(data.intent);
        if (r.json && r.json.redirect) { window.location.href = r.json.redirect; return; }
        showStatus('success', 'Inquiry received', 'Thank you, ' + esc(data.name.split(' ')[0]) + '. Our team will contact you on ' + esc(data.phone) + '.');
        resetForm();
      } else if (r.status === 422 && r.json && r.json.errors) {
        var first = Object.keys(r.json.errors)[0];
        showStatus('error', 'Please check your details', r.json.errors[first][0]);
      } else {
        showStatus('error', 'We could not send your inquiry', 'Please try again, or <a href="#" id="cntRetryWa">send it on WhatsApp</a>.');
        var a = $('#cntRetryWa');
        if (a) a.addEventListener('click', function (e) { e.preventDefault(); openWhatsApp(buildText(data)); });
      }
    })
    .catch(function () {
      setLoading(false);
      showStatus('error', 'Connection problem', 'Check your internet and try again, or <a href="#" id="cntRetryWa">send it on WhatsApp</a>.');
      var a = $('#cntRetryWa');
      if (a) a.addEventListener('click', function (e) { e.preventDefault(); openWhatsApp(buildText(data)); });
    });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if ($('#fWeb').value) { /* spam bot filled the hidden field */
    showStatus('success', 'Inquiry received', 'Thank you.');
    return;
  }
  if (!validate()) return;
  var data = collect();
  if (CONFIG.endpoint) {
    sendToServer(data);
  } else {
    openWhatsApp(buildText(data));
    track(data.intent);
    showStatus('info', 'Your inquiry is ready in WhatsApp',
      'Press <b>Send</b> in WhatsApp to deliver it to our team. If WhatsApp did not open, call us on <a href="tel:+8801681637836">+880 1681 637836</a>.');
  }
});
waBtn.addEventListener('click', function () {
  if (!validate()) return;
  var data = collect();
  openWhatsApp(buildText(data));
  track(data.intent);
  showStatus('info', 'Your inquiry is ready in WhatsApp', 'Press <b>Send</b> in WhatsApp to deliver it to our team.');
});

/* ---------- Copy address ---------- */
var copyBtn = $('#cntCopy');
if (copyBtn) {
  copyBtn.addEventListener('click', function () {
    var text = copyBtn.getAttribute('data-copy'), label = $('span', copyBtn), old = label.textContent;
    function done(ok) {
      label.textContent = ok ? 'Address Copied' : 'Copy failed';
      copyBtn.classList.toggle('is-done', ok);
      setTimeout(function () { label.textContent = old; copyBtn.classList.remove('is-done'); }, 2000);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(ta); done(ok);
    }
  });
}

})();

