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
  knowledge: 'Allergia Tudástár',
};

App.navigate = async function (page, params = {}) {
  const container = document.getElementById('page-content');
  if (!container) return;

  /* Stop map location refresh when leaving pollen page */
  App.PollenMap?.stopRefresh?.();

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
      case 'knowledge':
        html = await App.Knowledge.render();
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
      case 'knowledge': App.Knowledge.mount(); break;
    }

    /* Scroll to top.
       #page-content has only min-height (no fixed height), so the *window*
       scrolls rather than the element itself — window.scrollTo is required. */
    container.scrollTop = 0;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      container.scrollTop = 0;
      window.scrollTo(0, 0);
    });

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
App.showModal = function (html, opts = {}) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;
  content.innerHTML = html;
  overlay.style.display = 'flex';
  /* backdropClose: false esetén a háttérre kattintás nem zárja be a modalt */
  const closeOnBackdrop = opts.backdropClose !== false;
  if (closeOnBackdrop) {
    overlay.addEventListener('click', function handler(e) {
      if (e.target === overlay) { App.closeModal(); overlay.removeEventListener('click', handler); }
    });
  }
};

App.closeModal = function () {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.classList.remove('auth-mode'); /* auth-panel cleanup */
  }
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

    document.getElementById('profile-btn')?.addEventListener('click', () => {
      App.UserProfile?.showPanel?.();
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

    /* Supabase + Auth inicializáció – MIELŐTT navigálunk, hogy session-t visszaállítsuk */
    let _initialUser = null;
    if (App.Supabase) {
      App.Supabase.init();
      if (App.Supabase.isConfigured && App.Auth) {
        try { _initialUser = await App.Auth.init(); } catch (e) {}
      }
    }
    App._updateProfileButton();

    /* PWA shortcut / deep-link kezelés (?page=xxx) */
    const urlPage = new URLSearchParams(window.location.search).get('page');
    const startPage = (urlPage && App._pageTitle[urlPage]) ? urlPage : 'dashboard';

    /* Navigate to dashboard (vagy deep-link oldal) */
    await App.navigate(startPage);

    /* Ha be van jelentkezve – profil betöltése a háttérben */
    if (_initialUser && App.UserProfile) {
      App.UserProfile.load().catch(() => {});
    }

    /* Patch notes – első indítás után az új verzióban */
    if (App.PatchNotes) {
      App.PatchNotes.checkAndShow();
    }

    /* Verzió megjelenítése minden helyen dinamikusan (egyetlen forrás: CURRENT_VERSION) */
    const v = App.PatchNotes?.CURRENT_VERSION;
    if (v) {
      const drawerV = document.getElementById('drawer-version');
      if (drawerV) drawerV.textContent = `v${v}`;
      document.title = `AllergyTrack v${v} – Allergia Napló`;
    }

    /* Tárolt helyszín azonnali megjelenítése (cache-ből) */
    App.db.getSetting('userLocation', null).then(loc => App._updateHeaderLocation(loc));

    /* GPS helymeghatározás – háttérben, nem blokkolja az indulást */
    if (App.GeoLocation) {
      App.GeoLocation.init()
        .then(loc => {
          App._updateHeaderLocation(loc);
          /* Napi 3x helyzetnaplózás – régió-alapú elemzéshez */
          App.GeoLocation.logDailyPosition().catch(() => {});
        })
        .catch(e => console.warn('[GPS] init hiba:', e));
    }

    /* Időjárás – háttérben, nem blokkolja az indulást */
    if (App.Weather) {
      App.Weather.fetchForCurrentLocation().catch(() => {});
    }

    /* Push értesítések – jogosultság kérés és ütemezés */
    if (App.Notifications) {
      App.Notifications.init().catch(() => {});
    }

    /* ── Első bejelentkezési képernyő ───────────
       Ha Supabase konfigurálva van, de nincs aktív session,
       és a felhasználó még nem találkozott az auth panellel:
       mutassuk a belépési képernyőt az első indításkor.
       Ha korábban be volt jelentkezve → a session visszaáll, panel nem jelenik meg.
       Ha már látta és "skip"-elte → localStorage flag megakadályozza az újra-mutatást.
    ─────────────────────────────────────────── */
    if (App.Supabase?.isConfigured && !App.Auth?.isLoggedIn) {
      const seenAuth = localStorage.getItem('allergytrack_seen_auth');
      if (!seenAuth) {
        /* Flag azonnal beállítva – a panel csak egyszer jelenik meg automatikusan,
           függetlenül attól, hogy a felhasználó hogyan zárja be */
        localStorage.setItem('allergytrack_seen_auth', '1');
        setTimeout(() => {
          /* Csak akkor mutatjuk, ha nincs más modal nyitva (pl. patch notes) */
          const overlay = document.getElementById('modal-overlay');
          if (!overlay || overlay.style.display === 'none' || overlay.style.display === '') {
            App.UserProfile?._showAuthPanel?.('login');
          }
        }, 500);
      }
    }

    /* Pull-to-refresh */
    App._initPullToRefresh();

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

/* ── Auth callbacks ─────────────────────────── */
App._onAuthChange = function (event, user) {
  if (user && App.UserProfile) {
    /* load() után frissítjük a gombot (avatar csak akkor jön meg, ha a profil betöltött) */
    App.UserProfile.load()
      .then(() => App._updateProfileButton())
      .catch(() => {});
    /* Belépéskor automatikus pollen + időjárás szinkron */
    if (event === 'SIGNED_IN') {
      App._syncOnLogin();
    }
  }
  /* Azonnal megjelenítünk egy közbülső állapotot (monogram), amíg az avatar tölt */
  App._updateProfileButton();
  /* Login/logout után az aktuális oldal újratöltése – adatokat megmutatja/elrejti */
  const page = App._currentPage || 'dashboard';
  App.navigate(page).catch(() => {});
};

/** Belépéskor automatikusan szinkronizálja a pollen + időjárás adatokat */
App._syncOnLogin = async function () {
  App._setSyncState('pending');
  try {
    const fetches = [];
    /* Személyes adatok szinkronizálása (tünetnapló + allergen profil) */
    if (App.CloudSync)     fetches.push(App.CloudSync.pullAll().catch(() => {}));
    /* Megosztott pollenadatok letöltése Supabase-ből (minden user látja) */
    if (App.PollenFetcher) fetches.push(App.PollenFetcher.pullFromSupabase().catch(() => {}));
    if (App.PollenFetcher) fetches.push(App.PollenFetcher.fetchAll().catch(() => {}));
    if (App.Weather)       fetches.push(App.Weather.fetchForCurrentLocation(true).catch(() => {}));
    await Promise.all(fetches);
    App._setSyncState('ok');
    /* Szinkron után dashboard frissítése ha azon vagyunk */
    if (App._currentPage === 'dashboard') App.navigate('dashboard').catch(() => {});
  } catch (e) {
    App._setSyncState('error');
  }
  /* 5 mp után visszaáll 'ok'-ra ha sikerült */
  setTimeout(() => {
    if (App.Auth?.isLoggedIn) App._setSyncState('ok');
  }, 5000);
};

/** Profil gomb frissítése: monogram/avatar ha be van jelentkezve, ikon ha nem */
App._updateProfileButton = function () {
  const btn = document.getElementById('profile-btn');
  if (!btn) return;

  const loggedIn = App.Auth?.isLoggedIn ?? false;
  btn.classList.toggle('logged-in', loggedIn);

  if (loggedIn) {
    const avatar = App.UserProfile?.avatarUrl;
    if (avatar) {
      btn.innerHTML = `<img src="${avatar}" alt="Profil" style="width:34px;height:34px;object-fit:cover;border-radius:50%">`;
    } else {
      const init = App.UserProfile?.initials ?? '?';
      btn.innerHTML = `<span style="pointer-events:none">${init}</span>`;
    }
  } else {
    btn.classList.remove('sync-ok', 'sync-pending', 'sync-error');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" width="16" height="16" style="pointer-events:none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>`;
  }
};

/** Szinkron állapot frissítése a profil gombon */
App._setSyncState = function (state) {
  const btn = document.getElementById('profile-btn');
  if (!btn || !App.Auth?.isLoggedIn) return;
  btn.classList.remove('sync-ok', 'sync-pending', 'sync-error');
  if (state) btn.classList.add(`sync-${state}`);
};

/* ── Header location display ────────────────── */
App._updateHeaderLocation = function (loc) {
  if (!loc?.nearestCity && !loc?.userCity) return;
  const el  = document.getElementById('header-location');
  const txt = document.getElementById('header-location-text');
  if (el && txt) {
    const display = loc.userCity || loc.nearestCity;
    const station = (loc.userCity && loc.userCity !== loc.nearestCity) ? ` (${loc.nearestCity})` : '';
    txt.textContent = display + station;
    el.style.display = 'flex';
  }
};

/* ── Pull-to-refresh ────────────────────────── */
App._initPullToRefresh = function () {
  const content = document.getElementById('page-content');
  if (!content) return;

  let startY = 0, pulling = false;
  /* 144 px drag required – double the old threshold to avoid accidental triggers */
  const THRESHOLD = 144;

  /* page-content has only min-height (no fixed height) so the window scrolls,
     not the element itself. Always read the actual page scroll position. */
  const getScrollTop = () =>
    Math.max(content.scrollTop, window.scrollY, document.documentElement.scrollTop);

  /* Indicator element – single 🔄 icon, no text, no rotation */
  const indicator = document.createElement('div');
  indicator.id = 'ptr-indicator';
  indicator.style.cssText = `
    position:fixed;top:60px;left:50%;transform:translateX(-50%) translateY(-60px);
    background:var(--accent);color:#fff;width:40px;height:40px;border-radius:50%;
    font-size:20px;z-index:999;transition:transform .2s ease,opacity .2s ease;
    opacity:0;pointer-events:none;display:flex;align-items:center;justify-content:center`;
  indicator.innerHTML = `🔄`;
  document.body.appendChild(indicator);

  const showPull = (progress) => {
    const pct = Math.min(1, progress / THRESHOLD);
    indicator.style.opacity = pct.toString();
    indicator.style.transform = `translateX(-50%) translateY(${-60 + 80 * pct}px)`;
  };

  const hidePull = () => {
    indicator.style.opacity = '0';
    indicator.style.transform = 'translateX(-50%) translateY(-60px)';
  };

  content.addEventListener('touchstart', e => {
    /* Only arm when the page is scrolled all the way to the top */
    if (getScrollTop() <= 0) {
      startY  = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });

  content.addEventListener('touchmove', e => {
    if (!pulling) return;
    /* Cancel the moment the page scrolls down even slightly */
    if (getScrollTop() > 5) { pulling = false; hidePull(); return; }
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) showPull(dy);
    else        hidePull();
  }, { passive: true });

  content.addEventListener('touchend', async e => {
    if (!pulling) return;
    pulling = false;
    const dy = e.changedTouches[0].clientY - startY;
    hidePull();
    if (dy >= THRESHOLD) {
      indicator.style.opacity = '1';
      indicator.style.transform = 'translateX(-50%) translateY(20px)';
      if (App.GeoLocation) {
        App.GeoLocation.refresh().then(loc => App._updateHeaderLocation(loc));
      }
      await App.navigate(App._currentPage || 'dashboard');
      setTimeout(hidePull, 500);
    }
  }, { passive: true });
};

/* ── Boot ───────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}
