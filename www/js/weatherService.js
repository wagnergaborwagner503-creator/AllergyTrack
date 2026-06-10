/* ═══════════════════════════════════════════
   AllergyTrack – Weather Service
   Open-Meteo weather API (free, CORS-friendly)
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Weather = {
  _cache:     null,
  _cacheTime: 0,
  _TTL:       5 * 60 * 1000,   /* 5 perc */

  /* WMO weather code → { emoji, label } */
  WMO: {
    0:  { emoji:'☀️',  label:'Derült' },
    1:  { emoji:'🌤️', label:'Enyhén felhős' },
    2:  { emoji:'⛅',  label:'Részben felhős' },
    3:  { emoji:'☁️',  label:'Borult' },
    45: { emoji:'🌫️', label:'Köd' },
    48: { emoji:'🌫️', label:'Ónos köd' },
    51: { emoji:'🌦️', label:'Gyenge szemcsézet' },
    53: { emoji:'🌦️', label:'Mérsékelt szemcsézet' },
    55: { emoji:'🌧️', label:'Erős szemcsézet' },
    61: { emoji:'🌧️', label:'Gyenge eső' },
    63: { emoji:'🌧️', label:'Mérsékelt eső' },
    65: { emoji:'🌧️', label:'Erős eső' },
    71: { emoji:'❄️',  label:'Gyenge havazás' },
    73: { emoji:'❄️',  label:'Mérsékelt havazás' },
    75: { emoji:'❄️',  label:'Erős havazás' },
    80: { emoji:'🌦️', label:'Gyenge záporok' },
    81: { emoji:'🌧️', label:'Mérsékelt záporok' },
    82: { emoji:'⛈️',  label:'Heves záporok' },
    85: { emoji:'🌨️', label:'Hózáporok' },
    95: { emoji:'⛈️',  label:'Zivatar' },
    96: { emoji:'⛈️',  label:'Zivatar jégesővel' },
    99: { emoji:'⛈️',  label:'Erős zivatar' },
  },

  _getWmo(code) {
    return this.WMO[code] || { emoji:'🌡️', label:'Ismeretlen' };
  },

  /* ── Fetch weather for lat/lon ───────────── */
  async fetch(lat, lon, forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this._cache && (now - this._cacheTime) < this._TTL) {
      return this._cache;
    }

    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,relative_humidity_2m,cloud_cover,precipitation,weathercode`
      + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,`
      + `precipitation_probability_max,cloud_cover_mean,relative_humidity_2m_mean`
      + `&hourly=temperature_2m,relative_humidity_2m,cloud_cover,precipitation_probability`
      + `&timezone=Europe%2FBudapest&forecast_days=7`;

    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();

      /* Current conditions */
      const cur  = data.current || {};
      const curW = this._getWmo(cur.weathercode);

      /* 7-day daily forecast */
      const daily = data.daily || {};
      const days  = (daily.time || []).map((d, i) => ({
        date:        d,
        wmoCode:     (daily.weathercode || [])[i] ?? 0,
        wmo:         this._getWmo((daily.weathercode || [])[i]),
        tempMax:     (daily.temperature_2m_max || [])[i],
        tempMin:     (daily.temperature_2m_min || [])[i],
        precip:      (daily.precipitation_sum  || [])[i] ?? 0,
        precipProb:  (daily.precipitation_probability_max || [])[i] ?? 0,
        cloudCover:  (daily.cloud_cover_mean    || [])[i] ?? 0,
        humidity:    (daily.relative_humidity_2m_mean || [])[i] ?? 0,
        /* Pollen wash factor: rain significantly reduces pollen exposure */
        pollenWashFactor: this._pollenWash((daily.precipitation_sum || [])[i] ?? 0,
                                           (daily.cloud_cover_mean  || [])[i] ?? 0),
      }));

      const result = {
        current: {
          temp:      cur.temperature_2m,
          humidity:  cur.relative_humidity_2m,
          cloudCover:cur.cloud_cover,
          precip:    cur.precipitation,
          wmoCode:   cur.weathercode,
          emoji:     curW.emoji,
          label:     curW.label,
        },
        days,
        fetchedAt: new Date().toISOString(),
      };

      this._cache     = result;
      this._cacheTime = now;

      /* Persist for offline / form auto-fill */
      App.db?.setSetting('weatherCache', result).catch(() => {});

      return result;
    } catch (err) {
      console.warn('[Weather] fetch error:', err);
      /* Fallback: cached DB value */
      const saved = await App.db?.getSetting('weatherCache', null).catch(() => null);
      return saved || null;
    }
  },

  /* ── Fetch using stored GPS location ─────── */
  async fetchForCurrentLocation(forceRefresh = false) {
    const loc = await App.db?.getSetting('userLocation', null).catch(() => null);
    if (!loc?.lat || !loc?.lon) return null;
    return this.fetch(loc.lat, loc.lon, forceRefresh);
  },

  /* ── Pollen wash factor ───────────────────
     Rain washes pollen off surfaces. Heavy rain
     can reduce outdoor pollen exposure by 60-80%.
     Returns multiplier 0.2–1.0.               */
  _pollenWash(precipMm, cloudPct) {
    if (precipMm > 10) return 0.2;   /* Heavy rain  → very little pollen */
    if (precipMm > 5)  return 0.4;   /* Moderate    */
    if (precipMm > 1)  return 0.65;  /* Light rain  */
    if (cloudPct > 80) return 0.85;  /* Overcast    */
    return 1.0;                       /* Dry / clear */
  },

  /* ── Get today's wash factor for a given date ─ */
  washFactorForDate(weatherData, dateISO) {
    if (!weatherData?.days) return 1.0;
    const day = weatherData.days.find(d => d.date === dateISO);
    return day?.pollenWashFactor ?? 1.0;
  },
};
