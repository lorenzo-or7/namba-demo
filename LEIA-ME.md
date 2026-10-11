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
| `carta-envio.html` | `carta-envio.php` (impressão, máscaras, CEP automático, rascunho salvo) |
| `consultar-os.html` | `consultar-os.php` + `resultado-os.php` |
| `tira-duvidas.html` | `tira-duvidas.php` (Carmen, mesmas regras de palavras-chave) |
| `admin/login.html` | `admin/login.php` |
| `admin/index.html` | `admin/dashboard.php` |
| `admin/nova-os.html` | `admin/nova-os.php` |
| `admin/editar-os.html#ID` | `admin/editar-os.php?id=ID` |
| `admin/clientes.html` | `admin/clientes.php` |

Login de demonstração: **demo / namba2026**.
Exemplos para a consulta pública aparecem na própria página (clique para preencher).

## Onde está cada coisa

```
assets/css/site.css     tokens de cor/tipo, tema claro e escuro, todas as páginas públicas
assets/css/admin.css    painel da equipe
assets/js/site.js       cabeçalho, rodapé, tema, menu mobile, dados de contato (objeto NAMBA)
assets/js/demo-db.js    "banco" simulado + funções de includes/functions.php em JS
assets/js/admin.js      exige login, barra do painel (auth.php + admin-header.php)
assets/js/carmen-bot.js bot da Carmen (mesma lógica do original)
assets/js/masks.js      máscaras de CPF, CNPJ, telefone e CEP
assets/fig/*.svg        ilustrações em traço (vetorizadas da imagem enviada)
```

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

Dados de contato (telefone, WhatsApp, redes) ficam num lugar só, no topo de
`assets/js/site.js`. **Confirme o link do WhatsApp**: o site estático usava
`whats.link/namba` e a versão PHP tinha um número de exemplo (`5511999999999`).

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

- Os vídeos (hoje fora da página, em assets/video) têm a marca d'água "Pippit AI" no canto. Para não parecer
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
