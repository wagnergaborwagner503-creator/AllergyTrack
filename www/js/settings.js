/* ═══════════════════════════════════════════
   AllergyTrack – Settings Page
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Settings = {

  async render() {
    return `
    <div class="page" id="page-settings">
      <div class="section-title mb-4">Beállítások</div>

      <!-- Data Management -->
      <div class="settings-section">
        <div class="settings-section-title">Adatkezelés</div>
        <div class="settings-group">
          <div class="settings-item" id="export-btn">
            <div class="settings-item-icon">📤</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Adatok exportálása</div>
              <div class="settings-item-sub">JSON, CSV – válassz formátumot</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <label class="settings-item" for="import-file-input" style="cursor:pointer">
            <div class="settings-item-icon">📥</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Adatok importálása</div>
              <div class="settings-item-sub">JSON mentés visszaállítása</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </label>
          <div class="settings-item" id="export-pollen-btn">
            <div class="settings-item-icon" style="background:var(--accent-bg)">🌿</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Pollenadatok exportálása</div>
              <div class="settings-item-sub">Pollen JSON letöltése</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <label class="settings-item" for="import-pollen-file-input" style="cursor:pointer">
            <div class="settings-item-icon" style="background:var(--accent-bg)">📥</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Pollenadatok importálása</div>
              <div class="settings-item-sub">Pollen JSON visszaállítása</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </label>
          <div class="settings-item" id="dedup-pollen-btn">
            <div class="settings-item-icon" style="background:var(--info-bg)">🔄</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Duplikátumok eltávolítása</div>
              <div class="settings-item-sub">Ismétlődő pollenadatok átlagolása és törlése</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <div class="settings-item" id="clear-pollen-btn">
            <div class="settings-item-icon" style="background:var(--warning-bg)">🌿</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Pollenadatok törlése</div>
              <div class="settings-item-sub">Csak a feltöltött pollenadatok</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <div class="settings-item" id="clear-all-btn">
            <div class="settings-item-icon" style="background:var(--danger-bg)">🗑️</div>
            <div class="settings-item-body">
              <div class="settings-item-title" style="color:var(--danger)">Minden adat törlése</div>
              <div class="settings-item-sub">Napló, pollenadatok, profil</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
        </div>
      </div>

      <!-- AI Export -->
      <div class="settings-section">
        <div class="settings-section-title">AI Elemzési segítség</div>
        <div class="settings-group">
          <div class="settings-item" id="ai-copy-prompt-btn">
            <div class="settings-item-icon" style="background:#EDE7F6">🤖</div>
            <div class="settings-item-body">
              <div class="settings-item-title">AI prompt másolása</div>
              <div class="settings-item-sub">Másold vágólapra a kész elemzési kérést LLM-hez</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <div class="settings-item" id="ai-export-data-btn">
            <div class="settings-item-icon" style="background:#E8F5E9">📊</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Adatok letöltése LLM-hez</div>
              <div class="settings-item-sub">Tünet- és pollenadatok JSON-ban, AI elemzésre kész</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
        </div>
      </div>

      <!-- Visszajelzés -->
      <div class="settings-section">
        <div class="settings-section-title">Visszajelzés</div>
        <div class="settings-group">
          <div class="settings-item" id="feedback-btn">
            <div class="settings-item-icon" style="background:#E8F5E9">💬</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Visszajelzés küldése</div>
              <div class="settings-item-sub">Hibajelentés, fejlesztési ötlet, értékelés</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
        </div>
      </div>

      <!-- Értesítések -->
      <div class="settings-section">
        <div class="settings-section-title">Értesítések</div>
        <div class="settings-group">
          <div class="settings-item" style="cursor:default">
            <div class="settings-item-icon">🔔</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Tünet-emlékeztető</div>
              <div class="settings-item-sub">Reggel, délben és este 9-kor emlékeztet a naplózásra</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="notif-toggle">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="settings-section">
        <div class="settings-section-title">Az alkalmazásról</div>
        <div class="settings-group">
          <div class="settings-item" id="patch-notes-btn" style="cursor:pointer">
            <div class="settings-item-icon">📋</div>
            <div class="settings-item-body">
              <div class="settings-item-title">Újdonságok / Patch notes</div>
              <div class="settings-item-sub">Mi változott az utóbbi frissítésekben?</div>
            </div>
            <div class="settings-item-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>
          <div class="settings-item" id="version-box" style="cursor:default;user-select:none">
            <div class="settings-item-icon">ℹ️</div>
            <div class="settings-item-body">
              <div class="settings-item-title">AllergyTrack</div>
              <div class="settings-item-sub">Verzió ${App.PatchNotes?.CURRENT_VERSION ?? '?'} · Adatok csak helyi eszközön</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div id="storage-info" class="card mb-4">
        <div class="card-title mb-3">Tárolt adatok</div>
        <div id="storage-stats" class="text-sm text-muted">Betöltés...</div>
      </div>

      <input type="file" id="import-file-input" accept=".json" style="display:none">
      <input type="file" id="import-pollen-file-input" accept=".json" style="display:none">
      <div style="height:16px"></div>
    </div>`;
  },

  /* ── Download helper ─────────────────────────────────────────────────────
     1a. Native Android (≤9): Filesystem → /sdcard/Download/AllergyTrack/
     1b. Native Android (10+): Filesystem → app-specific External
     2.  Web Share API (Android Chrome WebView, PWA)
     3.  Anchor-alapú letöltés (desktop / fallback)
  ──────────────────────────────────────────────────────────────────────── */
  async _downloadBlob(blob, filename, shareTitle) {

    /* ── 1. Natív Android: Capacitor Filesystem ── */
    if (window.Capacitor?.isNativePlatform?.()) {
      const FS = window.Capacitor?.Plugins?.Filesystem;
      if (FS) {
        /* Szükség esetén engedélykérés */
        await FS.requestPermissions?.().catch(() => {});
        const text = await blob.text();

        /* 1a. Letöltések mappa – működik Android ≤ 9 (WRITE_EXTERNAL_STORAGE) */
        try {
          await FS.writeFile({
            path: `Download/AllergyTrack/${filename}`,
            data: text,
            directory: 'EXTERNAL_STORAGE',   /* /sdcard/ gyökér */
            encoding: 'utf8',
            recursive: true,
          });
          App.toast(`Letöltve: ${filename}\n📂 Letöltések › AllergyTrack`, 'success', 5000);
          return;
        } catch (e1) {
          console.warn('[Export] ExternalStorage/Download hiba (Android 10+?):', e1.message || e1);
        }

        /* 1b. App-specifikus külső tárolt – Android 10+ fallback */
        try {
          await FS.writeFile({
            path: `AllergyTrack/${filename}`,
            data: text,
            directory: 'EXTERNAL',   /* /sdcard/Android/data/<pkg>/files/ */
            encoding: 'utf8',
            recursive: true,
          });
          App.toast(
            `Mentve: ${filename}\n📂 Fájlkezelő › Belső tárolt › Android › data › com.allergytrack.app › files › AllergyTrack`,
            'success', 8000
          );
          return;
        } catch (e2) {
          console.warn('[Export] External hiba:', e2.message || e2);
        }
      }
    }

    /* ── 2. Web Share API (Android Chrome WebView / PWA) ── */
    if (navigator.canShare) {
      const file = new File([blob], filename, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: shareTitle, files: [file] });
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;   /* felhasználó megszakította */
          /* fall through to anchor */
        }
      }
    }

    /* ── 3. Anchor / download fallback (desktop) ── */
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  },

  async mount() {
    /* ── Export – formátum-választó dialóg ──────────────────────────── */
    document.getElementById('export-btn')?.addEventListener('click', () => {
      App.showModal(`
        <div class="modal-handle"></div>
        <div class="modal-title">Exportálás formátuma</div>
        <p style="font-size:13px;color:var(--text-3);margin-bottom:20px">
          Válassz exportálási formátumot. Android-on a megosztás gomb is megjelenik.
        </p>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-secondary" id="exp-json-btn" style="text-align:left;justify-content:flex-start;gap:12px;padding:14px 16px">
            <span style="font-size:22px">📋</span>
            <div><div style="font-weight:700">JSON</div><div style="font-size:11px;opacity:.7">Teljes biztonsági mentés – visszaállítható</div></div>
          </button>
          <button class="btn btn-secondary" id="exp-csv-btn" style="text-align:left;justify-content:flex-start;gap:12px;padding:14px 16px">
            <span style="font-size:22px">📊</span>
            <div><div style="font-weight:700">CSV</div><div style="font-size:11px;opacity:.7">Tünetnapló táblázat – Excel, Sheets, Messenger</div></div>
          </button>
          <button class="btn btn-ghost" onclick="App.closeModal()">Mégsem</button>
        </div>
      `);

      /* JSON export */
      document.getElementById('exp-json-btn')?.addEventListener('click', async () => {
        App.closeModal();
        try {
          const data = await App.db.exportAll();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          await this._downloadBlob(blob, `allergytrack-backup-${App.DATA.todayISO()}.json`, 'AllergyTrack biztonsági mentés');
          App.toast('JSON export letöltve!', 'success');
        } catch (e) { App.toast('Export hiba: ' + e.message, 'error'); }
      });

      /* CSV export */
      document.getElementById('exp-csv-btn')?.addEventListener('click', async () => {
        App.closeModal();
        try {
          const logs = await App.db.getSymptomsLogs();
          if (!logs.length) { App.toast('Nincs exportálható napló.', 'info'); return; }
          const rows = [
            ['Dátum','Időpont','Helyszín','Tünetek','Súlyosság','Gyógyszer','Hőmérséklet','Megjegyzés','Tünetmentes'],
            ...logs.map(l => [
              l.date, l.time || '',
              l.location || '',
              (l.symptoms || []).map(s => { const sym = App.DATA.getSymptomById(s.id); return sym ? sym.name : s.id; }).join('; '),
              l.overall_severity ?? 0,
              (l.medications_taken || []).map(m => m.name).join('; '),
              l.temperature ?? '',
              (l.notes || '').replace(/"/g, '""'),
              l.no_symptoms ? 'igen' : '',
            ])
          ];
          const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
          const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
          await this._downloadBlob(blob, `allergytrack-naplo-${App.DATA.todayISO()}.csv`, 'AllergyTrack tünetnapló');
          App.toast('CSV export letöltve!', 'success');
        } catch (e) { App.toast('Export hiba: ' + e.message, 'error'); }
      });
    });

    /* ── Értesítések toggle ─────────────────────────────────────────── */
    const notifToggle = document.getElementById('notif-toggle');
    if (notifToggle) {
      const enabled = await App.db.getSetting('notificationsEnabled', true);
      notifToggle.checked = !!enabled;
      notifToggle.addEventListener('change', async () => {
        const on = notifToggle.checked;
        await App.db.setSetting('notificationsEnabled', on);
        if (on) {
          await App.Notifications?.schedule?.();
          App.toast('🔔 Értesítések bekapcsolva', 'success');
        } else {
          await App.Notifications?.cancel?.();
          App.toast('🔕 Értesítések kikapcsolva', 'info');
        }
      });
    }

    /* Import — handled via <label for="import-file-input"> in HTML,
       so tapping the label directly activates the file picker on Android too */
    document.getElementById('import-file-input')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      App.showConfirmModal(
        'Adatok importálása',
        `⚠️ Az import felülírja az összes jelenlegi adatot a(z) "${file.name}" tartalmával.\nBiztosan folytatod?`,
        async () => {
          try {
            const text = await file.text();
            const data = JSON.parse(text);
            await App.db.importAll(data);
            App.toast('Import sikeres!', 'success');
            App.navigate('settings');
          } catch (err) {
            App.toast('Import hiba: ' + (err.message || 'Érvénytelen fájl'), 'error');
          }
        }
      );
      e.target.value = '';
    });

    /* Export pollen */
    document.getElementById('export-pollen-btn')?.addEventListener('click', async () => {
      try {
        const data = await App.db.exportPollenData();
        if (!data.pollen_data.length) { App.toast('Nincs exportálható pollenadat.', 'info'); return; }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        await this._downloadBlob(blob, `allergytrack-pollen-${App.DATA.todayISO()}.json`, 'AllergyTrack pollenadat export');
        App.toast('Pollenadatok exportálva!', 'success');
      } catch (e) {
        App.toast('Export hiba: ' + e.message, 'error');
      }
    });

    /* Import pollen */
    document.getElementById('import-pollen-file-input')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      App.showConfirmModal(
        'Pollenadatok importálása',
        `A(z) "${file.name}" fájlból importálás – a meglévő adatokhoz adódik hozzá (nem törli azokat).\nFolytatod?`,
        async () => {
          try {
            const text = await file.text();
            const data = JSON.parse(text);
            await App.db.importPollenData(data);
            App.toast('Pollenadatok importálva!', 'success');
            await this.loadStorageStats();
          } catch (err) {
            App.toast('Import hiba: ' + (err.message || 'Érvénytelen fájl'), 'error');
          }
        }
      );
      e.target.value = '';
    });

    /* Dedup pollen */
    document.getElementById('dedup-pollen-btn')?.addEventListener('click', () => {
      App.showConfirmModal(
        'Duplikátumok eltávolítása',
        'Azonos dátum + helyszín + allergen kombinációjú bejegyzések átlagolódnak és deduplikálódnak.\nFolytatod?',
        async () => {
          const removed = await App.db.deduplicatePollenData();
          App.toast(removed > 0 ? `${removed} duplikált bejegyzés eltávolítva.` : 'Nem találtunk duplikátumot.', 'success');
          await this.loadStorageStats();
        }
      );
    });

    /* Clear pollen */
    document.getElementById('clear-pollen-btn')?.addEventListener('click', () => {
      App.showConfirmModal(
        'Pollenadatok törlése',
        'Biztosan törlöd az összes feltöltött pollenadat? A napló megmarad.',
        async () => {
          await App.db.clearPollenData();
          App.toast('Pollenadatok törölve.', 'success');
          await this.loadStorageStats();
        }
      );
    });

    /* Clear all */
    document.getElementById('clear-all-btn')?.addEventListener('click', () => {
      App.showConfirmModal(
        '⚠️ Minden adat törlése',
        'FIGYELEM: Az összes napló, pollenadat és allergiaprofil véglegesen törlésre kerül. Ez a művelet nem visszavonható!\n\nBiztosan folytatod?',
        async () => {
          await App.db.clearAllData();
          App.toast('Minden adat törölve.', 'success');
          App.navigate('dashboard');
        }
      );
    });

    /* ── AI prompt másolása ─────────────────── */
    document.getElementById('ai-copy-prompt-btn')?.addEventListener('click', async () => {
      try {
        const [logs, pollen, profile] = await Promise.all([
          App.db.getRecentLogs(9999),
          App.db.getPollenData(),
          App.db.getAllergenProfile(),
        ]);
        const prompt = this._buildAiPrompt(logs, pollen, profile);
        await navigator.clipboard.writeText(prompt);
        App.toast('AI prompt vágólapra másolva! 🤖', 'success', 4000);
      } catch (e) {
        App.toast('Másolás sikertelen: ' + e.message, 'error');
      }
    });

    /* ── AI adatexport letöltése ─────────────── */
    document.getElementById('ai-export-data-btn')?.addEventListener('click', async () => {
      try {
        const [logs, pollen, profile] = await Promise.all([
          App.db.getRecentLogs(9999),
          App.db.getPollenData(),
          App.db.getAllergenProfile(),
        ]);
        const payload = this._buildAiPayload(logs, pollen, profile);
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        await this._downloadBlob(
          blob,
          `allergytrack-ai-export-${App.DATA.todayISO()}.json`,
          'AllergyTrack AI elemzés'
        );
        App.toast('AI adatfájl letöltve!', 'success');
      } catch (e) {
        App.toast('Export hiba: ' + e.message, 'error');
      }
    });

    /* ── Visszajelzés küldése ───────────────────── */
    document.getElementById('feedback-btn')?.addEventListener('click', () => this._showFeedbackModal());

    /* Patch notes gomb */
    document.getElementById('patch-notes-btn')?.addEventListener('click', () => {
      if (App.PatchNotes) App.PatchNotes.showAllVersions();
    });

    /* Easter egg: 10 gyors tap a version boxon */
    let eggTaps = 0, eggTimer = null;
    document.getElementById('version-box')?.addEventListener('click', () => {
      eggTaps++;
      clearTimeout(eggTimer);
      eggTimer = setTimeout(() => { eggTaps = 0; }, 2000);
      if (eggTaps >= 10) {
        eggTaps = 0;
        this._showEasterEgg();
      }
    });

    await this.loadStorageStats();
  },

  _showEasterEgg() {
    const overlay = document.createElement('div');
    overlay.className = 'easter-egg-overlay';
    overlay.innerHTML = `
      <div class="easter-egg-emoji">🤧</div>
      <div class="easter-egg-text">HÁPSIK! 🌿✨</div>
      <div class="easter-egg-sub">Megtaláltad a titkos funkciót! Koppints a bezáráshoz.</div>`;
    document.body.appendChild(overlay);
    /* Hang effekt lehetne, de APK-ban nem megbízható, kihagyjuk */
    overlay.addEventListener('click', () => overlay.remove());
    setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 6000);
  },

  /* ── Build a ready-to-paste AI analysis prompt ─────────────────────── */
  _buildAiPrompt(logs, pollen, profile) {
    const trackedAllergens = profile.map(p => {
      const a = App.DATA.getAllergenById(p.allergen_id);
      return a ? `${a.icon} ${a.name}` : p.allergen_id;
    }).join(', ') || 'nincs megadva';

    const today = App.DATA.todayISO();
    const logCount = logs.length;
    const pollenCount = pollen.length;

    return `# AllergyTrack – AI Allergia Elemzés

Te egy allergológiában jártas asszisztens vagy. Az alábbiakban a felhasználó által rögzített tünet- és pollenadatokat találod. Kérlek, elemezd ki őket és adj részletes, személyre szabott választ magyarul.

## Felhasználói profil
- Követett allergének: ${trackedAllergens}
- Rögzített tünetnapló bejegyzések: ${logCount} db
- Rögzített pollenadatok: ${pollenCount} db
- Elemzés dátuma: ${today}

## A csatolt JSON fájl tartalmaz:
1. \`symptom_logs\` – tünetnaplóbejegyzések (dátum, tünetek, súlyosság, helyszín, gyógyszer, megjegyzés)
2. \`pollen_data\` – pollenadatok (dátum, allergén, helyszín, kockázati szint, koncentráció, forrás)
3. \`allergen_profile\` – a felhasználó által követett allergének
4. \`metadata\` – exportálás részletei

## Kérlek, válaszolj a következő kérdésekre:

### 1. Legvalószínűbb allergénem(ek)
Melyik allergén(ek) okozzák legvalószínűbben a tüneteimet? Mire alapozod ezt? (dátum-egybeesés, tünetprofil, ismert keresztreakciók)

### 2. Tüneteim időbeli mintázata
Van-e felismerhető mintázat? (napszak, időjárás, helyszín, stb.) Mikor a legrosszabb és mikor a legjobb?

### 3. Keresztreakciók
Milyen ételekre kell figyelnem a nyírfa/parlagfű/pázsitfű/egyéb szezon idején? Van-e OAS-ra utaló adat a naplóban?

### 4. Praktikus javaslatok
Milyen konkrét lépéseket tegyek a tünetek csökkentése érdekében a saját adataim alapján?

### 5. Orvosi konzultáció
Van-e olyan tünet vagy mintázat az adatokban, amely alapján allergológus felkeresését javaslod?

---
*Fontos: Az AI elemzés tájékoztató jellegű és nem helyettesíti az orvosi diagnózist.*`;
  },

  /* ── Build the structured JSON payload for AI analysis ─────────────── */
  _buildAiPayload(logs, pollen, profile) {
    /* Humanize symptom IDs for easier LLM reading */
    const humanizeLogs = logs.map(l => ({
      date:              l.date,
      location:          l.location || null,
      overall_severity:  l.overall_severity || 0,
      symptoms: (l.symptoms || []).map(s => {
        const sym = App.DATA.getSymptomById(s.id);
        return { id: s.id, name_hu: sym?.name || s.id, severity: s.severity || null };
      }),
      medications_taken: (l.medications_taken || []).map(m => m.name || m),
      temperature:       l.temperature || null,
      notes:             l.notes || null,
      environment:       l.environment || null,
    }));

    const humanizePollen = pollen.map(p => {
      const a = App.DATA.getAllergenById(p.allergen_id);
      return {
        date:          p.date,
        allergen_id:   p.allergen_id,
        allergen_name: a?.name || p.allergen_id,
        location:      p.location || null,
        risk_level:    p.risk_level,
        risk_label:    (App.DATA.RISK_LEVELS[p.risk_level] || {}).label || String(p.risk_level),
        concentration: p.concentration || null,
        unit:          p.unit || null,
        source:        p.source || null,
      };
    });

    const humanizeProfile = profile.map(p => {
      const a = App.DATA.getAllergenById(p.allergen_id);
      return { allergen_id: p.allergen_id, name_hu: a?.name || p.allergen_id };
    });

    return {
      metadata: {
        app:          'AllergyTrack',
        version:      App.PatchNotes?.CURRENT_VERSION ?? '?',
        exported_at:  new Date().toISOString(),
        purpose:      'AI allergy analysis – paste this file into an LLM chat along with the prompt',
        record_counts: {
          symptom_logs: humanizeLogs.length,
          pollen_data:  humanizePollen.length,
          allergen_profile: humanizeProfile.length,
        },
      },
      allergen_profile: humanizeProfile,
      symptom_logs:     humanizeLogs,
      pollen_data:      humanizePollen,
    };
  },

  /* ═══════════════════════════════════════════════════════════════════════
     VISSZAJELZÉS
     ═══════════════════════════════════════════════════════════════════════ */

  _showFeedbackModal() {
    const email = App.Auth?.email ?? '';

    App.showModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">💬 Visszajelzés küldése</div>
      <p style="font-size:12px;color:var(--text-3);margin-bottom:16px;line-height:1.5">
        Írd le, mit tapasztaltál vagy mi jutott eszedbe – minden visszajelzést elolvasok!
      </p>

      <!-- Kategória -->
      <div class="form-group">
        <label class="form-label">Kategória</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="fb-category-grid">
          <button class="feedback-cat-btn active" data-cat="bug"     style="--cat-color:#EF5350">🐛 Hibajelentés</button>
          <button class="feedback-cat-btn"        data-cat="idea"    style="--cat-color:#42A5F5">💡 Fejlesztési ötlet</button>
          <button class="feedback-cat-btn"        data-cat="praise"  style="--cat-color:#66BB6A">❤️ Értékelés</button>
          <button class="feedback-cat-btn"        data-cat="other"   style="--cat-color:#AB47BC">💬 Egyéb</button>
        </div>
      </div>

      <!-- Üzenet -->
      <div class="form-group">
        <label class="form-label">Üzenet <span style="color:var(--danger)">*</span></label>
        <textarea class="form-control" id="fb-message" rows="4"
          placeholder="Pl. Az időjárás szekció nem tölt be, ha nincs internet..."
          style="resize:vertical;min-height:96px;font-size:13px;line-height:1.5"></textarea>
        <div style="font-size:11px;color:var(--text-3);margin-top:4px;text-align:right">
          <span id="fb-char-count">0</span> karakter
        </div>
      </div>

      <!-- E-mail -->
      <div class="form-group">
        <label class="form-label">E-mail cím <span style="font-size:11px;color:var(--text-3)">(opcionális – ha válaszra vársz)</span></label>
        <input class="form-control" id="fb-email" type="email"
          placeholder="pelda@email.hu" value="${email}" style="font-size:13px">
      </div>

      <div id="fb-error" style="display:none;color:var(--danger);font-size:12px;margin-bottom:10px;padding:8px 12px;background:var(--danger-bg);border-radius:var(--r-sm)"></div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="fb-send-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="15" height="15" style="margin-right:5px">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Elküldés
        </button>
        <button class="btn btn-ghost" onclick="App.closeModal()">Mégse</button>
      </div>
    `);

    /* Kategória toggle */
    let selectedCat = 'bug';
    document.querySelectorAll('.feedback-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.feedback-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCat = btn.dataset.cat;
      });
    });

    /* Karakterszámláló */
    const msgEl = document.getElementById('fb-message');
    const cntEl = document.getElementById('fb-char-count');
    msgEl?.addEventListener('input', () => {
      if (cntEl) cntEl.textContent = msgEl.value.length;
    });

    /* Küldés */
    document.getElementById('fb-send-btn')?.addEventListener('click', async () => {
      const message = msgEl?.value?.trim() ?? '';
      const email   = document.getElementById('fb-email')?.value?.trim() ?? '';
      const errEl   = document.getElementById('fb-error');

      if (message.length < 5) {
        if (errEl) { errEl.textContent = 'Az üzenet legalább 5 karakter legyen.'; errEl.style.display = 'block'; }
        return;
      }

      const btn = document.getElementById('fb-send-btn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Küldés...'; }

      const ok = await this._sendFeedback({ category: selectedCat, message, email });

      if (ok) {
        App.closeModal();
        App.toast('✅ Köszönöm a visszajelzést!', 'success', 4000);
      } else {
        if (errEl) { errEl.textContent = 'Küldési hiba – próbáld újra vagy ellenőrizd az internetkapcsolatot.'; errEl.style.display = 'block'; }
        if (btn) { btn.disabled = false; btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="15" height="15" style="margin-right:5px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Elküldés'; }
      }
    });

    /* Enter a textareában NE küldjön (ctrl+enter igen) */
    msgEl?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.ctrlKey) document.getElementById('fb-send-btn')?.click();
    });
  },

  async _sendFeedback({ category, message, email }) {
    const sb = App.Supabase?.get?.();
    if (!sb) {
      console.warn('[Feedback] Supabase nincs konfigurálva.');
      return false;
    }
    try {
      const { error } = await sb.from('feedback').insert({
        category,
        message,
        email:       email || null,
        user_id:     App.Auth?.userId ?? null,
        app_version: App.PatchNotes?.CURRENT_VERSION ?? null,
        user_agent:  navigator.userAgent.slice(0, 200),
      });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('[Feedback] Küldési hiba:', e);
      return false;
    }
  },

  async loadStorageStats() {
    const el = document.getElementById('storage-stats');
    if (!el) return;
    try {
      const [logs, pollen, profile] = await Promise.all([
        App.db.getRecentLogs(9999),
        App.db.getPollenData(),
        App.db.getAllergenProfile(),
      ]);
      el.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center">
          <div>
            <div style="font-size:22px;font-weight:800;color:var(--accent)">${logs.length}</div>
            <div>Naplóbejegyzés</div>
          </div>
          <div>
            <div style="font-size:22px;font-weight:800;color:var(--accent)">${pollen.length}</div>
            <div>Pollenadat</div>
          </div>
          <div>
            <div style="font-size:22px;font-weight:800;color:var(--accent)">${profile.length}</div>
            <div>Allergen profil</div>
          </div>
        </div>`;
    } catch (e) {
      el.textContent = 'Nem sikerült betölteni.';
    }
  },
};
