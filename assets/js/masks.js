/* masks.js — formata CPF, CNPJ, telefone e CEP enquanto o usuário digita.
   Uso: <input data-mask="cpf|cnpj|phone|cep|cpf-phone"> */
(function () {
  'use strict';
  function fmt(type, v) {
    var d = v.replace(/\D/g, '');
    switch (type) {
      case 'cpf':
        d = d.slice(0, 11);
        return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      case 'cnpj':
        d = d.slice(0, 14);
        return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
      case 'phone':
        d = d.slice(0, 11);
        if (d.length <= 2) return d.length ? '(' + d : '';
        if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
        if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
        return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      case 'cep':
        d = d.slice(0, 8);
        return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
      default:
        return v;
    }
  }
  window.NambaMask = fmt;
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.matches || !el.matches('input[data-mask]')) return;
    var before = el.value, out = fmt(el.getAttribute('data-mask'), before);
    if (out !== before) el.value = out;
  });
})();
