/* ═══════════════════════════════════════════
   AllergyTrack – Pollen Data Page
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.PollenData = {

  /* ── State for live filter ─────────────────── */
  _allData:    [],
  _filterState: { query: '', level: '', allergen: '', dateFrom: '', dateTo: '' },

  async render() {
    this._allData = await App.db.getPollenData();
    const allData = this._allData;
    const hasPdf  = App.pdfParser.isPdfJsAvailable();

    /* Group by date */
    const byDate = {};
    allData.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = [];
      byDate[r.date].push(r);
    });
    const dates = Object.keys(byDate).sort().reverse();

    /* Latest data summary */
    const latest     = dates[0];
    const latestRows = byDate[latest] || [];

    /* Group latest by allergen for overview chips */
    const allergenMax = {};
    latestRows.forEach(r => {
      if (!allergenMax[r.allergen_id] || r.risk_level > allergenMax[r.allergen_id].risk_level) {
        allergenMax[r.allergen_id] = r;
      }
    });

    const overviewChips = Object.values(allergenMax)
      .sort((a, b) => b.risk_level - a.risk_level)
      .map(r => {
        const a    = App.DATA.getAllergenById(r.allergen_id);
        if (!a) return '';
        const rl   = App.DATA.RISK_LEVELS[r.risk_level];
        return `
        <div class="allergen-chip level-${r.risk_level}">
          <span class="icon">${a.icon}</span>
          <span class="name">${a.name}</span>
          <span class="level" style="color:${rl.color}">${rl.short}</span>
        </div>`;
      }).join('');

    return `
    <div class="page" id="page-pollen">
      <!-- Title + tab strip -->
      <div class="section-header mb-3">
        <div class="section-title">🌿 Pollenadatok</div>
      </div>
      <div class="pill-tabs mb-4" id="pollen-tabs">
        <div class="pill-tab active" data-ptab="data">📊 Adatok</div>
        <div class="pill-tab" data-ptab="map">🗺️ Térkép</div>
      </div>

      <!-- ── Map tab ───────────────────────── -->
      <div id="pollen-tab-map" style="display:none">
        ${allData.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🗺️</div>
          <h3>Nincs feltöltve pollenadatat</h3>
          <p>Az Adatok fülön töltsd fel a pollenjelentést, majd vissza ide.</p>
        </div>` : `
        <div class="card mb-4" style="padding:12px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
            <div>
              <label class="form-label" style="margin-bottom:4px">Allergen</label>
              <select class="form-control" id="map-allergen-select" style="font-size:13px"></select>
            </div>
            <div>
              <label class="form-label" style="margin-bottom:4px">Dátum</label>
              <select class="form-control" id="map-date-select" style="font-size:13px"></select>
            </div>
          </div>
          <div class="pollen-map-wrap">
            <canvas id="pollen-map-canvas"></canvas>
          </div>
          <!-- Legend -->
          <div class="map-legend mt-3">
            <span class="map-legend-label">Szint:</span>
            ${App.DATA.RISK_LEVELS.map((rl, i) => `
              <div class="map-legend-item">
                <div class="map-legend-dot" style="background:${rl.color}"></div>
                <span>${rl.short}</span>
              </div>`).join('')}
          </div>
        </div>`}
      </div>

      <!-- ── Data tab ──────────────────────── -->
      <div id="pollen-tab-data">

      <!-- Upload zone -->
      <div class="upload-zone mb-4" id="upload-zone">
        <div class="upload-icon">📄</div>
        <h3>PDF feltöltése</h3>
        <p>Húzd ide vagy kattints · <strong>NNK napi pollenjelentés</strong> (nnk.gov.hu)<br>
          <span style="font-size:11px;opacity:.7">.pdf formátum · csak a Nemzeti Népegészségügyi Központ PDF-je támogatott</span></p>
        <input type="file" accept=".pdf" id="pdf-input" style="display:none">
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" id="upload-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            PDF kiválasztása
          </button>
          <button class="btn btn-success btn-sm" id="online-fetch-btn">
            🌐 Online frissítés
          </button>
          <button class="btn btn-secondary btn-sm" id="forecast-fetch-btn">
            🔮 Holnapi előrejelzés
          </button>
          <button class="btn btn-secondary btn-sm" id="manual-entry-btn">
            ✏️ Kézi bevitel
          </button>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px;text-align:center">
          Online frissítés: 18 magyar város · Open-Meteo + NNK/ÁNTSZ
        </div>
        <div style="margin-top:10px;display:flex;justify-content:center">
          <button class="btn btn-ghost btn-sm" id="more-info-btn" style="font-size:12px;gap:5px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            További információ
          </button>
        </div>
        ${!hasPdf ? `<div class="chip chip-warning mt-2" style="margin:12px auto 0;display:inline-flex">
          ⚠️ PDF.js nem elérhető – kézi bevitelt használj
        </div>` : ''}
      </div>

      <!-- Parse progress -->
      <div id="parse-progress" style="display:none" class="card mb-4">
        <div style="font-weight:700;margin-bottom:8px">⏳ PDF feldolgozása...</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:0%" id="parse-bar"></div>
        </div>
      </div>

      <!-- Parse result preview -->
      <div id="parse-result" style="display:none" class="card mb-4">
        <div class="card-header">
          <div class="card-title">📊 Kinyert adatok</div>
          <button class="icon-btn" id="close-result">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div id="parse-result-body"></div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-primary" id="save-parsed-btn">
            ✅ Mentés
          </button>
          <button class="btn btn-ghost" id="discard-parsed-btn">Elvet</button>
        </div>
      </div>

      <!-- Current data overview -->
      ${latest ? `
      <div class="section-header mb-3">
        <div class="section-title">📅 Legutóbbi adatok</div>
        <span class="chip chip-accent">${App.DATA.formatDateShort(latest)}</span>
      </div>
      <div class="allergen-row mb-4">${overviewChips}</div>` : ''}

      <!-- Filter panel -->
      ${dates.length > 0 ? `
      <div class="card mb-3" style="padding:12px" id="pollen-filter-panel">
        <div style="font-size:12px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Szűrők</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <div>
            <label class="form-label" style="margin-bottom:3px">Dátumtól</label>
            <input type="date" class="form-control" id="filter-date-from" style="font-size:12px">
          </div>
          <div>
            <label class="form-label" style="margin-bottom:3px">Dátumig</label>
            <input type="date" class="form-control" id="filter-date-to" style="font-size:12px">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <div>
            <label class="form-label" style="margin-bottom:3px">Min. szint</label>
            <select class="form-control" id="filter-level" style="font-size:12px">
              <option value="">Mind</option>
              ${App.DATA.RISK_LEVELS.map((rl, i) => `<option value="${i}">${rl.label}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" style="margin-bottom:3px">Allergen</label>
            <select class="form-control" id="filter-allergen" style="font-size:12px">
              <option value="">Mind</option>
              ${[...new Set(allData.map(r => r.allergen_id))].sort().map(id => {
                const a = App.DATA.getAllergenById(id);
                return `<option value="${id}">${a ? a.icon+' '+a.name : id}</option>`;
              }).join('')}
            </select>
          </div>
        </div>
        <input type="text" class="form-control" id="filter-location" placeholder="Helyszínre keresés..." style="font-size:12px">
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <button class="btn btn-ghost btn-sm" id="filter-reset-btn">Visszaállítás</button>
        </div>
      </div>` : ''}

      <!-- Data results -->
      <div id="pollen-data-results">
      ${dates.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🌿</div>
        <h3>Még nincs pollenadatat</h3>
        <p>Töltsd fel a hivatalos pollenjelentés PDF-jét, vagy add meg kézzel az adatokat.</p>
      </div>` : this._renderFilteredData(allData)}
      </div>
      <div style="height:16px"></div>

      </div><!-- /pollen-tab-data -->
    </div>`;
  },

  _parsedData: null,

  /* ── Render filtered pollen data table ───── */
  _renderFilteredData(data) {
    const f = this._filterState;
    const filtered = data.filter(r => {
      if (f.dateFrom && r.date < f.dateFrom) return false;
      if (f.dateTo   && r.date > f.dateTo)   return false;
      if (f.level    && r.risk_level < parseInt(f.level)) return false;
      if (f.allergen && r.allergen_id !== f.allergen)     return false;
      if (f.query    && !r.location.toLowerCase().includes(f.query.toLowerCase())) return false;
      return true;
    });

    if (filtered.length === 0) {
      return `<div style="text-align:center;padding:32px 0;color:var(--text-3)">Nincs találat a szűrési feltételekre.</div>`;
    }

    /* Group by date */
    const byDate = {};
    filtered.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = [];
      byDate[r.date].push(r);
    });
    const dates = Object.keys(byDate).sort().reverse();

    return dates.map(date => `
    <div class="mb-4">
      <div class="section-header mb-2">
        <div style="font-size:14px;font-weight:700;color:var(--text-2)">${App.DATA.formatDate(date)}</div>
        <button class="btn btn-danger btn-sm" data-delete-date="${date}">Törlés</button>
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <div class="pollen-table-wrap">
          <table class="pollen-table">
            <thead><tr><th>Allergen</th><th>Helyszín</th><th>Szint</th></tr></thead>
            <tbody>
              ${byDate[date]
                .sort((a, b) => b.risk_level - a.risk_level)
                .map(r => {
                  const a  = App.DATA.getAllergenById(r.allergen_id);
                  const rl = App.DATA.RISK_LEVELS[Math.min(r.risk_level, 4)];
                  return `<tr>
                    <td>${a ? a.icon+' '+a.name : r.allergen_id}</td>
                    <td style="color:var(--text-3)">${r.location}</td>
                    <td><span class="risk-label ${rl.cssClass}">${rl.label}</span></td>
                  </tr>`;
                }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`).join('');
  },

  _applyFilters() {
    const el = document.getElementById('pollen-data-results');
    if (el) el.innerHTML = this._renderFilteredData(this._allData);
    /* Re-wire delete buttons */
    document.querySelectorAll('[data-delete-date]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const date = btn.dataset.deleteDate;
        App.showConfirmModal(
          'Adatok törlése',
          `Biztosan törlöd az összes ${App.DATA.formatDate(date)} dátumú pollenadat?`,
          async () => {
            const all = await App.db.getPollenData(date, date);
            for (const r of all) await App.db.deletePollenData(r.id);
            this._allData = this._allData.filter(r => r.date !== date);
            App.toast('Adatok törölve.', 'success');
            this._applyFilters();
          }
        );
      });
    });
  },

  mount() {
    const self = this;

    /* Tab switching */
    document.querySelectorAll('#pollen-tabs .pill-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#pollen-tabs .pill-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.ptab;
        document.getElementById('pollen-tab-data').style.display = target === 'data' ? '' : 'none';
        document.getElementById('pollen-tab-map').style.display  = target === 'map'  ? '' : 'none';
        if (target === 'map' && App.PollenMap) {
          App.PollenMap.init('pollen-map-canvas', 'map-allergen-select', 'map-date-select');
        }
      });
    });

    /* Upload button */
    document.getElementById('upload-btn')?.addEventListener('click', () => {
      document.getElementById('pdf-input')?.click();
    });

    document.getElementById('upload-zone')?.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      document.getElementById('pdf-input')?.click();
    });

    /* Drag & drop */
    const zone = document.getElementById('upload-zone');
    if (zone) {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', e => {
        e.preventDefault(); zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) self.handleFile(file);
      });
    }

    /* File input */
    document.getElementById('pdf-input')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) self.handleFile(file);
    });

    /* Holnapi előrejelzés */
    document.getElementById('forecast-fetch-btn')?.addEventListener('click', async () => {
      if (!App.PollenFetcher) { App.toast('Fetcher modul nem elérhető.', 'error'); return; }
      const btn = document.getElementById('forecast-fetch-btn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Letöltés...'; }
      try {
        const result = await App.PollenFetcher.fetchForecast();
        if (btn) { btn.disabled = false; btn.innerHTML = '🔮 Holnapi előrejelzés'; }
        if (!result?.entries?.length) {
          App.toast('Holnapi előrejelzés nem elérhető.', 'info'); return;
        }
        await App.db.savePollenEntries(result.entries);
        /* Megosztott sync */
        App.PollenFetcher?.pushToSupabase?.(result.entries).catch(() => {});
        App.toast(`Holnapi előrejelzés letöltve: ${result.entries.length} bejegyzés`, 'success');
        this._applyFilters();
      } catch (err) {
        if (btn) { btn.disabled = false; btn.innerHTML = '🔮 Holnapi előrejelzés'; }
        App.toast('Előrejelzés hiba: ' + (err.message || 'Ellenőrizd az internetkapcsolatot'), 'error');
      }
    });

    /* Online fetch (Open-Meteo + NNK/ÁNTSZ) – auto-saves multi-day data directly */
    document.getElementById('online-fetch-btn')?.addEventListener('click', async () => {
      if (!App.PollenFetcher) { App.toast('Fetcher modul nem elérhető.', 'error'); return; }
      const btn = document.getElementById('online-fetch-btn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Letöltés...'; }

      try {
        const result = await App.PollenFetcher.fetchLatest();
        if (btn) { btn.disabled = false; btn.innerHTML = '🌐 Online frissítés'; }

        if (!result?.entries?.length) {
          App.toast('Nem sikerült adatot letölteni. Ellenőrizd az internetkapcsolatot.', 'error');
          return;
        }

        /* Auto-save: API data is trusted, no manual review needed */
        await App.db.savePollenData(result.entries);

        /* Megosztott sync: feltölti Supabase-be → minden felhasználónál frissül */
        App.PollenFetcher?.pushToSupabase?.(result.entries).catch(() => {});

        const todayISO  = App.DATA.todayISO();
        const dates     = [...new Set(result.entries.map(e => e.date))].sort();
        const pastDates = dates.filter(d => d <= todayISO);
        const futureDates = dates.filter(d => d > todayISO);
        const cities    = [...new Set(result.entries.filter(e => e.location !== 'Magyarország').map(e => e.location))];
        const allergens = [...new Set(result.entries.map(e => e.allergen_id))];

        const summaryParts = [`${cities.length} város`, `${allergens.length} allergén`];
        if (pastDates.length) summaryParts.push(`${pastDates.length} múltbeli nap`);
        if (futureDates.length) summaryParts.push(`${futureDates.length} nap előrejelzés`);

        App.toast(`✅ ${result.entries.length} adat mentve – ${summaryParts.join(' · ')}`, 'success');
        App.navigate('pollen');  /* Refresh the page */
      } catch (err) {
        if (btn) { btn.disabled = false; btn.innerHTML = '🌐 Online frissítés'; }
        console.error('Online fetch error:', err);
        App.toast('Letöltési hiba: ' + (err.message || 'Ellenőrizd az internetkapcsolatot'), 'error');
      }
    });

    /* Manual entry */
    document.getElementById('manual-entry-btn')?.addEventListener('click', () => {
      self.showManualEntryModal();
    });

    /* Close parse result */
    document.getElementById('close-result')?.addEventListener('click', () => {
      document.getElementById('parse-result').style.display = 'none';
      self._parsedData = null;
    });
    document.getElementById('discard-parsed-btn')?.addEventListener('click', () => {
      document.getElementById('parse-result').style.display = 'none';
      self._parsedData = null;
    });

    /* Save parsed data */
    document.getElementById('save-parsed-btn')?.addEventListener('click', async () => {
      if (!self._parsedData?.length) return;
      const entries = self._parsedData;
      await App.db.savePollenData(entries);
      /* Megosztott sync: PDF-ből feltöltött adat minden felhasználónál frissül */
      App.PollenFetcher?.pushToSupabase?.(entries).catch(() => {});
      App.toast(`${entries.length} bejegyzés mentve!`, 'success');
      document.getElementById('parse-result').style.display = 'none';
      self._parsedData = null;
      App.navigate('pollen');
    });

    /* ── Filter inputs ─────────────────────── */
    const applyF = () => this._applyFilters();

    document.getElementById('filter-date-from')?.addEventListener('change', e => {
      this._filterState.dateFrom = e.target.value; applyF();
    });
    document.getElementById('filter-date-to')?.addEventListener('change', e => {
      this._filterState.dateTo = e.target.value; applyF();
    });
    document.getElementById('filter-level')?.addEventListener('change', e => {
      this._filterState.level = e.target.value; applyF();
    });
    document.getElementById('filter-allergen')?.addEventListener('change', e => {
      this._filterState.allergen = e.target.value; applyF();
    });
    document.getElementById('filter-location')?.addEventListener('input', e => {
      this._filterState.query = e.target.value; applyF();
    });

    /* Reset filters */
    document.getElementById('filter-reset-btn')?.addEventListener('click', () => {
      this._filterState = { query: '', level: '', allergen: '', dateFrom: '', dateTo: '' };
      const el = id => document.getElementById(id);
      if (el('filter-date-from'))  el('filter-date-from').value  = '';
      if (el('filter-date-to'))    el('filter-date-to').value    = '';
      if (el('filter-level'))      el('filter-level').value      = '';
      if (el('filter-allergen'))   el('filter-allergen').value   = '';
      if (el('filter-location'))   el('filter-location').value   = '';
      applyF();
    });

    /* "További információ" – adatforrások */
    document.getElementById('more-info-btn')?.addEventListener('click', () => {
      const linkRow = (href, iconSvg, title, sub) => `
        <a class="btn btn-ghost" style="justify-content:flex-start;gap:10px;text-decoration:none"
           href="${href}" target="_blank" rel="noopener">
          ${iconSvg}
          <div style="text-align:left;flex:1">
            <div style="font-weight:700;font-size:13px">${title}</div>
            <div style="font-size:11px;color:var(--text-3);word-break:break-all">${sub}</div>
          </div>
        </a>`;
      const globe = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
      App.showModal(`
        <div class="modal-handle"></div>
        <div class="modal-title">Adatforrások</div>
        <p style="font-size:13px;color:var(--text-2);margin-bottom:16px">
          Az alkalmazás az alábbi forrásokból kéri le a pollenadatokat:
        </p>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${linkRow(
            'https://open-meteo.com/en/docs/air-quality-api?past_days=1&hourly=pm10,grass_pollen,birch_pollen,alder_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&current=pm10,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
            globe,
            'Open-Meteo Légköri API',
            'open-meteo.com · 18 magyar város · PM10 + 6 allergen · ingyenes JSON API'
          )}
          ${linkRow(
            'https://nnk.gov.hu/index.php/kornyezetegugy/256-kornyezetegeszsegugyi-laboratoriumi-osztaly/levegohigienes-laboratorium/lakossagi-tajekoztato-tartalmak/polleninformaciok-megjelenitese/1237-napi-pollenjelentes.html',
            globe,
            'NNK – Napi pollenjelentés',
            'nnk.gov.hu · Nemzeti Népegészségügyi Központ'
          )}
          ${linkRow(
            'https://efop180.antsz.hu/polleninformaciok.html',
            globe,
            'ÁNTSZ – Polleninformációk',
            'efop180.antsz.hu · Állami Népegészségügyi Szolgálat'
          )}
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-block" onclick="App.closeModal()">Bezárás</button>
        </div>
      `);
    });

    /* Wire up delete buttons for initial render */
    this._applyFilters();
  },

  async handleFile(file) {
    if (!App.pdfParser.isPdfJsAvailable()) {
      App.toast('PDF.js nem elérhető – kézi bevitelt használj.', 'error');
      return;
    }
    const progress = document.getElementById('parse-progress');
    const bar      = document.getElementById('parse-bar');
    if (progress) progress.style.display = '';
    if (bar)      bar.style.width = '20%';

    try {
      if (bar) bar.style.width = '50%';
      const result = await App.pdfParser.parseFile(file);
      if (bar) bar.style.width = '100%';
      setTimeout(() => { if (progress) progress.style.display = 'none'; }, 500);

      if (!result.entries || result.entries.length === 0) {
        App.toast('Nem sikerült adatokat kinyerni. Próbáld a kézi bevitelt.', 'error');
        return;
      }

      this._parsedData = result.entries;
      this.showParseResult(result);
    } catch (err) {
      console.error('PDF parse error:', err);
      if (progress) progress.style.display = 'none';
      App.toast('PDF feldolgozási hiba: ' + (err.message || 'ismeretlen hiba'), 'error');
    }
  },

  showParseResult(result) {
    const container = document.getElementById('parse-result');
    const body      = document.getElementById('parse-result-body');
    if (!container || !body) return;

    const { date, entries, stats } = result;
    const cityCount   = stats?.cities ?? stats?.stations ?? 0;
    const statsHtml = stats ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        ${cityCount > 0 ? `<span class="chip chip-accent">🏙️ ${cityCount} város</span>` : ''}
        <span class="chip chip-accent">🌿 ${stats.allergens} allergen</span>
        <span class="chip chip-accent">📅 ${stats.dates || 1} nap</span>
        ${result.source ? `<span class="chip" style="background:var(--bg-3);font-size:11px">${result.source}</span>` : ''}
      </div>` : '';

    body.innerHTML = `
      <div style="margin-bottom:12px">
        <span class="chip chip-success">✅ ${entries.length} adat kinyerve</span>
        ${date ? `<span class="chip chip-accent" style="margin-left:6px">📅 ${App.DATA.formatDate(date)}</span>` : ''}
      </div>
      ${statsHtml}
      <div class="card" style="padding:0;overflow:hidden;max-height:300px;overflow-y:auto">
        <table class="pollen-table">
          <thead><tr><th>Allergen</th><th>Helyszín</th><th>Szint</th></tr></thead>
          <tbody>
            ${entries.slice(0, 50).map(r => {
              const a  = App.DATA.getAllergenById(r.allergen_id);
              const rl = App.DATA.RISK_LEVELS[r.risk_level];
              return `<tr>
                <td>${a ? a.icon + ' ' + a.name : r.allergen_id}</td>
                <td style="color:var(--text-3)">${r.location}</td>
                <td><span class="risk-label ${rl.cssClass}">${rl.label}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${entries.length > 50 ? `<p style="font-size:12px;color:var(--text-3);margin-top:8px;text-align:center">+${entries.length - 50} további bejegyzés (mind mentésre kerül)</p>` : ''}`;
    container.style.display = '';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  showManualEntryModal() {
    const allergenOptions = [
      ...App.DATA.ALLERGENS.seasonal,
      ...App.DATA.ALLERGENS.general,
    ].map(a => `<option value="${a.id}">${a.icon} ${a.name}${a.latinName ? ' – ' + a.latinName : ''}</option>`).join('');

    const stationOptions = App.DATA.STATIONS.map(s => `<option value="${s}">${s}</option>`).join('');

    App.showModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">✏️ Kézi adatbevitel</div>
      <div class="form-group">
        <label class="form-label">Dátum</label>
        <input type="date" class="form-control" id="m-date" value="${App.DATA.todayISO()}">
      </div>
      <div class="form-group">
        <label class="form-label">Helyszín (állomás)</label>
        <select class="form-control" id="m-station">
          ${stationOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Allergen</label>
        <select class="form-control" id="m-allergen">${allergenOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Koncentráció (db/m³)</label>
        <input type="number" class="form-control" id="m-conc" min="0" placeholder="pl. 45">
      </div>
      <div class="form-group">
        <label class="form-label">Kockázati szint</label>
        <select class="form-control" id="m-risk">
          <option value="0">Alacsony</option>
          <option value="1">Közepes</option>
          <option value="2">Magas</option>
          <option value="3">Nagyon magas</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="m-save-btn">Mentés</button>
        <button class="btn btn-ghost" id="m-close-btn">Mégse</button>
      </div>
    `);

    document.getElementById('m-close-btn')?.addEventListener('click', () => App.closeModal());
    document.getElementById('m-save-btn')?.addEventListener('click', async () => {
      const date        = document.getElementById('m-date')?.value;
      const location    = document.getElementById('m-station')?.value;
      const allergen_id = document.getElementById('m-allergen')?.value;
      const conc        = parseFloat(document.getElementById('m-conc')?.value);
      const risk        = parseInt(document.getElementById('m-risk')?.value);

      if (!date || !allergen_id || isNaN(conc)) {
        App.toast('Kérjük töltsd ki az összes mezőt!', 'error');
        return;
      }

      await App.db.savePollenData([{
        date, location: location || 'Ismeretlen',
        allergen_id, concentration: conc,
        unit: 'db/m³', risk_level: risk,
      }]);
      App.closeModal();
      App.toast('Adat mentve!', 'success');
      App.navigate('pollen');
    });
  },
};
