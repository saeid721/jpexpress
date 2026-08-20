(() => {
  const filters = [...document.querySelectorAll('.blog-filter')];
  const grid = document.getElementById('articleGrid');
  const cards = [...grid.querySelectorAll('.article-card')];
  const search = document.getElementById('articleSearch');
  const sort = document.getElementById('articleSort');
  const count = document.getElementById('articleCount');
  const empty = document.getElementById('articleEmpty');
  const loadMore = document.getElementById('loadMore');
  let category = 'all';
  let visibleLimit = 8;
  const render = () => {
    const query = (search.value || '').trim().toLowerCase();
    const sorted = [...cards].sort((a, b) => sort.value === 'read' ? Number(a.dataset.read) - Number(b.dataset.read) : Number(b.querySelector('time').dateTime.replaceAll('-', '')) - Number(a.querySelector('time').dateTime.replaceAll('-', '')));
    let matches = 0;
    sorted.forEach((card, index) => {
      const categoryMatch = category === 'all' || card.dataset.category === category;
      const searchMatch = !query || card.dataset.search.includes(query) || card.querySelector('h3').textContent.toLowerCase().includes(query);
      const show = categoryMatch && searchMatch && index < visibleLimit;
      card.style.display = show ? '' : 'flex';
      if (!show) card.style.display = categoryMatch && searchMatch && index < visibleLimit ? '' : 'none';
      if (categoryMatch && searchMatch) matches++;
    });
    count.textContent = Math.min(matches, visibleLimit);
    empty.style.display = matches ? 'none' : 'block';
    loadMore.style.display = matches > visibleLimit ? 'inline-flex' : 'none';
  };
  filters.forEach(filter => filter.addEventListener('click', () => { filters.forEach(item => item.classList.toggle('active', item === filter)); category = filter.dataset.category; visibleLimit = 8; render(); }));
  search.addEventListener('input', () => { visibleLimit = 8; render(); });
  sort.addEventListener('change', render);
  loadMore.addEventListener('click', () => { visibleLimit += 4; render(); });
  document.addEventListener('keydown', event => { if (event.key === '/' && document.activeElement !== search && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); } });
  const newsletter = document.getElementById('newsletterForm');
  newsletter.addEventListener('submit', event => { event.preventDefault(); if (!newsletter.checkValidity()) { newsletter.querySelector(':invalid').focus(); return; } document.getElementById('newsletterSuccess').classList.add('visible'); newsletter.reset(); });
  render();
})();
