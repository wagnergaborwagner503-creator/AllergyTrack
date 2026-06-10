/* ═══════════════════════════════════════════
   AllergyTrack – Settings Page
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Settings = {

  async render() {
    const theme = await App.db.getSetting('theme', 'light');

    return `
    <div class="page" id="page-settings">
      <div class="section-title mb-4">Beállítások</div>

      <!-- Appearance -->
      <div class="settings-section">
        <div class="settings-section-title">Megjelenés</div>
        <div class="settings-item" style="border-radius:var(--r-lg)">
          <div class="settings-item-icon">🎨</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Téma</div>
            <div class="settings-item-sub" id="theme-sub">
              ${theme === 'dark' ? 'Sötét mód' : theme === 'system' ? 'Rendszer' : 'Világos mód'}
            </div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm ${theme === 'light'  ? 'btn-primary' : 'btn-ghost'}" data-theme="light">☀️</button>
            <button class="btn btn-sm ${theme === 'dark'   ? 'btn-primary' : 'btn-ghost'}" data-theme="dark">🌙</button>
            <button class="btn btn-sm ${theme === 'system' ? 'btn-primary' : 'btn-ghost'}" data-theme="system">🖥️</button>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="settings-section">
        <div class="settings-section-title">Adatkezelés</div>

        <div class="settings-item" id="export-btn">
          <div class="settings-item-icon">📤</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Adatok exportálása</div>
            <div class="settings-item-sub">JSON fájl letöltése (biztonsági mentés)</div>
          </div>
          <div class="settings-item-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <div class="settings-item" id="export-csv-btn">
          <div class="settings-item-icon">📊</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Exportálás CSV-be</div>
            <div class="settings-item-sub">Tünetnapló táblázatos formában</div>
          </div>
          <div class="settings-item-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <div class="settings-item" id="import-btn">
          <div class="settings-item-icon">📥</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Adatok importálása</div>
            <div class="settings-item-sub">JSON mentés visszaállítása</div>
          </div>
          <div class="settings-item-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <div class="settings-item" id="clear-pollen-btn">
          <div class="settings-item-icon" style="background:var(--warning-bg)">🌿</div>
          <div class="settings-item-body">
            <div class="settings-item-title">Pollenadatok törlése</div>
            <div class="settings-item-sub">Csak a feltöltött pollenadatok</div>
          </div>
          <div class="settings-item-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <div class="settings-item" id="clear-all-btn">
          <div class="settings-item-icon" style="background:var(--danger-bg)">🗑️</div>
          <div class="settings-item-body">
            <div class="settings-item-title" style="color:var(--danger)">Minden adat törlése</div>
            <div class="settings-item-sub">Napló, pollenadatok, profil</div>
          </div>
          <div class="settings-item-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="settings-section">
        <div class="settings-section-title">Az alkalmazásról</div>
        <div class="settings-item" style="border-radius:var(--r-lg);cursor:default">
          <div class="settings-item-icon">ℹ️</div>
          <div class="settings-item-body">
            <div class="settings-item-title">AllergyTrack</div>
            <div class="settings-item-sub">Verzió 1.0 · Adatok csak helyi eszközön</div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div id="storage-info" class="card mb-4">
        <div class="card-title mb-3">💾 Tárolt adatok</div>
        <div id="storage-stats" class="text-sm text-muted">Betöltés...</div>
      </div>

      <input type="file" id="import-file-input" accept=".json" style="display:none">
      <div style="height:16px"></div>
    </div>`;
  },

  async mount() {
    /* Theme buttons */
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const t = btn.dataset.theme;
        await App.db.setSetting('theme', t);
        App.applyTheme(t);
        document.getElementById('theme-sub').textContent =
          t === 'dark' ? 'Sötét mód' : t === 'system' ? 'Rendszer' : 'Világos mód';
        document.querySelectorAll('[data-theme]').forEach(b => {
          b.className = `btn btn-sm ${b.dataset.theme === t ? 'btn-primary' : 'btn-ghost'}`;
        });
        App.toast('Téma megváltoztatva.', 'info');
      });
    });

    /* Export JSON */
    document.getElementById('export-btn')?.addEventListener('click', async () => {
      try {
        const data = await App.db.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `allergytrack-backup-${App.DATA.todayISO()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        App.toast('Export letöltve!', 'success');
      } catch (e) {
        App.toast('Export hiba: ' + e.message, 'error');
      }
    });

    /* Export CSV */
    document.getElementById('export-csv-btn')?.addEventListener('click', async () => {
      try {
        const logs = await App.db.getSymptomsLogs();
        if (logs.length === 0) { App.toast('Nincs exportálható napló.', 'info'); return; }

        const rows = [
          ['Dátum','Helyszín','Tünetek','Súlyosság','Gyógyszer','Hőmérséklet','Megjegyzés'],
          ...logs.map(l => [
            l.date,
            l.location || '',
            (l.symptoms || []).map(s => {
              const sym = App.DATA.getSymptomById(s.id);
              return sym ? sym.name : s.id;
            }).join('; '),
            l.overall_severity || 0,
            (l.medications_taken || []).map(m => m.name).join('; '),
            l.temperature || '',
            (l.notes || '').replace(/"/g, '""'),
          ])
        ];

        const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `allergytrack-naplo-${App.DATA.todayISO()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        App.toast('CSV letöltve!', 'success');
      } catch (e) {
        App.toast('Export hiba: ' + e.message, 'error');
      }
    });

    /* Import */
    document.getElementById('import-btn')?.addEventListener('click', () => {
      document.getElementById('import-file-input')?.click();
    });

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

    await this.loadStorageStats();
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
