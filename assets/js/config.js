/* =====================================================================
   config.js — configuração central do site (sem dados sensíveis).

   Tudo o que depende de confirmação da Cine Camera Service ou da futura
   integração com o sistema de O.S. está aqui, num lugar só.
   Itens marcados com  VALIDAR  precisam ser confirmados pela empresa.

   NUNCA coloque aqui senhas, chaves de API ou dados de clientes:
   este arquivo é público.
   ===================================================================== */
window.NAMBA_CONFIG = {

  contato: {
    telefone: '(11) 3259-7888',
    telefoneLink: '+551132597888',
    email: 'atendimento@namba.com.br',
    endereco1: 'Rua da Consolação, 331, 10º andar',
    endereco2: 'Consolação, São Paulo – SP, 01301-905',
    // VALIDAR: o site estático antigo dizia 09:00–18:30; a versão PHP dizia "horário comercial".
    horario: 'Segunda a sexta, 9h às 18h30',
    horarioFechado: 'Fechado aos sábados, domingos e feriados',
    instagram: 'https://www.instagram.com/cinecameraservice/',
    facebook: 'https://www.facebook.com/cinecameraservice',
    maps: 'https://www.google.com/maps/search/?api=1&query=Rua+da+Consola%C3%A7%C3%A3o+331+S%C3%A3o+Paulo',
    waze: 'https://waze.com/ul?ll=-23.547793,-46.644485&navigate=yes'
  },

  whatsapp: {
    // Link curto usado no site original. Não aceita mensagem pré-preenchida.
    link: 'https://whats.link/namba',
    // VALIDAR: número oficial só com dígitos (ex.: '5511999999999').
    // Quando preenchido, os botões passam a abrir o WhatsApp com a mensagem
    // do contexto (orçamento, envio, O.S.) já escrita. Nunca incluímos CPF
    // ou telefone do cliente nessas mensagens.
    numero: null
  },

  prazos: {
    // VALIDAR: fontes antigas dizem "2 a 3 dias úteis" e "permita 3 dias".
    orcamento: '2 a 3 dias úteis',
    reparo: '7 a 15 dias',
    importacao: '60 a 90 dias'
  },

  os: {
    // Formato do número da O.S. no sistema atual (ex.: H32758).
    // VALIDAR: confirmar se é sempre 1 letra + 5 dígitos.
    padrao: '^[A-Z][0-9]{5}$',
    exemplo: 'H32758',
    // Endereço do serviço de consulta. Enquanto for null, o site usa os
    // dados fictícios do modo demonstração (ou mostra "indisponível").
    apiUrl: null,
    // true = usa assets/js/demo-db.js com dados fictícios, sempre sinalizados na tela.
    demo: true
  },

  /* Etapas exibidas na linha do tempo pública (proposta de interface). */
  etapas: [
    { id: 'recebido', nome: 'Equipamento recebido' },
    { id: 'analise', nome: 'Em análise técnica' },
    { id: 'orcamento', nome: 'Orçamento' },
    { id: 'reparo', nome: 'Reparo e testes' },
    { id: 'pronto', nome: 'Pronto para devolução' },
    { id: 'finalizado', nome: 'Finalizado' }
  ],

  /* Mapa: código de status do sistema  →  como ele aparece para o cliente.
     VALIDAR: os códigos abaixo são os do protótipo (sql/schema.sql).
     Quando os códigos reais do banco forem conhecidos, basta mapeá-los aqui.
       etapa:  id da etapa em que a O.S. está
       tipo:   'normal' | 'atencao' (aguardando algo) | 'acao' (cliente precisa agir)
               | 'concluido' | 'cancelado' | 'devolvido'
       proximo: orientação mostrada ao cliente */
  status: {
    recebido:            { rotulo: 'Equipamento recebido', etapa: 'recebido', tipo: 'normal',
                           proximo: 'O equipamento está na fila de análise técnica. O orçamento é enviado por e-mail em até {orcamento}.' },
    em_analise:          { rotulo: 'Em análise técnica', etapa: 'analise', tipo: 'normal',
                           proximo: 'Os técnicos estão avaliando o defeito. Você recebe o orçamento por e-mail assim que a análise terminar.' },
    orcamento_enviado:   { rotulo: 'Orçamento enviado', etapa: 'orcamento', tipo: 'acao',
                           proximo: 'O orçamento foi enviado para o seu e-mail. Para seguir com o reparo, aprove por e-mail ou telefone.' },
    orcamento_aprovado:  { rotulo: 'Orçamento aprovado', etapa: 'reparo', tipo: 'normal',
                           proximo: 'Recebemos sua aprovação. O reparo entra na fila da bancada.' },
    aguardando_pecas:    { rotulo: 'Aguardando peças', etapa: 'reparo', tipo: 'atencao',
                           proximo: 'Uma peça original precisou ser importada. Nesses casos o prazo é de {importacao}.' },
    em_reparo:           { rotulo: 'Em reparo', etapa: 'reparo', tipo: 'normal',
                           proximo: 'O reparo está em andamento. Depois dele vêm a limpeza, a calibragem e os testes finais.' },
    pronto_para_envio:   { rotulo: 'Pronto para devolução', etapa: 'pronto', tipo: 'acao',
                           proximo: 'O equipamento está pronto. Retire no balcão ou combine o envio de volta com a equipe.' },
    enviado:             { rotulo: 'Enviado ao cliente', etapa: 'finalizado', tipo: 'concluido',
                           proximo: 'O equipamento foi enviado de volta. Acompanhe a entrega pelo código de rastreio informado pela equipe.' },
    finalizado:          { rotulo: 'Finalizado', etapa: 'finalizado', tipo: 'concluido',
                           proximo: 'Atendimento concluído. Obrigado por confiar o seu equipamento à Namba.' },
    cancelado:           { rotulo: 'Cancelado', etapa: null, tipo: 'cancelado',
                           proximo: 'Este atendimento foi cancelado. Em caso de dúvida, fale com a equipe.' },
    devolvido_sem_reparo:{ rotulo: 'Devolvido sem reparo', etapa: null, tipo: 'devolvido',
                           proximo: 'O equipamento foi devolvido sem reparo. Em caso de dúvida, fale com a equipe.' }
  }
};
