/* ═══════════════════════════════════════════════
   AllergyTrack – Felhasználói Profil
   Supabase `profiles` tábla + profil panel UI
   ═══════════════════════════════════════════════ */

window.App = window.App || {};

App.UserProfile = {
  _data: null,   /* { id, display_name, avatar_url, bio, allergen_profile, ... } */

  /* ── Profil betöltése Supabase-ből ────────── */
  async load() {
    const sb  = App.Supabase?.get?.();
    const uid = App.Auth?.userId;
    if (!sb || !uid) return null;

    try {
      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      /* PGRST116 = sor nem létezik – még nincs profil (nem hiba) */
      if (error && error.code !== 'PGRST116') throw error;
      this._data = data ?? null;
      /* Profil gomb azonnal frissítése az avatar megjelenítéséhez */
      App._updateProfileButton?.();
      App._setSyncState?.('ok');
      return this._data;
    } catch (e) {
      console.warn('[UserProfile] load hiba:', e);
      App._setSyncState?.('error');
      return null;
    }
  },

  /* ── Megjelenítési név ───────────────────── */
  get displayName() {
    if (this._data?.display_name) return this._data.display_name;
    const email = App.Auth?.email ?? '';
    return email ? email.split('@')[0] : 'Felhasználó';
  },

  /* ── Monogram (2 betű) ───────────────────── */
  get initials() {
    const name  = this.displayName;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  },

  get avatarUrl() { return this._data?.avatar_url ?? null; },

  /* ── Profilkép feltöltése galériából ────────
     Fájlválasztás után képkivágó modal nyílik:
     a felhasználó húzással + nagyítással beállítja,
     hogy a kép melyik része látszódjon. */
  async pickAvatar() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type   = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        document.body.removeChild(input);
        if (!file) { resolve(null); return; }
        try {
          const img = await new Promise((res, rej) => {
            const i = new Image();
            i.onload  = () => res(i);
            i.onerror = () => rej(new Error('A kép nem olvasható'));
            i.src = URL.createObjectURL(file);
          });
          const base64 = await this._showCropModal(img);
          URL.revokeObjectURL(img.src);
          if (!base64) { resolve(null); return; }
          await this.save({ avatar_url: base64 });
          App._updateProfileButton?.();
          App.toast('✅ Profilkép frissítve!', 'success');
          resolve(base64);
        } catch (e) {
          App.toast('Hiba a kép feltöltésekor: ' + (e.message || e), 'error');
          resolve(null);
        }
      });
      input.click();
    });
  },

  /* ── Képkivágó modal ─────────────────────────
     Kör alakú maszk, húzás (1 ujj), pinch-zoom (2 ujj),
     zoom csúszka + görgő. 400×400 JPEG-et ad vissza. */
  _showCropModal(img) {
    return new Promise((resolve) => {
      const VP = Math.min(300, Math.floor(window.innerWidth - 88));

      App.showModal(`
        <div class="modal-handle"></div>
        <div class="modal-title" style="text-align:center;margin-bottom:6px">Kép kivágása</div>
        <p style="font-size:12px;color:var(--text-3);text-align:center;margin-bottom:14px">
          Húzd a képet a megfelelő helyre · csippentéssel vagy a csúszkával nagyíthatsz
        </p>
        <div id="crop-stage" style="position:relative;width:${VP}px;height:${VP}px;margin:0 auto;border-radius:20px;overflow:hidden;touch-action:none;cursor:grab;background:#111">
          <canvas id="crop-canvas" style="display:block;width:${VP}px;height:${VP}px"></canvas>
          <div style="position:absolute;inset:0;pointer-events:none;border-radius:50%;box-shadow:0 0 0 ${VP}px rgba(0,0,0,.5)"></div>
          <div style="position:absolute;inset:0;pointer-events:none;border-radius:50%;border:2px dashed rgba(255,255,255,.9)"></div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;max-width:${VP}px;margin:16px auto 0">
          <span style="font-size:15px;flex-shrink:0">🔍</span>
          <input type="range" id="crop-zoom" min="100" max="300" value="100" style="flex:1">
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="crop-save-btn" style="flex:1">✅ Mentés</button>
          <button class="btn btn-ghost" id="crop-cancel-btn">Mégse</button>
        </div>
      `, { backdropClose: false });

      const stage  = document.getElementById('crop-stage');
      const canvas = document.getElementById('crop-canvas');
      const slider = document.getElementById('crop-zoom');
      if (!stage || !canvas || !slider) { resolve(null); return; }

      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = VP * dpr;
      canvas.height = VP * dpr;

      /* cover-skála: a kép rövidebb oldala pont kitölti a keretet */
      const baseScale = VP / Math.min(img.width, img.height);
      let zoom = 1, tx = 0, ty = 0;

      const clamp = () => {
        const s = baseScale * zoom;
        const maxX = Math.max(0, (img.width  * s - VP) / 2);
        const maxY = Math.max(0, (img.height * s - VP) / 2);
        tx = Math.min(maxX, Math.max(-maxX, tx));
        ty = Math.min(maxY, Math.max(-maxY, ty));
      };

      const draw = () => {
        const s = baseScale * zoom;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, VP, VP);
        ctx.drawImage(img,
          VP / 2 + tx - (img.width  * s) / 2,
          VP / 2 + ty - (img.height * s) / 2,
          img.width * s, img.height * s);
      };

      /* ── Húzás (1 ujj) + pinch-zoom (2 ujj) ── */
      const pointers = new Map();
      let pinchStart = null;

      stage.addEventListener('pointerdown', e => {
        stage.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          pinchStart = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
        }
        stage.style.cursor = 'grabbing';
      });

      stage.addEventListener('pointermove', e => {
        if (!pointers.has(e.pointerId)) return;
        const prev = pointers.get(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.size === 2 && pinchStart) {
          const [a, b] = [...pointers.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          zoom = Math.min(3, Math.max(1, pinchStart.zoom * d / pinchStart.dist));
          slider.value = Math.round(zoom * 100);
        } else if (pointers.size === 1) {
          tx += e.clientX - prev.x;
          ty += e.clientY - prev.y;
        }
        clamp(); draw();
      });

      const endPointer = e => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinchStart = null;
        if (pointers.size === 0) stage.style.cursor = 'grab';
      };
      stage.addEventListener('pointerup', endPointer);
      stage.addEventListener('pointercancel', endPointer);

      /* Görgő-zoom (desktop) */
      stage.addEventListener('wheel', e => {
        e.preventDefault();
        zoom = Math.min(3, Math.max(1, zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
        slider.value = Math.round(zoom * 100);
        clamp(); draw();
      }, { passive: false });

      /* Csúszka-zoom */
      slider.addEventListener('input', () => {
        zoom = slider.value / 100;
        clamp(); draw();
      });

      /* ── Mentés: a látható négyzet 400×400 JPEG-be ── */
      document.getElementById('crop-save-btn')?.addEventListener('click', () => {
        const OUT = 400;
        const out = document.createElement('canvas');
        out.width = OUT; out.height = OUT;
        const octx = out.getContext('2d');
        const f = OUT / VP;
        const s = baseScale * zoom * f;
        octx.fillStyle = '#fff';
        octx.fillRect(0, 0, OUT, OUT);
        octx.drawImage(img,
          OUT / 2 + tx * f - (img.width  * s) / 2,
          OUT / 2 + ty * f - (img.height * s) / 2,
          img.width * s, img.height * s);
        App.closeModal();
        resolve(out.toDataURL('image/jpeg', 0.85));
      });

      document.getElementById('crop-cancel-btn')?.addEventListener('click', () => {
        App.closeModal();
        resolve(null);
      });

      draw();
    });
  },

  /* ── Mentés Supabase-be ───────────────────── */
  async save(updates) {
    const sb  = App.Supabase?.get?.();
    const uid = App.Auth?.userId;
    if (!sb || !uid) return;

    try {
      const { data, error } = await sb
        .from('profiles')
        .upsert({ id: uid, ...updates, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      this._data = data;
      return data;
    } catch (e) {
      console.warn('[UserProfile] save hiba:', e);
      throw e;
    }
  },

  /* ── Allergen profil feltöltése felhőbe ──── */
  async syncAllergenProfileUp() {
    const sb  = App.Supabase?.get?.();
    const uid = App.Auth?.userId;
    if (!sb || !uid) return;

    try {
      const localProfile = await App.db.getAllergenProfile();
      await sb.from('profiles').upsert({
        id: uid,
        allergen_profile: localProfile,
        updated_at: new Date().toISOString(),
      });
      App.toast('☁️ Allergen profil szinkronizálva a felhőbe', 'success', 3000);
    } catch (e) {
      App.toast('Szinkronizáció sikertelen: ' + (e.message || e), 'error');
    }
  },

  /* ── Allergen profil letöltése felhőből ──── */
  async syncAllergenProfileDown() {
    const sb  = App.Supabase?.get?.();
    const uid = App.Auth?.userId;
    if (!sb || !uid) return;

    try {
      const { data } = await sb
        .from('profiles')
        .select('allergen_profile')
        .eq('id', uid)
        .single();

      if (data?.allergen_profile?.length) {
        for (const entry of data.allergen_profile) {
          await App.db.saveAllergenProfile(entry);
        }
        App.toast('📥 Allergen profil letöltve a felhőből', 'success', 3000);
      } else {
        App.toast('A felhőben nincs mentett profil', 'info');
      }
    } catch (e) {
      App.toast('Letöltés sikertelen: ' + (e.message || e), 'error');
    }
  },

  /* ══════════════════════════════════════════
     PROFIL PANEL – bottom sheet
     ══════════════════════════════════════════ */
  showPanel() {
    if (!App.Supabase?.isConfigured) {
      this._showOfflinePanel();
      return;
    }

    if (!App.Auth?.isLoggedIn) {
      this._showAuthPanel('login');
    } else {
      this._showProfilePanel();
    }
  },

  /* ── Offline / nincs Supabase konfiguráció ─ */
  _showOfflinePanel() {
    App.showModal(`
      <div class="modal-handle"></div>
      <div style="text-align:center;padding:20px 0 16px">
        <div class="profile-avatar-lg" style="margin:0 auto 12px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="24" height="24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div style="font-weight:800;font-size:17px;color:var(--text);margin-bottom:4px">Helyi profil</div>
        <div style="font-size:12px;color:var(--text-muted)">Adatok a telefon belső tárhelyén</div>
      </div>

      <div class="settings-group" style="margin-bottom:14px">
        <div class="settings-item" onclick="App.navigate('profile');App.closeModal()">
          <div class="settings-item-icon">🌺</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Allergia profil</div>
            <div class="settings-item-sub">Allergének és érzékenységi szintek</div>
          </div>
          <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg></div>
        </div>
        <div class="settings-item" onclick="App.navigate('settings');App.closeModal()">
          <div class="settings-item-icon">⚙️</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Beállítások</div>
            <div class="settings-item-sub">Téma, értesítések, adatok</div>
          </div>
          <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg></div>
        </div>
      </div>

      <div style="background:var(--accent-bg);border-radius:var(--r-md);padding:12px 14px;margin-bottom:14px">
        <div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:4px">☁️ Felhő szinkronizáció</div>
        <div style="font-size:11px;color:var(--text-3);line-height:1.5">
          Hozz létre egy Supabase projektet, töltsd ki az URL-t és anon key-t a <code>js/supabase.js</code> fájlban, hogy adataid több eszközön is elérhetők legyenek.
        </div>
      </div>

      <button class="btn btn-ghost" onclick="App.closeModal()" style="width:100%">Bezárás</button>
    `);
  },

  /* ── Bejelentkezés / Regisztráció form ───── */
  _showAuthPanel(mode = 'login') {
    const isLogin = mode === 'login';
    App.showModal(`
      <div class="modal-handle"></div>
      <div style="text-align:center;padding:8px 0 18px">
        <div style="font-size:38px;margin-bottom:10px">${isLogin ? '👋' : '🌿'}</div>
        <div class="modal-title" style="margin-bottom:4px">${isLogin ? 'Bejelentkezés' : 'Fiók létrehozása'}</div>
        <p style="font-size:12px;color:var(--text-muted);line-height:1.5">
          ${isLogin
            ? 'Adataid több eszköz között szinkronizálhatók'
            : 'Ingyenes fiók · adataid biztonságban vannak'}
        </p>
      </div>

      <div id="auth-error" class="auth-error-box" style="display:none"></div>

      ${!isLogin ? `
      <div class="form-group">
        <label class="form-label">Megjelenítési név</label>
        <input class="form-control" id="auth-name" type="text" placeholder="Kovács Anna" autocomplete="name">
      </div>` : ''}

      <div class="form-group">
        <label class="form-label">E-mail cím</label>
        <input class="form-control" id="auth-email" type="email" placeholder="pelda@email.hu" autocomplete="email">
      </div>
      <div class="form-group" style="margin-bottom:6px">
        <label class="form-label">Jelszó</label>
        <input class="form-control" id="auth-password" type="password"
          placeholder="${isLogin ? 'Jelszavad' : 'Min. 6 karakter'}"
          autocomplete="${isLogin ? 'current-password' : 'new-password'}">
      </div>

      ${isLogin ? `
      <div style="text-align:right;margin-bottom:14px">
        <button class="btn-link" id="auth-forgot-btn" style="font-size:12px;color:var(--text-3)">Elfelejtett jelszó?</button>
      </div>` : '<div style="margin-bottom:14px"></div>'}

      <button class="btn btn-primary" id="auth-submit-btn" style="width:100%;margin-bottom:10px">
        ${isLogin ? 'Bejelentkezés' : 'Fiók létrehozása'}
      </button>
      <button class="btn btn-ghost" id="auth-switch-btn" style="width:100%;margin-bottom:6px">
        ${isLogin ? '➕ Új fiók létrehozása' : '← Bejelentkezés meglévő fiókba'}
      </button>
      <button class="btn btn-ghost" id="auth-skip-btn" style="width:100%;font-size:12px;opacity:.6">
        Bejelentkezés nélkül folytatom
      </button>
    `, { backdropClose: false });  /* háttérre kattintás ne zárja be */

    /* Középre igazított, teljes képernyős megjelenés (nem bottom-sheet) */
    document.getElementById('modal-overlay')?.classList.add('auth-mode');

    /* "Bejelentkezés nélkül" → megjegyzi hogy látta már az auth panelt */
    document.getElementById('auth-skip-btn')?.addEventListener('click', () => {
      localStorage.setItem('allergytrack_seen_auth', '1');
      App.closeModal();
    });

    /* Váltás login ↔ register */
    document.getElementById('auth-switch-btn')?.addEventListener('click', () => {
      this._showAuthPanel(isLogin ? 'register' : 'login');
    });

    /* Elfelejtett jelszó */
    document.getElementById('auth-forgot-btn')?.addEventListener('click', async () => {
      const email = document.getElementById('auth-email')?.value?.trim();
      if (!email) { this._setAuthError('Add meg az e-mail cím!'); return; }
      try {
        await App.Auth.resetPassword(email);
        App.closeModal();
        App.toast('📧 Visszaállítási link elküldve!', 'success', 5000);
      } catch (e) {
        this._setAuthError(this._translateErr(e.message));
      }
    });

    /* Beküldés */
    document.getElementById('auth-submit-btn')?.addEventListener('click', async () => {
      const email    = document.getElementById('auth-email')?.value?.trim();
      const password = document.getElementById('auth-password')?.value ?? '';
      const name     = document.getElementById('auth-name')?.value?.trim() ?? '';

      if (!email || !password) { this._setAuthError('Töltsd ki az összes mezőt!'); return; }
      if (!isLogin && password.length < 6) { this._setAuthError('A jelszó legalább 6 karakter!'); return; }

      const btn = document.getElementById('auth-submit-btn');
      if (btn) { btn.textContent = '⏳ Folyamatban...'; btn.disabled = true; }

      try {
        if (isLogin) {
          await App.Auth.signIn(email, password);
        } else {
          await App.Auth.signUp(email, password, name);
        }
        await App.UserProfile.load();
        App.closeModal();
        App._updateProfileButton?.();
        if (isLogin) {
          App.toast('👋 Üdvözlünk vissza!', 'success', 3000);
        } else {
          App.toast('🎉 Fiók létrehozva!', 'success', 3000);
          App.toast('📧 Erősítsd meg az e-mail cím!', 'info', 6000);
        }
      } catch (e) {
        this._setAuthError(this._translateErr(e.message));
        if (btn) {
          btn.textContent = isLogin ? 'Bejelentkezés' : 'Fiók létrehozása';
          btn.disabled    = false;
        }
      }
    });

    /* Enter = beküldés */
    ['auth-email', 'auth-password', 'auth-name'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('auth-submit-btn')?.click();
      });
    });

    /* Fókusz az első mezőre */
    setTimeout(() => {
      (document.getElementById('auth-name') ?? document.getElementById('auth-email'))?.focus();
    }, 150);
  },

  _setAuthError(msg) {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  },

  _translateErr(msg = '') {
    const map = {
      'Invalid login credentials':               'Hibás e-mail cím vagy jelszó.',
      'User already registered':                 'Ez az e-mail cím már regisztrált.',
      'Password should be at least 6 characters':'A jelszó legalább 6 karakter legyen.',
      'Unable to validate email address':        'Érvénytelen e-mail cím formátum.',
      'Email not confirmed':                     'E-mail cím még nem megerősített. Nézd meg a postaládád!',
      'Too many requests':                       'Túl sok próbálkozás – várj egy percet.',
      'Network request failed':                  'Hálózati hiba. Ellenőrizd az internet kapcsolatot.',
    };
    for (const [k, v] of Object.entries(map)) {
      if (msg.includes(k)) return v;
    }
    return msg || 'Ismeretlen hiba';
  },

  /* ── Bejelentkezett felhasználó profil panelje */
  async _showProfilePanel() {
    await this.load();
    const name   = this.displayName;
    const email  = App.Auth?.email ?? '';
    const init   = this.initials;
    const avatar = this.avatarUrl;

    const avatarHtml = avatar
      ? `<img src="${this._esc(avatar)}" alt="Avatar">`
      : `<span>${init}</span>`;

    App.showModal(`
      <div class="modal-handle"></div>

      <!-- Profil fejléc – középre igazított, nagy avatar + Szerkesztés overlay -->
      <div style="text-align:center;padding:8px 0 20px;border-bottom:1px solid var(--border);margin-bottom:16px">
        <!-- Kattintható avatar Szerkesztés overlay-jel -->
        <div id="prof-avatar-btn" style="width:86px;height:86px;border-radius:50%;margin:0 auto 12px;position:relative;cursor:pointer;overflow:hidden;display:inline-block;flex-shrink:0">
          <div class="profile-avatar-lg" style="width:86px;height:86px;font-size:30px;margin:0;border-radius:50%">${avatarHtml}</div>
          <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.55);padding:5px 0 4px;font-size:10px;font-weight:700;color:#fff;text-align:center;letter-spacing:.3px;pointer-events:none">Szerkesztés</div>
        </div>
        <div style="font-weight:800;font-size:17px;color:var(--text);line-height:1.2">${this._esc(name)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis">${this._esc(email)}</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:5px;margin-top:5px">
          <div style="width:7px;height:7px;border-radius:50%;background:#4CAF50;flex-shrink:0"></div>
          <span style="font-size:11px;color:var(--text-3)">Bejelentkezve · szinkronizálás aktív</span>
        </div>
        <button class="btn btn-ghost" id="prof-edit-name-btn" style="margin-top:10px;padding:5px 14px;font-size:12px">✏️ Név szerkesztése</button>
      </div>

      <!-- Gyorslinkek -->
      <div class="settings-group" style="margin-bottom:12px">
        <div class="settings-item" id="prof-sync-up-btn">
          <div class="settings-item-icon" style="background:var(--info-bg)">☁️</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Feltöltés felhőbe</div>
            <div class="settings-item-sub">Allergen profil szinkronizálása</div>
          </div>
        </div>
        <div class="settings-item" id="prof-sync-down-btn">
          <div class="settings-item-icon" style="background:var(--accent-bg)">📥</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Letöltés felhőből</div>
            <div class="settings-item-sub">Allergen profil visszaállítása</div>
          </div>
        </div>
        <div class="settings-item" onclick="App.navigate('profile');App.closeModal()">
          <div class="settings-item-icon">🌺</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Allergia profil szerkesztése</div>
            <div class="settings-item-sub">Allergének, érzékenységi szintek</div>
          </div>
          <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg></div>
        </div>
        <div class="settings-item" onclick="App.navigate('settings');App.closeModal()">
          <div class="settings-item-icon">⚙️</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Beállítások</div>
            <div class="settings-item-sub">Téma, értesítések, adatkezelés</div>
          </div>
          <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg></div>
        </div>
      </div>

      <button class="btn btn-ghost" id="prof-signout-btn"
        style="width:100%;color:var(--danger);border:1px solid var(--danger-bg);margin-bottom:6px">
        🚪 Kijelentkezés
      </button>
      <button class="btn btn-ghost" onclick="App.closeModal()" style="width:100%;font-size:12px;opacity:.6">Bezárás</button>
    `);

    document.getElementById('prof-edit-name-btn')?.addEventListener('click', () => this._showEditName());
    document.getElementById('prof-avatar-btn')?.addEventListener('click', () => {
      App.closeModal();
      this.pickAvatar().then(() => setTimeout(() => this._showProfilePanel(), 300));
    });
    document.getElementById('prof-sync-up-btn')?.addEventListener('click', async () => {
      App.closeModal();
      await this.syncAllergenProfileUp();
    });
    document.getElementById('prof-sync-down-btn')?.addEventListener('click', async () => {
      App.closeModal();
      await this.syncAllergenProfileDown();
    });
    document.getElementById('prof-signout-btn')?.addEventListener('click', async () => {
      try {
        await App.Auth.signOut();
        App.closeModal();
        App._updateProfileButton?.();
        App.toast('👋 Kijelentkezett', 'info');
      } catch (e) {
        App.toast('Kijelentkezési hiba: ' + e.message, 'error');
      }
    });
  },

  /* ── Név szerkesztése ────────────────────── */
  _showEditName() {
    App.showModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">Profil szerkesztése</div>
      <div class="form-group">
        <label class="form-label">Megjelenítési név</label>
        <input class="form-control" id="edit-name-input" type="text"
          value="${this._esc(this.displayName)}" maxlength="40" autocomplete="off">
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="edit-name-save-btn">Mentés</button>
        <button class="btn btn-ghost" onclick="App.closeModal()">Mégse</button>
      </div>
    `);

    document.getElementById('edit-name-input')?.focus();
    document.getElementById('edit-name-save-btn')?.addEventListener('click', async () => {
      const val = document.getElementById('edit-name-input')?.value?.trim();
      if (!val) return;
      try {
        await this.save({ display_name: val });
        App.closeModal();
        App._updateProfileButton?.();
        App.toast('✅ Profil frissítve!', 'success');
      } catch (e) {
        App.toast('Mentési hiba: ' + e.message, 'error');
      }
    });
  },

  /* ── HTML escape segítő ──────────────────── */
  _esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};
