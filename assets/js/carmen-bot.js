/**
 * Carmen Bot — assistente de perguntas frequentes da Cine Camera Service / Namba.
 * Bot baseado em palavras-chave (sem IA/API externa): compara a mensagem do
 * usuário com uma lista de regras e responde com o texto pré-definido da
 * primeira regra que combinar. Se nada combinar, sugere o WhatsApp.
 * Usado na página tira-duvidas.html (protótipo). Mesma lógica da versão PHP.
 */
(function () {
  var BASE_URL = (document.querySelector('meta[name="carmen-base-url"]') || {}).content || '';
  var WA = (window.NAMBA && window.NAMBA.whatsapp) || 'https://whats.link/namba';

  var RULES = [
    {
      keywords: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'oii', 'eae', 'e ai'],
      answer: 'Olá! Eu sou a Carmen, assistente virtual da Namba. Posso te ajudar com dúvidas sobre envio, prazos, garantia, orçamento, pagamento e muito mais. O que você gostaria de saber?'
    },
    {
      keywords: ['ajuda', 'menu', 'o que voce sabe', 'o que voce faz', 'quais assuntos', 'sobre o que posso perguntar'],
      answer: 'Posso te ajudar com temas como: <strong>como enviar</strong> o equipamento, <strong>carta de envio</strong>, <strong>prazos</strong>, <strong>orçamento</strong>, <strong>garantia</strong>, <strong>formas de pagamento</strong>, <strong>consultar sua O.S.</strong>, <strong>horário</strong>, <strong>endereço</strong> e <strong>quais equipamentos consertamos</strong>. É só perguntar!'
    },
    {
      keywords: ['como enviar', 'enviar meu equipamento', 'enviar a camera', 'enviar minha camera', 'mandar minha camera', 'sedex', 'correios', 'transportadora', 'embalar', 'estou fora de sao paulo', 'moro em outro estado', 'outro estado'],
      answer: 'Você pode enviar sua câmera, objetiva ou flash Canon de qualquer estado do Brasil! O passo a passo completo (como embalar, o que retirar do equipamento, etc.) está na nossa página de <a href="' + BASE_URL + 'como-enviar.html">Como Enviar</a>.'
    },
    {
      keywords: ['carta', 'carta de envio', 'formulario', 'preencher carta'],
      answer: 'A carta de envio deve ser preenchida, impressa e enviada junto com o equipamento (não por e-mail). Você pode preenchê-la aqui: <a href="' + BASE_URL + 'carta-envio.html">Carta de Envio</a>.'
    },
    {
      keywords: ['horario', 'funciona', 'aberto', 'atendimento presencial', 'que horas', 'todo dia', 'fim de semana', 'sabado', 'domingo'],
      answer: 'Atendemos de segunda a sexta-feira, das 9h às 18h30. Não abrimos aos sábados, domingos e feriados.'
    },
    {
      keywords: ['endereco', 'localizacao', 'onde fica', 'onde voces ficam', 'onde e', 'mapa', 'como chegar', 'ir ate ai', 'entregar pessoalmente'],
      answer: 'Estamos na Rua da Consolação, 331, 10º andar — São Paulo, SP. Você pode trazer o equipamento pessoalmente ou enviar pelos Correios. Veja como chegar na seção <a href="' + BASE_URL + 'index.html#visite">Visite a loja</a> do site.'
    },
    {
      keywords: ['telefone', 'ligar', 'numero de contato', 'numero de telefone'],
      answer: 'Você pode nos ligar em (11) 3259-7888, de segunda a sexta, das 9h às 18h30.'
    },
    {
      keywords: ['email', 'e-mail'],
      answer: 'Nosso e-mail é atendimento@namba.com.br.'
    },
    {
      keywords: ['whatsapp', 'zap', 'chamar no whats', 'falar com humano', 'falar com atendente', 'falar com pessoa', 'atendente de verdade'],
      answer: 'Claro! Clique no botão verde do WhatsApp no canto da tela (ou <a href="' + WA + '" target="_blank" rel="noopener">clique aqui</a>) para falar direto com a nossa equipe.'
    },
    {
      keywords: ['instagram', 'facebook', 'redes sociais', 'rede social', 'seguir voces'],
      answer: 'Você encontra a Namba no Instagram e no Facebook — os links estão no rodapé do site.'
    },
    {
      keywords: ['prazo', 'quanto tempo', 'demora', 'quando fica pronto', 'tempo de reparo', 'quanto tempo leva'],
      answer: 'O prazo de reparo varia entre 7 e 15 dias. Se for necessário importar alguma peça, pode levar de 60 a 90 dias. O orçamento em si sai em até 2 a 3 dias úteis após recebermos o equipamento.'
    },
    {
      keywords: ['orcamento', 'preco', 'valor', 'quanto custa', 'quanto e', 'quanto fica', 'cobram para orcar', 'cobram pelo orcamento'],
      answer: 'O orçamento é feito sem compromisso e enviado por e-mail em até 2 a 3 dias úteis após avaliarmos o equipamento. Você só paga se aprovar o reparo.'
    },
    {
      keywords: ['garantia'],
      answer: 'Se seu equipamento ainda estiver na garantia de fábrica, ligue para o SAC Canon 0800-2022666 antes de nos enviar, para receber as instruções corretas.'
    },
    {
      keywords: ['pagamento', 'pagar', 'cartao', 'parcelamento', 'parcelar', 'boleto', 'deposito', 'transferencia', 'pix'],
      answer: 'O pagamento pode ser feito via transferência/depósito bancário ou cartão de crédito (Visa ou Mastercard), com parcelamento sem juros.'
    },
    {
      keywords: ['consultar', 'status', 'rastrear', 'minha os', 'numero da os', 'ordem de servico', 'acompanhar meu pedido', 'acompanhar o conserto'],
      answer: 'Você pode consultar o status da sua Ordem de Serviço a qualquer momento na página <a href="' + BASE_URL + 'consultar-os.html">Consultar O.S.</a>, usando o número da O.S. e seu CPF ou telefone.'
    },
    {
      keywords: ['peca original', 'pecas originais', 'peca generica', 'peca pirata', 'peca falsificada'],
      answer: 'Trabalhamos apenas com peças 100% originais Canon — cerca de 90% dos reparos são feitos sem precisar importar nenhuma peça.'
    },
    {
      keywords: ['marca', 'so canon', 'outras marcas', 'nikon', 'sony', 'fujifilm', 'panasonic', 'olympus'],
      answer: 'Somos uma assistência técnica autorizada apenas para equipamentos Canon (câmeras, objetivas e flashes). Não trabalhamos com outras marcas.'
    },
    {
      keywords: ['tipo de equipamento', 'o que voces consertam', 'quais equipamentos', 'lente', 'objetiva', 'flash', 'speedlite', 'eos', 'powershot', 'ixus', 'camera compacta'],
      answer: 'Atendemos toda a linha Canon: câmeras EOS (profissional, semi-profissional e amadora), objetivas EF/EF-S/L-Series, flashes Speedlite e câmeras compactas (Powershot e Ixus).'
    },
    {
      keywords: ['limpeza', 'limpeza de sensor', 'revisao', 'manutencao preventiva'],
      answer: 'Sim, fazemos limpeza e calibragem de precisão nos equipamentos, com o mesmo cuidado de um reparo completo.'
    },
    {
      keywords: ['empresa', 'pessoa juridica', 'nota fiscal', 'cnpj'],
      answer: 'Se o envio for de uma empresa (pessoa jurídica), é necessário enviar junto a nota fiscal de remessa para conserto, além do nome e celular de um contato.'
    },
    {
      keywords: ['acessorio', 'bateria', 'carregador', 'cartao de memoria', 'tampa', 'manual', 'capa', 'alca', 'filtro'],
      answer: 'Retire todos os acessórios antes de enviar (capa, alça, bateria, cartão de memória, filtro, manuais, etc.) — mande apenas se o acessório tiver relação com o problema. Envie só com as tampas de proteção.'
    },
    {
      keywords: ['historia', 'fundacao', 'desde quando', 'quantos anos', 'quando foi fundada', 'jorge namba', 'dona carmen'],
      answer: 'A Cine Camera Service foi fundada em 1966 por Jorge Namba e Dona Carmen, e já são mais de 50 anos de tradição em assistência técnica autorizada Canon.'
    },
    {
      keywords: ['certificacao', 'auditoria', 'autorizada', 'canon usa'],
      answer: 'Somos oficialmente reconhecidos pela Canon do Brasil como Assistência Técnica Autorizada Canon, com nota máxima na auditoria técnica conduzida pela Canon USA em 2015.'
    },
    {
      keywords: ['obrigado', 'obrigada', 'valeu', 'brigado', 'agradecido'],
      answer: 'Por nada! Se precisar de mais alguma coisa, é só chamar. 😊'
    },
    {
      keywords: ['tchau', 'ate mais', 'ate logo', 'flw'],
      answer: 'Até mais! Qualquer dúvida, é só voltar aqui ou chamar no WhatsApp.'
    }
  ];

  var FALLBACK = 'Hmm, não tenho certeza sobre isso ainda. Que tal falar direto com a nossa equipe pelo <a href="' + WA + '" target="_blank" rel="noopener">WhatsApp</a>? Eles vão te ajudar rapidinho. Você também pode digitar "ajuda" para ver os assuntos que eu conheço.';

  var QUICK_REPLIES = [
    'Como enviar meu equipamento?',
    'Quanto tempo demora o reparo?',
    'Qual o horário de atendimento?',
    'Como consultar minha O.S.?',
    'Quais formas de pagamento?',
    'Preciso de garantia, e agora?'
  ];

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function findAnswer(userText) {
    var normalized = normalize(userText);
    for (var i = 0; i < RULES.length; i++) {
      var rule = RULES[i];
      for (var j = 0; j < rule.keywords.length; j++) {
        if (normalized.indexOf(rule.keywords[j]) !== -1) {
          return rule.answer;
        }
      }
    }
    return FALLBACK;
  }

  function init() {
    var messagesEl = document.getElementById('carmenMessages');
    var chipsEl = document.getElementById('carmenChips');
    var formEl = document.getElementById('carmenForm');
    var inputEl = document.getElementById('carmenInput');

    if (!messagesEl || !formEl || !inputEl) return;

    function scrollToBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(text, sender) {
      var msg = document.createElement('div');
      msg.className = 'msg ' + sender;
      msg.innerHTML = text;
      messagesEl.appendChild(msg);
      scrollToBottom();
    }

    function addTypingAndRespond(userText) {
      var typing = document.createElement('div');
      typing.className = 'typing';
      typing.id = 'carmenTyping';
      typing.innerHTML = '<span></span><span></span><span></span>';
      messagesEl.appendChild(typing);
      scrollToBottom();

      window.setTimeout(function () {
        var typingEl = document.getElementById('carmenTyping');
        if (typingEl) typingEl.remove();
        addMessage(findAnswer(userText), 'bot');
      }, 500 + Math.random() * 400);
    }

    addMessage('Olá! Eu sou a <strong>Carmen</strong>, assistente virtual da Cine Camera Service / Namba. Posso te ajudar com dúvidas sobre envio, prazos, orçamento, garantia e muito mais.', 'bot');
    addMessage('Escolha uma pergunta abaixo ou digite a sua dúvida:', 'bot');

    if (chipsEl) {
      QUICK_REPLIES.forEach(function (question) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.textContent = question;
        chip.addEventListener('click', function () {
          addMessage(question, 'user');
          addTypingAndRespond(question);
        });
        chipsEl.appendChild(chip);
      });
    }

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = inputEl.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      inputEl.value = '';
      addTypingAndRespond(text);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();