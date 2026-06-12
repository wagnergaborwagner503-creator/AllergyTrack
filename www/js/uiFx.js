/* ═══════════════════════════════════════════════
   AllergyTrack – UI FX (Design 2.0)

   Interaktív effektek:
     • Ripple (érintés-hullám) gombokon
     • Lépcsőzetes belépő animáció (scroll reveal)
     • Számláló animáció a statisztika kártyákon
     • Lebegő levél-részecskék a háttérben
     • 3D tilt az üdvözlőkártyán

   Tiszteletben tartja a prefers-reduced-motion
   beállítást – ilyenkor semmit sem csinál.
   ═══════════════════════════════════════════════ */

window.App = window.App || {};

App.UIFX = {

  _io: null,
  _mo: null,
  _t:  null,

  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* IntersectionObserver a belépő animációkhoz */
    this._io = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('fx-in');
          this._io.unobserve(en.target);
        }
      }
    }, { threshold: .08 });

    this._particles();
    this._ripples();
    this._tilt();
    this._observePage();
    this._apply(document.getElementById('page-content'));
  },

  /* ── Lebegő levelek a háttérben (passzív) ───── */
  _particles() {
    const wrap = document.createElement('div');
    wrap.className = 'fx-particles';
    wrap.setAttribute('aria-hidden', 'true');
    const glyphs = ['🍃', '🌿', '❀', '🌱'];
    for (let i = 0; i < 9; i++) {
      const s = document.createElement('span');
      s.className = 'fx-leaf';
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = (4 + Math.random() * 92) + '%';
      s.style.fontSize = (12 + Math.random() * 12) + 'px';
      s.style.animationDuration = (16 + Math.random() * 18) + 's';
      s.style.animationDelay = (-Math.random() * 30) + 's';
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
  },

  /* ── Ripple effekt gombszerű elemeken ───────── */
  _ripples() {
    const SEL = [
      '.btn', '.symptom-btn', '.env-btn', '.settings-item', '.drawer-item',
      '.chip-selectable', '.trigger-chip', '.pill-tab', '.allergen-chip',
      '.date-nav-btn', '.icon-btn', '.nav-item', '.allergen-list-item',
      '.log-item', '.feedback-cat-btn', '.knowledge-card-header',
    ].join(',');
    /* .profile-btn és .nav-fab-btn szándékosan kimarad:
       azoknak overflow:visible kell (státusz-pont / FAB kör) */

    document.addEventListener('pointerdown', e => {
      const host = e.target.closest?.(SEL);
      if (!host) return;
      host.classList.add('fx-ripple-host');
      const rect = host.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height);
      const r = document.createElement('span');
      r.className = 'fx-ripple';
      r.style.width = r.style.height = d + 'px';
      r.style.left = (e.clientX - rect.left - d / 2) + 'px';
      r.style.top  = (e.clientY - rect.top  - d / 2) + 'px';
      host.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }, { passive: true });
  },

  /* ── 3D tilt az üdvözlőkártyán ──────────────── */
  _tilt() {
    document.addEventListener('pointermove', e => {
      const card = e.target.closest?.('.greeting-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform =
        `perspective(700px) rotateY(${(x * 4).toFixed(2)}deg) rotateX(${(y * -4).toFixed(2)}deg)`;
    }, { passive: true });

    document.addEventListener('pointerleave', e => {
      const card = e.target?.closest?.('.greeting-card');
      if (card) card.style.transform = '';
    }, { passive: true, capture: true });
  },

  /* ── Oldalváltás figyelése (SPA: innerHTML csere) ── */
  _observePage() {
    const pc = document.getElementById('page-content');
    if (!pc) return;
    this._mo = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'childList' && m.addedNodes.length) {
          clearTimeout(this._t);
          this._t = setTimeout(() => this._apply(pc), 30);
          break;
        }
      }
    });
    this._mo.observe(pc, { childList: true, subtree: false });
  },

  /* ── Reveal + számláló alkalmazása az új tartalomra ── */
  _apply(root) {
    if (!root || !this._io) return;

    const items = root.querySelectorAll([
      '.card:not(.fx-reveal)', '.stat-card:not(.fx-reveal)',
      '.greeting-card:not(.fx-reveal)', '.log-item:not(.fx-reveal)',
      '.allergen-chip:not(.fx-reveal)', '.chart-wrap:not(.fx-reveal)',
      '.knowledge-card:not(.fx-reveal)', '.allergen-list-item:not(.fx-reveal)',
      '.settings-section:not(.fx-reveal)',
    ].join(','));

    let i = 0;
    items.forEach(el => {
      el.classList.add('fx-reveal');
      el.style.setProperty('--fx-delay', Math.min(i++ * 45, 420) + 'ms');
      this._io.observe(el);
    });

    /* Biztonsági háló: ha az IntersectionObserver nem tüzelne
       (rejtett/throttolt tab), a tartalom akkor se maradjon láthatatlan */
    if (items.length) {
      setTimeout(() => {
        items.forEach(el => el.classList.add('fx-in'));
      }, 900);
    }

    this._countUp(root);
  },

  /* ── Számláló animáció a .stat-value elemeken ── */
  _countUp(root) {
    root.querySelectorAll('.stat-value').forEach(el => {
      if (el.dataset.fxDone) return;
      const txt = el.textContent.trim();
      /* csak tiszta számokat animálunk (dátumot, "–"-t nem) */
      if (!/^\d+([.,]\d+)?$/.test(txt)) return;
      const num = parseFloat(txt.replace(',', '.'));
      if (!isFinite(num) || num === 0) return;

      el.dataset.fxDone = '1';
      const dec = /[.,]\d/.test(txt) ? 1 : 0;
      const t0 = performance.now();
      const dur = 800;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);   /* easeOutCubic */
        el.textContent = (num * ease).toFixed(dec).replace('.', ',');
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = txt;
      };
      requestAnimationFrame(tick);
    });
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.UIFX.init());
} else {
  App.UIFX.init();
}
