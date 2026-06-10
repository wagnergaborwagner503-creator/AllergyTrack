/* ═══════════════════════════════════════════
   AllergyTrack – GPS Helymeghatározás
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.GeoLocation = {

  /* Magyar mérővárosok – azonos lista mint pollenFetcher.js CITIES */
  CITIES: [
    { name: 'Budapest',       lat: 47.50, lon: 19.08 },
    { name: 'Debrecen',       lat: 47.53, lon: 21.63 },
    { name: 'Pécs',           lat: 46.08, lon: 18.23 },
    { name: 'Győr',           lat: 47.68, lon: 17.63 },
    { name: 'Miskolc',        lat: 48.10, lon: 20.78 },
    { name: 'Nyíregyháza',    lat: 47.95, lon: 21.72 },
    { name: 'Szeged',         lat: 46.25, lon: 20.15 },
    { name: 'Kecskemét',      lat: 46.90, lon: 19.69 },
    { name: 'Szombathely',    lat: 47.23, lon: 16.62 },
    { name: 'Eger',           lat: 47.90, lon: 20.38 },
    { name: 'Veszprém',       lat: 47.09, lon: 17.91 },
    { name: 'Kaposvár',       lat: 46.37, lon: 17.79 },
    { name: 'Zalaegerszeg',   lat: 46.84, lon: 16.84 },
    { name: 'Szolnok',        lat: 47.18, lon: 20.20 },
    { name: 'Tatabánya',      lat: 47.57, lon: 18.40 },
    { name: 'Székesfehérvár', lat: 47.19, lon: 18.41 },
    { name: 'Szekszárd',      lat: 46.35, lon: 18.71 },
    { name: 'Békéscsaba',     lat: 46.68, lon: 21.10 },
  ],

  /* Haversine-távolság km-ben */
  _distance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  /* Legközelebbi város */
  _nearestCity(lat, lon) {
    let best = null, bestDist = Infinity;
    for (const c of this.CITIES) {
      const d = this._distance(lat, lon, c.lat, c.lon);
      if (d < bestDist) { bestDist = d; best = c; }
    }
    return { city: best, distanceKm: Math.round(bestDist) };
  },

  /* ── Fő belépési pont: inicializálás induláskor ── */
  async init() {
    /* Ha már van tárolt adat, ne kérdezze újra */
    const existing = await App.db.getSetting('userLocation', null);
    if (existing) return existing;

    /* Capacitor natív plugin – ha elérhető */
    if (window.Capacitor?.isNativePlatform?.() && window.Capacitor?.Plugins?.Geolocation) {
      return this._requestCapacitor();
    }
    /* Böngésző geolocation API (development / PWA) */
    if ('geolocation' in navigator) {
      return this._requestBrowser();
    }
    return null;
  },

  async _requestCapacitor() {
    try {
      const { Geolocation } = window.Capacitor.Plugins;
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') return null;
      const pos = await Geolocation.getCurrentPosition({ timeout: 10000, enableHighAccuracy: true });
      return this._saveAndReturn(pos.coords.latitude, pos.coords.longitude);
    } catch (e) {
      console.warn('[GeoLocation] Capacitor GPS hiba:', e);
      return null;
    }
  },

  _requestBrowser() {
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve(this._saveAndReturn(pos.coords.latitude, pos.coords.longitude)),
        err => { console.warn('[GeoLocation] Browser GPS hiba:', err); resolve(null); },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  },

  /* Nominatim reverse geocode – user tényleges városát adja vissza */
  async _reverseGeocode(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=hu`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!r.ok) return null;
      const d = await r.json();
      return d.address?.city || d.address?.town || d.address?.village || d.address?.municipality || null;
    } catch (e) {
      return null;
    }
  },

  async _saveAndReturn(lat, lon) {
    const { city, distanceKm } = this._nearestCity(lat, lon);
    /* Reverse geocode – nem blokkolja a mentést, párhuzamosan fut */
    const userCityName = await this._reverseGeocode(lat, lon).catch(() => null);
    const locationData = {
      lat, lon,
      userCity:    userCityName || city?.name || null,  /* tényleges város (Nominatim) */
      nearestCity: city?.name || null,                  /* legközelebbi pollen mérőállomás */
      distanceKm,
      timestamp: new Date().toISOString(),
    };
    await App.db.setSetting('userLocation', locationData);
    console.log(`[GeoLocation] ${userCityName || city?.name} → állomás: ${city?.name} (${distanceKm} km)`);
    return locationData;
  },

  /* ── Tárolt pozíció lekérése ─────────────────── */
  async getCurrent() {
    return App.db.getSetting('userLocation', null);
  },

  /* ── Pozíció frissítése kézzel ───────────────── */
  async refresh() {
    if (window.Capacitor?.isNativePlatform?.() && window.Capacitor?.Plugins?.Geolocation) {
      try {
        const { Geolocation } = window.Capacitor.Plugins;
        const pos = await Geolocation.getCurrentPosition({ timeout: 8000, enableHighAccuracy: false });
        return this._saveAndReturn(pos.coords.latitude, pos.coords.longitude);
      } catch (e) { /* fall through */ }
    }
    if ('geolocation' in navigator) {
      return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve(this._saveAndReturn(pos.coords.latitude, pos.coords.longitude)),
          () => resolve(null),
          { timeout: 8000, enableHighAccuracy: false }
        );
      });
    }
    return null;
  },

  /* ── Napi 3x helyzetnaplózás (reggel/délben/este) ─────────────
     Elmenti az aktuális pozíciót a 'locationHistory' beállításba.
     Egy napon belül legfeljebb 3 bejegyzés (reggel/dél/este).     */
  async logDailyPosition() {
    const loc = await App.GeoLocation.getCurrent();
    if (!loc?.nearestCity) return;

    const today = new Date().toISOString().split('T')[0];
    const hour  = new Date().getHours();
    const slot  = hour < 11 ? 'reggel' : hour < 15 ? 'dél' : 'este';

    const history = (await App.db.getSetting('locationHistory', [])) || [];
    /* Remove old entry for same date+slot */
    const filtered = history.filter(e => !(e.date === today && e.slot === slot));
    filtered.push({ date: today, slot, city: loc.nearestCity, lat: loc.lat, lon: loc.lon });
    /* Keep last 90 days × 3 slots = 270 entries max */
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 90);
    const cutISO = cutoff.toISOString().split('T')[0];
    const trimmed = filtered.filter(e => e.date >= cutISO);
    await App.db.setSetting('locationHistory', trimmed);
  },

  /* ── Adott naphoz legközelebbi mérőállomás ───────────────────── */
  async getCityForDate(dateISO) {
    const history = (await App.db.getSetting('locationHistory', [])) || [];
    const dayEntries = history.filter(e => e.date === dateISO);
    if (dayEntries.length === 0) return null;
    /* Use the most common city on that day */
    const freq = {};
    dayEntries.forEach(e => { freq[e.city] = (freq[e.city] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  },
};
