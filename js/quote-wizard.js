// /* =========================================================
//    PAGE: quote.html
//    CONSOLIDATED MODULE: quote-wizard.js
//    Multi-step quote request wizard — sections 3–14 of the
//    Request a Quote architecture document.
//    ========================================================= */
// (function () {
//     "use strict";

//     var form = document.getElementById("prcForm");
//     if (!form) return;

//     var steps = form.querySelectorAll(".prc-fieldset");
//     var stepBtns = document.querySelectorAll(".prc-step-btn");
//     var nextBtn = document.getElementById("prcNext");
//     var backBtn = document.getElementById("prcBack");
//     var submitBtn = document.getElementById("prcSubmit");
//     var errEl = document.getElementById("prcError");
//     var reviewEl = document.getElementById("prcReview");
//     var current = 1;
//     var TOTAL = steps.length;

//     function showStep(n, focus) {
//         n = Math.max(1, Math.min(TOTAL, n));
//         current = n;

//         steps.forEach(function (fs) {
//             fs.hidden = parseInt(fs.dataset.step, 10) !== n;
//         });
//         stepBtns.forEach(function (b) {
//             var on = parseInt(b.dataset.step, 10) === n;
//             b.classList.toggle("active", on);
//             if (on) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
//         });

//         backBtn.hidden = n === 1;
//         nextBtn.hidden = n === TOTAL;
//         submitBtn.hidden = n !== TOTAL;

//         if (n === TOTAL) buildReview();

//         if (focus) {
//             var first = steps[n - 1].querySelector("input, select, textarea, button");
//             if (first) first.focus({ preventScroll: true });
//             var target = document.getElementById("quoteForm");
//             if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
//         }
//     }

//     function val(id) {
//         var el = document.getElementById(id);
//         return el && !el.closest("[hidden]") ? (el.value || "").trim() : "";
//     }
//     function checked(name) {
//         var el = form.querySelector('input[name="' + name + '"]:checked');
//         return el ? el.value : "";
//     }
//     function pick(list, key) {
//         for (var i = 0; i < list.length; i++) {
//             var opt = list.options[i];
//             if (opt.value === key) return opt.textContent;
//         }
//         return key;
//     }

//     function esc(s) {
//         return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
//             return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
//         });
//     }

//     function validateStep(n) {
//         var msg = "", el = null;
//         if (n === 2) {
//             if (!val("prcFrom")) { msg = "Select an origin country."; el = document.getElementById("prcFrom"); }
//             else if (!val("prcTo")) { msg = "Select a destination country."; el = document.getElementById("prcTo"); }
//         } else if (n === 3) {
//             if (!val("prcItem")) { msg = "Tell us what is inside the shipment."; el = document.getElementById("prcItem"); }
//             else if (!(parseFloat(val("prcWeight")) > 0)) { msg = "Enter the shipment weight."; el = document.getElementById("prcWeight"); }
//         } else if (n === 5) {
//             if (val("prcName").length < 2) { msg = "Please enter your full name."; el = document.getElementById("prcName"); }
//             else {
//                 var phone = val("prcPhone"), digits = phone.replace(/\D/g, "");
//                 if (!/^[+0-9\s().-]+$/.test(phone) || digits.length < 7) {
//                     msg = "Enter a valid phone number."; el = document.getElementById("prcPhone");
//                 }
//             }
//         } else if (n === 6) {
//             if (!document.getElementById("prcTerms").checked) { msg = "Please acknowledge the quote terms."; el = document.getElementById("prcTerms"); }
//             else if (!document.getElementById("prcAccuracy").checked) { msg = "Please confirm your details are accurate."; el = document.getElementById("prcAccuracy"); }
//             else if (!document.getElementById("prcConsent").checked) { msg = "Please agree to be contacted."; el = document.getElementById("prcConsent"); }
//         }
//         if (msg) {
//             errEl.textContent = msg;
//             errEl.hidden = false;
//             if (el) { el.focus(); }
//             return false;
//         }
//         errEl.hidden = true;
//         return true;
//     }

//     function buildReview() {
//         if (!reviewEl) return;
//         var mode = checked("mode");
//         var modeLabels = { parcel: "Personal Parcel", commercial: "Commercial Export / Import", freight: "Air / Sea Freight", business: "Business / Corporate" };
//         var svcRad = form.querySelector('input[name="service"]:checked');
//         var svcLabel = svcRad ? svcRad.parentElement.querySelector("b").textContent : "—";
//         var ctype = document.getElementById("prcCustomerType");
//         var ctLabel = ctype ? pick(ctype, ctype.value) : "Individual";

//         var rows = [
//             ["Quote type", modeLabels[mode] || mode],
//             ["Route", val("prcFrom") + " → " + val("prcTo") + (val("prcCity") ? " (" + val("prcCity") + ")" : "")],
//             ["Category", pick(document.getElementById("prcCategory"), val("prcCategory"))],
//             ["Purpose", pick(document.getElementById("prcPurpose"), val("prcPurpose"))],
//             ["Contents", val("prcItem") || "—"],
//             ["Weight", val("prcWeight") ? val("prcWeight") + " " + val("prcWUnit") : "—"],
//             ["Dimensions", val("prcL") && val("prcW") && val("prcH") ? val("prcL") + " × " + val("prcW") + " × " + val("prcH") + " " + val("prcDUnit") : "Not provided"],
//             ["Pieces", val("prcPcs") || "1"],
//             ["Service", svcLabel],
//             ["Contact", val("prcName") + " · " + val("prcPhone")],
//             ["Customer type", ctLabel]
//         ];

