(function () {
"use strict";

/* ============ SHARED RATE DATA (demo — replace with live API when available) ============ */
var METHOD_RATES = {
  'International Courier': { base: 25, per: 9.5, transit: '4–7 days', divisor: 5000 },
  'Domestic Courier':      { base: 2,  per: 1.2, transit: '1–3 days', divisor: 5000 },
  'Air Freight':           { base: 45, per: 6.8, transit: '5–10 days', divisor: 6000 },
  'Sea Freight':           { base: 65, per: 1.6, transit: '25–40 days', divisor: null }
};

var FUEL_SURCHARGE = {
  'International Courier': 12,
  'Domestic Courier': 0,
  'Air Freight': 15,
  'Sea Freight': 5
};

var COUNTRY_RATES = [
  { country: 'United States', zone: 'Zone A', courier: 11.5, freight: 6.2, transit: '4–6 days' },
  { country: 'United Kingdom', zone: 'Zone A', courier: 10.8, freight: 5.9, transit: '3–5 days' },
  { country: 'Canada', zone: 'Zone A', courier: 12.2, freight: 6.5, transit: '4–7 days' },
  { country: 'Germany', zone: 'Zone A', courier: 10.2, freight: 5.6, transit: '3–5 days' },
  { country: 'France', zone: 'Zone A', courier: 10.4, freight: 5.7, transit: '3–5 days' },
  { country: 'Italy', zone: 'Zone A', courier: 10.6, freight: 5.8, transit: '4–6 days' },
  { country: 'Australia', zone: 'Zone B', courier: 13.5, freight: 7.1, transit: '5–8 days' },
  { country: 'UAE', zone: 'Zone C', courier: 7.8, freight: 3.9, transit: '2–4 days' },
  { country: 'Saudi Arabia', zone: 'Zone C', courier: 8.1, freight: 4.1, transit: '2–4 days' },
  { country: 'Japan', zone: 'Zone B', courier: 9.9, freight: 5.2, transit: '4–6 days' },
  { country: 'South Korea', zone: 'Zone B', courier: 9.6, freight: 5.0, transit: '4–6 days' },
  { country: 'Malaysia', zone: 'Zone C', courier: 7.2, freight: 3.6, transit: '2–4 days' },
  { country: 'Singapore', zone: 'Zone C', courier: 7.0, freight: 3.5, transit: '2–3 days' },
  { country: 'India', zone: 'Zone C', courier: 6.4, freight: 3.1, transit: '2–3 days' }
];

/* ============ SHIPPING RATE CALCULATOR ============ */
var rateForm = document.getElementById('prcRateForm');
if (rateForm) {
  rateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var w = Math.max(parseFloat(document.getElementById('prcWeight').value) || 1, 0.5);
    var l = +document.getElementById('prcL').value || 0;
    var wd = +document.getElementById('prcW').value || 0;
    var h = +document.getElementById('prcH').value || 0;
    var method = document.getElementById('prcMethod').value;
    var rate = METHOD_RATES[method];
    var vol = rate.divisor ? (l * wd * h) / rate.divisor : 0;
    var cw = Math.max(w, vol);
    var mid = rate.base + cw * rate.per;
    var fuelPct = FUEL_SURCHARGE[method] || 0;
    var fuel = mid * (fuelPct / 100);
    var total = mid + fuel;
    var lo = Math.round(total * 0.92), hi = Math.round(total * 1.1);

    var box = document.getElementById('prcRateResult');
    box.classList.remove('d-none');
    box.innerHTML =
      '<div class="calc-result"><div class="position-relative"><div class="d-flex flex-wrap justify-content-between gap-3 align-items-center">' +
      '<div><div class="font-mono" style="font-size:.66rem;letter-spacing:.14em;color:#9FE2F2">ESTIMATED COST</div>' +
      '<div class="amt">$' + lo + ' – $' + hi + ' <small>USD</small></div></div>' +
      '<div class="font-mono" style="font-size:.72rem;line-height:1.9">CHARGEABLE WT: ' + cw.toFixed(1) + ' KG<br>FUEL SURCHARGE: ' + fuelPct + '%<br>TYPICAL TRANSIT: ' + rate.transit + '</div></div>' +
      '<p class="demo-note mt-3 mb-0" style="color:#8FA1BC">INDICATIVE ESTIMATE INCLUDING FUEL SURCHARGE — FINAL PRICING CONFIRMED BY OUR LOGISTICS TEAM.</p></div></div>';
  });
}

