/* ═══════════════════════════════════════════
   AllergyTrack – Pollen Map Module
   Real Hungary county map via GeoJSON + canvas
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.PollenMap = {

  /* GeoJSON source (public, CORS-enabled) */
  GEOJSON_URL: 'https://raw.githubusercontent.com/wuerdo/geoHungary/master/counties.geojson',

  /* County name (GeoJSON property "megye") → nearest monitoring station key */
  COUNTY_STATION: {
    'Budapest':                 'BUDAPEST',
    'Pest':                     'BUDAPEST',
    'Baranya':                  'PÉCS',
    'Bács-Kiskun':              'KECSKEMÉT',
    'Békés':                    'BÉKÉSCSABA',
    'Borsod-Abaúj-Zemplén':    'MISKOLC',
    'Csongrád':                 'SZEGED',
    'Csongrád-Csanád':          'SZEGED',
    'Fejér':                    'SZÉKESFEHÉRVÁR',
    'Győr-Moson-Sopron':        'GYŐR',
    'Hajdú-Bihar':              'DEBRECEN',
    'Heves':                    'EGER',
    'Jász-Nagykun-Szolnok':     'SZOLNOK',
    'Komárom-Esztergom':        'TATABÁNYA',
    'Nógrád':                   'EGER',       /* no station → nearest */
    'Somogy':                   'KAPOSVÁR',
    'Szabolcs-Szatmár-Bereg':   'NYÍREGYHÁZA',
    'Tolna':                    'SZEKSZÁRD',
    'Vas':                      'SZOMBATHELY',
    'Veszprém':                 'VESZPRÉM',
    'Zala':                     'ZALAEGERSZEG',
  },

  /* Known station coordinates for marker dots */
  STATION_COORDS: {
    'BUDAPEST':       { lat: 47.50, lon: 19.08 },
    'DEBRECEN':       { lat: 47.53, lon: 21.63 },
    'PÉCS':           { lat: 46.08, lon: 18.23 },
    'GYŐR':           { lat: 47.68, lon: 17.63 },
    'MISKOLC':        { lat: 48.10, lon: 20.78 },
    'NYÍREGYHÁZA':    { lat: 47.95, lon: 21.72 },
    'SZEGED':         { lat: 46.25, lon: 20.15 },
    'KECSKEMÉT':      { lat: 46.90, lon: 19.69 },
    'SZOMBATHELY':    { lat: 47.23, lon: 16.62 },
    'EGER':           { lat: 47.90, lon: 20.38 },
    'VESZPRÉM':       { lat: 47.09, lon: 17.91 },
    'KAPOSVÁR':       { lat: 46.37, lon: 17.79 },
    'ZALAEGERSZEG':   { lat: 46.84, lon: 16.84 },
    'SZOLNOK':        { lat: 47.18, lon: 20.20 },
    'TATABÁNYA':      { lat: 47.57, lon: 18.40 },
    'SZÉKESFEHÉRVÁR': { lat: 47.19, lon: 18.41 },
    'SZEKSZÁRD':      { lat: 46.35, lon: 18.71 },
    'BÉKÉSCSABA':     { lat: 46.68, lon: 21.10 },
  },

  /* Hungary bounding box (with a little padding) */
  BOUNDS: { west: 16.00, east: 23.05, south: 45.60, north: 48.75 },

  /* Risk level colors (0–4 → [r,g,b] arrays) — matches RISK_LEVELS in data.js */
  RISK_COLORS: [
    [158, 158, 158],   /* 0 – nincs     (#9E9E9E) */
    [ 76, 175,  80],   /* 1 – alacsony  (#4CAF50) */
    [255, 152,   0],   /* 2 – közepes   (#FF9800) */
    [229,  57,  53],   /* 3 – magas     (#E53935) */
    [123,   0,   0],   /* 4 – extrém    (#7B0000) */
  ],
  NO_DATA_COLOR: [220, 225, 220],

  /* ── State ──────────────────────────────── */
  _geojson:          null,
  _canvas:           null,
  _ctx:              null,
  _currentAllergen:  null,
  _currentDate:      null,
  _allData:          [],
  _loading:          false,
  _userLat:          null,
  _userLon:          null,
  _zoom:             1,
  _panX:             0,
  _panY:             0,
  _maxZoom:          5,
  _refreshTimer:     null,

  /* ── Public API ─────────────────────────── */

  async init(canvasId, allergenSelectId, dateSelectId) {
    this._canvas = document.getElementById(canvasId);
    if (!this._canvas) return;

    /* Reset zoom/pan */
    this._zoom = 1; this._panX = 0; this._panY = 0;

    this._resize();
    this._drawLoading('Térkép betöltése...');

    /* Load pollen data from DB */
    this._allData = await App.db.getPollenData();

    /* Populate selectors */
    const allDates    = [...new Set(this._allData.map(d => d.date))].sort().reverse();
    const allergenIds = [...new Set(this._allData.map(d => d.allergen_id))];

    /* Default date: today (or latest date ≤ today) */
    const todayISO = App.DATA.todayISO();
    const bestDate = allDates.find(d => d <= todayISO) || allDates[0] || null;
    this._currentDate = bestDate;

    /* Default allergen: strongest on that date */
    if (this._currentDate) {
      const byAllergen = {};
      this._allData.filter(d => d.date === this._currentDate).forEach(d => {
        if (!byAllergen[d.allergen_id] || d.risk_level > byAllergen[d.allergen_id])
          byAllergen[d.allergen_id] = d.risk_level;
      });
      const strongest = Object.entries(byAllergen).sort((a, b) => b[1] - a[1])[0];
      this._currentAllergen = strongest ? strongest[0] : (allergenIds[0] || null);
    } else {
      this._currentAllergen = allergenIds[0] || null;
    }

    const dateSelect = document.getElementById(dateSelectId);
    if (dateSelect) {
      dateSelect.innerHTML = allDates.length
        ? allDates.map(d => `<option value="${d}">${App.DATA.formatDate(d)}</option>`).join('')
        : '<option value="">Nincs adat</option>';
      if (this._currentDate) dateSelect.value = this._currentDate;
      dateSelect.addEventListener('change', () => {
        this._currentDate = dateSelect.value;
        /* Auto-select strongest allergen for newly chosen date */
        const byA = {};
        this._allData.filter(d => d.date === this._currentDate).forEach(d => {
          if (!byA[d.allergen_id] || d.risk_level > byA[d.allergen_id]) byA[d.allergen_id] = d.risk_level;
        });
        const top = Object.entries(byA).sort((a, b) => b[1] - a[1])[0];
        if (top) {
          this._currentAllergen = top[0];
          const asel = document.getElementById(allergenSelectId);
          if (asel) asel.value = this._currentAllergen;
        }
        this.draw();
        this._drawUserMarker();
      });
    }

    const allergenSelect = document.getElementById(allergenSelectId);
    if (allergenSelect) {
      allergenSelect.innerHTML = allergenIds.length
        ? allergenIds.map(id => {
            const a = App.DATA.getAllergenById(id);
            return `<option value="${id}">${a ? a.icon + ' ' + a.name : id}</option>`;
          }).join('')
        : '<option value="">Nincs adat</option>';
      if (this._currentAllergen) allergenSelect.value = this._currentAllergen;
      allergenSelect.addEventListener('change', () => {
        this._currentAllergen = allergenSelect.value;
        this.draw();
        this._drawUserMarker();
      });
    }

    /* Load GeoJSON (from cache or network) */
    try {
      await this._loadGeoJSON();
    } catch (e) {
      this._drawError('Térkép nem tölthető be.\nEllenőrizd az internetkapcsolatot.');
      return;
    }

    this.draw();

    /* User position */
    this._loadUserPosition();

    /* Zoom/pan event handlers */
    this._initZoomPan();

    /* 5-min location refresh while map is visible */
    this._startLocationRefresh();
  },

  /* ── User position ──────────────────────── */
  async _loadUserPosition() {
    const loc = await App.GeoLocation.getCurrent();
    if (loc?.lat && loc?.lon) {
      this._userLat = loc.lat;
      this._userLon = loc.lon;
      this._drawUserMarker();
    }
  },

  _drawUserMarker() {
    if (this._userLat == null || !this._canvas || !this._ctx) return;
    const x = this._lonToX(this._userLon);
    const y = this._latToY(this._userLat);
    const ctx = this._ctx;
    const r = Math.max(6, this._canvas.width * 0.018);

    /* Outer pulse ring */
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(25,118,210,0.20)';
    ctx.fill();

    /* White border */
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    /* Blue dot */
    ctx.beginPath();
    ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#1976D2';
    ctx.fill();
  },

  _startLocationRefresh() {
    /* Clear previous timer */
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    this._refreshTimer = setInterval(async () => {
      if (!this._canvas) { clearInterval(this._refreshTimer); return; }
      const loc = await App.GeoLocation.refresh();
      if (loc?.lat && loc?.lon) {
        this._userLat = loc.lat;
        this._userLon = loc.lon;
        this.draw();
        this._drawUserMarker();
      }
    }, 5 * 60 * 1000); /* 5 minutes */
  },

  stopRefresh() {
    if (this._refreshTimer) { clearInterval(this._refreshTimer); this._refreshTimer = null; }
  },

  /* ── Zoom / Pan ─────────────────────────── */
  _initZoomPan() {
    const canvas = this._canvas;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (container) container.style.overflow = 'hidden';

    let dragging = false, lastX = 0, lastY = 0;
    let touch1 = null, touch2 = null, lastPinchDist = 0;

    const applyT = () => {
      canvas.style.transformOrigin = '0 0';
      canvas.style.transform = `translate(${this._panX}px,${this._panY}px) scale(${this._zoom})`;
    };

    const clampPan = () => {
      const w = canvas.width, h = canvas.height;
      this._panX = Math.min(0, Math.max(w * (1 - this._zoom), this._panX));
      this._panY = Math.min(0, Math.max(h * (1 - this._zoom), this._panY));
    };

    const zoomAt = (cx, cy, factor) => {
      const oldZoom = this._zoom;
      this._zoom = Math.min(this._maxZoom, Math.max(1, this._zoom * factor));
      /* Adjust pan so the zoom is centered at cursor/pinch midpoint */
      this._panX = cx - (cx - this._panX) * (this._zoom / oldZoom);
      this._panY = cy - (cy - this._panY) * (this._zoom / oldZoom);
      clampPan();
      applyT();
    };

    /* Mouse wheel (desktop) */
    canvas.addEventListener('wheel', e => {
      /* Use parentElement rect – canvas has CSS transform applied so its own
         getBoundingClientRect().left already includes panX, which would shift
         the zoom centre toward the bottom-right corner. */
      const containerRect = canvas.parentElement.getBoundingClientRect();
      zoomAt(e.clientX - containerRect.left, e.clientY - containerRect.top, e.deltaY > 0 ? 0.85 : 1.18);
      e.preventDefault();
    }, { passive: false });

    /* Touch events */
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      if (e.touches.length === 1) {
        dragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        touch2 = null;
      } else if (e.touches.length === 2) {
        dragging = false;
        touch1 = e.touches[0];
        touch2 = e.touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        lastPinchDist = Math.sqrt(dx*dx + dy*dy);
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1 && dragging) {
        this._panX += e.touches[0].clientX - lastX;
        this._panY += e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        clampPan(); applyT();
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (lastPinchDist > 0) {
          const midX = (t1.clientX + t2.clientX) / 2;
          const midY = (t1.clientY + t2.clientY) / 2;
          /* Same fix: use container rect to avoid the panX offset */
          const containerRect = canvas.parentElement.getBoundingClientRect();
          zoomAt(midX - containerRect.left, midY - containerRect.top, dist / lastPinchDist);
        }
        lastPinchDist = dist;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      if (e.touches.length === 0) {
        /* All fingers lifted */
        dragging = false;
        lastPinchDist = 0;
      } else if (e.touches.length === 1) {
        /* One finger lifted after pinch → seamlessly switch to pan mode
           so the remaining finger can drag immediately */
        dragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        lastPinchDist = 0;
      }
    });

    /* Double-tap to reset zoom/pan */
    let lastTap = 0;
    canvas.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - lastTap < 300) {
        this._zoom = 1; this._panX = 0; this._panY = 0;
        applyT();
      }
      lastTap = now;
    });
  },

  /* ── GeoJSON loading ────────────────────── */

  async _loadGeoJSON() {
    /* Try sessionStorage cache first */
    const cached = sessionStorage.getItem('hu_counties_geojson');
    if (cached) {
      this._geojson = JSON.parse(cached);
      return;
    }

    const res = await fetch(this.GEOJSON_URL, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    this._geojson = JSON.parse(text);
    try { sessionStorage.setItem('hu_counties_geojson', text); } catch (_) {}
  },

  /* ── Canvas helpers ─────────────────────── */

  _resize() {
    if (!this._canvas) return;
    const parent = this._canvas.parentElement;
    const cw     = parent ? Math.max(280, parent.clientWidth - 4) : 320;
    const { west, east, south, north } = this.BOUNDS;
    /* Preserve the geographic aspect ratio (corrected for latitude compression) */
    const lonSpan = east  - west;
    const latSpan = north - south;
    const aspect  = (lonSpan * Math.cos((north + south) / 2 * Math.PI / 180)) / latSpan;
    this._canvas.width  = cw;
    this._canvas.height = Math.round(cw / aspect);
    this._ctx = this._canvas.getContext('2d');
  },

  _lonToX(lon) {
    const { west, east } = this.BOUNDS;
    return ((lon - west) / (east - west)) * this._canvas.width;
  },

  _latToY(lat) {
    const { south, north } = this.BOUNDS;
    return ((north - lat) / (north - south)) * this._canvas.height;
  },

  /* ── Color helpers ──────────────────────── */

  _riskColor(risk, alpha) {
    const [r, g, b] = this._riskColorRgb(risk);
    return `rgba(${r},${g},${b},${alpha ?? 1})`;
  },

  /* Returns [r,g,b] array — used for ImageData pixel painting */
  _riskColorRgb(risk) {
    const stops = this.RISK_COLORS;
    const t  = Math.max(0, Math.min(stops.length - 1.001, risk));
    const lo = Math.floor(t);
    const hi = Math.min(lo + 1, stops.length - 1);
    const f  = t - lo;
    return stops[lo].map((c, i) => Math.round(c + (stops[hi][i] - c) * f));
  },

  _noDataColor(alpha) {
    const [r, g, b] = this.NO_DATA_COLOR;
    return `rgba(${r},${g},${b},${alpha ?? 1})`;
  },

  /* ── Drawing helpers ────────────────────── */

  _drawLoading(msg) {
    const ctx = this._ctx;
    if (!ctx) return;
    const w = this._canvas.width, h = this._canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f0f4f0';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = `${Math.max(11, Math.round(w * 0.038))}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(msg, w / 2, h / 2);
  },

  _drawError(msg) {
    const ctx = this._ctx;
    if (!ctx) return;
    const w = this._canvas.width, h = this._canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fdf0f0';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c62828';
    ctx.font = `${Math.max(10, Math.round(w * 0.032))}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    msg.split('\n').forEach((line, i) => ctx.fillText(line, w / 2, h / 2 + i * 20));
  },

  /* ── Main draw — Voronoi pixel-painting ───── */

  draw() {
    const ctx = this._ctx;
    if (!ctx || !this._geojson) return;

    const w = this._canvas.width, h = this._canvas.height;
    ctx.clearRect(0, 0, w, h);

    /* Background */
    ctx.fillStyle = '#eef2ee';
    ctx.fillRect(0, 0, w, h);

    /* ── 1. Build station → risk_level map ───── */
    const stationRisk = {};
    this._allData
      .filter(d => d.date === this._currentDate && d.allergen_id === this._currentAllergen)
      .forEach(d => {
        const key = (d.location || '').toUpperCase();
        for (const stName of Object.keys(this.STATION_COORDS)) {
          if (key === stName || key.includes(stName) || stName.includes(key)) {
            if (!(stName in stationRisk) || d.risk_level > stationRisk[stName]) {
              stationRisk[stName] = d.risk_level;
            }
          }
        }
      });

    /* ── 2. Precompute station pixel positions ─ */
    /* Since the canvas preserves geographic aspect ratio, pixel-distance
       is proportional to geographic (Haversine) distance → correct Voronoi */
    const stations = Object.entries(this.STATION_COORDS).map(([name, { lat, lon }]) => ({
      name,
      px: this._lonToX(lon),
      py: this._latToY(lat),
      risk: stationRisk[name] ?? -1,
    }));

    /* ── 3. Paint Voronoi zones into off-screen canvas ── */
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const offCtx = off.getContext('2d');

    const imgData = offCtx.createImageData(w, h);
    const pxData  = imgData.data;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        /* Find nearest station in pixel space */
        let bestRisk = -1, minD2 = Infinity;
        for (const s of stations) {
          const dx = px - s.px, dy = py - s.py;
          const d2 = dx * dx + dy * dy;
          if (d2 < minD2) { minD2 = d2; bestRisk = s.risk; }
        }
        const idx = (py * w + px) * 4;
        const rgb = bestRisk >= 0 ? this._riskColorRgb(bestRisk) : this.NO_DATA_COLOR;
        pxData[idx]     = rgb[0];
        pxData[idx + 1] = rgb[1];
        pxData[idx + 2] = rgb[2];
        pxData[idx + 3] = 210;
      }
    }
    offCtx.putImageData(imgData, 0, 0);

    /* ── 4. Clip Voronoi to Hungary territory ─── */
    /* destination-in: keep only pixels where Hungary polygon is painted */
    offCtx.globalCompositeOperation = 'destination-in';
    offCtx.fillStyle = '#fff';
    const features = this._geojson.features || [];

    offCtx.beginPath();
    features.forEach(feature => {
      const geom = feature.geometry;
      if (!geom) return;
      const polys = geom.type === 'Polygon'   ? [geom.coordinates]
                  : geom.type === 'MultiPolygon' ? geom.coordinates : [];
      polys.forEach(poly => {
        poly.forEach(ring => {
          ring.forEach(([lon, lat], i) => {
            const x = this._lonToX(lon), y = this._latToY(lat);
            if (i === 0) offCtx.moveTo(x, y); else offCtx.lineTo(x, y);
          });
          offCtx.closePath();
        });
      });
    });
    offCtx.fill('evenodd');
    offCtx.globalCompositeOperation = 'source-over';

    /* Blit clipped Voronoi onto main canvas */
    ctx.drawImage(off, 0, 0);

    /* ── 5. County borders (subtle, geographic reference) ── */
    const SIMP = 3;
    ctx.strokeStyle = 'rgba(30,70,30,0.22)';
    ctx.lineWidth   = Math.max(0.4, w * 0.0008);
    features.forEach(feature => {
      const geom = feature.geometry;
      if (!geom) return;
      const polys = geom.type === 'Polygon'   ? [geom.coordinates]
                  : geom.type === 'MultiPolygon' ? geom.coordinates : [];
      polys.forEach(poly => {
        poly.forEach((ring, ri) => {
          if (ri > 0) return; /* skip holes */
          const pts = ring.length > SIMP * 2
            ? ring.filter((_, i) => i % SIMP === 0 || i === ring.length - 1)
            : ring;
          ctx.beginPath();
          pts.forEach(([lon, lat], i) => {
            const x = this._lonToX(lon), y = this._latToY(lat);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.stroke();
        });
      });
    });

    /* ── 6. Station markers ─────────────────── */
    const drawnStations = new Set();
    this._allData
      .filter(d => d.date === this._currentDate && d.allergen_id === this._currentAllergen)
      .forEach(d => {
        const key = (d.location || '').toUpperCase();
        let stKey = null;
        for (const k of Object.keys(this.STATION_COORDS)) {
          if (key === k || key.includes(k) || k.includes(key)) { stKey = k; break; }
        }
        if (!stKey || drawnStations.has(stKey)) return;
        drawnStations.add(stKey);

        const { lat, lon } = this.STATION_COORDS[stKey];
        const x = this._lonToX(lon), y = this._latToY(lat);
        const r = Math.max(4, w * 0.014);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = this._riskColor(stationRisk[stKey] ?? 0, 1);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = Math.max(1.5, w * 0.004);
        ctx.stroke();

        /* City label */
        const label = stKey.charAt(0) + stKey.slice(1).toLowerCase();
        const fs    = Math.max(7, Math.round(w * 0.022));
        ctx.font         = `700 ${fs}px sans-serif`;
        ctx.fillStyle    = '#1B3A1B';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, x, y - r - 1);
      });

    /* ── 7. No-data overlay ──────────────────── */
    if (Object.keys(stationRisk).length === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.font = `${Math.max(11, Math.round(w * 0.036))}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Nincs adat a kiválasztott szűrőhöz', w / 2, h / 2);
    }
  },
};
