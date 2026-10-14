/* =====================================================================
   os-service.js — camada entre a tela de consulta e a fonte de dados.

   A tela nunca fala direto com o banco. Ela chama OSService.consultar()
   e recebe sempre um destes resultados:

     { status: 'ok', view }          consulta concluída (view = dados públicos)
     { status: 'not_found' }         não há O.S. com esses dados
     { status: 'verify', pergunta }  é preciso confirmar a identidade
     { status: 'rate_limited', minutos }
     { status: 'unavailable' }       sistema fora do ar ou não integrado

   Fontes de dados:
     - config.os.apiUrl preenchido  → consulta o serviço real (POST JSON)
     - config.os.demo = true        → dados fictícios de demo-db.js
     - nenhum dos dois              → 'unavailable'

   Contrato sugerido para o serviço real (a definir com o back-end):
     POST {apiUrl}  { numero, documento, verificacao? }
     200 { status:'ok', os:{ numero, equipamento, tipo, recebidoEm,
           statusCodigo, atualizadoEm, orcamento?:{ valor, situacao } },
           historico:[{ statusCodigo, descricao, dataHora }] }
     200 { status:'not_found' } | { status:'verify', pergunta }
     429 → rate_limited       5xx/erro de rede → unavailable
   ===================================================================== */
(function () {
  'use strict';
  var CFG = window.NAMBA_CONFIG || {};
  var OS = CFG.os || {};
  var STATUS = CFG.status || {};
  var ETAPAS = CFG.etapas || [];
  var simularIndisponivel = false;

  function normalizarNumero(v) { return String(v || '').replace(/\s+/g, '').toUpperCase(); }
  function numeroValido(v) {
    try { return new RegExp(OS.padrao || '.+').test(normalizarNumero(v)); } catch (e) { return !!v; }
  }
  function digitos(v) { return String(v || '').replace(/\D+/g, ''); }

  function texto(t) {
    var p = CFG.prazos || {};
    return String(t || '').replace('{orcamento}', p.orcamento || '').replace('{importacao}', p.importacao || '');
  }

  /* Converte o registro (demo ou API) para o que o cliente pode ver.
     Nada de CPF, telefone, observações internas ou número de série. */
  function toView(os, historico, origem) {
    var st = STATUS[os.statusCodigo] || { rotulo: os.statusCodigo, etapa: null, tipo: 'normal', proximo: '' };
    var idx = -1;
    ETAPAS.forEach(function (e, i) { if (e.id === st.etapa) idx = i; });
    var etapas = ETAPAS.map(function (e, i) {
      var estado = 'futura';
      if (st.tipo === 'concluido') estado = 'concluida';
      else if (idx >= 0 && i < idx) estado = 'concluida';
      else if (i === idx) estado = 'atual';
      return { id: e.id, nome: e.nome, estado: estado };
    });
    return {
      origem: origem,
      numero: os.numero,
      equipamento: os.equipamento,
      tipo: os.tipo || null,
      recebidoEm: os.recebidoEm,
      atualizadoEm: os.atualizadoEm,
      situacao: { codigo: os.statusCodigo, rotulo: st.rotulo, tipo: st.tipo, proximo: texto(st.proximo) },
      encerrado: st.tipo === 'cancelado' || st.tipo === 'devolvido',
      etapas: etapas,
      orcamento: os.orcamento || null,
      historico: (historico || []).map(function (h) {
        var hs = STATUS[h.statusCodigo] || { rotulo: h.statusCodigo, tipo: 'normal' };
        return { rotulo: hs.rotulo, tipo: hs.tipo, descricao: h.descricao || '', dataHora: h.dataHora };
      })
    };
  }

  function demoConsultar(numero, documento, verificacao) {
    var DB = window.NambaDB;
    if (!DB) return { status: 'unavailable' };
    if (DB.rateLimitBloqueado()) return { status: 'rate_limited', minutos: DB.rateLimitLiberaEm() };
    DB.rateLimitRegistrar();
    var r = DB.consultarPublico(numero, documento, verificacao);
    if (r.status !== 'ok') return r;
    var o = r.os;
    var orc = null;
    if (o.valor_orcamento !== null && o.valor_orcamento !== undefined) {
      orc = { valor: o.valor_orcamento, situacao: ['orcamento_enviado'].indexOf(o.status_atual) >= 0 ? 'aguardando' : 'informado' };
    }
    return {
      status: 'ok',
      view: toView({
        numero: o.numero_os, equipamento: o.equipamento, tipo: o.tipo, recebidoEm: o.data_entrada,
        statusCodigo: o.status_atual, atualizadoEm: o.atualizado_em, orcamento: orc
      }, r.historico.map(function (h) { return { statusCodigo: h.status, descricao: h.descricao, dataHora: h.data_hora }; }), 'demo')
    };
  }

  function apiConsultar(numero, documento, verificacao) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    return fetch(OS.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ numero: numero, documento: documento, verificacao: verificacao || undefined }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      if (res.status === 429) return { status: 'rate_limited' };
      if (!res.ok) return { status: 'unavailable' };
      return res.json().then(function (j) {
        if (j.status === 'ok') return { status: 'ok', view: toView(j.os, j.historico, 'api') };
        if (j.status === 'verify') return { status: 'verify', pergunta: j.pergunta, erro: !!j.erro };
        if (j.status === 'not_found') return { status: 'not_found' };
        return { status: 'unavailable' };
      });
    }).catch(function () { clearTimeout(timer); return { status: 'unavailable' }; });
  }

  window.OSService = {
    normalizarNumero: normalizarNumero,
    numeroValido: numeroValido,
    exemplo: OS.exemplo || '',
    modoDemo: !OS.apiUrl && !!OS.demo,
    simularIndisponivel: function (v) { simularIndisponivel = !!v; },
    consultar: function (numero, documento, verificacao) {
      numero = normalizarNumero(numero);
      documento = digitos(documento);
      if (simularIndisponivel) return new Promise(function (r) { setTimeout(function () { r({ status: 'unavailable' }); }, 900); });
      if (OS.apiUrl) return apiConsultar(numero, documento, verificacao);
      if (OS.demo) {
        // pequena espera para o estado "carregando" ficar visível, como numa consulta real
        return new Promise(function (r) { setTimeout(function () { r(demoConsultar(numero, documento, verificacao)); }, 750); });
      }
      return Promise.resolve({ status: 'unavailable' });
    }
  };
})();
