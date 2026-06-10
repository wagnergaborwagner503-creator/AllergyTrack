/* ═══════════════════════════════════════════
   AllergyTrack – Dashboard Page
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Dashboard = {
  async render() {
    const [recentLogs, pollenData, profile] = await Promise.all([
      App.db.getRecentLogs(5),
      App.db.getLatestPollenData(),
      App.db.getAllergenProfile(),
    ]);

    const today     = App.DATA.todayISO();
    const todayLogs = recentLogs.filter(l => l.date === today);
    const trackedIds = profile.map(p => p.allergen_id);

    /* Greeting */
    const greeting  = App.DATA.greetingText();
    const d         = new Date();
    const dayName   = App.DATA.DAYS_LONG[(d.getDay() + 6) % 7];
    const dateStr   = `${dayName}, ${App.DATA.MONTHS[d.getMonth()]} ${d.getDate()}.`;

    /* Today's worst symptom severity */
    const maxSev = todayLogs.length
      ? Math.max(...todayLogs.map(l => l.overall_severity || 0))
      : 0;

    /* Greeting emoji based on severity */
    const emoji = maxSev === 0 ? '😊' : maxSev <= 3 ? '🙂' : maxSev <= 6 ? '😐' : '😟';

    /* Pollen chips for tracked allergens */
    const pollenByAllergen = {};
    pollenData.forEach(p => {
      if (!pollenByAllergen[p.allergen_id] ||
          p.risk_level > pollenByAllergen[p.allergen_id].risk_level) {
        pollenByAllergen[p.allergen_id] = p;
      }
    });

    const trackedPollen = trackedIds.map(id => ({
      allergen: App.DATA.getAllergenById(id),
      data: pollenByAllergen[id] || null,
    })).filter(t => t.allergen);

    /* Season highlight — allergens in risk this month */
    const month = new Date().getMonth();
    const seasonal = App.DATA.ALLERGENS.seasonal
      .filter(a => (a.riskMonths || []).includes(month))
      .slice(0, 6);

    return `
    <div class="page" id="page-dashboard">
      <!-- Greeting card -->
      <div class="greeting-card mb-4">
        <div class="greeting">${greeting}!</div>
        <div class="greeting-name">${dateStr}</div>
        <div class="greeting-date">
          ${todayLogs.length
            ? `${todayLogs.length} bejegyzés ma · Súlyosság: ${maxSev}/10`
            : 'Ma még nincs bejegyzés'}
        </div>
        <div class="greeting-emoji">${emoji}</div>
      </div>

      <!-- Quick stats -->
      <div class="stats-row mb-4">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-value">${todayLogs.length}</div>
          <div class="stat-label">Mai bejegyzés</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌡️</div>
          <div class="stat-value">${maxSev > 0 ? maxSev : '–'}</div>
          <div class="stat-label">Max súlyosság</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌿</div>
          <div class="stat-value">${pollenData.length > 0 ? App.DATA.formatDateShort(pollenData[0]?.date) : '–'}</div>
          <div class="stat-label">Pollen adat</div>
        </div>
      </div>

      <!-- Pollen today -->
      ${pollenData.length > 0 ? `
      <div class="section-header mb-3">
        <div class="section-title">🌬️ Aktuális pollenszint</div>
        <div class="section-action" data-nav="pollen">Mind →</div>
      </div>
      <div class="allergen-row mb-4" id="pollen-chips-row">
        ${(trackedPollen.length > 0 ? trackedPollen : seasonal.map(a => ({ allergen: a, data: pollenByAllergen[a.id] || null }))).map(({ allergen, data }) => {
          const risk  = data ? data.risk_level : -1;
          const label = data ? App.DATA.RISK_LEVELS[risk]?.short : '–';
          const lvlCls = risk >= 0 ? `level-${risk}` : '';
          return `
          <div class="allergen-chip ${lvlCls}" data-nav="pollen">
            <span class="icon">${allergen.icon}</span>
            <span class="name">${allergen.name}</span>
            <span class="level" style="color:${risk >= 0 ? App.DATA.RISK_LEVELS[risk].color : 'var(--text-muted)'}">${label}</span>
          </div>`;
        }).join('')}
      </div>` : `
      <div class="card mb-4" style="text-align:center; padding: 20px 16px;">
        <div style="font-size:32px;margin-bottom:8px">🌿</div>
        <div style="font-size:13px;color:var(--text-3);margin-bottom:12px">Még nincs feltöltve pollenadatat.<br>Töltsd fel a hivatalos pollenjelentést!</div>
        <button class="btn btn-secondary btn-sm" data-nav="pollen">Adatok feltöltése</button>
      </div>`}

      <!-- Seasonal reminder -->
      ${seasonal.length > 0 ? `
      <div class="section-header mb-3">
        <div class="section-title">🗓️ Szezonális figyelmeztetés</div>
      </div>
      <div class="card mb-4">
        <div style="font-size:13px;color:var(--text-3);margin-bottom:10px">
          Jelenleg ezek az allergenek vannak szezonban:
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${seasonal.map(a => `
          <div class="chip chip-default">
            ${a.icon} ${a.name}
            <span style="font-size:10px;color:var(--text-muted);margin-left:2px">${a.season}</span>
          </div>`).join('')}
        </div>
      </div>` : ''}

      <!-- Recent logs -->
      <div class="section-header mb-3">
        <div class="section-title">📋 Legutóbbi bejegyzések</div>
        <div class="section-action" data-nav="log">Mind →</div>
      </div>
      ${recentLogs.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Még nincs bejegyzés</h3>
        <p>Rögzítsd az első tüneteidet a + gombbal!</p>
        <button class="btn btn-primary" id="dash-add-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Első bejegyzés
        </button>
      </div>` : `
      <div class="log-preview">
        ${recentLogs.map(log => {
          const sev = log.overall_severity || 0;
          const sevColor = sev <= 3 ? 'var(--success)' : sev <= 6 ? 'var(--warning)' : 'var(--danger)';
          const syms = (log.symptoms || []).slice(0, 3).map(s => {
            const sym = App.DATA.getSymptomById(s.id);
            return sym ? sym.icon : '';
          }).join('');
          return `
          <div class="log-item" data-log-id="${log.id}" data-nav="log-detail">
            <div class="log-item-icon">${syms || '📋'}</div>
            <div class="log-item-body">
              <div class="log-item-title">${App.DATA.formatDate(log.date)}</div>
              <div class="log-item-sub">
                ${(log.symptoms || []).length} tünet
                ${log.location ? ' · ' + log.location : ''}
                ${log.medication_taken ? ' · 💊 gyógyszer' : ''}
              </div>
            </div>
            <div class="log-item-severity" style="background:${sevColor}20;color:${sevColor}">
              ${sev > 0 ? sev : '–'}
            </div>
          </div>`;
        }).join('')}
      </div>`}
      <div style="height:16px"></div>
    </div>`;
  },

  mount() {
    /* Navigation links */
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.nav;
        if (target === 'log-detail') {
          App.navigate('log');
        } else {
          App.navigate(target);
        }
      });
    });
    const addBtn = document.getElementById('dash-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => App.navigate('log-new'));
  },
};
