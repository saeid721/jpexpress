/* =========================================================
   JP EXPRESS — SHIPPING GUIDES PAGE LOGIC
   §6 guide template + modal, §7 checklist,
   §10 a11y (keyboard, ARIA, focus trap), §12 wireframe flow.
   ========================================================= */
(function () {
    "use strict";
    if (!document.documentElement.classList.contains("page-shipping-guides")) return;

    const $ = (s, r) => (r || document).querySelector(s);
    const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------------------------------------------------
       §6 GUIDE DATA — approved content only.
       Each category card maps to a guide object with the required
       template fields. Management must approve wording before publish.
       --------------------------------------------------------- */
    const GUIDES = {
        "cat-shipping": {
            title: "How to Send a Parcel",
            summary: "A step-by-step walkthrough from choosing a service to handing over your parcel.",
            audience: "First-time senders, families and individuals.",
            steps: [
                "Choose a destination and service that matches your needs.",
                "Confirm whether your item is eligible to ship.",
                "Pack and label your parcel correctly.",
                "Prepare recipient details and any required documents.",
                "Book or arrange pickup/drop-off.",
                "Track your shipment until delivery."
            ],
            checklist: [
                "Recipient name, address and phone number",
                "Accurate description of contents",
                "Correct weight and dimensions (if required)",
                "Suitable packaging and labelling",
                "Any required documents or ID"
            ],
            mistakes: [
                "Incomplete or unclear recipient address",
                "Under-declaring value or contents",
                "Insufficient packaging for fragile items"
            ],
            related: [
                { label: "Packaging & Labeling", href: "#cat-packaging" },
                { label: "Restricted & Prohibited", href: "#cat-restricted" }
            ],
            cta: { label: "Get a Quote", href: "quote.html" }
        },
        "cat-packaging": {
            title: "Packaging & Labeling",
            summary: "How to protect your shipment and label it correctly to avoid delays.",
            audience: "Anyone sending parcels, samples or fragile items.",
            steps: [
                "Choose a strong, correctly sized outer box.",
                "Cushion all sides so contents cannot move.",
                "Seal liquids in leak-proof bags.",
                "Write or print the full recipient address clearly.",
                "Attach the label securely on the largest flat surface.",
                "Mark fragile items where appropriate."
            ],
            checklist: [
                "Strong outer box",
                "Internal cushioning on all sides",
                "Leak-proof sealing for liquids",
                "Clear, correct address label",
                "Fragile handling markings (if needed)"
            ],
            mistakes: [
                "Over- or under-sized boxes",
                "Loose items moving inside the box",
                "Labels that are hard to read or poorly attached"
            ],
            related: [
                { label: "How to Send a Parcel", href: "#cat-shipping" },
                { label: "Shipping Documents", href: "#cat-documents" }
            ],
            cta: { label: "Get a Quote", href: "quote.html" }
        },
        "cat-documents": {
            title: "Shipping Documents",
            summary: "What paperwork to prepare and why it matters for a smooth shipment.",
            audience: "Shippers of commercial goods, samples and export cargo.",
            steps: [
                "Confirm the document requirements for your destination.",
                "Prepare a commercial invoice if shipping goods.",
                "Include a packing list for multiple items.",
                "Check that names, values and descriptions are accurate.",
                "Attach or share documents as required by JP Express.",
                "Keep copies for your records."
            ],
            checklist: [
                "Commercial invoice (if applicable)",
                "Packing list (if applicable)",
                "Accurate description and declared value",
                "Recipient details matching the destination",
                "Copies retained for your records"
            ],
            mistakes: [
                "Inaccurate or vague item descriptions",
                "Mismatch between invoice and actual contents",
                "Missing recipient contact information"
            ],
            related: [
                { label: "Customs Basics", href: "#cat-customs" },
                { label: "Business Shipping", href: "#cat-business" }
            ],
            cta: { label: "Contact Support", href: "contact.html" }
        },
        "cat-customs": {
            title: "Customs Basics",
            summary: "Understand declarations, duties and clearance — with no guarantees on outcomes.",
            audience: "Anyone shipping internationally.",
            steps: [
                "Provide accurate contents and declared value.",
                "Know that customs decisions are made by destination authorities.",
                "Expect that duties or taxes may apply and are separate from shipping charges.",
                "Respond promptly if more information is requested.",
                "Track your shipment through customs processing.",
                "Contact support if you are unsure about requirements."
            ],
            checklist: [
                "Accurate declared value",
                "Clear item description",
                "Recipient contact details",
                "Any destination-specific documents requested",
                "Awareness that duties/taxes may apply"
            ],
            mistakes: [
                "Under-declaring value",
                "Assuming customs will not charge duties",
                "Missing or inconsistent documents"
            ],
            related: [
                { label: "Shipping Documents", href: "#cat-documents" },
                { label: "Restricted & Prohibited", href: "#cat-restricted" }
            ],
            cta: { label: "Contact Support", href: "contact.html" }
        },
        "cat-restricted": {
            title: "Restricted & Prohibited Items",
            summary: "Check what can and cannot be shipped before you book.",
            audience: "All senders, especially those sending unusual or high-value items.",
            steps: [
                "Read the restricted items list.",
                "Confirm whether your item needs special handling.",
                "Contact support if unsure about eligibility.",
                "Do not attempt to ship prohibited items.",
                "Declare restricted items accurately when booking.",
                "Prepare any additional documents if required."
            ],
            checklist: [
                "Item checked against restricted list",
                "Eligibility confirmed with support (if unsure)",
                "Correct declaration of contents",
                "Required documents prepared",
                "No prohibited items included"
            ],
            mistakes: [
                "Attempting to ship prohibited items",
                "Not declaring restricted items",
                "Ignoring destination-specific restrictions"
            ],
            related: [
                { label: "Customs Basics", href: "#cat-customs" },
                { label: "International Tips", href: "#cat-international" }
            ],
            cta: { label: "Contact Support", href: "contact.html" }
        },
        "cat-international": {
            title: "International Shipping Tips",
            summary: "Practical advice for smoother cross-border shipments.",
            audience: "Individuals and businesses shipping internationally.",
            steps: [
                "Check destination requirements before booking.",
                "Confirm transit expectations with your service choice.",
                "Provide complete and accurate recipient details.",
                "Prepare for possible customs processing time.",
                "Keep tracking information handy.",
                "Contact support early if anything is unclear."
            ],
            checklist: [
                "Destination requirements checked",
                "Service and transit expectations reviewed",
                "Complete recipient contact details",
                "Documentation prepared",
                "Tracking plan in place"
            ],
            mistakes: [
                "Assuming all destinations follow the same rules",
                "Unrealistic transit expectations",
                "Incomplete recipient information"
            ],
            related: [
                { label: "Customs Basics", href: "#cat-customs" },
                { label: "Packaging & Labeling", href: "#cat-packaging" }
            ],
            cta: { label: "Get a Quote", href: "quote.html" }
        },
        "cat-business": {
            title: "Business Shipping",
            summary: "Guidance for e-commerce, SMEs and commercial shippers.",
            audience: "Exporters, online sellers, SMEs and buying houses.",
            steps: [
                "Identify the destination and shipment volume.",
                "Choose a service that matches urgency and budget.",
                "Prepare commercial documentation.",
                "Confirm packaging for commercial goods.",
                "Arrange regular pickup if you ship frequently.",
                "Track each shipment and keep records."
            ],
            checklist: [
                "Commercial invoice and packing list",
                "Accurate product descriptions and values",
                "Packaging suitable for commercial goods",
                "Regular pickup schedule (if applicable)",
                "Tracking records maintained"
            ],
            mistakes: [
                "Inconsistent commercial documentation",
                "Under-packaging bulk goods",
                "No tracking or record-keeping process"
            ],
            related: [
                { label: "Shipping Documents", href: "#cat-documents" },
                { label: "Customs Basics", href: "#cat-customs" }
            ],
            cta: { label: "Talk to Business Desk", href: "business.html" }
        }
    };

    /* ---------------------------------------------------------
       §6 GUIDE MODAL — focus trap, ESC, restore focus
       --------------------------------------------------------- */
    const modal = $("#sgModal");
    const modalTitle = $("#sgModalTitle");
    const modalKicker = $("#sgModalKicker");
    const modalSummary = $("#sgModalSummary");
    const modalBody = $("#sgModalBody");
    const items = $$("[data-sg-item]");
    let lastFocus = null;

    const esc = (s) =>
        String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));

    const ul = (arr) =>
        `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;

    function openGuide(id) {
        const g = GUIDES[id];
        if (!g) return;
        lastFocus = document.activeElement;

        modalKicker.textContent = "GUIDE";
        modalTitle.textContent = g.title;
        modalSummary.textContent = g.summary;

        modalBody.innerHTML = `
      <section class="sg-modal-block">
        <h3><i class="fa-solid fa-users" aria-hidden="true"></i> Who this is for</h3>
        <p>${esc(g.audience)}</p>
      </section>
      <section class="sg-modal-block">
        <h3><i class="fa-solid fa-list-ol" aria-hidden="true"></i> Steps</h3>
        <ol>${g.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      </section>
      <section class="sg-modal-block">
        <h3><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> Checklist</h3>
        ${ul(g.checklist)}
      </section>
      <section class="sg-modal-block sg-modal-warn">
        <h3><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Common mistakes</h3>
        ${ul(g.mistakes)}
      </section>
      <section class="sg-modal-block">
        <h3><i class="fa-solid fa-link" aria-hidden="true"></i> Related guides</h3>
        <div class="sg-modal-related">
          ${g.related.map((r) => `<a href="${esc(r.href)}" data-sg-related>${esc(r.label)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`).join("")}
        </div>
      </section>
      <div class="sg-modal-cta">
        <a class="btn-main btn-red" href="${esc(g.cta.href)}">${esc(g.cta.label)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
        <a class="btn-main sg-btn-ghost" href="contact.html">Contact Support</a>
      </div>
      <p class="sg-modal-note"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> This guide is practical preparation guidance. Confirm operational details, rates and policy with JP Express before booking.</p>
    `;

        modal.hidden = false;
        document.body.classList.add("sg-modal-open");
        modalTitle.focus();

        // Related links inside modal just scroll to category and close
        $$("[data-sg-related]", modalBody).forEach((a) => {
            a.addEventListener("click", (e) => {
                e.preventDefault();
                const href = a.getAttribute("href") || "";
                const target = href.startsWith("#") ? document.querySelector(href) : null;
                closeModal();
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
                        target.focus({ preventScroll: true });
                    }, 120);
                } else {
                    window.location.href = href;
                }
            });
        });
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("sg-modal-open");
        if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    items.forEach((card) => {
        card.addEventListener("click", () => openGuide(card.id));
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openGuide(card.id);
            }
        });
    });

    $$("[data-sg-close]").forEach((el) => el.addEventListener("click", closeModal));

    // Focus trap + ESC
    document.addEventListener("keydown", (e) => {
        if (modal.hidden) return;
        if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
        if (e.key !== "Tab") return;
        const focusables = $$(
            'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])',
            modal
        ).filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* ---------------------------------------------------------
       §7 CHECKLIST PROGRESS
       --------------------------------------------------------- */
    const checks = $$("[data-sg-check]");
    const progressText = $("[data-sg-progress]");
    const progressBar = $("[data-sg-progress-bar]");
    if (checks.length) {
        const update = () => {
            const done = checks.filter((c) => c.checked).length;
            progressText.textContent = `${done} of ${checks.length} prepared`;
            progressBar.style.width = `${(done / checks.length) * 100}%`;
        };
        checks.forEach((c) => c.addEventListener("change", update));
        update();
    }
})();