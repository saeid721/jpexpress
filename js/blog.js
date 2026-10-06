(function () {
  'use strict';
  const grid = document.getElementById('blGrid');
  if (!grid || typeof BLOG_POSTS === 'undefined') return;

  const $ = id => document.getElementById(id);
  const search = $('blSearch'), clear = $('blClear'), sortSel = $('blSort'), chips = $('blChips'),
        count = $('blCount'), more = $('blMore'), empty = $('blEmpty'), featWrap = $('blFeatWrap');
  const PAGE = 6;
  const params = new URLSearchParams(location.search);
  let cat = BLOG_CATS[params.get('cat')] ? params.get('cat') : 'all';
  let q = (params.get('q') || '').trim();
  let limit = PAGE;
  search.value = q;

  const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const meta = p => `<div class="bl-meta"><span>${BLOG_CATS[p.c]}</span><time datetime="${p.d}">${fmt(p.d)}</time><span>${p.r} min read</span></div>`;
  const card = p => `<article class="bl-card"><div class="bl-art t-${p.k}"><i class="fa-solid ${p.i}" aria-hidden="true"></i></div>
    <div class="bl-body">${meta(p)}<h3>${p.t}</h3><p>${p.x}</p>
    <a class="bl-link" href="${p.h}">${p.a} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i><span class="visually-hidden">: ${p.t}</span></a></div></article>`;

  // Stats (computed from real data, no invented numbers)
  const used = Object.keys(BLOG_CATS).filter(k => BLOG_POSTS.some(p => p.c === k));
  $('blStats').textContent = BLOG_POSTS.length + ' articles · ' + used.length + ' topics';

  // Category chips
  chips.innerHTML = [['all', 'All Articles', BLOG_POSTS.length]].concat(used.map(k => [k, BLOG_CATS[k], BLOG_POSTS.filter(p => p.c === k).length]))
    .map(c => `<button type="button" class="bl-chip" data-c="${c[0]}" aria-pressed="false">${c[1]} <b>${c[2]}</b></button>`).join('');

  // Featured
  const f = BLOG_POSTS.find(p => p.f);
  if (f) $('blFeat').innerHTML = `<div class="bl-feat"><div class="bl-feat-art t-${f.k}"><span>FEATURED · ${BLOG_CATS[f.c].toUpperCase()}</span><i class="fa-solid ${f.i}" aria-hidden="true"></i>
    <div class="bl-route"><b>DAC</b><i class="fa-solid fa-arrow-right" aria-hidden="true"></i><b>WORLD</b></div></div>
    <div class="bl-feat-copy">${meta(f)}<h2>${f.t}</h2><p>${f.fx || f.x}</p>
    <a class="btn-main btn-red" href="${f.h}">${f.a} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
    <div class="bl-share" aria-label="Share"><a href="https://wa.me/?text=${encodeURIComponent(f.t + ' ' + location.href.split('#')[0])}" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href.split('#')[0])}" target="_blank" rel="noopener" aria-label="Share on LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href.split('#')[0])}" target="_blank" rel="noopener" aria-label="Share on Facebook"><i class="fa-brands fa-facebook-f"></i></a>
    <button type="button" id="blCopy" aria-label="Copy link"><i class="fa-solid fa-link"></i></button></div></div></div>`;

  function render() {
    const s = q.toLowerCase(), filtering = !!s || cat !== 'all';
    const list = BLOG_POSTS.filter(p => (cat === 'all' || p.c === cat) && (!s || (p.t + ' ' + p.x + ' ' + p.q + ' ' + BLOG_CATS[p.c]).toLowerCase().includes(s)) && (filtering || !p.f));
    list.sort(sortSel.value === 'read' ? (a, b) => a.r - b.r : (a, b) => b.d.localeCompare(a.d));
    const shown = list.slice(0, limit);
    grid.innerHTML = shown.map(card).join('');
    count.textContent = list.length ? `Showing ${shown.length} of ${list.length} article${list.length === 1 ? '' : 's'}` : '';
    empty.hidden = list.length > 0;
    more.hidden = shown.length >= list.length;
    clear.hidden = !q;
    if (featWrap) featWrap.hidden = filtering || !f;
    chips.querySelectorAll('.bl-chip').forEach(b => { const on = b.dataset.c === cat; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
    const u = new URLSearchParams(); if (cat !== 'all') u.set('cat', cat); if (q) u.set('q', q);
    history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash);
  }

  chips.addEventListener('click', e => { const b = e.target.closest('.bl-chip'); if (!b) return; cat = b.dataset.c; limit = PAGE; render(); });
  search.addEventListener('input', () => { q = search.value.trim(); limit = PAGE; render(); });
  clear.addEventListener('click', () => { search.value = ''; q = ''; render(); search.focus(); });
  sortSel.addEventListener('change', render);
  more.addEventListener('click', () => { limit += PAGE; render(); });
  $('blReset').addEventListener('click', () => { search.value = ''; q = ''; cat = 'all'; limit = PAGE; render(); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('#blCopy'); if (!b || !navigator.clipboard) return;
    navigator.clipboard.writeText(location.href.split('#')[0]).then(() => {
      b.innerHTML = '<i class="fa-solid fa-check"></i>'; setTimeout(() => { b.innerHTML = '<i class="fa-solid fa-link"></i>'; }, 1500);
    });
  });

  // Blog structured data
  const s = document.createElement('script'); s.type = 'application/ld+json';
  s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Blog', name: 'JP Express Shipping & Logistics Blog', url: 'https://www.jpexpress.com/blog.html',
    publisher: { '@type': 'Organization', name: 'JP Express' },
    blogPost: BLOG_POSTS.map(p => ({ '@type': 'BlogPosting', headline: p.t, description: p.x, datePublished: p.d, articleSection: BLOG_CATS[p.c], author: { '@type': 'Organization', name: 'JP Express' } })) });
  document.head.appendChild(s);

  render();
})();