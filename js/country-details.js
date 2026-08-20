(function () {
  const wrap = document.getElementById('cdContent');
  if (!wrap) return;

  function getSlug() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('c')) return params.get('c');
    const path = window.location.pathname.split('/').filter(Boolean);
    const idx = path.indexOf('countries');
    return idx !== -1 && path[idx + 1] ? path[idx + 1] : null;
  }

  const slug = getSlug();
  const data = slug && COUNTRY_DATA[slug];

  function flagCode(flag) {
    return Array.from(flag).map(character =>
      String.fromCharCode(character.codePointAt(0) - 0x1F1E6 + 97)
    ).join('');
  }

  if (!data) {
    wrap.innerHTML = '<div class="text-center py-5"><i class="bi bi-flag" style="font-size:2rem;color:var(--red)"></i><h2 class="mt-3">Country Not Found</h2><p class="text-muted-jp mb-4">We could not find shipping details for this destination.</p><a href="countries.html" class="btn-jp btn-jp-primary">Browse All Countries <i class="bi bi-arrow-right"></i></a></div>';
    document.title = 'Country Not Found | JP Express';
    return;
  }

  document.title = 'Ship to ' + data.name + ' | JP Express';
  document.getElementById('cdFlag').innerHTML = '<img src="https://flagcdn.com/w80/' + flagCode(data.flag) + '.png" alt="" aria-hidden="true">';
  document.getElementById('cdName').textContent = data.name;
  document.getElementById('cdRegion').textContent = data.region;
  document.getElementById('cdBreadcrumbName').textContent = data.name;

  document.getElementById('cdStats').innerHTML =
    '<div class="row g-0"><div class="col-6 col-md-3 stat-item"><div class="stat-row"><span class="stat-ico"><i class="bi bi-stopwatch"></i></span><span class="stat-num" style="font-size:1.1rem">' + data.transit + '</span></div><div class="stat-label">Transit Time</div></div>' +
    '<div class="col-6 col-md-3 stat-item"><div class="stat-row"><span class="stat-ico"><i class="bi bi-geo-alt"></i></span><span class="stat-num" style="font-size:1.1rem">' + data.capital + '</span></div><div class="stat-label">Capital</div></div>' +
    '<div class="col-6 col-md-3 stat-item"><div class="stat-row"><span class="stat-ico"><i class="bi bi-cash-coin"></i></span><span class="stat-num" style="font-size:1.1rem">' + data.currency + '</span></div><div class="stat-label">Currency</div></div>' +
    '<div class="col-6 col-md-3 stat-item"><div class="stat-row"><span class="stat-ico"><i class="bi bi-truck"></i></span><span class="stat-num" style="font-size:1.1rem">' + data.services.length + '</span></div><div class="stat-label">Services Available</div></div></div>';

  document.getElementById('cdServices').innerHTML = data.services.map(s => '<li><i class="bi bi-check-circle-fill"></i>' + s + '</li>').join('');
  document.getElementById('cdDocs').innerHTML = data.docs.map(s => '<li><i class="bi bi-check-circle-fill"></i>' + s + '</li>').join('');
  document.getElementById('cdRestrict').innerHTML = data.restrictions.map(s => '<li><i class="bi bi-exclamation-triangle-fill"></i>' + s + '</li>').join('');
  document.getElementById('cdPricing').innerHTML = data.pricing.map(p => '<tr><td>' + p.tier + '</td><td>' + p.price + '</td></tr>').join('');

  document.getElementById('cdFaq').innerHTML = data.faqs.map((f, i) =>
    '<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button' + (i ? ' collapsed' : '') + '" type="button" data-bs-toggle="collapse" data-bs-target="#cdq' + i + '">' + f.q + '</button></h3>' +
    '<div id="cdq' + i + '" class="accordion-collapse collapse' + (i ? '' : ' show') + '" data-bs-parent="#cdFaq"><div class="accordion-body">' + f.a + '</div></div></div>'
  ).join('');

  const quoteLink = document.getElementById('cdQuoteBtn');
  if (quoteLink) quoteLink.href = 'index.html?dest=' + encodeURIComponent(data.name) + '#tools';

})();