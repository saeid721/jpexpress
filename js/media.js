/* =========================================================
   JP EXPRESS - MEDIA PAGE LOGIC  (v2.0 — production)
   News listing + Image gallery + Lightbox + YouTube videos
   Requirements met:
   - Only youtube.com / youtu.be / embed URLs accepted (host whitelist)
   - Thumbnail-first click-to-load (no third-party JS until play)
   - 16:9 responsive, no autoplay-with-sound, clear fallback
   - Keyboard accessible lightbox (Esc, ←, →, focus trap)
   - Category filter + keyword search + Load More
   - URL state sync (?cat=, ?q=) for shareable links
   - Dynamic JSON-LD ItemList for currently rendered articles
   - Reduced-motion aware, lazy images below the fold
   Load AFTER js/main.js and js/data.js
   ========================================================= */
(function () {
    "use strict";

    var PAGE = document.documentElement.classList.contains("page-media-center");
    if (!PAGE) return;

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =========================================================
       DATA — replace these arrays with your Laravel API payload.
       ========================================================= */
    var MEDIA_NEWS = [
        {
            id: "service-updates",
            title: "JP Express service updates",
            slug: "service-updates",
            summary: "New routes, faster processing and improved shipment visibility for our customers.",
            image: "assets/hero-banner2.jpg",
            imageAlt: "JP Express service updates announcement",
            date: "2026-08-20",
            category: "services",
            categoryLabel: "Services",
            url: "news-detail.html?slug=service-updates"
        },
        {
            id: "new-destination",
            title: "New destination added: South Korea",
            slug: "new-destination",
            summary: "We have expanded our international courier network to South Korea with reliable transit times.",
            image: "assets/hero-banner3.jpg",
            imageAlt: "New destination South Korea shipping route",
            date: "2026-08-15",
            category: "announcements",
            categoryLabel: "Announcements",
            url: "news-detail.html?slug=new-destination"
        },
        {
            id: "office-event",
            title: "JP Express team training event",
            slug: "office-event",
            summary: "Our operations team completed a training program on international documentation and compliance.",
            image: "assets/stroy.jpg",
            imageAlt: "JP Express team training event",
            date: "2026-08-10",
            category: "events",
            categoryLabel: "Events",
            url: "news-detail.html?slug=office-event"
        },
        {
            id: "customs-update",
            title: "Updated customs documentation guidelines",
            slug: "customs-update",
            summary: "Important changes to export documentation requirements for selected destinations.",
            image: "assets/business-solution.jpg",
            imageAlt: "Updated customs documentation guidelines",
            date: "2026-08-05",
            category: "operations",
            categoryLabel: "Operations",
            url: "news-detail.html?slug=customs-update"
        },
        {
            id: "partnership",
            title: "New logistics partnership announced",
            slug: "partnership",
            summary: "We have partnered with a leading global carrier to improve transit times and service coverage.",
            image: "assets/container-ship.png",
            imageAlt: "New logistics partnership announcement",
            date: "2026-07-28",
            category: "announcements",
            categoryLabel: "Announcements",
            url: "news-detail.html?slug=partnership"
        },
        {
            id: "eid-schedule",
            title: "Eid holiday shipment schedule",
            slug: "eid-schedule",
            summary: "Adjusted pickup and delivery schedules during the Eid holiday period. Plan your shipments accordingly.",
            image: "assets/domestic-02.jpg",
            imageAlt: "Eid holiday shipment schedule announcement",
            date: "2026-07-20",
            category: "operations",
            categoryLabel: "Operations",
            url: "news-detail.html?slug=eid-schedule"
        }
    ];

    var MEDIA_GALLERY = [
        { id: "g1", image: "assets/hero-banner2.jpg", alt: "JP Express office team meeting", caption: "Office & Team", category: "office", date: "2026-08-01" },
        { id: "g2", image: "assets/hero-banner3.jpg", alt: "International courier shipment preparation", caption: "Shipment Operations", category: "operations", date: "2026-07-28" },
        { id: "g3", image: "assets/stroy.jpg", alt: "JP Express warehouse and packaging area", caption: "Packaging & Warehouse", category: "warehouse", date: "2026-07-22" },
        { id: "g4", image: "assets/business-solution.jpg", alt: "Company event and team gathering", caption: "Company Events", category: "events", date: "2026-07-15" },
        { id: "g5", image: "assets/container-ship.png", alt: "Sea freight container loading operations", caption: "Shipment Operations", category: "operations", date: "2026-07-10" },
        { id: "g6", image: "assets/domestic-02.jpg", alt: "JP Express office workspace", caption: "Office & Team", category: "office", date: "2026-07-02" },
        { id: "g7", image: "assets/Airliner-Orbiting-a-Glowing-Earth.png", alt: "Air freight aircraft loading", caption: "Shipment Operations", category: "operations", date: "2026-06-25" },
        { id: "g8", image: "assets/hero-banner.png", alt: "Packaging and labelling station", caption: "Packaging & Warehouse", category: "warehouse", date: "2026-06-18" }
    ];

    var MEDIA_VIDEOS = [
        {
            id: "v1",
            title: "JP Express: Who We Are",
            description: "A short introduction to JP Express international courier and logistics services from Bangladesh.",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            featured: true,
            order: 1
        },
        {
            id: "v2",
            title: "How to Prepare an International Shipment",
            description: "Step-by-step guidance on packaging, documentation and booking your shipment with JP Express.",
            youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
            featured: false,
            order: 2
        },
        {
            id: "v3",
            title: "Inside Our Logistics Operations",
            description: "See how JP Express handles shipments from pickup to international dispatch.",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            featured: false,
            order: 3
        }
    ];

    /* =========================================================
       UTILITIES
       ========================================================= */
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function formatDate(iso) {
        try {
            return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric"
            });
        } catch (e) {
            return iso;
        }
    }

    /* Host whitelist + strict ID format. Rejects arbitrary iframes. */
    function youtubeId(url) {
        if (!url) return "";
        var u;
        try { u = new URL(String(url).trim()); } catch (e) { return ""; }

        var host = u.hostname.replace(/^www\./, "").toLowerCase();
        var id = "";

        if (host === "youtu.be") {
            id = u.pathname.slice(1).split("/")[0];
        } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
            if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
            else if (u.pathname.indexOf("/embed/") === 0) id = u.pathname.split("/")[2] || "";
            else if (u.pathname.indexOf("/shorts/") === 0) id = u.pathname.split("/")[2] || "";
            else if (u.pathname.indexOf("/v/") === 0) id = u.pathname.split("/")[2] || "";
            else if (u.pathname.indexOf("/live/") === 0) id = u.pathname.split("/")[2] || "";
        }

        id = String(id).split(/[?&#]/)[0];
        return /^[A-Za-z0-9_-]{6,15}$/.test(id) ? id : "";
    }

    function youtubeThumb(id, hd) {
        return "https://i.ytimg.com/vi/" + id + "/" + (hd ? "maxresdefault" : "hqdefault") + ".jpg";
    }

    /* =========================================================
       1. NEWS & COMPANY UPDATES
       ========================================================= */
    (function news() {
        var grid = $("#newsGrid");
        if (!grid) return;

        var empty = $("#newsEmpty");
        var more = $("#newsMore");
        var count = $("#newsCount");
        var reset = $("#newsReset");
        var search = $("#newsSearch");
        var clear = $("#newsClear");
        var filterBtns = $$("[data-jp-filter]");

        var LIMIT = 6;
        var shown = LIMIT;
        var state = { cat: "all", q: "" };

        /* Read URL state once so shared links work */
        (function () {
            var qs = new URLSearchParams(location.search);
            if (qs.get("cat")) state.cat = qs.get("cat");
            if (qs.get("q")) { state.q = qs.get("q").slice(0, 60); if (search) search.value = state.q; }
        })();

        function syncUrl() {
            var u = new URLSearchParams();
            if (state.cat !== "all") u.set("cat", state.cat);
            if (state.q) u.set("q", state.q);
            var next = location.pathname + (u.toString() ? "?" + u.toString() : "");
            history.replaceState(null, "", next);
        }

        function card(item) {
            return '<article class="jp-news-card" data-category="' + esc(item.category) + '">' +
                '<a class="jp-news-media" href="' + esc(item.url) + '" aria-label="' + esc(item.title) + '">' +
                '<img class="jp-news-img" src="' + esc(item.image) + '" alt="' + esc(item.imageAlt || item.title) + '" loading="lazy" decoding="async" width="640" height="360">' +
                '<span class="jp-news-chip">' + esc(item.categoryLabel) + '</span>' +
                '</a>' +
                '<div class="jp-news-body">' +
                '<div class="jp-news-meta"><time datetime="' + esc(item.date) + '">' + esc(formatDate(item.date)) + '</time></div>' +
                '<h3 class="jp-news-title"><a href="' + esc(item.url) + '">' + esc(item.title) + '</a></h3>' +
                '<p class="jp-news-excerpt">' + esc(item.summary) + '</p>' +
                '<a class="jp-news-link" href="' + esc(item.url) + '">Read More <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
                '</div></article>';
        }

        function apply() {
            var q = state.q.toLowerCase();
            var list = MEDIA_NEWS.filter(function (n) {
                var catOk = state.cat === "all" || n.category === state.cat;
                var textOk = !q || (n.title + " " + n.summary + " " + n.categoryLabel).toLowerCase().indexOf(q) > -1;
                return catOk && textOk;
            });

            var page = list.slice(0, shown);
            grid.innerHTML = page.map(card).join("");

            empty.hidden = list.length > 0;
            more.hidden = page.length >= list.length;
            count.textContent = list.length
                ? "Showing " + page.length + " of " + list.length + (list.length === 1 ? " update" : " updates")
                : "";

            if (clear) clear.hidden = !state.q;

            filterBtns.forEach(function (b) {
                var on = b.getAttribute("data-jp-filter") === state.cat;
                b.classList.toggle("active", on);
                b.setAttribute("aria-pressed", String(on));
            });

            syncUrl();
            injectItemList(page);
        }

        /* ---- Dynamic JSON-LD ItemList for currently visible articles ---- */
        var ldScript = document.getElementById("media-itemlist-ld");
        function injectItemList(items) {
            if (!items.length) { if (ldScript) ldScript.remove(), ldScript = null; return; }
            if (!ldScript) {
                ldScript = document.createElement("script");
                ldScript.type = "application/ld+json";
                ldScript.id = "media-itemlist-ld";
                document.head.appendChild(ldScript);
            }
            ldScript.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "JP Express News & Updates",
                "itemListElement": items.map(function (n, i) {
                    return {
                        "@type": "ListItem",
                        "position": i + 1,
                        "name": n.title,
                        "url": "https://www.jpex.com.bd/" + n.url.replace(/^\//, "")
                    };
                })
            });
        }

        filterBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                state.cat = btn.getAttribute("data-jp-filter");
                shown = LIMIT;
                apply();
            });
        });

        if (search) {
            var debounce;
            search.addEventListener("input", function () {
                clearTimeout(debounce);
                debounce = setTimeout(function () {
                    state.q = search.value.trim();
                    shown = LIMIT;
                    apply();
                }, 180);
            });
        }
        if (clear) {
            clear.addEventListener("click", function () {
                if (search) search.value = "";
                state.q = "";
                shown = LIMIT;
                apply();
                if (search) search.focus();
            });
        }
        if (more) {
            more.addEventListener("click", function () { shown += LIMIT; apply(); });
        }
        if (reset) {
            reset.addEventListener("click", function () {
                state = { cat: "all", q: "" };
                shown = LIMIT;
                if (search) search.value = "";
                apply();
            });
        }

        apply();
    })();

    /* =========================================================
       2. IMAGE GALLERY + LIGHTBOX
       ========================================================= */
    (function gallery() {
        var grid = $("#galleryGrid");
        if (!grid) return;

        var empty = $("#galleryEmpty");
        var filterBtns = $$("[data-jp-gallery]");
        var items = [];
        var current = 0;

        function render(list) {
            grid.innerHTML = list.map(function (g, i) {
                return '<button type="button" class="jp-gallery-item" data-index="' + i + '" aria-label="View larger: ' + esc(g.caption || g.alt) + '">' +
                    '<img src="' + esc(g.image) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async" width="480" height="360">' +
                    '<span class="jp-gallery-overlay" aria-hidden="true">' +
                    '<span class="jp-gallery-caption"><i class="fa-solid fa-expand" aria-hidden="true"></i>' + esc(g.caption) + '</span>' +
                    '</span></button>';
            }).join("");
            items = list;
            empty.hidden = list.length > 0;
        }

        function applyFilter(cat) {
            var list = cat === "all"
                ? MEDIA_GALLERY.slice()
                : MEDIA_GALLERY.filter(function (g) { return g.category === cat; });
            render(list);
            filterBtns.forEach(function (b) {
                var on = b.getAttribute("data-jp-gallery") === cat;
                b.classList.toggle("active", on);
                b.setAttribute("aria-pressed", String(on));
            });
        }

        filterBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                applyFilter(btn.getAttribute("data-jp-gallery"));
            });
        });

        /* ---------- Lightbox ---------- */
        var lb = $("#lightbox");
        var lbImg = $("#lightboxImg");
        var lbCap = $("#lightboxCaption");
        var lbClose = $("#lightboxClose");
        var lbPrev = $("#lightboxPrev");
        var lbNext = $("#lightboxNext");
        var lastFocus = null;

        function open(i) {
            if (!items.length) return;
            current = (i + items.length) % items.length;
            var item = items[current];
            lbImg.src = item.image;
            lbImg.alt = item.alt;
            lbCap.textContent = item.caption + (item.date ? " · " + formatDate(item.date) : "");
            lb.hidden = false;
            /* Force reflow so transition plays on first open */
            void lb.offsetWidth;
            lb.classList.add("is-open");
            document.body.style.overflow = "hidden";
            lastFocus = document.activeElement;
            /* Focus the close button after paint */
            requestAnimationFrame(function () { lbClose.focus(); });
        }

        function close() {
            lb.classList.remove("is-open");
            /* Wait for transition before hiding */
            setTimeout(function () { lb.hidden = true; }, reduced ? 0 : 250);
            document.body.style.overflow = "";
            if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
        }

        function step(n) { open(current + n); }

        grid.addEventListener("click", function (e) {
            var btn = e.target.closest(".jp-gallery-item");
            if (btn) open(parseInt(btn.getAttribute("data-index"), 10) || 0);
        });

        lbClose.addEventListener("click", close);
        lbPrev.addEventListener("click", function () { step(-1); });
        lbNext.addEventListener("click", function () { step(1); });

        lb.addEventListener("click", function (e) {
            if (e.target === lb) close();
        });

        document.addEventListener("keydown", function (e) {
            if (lb.hidden) return;
            if (e.key === "Escape") { e.preventDefault(); close(); }
            else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
            else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
        });

        /* Focus trap inside the lightbox */
        lb.addEventListener("keydown", function (e) {
            if (e.key !== "Tab") return;
            var focusable = [lbClose, lbPrev, lbNext].filter(function (el) { return el && !el.disabled; });
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });

        applyFilter("all");
    })();

    /* =========================================================
       3. VIDEO GALLERY — thumbnail-first click-to-load
       ========================================================= */
    (function videos() {
        var featuredEl = $("#featuredVideo");
        var grid = $("#videoGrid");
        if (!grid) return;

        var empty = $("#videoEmpty");

        function loadPlayer(frame, id) {
            if (frame.getAttribute("data-loaded") === "1") return;
            frame.setAttribute("data-loaded", "1");
            var iframe = document.createElement("iframe");
            iframe.src = "https://www.youtube-nocookie.com/embed/" + id +
                "?autoplay=1&rel=0&playsinline=1&modestbranding=1";
            iframe.title = frame.getAttribute("data-title") || "JP Express video";
            iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
            iframe.setAttribute("allowfullscreen", "");
            iframe.setAttribute("loading", "lazy");
            iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "0";
            frame.innerHTML = "";
            frame.appendChild(iframe);
        }

        function frameHTML(v) {
            var id = youtubeId(v.youtubeUrl);
            var title = esc(v.title || "JP Express video");

            if (!id) {
                return '<div class="jp-video-frame" role="img" aria-label="Video unavailable">' +
                    '<div class="jp-video-fallback">' +
                    '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>' +
                    '<strong>Video unavailable</strong>' +
                    '<small>This video cannot be embedded right now. Please check back later.</small>' +
                    '</div></div>';
            }

            return '<div class="jp-video-frame" data-youtube-id="' + esc(id) + '" data-title="' + title + '">' +
                '<img src="' + esc(youtubeThumb(id)) + '" alt="' + title + '" loading="lazy" decoding="async" width="640" height="360">' +
                '<button type="button" class="jp-play-btn" aria-label="Play video: ' + title + '">' +
                '<i class="fa-solid fa-circle-play" aria-hidden="true"></i>' +
                '<span class="visually-hidden">Play</span>' +
                '</button></div>';
        }

        function card(v) {
            return '<article class="jp-video-card">' +
                frameHTML(v) +
                '<div class="jp-video-body">' +
                '<h3 class="jp-video-title">' + esc(v.title) + '</h3>' +
                (v.description ? '<p class="jp-video-desc">' + esc(v.description) + '</p>' : "") +
                '</div></article>';
        }

        function renderGrid() {
            var list = MEDIA_VIDEOS.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

            if (!list.length) {
                grid.innerHTML = "";
                if (empty) empty.hidden = false;
                if (featuredEl) featuredEl.innerHTML = "";
                return;
            }
            if (empty) empty.hidden = true;

            /* Featured video: first item flagged as featured, else first item */
            var featured = list.filter(function (v) { return v.featured; })[0] || list[0];
            if (featuredEl) {
                featuredEl.innerHTML = '<div class="jp-video-card jp-video-card--featured">' +
                    frameHTML(featured) +
                    '<div class="jp-video-body">' +
                    '<span class="jp-video-badge"><i class="fa-solid fa-star" aria-hidden="true"></i> Featured</span>' +
                    '<h3 class="jp-video-title">' + esc(featured.title) + '</h3>' +
                    (featured.description ? '<p class="jp-video-desc">' + esc(featured.description) + '</p>' : "") +
                    '</div></div>';
            }

            /* Remaining videos in the grid */
            var rest = list.filter(function (v) { return v !== featured; });
            grid.innerHTML = rest.map(card).join("");
        }

        renderGrid();

        /* One delegated click handler for every play button */
        document.addEventListener("click", function (e) {
            var btn = e.target.closest(".jp-play-btn");
            if (!btn) return;
            var frame = btn.closest(".jp-video-frame");
            if (!frame) return;
            var id = frame.getAttribute("data-youtube-id");
            if (id) loadPlayer(frame, id);
        });
    })();

})();



