(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var input = $("indSearch");
  if (!input) return;

  var clear = $("indClear"), count = $("indCount"), empty = $("indEmpty"), reset = $("indReset");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".ind-card"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".ind-tab"));
  var needs = Array.prototype.slice.call(document.querySelectorAll(".ind-need"));
  var state = { cat: "all", need: "", q: "" };

  cards.forEach(function (c) {
    c._text = (c.textContent + " " + (c.getAttribute("data-tags") || "")).toLowerCase().replace(/\s+/g, " ");
  });

  function apply() {
    var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;

    cards.forEach(function (c) {
      var okCat = state.cat === "all" || c.getAttribute("data-cat") === state.cat;
      var okNeed = !state.need || (" " + c.getAttribute("data-needs") + " ").indexOf(" " + state.need + " ") > -1;
      var okText = terms.every(function (t) { return c._text.indexOf(t) > -1; });
      var ok = okCat && okNeed && okText;
      c.hidden = !ok;
      if (ok) shown++;
    });

    tabs.forEach(function (t) {
      var on = t.getAttribute("data-cat") === state.cat;
      t.classList.toggle("active", on);
      t.setAttribute("aria-pressed", on);
    });
    needs.forEach(function (n) {
      var on = n.getAttribute("data-need") === state.need;
      n.classList.toggle("active", on);
      n.setAttribute("aria-pressed", on);
    });

    clear.hidden = !state.q;
    empty.hidden = shown !== 0;
    var filtered = state.cat !== "all" || state.need || state.q;
    count.textContent = shown ? (filtered ? "Showing " + shown + " of " + cards.length + " industries" : "") : "";
  }

  input.addEventListener("input", function () { state.q = input.value.trim(); apply(); });
  clear.addEventListener("click", function () { input.value = ""; state.q = ""; apply(); input.focus(); });
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { state.cat = t.getAttribute("data-cat"); apply(); });
  });
  needs.forEach(function (n) {
    n.addEventListener("click", function () {
      var v = n.getAttribute("data-need");
      state.need = state.need === v ? "" : v;
      apply();
    });
  });
  if (reset) reset.addEventListener("click", function () {
    state = { cat: "all", need: "", q: "" };
    input.value = "";
    apply();
  });
  apply();
})();