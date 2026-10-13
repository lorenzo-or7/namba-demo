/* =====================================================================
   carta.js — carta de envio em 4 etapas + documento A4 para impressão.
   Tudo acontece no navegador. Os dados ficam em sessionStorage (somem ao
   fechar a aba) e só o CEP é consultado fora (ViaCEP), com aviso na tela.
   Campo obrigatório: apenas o nome, como na carta original.
   ===================================================================== */
(function () {
  'use strict';
  var form = document.getElementById('carta');
  var KEY = 'namba-carta-v2';
  var step = 1, maxStep = 1, TOTAL = 4;
  var $ = function (id) { return document.getElementById(id); };
  var msg = $('wizMsg');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = (window.NAMBA_CONFIG || {}).contato || {};

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function digits(v) { return String(v || '').replace(/\D/g, ''); }

  /* ---------- validações ---------- */
  function cpfOk(v) {
    var c = digits(v); if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    for (var t = 9; t < 11; t++) { var s = 0; for (var i = 0; i < t; i++) s += +c[i] * (t + 1 - i); if (+c[t] !== ((10 * s) % 11) % 10) return false; }
    return true;
  }
  function cnpjOk(v) {
    var c = digits(v); if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
    function dv(n) { var w = n === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2], s = 0; for (var i = 0; i < n; i++) s += +c[i] * w[i]; var r = s % 11; return r < 2 ? 0 : 11 - r; }
    return dv(12) === +c[12] && dv(13) === +c[13];
  }
  var RULES = {
    nome: function (v) { return v.trim().length < 3 ? 'Informe o nome completo. Ele é obrigatório na carta.' : ''; },
    cpf: function (v) { return v && !cpfOk(v) ? 'Este CPF não é válido. Confira os 11 números.' : ''; },
    cnpj: function (v) { return v && !cnpjOk(v) ? 'Este CNPJ não é válido. Confira os 14 números.' : ''; },
    fone: function (v) { var d = digits(v); return v && (d.length < 10 || d.length > 11) ? 'Use o DDD e o número, ex.: (11) 3259-7888.' : ''; },
    celular: function (v) { var d = digits(v); return v && (d.length < 10 || d.length > 11) ? 'Use o DDD e o número, ex.: (11) 98765-4321.' : ''; },
    email: function (v) { return v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Confira o e-mail, ex.: nome@provedor.com.br.' : ''; },
    cep: function (v) { return v && digits(v).length !== 8 ? 'O CEP tem 8 números.' : ''; }
  };
  var STEP_FIELDS = { 1: [], 2: ['nome', 'cpf', 'cnpj', 'fone', 'celular', 'email'], 3: ['cep'] };

  function pj() { return form.tipo_cliente.value === 'pj'; }
  function validateField(name) {
    var el = form.elements[name]; if (!el || el.closest('.pj-only[hidden], .pf-only[hidden]')) return '';
    var err = RULES[name] ? RULES[name](el.value || '') : '';
    var box = $('f-' + name), e = $(name + '-err');
    if (box) box.classList.toggle('has-error', !!err);
    el.setAttribute('aria-invalid', err ? 'true' : 'false');
    if (e) { e.textContent = err; e.hidden = !err; }
    return err;
  }
  function validateStep(n) {
    var errs = (STEP_FIELDS[n] || []).map(validateField).filter(Boolean);
    if (errs.length) {
      msg.textContent = errs.length === 1 ? 'Corrija o campo destacado para continuar.' : 'Corrija os ' + errs.length + ' campos destacados para continuar.';
      msg.hidden = false;
      var first = form.querySelector('.wiz-step[data-step="' + n + '"] [aria-invalid="true"]');
      if (first) first.focus();
      return false;
    }
    msg.hidden = true;
    return true;
  }
  Object.keys(RULES).forEach(function (n) {
    var el = form.elements[n]; if (!el) return;
    el.addEventListener('blur', function () { if (el.value) validateField(n); });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') validateField(n); });
  });

  /* ---------- dados ---------- */
  function data() {
    var d = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') { if (!d[el.name]) d[el.name] = []; if (el.checked) d[el.name].push(el.value); }
      else if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; }
      else d[el.name] = el.value.trim();
    });
    return d;
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ d: data(), max: maxStep })); } catch (e) {} }
  function restore() {
    var s = null; try { s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!s) return;
    Object.keys(s.d).forEach(function (k) {
      var v = s.d[k];
      Array.prototype.forEach.call(form.querySelectorAll('[name="' + k + '"]'), function (el) {
        if (el.type === 'checkbox') el.checked = (v || []).indexOf(el.value) >= 0;
        else if (el.type === 'radio') el.checked = el.value === v;
        else el.value = v || '';
      });
    });
    maxStep = Math.min(TOTAL, s.max || 1);
  }
  form.addEventListener('input', save);
  form.addEventListener('change', save);

  /* pessoa física x empresa */
  function syncTipo() {
    var isPj = pj();
    form.querySelectorAll('.pj-only').forEach(function (el) { el.hidden = !isPj; });
    form.querySelectorAll('.pf-only').forEach(function (el) { el.hidden = isPj; });
    $('nomeLabel').textContent = isPj ? 'Razão social ou nome da empresa' : 'Nome completo';
  }
  form.querySelectorAll('input[name="tipo_cliente"]').forEach(function (r) { r.addEventListener('change', syncTipo); });

  /* contador do defeito */
  function count() { $('defCount').textContent = form.defeitos.value.length + ' de 800 caracteres'; }
  form.defeitos.addEventListener('input', count);

  /* ---------- navegação entre etapas ---------- */
  var steps = form.querySelectorAll('.wiz-step');
  var tabs = document.querySelectorAll('#wizSteps button');
  function go(n, focus) {
    step = n; maxStep = Math.max(maxStep, n);
    steps.forEach(function (s) {
      var on = +s.dataset.step === n;
      if (on && s.hidden) { s.hidden = false; if (!reduce) { s.classList.add('is-entering'); requestAnimationFrame(function () { requestAnimationFrame(function () { s.classList.remove('is-entering'); }); }); } }
      else if (!on) s.hidden = true;
    });
    tabs.forEach(function (b) {
      var k = +b.dataset.go;
      b.disabled = k > maxStep;
      b.parentNode.classList.toggle('done', k < n || (k <= maxStep && k !== n && k < maxStep));
      if (k === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $('wizBar').style.transform = 'scaleX(' + (n / TOTAL) + ')';
    $('prevBtn').hidden = n === 1;
    $('nextBtn').hidden = n === TOTAL;
    $('printBtn').hidden = n !== TOTAL;
    $('nextBtn').textContent = n === 3 ? 'Revisar carta' : 'Continuar';
    if (n === TOTAL) renderReview();
    msg.hidden = true;
    save();
    if (focus) {
      var target = form.querySelector('.wiz-step[data-step="' + n + '"] legend, .wiz-step[data-step="' + n + '"] .wiz-legend');
      var top = form.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      var firstInput = form.querySelector('.wiz-step[data-step="' + n + '"] input:not([type=radio]):not([type=checkbox]), .wiz-step[data-step="' + n + '"] select');
      if (n === TOTAL) { target.focus({ preventScroll: true }); }
      else if (firstInput && window.innerWidth > 760) firstInput.focus({ preventScroll: true });
    }
  }
  $('nextBtn').addEventListener('click', function () { if (validateStep(step)) go(step + 1, true); });
  $('prevBtn').addEventListener('click', function () { go(step - 1, true); });
  tabs.forEach(function (b) { b.addEventListener('click', function () {
    var k = +b.dataset.go;
    if (k > step && !validateStep(step)) return;
    go(k, true);
  }); });
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); if (step < TOTAL) $('nextBtn').click(); }
  });

  /* ---------- limpar (confirmação em dois cliques) ---------- */
  var armed = false, clearBtn = $('clearBtn');
  clearBtn.addEventListener('click', function () {
    if (!armed) { armed = true; clearBtn.textContent = 'Clique de novo para apagar tudo'; setTimeout(function () { armed = false; clearBtn.textContent = 'Limpar dados'; }, 4000); return; }
    form.reset(); try { sessionStorage.removeItem(KEY); } catch (e) {}
    armed = false; clearBtn.textContent = 'Limpar dados'; maxStep = 1;
    form.querySelectorAll('.has-error').forEach(function (b) { b.classList.remove('has-error'); });
    form.querySelectorAll('.field-err').forEach(function (e) { e.hidden = true; });
    syncTipo(); count(); go(1, true);
  });

  /* ---------- CEP (ViaCEP) ---------- */
  var cepStatus = $('cep-status'), cepDefault = cepStatus.textContent;
  form.cep.addEventListener('input', function () {
    var d = digits(form.cep.value);
    if (d.length !== 8) { cepStatus.textContent = cepDefault; return; }
    cepStatus.textContent = 'Buscando endereço…';
    fetch('https://viacep.com.br/ws/' + d + '/json/')
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) {
        if (j.erro) { cepStatus.textContent = 'CEP não encontrado. Preencha o endereço manualmente.'; return; }
        if (j.logradouro && !form.endereco.value) form.endereco.value = j.logradouro + ', ';
        if (j.bairro) form.bairro.value = j.bairro;
        if (j.localidade) form.cidade.value = j.localidade;
        if (j.uf) form.estado.value = j.uf;
        cepStatus.textContent = 'Endereço preenchido. Complete com o número e confira os dados.';
        save();
        form.endereco.focus();
        var len = form.endereco.value.length; form.endereco.setSelectionRange(len, len);
      })
      .catch(function () { cepStatus.textContent = 'Não foi possível buscar o CEP agora. Preencha o endereço manualmente.'; });
  });

  /* ---------- revisão ---------- */
  function rows(list) {
    return list.filter(function (r) { return r[1]; }).map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') || '<div><dt>—</dt><dd>Nada preenchido</dd></div>';
  }
  function acess(d) { return (d.acessorios || []).concat(d.acessorios_outros ? [d.acessorios_outros] : []).join(', '); }
  function endereco(d) { return [d.endereco, d.complemento].filter(Boolean).join(', '); }
  function cidadeUf(d) { return [d.bairro, [d.cidade, d.estado].filter(Boolean).join(' – ')].filter(Boolean).join(', '); }

  function renderReview() {
    var d = data();
    var blocks = [
      [1, 'Equipamento', [['Tipo', d.tipo_equip], ['Câmera ou flash', d.modelo_camera], ['Objetiva', d.modelo_objetiva], ['Número de série', d.numero_serie], ['Defeito', d.defeitos], ['Acessórios enviados', acess(d)]]],
      [2, d.tipo_cliente === 'pj' ? 'Empresa' : 'Seus dados', [['Nome', d.nome], ['CPF', d.tipo_cliente === 'pj' ? '' : d.cpf], ['CNPJ', d.tipo_cliente === 'pj' ? d.cnpj : ''], ['Inscrição estadual', d.tipo_cliente === 'pj' ? d.ie : ''], ['Contato', d.tipo_cliente === 'pj' ? d.contato_empresa : ''], ['Telefone', d.fone], ['Celular', d.celular], ['E-mail', d.email]]],
      [3, 'Endereço', [['Endereço', endereco(d)], ['Bairro e cidade', cidadeUf(d)], ['CEP', d.cep]]]
    ];
    var warn = [];
    if (!d.modelo_camera && !d.modelo_objetiva) warn.push('o modelo do equipamento');
    if (!d.defeitos) warn.push('o resumo do defeito');
    if (!d.fone && !d.celular && !d.email) warn.push('um telefone ou e-mail para contato');
    $('review').innerHTML = (warn.length ? '<div class="form-msg is-info">Recomendamos informar ' + warn.join(', ').replace(/, ([^,]*)$/, ' e $1') + '. Isso agiliza a avaliação.</div>' : '') +
      blocks.map(function (b) {
        return '<section class="review-block"><div class="review-head"><h3>' + b[1] + '</h3><button type="button" class="link-btn" data-edit="' + b[0] + '">Editar</button></div><dl>' + rows(b[2]) + '</dl></section>';
      }).join('');
    $('review').querySelectorAll('[data-edit]').forEach(function (btn) { btn.addEventListener('click', function () { go(+btn.dataset.edit, true); }); });
    buildDoc(d);
  }

  /* ---------- documento A4 ---------- */
  function line(label, value, wide) {
    return '<div class="cd-f' + (wide ? ' wide' : '') + '"><span>' + label + '</span><b>' + (value ? esc(value) : '&nbsp;') + '</b></div>';
  }
  function buildDoc(d) {
    var hoje = new Date(); var dt = ('0' + hoje.getDate()).slice(-2) + '/' + ('0' + (hoje.getMonth() + 1)).slice(-2) + '/' + hoje.getFullYear();
    var isPj = d.tipo_cliente === 'pj';
    var ac = ['Bateria', 'Carregador', 'Cartão de memória', 'Tampa do corpo', 'Tampas da objetiva'];
    $('cartaDoc').innerHTML =
      '<header class="cd-head"><img src="assets/img/logo-cinecameraservice.png" alt="Cine Camera Service" width="372" height="61">' +
        '<address><b>Cine Camera Service Ltda.</b><br>' + esc(C.endereco1) + '<br>' + esc(C.endereco2) + '<br>' + esc(C.telefone) + ' · ' + esc(C.email) + '</address></header>' +
      '<div class="cd-title"><h1>Carta de envio de equipamento</h1><p>Para avaliação e orçamento de assistência técnica · Emitida em ' + dt + '</p></div>' +
      '<section><h2>1. Equipamento</h2><div class="cd-grid">' +
        line('Tipo', d.tipo_equip) + line('Número de série', d.numero_serie) +
        line('Modelo da câmera ou do flash', d.modelo_camera, true) + line('Modelo da objetiva', d.modelo_objetiva, true) +
      '</div><div class="cd-box"><span>Descrição do defeito</span><p>' + (d.defeitos ? esc(d.defeitos).replace(/\n/g, '<br>') : '&nbsp;') + '</p></div>' +
      '<div class="cd-acc"><span>Acessórios enviados</span>' + ac.map(function (a) { return '<i class="' + ((d.acessorios || []).indexOf(a) >= 0 ? 'on' : '') + '">' + a + '</i>'; }).join('') +
        (d.acessorios_outros ? '<i class="on">' + esc(d.acessorios_outros) + '</i>' : '') + '</div></section>' +
      '<section><h2>2. ' + (isPj ? 'Empresa remetente' : 'Remetente') + '</h2><div class="cd-grid">' +
        line(isPj ? 'Razão social' : 'Nome completo', d.nome, true) +
        (isPj ? line('CNPJ', d.cnpj) + line('Inscrição estadual', d.ie) + line('Pessoa de contato', d.contato_empresa, true) : line('CPF', d.cpf) + line('E-mail', d.email)) +
        line('Telefone', d.fone) + line('Celular', d.celular) + (isPj ? line('E-mail', d.email, true) : '') +
      '</div></section>' +
      '<section><h2>3. Endereço para devolução</h2><div class="cd-grid">' +
        line('Endereço', endereco(d), true) + line('Bairro', d.bairro) + line('CEP', d.cep) + line('Cidade', d.cidade) + line('Estado', d.estado) +
      '</div></section>' +
      '<section class="cd-notes"><h2>Informações do envio</h2><ul>' +
        '<li>Esta carta deve ir impressa dentro da caixa, junto com o equipamento.</li>' +
        (isPj ? '<li>Empresa: anexar a nota fiscal de remessa para conserto.</li>' : '') +
        '<li>Equipamento na garantia do fabricante: anexar cópia da nota fiscal de compra.</li>' +
        '<li>O orçamento é enviado por e-mail após a análise, sem compromisso.</li>' +
      '</ul></section>' +
      '<footer class="cd-sign"><div><span>Local e data</span></div><div><span>Assinatura</span></div></footer>' +
      '<p class="cd-foot">Cine Camera Service / Namba · Assistência técnica em equipamentos fotográficos Canon desde 1966</p>';
  }

  $('printBtn').addEventListener('click', function () {
    if (!validateStep(2)) { go(2, true); validateStep(2); return; }
    buildDoc(data());
    window.print();
  });

  /* ---------- início ---------- */
  restore(); syncTipo(); count();
  go(1, false);
  for (var i = 2; i <= maxStep; i++) tabs[i - 1].disabled = false;
})();
