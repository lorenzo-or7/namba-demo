# Relatório — versão 7 do protótipo Cine Camera Service / Namba

Atualização do protótipo publicado em https://lorenzo-or7.github.io/namba-demo/.
A identidade visual (paleta, tipografia, etiqueta de O.S., ilustrações em traço,
tema claro/escuro) e todas as funcionalidades existentes foram mantidas.
A assinatura Or7 no rodapé e o README do repositório foram preservados.

---

## 1. Auditoria do projeto antes das mudanças

**O que já estava correto e foi reaproveitado**
- Estrutura em HTML, CSS e JS puro, compatível com GitHub Pages.
- Cabeçalho e rodapé gerados em `site.js` (equivalentes aos includes PHP).
- Tokens de cor e tema claro/escuro, sem problemas de contraste no tema claro.
- Máscaras de CPF, CNPJ, telefone e CEP (`masks.js`).
- Painel da equipe (login, lista, nova O.S., edição com histórico, clientes).
- Carmen com regras de palavras-chave, sem IA nem API externa.

**Problemas encontrados**
| Área | Problema |
|---|---|
| Conteúdo | "Assistência técnica **autorizada** Canon" aparecia como título, descrição e no rodapé sem comprovação atual; o único documento é a auditoria de **2015**. A Carmen dizia "somos oficialmente reconhecidos". |
| Consulta de O.S. | Formato fictício `NAMBA-2026-0041` como padrão; o sistema real usa algo como `H32758`. |
| Consulta de O.S. | A tela lia o banco simulado diretamente; não havia camada para ligar a uma API. Sem estados de carregando, verificação extra ou sistema indisponível. |
| Consulta de O.S. | O resultado mostrava nome completo e CPF mascarado do cliente (dados pessoais desnecessários). |
| Consulta de O.S. | Linha do tempo com 5 etapas fixas e sem distinção para exceções (aguardando peças, cancelado, devolvido sem reparo). |
| Carta de envio | Formulário longo numa tela só; validação apenas do nome; rascunho em `localStorage` (permanecia no computador). |
| Carta de envio | A impressão era o próprio formulário, não um documento. |
| Carmen | A palavra "oi" casava dentro de outras palavras ("depois", "foi"); "Como funciona o orçamento?" respondia sobre horário (palavra "funciona"). Links sem botões de ação. |
| Contato | WhatsApp espalhado com o mesmo link em 15 lugares e botão flutuante fixo em todas as páginas. |
| Informações | Prazos repetidos à mão em vários arquivos, com divergência ("2 a 3 dias úteis" × "conte 3 dias"). |
| Acessibilidade | Botão vermelho no tema escuro com contraste abaixo do AA; ordem de títulos quebrada em Como Enviar; cabeçalho estourando a largura em telas de 320px. |
| Performance | Selos e fotos com até 4x a resolução exibida (selo do rodapé com 236 KB em todas as páginas). |

---

## 2. O que foi alterado

### Configuração central (`assets/js/config.js`, novo)
Contato, horário, WhatsApp, prazos, formato da O.S., endereço da futura API e
mapa de status. Itens que dependem da empresa estão marcados com `VALIDAR`.
Nenhum dado sensível fica no arquivo.

### Página inicial
- Título e descrição trocados para **"Assistência técnica especializada em Canon desde 1966"**.
- Três caminhos principais no topo: **Solicitar assistência**, **Acompanhar minha O.S.** e
  **Como enviar meu equipamento**. A etiqueta de O.S. continua sobre a bancada.
- Nova seção **"Como solicitar assistência"**: balcão, correio e dúvidas antes de enviar.
- "O caminho do seu equipamento" usa as mesmas 6 etapas da consulta de O.S. e avisa
  que nem todo atendimento passa por todas.
- História: foto dos fundadores, três diferenciais, linha do tempo e o certificado
  apresentado como **documento histórico de 2015**, com o ano explícito.
