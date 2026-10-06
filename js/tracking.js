(function () {
  "use strict";

  var CONFIG = { apiUrl: "", timeoutMs: 15000, maxBatch: 10, phone: "+8801681637836", whatsapp: "8801681637836" };

  var params = new URLSearchParams(window.location.search);
  var DEMO = params.get("demo") === "1";

  /* ---------------- sample data (demo mode only) ---------------- */
  var DEMO_DATA = {
    JPEDEMO001: { status: "In Transit", service: "International Courier", shipmentType: "Parcel", origin: "Dhaka, Bangladesh", destination: "New York, USA",
      bookedOn: "14 Aug 2026", pickedUpOn: "15 Aug 2026", weight: "2.4 kg", pieces: 1, estimatedDelivery: "24 Aug 2026", lastUpdated: "16 Aug 2026, 6:15 PM",
      events: [
        { status: "In Transit", date: "16 Aug 2026", time: "6:15 PM", location: "Dhaka", description: "Departed origin facility." },
        { status: "Picked Up", date: "15 Aug 2026", time: "9:40 AM", location: "Dhaka", description: "Shipment collected from sender." },
        { status: "Booking Confirmed", date: "14 Aug 2026", time: "11:20 AM", location: "Dhaka", description: "Booking confirmed." }] },
    JPEDEMO002: { status: "Customs Hold", service: "International Courier", shipmentType: "Parcel", origin: "Dhaka, Bangladesh", destination: "London, UK",
      bookedOn: "12 Aug 2026", pickedUpOn: "13 Aug 2026", weight: "1.1 kg", pieces: 1, estimatedDelivery: null, lastUpdated: "19 Aug 2026, 2:05 PM",
      events: [
        { status: "Customs Hold", date: "19 Aug 2026", time: "2:05 PM", location: "London", description: "Shipment held for customs review." },
        { status: "In Transit", date: "17 Aug 2026", time: "8:30 AM", location: "Dhaka", description: "Departed origin facility." },
        { status: "Picked Up", date: "13 Aug 2026", time: "10:15 AM", location: "Dhaka", description: "Shipment collected from sender." }],
      exception: { title: "Customs documentation required", meaning: "Customs needs more information before this shipment can be released.", action: "Contact JP Express support so we can help with the required documents." } },
    JPEDEMO003: { status: "Delivered", service: "Air Freight", shipmentType: "Commercial", origin: "Dhaka, Bangladesh", destination: "Dubai, UAE",
      bookedOn: "9 Aug 2026", pickedUpOn: "9 Aug 2026", weight: "5.8 kg", pieces: 2, estimatedDelivery: "17 Aug 2026", lastUpdated: "17 Aug 2026, 1:40 PM",
      events: [
        { status: "Delivered", date: "17 Aug 2026", time: "1:40 PM", location: "Dubai", description: "Delivered to the recipient." },
        { status: "Out for Delivery", date: "17 Aug 2026", time: "9:00 AM", location: "Dubai", description: "With the courier for final delivery." },
        { status: "Customs Clearance", date: "15 Aug 2026", time: "3:20 PM", location: "Dubai", description: "Cleared customs." },
        { status: "In Transit", date: "11 Aug 2026", time: "7:00 AM", location: "Dhaka", description: "Departed Bangladesh." },
        { status: "Picked Up", date: "9 Aug 2026", time: "2:30 PM", location: "Dhaka", description: "Shipment collected." }],
      pod: { deliveredOn: "17 Aug 2026, 1:40 PM", location: "Dubai", receivedBy: "Recipient" } },
    JPEDEMO004: { status: "Booking Confirmed", service: "International Courier", shipmentType: "Document", origin: "Dhaka, Bangladesh", destination: "Toronto, Canada",
      bookedOn: "20 Aug 2026", weight: "0.5 kg", pieces: 1, estimatedDelivery: null, lastUpdated: "", events: [] }
  };

  /* ---------------- stage + status logic ---------------- */
  var STAGES = ["Booked", "Picked Up", "In Transit", "Customs", "Out for Delivery", "Delivered"];
  var EXPLAIN = [
    "Your booking has been recorded by JP Express.",
    "Your shipment has been collected.",
    "Your shipment is moving through the international delivery network.",
    "Your shipment is going through customs processing.",
    "Your shipment has been assigned for delivery to the recipient.",
    "The shipment has been recorded as delivered."
  ];
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
  function wa(text) { return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text); }
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
        setTimeout(function () { res(DEMO_DATA[id] ? { state: "ok", data: normalize(DEMO_DATA[id], id) } : { state: "notfound" }); }, 500);
      });
    }
    if (!CONFIG.apiUrl) return Promise.resolve({ state: "unconfigured" });
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, CONFIG.timeoutMs) : null;
    var url = CONFIG.apiUrl + (CONFIG.apiUrl.indexOf("?") > -1 ? "&" : "?") + "tracking=" + encodeURIComponent(id);
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
      '<a class="btn-main btn-dark-outline trk-ghost" href="tel:' + CONFIG.phone + '">' + icon("fa-phone") + " Call Us</a>";
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
    return '<ol class="trk-steps" aria-label="Shipment progress">' + STAGES.map(function (s, i) {
      var c = i < current ? "done" : i === current ? "done current" : "";
      return '<li class="' + c + '"' + (i === current ? ' aria-current="step"' : "") + '><span class="trk-dot">' + icon("fa-check") + '</span><span class="trk-step-l">' + s + "</span></li>";
    }).join("") + "</ol>";
  }

  function kv(label, val) { return val ? '<li><span>' + label + "</span><strong>" + esc(val) + "</strong></li>" : ""; }

  function resultView(d) {
    var top = d.events[0];
    var cur = Math.max(stageOf(d.status), d.events.reduce(function (m, e) { return Math.max(m, stageOf(e.status)); }, -1));
    var problem = isProblem(d.status) || d.exception;
    var explain = !problem && stageOf(d.status) > -1 ? EXPLAIN[stageOf(d.status)] : "";
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
    if (ids.length > CONFIG.maxBatch) { showError("You can track up to " + CONFIG.maxBatch + " shipments at a time."); return; }
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
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, function () {});
      else { var ta = document.createElement("textarea"); ta.value = v; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (x) {} document.body.removeChild(ta); }
    }
  });

  /* ---------------- init ---------------- */
  if (DEMO && els.demo) els.demo.hidden = false;
  var initial = (params.get("tracking") || "").trim();
  setView(V.empty());
  if (initial) { els.input.value = initial.toUpperCase(); track(initial); }
})();