//         reviewEl.innerHTML = rows.map(function (r) {
//             return '<div class="prc-review-row"><span>' + esc(r[0]) + "</span><strong>" + esc(r[1]) + "</strong></div>";
//         }).join("");
//     }

//     nextBtn.addEventListener("click", function () {
//         if (!validateStep(current)) return;
//         showStep(current + 1, true);
//     });
//     backBtn.addEventListener("click", function () { showStep(current - 1, true); });

//     stepBtns.forEach(function (b) {
//         b.addEventListener("click", function () {
//             var target = parseInt(b.dataset.step, 10);
//             if (target <= current) { showStep(target, true); return; }
//             /* validate every step up to target */
//             for (var i = current; i < target; i++) {
//                 if (!validateStep(i)) { showStep(i, true); return; }
//             }
//             showStep(target, true);
//         });
//     });

//     form.addEventListener("submit", function (e) {
//         e.preventDefault();
//         for (var i = 1; i <= TOTAL; i++) {
//             if (!validateStep(i)) { showStep(i, true); return; }
//         }
//         /* Demo: show success state. Replace with real POST endpoint. */
//         var ref = "QP" + Date.now().toString(36).toUpperCase().slice(-6);
//         var resultEl = document.getElementById("prcResult");
//         var summary = buildSummaryText();
//         if (resultEl) {
//             resultEl.innerHTML =
//                 '<div class="prc-success">' +
//                 '<div class="prc-success-ico"><i class="fa-solid fa-circle-check"></i></div>' +
//                 '<h3>Your Quote Request Has Been Received</h3>' +
//                 '<p>Thank you for contacting JP Express. Your quotation request has been submitted. Our team may review the shipment details and contact you if additional information is needed.</p>' +
//                 '<div class="prc-success-meta">' +
//                 '<div><span>Reference</span><strong>' + esc(ref) + '</strong></div>' +
//                 '<div><span>Submitted</span><strong>' + new Date().toLocaleString("en-GB") + '</strong></div>' +
//                 '</div>' +
//                 '<div class="prc-success-next"><h4>Next steps</h4><ol>' +
//                 '<li>Our team reviews your shipment details.</li>' +
//                 '<li>We may contact you for clarification.</li>' +
//                 '<li>We prepare and send your shipment-specific quote.</li>' +
//                 '</ol></div>' +
//                 '<div class="prc-success-actions">' +
//                 '<a class="btn-main btn-red" href="track-shipment.html">Track a Shipment</a>' +
//                 '<a class="btn-main btn-dark-outline" href="services.html">Explore Services</a>' +
//                 '</div>' +
//                 '<p class="prc-links"><a href="business.html#bizQuote">Regular or commercial shipper? Request business pricing</a></p>' +
//                 '</div>';
//         }
//         form.reset();
//         showStep(1, false);
//     });

//     function buildSummaryText() {
//         return "Quote request from " + val("prcFrom") + " to " + val("prcTo") +
//             " | " + val("prcItem") + " | " + val("prcWeight") + val("prcWUnit");
//     }

//     showStep(1, false);

//     /* Prefill from URL: quote.html?mode=parcel&dest=USA&weight=2&service=express */
//     (function prefill() {
//         var q = new URLSearchParams(window.location.search);
//         var m = q.get("mode");
//         if (m) {
//             var r = form.querySelector('input[name="mode"][value="' + m + '"]');
//             if (r) r.checked = true;
//         }
//         if (q.get("dest")) document.getElementById("prcTo").value = q.get("dest").slice(0, 60);
//         if (q.get("weight")) document.getElementById("prcWeight").value = parseFloat(q.get("weight")) || "";
//         if (q.get("service")) {
//             var s = form.querySelector('input[name="service"][value="' + q.get("service") + '"]');
//             if (s) s.checked = true;
//         }
//     })();

//     /* Prefill from URL: quote.html?mode=parcel&dest=USA&weight=2&service=express&item=...&city=...&pcs=2&l=30&w=20&h=10 (sizes in cm) */
//     (function prefill() {
//         var q = new URLSearchParams(window.location.search);
//         var m = q.get("mode");
//         if (m === "document") m = "parcel";
//         if (m) {
//             var r = form.querySelector('input[name="mode"][value="' + m + '"]');
//             if (r) r.checked = true;
//         }
//         function setVal(id, v) { var el = document.getElementById(id); if (el && v !== "" && v != null) el.value = v; }
//         function setUnit(id, unit) {
//             var el = document.getElementById(id);
//             if (!el) return false;
//             var keep = el.value;
//             el.value = unit;
//             if (el.value !== unit) { el.value = keep; return false; }
//             return true;
//         }
//         if (q.get("dest")) setVal("prcTo", q.get("dest").slice(0, 60));
//         if (q.get("weight")) { setVal("prcWeight", parseFloat(q.get("weight")) || ""); setUnit("prcWUnit", "kg"); }
//         setVal("prcItem", (q.get("item") || "").slice(0, 120));
//         setVal("prcCity", (q.get("city") || "").slice(0, 60));
//         var pcs = parseInt(q.get("pcs"), 10);
//         if (pcs > 0) setVal("prcPcs", Math.min(pcs, 999));
//         if (q.get("l") && q.get("w") && q.get("h") && setUnit("prcDUnit", "cm")) {
//             setVal("prcL", parseFloat(q.get("l")) || "");
//             setVal("prcW", parseFloat(q.get("w")) || "");
//             setVal("prcH", parseFloat(q.get("h")) || "");
//         }
//         if (q.get("service")) {
//             var s = form.querySelector('input[name="service"][value="' + q.get("service") + '"]');
//             if (s) s.checked = true;
//         }
//     })();
// })();