/* ═══════════════════════════════════════════════
   AllergyTrack – Supabase kliens
   ─────────────────────────────────────────────
   KONFIGURÁCIÓ:
   1. Menj ide: https://supabase.com
   2. Hozz létre egy új projektet
   3. Dashboard → Settings → API
   4. Másold be a Project URL-t és az anon key-t az alábbiakba
   5. Futtasd a supabase_schema.sql-t az SQL Editor-ban
   ═══════════════════════════════════════════════ */

window.App = window.App || {};

App.Supabase = {

  /* ─── KONFIGURÁCIÓ – cseréld ki a saját értékeidre ─── */
  URL:      'https://mwutxdzkzdqgfvchstg.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dXR4ZHpja3pkcWdmdmNoc3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTAzODYsImV4cCI6MjA5NjY2NjM4Nn0.KeyWFjwOeUBu8lOs4pUWu2fqvNRFnmxCmKhkuZpwFfU',
  /* ─────────────────────────────────────────────────── */

  _client: null,

  init() {
    /* Ha nincs konfigurálva, offline módban fut az app */
    if (this.URL.includes('YOUR-PROJECT') || !this.ANON_KEY || this.ANON_KEY.includes('YOUR-ANON')) {
      console.info('[Supabase] Nincs konfigurálva – az alkalmazás offline módban fut (minden adat helyi IndexedDB-ben).');
      return null;
    }

    /* A Supabase JS SDK CDN-ről töltődik be (index.html) */
    if (typeof window.supabase === 'undefined') {
      console.warn('[Supabase] SDK nem töltődött be. Ellenőrizd az internet kapcsolatot.');
      return null;
    }

    try {
      this._client = window.supabase.createClient(this.URL, this.ANON_KEY, {
        auth: {
          storage:          window.localStorage,
          autoRefreshToken: true,
          persistSession:   true,
          detectSessionInUrl: true,
        },
      });
      console.info('[Supabase] Kliens inicializálva ✓');
      return this._client;
    } catch (e) {
      console.warn('[Supabase] Init hiba:', e);
      return null;
    }
  },

  /** Supabase kliens – null ha nincs konfigurálva/betöltve */
  get() { return this._client; },

  get isConfigured() { return !!this._client; },
};
