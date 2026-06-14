/* ═══════════════════════════════════════════
   AllergyTrack – Online Pollen Data Fetcher
   Sources:
     1. Open-Meteo Air Quality API (CAMS model)
        → per-city, 5 key allergen types
        → free, JSON, no CORS issues
     2. NNK (Nemzeti Népegészségügyi Központ)
        → national (Magyarország) level
        → additional allergen types not in Open-Meteo
        → replaces defunct efop180.antsz.hu
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.PollenFetcher = {

  /* ── Admin: kollektív (publikus) pollen feltöltő fiók ─────────────────────
     CSAK ez a fiók tölthet fel megosztott pollenadatot a szerverre.
     Minden más fiók kizárólag LETÖLTI a publikus adatokat (pullFromSupabase). */
  ADMIN_EMAIL: 'wagnergaborwagner503@gmail.com',

  /* Gmail-normalizálás: a pontok és a "+címke" elhagyása, kisbetűsítés –
     így a "wagnergaborwagner.503@gmail.com" és a pont nélküli alak is egyezik. */
  _normalizeEmail(email) {
    if (!email) return '';
    let [local, domain] = String(email).toLowerCase().trim().split('@');
    if (!domain) return local || '';
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      local  = local.split('+')[0].replace(/\./g, '');
      domain = 'gmail.com';
    }
    return `${local}@${domain}`;
  },

  /* Igaz, ha a bejelentkezett fiók az admin (a kollektív pollen feltöltője). */
  isAdmin() {
    const email = App.Auth?.email;
    return !!email && this._normalizeEmail(email) === this._normalizeEmail(this.ADMIN_EMAIL);
  },

  /* ── Hungarian monitoring cities ─────────── */
  CITIES: [
    { name: 'Budapest',        lat: 47.50, lon: 19.08 },
    { name: 'Debrecen',        lat: 47.53, lon: 21.63 },
    { name: 'Pécs',            lat: 46.08, lon: 18.23 },
    { name: 'Győr',            lat: 47.68, lon: 17.63 },
    { name: 'Miskolc',         lat: 48.10, lon: 20.78 },
    { name: 'Nyíregyháza',     lat: 47.95, lon: 21.72 },
    { name: 'Szeged',          lat: 46.25, lon: 20.15 },
    { name: 'Kecskemét',       lat: 46.90, lon: 19.69 },
    { name: 'Szombathely',     lat: 47.23, lon: 16.62 },
    { name: 'Eger',            lat: 47.90, lon: 20.38 },
    { name: 'Veszprém',        lat: 47.09, lon: 17.91 },
    { name: 'Kaposvár',        lat: 46.37, lon: 17.79 },
    { name: 'Zalaegerszeg',    lat: 46.84, lon: 16.84 },
    { name: 'Szolnok',         lat: 47.18, lon: 20.20 },
    { name: 'Tatabánya',       lat: 47.57, lon: 18.40 },
    { name: 'Székesfehérvár',  lat: 47.19, lon: 18.41 },
    { name: 'Szekszárd',       lat: 46.35, lon: 18.71 },
    { name: 'Békéscsaba',      lat: 46.68, lon: 21.10 },
  ],

  /* Open-Meteo variable name → allergen_id */
  OM_VARS: {
    alder_pollen:   'alnus',      /* Éger */
    birch_pollen:   'betula',     /* Nyír */
    grass_pollen:   'poaceae',    /* Pázsitfűfélék */
    mugwort_pollen: 'artemisia',  /* Üröm */
    olive_pollen:   'olea',       /* Olajfa */
    ragweed_pollen: 'ambrosia',   /* Parlagfű */
    pm10:           'pm10',       /* Szálló por PM10 */
  },

  /* ÁNTSZ Hungarian name → allergen_id */
  NAME_MAP: {
    'Parlagfű':                             'ambrosia',
    'Pázsitfűfélék':                        'poaceae',
    'Nyír':                                 'betula',
    'Éger':                                 'alnus',
    'Mogyoró':                              'corylus',
    'Ciprusfélék és tiszafafélék':          'cupressus',
    'Ciprusfélék':                          'cupressus',
    'Kőris':                                'fraxinus',
    'Nyár':                                 'populus',
    'Nyárfa':                               'populus',
    'Juhar':                                'acer',
    'Gyertyán':                             'carpinus',
    'Platán':                               'platanus',
    'Tölgy':                                'quercus',
    'Dió':                                  'juglans',
    'Bükk':                                 'fagus',
    'Bükkfa':                               'fagus',
    'Eperfafélék':                          'moraceae',
    'Fenyőfélék':                           'pinaceae',
    'Csalánfélék':                          'urtica',
    'Útifű':                                'plantago',
    'Lórom':                                'rumex',
    'Disznóparéj- és libatopfélék':         'chenopodium',
    'Libatop':                              'chenopodium',
    'Üröm':                                 'artemisia',
    'Alternaria':                           'alternaria',
    'Vadgesztenye':                         'aesculus',
    'Bodza':                                'sambucus',
    'Olajfa':                               'olea',
    'Olívafa':                              'olea',
  },

  /* Allergen types covered by Open-Meteo (skip these from ÁNTSZ to avoid duplicates) */
  _omAllergenIds: null,
  _getOmAllergenIds() {
    if (!this._omAllergenIds) this._omAllergenIds = new Set(Object.values(this.OM_VARS));
    return this._omAllergenIds;
  },

  /* ── Concentration (grains/m³) → risk level 0-4 ──
     Thresholds calibrated for CAMS European model output.
     CAMS values are ~5-10× lower than physical trap counts.
     Maps to: 0=Nincs 1=Alacsony 2=Közepes 3=Magas 4=Extrém */
  _concentrationToRisk(grains) {
    if (!grains || grains < 0.3) return 0;   /* Nincs    */
    if (grains < 5)              return 1;   /* Alacsony */
    if (grains < 20)             return 2;   /* Közepes  */
    if (grains < 60)             return 3;   /* Magas    */
    return 4;                                /* Extrém   */
  },

  /* ── PM10 (µg/m³) → risk level 0-4 ──────────
     WHO 24h guideline: 15 µg/m³ · EU limit: 50 µg/m³
     Maps to: 0=Nincs 1=Alacsony 2=Közepes 3=Magas 4=Extrém */
  _pm10ToRisk(ugm3) {
    if (!ugm3 || ugm3 < 10)  return 0;   /* Nincs    */
    if (ugm3 < 25)            return 1;   /* Alacsony */
    if (ugm3 < 50)            return 2;   /* Közepes  */
    if (ugm3 < 100)           return 3;   /* Magas    */
    return 4;                             /* Extrém   */
  },

  /* ── Main entry point ───────────────────── */

  async fetchLatest() {
    const today   = App.DATA.todayISO();
    const entries = [];
    const errors  = [];

    /* 1. Open-Meteo: per-city, 5 allergen types (past + forecast) */
    try {
      const cityEntries = await this._fetchOpenMeteo(today);
      entries.push(...cityEntries);
    } catch (e) {
      errors.push('Open-Meteo: ' + e.message);
      console.warn('Open-Meteo fetch failed:', e);
    }

    /* 2. ÁNTSZ: national-level data for allergens NOT covered by Open-Meteo */
    try {
      const antsz = await this._fetchANTSZ(today);
      const omCovered = this._getOmAllergenIds();
      entries.push(...antsz.filter(e => !omCovered.has(e.allergen_id)));
    } catch (e) {
      errors.push('ÁNTSZ: ' + e.message);
      console.warn('ÁNTSZ fetch failed:', e);
    }

    if (entries.length === 0 && errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    /* ── Szétválasztás: múltbeli (átlagolás) vs. jövőbeli (felülírás) ──
       A forecast adatok mindig frissek / pontosak, ezért felülírjuk
       a meglévő előrejelzési sorokat, nem átlagoljuk.                    */
    const historical = entries.filter(e => e.date <= today);
    const forecast   = entries.filter(e => e.date >  today);

    await App.db.savePollenData(historical);
    if (forecast.length > 0) {
      await App.db.savePollenDataForecast(forecast);
    }

    const cities    = [...new Set(entries.filter(e => e.location !== 'Magyarország').map(e => e.location))];
    const allergens = [...new Set(entries.map(e => e.allergen_id))];

    return {
      date:   today,
      entries,
      source: [
        cities.length > 0 ? `Open-Meteo (${cities.length} város)` : '',
        entries.some(e => e.location === 'Magyarország') ? 'ÁNTSZ' : '',
      ].filter(Boolean).join(' + ') || 'Ismeretlen',
      stats: {
        cities:    cities.length,
        allergens: allergens.length,
        total:     entries.length,
        cityList:  cities,
      },
    };
  },

  /* ── Open-Meteo fetch ─────────────────────────────────
     Queries all CITIES in parallel.
     Parameters: past_days=3 + forecast_days=5 + current=
     Returns one entry per (date × city × allergen).
     PM10 uses a separate µg/m³ risk scale. */
  async _fetchOpenMeteo(_todayISO) {
    const vars = Object.keys(this.OM_VARS).join(',');
    const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

    const results = await Promise.allSettled(
      this.CITIES.map(city =>
        fetch(
          `${BASE}?latitude=${city.lat}&longitude=${city.lon}` +
          `&hourly=${vars}&current=${vars}` +
          `&timezone=Europe%2FBudapest&past_days=3&forecast_days=5`,
          { signal: AbortSignal.timeout(15000) }
        )
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => ({ city, data }))
      )
    );

    const entries    = [];
    const omVarNames = Object.keys(this.OM_VARS);

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const { city, data } = result.value;
      if (!data?.hourly?.time) continue;

      const times = data.hourly.time;   /* ["2026-05-25T00:00", ...] */

      /* Group hourly values by calendar date */
      const byDate = {};
      times.forEach((t, i) => {
        const d = t.substring(0, 10);   /* 'YYYY-MM-DD' */
        if (!byDate[d]) byDate[d] = {};
        for (const omVar of omVarNames) {
          if (!byDate[d][omVar]) byDate[d][omVar] = [];
          const v = data.hourly[omVar]?.[i];
          if (v !== null && v !== undefined) byDate[d][omVar].push(v);
        }
      });

      /* One entry per (date × allergen) – daily maximum concentration */
      for (const [entryDate, dayData] of Object.entries(byDate)) {
        for (const omVar of omVarNames) {
          const vals = dayData[omVar];
          if (!vals || vals.length === 0) continue;

          const maxConc = Math.max(...vals);
          const isPM10  = omVar === 'pm10';
          const risk    = isPM10
            ? this._pm10ToRisk(maxConc)
            : this._concentrationToRisk(maxConc);

          entries.push({
            date:          entryDate,
            allergen_id:   this.OM_VARS[omVar],
            location:      city.name,
            risk_level:    risk,
            concentration: maxConc,
            unit:          isPM10 ? 'µg/m³' : 'grains/m³',
            source:        'Open-Meteo',
          });
        }
      }
    }

    return entries;
  },

  /* ── NNK / ÁNTSZ pollen fetch ──────────────
     Tries ÁNTSZ efop180 first (structured HTML, easiest to parse),
     then NNK pollenjelentés page as fallback. */
  async _fetchANTSZ(date) {
    const URLS = [
      'https://efop180.antsz.hu/polleninformaciok.html',
      'https://efop180.antsz.hu/polleninformaciok',
      'https://nnk.gov.hu/index.php/kornyezetegugy/256-kornyezetegeszsegugyi-laboratoriumi-osztaly/levegohigienes-laboratorium/lakossagi-tajekoztato-tartalmak/polleninformaciok-megjelenitese/1237-napi-pollenjelentes.html',
    ];
    let lastErr;
    for (const url of URLS) {
      try {
        const html = await this._fetchHTML(url);
        const entries = this._parseANTSZ(html, date);
        if (entries.length > 0) return entries;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Minden NNK/ÁNTSZ forrás elérhetetlen');
  },

  /* ── ÁNTSZ holnapi előrejelzés ─────────────── */
  async fetchForecast() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split('T')[0];
    const URLS = [
      'https://efop180.antsz.hu/polleninformaciok-holnap.html',
      'https://efop180.antsz.hu/polleninformaciok-holnap',
    ];
    let lastErr;
    for (const url of URLS) {
      try {
        const html    = await this._fetchHTML(url);
        const entries = this._parseANTSZ(html, date);
        if (entries.length > 0) return { date, entries, source: 'ÁNTSZ előrejelzés' };
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('Holnapi előrejelzés nem elérhető');
  },

  /* ── HTML fetching with CORS proxy fallback */
  async _fetchHTML(url) {
    /* 1. Try direct fetch (works in Capacitor APK native WebView) */
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(7000), cache: 'no-store' });
      if (r.ok) { const t = await r.text(); if (t.length > 500) return t; }
    } catch (_) {}

    /* 2. allorigins proxy */
    try {
      const r = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (r.ok) { const t = await r.text(); if (t.length > 500) return t; }
    } catch (_) {}

    /* 3. corsproxy.io */
    const r = await fetch(
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  },

  /* ── ÁNTSZ HTML parser ──────────────────── */
  _parseANTSZ(html, date) {
    const doc     = new DOMParser().parseFromString(html, 'text/html');
    const entries = [];

    /* Strategy 1: find allergen links */
    const links  = doc.querySelectorAll('a[href*="allergen-pollenado-novenyeink"]');
    const seen   = new Set();

    links.forEach(link => {
      const name = link.textContent.trim();
      if (!name || seen.has(name) || name.length < 3) return;
      if (!name.match(/[a-záéíóöőúüűA-ZÁÉÍÓÖŐÚÜŰ]/)) return;
      seen.add(name);

      const level     = this._findRiskLevel(link);
      if (level === null) return;
      const allergenId = this._mapName(name);
      if (!allergenId) return;

      entries.push({
        date, allergen_id: allergenId,
        location: 'Magyarország',
        concentration: 0, unit: '',
        risk_level: Math.min(4, level), source: 'NNK/ÁNTSZ',
      });
    });

    /* Strategy 2: regex fallback */
    if (entries.length === 0) {
      const rx = /allergen-pollenado-novenyeink[^"]*">([^<]{3,50})<\/a>[\s\S]{0,200}?(\d)/g;
      let m;
      const seenFb = new Set();
      while ((m = rx.exec(html)) !== null) {
        const name  = m[1].trim();
        const level = parseInt(m[2]);
        if (seenFb.has(name) || level > 4) continue;
        seenFb.add(name);
        const allergenId = this._mapName(name);
        if (!allergenId) continue;
        entries.push({
          date, allergen_id: allergenId,
          location: 'Magyarország',
          concentration: 0, unit: '',
          risk_level: Math.min(4, level), source: 'NNK/ÁNTSZ',
        });
      }
    }

    return entries;
  },

  /* Walk siblings/parents to find a nearby risk digit (0-4) */
  _findRiskLevel(linkEl) {
    let el = linkEl.nextSibling;
    for (let i = 0; i < 10 && el; i++) {
      const text = el.textContent?.trim();
      if (text && /^\d$/.test(text)) return parseInt(text);
      if (el.nodeType === 1) {
        const inner = el.textContent?.trim();
        if (inner && /^\d$/.test(inner)) return parseInt(inner);
      }
      el = el.nextSibling;
    }
    const parent = linkEl.parentElement;
    if (!parent) return null;
    let sib = parent.nextElementSibling;
    for (let i = 0; i < 5 && sib; i++) {
      const text = sib.textContent?.trim();
      if (text && /^\d+$/.test(text) && parseInt(text) <= 4) return parseInt(text);
      sib = sib.nextElementSibling;
    }
    const gp = parent?.parentElement;
    if (gp) {
      let gsib = gp.nextElementSibling;
      for (let i = 0; i < 3 && gsib; i++) {
        const text = gsib.textContent?.trim();
        if (text && /^\d$/.test(text)) return parseInt(text);
        gsib = gsib.nextElementSibling;
      }
    }
    return null;
  },

  /* ── fetchAll: fetchLatest + push to Supabase ────────────────────────────
     Ez az a metódus amit _syncOnLogin() hív. Letölti az Open-Meteo + ÁNTSZ
     adatokat, menti IndexedDB-be, majd feltölti a megosztott Supabase táblába
     hogy minden felhasználó lássa.                                            */
  async fetchAll() {
    try {
      const result = await this.fetchLatest();
      if (result?.entries?.length) {
        /* Push a megosztott táblába – csak admin fióknál fut le ténylegesen */
        this.pushToSupabase(result.entries).catch(() => {});
      }
      return result;
    } catch (e) {
      console.warn('[PollenFetcher] fetchAll hiba:', e.message ?? e);
      throw e;
    }
  },

  /* ── Megosztott pollen szinkron (app újranyitás / pull-to-refresh) ────────
     • Admin fiók: friss adatok letöltése a forrásokból + feltöltés a
       megosztott (publikus) szerver-táblába.
     • MINDEN fiók: a publikus pollenadatok letöltése a szerverről és
       hozzáadása a helyi adatbázishoz.
     Visszaadja a letöltött publikus sorok számát.                            */
  async syncShared() {
    try {
      /* Admin: friss adat a forrásokból + push a megosztott táblába.
         (Nem blokkolja a letöltést, ha a fetch hibázik.) */
      if (this.isAdmin()) {
        await this.fetchAll().catch(() => {});
      }
      /* Mindenki: publikus pollenadatok letöltése */
      return await this.pullFromSupabase();
    } catch (e) {
      console.warn('[PollenSync] syncShared hiba:', e.message ?? e);
      return 0;
    }
  },

  /* ── Supabase megosztott pollenadatok: feltöltés ─────────────────────────
     Ha be van jelentkezve a felhasználó, az éppen mentett pollenadatokat
     feltölti a shared_pollen_data táblába – így minden user látja.          */
  async pushToSupabase(entries) {
    const sb = App.Supabase?.get?.();
    if (!sb || !App.Auth?.isLoggedIn) return;
    /* Csak az admin fiók tölthet fel megosztott pollenadatot – minden más
       fiók kizárólag letölti a publikus adatokat (pullFromSupabase). */
    if (!this.isAdmin()) return;
    if (!entries?.length) return;

    try {
      const rows = entries.map(e => ({
        date:          e.date,
        location:      e.location,
        allergen_id:   e.allergen_id,
        concentration: e.concentration ?? null,
        unit:          e.unit ?? null,
        risk_level:    e.risk_level,
      }));

      const { error } = await sb
        .from('shared_pollen_data')
        .upsert(rows, { onConflict: 'date,location,allergen_id' });

      if (error) throw error;
      console.log(`[PollenSync] ${rows.length} sor feltöltve a shared_pollen_data táblába.`);
    } catch (e) {
      console.warn('[PollenSync] pushToSupabase hiba:', e);
    }
  },

  /* ── Supabase megosztott pollenadatok: letöltés ─────────────────────────
     Bejelentkezéskor (vagy manuálisan) letölti a legfrissebb megosztott
     pollenadatokat és elmenti IndexedDB-be.                                 */
  async pullFromSupabase() {
    const sb = App.Supabase?.get?.();
    if (!sb) return 0;

    try {
      const { data, error } = await sb
        .from('shared_pollen_data')
        .select('*')
        .order('date', { ascending: false })
        .limit(3000);

      if (error) {
        console.warn('[PollenSync] pullFromSupabase – Supabase hiba:', error.message, '| Kód:', error.code);
        console.warn('[PollenSync] TIPP: Futtasd le a shared_pollen_data SQL-t a Supabase SQL Editor-ban!');
        return 0;
      }
      if (!data?.length) {
        console.log('[PollenSync] A shared_pollen_data tábla üres – nincs letölteni való.');
        return 0;
      }

      await App.db.savePollenData(data);
      console.log(`[PollenSync] ${data.length} megosztott pollenadatat letöltve.`);

      /* UI frissítése ha a dashboard vagy pollen oldalon vagyunk */
      const page = App._currentPage;
      if (page === 'dashboard' || page === 'pollen') {
        App.navigate(page).catch(() => {});
      }

      return data.length;
    } catch (e) {
      console.warn('[PollenSync] pullFromSupabase hiba:', e.message ?? e);
      return 0;
    }
  },

  /* Map a Hungarian plant name to an allergen_id */
  _mapName(name) {
    if (this.NAME_MAP[name]) return this.NAME_MAP[name];
    for (const [key, id] of Object.entries(this.NAME_MAP)) {
      if (name.includes(key) || key.includes(name)) return id;
    }
    const all = [
      ...(App.DATA?.ALLERGENS?.seasonal || []),
      ...(App.DATA?.ALLERGENS?.general  || []),
    ];
    return all.find(a =>
      a.name.toLowerCase() === name.toLowerCase() ||
      (a.latinName && a.latinName.toLowerCase().includes(name.toLowerCase()))
    )?.id || null;
  },
};
