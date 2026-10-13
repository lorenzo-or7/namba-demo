/* =====================================================================
   consulta.js — tela pública de acompanhamento da O.S.
   Usa apenas OSService (os-service.js). Não conhece o banco de dados.
   ===================================================================== */
(function () {
  'use strict';
  var S = window.OSService, DB = window.NambaDB, N = window.NAMBA || {};
  var $ = function (id) { return document.getElementById(id); };
  var form = $('lookupForm'), msg = $('formStatus');
  var views = { lookup: $('lookupView'), loading: $('loadingView'), down: $('downView'), result: $('resultView') };
  var title = $('pageTitle'), lead = $('pageLead');
  var titleText = title.textContent, leadText = lead.textContent;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var captchaRes = null, last = null;

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function data(v) { if (!v) return '—'; var d = new Date(String(v).length === 10 ? v + 'T12:00:00' : v); return isNaN(d) ? '—' : pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function dataHora(v) { if (!v) return '—'; var d = new Date(v); return isNaN(d) ? '—' : data(v) + ' às ' + pad(d.getHours()) + 'h' + pad(d.getMinutes()); }
  function dinheiro(v) { return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  document.querySelectorAll('.os-example').forEach(function (el) { el.textContent = S.exemplo; });
  $('numero_os').placeholder = 'Ex.: ' + S.exemplo;
  if (!S.modoDemo) { var pb = $('protoBox'); if (pb) pb.hidden = true; }

  function show(name) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
  }

  /* ---------- captcha local (o servidor real deve validar o dele) ---------- */
  function newCaptcha() {
    var a = 1 + Math.floor(Math.random() * 9), b = 1 + Math.floor(Math.random() * 9);
    captchaRes = a + b;
    $('captchaQ').textContent = a + ' + ' + b + ' =';
    $('captchaLabel').textContent = 'Quanto é ' + a + ' + ' + b + '? (verificação anti-robô)';
    form.captcha.value = '';
  }
  newCaptcha();

  /* ---------- validação visual ---------- */
  function setErr(field, input, errEl, text) {
    $(field).classList.toggle('has-error', !!text);
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    $(errEl).textContent = text || '';
    $(errEl).hidden = !text;
  }
  function checkNumero(show) {
    var v = form.numero_os.value;
    var ok = S.numeroValido(v);
    if (show || ok) setErr('fNumero', form.numero_os, 'numeroErr', !v ? 'Informe o número da O.S.' : ok ? '' : 'Confira o formato. O número tem uma letra seguida de cinco números, como ' + S.exemplo + '.');
    $('fNumero').classList.toggle('is-valid', ok);
    return ok;
  }
  function docDigits() { return form.documento.value.replace(/\D/g, ''); }
  function checkDoc(show) {
    var d = docDigits(), ok = d.length === 10 || d.length === 11;
    if (show || ok) setErr('fDoc', form.documento, 'docErr', !d ? 'Informe o CPF ou o telefone cadastrado.' : ok ? '' : 'Digite os 11 números do CPF ou o telefone com DDD.');
    $('fDoc').classList.toggle('is-valid', ok);
    return ok;
  }
  form.numero_os.addEventListener('input', function () {
    var p = this.selectionStart, v = this.value.toUpperCase();
    if (v !== this.value) { this.value = v; this.setSelectionRange(p, p); }
    checkNumero(false);
  });
  form.numero_os.addEventListener('blur', function () { if (this.value) checkNumero(true); });
  form.documento.addEventListener('input', function () {
    // máscara leve: CPF quando parecer CPF (com pontos), senão telefone
    var d = docDigits().slice(0, 11), out = d;
    if (/[.\-]/.test(this.value) || (d.length === 11 && !/^\d{2}9/.test(d))) {
      out = d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (d.length > 2) {
      out = '(' + d.slice(0, 2) + ') ' + (d.length > 10 ? d.slice(2, 7) + '-' + d.slice(7) : d.length > 6 ? d.slice(2, 6) + '-' + d.slice(6) : d.slice(2));
    }
    if (out !== this.value) this.value = out;
    checkDoc(false);
  });
  form.documento.addEventListener('blur', function () { if (this.value) checkDoc(true); });

  function formMessage(text, kind) {
    msg.className = 'form-msg' + (kind ? ' is-' + kind : '');
    msg.innerHTML = text || '';
    msg.hidden = !text;
  }

  /* ---------- demonstração ---------- */
  var proto = $('protoBox');
  if (proto) {
    proto.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-os]');
      if (!b) return;
      form.numero_os.value = b.dataset.os;
      form.documento.value = b.dataset.doc;
      form.documento.dispatchEvent(new Event('input'));
      checkNumero(true);
      hideVerify();
      formMessage('');
      form.captcha.focus();
    });
    $('simDown').addEventListener('change', function () { S.simularIndisponivel(this.checked); });
    $('resetRate').addEventListener('click', function () { if (DB) DB.rateLimitZerar(); formMessage('Limite da demonstração zerado.', 'ok'); });
  }

  function hideVerify() { $('fVerify').hidden = true; form.verificacao.value = ''; setErr('fVerify', form.verificacao, 'verifyErr', ''); }

  /* ---------- envio ---------- */
  function setBusy(b) {
    var btn = $('submitBtn');
    btn.disabled = b; btn.classList.toggle('is-busy', b);
    btn.querySelector('.btn-label').textContent = b ? 'Consultando…' : ($('fVerify').hidden ? 'Ver andamento do conserto' : 'Confirmar e ver andamento');
  }

  function consultar() {
    var n = form.numero_os.value, d = form.documento.value, v = form.verificacao.value;
    last = { n: n, d: d, v: v };
    setBusy(true);
    show('loading');
    S.consultar(n, d, $('fVerify').hidden ? null : v).then(function (r) {
      setBusy(false);
      newCaptcha();
      if (r.status === 'ok') return renderResult(r.view);
      if (r.status === 'unavailable') { show('down'); views.down.focus(); return; }
      show('lookup');
      if (r.status === 'verify') {
        $('fVerify').hidden = false;
        $('verifyQuestion').textContent = r.pergunta;
        setErr('fVerify', form.verificacao, 'verifyErr', r.erro ? 'Os dígitos não conferem.' : '');
        $('submitBtn').querySelector('.btn-label').textContent = 'Confirmar e ver andamento';
        formMessage('Encontramos a O.S. Falta só uma confirmação para mostrar os dados.', 'info');
        form.verificacao.focus();
        return;
      }
      if (r.status === 'rate_limited') {
        formMessage('Muitas consultas em pouco tempo. Tente de novo em ' + (r.minutos || 10) + ' minuto' + (r.minutos === 1 ? '' : 's') + '.', 'error');
        return;
      }
      // not_found: mensagem genérica, sem dizer qual dado está errado
      formMessage('<b>Não encontramos uma O.S. com esses dados.</b> Confira o número, que começa com uma letra (ex.: ' + esc(S.exemplo) + '), e o CPF ou telefone usado na entrada do equipamento.', 'error');
      form.numero_os.focus();
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formMessage('');
    var ok = checkNumero(true) & checkDoc(true);
    var c = form.captcha.value.trim();
    var cok = c !== '' && Number(c) === captchaRes;
    setErr('fCaptcha', form.captcha, 'captchaErr', cok ? '' : c ? 'A soma não confere. Uma nova conta foi gerada.' : 'Responda a conta para continuar.');
    if (!$('fVerify').hidden && form.verificacao.value.replace(/\D/g, '').length !== 4) {
      setErr('fVerify', form.verificacao, 'verifyErr', 'Digite os 4 últimos dígitos.'); ok = false;
    }
    if (!ok || !cok) {
      if (c && !cok) newCaptcha();
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    consultar();
  });
  $('retryBtn').addEventListener('click', function () { if (last) consultar(); });

  /* ---------- resultado ---------- */
  var ICON = {
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    wait: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>'
  };
  var TIPO_CLASSE = { normal: 'st-normal', atencao: 'st-progress', acao: 'st-action', concluido: 'st-done', cancelado: 'st-cancel', devolvido: 'st-cancel' };

  function renderResult(v) {
    var s = v.situacao;
    var atualIdx = -1;
    v.etapas.forEach(function (e, i) { if (e.estado === 'atual') atualIdx = i; });
    var concl = v.etapas.filter(function (e) { return e.estado === 'concluida'; }).length;
    var progresso = s.tipo === 'concluido' ? 1 : atualIdx >= 0 ? atualIdx / (v.etapas.length - 1) : concl / (v.etapas.length - 1);

    var track = v.encerrado
      ? '<div class="os-ended ' + (s.tipo === 'cancelado' ? 'is-cancel' : 'is-return') + '"><span class="os-ended-ico">' + (s.tipo === 'cancelado' ? ICON.stop : ICON.back) + '</span><div><b>' + esc(s.rotulo) + '</b><p>Este atendimento foi encerrado antes das etapas de reparo. O histórico abaixo mostra o que aconteceu.</p></div></div>'
      : '<ol class="os-track" style="--n:' + v.etapas.length + ';--p:' + progresso.toFixed(3) + '" aria-label="Etapas do atendimento">' + v.etapas.map(function (e, i) {
          var cls = e.estado, ico = '', extra = '';
          if (e.estado === 'concluida') ico = ICON.ok;
          if (e.estado === 'atual') {
            if (s.tipo === 'atencao') { cls += ' is-attention'; ico = ICON.wait; extra = '<small>' + esc(s.rotulo) + '</small>'; }
            else if (s.tipo === 'acao') { cls += ' is-action'; extra = '<small>Aguardando você</small>'; }
            else extra = '<small>Etapa atual</small>';
          }
          return '<li class="' + cls + '"' + (e.estado === 'atual' ? ' aria-current="step"' : '') + '><span class="dot">' + ico + '</span><span class="lbl">' + esc(e.nome) + extra + '</span>' +
            '<span class="sr-only">' + (e.estado === 'concluida' ? ' (concluída)' : e.estado === 'atual' ? ' (etapa atual)' : ' (próxima)') + '</span></li>';
        }).join('') + '</ol>';

    var fields = [
      ['Número da O.S.', esc(v.numero)],
      ['Equipamento', esc(v.equipamento)],
      ['Tipo', esc(v.tipo || '—')],
      ['Recebido em', data(v.recebidoEm)],
      ['Situação atual', esc(s.rotulo)],
      ['Última atualização', dataHora(v.atualizadoEm)]
    ];

    var orc = '';
    if (v.orcamento) {
      orc = '<div class="os-card os-budget"><h3>Orçamento</h3><p class="os-money">' + dinheiro(v.orcamento.valor) + '</p><p>' +
        (v.orcamento.situacao === 'aguardando' ? 'Enviado para o seu e-mail com o detalhamento do serviço. Aprove por e-mail ou telefone para seguirmos.' : 'Valor informado no orçamento enviado por e-mail.') +
        '</p></div>';
    }

    var hist = v.historico.length ? '<ol class="os-history">' + v.historico.map(function (h, i) {
      return '<li class="' + (i === 0 ? 'is-last ' : '') + 'h-' + h.tipo + '"><time>' + dataHora(h.dataHora) + '</time><div><b>' + esc(h.rotulo) + '</b>' + (h.descricao ? '<p>' + esc(h.descricao) + '</p>' : '') + '</div></li>';
    }).join('') + '</ol>' : '<p class="caption">Ainda não há histórico registrado.</p>';

    views.result.innerHTML =
      (v.origem === 'demo' ? '<p class="demo-flag">Demonstração: dados fictícios, não ligados ao sistema da Namba.</p>' : '') +
      '<div class="os-head"><div><p class="os-num">O.S. ' + esc(v.numero) + '</p><h2>' + esc(v.equipamento) + '</h2></div>' +
      '<span class="badge ' + (TIPO_CLASSE[s.tipo] || 'st-normal') + '">' + esc(s.rotulo) + '</span></div>' +
      track +
      '<div class="os-next ' + (TIPO_CLASSE[s.tipo] || '') + '"><h3>Próximo passo</h3><p>' + esc(s.proximo) + '</p></div>' +
      '<div class="os-cards"><div class="os-card"><h3>Detalhes do atendimento</h3><dl class="os-dl">' +
        fields.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl></div>' + orc + '</div>' +
      '<div class="os-card"><h3>Histórico do atendimento</h3>' + hist + '</div>' +
      '<div class="actions"><button type="button" class="btn btn-line" id="again">Fazer nova consulta</button>' +
      '<a class="btn btn-red" href="' + (N.whatsapp || '#') + '" data-wa="os" data-wa-extra="' + esc(v.numero) + '">Falar sobre esta O.S. no WhatsApp</a></div>';

    if (N.applyWa) N.applyWa(views.result);
    show('result');
    title.textContent = 'Andamento do seu conserto';
    lead.textContent = 'Mostramos só o andamento do serviço. Dados pessoais e observações internas não aparecem aqui.';
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    views.result.focus({ preventScroll: true });
    var tr = views.result.querySelector('.os-track');
    if (tr && !reduce) { tr.classList.add('is-animating'); requestAnimationFrame(function () { requestAnimationFrame(function () { tr.classList.remove('is-animating'); }); }); }
    $('again').addEventListener('click', function () {
      form.reset(); hideVerify(); newCaptcha(); formMessage('');
      ['fNumero', 'fDoc'].forEach(function (f) { $(f).classList.remove('is-valid', 'has-error'); });
      show('lookup');
      title.textContent = titleText; lead.textContent = leadText;
      form.numero_os.focus();
    });
  }

  /* número vindo da etiqueta da página inicial */
  try {
    var pre = sessionStorage.getItem('namba-os-prefill');
    if (pre) { form.numero_os.value = pre; sessionStorage.removeItem('namba-os-prefill'); checkNumero(true); form.documento.focus(); }
  } catch (e) {}
})();
