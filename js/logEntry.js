/* ═══════════════════════════════════════════
   AllergyTrack – Log Entry Page
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.LogEntry = {

  /* ── List view ───────────────────────────── */
  async renderList() {
    const logs = await App.db.getSymptomsLogs();
    const groupedRaw = {};
    logs.forEach(log => {
      const ym = log.date.substring(0, 7);
      if (!groupedRaw[ym]) groupedRaw[ym] = [];
      groupedRaw[ym].push(log);
    });
    const months = Object.keys(groupedRaw).sort().reverse();

    const groups = months.map(ym => {
      const [y, m] = ym.split('-');
      return {
        label: `${App.DATA.MONTHS[parseInt(m) - 1]} ${y}`,
        logs: groupedRaw[ym],
      };
    });

    return `
    <div class="page" id="page-log-list">
      <div class="section-header mb-4">
        <div class="section-title">Tünetnapló</div>
        <button class="btn btn-primary btn-sm" id="log-new-btn">+ Új bejegyzés</button>
      </div>
      ${groups.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Még nincs bejegyzés</h3>
        <p>Rögzítsd napi tüneteidet, gyógyszereidet és a környezetedet.</p>
        <button class="btn btn-primary" id="log-new-btn2">+ Első bejegyzés</button>
      </div>` : groups.map(g => `
      <div class="mb-4">
        <div class="divider-label"><span>${g.label}</span></div>
        <div class="log-preview mt-2">
          ${g.logs.map(log => {
            const sev = log.overall_severity || 0;
            const sevColor = sev <= 3 ? 'var(--success)' : sev <= 6 ? 'var(--warning)' : 'var(--danger)';
            const syms = (log.symptoms || []).slice(0, 4).map(s => {
              const sym = App.DATA.getSymptomById(s.id);
              return sym ? sym.icon : '';
            }).join('');
            const d = new Date(log.date + 'T12:00:00');
            const dayName = App.DATA.DAYS_SHORT[(d.getDay() + 6) % 7];
            return `
            <div class="log-item" data-log-id="${log.id}">
              <div class="log-item-icon" style="background:var(--accent-bg)">${syms || '📋'}</div>
              <div class="log-item-body">
                <div class="log-item-title">
                  ${dayName} · ${App.DATA.formatDateShort(log.date)}
                </div>
                <div class="log-item-sub">
                  ${(log.symptoms || []).length} tünet
                  ${log.location ? ' · 📍' + log.location : ''}
                  ${log.medication_taken ? ' · 💊' : ''}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <div class="log-item-severity" style="background:${sevColor}18;color:${sevColor}">
                  ${sev > 0 ? sev : '–'}
                </div>
                <button class="icon-btn log-delete-btn" data-id="${log.id}" style="width:32px;height:32px;color:var(--text-muted)" title="Törlés">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`).join('')}
      <div style="height:16px"></div>
    </div>`;
  },

  mountList() {
    const newBtn  = document.getElementById('log-new-btn');
    const newBtn2 = document.getElementById('log-new-btn2');
    if (newBtn)  newBtn.addEventListener('click',  () => App.navigate('log-new'));
    if (newBtn2) newBtn2.addEventListener('click', () => App.navigate('log-new'));

    document.querySelectorAll('.log-item[data-log-id]').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('.log-delete-btn')) return;
        App.navigate('log-new', { editId: parseInt(el.dataset.logId) });
      });
    });

    document.querySelectorAll('.log-delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        App.showConfirmModal(
          'Bejegyzés törlése',
          'Biztosan törlöd ezt a bejegyzést? Ez a művelet nem visszavonható.',
          async () => {
            await App.db.deleteSymptomsLog(id);
            App.toast('Bejegyzés törölve.', 'success');
            App.navigate('log');
          }
        );
      });
    });
  },

  /* ── New / Edit form ─────────────────────── */
  _state: {
    selectedSymptoms: {},  /* id → severity 1-5 */
    selectedEnv:      {},
    medications:      [],
    editId:           null,
  },

  async renderForm(editId = null) {
    this._state.editId           = editId;
    this._state.selectedSymptoms = {};
    this._state.selectedEnv      = {};

    let existing = null;
    if (editId) {
      existing = await App.db.getSymptomsLogById(editId);
      if (existing) {
        (existing.symptoms || []).forEach(s => {
          this._state.selectedSymptoms[s.id] = s.severity || 3;
        });
        this._state.selectedEnv = existing.environment || {};
      }
    }

    const storedMeds = await App.db.getMedications();
    this._state.medications = storedMeds.map(m => ({
      ...m,
      checked: existing
        ? (existing.medications_taken || []).some(mt => mt.name === m.name)
        : false,
    }));

    const today = App.DATA.todayISO();
    const D     = App.DATA;

    /* Group symptoms by category */
    const symCats = {};
    D.SYMPTOMS.forEach(s => {
      if (!symCats[s.cat]) symCats[s.cat] = [];
      symCats[s.cat].push(s);
    });

    const envItems = (group, key) => D.ENVIRONMENTS[group].map(item => {
      const sel = this._state.selectedEnv[key] === item.id ? 'selected' : '';
      return `<button class="env-btn ${sel}" data-env-group="${key}" data-env-val="${item.id}">
        <span class="env-icon">${item.icon}</span>${item.name}
      </button>`;
    }).join('');

    const renderMeds = () => this._state.medications.map((m, idx) => `
      <div class="med-item">
        <input type="checkbox" id="med-${idx}" ${m.checked ? 'checked' : ''}
               data-med-idx="${idx}">
        <label class="med-name" for="med-${idx}">${m.name}</label>
        ${m.id ? `<span class="med-remove" data-med-idx="${idx}" title="Törlés">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </span>` : ''}
      </div>`).join('');

    return `
    <div class="page" id="page-log-form">
      <div class="section-header mb-4">
        <button class="btn btn-ghost btn-sm" id="form-back-btn">← Vissza</button>
        <div class="section-title">${editId ? 'Bejegyzés szerkesztése' : 'Új bejegyzés'}</div>
        <div style="width:70px"></div>
      </div>

      <!-- Date & Location -->
      <div class="card mb-4">
        <div class="card-title mb-3">📅 Dátum és helyszín</div>
        <div class="form-group">
          <label class="form-label">Dátum</label>
          <input type="date" class="form-control" id="log-date"
                 value="${existing?.date || today}" max="${today}">
        </div>
        <div class="form-group">
          <label class="form-label">Helyszín</label>
          <input type="text" class="form-control" id="log-location"
                 placeholder="pl. Budapest, Városliget"
                 value="${existing?.location || ''}"
                 list="location-suggestions">
          <datalist id="location-suggestions">
            ${App.DATA.STATIONS.map(s => `<option value="${s}">`).join('')}
          </datalist>
        </div>
      </div>

      <!-- Symptoms -->
      <div class="card mb-4">
        <div class="card-title mb-1">🤧 Tünetek</div>
        <div class="text-sm text-muted mb-3">Jelöld ki a jelenlévő tüneteket</div>
        ${Object.entries(symCats).map(([cat, syms]) => `
          <div class="mb-3">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">${cat}</div>
            <div class="symptoms-grid">
              ${syms.map(s => {
                const sel = this._state.selectedSymptoms[s.id] ? 'selected' : '';
                return `<button class="symptom-btn ${sel}" data-sym-id="${s.id}">
                  <span class="sym-icon">${s.icon}</span>
                  <span>${s.name}</span>
                </button>`;
              }).join('')}
            </div>
          </div>`).join('')}
        <!-- Severity slider -->
        <div id="severity-section" style="margin-top:16px;${Object.keys(this._state.selectedSymptoms).length === 0 ? 'display:none' : ''}">
          <div class="divider"></div>
          <label class="form-label mt-4">Általános súlyosság</label>
          <div class="range-wrap">
            <input type="range" id="overall-severity" min="1" max="10"
                   value="${existing?.overall_severity || 5}">
            <div class="range-labels"><span>Enyhe</span><span>Nagyon súlyos</span></div>
            <div class="range-value" id="severity-val">${existing?.overall_severity || 5}</div>
          </div>
        </div>
      </div>

      <!-- Environment -->
      <div class="card mb-4">
        <div class="card-title mb-3">🌍 Környezet</div>
        <div class="form-group">
          <label class="form-label">Tartózkodási hely</label>
          <div class="env-grid">${envItems('location', 'location_type')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Szélviszonyok</label>
          <div class="env-grid">${envItems('wind', 'wind')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Páratartalom / Időjárás</label>
          <div class="env-grid">${envItems('humidity', 'humidity')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Ablak</label>
          <div class="env-grid">${envItems('windows', 'windows')}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Hőmérséklet (kb.)</label>
          <input type="number" class="form-control" id="log-temp"
                 placeholder="pl. 22" min="-30" max="50"
                 value="${existing?.temperature || ''}">
        </div>
      </div>

      <!-- Medications -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">💊 Gyógyszerek</div>
        </div>
        <div id="med-list">${renderMeds()}</div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <input type="text" class="form-control" id="new-med-input"
                 placeholder="Új gyógyszer neve..." style="flex:1">
          <button class="btn btn-secondary btn-sm" id="add-med-btn">Hozzáad</button>
        </div>
      </div>

      <!-- Notes -->
      <div class="card mb-5">
        <div class="card-title mb-3">📝 Megjegyzések</div>
        <textarea class="form-control" id="log-notes" rows="3"
                  placeholder="Egyéb megfigyelések, megjegyzések...">${existing?.notes || ''}</textarea>
      </div>

      <!-- Save button -->
      <button class="btn btn-primary btn-lg btn-block" id="log-save-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="20" height="20">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        ${editId ? 'Mentés' : 'Bejegyzés mentése'}
      </button>
      <div style="height:24px"></div>
    </div>`;
  },

  mountForm() {
    const self = this;

    document.getElementById('form-back-btn')?.addEventListener('click', () => App.navigate('log'));

    /* Symptom buttons */
    document.querySelectorAll('.symptom-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.symId;
        if (self._state.selectedSymptoms[id]) {
          delete self._state.selectedSymptoms[id];
          btn.classList.remove('selected');
        } else {
          self._state.selectedSymptoms[id] = 3;
          btn.classList.add('selected');
        }
        const sect = document.getElementById('severity-section');
        if (sect) sect.style.display = Object.keys(self._state.selectedSymptoms).length > 0 ? '' : 'none';
      });
    });

    /* Severity slider */
    const sevSlider = document.getElementById('overall-severity');
    const sevVal    = document.getElementById('severity-val');
    if (sevSlider && sevVal) {
      sevSlider.addEventListener('input', () => { sevVal.textContent = sevSlider.value; });
    }

    /* Environment buttons */
    document.querySelectorAll('.env-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.envGroup;
        const val   = btn.dataset.envVal;
        self._state.selectedEnv[group] = val;
        document.querySelectorAll(`.env-btn[data-env-group="${group}"]`).forEach(b => {
          b.classList.toggle('selected', b === btn);
        });
      });
    });

    /* Medication checkboxes */
    document.querySelectorAll('input[data-med-idx]').forEach(cb => {
      cb.addEventListener('change', () => {
        const idx = parseInt(cb.dataset.medIdx);
        if (self._state.medications[idx]) {
          self._state.medications[idx].checked = cb.checked;
        }
      });
    });

    /* Delete medication */
    document.querySelectorAll('.med-remove[data-med-idx]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.medIdx);
        const med = self._state.medications[idx];
        if (med?.id) {
          await App.db.deleteMedication(med.id);
          self._state.medications.splice(idx, 1);
          document.getElementById('med-list').innerHTML =
            self._state.medications.map((m, i) => `
              <div class="med-item">
                <input type="checkbox" id="med-${i}" ${m.checked ? 'checked' : ''} data-med-idx="${i}">
                <label class="med-name" for="med-${i}">${m.name}</label>
                ${m.id ? `<span class="med-remove" data-med-idx="${i}" title="Törlés">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg></span>` : ''}
              </div>`).join('');
          self.mountMedEvents();
        }
      });
    });

    /* Add medication */
    const addMedBtn = document.getElementById('add-med-btn');
    const medInput  = document.getElementById('new-med-input');
    if (addMedBtn && medInput) {
      addMedBtn.addEventListener('click', async () => {
        const name = medInput.value.trim();
        if (!name) return;
        const id = await App.db.saveMedication({ name, active: true });
        self._state.medications.push({ id, name, checked: true });
        medInput.value = '';
        document.getElementById('med-list').innerHTML =
          self._state.medications.map((m, i) => `
            <div class="med-item">
              <input type="checkbox" id="med-${i}" ${m.checked ? 'checked' : ''} data-med-idx="${i}">
              <label class="med-name" for="med-${i}">${m.name}</label>
              ${m.id ? `<span class="med-remove" data-med-idx="${i}" title="Törlés">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg></span>` : ''}
            </div>`).join('');
        self.mountMedEvents();
        App.toast(`"${name}" hozzáadva`, 'success');
      });
    }

    /* Save */
    document.getElementById('log-save-btn')?.addEventListener('click', () => self.saveForm());
  },

  mountMedEvents() {
    const self = this;
    document.querySelectorAll('input[data-med-idx]').forEach(cb => {
      cb.addEventListener('change', () => {
        const idx = parseInt(cb.dataset.medIdx);
        if (self._state.medications[idx]) self._state.medications[idx].checked = cb.checked;
      });
    });
    document.querySelectorAll('.med-remove[data-med-idx]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.medIdx);
        const med = self._state.medications[idx];
        if (med?.id) {
          await App.db.deleteMedication(med.id);
          self._state.medications.splice(idx, 1);
          document.getElementById('med-list').innerHTML =
            self._state.medications.map((m, i) => `
              <div class="med-item">
                <input type="checkbox" id="med-${i}" ${m.checked ? 'checked' : ''} data-med-idx="${i}">
                <label class="med-name" for="med-${i}">${m.name}</label>
                ${m.id ? `<span class="med-remove" data-med-idx="${i}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg></span>` : ''}
              </div>`).join('');
          self.mountMedEvents();
        }
      });
    });
  },

  async saveForm() {
    const date     = document.getElementById('log-date')?.value;
    const location = document.getElementById('log-location')?.value?.trim();
    const severity = parseInt(document.getElementById('overall-severity')?.value || '5');
    const notes    = document.getElementById('log-notes')?.value?.trim();
    const temp     = document.getElementById('log-temp')?.value;

    if (!date) { App.toast('Kérjük add meg a dátumot!', 'error'); return; }

    const symptoms = Object.entries(this._state.selectedSymptoms).map(([id, sev]) => ({
      id, severity: sev,
    }));

    const medications_taken = this._state.medications
      .filter(m => m.checked)
      .map(m => ({ name: m.name }));

    const entry = {
      date,
      location:          location || '',
      symptoms,
      overall_severity:  symptoms.length > 0 ? severity : 0,
      environment:       this._state.selectedEnv,
      temperature:       temp ? parseInt(temp) : null,
      medication_taken:  medications_taken.length > 0,
      medications_taken,
      notes:             notes || '',
    };

    if (this._state.editId) entry.id = this._state.editId;

    await App.db.saveSymptomsLog(entry);
    App.toast(this._state.editId ? 'Bejegyzés frissítve!' : 'Bejegyzés mentve!', 'success');
    App.navigate('log');
  },
};
