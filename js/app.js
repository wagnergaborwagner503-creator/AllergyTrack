/* ═══════════════════════════════════════════════
   AllergyTrack – Main App
   Router, theme, modals, toasts, navigation
   ═══════════════════════════════════════════════ */

window.App = window.App || {};

/* ── Router ─────────────────────────────────── */
App._currentPage  = null;
App._pageTitle    = {
  dashboard: 'Vezérlőpult',
  log:       'Tünetnapló',
  'log-new': 'Új bejegyzés',
  pollen:    'Pollenadatok',
  analytics: 'Elemzés',
  profile:   'Allergia profil',
  settings:  'Beállítások',
};

App.navigate = async function (page, params = {}) {
  const container = document.getElementById('page-content');
  if (!container) return;

  /* Fade out */
  container.style.opacity = '0';
  container.style.transform = 'translateY(8px)';
  container.style.transition = 'opacity .15s ease, transform .15s ease';

  await new Promise(r => setTimeout(r, 120));

  App._currentPage = page;

  /* Update nav active state */
  const navPage = ['log-new','log-detail'].includes(page) ? 'log' : page;
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === navPage);
  });
  document.querySelectorAll('.drawer-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === navPage);
  });

  /* Update header title */
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent = App._pageTitle[page] || 'AllergyTrack';
  }

  /* Render page */
  try {
    let html = '';
    switch (page) {
      case 'dashboard':
        html = await App.Dashboard.render();
        break;
      case 'log':
        html = await App.LogEntry.renderList();
        break;
      case 'log-new':
        html = await App.LogEntry.renderForm(params.editId || null);
        break;
      case 'pollen':
        html = await App.PollenData.render();
        break;
      case 'analytics':
        html = await App.Analytics.render();
        break;
      case 'profile':
        html = await App.Profile.render();
        break;
      case 'settings':
        html = await App.Settings.render();
        break;
      default:
        html = await App.Dashboard.render();
    }

    container.innerHTML = html;
    container.style.opacity    = '1';
    container.style.transform  = 'translateY(0)';

    /* Mount page event listeners */
    switch (page) {
      case 'dashboard': App.Dashboard.mount(); break;
      case 'log':       App.LogEntry.mountList(); break;
      case 'log-new':   App.LogEntry.mountForm(); break;
      case 'pollen':    App.PollenData.mount(); break;
      case 'analytics': await App.Analytics.mount(); break;
      case 'profile':   App.Profile.mount(); break;
      case 'settings':  await App.Settings.mount(); break;
    }

    /* Scroll to top */
    container.scrollTop = 0;

  } catch (err) {
    console.error('Page render error:', err);
    container.innerHTML = `
      <div class="page empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Hiba történt</h3>
        <p>${err.message || 'Ismeretlen hiba'}</p>
        <button class="btn btn-primary" onclick="App.navigate('dashboard')">Vissza a főoldalra</button>
      </div>`;
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  }
};

/* ── Theme ──────────────────────────────────── */
App.applyTheme = function (theme) {
  const html     = document.documentElement;
  const metaTag  = document.getElementById('theme-meta');
  const sunIcon  = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  let effective = theme;
  if (theme === 'system') {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  html.dataset.theme = effective;

  if (metaTag) metaTag.content = effective === 'dark' ? '#0D1810' : '#2E7D32';
  if (sunIcon && moonIcon) {
    sunIcon.style.display  = effective === 'dark'  ? 'none' : '';
    moonIcon.style.display = effective === 'light' ? 'none' : '';
  }
};

/* ── Toasts ─────────────────────────────────── */
App.toast = function (message, type = 'info', duration = 3000) {
  const container = document.getElementById('toasts');
  if (!container) return;

  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="toast-icon"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="toast-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="toast-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>`,
  };

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, duration);
};

/* ── Modal ──────────────────────────────────── */
App.showModal = function (html) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;
  content.innerHTML = html;
  overlay.style.display = 'flex';
  overlay.addEventListener('click', function handler(e) {
    if (e.target === overlay) { App.closeModal(); overlay.removeEventListener('click', handler); }
  });
};

App.closeModal = function () {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.style.display = 'none';
};

App.showConfirmModal = function (title, message, onConfirm) {
  App.showModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">${title}</div>
    <p style="font-size:14px;color:var(--text-2);line-height:1.6;margin-bottom:20px;white-space:pre-line">${message}</p>
    <div class="modal-actions">
      <button class="btn btn-danger" id="confirm-ok">Megerősítés</button>
      <button class="btn btn-ghost" id="confirm-cancel">Mégse</button>
    </div>
  `);
  document.getElementById('confirm-ok')?.addEventListener('click', () => {
    App.closeModal();
    onConfirm();
  });
  document.getElementById('confirm-cancel')?.addEventListener('click', () => App.closeModal());
};

