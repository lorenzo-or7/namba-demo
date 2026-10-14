/* =====================================================================
   demo-db.js — "banco de dados" simulado do protótipo.

   Substitui MySQL + PHP enquanto o projeto é só uma demonstração:
   - Os dados ficam no localStorage do navegador de quem abre a demo.
   - Ao abrir pela primeira vez, carrega dados FICTÍCIOS de exemplo.
   - As funções espelham includes/functions.php (máscaras, validação de
     CPF, geração de número NAMBA-AAAA-NNNN, rótulos de status, captcha
     e limite de 5 consultas a cada 10 minutos).

   Na versão definitiva, tudo isso volta para o servidor (PHP + MySQL),
   que é onde validação, senha e limite de tentativas precisam estar.
   ===================================================================== */
(function () {
  'use strict';

  var KEY = 'namba-demo-db-v2'; // v2: números de O.S. no formato do sistema atual (ex.: H32758)
  var memory = null; // fallback quando o localStorage está bloqueado

  /* ---------- utilidades (functions.php) ---------- */
  function onlyDigits(v) { return String(v == null ? '' : v).replace(/\D+/g, ''); }

  function maskCpf(cpf) {
    var d = onlyDigits(cpf);
    if (d.length !== 11) return '***.***.***-**';
    return '***.**' + d[5] + '.' + d.substr(6, 3) + '-**';
  }
  function maskSerial(s) {
    if (!s) return '—';
    if (s.length <= 4) return new Array(s.length).join('*') + s.slice(-1);
    return new Array(s.length - 3).join('*') + s.slice(-4);
  }
  function formatCpf(cpf) {
    var d = onlyDigits(cpf);
    if (d.length !== 11) return cpf || '—';
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  function formatPhone(p) {
    var d = onlyDigits(p);
    if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return p || '—';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function parseDate(v) {
    if (!v) return null;
    var d = new Date(String(v).length === 10 ? v + 'T12:00:00' : v);
    return isNaN(d) ? null : d;
  }
  function formatDateBr(v) { var d = parseDate(v); return d ? pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() : '—'; }
  function formatDateTimeBr(v) { var d = parseDate(v); return d ? formatDateBr(v) + ' às ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) : '—'; }
  function formatMoneyBr(v) {
    if (v === null || v === undefined || v === '') return 'A definir';
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function nowIso() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function todayIso() { return nowIso().slice(0, 10); }

  function isValidCpf(cpf) {
    var c = onlyDigits(cpf);
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    for (var t = 9; t < 11; t++) {
      var s = 0;
      for (var i = 0; i < t; i++) s += Number(c[i]) * ((t + 1) - i);
      if (Number(c[t]) !== ((10 * s) % 11) % 10) return false;
    }
    return true;
  }

  var STATUS = {
    recebido: 'Recebido',
    em_analise: 'Em análise técnica',
    aguardando_pecas: 'Aguardando peças',
    orcamento_enviado: 'Orçamento enviado',
    orcamento_aprovado: 'Orçamento aprovado',
    em_reparo: 'Em reparo',
    pronto_para_envio: 'Pronto para envio',
    enviado: 'Enviado ao cliente',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
    devolvido_sem_reparo: 'Devolvido sem reparo'
  };
  function statusLabel(s) { return STATUS[s] || String(s).replace(/_/g, ' '); }
  function statusClass(s) {
    if (s === 'cancelado' || s === 'devolvido_sem_reparo') return 'st-cancel';
    if (s === 'finalizado' || s === 'enviado') return 'st-done';
    if (s === 'aguardando_pecas' || s === 'orcamento_enviado') return 'st-critical';
    return 'st-progress';
  }
  /* Etapa (0–4) no trilho público: Recebido, Análise, Orçamento, Reparo, Devolução. */
  function statusStage(s) {
    return ({ recebido: 0, em_analise: 1, aguardando_pecas: 3, orcamento_enviado: 2, orcamento_aprovado: 2,
      em_reparo: 3, pronto_para_envio: 4, enviado: 4, finalizado: 4, cancelado: -1 })[s];
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- dados fictícios de exemplo ---------- */
  function seed() {
    var c = [
      { id: 1, nome: 'Renata Albuquerque', cpf: '52601815906', telefone: '11987654321', email: 'renata.albuquerque@exemplo.com', criado_em: '2026-03-02T10:12:00' },
      { id: 2, nome: 'Marcos Tanaka', cpf: '08301661305', telefone: '11991230045', email: 'marcos.tanaka@exemplo.com', criado_em: '2026-05-18T14:40:00' },
      { id: 3, nome: 'Estúdio Lume Fotografia', cpf: null, telefone: '1132104455', email: 'contato@lume-exemplo.com', criado_em: '2026-06-07T09:05:00' },
      { id: 4, nome: 'Paulo Henrique Duarte', cpf: '18609139034', telefone: '21998761200', email: null, criado_em: '2026-08-21T16:22:00' },
      { id: 5, nome: 'Juliana Okamoto', cpf: '99603082430', telefone: '11976540098', email: 'ju.okamoto@exemplo.com', criado_em: '2026-09-03T11:30:00' },
      { id: 6, nome: 'Carlos Eduardo Lima', cpf: '62819482112', telefone: '31988887766', email: 'cadu.lima@exemplo.com', criado_em: '2026-09-15T15:10:00' }
    ];
    var o = [
      { id: 1, numero_os: 'H90035', cliente_id: 2, equipamento: 'PowerShot G7 X Mark II', tipo: 'Câmera compacta', numero_serie: '732051004821', defeito_relatado: 'Lente não recolhe ao desligar.', data_entrada: '2026-08-04', status_atual: 'finalizado', valor_orcamento: 640, observacoes_internas: 'Cliente retirou no balcão.', atualizado_em: '2026-08-28T17:02:00' },
      { id: 2, numero_os: 'H90038', cliente_id: 3, equipamento: 'Câmera EOS 5D Mark IV', tipo: 'Câmera EOS', numero_serie: '052021001377', defeito_relatado: 'Erro 20 intermitente durante ensaios.', data_entrada: '2026-08-25', status_atual: 'enviado', valor_orcamento: 2150, observacoes_internas: 'PJ: NF de remessa recebida.', atualizado_em: '2026-09-29T10:15:00' },
      { id: 3, numero_os: 'H90039', cliente_id: 4, equipamento: 'Objetiva EF 70-200mm f/4L IS USM', tipo: 'Objetiva', numero_serie: '4811002', defeito_relatado: 'Estabilizador fazendo ruído.', data_entrada: '2026-09-01', status_atual: 'cancelado', valor_orcamento: 1290, observacoes_internas: 'Cliente optou por não reparar.', atualizado_em: '2026-09-12T09:40:00' },
      { id: 4, numero_os: 'H90041', cliente_id: 1, equipamento: 'Câmera EOS R6 Mark II', tipo: 'Câmera EOS', numero_serie: '083021009914', defeito_relatado: 'Obturador travando após queda leve.', data_entrada: '2026-09-22', status_atual: 'em_reparo', valor_orcamento: 1380, observacoes_internas: 'Conjunto do obturador em estoque.', atualizado_em: '2026-10-07T15:20:00' },
      { id: 5, numero_os: 'H90042', cliente_id: 5, equipamento: 'Objetiva EF 24-70mm f/2.8L II USM', tipo: 'Objetiva', numero_serie: '7210004418', defeito_relatado: 'Zoom duro e foco automático falhando.', data_entrada: '2026-09-24', status_atual: 'aguardando_pecas', valor_orcamento: 1870, observacoes_internas: 'Flex do foco pedido ao Japão. Previsão 60 dias.', atualizado_em: '2026-10-02T11:05:00' },
      { id: 6, numero_os: 'H90043', cliente_id: 6, equipamento: 'Flash Speedlite 600EX II-RT', tipo: 'Flash', numero_serie: '2410055', defeito_relatado: 'Não dispara em modo ETTL.', data_entrada: '2026-09-30', status_atual: 'orcamento_enviado', valor_orcamento: 520, observacoes_internas: null, atualizado_em: '2026-10-03T16:48:00' },
      { id: 7, numero_os: 'H90044', cliente_id: 2, equipamento: 'Câmera EOS 90D', tipo: 'Câmera EOS', numero_serie: '153021004390', defeito_relatado: 'Limpeza de sensor e revisão geral.', data_entrada: '2026-10-08', status_atual: 'recebido', valor_orcamento: null, observacoes_internas: null, atualizado_em: '2026-10-08T10:30:00' },
      { id: 9, numero_os: 'H90036', cliente_id: 4, equipamento: 'Câmera EOS 7D', tipo: 'Câmera EOS', numero_serie: '2180503377', defeito_relatado: 'Câmera molhada na chuva, não liga.', data_entrada: '2026-08-11', status_atual: 'devolvido_sem_reparo', valor_orcamento: null, observacoes_internas: 'Oxidação na placa principal; reparo inviável.', atualizado_em: '2026-08-20T14:30:00' },
      { id: 10, numero_os: 'H90046', cliente_id: 6, equipamento: 'Objetiva EF 100mm f/2.8L Macro IS USM', tipo: 'Objetiva', numero_serie: '6410022', defeito_relatado: 'Foco automático lento.', data_entrada: '2026-10-09', status_atual: 'em_analise', valor_orcamento: null, observacoes_internas: null, atualizado_em: '2026-10-09T16:10:00', verificacao: true },
      { id: 8, numero_os: 'H90045', cliente_id: 3, equipamento: 'Câmera EOS R5', tipo: 'Câmera EOS', numero_serie: '013021008801', defeito_relatado: 'Mensagem de erro no visor eletrônico.', data_entrada: '2026-10-06', status_atual: 'em_analise', valor_orcamento: null, observacoes_internas: 'Verificar cabo flex do EVF.', atualizado_em: '2026-10-07T09:12:00' }
    ];
    var h = [];
    var hid = 1;
    function add(os, status, desc, when, admin) { h.push({ id: hid++, os_id: os, status: status, descricao: desc, alterado_por: admin === undefined ? 1 : admin, data_hora: when }); }
    add(1, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-08-04T10:02:00');
    add(1, 'orcamento_enviado', 'Orçamento enviado por e-mail.', '2026-08-06T15:30:00');
    add(1, 'orcamento_aprovado', 'Aprovado por telefone.', '2026-08-07T09:10:00');
    add(1, 'em_reparo', 'Troca do conjunto da objetiva.', '2026-08-12T14:00:00');
    add(1, 'finalizado', 'Retirado no balcão.', '2026-08-28T17:02:00');
    add(2, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-08-25T11:20:00');
    add(2, 'orcamento_enviado', null, '2026-08-27T16:00:00');
    add(2, 'orcamento_aprovado', null, '2026-08-28T10:45:00');
    add(2, 'em_reparo', 'Substituição da placa principal.', '2026-09-02T09:30:00');
    add(2, 'pronto_para_envio', 'Testes e calibragem concluídos.', '2026-09-26T17:15:00');
    add(2, 'enviado', 'Enviado por SEDEX com seguro.', '2026-09-29T10:15:00');
    add(3, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-09-01T14:10:00');
    add(3, 'orcamento_enviado', null, '2026-09-03T12:00:00');
    add(3, 'cancelado', 'Orçamento não aprovado. Equipamento devolvido sem reparo.', '2026-09-12T09:40:00');
    add(4, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-09-22T09:48:00');
    add(4, 'em_analise', 'Desmontagem para avaliar o obturador.', '2026-09-23T10:30:00');
    add(4, 'orcamento_enviado', 'Orçamento enviado para o seu e-mail.', '2026-09-24T17:05:00');
    add(4, 'orcamento_aprovado', 'Aprovação recebida por e-mail.', '2026-09-25T08:52:00');
    add(4, 'em_reparo', 'Peça original em estoque. Troca do conjunto do obturador.', '2026-10-07T15:20:00');
    add(5, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-09-24T13:00:00');
    add(5, 'em_analise', null, '2026-09-25T10:00:00');
    add(5, 'orcamento_enviado', null, '2026-09-26T16:30:00');
    add(5, 'orcamento_aprovado', null, '2026-09-29T09:15:00');
    add(5, 'aguardando_pecas', 'Peça original a caminho. Importação pode levar de 60 a 90 dias.', '2026-10-02T11:05:00');
    add(6, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-09-30T15:40:00');
    add(6, 'em_analise', null, '2026-10-01T11:00:00');
    add(6, 'orcamento_enviado', 'Aguardando sua aprovação por e-mail ou telefone.', '2026-10-03T16:48:00');
    add(7, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-10-08T10:30:00');
    add(9, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-08-11T10:00:00');
    add(9, 'em_analise', 'Sinais de oxidação na placa principal.', '2026-08-13T15:20:00');
    add(9, 'devolvido_sem_reparo', 'Reparo inviável por oxidação. Equipamento devolvido ao cliente.', '2026-08-20T14:30:00');
    add(10, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-10-09T11:40:00');
    add(10, 'em_analise', null, '2026-10-09T16:10:00');
    add(8, 'recebido', 'Equipamento recebido para diagnóstico.', '2026-10-06T14:25:00');
    add(8, 'em_analise', null, '2026-10-07T09:12:00');

    return {
      clientes: c, ordens: o, historico: h,
      admins: [{ id: 1, usuario: 'demo', senha: 'namba2026', nome: 'Equipe Namba' }],
      tentativas: []
    };
  }

  function load() {
    if (memory) return memory;
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (raw) { try { memory = JSON.parse(raw); return memory; } catch (e) {} }
    memory = seed();
    save();
    return memory;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) {} }
  function reset() { memory = seed(); save(); }
  function nextId(list) { return list.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1; }

  /* ---------- consultas ---------- */
  function cliente(id) { return load().clientes.filter(function (c) { return c.id === id; })[0] || null; }
  function ordem(id) { return load().ordens.filter(function (o) { return o.id === id; })[0] || null; }
  function adminNome(id) { var a = load().admins.filter(function (x) { return x.id === id; })[0]; return a ? a.nome : null; }

  function historicoDe(osId, desc) {
    var h = load().historico.filter(function (x) { return x.os_id === osId; });
    h.sort(function (a, b) { return a.data_hora < b.data_hora ? -1 : a.data_hora > b.data_hora ? 1 : a.id - b.id; });
    return desc ? h.reverse() : h;
  }

  function listarOrdens(filtro) {
    filtro = filtro || {};
    var busca = (filtro.busca || '').toLowerCase();
    var rows = load().ordens.map(function (o) {
      var c = cliente(o.cliente_id);
      return Object.assign({}, o, { cliente_nome: c ? c.nome : '—' });
    }).filter(function (o) {
      if (filtro.status && o.status_atual !== filtro.status) return false;
      if (busca && (o.numero_os + ' ' + o.cliente_nome + ' ' + o.equipamento).toLowerCase().indexOf(busca) === -1) return false;
      return true;
    });
    rows.sort(function (a, b) { return a.atualizado_em < b.atualizado_em ? 1 : -1; });
    return rows.slice(0, 100);
  }

  function listarClientes(busca) {
    var b = (busca || '').toLowerCase(), bd = onlyDigits(busca);
    var rows = load().clientes.filter(function (c) {
      if (!b) return true;
      return c.nome.toLowerCase().indexOf(b) !== -1 || (bd && ((c.cpf || '').indexOf(bd) !== -1 || (c.telefone || '').indexOf(bd) !== -1));
    });
    rows.sort(b ? function (x, y) { return x.nome.localeCompare(y.nome); } : function (x, y) { return x.criado_em < y.criado_em ? 1 : -1; });
    return rows.map(function (c) {
      return Object.assign({}, c, { total_os: load().ordens.filter(function (o) { return o.cliente_id === c.id; }).length });
    });
  }

  /* Consulta pública (modo demonstração): número da O.S. + CPF ou telefone.
     Algumas O.S. fictícias pedem uma confirmação extra (últimos 4 dígitos
     do telefone cadastrado) para demonstrar o estado "verificação necessária". */
  function consultarPublico(numero, documento, verificacao) {
    var n = String(numero || '').replace(/\s+/g, '').toUpperCase(), d = onlyDigits(documento);
    if (!n || !d) return { status: 'not_found' };
    var db = load();
    for (var i = 0; i < db.ordens.length; i++) {
      var o = db.ordens[i];
      if (o.numero_os !== n) continue;
      var c = cliente(o.cliente_id);
      if (!c || (c.cpf !== d && c.telefone !== d)) continue;
      if (o.verificacao) {
        var v = onlyDigits(verificacao);
        if (!v) return { status: 'verify', pergunta: 'Para proteger seus dados, confirme os 4 últimos dígitos do telefone cadastrado.' };
        if (!c.telefone || c.telefone.slice(-4) !== v) return { status: 'verify', pergunta: 'Os dígitos não conferem. Confira os 4 últimos dígitos do telefone cadastrado.', erro: true };
      }
      return { status: 'ok', os: o, historico: historicoDe(o.id, true) };
    }
    return { status: 'not_found' };
  }

  /* ---------- escrita ---------- */
  /* Protótipo: próximo número no formato do sistema atual (1 letra + 5 dígitos).
     Na versão real, o número vem do sistema interno da Namba. */
  function gerarNumeroOs() {
    var seq = 90000;
    load().ordens.forEach(function (o) {
      var m = /^H(\d{5})$/.exec(o.numero_os);
      if (m) seq = Math.max(seq, parseInt(m[1], 10));
    });
    return 'H' + String(seq + 1).padStart(5, '0');
  }

  function parseValor(v) {
    v = String(v || '').trim();
    if (!v) return null;
    var n = Number(v.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  /* nova-os.php: reaproveita cliente pelo CPF ou telefone, senão cria. */
  function criarOs(dados, adminId) {
    var db = load(), erros = [];
    var cpf = onlyDigits(dados.cpf), tel = onlyDigits(dados.telefone);
    if (!dados.nome) erros.push('Informe o nome do cliente.');
    if (!cpf && !tel) erros.push('Informe ao menos o CPF ou o telefone do cliente.');
    if (cpf && !isValidCpf(cpf)) erros.push('O CPF informado é inválido. Confira os 11 dígitos.');
    if (!dados.equipamento) erros.push('Informe o equipamento.');
    if (!dados.defeito_relatado) erros.push('Descreva o defeito relatado pelo cliente.');
    if (!dados.data_entrada) erros.push('Informe a data de entrada.');
    if (erros.length) return { erros: erros };

    var c = null;
    if (cpf) c = db.clientes.filter(function (x) { return x.cpf === cpf; })[0] || null;
    if (!c && tel) c = db.clientes.filter(function (x) { return x.telefone === tel; })[0] || null;
    var reaproveitado = !!c;
    if (c) {
      // Corrige o nova-os.php original: campos em branco não apagam o que já estava cadastrado.
      c.nome = dados.nome; c.cpf = cpf || c.cpf; c.telefone = tel || c.telefone; c.email = dados.email || c.email;
    } else {
      c = { id: nextId(db.clientes), nome: dados.nome, cpf: cpf || null, telefone: tel || null, email: dados.email || null, criado_em: nowIso() };
      db.clientes.push(c);
    }
    var o = {
      id: nextId(db.ordens), numero_os: gerarNumeroOs(), cliente_id: c.id,
      equipamento: dados.equipamento, tipo: dados.tipo || null, numero_serie: dados.numero_serie || null,
      defeito_relatado: dados.defeito_relatado, data_entrada: dados.data_entrada,
      status_atual: 'recebido', valor_orcamento: parseValor(dados.valor_orcamento),
      observacoes_internas: null, atualizado_em: nowIso()
    };
    db.ordens.push(o);
    db.historico.push({ id: nextId(db.historico), os_id: o.id, status: 'recebido', descricao: 'Equipamento recebido para diagnóstico.', alterado_por: adminId, data_hora: nowIso() });
    save();
    return { os: o, reaproveitado: reaproveitado };
  }

  /* editar-os.php: grava histórico se o status mudou ou se há descrição. */
  function atualizarOs(id, dados, adminId) {
    var db = load(), o = ordem(id), erros = [];
    if (!o) return { erros: ['Ordem de serviço não encontrada.'] };
    if (!STATUS[dados.status_atual]) erros.push('Escolha um status válido.');
    if (!dados.equipamento) erros.push('Informe o equipamento.');
    if (erros.length) return { erros: erros };
    var mudou = dados.status_atual !== o.status_atual;
    o.equipamento = dados.equipamento;
    o.numero_serie = dados.numero_serie || null;
    o.status_atual = dados.status_atual;
    o.valor_orcamento = parseValor(dados.valor_orcamento);
    o.observacoes_internas = dados.observacoes_internas || null;
    o.atualizado_em = nowIso();
    if (mudou || dados.descricao_status) {
      db.historico.push({ id: nextId(db.historico), os_id: o.id, status: o.status_atual, descricao: dados.descricao_status || null, alterado_por: adminId, data_hora: nowIso() });
    }
    save();
    return { os: o, historicoGravado: mudou || !!dados.descricao_status };
  }

  /* clientes.php: cadastro manual (CPF é único). */
  function criarCliente(dados) {
    var db = load(), erros = [];
    var cpf = onlyDigits(dados.cpf), tel = onlyDigits(dados.telefone);
    if (!dados.nome) erros.push('Informe o nome do cliente.');
    if (!cpf && !tel) erros.push('Informe ao menos o CPF ou o telefone.');
    if (cpf && !isValidCpf(cpf)) erros.push('O CPF informado é inválido. Confira os 11 dígitos.');
    if (cpf && db.clientes.some(function (x) { return x.cpf === cpf; })) erros.push('Já existe um cliente cadastrado com esse CPF.');
    if (erros.length) return { erros: erros };
    var c = { id: nextId(db.clientes), nome: dados.nome, cpf: cpf || null, telefone: tel || null, email: dados.email || null, criado_em: nowIso() };
    db.clientes.push(c); save();
    return { cliente: c };
  }

  /* ---------- login (admin/login.php) ---------- */
  var SESSION = 'namba-demo-admin';
  function login(usuario, senha) {
    var a = load().admins.filter(function (x) { return x.usuario === usuario && x.senha === senha; })[0];
    if (!a) return null;
    try { sessionStorage.setItem(SESSION, JSON.stringify({ id: a.id, nome: a.nome })); } catch (e) { window.__nambaAdmin = { id: a.id, nome: a.nome }; }
    return a;
  }
  function currentAdmin() {
    try { var s = sessionStorage.getItem(SESSION); if (s) return JSON.parse(s); } catch (e) {}
    return window.__nambaAdmin || null;
  }
  function logout() { try { sessionStorage.removeItem(SESSION); } catch (e) {} window.__nambaAdmin = null; }

  /* ---------- captcha + limite de tentativas ---------- */
  var captchaValue = null;
  function gerarCaptcha() {
    var a = 1 + Math.floor(Math.random() * 9), b = 1 + Math.floor(Math.random() * 9);
    captchaValue = a + b;
    return [a, b];
  }
  function validarCaptcha(r) { var ok = captchaValue !== null && Number(String(r).trim()) === captchaValue && String(r).trim() !== ''; captchaValue = null; return ok; }

  var RATE_MAX = 5, RATE_MIN = 10;
  function tentativasRecentes() {
    var db = load(), limite = Date.now() - RATE_MIN * 60000;
    db.tentativas = (db.tentativas || []).filter(function (t) { return t > Date.now() - 86400000; });
    return db.tentativas.filter(function (t) { return t >= limite; });
  }
  function rateLimitBloqueado() { return tentativasRecentes().length >= RATE_MAX; }
  function rateLimitRegistrar() { var db = load(); db.tentativas.push(Date.now()); save(); }
  function rateLimitLiberaEm() {
    var t = tentativasRecentes(); if (!t.length) return 0;
    return Math.max(0, Math.ceil((Math.min.apply(null, t) + RATE_MIN * 60000 - Date.now()) / 60000));
  }
  function rateLimitZerar() { var db = load(); db.tentativas = []; save(); }

  window.NambaDB = {
    onlyDigits: onlyDigits, maskCpf: maskCpf, maskSerial: maskSerial, formatCpf: formatCpf, formatPhone: formatPhone,
    formatDateBr: formatDateBr, formatDateTimeBr: formatDateTimeBr, formatMoneyBr: formatMoneyBr, todayIso: todayIso,
    isValidCpf: isValidCpf, STATUS: STATUS, statusLabel: statusLabel, statusClass: statusClass, statusStage: statusStage, esc: esc,
    cliente: cliente, ordem: ordem, adminNome: adminNome, historicoDe: historicoDe,
    listarOrdens: listarOrdens, listarClientes: listarClientes, consultarPublico: consultarPublico,
    gerarNumeroOs: gerarNumeroOs, criarOs: criarOs, atualizarOs: atualizarOs, criarCliente: criarCliente,
    login: login, logout: logout, currentAdmin: currentAdmin,
    gerarCaptcha: gerarCaptcha, validarCaptcha: validarCaptcha,
    rateLimitBloqueado: rateLimitBloqueado, rateLimitRegistrar: rateLimitRegistrar, rateLimitLiberaEm: rateLimitLiberaEm, rateLimitZerar: rateLimitZerar,
    RATE_MAX: RATE_MAX, reset: reset, all: load
  };
})();
