
/* =========================================================
   BLOG LISTING PAGE LOGIC — WITH STATIC DATA
   - Blog data is defined inline below (no external file needed).
   - Replace BLOG_POSTS with API data when ready.
   - Cards link to blog-detail.html?slug=<slug>
   ========================================================= */
(function () {
    'use strict';

    /* ---------- STATIC BLOG DATA (replace with API later) ---------- */
    var BLOG_CATS = {
        'courier-news': 'International Courier & Shipping',
        'export-tips': 'Export & Import',
        'logistics': 'Freight Forwarding & Cargo',
        'customs': 'Customs Clearance & Documentation',
        'packaging': 'Packaging & Shipment Preparation',
        'country-guide': 'Country & Destination Guides',
        'business-growth': 'Business Shipping & E-commerce',
        'news': 'JP Express News & Service Updates'
    };

    var BLOG_POSTS = [
        {
            slug: 'first-export-shipment',
            category: 'export-tips',
            categoryLabel: 'Export & Import',
            title: 'How to prepare your first export shipment from Bangladesh',
            excerpt: 'The essential steps before your goods leave Dhaka.',
            longExcerpt: 'A clear, practical checklist for documents, packaging, customs and the decisions that make an international shipment run smoothly.',
            date: '2026-08-18',
            readTime: 8,
            featured: true,
            author: 'JP Express Editorial Team',
            image: 'assets/business-solution.jpg',
            alt: 'Preparing an export shipment from Bangladesh with documents and cargo'
        },
        {
            slug: 'shipping-to-usa',
            category: 'country-guide',
            categoryLabel: 'Country & Destination Guides',
            title: 'Shipping to the USA: documents, duties and delivery times',
            excerpt: 'What Bangladeshi shippers should know before booking.',
            date: '2026-08-12',
            readTime: 6,
            author: 'JP Express Editorial Team',
            image: 'assets/hero-banner2.jpg',
            alt: 'Shipping to the USA from Bangladesh'
        },
        {
            slug: 'packaging-mistakes',
            category: 'packaging',
            categoryLabel: 'Packaging & Shipment Preparation',
            title: '7 packaging mistakes that cause shipping damage',
            excerpt: 'Protect fragile products and reduce avoidable delivery issues.',
            date: '2026-08-08',
            readTime: 5,
            author: 'JP Express Editorial Team',
            image: 'assets/domestic-02.jpg',
            alt: 'Packaging mistakes that cause shipping damage'
        },
        {
            slug: 'air-vs-sea-freight',
            category: 'logistics',
            categoryLabel: 'Freight Forwarding & Cargo',
            title: 'Air freight vs sea freight: which route fits your cargo?',
            excerpt: 'A practical comparison of speed, cost and shipment volume.',
            date: '2026-08-03',
            readTime: 7,
            author: 'JP Express Editorial Team',
            image: 'assets/container-ship.png',
            alt: 'Air freight vs sea freight comparison'
        },
        {
            slug: 'commercial-invoice-basics',
            category: 'customs',
            categoryLabel: 'Customs Clearance & Documentation',
            title: 'Commercial invoice basics for international shipments',
            excerpt: 'The information customs teams need to clear your goods.',
            date: '2026-07-28',
            readTime: 6,
            author: 'JP Express Editorial Team',
            image: 'assets/hero-banner3.jpg',
            alt: 'Commercial invoice for international shipments'
        },
        {
            slug: 'ecommerce-delivery-experience',
            category: 'business-growth',
            categoryLabel: 'Business Shipping & E-commerce',
            title: 'How better delivery experiences help e-commerce brands grow',
            excerpt: 'Turn shipping from a cost center into customer confidence.',
            date: '2026-07-21',
            readTime: 4,
            author: 'JP Express Editorial Team',
            image: 'assets/stroy.jpg',
            alt: 'E-commerce delivery experience'
        },
        {
            slug: 'shipment-tracking-guide',
            category: 'courier-news',
            categoryLabel: 'International Courier & Shipping',
            title: 'What real-time shipment tracking should tell you',
            excerpt: 'From pickup to delivery, understand every useful status.',
            date: '2026-07-15',
            readTime: 3,
            author: 'JP Express Editorial Team',
            image: 'assets/Airliner-Orbiting-a-Glowing-Earth.png',
            alt: 'Real-time shipment tracking guide'
        },
        {
            slug: 'international-market-framework',
            category: 'export-tips',
            categoryLabel: 'Export & Import',
            title: 'Finding your next international market: a starter framework',
            excerpt: 'Use demand, route and compliance signals to plan expansion.',
            date: '2026-07-09',
            readTime: 9,
            author: 'JP Express Editorial Team',
            image: 'assets/hero-banner.png',
            alt: 'Finding your next international market'
        }
    ];
    /* ---------- END STATIC DATA ---------- */

    var grid = document.getElementById('blGrid');
    if (!grid) return;

    var $ = function (id) { return document.getElementById(id); };
    var sortSel = $('blSort'),
        count = $('blCount'),
        more = $('blMore'),
        empty = $('blEmpty'),
        featWrap = $('blFeatWrap'),
        reset = $('blReset');
    var PAGE = 6;
    var limit = PAGE;

    /* --- helpers --- */
    var fmt = function (d) {
        return new Date(d + 'T00:00:00').toLocaleDateString('en-GB',
            { day: '2-digit', month: 'short', year: 'numeric' });
    };
    var meta = function (p) {
        return '<div class="bl-meta">'
            + '<span>' + (p.categoryLabel || 'Article') + '</span>'
            + '<time datetime="' + p.date + '">' + fmt(p.date) + '</time>'
            + '<span>' + p.readTime + ' min read</span>'
            + '</div>';
    };
    var isNew = function (d) {
        return (Date.now() - new Date(d + 'T00:00:00')) / 864e5 <= 30;
    };
    var by = function (p) {
        return p.author || 'JP Express';
    };

    /* Fallback thumbnails per category (used when a post has no p.image) */
    var CAT_IMG = {
        'courier-news': 'assets/hero-banner2.jpg',
        'export-tips': 'assets/business-solution.jpg',
        'logistics': 'assets/container-ship.png',
        'customs': 'assets/hero-banner3.jpg',
        'packaging': 'assets/domestic-02.jpg',
        'country-guide': 'assets/Airliner-Orbiting-a-Glowing-Earth.png',
        'business-growth': 'assets/stroy.jpg',
        'news': 'assets/hero-banner.png'
    };

    /* --- card template --- */
    var card = function (p) {
        var url = 'blog-detail.html?slug=' + encodeURIComponent(p.slug);
        var badge = isNew(p.date) ? '<b class="bl-new">NEW</b>' : '';
        var img = p.image || CAT_IMG[p.category] || 'assets/hero-banner2.jpg';
        var alt = p.alt || p.title;
        var art =
            '<div class="bl-art bl-art-img">' +
            '<img src="' + img + '" alt="' + alt + '" loading="lazy" width="640" height="360" ' +
            'onerror="this.onerror=null;this.src=\'assets/hero-banner2.jpg\'">' +
            badge +
            '</div>';
        return '<article class="bl-card">' + art +
            '<div class="bl-body">' + meta(p) +
            '<h3><a href="' + url + '">' + p.title + '</a></h3>' +
            '<p>' + p.excerpt + '</p>' +
            '<div class="bl-cf">' +
            '<span class="bl-by">' +
            '<i class="fa-regular fa-user" aria-hidden="true"></i>' +
            '<span>' + by(p) + '</span>' +
            '</span>' +
            '<a class="bl-link" href="' + url + '">Read more ' +
            '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>' +
            '<span class="visually-hidden">: ' + p.title + '</span>' +
            '</a>' +
            '</div>' +
            '</div></article>';
    };

    /* --- featured article --- */
    var featuredPost = BLOG_POSTS.find(function (p) { return p.featured; });
    if (featuredPost && featWrap) {
        var featUrl = 'blog-detail.html?slug=' + encodeURIComponent(featuredPost.slug);
        var shareUrl = encodeURIComponent(location.href.split('#')[0]);
        var fImg = featuredPost.image || CAT_IMG[featuredPost.category] || 'assets/hero-banner2.jpg';
        $('blFeat').innerHTML =
            '<div class="bl-feat">' +
            '<div class="bl-feat-art has-img" style="background-image:url(\'' + fImg + '\')" ' +
            'role="img" aria-label="' + (featuredPost.alt || featuredPost.title) + '">' +
            '<span>FEATURED · ' + (featuredPost.categoryLabel || 'ARTICLE').toUpperCase() + '</span>' +
            '<div class="bl-route"><b>DAC</b>' +
            '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>' +
            '<b>WORLD</b></div>' +
            '</div>' +
            '<div class="bl-feat-copy">' + meta(featuredPost) +
            '<h2>' + featuredPost.title + '</h2>' +
            '<p>' + (featuredPost.longExcerpt || featuredPost.excerpt) + '</p>' +
            '<a class="btn-main btn-red" href="' + featUrl + '">Read article ' +
            '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
            '<div class="bl-share" aria-label="Share">' +
            '<a href="https://wa.me/?text=' + encodeURIComponent(featuredPost.title) + '%20' + shareUrl + '" ' +
            'target="_blank" rel="noopener" aria-label="Share on WhatsApp">' +
            '<i class="fa-brands fa-whatsapp"></i></a>' +
            '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + shareUrl + '" ' +
            'target="_blank" rel="noopener" aria-label="Share on LinkedIn">' +
            '<i class="fa-brands fa-linkedin-in"></i></a>' +
            '<a href="https://www.facebook.com/sharer/sharer.php?u=' + shareUrl + '" ' +
            'target="_blank" rel="noopener" aria-label="Share on Facebook">' +
            '<i class="fa-brands fa-facebook-f"></i></a>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    /* --- grid render --- */
    function render(from) {
        /* No filtering — show every post except the featured one */
        var list = BLOG_POSTS.filter(function (p) { return !p.featured; });

        list.sort(sortSel && sortSel.value === 'read'
            ? function (a, b) { return a.readTime - b.readTime; }
            : function (a, b) { return b.date.localeCompare(a.date); });

        var shown = list.slice(0, limit);
        grid.innerHTML = shown.map(card).join('');

        if (from) {
            var cards = grid.querySelectorAll('.bl-card');
            cards.forEach(function (c, i) { if (i < from) c.style.animation = 'none'; });
            var firstNew = cards[from] && cards[from].querySelector('h3 a');
            if (firstNew) firstNew.focus({ preventScroll: true });
        }

        count.textContent = list.length
            ? 'Showing ' + shown.length + ' of ' + list.length + ' article' + (list.length === 1 ? '' : 's')
            : '';
        empty.hidden = list.length > 0;
        more.hidden = shown.length >= list.length;
    }

    sortSel.addEventListener('change', function () { limit = PAGE; render(); });
    more.addEventListener('click', function () { var from = limit; limit += PAGE; render(from); });
    reset.addEventListener('click', function () { limit = PAGE; render(); });

    render();
})();


(function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };
    var contentEl = $('bdContent');
    if (!contentEl) return;

    var bodyEl = contentEl.querySelector('.bd-content');
    if (!bodyEl) return;

    /* ---------- 1. Table of Contents ---------- */
    var headings = bodyEl.querySelectorAll('h2, h3');
    var tocList = $('bdTocList');
    var tocEl = $('bdToc');
    if (headings.length > 1 && tocList && tocEl) {
        Array.prototype.forEach.call(headings, function (h, idx) {
            if (!h.id) {
                h.id = (h.textContent || 'section').toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    || ('section-' + idx);
            }
            var li = document.createElement('li');
            if (h.tagName === 'H3') li.className = 'bd-toc-sub';
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            li.appendChild(a);
            tocList.appendChild(li);
        });
        tocEl.removeAttribute('hidden');

        /* Mobile: collapsible TOC */
        var tocTitle = tocEl.querySelector('.bd-toc-title');
        if (tocTitle && window.matchMedia('(max-width: 1023.98px)').matches) {
            tocEl.classList.add('is-collapsed');
            tocTitle.setAttribute('role', 'button');
            tocTitle.setAttribute('tabindex', '0');
            tocTitle.setAttribute('aria-expanded', 'false');
            var toggleToc = function () {
                var closed = tocEl.classList.toggle('is-collapsed');
                tocTitle.setAttribute('aria-expanded', String(!closed));
            };
            tocTitle.addEventListener('click', toggleToc);
            tocTitle.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleToc(); }
            });
        }
    } else if (tocEl) {
        tocEl.hidden = true;
    }

    /* ---------- 2. Share links ---------- */
    var shareEl = $('bdShare');
    if (shareEl) {
        shareEl.removeAttribute('hidden');
        var shareUrl = encodeURIComponent(window.location.href);
        var shareTitle = encodeURIComponent(document.title);
        $('bdShareWa').href = 'https://wa.me/?text=' + shareTitle + '%20' + shareUrl;
        $('bdShareLi').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + shareUrl;
        $('bdShareFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl;

        var copyBtn = $('bdShareCopy');
        copyBtn.addEventListener('click', function () {
            var done = function () {
                var icon = copyBtn.querySelector('i');
                var old = icon.className;
                icon.className = 'fa-solid fa-check';
                copyBtn.classList.add('is-done');
                setTimeout(function () {
                    icon.className = old;
                    copyBtn.classList.remove('is-done');
                }, 1500);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(window.location.href).then(done, function () { });
            } else {
                var ta = document.createElement('textarea');
                ta.value = window.location.href;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); done(); } catch (e) { }
                document.body.removeChild(ta);
            }
        });
    }

    /* ---------- 3. Smooth TOC scroll ---------- */
    contentEl.querySelectorAll('.bd-toc a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', a.getAttribute('href'));
        });
    });

    /* ---------- 4. Reading progress bar ---------- */
    var bar = $('bdProgress');
    if (bar && bodyEl) {
        var ticking = false;
        var updateBar = function () {
            var r = bodyEl.getBoundingClientRect();
            var total = r.height - window.innerHeight * 0.5;
            var pct = total > 0 ? Math.min(100, Math.max(0, (-r.top / total) * 100)) : 100;
            bar.style.width = pct + '%';
            ticking = false;
        };
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
        }, { passive: true });
        window.addEventListener('resize', updateBar);
        updateBar();
    }

    /* ---------- 5. TOC active-section highlight ---------- */
    var tocLinks = contentEl.querySelectorAll('.bd-toc a[href^="#"]');
    if (tocLinks.length && 'IntersectionObserver' in window) {
        var tocMap = {};
        tocLinks.forEach(function (a) { tocMap[a.getAttribute('href').slice(1)] = a; });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                tocLinks.forEach(function (a) { a.classList.remove('is-active'); });
                var hit = tocMap[en.target.id];
                if (hit) hit.classList.add('is-active');
            });
        }, { rootMargin: '-90px 0px -70% 0px' });
        bodyEl.querySelectorAll('h2, h3').forEach(function (h) {
            if (tocMap[h.id]) spy.observe(h);
        });
    }

    /* ---------- 6. In-article CTA ---------- */
    var h2s = bodyEl.querySelectorAll('h2');
    if (h2s.length > 2) {
        h2s[Math.floor(h2s.length / 2)].insertAdjacentHTML('beforebegin',
            '<aside class="bd-inline-cta" aria-label="Ship with JP Express">'
            + '<div class="bd-ic-copy"><strong>Ready to ship?</strong>'
            + '<span>Get a fast quote from JP Express for your next shipment.</span></div>'
            + '<div class="bd-ic-actions">'
            + '<a class="btn-main btn-red" href="quote.html">Get a Quote</a>'
            + '<a class="bd-ic-link" href="track-shipment.html">Track Shipment</a>'
            + '</div></aside>');
    }

    /* ---------- 7. Author box (static) ---------- */
    if (shareEl) {
        shareEl.insertAdjacentHTML('afterend',
            '<div class="bd-author"><span class="bd-author-av" aria-hidden="true">JP</span>'
            + '<div><strong>JP Express Editorial Team</strong>'
            + '<p>Practical guides on international courier, export logistics and shipping from Bangladesh.</p>'
            + '</div></div>');
    }

    /* ---------- 8. STATIC RELATED ARTICLES ---------- */
    var relatedWrap = $('bdRelated');
    var relatedList = $('bdRelatedList');
    if (relatedWrap && relatedList) {
        var related = [
            {
                slug: 'shipping-to-usa',
                category: 'Country & Destination Guides',
                title: 'Shipping to the USA: documents, duties and delivery times',
                date: '2026-08-12'
            },
            {
                slug: 'packaging-mistakes',
                category: 'Packaging & Shipment Preparation',
                title: '7 packaging mistakes that cause shipping damage',
                date: '2026-08-08'
            },
            {
                slug: 'air-vs-sea-freight',
                category: 'Freight Forwarding & Cargo',
                title: 'Air freight vs sea freight: which route fits your cargo?',
                date: '2026-08-03'
            }
        ];

        if (related.length) {
            relatedWrap.removeAttribute('hidden');
            relatedList.innerHTML = related.map(function (p) {
                var rDate = p.date ? new Date(p.date + 'T00:00:00').toLocaleDateString('en-GB',
                    { day: '2-digit', month: 'short', year: 'numeric' }) : '';
                var rUrl = 'blog-detail.html?slug=' + encodeURIComponent(p.slug);
                return '<li><a href="' + rUrl + '">'
                    + '<span class="bd-rel-cat">' + p.category + '</span>'
                    + '<span class="bd-rel-title">' + p.title + '</span>'
                    + '<span class="bd-rel-date">' + rDate + '</span>'
                    + '</a></li>';
            }).join('');
        }
    }

})();