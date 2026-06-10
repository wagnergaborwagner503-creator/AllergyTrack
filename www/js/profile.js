/* ═══════════════════════════════════════════
   AllergyTrack – Allergen Profile Page
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Profile = {

  async render() {
    const profile = await App.db.getAllergenProfile();
    const trackedIds = new Set(profile.map(p => p.allergen_id));

    const renderCategory = (title, icon, allergens) => {
      const items = allergens.map(a => {
        const tracked = trackedIds.has(a.id);
        const prof    = profile.find(p => p.allergen_id === a.id);
        const sens    = prof?.sensitivity || 3;
        return `
        <div class="allergen-list-item ${tracked ? 'tracked' : ''}" data-allergen-id="${a.id}">
          <span class="allergen-icon">${a.icon}</span>
          <div class="allergen-info">
            <div class="allergen-name">${a.name}</div>
            ${a.latinName ? `<div class="allergen-latin">${a.latinName}</div>` : ''}
            ${a.season    ? `<div class="allergen-season">📅 ${a.season}</div>` : ''}
            ${tracked ? `<div class="severity-dots mt-2" data-level="${sens}">
              ${[1,2,3,4,5].map(() => '<div class="severity-dot"></div>').join('')}
            </div>` : ''}
          </div>
          <div class="allergen-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>`;
      }).join('');

      return `
      <div class="mb-5">
        <div style="font-size:13px;font-weight:800;color:var(--text-muted);text-transform:uppercase;
                    letter-spacing:1px;margin-bottom:12px">${icon} ${title}</div>
        <div class="allergen-list">${items}</div>
      </div>`;
    };

    return `
    <div class="page" id="page-profile">
      <div class="section-header mb-2">
        <div class="section-title">Allergia profil</div>
        <span class="chip chip-accent">${trackedIds.size} kiválasztott</span>
      </div>
      <p class="text-sm text-muted mb-4">
        Jelöld ki azokat az allergeneket, amelyekre érzékeny vagy.
        Ezek megjelennek a vezérlőpulton és az elemzésekben.
      </p>

      ${renderCategory('Szezonális allergenek', '🌳', App.DATA.ALLERGENS.seasonal)}
      ${renderCategory('Általános allergenek', '🐱', App.DATA.ALLERGENS.general)}
      ${renderCategory('Élelmiszer allergenek', '🥜', App.DATA.ALLERGENS.food)}

      <div style="height:16px"></div>
    </div>`;
  },

  mount() {
    document.querySelectorAll('.allergen-list-item').forEach(item => {
      item.addEventListener('click', () => this.toggleAllergen(item));
    });
  },

  async toggleAllergen(item) {
    const id       = item.dataset.allergenId;
    const tracked  = item.classList.contains('tracked');
    const allergen = App.DATA.getAllergenById(id);
    if (!allergen) return;

    if (tracked) {
      await App.db.deleteAllergenProfile(id);
      item.classList.remove('tracked');
      /* Remove sensitivity dots */
      item.querySelector('.severity-dots')?.remove();
      App.toast(`${allergen.name} eltávolítva a profilból`, 'info');
    } else {
      /* Show sensitivity picker */
      this.showSensitivityModal(allergen, async sens => {
        await App.db.saveAllergenProfile({
          allergen_id: id,
          name:        allergen.name,
          category:    allergen.season ? 'seasonal' : 'general',
          sensitivity: sens,
          notes:       '',
        });
        item.classList.add('tracked');
        /* Add/update dots */
        const dotsEl = item.querySelector('.severity-dots');
        const dotsHtml = `<div class="severity-dots mt-2" data-level="${sens}">
          ${[1,2,3,4,5].map(() => '<div class="severity-dot"></div>').join('')}
        </div>`;
        if (dotsEl) {
          dotsEl.outerHTML = dotsHtml;
        } else {
          item.querySelector('.allergen-info').insertAdjacentHTML('beforeend', dotsHtml);
        }
        App.toast(`${allergen.name} hozzáadva a profilhoz`, 'success');
      });
    }
  },

  showSensitivityModal(allergen, onSave) {
    App.showModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">${allergen.icon} ${allergen.name}</div>
      ${allergen.latinName ? `<div class="text-sm text-muted mb-3" style="font-style:italic">${allergen.latinName}</div>` : ''}
      <div class="form-group">
        <label class="form-label">Érzékenység mértéke</label>
        <div class="range-wrap">
          <input type="range" id="sens-slider" min="1" max="5" value="3">
          <div class="range-labels">
            <span>Enyhe</span>
            <span style="text-align:center">Közepes</span>
            <span style="text-align:right">Nagyon érzékeny</span>
          </div>
          <div class="range-value" id="sens-val">3</div>
        </div>
        <div id="sens-label" style="text-align:center;margin-top:12px;font-size:14px;font-weight:700;color:var(--accent)">
          Közepes érzékenység
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="sens-save-btn">Hozzáadás</button>
        <button class="btn btn-ghost" id="sens-cancel-btn">Mégse</button>
      </div>
    `);

    const labels = ['', 'Enyhe', 'Enyhe-közepes', 'Közepes', 'Erős', 'Nagyon erős'];
    const slider = document.getElementById('sens-slider');
    const valEl  = document.getElementById('sens-val');
    const lbEl   = document.getElementById('sens-label');

    slider?.addEventListener('input', () => {
      const v = parseInt(slider.value);
      if (valEl) valEl.textContent = v;
      if (lbEl)  lbEl.textContent  = labels[v] + ' érzékenység';
    });

    document.getElementById('sens-cancel-btn')?.addEventListener('click', () => App.closeModal());
    document.getElementById('sens-save-btn')?.addEventListener('click', () => {
      const v = parseInt(document.getElementById('sens-slider')?.value || '3');
      App.closeModal();
      onSave(v);
    });
  },
};
