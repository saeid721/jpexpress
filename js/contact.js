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
