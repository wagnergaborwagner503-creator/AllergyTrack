/* ═══════════════════════════════════════════
   AllergyTrack – Dashboard Page
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Dashboard = {
  async render() {
    const today     = App.DATA.todayISO();
    /* forecastFrom = tomorrow; load a week ahead */
    const fwDate    = new Date(); fwDate.setDate(fwDate.getDate() + 1);
    const fwStr     = fwDate.toISOString().split('T')[0];
    const fwEndDate = new Date(); fwEndDate.setDate(fwEndDate.getDate() + 6);
    const fwEndStr  = fwEndDate.toISOString().split('T')[0];

    const [recentLogs, pollenDataRaw, pollenAllRaw, pollenForecast, profile, userLocation] = await Promise.all([
      App.db.getRecentLogs(5),
      App.db.getLatestPollenData(),
      App.db.getPollenData(),
      App.db.getPollenData(fwStr, fwEndStr),   /* future rows from DB */
      App.db.getAllergenProfile(),
      App.db.getSetting('userLocation', null),
    ]);

    /* Filter pollen data to user's region if GPS is available; else use all (Hungary average) */
    const userCity = userLocation?.nearestCity?.toLowerCase() || null;
    const filterByCity = (rows) => {
      if (!userCity) return rows;  /* no GPS → all cities */
      const local = rows.filter(r => (r.location || '').toLowerCase().includes(userCity));
      return local.length > 0 ? local : rows;  /* fallback to all if no local data */
    };
    const pollenData = filterByCity(pollenDataRaw);
    const pollenAll  = filterByCity(pollenAllRaw);

    const todayLogs  = recentLogs.filter(l => l.date === today);
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

    /* Greeting emoji based on severity (1-5 scale) */
    const emoji = maxSev === 0 ? '😊' : maxSev <= 2 ? '🙂' : maxSev <= 3 ? '😐' : '😟';

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

    /* ── Allergen risk alert: correlate high-pollen days with high-symptom days ── */
    const allergenAlerts = this._computeAllergenAlerts(pollenAll, recentLogs, pollenByAllergen);

    return `
    <div class="page" id="page-dashboard">
      <!-- Greeting card -->
      <div class="greeting-card mb-4">
        <div class="greeting">${greeting}!</div>
        <div class="greeting-name">${dateStr}</div>
        <div class="greeting-date">
          ${todayLogs.length
            ? `${todayLogs.length} bejegyzés ma · Súlyosság: ${maxSev}/5`
            : 'Ma még nincs bejegyzés'}
        </div>
        <div class="greeting-emoji">${emoji}</div>
        <!-- Időjárás kis sor a greeting cardban -->
        <div id="weather-current-strip" style="margin-top:8px;font-size:12px;color:rgba(255,255,255,.8);display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <span id="wc-icon">⏳</span>
          <span id="wc-temp"></span>
          <span id="wc-hum"></span>
          <span id="wc-cloud"></span>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="stats-row mb-4">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="stat-value">${todayLogs.length}</div>
          <div class="stat-label">Mai bejegyzés</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="stat-value">${maxSev > 0 ? maxSev : '–'}</div>
          <div class="stat-label">Max súlyosság</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <div class="stat-value">${pollenData.length > 0 ? App.DATA.formatDateShort(pollenData[0]?.date) : '–'}</div>
          <div class="stat-label">Pollen adat</div>
        </div>
      </div>

      <!-- Allergen risk alerts: minden high+ szintű allergen -->
      ${allergenAlerts.length > 0 ? `
      <div class="section-header mb-2">
        <div class="section-title">Allergen veszélyek${userCity
            ? ` · 📍${userLocation.userCity || userLocation.nearestCity}${(userLocation.userCity && userLocation.userCity !== userLocation.nearestCity) ? ` (${userLocation.nearestCity} állomás)` : ''}`
            : ' · 🇭🇺 Magyarország'}</div>
        <div class="section-action" data-nav="pollen">Részletek →</div>
      </div>
      <div class="card mb-4" style="padding:12px 16px">
        ${allergenAlerts.map((a, i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;${i < allergenAlerts.length - 1 ? 'border-bottom:1px solid var(--border-2)' : ''}">
          <span style="font-size:22px">${a.icon}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:var(--text-1)">${a.name}</div>
            <div style="font-size:11px;color:var(--text-3)">${a.reason}</div>
            ${a.expectedIcons ? `<div style="display:flex;gap:2px;margin-top:3px" title="Várható tünetek">${a.expectedIcons}</div>` : ''}
          </div>
          <div style="background:${a.color}18;color:${a.color};font-size:11px;font-weight:700;padding:3px 8px;border-radius:var(--r-full)">
            ${a.riskLabel}
          </div>
        </div>`).join('')}
      </div>` : ''}

      <!-- Forecast summary -->
      ${this._renderForecastSummary(pollenForecast, pollenByAllergen)}

      <!-- Seasonal reminder -->
      ${seasonal.length > 0 ? `
      <div class="section-header mb-3">
        <div class="section-title">Szezonális figyelmeztetés</div>
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

      <!-- Home remedy tips -->
      ${this._renderTips(pollenData, maxSev, month)}

      <!-- Recent logs -->
      <div class="section-header mb-3">
        <div class="section-title">Legutóbbi bejegyzések</div>
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
          const sevColor = sev <= 2 ? 'var(--success)' : sev <= 3 ? 'var(--warning)' : 'var(--danger)';
          const firstSym = (log.symptoms || [])[0];
          const symIcon = firstSym ? (App.DATA.getSymptomById(firstSym.id)?.icon || '📋') : '📋';
          return `
          <div class="log-item" data-log-id="${log.id}" data-nav="log-detail">
            <div class="log-item-icon" style="background:var(--accent-bg)">${symIcon}</div>
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

  /* ── Pollen előrejelzés (következő 5 nap) ──────
     pollenForecast: DB rows with date > today
     pollenByAllergen: today's max risk per allergen_id */
  _renderForecastSummary(pollenForecast, pollenByAllergen) {
    if (!pollenForecast || pollenForecast.length === 0) return '';

    /* Group by date, then allergen → AVERAGE across all cities (Hungary-wide) */
    const byDateRaw = {};
    pollenForecast.forEach(p => {
      if (!byDateRaw[p.date]) byDateRaw[p.date] = {};
      if (!byDateRaw[p.date][p.allergen_id]) byDateRaw[p.date][p.allergen_id] = [];
      byDateRaw[p.date][p.allergen_id].push(p.risk_level);
    });
    const byDate = {};
    Object.entries(byDateRaw).forEach(([date, allergens]) => {
      byDate[date] = {};
      Object.entries(allergens).forEach(([id, vals]) => {
        byDate[date][id] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      });
    });

    const futureDates = Object.keys(byDate).sort().slice(0, 3);
    if (futureDates.length === 0) return '';

    const today = App.DATA.todayISO();

    /* For each allergen, compute AVERAGE risk over the entire forecast window (Hungary-wide) */
    const forecastSum = {}, forecastCnt = {};
    pollenForecast.forEach(p => {
      forecastSum[p.allergen_id] = (forecastSum[p.allergen_id] || 0) + p.risk_level;
      forecastCnt[p.allergen_id] = (forecastCnt[p.allergen_id] || 0) + 1;
    });
    const forecastMax = {};
    Object.keys(forecastSum).forEach(id => {
      forecastMax[id] = Math.round(forecastSum[id] / forecastCnt[id]);
    });

    /* Only show allergens that are notable (≥1 any day) */
    const notable = Object.entries(forecastMax)
      .filter(([, r]) => r >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);

    if (notable.length === 0) return '';

    /* Day labels – nap neve + dátum */
    const dayLabel = (iso) => {
      const diff = Math.round((new Date(iso) - new Date(today)) / 86400000);
      const d    = new Date(iso);
      const name = App.DATA.DAYS_LONG[(d.getDay() + 6) % 7];
      if (diff === 1) return `Holnap · ${name}`;
      return `${name} · ${d.getMonth() + 1}.${d.getDate()}.`;
    };

    /* Trend arrow vs PREVIOUS DAY (not vs today for all columns)
       futureDates[0] (holnap) → mai naphoz képest
       futureDates[1] → futureDates[0]-hoz képest stb.        */
    const trendIcon = (allergenId, futureRisk, prevRisk) => {
      if (prevRisk == null || prevRisk < 0) return '';
      if (futureRisk > prevRisk) return '<span style="color:#E53935;font-size:11px">▲</span>';
      if (futureRisk < prevRisk) return '<span style="color:#4CAF50;font-size:11px">▼</span>';
      return '<span style="color:var(--text-muted);font-size:11px">▶</span>';
    };

    /* Build day columns – trend az ELŐZŐ naphoz képest */
    const dayHtml = futureDates.map((date, idx) => {
      const dayData  = byDate[date];
      /* Az előző naphoz képesti referenciaérték:
         holnap → mai nap, holnapután → holnap, stb.            */
      const prevData = idx === 0 ? pollenByAllergen
                                 : byDate[futureDates[idx - 1]] ?? {};
      const rows = notable.map(id => {
        const risk = dayData[id] ?? 0;
        if (risk === 0) return '';
        const a  = App.DATA.getAllergenById(id);
        const rl = App.DATA.RISK_LEVELS[risk];
        if (!a || !rl) return '';
        /* Az előző naphoz képesti érték */
        const prevRisk = idx === 0
          ? (pollenByAllergen[id]?.risk_level ?? -1)
          : (prevData[id] ?? -1);
        return `<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid var(--border-2)">
          <span style="font-size:14px;width:18px;text-align:center">${a.icon}</span>
          <span style="flex:1;font-size:12px;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.name}</span>
          <span style="font-size:10px;font-weight:700;color:${rl.color}">${rl.short}</span>
          ${trendIcon(id, risk, prevRisk)}
        </div>`;
      }).filter(Boolean).join('');

      if (!rows) return '';

      return `<div style="min-width:140px;max-width:160px;flex-shrink:0;padding:8px;background:var(--bg-2);border-radius:var(--r-md)">
        <div style="font-size:11px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">${dayLabel(date)}</div>
        ${rows}
      </div>`;
    }).filter(Boolean).join('');

    if (!dayHtml) return '';

    return `
    <div class="section-header mb-2">
      <div class="section-title">📅 Előrejelzések</div>
      <div class="section-action" data-nav="pollen" style="font-size:12px">Adatok →</div>
    </div>
    <div class="card mb-4" style="padding:12px 14px">
      <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">🌿 Pollen</div>
      <div style="font-size:11px;color:var(--text-3);margin-bottom:8px">
        ▲ nő · ▼ csökken · ▶ változatlan – az előző naphoz képest
      </div>
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px">
        ${dayHtml}
      </div>
      <div id="weather-forecast-section" style="margin-top:14px;border-top:1px solid var(--border-2);padding-top:12px">
        <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">🌤️ Időjárás</div>
        <div id="weather-forecast-rows" style="font-size:12px;color:var(--text-3)">Betöltés...</div>
      </div>
    </div>`;
  },

  /* ── Home remedy tips ──────────────────────── */
  _renderTips(pollenData, maxSev, month) {
    /* Tip pool — categorised */
    const TIPS = {
      general: [
        { icon: '💧', text: 'Igyál naponta legalább 1,5–2 liter vizet – a jó hidratáltság csökkenti a nyálkahártya irritációját.' },
        { icon: '🚿', text: 'Hazaérkezés után azonnal zuhanyozz és mos hajat – a pollenszem felét a haj tartja meg.' },
        { icon: '👕', text: 'Kültéri ruhát ne hozz be a hálószobába, és ne szárítsd ruhát kint magas pollennapokon.' },
        { icon: '🪟', text: 'Pollenes napokon tartsd csukva az ablakokat, különösen reggel 5–10 óra között (pollen csúcsidő).' },
        { icon: '🧹', text: 'Rendszeres nedves törlés és porszívózás – száraz söprés felkavarja a port.' },
      ],
      nasal: [
        { icon: '🧂', text: 'Sóoldatos orrspray vagy orröblítő (neti-pot) – élettani sóoldattal naponta 1-2×-es öblítés csökkenti a pollen-terhelést.' },
        { icon: '♨️', text: 'Forró (de nem égető) vízgőz belégzése 5-10 percig – laza törülköző felett – megnyitja az orrjáratokat.' },
        { icon: '🫙', text: 'Mentaolajos gőzölés: 1-2 csepp mentaolaj a gőzbe adva orrszabadító hatású.' },
      ],
      eyes: [
        { icon: '🧊', text: 'Hideg vizes borogatás csukott szemre 5-10 percig – csökkenti a duzzanatot és a viszketést.' },
        { icon: '👓', text: 'Kültéren viselj napszemüveget – csökkenti a pollen-kontaktust a szemmel.' },
        { icon: '💦', text: 'Öblítsd meg a szemed tiszta ivóvízzel hazaérkezés után.' },
      ],
      highPollen: [
        { icon: '🌿', text: 'Kerüld a reggeli kültéri tevékenységet: a pollenszemek száma napfelkelte után 2-3 órával a legmagasabb.' },
        { icon: '🚗', text: 'Autóban tartsd csukva az ablakot, kapcsold pollenszűrőre a klímát.' },
        { icon: '🏠', text: 'HEPA-szűrős légtisztítót vagy klímát működtess beltéren – különösen a hálóban éjjel.' },
      ],
      throat: [
        { icon: '🍯', text: 'Meleg méz-citromos víz torokizgatás ellen – a méz bevonja és nyugtatja a nyálkahártyát.' },
        { icon: '🧄', text: 'Fokhagymás leves vagy főtt fokhagyma – természetes gyulladáscsökkentő hatású.' },
        { icon: '🫖', text: 'Kamilla- vagy hársfatea torokfájásra és köhögésre – naponta 2-3 csésze.' },
      ],
      skin: [
        { icon: '🧴', text: 'Illatmentes hidratálókrém bőrviszketésre – a hidratált bőr kevésbé reagál allergénekre.' },
        { icon: '🛁', text: 'Langyos (nem forró) fürdő bőrirritációnál – forró víz fokozza a viszketést.' },
      ],
    };

    /* Choose relevant tips based on context */
    const selected = [];
    const add = (arr) => { if (selected.length < 4) selected.push(...arr.slice(0, 2)); };

    const highPollen = pollenData.some(p => p.risk_level >= 2);
    if (highPollen)     add(TIPS.highPollen);
    if (maxSev >= 3)    add(TIPS.nasal);
    if (maxSev >= 2)    add(TIPS.eyes);
    add(TIPS.general);
    add(TIPS.throat);
    add(TIPS.skin);

    /* Deduplicate and limit to 4 */
    const tips = [...new Map(selected.map(t => [t.text, t])).values()].slice(0, 4);

    return `
    <div class="section-header mb-3">
      <div class="section-title">Tippek a tünetek enyhítésére</div>
      <div class="section-action" id="tips-toggle-btn" style="cursor:pointer">Több →</div>
    </div>
    <div class="card mb-4" id="tips-card">
      <div id="tips-list">
        ${tips.map((t, i) => `
        <div class="tips-item${i < tips.length - 1 ? ' tips-item-border' : ''}">
          <span class="tips-icon">${t.icon}</span>
          <span class="tips-text">${t.text}</span>
        </div>`).join('')}
      </div>
      <div id="tips-extra" style="display:none">
        ${[...TIPS.general, ...TIPS.nasal, ...TIPS.eyes, ...TIPS.throat, ...TIPS.skin, ...TIPS.highPollen]
          .filter(t => !tips.find(sel => sel.text === t.text))
          .slice(0, 8)
          .map((t, i, arr) => `
          <div class="tips-item${i < arr.length - 1 ? ' tips-item-border' : ''}">
            <span class="tips-icon">${t.icon}</span>
            <span class="tips-text">${t.text}</span>
          </div>`).join('')}
      </div>
    </div>`;
  },

  /* Compute allergen risk alerts:
     1. MINDEN jelenlegi high (≥2) szintű allergen → megjelenítve
     2. Tünetekkel korrelált allergenek az elmúlt 30 napból
     3. Allergen-tünet DB alapján symptom match score */
  _computeAllergenAlerts(pollenAll, logs, pollenByAllergen) {
    const alerts = [];
    const seen   = new Set();

    /* Legutóbbi 3 nap tünetei a symptom match-hez */
    const recent3  = new Date(); recent3.setDate(recent3.getDate() - 3);
    const r3Str    = recent3.toISOString().split('T')[0];
    const recentSymIds = new Set();
    logs.filter(l => l.date >= r3Str).forEach(l =>
      (l.symptoms || []).forEach(s => recentSymIds.add(s.id))
    );

    /* Helper: tipikus tünetek adott allergenhez */
    const _expectedIcons = (id) => {
      const db = App.DATA.ALLERGEN_SYMPTOM_MAP?.[id];
      if (!db) return '';
      return (db.primary || []).slice(0, 4).map(sid => {
        const sym = App.DATA.getSymptomById(sid);
        return sym ? `<span title="${sym.name}" style="font-size:14px">${sym.icon}</span>` : '';
      }).join('');
    };

    /* 1. Minden jelenlegi magas szintű allergen – korlát nélkül */
    Object.entries(pollenByAllergen)
      .sort((a, b) => b[1].risk_level - a[1].risk_level)
      .forEach(([id, p]) => {
        if (p.risk_level < 2) return;
        const a  = App.DATA.getAllergenById(id);
        const rl = App.DATA.RISK_LEVELS[p.risk_level];
        if (!a || seen.has(id)) return;
        seen.add(id);
        const matchPct = App.DATA.matchSymptoms?.(id, [...recentSymIds]) ?? 0;
        const matchTxt = matchPct > 0 ? ` · ${matchPct}% tünet egyezés` : '';
        alerts.push({
          id,
          icon: a.icon, name: a.name,
          color: rl.color, riskLabel: rl.short,
          score: p.risk_level + 10 + matchPct / 10,
          reason: `Jelenlegi szint: ${rl.label}${matchTxt}`,
          expectedIcons: _expectedIcons(id),
        });
      });

    /* 2. Tünetekkel korrelált allergenek (elmúlt 30 nap) */
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const sevByDate = {};
    logs.filter(l => l.date >= cutoffStr).forEach(l => {
      const s = l.overall_severity || 0;
      if (!sevByDate[l.date] || s > sevByDate[l.date]) sevByDate[l.date] = s;
    });

    const allergenCorr = {};
    pollenAll.filter(p => p.date >= cutoffStr && p.risk_level >= 2).forEach(p => {
      const sev = sevByDate[p.date] || 0;
      if (sev >= 3) {
        allergenCorr[p.allergen_id] = (allergenCorr[p.allergen_id] || 0) + sev;
      }
    });

    Object.entries(allergenCorr)
      .sort((a, b) => b[1] - a[1])
      .forEach(([id, score]) => {
        if (seen.has(id)) return;
        seen.add(id);
        const a  = App.DATA.getAllergenById(id);
        const p  = pollenByAllergen[id];
        const rl = p ? App.DATA.RISK_LEVELS[p.risk_level] : App.DATA.RISK_LEVELS[1];
        if (!a) return;
        const matchPct = App.DATA.matchSymptoms?.(id, [...recentSymIds]) ?? 0;
        alerts.push({
          id,
          icon: a.icon, name: a.name,
          color: rl ? rl.color : '#F57F17',
          riskLabel: rl ? rl.short : '?',
          score,
          reason: `Elmúlt 30 nap korrelációja${matchPct > 0 ? ` · ${matchPct}% tünet egyezés` : ''}`,
          expectedIcons: _expectedIcons(id),
        });
      });

    return alerts.sort((a, b) => b.score - a.score);
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

    /* Tips expand/collapse */
    const tipsBtn   = document.getElementById('tips-toggle-btn');
    const tipsExtra = document.getElementById('tips-extra');
    if (tipsBtn && tipsExtra) {
      tipsBtn.addEventListener('click', () => {
        const open = tipsExtra.style.display !== 'none';
        tipsExtra.style.display = open ? 'none' : '';
        tipsBtn.textContent = open ? 'Több →' : 'Kevesebb ↑';
      });
    }

    const addBtn = document.getElementById('dash-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => App.navigate('log-new'));

    /* Időjárás betöltése háttérben */
    this._loadWeather();
  },

  async _loadWeather(forceRefresh = false) {
    if (!App.Weather) return;
    try {
      const wx = await App.Weather.fetchForCurrentLocation(forceRefresh);
      if (!wx) return;
      this._renderWeatherCurrent(wx);
      this._renderWeatherForecast(wx);
    } catch (e) {
      console.warn('[Dashboard] weather error:', e);
    }
  },

  _renderWeatherCurrent(wx) {
    const cur = wx.current;
    if (!cur) return;
    const strip = document.getElementById('weather-current-strip');
    if (!strip) return;
    const cloudTxt = cur.cloudCover != null
      ? (cur.cloudCover < 25 ? '☀️ Derült' : cur.cloudCover < 60 ? '⛅ Részben felhős' : '☁️ Borult')
      : '';
    document.getElementById('wc-icon').textContent  = cur.emoji  || '🌡️';
    document.getElementById('wc-temp').textContent  = cur.temp   != null ? `${Math.round(cur.temp)}°C` : '';
    document.getElementById('wc-hum').textContent   = cur.humidity != null ? `💧${Math.round(cur.humidity)}%` : '';
    document.getElementById('wc-cloud').textContent = cloudTxt;
  },

  _renderWeatherForecast(wx) {
    const el = document.getElementById('weather-forecast-rows');
    if (!el || !wx.days?.length) return;
    const today = App.DATA.todayISO();
    const days  = wx.days.filter(d => d.date > today).slice(0, 3);
    if (!days.length) { el.innerHTML = ''; return; }
    el.innerHTML = days.map((d, i) => {
      const dt    = new Date(d.date);
      const name  = App.DATA.DAYS_LONG[(dt.getDay() + 6) % 7];
      const label = i === 0 ? `Holnap · ${name}` : name;
      const washTxt = d.pollenWashFactor < 0.6
        ? '<span style="color:var(--info);font-size:10px"> 🌧 pollen↓</span>' : '';
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border-2)">
        <span style="font-size:15px">${d.wmo.emoji}</span>
        <span style="width:72px;font-size:11px;font-weight:600;color:var(--text-2)">${label}</span>
        <span style="flex:1;font-size:11px;color:var(--text-3)">${d.wmo.label}${washTxt}</span>
        <span style="font-size:11px;color:var(--text-2);white-space:nowrap">
          ${d.tempMin != null ? Math.round(d.tempMin) : '?'}° / <b>${d.tempMax != null ? Math.round(d.tempMax) : '?'}°C</b>
          ${d.precipProb > 20 ? `<span style="color:#1565C0;margin-left:4px">☔${d.precipProb}%</span>` : ''}
        </span>
      </div>`;
    }).join('');
  },
};
