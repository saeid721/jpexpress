(function () {
  "use strict";

  /* PAGE: ALL PAGES - shared navigation, animation, accessibility and common UI behavior. */
  document.documentElement.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* Load sequence */
  window.addEventListener('load', () => document.body.classList.add('loaded'));
  setTimeout(() => document.body.classList.add('loaded'), 900); /* fallback */

  /* ---------- Fixed header height sync (prevents content jump) ---------- */
  const siteHeader = document.getElementById('siteHeader');
  function setHeaderHeight() {
    document.documentElement.style.setProperty('--jp-header-h', Math.round(siteHeader.getBoundingClientRect().height) + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  window.addEventListener('load', setHeaderHeight);
  if ('ResizeObserver' in window) {
    new ResizeObserver(setHeaderHeight).observe(siteHeader);
  } else {
    document.getElementById('topBar').addEventListener('transitionend', setHeaderHeight);
  }

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
  document.querySelectorAll('#jpMenu .nav-link, #jpMenu .jp-sub-link').forEach(a => a.addEventListener('click', () => {
    const oc = bootstrap.Offcanvas.getInstance(document.getElementById('jpMenu'));
    if (oc) oc.hide();
  }));

  /* ---------- Services dropdown: active sub link + mobile accordion ---------- */
  (function servicesDropdown() {
    const slug = (location.pathname.split('/').pop() || 'index').replace(/\.html$/i, '').toLowerCase();

    document.querySelectorAll('.jp-dd-link, .jp-sub-link').forEach(a => {
      const on = (a.getAttribute('href') || '').replace(/\.html$/i, '').toLowerCase() === slug;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page');
    });

    document.querySelectorAll('.jp-m-dd').forEach(item => {
      const btn = item.querySelector('.jp-m-dd-toggle');
      if (!btn) return;
      const setOpen = open => {
        item.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
      };
      btn.addEventListener('click', () => setOpen(!item.classList.contains('open')));
      if (item.querySelector('.jp-sub-link.active')) setOpen(true);
    });
  })();


  /* ---------- Active nav link: follows the current page (desktop + mobile menu) ---------- */
  (function setActiveNav() {
    const navLinks = document.querySelectorAll('.jp-navbar .nav-link, #jpMenu .nav-link');
    if (!navLinks.length) return;

    const slug = (location.pathname.split('/').pop() || 'index').replace(/\.html$/i, '').toLowerCase() || 'index';

    /* Sub pages highlight their parent menu */
    const parentMap = {
      'index': 'index',
      'about': 'about', 'our-story': 'about', 'leadership': 'about', 'careers': 'about', 'media-center': 'about',
      'services': 'services', 'international-courier': 'services', 'air-freight': 'services',
      'sea-freight': 'services', 'export-logistics': 'services', 'import-solutions': 'services',
      'countries': 'countries', 'country': 'countries',
      'industries': 'industries',
      'business': 'business',
      'resources': 'resources', 'shipping-guides': 'resources', 'faq': 'resources', 'blog': 'resources',
      'contact': 'contact'
    };
    const current = parentMap[slug] || null; /* quote, track-shipment, legal... = no menu active */

    const hrefSlug = a => (a.getAttribute('href') || '').split(/[?#]/)[0].replace(/\.html$/i, '').toLowerCase();

    function mark(target) {
      navLinks.forEach(a => {
        const on = !!target && hrefSlug(a) === target;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    }

    mark(current);

    /* Instant feedback when a menu is clicked (before the next page loads) */
    navLinks.forEach(a => a.addEventListener('click', () => mark(hrefSlug(a))));
  })();

  /* ---------- Quote/Track buttons open the matching #tools tab ---------- */
  document.querySelectorAll('[data-open-tab]').forEach(el => {
    el.addEventListener('click', () => {
      const wantsCalc = el.getAttribute('data-open-tab') === 'calc';
      const triggerEl = document.getElementById(wantsCalc ? 'tab-calc' : 'tab-track');
      if (triggerEl) bootstrap.Tab.getOrCreateInstance(triggerEl).show();
    });
  });

  /* ---------- Hero typewriter (3 rotating JP_HOME_TITLES) ---------- */
  const typeTextEl = document.getElementById('typeText');
  if (typeTextEl) {
    ;
    if (reduced) {
      typeTextEl.textContent = JP_HOME_TITLES[0];
    } else {
      let ti = 0, ci = 0, deleting = false;
      const TYPE_SPEED = 55, DELETE_SPEED = 30, HOLD = 1800, GAP = 400;
      function tick() {
        const full = JP_HOME_TITLES[ti];
        if (!deleting) {
          ci++;
          typeTextEl.textContent = full.slice(0, ci);
          if (ci === full.length) { setTimeout(() => { deleting = true; tick(); }, HOLD); return; }
          setTimeout(tick, TYPE_SPEED);
        } else {
          ci--;
          typeTextEl.textContent = full.slice(0, ci);
          if (ci === 0) { deleting = false; ti = (ti + 1) % JP_HOME_TITLES.length; setTimeout(tick, GAP); return; }
          setTimeout(tick, DELETE_SPEED);
        }
      }
      setTimeout(tick, 700);
    }
  }

  /* ---------- Hero shipment card rotator ---------- */
  const shipCardFade = document.getElementById('shipCardFade');
  if (shipCardFade) {
    ;
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
    renderShipment(JP_HOME_SHIPMENTS[0]);

    if (!reduced) {
      setInterval(() => {
        shipCardFade.classList.add('fading');
        setTimeout(() => {
          si = (si + 1) % JP_HOME_SHIPMENTS.length;
          renderShipment(JP_HOME_SHIPMENTS[si]);
          shipCardFade.classList.remove('fading');
        }, 350);
      }, 3200);
    }
  }

  /* ---------- WhatsApp smart-link: skip landing page on desktop ---------- */
  const WA_PHONE = JP_SITE_CONFIG.whatsapp;
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
;

const testimonialCard = document.getElementById('testimonialCard');
const testimonialAvatar = document.getElementById('testimonialAvatar');
const testimonialQuote = document.getElementById('testimonialQuote');
const testimonialName = document.getElementById('testimonialName');
const testimonialRole = document.getElementById('testimonialRole');
const testimonialStars = document.getElementById('testimonialStars');
const testimonialDots = document.getElementById('testimonialDots');
const testimonialPrev = document.getElementById('testimonialPrev');
const testimonialNext = document.getElementById('testimonialNext');

if (testimonialCard && JP_HOME_TESTIMONIALSDATA.length > 1) {
  let currentIndex = 0;
  let autoTimer = null;
  const INTERVAL = 3000;

  // Build dots
  JP_HOME_TESTIMONIALSDATA.forEach((_, i) => {
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
    currentIndex = (currentIndex + 1) % JP_HOME_TESTIMONIALSDATA.length;
    renderReview(true);
  }

  function prevReview() {
    currentIndex = (currentIndex - 1 + JP_HOME_TESTIMONIALSDATA.length) % JP_HOME_TESTIMONIALSDATA.length;
    renderReview(true);
  }

  function renderReview(animate) {
    const data = JP_HOME_TESTIMONIALSDATA[currentIndex];

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
   ========================================================= */

/* ---------- Shared initialization: ALL PAGES ---------- */
(function initSharedTypingState() {
  var root = document.documentElement;
  root.classList.add('typing-js');
  window.setTimeout(function () {
    root.classList.remove('typing-js');
  }, 3000);
})();

/* JP Express - Hero title typing animation (index.html only) */
(function () {
  "use strict";

  var title = document.getElementById("heroTitle");
  if (!title) return;

  var slides = Array.prototype.slice.call(title.querySelectorAll(".ht-slide"));
  if (!slides.length) return;

  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var TYPE_MS = 42;    /* typing speed per character */
  var ERASE_MS = 14;   /* backspace speed per character */
  var HOLD_MS = 2400;  /* time the finished headline stays visible */
  var GAP_MS = 320;    /* pause before the next headline starts */

  var original = title.innerHTML;
  var idx = 0, timer = 0, started = false;

  /* split text into words > characters (keeps the .accent span styling) */
  function wrap(node, list) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var word = document.createElement("span");
          word.className = "tword";
          Array.prototype.forEach.call(part, function (ch) {
            var c = document.createElement("span");
            c.className = "tchar";
            c.textContent = ch;
            word.appendChild(c);
            list.push(c);
          });
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        wrap(child, list);
      }
    });
  }

  function setActive(n) {
    idx = n;
    slides.forEach(function (s, k) {
      s.classList.toggle("active", k === n);
      s.setAttribute("aria-hidden", k === n ? "false" : "true");
    });
  }

  function typeIn(i) {
    var c = slides[idx]._c;
    if (i < c.length) {
      if (i > 0) c[i - 1].classList.remove("is-caret");
      c[i].classList.add("on", "is-caret");
      timer = setTimeout(function () { typeIn(i + 1); }, TYPE_MS + Math.random() * 28);
    } else {
      timer = setTimeout(function () { eraseOut(c.length); }, HOLD_MS);
    }
  }

  function eraseOut(n) {
    var c = slides[idx]._c;
    if (n > 0) {
      c[n - 1].classList.remove("on", "is-caret");
      if (n > 1) c[n - 2].classList.add("is-caret");
      timer = setTimeout(function () { eraseOut(n - 1); }, ERASE_MS);
    } else {
      setActive((idx + 1) % slides.length);
      timer = setTimeout(function () { typeIn(0); }, GAP_MS);
    }
  }

  function begin() {
    if (started) return;
    started = true;
    timer = setTimeout(function () { typeIn(0); }, 450);
  }

  try {
    slides.forEach(function (s) {
      s._c = [];
      wrap(s, s._c);
      s.setAttribute("aria-hidden", "true");
    });

    title.classList.add("is-ready");
    root.classList.remove("typing-js");
    setActive(0);

    if (reduced) {
      slides[0]._c.forEach(function (c) { c.classList.add("on"); });
    } else {
      /* start after page load (hero fade-in finished) */
      if (document.readyState === "complete") begin();
      else { window.addEventListener("load", begin); setTimeout(begin, 800); }

      /* pause when tab is hidden, resume cleanly when visible */
      document.addEventListener("visibilitychange", function () {
        if (!started) return;
        clearTimeout(timer);
        if (document.hidden) return;
        slides.forEach(function (s) {
          s._c.forEach(function (x) { x.classList.remove("on", "is-caret"); });
        });
        setActive(idx);
        timer = setTimeout(function () { typeIn(0); }, GAP_MS);
      });
    }
  } catch (err) {
    console.warn("Hero typing fallback:", err);
    clearTimeout(timer);
    title.innerHTML = original;
    var first = title.querySelector(".ht-slide");
    if (first) first.classList.add("active");
    title.classList.add("is-ready");
  }
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



/* =========================================================
   CONSOLIDATED MODULE: blog-data.js
   ========================================================= */
/* JP Express blog – content data. Add an article = add one object.
   c category | t title | x excerpt | fx long excerpt (featured) | d date (YYYY-MM-DD) | r read minutes
   i FontAwesome icon | k tone (red|blue|amber|navy|green|cyan) | h link | a link label | f featured | q search keywords
   When full article pages exist, set h to "blog/your-slug.html" (or /blog/your-slug/ on Laravel). */
/* =========================================================
   CONSOLIDATED MODULE: countries-data.js
   ========================================================= */
/* JP Express – destinations dataset. Add a country = add one object.
   v: service letters (e express, o economy, d door-to-door, a air, s sea, x export, c customs)
   Transit = express estimate only. Verify rules before publishing. */
/* =========================================================
   PAGE: services.html
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
    var h = el.querySelector("h3");
    var ic = el.querySelector(".svp-item-ico i");
    var tg = el.querySelector(".svp-item-tag");
    var sec = el.closest(".svp-cat");
    var ch = sec && sec.querySelector(".svp-cat-head h2");

    el._title = h ? h.textContent.trim() : "";
    el._icon = ic ? ic.className : "fa-solid fa-box";
    el._tag = tg ? tg.textContent.trim() : "";
    el._cat = ch ? ch.textContent.trim() : "Services";
    el._text = (el.textContent + " " + (el.getAttribute("data-tags") || "")).toLowerCase().replace(/\s+/g, " ");
  });

  function apply() {
    var q = input.value.trim().toLowerCase();
    var terms = q.split(/\s+/).filter(Boolean);
    var shown = 0;

    /* exact service name picked/typed => show only that service */
    var exact = items.filter(function (el) { return el._title.toLowerCase() === q; })[0] || null;

    items.forEach(function (el) {
      var ok = exact ? el === exact : terms.every(function (t) { return el._text.indexOf(t) > -1; });
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

    if (!list.hidden) renderList(false);
  }

  function goToResults() {
    var first = sections.filter(function (s) { return !s.hidden; })[0];
    if (first) first.scrollIntoView({ behavior: behavior, block: "start" });
  }

  /* ---------- Search dropdown (combobox): click = all services, type = live filter ---------- */
  var wrap = input.parentNode;
  var list = document.createElement("div");
  var options = [];
  var activeIdx = -1;

  list.className = "svp-dd";
  list.id = "svcList";
  list.hidden = true;
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", "Services");
  wrap.appendChild(list);

  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", "svcList");
  input.setAttribute("aria-expanded", "false");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* highlight the typed words inside a title */
  function mark(title, terms) {
    var low = title.toLowerCase(), flags = [], i, k, n;
    for (n = 0; n < title.length; n++) flags[n] = false;
    terms.forEach(function (t) {
      i = t ? low.indexOf(t) : -1;
      while (i > -1) {
        for (k = i; k < i + t.length; k++) flags[k] = true;
        i = low.indexOf(t, i + t.length);
      }
    });
    var out = "", open = false;
    for (n = 0; n < title.length; n++) {
      if (flags[n] && !open) { out += "<mark>"; open = true; }
      if (!flags[n] && open) { out += "</mark>"; open = false; }
      out += esc(title.charAt(n));
    }
    return open ? out + "</mark>" : out;
  }

  function renderList(allowAll) {
    var q = input.value.trim().toLowerCase();
    var current = items.filter(function (el) { return el._title.toLowerCase() === q; })[0] || null;
    var terms = current && allowAll ? [] : q.split(/\s+/).filter(Boolean);
    var html = "", lastCat = "";

    options = [];

    items.forEach(function (el) {
      if (!terms.every(function (t) { return el._text.indexOf(t) > -1; })) return;

      if (el._cat !== lastCat) {
        lastCat = el._cat;
        html += '<div class="svp-dd-group" role="presentation">' + esc(lastCat) + "</div>";
      }

      var n = options.length;
      html += '<div class="svp-dd-opt' + (el === current ? " is-current" : "") + '" role="option" id="svcOpt' + n + '" data-i="' + n + '" aria-selected="false">' +
        '<span class="svp-dd-ico"><i class="' + esc(el._icon) + '" aria-hidden="true"></i></span>' +
        '<span class="svp-dd-txt"><strong>' + mark(el._title, terms) + "</strong><small>" + esc(el._tag) + "</small></span>" +
        '<i class="fa-solid fa-arrow-right svp-dd-go" aria-hidden="true"></i></div>';
      options.push(el);
    });

    list.innerHTML = html || '<div class="svp-dd-empty"><i class="fa-solid fa-circle-question" aria-hidden="true"></i>' +
      '<p>No matching service found.</p><a href="index.html#quote">Request a Quote</a></div>';

    activeIdx = -1;
    input.removeAttribute("aria-activedescendant");
    return current;
  }

  function revealOnMobile() {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    setTimeout(function () {
      var hh = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--jp-header-h")) || 64) + 64;
      var top = wrap.getBoundingClientRect().top;
      if (Math.abs(top - hh - 12) > 16) window.scrollBy({ top: top - hh - 12, behavior: behavior });
    }, 120);
  }

  function openList(allowAll) {
    var current = renderList(allowAll);
    list.hidden = false;
    wrap.classList.add("is-open");
    input.setAttribute("aria-expanded", "true");

    var node = list.querySelector(".is-current");
    if (current && allowAll && node) list.scrollTop = Math.max(0, node.offsetTop - 56);

    revealOnMobile();
  }

  function closeList() {
    list.hidden = true;
    activeIdx = -1;
    wrap.classList.remove("is-open");
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function setActiveOpt(i, noScroll) {
    var nodes = list.querySelectorAll(".svp-dd-opt");
    if (!nodes.length) return;

    activeIdx = (i + nodes.length) % nodes.length;
    Array.prototype.forEach.call(nodes, function (nd, k) {
      var on = k === activeIdx;
      nd.classList.toggle("is-active", on);
      nd.setAttribute("aria-selected", on ? "true" : "false");
    });
    input.setAttribute("aria-activedescendant", nodes[activeIdx].id);

    if (noScroll) return;
    var o = nodes[activeIdx], top = o.offsetTop, bottom = top + o.offsetHeight;
    if (top < list.scrollTop + 32) list.scrollTop = Math.max(0, top - 36);
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 8;
  }

  function pick(el) {
    if (!el) return;
    input.value = el._title;
    closeList();
    apply();

    el.classList.add("is-picked");
    setTimeout(function () { el.classList.remove("is-picked"); }, 2400);
    el.scrollIntoView({ behavior: behavior, block: "center" });

    if (window.matchMedia("(max-width: 767px)").matches) input.blur();
  }

  function isPicked() {
    var q = input.value.trim().toLowerCase();
    return !!q && items.some(function (el) { return el._title.toLowerCase() === q; });
  }

  input.addEventListener("input", function () {
    apply();
    if (list.hidden) openList(false);
  });

  input.addEventListener("focus", function () {
    if (!list.hidden) return;
    openList(true);
    if (isPicked()) input.select();
  });

  input.addEventListener("click", function () {
    if (list.hidden) openList(true);
  });

  input.addEventListener("keydown", function (e) {
    var k = e.key;

    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      if (list.hidden) openList(true);
      setActiveOpt(activeIdx < 0 ? (k === "ArrowDown" ? 0 : -1) : activeIdx + (k === "ArrowDown" ? 1 : -1));
    } else if (k === "Enter") {
      e.preventDefault();
      if (!list.hidden && activeIdx > -1 && options[activeIdx]) {
        pick(options[activeIdx]);
      } else {
        closeList();
        goToResults();
      }
    } else if (k === "Escape") {
      if (!list.hidden) { e.preventDefault(); closeList(); }
    } else if (k === "Tab") {
      closeList();
    }
  });

  list.addEventListener("click", function (e) {
    var o = e.target.closest(".svp-dd-opt");
    if (o) pick(options[parseInt(o.getAttribute("data-i"), 10)]);
  });

  list.addEventListener("mouseover", function (e) {
    var o = e.target.closest(".svp-dd-opt");
    if (o) setActiveOpt(parseInt(o.getAttribute("data-i"), 10), true);
  });

  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) closeList();
  });

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
   PAGE: industries.html
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
   PAGE: countries.html
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
   PAGE: country.html
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
  const nav = [['overview', 'Overview', 'fa-eye'], ['services', 'Services', 'fa-layer-group'], ['process', 'Process', 'fa-list-check'], ['quote', 'Cost & Transit', 'fa-calculator'], ['docs', 'Documents', 'fa-file-lines'], ['restrict', 'Restrictions', 'fa-ban'], ['delivery', 'Pickup & Delivery', 'fa-truck-fast'], ['business', 'Business', 'fa-briefcase'], ['faq', 'FAQ', 'fa-circle-question']];
  const sec = (id, t, body, alt) => `<section class="pg-sec cx${alt ? ' pg-alt' : ''}" id="${id}" aria-labelledby="${id}T"><div class="container-fluid"><h2 class="pg-h" id="${id}T">${t}</h2>${body}</div></section>`;

  root.innerHTML = `
  <div class="container-fluid cd-stats-wrap"><div class="cd-stats">
    <div><i class="fa-regular fa-clock"></i><b>${d.t}</b><small>Express estimate</small></div>
    <div><i class="fa-solid fa-layer-group"></i><b>${sv.length}</b><small>Services</small></div>
    <div><i class="fa-solid fa-location-dot"></i><b>${d.cap}</b><small>Capital</small></div>
    <div><i class="fa-solid fa-coins"></i><b>${d.cur}</b><small>Currency</small></div></div></div>
  <div class="cd-nav" id="cdNav"><div class="container-fluid"><div class="cd-nav-in">${nav.map(n => `<a href="#${n[0]}"><i class="fa-solid ${n[2]}"></i>${n[1]}</a>`).join('')}</div></div></div>

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

  /* Page hero: show the real destination */
  const heroCrumb = document.querySelector('.page-hero .page-crumb [aria-current="page"]');
  if (heroCrumb) heroCrumb.textContent = d.n;
  const heroH1 = document.querySelector('.page-hero h1');
  if (heroH1) heroH1.innerHTML = 'Shipping to <span class="accent">' + d.n + '</span>';
  const heroP = document.querySelector('.page-hero .hero-copy p');
  if (heroP) heroP.textContent = 'Services, transit time, documents and customs notes from Bangladesh to ' + d.n + '.';
  const meta = (sel, attr, val) => { const e = document.querySelector(sel); if (e) e.setAttribute(attr, val); };
  meta('meta[name="description"]', 'content', desc); meta('link[rel="canonical"]', 'href', url);
  meta('meta[property="og:title"]', 'content', title); meta('meta[property="og:description"]', 'content', desc); meta('meta[property="og:url"]', 'content', url);
  const ld = o => { const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(o); document.head.appendChild(s); };
  ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', 'index.html'], ['Countries', 'countries.html'], [d.n, 'country.html?c=' + slug]].map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: 'https://www.jpex.com.bd/' + x[1] })) });
  ld({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } })) });

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
   PAGE: blog.html
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
  s.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Blog', name: 'JP Express Shipping & Logistics Blog', url: 'https://www.jpex.com.bd/blog.html',
    publisher: { '@type': 'Organization', name: 'JP Express' },
    blogPost: BLOG_POSTS.map(p => ({ '@type': 'BlogPosting', headline: p.t, description: p.x, datePublished: p.d, articleSection: BLOG_CATS[p.c], author: { '@type': 'Organization', name: 'JP Express' } }))
  });
  document.head.appendChild(s);

  render();
})();

/* =========================================================
   PAGE: quote.html
   CONSOLIDATED MODULE: pricing.js
   ========================================================= */
/* =========================================================
   JP EXPRESS: PRICING / SHIPPING CALCULATOR
   Calculates actual, volumetric and chargeable weight.
   A price is shown ONLY when real rates are added to
   JP_PRICING_CONFIG.rates below. Until then the result is "Quote Required".
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- BUSINESS RULES (edit these) ---------------- */
  ;

  ;
  ;

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
  function money(n) { return JP_PRICING_CONFIG.currency + " " + Math.round(n).toLocaleString("en-US"); }
  function mode() { return JP_PRICING_MODES[form.elements.mode.value]; }

  /* ---------------- mode handling ---------------- */
  function applyMode() {
    var m = mode();
    var prev = els.service.value;
    els.service.innerHTML = m.services.map(function (k) {
      return '<option value="' + k + '">' + JP_PRICING_SERVICES[k] + "</option>";
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
    var m = JP_PRICING_MODES[d.mode];
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
    var m = JP_PRICING_MODES[d.mode];
    var hasDims = m.dims && d.l > 0 && d.w > 0 && d.h > 0;
    var cm3 = hasDims ? d.l * d.w * d.h * d.pcs : 0;
    var divisor = JP_PRICING_CONFIG.divisors[d.svc];
    var vol = hasDims && divisor ? cm3 / divisor : 0;
    var cw = Math.max(d.weight, vol);
    if (JP_PRICING_CONFIG.roundStep > 0) cw = Math.ceil(cw / JP_PRICING_CONFIG.roundStep) * JP_PRICING_CONFIG.roundStep;

    var reasons = [];
    if (m.quote) reasons.push("Commercial and freight shipments are priced by quote.");
    if (d.svc === "sea") reasons.push("Sea freight is priced by volume and route, so a quote is needed.");
    if (d.svc === "courier" && cw > JP_PRICING_CONFIG.maxCourierKg) reasons.push("Shipments over " + JP_PRICING_CONFIG.maxCourierKg + " kg need a manual review.");
    if (hasDims && Math.max(d.l, d.w, d.h) > JP_PRICING_CONFIG.maxSideCm) reasons.push("Large dimensions need a manual review.");

    var rate = null;
    if (!reasons.length && JP_PRICING_CONFIG.rates && JP_PRICING_CONFIG.rates[d.svc]) {
      rate = JP_PRICING_CONFIG.rates[d.svc][d.dest.toLowerCase()] || null;
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
      "Shipment type: " + JP_PRICING_MODES[d.mode].label + "\nService: " + JP_PRICING_SERVICES[d.svc] + "\nDestination: " + d.dest +
      "\nActual weight: " + kg(d.weight) + "\nChargeable weight: " + kg(r.cw) +
      (r.hasDims ? "\nSize: " + d.l + " x " + d.w + " x " + d.h + " cm x " + d.pcs + " pc" : "");

    var head = estimated
      ? '<span class="prc-badge is-est">Estimated</span><div class="prc-price">' + money(r.total) + '</div><p class="prc-sub">Estimated shipping cost. Final price is confirmed in your quote.</p>'
      : '<span class="prc-badge is-quote">Quote Required</span><div class="prc-price prc-price--quote">Request a Quote</div><p class="prc-sub">' + esc(r.reasons[0]) + "</p>";

    var rows = row("Service", esc(JP_PRICING_SERVICES[d.svc])) + row("Destination", esc(d.dest)) +
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
      (JP_PRICING_CONFIG.ratesNote ? " " + esc(JP_PRICING_CONFIG.ratesNote) : "") + "</p>" +
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
   PAGE: contact.html
   CONSOLIDATED MODULE: contact.js
   ========================================================= */
(function () {
  "use strict";

  /* =========================================================
     JP EXPRESS - CONTACT PAGE LOGIC
     Load AFTER js/main.js
     ========================================================= */


  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
    var open = JP_CONTACT_CONFIG.closedDays.indexOf(t.d) === -1 && t.h >= JP_CONTACT_CONFIG.openHour && t.h < JP_CONTACT_CONFIG.closeHour;
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
    if (!JP_CONTACT_INTENTS[key]) key = 'general';
    current = key;
    var cfg = JP_CONTACT_INTENTS[key];
    hint.textContent = cfg.hint;
    msgField.placeholder = cfg.ph;
    destLabel.textContent = cfg.destLabel || 'Destination Country';
    JP_CONTACT_FIELD_ORDER.forEach(function (f) {
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
  if (JP_CONTACT_CONFIG.endpoint) {
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
    var cfg = JP_CONTACT_INTENTS[current], bad = [];
    var name = $('#fName').value.trim(), phone = $('#fPhone').value.trim();
    var email = $('#fEmail').value.trim(), msg = msgField.value.trim();
    var weight = $('#fWeight').value;

    setError('name', name.length < 2 ? 'Please enter your name.' : '');
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
      intent: JP_CONTACT_INTENTS[current].label,
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
    var url = isMobile ? 'https://wa.me/' + JP_CONTACT_CONFIG.waPhone + '?text=' + m
      : 'https://web.whatsapp.com/send?phone=' + JP_CONTACT_CONFIG.waPhone + '&text=' + m;
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
    fetch(JP_CONTACT_CONFIG.endpoint, { method: 'POST', headers: headers, body: fd, credentials: 'same-origin' })
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
    if (JP_CONTACT_CONFIG.endpoint) {
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
        var ok = false; try { ok = document.execCommand('copy'); } catch (err) { }
        document.body.removeChild(ta); done(ok);
      }
    });
  }

})();


/* =========================================================
   PAGE: business.html
   BUSINESS PAGE LOGIC
   ========================================================= */
(function () {
  "use strict";

  /* =========================================================
     JP EXPRESS - BUSINESS PAGE LOGIC
     Load AFTER js/main.js
     ========================================================= */

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var behavior = reduced ? 'auto' : 'smooth';
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  /* ---------- Sticky section nav: active state + keep chip visible ---------- */
  (function catNav() {
    var inner = $('.biz-catnav-inner');
    var links = $$('.biz-catlink');
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute('href').slice(1)] = l; });
    var sections = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var lockUntil = 0;

    function setActive(link) {
      if (!link) return;
      links.forEach(function (l) {
        var on = l === link;
        l.classList.toggle('active', on);
        if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
      });
      if (inner && inner.scrollWidth > inner.clientWidth) {
        var left = link.offsetLeft - (inner.clientWidth - link.offsetWidth) / 2;
        inner.scrollTo({ left: Math.max(0, left), behavior: behavior });
      }
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (Date.now() < lockUntil) return;
        entries.forEach(function (e) { if (e.isIntersecting) setActive(byId[e.target.id]); });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
    links.forEach(function (l) {
      l.addEventListener('click', function () { lockUntil = Date.now() + 900; setActive(l); });
    });
  })();

  /* ---------- Who we serve: tabs ---------- */
  (function tabs() {
    var wrap = $('#bizAud');
    if (!wrap) return;
    var tabs = $$('.biz-tab', wrap);
    var panels = tabs.map(function (t) { return document.getElementById('panel-' + t.getAttribute('data-key')); });
    wrap.classList.add('is-js');

    function show(key, focus) {
      tabs.forEach(function (t, i) {
        var on = t.getAttribute('data-key') === key;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panels[i]) panels[i].hidden = !on;
        if (on && focus) t.focus();
      });
      var act = $('.biz-tab.active', wrap);
      var bar = $('#bizTabs');
      if (act && bar && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: Math.max(0, act.offsetLeft - (bar.clientWidth - act.offsetWidth) / 2), behavior: behavior });
      }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t.getAttribute('data-key')); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); show(tabs[n].getAttribute('data-key'), true); }
      });
    });
    show(tabs[0].getAttribute('data-key'));
    window.bizShowTab = show;
  })();

  /* ---------- Quote form ---------- */
  var form = $('#bizForm');
  if (!form) return;
  var submitBtn = $('#bizSubmit'), waBtn = $('#bizWaBtn'), statusEl = $('#bizStatus');
  function setSelect(sel, v) {
    if (!v) return;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === v) { sel.value = v; return; }
    }
  }

  /* Cards and tab buttons pre-fill the form, then scroll to it */
  $$('[data-solution]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var sol = a.getAttribute('data-solution'), type = a.getAttribute('data-type');
      setSelect($('#bSolution'), sol);
      if (type) setSelect($('#bType'), type);
      var target = $('#bizQuote');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: behavior, block: 'start' });
        if (history.replaceState) history.replaceState(null, '', '#bizQuote');
        setTimeout(function () { var c = $('#bCompany'); if (c && !c.value) c.focus({ preventScroll: true }); }, reduced ? 0 : 600);
      }
    });
  });

  /* Prefill from the link: business.html?type=exporter&solution=export */
  (function prefill() {
    var q = new URLSearchParams(window.location.search);
    if (q.get('solution')) setSelect($('#bSolution'), q.get('solution'));
    if (q.get('type')) {
      setSelect($('#bType'), q.get('type'));
      if (window.bizShowTab && $('#tab-' + q.get('type'))) window.bizShowTab(q.get('type'));
    }
    if (q.get('solution') || q.get('type')) {
      setTimeout(function () { var s = $('#bizQuote'); if (s && !window.location.hash) s.scrollIntoView({ behavior: behavior, block: 'start' }); }, 350);
    }
  })();

  if (JP_BUSINESS_CONFIG.endpoint) {
    waBtn.hidden = false;
  } else {
    $('.biz-btn-label', submitBtn).textContent = 'Send Quote Request via WhatsApp';
    submitBtn.querySelector('i').className = 'fa-brands fa-whatsapp';
  }

  /* ---------- Validation ---------- */
  function setError(key, text) {
    var wrap = $('[data-f="' + key + '"]', form);
    if (!wrap) return;
    wrap.classList.toggle('has-error', !!text);
    var err = $('.biz-err', wrap);
    if (err) err.textContent = text || '';
    $$('input,select,textarea', wrap).forEach(function (el) {
      if (text) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    });
  }
  function validate() {
    var bad = [];
    var company = $('#bCompany').value.trim(), person = $('#bPerson').value.trim();
    var phone = $('#bPhone').value.trim(), email = $('#bEmail').value.trim();

    setError('company', company.length < 2 ? 'Please enter your company name.' : '');
    if (company.length < 2) bad.push('#bCompany');
    setError('person', person.length < 2 ? 'Please enter a contact name.' : '');
    if (person.length < 2) bad.push('#bPerson');

    var digits = phone.replace(/\D/g, '');
    var phoneOk = /^[+0-9\s().-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
    setError('phone', phoneOk ? '' : 'Enter a valid phone number, e.g. +880 1XXX XXXXXX.');
    if (!phoneOk) bad.push('#bPhone');

    var emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    setError('email', emailOk ? '' : 'Enter a valid email address.');
    if (!emailOk) bad.push('#bEmail');

    var consent = $('#bConsent').checked;
    setError('consent', consent ? '' : 'Please tick the box so we can contact you.');
    if (!consent) bad.push('#bConsent');

    if (bad.length) {
      var first = bad.map(function (s) { return $(s); }).sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      })[0];
      if (first) first.focus();
    }
    return bad.length === 0;
  }
  $$('.biz-f input,.biz-f textarea,.biz-f select', form).forEach(function (el) {
    el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', function () {
      var w = el.closest('.biz-f');
      if (w && w.classList.contains('has-error')) { w.classList.remove('has-error'); el.removeAttribute('aria-invalid'); }
    });
  });

  /* ---------- Message ---------- */
  function opt(id) { var el = document.getElementById(id); return el ? el.options[el.selectedIndex].text : ''; }
  function collect() {
    return {
      company: $('#bCompany').value.trim(),
      contact_person: $('#bPerson').value.trim(),
      phone: $('#bPhone').value.trim(),
      email: $('#bEmail').value.trim(),
      business_type: $('#bType').value ? opt('bType') : '',
      solution: JP_BUSINESS_SOLUTIONS[$('#bSolution').value] || '',
      product: $('#bProduct').value.trim(),
      countries: $('#bDest').value.trim(),
      frequency: $('#bFreq').value,
      volume: $('#bVolume').value.trim(),
      message: $('#bMsg').value.trim()
    };
  }
  function buildText(d) {
    var rows = [
      ['Company', d.company], ['Contact person', d.contact_person], ['Phone', d.phone], ['Email', d.email],
      ['Business type', d.business_type], ['Need', d.solution], ['Product', d.product], ['Destinations', d.countries],
      ['Frequency', d.frequency], ['Weight / quantity', d.volume], ['Requirements', d.message]
    ];
    return 'Hi JP Express, I would like a business quote.\n' + rows.filter(function (r) { return r[1]; })
      .map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
  }
  function openWhatsApp(text) {
    var m = encodeURIComponent(text);
    var url = isMobile ? 'https://wa.me/' + JP_BUSINESS_CONFIG.waPhone + '?text=' + m
      : 'https://web.whatsapp.com/send?phone=' + JP_BUSINESS_CONFIG.waPhone + '&text=' + m;
    window.open(url, '_blank', 'noopener');
  }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function showStatus(type, title, body) {
    statusEl.className = 'biz-status is-' + type;
    statusEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
    statusEl.innerHTML = '<strong></strong><span></span>';
    statusEl.firstChild.textContent = title;
    statusEl.lastChild.innerHTML = body;
    statusEl.hidden = false;
    statusEl.focus({ preventScroll: true });
    statusEl.scrollIntoView({ behavior: behavior, block: 'nearest' });
  }
  function track(solution) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'business_quote_submit', form_id: 'business_quote', solution: solution });
  }
  function setLoading(on) { submitBtn.classList.toggle('is-loading', on); submitBtn.disabled = on; }
  function resetForm() {
    form.reset();
    $$('.biz-f.has-error', form).forEach(function (w) { w.classList.remove('has-error'); });
  }
  function retryLink(data) {
    var a = $('#bizRetryWa');
    if (a) a.addEventListener('click', function (e) { e.preventDefault(); openWhatsApp(buildText(data)); });
  }

  function sendToServer(data) {
    var fd = new FormData(form);
    var token = $('meta[name="csrf-token"]');
    var headers = { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
    if (token && token.getAttribute('content')) headers['X-CSRF-TOKEN'] = token.getAttribute('content');
    setLoading(true);
    fetch(JP_BUSINESS_CONFIG.endpoint, { method: 'POST', headers: headers, body: fd, credentials: 'same-origin' })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, status: res.status, json: j }; });
      })
      .then(function (r) {
        setLoading(false);
        if (r.ok) {
          track(data.solution);
          if (r.json && r.json.redirect) { window.location.href = r.json.redirect; return; }
          showStatus('success', 'Quote request received', 'Thank you, ' + esc(data.contact_person.split(' ')[0]) + '. Our business team will contact you on ' + esc(data.phone) + '.');
          resetForm();
        } else if (r.status === 422 && r.json && r.json.errors) {
          var k = Object.keys(r.json.errors)[0];
          showStatus('error', 'Please check your details', esc(r.json.errors[k][0]));
        } else {
          showStatus('error', 'We could not send your request', 'Please try again, or <a href="#" id="bizRetryWa">send it on WhatsApp</a>.');
          retryLink(data);
        }
      })
      .catch(function () {
        setLoading(false);
        showStatus('error', 'Connection problem', 'Check your internet and try again, or <a href="#" id="bizRetryWa">send it on WhatsApp</a>.');
        retryLink(data);
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#bWeb').value) { showStatus('success', 'Quote request received', 'Thank you.'); return; } /* spam trap */
    if (!validate()) return;
    var data = collect();
    if (JP_BUSINESS_CONFIG.endpoint) {
      sendToServer(data);
    } else {
      openWhatsApp(buildText(data));
      track(data.solution);
      showStatus('info', 'Your request is ready in WhatsApp',
        'Press <b>Send</b> in WhatsApp to deliver it to our business team. If WhatsApp did not open, call us on <a href="tel:+8801681637836">+880 1681 637836</a>.');
    }
  });
  waBtn.addEventListener('click', function () {
    if (!validate()) return;
    var data = collect();
    openWhatsApp(buildText(data));
    track(data.solution);
    showStatus('info', 'Your request is ready in WhatsApp', 'Press <b>Send</b> in WhatsApp to deliver it to our business team.');
  });

})();

/* =========================================================
   PAGE: resources.html
   RESOURCES PAGE LOGIC
   ========================================================= */
/* =========================================================
   CONSOLIDATED MODULE: resources.js
   Resources page: sticky section nav, guide search + topic filter,
   destination quick guide (from COUNTRY_DATA), download center,
   latest articles (from BLOG_POSTS).
   ========================================================= */
(function () {
  "use strict";
  if (!document.documentElement.classList.contains("page-resources")) return;

  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var behavior = reduced ? "auto" : "smooth";


  /* ---------- Settings: set `file` to a real path to turn a request into a download ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function wa(text) { return "https://wa.me/" + JP_SITE_CONFIG.whatsapp + "?text=" + encodeURIComponent(text); }

  /* ---------- Sticky nav: scroll-spy ---------- */
  var inner = document.querySelector(".res-catnav-inner");
  var links = Array.prototype.slice.call(document.querySelectorAll(".res-catlink"));
  var sections = links.map(function (l) { return document.querySelector(l.getAttribute("href")); }).filter(Boolean);
  var lockUntil = 0;

  function setActive(link) {
    if (!link) return;
    links.forEach(function (l) {
      var on = l === link;
      l.classList.toggle("active", on);
      if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });
    if (inner && inner.scrollWidth > inner.clientWidth) {
      inner.scrollTo({ left: Math.max(0, link.offsetLeft - (inner.clientWidth - link.offsetWidth) / 2), behavior: behavior });
    }
  }
  if (links.length && sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      if (Date.now() < lockUntil) return;
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(links.filter(function (l) { return l.getAttribute("href") === "#" + en.target.id; })[0]);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
  links.forEach(function (l) {
    l.addEventListener("click", function () { lockUntil = Date.now() + 900; setActive(l); });
  });

  /* ---------- Guide library: search + topic filter ---------- */
  var search = $("resSearch");
  if (search) {
    var clear = $("resClear"), count = $("resCount"), empty = $("resEmpty"), reset = $("resReset");
    var guides = Array.prototype.slice.call(document.querySelectorAll(".res-guide"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".res-chip"));
    var state = { cat: "all", q: "" };
    var qs = new URLSearchParams(window.location.search);
    if (qs.get("q")) { state.q = qs.get("q").slice(0, 60); search.value = state.q; }
    if (qs.get("cat") && chips.some(function (c) { return c.getAttribute("data-cat") === qs.get("cat"); })) state.cat = qs.get("cat");

    guides.forEach(function (g) {
      g._text = (g.textContent + " " + (g.getAttribute("data-tags") || "")).toLowerCase().replace(/\s+/g, " ");
    });

    var applyGuides = function () {
      var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;
      guides.forEach(function (g) {
        var ok = (state.cat === "all" || g.getAttribute("data-cat") === state.cat) &&
          terms.every(function (t) { return g._text.indexOf(t) > -1; });
        g.hidden = !ok;
        if (ok) shown++;
      });
      if (terms.length && shown <= 2) guides.forEach(function (g) { if (!g.hidden) g.open = true; });
      chips.forEach(function (c) {
        var on = c.getAttribute("data-cat") === state.cat;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", on);
      });
      clear.hidden = !state.q;
      empty.hidden = shown !== 0;
      count.textContent = shown && (state.q || state.cat !== "all") ? "Showing " + shown + " of " + guides.length + " guides" : "";
    };

    search.addEventListener("input", function () { state.q = search.value.trim(); applyGuides(); });
    clear.addEventListener("click", function () { search.value = ""; state.q = ""; applyGuides(); search.focus(); });
    chips.forEach(function (c) {
      c.addEventListener("click", function () { state.cat = c.getAttribute("data-cat"); applyGuides(); });
    });
    if (reset) reset.addEventListener("click", function () { state = { cat: "all", q: "" }; search.value = ""; applyGuides(); });
    applyGuides();
  }

  /* ---------- Destination quick guide (data from COUNTRY_DATA) ---------- */
  var destBody = $("resDestBody");
  if (destBody && typeof COUNTRY_DATA !== "undefined") {
    var dest = Object.keys(COUNTRY_DATA).map(function (s) {
      var c = COUNTRY_DATA[s]; return { s: s, n: c.n, c: c.c, r: c.r, t: c.t };
    }).sort(function (a, b) { return a.n.localeCompare(b.n); });
    var dSearch = $("resDestSearch"), dEmpty = $("resDestEmpty"), dWrap = $("resDestWrap");

    var renderDest = function () {
      var q = dSearch ? dSearch.value.trim().toLowerCase() : "";
      var out = dest.filter(function (d) { return !q || (d.n + " " + d.r).toLowerCase().indexOf(q) > -1; });
      destBody.innerHTML = out.map(function (d) {
        return '<tr><td data-label="Destination"><span class="res-dest"><img src="https://flagcdn.com/w80/' + esc(d.c) + '.png" width="28" height="28" alt="" loading="lazy">' + esc(d.n) + "</span></td>" +
          '<td data-label="Region">' + esc(d.r) + '</td><td data-label="Express estimate">' + esc(d.t) + "</td>" +
          '<td data-label=""><a class="res-g-link" href="country.html?c=' + encodeURIComponent(d.s) + '">View guide <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></td></tr>';
      }).join("");
      dEmpty.hidden = out.length > 0;
      dWrap.hidden = out.length === 0;
    };
    if (dSearch) dSearch.addEventListener("input", renderDest);
    renderDest();
  } else if (destBody) {
    var sec = $("destinations");
    if (sec) sec.hidden = true;
    var navLink = document.querySelector('.res-catlink[href="#destinations"]');
    if (navLink) navLink.hidden = true;
  }

  /* ---------- Download center ---------- */
  var dl = $("resDownloads");
  if (dl) {
    dl.innerHTML = JP_RESOURCE_DOWNLOADS.map(function (d) {
      var action = d.file
        ? '<a class="btn-main btn-red" href="' + esc(d.file) + '" download><i class="fa-solid fa-download" aria-hidden="true"></i> Download</a>'
        : '<a class="btn-main res-btn-line" target="_blank" rel="noopener" href="' + wa("Hello JP Express, please send me: " + d.title) + '"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Request on WhatsApp</a>';
      return '<li><div class="res-card"><span class="res-ico"><i class="fa-solid ' + esc(d.icon) + '" aria-hidden="true"></i></span><h3>' + esc(d.title) + "</h3><p>" + esc(d.text) + "</p>" + action + "</div></li>";
    }).join("");
  }

  /* ---------- Latest articles (data from BLOG_POSTS) ---------- */
  var art = $("resArticles");
  if (art && typeof BLOG_POSTS !== "undefined") {
    var cats = typeof BLOG_CATS !== "undefined" ? BLOG_CATS : {};
    var fmt = function (d) { return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };
    art.innerHTML = BLOG_POSTS.slice().sort(function (a, b) { return b.d.localeCompare(a.d); }).slice(0, 4).map(function (p) {
      return '<li><a class="res-card" href="' + esc(p.h) + '"><span class="res-ico"><i class="fa-solid ' + esc(p.i) + '" aria-hidden="true"></i></span>' +
        '<span class="res-card-tag">' + esc(cats[p.c] || "Article") + "</span><h3>" + esc(p.t) + "</h3><p>" + esc(p.x) + "</p>" +
        '<span class="res-g-link">' + esc(fmt(p.d)) + " · " + esc(p.r) + ' min read <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></a></li>';
    }).join("");
  } else if (art) {
    var aSec = $("articles");
    if (aSec) aSec.hidden = true;
    var aLink = document.querySelector('.res-catlink[href="#articles"]');
    if (aLink) aLink.hidden = true;
  }
})();

/* =========================================================
   PAGE: track-shipment.html
   TRACKING PAGE LOGIC
   ========================================================= */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var DEMO = params.get("demo") === "1";

  /* ---------------- sample data (demo mode only) ---------------- */
  /* ---------------- stage + status logic ---------------- */
  function stageOf(s) {
    s = String(s || "").toLowerCase();
    if (/out for delivery/.test(s)) return 4;
    if (/deliver/.test(s) && !/attempt|fail/.test(s)) return 5;
    if (/custom/.test(s)) return 3;
    if (/transit|depart|arriv|process|receiv|facility|hub|flight/.test(s)) return 2;
    if (/pick/.test(s)) return 1;
    if (/book|confirm|regist|schedul/.test(s)) return 0;
    return -1;
  }
  function isProblem(s) { return /delay|hold|exception|attempt|return|cancel|fail/i.test(String(s || "")); }

  /* ---------------- helpers ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var els = { form: $("trkForm"), input: $("trkInput"), btn: $("trkBtn"), err: $("trkError"), view: $("trkView"), demo: $("trkDemo") };
  if (!els.form) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function str(v) { return v == null ? "" : String(v); }
  function wa(text) { return "https://wa.me/" + JP_TRACKING_CONFIG.whatsapp + "?text=" + encodeURIComponent(text); }
  function waTrack(id) { return wa("Hello JP Express, I need an update on my shipment. Tracking number: " + id); }
  function icon(c) { return '<i class="fa-solid ' + c + '" aria-hidden="true"></i>'; }

  function normalize(j, id) {
    var ev = Array.isArray(j.events) ? j.events : [];
    return {
      id: str(j.trackingNumber) || id, status: str(j.status), service: str(j.service), type: str(j.shipmentType),
      origin: str(j.origin), destination: str(j.destination), booked: str(j.bookedOn), pickedUp: str(j.pickedUpOn),
      weight: str(j.weight), pieces: j.pieces == null ? "" : str(j.pieces), eta: j.estimatedDelivery ? str(j.estimatedDelivery) : "",
      updated: str(j.lastUpdated),
      events: ev.map(function (e) {
        return { status: str(e.status), date: str(e.date), time: str(e.time), location: str(e.location), note: str(e.description || e.note) };
      }),
      exception: j.exception && j.exception.title ? { title: str(j.exception.title), meaning: str(j.exception.meaning), action: str(j.exception.action) } : null,
      pod: j.pod ? { on: str(j.pod.deliveredOn), location: str(j.pod.location), by: str(j.pod.receivedBy) } : null
    };
  }

  function fetchOne(id) {
    if (DEMO) {
      return new Promise(function (res) {
        setTimeout(function () { res(JP_TRACKING_DEMO_DATA[id] ? { state: "ok", data: normalize(JP_TRACKING_DEMO_DATA[id], id) } : { state: "notfound" }); }, 500);
      });
    }
    if (!JP_TRACKING_CONFIG.apiUrl) return Promise.resolve({ state: "unconfigured" });
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, JP_TRACKING_CONFIG.timeoutMs) : null;
    var url = JP_TRACKING_CONFIG.apiUrl + (JP_TRACKING_CONFIG.apiUrl.indexOf("?") > -1 ? "&" : "?") + "tracking=" + encodeURIComponent(id);
    return fetch(url, { headers: { Accept: "application/json" }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        if (r.status === 404) return { state: "notfound" };
        if (!r.ok) throw new Error("bad");
        return r.json().then(function (j) {
          return j && j.found !== false ? { state: "ok", data: normalize(j, id) } : { state: "notfound" };
        });
      })
      .catch(function () { return { state: "unavailable" }; })
      .then(function (out) { if (timer) clearTimeout(timer); return out; });
  }

  /* ---------------- views ---------------- */
  function supportBtns(id) {
    return '<a class="btn-main btn-red" href="' + (id ? waTrack(id) : wa("Hello JP Express, I need help with tracking.")) + '" target="_blank" rel="noopener">' + '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i>' + ' WhatsApp Support</a>' +
      '<a class="btn-main btn-dark-outline trk-ghost" href="tel:' + JP_TRACKING_CONFIG.phone + '">' + icon("fa-phone") + " Call Us</a>";
  }
  function msgView(ic, title, text, extra) {
    return '<div class="trk-state"><span class="trk-state-ico">' + icon(ic) + "</span><h2>" + title + "</h2><p>" + text + "</p>" + (extra || "") + "</div>";
  }
  var V = {
    empty: function () {
      return '<div class="trk-guide">' +
        [["fa-hashtag", "Enter your number", "Type or paste your JP Express tracking number above."],
        ["fa-magnifying-glass-location", "See your status", "View the latest update, timeline and shipment details."],
        ["fa-headset", "Need help?", "Our team can help if something looks wrong."]]
          .map(function (s, i) { return '<div class="trk-guide-item"><span class="trk-guide-ico">' + icon(s[0]) + "</span><h3>" + s[1] + "</h3><p>" + s[2] + "</p></div>"; }).join("") + "</div>";
    },
    loading: function () {
      return '<div class="trk-skel" aria-hidden="true"><div class="sk sk-h"></div><div class="sk sk-l"></div><div class="sk sk-l sk-s"></div><div class="sk sk-b"></div></div><p class="visually-hidden">Loading tracking information</p>';
    },
    notfound: function (id) {
      return msgView("fa-circle-question", "We couldn't find that shipment", "We couldn't find a shipment with the tracking number <strong>" + esc(id) + "</strong>.",
        '<ul class="trk-tips"><li>' + icon("fa-check") + " Check the tracking number</li><li>" + icon("fa-check") + " Try again</li><li>" + icon("fa-check") + " Contact support if the problem continues</li></ul><div class=\"trk-actions\">" + supportBtns(id) + "</div>");
    },
    unavailable: function (id) {
      return msgView("fa-triangle-exclamation", "Tracking is temporarily unavailable", "Tracking information is temporarily unavailable. Please try again later or contact support.",
        '<div class="trk-actions"><button type="button" class="btn-main btn-red" data-retry>' + icon("fa-rotate-right") + " Try Again</button>" + supportBtns(id) + "</div>");
    },
    unconfigured: function (id) {
      return msgView("fa-headset", "Online tracking is being set up", "For the latest status of <strong>" + esc(id) + "</strong>, please message or call our team and we will help you.",
        '<div class="trk-actions">' + supportBtns(id) + "</div>");
    }
  };

  function statusBadge(status) {
    var cls = isProblem(status) ? "is-warn" : stageOf(status) === 5 ? "is-done" : "is-go";
    return '<span class="trk-badge ' + cls + '"><span class="dot"></span>' + esc(status || "Status unavailable") + "</span>";
  }

  function stepper(current) {
    return '<ol class="trk-steps" aria-label="Shipment progress">' + JP_TRACKING_STAGES.map(function (s, i) {
      var c = i < current ? "done" : i === current ? "done current" : "";
      return '<li class="' + c + '"' + (i === current ? ' aria-current="step"' : "") + '><span class="trk-dot">' + icon("fa-check") + '</span><span class="trk-step-l">' + s + "</span></li>";
    }).join("") + "</ol>";
  }

  function kv(label, val) { return val ? '<li><span>' + label + "</span><strong>" + esc(val) + "</strong></li>" : ""; }

  function resultView(d) {
    var top = d.events[0];
    var cur = Math.max(stageOf(d.status), d.events.reduce(function (m, e) { return Math.max(m, stageOf(e.status)); }, -1));
    var problem = isProblem(d.status) || d.exception;
    var explain = !problem && stageOf(d.status) > -1 ? JP_TRACKING_EXPLAIN[stageOf(d.status)] : "";
    var scanned = d.events.length > 0;
    var etaText = d.eta
      ? '<strong>' + esc(d.eta) + '</strong><small>Estimated, not guaranteed</small>'
      : "<strong>Not available</strong><small>Please contact JP Express for the latest delivery update.</small>";

    var main = '<article class="trk-card trk-summary"><div class="trk-top"><div><span class="trk-lbl">Tracking number</span>' +
      '<div class="trk-id"><strong id="trkId">' + esc(d.id) + '</strong><button type="button" class="trk-copy" data-copy="' + esc(d.id) + '" aria-label="Copy tracking number">' + icon("fa-copy") + "<span>Copy</span></button></div></div>" +
      statusBadge(d.status) + "</div>" +
      (explain ? '<p class="trk-explain">' + esc(explain) + "</p>" : "") +
      '<div class="trk-facts"><div><span class="trk-lbl">Estimated delivery</span>' + etaText + "</div>" +
      "<div><span class=\"trk-lbl\">Last updated</span><strong>" + esc(d.updated || (top ? (top.date + (top.time ? ", " + top.time : "")) : "Not available")) + "</strong></div></div>" +
      (scanned && cur > -1 ? stepper(cur) : "") + "</article>";

    if (!scanned) {
      main += '<article class="trk-card trk-note">' + icon("fa-hourglass-half") + "<div><h3>Registered, no movement yet</h3><p>Your shipment has been registered, but the latest movement information is not yet available.</p></div></article>";
    } else {
      main += '<article class="trk-card trk-latest"><span class="trk-lbl">Latest update</span><h3>' + esc(top.status) + (top.location ? " · " + esc(top.location) : "") + "</h3>" +
        '<p class="trk-when">' + icon("fa-clock") + " " + esc(top.date + (top.time ? ", " + top.time : "")) + "</p>" + (top.note ? "<p>" + esc(top.note) + "</p>" : "") + "</article>";
    }
    if (d.exception) {
      main += '<article class="trk-card trk-exc" role="alert"><h3>' + icon("fa-triangle-exclamation") + " " + esc(d.exception.title) + "</h3>" +
        (d.exception.meaning ? "<p><strong>What it means:</strong> " + esc(d.exception.meaning) + "</p>" : "") +
        (d.exception.action ? "<p><strong>What to do:</strong> " + esc(d.exception.action) + "</p>" : "") +
        '<a class="btn-main btn-red" href="' + waTrack(d.id) + '" target="_blank" rel="noopener">Contact Support</a></article>';
    }
    if (scanned) {
      main += '<article class="trk-card"><h3 class="trk-h">' + icon("fa-clock-rotate-left") + " Shipment timeline <span class=\"trk-count\">" + d.events.length + '</span></h3><ol class="trk-tl">' +
        d.events.map(function (e, i) {
          return '<li class="' + (i === 0 ? "is-current" : "") + '"><strong>' + esc(e.status) + '</strong><span class="trk-meta">' + icon("fa-calendar") + " " + esc(e.date + (e.time ? ", " + e.time : "")) +
            (e.location ? " &nbsp;" + icon("fa-location-dot") + " " + esc(e.location) : "") + "</span>" + (e.note ? "<p>" + esc(e.note) + "</p>" : "") + "</li>";
        }).join("") + "</ol></article>";
    }

    var info = '<article class="trk-card"><h3 class="trk-h">' + icon("fa-box") + " Shipment details</h3><ul class=\"trk-kv\">" +
      kv("Service", d.service) + kv("Shipment type", d.type) + kv("Origin", d.origin) + kv("Destination", d.destination) + kv("Booked on", d.booked) +
      kv("Picked up", d.pickedUp) + kv("Weight", d.weight) + kv("Pieces", d.pieces) + "</ul></article>";
    var pod = d.pod ? '<article class="trk-card"><h3 class="trk-h">' + icon("fa-circle-check") + " Proof of delivery</h3><ul class=\"trk-kv\">" + kv("Delivered", d.pod.on) + kv("Location", d.pod.location) + kv("Received by", d.pod.by) + "</ul></article>" : "";
    var help = '<article class="trk-card trk-help"><h3 class="trk-h">' + icon("fa-headset") + " Need help?</h3><p>Share your tracking number with our team and we will check for you.</p><div class=\"trk-actions\">" + supportBtns(d.id) + "</div></article>";

    return '<div class="trk-grid"><div class="trk-main">' + main + '</div><aside class="trk-side">' + info + pod + help + "</aside></div>";
  }

  function multiView(list) {
    var rows = list.map(function (r) {
      var d = r.data, top = d && d.events[0];
      var status = r.state === "ok" ? statusBadge(d.status) : '<span class="trk-badge is-warn"><span class="dot"></span>' + (r.state === "notfound" ? "Not found" : "Unavailable") + "</span>";
      return '<tr><td data-label="Tracking number"><strong>' + esc(r.id) + '</strong></td><td data-label="Status">' + status + '</td><td data-label="Destination">' + esc(d ? d.destination || "-" : "-") + '</td>' +
        '<td data-label="Latest update">' + esc(top ? top.date + (top.location ? ", " + top.location : "") : "-") + '</td><td data-label="Est. delivery">' + esc(d && d.eta ? d.eta : "-") + '</td>' +
        '<td data-label="">' + (r.state === "ok" ? '<button type="button" class="trk-view" data-view="' + esc(r.id) + '">View</button>' : "") + "</td></tr>";
    }).join("");
    return '<article class="trk-card"><h3 class="trk-h">' + icon("fa-list") + " " + list.length + ' shipments</h3><div class="trk-table-wrap"><table class="trk-table"><thead><tr><th>Tracking number</th><th>Status</th><th>Destination</th><th>Latest update</th><th>Est. delivery</th><th><span class="visually-hidden">Action</span></th></tr></thead><tbody>' + rows + "</tbody></table></div></article>";
  }

  /* ---------------- flow ---------------- */
  var lastQuery = "";
  function setView(html, scroll) {
    els.view.innerHTML = html;
    els.view.removeAttribute("aria-busy");
    if (scroll && window.innerWidth < 992) {
      els.view.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }
  function setBusy(on) {
    els.btn.disabled = on;
    els.btn.classList.toggle("is-loading", on);
    if (on) { els.view.setAttribute("aria-busy", "true"); els.view.innerHTML = V.loading(); }
  }
  function showError(msg) { els.err.textContent = msg; els.err.hidden = !msg; els.input.setAttribute("aria-invalid", msg ? "true" : "false"); }

  function parse(raw) {
    var seen = {};
    return raw.toUpperCase().split(/[\s,;]+/).filter(function (x) { if (!x || seen[x]) return false; seen[x] = 1; return true; });
  }

  function track(raw) {
    var ids = parse(raw);
    if (!ids.length) { showError("Enter your tracking number to check your shipment status."); setView(V.empty()); els.input.focus(); return; }
    if (ids.length > JP_TRACKING_CONFIG.maxBatch) { showError("You can track up to " + JP_TRACKING_CONFIG.maxBatch + " shipments at a time."); return; }
    var bad = ids.filter(function (x) { return !/^[A-Z0-9][A-Z0-9\-_]{3,39}$/.test(x); });
    if (bad.length) { showError("Please check the tracking number. Use letters and numbers only."); els.input.focus(); return; }
    showError("");
    lastQuery = ids.join(", ");
    els.input.value = lastQuery;
    var u = new URL(window.location.href); u.searchParams.set("tracking", lastQuery); history.replaceState({}, "", u);

    setBusy(true);
    Promise.all(ids.map(function (id) { return fetchOne(id).then(function (r) { r.id = id; return r; }); })).then(function (rs) {
      setBusy(false);
      if (rs.length > 1) {
        if (rs.every(function (r) { return r.state === "unconfigured"; })) return setView(V.unconfigured(lastQuery), true);
        return setView(multiView(rs), true);
      }
      var r = rs[0];
      if (r.state === "ok") return setView(resultView(r.data), true);
      setView(V[r.state](r.id), true);
    });
  }

  /* ---------------- events ---------------- */
  els.form.addEventListener("submit", function (e) { e.preventDefault(); track(els.input.value); });
  els.input.addEventListener("input", function () { if (!els.err.hidden) showError(""); });
  els.input.addEventListener("paste", function () { setTimeout(function () { els.input.value = els.input.value.replace(/[^\w\s,;\-]/g, "").toUpperCase(); }, 0); });

  els.view.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    if (t.hasAttribute("data-retry")) track(lastQuery);
    if (t.hasAttribute("data-view")) track(t.getAttribute("data-view"));
    if (t.hasAttribute("data-copy")) {
      var v = t.getAttribute("data-copy"), label = t.querySelector("span");
      var done = function () { label.textContent = "Copied"; setTimeout(function () { label.textContent = "Copy"; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, function () { });
      else { var ta = document.createElement("textarea"); ta.value = v; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (x) { } document.body.removeChild(ta); }
    }
  });

  /* ---------------- init ---------------- */
  if (DEMO && els.demo) els.demo.hidden = false;
  var initial = (params.get("tracking") || "").trim();
  setView(V.empty());
  if (initial) { els.input.value = initial.toUpperCase(); track(initial); }
})();
