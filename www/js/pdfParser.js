/* ═══════════════════════════════════════════════════════════
   AllergyTrack – PDF Parser  (v2 – NNGYK format)
   ───────────────────────────────────────────────────────────
   Parses "Részletes napi pollenjelentés" published by the
   Nemzeti Népegészségügyi és Gyógyszerészeti Központ (NNGYK).

   Format (per station block):
     • Station name on its own line (ALL CAPS, possibly garbled)
     • Header: "2026. év  latin név  allergénitás  máj.18.  …"
     • Day-of-week row: "Hé  Ke  Sze  Cs  Pé  Szo  Va"
     • Data rows: "tölgy  Quercus  1  -  +  ++  +  …"

   Risk mapping  (+ signs → level 0–4):
     -       absent / no data         → risk 0  (Nincs – stored as gray)
     +       alacsony (low)           → risk 1
     ++      közepes (medium)         → risk 2
     +++     magas (high)             → risk 3
     ++++    nagyon magas (very high) → risk 4  (Extrém)
     n.a.    nincs adat               → risk 0  (Nincs – stored as gray)

   Uses PDF.js for text extraction (loaded from CDN).
   ═══════════════════════════════════════════════════════════ */

window.App = window.App || {};

App.pdfParser = (function () {

  /* ── Configure PDF.js worker ────────────────────────────── */
  function ensureWorker() {
    if (typeof pdfjsLib === 'undefined') return false;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        window.pdfjsWorkerSrc ||
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    return true;
  }

  /* ── Latin name → allergen id map ──────────────────────── */
  const LATIN_MAP = [
    { re: /\bAmbrosia\b/i,     id: 'ambrosia'   },
    { re: /\bBetula\b/i,       id: 'betula'     },
    { re: /\bAlnus\b/i,        id: 'alnus'      },
    { re: /\bCorylus\b/i,      id: 'corylus'    },
    { re: /\bFraxinus\b/i,     id: 'fraxinus'   },
    { re: /\bPlatanus\b/i,     id: 'platanus'   },
    { re: /\bQuercus\b/i,      id: 'quercus'    },
    { re: /\bJuglans\b/i,      id: 'juglans'    },
    { re: /\bFagus\b/i,        id: 'fagus'      },
    { re: /\bAesculus\b/i,     id: 'aesculus'   },
    { re: /\bSambucus\b/i,     id: 'sambucus'   },
    { re: /\bPopulus\b/i,      id: 'populus'    },
    { re: /\bCupressus\b/i,    id: 'cupressus'  },
    { re: /\bCarpinus\b/i,     id: 'carpinus'   },
    { re: /\bAcer\b/i,         id: 'acer'       },
    { re: /\bMoraceae\b/i,     id: 'moraceae'   },
    { re: /\bPinaceae\b/i,     id: 'pinaceae'   },
    { re: /\bPoaceae\b/i,      id: 'poaceae'    },
    { re: /\bGramineae\b/i,    id: 'poaceae'    },
    { re: /\bArtemisia\b/i,    id: 'artemisia'  },
    { re: /\bPlantago\b/i,     id: 'plantago'   },
    { re: /\bUrtic/i,          id: 'urtica'     },   /* Urtica / Urticaceae */
    { re: /\bRumex\b/i,        id: 'rumex'      },
    { re: /\bChenopodium\b/i,  id: 'chenopodium'},
    { re: /\bAlternaria\b/i,   id: 'alternaria' },
    { re: /\bEpicoccum\b/i,    id: 'epicoccum'  },
    { re: /\bCladosporium\b/i, id: 'mold'       },
  ];

  /* ── + signs → risk level (0–4 scale) ──────────────────── */
  function plusToRisk(token) {
    const t = token.trim();
    if (t === '++++')                return 4;   /* Extrém  */
    if (t === '+++')                 return 3;   /* Magas   */
    if (t === '++')                  return 2;   /* Közepes */
    if (t === '+')                   return 1;   /* Alacsony */
    if (t === '-')                   return 0;   /* Nincs – store, not skip */
    if (t === 'n.a.' || t === 'n.a') return 0;  /* Nincs – store, not skip */
    return -1;  /* truly unknown token → skip */
  }

  /* risk level → representative concentration (db/m³ equiv.) */
  const RISK_CONC = { 0: 0, 1: 5, 2: 20, 3: 60, 4: 200 };

  /* ── Hungarian month abbreviations (incl. garbled forms) ── */
  /* PDF text extraction garbles accented chars to '?' / '\x80-\xFF' */
  const MONTH_RE = [
    /* pattern                  month */
    [/\bjan\.\s*(\d{1,2})\./i,    1],
    [/\bfebr?\.\s*(\d{1,2})\./i,  2],
    [/\bm.rc\.\s*(\d{1,2})\./i,   3],  /* márc. */
    [/\b.pr\.\s*(\d{1,2})\./i,    4],  /* ápr. */
    [/\bm.j\.\s*(\d{1,2})\./i,    5],  /* máj. */
    [/\bj.n\.\s*(\d{1,2})\./i,    6],  /* jún. */
    [/\bj.l\.\s*(\d{1,2})\./i,    7],  /* júl. */
    [/\baug\.\s*(\d{1,2})\./i,    8],
    [/\bszept\.\s*(\d{1,2})\./i,  9],
    [/\bokt\.\s*(\d{1,2})\./i,   10],
    [/\bnov\.\s*(\d{1,2})\./i,   11],
    [/\bdec\.\s*(\d{1,2})\./i,   12],
  ];

  /* Extract all dates from a header line, returns ['YYYY-MM-DD', …] */
  function parseDatesFromLine(line, year) {
    const dates = [];
    for (const [re, month] of MONTH_RE) {
      let m;
      const reCopy = new RegExp(re.source, 'gi');
      while ((m = reCopy.exec(line)) !== null) {
        const day  = parseInt(m[1]);
        const iso  = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        dates.push({ pos: m.index, iso });
      }
    }
    /* Sort by position in line (left → right = chronological) */
    dates.sort((a, b) => a.pos - b.pos);
    return dates.map(d => d.iso);
  }

  /* Detect year in a line */
  function parseYear(line) {
    const m = line.match(/\b(20\d{2})\b/);
    return m ? parseInt(m[1]) : null;
  }

  /* ── Station name detection ─────────────────────────────── */
  /* Station lines are ALL-CAPS (may contain '?' for garbled accents) */
  const SKIP_PATTERNS = [
    /NEMZETI/i, /LABORAT/i, /JELMAGYAR/i, /ALLERG/i,
    /BUDAPEST.*KFT/i, /TELEFON/i, /NPGYK/i, /NNGYK/i,
    /GYÓGYSZER/i, /K.ZPONT/i, /AEROBIOL/i,
  ];
  const STATION_MAP = typeof App.DATA !== 'undefined' ? App.DATA.STATION_MAP : [];

  /* Hungarian uppercase letters that appear in station names */
  const HU_UPPER = 'ÁÉÍÓÖŐÚÜŰ';
  const HU_LOWER = 'áéíóöőúüű';

  function detectStation(line) {
    const trimmed = line.trim();
    if (trimmed.length < 3 || trimmed.length > 50) return null;
    /* Must be all uppercase (ASCII + Hungarian accented) with no lowercase */
    const upperRe = new RegExp(`^[A-Z${HU_UPPER}0-9\\?\\-\\.\\s]+$`);
    if (!upperRe.test(trimmed)) return null;
    /* Must not contain any Hungarian lowercase */
    const lowerRe = new RegExp(`[a-z${HU_LOWER}]`);
    if (lowerRe.test(trimmed)) return null;
    /* Must not be a known skip pattern */
    if (SKIP_PATTERNS.some(r => r.test(trimmed))) return null;
    /* Must not be a day-of-week row */
    if (/\b(H.?|Ke|Sze|Cs|P.|Szo|Va)\b/.test(trimmed) && trimmed.split(/\s+/).length > 3) return null;
    /* Must not be purely numeric or a year line */
    if (/^\d/.test(trimmed)) return null;

    const normalised = trimmed.replace(/\s+/g, ' ').trim();

    /* Try STATION_MAP first */
    const mapEntry = (App.DATA?.STATION_MAP || []).find(e => e.re.test(normalised));
    if (mapEntry) return mapEntry.name;

    /* Fallback: single ALL-CAPS word ≥ 4 chars (allow accented) */
    const wordRe = new RegExp(`^[A-Z${HU_UPPER}][A-Z${HU_UPPER}\\?\\-]{3,}$`);
    if (wordRe.test(normalised)) {
      return normalised;
    }
    return null;
  }

  /* ── Value token extraction ─────────────────────────────── */
  const VALUE_TOKENS = new Set(['-', '+', '++', '+++', '++++', 'n.a.', 'n.a']);

  function extractValues(tokens) {
    return tokens.filter(t => VALUE_TOKENS.has(t));
  }

  /* ── Parse a single data row ────────────────────────────── */
  function parseDataRow(line) {
    /* Tokenise on whitespace */
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    if (tokens.length < 3) return null;

    /* Find the Latin name */
    let latinIdx = -1;
    let allergenId = null;
    for (let i = 0; i < tokens.length; i++) {
      for (const entry of LATIN_MAP) {
        if (entry.re.test(tokens[i])) {
          latinIdx   = i;
          allergenId = entry.id;
          break;
        }
      }
      if (latinIdx >= 0) break;
    }
    if (latinIdx < 0 || !allergenId) return null;

    /* Allergenicity is the token after the Latin name (integer or range like "1-2") */
    const afterLatin = tokens.slice(latinIdx + 1);

    /* values start after the allergenicity number */
    let valueStartIdx = 0;
    if (/^\d/.test(afterLatin[0])) valueStartIdx = 1;

    const values = extractValues(afterLatin.slice(valueStartIdx));
    if (values.length === 0) return null;

    return { allergenId, values };
  }

  /* ── Full-page state-machine parser ─────────────────────── */
  function parseTextPages(pages) {
    const results = [];
    let year       = new Date().getFullYear();
    let station    = null;
    let dates      = [];  /* active date columns for current station block */

    for (const lines of pages) {
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        /* ── Detect year ── */
        const yr = parseYear(line);
        if (yr) year = yr;

        /* ── Detect station name ── */
        const stn = detectStation(line);
        if (stn) {
          station = stn;
          dates   = [];   /* reset columns for new station */
          continue;
        }

        /* ── Detect date header row ──
           Line like: "2026. év  latin név  allergénitás  máj.18.  máj.19. …" */
        if (/\bm.j\.\d|\b.pr\.\d|\bj.n\.\d|\bj.l\.\d|\baug\.\d|\bszept\.\d|\bokt\.\d|\bnov\.\d|\bdec\.\d|\bjan\.\d|\bfebr\.\d|\bm.rc\.\d/i.test(line)) {
          const parsed = parseDatesFromLine(line, year);
          if (parsed.length >= 1) {
            dates = parsed;
          }
          continue;
        }

        /* ── Skip day-of-week row ── */
        if (/\b(H.?)\s+(Ke)\s+(Sze)/i.test(line)) continue;

        /* ── Parse data row ── */
        if (!station || dates.length === 0) continue;

        const row = parseDataRow(line);
        if (!row) continue;

        /* Map values to dates */
        row.values.forEach((val, idx) => {
          if (idx >= dates.length) return;
          const risk = plusToRisk(val);
          if (risk < 0) return;          /* skip truly unknown tokens */

          results.push({
            date:          dates[idx],
            location:      station,
            allergen_id:   row.allergenId,
            concentration: RISK_CONC[risk],
            unit:          'szint',
            risk_level:    risk,
          });
        });
      }
    }

    return results;
  }

  /* ── Extract text from all PDF pages via PDF.js ─────────── */
  async function extractPages(file) {
    const buffer = await file.arrayBuffer();
    const pdf    = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages  = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      const page    = await pdf.getPage(p);
      const content = await page.getTextContent();

      /* Reconstruct lines: items close in Y → same line */
      const lineMap = {};
      content.items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (!lineMap[y]) lineMap[y] = [];
        if (item.str.trim()) lineMap[y].push(item.str.trim());
      });

      /* Sort by Y descending (top → bottom) */
      const sortedY = Object.keys(lineMap)
        .map(Number)
        .sort((a, b) => b - a);

      pages.push(sortedY.map(y => lineMap[y].join(' ')));
    }

    return pages;
  }

  /* ── Deduplicate: same date+location+allergen → keep highest ── */
  function deduplicate(entries) {
    const map = {};
    entries.forEach(e => {
      const key = `${e.date}|${e.location}|${e.allergen_id}`;
      if (!map[key] || e.risk_level > map[key].risk_level) map[key] = e;
    });
    return Object.values(map);
  }

  /* ── Detect report date from page text ───────────────────── */
  function detectReportDate(pages, year) {
    /* Look for the most recent date appearing in a data block */
    const allDates = [];
    for (const lines of pages) {
      for (const line of lines) {
        for (const [re, month] of MONTH_RE) {
          let m;
          const reCopy = new RegExp(re.source, 'gi');
          while ((m = reCopy.exec(line)) !== null) {
            const day = parseInt(m[1]);
            allDates.push(new Date(year, month - 1, day));
          }
        }
      }
    }
    if (!allDates.length) return null;
    const latest = new Date(Math.max(...allDates.map(d => d.getTime())));
    return `${latest.getFullYear()}-${String(latest.getMonth()+1).padStart(2,'0')}-${String(latest.getDate()).padStart(2,'0')}`;
  }

  /* ── Public API ─────────────────────────────────────────── */
  async function parseFile(file) {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Csak PDF fájl fogadható el.');
    }
    if (!ensureWorker()) {
      throw new Error('PDF.js könyvtár nem elérhető. Ellenőrizd az internetkapcsolatot.');
    }

    const pages   = await extractPages(file);
    const year    = (() => {
      for (const pg of pages) for (const l of pg) { const y = parseYear(l); if (y) return y; }
      return new Date().getFullYear();
    })();

    const rawEntries  = parseTextPages(pages);
    const entries     = deduplicate(rawEntries);
    const reportDate  = detectReportDate(pages, year);

    console.log(`[pdfParser] year=${year} pages=${pages.length} raw=${rawEntries.length} deduped=${entries.length} date=${reportDate}`);
    if (entries.length === 0) {
      console.warn('[pdfParser] No entries found. First lines per page:', pages.map(p => p.slice(0,3)));
    }

    return {
      date:    reportDate,
      entries,
      stats: {
        stations:  [...new Set(entries.map(e => e.location))].length,
        allergens: [...new Set(entries.map(e => e.allergen_id))].length,
        dates:     [...new Set(entries.map(e => e.date))].length,
      },
    };
  }

  function isPdfJsAvailable() {
    return typeof pdfjsLib !== 'undefined';
  }

  return { parseFile, isPdfJsAvailable };
})();
