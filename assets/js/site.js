/* =====================================================================
   site.js — cabeçalho, rodapé, tema claro/escuro e menu mobile.
   O cabeçalho e o rodapé são montados aqui para não repetir HTML em
   todas as páginas (equivalente a includes/header.php e footer.php).
   Na versão definitiva (PHP), estes blocos voltam a ser includes.
   ===================================================================== */
(function () {
  'use strict';

  /* Dados de contato num só lugar. */
  var NAMBA = window.NAMBA = {
    phone: '(11) 3259-7888',
    tel: '+551132597888',
    email: 'atendimento@namba.com.br',
    // Confirmar com a Namba qual é o link oficial do WhatsApp.
    whatsapp: 'https://whats.link/namba',
    instagram: 'https://www.instagram.com/cinecameraservice/',
    facebook: 'https://www.facebook.com/cinecameraservice',
    address1: 'Rua da Consolação, 331, 10º andar',
    address2: 'Consolação, São Paulo – SP, 01301-905',
    hours: 'Segunda a sexta, 9h às 18h30',
    maps: 'https://www.google.com/maps/search/?api=1&query=Rua+da+Consola%C3%A7%C3%A3o+331+S%C3%A3o+Paulo',
    waze: 'https://waze.com/ul?ll=-23.547793,-46.644485&navigate=yes'
  };

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
          '<small>Namba · Assistência Técnica Autorizada Canon</small>' +
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
          '<a class="btn btn-red btn-block" href="' + NAMBA.whatsapp + '" target="_blank" rel="noopener">' + ICON.wa + 'Falar pelo WhatsApp</a>' +
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
            '<p>Cine Camera Service Ltda. Assistência técnica autorizada Canon em São Paulo desde 1966.</p>' +
            '<img src="' + base + 'assets/img/selo-50-anos-novo.png" alt="Selo comemorativo de 50 anos, 1966 a 2016" loading="lazy">' +
          '</div>' +
          '<div><h2>Endereço</h2><address>' + NAMBA.address1 + '<br>' + NAMBA.address2 + '</address></div>' +
          '<div><h2>Atendimento</h2><ul>' +
            '<li><a href="tel:' + NAMBA.tel + '">' + NAMBA.phone + '</a></li>' +
            '<li><a href="mailto:' + NAMBA.email + '">' + NAMBA.email + '</a></li>' +
            '<li>' + NAMBA.hours + '</li><li>Fechado aos sábados, domingos e feriados</li></ul>' +
            '<div class="social">' +
              '<a href="' + NAMBA.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + ICON.ig + '</a>' +
              '<a href="' + NAMBA.facebook + '" target="_blank" rel="noopener" aria-label="Facebook">' + ICON.fb + '</a>' +
              '<a href="' + NAMBA.whatsapp + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ICON.wa + '</a>' +
            '</div>' +
          '</div>' +
          '<div><h2>Páginas</h2><ul>' +
            '<li><a href="' + base + 'index.html#servicos">Serviços</a></li>' +
            '<li><a href="' + base + 'como-enviar.html">Como enviar</a></li>' +
            '<li><a href="' + base + 'carta-envio.html">Carta de envio</a></li>' +
            '<li><a href="' + base + 'consultar-os.html">Acompanhar O.S.</a></li>' +
            '<li><a href="' + base + 'tira-duvidas.html">Tirar dúvidas com a Carmen</a></li>' +
            '<li><a href="' + base + 'admin/login.html">Área da equipe</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="foot-bottom"><span>© ' + new Date().getFullYear() + ' Cine Camera Service Ltda.</span><span>Protótipo de apresentação. Conteúdo e layout sujeitos a aprovação.</span></div>' +
      '</div>';
  }

  if (!body.hasAttribute('data-no-wa')) {
    var wa = document.createElement('a');
    wa.className = 'wa-float';
    wa.href = NAMBA.whatsapp; wa.target = '_blank'; wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Falar pelo WhatsApp');
    wa.innerHTML = ICON.wa + '<span>WhatsApp</span>';
    body.appendChild(wa);
  }

  /* Formulário da etiqueta (home): leva o número para a página de consulta. */
  var tagForm = document.getElementById('tagForm');
  if (tagForm) {
    tagForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (document.getElementById('tagOs').value || '').trim().toUpperCase();
      try { sessionStorage.setItem('namba-os-prefill', v); } catch (err) {}
      location.href = base + 'consultar-os.html';
    });
  }
})();
