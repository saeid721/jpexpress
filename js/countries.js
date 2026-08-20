(function () {
  const grid = document.getElementById('ctrGrid');
  if (!grid) return;
  const searchInput = document.getElementById('ctrSearch');
  const filterBtns = document.querySelectorAll('.ctr-filter-btn');
  let activeRegion = 'all';

  function flagCode(flag) {
    return Array.from(flag).map(character =>
      String.fromCharCode(character.codePointAt(0) - 0x1F1E6 + 97)
    ).join('');
  }

  function cardHTML(slug, c) {
    const code = flagCode(c.flag);
    return '<a class="ctr-card" href="country.html?c=' + slug + '" data-slug="' + slug + '">' +
      '<div class="ctr-card-top"><img class="ctr-flag" src="https://flagcdn.com/w40/' + code + '.png" alt="" aria-hidden="true"><div class="ctr-card-country"><h3>' + c.name + '</h3><span class="region">' + c.region + '</span></div></div>' +
      '<div class="ctr-card-meta"><i class="bi bi-stopwatch"></i>' + c.transit + ' Transit</div>' +
      '<span class="ctr-card-more">View Details <i class="bi bi-arrow-right"></i></span>' +
    '</a>';
  }

  function render() {
    const q = (searchInput.value || '').trim().toLowerCase();
    let html = '';
    let count = 0;
    Object.keys(COUNTRY_DATA).forEach(slug => {
      const c = COUNTRY_DATA[slug];
      const matchesRegion = activeRegion === 'all' || c.region === activeRegion;
      const matchesSearch = !q || c.name.toLowerCase().includes(q);
      if (matchesRegion && matchesSearch) { html += cardHTML(slug, c); count++; }
    });
    grid.innerHTML = count ? html : '<div class="ctr-no-results"><i class="bi bi-search" style="font-size:1.8rem;display:block;margin-bottom:.6rem"></i>No countries match your search.</div>';
    grid.querySelectorAll('.ctr-card').forEach(a => a.addEventListener('click', onCardClick));
  }

  function onCardClick(e) {
    e.preventDefault();
    const slug = e.currentTarget.getAttribute('data-slug');
    window.history.pushState({}, '', 'country.html?c=' + slug);
    window.location.href = 'country.html?c=' + slug;
  }

  searchInput.addEventListener('input', render);
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeRegion = btn.getAttribute('data-region');
    render();
  }));

  render();
})();