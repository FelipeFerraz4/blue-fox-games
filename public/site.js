/* Blue Fox Games · layout público compartilhado
 * Injeta header, gaveta mobile, rodapé e modal de login em todas as páginas.
 * Uso: <div id="site-header" data-active="home|games|about|updates"></div> e <div id="site-footer"></div>.
 * Qualquer elemento com [data-login] abre o modal de login. */
(() => {
  'use strict';

  const NAV = [
    { key: 'home', href: '/', label: 'Início' },
    { key: 'games', href: '/jogos', label: 'Jogos' },
    { key: 'about', href: '/sobre', label: 'Sobre' },
    { key: 'updates', href: '/atualizacoes', label: 'Atualizações' },
  ];

  const USER_ICON =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  const brand = (small = false) => `
    <a href="/" class="sh-brand">
      <span class="sh-logo"${small ? ' style="width:32px;height:32px"' : ''}><img src="/Favicon_logo5.png" alt="" /></span>
      <span class="sh-info">
        <span class="sh-title"${small ? ' style="font-size:1rem"' : ''}>BlueFox</span>
        <span class="sh-tag">Games</span>
      </span>
    </a>`;

  function renderHeader(mount) {
    const active = mount.dataset.active;
    const links = (cls) =>
      NAV.map((n) => `<a href="${n.href}" class="${cls}${n.key === active ? ' active' : ''}">${n.label}</a>`).join('');

    mount.outerHTML = `
      <header class="site-header">
        <div class="site-header-inner">
          ${brand()}
          <nav class="sh-nav" aria-label="Navegação principal">${links('sh-link')}</nav>
          <div class="sh-actions">
            <button type="button" class="btn-login-header" data-login>${USER_ICON}<span>Login</span></button>
            <button type="button" class="hamburger" id="drawer-open" aria-label="Abrir menu"><span></span><span></span><span></span></button>
          </div>
        </div>
      </header>
      <div class="drawer-backdrop" id="drawer-backdrop" hidden></div>
      <aside class="drawer" id="drawer" aria-label="Menu">
        <div class="drawer-head">
          ${brand(true)}
          <button type="button" class="drawer-close" id="drawer-close" aria-label="Fechar menu">✕</button>
        </div>
        <nav class="drawer-nav">${links('drawer-link')}</nav>
        <div class="drawer-foot">
          <button type="button" class="btn-primary-lg btn-block" data-login>${USER_ICON}<span>Fazer Login</span></button>
        </div>
      </aside>`;

    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    const toggle = (open) => {
      drawer.classList.toggle('open', open);
      backdrop.hidden = !open;
      document.body.classList.toggle('no-scroll', open);
    };
    document.getElementById('drawer-open').addEventListener('click', () => toggle(true));
    document.getElementById('drawer-close').addEventListener('click', () => toggle(false));
    backdrop.addEventListener('click', () => toggle(false));
    drawer.addEventListener('click', (e) => e.target.closest('a, [data-login]') && toggle(false));
  }

  function renderFooter(mount) {
    mount.outerHTML = `
      <footer class="site-footer">
        <div class="site-footer-inner">
          <div class="footer-brand"><img src="/Favicon_logo5.png" alt="" /><span>BlueFox Games</span></div>
          <nav class="footer-links" aria-label="Rodapé">
            ${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join('')}
            <button type="button" data-login>Login</button>
          </nav>
          <div class="footer-copy">&copy; ${new Date().getFullYear()} Blue Fox Global Group &bull; Todos os direitos reservados.</div>
        </div>
      </footer>`;
  }

  // Login unificado (Keycloak / Blue Fox IAM) ainda não está ligado nos jogos:
  // o modal explica e oferece jogar como convidado.
  function setupLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button type="button" class="modal-close" data-close aria-label="Fechar">✕</button>
        <div class="modal-logo"><img src="/Favicon_logo5.png" alt="" /></div>
        <h2 id="login-title">Entrar com Blue Fox ID</h2>
        <p>Em breve você poderá entrar com a mesma conta do ecossistema Blue Fox para salvar seu histórico de partidas e aparecer no ranking. Por enquanto, todos os jogos funcionam como convidado, sem cadastro.</p>
        <div class="modal-actions">
          <a href="/memoria" class="btn-primary-lg btn-block">Jogar como convidado</a>
          <button type="button" class="btn-secondary-lg btn-block btn-disabled" disabled>${USER_ICON}<span>Login em breve</span></button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const close = () => {
      modal.hidden = true;
      document.body.classList.remove('no-scroll');
    };
    modal.addEventListener('click', (e) => (e.target === modal || e.target.closest('[data-close]')) && close());
    document.addEventListener('keydown', (e) => e.key === 'Escape' && !modal.hidden && close());
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-login]')) return;
      e.preventDefault();
      modal.hidden = false;
      document.body.classList.add('no-scroll');
      modal.querySelector('.btn-primary-lg').focus();
    });
  }

  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  if (header) renderHeader(header);
  if (footer) renderFooter(footer);
  setupLoginModal();
})();
