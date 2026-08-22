(function () {
"use strict";

/* ---------- Category nav: highlight active link on scroll ---------- */
var links = document.querySelectorAll('.svp-catlink');
var sections = document.querySelectorAll('.svp-cat');
if (links.length && sections.length && 'IntersectionObserver' in window) {
  var byId = {};
  links.forEach(function (l) { byId[l.getAttribute('href').replace('#', '')] = l; });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        var link = byId[entry.target.id];
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (s) { io.observe(s); });
}

/* ---------- Category nav: click sets active immediately (snappier feel) ---------- */
links.forEach(function (l) {
  l.addEventListener('click', function () {
    links.forEach(function (x) { x.classList.remove('active'); });
    l.classList.add('active');
  });
});

})();