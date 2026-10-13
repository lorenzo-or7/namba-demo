/* =====================================================================
   Carmen — assistente virtual da Cine Camera Service / Namba.

   Bot por palavras-chave (sem IA e sem API externa): compara a pergunta
   com as regras abaixo e devolve a resposta da regra mais específica.
   Responde só com informações já publicadas pela empresa. Quando não
   sabe, diz isso e oferece o atendimento humano.

   Uso:
     Carmen.mount(elemento)   → conversa dentro da página (tira-duvidas.html)
     Carmen.toggle(botao)     → abre/fecha a janela flutuante (todas as páginas)
   A Carmen não consulta ordens de serviço: ela indica a página de consulta.
   ===================================================================== */
(function () {
  'use strict';
  var CFG = window.NAMBA_CONFIG || {};
  var C = CFG.contato || {}, P = CFG.prazos || {};
  var N = window.NAMBA || {};
  var BASE = (document.body && document.body.getAttribute('data-base')) || '';
  function wa(ctx, x) { return N.wa ? N.wa(ctx, x) : ((CFG.whatsapp || {}).link || '#'); }
  function page(p) { return BASE + p; }

  /* Ações: botões que aparecem abaixo da resposta e levam a partes reais do site. */
  var A = {
    enviar:   { label: 'Ver instruções de envio', href: page('como-enviar.html') },
    carta:    { label: 'Preencher a carta de envio', href: page('carta-envio.html') },
    os:       { label: 'Acompanhar minha O.S.', href: page('consultar-os.html') },
    servicos: { label: 'Ver equipamentos atendidos', href: page('index.html#servicos') },
    visite:   { label: 'Endereço e como chegar', href: page('index.html#visite') },
    maps:     { label: 'Abrir no Google Maps', href: C.maps, ext: true },
    historia: { label: 'Conhecer a história', href: page('index.html#historia') },
    waDuvida: function () { return { label: 'Falar com a equipe no WhatsApp', href: wa('duvida'), ext: true, wa: true }; },
    waOrc:    function () { return { label: 'Pedir orçamento no WhatsApp', href: wa('assistencia'), ext: true, wa: true }; },
    waEnvio:  function () { return { label: 'Tirar dúvida de envio no WhatsApp', href: wa('envio'), ext: true, wa: true }; },
    waAcess:  function () { return { label: 'Consultar disponibilidade', href: wa('acessorios'), ext: true, wa: true }; },
    tel:      { label: 'Ligar ' + C.telefone, href: 'tel:' + C.telefoneLink }
  };

  var RULES = [
    { k: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'oii', 'eae', 'e ai', 'opa'],
      a: 'Olá! Sou a Carmen, assistente virtual da Namba. Posso explicar como enviar seu equipamento, como funciona o orçamento, prazos, pagamento, garantia e onde ficamos. Sobre o que você quer saber?' },
    { k: ['ajuda', 'menu', 'o que voce sabe', 'o que voce faz', 'quais assuntos', 'sobre o que posso perguntar'],
      a: 'Posso ajudar com: <strong>envio do equipamento</strong>, <strong>carta de envio</strong>, <strong>orçamento</strong>, <strong>prazos</strong>, <strong>pagamento</strong>, <strong>garantia</strong>, <strong>equipamentos atendidos</strong>, <strong>acompanhamento da O.S.</strong>, <strong>horário</strong> e <strong>endereço</strong>.' },
    { k: ['carta', 'carta de envio', 'formulario', 'preencher carta'],
      a: 'A carta de envio é preenchida no site, impressa e colocada dentro da caixa, junto com o equipamento. Ela não deve ser enviada por e-mail.', act: ['carta', 'enviar'] },
    { k: ['como enviar', 'enviar meu equipamento', 'enviar minha camera', 'enviar a camera', 'mandar minha camera', 'mandar o equipamento', 'sedex', 'correios', 'transportadora', 'embalar', 'embalagem', 'fora de sao paulo', 'outro estado', 'moro em'],
      a: 'Você pode trazer o equipamento ao balcão ou enviar de qualquer estado. Em resumo: retire bateria, cartão e acessórios, preencha e imprima a carta de envio, embale bem e mande por SEDEX com seguro. O passo a passo completo está na página de envio.', act: ['enviar', 'carta'] },
    { k: ['horario', 'que horas', 'aberto', 'abre', 'fecha', 'fim de semana', 'sabado', 'domingo', 'feriado', 'atendimento presencial'],
      a: 'Atendemos de ' + (C.horario || '').toLowerCase() + '. ' + (C.horarioFechado || '') + '.' },
    { k: ['endereco', 'localizacao', 'onde fica', 'onde voces ficam', 'onde e a loja', 'mapa', 'como chegar', 'ir ate ai', 'entregar pessoalmente', 'pessoalmente', 'assistencia fica'],
      a: 'Ficamos na ' + C.endereco1 + ', ' + C.endereco2 + '. Você pode trazer o equipamento pessoalmente, sem hora marcada, no horário de atendimento.', act: ['visite', 'maps'] },
    { k: ['contato', 'entrar em contato', 'falar com voces', 'telefone', 'ligar', 'numero de contato'],
      a: 'Você pode falar com a equipe pelo telefone ' + C.telefone + ', pelo e-mail ' + C.email + ' ou pelo WhatsApp, ' + (C.horario || '').toLowerCase() + '.', act: ['tel', 'waDuvida'] },
    { k: ['email', 'e-mail'],
      a: 'Nosso e-mail é ' + C.email + '.' },
    { k: ['whatsapp', 'zap', 'whats', 'falar com humano', 'falar com atendente', 'falar com uma pessoa', 'falar com pessoa', 'atendente', 'humano'],
      a: 'Claro. A equipe atende pelo WhatsApp no horário de atendimento.', act: ['waDuvida', 'tel'] },
    { k: ['instagram', 'facebook', 'redes sociais', 'rede social'],
      a: 'A Namba está no <a href="' + C.instagram + '" target="_blank" rel="noopener">Instagram</a> e no <a href="' + C.facebook + '" target="_blank" rel="noopener">Facebook</a>.' },
    { k: ['prazo', 'quanto tempo', 'demora', 'quando fica pronto', 'tempo de reparo', 'quanto tempo leva', 'dias'],
      a: 'O orçamento sai em ' + P.orcamento + ' depois que o equipamento chega. Aprovado o orçamento, o reparo leva de ' + P.reparo + '. Se for preciso importar alguma peça, de ' + P.importacao + '.', act: ['os'] },
    { k: ['orcamento', 'preco', 'valor', 'quanto custa', 'quanto fica', 'cobram para orcar', 'cobram pelo orcamento', 'custo'],
      a: 'Funciona assim: depois de avaliar o equipamento, enviamos o orçamento por e-mail em até ' + P.orcamento + ', sem compromisso. Você aprova ou recusa por e-mail ou telefone e só paga se aprovar o reparo. Não conseguimos informar valores sem avaliar o equipamento.', act: ['enviar', 'waOrc'] },
    { k: ['garantia', 'na garantia'],
      a: 'Se o equipamento ainda estiver na garantia do fabricante, ligue antes para o SAC Canon, 0800-202-2666, para receber as instruções corretas.' },
    { k: ['pagamento', 'pagar', 'cartao de credito', 'parcelamento', 'parcelar', 'parcela', 'boleto', 'deposito', 'transferencia', 'pix'],
      a: 'O pagamento pode ser feito por transferência ou depósito bancário, ou no cartão de crédito Visa ou Mastercard, com parcelamento sem juros. Para outras formas, confirme com a equipe.', act: ['waDuvida'] },
    { k: ['consultar', 'status', 'rastrear', 'minha os', 'minha o.s', 'numero da os', 'ordem de servico', 'acompanhar', 'andamento'],
      a: 'Você acompanha o conserto na página de consulta, com o número da O.S. e o CPF ou telefone informado na entrada do equipamento. Eu não tenho acesso às ordens de serviço, mas a página mostra cada etapa.', act: ['os'] },
    { k: ['peca original', 'pecas originais', 'peca generica', 'peca pirata', 'peca falsificada'],
      a: 'Trabalhamos apenas com peças originais Canon e mantemos as principais em estoque. Por isso cerca de 90% dos reparos são feitos sem esperar importação.' },
    { k: ['outras marcas', 'so canon', 'nikon', 'sony', 'fujifilm', 'panasonic', 'olympus', 'outra marca'],
      a: 'Atendemos somente equipamentos fotográficos da marca Canon: câmeras, objetivas e flashes. Não trabalhamos com outras marcas.' },
    { k: ['quais equipamentos', 'o que voces consertam', 'que equipamentos', 'voces atendem', 'tipo de equipamento', 'lente', 'objetiva', 'flash', 'speedlite', 'eos', 'powershot', 'ixus', 'compacta', 'camera'],
      a: 'Atendemos a linha fotográfica Canon: câmeras EOS (profissional, semiprofissional e amadora), objetivas EF, EF-S e série L, flashes Speedlite e compactas PowerShot e IXUS.', act: ['servicos'] },
    { k: ['limpeza', 'limpeza de sensor', 'sensor sujo', 'revisao', 'manutencao preventiva', 'calibragem'],
      a: 'Fazemos limpeza e calibragem de precisão, com o mesmo cuidado de um reparo completo. O valor é informado no orçamento.', act: ['waOrc'] },
    { k: ['empresa', 'pessoa juridica', 'nota fiscal', 'cnpj'],
      a: 'Se o envio for de uma empresa, mande junto a nota fiscal de remessa para conserto e informe nome e celular de um contato. A carta de envio tem um campo para isso.', act: ['carta'] },
    { k: ['acessorio', 'bateria', 'carregador', 'cartao de memoria', 'tampa', 'manual', 'capa', 'alca', 'filtro'],
      a: 'Para o envio, retire os acessórios (capa, alça, bateria, cartão, filtro, manuais) e mande só as tampas de proteção. A exceção é quando o acessório tem relação com o defeito. Também vendemos acessórios originais Canon no balcão.', act: ['enviar', 'waAcess'] },
    { k: ['historia', 'fundacao', 'desde quando', 'quantos anos', 'quando foi fundada', 'jorge namba', 'dona carmen', 'familia'],
      a: 'A Cine Camera Service foi fundada em 1966 por Jorge Namba e Dona Carmen. É uma oficina de família dedicada a equipamentos fotográficos Canon.', act: ['historia'] },
    { k: ['certificacao', 'certificado', 'auditoria', 'autorizada', 'autorizado', 'canon usa', 'credenciada'],
      a: 'Em 2015, a Cine Camera Service recebeu nota máxima (cinco estrelas) numa auditoria técnica Canon USA, conforme certificado emitido pela Canon do Brasil naquele ano. O documento está na seção de história.', act: ['historia'] },
    { k: ['obrigado', 'obrigada', 'valeu', 'brigado', 'agradecido'],
      a: 'Por nada! Se precisar de mais alguma coisa, é só perguntar.' },
    { k: ['tchau', 'ate mais', 'ate logo', 'flw'],
      a: 'Até mais! Quando quiser, é só voltar aqui ou chamar a equipe no WhatsApp.' }
  ];

  var FALLBACK = { a: 'Essa eu não sei responder com segurança. Para não passar uma informação errada, o melhor é falar com a equipe. Você também pode escrever "ajuda" para ver os assuntos que eu conheço.', act: ['waDuvida', 'tel'] };

  var QUICK = [
    'Como enviar minha câmera?',
    'Quais equipamentos vocês atendem?',
    'Como consultar minha O.S.?',
    'Como funciona o orçamento?',
    'Como posso entrar em contato?',
    'Onde fica a assistência?'
  ];

  function normalize(t) { return ' ' + String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.@\- ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  /* Escolhe a regra cujo trecho encontrado é o mais específico (mais longo),
     comparando palavras inteiras ("oi" não casa com "depois"). */
  function find(text) {
    var n = normalize(text), best = null, score = 0;
    RULES.forEach(function (r) {
      r.k.forEach(function (kw) {
        if (n.indexOf(' ' + kw + ' ') !== -1 || n.indexOf(' ' + kw + '?') !== -1 || (kw.length > 5 && n.indexOf(kw) !== -1)) {
          if (kw.length > score) { score = kw.length; best = r; }
        }
      });
    });
    return best || FALLBACK;
  }
  function actions(list) {
    return (list || []).map(function (k) { var a = A[k]; return typeof a === 'function' ? a() : a; }).filter(Boolean);
  }

  var SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* Monta a conversa dentro de um elemento. Retorna a API da instância. */
  function build(root, opts) {
    opts = opts || {};
    var uid = 'c' + Math.random().toString(36).slice(2, 7);
    root.classList.add('carmen');
    root.innerHTML =
      '<div class="carmen-head">' +
        '<img src="' + BASE + 'assets/img/carmen-avatar.png" width="44" height="44" alt="">' +
        '<div><strong id="' + uid + '-t">Carmen</strong><span>Assistente virtual da Namba</span></div>' +
        (opts.closable ? '<button type="button" class="carmen-x" aria-label="Fechar conversa">' + CLOSE + '</button>' : '') +
      '</div>' +
      '<div class="carmen-log" role="log" aria-live="polite" aria-relevant="additions" aria-labelledby="' + uid + '-t" tabindex="0"></div>' +
      '<div class="carmen-quick" role="group" aria-label="Perguntas frequentes"></div>' +
      '<form class="carmen-form"><label class="sr-only" for="' + uid + '-in">Escreva sua dúvida</label>' +
        '<input id="' + uid + '-in" type="text" placeholder="Escreva sua dúvida" autocomplete="off" enterkeyhint="send" maxlength="300">' +
        '<button type="submit" aria-label="Enviar pergunta">' + SEND + '</button></form>';
    var log = root.querySelector('.carmen-log'), quick = root.querySelector('.carmen-quick');
    var form = root.querySelector('.carmen-form'), input = root.querySelector('input');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    function bottom() { log.scrollTop = log.scrollHeight; }
    function add(html, who, acts) {
      var m = document.createElement('div');
      m.className = 'cm ' + who;
      m.innerHTML = '<div class="cm-bubble">' + html + '</div>';
      if (acts && acts.length) {
        var box = document.createElement('div');
        box.className = 'cm-actions';
        acts.forEach(function (a) {
          var el = document.createElement('a');
          el.href = a.href; el.textContent = a.label;
          if (a.wa) el.className = 'is-wa';
          if (a.ext) { el.target = '_blank'; el.rel = 'noopener'; }
          box.appendChild(el);
        });
        m.appendChild(box);
      }
      log.appendChild(m);
      bottom();
    }
    function textOnly(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function ask(q) {
      add(textOnly(q), 'user');
      var t = document.createElement('div');
      t.className = 'cm bot typing'; t.setAttribute('aria-label', 'Carmen está digitando');
      t.innerHTML = '<div class="cm-bubble"><span></span><span></span><span></span></div>';
      log.appendChild(t); bottom();
      setTimeout(function () {
        t.remove();
        var r = find(q);
        add(r.a, 'bot', actions(r.act));
      }, reduce ? 150 : 450 + Math.random() * 300);
    }

    QUICK.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = q;
      b.addEventListener('click', function () { ask(q); });
      quick.appendChild(b);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim(); if (!v) return;
      input.value = ''; ask(v);
    });
    // teclado do celular: mantém a última mensagem visível
    input.addEventListener('focus', function () { setTimeout(bottom, 300); });

    add('Olá! Sou a <strong>Carmen</strong>, assistente virtual da Cine Camera Service. Respondo dúvidas sobre envio, orçamento, prazos e atendimento.', 'bot');
    add('Escolha uma pergunta abaixo ou escreva a sua. Para casos específicos, eu te passo para a equipe.', 'bot');

    return { root: root, input: input, close: root.querySelector('.carmen-x') };
  }

  /* ---------- janela flutuante ---------- */
  var panel = null, inst = null, opener = null;
  function setOpen(open) {
    if (!panel) return;
    panel.hidden = false;
    requestAnimationFrame(function () { panel.classList.toggle('is-open', open); });
    if (opener) opener.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.classList.toggle('carmen-lock', open && window.innerWidth < 600);
    if (open) {
      setTimeout(function () { if (window.innerWidth >= 600) inst.input.focus(); else inst.close.focus(); }, 60);
    } else {
      setTimeout(function () { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 260);
      if (opener) opener.focus();
    }
  }
  function ensurePanel() {
    if (panel) return;
    panel = document.createElement('div');
    panel.id = 'carmenPanel';
    panel.className = 'carmen-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Conversa com a Carmen, assistente virtual');
    panel.hidden = true;
    var box = document.createElement('div');
    panel.appendChild(box);
    document.body.appendChild(panel);
    inst = build(box, { closable: true });
    inst.close.addEventListener('click', function () { setOpen(false); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    // ajusta a altura quando o teclado virtual abre (iOS/Android)
    if (window.visualViewport) {
      var fit = function () { panel.style.setProperty('--vvh', window.visualViewport.height + 'px'); };
      visualViewport.addEventListener('resize', fit); fit();
    }
  }

  window.Carmen = {
    find: find,
    mount: function (el) { return build(el, {}); },
    toggle: function (btn) {
      opener = btn || opener;
      ensurePanel();
      setOpen(!panel.classList.contains('is-open'));
    }
  };

  /* página tira-duvidas.html: monta automaticamente */
  var host = document.getElementById('carmenHost');
  if (host) window.Carmen.mount(host);
})();
