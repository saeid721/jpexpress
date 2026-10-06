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