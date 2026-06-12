/* ═══════════════════════════════════════════
   AllergyTrack – IndexedDB Service
   DB name: allergytrack  version: 2
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.db = (function () {
  const DB_NAME    = 'allergytrack';
  const DB_VERSION = 2;
  let _db = null;

  /* ── Open / init ─────────────────────────── */
  function open() {
    return new Promise((resolve, reject) => {
      if (_db) { resolve(_db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = e => {
        const db = e.target.result;

        /* symptoms_log */
        if (!db.objectStoreNames.contains('symptoms_log')) {
          const s = db.createObjectStore('symptoms_log', { keyPath: 'id', autoIncrement: true });
          s.createIndex('date', 'date', { unique: false });
          s.createIndex('created_at', 'created_at', { unique: false });
        }

        /* pollen_data */
        if (!db.objectStoreNames.contains('pollen_data')) {
          const p = db.createObjectStore('pollen_data', { keyPath: 'id', autoIncrement: true });
          p.createIndex('date', 'date', { unique: false });
          p.createIndex('location', 'location', { unique: false });
        }

        /* allergen_profile */
        if (!db.objectStoreNames.contains('allergen_profile')) {
          const ap = db.createObjectStore('allergen_profile', { keyPath: 'allergen_id' });
          ap.createIndex('category', 'category', { unique: false });
        }

        /* settings */
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        /* medications */
        if (!db.objectStoreNames.contains('medications')) {
          const m = db.createObjectStore('medications', { keyPath: 'id', autoIncrement: true });
          m.createIndex('name', 'name', { unique: true });
        }
      };

      req.onsuccess = e => { _db = e.target.result; resolve(_db); };
      req.onerror   = e => reject(e.target.error);
    });
  }

  function tx(storeName, mode = 'readonly') {
    return _db.transaction(storeName, mode).objectStore(storeName);
  }

  function promisify(req) {
    return new Promise((res, rej) => {
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  }

  function getAll(storeName, indexName, query) {
    return open().then(() => {
      const store = tx(storeName);
      const target = indexName ? store.index(indexName) : store;
      return promisify(query ? target.getAll(query) : target.getAll());
    });
  }

  /* ── UUID generátor ─────────────────────────── */
  function _genSyncId() {
    if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /* ── Tünetbejegyzés tartalom-ujjlenyomat ─────
     Két bejegyzés duplikátum, ha ugyanaz a dátum, időpont,
     tünetek (súlyossággal), összesített súlyosság és jegyzet. */
  function _logFingerprint(e) {
    const syms = (e.symptoms || [])
      .map(s => `${s.id}:${s.severity ?? ''}`)
      .sort()
      .join(',');
    return [
      e.date,
      e.time ?? '',
      e.no_symptoms ? 1 : 0,
      e.overall_severity ?? 0,
      syms,
      (e.notes ?? '').trim(),
    ].join('|');
  }

  /* ── Adathozzáférés-ellenőrzés ───────────────
     Ha Supabase konfigurálva van, de nincs bejelentkezett felhasználó,
     a személyes adatok nem olvashatók / írhatók.
     Offline módban (Supabase nincs konfigurálva) minden elérhető. */
  function _canRead() {
    try {
      if (!window.App?.Supabase?.isConfigured) return true; // offline mód
      return !!window.App?.Auth?.isLoggedIn;
    } catch (e) { return true; }
  }
  function _canWrite() { return _canRead(); }

  /* ══════════════════════════════════════════
     SYMPTOMS LOG
  ══════════════════════════════════════════ */
  async function saveSymptomsLog(entry) {
    if (!_canWrite()) return null;
    await open();
    const record = {
      ...entry,
      sync_id:    entry.sync_id    || _genSyncId(),
      created_at: entry.created_at || new Date().toISOString(),
      date:       entry.date       || App.DATA.todayISO(),
    };

    /* ÚJ bejegyzésnél tartalom-duplikátum ellenőrzés:
       ha pontosan ugyanilyen bejegyzés már létezik, nem mentjük újra */
    if (!record.id) {
      const all = await getAll('symptoms_log');
      const fp  = _logFingerprint(record);
      const dup = all.find(e => _logFingerprint(e) === fp);
      if (dup) return dup.id;
    }

    const store = tx('symptoms_log', 'readwrite');
    let result;
    if (record.id) {
      result = await promisify(store.put(record));
    } else {
      delete record.id;
      result = await promisify(store.add(record));
    }
    /* Cloud push – fire & forget */
    App.CloudSync?.pushSymptomLog?.(record);
    return result;
  }

  /* Felhőből visszaállított napló mentése – nem triggerel push-t.
     Tartalom-duplikátum esetén (más sync_id, azonos adat) nem ment. */
  async function saveSymptomsLogFromCloud(entry) {
    await open();
    const all = await getAll('symptoms_log');
    const fp  = _logFingerprint(entry);
    if (all.some(e => _logFingerprint(e) === fp)) return null;
    const store  = tx('symptoms_log', 'readwrite');
    const record = { ...entry };
    delete record.id;
    return promisify(store.add(record));
  }

  /* ── Visszamenőleges tünetnapló-deduplikáció ──
     Azonos tartalmú bejegyzésekből csak egyet tart meg
     (előnyben: sync_id-vel rendelkező, legrégebbi).
     Visszaadja a törölt rekordok sync_id-jait is, hogy a
     felhőből is törölhetők legyenek. */
  async function deduplicateSymptomsLog() {
    await open();
    const all = await getAll('symptoms_log');
    const groups = {};
    all.forEach(e => {
      const fp = _logFingerprint(e);
      if (!groups[fp]) groups[fp] = [];
      groups[fp].push(e);
    });

    const store = tx('symptoms_log', 'readwrite');
    let removed = 0;
    const removedSyncIds = [];

    for (const recs of Object.values(groups)) {
      if (recs.length <= 1) continue;
      /* Megtartandó: sync_id-s előnyben, azon belül legkisebb id */
      recs.sort((a, b) => {
        if (!!a.sync_id !== !!b.sync_id) return a.sync_id ? -1 : 1;
        return (a.id ?? 0) - (b.id ?? 0);
      });
      const keep = recs[0];
      for (let i = 1; i < recs.length; i++) {
        await promisify(store.delete(recs[i].id));
        removed++;
        if (recs[i].sync_id && recs[i].sync_id !== keep.sync_id) {
          removedSyncIds.push(recs[i].sync_id);
        }
      }
    }
    return { removed, removedSyncIds };
  }

  async function getSymptomsLogs(dateFrom, dateTo) {
    if (!_canRead()) return [];
    await open();
    const store = tx('symptoms_log');
    const idx   = store.index('date');
    const range = IDBKeyRange.bound(dateFrom || '0000-00-00', dateTo || '9999-99-99');
    const all   = await promisify(idx.getAll(range));
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }

  async function getRecentLogs(limit = 10) {
    if (!_canRead()) return [];
    const all = await getAll('symptoms_log');
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }

  async function getSymptomsLogById(id) {
    if (!_canRead()) return null;
    await open();
    return promisify(tx('symptoms_log').get(id));
  }

  async function deleteSymptomsLog(id) {
    if (!_canWrite()) return null;
    await open();
    return promisify(tx('symptoms_log', 'readwrite').delete(id));
  }

  /* ══════════════════════════════════════════
     POLLEN DATA
  ══════════════════════════════════════════ */

  /* ── Történelmi adatok mentése (átlagolással) ─────────────────────────
     Ha ugyanaz a (dátum|helyszín|allergén) kombináció már létezik,
     a kockázati szinteket átlagoljuk.
     Forrás-dedulikáció: ha ugyanaz a forrás (source) már mentett
     ugyanarra a kombinációra, NEM mentjük újra. */
  async function savePollenData(entries) {
    await open();
    const allExisting = await getAll('pollen_data');
    /* Index: "date|location|allergen_id" → [records] */
    const existingMap = {};
    allExisting.forEach(e => {
      const key = `${e.date}|${e.location}|${e.allergen_id}`;
      if (!existingMap[key]) existingMap[key] = [];
      existingMap[key].push(e);
    });

    const store = tx('pollen_data', 'readwrite');
    const now   = new Date().toISOString();
    const promises = [];
    const seenInBatch = new Set();   /* batch-en belüli duplikátumok kiszűrése */

    for (const entry of entries) {
      const key      = `${entry.date}|${entry.location}|${entry.allergen_id}`;
      const existing = existingMap[key] || [];
      const src      = (entry.source || '').toLowerCase();

      /* Batch-dedulikáció: ugyanaz a kulcs egy híváson belül csak egyszer */
      if (seenInBatch.has(key)) continue;
      seenInBatch.add(key);

      /* Forrás-dedulikáció: ha ugyanez a forrás már benne van, skip */
      if (src && existing.some(e => (e.source || '').toLowerCase() === src)) {
        continue;
      }

      if (existing.length === 0) {
        const record = { ...entry, created_at: now };
        delete record.id;
        promises.push(promisify(store.add(record)));
      } else {
        /* Különböző forrásból érkező adat → átlagolás */
        const allVals  = [...existing, entry];
        const avgRisk  = Math.round(allVals.reduce((s, e) => s + (e.risk_level || 0), 0) / allVals.length);
        const avgConc  = allVals.reduce((s, e) => s + (e.concentration || 0), 0) / allVals.length;
        const base     = existing[0];
        if (base.risk_level !== avgRisk || Math.abs((base.concentration || 0) - avgConc) > 0.01) {
          promises.push(promisify(store.put({ ...base, risk_level: avgRisk, concentration: avgConc, updated_at: now })));
        }
        for (let i = 1; i < existing.length; i++) {
          promises.push(promisify(store.delete(existing[i].id)));
        }
      }
    }
    return Promise.all(promises);
  }

  /* ── Előrejelzési adatok mentése (felülírással) ───────────────────────
     A forecast adatok mindig frissek / pontosak, ezért ha ugyanaz a
     (dátum|helyszín|allergén) kombináció már létezik, FELÜLÍRJUK,
     nem átlagoljuk. Így az új előrejelzés mindig pontos lesz. */
  async function savePollenDataForecast(entries) {
    await open();
    const allExisting = await getAll('pollen_data');
    const existingMap = {};
    allExisting.forEach(e => {
      const key = `${e.date}|${e.location}|${e.allergen_id}`;
      if (!existingMap[key]) existingMap[key] = [];
      existingMap[key].push(e);
    });

    const store = tx('pollen_data', 'readwrite');
    const now   = new Date().toISOString();
    const promises = [];
    const seenInBatch = new Set();   /* batch-en belüli duplikátumok kiszűrése */

    for (const entry of entries) {
      const key      = `${entry.date}|${entry.location}|${entry.allergen_id}`;
      const existing = existingMap[key] || [];

      if (seenInBatch.has(key)) continue;
      seenInBatch.add(key);

      if (existing.length === 0) {
        const record = { ...entry, created_at: now };
        delete record.id;
        promises.push(promisify(store.add(record)));
      } else {
        /* Felülírás: az első rekordot frissítjük az új adattal */
        const updated = { ...existing[0], ...entry, updated_at: now };
        delete updated.created_at;  /* eredeti létrehozási idő megmarad */
        promises.push(promisify(store.put(updated)));
        /* Duplikátumok törlése */
        for (let i = 1; i < existing.length; i++) {
          promises.push(promisify(store.delete(existing[i].id)));
        }
      }
    }
    return Promise.all(promises);
  }

  async function getPollenData(dateFrom, dateTo) {
    await open();
    const store = tx('pollen_data');
    const idx   = store.index('date');
    const from  = dateFrom || '0000-00-00';
    const to    = dateTo   || '9999-99-99';
    const range = IDBKeyRange.bound(from, to);
    const all   = await promisify(idx.getAll(range));
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }

  async function getLatestPollenData() {
    const all = await getAll('pollen_data');
    if (!all.length) return [];
    /* Only return today or the most recent PAST date (ignore future forecast rows) */
    const todayISO = new Date().toISOString().split('T')[0];
    const past = all.filter(r => r.date <= todayISO);
    if (!past.length) return [];
    past.sort((a, b) => b.date.localeCompare(a.date));
    const latestDate = past[0].date;
    return past.filter(r => r.date === latestDate);
  }

  /* Alias – external callers (pollenData.js, forecast button) use this name */
  const savePollenEntries = savePollenData;

  async function deletePollenData(id) {
    await open();
    return promisify(tx('pollen_data', 'readwrite').delete(id));
  }

  async function clearPollenData() {
    await open();
    return promisify(tx('pollen_data', 'readwrite').clear());
  }

  /* Pollenadatok exportálása JSON-ba */
  async function exportPollenData() {
    const pollen = await getAll('pollen_data');
    return {
      version: 1,
      exported_at: new Date().toISOString(),
      pollen_data: pollen,
    };
  }

  /* Pollenadatok importálása (meglévőkhöz adja hozzá, deduplikálva) */
  async function importPollenData(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.pollen_data)) {
      throw new Error('Érvénytelen pollen export fájl');
    }
    await savePollenData(data.pollen_data);
  }

  /* Meglévő duplikátumok törlése a pollen_data store-ból */
  async function deduplicatePollenData() {
    await open();
    const all = await getAll('pollen_data');
    /* Index: "date|location|allergen_id" → [rekordok] */
    const groups = {};
    all.forEach(e => {
      const key = `${e.date}|${e.location}|${e.allergen_id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    const store = tx('pollen_data', 'readwrite');
    const now   = new Date().toISOString();
    let removed = 0;

    for (const [, recs] of Object.entries(groups)) {
      if (recs.length <= 1) continue;
      /* Átlagolás */
      const avgRisk = Math.round(recs.reduce((s, e) => s + (e.risk_level || 0), 0) / recs.length);
      const avgConc = recs.reduce((s, e) => s + (e.concentration || 0), 0) / recs.length;
      /* Legjobb rekord frissítése */
      const keep = { ...recs[0], risk_level: avgRisk, concentration: avgConc, updated_at: now };
      await promisify(store.put(keep));
      /* Többi törlése */
      for (let i = 1; i < recs.length; i++) {
        await promisify(store.delete(recs[i].id));
        removed++;
      }
    }
    return removed;
  }

  /* ══════════════════════════════════════════
     ALLERGEN PROFILE
  ══════════════════════════════════════════ */
  async function saveAllergenProfile(entry) {
    if (!_canWrite()) return null;
    await open();
    const result = await promisify(tx('allergen_profile', 'readwrite').put(entry));
    /* Debounced cloud push */
    App.CloudSync?.pushAllergenProfile?.();
    return result;
  }

  async function getAllergenProfile() {
    if (!_canRead()) return [];
    return getAll('allergen_profile');
  }

  async function deleteAllergenProfile(allergenId) {
    if (!_canWrite()) return null;
    await open();
    return promisify(tx('allergen_profile', 'readwrite').delete(allergenId));
  }

  /* ══════════════════════════════════════════
     SETTINGS
  ══════════════════════════════════════════ */
  async function setSetting(key, value) {
    await open();
    return promisify(tx('settings', 'readwrite').put({ key, value }));
  }

  async function getSetting(key, defaultValue = null) {
    await open();
    const r = await promisify(tx('settings').get(key));
    return r ? r.value : defaultValue;
  }

  async function getAllSettings() {
    const all = await getAll('settings');
    return Object.fromEntries(all.map(s => [s.key, s.value]));
  }

  /* ══════════════════════════════════════════
     MEDICATIONS
  ══════════════════════════════════════════ */
  async function getMedications() {
    if (!_canRead()) return [];
    const stored = await getAll('medications');
    const storedNames = stored.map(m => m.name);
    /* Merge defaults */
    const defaults = App.DATA.MEDICATIONS
      .filter(n => !storedNames.includes(n))
      .map(n => ({ name: n, active: false }));
    return [...stored, ...defaults];
  }

  async function saveMedication(med) {
    if (!_canWrite()) return null;
    await open();
    const store = tx('medications', 'readwrite');
    if (med.id) return promisify(store.put(med));
    const { id: _, ...rest } = med;
    return promisify(store.add(rest));
  }

  async function deleteMedication(id) {
    if (!_canWrite()) return null;
    await open();
    return promisify(tx('medications', 'readwrite').delete(id));
  }

  /* ══════════════════════════════════════════
     ANALYTICS HELPERS
  ══════════════════════════════════════════ */
  async function getSymptomFrequency(days = 30) {
    if (!_canRead()) return {};
    const from = new Date();
    from.setDate(from.getDate() - days);
    const logs  = await getSymptomsLogs(from.toISOString().split('T')[0]);
    const freq  = {};
    logs.forEach(log => {
      (log.symptoms || []).forEach(sym => {
        freq[sym.id] = (freq[sym.id] || 0) + 1;
      });
    });
    return freq;
  }

  async function getDailySeverity(days = 30) {
    if (!_canRead()) return {};
    const from = new Date();
    from.setDate(from.getDate() - days);
    const logs = await getSymptomsLogs(from.toISOString().split('T')[0]);
    const map = {};
    logs.forEach(log => {
      if (!map[log.date] || map[log.date] < (log.overall_severity || 0)) {
        map[log.date] = log.overall_severity || 0;
      }
    });
    return map;
  }

  /* ══════════════════════════════════════════
     EXPORT / IMPORT / CLEAR
  ══════════════════════════════════════════ */
  async function exportAll() {
    const [logs, pollen, profile, settings, meds] = await Promise.all([
      getAll('symptoms_log'),
      getAll('pollen_data'),
      getAll('allergen_profile'),
      getAll('settings'),
      getAll('medications'),
    ]);
    return {
      version: 1,
      exported_at: new Date().toISOString(),
      symptoms_log: logs,
      pollen_data: pollen,
      allergen_profile: profile,
      settings,
      medications: meds,
    };
  }

  async function importAll(data) {
    if (!data || data.version !== 1) throw new Error('Érvénytelen export fájl');
    await open();

    async function importStore(storeName, rows) {
      if (!rows || !rows.length) return;
      const store = tx(storeName, 'readwrite');
      await promisify(store.clear());
      for (const row of rows) {
        const { id: _, ...rest } = row;
        const clean = storeName === 'allergen_profile' ? row : rest;
        await promisify(store.add(clean));
      }
    }

    await importStore('symptoms_log',   data.symptoms_log);
    await importStore('pollen_data',    data.pollen_data);
    await importStore('settings',       data.settings);
    await importStore('medications',    data.medications);

    /* Profile uses natural key */
    if (data.allergen_profile?.length) {
      const store = tx('allergen_profile', 'readwrite');
      await promisify(store.clear());
      for (const row of data.allergen_profile) {
        await promisify(store.put(row));
      }
    }

    /* Import utáni deduplikáció: a fájlon belüli duplikátumok eltávolítása */
    await deduplicateSymptomsLog();
    await deduplicatePollenData();
  }

  async function clearAllData() {
    await open();
    const stores = ['symptoms_log', 'pollen_data', 'allergen_profile', 'medications'];
    for (const s of stores) {
      await promisify(tx(s, 'readwrite').clear());
    }
  }

  /* ── Public API ─────────────────────────── */
  return {
    init: open,
    /* Log */
    saveSymptomsLog, saveSymptomsLogFromCloud,
    getSymptomsLogs, getRecentLogs,
    getSymptomsLogById, deleteSymptomsLog,
    deduplicateSymptomsLog,
    /* Pollen */
    savePollenData, savePollenEntries, savePollenDataForecast,
    getPollenData, getLatestPollenData,
    deletePollenData, clearPollenData,
    exportPollenData, importPollenData, deduplicatePollenData,
    /* Profile */
    saveAllergenProfile, getAllergenProfile, deleteAllergenProfile,
    /* Settings */
    setSetting, getSetting, getAllSettings,
    /* Medications */
    getMedications, saveMedication, deleteMedication,
    /* Analytics */
    getSymptomFrequency, getDailySeverity,
    /* Data management */
    exportAll, importAll, clearAllData,
  };
})();