- Prazos lidos de `config.js`; botões de orçamento com mensagem de WhatsApp por equipamento.

### Consulta de O.S.
- Arquitetura: `os-service.js` separa a tela da fonte de dados (modo demonstração ou API real).
  O contrato sugerido para o back-end está no topo do arquivo.
- Formato configurável (`os.padrao`, `os.exemplo`), com validação ao digitar e mensagens claras.
- Estados: **carregando** (skeleton), **não encontrado** (mensagem genérica com orientação),
  **verificação necessária** (pede os 4 últimos dígitos do telefone),
  **sistema indisponível** (com tentar de novo, WhatsApp e telefone),
  **limite de tentativas** e **resultado**.
- Linha do tempo com 6 etapas, animação de progresso, ícones para concluída/atual/espera
  e bloco próprio para **cancelado** e **devolvido sem reparo**.
- Resultado em cartões: número, equipamento, tipo, recebimento, situação, última
  atualização, orçamento (quando houver), histórico público e **próximo passo**.
  Não mostra mais nome, CPF, número de série nem observações internas.
- No modo demonstração, o resultado leva o selo "Demonstração: dados fictícios".

### Carta de envio
- Quatro etapas com barra de progresso: Equipamento, Seus dados, Endereço, Revisão.
- Novos campos opcionais: tipo de equipamento, número de série e acessórios enviados.
  Pessoa física ou empresa (CNPJ, inscrição estadual e contato aparecem só para empresa).
- Validação de nome (obrigatório, como no original), CPF, CNPJ, telefone, e-mail e CEP,
  com mensagens no próprio campo e leitura por leitores de tela.
- CEP preenche o endereço (ViaCEP) e continua editável; o aviso de consulta externa está na tela.
- Dados guardados só durante a sessão (`sessionStorage`), com botão de limpar.
- **Carta A4 nova para impressão/PDF**: cabeçalho com logotipo e endereço da Namba,
  equipamento, defeito, acessórios marcados, remetente, endereço de devolução,
  instruções de envio e campos de assinatura. Preto e branco, cabe em uma página.

### Carmen
- Componente único usado na página "Dúvidas" (bloco centralizado de cantos cortados)
  e numa **janela flutuante** nas demais páginas, que substitui o botão fixo do WhatsApp.
- Perguntas rápidas pedidas: enviar câmera, equipamentos atendidos, consultar O.S.,
  orçamento, contato e localização.
- Respostas com **botões que levam às páginas certas** (instruções, carta, consulta,
  endereço, WhatsApp, telefone).
- Correção da escolha de resposta (palavra inteira e regra mais específica).
- Quando não sabe, diz isso e oferece a equipe. Avisa que não consulta O.S.
- Repertório ampliado (cerca de 60 assuntos): caixa original, embalagem, seguro,
  rastreio, frete de ida e volta, carta sem impressora, bateria fraca, erro de cartão,
  agendamento, fim de semana, retirada, onde achar o número da O.S., O.S. não encontrada,
  aprovação e recusa do orçamento, orçamento que não chegou, importação de peças,
  defeitos, queda e contato com água, venda de acessórios, outras marcas e produtos,
  Jorge Namba e Dona Carmen, privacidade e "você é um robô?".
- Perguntas sem confirmação nas fontes (Pix, boleto, estacionamento, metrô, garantia
  do serviço, câmeras de filme, EOS R/RF, filmadoras, urgência, compra de usados) são
  respondidas como "não tenho confirmado, fale com a equipe". Ficam na lista de validação.
- Depois de cada resposta, sugestões de perguntas relacionadas; botão "Mais perguntas".
- Abertura e fechamento animados, `Esc` fecha e devolve o foco, tela cheia no celular
  com ajuste ao teclado virtual.

### WhatsApp
- Um só lugar para o número. Mensagens por contexto: assistência, orçamento por
  equipamento, envio, O.S. (inclui só o número da O.S.), acessórios e dúvida geral.
  Nunca inclui CPF ou telefone do cliente.
