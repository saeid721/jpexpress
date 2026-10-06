(function () {
"use strict";

/* =========================================================
   JP EXPRESS - BUSINESS PAGE LOGIC
   Load AFTER js/main.js
   ========================================================= */

var CONFIG = {
  /* Laravel route that stores the quote request, e.g. '/business-quote'.
     Leave '' until the backend exists: the form then sends the
     request to WhatsApp so no lead is lost. */
  endpoint: '',
  waPhone: '8801681637836'
};

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
var SOLUTIONS = {
  general: 'Business shipping (general)', export: 'Exporter solutions', ecommerce: 'E-commerce shipping',
  corporate: 'Corporate shipping', buying: 'Buying house solutions', bulk: 'Bulk shipping', account: 'Business account enquiry'
};

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

if (CONFIG.endpoint) {
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
    solution: SOLUTIONS[$('#bSolution').value] || '',
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
  var url = isMobile ? 'https://wa.me/' + CONFIG.waPhone + '?text=' + m
                     : 'https://web.whatsapp.com/send?phone=' + CONFIG.waPhone + '&text=' + m;
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
  fetch(CONFIG.endpoint, { method: 'POST', headers: headers, body: fd, credentials: 'same-origin' })
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
  if (CONFIG.endpoint) {
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
