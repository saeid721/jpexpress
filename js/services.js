(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var behavior = reduced ? "auto" : "smooth";
  var $ = function (id) { return document.getElementById(id); };

  var inner = document.querySelector(".svp-catnav-inner");
  var links = Array.prototype.slice.call(document.querySelectorAll(".svp-catlink"));
  var sections = Array.prototype.slice.call(document.querySelectorAll(".svp-cat"));
  var byId = {};
  links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });

  /* ---------- Category nav: active state + keep chip visible on mobile ---------- */
  var lockUntil = 0;

  function setActive(link) {
    if (!link) return;
    links.forEach(function (l) {
      var on = l === link;
      l.classList.toggle("active", on);
      if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });
    if (inner && inner.scrollWidth > inner.clientWidth) {
      var left = link.offsetLeft - (inner.clientWidth - link.offsetWidth) / 2;
      inner.scrollTo({ left: Math.max(0, left), behavior: behavior });
    }
  }

  if (links.length && sections.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (Date.now() < lockUntil) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(byId[entry.target.id]);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }

  links.forEach(function (l) {
    l.addEventListener("click", function () {
      lockUntil = Date.now() + 900; // ignore scroll-spy while the smooth scroll runs
      setActive(l);
    });
  });

  /* ---------- Live service search + quick picks ---------- */
  var input = $("svcSearch");
  if (!input) return;

  var clear = $("svcClear");
  var count = $("svcCount");
  var empty = $("svcEmpty");
  var items = Array.prototype.slice.call(document.querySelectorAll(".svp-item"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".svp-chip"));

  items.forEach(function (el) {
    el._text = (el.textContent + " " + (el.getAttribute("data-tags") || "")).toLowerCase().replace(/\s+/g, " ");
  });

  function apply() {
    var q = input.value.trim().toLowerCase();
    var terms = q.split(/\s+/).filter(Boolean);
    var shown = 0;

    items.forEach(function (el) {
      var ok = terms.every(function (t) { return el._text.indexOf(t) > -1; });
      el.hidden = !ok;
      if (ok) shown++;
    });

    sections.forEach(function (s) {
      var any = !!s.querySelector(".svp-item:not([hidden])");
      s.hidden = !any;
      if (byId[s.id]) byId[s.id].hidden = !any;
    });

    clear.hidden = !q;
    empty.hidden = shown !== 0;
    count.textContent = q && shown ? "Showing " + shown + " of " + items.length + " services" : "";
    chips.forEach(function (c) { c.classList.toggle("active", !!q && c.getAttribute("data-q") === q); });

    var firstVisible = links.filter(function (l) { return !l.hidden; })[0];
    if (firstVisible) setActive(firstVisible);
  }

  function goToResults() {
    var first = sections.filter(function (s) { return !s.hidden; })[0];
    if (first) first.scrollIntoView({ behavior: behavior, block: "start" });
  }

  input.addEventListener("input", apply);

  clear.addEventListener("click", function () {
    input.value = "";
    apply();
    input.focus();
  });

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var q = c.getAttribute("data-q");
      var same = input.value.trim().toLowerCase() === q;
      input.value = same ? "" : q;
      apply();
      if (!same) goToResults();
    });
  });
})();