/* =====================================================================
   site.js — cabeçalho, rodapé, tema claro/escuro e menu mobile.
   O cabeçalho e o rodapé são montados aqui para não repetir HTML em
   todas as páginas (equivalente a includes/header.php e footer.php).
   Na versão definitiva (PHP), estes blocos voltam a ser includes.
   ===================================================================== */
(function () {
  'use strict';

  /* Dados de contato vêm de assets/js/config.js (um lugar só). */
  var CFG = window.NAMBA_CONFIG || {};
  var C = CFG.contato || {};
  var W = CFG.whatsapp || {};
  var NAMBA = window.NAMBA = {
    cfg: CFG,
    phone: C.telefone, tel: C.telefoneLink, email: C.email,
    whatsapp: W.link,
    instagram: C.instagram, facebook: C.facebook,
    address1: C.endereco1, address2: C.endereco2,
    hours: C.horario, closed: C.horarioFechado,
    maps: C.maps, waze: C.waze
  };

  /* WhatsApp com mensagem do contexto.
     Só funciona com o número oficial configurado (config.js → whatsapp.numero).
     Sem número, cai no link curto original, sem mensagem.
     Nunca incluir CPF, telefone ou outros dados pessoais aqui. */
  var WA_MSG = {
    assistencia: 'Olá! Vim pelo site e gostaria de solicitar assistência para um equipamento Canon.',
    orcamento: 'Olá! Vim pelo site e gostaria de um orçamento para {x}.',
    envio: 'Olá! Vim pelo site e tenho uma dúvida sobre como enviar meu equipamento.',
    os: 'Olá! Vim pelo site e gostaria de falar sobre a O.S. {x}.',
    acessorios: 'Olá! Vim pelo site e gostaria de saber a disponibilidade de acessórios originais Canon.',
    acessorio: 'Olá! Vim pelo site e gostaria de saber a disponibilidade e o valor deste acessório: {x}.',
    duvida: 'Olá! Vim pelo site e tenho uma dúvida.'
  };
  NAMBA.wa = function (ctx, extra) {
    var num = W.numero && String(W.numero).replace(/\D/g, '');
    if (!num) return W.link;
    var msg = (WA_MSG[ctx] || WA_MSG.duvida).replace('{x}', extra || 'meu equipamento');
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
  };
  function applyWa(scope) {
    (scope || document).querySelectorAll('a[data-wa]').forEach(function (a) {
      a.href = NAMBA.wa(a.getAttribute('data-wa'), a.getAttribute('data-wa-extra'));
      a.target = '_blank'; a.rel = 'noopener';
    });
  }
  NAMBA.applyWa = applyWa;

  var body = document.body;
  var base = body.getAttribute('data-base') || '';
  var page = body.getAttribute('data-page') || '';

  /* ---------- tema ---------- */
  var root = document.documentElement;
  function storedTheme() { try { return localStorage.getItem('namba-theme'); } catch (e) { return null; } }
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  var st = storedTheme();
  if (st) root.setAttribute('data-theme', st);

  var ICON = {
    sun: '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.8.7.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2a8.1 8.1 0 0 1-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 20.2 12 8.2 8.2 0 0 1 12 20.2z"/></svg>'
  };
  ICON.ig = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
  ICON.fb = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/></svg>';
  window.NAMBA_ICON = ICON;

  var NAV = [
    { href: 'index.html#servicos', label: 'Serviços', id: 'servicos' },
    { href: 'index.html#oficina', label: 'Na oficina', id: 'oficina' },
    { href: 'como-enviar.html', label: 'Como enviar', id: 'como-enviar' },
    { href: 'acessorios.html', label: 'Acessórios', id: 'acessorios' },
    { href: 'index.html#historia', label: 'História', id: 'historia' },
    { href: 'index.html#visite', label: 'Contato', id: 'contato' },
    { href: 'tira-duvidas.html', label: 'Dúvidas', id: 'duvidas' }
  ];

  function navLinks(cls) {
    return NAV.map(function (n) {
      return '<a class="' + cls + '" href="' + base + n.href + '"' + (page === n.id ? ' aria-current="page"' : '') + '>' + n.label + '</a>';
    }).join('');
  }

  var header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML =
      '<div class="wrap headbar">' +
        '<a class="brand" href="' + base + 'index.html" aria-label="Cine Camera Service, página inicial">' +
          '<span class="logotype"><span class="r">cine</span><span class="k">camera</span><span class="r">service</span></span>' +
          '<small>Namba · Assistência técnica Canon desde 1966</small>' +
        '</a>' +
        '<nav class="main-nav" aria-label="Principal">' + navLinks('') + '</nav>' +
        '<div class="head-tools">' +
          '<a class="btn btn-line btn-sm" href="' + base + 'consultar-os.html"' + (page === 'os' ? ' aria-current="page"' : '') + '>Acompanhar O.S.</a>' +
          '<button class="icon-btn theme-btn" type="button" id="themeBtn" aria-label="Alternar tema claro ou escuro">' + ICON.sun + ICON.moon + '</button>' +
          '<button class="icon-btn menu-btn" type="button" id="menuBtn" aria-expanded="false" aria-controls="mobileNav" aria-label="Abrir menu">' + ICON.menu + '</button>' +
        '</div>' +
      '</div>' +
      '<nav class="mobile-nav" id="mobileNav" aria-label="Menu" hidden>' +
        navLinks('nav-link') +
        '<a class="nav-link" href="' + base + 'consultar-os.html">Acompanhar O.S.</a>' +
        '<div class="actions">' +
          '<a class="btn btn-red btn-block" href="' + NAMBA.whatsapp + '" data-wa="assistencia" target="_blank" rel="noopener">' + ICON.wa + 'Falar pelo WhatsApp</a>' +
          '<a class="btn btn-line btn-block" href="tel:' + NAMBA.tel + '">Ligar ' + NAMBA.phone + '</a>' +
        '</div>' +
      '</nav>';

    var themeBtn = document.getElementById('themeBtn');
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('namba-theme', next); } catch (e) {}
    });

    var menuBtn = document.getElementById('menuBtn');
    var mobileNav = document.getElementById('mobileNav');
    function setMenu(open) {
      mobileNav.hidden = !open;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menuBtn.innerHTML = open ? ICON.close : ICON.menu;
    }
    menuBtn.addEventListener('click', function () { setMenu(mobileNav.hidden); });
    mobileNav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML =
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          '<div class="foot-brand">' +
            '<span class="logotype"><span class="r">cine</span><span class="k">camera</span><span class="r">service</span></span>' +
            '<p>Cine Camera Service Ltda. Assistência técnica autorizada pela Canon em equipamentos fotográficos, em São Paulo desde 1966.</p>' +
            '<img src="' + base + 'assets/img/logo-60-anos-dourado.webp" width="480" height="482" alt="Logo comemorativo de 60 anos da Cine Camera Service, 1966 a 2026" loading="lazy">' +
          '</div>' +
          '<div><h2>Endereço</h2><address>' + NAMBA.address1 + '<br>' + NAMBA.address2 + '</address></div>' +
          '<div><h2>Atendimento</h2><ul>' +
            '<li><a href="tel:' + NAMBA.tel + '">' + NAMBA.phone + '</a></li>' +
            '<li><a href="mailto:' + NAMBA.email + '">' + NAMBA.email + '</a></li>' +
            '<li>' + NAMBA.hours + '</li><li>' + NAMBA.closed + '</li></ul>' +
            '<div class="social">' +
              '<a href="' + NAMBA.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + ICON.ig + '</a>' +
              '<a href="' + NAMBA.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + ICON.fb + '</a>' +
              '<a href="' + NAMBA.whatsapp + '" data-wa="duvida" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICON.wa + '</a>' +
            '</div>' +
          '</div>' +
          '<div><h2>Páginas</h2><ul>' +
            '<li><a href="' + base + 'index.html#atendimento">Solicitar assistência</a></li>' +
            '<li><a href="' + base + 'index.html#servicos">Serviços</a></li>' +
            '<li><a href="' + base + 'como-enviar.html">Como enviar</a></li>' +
            '<li><a href="' + base + 'carta-envio.html">Carta de envio</a></li>' +
            '<li><a href="' + base + 'acessorios.html">Acessórios</a></li>' +
            '<li><a href="' + base + 'consultar-os.html">Acompanhar O.S.</a></li>' +
            '<li><a href="' + base + 'tira-duvidas.html">Tirar dúvidas com a Carmen</a></li>' +
            '<li><a href="' + base + 'admin/login.html">Área da equipe</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="foot-bottom"><span>© ' + new Date().getFullYear() + ' Cine Camera Service Ltda.</span><span>Protótipo de apresentação. Conteúdo sujeito a validação da Cine Camera Service.</span></div>' +
        '<div class="or7-sign" style="display:flex;justify-content:center;padding:28px 16px 6px;clear:both"><a href="https://lorenzo-or7.github.io" target="_blank" rel="noopener author" aria-label="Idealizado e desenvolvido por Lorenzo Orsetti (Or7)" style="display:block;width:min(300px,76%);opacity:.85;border:0"><img src="' + base + 'assets/img/or7-assinatura-clara.png" data-or7-light="' + base + 'assets/img/or7-assinatura-clara.png" data-or7-dark="' + base + 'assets/img/or7-assinatura-escura.png" alt="Or7 — Idealizado e desenvolvido por Lorenzo Orsetti" width="900" height="127" loading="lazy" style="display:block;width:100%;height:auto"></a></div>' +
      '</div>';
    (function(){function lum(c){var m=c.match(/[\d.]+/g);if(!m||m.length<3)return null;if(m.length>3&&+m[3]<0.5)return null;return(0.2126*m[0]+0.7152*m[1]+0.0722*m[2])/255}function bg(el){while(el&&el.nodeType===1){var l=lum(getComputedStyle(el).backgroundColor);if(l!==null)return l;el=el.parentElement}return 1}function run(){document.querySelectorAll('img[data-or7-light]').forEach(function(i){var w=bg(i.parentElement)>0.5?i.getAttribute('data-or7-dark'):i.getAttribute('data-or7-light');if(i.getAttribute('src')!==w)i.setAttribute('src',w)})}run();addEventListener('load',run);var mo=new MutationObserver(function(){setTimeout(run,80)});[document.documentElement,document.body].forEach(function(n){mo.observe(n,{attributes:true,attributeFilter:['class','data-theme','style']})})})();
  }

  /* Carmen: um único botão flutuante (substitui o botão fixo do WhatsApp).
     O WhatsApp aparece dentro da conversa, quando faz sentido. */
  if (!body.hasAttribute('data-no-wa') && !body.hasAttribute('data-no-carmen')) {
    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'carmen-launcher';
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.setAttribute('aria-controls', 'carmenPanel');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Dúvidas? Fale com a Carmen');
    launcher.innerHTML = '<img src="' + base + 'assets/img/carmen-avatar.png" alt="" width="40" height="40"><span>Dúvidas? <b>Fale com a Carmen</b></span>';
    body.appendChild(launcher);
    var loading = false;
    launcher.addEventListener('click', function () {
      if (window.Carmen) { window.Carmen.toggle(launcher); return; }
      if (loading) return;
      loading = true;
      var sc = document.createElement('script');
      sc.src = base + 'assets/js/carmen-bot.js';
      sc.onload = function () { window.Carmen.toggle(launcher); };
      sc.onerror = function () { location.href = base + 'tira-duvidas.html'; };
      document.head.appendChild(sc);
    });
  }

  /* Formulário da etiqueta (home): leva o número para a página de consulta. */
  var tagForm = document.getElementById('tagForm');
  if (tagForm) {
    tagForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (document.getElementById('tagOs').value || '').replace(/\s+/g, '').toUpperCase();
      try { sessionStorage.setItem('namba-os-prefill', v); } catch (err) {}
      location.href = base + 'consultar-os.html';
    });
  }
  applyWa();
})();
