/* ═══════════════════════════════════════════════
   AllergyTrack – Cloud Sync (Supabase ↔ IndexedDB)

   Mit szinkronizál:
     • symptom_logs  – tünetnapló (per-user, RLS védett)
     • allergen_profile – allergen beállítások (profiles JSONB)

   Stratégia:
     • Mentéskor azonnal push Supabase-be (fire & forget)
     • Bejelentkezéskor pull: minden cloud adat bekerül az
       IndexedDB-be; sync_id-vel deduplikálva, nem töröl
   ═══════════════════════════════════════════════ */

window.App = window.App || {};

App.CloudSync = {

  /* ── UUID generátor ──────────────────────────── */
  _uid() {
    if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },

  _sb()  { return App.Supabase?.get?.(); },
  _uid_() { return App.Auth?.userId; },

  /* ══════════════════════════════════════════════
     TÜNETNAPLÓ – PUSH
  ══════════════════════════════════════════════ */
  async pushSymptomLog(entry) {
    const sb  = this._sb();
    const uid = this._uid_();
    if (!sb || !uid) return;

    try {
      const { error } = await sb.from('symptom_logs').upsert({
        sync_id:          entry.sync_id,
        user_id:          uid,
        date:             entry.date,
        time:             entry.time             ?? null,
        location:         entry.location         ?? null,
        symptoms:         entry.symptoms         ?? [],
        overall_severity: entry.overall_severity ?? 0,
        no_symptoms:      entry.no_symptoms      ?? false,
        notes:            entry.notes            ?? null,
        medication_taken: entry.medication_taken ?? false,
        medications_taken:entry.medications_taken ?? [],
        temperature:      entry.temperature      ?? null,
        triggers:         entry.triggers         ?? [],
        environment:      entry.environment      ?? null,
        created_at:       entry.created_at       ?? new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      }, { onConflict: 'sync_id' });

      if (error) throw error;
    } catch (e) {
      console.warn('[CloudSync] pushSymptomLog hiba:', e.message ?? e);
    }
  },

  /* ══════════════════════════════════════════════
     TÜNETNAPLÓ – PULL (bejelentkezéskor)
  ══════════════════════════════════════════════ */
  async pullSymptomLogs() {
    const sb  = this._sb();
    const uid = this._uid_();
    if (!sb || !uid) return 0;

    try {
      const { data, error } = await sb
        .from('symptom_logs')
        .select('*')
        .eq('user_id', uid)
        .order('date', { ascending: false })
        .limit(1000);

      if (error) throw error;
      if (!data?.length) return 0;

      /* Meglévő sync_id-k az IndexedDB-ben – deduplikáció */
      const existing = await App.db.getRecentLogs(9999);
      const knownIds = new Set(existing.map(r => r.sync_id).filter(Boolean));

      let added = 0;
      for (const row of data) {
        if (knownIds.has(row.sync_id)) continue;   /* már megvan helyben */
        await App.db.saveSymptomsLogFromCloud({
          sync_id:          row.sync_id,
          date:             row.date,
          time:             row.time,
          location:         row.location,
          symptoms:         row.symptoms         ?? [],
          overall_severity: row.overall_severity ?? 0,
          no_symptoms:      row.no_symptoms      ?? false,
          notes:            row.notes,
          medication_taken: row.medication_taken ?? false,
          medications_taken:row.medications_taken ?? [],
          temperature:      row.temperature,
          triggers:         row.triggers         ?? [],
          environment:      row.environment,
          created_at:       row.created_at,
        });
        added++;
      }
      if (added) console.log(`[CloudSync] ${added} új tünetnapló bejegyzés letöltve.`);
      return added;
    } catch (e) {
      console.warn('[CloudSync] pullSymptomLogs hiba:', e.message ?? e);
      return 0;
    }
  },

  /* ══════════════════════════════════════════════
     HELYI NAPLÓK FELTÖLTÉSE (első szinkron)
     – azok a bejegyzések, amelyeknek még nincs sync_id-jük
  ══════════════════════════════════════════════ */
  async pushUnsyncedLogs() {
    const sb  = this._sb();
    const uid = this._uid_();
    if (!sb || !uid) return;

    try {
      const all      = await App.db.getRecentLogs(9999);
      const unsynced = all.filter(l => !l.sync_id);
      if (!unsynced.length) return;

      /* sync_id generálás + helyi mentés + cloud push */
      for (const entry of unsynced) {
        entry.sync_id = this._uid();
        await App.db.saveSymptomsLog(entry);   /* frissíti a helyi rekordot sync_id-vel */
      }
      console.log(`[CloudSync] ${unsynced.length} korábbi bejegyzés feltöltve.`);
    } catch (e) {
      console.warn('[CloudSync] pushUnsyncedLogs hiba:', e.message ?? e);
    }
  },

  /* ══════════════════════════════════════════════
     ALLERGEN PROFIL – PUSH
  ══════════════════════════════════════════════ */
  _allergenTimer: null,
  pushAllergenProfile() {
    /* Debounce: ha gyorsan több allergen változik, csak egyszer küldjük */
    clearTimeout(this._allergenTimer);
    this._allergenTimer = setTimeout(async () => {
      const sb  = this._sb();
      const uid = this._uid_();
      if (!sb || !uid) return;
      try {
        const profile = await App.db.getAllergenProfile();
        const { error } = await sb.from('profiles').upsert({
          id: uid,
          allergen_profile: profile,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      } catch (e) {
        console.warn('[CloudSync] pushAllergenProfile hiba:', e.message ?? e);
      }
    }, 1500);
  },

  /* ══════════════════════════════════════════════
     ALLERGEN PROFIL – PULL
  ══════════════════════════════════════════════ */
  async pullAllergenProfile() {
    const sb  = this._sb();
    const uid = this._uid_();
    if (!sb || !uid) return;

    try {
      const { data, error } = await sb
        .from('profiles')
        .select('allergen_profile')
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data?.allergen_profile?.length) return;

      for (const entry of data.allergen_profile) {
        await App.db.saveAllergenProfile(entry);
      }
      console.log(`[CloudSync] ${data.allergen_profile.length} allergen profil bejegyzés letöltve.`);
    } catch (e) {
      console.warn('[CloudSync] pullAllergenProfile hiba:', e.message ?? e);
    }
  },

  /* ══════════════════════════════════════════════
     MINDEN LETÖLTÉSE – bejelentkezéskor hívódik
  ══════════════════════════════════════════════ */
  async pullAll() {
    await Promise.allSettled([
      this.pullSymptomLogs(),
      this.pullAllergenProfile(),
    ]);
    /* Régi (sync_id nélküli) helyi adatok feltöltése a felhőbe */
    this.pushUnsyncedLogs().catch(() => {});
  },
};
