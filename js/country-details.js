(function () {
  'use strict';
  const root = document.getElementById('cdRoot');
  if (!root || typeof COUNTRY_DATA === 'undefined') return;

  const q = new URLSearchParams(location.search);
  const slug = (q.get('c') || q.get('country') || '').toLowerCase();
  const d = COUNTRY_DATA[slug];
  const WA = 'https://wa.me/8801681637836?text=';
  const flag = (c, w) => `<img src="https://flagcdn.com/w80/${c}.png" width="${w}" height="${w}" alt="" loading="lazy">`;
  const ul = (a, ic) => `<ul class="cd-list">${a.map(x => `<li><i class="fa-solid ${ic || 'fa-check'}" aria-hidden="true"></i>${x}</li>`).join('')}</ul>`;
  const ask = (t) => `${WA}${encodeURIComponent(t)}`;

  /* ---------- Not found ---------- */
  if (!d) {
    document.title = 'Destination Not Found | JP Express';
    root.innerHTML = `<section class="pg-hero"><div class="container-fluid"><h1>We couldn’t find that destination</h1>
      <p>Browse the destinations we serve, or message us to check if we can ship to your country.</p>
      <div class="cd-cta"><a class="btn-main btn-red" href="countries.html">Browse Destinations</a>
      <a class="btn-main btn-dark-outline" target="_blank" rel="noopener" href="${ask('Hi JP Express, can you ship to my country?')}">Ask on WhatsApp</a></div></div></section>`;
    return;
  }

  const keys = d.v.split('');
  const sv = keys.map(k => SERVICES[k]);
  const first = d.rs[0].toLowerCase();
  const related = Object.keys(COUNTRY_DATA).filter(s => s !== slug)
    .sort((a, b) => (COUNTRY_DATA[b].r === d.r) - (COUNTRY_DATA[a].r === d.r) || (COUNTRY_DATA[b].pop || 0) - (COUNTRY_DATA[a].pop || 0)).slice(0, 4);
  const faqs = [
    [`Does JP Express ship from Bangladesh to ${d.n}?`, `Yes. ${d.n} is a destination we serve, with ${sv.length} service options including ${sv.slice(0, 3).map(s => s.n).join(', ')}. Request a quote to confirm service, price and requirements for your shipment.`],
    [`How long does shipping to ${d.n} take?`, `Express courier is typically estimated at ${d.t}. This is an estimate: actual time depends on service, shipment type, customs processing, remote areas, weekends/holidays and peak periods.`],
    [`How is the cost to ${d.n} calculated?`, `Cost depends on actual or volumetric weight (whichever is higher), dimensions, shipment type, service level, pickup needs, surcharges and any destination duties or taxes. Use the calculator on this page or request a quote.`],
    ['What documents are required?', `Personal shipments usually need sender and recipient details, a contents description and declared value. Commercial shipments typically need a commercial invoice and packing list, plus export documents. ${d.cu}`],
    [`Are customs duties or taxes applicable in ${d.n}?`, `They may be. Duties and import taxes are separate from shipping charges and depend on goods, value and current ${d.n} rules. We can’t promise “no customs charges” for any destination.`],
    [`Can I send food or medicine to ${d.n}?`, `Often restricted. For ${d.n}, pay special attention to: ${d.rs.join('; ').toLowerCase()}. Always confirm with our team before booking.`],
    ['Can I track my shipment?', 'Yes. Use your tracking number on our Track Shipment page for shipment status updates.'],
    ['Can JP Express pick up from my address?', 'Pickup availability depends on your area in Bangladesh. Share your location when you request a quote and we will confirm options.']
  ];
  const steps = [['Request a quote', 'Share route, weight and contents.'], ['Confirm shipment', 'Service, price and requirements are agreed.'], ['Pickup or drop-off', 'We collect or receive your parcel.'], ['Documents & checks', 'Paperwork and contents are reviewed.'], ['Dispatch from Bangladesh', 'Shipment enters the international network.'], [`Processing in ${d.n}`, 'Destination-side handling and customs where applicable.'], ['Final delivery', 'Delivered to the recipient.'], ['Track & confirm', 'Follow status and delivery updates.']];
  const nav = [['overview', 'Overview'], ['services', 'Services'], ['process', 'Process'], ['quote', 'Cost & Transit'], ['docs', 'Documents'], ['restrict', 'Restrictions'], ['delivery', 'Pickup & Delivery'], ['business', 'Business'], ['faq', 'FAQ']];
  const sec = (id, t, body, alt) => `<section class="pg-sec cx${alt ? ' pg-alt' : ''}" id="${id}" aria-labelledby="${id}T"><div class="container-fluid"><h2 class="pg-h" id="${id}T">${t}</h2>${body}</div></section>`;

  root.innerHTML = `
  <section class="pg-hero cd-hero"><div class="container-fluid">
    <nav class="pg-crumb" aria-label="Breadcrumb"><a href="index.html">Home</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><a href="countries.html">Countries</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><span aria-current="page">${d.n}</span></nav>
    <div class="cd-route" aria-hidden="true"><span>${flag('bd', 28)}Bangladesh</span><i class="fa-solid fa-plane"></i><span>${flag(d.c, 28)}${d.n}</span></div>
    <h1>International Shipping from Bangladesh to ${d.n}</h1>
    <p class="cd-lead">${d.ov} Courier and freight options, documents, customs notes and a quote path — all in one place.</p>
    <div class="cd-cta"><a class="btn-main btn-red" href="#quote">Get a Quote <i class="fa-solid fa-arrow-right"></i></a>
      <a class="btn-main btn-dark-outline" target="_blank" rel="noopener" href="${ask(`Hi JP Express, I want to ship from Bangladesh to ${d.n}.`)}"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      <a class="cd-link" href="tel:+8801681637836"><i class="fa-solid fa-phone"></i> Call</a><a class="cd-link" href="track-shipment.html"><i class="fa-solid fa-location-dot"></i> Track</a></div>
  </div></section>
  <div class="container-fluid cd-stats-wrap"><div class="cd-stats">
    <div><i class="fa-regular fa-clock"></i><b>${d.t}</b><small>Express estimate</small></div>
    <div><i class="fa-solid fa-layer-group"></i><b>${sv.length}</b><small>Services</small></div>
    <div><i class="fa-solid fa-location-dot"></i><b>${d.cap}</b><small>Capital</small></div>
    <div><i class="fa-solid fa-coins"></i><b>${d.cur}</b><small>Currency</small></div></div></div>
  <div class="cd-nav" id="cdNav"><div class="container-fluid"><div class="cd-nav-in">${nav.map(n => `<a href="#${n[0]}">${n[1]}</a>`).join('')}</div></div></div>

  ${sec('overview', `Shipping to ${d.n} at a glance`, `
    <div class="cd-grid3">
      <div class="cd-card"><h3><i class="fa-solid fa-users"></i> Who ships here</h3>${ul(['Families, students and gift senders', 'Exporters, SMEs and e-commerce sellers', 'Buying houses and corporate customers'])}</div>
      <div class="cd-card"><h3><i class="fa-solid fa-box-open"></i> What you can ship</h3>${ul(['Documents and paperwork', 'Personal parcels and gifts', 'Samples and commercial cargo'])}<p class="cd-note">Subject to JP Express policy and ${d.n} rules.</p></div>
      <div class="cd-card cd-trust"><h3><i class="fa-solid fa-shield-halved"></i> Based in Dhaka</h3>${ul(['Bangladesh-based courier & logistics team', 'Hotline 9am – 11pm: +880 1681 637836', 'WhatsApp support for quotes'])}</div>
    </div>`)}

  ${sec('services', `Shipping services to ${d.n}`, `
    <div class="cd-table-wrap"><table class="cd-table"><thead><tr><th>Service</th><th>Suitable for</th><th>Main consideration</th><th><span class="visually-hidden">Action</span></th></tr></thead><tbody>
    ${sv.map(s => `<tr><td data-l="Service"><a href="${s.u}"><i class="fa-solid ${s.i}"></i> ${s.n}</a></td><td data-l="Suitable for">${s.f}</td><td data-l="Consideration">${s.c}</td><td><a class="cd-mini" href="#quote">Get quote</a></td></tr>`).join('')}
    </tbody></table></div>`, 1)}

  ${sec('process', `How shipping from Bangladesh to ${d.n} works`, `<ol class="cd-steps">${steps.map(s => `<li><b>${s[0]}</b><span>${s[1]}</span></li>`).join('')}</ol>`)}

  <section class="pg-sec pg-alt cx" id="quote" aria-labelledby="quoteT"><div class="container-fluid">
    <h2 class="pg-h" id="quoteT">Cost, transit time & quote</h2>
    <div class="cd-grid2">
      <div class="cd-card"><h3><i class="fa-regular fa-clock"></i> Transit time</h3>
        <p class="cd-big">${d.t}<small> estimated, express</small></p>
        <p>This is an estimate, not a guarantee. It varies with service, shipment type, origin and destination processing, customs, remote areas, weekends/holidays and peak periods.</p>
        <h3 class="mt-3"><i class="fa-solid fa-sliders"></i> What affects cost</h3>
        ${ul(['Actual vs. volumetric weight', 'Dimensions and number of pieces', 'Shipment type and service level', 'Pickup and packaging needs', `Customs, duties and taxes in ${d.n}`, 'Fuel or applicable surcharges'])}</div>
      <div class="cd-card cd-tool"><h3><i class="fa-solid fa-calculator"></i> Weight check & quote request</h3>
        <form id="qForm" novalidate><div class="cd-fields">
          <label>Type<select id="qType"><option>Documents</option><option selected>Parcel</option><option>Commercial</option></select></label>
          <label>Service<select id="qSvc">${sv.map(s => `<option>${s.n}</option>`).join('')}</select></label>
          <label>Weight (kg)<input id="qW" type="number" inputmode="decimal" min="0" step="0.1" placeholder="2"></label>
          <label>Length (cm)<input id="qL" type="number" inputmode="decimal" min="0" placeholder="30"></label>
          <label>Width (cm)<input id="qWd" type="number" inputmode="decimal" min="0" placeholder="20"></label>
          <label>Height (cm)<input id="qH" type="number" inputmode="decimal" min="0" placeholder="15"></label></div></form>
        <div class="cd-result" aria-live="polite"><span>Chargeable weight</span><b id="qOut">—</b></div>
        <p class="cd-note">Volumetric = L × W × H (cm) ÷ 5000. Final rules follow the service used. We confirm the exact price on request.</p>
        <div class="cd-actions"><a id="qWa" class="btn-main btn-red" target="_blank" rel="noopener" href="#"><i class="fa-brands fa-whatsapp"></i> Request quote on WhatsApp</a>
        <a class="btn-main cd-ghost" href="index.html?dest=${encodeURIComponent(d.n)}#quote">Full quote form</a></div></div>
    </div></div></section>

  ${sec('docs', 'Documents, customs & duties', `
    <div class="cd-grid2"><div class="cd-card"><div class="cd-tabs" role="tablist"><button class="on" data-t="p" role="tab" aria-selected="true">Personal</button><button data-t="b" role="tab" aria-selected="false">Commercial</button></div>
      <div data-p="p">${ul(['Sender and recipient name, address, phone', 'Description of contents', 'Declared value', 'ID where required'])}</div>
      <div data-p="b" hidden>${ul(['Commercial invoice', 'Packing list', 'Export documentation', 'Product details / HS code where applicable', 'Other destination or carrier documents'])}</div></div>
      <div class="cd-card"><h3><i class="fa-solid fa-stamp"></i> Customs in ${d.n}</h3><p>${d.cu}</p>
        <h3 class="mt-3"><i class="fa-solid fa-receipt"></i> Duties & taxes</h3><p>Shipping charges, customs duties, import taxes and clearance fees are different. Who pays depends on the arrangement for your shipment. Rules change, so confirm before booking.</p></div></div>`)}

  ${sec('restrict', `Restricted & prohibited items for ${d.n}`, `
    <div class="cd-grid3">
      <div class="cd-card cd-bad"><h3><i class="fa-solid fa-ban"></i> Prohibited</h3>${ul(['Cash and negotiable instruments', 'Weapons and explosives', 'Illegal drugs and counterfeit goods', 'Hazardous or flammable materials'], 'fa-xmark')}</div>
      <div class="cd-card cd-warn"><h3><i class="fa-solid fa-triangle-exclamation"></i> Restricted</h3>${ul(['Batteries and electronics', 'Liquids, cosmetics and aerosols', 'Food and medicines', 'Valuables'], 'fa-circle-exclamation')}<p class="cd-note">May need conditions or documents.</p></div>
      <div class="cd-card cd-dest"><h3><i class="fa-solid fa-location-crosshairs"></i> Specific to ${d.n}</h3>${ul(d.rs, 'fa-flag')}</div></div>
    <p class="cd-note mt-3">Always check JP Express’s current restricted-items policy before booking. We are not a customs authority.</p>`, 1)}

  ${sec('delivery', 'Pickup, packaging, tracking & delivery', `
    <div class="cd-grid2x">
      <div class="cd-card"><h3><i class="fa-solid fa-truck-pickup"></i> Pickup in Bangladesh</h3><p>Request home, office or business pickup, or ask about drop-off. Availability depends on your area; we confirm when you request a quote.</p></div>
      <div class="cd-card"><h3><i class="fa-solid fa-box"></i> Packaging</h3><p>Use a strong box, cushion fragile items, seal liquids and label clearly with full recipient details.</p></div>
      <div class="cd-card"><h3><i class="fa-solid fa-location-dot"></i> Tracking</h3><form action="track-shipment.html" method="get" class="cd-track"><label class="visually-hidden" for="tk">Tracking number</label><input id="tk" name="tracking" placeholder="Tracking number" required><button class="btn-main btn-red" type="submit">Track</button></form></div>
      <div class="cd-card"><h3><i class="fa-solid fa-house-circle-check"></i> Delivery in ${d.n}</h3><p>${d.ch}</p><p class="cd-cities"><b>Cities:</b> ${d.ci}</p></div></div>`)}

  ${sec('business', `Business shipping to ${d.n}`, `
    <div class="cd-biz"><div><p>Exporters, manufacturers, e-commerce brands, buying houses and SMEs can ship samples and commercial cargo with documentation and customs support.</p>
      <div class="cd-tags">${d.ind.map(i => `<a href="industries.html">${i}</a>`).join('')}</div></div>
      <a class="btn-main btn-red" target="_blank" rel="noopener" href="${ask(`Hi JP Express, I need a business shipping quote from Bangladesh to ${d.n}.`)}">Request Business Quote</a></div>`, 1)}

  ${sec('faq', `${d.n} shipping FAQs`, `<div class="accordion" id="cdFaq">${faqs.map((f, i) => `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button${i ? ' collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#f${i}" aria-expanded="${!i}" aria-controls="f${i}">${f[0]}</button></h3><div id="f${i}" class="accordion-collapse collapse${i ? '' : ' show'}" data-bs-parent="#cdFaq"><div class="accordion-body">${f[1]}</div></div></div>`).join('')}</div>`)}

  <section class="pg-sec pg-alt cx"><div class="container-fluid"><h2 class="pg-h">Other destinations</h2>
    <div class="ctr-grid">${related.map(s => { const c = COUNTRY_DATA[s]; return `<a class="ctr-card" href="country.html?c=${s}"><span class="ctr-card-top">${flag(c.c, 44)}<span><strong>${c.n}</strong><small>${c.r}</small></span></span><span class="ctr-card-meta"><span><i class="fa-regular fa-clock"></i> ${c.t}</span></span><span class="ctr-card-go">View guide <i class="fa-solid fa-arrow-right"></i></span></a>`; }).join('')}</div>
    <div class="cd-res"><a href="resources.html">Shipping guide</a><a href="resources.html">Customs guide</a><a href="resources.html">Restricted items</a><a href="resources.html">Export documentation</a><a href="countries.html">All destinations</a></div></div></section>

  <section class="final-cta"><div class="container-fluid"><div class="cta-inner"><div class="cta-copy"><h2>Ready to ship to ${d.n}?</h2><p>Get a quote or talk to our team about your shipment.</p></div>
    <div class="cta-actions"><a class="btn-main btn-white" href="#quote">Get a Quote</a><a class="btn-main btn-white-outline" target="_blank" rel="noopener" href="${ask(`Hi JP Express, I want to ship to ${d.n}.`)}">WhatsApp</a></div></div></div></section>`;

  /* ---------- SEO (title, meta, canonical, JSON-LD) ---------- */
  const title = `Shipping from Bangladesh to ${d.n} | JP Express`;
  const desc = `Courier and freight from Bangladesh to ${d.n}: services, estimated ${d.t} transit, documents, customs notes, restricted items and a quote path.`;
  const url = `https://www.jpexpress.com/country.html?c=${slug}`;
  document.title = title;
  const meta = (sel, attr, val) => { const e = document.querySelector(sel); if (e) e.setAttribute(attr, val); };
  meta('meta[name="description"]', 'content', desc); meta('link[rel="canonical"]', 'href', url);
  meta('meta[property="og:title"]', 'content', title); meta('meta[property="og:description"]', 'content', desc); meta('meta[property="og:url"]', 'content', url);
  const ld = o => { const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(o); document.head.appendChild(s); };
  ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', 'index.html'], ['Countries', 'countries.html'], [d.n, 'country.html?c=' + slug]].map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: 'https://www.jpexpress.com/' + x[1] })) });
  ld({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } })) });
  ld({ '@context': 'https://schema.org', '@type': 'Service', name: `International shipping from Bangladesh to ${d.n}`, provider: { '@type': 'Organization', name: 'JP Express', telephone: '+8801681637836' }, areaServed: d.n });

  /* ---------- Interactions ---------- */
  const $ = id => document.getElementById(id);
  const f = ['qW', 'qL', 'qWd', 'qH', 'qType', 'qSvc'].map($);
  function calc() {
    const n = i => parseFloat(f[i].value) || 0;
    const vol = n(1) * n(2) * n(3) / 5000, ch = Math.max(n(0), vol);
    $('qOut').textContent = ch ? ch.toFixed(2) + ' kg' : '—';
    const dims = n(1) && n(2) && n(3) ? `${n(1)}×${n(2)}×${n(3)} cm` : 'not provided';
    $('qWa').href = ask(`Hi JP Express, I'd like a quote.\nRoute: Bangladesh → ${d.n}\nType: ${f[4].value}\nService: ${f[5].value}\nWeight: ${n(0) || 'not provided'} kg\nDimensions: ${dims}\nChargeable weight: ${ch ? ch.toFixed(2) + ' kg' : 'n/a'}`);
  }
  f.forEach(e => e.addEventListener('input', calc)); calc();
  $('qForm').addEventListener('submit', e => e.preventDefault());

  root.querySelectorAll('.cd-tabs button').forEach(b => b.addEventListener('click', () => {
    const box = b.closest('.cd-card');
    box.querySelectorAll('.cd-tabs button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    box.querySelectorAll('[data-p]').forEach(p => p.hidden = p.dataset.p !== b.dataset.t);
  }));

  // Scroll-spy for the sticky section nav
  const links = [...root.querySelectorAll('#cdNav a')];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => {
        const on = a.getAttribute('href') === '#' + e.target.id;
        a.classList.toggle('on', on);
        if (on) a.parentElement.scrollTo({ left: a.offsetLeft - 24, behavior: 'smooth' });
      });
    }), { rootMargin: '-35% 0px -60% 0px' });
    nav.forEach(n => { const s = $(n[0]); if (s) spy.observe(s); });
    const rev = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { threshold: 0.08 });
    root.querySelectorAll('.cx').forEach(s => rev.observe(s));
  } else root.querySelectorAll('.cx').forEach(s => s.classList.add('in'));
})();