/* ── Drawer ─────────────────────────────────── */
App._drawerOpen = false;

App.openDrawer = function () {
  document.getElementById('drawer')?.classList.add('open');
  document.getElementById('drawer-overlay')?.classList.add('open');
  App._drawerOpen = true;
  document.body.style.overflow = 'hidden';
};

App.closeDrawer = function () {
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('open');
  App._drawerOpen = false;
  document.body.style.overflow = '';
};

/* ── Keyboard / back gesture ────────────────── */
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('modal-overlay')?.style.display !== 'none') {
      App.closeModal();
    } else if (App._drawerOpen) {
      App.closeDrawer();
    }
  }
});

/* ── Init ───────────────────────────────────── */
App.init = async function () {
  try {
    /* Init DB */
    await App.db.init();

    /* Load and apply theme */
    const theme = await App.db.getSetting('theme', 'light');
    App.applyTheme(theme);

    /* Watch system theme changes */
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
      const t = await App.db.getSetting('theme', 'light');
      if (t === 'system') App.applyTheme('system');
    });

    /* Show app */
    const loading = document.getElementById('loading-screen');
    const appContent = document.getElementById('app-content');
    if (loading) loading.classList.add('hide');
    setTimeout(() => {
      if (loading) loading.style.display = 'none';
      if (appContent) appContent.style.display = '';
    }, 420);

    /* Wire header buttons */
    document.getElementById('menu-btn')?.addEventListener('click', () => {
      App._drawerOpen ? App.closeDrawer() : App.openDrawer();
    });

    document.getElementById('theme-btn')?.addEventListener('click', async () => {
      const current = document.documentElement.dataset.theme;
      const next    = current === 'dark' ? 'light' : 'dark';
      await App.db.setSetting('theme', next);
      App.applyTheme(next);
    });

    document.getElementById('fab-btn')?.addEventListener('click', () => App.navigate('log-new'));
    document.getElementById('drawer-overlay')?.addEventListener('click', () => App.closeDrawer());

    /* Wire bottom nav */
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        App.navigate(el.dataset.page);
      });
    });

    /* Wire drawer nav */
    document.querySelectorAll('.drawer-item[data-page]').forEach(el => {
      el.addEventListener('click', () => {
        App.closeDrawer();
        App.navigate(el.dataset.page);
      });
    });

    /* Navigate to dashboard */
    await App.navigate('dashboard');

  } catch (err) {
    console.error('App init error:', err);
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.innerHTML = `
        <div style="text-align:center;padding:32px">
          <div style="font-size:48px;margin-bottom:16px">⚠️</div>
          <h2 style="color:var(--text)">Hiba az indításkor</h2>
          <p style="color:var(--text-3);margin-top:8px">${err.message || 'Ismeretlen hiba'}</p>
          <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;border-radius:24px;background:var(--accent);color:#fff;border:none;font-weight:700;cursor:pointer">
            Újraindítás
          </button>
        </div>`;
    }
  }
};

/* ── Boot ───────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}
