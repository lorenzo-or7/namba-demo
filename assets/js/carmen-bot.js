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
    acessorios: { label: 'Ver vitrine de acessórios', href: page('acessorios.html') },
    servicos: { label: 'Ver equipamentos atendidos', href: page('index.html#servicos') },
    visite:   { label: 'Endereço e como chegar', href: page('index.html#visite') },
    maps:     { label: 'Abrir no Google Maps', href: C.maps, ext: true },
    historia: { label: 'Conhecer a história', href: page('index.html#historia') },
    waDuvida: function () { return { label: 'Falar com a equipe no WhatsApp', href: wa('duvida'), ext: true, wa: true }; },
    waOrc:    function () { return { label: 'Pedir orçamento no WhatsApp', href: wa('assistencia'), ext: true, wa: true }; },
    waEnvio:  function () { return { label: 'Tirar dúvida de envio no WhatsApp', href: wa('envio'), ext: true, wa: true }; },
    waAcess:  function () { return { label: 'Consultar disponibilidade', href: wa('acessorios'), ext: true, wa: true }; },
    waze:     { label: 'Abrir no Waze', href: C.waze, ext: true },
    tel:      { label: 'Ligar ' + C.telefone, href: 'tel:' + C.telefoneLink }
  };

  /* Regras. k = palavras-chave já sem acento. r.w = peso extra (marcas e produtos específicos ganham de frases genéricas).
     Uma chave com "+" exige todas as
     palavras em qualquer ordem (ex.: 'caixa+original'); cada parte casa com o
     começo de uma palavra, então "caixa" também pega "caixas".
     a = resposta; act = botões; f = perguntas sugeridas em seguida.
     Só entram informações já publicadas pela empresa. O que não está
     confirmado é respondido como "não sei, confirme com a equipe". */
  var EQUIPE = ' Essa informação eu não tenho confirmada. Para não te passar nada errado, confirme com a equipe.';
  var RULES = [
    /* ---------- conversa ---------- */
    { k: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'oii', 'oie', 'eae', 'e ai', 'opa', 'hello', 'tudo bem', 'alo'],
      a: 'Olá! Sou a Carmen, assistente virtual da Namba. Posso explicar como enviar seu equipamento, como funciona o orçamento, prazos, pagamento, garantia e onde ficamos. Sobre o que você quer saber?',
      f: ['Como enviar minha câmera?', 'Quanto tempo demora?', 'Onde fica a assistência?'] },
    { k: ['ajuda', 'menu', 'o que voce sabe', 'o que voce faz', 'quais assuntos', 'sobre o que posso perguntar', 'opcoes', 'duvidas frequentes', 'perguntas frequentes', 'mais perguntas', 'outras perguntas'],
      a: 'Posso ajudar com estes assuntos:<br><strong>Envio:</strong> embalagem, carta, frete, seguro, caixa original, acessórios.<br><strong>Conserto:</strong> orçamento, aprovação, prazos, peças, garantia, defeitos.<br><strong>Atendimento:</strong> O.S., horário, endereço, contato, pagamento.<br><strong>Acessórios:</strong> baterias, carregadores, alças, capas e cabos.<br><strong>A Namba:</strong> equipamentos atendidos, história, certificado de 2015.',
      f: ['Como embalar o equipamento?', 'Quem paga o frete?', 'Onde encontro o número da O.S.?', 'E se eu não aprovar o orçamento?', 'Vocês vendem acessórios?', 'Preciso agendar?'] },
    { k: ['quem e voce', 'voce e um robo', 'voce e robo', 'voce e humana', 'voce e uma pessoa', 'voce e real', 'e um robo', 'bot', 'chatbot', 'inteligencia artificial', 'voce e ia'],
      a: 'Sou um programa de respostas prontas, não uma pessoa. Respondo só com informações já publicadas pela Namba e não tenho acesso às ordens de serviço nem aos seus dados. Para qualquer caso específico, a equipe atende você.',
      act: ['waDuvida'] },
    { k: ['obrigado', 'obrigada', 'valeu', 'brigado', 'agradecido', 'agradeco', 'muito obrigado', 'ajudou'],
      a: 'Por nada! Se precisar de mais alguma coisa, é só perguntar.' },
    { k: ['tchau', 'ate mais', 'ate logo', 'flw', 'falou', 'ate breve'],
      a: 'Até mais! Quando quiser, é só voltar aqui ou chamar a equipe no WhatsApp.' },
    { k: ['nao entendi', 'como assim', 'nao ajudou', 'resposta errada', 'nao foi isso'],
      a: 'Desculpe. Tente escrever com outras palavras, ou escreva "ajuda" para ver os assuntos que eu conheço. Se preferir, a equipe responde direto.',
      act: ['waDuvida', 'tel'] },

    /* ---------- envio ---------- */
    { k: ['como enviar', 'enviar meu equipamento', 'enviar minha camera', 'enviar a camera', 'enviar minha lente', 'mandar minha camera', 'mandar o equipamento', 'mandar a camera', 'despachar', 'sedex', 'correios', 'transportadora', 'fora de sao paulo', 'outro estado', 'moro em', 'outra cidade', 'interior', 'enviar+camera', 'enviar+equipamento', 'mandar+lente'],
      a: 'Você pode trazer o equipamento ao balcão ou enviar de qualquer estado. Em resumo: retire bateria, cartão e acessórios, preencha e imprima a carta de envio, embale bem e mande por SEDEX com seguro. O passo a passo completo está na página de envio.',
      act: ['enviar', 'carta'], f: ['Como embalar o equipamento?', 'Quem paga o frete?', 'Posso mandar na caixa original?'] },
    { k: ['embalar', 'embalagem', 'embrulhar', 'empacotar', 'plastico bolha', 'plastico-bolha', 'jornal', 'proteger', 'caixa para enviar', 'que caixa'],
      a: 'Coloque o equipamento e a carta num saquinho plástico fechado com fita. Use uma caixa pequena com bastante jornal amassado ou plástico-bolha, com o equipamento bem no meio, como a gema de um ovo. Se estiver na garantia, inclua a cópia da nota fiscal de compra.',
      act: ['enviar'], f: ['Posso mandar na caixa original?', 'Vale fazer seguro?'] },
    { k: ['caixa original', 'caixa da camera', 'caixa da lente', 'caixa de fabrica', 'caixa+original', 'caixa+fabrica', 'devolvem a caixa'],
      a: 'Não use a caixa original. Ela é descartada, porque não temos onde guardar as caixas. Use uma caixa pequena qualquer, bem acolchoada.',
      act: ['enviar'] },
    { k: ['seguro', 'segurado', 'extravio', 'perder no correio', 'roubo', 'furto', 'dano no transporte', 'quebrar no caminho'],
      a: 'Indicamos o SEDEX dos Correios com o seguro opcional contra perda, furto e danos. Os riscos do transporte, na ida e na volta, são do cliente, então o seguro vale a pena.',
      act: ['enviar'], f: ['Quem paga o frete?', 'Como rastrear o envio?'] },
    { k: ['rastrear o envio', 'rastreio', 'codigo de rastreio', 'rastrear sedex', 'rastreamento', 'chegou ai', 'ja chegou', 'recebeu minha', 'receberam'],
      a: 'O SEDEX você acompanha no site dos Correios, com o código da postagem. Quando o equipamento chega e é registrado, ele ganha um número de O.S. e o andamento passa a aparecer na página de consulta.',
      act: ['os', 'waEnvio'] },
    { k: ['frete', 'quem paga o frete', 'custo do envio', 'valor do envio', 'frete gratis', 'frete de volta', 'envio de volta', 'devolucao', 'mandam de volta', 'enviam de volta', 'como recebo de volta', 'receber de volta', 'devolver+camera'],
      a: 'Os custos e riscos do envio, na ida e na volta, são do cliente. Quando o equipamento fica pronto, você retira no balcão ou combina o envio de volta com a equipe. O endereço de devolução vai na carta de envio.',
      act: ['carta', 'waEnvio'] },
    { k: ['carta', 'carta de envio', 'formulario', 'preencher carta', 'ficha de envio'],
      a: 'A carta de envio é preenchida no site em 4 etapas, impressa e colocada dentro da caixa, junto com o equipamento. Ela não deve ser enviada por e-mail. Só o nome é obrigatório, mas modelo, defeito e um contato ajudam muito.',
      act: ['carta', 'enviar'], f: ['E se eu não tiver impressora?'] },
    { k: ['tiver impressora', 'tenho impressora', 'imprimir', 'nao consigo imprimir', 'sem impressora', 'carta por email', 'mandar a carta por email', 'carta+email'], w: 12,
      a: 'A carta vai impressa, dentro da caixa. Não mande por e-mail. Se você não tiver como imprimir, fale com a equipe antes de enviar para combinar como fazer.',
      act: ['carta', 'waEnvio'] },
    { k: ['acessorio', 'acessorios', 'carregador', 'tampa', 'manual', 'capa', 'alca', 'filtro', 'cd', 'mando a bateria', 'mandar a bateria', 'mando o cartao'],
      a: 'Retire capa, alça, bateria, cartão de memória, filtro, manuais e CD, e guarde com você. Envie só com as tampas de proteção da câmera e da objetiva. Mande um acessório apenas se ele tiver relação com o defeito.',
      act: ['enviar'], f: ['A câmera avisa bateria fraca', 'A câmera dá erro de cartão'] },
    { k: ['bateria fraca', 'bateria nao carrega', 'bateria descarrega', 'nao carrega', 'bateria viciada', 'bateria+problema', 'bateria+defeito', 'bateria'],
      a: 'Se o problema envolve bateria ou carga, mande a bateria e o carregador junto com a câmera, para a equipe testar o conjunto.',
      act: ['enviar'] },
    { k: ['erro de cartao', 'cartao de memoria', 'cartao nao le', 'cartao+erro', 'fotos do cartao', 'minhas fotos', 'recuperar fotos', 'perder as fotos'],
      a: 'Se a câmera dá erro de cartão, mande o cartão junto, mas <strong>baixe as fotos antes</strong>. Nos outros casos, fique com o cartão. Recuperação de fotos não está entre os serviços que eu conheço; para isso, fale com a equipe.',
      act: ['enviar', 'waDuvida'] },
    { k: ['empresa', 'pessoa juridica', 'nota fiscal de remessa', 'remessa', 'cnpj', 'minha empresa'],
      a: 'Se o envio for de uma empresa, mande junto a nota fiscal de remessa para conserto e informe nome e celular de um contato. A carta de envio tem campos para isso. Para consultar a O.S., empresas usam o telefone cadastrado.',
      act: ['carta'] },
    { k: ['nota fiscal', 'nf'],
      a: 'Depende do caso: empresas mandam a <strong>nota fiscal de remessa para conserto</strong>; equipamento na garantia vai com a <strong>cópia da nota fiscal de compra</strong>. Sobre nota fiscal do serviço, confirme com a equipe.',
      act: ['waDuvida'] },

    /* ---------- atendimento presencial ---------- */
    { k: ['horario', 'que horas', 'aberto', 'abre', 'fecha', 'funcionamento', 'expediente', 'atendimento presencial', 'hora de almoco', 'almoco'],
      a: 'Atendemos de ' + (C.horario || '').toLowerCase() + '. ' + (C.horarioFechado || '') + '.',
      f: ['Preciso agendar?', 'Onde fica a assistência?'] },
    { k: ['fim de semana', 'sabado', 'domingo', 'feriado', 'abre sabado', 'final de semana'],
      a: 'Não abrimos aos sábados, domingos e feriados. O atendimento é de ' + (C.horario || '').toLowerCase() + '.' },
    { k: ['agendar', 'agendamento', 'marcar horario', 'hora marcada', 'precisa marcar', 'marcar visita', 'reservar'],
      a: 'Não precisa agendar. Traga o equipamento ao balcão no horário de atendimento (' + (C.horario || '').toLowerCase() + ') para avaliação.',
      act: ['visite'] },
    { k: ['endereco', 'localizacao', 'onde fica', 'onde voces ficam', 'onde e a loja', 'mapa', 'como chegar', 'ir ate ai', 'entregar pessoalmente', 'pessoalmente', 'assistencia fica', 'cep', 'andar', 'predio', 'loja fisica', 'balcao'],
      a: 'Ficamos na ' + C.endereco1 + ', ' + C.endereco2 + '. Você pode trazer o equipamento pessoalmente, sem hora marcada, no horário de atendimento.',
      act: ['visite', 'maps', 'waze'] },
    { k: ['estacionamento', 'estacionar', 'vaga', 'carro', 'metro', 'estacao', 'onibus', 'transporte publico'],
      a: 'Estamos na ' + C.endereco1 + ', em São Paulo.' + EQUIPE + ' Os mapas abaixo mostram as opções de rota até o endereço.',
      act: ['maps', 'waze', 'tel'] },
    { k: ['retirar meu', 'retirar o equipamento', 'retirar a camera', 'buscar', 'retirada', 'pegar meu equipamento', 'pegar a camera', 'ficou pronto', 'esta pronto', 'buscar+camera'],
      a: 'Quando o equipamento fica pronto, a consulta de O.S. mostra "Pronto para devolução". Aí você retira no balcão, ' + (C.horario || '').toLowerCase() + ', ou combina o envio de volta com a equipe.',
      act: ['os', 'visite'] },

    /* ---------- contato ---------- */
    { k: ['contato', 'entrar em contato', 'falar com voces', 'telefone', 'ligar', 'numero de contato', 'fone', 'celular de voces'],
      a: 'Você pode falar com a equipe pelo telefone ' + C.telefone + ', pelo e-mail ' + C.email + ' ou pelo WhatsApp, ' + (C.horario || '').toLowerCase() + '.',
      act: ['tel', 'waDuvida'] },
    { k: ['email', 'e-mail'],
      a: 'Nosso e-mail é <a href="mailto:' + C.email + '">' + C.email + '</a>.' },
    { k: ['whatsapp', 'zap', 'whats', 'wpp', 'falar com humano', 'falar com atendente', 'falar com uma pessoa', 'falar com pessoa', 'atendente', 'humano', 'pessoa de verdade', 'tecnico'],
      a: 'Claro. A equipe atende pelo WhatsApp e pelo telefone no horário de atendimento.', act: ['waDuvida', 'tel'] },
    { k: ['instagram', 'facebook', 'redes sociais', 'rede social', 'insta'],
      a: 'A Namba está no <a href="' + C.instagram + '" target="_blank" rel="noopener">Instagram</a> e no <a href="' + C.facebook + '" target="_blank" rel="noopener">Facebook</a>.' },
    { k: ['reclamacao', 'reclamar', 'insatisfeito', 'problema com o conserto', 'voltou com defeito', 'mesmo defeito', 'nao ficou bom', 'continua com defeito'],
      a: 'Sinto muito. Isso precisa ser visto pela equipe, com o número da sua O.S. em mãos. Fale direto pelo WhatsApp ou telefone.',
      act: ['waDuvida', 'tel'] },
    { k: ['emprego', 'vaga de emprego', 'trabalhar ai', 'trabalhe conosco', 'curriculo', 'estagio'],
      a: 'Não tenho informações sobre vagas. Se quiser, escreva para ' + C.email + '.' },

    /* ---------- orçamento e prazos ---------- */
    { k: ['prazo', 'quanto tempo', 'demora', 'quando fica pronto', 'tempo de reparo', 'quanto tempo leva', 'dias', 'previsao'],
      a: 'O orçamento sai em ' + P.orcamento + ' depois que o equipamento chega. Aprovado o orçamento, o reparo leva de ' + P.reparo + '. Se for preciso importar alguma peça, de ' + P.importacao + '.',
      act: ['os'], f: ['Por que alguns reparos demoram mais?', 'Tem atendimento de urgência?'] },
    { k: ['importar', 'importacao', 'importada', 'peca importada', 'aguardando peca', 'aguardando pecas', 'por que demora', 'demoram mais', 'falta de peca'],
      a: 'Mantemos as principais peças originais em estoque, então cerca de 90% dos reparos são feitos sem esperar importação. Quando uma peça precisa vir de fora, o prazo passa a ser de ' + P.importacao + '.',
      act: ['os'] },
    { k: ['urgencia', 'urgente', 'expresso', 'mais rapido', 'prioridade', 'pra ontem', 'tenho pressa', 'casamento', 'evento'],
      a: 'Os prazos normais são: orçamento em ' + P.orcamento + ' e reparo de ' + P.reparo + '. Sobre atendimento com prioridade, não tenho informação confirmada. Explique a situação para a equipe antes de enviar.',
      act: ['waOrc', 'tel'] },
    { k: ['orcamento', 'preco', 'valor', 'quanto custa', 'quanto fica', 'cobram para orcar', 'cobram pelo orcamento', 'custo', 'orcar', 'quanto sai', 'caro'],
      a: 'Funciona assim: depois de avaliar o equipamento, enviamos o orçamento por e-mail em até ' + P.orcamento + ', sem compromisso. Você aprova ou recusa por e-mail ou telefone e só paga se aprovar o reparo. Não conseguimos informar valores sem avaliar o equipamento.',
      act: ['enviar', 'waOrc'], f: ['Como aprovo o orçamento?', 'E se eu não aprovar o orçamento?'] },
    { k: ['por foto', 'mandar foto', 'pelo whatsapp+orcamento', 'orcamento online', 'orcamento a distancia', 'sem levar', 'estimativa', 'media de preco', 'mais ou menos quanto'], w: 4,
      a: 'Não dá para passar valor sem avaliar o equipamento na bancada, nem por foto: o mesmo sintoma pode ter causas bem diferentes. A avaliação gera o orçamento por e-mail, sem compromisso.',
      act: ['enviar', 'waOrc'] },
    { k: ['aprovar', 'aprovacao', 'aceitar o orcamento', 'autorizar o conserto', 'autorizar o reparo', 'como aprovo', 'responder o orcamento'],
      a: 'A aprovação ou recusa do orçamento é feita por telefone ou e-mail. Depois de aprovado, o reparo entra na fila da bancada e leva de ' + P.reparo + '.',
      act: ['tel', 'waDuvida'] },
    { k: ['nao aprovar', 'nao aprovo', 'recusar', 'recusa', 'desistir', 'nao quero consertar', 'nao vale a pena', 'nao fazer o conserto', 'cancelar'],
      a: 'Você só paga se aprovar o reparo. Se recusar, o equipamento é devolvido sem reparo. Lembre que o frete de volta é por conta do cliente; a forma de devolução você combina com a equipe.',
      act: ['waDuvida', 'tel'] },
    { k: ['nao recebi o orcamento', 'orcamento nao chegou', 'nao chegou o email', 'spam', 'lixo eletronico'],
      a: 'O orçamento chega por e-mail em até ' + P.orcamento + ' depois que o equipamento é recebido. Confira também a caixa de spam. Se passou do prazo, veja a etapa na consulta de O.S. ou fale com a equipe.',
      act: ['os', 'waDuvida'] },

    /* ---------- defeitos ---------- */
    { k: ['defeito', 'quebrou', 'quebrada', 'nao liga', 'nao funciona', 'parou', 'travou', 'travada', 'erro', 'err', 'mensagem de erro', 'nao foca', 'foco', 'mancha', 'fungo', 'embacada', 'tela quebrada', 'display', 'obturador', 'espelho', 'barulho', 'caiu', 'queda', 'derrubei', 'trincou', 'riscada'], w: 4,
      a: 'Não consigo diagnosticar pelo chat: o mesmo sintoma pode ter causas diferentes. Os técnicos avaliam na bancada e mandam o orçamento por e-mail, sem compromisso. Descreva o defeito na carta de envio com o máximo de detalhes (quando começou, mensagem que aparece).',
      act: ['carta', 'waOrc'] },
    { k: ['molhou', 'molhada', 'molhado', 'agua', 'chuva', 'umidade', 'areia', 'praia', 'mar', 'maresia', 'oxidacao', 'oxidada'], w: 4,
      a: 'Contato com água, areia ou maresia precisa de avaliação na bancada; não dá para prometer o resultado antes disso. Envie ou traga o equipamento e conte na carta exatamente o que aconteceu.',
      act: ['enviar', 'waOrc', 'tel'] },

    /* ---------- O.S. ---------- */
    { k: ['consultar', 'status', 'rastrear', 'minha os', 'minha o.s', 'ordem de servico', 'acompanhar', 'andamento', 'situacao do conserto', 'como esta meu', 'como esta minha'],
      a: 'Você acompanha o conserto na página de consulta, com o número da O.S. e o CPF ou telefone informado na entrada do equipamento. Eu não tenho acesso às ordens de serviço, mas a página mostra cada etapa.',
      act: ['os'], f: ['Onde encontro o número da O.S.?', 'Não encontrei minha O.S.'] },
    { k: ['numero da os', 'numero da o.s', 'onde esta o numero', 'perdi o numero', 'perdi o comprovante', 'comprovante', 'numero+os', 'numero+ordem'],
      a: 'O número da O.S. está no comprovante de entrada e no e-mail do orçamento. Ele tem uma letra seguida de cinco números, por exemplo <strong>' + ((CFG.os || {}).exemplo || 'H32758') + '</strong>. Se perdeu os dois, a equipe localiza para você.',
      act: ['os', 'waDuvida'] },
    { k: ['nao encontrei', 'nao encontra', 'nao acho', 'nao aparece', 'nao localiza', 'nao achou', 'os nao existe', 'nao encontrada'],
      a: 'Confira o número com a letra inicial e use o mesmo CPF ou telefone informado na entrada. Empresas usam o telefone cadastrado. Se ainda não aparecer, fale com a equipe.',
      act: ['os', 'waDuvida', 'tel'] },

    /* ---------- pagamento e garantia ---------- */
    { k: ['pagamento', 'pagar', 'cartao de credito', 'parcelamento', 'parcelar', 'parcela', 'deposito', 'transferencia', 'formas de pagamento', 'visa', 'mastercard', 'credito'],
      a: 'O pagamento pode ser feito por transferência ou depósito bancário, ou no cartão de crédito Visa ou Mastercard, com parcelamento sem juros.',
      act: ['waDuvida'], f: ['Aceita Pix?'] },
    { k: ['pix', 'boleto', 'debito', 'dinheiro', 'elo', 'amex', 'american express', 'hipercard'],
      a: 'As formas que eu conheço são transferência, depósito e cartão de crédito Visa ou Mastercard, parcelado sem juros.' + EQUIPE,
      act: ['waDuvida'] },
    { k: ['garantia', 'na garantia', 'garantia canon', 'garantia do fabricante', 'nota fiscal de compra', 'comprei agora', 'camera nova'],
      a: 'Se o equipamento ainda estiver na garantia do fabricante, ligue antes para o SAC Canon, <a href="tel:08002022666">0800-202-2666</a>, para receber as instruções. Se mandar para nós, inclua a cópia da nota fiscal de compra no saquinho com a carta.',
      f: ['O conserto de vocês tem garantia?'] },
    { k: ['garantia do conserto', 'garantia do reparo', 'garantia do servico', 'conserto tem garantia', 'reparo tem garantia', 'servico tem garantia', 'conserto+garantia', 'reparo+garantia', 'servico+garantia'],
      a: 'O prazo de garantia do serviço não está nas informações que eu tenho.' + EQUIPE,
      act: ['waDuvida', 'tel'] },

    /* ---------- equipamentos e serviços ---------- */
    { k: ['quais equipamentos', 'o que voces consertam', 'que equipamentos', 'voces atendem', 'voces consertam', 'tipo de equipamento', 'lente', 'objetiva', 'flash', 'speedlite', 'eos', 'powershot', 'ixus', 'compacta', 'camera', 'dslr', 'reflex', 'teleobjetiva', 'ef-s', 'serie l'],
      a: 'Atendemos a linha fotográfica Canon: câmeras EOS (profissional, semiprofissional e amadora), objetivas EF, EF-S e série L, flashes Speedlite e compactas PowerShot e IXUS.',
      act: ['servicos'], f: ['Vocês atendem câmeras EOS R?', 'Atendem câmera de filme?'] },
    { k: ['eos r', 'mirrorless', 'sem espelho', 'rf', 'lente rf', 'r5', 'r6', 'r7', 'r8', 'r10', 'r50', 'r100', 'eos m', 'ef-m'], w: 10,
      a: 'A lista publicada cita câmeras EOS, objetivas EF, EF-S e série L, flashes Speedlite e compactas PowerShot e IXUS. Para um modelo específico, como EOS R ou lentes RF, confirme com a equipe antes de enviar.',
      act: ['waOrc', 'servicos'] },
    { k: ['filme', 'analogica', 'analogico', 'antiga', 'antigo', 'vintage', 'ae-1', 'ae1', 'a-1', 'ftb', 'canonet', 'rangefinder', 'colecao'], w: 8,
      a: 'Câmeras de filme e modelos antigos não aparecem na lista de equipamentos que eu conheço.' + EQUIPE,
      act: ['waOrc', 'tel'] },
    { k: ['filmadora', 'cinema eos', 'camcorder', 'video', 'xa', 'legria', 'c70', 'c300'], w: 8,
      a: 'A lista que eu conheço cobre câmeras fotográficas, objetivas e flashes Canon. Para filmadoras e câmeras de cinema, confirme com a equipe.',
      act: ['waOrc'] },
    { k: ['impressora', 'scanner', 'projetor', 'binoculo', 'calculadora', 'copiadora', 'multifuncional'], w: 12,
      a: 'Atendemos somente equipamentos fotográficos Canon: câmeras, objetivas e flashes. Impressoras, scanners e outros produtos Canon não fazem parte do nosso serviço.' },
    { k: ['outras marcas', 'so canon', 'apenas canon', 'nikon', 'sony', 'fujifilm', 'fuji', 'panasonic', 'olympus', 'outra marca', 'sigma', 'tamron', 'tokina', 'yongnuo', 'godox', 'gopro', 'leica', 'pentax', 'drone', 'dji', 'celular', 'iphone'], w: 12,
      a: 'Atendemos somente equipamentos fotográficos da marca Canon: câmeras, objetivas e flashes. Não trabalhamos com outras marcas.' },
    { k: ['peca original', 'pecas originais', 'peca generica', 'peca pirata', 'peca falsificada', 'pecas', 'peca', 'paralela'],
      a: 'Trabalhamos apenas com peças originais Canon e mantemos as principais em estoque. Por isso cerca de 90% dos reparos são feitos sem esperar importação.' },
    { k: ['limpeza', 'limpeza de sensor', 'sensor sujo', 'sujeira no sensor', 'revisao', 'manutencao preventiva', 'manutencao', 'calibragem', 'calibrar', 'ajuste de foco', 'regulagem'],
      a: 'Fazemos limpeza e calibragem de precisão, com o mesmo cuidado de um reparo completo. O valor é informado no orçamento. Todo reparo também termina com limpeza, calibragem e testes.',
      act: ['waOrc'] },
    /* Venda de acessórios: w maior que o da regra de equipamentos, para que
       "vendem bateria para câmera?" caia aqui, e não em "não vendemos câmeras". */
    { k: ['vend+acessorio', 'vend+bateria', 'vend+carregador', 'vend+bolsa', 'vend+alca', 'vend+tampa', 'vend+capa', 'vend+cabo', 'vend+estojo',
          'compr+acessorio', 'compr+bateria', 'compr+carregador', 'compr+bolsa', 'compr+alca', 'compr+tampa', 'compr+capa', 'compr+cabo', 'compr+estojo',
          'tem+bateria', 'tem+carregador', 'tem+cabo', 'preco+bateria', 'preco+carregador', 'preco+acessorio', 'valor+bateria', 'valor+carregador', 'valor+acessorio',
          'quanto custa+bateria', 'quanto custa+carregador', 'loja de acessorios', 'pedido de acessorio', 'bolsa', 'bolsas', 'alcas', 'baterias originais', 'tampas', 'cabo usb', 'cabos'], w: 12,
      a: 'Sim, vendemos acessórios originais Canon, como baterias, carregadores, alças, capas, bolsas, tampas e cabos. A vitrine do site mostra alguns itens, mas a disponibilidade e os valores mudam. Para consultar e fazer o pedido, fale com a equipe pelo WhatsApp ou pelo telefone ' + C.telefone + ', ' + (C.horario || '').toLowerCase() + '.',
      act: ['waAcess', 'tel', 'acessorios'] },
    /* Compra e venda de equipamentos: a Namba não compra nem vende câmeras, lentes ou flashes. */
    { k: ['vend+camera', 'vend+lente', 'vend+objetiva', 'vend+flash', 'vend+equipamento', 'vend+corpo', 'vend+maquina', 'vend+canon',
          'compr+camera', 'compr+lente', 'compr+objetiva', 'compr+flash', 'compr+equipamento', 'compr+corpo', 'compr+maquina',
          'trocar minha camera', 'trocar minha lente', 'aceitam troca', 'vendem', 'vende', 'vender', 'vendo', 'venda', 'comprar', 'compram', 'compro', 'compra usada',
          'usados', 'seminova', 'seminovo', 'camera nova para comprar', 'aceitam na troca', 'avaliam para venda', 'consignacao'], w: 10,
      a: 'A Namba trabalha apenas com serviços técnicos (conserto, limpeza e calibragem) e com a venda de acessórios, como baterias, carregadores, alças, capas e cabos. <strong>Não compramos, não vendemos e não fazemos troca de câmeras, lentes ou flashes</strong>, novos ou usados.',
      act: ['waAcess', 'servicos'], f: ['Vocês vendem acessórios?', 'Quais equipamentos vocês atendem?'] },
    { k: ['aluguel', 'alugar', 'alugam', 'emprestimo', 'emprestam', 'camera reserva', 'camera emprestada'], w: 10,
      a: 'Aluguel e empréstimo de equipamentos não estão entre os serviços que eu conheço.' + EQUIPE,
      act: ['waDuvida'] },
    { k: ['curso', 'aula', 'ensinam', 'como usar', 'configurar', 'configuracao', 'dica de foto'],
      a: 'Não oferecemos cursos que eu conheça. Meu assunto é o conserto e a manutenção de equipamentos Canon.' },

    /* ---------- a empresa ---------- */
    { k: ['historia', 'fundacao', 'desde quando', 'quantos anos', 'quando foi fundada', 'familia', 'fundadores', 'quem fundou', 'tradicao', '60 anos', '50 anos', 'aniversario'],
      a: 'A Cine Camera Service foi fundada em 1966 por Jorge Namba e Dona Carmen. É uma oficina de família dedicada a equipamentos fotográficos Canon. Em 2016 completou 50 anos e, em 2026, chega aos 60.',
      act: ['historia'], f: ['Quem foi Jorge Namba?', 'Quem é Dona Carmen?'] },
    { k: ['jorge namba', 'jorge', 'quem foi jorge', 'fundador'],
      a: 'Jorge Namba fundou a oficina em 1966, aos 23 anos. Antes disso, foi fotógrafo profissional, por isso conhecia o equipamento do lado de quem usa.',
      act: ['historia'] },
    { k: ['dona carmen', 'carmen namba', 'quem e dona carmen', 'quem e carmen'],
      a: 'Dona Carmen fundou a Cine Camera Service junto com Jorge Namba, em 1966. A história da família está na página inicial.',
      act: ['historia'] },
    { k: ['certificacao', 'certificado', 'auditoria', 'autorizada', 'autorizado', 'canon usa', 'credenciada', 'credenciado', 'oficial', 'assistencia oficial', 'confiavel', 'confianca'],
      a: 'Somos uma assistência <strong>especializada</strong> em Canon desde 1966. Em 2015, recebemos nota máxima (cinco estrelas) numa auditoria técnica Canon USA, conforme certificado emitido pela Canon do Brasil naquele ano. É um documento histórico: ele não indica uma autorização vigente hoje. Para essa confirmação, fale com a equipe.',
      act: ['historia', 'waDuvida'] },
    { k: ['privacidade', 'meus dados', 'dados pessoais', 'lgpd', 'cpf', 'seguro passar', 'guardam'],
      a: 'Eu não peço nem guardo dados pessoais: não escreva CPF ou telefone aqui. Na consulta de O.S., o CPF ou telefone serve só para localizar a ordem, e o resultado não mostra dados pessoais.',
      act: ['os'] }
  ];

  var FALLBACK = { a: 'Essa eu não sei responder com segurança. Para não passar uma informação errada, o melhor é falar com a equipe. Você também pode escrever "ajuda" para ver os assuntos que eu conheço.', act: ['waDuvida', 'tel'], f: ['Ajuda'] };

  var QUICK = [
    'Como enviar minha câmera?',
    'Quais equipamentos vocês atendem?',
    'Como consultar minha O.S.?',
    'Como funciona o orçamento?',
    'Como posso entrar em contato?',
    'Onde fica a assistência?',
    'Mais perguntas'
  ];

  function normalize(t) { return ' ' + String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.@\- ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  /* Escolhe a regra cujo trecho encontrado é o mais específico (mais longo),
     comparando palavras inteiras ("oi" não casa com "depois"). */
  function find(text) {
    var n = normalize(text), best = null, score = 0;
    RULES.forEach(function (r) {
      r.k.forEach(function (kw) {
        var len = 0;
        if (kw.indexOf('+') !== -1) {
          var parts = kw.split('+');
          if (parts.every(function (p) { return n.indexOf(' ' + p) !== -1; })) len = parts.join(' ').length;
        } else if (n.indexOf(' ' + kw + ' ') !== -1 || (kw.length > 5 && n.indexOf(kw) !== -1)) len = kw.length;
        if (len && len + (r.w || 0) > score) { score = len + (r.w || 0); best = r; }
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
    function add(html, who, acts, follow) {
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
      if (follow && follow.length) {
        var fb = document.createElement('div');
        fb.className = 'cm-follow'; fb.setAttribute('role', 'group'); fb.setAttribute('aria-label', 'Perguntas relacionadas');
        follow.forEach(function (q) {
          var b = document.createElement('button');
          b.type = 'button'; b.textContent = q;
          b.addEventListener('click', function () { fb.remove(); ask(q); });
          fb.appendChild(b);
        });
        m.appendChild(fb);
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
        add(r.a, 'bot', actions(r.act), r.f);
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
