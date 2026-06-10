/* ═══════════════════════════════════════════════
   AllergyTrack – Authentikáció
   Supabase Auth: e-mail/jelszó + session kezelés
   ═══════════════════════════════════════════════ */

window.App = window.App || {};

App.Auth = {
  _user:    null,
  _session: null,

  /* ── Init: meglévő session visszaállítása ─── */
  async init() {
    const sb = App.Supabase?.get?.();
    if (!sb) return null;

    try {
      const { data: { session } } = await sb.auth.getSession();
      this._session = session;
      this._user    = session?.user ?? null;

      /* Auth állapot figyelése (token refresh, login/logout) */
      sb.auth.onAuthStateChange((event, session) => {
        this._session = session;
        this._user    = session?.user ?? null;
        /* Értesítsük az app-ot az állapotváltozásról */
        App._onAuthChange?.(event, this._user);
      });

      return this._user;
    } catch (e) {
      console.warn('[Auth] init hiba:', e);
      return null;
    }
  },

  get user()      { return this._user; },
  get isLoggedIn(){ return !!this._user; },
  get email()     { return this._user?.email ?? null; },
  get userId()    { return this._user?.id ?? null; },

  /* ── Regisztráció ────────────────────────── */
  async signUp(email, password, displayName) {
    const sb = App.Supabase?.get?.();
    if (!sb) throw new Error('Nincs Supabase kapcsolat');

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] },
      },
    });
    if (error) throw error;
    return data;
  },

  /* ── Bejelentkezés ───────────────────────── */
  async signIn(email, password) {
    const sb = App.Supabase?.get?.();
    if (!sb) throw new Error('Nincs Supabase kapcsolat');

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /* ── Kijelentkezés ───────────────────────── */
  async signOut() {
    const sb = App.Supabase?.get?.();
    if (sb) {
      const { error } = await sb.auth.signOut();
      if (error) throw error;
    }
    this._user    = null;
    this._session = null;
  },

  /* ── Jelszó-visszaállítás ────────────────── */
  async resetPassword(email) {
    const sb = App.Supabase?.get?.();
    if (!sb) throw new Error('Nincs Supabase kapcsolat');

    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${window.location.pathname}?reset=1`,
    });
    if (error) throw error;
  },

  /* ── Jelszó frissítése (reset link után) ─── */
  async updatePassword(newPassword) {
    const sb = App.Supabase?.get?.();
    if (!sb) throw new Error('Nincs Supabase kapcsolat');

    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};
