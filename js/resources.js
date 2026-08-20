(() => {
  const search = document.getElementById('resourceSearch');
  const buttons = [...document.querySelectorAll('.filter-btn')];
  const cards = [...document.querySelectorAll('.resource-card')];
  const empty = document.getElementById('resourceEmpty');
  const count = document.getElementById('resourceCount');
  let activeFilter = 'all';
  const update = () => {
    const query = (search.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = !query || (card.dataset.search || '').includes(query) || card.querySelector('h3').textContent.toLowerCase().includes(query);
      const show = matchesFilter && matchesSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    empty.style.display = visible ? 'none' : 'block';
    count.textContent = visible;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.classList.toggle('active', item === button));
    activeFilter = button.dataset.filter;
    update();
  }));
  search.addEventListener('input', update);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && document.activeElement !== search && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
  });
  update();
})();
