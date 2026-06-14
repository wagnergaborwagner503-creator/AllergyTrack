/* ═══════════════════════════════════════════
   AllergyTrack – Analytics Page
   Uses Chart.js from CDN
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Analytics = {
  _charts: [],
  _period: 30,

  async render() {
    return `
    <div class="page" id="page-analytics">
      <div class="section-title mb-4">Elemzés</div>

      <!-- Traditional month calendar -->
      <div class="chart-wrap mb-4">
        <div class="chart-title">Tünetnapló naptár</div>
        <p style="font-size:11px;color:var(--text-3);margin-bottom:8px">Koppints egy napra a részletekért</p>
        <div id="cal-heatmap"></div>
      </div>

      <!-- Period selector (for charts below only) -->
      <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Grafikonok időszaka</div>
      <div class="pill-tabs mb-4" id="period-tabs">
        <div class="pill-tab" data-days="7">7 nap</div>
        <div class="pill-tab active" data-days="30">30 nap</div>
        <div class="pill-tab" data-days="90">3 hónap</div>
        <div class="pill-tab" data-days="365">1 év</div>
      </div>

      <!-- Summary cards -->
      <div id="analytics-summary" class="stats-row mb-4"></div>

      <!-- Symptom frequency -->
      <div class="chart-wrap mb-4">
        <div class="chart-title">Tünet előfordulás</div>
        <canvas id="symptom-chart" height="250"></canvas>
      </div>

      <!-- Pollen vs Symptoms -->
      <div class="chart-wrap mb-4">
        <div class="chart-title">Pollen vs. Tünetek</div>
        <canvas id="correlation-chart" height="220"></canvas>
      </div>

      <!-- Forecast chart -->
      <div class="chart-wrap mb-4" id="forecast-chart-wrap" style="display:none">
        <div class="chart-title">Pollen előrejelzés – következő napok</div>
        <p style="font-size:11px;color:var(--text-3);margin-bottom:8px">Open-Meteo API előrejelzési adatok (mentett)</p>
        <canvas id="forecast-chart" height="220"></canvas>
      </div>

      <!-- Most likely allergens -->
      <div class="card mb-4">
        <div class="card-title mb-1">🔍 Ismétlődő pollen–tünet mintázatok</div>
        <div class="text-muted mb-3" style="font-size:11px">Mindig az összes rögzített adat alapján – az időszak-választó nem befolyásolja</div>
        <div id="likely-allergens-list"></div>
      </div>

      <!-- Top insights -->
      <div class="card mb-4">
        <div class="card-title mb-3">💡 Megállapítások</div>
        <div id="insights-list"></div>
      </div>
      <div style="height:16px"></div>
    </div>`;
  },

  async mount() {
    const self = this;
    this._destroyCharts();

    /* Period tab listeners */
    document.querySelectorAll('#period-tabs .pill-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#period-tabs .pill-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        self._period = parseInt(tab.dataset.days);
        self.loadData();
      });
    });

    await this.loadData();
  },

  async loadData() {
    const days  = this._period;
    const from  = new Date();
    from.setDate(from.getDate() - days);
    const fromStr = from.toISOString().split('T')[0];

    /* Future window: next 7 days */
    const fwDate = new Date(); fwDate.setDate(fwDate.getDate() + 1);
    const fwStr  = fwDate.toISOString().split('T')[0];
    const fwEnd  = new Date(); fwEnd.setDate(fwEnd.getDate() + 7);
    const fwEndStr = fwEnd.toISOString().split('T')[0];

    const [allLogs, logs, pollenAll, allPollenData, pollenForecast, locationHistory] = await Promise.all([
      App.db.getSymptomsLogs(),
      App.db.getSymptomsLogs(fromStr),
      App.db.getPollenData(fromStr),
      App.db.getPollenData(),               /* all pollen – used by day modal */
      App.db.getPollenData(fwStr, fwEndStr), /* future rows */
      App.db.getSetting('locationHistory', []),
    ]);

    /* Cache for day-popup */
    this._allLogs         = allLogs;
    this._cachedLogs      = logs;
    this._cachedPollen    = pollenAll;
    this._allPollenData   = allPollenData;
    this._pollenForecast  = pollenForecast;
    this._locationHistory = locationHistory || [];

    this._renderSummary(logs);
    this._renderCalendar(allLogs);
    this._renderSymptomChart(logs);
    this._renderCorrelationChart(logs, pollenAll);
    this._renderForecastChart(pollenForecast);
    /* Ismétlődő pollen–tünet mintázatok: MINDIG az összes (all-time) adatot
       nézi – az időszak-választó NEM befolyásolja. */
    this._renderLikelyAllergens(this._allLogs, this._allPollenData);
    this._renderInsights(logs, pollenAll);
  },

  _renderSummary(logs) {
    const el = document.getElementById('analytics-summary');
    if (!el) return;
    const totalDays = logs.length > 0
      ? new Set(logs.map(l => l.date)).size : 0;
    const maxSev = logs.length > 0
      ? Math.max(...logs.map(l => l.overall_severity || 0)) : 0;
    const avgSev = logs.length > 0
      ? (logs.reduce((s, l) => s + (l.overall_severity || 0), 0) / logs.length).toFixed(1) : 0;
    const medDays = logs.filter(l => l.medication_taken).length;

    el.innerHTML = `
      <div class="stat-card"><div class="stat-icon">📝</div>
        <div class="stat-value">${logs.length}</div><div class="stat-label">Bejegyzés</div></div>
      <div class="stat-card"><div class="stat-icon">📅</div>
        <div class="stat-value">${totalDays}</div><div class="stat-label">Aktív nap</div></div>
      <div class="stat-card"><div class="stat-icon">📊</div>
        <div class="stat-value">${avgSev}</div><div class="stat-label">Átlag súlyosság</div></div>
      <div class="stat-card"><div class="stat-icon">💊</div>
        <div class="stat-value">${medDays}</div><div class="stat-label">Gyógyszer nap</div></div>`;
  },

  /* ── Hónap-naptár állapota ──────────────────── */
  _calMonth: null,  /* 'YYYY-MM' */

  _renderCalendar(logs) {
    const el = document.getElementById('cal-heatmap');
    if (!el) return;

    /* Default: current month */
    if (!this._calMonth) {
      const now = new Date();
      this._calMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    }
    this._drawCalendarMonth(el, logs, this._calMonth);
  },

  _drawCalendarMonth(el, logs, ym) {
    /* Severity map across ALL logs */
    const sevRaw = {};
    logs.forEach(l => {
      if (!sevRaw[l.date]) sevRaw[l.date] = [];
      sevRaw[l.date].push(l.overall_severity || 0);
    });
    const sevMap = {};
    Object.entries(sevRaw).forEach(([date, vals]) => {
      sevMap[date] = Math.round(vals.reduce((a,b)=>a+b,0) / vals.length);
    });

    const [year, month] = ym.split('-').map(Number);
    const today     = new Date(); today.setHours(12,0,0,0);
    const todayISO  = App.DATA.todayISO();
    const todayYM   = todayISO.substring(0,7);
    const daysInMon = new Date(year, month, 0).getDate();
    const startDow  = (new Date(year, month-1, 1).getDay() + 6) % 7; /* Mon=0 */
    const monthLabel = `${App.DATA.MONTHS[month-1]} ${year}`;

    /* Pollen season for this month */
    const seasonPollens = this._pollenSeasonForMonth(month);

    const headers = App.DATA.DAYS_SHORT.map(d => `<div class="cal-day-header">${d}</div>`).join('');
    let cells = '';
    for (let i = 0; i < startDow; i++) cells += `<div class="cal-day empty"></div>`;
    for (let d = 1; d <= daysInMon; d++) {
      const iso    = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const sev    = sevMap[iso] || 0;
      const future = new Date(year, month-1, d) > today;
      const isToday = iso === todayISO;
      const rawStr  = sevRaw[iso] ? `: súlyosság ${(sevRaw[iso].reduce((a,b)=>a+b,0)/sevRaw[iso].length).toFixed(1)}/5` : '';
      if (future) {
        cells += `<div class="cal-day" style="opacity:.3;cursor:default">${d}</div>`;
      } else {
        cells += `<div class="cal-day${isToday ? ' today' : ''}" data-level="${sev}" data-date="${iso}" title="${iso}${rawStr}">${d}</div>`;
      }
    }

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <button class="date-nav-btn" id="cal-prev-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style="font-size:14px;font-weight:700;color:var(--text)">${monthLabel}</span>
        <button class="date-nav-btn" id="cal-next-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="cal-grid">${headers}${cells}</div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:10px;font-size:11px;color:var(--text-3)">
        <span>Súlyosság:</span>
        ${[1,2,3,4,5].map(l=>`
          <div style="display:flex;align-items:center;gap:3px">
            <div class="cal-swatch" data-level="${l}"></div>
            <span>${l}</span>
          </div>`).join('')}
      </div>
      ${seasonPollens.length > 0 ? `
      <div style="margin-top:10px;padding:8px 10px;background:var(--accent-bg);border-radius:var(--r-md)">
        <div style="font-size:11px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🌿 Szezon ebben a hónapban${ym > todayYM ? ' (előrejelzés)' : ''}</div>
        <div style="display:flex;flex-direction:column;gap:5px">
          ${seasonPollens.map(p=>`
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:16px;width:20px;text-align:center;flex-shrink:0">${p.icon}</span>
              <div style="min-width:0">
                <span style="font-size:12px;font-weight:600;color:var(--text)">${p.name}</span>
                ${p.season ? `<span style="font-size:10px;color:var(--text-3);margin-left:5px">${p.season}</span>` : ''}
                ${p.latinName ? `<div style="font-size:10px;color:var(--text-muted);font-style:italic">${p.latinName}</div>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>` : ''}
    `;

    /* Navigation */
    document.getElementById('cal-prev-btn')?.addEventListener('click', () => {
      const [y,m] = this._calMonth.split('-').map(Number);
      this._calMonth = m===1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`;
      this._drawCalendarMonth(el, logs, this._calMonth);
      this._bindCalDayClicks(el);
    });
    document.getElementById('cal-next-btn')?.addEventListener('click', () => {
      const [y,m] = this._calMonth.split('-').map(Number);
      const next = m===12 ? `${y+1}-01` : `${y}-${String(m+1).padStart(2,'0')}`;
      this._calMonth = next;
      this._drawCalendarMonth(el, logs, this._calMonth);
      this._bindCalDayClicks(el);
    });
    this._bindCalDayClicks(el);
  },

  _bindCalDayClicks(el) {
    el.querySelectorAll('.cal-day[data-date]').forEach(cell => {
      cell.addEventListener('click', () => this._showDayModal(cell.dataset.date));
    });
  },

  /* Pollen types in season for given month (1–12) */
  _pollenSeasonForMonth(month) {
    const SEASON = {
      1:  ['corylus'],
      2:  ['corylus','alnus'],
      3:  ['corylus','alnus','betula','fraxinus','populus'],
      4:  ['betula','fraxinus','quercus','platanus','populus'],
      5:  ['betula','quercus','poaceae','plantago'],
      6:  ['poaceae','plantago','urtica','rumex'],
      7:  ['poaceae','artemisia','urtica','plantago','rumex'],
      8:  ['ambrosia','artemisia','chenopodium','urtica'],
      9:  ['ambrosia','artemisia','chenopodium'],
      10: ['ambrosia'],
      11: [],
      12: [],
    };
    const ids = SEASON[month] || [];
    const all = [
      ...(App.DATA.ALLERGENS?.seasonal || []),
      ...(App.DATA.ALLERGENS?.general  || []),
    ];
    return ids.map(id => all.find(a => a.id === id)).filter(Boolean);
  },

  _showDayModal(date) {
    const dayLogs = (this._allLogs || []).filter(l => l.date === date);

    /* ── Összes helyszín ahol a felhasználó aznap volt ──────────────────
       1. Tünetnapló bejegyzések helyszínei
       2. GPS helyzetnaplózás (háttér, 3x/nap)                           */
    const visitedLower = new Set();
    dayLogs.forEach(l => {
      const loc = (l.location || '').trim().toLowerCase();
      if (loc) visitedLower.add(loc);
    });
    (this._locationHistory || []).filter(e => e.date === date).forEach(e => {
      const city = (e.city || '').trim().toLowerCase();
      if (city) visitedLower.add(city);
    });

    /* ── Aznapi pollenadatok: Közepes (≥2) és felette ──────────────────
       Minden helyszín összes adata – majd szűrjük/csoportosítjuk        */
    const allDayPollen = (this._allPollenData || []).filter(p =>
      p.date === date && p.risk_level >= 2
    );

    if (dayLogs.length === 0 && allDayPollen.length === 0) {
      App.toast('Erre a napra nincs rögzített adat.', 'info');
      return;
    }

    const dateStr = App.DATA.formatDate(date);

    /* ── Pollen csoportosítás helyszínenként ────────────────────────── */
    let pollenHtml = '';
    if (allDayPollen.length > 0) {
      /* Az összes helyszín ami szerepel az aznapi pollen-adatokban */
      const allLocLower = [...new Set(
        allDayPollen.map(p => (p.location || '').trim().toLowerCase()).filter(Boolean)
      )];

      /* Ha van helyszín-adat → csak azok a városok; fallback: összes */
      const shownLocs = visitedLower.size > 0
        ? allLocLower.filter(loc =>
            [...visitedLower].some(city => loc === city || loc.startsWith(city) || city.startsWith(loc))
          )
        : allLocLower;
      const locsToUse = shownLocs.length > 0 ? shownLocs : allLocLower;

      /* Csoportosítás: helyszín → max kockázat allergénenként, csökkenő sorrendben */
      const groups = {};
      allDayPollen.forEach(p => {
        const locKey = (p.location || '').trim().toLowerCase();
        if (!locsToUse.includes(locKey)) return;
        if (!groups[locKey]) groups[locKey] = { displayName: p.location || locKey, byAllergen: {} };
        const cur = groups[locKey].byAllergen[p.allergen_id];
        if (!cur || p.risk_level > cur.risk_level) {
          groups[locKey].byAllergen[p.allergen_id] = p;
        }
      });

      const groupList = Object.values(groups).map(g => ({
        name: g.displayName,
        pollen: Object.values(g.byAllergen).sort((a, b) => b.risk_level - a.risk_level),
      })).filter(g => g.pollen.length > 0)
        .sort((a, b) => {
          /* Előre a felhasználó által látogatott helyszínek */
          const aV = [...visitedLower].some(c => a.name.toLowerCase().startsWith(c)) ? 1 : 0;
          const bV = [...visitedLower].some(c => b.name.toLowerCase().startsWith(c)) ? 1 : 0;
          return bV - aV;
        });

      if (groupList.length > 0) {
        pollenHtml = `
          <div style="margin-bottom:16px">
            <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">Pollenadat</div>
            ${groupList.map(group => `
              <div style="margin-bottom:12px">
                <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:5px;display:flex;align-items:center;gap:4px">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="11" height="11"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${group.name}
                </div>
                ${group.pollen.map(p => {
                  const a  = App.DATA.getAllergenById(p.allergen_id);
                  const rl = App.DATA.RISK_LEVELS[Math.min(p.risk_level, 4)];
                  return `<div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid var(--border-2)">
                    <span style="font-size:17px;width:22px;text-align:center;flex-shrink:0">${a?.icon || '🌿'}</span>
                    <div style="flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--text-1)">${a?.name || p.allergen_id}</div>
                    <span class="risk-label ${rl?.cssClass}">${rl?.short || '?'}</span>
                  </div>`;
                }).join('')}
              </div>`).join('')}
          </div>`;
      }
    }

    /* ── Rögzített tünetek ──────────────────────────────────────────── */
    let logsHtml = '';
    if (dayLogs.length > 0) {
      /* Időrendben, korábbi időpont felül */
      const sortedLogs = [...dayLogs].sort((a, b) =>
        (a.time || '00:00').localeCompare(b.time || '00:00')
      );
      logsHtml = `
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Rögzített tünetek</div>
          ${sortedLogs.map(log => {
            const sev = log.overall_severity || 0;
            const sevColor = sev <= 2 ? 'var(--success)' : sev <= 3 ? 'var(--warning)' : 'var(--danger)';
            const symptoms = (log.symptoms || []).map(s => {
              const sym = App.DATA.getSymptomById(s.id);
              return sym ? `${sym.icon} ${sym.name}` : s.id;
            }).join(' · ');
            const locLabel = log.location
              ? `<span style="font-size:11px;color:var(--accent);font-weight:600">📍 ${log.location}</span>` : '';
            return `<div style="padding:8px 0;border-bottom:1px solid var(--border-2)">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:13px;font-weight:600;color:var(--text-1)">${log.time || 'Egész nap'}</span>
                  ${locLabel}
                </div>
                <span style="background:${sevColor}18;color:${sevColor};font-size:11px;font-weight:700;padding:2px 8px;border-radius:var(--r-full)">${sev > 0 ? sev+'/5' : '–'}</span>
              </div>
              ${symptoms ? `<div style="font-size:12px;color:var(--text-2);line-height:1.6">${symptoms}</div>` : ''}
              ${log.notes ? `<div style="font-size:12px;color:var(--text-3);margin-top:4px;font-style:italic">"${log.notes}"</div>` : ''}
              ${log.medication_taken ? `<div style="font-size:11px;color:var(--info);margin-top:3px">💊 Gyógyszer szedve</div>` : ''}
            </div>`;
          }).join('')}
        </div>`;
    }

    App.showModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">${dateStr}</div>
      ${pollenHtml}${logsHtml}
      <button class="btn btn-ghost" style="width:100%;margin-top:16px" onclick="App.closeModal()">Bezárás</button>
    `);
  },

  _renderSeverityChart(logs, days) {
    const canvas = document.getElementById('severity-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    /* Build date array */
    const labels = [];
    const data   = [];
    const today  = new Date();
    for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      labels.push(App.DATA.MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate());
      const dayLogs = logs.filter(l => l.date === iso);
      const maxSev = dayLogs.length > 0
        ? Math.max(...dayLogs.map(l => l.overall_severity || 0)) : null;
      data.push(maxSev);
    }

    this._destroyChart('severity');
    const isDark = document.documentElement.dataset.theme === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)';
    const textColor = isDark ? '#6E9870' : '#6E8E70';

    this._charts.push({ key: 'severity', chart: new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Súlyosság',
          data,
          fill: true,
          tension: 0.4,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76,175,80,.15)',
          pointBackgroundColor: data.map(v => v === null ? 'transparent' : '#4CAF50'),
          pointBorderColor: 'transparent',
          pointRadius: 4,
          spanGaps: false,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 0, max: 5,
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 1 },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              maxTicksLimit: 8,
              maxRotation: 0,
            },
          }
        }
      }
    })});
  },

  _renderSymptomChart(logs) {
    const canvas = document.getElementById('symptom-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const freq = {};
    logs.forEach(l => (l.symptoms || []).forEach(s => {
      freq[s.id] = (freq[s.id] || 0) + 1;
    }));

    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labels = sorted.map(([id]) => {
      const s = App.DATA.getSymptomById(id);
      return s ? s.icon + ' ' + s.name : id;
    });
    const data = sorted.map(([, v]) => v);
    const colors = [
      '#4CAF50','#66BB6A','#81C784','#A5D6A7',
      '#C8E6C9','#388E3C','#2E7D32','#1B5E20',
      '#558B2F','#8BC34A'
    ];

    this._destroyChart('symptom');
    const isDark = document.documentElement.dataset.theme === 'dark';
    const textColor = isDark ? '#6E9870' : '#6E8E70';

    this._charts.push({ key: 'symptom', chart: new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Előfordulás',
          data,
          backgroundColor: colors,
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)' },
            ticks: { color: textColor },
          },
          y: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 12 } },
          }
        }
      }
    })});
  },

  _renderCorrelationChart(logs, pollenAll) {
    const canvas = document.getElementById('correlation-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    /* Build date-keyed structures */
    const sevByDate = {};
    logs.forEach(l => {
      if (!sevByDate[l.date]) sevByDate[l.date] = [];
      sevByDate[l.date].push(l.overall_severity || 0);
    });

    /* Average pollen risk by date – csak Alacsony (≥1) és feletti értékek;
       Nincs (0) és n.a. adatok nem kerülnek be az átlagba */
    const pollenByDate = {};
    pollenAll.forEach(p => {
      if (p.risk_level < 1) return;
      if (!pollenByDate[p.date]) pollenByDate[p.date] = [];
      pollenByDate[p.date].push(p.risk_level);
    });

    /* ── Top-3 allergens: háromtényezős pontozás ───────────────────────────
       1. Trend-korreláció     (40%) – Pearson r(allergenRisk, tünetSúlyosság)
          Ha az allergén erősödik ÉS a tünetek is erősödnek → magas pont
          Ha gyengülnek ÉS a tünetek is gyengülnek → szintén magas pont
       2. Helyzet-alapú egyidejűség (35%) – tünetes napokon, a felhasználó
          tartózkodási helyén magas volt-e ez az allergén?
       3. Tünet-típus egyezés  (25%) – az allergén ismert tünetei mennyire
          fedik a naplózott tüneteket (matchSymptoms)                        */

    const allSymptomIds = [...new Set(
      logs.flatMap(l => (l.symptoms || []).map(s => s.id))
    )];

    /* Per-allergen risk data keyed by date (numbers → used for chart lines too) */
    const byAllergenDate = {};
    pollenAll.forEach(p => {
      if (!byAllergenDate[p.allergen_id]) byAllergenDate[p.allergen_id] = {};
      const bucket = byAllergenDate[p.allergen_id];
      if (!bucket[p.date]) bucket[p.date] = [];
      bucket[p.date].push(p.risk_level);
    });

    /* Pre-index pollenAll by allergenId|date for location-aware lookup */
    const pollenIdx = {};
    pollenAll.forEach(p => {
      const key = `${p.allergen_id}|${p.date}`;
      if (!pollenIdx[key]) pollenIdx[key] = [];
      pollenIdx[key].push(p);
    });

    /* Location history: date → Set of cities (log entries + GPS history) */
    const locByDate = {};
    (this._locationHistory || []).forEach(e => {
      if (!locByDate[e.date]) locByDate[e.date] = new Set();
      locByDate[e.date].add((e.city || '').toLowerCase());
    });
    logs.forEach(l => {
      if (l.location) {
        if (!locByDate[l.date]) locByDate[l.date] = new Set();
        locByDate[l.date].add(l.location.toLowerCase().trim());
      }
    });

    /* Helper: location-aware average risk for an allergen on a given day */
    const getLocRisk = (aid, date) => {
      const rows = pollenIdx[`${aid}|${date}`];
      if (!rows || !rows.length) return null;
      const cities = locByDate[date];
      if (cities && cities.size > 0) {
        const local = rows.filter(p => {
          const pl = (p.location || '').toLowerCase();
          return [...cities].some(c => pl.includes(c) || c.includes(pl.split(' ')[0]));
        });
        if (local.length > 0)
          return local.reduce((s, p) => s + p.risk_level, 0) / local.length;
      }
      return rows.reduce((s, p) => s + p.risk_level, 0) / rows.length;
    };

    /* Pearson correlation coefficient between two equal-length numeric arrays */
    const pearson = (xs, ys) => {
      const n = xs.length;
      if (n < 2) return 0;
      const mx = xs.reduce((a, b) => a + b, 0) / n;
      const my = ys.reduce((a, b) => a + b, 0) / n;
      const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
      const dx  = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0));
      const dy  = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0));
      return (dx === 0 || dy === 0) ? 0 : num / (dx * dy);
    };

    /* Score every allergen that appears in the period */
    let top3 = Object.keys(byAllergenDate).map(aid => {
      /* ① Tünet-típus egyezés (0→1) */
      const matchNorm = allSymptomIds.length > 0
        ? App.DATA.matchSymptoms(aid, allSymptomIds) / 100 : 0.5;

      /* ② Helyzet-alapú egyidejűség (0→1) – tünetes napokon volt-e ott?
            Városra jellemző allergén szorzóval + eső-mosás korrekcióval   */
      let coSum = 0, coCnt = 0;
      Object.keys(sevByDate).forEach(d => {
        const risk = getLocRisk(aid, d);
        if (risk === null) return;
        const sev = sevByDate[d].reduce((a, b) => a + b, 0) / sevByDate[d].length;
        /* Városra jellemző szorzó: megmutatja, mennyire valószínű, hogy
           ez az allergén jelen volt a felhasználó tartózkodási helyén    */
        const cities = locByDate[d];
        let cityFactor = 1.0;
        if (cities && cities.size > 0) {
          const factors = [...cities].map(c => App.DATA.cityAllergenScore(aid, c));
          cityFactor = factors.reduce((a,b) => a+b, 0) / factors.length;
        }
        coSum += risk * sev * cityFactor; coCnt++;
      });
      const coNorm = coCnt > 0 ? Math.min(1, coSum / coCnt / 20) : 0;

      /* ③ Trend-korreláció – Pearson r(allergenRisk, tünetSúlyosság) */
      const sharedDates = Object.keys(sevByDate).filter(d => getLocRisk(aid, d) !== null);
      let trendNorm = 0;
      if (sharedDates.length >= 3) {
        const allergenVals = sharedDates.map(d => getLocRisk(aid, d));
        const sevVals      = sharedDates.map(d =>
          sevByDate[d].reduce((a, b) => a + b, 0) / sevByDate[d].length
        );
        trendNorm = Math.max(0, pearson(allergenVals, sevVals)); /* csak pozitív korreláció */
      }

      const score = matchNorm * 0.25 + coNorm * 0.35 + trendNorm * 0.40;
      return { aid, score };
    }).filter(e => e.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

    /* Fallback (még nincs tünetnapló): top 3 átlagos kockázat szerint */
    if (top3.length === 0) {
      top3 = Object.keys(byAllergenDate).map(aid => {
        const vals = Object.values(byAllergenDate[aid]).flat();
        const avg  = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return { aid, score: avg };
      }).filter(e => e.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    }

    const allDates = [...new Set([
      ...Object.keys(sevByDate),
      ...Object.keys(pollenByDate),
    ])].sort();

    if (allDates.length === 0) {
      this._destroyChart('correlation');
      return;
    }

    /* Also include future forecast dates in the date list */
    const todayISO = App.DATA.todayISO();
    const forecastDates = this._pollenForecast
      ? [...new Set(this._pollenForecast.map(p => p.date))].sort().slice(0, 3)
      : [];
    /* Előrejelzés átlag – szintén csak Alacsony (≥1) és feletti értékek */
    const forecastPollenByDate = {};
    (this._pollenForecast || []).forEach(p => {
      if (p.risk_level < 1) return;
      if (!forecastPollenByDate[p.date]) forecastPollenByDate[p.date] = [];
      forecastPollenByDate[p.date].push(p.risk_level);
    });

    const extDates = [...new Set([...allDates, ...forecastDates])].sort();

    const labels     = extDates.map((d, i) => {
      const short = App.DATA.formatDateShort(d);
      return d > todayISO ? '→' + short : short;
    });
    const symData    = extDates.map(d => {
      if (d > todayISO) return null;           /* no symptoms in future */
      const arr = sevByDate[d];
      return arr ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    });
    const pollData   = extDates.map(d => {
      if (d > todayISO) return null;  /* pollen line only up to today */
      const arr = pollenByDate[d];
      /* Scale pollen 0-4 → 0-5 to match symptom severity axis */
      return arr ? (arr.reduce((a, b) => a + b, 0) / arr.length) * (5 / 4) : null;
    });
    const forecastData = extDates.map(d => {
      if (d <= todayISO) return null;
      const arr = forecastPollenByDate[d];
      return arr ? (arr.reduce((a, b) => a + b, 0) / arr.length) * (5 / 4) : null;
    });

    /* Bridge: copy the last non-null green (pollData) value into forecastData
       so Chart.js draws a continuous yellow line from the last historical
       pollen point to the first forecast point. */
    const lastPollIdx = pollData.reduceRight(
      (found, v, i) => (found === -1 && v !== null ? i : found), -1
    );
    if (lastPollIdx !== -1) {
      forecastData[lastPollIdx] = pollData[lastPollIdx];
    }

    /* Build top-3 allergen datasets (dashed thin lines) */
    const TOP3_PALETTE = [
      { line: '#26C6DA', bg: 'rgba(38,198,218,.08)'  },   /* teal */
      { line: '#AB47BC', bg: 'rgba(171,71,188,.08)'  },   /* purple */
      { line: '#FF7043', bg: 'rgba(255,112,67,.08)'  },   /* orange */
    ];
    const top3Datasets = top3.map(({ aid }, idx) => {
      const info = App.DATA.getAllergenById(aid);
      const label = info ? `${info.icon} ${info.name}` : aid;
      const col   = TOP3_PALETTE[idx];
      const data  = extDates.map(d => {
        if (d > todayISO) return null;
        const arr = byAllergenDate[aid]?.[d];
        return arr ? (arr.reduce((a,b) => a+b,0) / arr.length) * (5/4) : null;
      });
      return {
        label,
        data,
        borderColor: col.line,
        backgroundColor: col.bg,
        fill: false, tension: 0.4, spanGaps: false,
        borderDash: [5, 4],
        borderWidth: 1.5,
        pointRadius: 2,
        pointHoverRadius: 4,
      };
    });

    this._destroyChart('correlation');
    const isDark   = document.documentElement.dataset.theme === 'dark';
    const gridC    = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)';
    const textC    = isDark ? '#6E9870' : '#6E8E70';

    this._charts.push({ key: 'correlation', chart: new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Tünet súlyosság',
            data: symData,
            borderColor: '#EF5350',
            backgroundColor: 'rgba(239,83,80,.1)',
            fill: false, tension: 0.4, spanGaps: false,
            pointRadius: 3,
          },
          {
            label: 'Pollenszint (norm.)',
            data: pollData,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76,175,80,.1)',
            fill: false, tension: 0.4, spanGaps: false,
            pointRadius: 3,
          },
          {
            label: 'Előrejelzés (pollen)',
            data: forecastData,
            borderColor: '#FFD600',
            backgroundColor: 'rgba(255,214,0,.1)',
            fill: false, tension: 0.4,
            /* spanGaps: true bridges the null gap between the last historical
               point and the first forecast point. */
            spanGaps: true,
            pointRadius: 4,
            pointStyle: 'circle',
          },
          /* Top-3 allergens matching user's symptoms – thin dashed lines */
          ...top3Datasets,
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: textC,
              usePointStyle: true,
              pointStyleWidth: 10,
              padding: 12,
              font: { size: 11 },
            },
          }
        },
        scales: {
          y: {
            min: 0, max: 5,
            grid: { color: gridC },
            ticks: { color: textC },
          },
          x: {
            grid: { display: false },
            ticks: { color: textC, maxTicksLimit: 8, maxRotation: 0 },
          }
        }
      }
    })});
  },

  _renderInsights(logs, pollenAll) {
    const el = document.getElementById('insights-list');
    if (!el) return;
    if (logs.length === 0) {
      el.innerHTML = '<div class="text-sm text-muted">Még nincs elég adat a megállapításokhoz.</div>';
      return;
    }

    const insights = [];

    /* Worst day */
    const byDate = {};
    logs.forEach(l => {
      if (!byDate[l.date] || (l.overall_severity || 0) > byDate[l.date]) {
        byDate[l.date] = l.overall_severity || 0;
      }
    });
    const worst = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];
    if (worst) insights.push({ icon: '😟', text: `Legrosszabb nap: ${App.DATA.formatDate(worst[0])} (${worst[1]}/5 súlyosság)` });

    /* Most common symptom */
    const freq = {};
    logs.forEach(l => (l.symptoms || []).forEach(s => { freq[s.id] = (freq[s.id] || 0) + 1; }));
    const topSym = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (topSym) {
      const s = App.DATA.getSymptomById(topSym[0]);
      if (s) insights.push({ icon: s.icon, text: `Leggyakoribb tünet: ${s.name} (${topSym[1]}×)` });
    }

    /* Medication days */
    const medDays = logs.filter(l => l.medication_taken).length;
    if (medDays > 0) insights.push({ icon: '💊', text: `Gyógyszert szedtél ${medDays} napon` });

    /* Average severity */
    const avg = (logs.reduce((s, l) => s + (l.overall_severity || 0), 0) / logs.length).toFixed(1);
    const sevLabel = avg <= 2 ? 'enyhe' : avg <= 3 ? 'közepes' : 'súlyos';
    insights.push({ icon: '📊', text: `Átlagos tünet intenzitás: ${avg}/5 (${sevLabel})` });

    /* High pollen days */
    const highPollenDates = new Set(
      pollenAll.filter(p => p.risk_level >= 2).map(p => p.date)
    );
    if (highPollenDates.size > 0) {
      insights.push({ icon: '🌿', text: `${highPollenDates.size} magas pollenszintű napot mértünk a periódusban` });
    }

    el.innerHTML = insights.map(ins => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-2)">
        <span style="font-size:20px;line-height:1.3">${ins.icon}</span>
        <span style="font-size:14px;color:var(--text-2);line-height:1.5">${ins.text}</span>
      </div>`).join('');
  },

  _renderLikelyAllergens(logs, pollenAll) {
    const el = document.getElementById('likely-allergens-list');
    if (!el) return;

    if (logs.length === 0 || pollenAll.length === 0) {
      el.innerHTML = '<div class="text-sm text-muted">Nincs elegendő adat az elemzéshez.<br>Tünetnapló + pollenadat szükséges.</div>';
      return;
    }

    /* ── MINIMUM 14 tünetadatos nap szükséges az elemzéshez ──
       Az összes (nem csak a kiválasztott időszakbeli) naplót nézzük,
       hogy a 7 napos nézetben is elérhető legyen az elemzés. */
    const MIN_SYMPTOM_DAYS = 14;
    const allSymptomDays = new Set((this._allLogs || logs).map(l => l.date)).size;
    if (allSymptomDays < MIN_SYMPTOM_DAYS) {
      const pct = Math.round((allSymptomDays / MIN_SYMPTOM_DAYS) * 100);
      el.innerHTML = `
        <div style="text-align:center;padding:14px 8px 8px">
          <div style="font-size:34px;margin-bottom:8px">📊</div>
          <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:4px">
            Még ${MIN_SYMPTOM_DAYS - allSymptomDays} nap tünetadat szükséges
          </div>
          <div style="font-size:12px;color:var(--text-3);line-height:1.5;margin-bottom:12px">
            A megbízható mintázat-elemzéshez legalább <strong>${MIN_SYMPTOM_DAYS} olyan nap</strong> kell,
            amelyen rögzítettél tünetadatot. Jelenleg: <strong>${allSymptomDays}/${MIN_SYMPTOM_DAYS} nap</strong>.
          </div>
          <div class="progress-bar-wrap" style="max-width:220px;margin:0 auto">
            <div class="progress-bar" style="width:${pct}%"></div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:6px">
            Tipp: a tünetmentes napokat is rögzítheted – azok is számítanak!
          </div>
        </div>`;
      return;
    }

    /* How many unique symptom log days do we have? */
    const symptomDays = new Set(logs.map(l => l.date)).size;

    /* Build daily severity map */
    const sevByDate = {};
    logs.forEach(l => {
      const s = l.overall_severity || 0;
      if (!sevByDate[l.date] || s > sevByDate[l.date]) sevByDate[l.date] = s;
    });

    /* Build location-per-date index from background location history.
       If the user was in a known city on a given date, only use pollen data
       from that city for that date. This prevents false allergen attributions
       from distant cities the user never visited. */
    const locByDate = {};
    (this._locationHistory || []).forEach(e => {
      if (!locByDate[e.date]) locByDate[e.date] = new Set();
      locByDate[e.date].add(e.city.toLowerCase());
    });
    /* Fallback: also include manually-logged log locations */
    logs.forEach(l => {
      if (!l.location) return;
      if (!locByDate[l.date]) locByDate[l.date] = new Set();
      locByDate[l.date].add(l.location.toLowerCase().trim());
    });
    const hasLocationData = Object.keys(locByDate).length > 0;

    /* For each allergen, compute correlation score:
       sum of (risk_level × symptom_severity) on overlapping days.
       Only count days where both symptom AND pollen risk are non-zero.
       If location history available: only use pollen data from user's city. */
    const scores  = {};
    const overlap = {};
    pollenAll.forEach(p => {
      const sev = sevByDate[p.date];
      if (!sev || p.risk_level === 0) return;   /* skip zero-risk or symptom-free days */

      /* Location filter: if we know where user was, skip distant stations */
      if (hasLocationData && locByDate[p.date]) {
        const pLoc = (p.location || '').toLowerCase();
        const inRange = [...locByDate[p.date]].some(city =>
          pLoc.includes(city) || city.includes(pLoc.split(' ')[0])
        );
        if (!inRange) return;
      }

      /* Városra jellemző allergén szorzó – pl. fenyőfélék Győrben ritkák */
      const visitedCities = locByDate[p.date] ? [...locByDate[p.date]] : [];
      let cityFactor = 1.0;
      if (visitedCities.length > 0) {
        const factors = visitedCities.map(c => App.DATA.cityAllergenScore(p.allergen_id, c));
        cityFactor = factors.reduce((a,b) => a+b, 0) / factors.length;
      }

      /* Időjárás-korrekció: esős napokon a pollen kevésbé terheli a légutakat */
      const logEntry = logs.filter(l => l.date === p.date);
      const isRainy  = logEntry.some(l => {
        const h = (l.environment || {}).humidity || '';
        return h === 'rainy' || h === 'rain' || h === 'humid';
      });
      const weatherFactor = isRainy ? 0.4 : 1.0;

      const weightedScore = p.risk_level * sev * cityFactor * weatherFactor;
      scores[p.allergen_id]  = (scores[p.allergen_id]  || 0) + weightedScore;
      overlap[p.allergen_id] = (overlap[p.allergen_id] || 0) + 1;
    });

    /* Minimum 3 overlapping days required to include an allergen */
    const MIN_OVERLAP_DAYS = 3;

    const ranked = Object.entries(scores)
      .map(([id, score]) => {
        const n = overlap[id] || 1;
        return { id, score, avg: score / n, days: n };
      })
      .filter(r => r.days >= MIN_OVERLAP_DAYS)   /* pattern requires repeated evidence */
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    if (ranked.length === 0) {
      el.innerHTML = `
        <div style="font-size:12px;color:var(--text-muted);line-height:1.6;padding:8px 0">
          Nincs elegendő ismétlődő mintázat az elemzéshez.<br>
          Legalább <strong>${MIN_OVERLAP_DAYS} olyan napra</strong> van szükség, ahol egyszerre volt rögzítve tünet és magas pollenszint.
        </div>`;
      return;
    }

    const maxAvg  = ranked[0].avg || 1;
    const lowData = symptomDays < 14;

    /* Always show disclaimer */
    const locNote = hasLocationData
      ? ' Az elemzés csak a tartózkodási helynek megfelelő városok pollenadatait veszi figyelembe.'
      : ' GPS-előzmény hiányában az összes állomás adatait veszi figyelembe – ez téves egybeeséseket okozhat.';
    let html = `
      <div style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--r-md);padding:8px 10px;margin-bottom:12px;font-size:11px;color:var(--text-3);display:flex;gap:6px;align-items:flex-start">
        <span>ℹ️</span>
        <span><strong>Statisztikai mintázat – nem orvosi diagnózis.</strong> Az alkalmazás ismétlődő egybeeséseket keres a tünetek és a pollenadatok között.${locNote} Allergén azonosításhoz allergológusi vizsgálat szükséges.</span>
      </div>`;

    if (lowData) {
      html += `<div style="background:var(--warning-bg);border:1px solid rgba(230,81,0,.25);border-radius:var(--r-md);padding:8px 10px;margin-bottom:12px;font-size:11px;color:var(--warning);display:flex;gap:6px;align-items:flex-start">
        <span>⚠️</span>
        <span>Csak <strong>${symptomDays} nap</strong> tünetadat – az eredmények kevésbé megbízhatók. Legalább 14 nap ajánlott a pontosabb mintázatfelismeréshez.</span>
      </div>`;
    }

    html += `<div style="font-size:10px;color:var(--text-muted);margin-bottom:8px;line-height:1.4">
      A sáv a relatív egybeesési pontszámot mutatja (a legjobb=100%). Csak legalább ${MIN_OVERLAP_DAYS} napos ismétlődő mintázat jelenik meg.
    </div>`;

    html += ranked.map((r, i) => {
      const a   = App.DATA.getAllergenById(r.id);
      if (!a) return '';
      const pct = Math.round((r.avg / maxAvg) * 100);
      const col = i === 0 ? 'var(--danger)' : i === 1 ? 'var(--warning)' : 'var(--accent)';
      /* Only show top-label when there is enough data */
      const topLabel = (i === 0 && !lowData && r.days >= 7)
        ? '<span style="font-size:10px;background:var(--danger-bg);color:var(--danger);border-radius:var(--r-full);padding:1px 6px;font-weight:700;margin-left:4px">legtöbb egybeesés</span>'
        : '';
      return `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600;color:var(--text)">${a.icon} ${a.name}${topLabel}</span>
          <span style="font-size:11px;color:var(--text-3)">${r.days} nap</span>
        </div>
        <div style="background:var(--bg-3);border-radius:var(--r-full);height:8px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${col};border-radius:var(--r-full);transition:width .4s ease"></div>
        </div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:3px">
          Relatív arány: ${pct}% · ${r.days} nap ismétlődő egybeesés
        </div>
      </div>`;
    }).join('');

    el.innerHTML = html;
  },

  /* ── Pollen előrejelzés chart ─────────────────────
     Shows forecast pollen risk (0-4) for the next 7 days
     grouped by allergen type as a grouped bar chart. */
  _renderForecastChart(pollenForecast) {
    const wrap   = document.getElementById('forecast-chart-wrap');
    const canvas = document.getElementById('forecast-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    this._destroyChart('forecast');

    if (!pollenForecast || pollenForecast.length === 0) {
      if (wrap) wrap.style.display = 'none';
      return;
    }

    /* Build sorted date list */
    const dates = [...new Set(pollenForecast.map(p => p.date))].sort().slice(0, 3);
    if (dates.length === 0) { if (wrap) wrap.style.display = 'none'; return; }

    /* Allergens with any non-zero risk */
    const allergenIds = [...new Set(pollenForecast.map(p => p.allergen_id))];
    const notable = allergenIds.filter(id =>
      pollenForecast.some(p => p.allergen_id === id && p.risk_level > 0)
    ).slice(0, 7);   /* cap at 7 for readability */

    if (notable.length === 0) { if (wrap) wrap.style.display = 'none'; return; }

    /* Per allergen: AVERAGE risk per date across all cities (Hungary-wide) */
    const datasets = notable.map(id => {
      const a    = App.DATA.getAllergenById(id);
      const data = dates.map(date => {
        const rows = pollenForecast.filter(p => p.date === date && p.allergen_id === id);
        if (!rows.length) return 0;
        return Math.round(rows.reduce((s, p) => s + p.risk_level, 0) / rows.length);
      });
      const baseColor = a?.color || '#4CAF50';
      return {
        label: (a?.icon || '') + ' ' + (a?.name || id),
        data,
        backgroundColor: baseColor + 'CC',
        borderColor:     baseColor,
        borderWidth: 1,
        borderRadius: 4,
      };
    });

    const isDark   = document.documentElement.dataset.theme === 'dark';
    const gridC    = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)';
    const textC    = isDark ? '#6E9870' : '#6E8E70';

    const labels = dates.map(d => {
      const today  = App.DATA.todayISO();
      const diff   = Math.round((new Date(d) - new Date(today)) / 86400000);
      const obj    = new Date(d);
      const suffix = App.DATA.MONTHS_SHORT?.[obj.getMonth()]
        ? App.DATA.MONTHS_SHORT[obj.getMonth()] + ' ' + obj.getDate()
        : d.slice(5);
      return diff === 1 ? `Holnap (${suffix})` : `+${diff}n (${suffix})`;
    });

    if (wrap) wrap.style.display = '';

    this._charts.push({ key: 'forecast', chart: new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: textC, usePointStyle: true, pointStyleWidth: 10, padding: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const riskLabels = ['Nincs','Alacsony','Közepes','Magas','Extrém'];
                return ` ${ctx.dataset.label}: ${riskLabels[ctx.raw] || ctx.raw}`;
              }
            }
          }
        },
        scales: {
          y: {
            min: 0, max: 4,
            grid: { color: gridC },
            ticks: {
              color: textC, stepSize: 1,
              callback: v => ['Nincs','Alacsony','Közepes','Magas','Extrém'][v] || v,
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: textC, maxRotation: 0 },
          }
        }
      }
    })});
  },

  _destroyChart(key) {
    const idx = this._charts.findIndex(c => c.key === key);
    if (idx >= 0) {
      this._charts[idx].chart.destroy();
      this._charts.splice(idx, 1);
    }
  },

  _destroyCharts() {
    this._charts.forEach(c => c.chart.destroy());
    this._charts = [];
  },
};