- Enquanto o número oficial não for informado, os botões usam o link original `whats.link/namba`.

### SEO, acessibilidade e performance
- Títulos e descrições revistos em todas as páginas, `canonical`, Open Graph com
  `preview.webp` e dados estruturados da empresa (sem afirmar autorização Canon).
- Auditoria automática (axe, WCAG 2 A/AA) sem violações nas páginas públicas,
  nos dois temas e nos estados de erro e resultado.
- Contraste do botão vermelho corrigido no tema escuro; ordem de títulos; foco
  visível; alvos de toque de 40px ou mais; navegação por teclado nas abas
  (setas, Home, End) e no diálogo do certificado.
- Sem rolagem horizontal de 320px a 2560px.
- Imagens redimensionadas para o tamanho exibido: cerca de 400 KB a menos.

### Painel da equipe
- Números de O.S. no formato `H` + 5 dígitos; campo "Tipo de equipamento" na nova O.S.;
  status "Devolvido sem reparo" disponível para teste.

---

## 3. O que foi mantido
Identidade visual, paleta, tipografia, ilustrações, etiqueta de O.S., ficha
interativa dos equipamentos, história da família, tema claro/escuro, painel da
equipe, captcha e limite de tentativas (simulados), assinatura Or7 e README.

## 4. O que foi corrigido
Afirmações de autorização sem comprovação, formato de O.S., exposição de dados
pessoais no resultado, respostas erradas da Carmen, prazos divergentes,
contraste no tema escuro, estouro de largura em 320px e peso das imagens.

---

## 5. Depende de integração futura (back-end)
- Consulta real de O.S.: endpoint, autenticação do cliente, captcha e limite de
  tentativas **no servidor** (`config.os.apiUrl`).
- Mapa entre os códigos reais de status do banco e as etapas (`config.status`).
- Verificação de identidade adicional (hoje simulada com os 4 últimos dígitos do telefone).
- Painel da equipe: login, cadastro e edição continuam simulados no navegador.

## 6. Precisa de validação da Cine Camera Service
| Ponto | Situação no site |
|---|---|
| Status de "assistência autorizada Canon" hoje | O site diz "especializada". A autorização só aparece ligada ao certificado de 2015. Se houver autorização vigente comprovada, dá para voltar ao termo. |
| "Suporte direto da engenharia Canon" (texto do site antigo) | Retirado. Confirmar se pode ser afirmado. |
| Formato do número da O.S. | Configurado como 1 letra + 5 números (`H32758`). |
| Códigos de status do sistema interno | Desconhecidos; usado o mapa do protótipo. |
| Prazo do orçamento | Fontes antigas: "2 a 3 dias úteis" e "permita 3 dias". Usado "2 a 3 dias úteis". |
| Horário | Site antigo: 9h às 18h30. Versão PHP: "horário comercial". Usado 9h às 18h30. |
| WhatsApp oficial | Usado `whats.link/namba`. Falta o número para as mensagens prontas. |
| Formas de pagamento | Transferência, depósito, Visa e Mastercard parcelado sem juros. Pix não é citado nas fontes. |
| 60 anos em 2026 | Selo de 60 anos aplicado (foto da história e rodapé). Confirmar se são as versões finais aprovadas pela empresa. |
| Campos obrigatórios da carta | Só o nome (como no original). A revisão recomenda modelo, defeito e um contato. |
| Respostas da Carmen sem fonte | Pix/boleto, estacionamento e metrô, garantia do serviço, câmeras de filme, EOS R e lentes RF, filmadoras, atendimento urgente, compra de usados. Hoje ela encaminha para a equipe; com a confirmação, basta editar a regra em `carmen-bot.js`. |
| Vitrine de acessórios | 9 produtos com nomes genéricos (sem código de modelo, preço ou estoque). Confirmar itens, nomes e se a vitrine deve ficar no site. |
| Vídeos com marca "Pippit AI" | Fora das páginas; ficam em `assets/video`. |
