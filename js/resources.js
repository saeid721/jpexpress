(function () {
"use strict";

/* ---------- Sticky category nav: smooth scroll + scrollspy ---------- */
var catlinks = Array.from(document.querySelectorAll('.res-catlink'));
var sections = catlinks
  .map(function (l) { return document.querySelector(l.getAttribute('href')); })
  .filter(Boolean);

if (catlinks.length && sections.length && 'IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = '#' + entry.target.id;
        catlinks.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(function (s) { io.observe(s); });
}

/* ---------- Hero search: filters guide/article cards by title ---------- */
var heroSearch = document.getElementById('resHeroSearch');
if (heroSearch) {
  heroSearch.addEventListener('input', function () {
    var q = heroSearch.value.trim().toLowerCase();
    document.querySelectorAll('.res-card[data-title]').forEach(function (card) {
      var match = !q || card.getAttribute('data-title').toLowerCase().indexOf(q) !== -1;
      card.style.display = match ? '' : 'none';
    });
  });
}

/* ---------- Transit time table search ---------- */
var tableSearch = document.getElementById('resTransitSearch');
var tableBody = document.getElementById('resTransitBody');
var tableEmpty = document.getElementById('resTransitEmpty');
if (tableSearch && tableBody) {
  tableSearch.addEventListener('input', function () {
    var q = tableSearch.value.trim().toLowerCase();
    var rows = Array.from(tableBody.querySelectorAll('tr'));
    var visible = 0;
    rows.forEach(function (row) {
      var match = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (tableEmpty) tableEmpty.style.display = visible ? 'none' : 'block';
  });
}

})();