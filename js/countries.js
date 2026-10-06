(function () {
  'use strict';
  const grid = document.getElementById('ctrGrid');
  if (!grid || typeof COUNTRY_DATA === 'undefined') return;

  const $ = id => document.getElementById(id);
  const search = $('ctrSearch'), clearBtn = $('ctrClear'), count = $('ctrCount'),
        empty = $('ctrEmpty'), sortSel = $('ctrSort'), filters = $('ctrFilters');
  const list = Object.keys(COUNTRY_DATA).map(s => Object.assign({ s: s }, COUNTRY_DATA[s]));
  let region = 'All';

  const card = c => {
    const names = c.v.split('').map(k => SERVICES[k].n);
    return '<a class="ctr-card" href="country.html?c=' + c.s + '" aria-label="Shipping guide: Bangladesh to ' + c.n + '">' +
      '<span class="ctr-card-top"><img src="https://flagcdn.com/w80/' + c.c + '.png" width="44" height="44" alt="" loading="lazy">' +
      '<span><strong>' + c.n + '</strong><small>' + c.r + '</small></span></span>' +
      '<span class="ctr-card-meta"><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + c.t + '</span>' +
      '<span><i class="fa-solid fa-layer-group" aria-hidden="true"></i> ' + names.length + ' services</span></span>' +
      '<span class="ctr-tags">' + names.slice(0, 3).map(n => '<em>' + n + '</em>').join('') + '</span>' +
      '<span class="ctr-card-go">View shipping guide <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></a>';
  };

  // Popular destinations
  const pop = $('ctrPopular');
  if (pop) pop.innerHTML = list.filter(c => c.pop).map(card).join('');

  // Region filter chips
  filters.innerHTML = ['All'].concat(REGIONS).map((r, i) =>
    '<button type="button" class="ctr-chip' + (i ? '' : ' active') + '" data-r="' + r + '" aria-pressed="' + (i ? 'false' : 'true') + '">' +
    r + ' <b>' + (i ? list.filter(c => c.r === r).length : list.length) + '</b></button>').join('');

  function render() {
    const q = search.value.trim().toLowerCase();
    let out = list.filter(c => (region === 'All' || c.r === region) &&
      (!q || (c.n + ' ' + c.cap + ' ' + c.r + ' ' + c.cur + ' ' + c.ci).toLowerCase().includes(q)));
    if (sortSel.value === 'az') out.sort((a, b) => a.n.localeCompare(b.n));
    else if (sortSel.value === 'fast') out.sort((a, b) => parseInt(a.t) - parseInt(b.t) || a.n.localeCompare(b.n));
    else out.sort((a, b) => (b.pop || 0) - (a.pop || 0) || a.n.localeCompare(b.n));
    grid.innerHTML = out.map(card).join('');
    empty.hidden = out.length > 0;
    clearBtn.hidden = !q;
    count.textContent = out.length + (out.length === 1 ? ' destination' : ' destinations') + (region !== 'All' ? ' in ' + region : '');
    const fb = $('ctrNoneQ'); if (fb) fb.textContent = q ? '“' + search.value.trim() + '”' : 'that destination';
  }

  search.addEventListener('input', render);
  sortSel.addEventListener('change', render);
  clearBtn.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  filters.addEventListener('click', e => {
    const b = e.target.closest('.ctr-chip'); if (!b) return;
    region = b.dataset.r;
    filters.querySelectorAll('.ctr-chip').forEach(x => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
    render();
  });
  // Quick search buttons in hero
  document.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
    search.value = b.dataset.q; render();
    $('directory').scrollIntoView({ behavior: 'smooth' });
  }));
  // Allow /countries.html?q=uk
  const qp = new URLSearchParams(location.search).get('q');
  if (qp) search.value = qp;
  render();
})();