/* ============ TRANSIT TIME CALCULATOR ============ */
var transitForm = document.getElementById('prcTransitForm');
if (transitForm) {
  transitForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var method = document.getElementById('prcTMethod').value;
    var destName = document.getElementById('prcTDest').value;
    var found = COUNTRY_RATES.filter(function (c) { return c.country === destName; })[0];
    var base = METHOD_RATES[method].transit;
    var box = document.getElementById('prcTransitResult');
    box.classList.remove('d-none');
    box.innerHTML =
      '<div class="calc-result"><div class="position-relative">' +
      '<div class="font-mono" style="font-size:.66rem;letter-spacing:.14em;color:#9FE2F2">ESTIMATED TRANSIT TIME</div>' +
      '<div class="amt">' + (found ? found.transit : base) + '</div>' +
      '<p class="demo-note mt-3 mb-0" style="color:#8FA1BC">DHAKA → ' + destName.toUpperCase() + ' VIA ' + method.toUpperCase() + ' — SUBJECT TO CUSTOMS AND WEATHER DELAYS.</p>' +
      '</div></div>';
  });
}

/* ============ VOLUMETRIC WEIGHT CALCULATOR ============ */
var volForm = document.getElementById('prcVolForm');
if (volForm) {
  volForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var l = +document.getElementById('prcVL').value || 0;
    var w = +document.getElementById('prcVW').value || 0;
    var h = +document.getElementById('prcVH').value || 0;
    var actual = Math.max(parseFloat(document.getElementById('prcVActual').value) || 0, 0);
    var divisor = +document.getElementById('prcVDivisor').value || 5000;
    var volumetric = (l * w * h) / divisor;
    var chargeable = Math.max(actual, volumetric);

    var box = document.getElementById('prcVolResult');
    box.classList.remove('d-none');
    box.innerHTML =
      '<div class="prc-compare">' +
      '<div class="prc-compare-item"><span class="lbl">Actual Weight</span><span class="val">' + actual.toFixed(2) + ' kg</span></div>' +
      '<div class="prc-compare-item"><span class="lbl">Volumetric Weight</span><span class="val">' + volumetric.toFixed(2) + ' kg</span></div>' +
      '</div>' +
      '<div class="prc-compare" style="margin-top:.7rem"><div class="prc-compare-item is-chargeable" style="grid-column:1/-1"><span class="lbl">Chargeable Weight (Higher of the Two)</span><span class="val">' + chargeable.toFixed(2) + ' kg</span></div></div>' +
      '<p class="demo-note mt-3 mb-0">FORMULA: (LENGTH × WIDTH × HEIGHT IN CM) ÷ ' + divisor + ' — DIVISOR VARIES BY SERVICE.</p>';
  });
}

/* ============ COUNTRY-WISE RATES TABLE ============ */
var ratesBody = document.getElementById('prcRatesBody');
if (ratesBody) {
  function renderRates(list) {
    ratesBody.innerHTML = list.map(function (r) {
      return '<tr>' +
        '<td class="country"><span class="zone-badge">' + r.zone + '</span> ' + r.country + '</td>' +
        '<td class="rate">$' + r.courier.toFixed(1) + '<span class="text-muted-jp" style="font-weight:500"> /kg</span></td>' +
        '<td class="rate">$' + r.freight.toFixed(1) + '<span class="text-muted-jp" style="font-weight:500"> /kg</span></td>' +
        '<td>' + r.transit + '</td>' +
      '</tr>';
    }).join('');
    var empty = document.getElementById('prcRatesEmpty');
    if (empty) empty.style.display = list.length ? 'none' : 'block';
  }
  renderRates(COUNTRY_RATES);

  var search = document.getElementById('prcRatesSearch');
  if (search) {
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      renderRates(COUNTRY_RATES.filter(function (r) { return r.country.toLowerCase().indexOf(q) !== -1; }));
    });
  }

  /* Populate transit-calculator destination select from the same data */
  var tDest = document.getElementById('prcTDest');
  if (tDest) {
    tDest.innerHTML = COUNTRY_RATES.map(function (r) { return '<option>' + r.country + '</option>'; }).join('');
  }
}

/* ============ STICKY CATEGORY NAV — SCROLLSPY ============ */
var links = document.querySelectorAll('.prc-catlink');
var sections = document.querySelectorAll('.prc-cat');
if (links.length && sections.length && 'IntersectionObserver' in window) {
  var byId = {};
  links.forEach(function (l) { byId[l.getAttribute('href').replace('#', '')] = l; });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        var link = byId[entry.target.id];
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (s) { io.observe(s); });
}
links.forEach(function (l) {
  l.addEventListener('click', function () {
    links.forEach(function (x) { x.classList.remove('active'); });
    l.classList.add('active');
  });
});

})();