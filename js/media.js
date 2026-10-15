/* =========================================================
   JP EXPRESS - MEDIA PAGE LOGIC
   ========================================================= */
(function () {
    "use strict";

    var PAGE = document.documentElement.classList.contains("page-media-center");
    if (!PAGE) return;

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

        var LIMIT = window.matchMedia("(max-width: 767px)").matches ? 4 : 6;
        var shown = LIMIT;
        var state = { cat: "all", q: "" };

        /* Read URL state once so shared links work */
        (function () {
            var qs = new URLSearchParams(location.search);
            var CATS = ["all", "announcements", "services", "events", "operations"];
            if (qs.get("cat") && CATS.indexOf(qs.get("cat")) > -1) state.cat = qs.get("cat");
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
            var wasClosed = lb.hidden;
            current = (i + items.length) % items.length;
            var item = items[current];
            lbImg.src = item.image;
            lbImg.alt = item.alt;
            lbCap.textContent = (current + 1) + " / " + items.length + "  ·  " + item.caption +
                (item.date ? "  ·  " + formatDate(item.date) : "");

            /* Preload neighbours so next/prev feels instant */
            [1, -1].forEach(function (n) {
                var p = items[(current + n + items.length) % items.length];
                if (p) { new Image().src = p.image; }
            });

            if (wasClosed) {
                lastFocus = document.activeElement;
                lb.hidden = false;
                void lb.offsetWidth; /* reflow so transition plays */
                lb.classList.add("is-open");
                document.body.style.overflow = "hidden";
                requestAnimationFrame(function () { lbClose.focus(); });
            }
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

        /* Touch gestures: swipe ← → to navigate, swipe ↓ to close */
        var tX = 0, tY = 0;
        lb.addEventListener("touchstart", function (e) {
            tX = e.changedTouches[0].clientX;
            tY = e.changedTouches[0].clientY;
        }, { passive: true });
        lb.addEventListener("touchend", function (e) {
            var dx = e.changedTouches[0].clientX - tX;
            var dy = e.changedTouches[0].clientY - tY;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
            else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
        }, { passive: true });

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
        if (!grid || !featuredEl) return;

        var empty = $("#videoEmpty");
        var countEl = $("#videoCount");
        var bar = $(".jp-video-bar");
        var stageId = "";
        var cat = "all";
        var filtersEl = null;

        /* Keep only videos with a valid YouTube link, so a broken card never shows */
        var ALL = MEDIA_VIDEOS.map(function (v) {
            var o = {};
            for (var k in v) o[k] = v[k];
            o._id = youtubeId(v.youtubeUrl);
            return o;
        }).filter(function (v) {
            return v._id;
        }).sort(function (a, b) {
            return (a.order || 0) - (b.order || 0);
        });

        featuredEl.setAttribute("aria-live", "polite");

        /* ---------- YouTube IFrame API (loaded once, on first play) ---------- */
        var ytPromise = null;
        function loadYT() {
            if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
            if (ytPromise) return ytPromise;
            ytPromise = new Promise(function (resolve, reject) {
                var prev = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = function () {
                    if (typeof prev === "function") prev();
                    resolve(window.YT);
                };
                var s = document.createElement("script");
                s.src = "https://www.youtube.com/iframe_api";
                s.async = true;
                s.onerror = function () { ytPromise = null; reject(new Error("YT API blocked")); };
                document.head.appendChild(s);
                setTimeout(function () { reject(new Error("YT API timeout")); }, 12000);
            });
            return ytPromise;
        }

        /* ---------- Helpers for the custom player ---------- */
        var activePlayer = null;

        function fmtTime(s) {
            s = Math.max(0, Math.floor(s || 0));
            var m = Math.floor(s / 60), r = s % 60;
            return m + ":" + (r < 10 ? "0" : "") + r;
        }

        function destroyPlayer() {
            if (!activePlayer) return;
            clearInterval(activePlayer.timer);
            clearTimeout(activePlayer.hide);
            try { if (activePlayer.yt && activePlayer.yt.destroy) activePlayer.yt.destroy(); } catch (e) { }
            activePlayer = null;
        }

        function toggleFs(frame) {
            var cur = document.fullscreenElement || document.webkitFullscreenElement;
            if (cur) {
                (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            } else {
                var req = frame.requestFullscreen || frame.webkitRequestFullscreen;
                if (req) req.call(frame);
            }
        }

        /* ---------- Previous / next video ---------- */
        function go(delta, noWrap) {
            var i = -1;
            for (var k = 0; k < ALL.length; k++) {
                if (ALL[k].id === stageId) { i = k; break; }
            }
            var n = i + delta;
            if (n < 0 || n >= ALL.length) {
                if (noWrap) return false;
                n = (n + ALL.length) % ALL.length;
            }
            select(ALL[n].id);
            return true;
        }

        /* ---------- Friendly fallback if a video cannot play inside the page ---------- */
        function showFallback(frame, id, code) {
            destroyPlayer();
            frame.classList.remove("is-loading", "is-playing", "is-custom", "is-paused", "is-started", "show-ctrl");
            frame.classList.add("is-failed");

            var msg = "Please watch it directly on YouTube.";
            if (code === 101 || code === 150) msg = "The video owner has turned off playback on other websites.";
            if (code === "file") msg = "Open this page via http://localhost or your live domain.";

            frame.innerHTML =
                '<img src="' + esc(youtubeThumb(id, false)) + '" alt="" width="640" height="360">' +
                '<div class="jp-vfallback" role="alert">' +
                '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>' +
                '<strong>This video can\'t be played here</strong>' +
                '<span>' + esc(msg) + '</span>' +
                '<div class="jp-vfallback-actions">' +
                '<a class="jp-vbtn jp-vbtn--solid" href="https://www.youtube.com/watch?v=' + esc(id) + '" target="_blank" rel="noopener">' +
                '<i class="fa-brands fa-youtube" aria-hidden="true"></i> Watch on YouTube</a>' +
                (ALL.length > 1 ? '<button type="button" class="jp-vbtn jp-vbtn--dark" data-jp-next>' +
                    '<i class="fa-solid fa-forward-step" aria-hidden="true"></i> Next video</button>' : "") +
                '</div></div>';
        }

        /* ---------- Custom player (no YouTube title / logo) ---------- */
        function loadPlayer(frame, id) {
            if (!frame || frame.getAttribute("data-loaded") === "1") return;
            frame.setAttribute("data-loaded", "1");

            /* file:// has no referrer, YouTube always rejects it (Error 153) */
            if (location.protocol === "file:") { showFallback(frame, id, "file"); return; }

            destroyPlayer();
            frame.classList.add("is-custom", "is-loading");
            frame.innerHTML =
                '<div class="jp-yt-wrap"><div class="jp-yt-holder"></div></div>' +
                '<button type="button" class="jp-shield" aria-label="Play or pause video"></button>' +
                '<div class="jp-bigplay" aria-hidden="true"><i class="fa-solid fa-play"></i></div>' +
                '<div class="jp-ctrl">' +
                '<input class="jp-range" type="range" min="0" max="1000" step="1" value="0" aria-label="Seek">' +
                '<div class="jp-ctrl-row">' +
                '<div class="jp-ctrl-left">' +
                '<button type="button" class="jp-cbtn" data-a="prev" aria-label="Previous video"><i class="fa-solid fa-backward-step"></i></button>' +
                '<button type="button" class="jp-cbtn jp-cbtn--main" data-a="toggle" aria-label="Pause"><i class="fa-solid fa-pause"></i></button>' +
                '<button type="button" class="jp-cbtn" data-a="next" aria-label="Next video"><i class="fa-solid fa-forward-step"></i></button>' +
                '<span class="jp-time">0:00 / 0:00</span>' +
                '</div>' +
                '<div class="jp-ctrl-right">' +
                '<button type="button" class="jp-cbtn" data-a="mute" aria-label="Mute or unmute"><i class="fa-solid fa-volume-high"></i></button>' +
                '<button type="button" class="jp-cbtn" data-a="fs" aria-label="Fullscreen"><i class="fa-solid fa-expand"></i></button>' +
                '</div></div></div>';

            var range = frame.querySelector(".jp-range");
            var timeEl = frame.querySelector(".jp-time");
            var mainBtn = frame.querySelector('[data-a="toggle"]');
            var muteIcon = frame.querySelector('[data-a="mute"] i');
            var fsBtn = frame.querySelector('[data-a="fs"]');
            var P = { yt: null, timer: 0, hide: 0 };
            var dragging = false;
            activePlayer = P;

            if (!(frame.requestFullscreen || frame.webkitRequestFullscreen)) fsBtn.hidden = true;

            function ready() { return P.yt && P.yt.getDuration && P.yt.getPlayerState; }

            function setIcons(playing) {
                mainBtn.querySelector("i").className = "fa-solid " + (playing ? "fa-pause" : "fa-play");
                mainBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
                frame.classList.toggle("is-paused", !playing);
            }

            function tick() {
                if (!ready()) return;
                var d = P.yt.getDuration() || 0, c = P.yt.getCurrentTime() || 0;
                if (!dragging) {
                    var pct = d ? (c / d) * 100 : 0;
                    range.value = Math.round(pct * 10);
                    range.style.setProperty("--p", pct + "%");
                }
                timeEl.textContent = fmtTime(c) + " / " + fmtTime(d);
            }

            function showCtrl() {
                frame.classList.add("show-ctrl");
                clearTimeout(P.hide);
                P.hide = setTimeout(function () { frame.classList.remove("show-ctrl"); }, 2600);
            }

            function toggle() {
                if (!ready()) return;
                var s = P.yt.getPlayerState();
                if (s === 1 || s === 3) P.yt.pauseVideo(); else P.yt.playVideo();
            }

            /* tap / click on the video = play or pause */
            frame.querySelector(".jp-shield").addEventListener("click", function () { toggle(); showCtrl(); });
            frame.addEventListener("mousemove", showCtrl);
            frame.addEventListener("touchstart", showCtrl, { passive: true });

            /* control buttons */
            frame.querySelector(".jp-ctrl").addEventListener("click", function (e) {
                var b = e.target.closest("[data-a]");
                if (!b) return;
                var a = b.getAttribute("data-a");
                if (a === "next") { go(1); return; }
                if (a === "prev") { go(-1); return; }
                if (a === "fs") { toggleFs(frame); return; }
                if (!ready()) return;
                if (a === "toggle") toggle();
                if (a === "mute") {
                    if (P.yt.isMuted()) P.yt.unMute(); else P.yt.mute();
                    muteIcon.className = "fa-solid " + (P.yt.isMuted() ? "fa-volume-xmark" : "fa-volume-high");
                }
                showCtrl();
            });

            /* seek bar */
            range.addEventListener("input", function () {
                dragging = true;
                var pct = range.value / 10;
                range.style.setProperty("--p", pct + "%");
                if (ready()) {
                    var d = P.yt.getDuration() || 0;
                    timeEl.textContent = fmtTime(d * pct / 100) + " / " + fmtTime(d);
                }
            });
            range.addEventListener("change", function () {
                if (ready()) P.yt.seekTo((P.yt.getDuration() || 0) * range.value / 1000, true);
                dragging = false;
            });

            loadYT().then(function (YT) {
                if (activePlayer !== P || !document.body.contains(frame)) return;

                new YT.Player(frame.querySelector(".jp-yt-holder"), {
                    videoId: id,
                    width: "100%",
                    height: "100%",
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        rel: 0,
                        playsinline: 1,
                        modestbranding: 1,
                        iv_load_policy: 3,
                        origin: location.origin
                    },
                    events: {
                        onReady: function (e) {
                            P.yt = e.target;
                            frame.classList.remove("is-loading");
                            try {
                                var f = e.target.getIframe();
                                f.setAttribute("tabindex", "-1");
                                f.title = frame.getAttribute("data-title") || "JP Express video";
                                e.target.playVideo();
                            } catch (err) { }
                            P.timer = setInterval(tick, 250);
                            tick();
                            /* if the browser blocked autoplay, show the big play button */
                            setTimeout(function () {
                                if (ready()) {
                                    var s = P.yt.getPlayerState();
                                    if (s === -1 || s === 5) setIcons(false);
                                }
                            }, 1500);
                        },
                        onStateChange: function (e) {
                            var s = e.data;
                            if (s === 3) { frame.classList.add("is-loading"); return; }
                            frame.classList.remove("is-loading");
                            if (s === 1) { setIcons(true); showCtrl(); }
                            else if (s === 2 || s === 5) { setIcons(false); }
                            else if (s === 0) {
                                setIcons(false);
                                /* auto-play next video; on the last one, stay on the first frame */
                                setTimeout(function () {
                                    if (!go(1, true) && ready()) { P.yt.seekTo(0, true); P.yt.pauseVideo(); }
                                }, 0);
                            }
                        },
                        onError: function (e) { showFallback(frame, id, e.data); }
                    }
                });
            }).catch(function () { showFallback(frame, id); });
        }

        /* ---------- Thumbnail + play button ---------- */
        function frameHTML(v, o) {
            o = o || {};
            var title = esc(v.title || "JP Express video");
            return '<div class="jp-video-frame" data-youtube-id="' + esc(v._id) + '" data-title="' + title + '">' +
                '<img src="' + esc(youtubeThumb(v._id, o.hd)) + '" alt="" ' +
                (o.hd ? 'data-yt-hd="' + esc(v._id) + '" ' : "") +
                'loading="' + (o.eager ? "eager" : "lazy") + '" decoding="async" width="640" height="360">' +
                (v.duration ? '<span class="jp-vdur">' + esc(v.duration) + '</span>' : "") +
                '<button type="button" class="jp-play-btn" aria-label="Play video: ' + title + '">' +
                '<i class="fa-solid fa-circle-play" aria-hidden="true"></i>' +
                '<span class="visually-hidden">Play</span>' +
                '</button></div>';
        }

        /* ---------- Big player (featured / now playing) ---------- */
        function renderStage(v, autoplay) {
            destroyPlayer();
            stageId = v.id;
            var label = autoplay ? "Now playing" : (v.featured ? "Featured" : "Latest");
            var icon = autoplay ? "play" : "star";

            var meta = [];
            if (v.categoryLabel) meta.push('<li><i class="fa-solid fa-tag" aria-hidden="true"></i>' + esc(v.categoryLabel) + '</li>');
            if (v.duration) meta.push('<li><i class="fa-regular fa-clock" aria-hidden="true"></i>' + esc(v.duration) + '</li>');

            featuredEl.innerHTML =
                '<div class="jp-stage">' +
                '<div class="jp-stage-player">' + frameHTML(v, { hd: true, eager: true }) + '</div>' +
                '<div class="jp-stage-info">' +
                '<span class="jp-video-badge"><i class="fa-solid fa-' + icon + '" aria-hidden="true"></i> ' + label + '</span>' +
                '<h3 class="jp-stage-title" tabindex="-1">' + esc(v.title) + '</h3>' +
                (v.description ? '<p class="jp-stage-desc">' + esc(v.description) + '</p>' : "") +
                (meta.length ? '<ul class="jp-stage-meta">' + meta.join("") + '</ul>' : "") +
                '<div class="jp-stage-actions">' +
                '<a class="jp-vbtn jp-vbtn--solid" href="https://www.youtube.com/watch?v=' + esc(v._id) + '" target="_blank" rel="noopener">' +
                '<i class="fa-brands fa-youtube" aria-hidden="true"></i> Watch on YouTube</a>' +
                '<button type="button" class="jp-vbtn jp-vbtn--ghost" data-copy="https://youtu.be/' + esc(v._id) + '">' +
                '<i class="fa-solid fa-link" aria-hidden="true"></i><span>Copy link</span></button>';

            if (autoplay) loadPlayer(featuredEl.querySelector(".jp-video-frame"), v._id);
        }

        /* ---------- Grid cards ---------- */
        function card(v) {
            return '<article class="jp-video-card jp-vcard" data-vid="' + esc(v.id) + '">' +
                frameHTML(v) +
                '<div class="jp-video-body">' +
                (v.categoryLabel ? '<span class="jp-vcat">' + esc(v.categoryLabel) + '</span>' : "") +
                '<h3 class="jp-video-title">' + esc(v.title) + '</h3>' +
                (v.description ? '<p class="jp-video-desc">' + esc(v.description) + '</p>' : "") +
                '<span class="jp-vwatch">Watch now <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>' +
                '</div></article>';
        }

        function renderGrid() {
            var rest = ALL.filter(function (v) {
                return v.id !== stageId && (cat === "all" || v.category === cat);
            });
            grid.innerHTML = rest.map(card).join("");
            if (countEl) countEl.textContent = rest.length + (rest.length === 1 ? " video" : " videos");
            if (bar) bar.hidden = ALL.length < 2;
            if (filtersEl) {
                $$("[data-vcat]", filtersEl).forEach(function (b) {
                    var on = b.getAttribute("data-vcat") === cat;
                    b.classList.toggle("active", on);
                    b.setAttribute("aria-pressed", String(on));
                });
            }
        }

        /* ---------- Category chips (only when there are enough videos) ---------- */
        function buildFilters() {
            var map = {}, order = [];
            ALL.forEach(function (v) {
                if (v.category && !map[v.category]) {
                    map[v.category] = v.categoryLabel || v.category;
                    order.push(v.category);
                }
            });
            if (ALL.length < 5 || order.length < 2 || !bar) return;

            filtersEl = document.createElement("div");
            filtersEl.className = "jp-video-filters";
            filtersEl.setAttribute("role", "group");
            filtersEl.setAttribute("aria-label", "Filter videos by category");
            filtersEl.innerHTML =
                '<button class="jp-filter active" type="button" data-vcat="all" aria-pressed="true">All</button>' +
                order.map(function (k) {
                    return '<button class="jp-filter" type="button" data-vcat="' + esc(k) + '" aria-pressed="false">' + esc(map[k]) + '</button>';
                }).join("");
            bar.insertAdjacentElement("afterend", filtersEl);

            filtersEl.addEventListener("click", function (e) {
                var b = e.target.closest("[data-vcat]");
                if (!b) return;
                cat = b.getAttribute("data-vcat");
                renderGrid();
            });
        }

        /* ---------- Move a grid video into the big player ---------- */
        function select(id) {
            var v = ALL.filter(function (x) { return x.id === id; })[0];
            if (!v) return;
            renderStage(v, true);
            renderGrid();

            var hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--jp-header-h")) || 70;
            var top = featuredEl.getBoundingClientRect().top;
            if (top < hh + 8) {
                window.scrollBy({ top: top - hh - 16, behavior: reduced ? "auto" : "smooth" });
            }
            var t = featuredEl.querySelector(".jp-stage-title");
            if (t) t.focus({ preventScroll: true });
        }

        /* ---------- Copy link ---------- */
        function copyLink(btn) {
            var text = btn.getAttribute("data-copy");
            var label = btn.querySelector("span");
            var old = label.textContent;
            function done(ok) {
                label.textContent = ok ? "Link copied" : "Copy failed";
                btn.classList.toggle("is-done", ok);
                setTimeout(function () { label.textContent = old; btn.classList.remove("is-done"); }, 1800);
            }
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
            } else {
                var ta = document.createElement("textarea");
                ta.value = text;
                ta.style.cssText = "position:fixed;opacity:0";
                document.body.appendChild(ta);
                ta.select();
                var ok = false;
                try { ok = document.execCommand("copy"); } catch (err) { }
                document.body.removeChild(ta);
                done(ok);
            }
        }

        /* ---------- Events ---------- */
        featuredEl.addEventListener("click", function (e) {
            var play = e.target.closest(".jp-play-btn");
            if (play) {
                var frame = play.closest(".jp-video-frame");
                if (frame) loadPlayer(frame, frame.getAttribute("data-youtube-id"));
                return;
            }
            var cp = e.target.closest("[data-copy]");
            if (cp) { copyLink(cp); return; }
            if (e.target.closest("[data-jp-next]")) go(1);
        });

        grid.addEventListener("click", function (e) {
            var c = e.target.closest(".jp-vcard");
            if (c) select(c.getAttribute("data-vid"));
        });

        /* If a max-quality thumbnail does not exist, fall back to the standard one */
        document.addEventListener("error", function (e) {
            var img = e.target;
            if (img && img.tagName === "IMG" && img.hasAttribute("data-yt-hd") && !img.getAttribute("data-fb")) {
                img.setAttribute("data-fb", "1");
                img.src = youtubeThumb(img.getAttribute("data-yt-hd"), false);
            }
        }, true);

        /* ---------- Init ---------- */
        if (!ALL.length) {
            featuredEl.innerHTML = "";
            grid.innerHTML = "";
            if (bar) bar.hidden = true;
            if (empty) empty.hidden = false;
            return;
        }
        if (empty) empty.hidden = true;

        buildFilters();
        renderStage(ALL.filter(function (v) { return v.featured; })[0] || ALL[0], false);
        renderGrid();
    })();

})();


