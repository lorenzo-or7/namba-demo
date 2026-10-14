/* =====================================================================
   admin.js — moldura comum do painel (equivalente a admin/includes/auth.php
   + admin-header.php). Exige login, monta a barra superior e oferece
   utilitários para as páginas do painel.
   PROTÓTIPO: o login aqui é só uma simulação no navegador. Na versão
   final ele precisa ser feito no servidor (password_hash, sessão PHP).
   ===================================================================== */
(function () {
  'use strict';
  var DB = window.NambaDB;
  var page = document.body.getAttribute('data-admin') || '';

  // Tema (mesma preferência do site)
  try { var t = localStorage.getItem('namba-theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}

  if (page === 'login') return;

  var admin = DB.currentAdmin();
  if (!admin) { location.replace('login.html'); return; }

  var links = [
    ['index.html', 'Ordens de serviço', 'dashboard'],
    ['nova-os.html', 'Nova O.S.', 'nova'],
    ['clientes.html', 'Clientes', 'clientes'],
    ['../index.html', 'Ver site', 'site']
  ];
  var bar = document.getElementById('admin-bar');
  bar.className = 'admin-bar';
  bar.innerHTML = '<div class="wrap">' +
    '<a href="index.html" style="text-decoration:none"><span class="logotype"><span class="r">cine</span><span class="k">camera</span><span class="r">service</span></span></a>' +
    '<span class="who">' + DB.esc(admin.nome) + '</span>' +
    '<nav class="admin-nav" aria-label="Painel">' +
      links.map(function (l) { return '<a href="' + l[0] + '"' + (l[2] === page ? ' aria-current="page"' : '') + (l[2] === 'site' ? ' target="_blank" rel="noopener"' : '') + '>' + l[1] + '</a>'; }).join('') +
      '<button type="button" id="themeBtn" aria-label="Alternar tema">Tema</button>' +
      '<button type="button" id="logoutBtn">Sair</button>' +
    '</nav></div>';

  document.getElementById('logoutBtn').addEventListener('click', function () { DB.logout(); location.href = 'login.html'; });
  document.getElementById('themeBtn').addEventListener('click', function () {
    var root = document.documentElement, cur = root.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('namba-theme', next); } catch (e) {}
  });

  // Aviso de protótipo + restaurar dados (confirmação em dois cliques)
  var proto = document.getElementById('admin-proto');
  if (proto) {
    proto.className = 'proto';
    proto.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>' +
      '<div><strong>Painel de demonstração.</strong> Os dados são fictícios e as alterações ficam salvas só neste navegador. ' +
      '<button type="button" class="restore-btn" id="restoreBtn">Restaurar dados de exemplo</button></div>';
    var armed = false;
    document.getElementById('restoreBtn').addEventListener('click', function () {
      if (!armed) { armed = true; this.textContent = 'Clique de novo para apagar suas alterações'; return; }
      DB.reset(); flash('ok', 'Dados de exemplo restaurados.'); location.href = 'index.html';
    });
  }

  /* Mensagens que sobrevivem a um redirecionamento (como ?criado=1 no PHP). */
  function flash(type, text) { try { sessionStorage.setItem('namba-flash', JSON.stringify({ type: type, text: text })); } catch (e) {} }
  function showFlash(el) {
    var f = null;
    try { f = JSON.parse(sessionStorage.getItem('namba-flash') || 'null'); sessionStorage.removeItem('namba-flash'); } catch (e) {}
    if (f && el) el.innerHTML = '<div class="alert ' + (f.type === 'ok' ? 'alert-ok' : 'alert-error') + '" role="status">' + DB.esc(f.text) + '</div>';
  }
  function showErrors(el, erros) {
    el.innerHTML = erros.map(function (e) { return '<div class="alert alert-error" role="alert">' + DB.esc(e) + '</div>'; }).join('');
    if (erros.length) el.scrollIntoView({ block: 'center' });
  }
  function formData(form) {
    var d = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) d[el.name] = String(el.value).trim(); });
    return d;
  }
  /* id da O.S. em editar-os.html#4 (ou ?id=4) */
  function idFromUrl() {
    var h = location.hash.replace('#', ''), q = new URLSearchParams(location.search).get('id');
    var v = parseInt(h || q, 10);
    if (!v) { try { v = parseInt(sessionStorage.getItem('namba-edit-id'), 10); } catch (e) {} }
    return v || 0;
  }
  function goEdit(id) { try { sessionStorage.setItem('namba-edit-id', id); } catch (e) {} location.href = 'editar-os.html#' + id; }

  window.NambaAdmin = { admin: admin, flash: flash, showFlash: showFlash, showErrors: showErrors, formData: formData, idFromUrl: idFromUrl, goEdit: goEdit };
})();
