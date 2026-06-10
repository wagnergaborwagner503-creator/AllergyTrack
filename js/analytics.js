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
      <div class="section-title mb-4">📊 Elemzés</div>

      <!-- Period selector -->
      <div class="pill-tabs mb-4" id="period-tabs">
        <div class="pill-tab" data-days="7">7 nap</div>
        <div class="pill-tab active" data-days="30">30 nap</div>
        <div class="pill-tab" data-days="90">3 hónap</div>
        <div class="pill-tab" data-days="365">1 év</div>
      </div>

      <!-- Summary cards -->
      <div id="analytics-summary" class="stats-row mb-4"></div>

      <!-- Calendar heatmap -->
      <div class="chart-wrap mb-4">
        <div class="chart-title">📅 Naptár nézet</div>
        <div id="cal-heatmap"></div>
        <div style="display:flex;gap:6px;align-items:center;margin-top:10px;font-size:11px;color:var(--text-3)">
          <span>Alacsony</span>
          ${[1,2,3,4,5].map(l => `<div style="width:14px;height:14px;border-radius:3px" data-level="${l}"></div>`).join('')}
          <span>Magas</span>
        </div>
      </div>

      <!-- Severity chart -->
      <div class="chart-wrap mb-4">
        <div class="chart-title">📈 Napi súlyosság</div>
        <canvas id="severity-chart" height="200"></canvas>
      </div>

      <!-- Symptom frequency -->
      <div class="chart-wrap mb-4">
        <div class="chart-title">🤧 Tünet előfordulás</div>
        <canvas id="symptom-chart" height="250"></canvas>
      </div>

      <!-- Pollen vs Symptoms -->
      <div class="chart-wrap mb-4">
        <div class="chart-title">🌿 Pollen vs. Tünetek</div>
        <canvas id="correlation-chart" height="220"></canvas>
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

    const [logs, pollenAll] = await Promise.all([
      App.db.getSymptomsLogs(fromStr),
      App.db.getPollenData(fromStr),
    ]);

    this._renderSummary(logs);
    this._renderCalendar(logs, days);
    this._renderSeverityChart(logs, days);
    this._renderSymptomChart(logs);
    this._renderCorrelationChart(logs, pollenAll);
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

  _renderCalendar(logs, days) {
    const el = document.getElementById('cal-heatmap');
    if (!el) return;

    /* Build severity map */
    const sevMap = {};
    logs.forEach(l => {
      if (!sevMap[l.date] || (l.overall_severity || 0) > sevMap[l.date]) {
        sevMap[l.date] = l.overall_severity || 0;
      }
    });

    /* Determine start (Monday of current week - days) */
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    /* Go back `days` days, then back to Monday */
    const start = new Date(today);
    start.setDate(start.getDate() - days);
    const dow = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dow);

    const headers = App.DATA.DAYS_SHORT.map(d => `<div class="cal-day-header">${d}</div>`).join('');

    let cells = '';
    const cur = new Date(start);
    while (cur <= today) {
      const iso  = cur.toISOString().split('T')[0];
      const sev  = sevMap[iso] || 0;
      const level = sev === 0 ? 0 : sev <= 2 ? 1 : sev <= 4 ? 2 : sev <= 6 ? 3 : sev <= 8 ? 4 : 5;
      const isToday = iso === App.DATA.todayISO();
      const future  = cur > today;
      cells += future
        ? `<div class="cal-day empty"></div>`
        : `<div class="cal-day${isToday ? ' today' : ''}" data-level="${level}" title="${iso}${sev > 0 ? ': ' + sev + '/10' : ''}">${cur.getDate()}</div>`;
      cur.setDate(cur.getDate() + 1);
    }

    el.innerHTML = `<div class="cal-grid">${headers}${cells}</div>`;

    /* Style the legend dots */
    const dots = el.querySelectorAll('[data-level]');
    dots.forEach(d => {
      /* already styled via CSS */
    });
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
            min: 0, max: 10,
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 2 },
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

    /* Average pollen risk by date */
    const pollenByDate = {};
    pollenAll.forEach(p => {
      if (!pollenByDate[p.date]) pollenByDate[p.date] = [];
      pollenByDate[p.date].push(p.risk_level);
    });

    const allDates = [...new Set([
      ...Object.keys(sevByDate),
      ...Object.keys(pollenByDate),
    ])].sort();

    if (allDates.length === 0) {
      this._destroyChart('correlation');
      return;
    }

    const labels     = allDates.map(d => App.DATA.formatDateShort(d));
    const symData    = allDates.map(d => {
      const arr = sevByDate[d];
      return arr ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    });
    const pollData   = allDates.map(d => {
      const arr = pollenByDate[d];
      return arr ? (arr.reduce((a, b) => a + b, 0) / arr.length) * (10 / 3) : null;
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
            pointRadius: 3, borderDash: [4, 4],
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: textC, usePointStyle: true, pointStyleWidth: 10, padding: 16 },
          }
        },
        scales: {
          y: {
            min: 0, max: 10,
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
    if (worst) insights.push({ icon: '😟', text: `Legrosszabb nap: ${App.DATA.formatDate(worst[0])} (${worst[1]}/10 súlyosság)` });

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
    const sevLabel = avg <= 3 ? 'enyhe' : avg <= 6 ? 'közepes' : 'súlyos';
    insights.push({ icon: '📊', text: `Átlagos tünet intenzitás: ${avg}/10 (${sevLabel})` });

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
