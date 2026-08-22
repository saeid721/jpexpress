(function () {
"use strict";

/* ============ LIVE BUSINESS HOURS STATUS ============ */
/* Support hours: Saturday–Thursday, 09:00–19:00 (Asia/Dhaka). Friday closed. */
var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var OPEN_HOUR = 9, CLOSE_HOUR = 19, CLOSED_DAY = 5; /* Friday = 5 */

function getDhakaNow() {
  try {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  } catch (e) {
    return new Date();
  }
}

function updateHoursStatus() {
  var now = getDhakaNow();
  var day = now.getDay();
  var hour = now.getHours();
  var isOpenDay = day !== CLOSED_DAY;
  var isOpenNow = isOpenDay && hour >= OPEN_HOUR && hour < CLOSE_HOUR;

  var statusEl = document.getElementById('cntHoursStatus');
  var msgEl = document.getElementById('cntHoursMsg');
  if (statusEl) {
    statusEl.className = 'cnt-hours-status ' + (isOpenNow ? 'is-open' : 'is-closed');
    statusEl.innerHTML = '<span class="dot"></span> ' + (isOpenNow ? 'WE ARE OPEN NOW' : 'CURRENTLY CLOSED');
  }
  if (msgEl) {
    msgEl.textContent = isOpenNow
      ? 'Our team is online and ready to help. Call, WhatsApp or send an inquiry below.'
      : '24/7 online support is still available via WhatsApp — our office reopens ' + (isOpenDay && hour < OPEN_HOUR ? 'today at 9:00 AM.' : 'the next business day at 9:00 AM.');
  }

  /* Highlight today's row in the hours table */
  document.querySelectorAll('#cntHoursTable tr').forEach(function (tr) {
    tr.classList.toggle('is-today', tr.getAttribute('data-day') === String(day));
  });
}
updateHoursStatus();
setInterval(updateHoursStatus, 60000);

/* ============ CONTACT FORM (demo submit) ============ */
var cntForm = document.getElementById('cntContactForm');
if (cntForm) {
  cntForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var successEl = document.getElementById('cntFormSuccess');
    if (successEl) successEl.classList.remove('d-none');
    cntForm.reset();
    if (successEl) successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

})();