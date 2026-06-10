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

  /* ══════════════════════════════════════════
     SYMPTOMS LOG
  ══════════════════════════════════════════ */
  async function saveSymptomsLog(entry) {
    await open();
    const store = tx('symptoms_log', 'readwrite');
    const record = {
      ...entry,
      created_at: entry.created_at || new Date().toISOString(),
      date: entry.date || App.DATA.todayISO(),
    };
    if (record.id) {
      return promisify(store.put(record));
    }
    delete record.id;
    return promisify(store.add(record));
  }

  async function getSymptomsLogs(dateFrom, dateTo) {
    await open();
    const store = tx('symptoms_log');
    const idx   = store.index('date');
    const range = IDBKeyRange.bound(dateFrom || '0000-00-00', dateTo || '9999-99-99');
    const all   = await promisify(idx.getAll(range));
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }

  async function getRecentLogs(limit = 10) {
    const all = await getAll('symptoms_log');
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }

  async function getSymptomsLogById(id) {
    await open();
    return promisify(tx('symptoms_log').get(id));
  }

  async function deleteSymptomsLog(id) {
    await open();
    return promisify(tx('symptoms_log', 'readwrite').delete(id));
  }

  /* ══════════════════════════════════════════
     POLLEN DATA
  ══════════════════════════════════════════ */
  async function savePollenData(entries) {
    await open();
    const store = tx('pollen_data', 'readwrite');
    const promises = entries.map(e => {
      const record = { ...e, created_at: new Date().toISOString() };
      delete record.id;
      return promisify(store.add(record));
    });
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
    all.sort((a, b) => b.date.localeCompare(a.date));
    const latestDate = all[0].date;
    return all.filter(r => r.date === latestDate);
  }

  async function deletePollenData(id) {
    await open();
    return promisify(tx('pollen_data', 'readwrite').delete(id));
  }

  async function clearPollenData() {
    await open();
    return promisify(tx('pollen_data', 'readwrite').clear());
  }

  /* ══════════════════════════════════════════
     ALLERGEN PROFILE
  ══════════════════════════════════════════ */
  async function saveAllergenProfile(entry) {
    await open();
    return promisify(tx('allergen_profile', 'readwrite').put(entry));
  }

  async function getAllergenProfile() {
    return getAll('allergen_profile');
  }

  async function deleteAllergenProfile(allergenId) {
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
    const stored = await getAll('medications');
    const storedNames = stored.map(m => m.name);
    /* Merge defaults */
    const defaults = App.DATA.MEDICATIONS
      .filter(n => !storedNames.includes(n))
      .map(n => ({ name: n, active: false }));
    return [...stored, ...defaults];
  }

  async function saveMedication(med) {
    await open();
    const store = tx('medications', 'readwrite');
    if (med.id) return promisify(store.put(med));
    const { id: _, ...rest } = med;
    return promisify(store.add(rest));
  }

  async function deleteMedication(id) {
    await open();
    return promisify(tx('medications', 'readwrite').delete(id));
  }

  /* ══════════════════════════════════════════
     ANALYTICS HELPERS
  ══════════════════════════════════════════ */
  async function getSymptomFrequency(days = 30) {
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
    saveSymptomsLog, getSymptomsLogs, getRecentLogs,
    getSymptomsLogById, deleteSymptomsLog,
    /* Pollen */
    savePollenData, getPollenData, getLatestPollenData,
    deletePollenData, clearPollenData,
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