(function () {
    "use strict";

    /* Run ONLY on the news detail page (it has #article). Stops the Media page title being overwritten. */
    if (!document.getElementById("article")) return;

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


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

        // Sidebar shows 3 compact items
        renderRelated(related.slice(0, 3), "sideRelated", "relatedList", true);

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
            var href = 'news-detail.html?slug=' + encodeURIComponent(n.slug);
            return '<article class="jp-news-card" data-category="' + esc(n.category) + '">' +
                '<a class="jp-news-media" href="' + href + '" tabindex="-1" aria-hidden="true">' +
                '<img class="jp-news-img" src="' + esc(n.image) + '" alt="" loading="lazy" decoding="async" width="640" height="360">' +
                '<span class="jp-news-chip">' + esc(n.categoryLabel) + '</span>' +
                '</a>' +
                '<div class="jp-news-body">' +
                '<div class="jp-news-meta">' +
                '<time datetime="' + esc(n.date) + '">' + esc(fmt(n.date)) + '</time>' +
                '<span class="jp-news-dot" aria-hidden="true"></span>' +
                '<span>' + readingTime(n.body) + ' min read</span>' +
                '</div>' +
                '<h3 class="jp-news-title"><a href="' + href + '">' + esc(n.title) + '</a></h3>' +
                '<p class="jp-news-excerpt">' + esc(n.summary) + '</p>' +
                '<span class="jp-news-link">Read More <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>' +
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