/* =========================================================
   JP EXPRESS — NEWS DETAIL PAGE LOGIC  (v1.0 — premium)
   Reads ?slug= from the URL and renders a full article.
   Requirements met:
   - Unique metadata (title, description, OG, Twitter, canonical)
   - Structured data: NewsArticle + BreadcrumbList
   - Share previews: WhatsApp, LinkedIn, Facebook, Copy link
   - Reading time + progress bar (respects prefers-reduced-motion)
   - Related articles (same category first, then latest)
   - Prev / Next navigation
   - Premium 404 / "not found" state with search + back CTA
   - Returns to Media (breadcrumb + bottom CTA)
   - Mobile-first, keyboard accessible
   Load AFTER js/main.js
   ========================================================= */
(function () {
    "use strict";

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =========================================================
       DATA — replace with Laravel API fetch when ready.
       e.g. fetch('/api/media/news/' + slug).then(r => r.json())
       ========================================================= */
    var MEDIA_NEWS = [
        {
            slug: "service-updates",
            title: "JP Express service updates",
            date: "2026-08-20",
            category: "services",
            categoryLabel: "Services",
            image: "assets/hero-banner2.jpg",
            imageAlt: "JP Express service updates announcement",
            summary: "New routes, faster processing and improved shipment visibility for our customers.",
            body:
                "<p>We have introduced new routes, faster processing and improved shipment visibility for our customers. This update is part of our ongoing investment in a faster, more transparent international courier experience from Bangladesh.</p>" +
                "<h2>What has changed</h2>" +
                "<ul>" +
                "<li>New consolidated routes reduce handling steps for major destinations.</li>" +
                "<li>Faster processing at our Dhaka origin facility.</li>" +
                "<li>Improved shipment visibility with more frequent status updates.</li>" +
                "</ul>" +
                "<h2>What this means for you</h2>" +
                "<p>Shipments booked on the updated routes may see earlier pickup cut-offs and clearer tracking information. Estimated transit times for the affected destinations remain within the ranges published on our country pages, and in many cases the door-to-door experience is more predictable.</p>" +
                "<blockquote>Our aim is simple: fewer surprises, faster replies and clear tracking from pickup to delivery.</blockquote>" +
                "<h2>Action for active shipments</h2>" +
                "<p>If you have an active shipment, please continue to track it using your tracking number. For anything unclear, contact our support desk with your tracking number and we will check the latest update for you.</p>" +
                "<h2>Need a quote?</h2>" +
                "<p>Request a quote for your next shipment and our team will confirm service, price, documents and pickup options for your route.</p>"
        },
        {
            slug: "new-destination",
            title: "New destination added: South Korea",
            date: "2026-08-15",
            category: "announcements",
            categoryLabel: "Announcements",
            image: "assets/hero-banner3.jpg",
            imageAlt: "New destination South Korea shipping route",
            summary: "We have expanded our international courier network to South Korea with reliable transit times.",
            body:
                "<p>JP Express is pleased to announce that South Korea is now a supported destination on our international courier network. This route is suitable for documents, personal parcels and small commercial shipments.</p>" +
                "<h2>Service overview</h2>" +
                "<ul>" +
                "<li>International courier with reliable estimated transit times.</li>" +
                "<li>Door-to-door delivery in major Korean cities.</li>" +
                "<li>Support for personal and commercial shipments with the correct documents.</li>" +
                "</ul>" +
                "<h2>Documents and restrictions</h2>" +
                "<p>Food, agricultural items, medicines and cosmetics in volume are subject to Korean import rules and may need additional documentation. Always confirm with our team before booking restricted categories.</p>"
        },
        {
            slug: "office-event",
            title: "JP Express team training event",
            date: "2026-08-10",
            category: "events",
            categoryLabel: "Events",
            image: "assets/stroy.jpg",
            imageAlt: "JP Express team training event",
            summary: "Our operations team completed a training program on international documentation and compliance.",
            body:
                "<p>Our operations and customer support teams completed a focused training program covering international documentation, compliance and handling of restricted categories.</p>" +
                "<h2>Why this matters</h2>" +
                "<p>Accurate documentation is one of the most common reasons a shipment is delayed at customs. By investing in regular team training, we reduce avoidable delays and give clearer guidance to customers before booking.</p>" +
                "<h2>What was covered</h2>" +
                "<ul>" +
                "<li>Commercial invoice and packing list accuracy</li>" +
                "<li>Destination-specific requirements for common routes</li>" +
                "<li>Restricted and prohibited item handling</li>" +
                "<li>Clear communication with customers at pickup and delivery</li>" +
                "</ul>"
        },
        {
            slug: "customs-update",
            title: "Updated customs documentation guidelines",
            date: "2026-08-05",
            category: "operations",
            categoryLabel: "Operations",
            image: "assets/business-solution.jpg",
            imageAlt: "Updated customs documentation guidelines",
            summary: "Important changes to export documentation requirements for selected destinations.",
            body:
                "<p>We have updated our internal customs documentation guidelines for selected destinations. The changes are designed to reduce avoidable holds and improve clearance consistency.</p>" +
                "<h2>What to prepare</h2>" +
                "<ul>" +
                "<li>Clear and accurate description of contents</li>" +
                "<li>Declared value consistent with the goods</li>" +
                "<li>Correct recipient details, including a reachable phone number</li>" +
                "<li>Product-specific certificates where required by the destination</li>" +
                "</ul>" +
                "<h2>Reminder</h2>" +
                "<p>Customs rules change. Always confirm current requirements with our team before booking shipments that fall under restricted categories.</p>"
        },
        {
            slug: "partnership",
            title: "New logistics partnership announced",
            date: "2026-07-28",
            category: "announcements",
            categoryLabel: "Announcements",
            image: "assets/container-ship.png",
            imageAlt: "New logistics partnership announcement",
            summary: "We have partnered with a leading global carrier to improve transit times and service coverage.",
            body:
                "<p>JP Express has partnered with a leading global carrier to improve transit times and expand service coverage for our commercial and personal shipments.</p>" +
                "<h2>What improves</h2>" +
                "<ul>" +
                "<li>Broader destination coverage</li>" +
                "<li>More predictable transit times on key routes</li>" +
                "<li>Improved visibility for commercial cargo</li>" +
                "</ul>" +
                "<p>Existing bookings continue without disruption. New bookings will progressively benefit from the expanded network.</p>"
        },
        {
            slug: "eid-schedule",
            title: "Eid holiday shipment schedule",
            date: "2026-07-20",
            category: "operations",
            categoryLabel: "Operations",
            image: "assets/domestic-02.jpg",
            imageAlt: "Eid holiday shipment schedule announcement",
            summary: "Adjusted pickup and delivery schedules during the Eid holiday period. Plan your shipments accordingly.",
            body:
                "<p>Pickup and delivery schedules are adjusted during the Eid holiday period. Please plan shipments accordingly and confirm timing with our team for time-sensitive items.</p>" +
                "<h2>Key points</h2>" +
                "<ul>" +
                "<li>Some routes may have a shortened daily cut-off.</li>" +
                "<li>Deliveries to certain destinations may take longer than usual.</li>" +
                "<li>Customer support remains available during the holiday hotline hours.</li>" +
                "</ul>" +
                "<p>Book early where possible. For urgent shipments, contact our team and we will confirm the best available option for your route.</p>"
        }
    ];

    /* =========================================================
       UTILITIES
       ========================================================= */
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
    function fmt(iso) {
        try {
            return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
                day: "2-digit", month: "long", year: "numeric"
            });
        } catch (e) { return iso; }
    }
    function stripHTML(html) {
        var d = document.createElement("div");
        d.innerHTML = html || "";
        return (d.textContent || d.innerText || "").trim();
    }
    function readingTime(html) {
        var words = stripHTML(html).split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(words / 220));
    }
    function sameOrigin(url) { return url.indexOf("http") === 0 ? url : "https://www.jpex.com.bd/" + url.replace(/^\//, ""); }

    /* =========================================================
       SCRIPT TAGS TO UPDATE (created once, updated per article)
       ========================================================= */
    function setMeta(sel, attr, value) {
        var el = document.querySelector(sel);
        if (!el) return;
        el.setAttribute(attr, value);
    }
    function upsertScript(id, json) {
        var el = document.getElementById(id);
        if (!el) {
            el = document.createElement("script");
            el.type = "application/ld+json";
            el.id = id;
            document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(json);
    }

    /* =========================================================
       RENDER — NOT FOUND
       ========================================================= */
    function renderNotFound(slug) {
        document.title = "Article not found | JP Express Media";

        /* Update meta to reflect the 404 */
        setMeta('meta[name="description"]', "content", "The news article you are looking for is not available. Browse JP Express media or search for another update.");
        setMeta('meta[property="og:title"]', "content", "Article not found | JP Express");
        setMeta('meta[property="og:description"]', "content", "The news article you are looking for is not available.");
        setMeta('link[rel="canonical"]', "href", "https://www.jpex.com.bd/media.html");

        /* Hide the hero, replace main content */
        var hero = document.getElementById("articleHero");
        if (hero) hero.hidden = true;

        var main = document.getElementById("article");
        if (main) {
            main.innerHTML =
                '<div class="news-empty">' +
                '<div class="news-empty-ico"><i class="fa-solid fa-newspaper" aria-hidden="true"></i></div>' +
                '<h1>We couldn\'t find that article</h1>' +
                '<p>The news update you are looking for may have been moved or is no longer available' +
                (slug ? ' (<code>' + esc(slug) + '</code>)' : '') + '.</p>' +
                '<div class="news-empty-actions">' +
                '<a class="btn-main btn-red" href="media.html#news"><i class="fa-solid fa-newspaper" aria-hidden="true"></i> Browse All News</a>' +
                '<a class="btn-main btn-dark-outline" href="contact.html"><i class="fa-solid fa-headset" aria-hidden="true"></i> Contact Support</a>' +
                '</div>' +
                '<form class="news-empty-search" action="media.html" method="get" role="search">' +
                '<label class="visually-hidden" for="emptySearch">Search news</label>' +
                '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
                '<input id="emptySearch" name="q" type="search" placeholder="Search news…" autocomplete="off">' +
                '<button type="submit">Search</button>' +
                '</form>' +
                '</div>';
        }
        var side = document.querySelector(".news-side");
        if (side) side.hidden = true;
    }

    /* =========================================================
       RENDER — ARTICLE
       ========================================================= */
    function renderArticle(item) {
        var absoluteUrl = "https://www.jpex.com.bd/news-detail.html?slug=" + encodeURIComponent(item.slug);
        var imageUrl = sameOrigin(item.image);
        var readMins = readingTime(item.body);

        /* -------- Title tag + meta -------- */
        document.title = item.title + " | JP Express Media";
        setMeta('meta[name="description"]', "content", item.summary);
        setMeta('meta[property="og:type"]', "content", "article");
        setMeta('meta[property="og:title"]', "content", item.title);
        setMeta('meta[property="og:description"]', "content", item.summary);
        setMeta('meta[property="og:image"]', "content", imageUrl);
        setMeta('meta[property="og:image:alt"]', "content", item.imageAlt || item.title);
        setMeta('meta[property="og:url"]', "content", absoluteUrl);
        setMeta('meta[name="twitter:title"]', "content", item.title);
        setMeta('meta[name="twitter:description"]', "content", item.summary);
        setMeta('meta[name="twitter:image"]', "content", imageUrl);
        setMeta('link[rel="canonical"]', "href", absoluteUrl);

        /* -------- Structured data: NewsArticle -------- */
        upsertScript("ld-news-article", {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "mainEntityOfPage": { "@type": "WebPage", "@id": absoluteUrl },
            "headline": item.title,
            "description": item.summary,
            "image": [imageUrl],
            "datePublished": item.date,
            "dateModified": item.date,
            "author": { "@type": "Organization", "name": "JP Express" },
            "publisher": {
                "@type": "Organization",
                "name": "JP Express",
                "logo": { "@type": "ImageObject", "url": "https://www.jpex.com.bd/assets/logo.png" }
            },
            "articleSection": item.categoryLabel,
            "inLanguage": "en-BD"
        });

        /* -------- Structured data: BreadcrumbList -------- */
        upsertScript("ld-breadcrumb", {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.jpex.com.bd/index.html" },
                { "@type": "ListItem", "position": 2, "name": "Media", "item": "https://www.jpex.com.bd/media.html" },
                { "@type": "ListItem", "position": 3, "name": item.title, "item": absoluteUrl }
            ]
        });

        /* -------- Hero bg (subtle blur, no layout cost) -------- */
        var heroBg = document.getElementById("heroBg");
        if (heroBg && item.image) {
            heroBg.style.backgroundImage = "url('" + item.image + "')";
        }

        /* -------- Crumb + chips -------- */
        var crumbTitle = document.getElementById("crumbTitle");
        if (crumbTitle) crumbTitle.textContent = item.title;

        var chipRow = document.getElementById("chipRow");
        if (chipRow) {
            chipRow.innerHTML =
                '<span class="news-chip news-chip--cat"><i class="fa-solid fa-tag" aria-hidden="true"></i> ' +
                esc(item.categoryLabel) + '</span>' +
                '<span class="news-chip news-chip--new"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Update</span>';
        }

        /* -------- Title, lede, meta -------- */
        var titleEl = document.getElementById("title");
        if (titleEl) titleEl.textContent = item.title;

        var lede = document.getElementById("lede");
        if (lede) lede.textContent = item.summary;

        var pubDate = document.getElementById("pubDate");
        if (pubDate) {
            pubDate.textContent = fmt(item.date);
            pubDate.setAttribute("datetime", item.date);
        }
        var readTime = document.getElementById("readTime");
        if (readTime) readTime.textContent = readMins + " min read";

        /* -------- Cover figure -------- */
        var coverFig = document.getElementById("coverFig");
        var coverImg = document.getElementById("coverImg");
        if (coverFig && coverImg && item.image) {
            coverImg.src = item.image;
            coverImg.alt = item.imageAlt || item.title;
            coverFig.hidden = false;
        }

        /* -------- Body -------- */
        var body = document.getElementById("body");
        if (body) body.innerHTML = item.body;

        /* -------- Actions visible -------- */
        var actions = document.getElementById("articleActions");
        if (actions) actions.hidden = false;

        /* -------- Share links -------- */
        var shareText = item.title + " — JP Express";
        var shareWa = document.getElementById("shareWa");
        var shareLi = document.getElementById("shareLi");
        var shareFb = document.getElementById("shareFb");

        if (shareWa) shareWa.href = "https://wa.me/?text=" + encodeURIComponent(shareText + " " + absoluteUrl);
        if (shareLi) shareLi.href = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(absoluteUrl);
        if (shareFb) shareFb.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(absoluteUrl);

        var copyBtn = document.getElementById("shareCopy");
        if (copyBtn) {
            copyBtn.addEventListener("click", function () {
                var done = function () {
                    copyBtn.classList.add("is-done");
                    var old = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
                    setTimeout(function () {
                        copyBtn.classList.remove("is-done");
                        copyBtn.innerHTML = old;
                    }, 1600);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(absoluteUrl).then(done, function () { });
                } else {
                    var ta = document.createElement("textarea");
                    ta.value = absoluteUrl;
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand("copy"); done(); } catch (e) { }
                    document.body.removeChild(ta);
                }
            });
        }

        /* -------- Related (sidebar) -------- */
        var related = MEDIA_NEWS
            .filter(function (n) { return n.slug !== item.slug; })
            .sort(function (a, b) {
                var catA = a.category === item.category ? 1 : 0;
                var catB = b.category === item.category ? 1 : 0;
                if (catA !== catB) return catB - catA;
                return b.date.localeCompare(a.date);
            });

        // Sidebar shows 4 compact items
        renderRelated(related.slice(0, 4), "sideRelated", "relatedList", true);

        // Bottom grid shows exactly 4 cards (one full row on desktop)
        renderBottomRelated(related.slice(0, 4), item);
        renderPrevNext(item);
    }

    /* =========================================================
       RELATED (SIDEBAR)
       ========================================================= */
    function renderRelated(items, wrapId, listId, compact) {
        var wrap = document.getElementById(wrapId);
        var list = document.getElementById(listId);
        if (!wrap || !list || !items.length) return;
        list.innerHTML = items.map(function (n) {
            return '<li>' +
                '<a href="news-detail.html?slug=' + encodeURIComponent(n.slug) + '">' +
                '<span class="news-side-thumb"><img src="' + esc(n.image) + '" alt="" width="80" height="60" loading="lazy" decoding="async"></span>' +
                '<span class="news-side-body">' +
                '<strong>' + esc(n.title) + '</strong>' +
                '<small><i class="fa-regular fa-calendar" aria-hidden="true"></i> ' + esc(fmt(n.date)) +
                ' · ' + esc(n.categoryLabel) + '</small>' +
                '</span>' +
                '<i class="fa-solid fa-chevron-right news-side-go" aria-hidden="true"></i>' +
                '</a></li>';
        }).join("");
        wrap.hidden = false;
    }

    /* =========================================================
       RELATED (BOTTOM GRID — uses existing news card styles)
       ========================================================= */
    function renderBottomRelated(items, current) {
        var section = document.getElementById("bottomRelated");
        var grid = document.getElementById("bottomGrid");
        if (!section || !grid || !items.length) return;

        // Show max 4 items so one full row appears on desktop
        var list = items.slice(0, 4);

        grid.innerHTML = list.map(function (n) {
            return '<article class="jp-news-card">' +
                '<a class="jp-news-media" href="news-detail.html?slug=' + encodeURIComponent(n.slug) + '" aria-label="' + esc(n.title) + '">' +
                '<img class="jp-news-img" src="' + esc(n.image) + '" alt="' + esc(n.imageAlt || n.title) + '" loading="lazy" decoding="async" width="640" height="360">' +
                '<span class="jp-news-chip">' + esc(n.categoryLabel) + '</span>' +
                '</a>' +
                '<div class="jp-news-body">' +
                '<div class="jp-news-meta"><time datetime="' + esc(n.date) + '">' + esc(fmt(n.date)) + '</time></div>' +
                '<h3 class="jp-news-title"><a href="news-detail.html?slug=' + encodeURIComponent(n.slug) + '">' + esc(n.title) + '</a></h3>' +
                '<p class="jp-news-excerpt">' + esc(n.summary) + '</p>' +
                '<a class="jp-news-link" href="news-detail.html?slug=' + encodeURIComponent(n.slug) + '">Read More <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
                '</div></article>';
        }).join("");
        section.hidden = false;
    }

    /* =========================================================
       PREV / NEXT
       ========================================================= */
    function renderPrevNext(current) {
        var nav = document.getElementById("pnNav");
        if (!nav) return;
        var sorted = MEDIA_NEWS.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
        var idx = sorted.findIndex(function (n) { return n.slug === current.slug; });
        if (idx < 0) return;

        var newer = idx > 0 ? sorted[idx - 1] : null;
        var older = idx < sorted.length - 1 ? sorted[idx + 1] : null;
        if (!newer && !older) return;

        nav.innerHTML =
            (newer
                ? '<a class="news-pn-item news-pn-prev" href="news-detail.html?slug=' + encodeURIComponent(newer.slug) + '">' +
                '<span class="news-pn-dir"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Newer</span>' +
                '<span class="news-pn-title">' + esc(newer.title) + '</span>' +
                '</a>'
                : '<span class="news-pn-item news-pn-empty" aria-hidden="true"></span>') +
            (older
                ? '<a class="news-pn-item news-pn-next" href="news-detail.html?slug=' + encodeURIComponent(older.slug) + '">' +
                '<span class="news-pn-dir">Older <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>' +
                '<span class="news-pn-title">' + esc(older.title) + '</span>' +
                '</a>'
                : '<span class="news-pn-item news-pn-empty" aria-hidden="true"></span>');
        nav.hidden = false;
    }

    /* =========================================================
       READING PROGRESS BAR
       ========================================================= */
    function initProgress() {
        if (reduced) return;
        var bar = document.getElementById("newsProgress");
        var fill = bar && bar.firstElementChild;
        if (!bar || !fill) return;

        var ticking = false;
        function update() {
            ticking = false;
            var doc = document.documentElement;
            var max = doc.scrollHeight - window.innerHeight;
            var y = window.scrollY || doc.scrollTop;
            var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
            fill.style.transform = "scaleX(" + p + ")";
        }
        window.addEventListener("scroll", function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        window.addEventListener("resize", update);
        update();
    }

    /* =========================================================
       INIT
       ========================================================= */
    function init() {
        var slug = new URLSearchParams(location.search).get("slug");
        var item = slug ? MEDIA_NEWS.filter(function (n) { return n.slug === slug; })[0] : null;

        if (!item) { renderNotFound(slug); return; }

        renderArticle(item);
        initProgress();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();