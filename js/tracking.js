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