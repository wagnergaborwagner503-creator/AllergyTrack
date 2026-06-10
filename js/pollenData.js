/* ═══════════════════════════════════════════
   AllergyTrack – Pollen Data Page
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.PollenData = {

  async render() {
    const allData = await App.db.getPollenData();
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
      <!-- Upload Section -->
      <div class="section-header mb-3">
        <div class="section-title">🌿 Pollenadatok</div>
      </div>

      <!-- Upload zone -->
      <div class="upload-zone mb-4" id="upload-zone">
        <div class="upload-icon">📄</div>
        <h3>PDF feltöltése</h3>
        <p>Húzd ide a pollenjelentést, vagy kattints a kiválasztáshoz<br>
          <span style="font-size:11px;opacity:.7">.pdf formátum · OMSZ / ÁNTSZ pollenjelentés</span></p>
        <input type="file" accept=".pdf" id="pdf-input" style="display:none">
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" id="upload-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            PDF kiválasztása
          </button>
          <button class="btn btn-secondary btn-sm" id="manual-entry-btn">
            ✏️ Kézi bevitel
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

      <!-- Data by date -->
      ${dates.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">🌿</div>
        <h3>Még nincs pollenadatat</h3>
        <p>Töltsd fel a hivatalos pollenjelentés PDF-jét, vagy add meg kézzel az adatokat.</p>
      </div>` : dates.map(date => `
      <div class="mb-4">
        <div class="section-header mb-2">
          <div style="font-size:14px;font-weight:700;color:var(--text-2)">
            ${App.DATA.formatDate(date)}
          </div>
          <button class="btn btn-danger btn-sm" data-delete-date="${date}">Törlés</button>
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <div class="pollen-table-wrap">
            <table class="pollen-table">
              <thead>
                <tr>
                  <th>Allergen</th>
                  <th>Helyszín</th>
                  <th>Szint</th>
                </tr>
              </thead>
              <tbody>
                ${byDate[date]
                  .sort((a, b) => b.risk_level - a.risk_level)
                  .map(r => {
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
        </div>
      </div>`).join('')}
      <div style="height:16px"></div>
    </div>`;
  },

  _parsedData: null,

  mount() {
    const self = this;

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
      await App.db.savePollenData(self._parsedData);
      App.toast(`${self._parsedData.length} bejegyzés mentve!`, 'success');
      document.getElementById('parse-result').style.display = 'none';
      self._parsedData = null;
      App.navigate('pollen');
    });

    /* Delete by date */
    document.querySelectorAll('[data-delete-date]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const date = btn.dataset.deleteDate;
        App.showConfirmModal(
          'Adatok törlése',
          `Biztosan törlöd az összes ${App.DATA.formatDate(date)} dátumú pollenadat?`,
          async () => {
            const all = await App.db.getPollenData(date, date);
            for (const r of all) await App.db.deletePollenData(r.id);
            App.toast('Adatok törölve.', 'success');
            App.navigate('pollen');
          }
        );
      });
    });
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
    const statsHtml = stats ? `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <span class="chip chip-accent">🏙️ ${stats.stations} állomás</span>
        <span class="chip chip-accent">🌿 ${stats.allergens} allergen</span>
        <span class="chip chip-accent">📅 ${stats.dates} nap</span>
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
