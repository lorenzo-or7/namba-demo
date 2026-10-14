/* home.js — interações da página inicial (abas dos equipamentos, certificado, prazos). */
(function () {
  'use strict';
  var P = (window.NAMBA_CONFIG || {}).prazos || {};

  /* Prazos vêm de config.js, para não haver números diferentes em cada lugar. */
  document.querySelectorAll('[data-prazo]').forEach(function (el) {
    var v = P[el.getAttribute('data-prazo')]; if (v) el.textContent = v;
  });
  document.querySelectorAll('[data-prazos]').forEach(function (dl) {
    var dd = dl.querySelectorAll('dd');
    if (dd[0] && P.orcamento) dd[0].textContent = P.orcamento;
    if (dd[1] && P.reparo) dd[1].textContent = P.reparo;
    if (dd[2] && P.importacao) dd[2].textContent = P.importacao;
  });

  /* Abas "O que passa pela nossa bancada" (teclado: setas, Home e End). */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.line-tab'));
  function select(t, focus) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      var p = document.getElementById(x.getAttribute('aria-controls'));
      if (on && p.hidden) { p.hidden = false; p.classList.add('is-in'); setTimeout(function () { p.classList.remove('is-in'); }, 300); }
      else if (!on) p.hidden = true;
    });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = tabs.length, j = null;
      if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % n;
      if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + n) % n;
      if (k === 'Home') j = 0;
      if (k === 'End') j = n - 1;
      if (j === null) return;
      e.preventDefault(); select(tabs[j], true);
    });
  });

  /* Certificado ampliado */
  var d = document.getElementById('certDialog');
  function open() { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  ['certOpen', 'certOpen2'].forEach(function (id) { var b = document.getElementById(id); if (b && d) b.addEventListener('click', open); });
  if (d) d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
})();
