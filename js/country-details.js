/* =========================================================
   PAGE: country.html
   CONSOLIDATED MODULE: country-details.js
   Full destination-page renderer based on COUNTRY_DATA.
   ========================================================= */
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
    root.innerHTML = `<section class="pg-sec"><div class="container-fluid">
      <div class="ctr-empty" style="max-width:640px;margin:0 auto">
        <h1 style="margin:0 0 8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:1.6rem;color:var(--jp-navy)">We couldn’t find that destination</h1>
        <p>Browse the destinations we serve, or message us to check if we can ship to your country.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:12px">
          <a class="btn-main btn-red" href="countries.html">Browse Destinations</a>
          <a class="btn-main btn-dark-outline" target="_blank" rel="noopener" href="${ask('Hi JP Express, can you ship to my country?')}">Ask on WhatsApp</a>
        </div>
      </div>
    </div></section>`;
    return;
  }

  const keys = d.v.split('');
  const sv = keys.map(k => SERVICES[k]);
  const related = Object.keys(COUNTRY_DATA).filter(s => s !== slug)
    .sort((a, b) => (COUNTRY_DATA[b].r === d.r) - (COUNTRY_DATA[a].r === d.r) || (COUNTRY_DATA[b].pop || 0) - (COUNTRY_DATA[a].pop || 0)).slice(0, 4);

  /* Build destination-specific FAQ (dedupe / fallback) */
  const faqs = (d.faq && d.faq.length)
    ? d.faq
    : [
      [`Does JP Express ship from Bangladesh to ${d.n}?`, `Yes. ${d.n} is a destination we serve, with ${sv.length} service options including ${sv.slice(0, 3).map(s => s.n).join(', ')}. Request a quote to confirm service, price and requirements for your shipment.`],
      [`How long does shipping to ${d.n} take?`, `Express courier is typically estimated at ${d.t}. Actual time depends on service, shipment type, customs processing, remote areas, weekends/holidays and peak periods.`],
      [`How is the cost to ${d.n} calculated?`, `Cost depends on actual or volumetric weight (whichever is higher), dimensions, shipment type, service level, pickup needs, surcharges and any destination duties or taxes.`],
      ['What documents are required?', `Personal shipments usually need sender and recipient details, a contents description and declared value. Commercial shipments typically need a commercial invoice and packing list.`],
      [`Are customs duties or taxes applicable in ${d.n}?`, `They may be. Duties and import taxes are separate from shipping charges and depend on goods, value and current ${d.n} rules.`],
      ['Can I track my shipment?', 'Yes. Use your tracking number on our Track Shipment page for shipment status updates.'],
      ['Can JP Express pick up from my address?', 'Pickup availability depends on your area in Bangladesh. Share your location when you request a quote and we will confirm options.']
    ];

  /* Steps for the process section */
  const steps = [
    ['Request a Quote', 'Share route, weight and contents.'],
    ['Shipment Assessment', 'We review type, weight, dimensions and destination requirements.'],
    ['Booking / Pickup', 'Schedule pickup or drop off your shipment.'],
    ['Documentation', 'Prepare the required shipping and customs documents.'],
    ['Dispatch from Bangladesh', 'Shipment enters the international network.'],
    [`Processing in ${d.n}`, 'Destination handling and customs where applicable.'],
    ['Final Delivery', 'Delivered to the recipient.'],
    ['Track & Confirm', 'Follow status updates and delivery confirmation.']
  ];

  const nav = [
    ['overview', 'Overview', 'fa-eye'],
    ['who', 'Who Ships', 'fa-users'],
    ['services', 'Services', 'fa-layer-group'],
    ['process', 'Process', 'fa-list-check'],
    ['quote', 'Cost & Transit', 'fa-calculator'],
    ['docs', 'Documents', 'fa-file-lines'],
    ['duties', 'Customs & Duties', 'fa-stamp'],
    ['restrict', 'Restrictions', 'fa-ban'],
    ['packaging', 'Packaging', 'fa-box'],
    ['pickup', 'Pickup', 'fa-truck-pickup'],
    ['tracking', 'Tracking & Delivery', 'fa-location-dot'],
    ['business', 'Business', 'fa-briefcase'],
    ['faq', 'FAQ', 'fa-circle-question']
  ];

  const sec = (id, t, body, alt) =>
    `<section class="pg-sec cx${alt ? ' pg-alt' : ''}" id="${id}" aria-labelledby="${id}T"><div class="container-fluid"><h2 class="pg-h" id="${id}T">${t}</h2>${body}</div></section>`;

  /* ---------------- RENDER ---------------- */
  root.innerHTML = `
  <div class="container-fluid cd-stats-wrap"><div class="cd-stats">
    <div><i class="fa-regular fa-clock"></i><b>${d.t}</b><small>Express estimate</small></div>
    <div><i class="fa-solid fa-layer-group"></i><b>${sv.length}</b><small>Services</small></div>
    <div><i class="fa-solid fa-location-dot"></i><b>${d.cap}</b><small>Capital</small></div>
    <div><i class="fa-solid fa-coins"></i><b>${d.cur}</b><small>Currency</small></div></div></div>

  <div class="cd-nav" id="cdNav"><div class="container-fluid"><div class="cd-nav-in">
    ${nav.map(n => `<a href="#${n[0]}"><i class="fa-solid ${n[2]}"></i>${n[1]}</a>`).join('')}
  </div></div></div>

  ${sec('overview', `Shipping from Bangladesh to ${d.n} at a glance`, `
    <div class="cd-grid3">
      <div class="cd-card">
        <h3><i class="fa-solid fa-users"></i> Who ships here</h3>
        ${ul(d.who || ['Families and individuals', 'Exporters, SMEs and e-commerce sellers', 'Buying houses and corporate customers'])}
      </div>
      <div class="cd-card">
        <h3><i class="fa-solid fa-box-open"></i> What you can ship</h3>
        ${ul(d.canShip || ['Documents and paperwork', 'Personal parcels and gifts', 'Samples and commercial cargo'])}
        <p class="cd-note">Subject to JP Express policy and ${d.n} rules.</p>
      </div>
      <div class="cd-card cd-dest">
        <h3><i class="fa-solid fa-shield-halved"></i> Based in Dhaka</h3>
        ${ul(['Bangladesh-based courier & logistics team', 'Hotline 9am – 11pm: +880 1681 637836', 'WhatsApp support for quotes'])}
      </div>
    </div>
    <p class="cd-note mt-3">${d.ov || ''}</p>
  `)}

  ${sec('who', `Who ships from Bangladesh to ${d.n}`, `
    <div class="cd-grid2">
      <div class="cd-card">
        <h3><i class="fa-solid fa-user"></i> Personal customers</h3>
        ${ul(['Families and individuals sending parcels', 'Students and workers abroad', 'Gift senders'])}
      </div>
      <div class="cd-card">
        <h3><i class="fa-solid fa-building"></i> Business customers</h3>
        ${ul(['Exporters and manufacturers', 'E-commerce sellers and SMEs', 'Buying houses and corporate customers'])}
      </div>
    </div>
  `, 1)}

  ${sec('services', `Shipping services to ${d.n}`, `
    <div class="cd-table-wrap"><table class="cd-table"><thead><tr><th>Service</th><th>Suitable for</th><th>Main consideration</th><th><span class="visually-hidden">Action</span></th></tr></thead><tbody>
    ${sv.map(s => `<tr><td data-l="Service"><a href="${s.u}"><i class="fa-solid ${s.i}"></i> ${s.n}</a></td><td data-l="Suitable for">${s.f}</td><td data-l="Consideration">${s.c}</td><td><a class="cd-mini" href="#quote">Get quote</a></td></tr>`).join('')}
    </tbody></table></div>
    <p class="cd-note mt-3">Only services available for ${d.n} are shown. Contact us if you need a service not listed.</p>
  `)}

  ${sec('process', `How shipping from Bangladesh to ${d.n} works`, `
    <ol class="cd-steps">${steps.map(s => `<li><b>${s[0]}</b><span>${s[1]}</span></li>`).join('')}</ol>
  `, 1)}

  <section class="pg-sec cx" id="quote" aria-labelledby="quoteT"><div class="container-fluid">
    <h2 class="pg-h" id="quoteT">Cost, transit time & quote</h2>
    <div class="cd-grid2">
      <div class="cd-card">
        <h3><i class="fa-regular fa-clock"></i> Transit time</h3>
        <p class="cd-big">${d.t}<small> estimated, express</small></p>
        <p>${d.transitNotes || `This is an estimate, not a guarantee. It varies with service, shipment type, origin and destination processing, customs, remote areas, weekends/holidays and peak periods.`}</p>
        <h3 class="mt-3"><i class="fa-solid fa-sliders"></i> What affects cost</h3>
        ${ul(d.costFactors || ['Actual vs. volumetric weight', 'Dimensions and number of pieces', 'Shipment type and service level', 'Pickup and packaging needs', 'Customs, duties and taxes', 'Fuel or applicable surcharges'])}
      </div>
      <div class="cd-card cd-tool">
        <h3><i class="fa-solid fa-calculator"></i> Weight check & quote request</h3>
        <form id="qForm" novalidate><div class="cd-fields">
          <label>Type<select id="qType"><option>Documents</option><option selected>Parcel</option><option>Commercial</option></select></label>
          <label>Service<select id="qSvc">${sv.map(s => `<option>${s.n}</option>`).join('')}</select></label>
          <label>Weight (kg)<input id="qW" type="number" inputmode="decimal" min="0" step="0.1" placeholder="2"></label>
          <label>Length (cm)<input id="qL" type="number" inputmode="decimal" min="0" placeholder="30"></label>
          <label>Width (cm)<input id="qWd" type="number" inputmode="decimal" min="0" placeholder="20"></label>
          <label>Height (cm)<input id="qH" type="number" inputmode="decimal" min="0" placeholder="15"></label>
        </div></form>
        <div class="cd-result" aria-live="polite"><span>Chargeable weight</span><b id="qOut">—</b></div>
        <p class="cd-note">Volumetric = L × W × H (cm) ÷ 5000. Final rules follow the service used. We confirm the exact price on request.</p>
        <div class="cd-actions">
          <a id="qWa" class="btn-main btn-red" target="_blank" rel="noopener" href="#"><i class="fa-brands fa-whatsapp"></i> Request quote on WhatsApp</a>
          <a class="btn-main cd-ghost" href="pricing.html?dest=${encodeURIComponent(d.n)}#calculator">Calculate shipping cost</a>
        </div>
      </div>
    </div>
  </div></section>

  ${sec('docs', 'Documents, customs & duties', `
    <div class="cd-grid2">
      <div class="cd-card">
        <div class="cd-tabs" role="tablist">
          <button class="on" data-t="p" role="tab" aria-selected="true">Personal</button>
          <button data-t="b" role="tab" aria-selected="false">Commercial</button>
        </div>
        <div data-p="p">${ul((d.docs && d.docs.personal) || ['Sender and recipient name, address, phone', 'Description of contents', 'Declared value', 'ID where required'])}</div>
        <div data-p="b" hidden>${ul((d.docs && d.docs.commercial) || ['Commercial invoice', 'Packing list', 'Export documentation', 'Product details / HS code where applicable'])}</div>
      </div>
      <div class="cd-card">
        <h3><i class="fa-solid fa-stamp"></i> Customs in ${d.n}</h3>
        <p>${d.cu}</p>
        <h3 class="mt-3"><i class="fa-solid fa-receipt"></i> Duties & taxes</h3>
        <p>${d.dutiesNote || 'Shipping charges, customs duties, import taxes and clearance fees are different. Who pays depends on the arrangement for your shipment. Rules change, so confirm before booking.'}</p>
      </div>
    </div>
  `, 1)}

  ${sec('duties', `Duties, taxes & import charges for ${d.n}`, `
    <div class="cd-grid2">
      <div class="cd-card"><h3><i class="fa-solid fa-coins"></i> Shipping charges vs. duties</h3>
        <p>Shipping charges cover the transport of your shipment. Customs duties, import taxes and clearance fees are separate and depend on ${d.n}'s regulations.</p>
      </div>
      <div class="cd-card"><h3><i class="fa-solid fa-user-check"></i> Who pays?</h3>
        <p>Who pays duties and taxes depends on the shipping arrangement. Recipients are often responsible for import charges. We will clarify the arrangement before booking.</p>
      </div>
    </div>
  `)}

  ${sec('restrict', `Restricted & prohibited items for ${d.n}`, `
    <div class="cd-grid3">
      <div class="cd-card cd-bad"><h3><i class="fa-solid fa-ban"></i> Prohibited</h3>${ul((d.restricted && d.restricted.prohibited) || ['Cash and negotiable instruments', 'Weapons and explosives', 'Illegal drugs and counterfeit goods', 'Hazardous or flammable materials'], 'fa-xmark')}</div>
      <div class="cd-card cd-warn"><h3><i class="fa-solid fa-triangle-exclamation"></i> Restricted</h3>${ul((d.restricted && d.restricted.restricted) || ['Batteries and electronics', 'Liquids, cosmetics and aerosols', 'Food and medicines', 'Valuables'], 'fa-circle-exclamation')}<p class="cd-note">May need conditions or documents.</p></div>
      <div class="cd-card cd-dest"><h3><i class="fa-solid fa-location-crosshairs"></i> Specific to ${d.n}</h3>${ul((d.restricted && d.restricted.specific) || d.rs || [], 'fa-flag')}</div>
    </div>
    <p class="cd-note mt-3">Always check JP Express’s current restricted-items policy before booking. We are not a customs authority.</p>
  `, 1)}

  ${sec('packaging', `Packaging for shipments to ${d.n}`, `
    <div class="cd-grid2">
      <div class="cd-card"><h3><i class="fa-solid fa-box"></i> Packaging tips</h3>${ul(d.packaging || ['Use a strong outer box', 'Cushion fragile items', 'Seal liquids and label clearly'])}</div>
      <div class="cd-card"><h3><i class="fa-solid fa-tape"></i> Recommended approach</h3>
        <p>Use a strong box, cushion fragile contents, seal liquids in leak-proof bags, and label clearly with full recipient details.</p>
        <p class="cd-note">For fragile or high-value items, consider extra protection or insurance options where available.</p>
      </div>
    </div>
  `)}

  ${sec('pickup', `Pickup from Bangladesh`, `
    <div class="cd-grid2">
      <div class="cd-card"><h3><i class="fa-solid fa-truck-pickup"></i> Pickup options</h3>${ul(d.pickup || ['Home, office or business pickup in Dhaka', 'Scheduled pickups for regular shippers', 'Drop-off at our Dhaka office'])}</div>
      <div class="cd-card"><h3><i class="fa-solid fa-clipboard-check"></i> What we need from you</h3>
        ${ul(['Pickup address and preferred time', 'Shipment details (contents, weight, dimensions)', 'Recipient details for documentation'])}
        <div class="cd-actions" style="margin-top:12px">
          <a class="btn-main btn-red" href="contact.html?intent=pickup#inquiry">Book Pickup</a>
        </div>
      </div>
    </div>
  `, 1)}

  ${sec('tracking', `Tracking & delivery in ${d.n}`, `
    <div class="cd-grid2x">
      <div class="cd-card"><h3><i class="fa-solid fa-location-dot"></i> Tracking</h3>
        ${ul(d.tracking || ['Tracking number provided at booking', 'Track on the JP Express tracking page', 'Updates through origin, destination customs and delivery'])}
        <form action="track-shipment.html" method="get" class="cd-track" style="margin-top:12px">
          <label class="visually-hidden" for="tk">Tracking number</label>
          <input id="tk" name="tracking" placeholder="Tracking number" required>
          <button class="btn-main btn-red" type="submit">Track</button>
        </form>
      </div>
      <div class="cd-card"><h3><i class="fa-solid fa-house-circle-check"></i> Delivery in ${d.n}</h3>
        <p>${d.ch}</p>
        ${ul(d.delivery || ['Residential and business addresses', 'Recipient phone recommended', 'Proof of delivery where available'])}
        <p class="cd-cities"><b>Cities:</b> ${d.ci}</p>
      </div>
    </div>
  `)}

  ${sec('business', `Business shipping to ${d.n}`, `
    <div class="cd-biz">
      <div>
        <p>${d.business || 'Exporters, manufacturers, e-commerce brands, buying houses and SMEs can ship samples and commercial cargo with documentation and customs support.'}</p>
        <div class="cd-tags">${(d.industries || d.ind || []).map(i => `<a href="industries.html">${i}</a>`).join('')}</div>
      </div>
      <a class="btn-main btn-red" target="_blank" rel="noopener" href="${ask(`Hi JP Express, I need a business shipping quote from Bangladesh to ${d.n}.`)}">Request Business Quote</a>
    </div>
  `, 1)}

  ${sec('faq', `${d.n} shipping FAQs`, `<div class="row g-2 g-lg-3">
    <div class="col-lg-6">
      <div class="accordion" id="cdFaqLeft">
        ${faqs.slice(0, Math.ceil(faqs.length / 2)).map((f, i) => `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button${i ? ' collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#f${i}" aria-expanded="${!i}" aria-controls="f${i}">${f[0]}</button></h3><div id="f${i}" class="accordion-collapse collapse${i ? '' : ' show'}" data-bs-parent="#cdFaqLeft"><div class="accordion-body">${f[1]}</div></div></div>`).join('')}
      </div>
    </div>
    <div class="col-lg-6">
      <div class="accordion" id="cdFaqRight">
        ${faqs.slice(Math.ceil(faqs.length / 2)).map((f, i) => { const idx = i + Math.ceil(faqs.length / 2); return `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#f${idx}" aria-expanded="false" aria-controls="f${idx}">${f[0]}</button></h3><div id="f${idx}" class="accordion-collapse collapse" data-bs-parent="#cdFaqRight"><div class="accordion-body">${f[1]}</div></div></div>`; }).join('')}
      </div>
    </div>
  </div>`)}

  <section class="pg-sec pg-alt cx" aria-labelledby="relT">
    <div class="container-fluid">
      <h2 class="pg-h" id="relT">Other popular destinations</h2>
      <div class="ctr-grid">${related.map(s => { const c = COUNTRY_DATA[s]; return `<a class="ctr-card" href="country.html?c=${s}"><span class="ctr-card-top">${flag(c.c, 44)}<span><strong>${c.n}</strong><small>${c.r}</small></span></span><span class="ctr-card-meta"><span><i class="fa-regular fa-clock"></i> ${c.t}</span></span><span class="ctr-card-go">View guide <i class="fa-solid fa-arrow-right"></i></span></a>`; }).join('')}</div>
      
    </div>
  </section>

  <section class="final-cta">
    <div class="container-fluid">
      <div class="cta-inner">
        <div class="cta-copy">
          <h2>Ready to ship to ${d.n}?</h2>
          <p>Get a quote or talk to our team about your shipment.</p>
        </div>
        <div class="cta-actions">
          <a class="btn-main btn-white" href="#quote">Get a Quote</a>
          <a class="btn-main btn-white-outline" target="_blank" rel="noopener" href="${ask(`Hi JP Express, I want to ship to ${d.n}.`)}">WhatsApp</a>
        </div>
      </div>
    </div>
  </section>`;

  /* ---------- SEO updates ---------- */
  const title = `Shipping from Bangladesh to ${d.n} | JP Express`;
  const desc = `Courier and freight from Bangladesh to ${d.n}: services, estimated ${d.t} transit, documents, customs notes, restricted items and a quote path.`;
  const url = `https://www.jpex.com.bd/country.html?c=${slug}`;
  document.title = title;

  const heroCrumb = document.querySelector('.page-hero .page-crumb [aria-current="page"]');
  if (heroCrumb) heroCrumb.textContent = d.n;
  const heroH1 = document.querySelector('.page-hero h1');
  if (heroH1) heroH1.innerHTML = 'Shipping from Bangladesh to <span class="accent">' + d.n + '</span>';
  const heroP = document.querySelector('.page-hero .hero-copy p');
  if (heroP) heroP.textContent = 'Services, transit time, documents and customs notes from Bangladesh to ' + d.n + '.';

  const meta = (sel, attr, val) => { const e = document.querySelector(sel); if (e) e.setAttribute(attr, val); };
  meta('meta[name="description"]', 'content', desc);
  meta('link[rel="canonical"]', 'href', url);
  meta('meta[property="og:title"]', 'content', title);
  meta('meta[property="og:description"]', 'content', desc);
  meta('meta[property="og:url"]', 'content', url);
  meta('meta[name="twitter:title"]', 'content', title);
  meta('meta[name="twitter:description"]', 'content', desc);

  const ld = o => { const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(o); document.head.appendChild(s); };
  ld({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      ['Home', 'index.html'],
      ['Destinations', 'countries.html'],
      [d.n, 'country.html?c=' + slug]
    ].map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: 'https://www.jpex.com.bd/' + x[1] }))
  });
  ld({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } }))
  });

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
  f.forEach(e => e && e.addEventListener('input', calc));
  calc();
  const qForm = $('qForm');
  if (qForm) qForm.addEventListener('submit', e => e.preventDefault());

  /* Tabs (personal / commercial) */
  root.querySelectorAll('.cd-tabs button').forEach(b => b.addEventListener('click', () => {
    const box = b.closest('.cd-card');
    box.querySelectorAll('.cd-tabs button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
    box.querySelectorAll('[data-p]').forEach(p => p.hidden = p.dataset.p !== b.dataset.t);
  }));

  /* Scroll-spy for sticky nav */
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

    const rev = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); }
    }), { threshold: 0.08 });
    root.querySelectorAll('.cx').forEach(s => rev.observe(s));
  } else {
    root.querySelectorAll('.cx').forEach(s => s.classList.add('in'));
  }
})();