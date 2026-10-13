# Cine Camera Service / Namba — protótipo (HTML, CSS e JS)

Demo para apresentação. Não precisa de servidor, PHP nem banco de dados:
abra `index.html` no navegador (ou suba a pasta inteira em qualquer hospedagem
estática).

> As partes que dependem de banco (consulta de O.S. e painel da equipe) usam
> **dados fictícios guardados no navegador** de quem abre a demo. Isso existe
> só para mostrar o funcionamento. Nada disso é seguro para produção.

## Páginas

| Protótipo | Equivale a (versão PHP) |
|---|---|
| `index.html` | `index.php` |
| `como-enviar.html` | `como-enviar.php` |
| `carta-envio.html` | `carta-envio.php` (4 etapas, validação, CEP automático, carta A4 para imprimir ou salvar em PDF) |
| `consultar-os.html` | `consultar-os.php` + `resultado-os.php` (estados de carregando, não encontrado, verificação, indisponível e resultado) |
| `tira-duvidas.html` | `tira-duvidas.php` (Carmen em página cheia; nas demais páginas ela abre numa janela flutuante) |
| `admin/login.html` | `admin/login.php` |
| `admin/index.html` | `admin/dashboard.php` |
| `admin/nova-os.html` | `admin/nova-os.php` |
| `admin/editar-os.html#ID` | `admin/editar-os.php?id=ID` |
| `admin/clientes.html` | `admin/clientes.php` |

Login de demonstração: **demo / namba2026**.
Exemplos para a consulta pública aparecem na própria página (clique para preencher).

## Onde está cada coisa

```
assets/js/config.js     CONFIGURAÇÃO CENTRAL: contato, WhatsApp, prazos, formato da O.S.,
                        endereço da API de consulta e mapa de status → etapas
assets/js/site.js       cabeçalho, rodapé, tema, menu, botão da Carmen, WhatsApp por contexto
assets/js/os-service.js camada de consulta da O.S. (modo demonstração ou API real)
assets/js/consulta.js   tela de acompanhamento da O.S.
assets/js/carta.js      carta de envio em etapas + documento A4
assets/js/carmen-bot.js Carmen (página e janela flutuante)
assets/js/home.js       abas dos equipamentos, certificado e prazos da página inicial
assets/js/demo-db.js    dados FICTÍCIOS do modo demonstração e funções do painel
assets/js/admin.js      exige login, barra do painel (auth.php + admin-header.php)
assets/js/masks.js      máscaras de CPF, CNPJ, telefone e CEP
assets/css/site.css     tokens de cor/tipo, tema claro e escuro, páginas públicas
assets/css/admin.css    painel da equipe
assets/fig/*.svg        ilustrações em traço
```

## Ligando a consulta de O.S. ao sistema real

1. Em `config.js`, confirme `os.padrao` (hoje: uma letra + 5 números, como `H32758`).
2. Preencha `os.apiUrl` com o endereço do serviço e mude `os.demo` para `false`.
   O contrato esperado está descrito no topo de `assets/js/os-service.js`.
3. Mapeie em `config.js → status` os códigos reais do banco para as etapas da
   linha do tempo. Códigos que não estiverem no mapa aparecem com o próprio nome.
4. A validação de captcha, o limite de tentativas e a verificação de identidade
   precisam ser feitos no servidor; no protótipo eles só simulam o comportamento.

## Ilustrações

As figuras em `assets/fig/` foram recortadas da imagem de referência,
tiveram o fundo quadriculado removido e foram convertidas em vetor (SVG).
No CSS elas são aplicadas como máscara (`.fig .fig-camera`, `.fig-lens` etc.),
então pegam a cor do texto e mudam sozinhas no tema escuro. Para usar uma
figura em qualquer página:

```html
<span class="fig fig-multimeter" style="width:120px" aria-hidden="true"></span>
```

Ficaram só 4 figuras em uso: a bancada da abertura e uma figura no topo de Como Enviar,
Acompanhar O.S. e Carta de envio. As demais podem ser
vetorizadas de novo a partir das imagens originais, se precisar.

Dados de contato, prazos e WhatsApp ficam em `assets/js/config.js`.
**Confirme o WhatsApp oficial**: o site estático usava `whats.link/namba`
(link curto, sem mensagem pronta). Com o número em `whatsapp.numero`, cada botão
abre a conversa com a mensagem do contexto (orçamento, envio, O.S.).

## Voltando para PHP + MySQL depois da aprovação

1. Cabeçalho e rodapé: o HTML gerado em `site.js` vira `includes/header.php` e
   `includes/footer.php` de novo.
2. Consulta de O.S. e painel: troque as chamadas `NambaDB.*` por formulários
   que enviam ao PHP (ou por `fetch` para endpoints PHP). As regras já existem
   no projeto original: CSRF, captcha, limite de 5 consultas/10 min por IP,
   senha com `password_hash`, mensagens genéricas.
3. Correção já aplicada no protótipo e que vale levar para `nova-os.php`: ao
   reaproveitar um cliente pelo telefone, campos deixados em branco (ex.: CPF)
   não devem apagar o que já estava cadastrado. No original, `UPDATE clientes
   SET cpf = :cpf` grava `NULL` nesse caso.

## Observações sobre o conteúdo

- Os vídeos em `assets/video` não são usados nas páginas. Eles têm a marca d'água "Pippit AI" no canto. Para não parecer
  feito por IA, vale exportar sem a marca ou trocar por vídeos reais da bancada.
- Em 2026 a empresa completa **60 anos**. O selo de 50 anos foi mantido como
  registro histórico (2016) na linha do tempo.
- Não usados no protótipo: `carmen-escritorio.jpg` (render de uma sala que não
  existe), `history-team.png` e `certificacao-canon.jpg` (duplicatas de fotos
  usadas em maior resolução), `logo50-light/dark.png`, `selo-50-anos-vermelho.png`,
  o vídeo `loja-namba.mp4` (render 3D de câmera, substituído pelas ilustrações)
  e os ícones sociais PNG (substituídos por ícones SVG nítidos).
- O mapa do Google foi trocado por botões "Abrir no Google Maps / Waze". Se
  quiser o mapa incorporado de volta, é só reinserir o `<iframe>` da versão PHP
  na seção `#visite` de `index.html`.

Relatório completo das mudanças da versão 7 e dos pontos a validar: `RELATORIO.md`.
