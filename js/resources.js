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
    var WA_PHONE = "8801681637836";

    /* ---------- Settings: set `file` to a real path to turn a request into a download ---------- */
    var DOWNLOADS = [
        { icon: "fa-file-signature", title: "Export Documentation Checklist", text: "A printable list of documents commonly needed for export shipments.", file: "" },
        { icon: "fa-triangle-exclamation", title: "Restricted & Prohibited Items", text: "A quick reference of item types that need care or cannot be shipped.", file: "" },
        { icon: "fa-box", title: "Packaging Guide", text: "Simple packing steps for parcels and fragile items.", file: "" },
        { icon: "fa-earth-asia", title: "Country Shipping Guide", text: "Destination requirements and customs considerations.", file: "" }
    ];

    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
    function wa(text) { return "https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(text); }

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
        dl.innerHTML = DOWNLOADS.map(function (d) {
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