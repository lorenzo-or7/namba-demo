/* acessorios.js — filtro por categoria da vitrine de acessórios. */
(function () {
  'use strict';
  var btns = Array.prototype.slice.call(document.querySelectorAll('.acc-filters button'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.acc-card'));
  var count = document.getElementById('accCount');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function apply(cat) {
    var n = 0;
    cards.forEach(function (c) {
      var on = cat === 'todos' || c.getAttribute('data-cat') === cat;
      c.hidden = !on;
      if (on) {
        c.style.setProperty('--i', n++);
        if (!reduce) { c.classList.remove('is-in'); void c.offsetWidth; c.classList.add('is-in'); }
      }
    });
    count.innerHTML = '<b>' + pad(n) + '</b> ' + (n === 1 ? 'item' : 'itens');
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      apply(b.getAttribute('data-cat'));
    });
  });
})();
