/* ═══════════════════════════════════════════
   AllergyTrack – Static Data Constants
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.DATA = {

  /* ── Allergens ─────────────────────────────── */
  ALLERGENS: {
    seasonal: [
      /* ── Fák (Trees) ── */
      { id: 'betula',     name: 'Nyír',          latinName: 'Betula pendula',          season: 'Már–Ápr', icon: '🌳', color: '#4CAF50', riskMonths: [2,3] },
      { id: 'alnus',      name: 'Éger',          latinName: 'Alnus glutinosa',         season: 'Feb–Már', icon: '🌲', color: '#795548', riskMonths: [1,2] },
      { id: 'corylus',    name: 'Mogyoró',       latinName: 'Corylus avellana',        season: 'Jan–Már', icon: '🌿', color: '#8D6E63', riskMonths: [0,1,2] },
      { id: 'fraxinus',   name: 'Kőris',         latinName: 'Fraxinus excelsior',      season: 'Már–Máj', icon: '🌳', color: '#66BB6A', riskMonths: [2,3,4] },
      { id: 'platanus',   name: 'Platán',        latinName: 'Platanus acerifolia',     season: 'Ápr–Máj', icon: '🌳', color: '#26A69A', riskMonths: [3,4] },
      { id: 'quercus',    name: 'Tölgy',         latinName: 'Quercus robur',           season: 'Ápr–Máj', icon: '🌳', color: '#A1887F', riskMonths: [3,4] },
      { id: 'juglans',    name: 'Dió',           latinName: 'Juglans regia',           season: 'Ápr–Máj', icon: '🌰', color: '#6D4C41', riskMonths: [3,4] },
      { id: 'fagus',      name: 'Bükkfa',        latinName: 'Fagus sylvatica',         season: 'Ápr–Máj', icon: '🌳', color: '#8D6E63', riskMonths: [3,4] },
      { id: 'aesculus',   name: 'Vadgesztenye',  latinName: 'Aesculus hippocastanum',  season: 'Ápr–Máj', icon: '🌳', color: '#FF8F00', riskMonths: [3,4] },
      { id: 'sambucus',   name: 'Bodza',         latinName: 'Sambucus nigra',          season: 'Máj–Jún', icon: '🌸', color: '#F8BBD0', riskMonths: [4,5] },
      { id: 'populus',    name: 'Nyárfa',        latinName: 'Populus alba',            season: 'Már–Ápr', icon: '🌳', color: '#AED581', riskMonths: [2,3] },
      { id: 'cupressus',  name: 'Ciprusfélék',   latinName: 'Cupressaceae',            season: 'Jan–Már', icon: '🌲', color: '#1B5E20', riskMonths: [0,1,2] },
      { id: 'carpinus',   name: 'Gyertyán',      latinName: 'Carpinus betulus',        season: 'Ápr–Máj', icon: '🌳', color: '#6D4C41', riskMonths: [3,4] },
      { id: 'acer',       name: 'Juhar',         latinName: 'Acer platanoides',        season: 'Ápr–Máj', icon: '🍁', color: '#F44336', riskMonths: [3,4] },
      { id: 'moraceae',   name: 'Eperfafélék',   latinName: 'Moraceae',                season: 'Ápr–Jún', icon: '🌳', color: '#E91E63', riskMonths: [3,4,5] },
      { id: 'pinaceae',   name: 'Fenyőfélék',    latinName: 'Pinaceae',                season: 'Ápr–Jún', icon: '🌲', color: '#2E7D32', riskMonths: [3,4,5] },
      /* ── Lágyszárúak (Herbs/Grasses) ── */
      { id: 'poaceae',    name: 'Pázsitfüvek',   latinName: 'Poaceae',                 season: 'Máj–Júl', icon: '🌾', color: '#CDDC39', riskMonths: [4,5,6] },
      { id: 'ambrosia',   name: 'Parlagfű',      latinName: 'Ambrosia artemisiifolia', season: 'Aug–Okt', icon: '🌿', color: '#FF6B35', riskMonths: [7,8,9] },
      { id: 'artemisia',  name: 'Üröm',          latinName: 'Artemisia vulgaris',      season: 'Júl–Szep', icon: '🌿', color: '#9C27B0', riskMonths: [6,7,8] },
      { id: 'plantago',   name: 'Útifű',         latinName: 'Plantago lanceolata',     season: 'Máj–Szep', icon: '🍃', color: '#009688', riskMonths: [4,5,6,7,8] },
      { id: 'urtica',     name: 'Csalánfélék',   latinName: 'Urticaceae',              season: 'Máj–Szep', icon: '🌿', color: '#8BC34A', riskMonths: [4,5,6,7,8] },
      { id: 'rumex',      name: 'Lórom',         latinName: 'Rumex sp.',               season: 'Máj–Jún', icon: '🍃', color: '#FF7043', riskMonths: [4,5] },
      { id: 'chenopodium',name: 'Libatop',       latinName: 'Chenopodium album',       season: 'Júl–Szep', icon: '🍃', color: '#43A047', riskMonths: [6,7,8] },
    ],
    general: [
      { id: 'cat',          name: 'Macska',            icon: '🐱', color: '#FF9800' },
      { id: 'dog',          name: 'Kutya',             icon: '🐶', color: '#795548' },
      { id: 'horse',        name: 'Ló',                icon: '🐴', color: '#8D6E63' },
      { id: 'dust_mite',    name: 'Háziporatka',       icon: '🔬', color: '#9E9E9E' },
      { id: 'alternaria',   name: 'Alternaria (gomba)', icon: '🍄', color: '#616161' },
      { id: 'epicoccum',    name: 'Epicoccum (gomba)',  icon: '🍄', color: '#757575' },
      { id: 'mold',         name: 'Penészgomba (egyéb)',icon: '🍄', color: '#8D6E63' },
      { id: 'cockroach',    name: 'Csótány',           icon: '🪳', color: '#4E342E' },
      { id: 'bee',          name: 'Méh / Darázs',      icon: '🐝', color: '#FFC107' },
      { id: 'latex',        name: 'Latex',             icon: '🧤', color: '#E91E63' },
      { id: 'nickel',       name: 'Nikkel',            icon: '💍', color: '#78909C' },
      { id: 'perfume',      name: 'Illatanyag',        icon: '🧴', color: '#CE93D8' },
    ],
    food: [
      { id: 'peanut',     name: 'Mogyoró',             icon: '🥜', color: '#D4A017' },
      { id: 'tree_nuts',  name: 'Diófélék',            icon: '🌰', color: '#8D6E63' },
      { id: 'milk',       name: 'Tejtermékek',         icon: '🥛', color: '#90CAF9' },
      { id: 'egg',        name: 'Tojás',               icon: '🥚', color: '#FFF9C4' },
      { id: 'wheat',      name: 'Búza / Glutén',       icon: '🌾', color: '#FFCC80' },
      { id: 'soy',        name: 'Szója',               icon: '🫘', color: '#A5D6A7' },
      { id: 'fish',       name: 'Hal',                 icon: '🐟', color: '#4FC3F7' },
      { id: 'shellfish',  name: 'Rákfélék',            icon: '🦐', color: '#FF5722' },
      { id: 'sesame',     name: 'Szezám',              icon: '🌱', color: '#FFEB3B' },
      { id: 'celery',     name: 'Zeller',              icon: '🥬', color: '#66BB6A' },
      { id: 'mustard',    name: 'Mustár',              icon: '🌿', color: '#FFCA28' },
      { id: 'sulphite',   name: 'Szulfit',             icon: '🍷', color: '#AB47BC' },
    ]
  },

  /* ── Symptoms ──────────────────────────────── */
  SYMPTOMS: [
    /* Nasals */
    { id: 'sneezing',          name: 'Tüsszögés',         icon: '🤧', cat: 'Orr' },
    { id: 'runny_nose',        name: 'Orrfolyás',         icon: '💧', cat: 'Orr' },
    { id: 'nasal_congestion',  name: 'Orrdugulás',        icon: '😤', cat: 'Orr' },
    { id: 'itchy_nose',        name: 'Orrvakaródzás',     icon: '👃', cat: 'Orr' },
    /* Eyes */
    { id: 'itchy_eyes',        name: 'Szemviszketés',     icon: '👁️', cat: 'Szem' },
    { id: 'watery_eyes',       name: 'Szemkönnyezés',     icon: '😢', cat: 'Szem' },
    { id: 'red_eyes',          name: 'Szemkipirosodás',   icon: '🔴', cat: 'Szem' },
    { id: 'swollen_eyes',      name: 'Szemduzzanat',      icon: '😵', cat: 'Szem' },
    /* Respiratory */
    { id: 'asthma',            name: 'Asztma / Légszomj', icon: '😮‍💨', cat: 'Légút' },
    { id: 'cough',             name: 'Köhögés',           icon: '🫁', cat: 'Légút' },
    { id: 'wheezing',          name: 'Zihálás',           icon: '🌬️', cat: 'Légút' },
    { id: 'throat_itch',       name: 'Torokviszketés',    icon: '🗣️', cat: 'Légút' },
    /* Skin */
    { id: 'itchy_skin',        name: 'Bőrviszketés',      icon: '🖐️', cat: 'Bőr' },
    { id: 'rash',              name: 'Bőrkiütés',         icon: '🩺', cat: 'Bőr' },
    { id: 'hives',             name: 'Csalánkiütés',      icon: '🌡️', cat: 'Bőr' },
    { id: 'eczema',            name: 'Ekcéma',            icon: '🩹', cat: 'Bőr' },
    { id: 'angioedema',        name: 'Arcödéma',          icon: '😳', cat: 'Bőr' },
    /* General */
    { id: 'headache',          name: 'Fejfájás',          icon: '🤕', cat: 'Általános' },
    { id: 'fatigue',           name: 'Fáradtság',         icon: '😴', cat: 'Általános' },
    { id: 'earache',           name: 'Fülprobléma',       icon: '👂', cat: 'Általános' },
    { id: 'nausea',            name: 'Hányinger',         icon: '🤢', cat: 'Általános' },
    { id: 'abdominal',         name: 'Hasfájás',          icon: '🫄', cat: 'Általános' },
  ],

  /* ── Environments ──────────────────────────── */
  ENVIRONMENTS: {
    location: [
      { id: 'outdoor',   name: 'Kültéri',      icon: '🌳' },
      { id: 'indoor',    name: 'Beltéri',       icon: '🏠' },
      { id: 'work',      name: 'Munkahely',     icon: '🏢' },
      { id: 'transport', name: 'Közlekedés',    icon: '🚌' },
    ],
    wind: [
      { id: 'calm',      name: 'Szélcsendes',   icon: '🌫️' },
      { id: 'light',     name: 'Gyenge szél',   icon: '🍃' },
      { id: 'moderate',  name: 'Közepes szél',  icon: '💨' },
      { id: 'strong',    name: 'Erős szél',     icon: '🌬️' },
    ],
    humidity: [
      { id: 'dry',     name: 'Száraz',    icon: '🏜️' },
      { id: 'normal',  name: 'Normál',   icon: '✅' },
      { id: 'humid',   name: 'Párás',    icon: '💦' },
      { id: 'rainy',   name: 'Esős',     icon: '🌧️' },
    ],
    windows: [
      { id: 'open',   name: 'Ablak nyitva',  icon: '🪟' },
      { id: 'closed', name: 'Ablak zárva',   icon: '🔒' },
    ]
  },

  /* ── Risk levels ───────────────────────────── */
  RISK_LEVELS: [
    { id: 0, label: 'Alacsony',   short: 'Alacsony', cssClass: 'risk-label-0', color: '#2E7D32' },
    { id: 1, label: 'Közepes',    short: 'Közepes',  cssClass: 'risk-label-1', color: '#558B2F' },
    { id: 2, label: 'Magas',      short: 'Magas',    cssClass: 'risk-label-2', color: '#E65100' },
    { id: 3, label: 'Nagyon magas', short: 'V.Magas', cssClass: 'risk-label-3', color: '#C62828' },
  ],

  /* ── Hungarian cities for pollen stations ──── */
  /* Includes all NNGYK aerobiological monitoring stations */
  STATIONS: [
    'Budapest', 'Budapest-Pest', 'Budapest-Buda',
    'Debrecen', 'Pécs', 'Győr', 'Miskolc', 'Szeged',
    'Kecskemét', 'Nyíregyháza', 'Székesfehérvár', 'Szombathely',
    'Szolnok', 'Tatabánya', 'Kaposvár', 'Eger', 'Veszprém',
    'Zalaegerszeg', 'Sopron', 'Érd', 'Dunakeszi', 'Hódmezővásárhely',
    'Nagykanizsa', 'Békéscsaba', 'Keszthely', 'Szekszárd', 'Esztergom',
    'Pápa', 'Ajka', 'Dunaújváros', 'Cegléd', 'Jászberény',
    'Salgótarján', 'Szekszárd', 'Szolnok', 'Siófok',
  ],

  /* Garbled uppercase → proper station name (for PDF parsing) */
  STATION_MAP: [
    { re: /^BUDAPEST(-PEST)?/,      name: 'Budapest-Pest' },
    { re: /^BUDAPEST(-BUDA)?/,      name: 'Budapest-Buda' },
    { re: /^GY.R$/,                 name: 'Győr' },
    { re: /^MISKOLC$/,              name: 'Miskolc' },
    { re: /^P.CS$/,                 name: 'Pécs' },
    { re: /^NY.REGYH.ZA$/,          name: 'Nyíregyháza' },
    { re: /^ZALAEGERSZEG$/,         name: 'Zalaegerszeg' },
    { re: /^SZEKSZ.RD$/,            name: 'Szekszárd' },
    { re: /^SZOLNOK$/,              name: 'Szolnok' },
    { re: /^SZOMBATHELY$/,          name: 'Szombathely' },
    { re: /^B.K.SCSABA$/,           name: 'Békéscsaba' },
    { re: /^DEBRECEN$/,             name: 'Debrecen' },
    { re: /^SALG.TARJ.N$/,          name: 'Salgótarján' },
    { re: /^EGER$/,                 name: 'Eger' },
    { re: /^KAPOSV.R$/,             name: 'Kaposvár' },
    { re: /^KECSKEM.T$/,            name: 'Kecskemét' },
    { re: /^SZ.KESFEH.RV.R$/,       name: 'Székesfehérvár' },
    { re: /^VESZPR.M$/,             name: 'Veszprém' },
    { re: /^SOPRON$/,               name: 'Sopron' },
    { re: /^SZEGED$/,               name: 'Szeged' },
    { re: /^SI.FOK$/,               name: 'Siófok' },
    { re: /^TATAB.NYA$/,            name: 'Tatabánya' },
    { re: /^.GER$/,                 name: 'Eger' },
    { re: /^P.PA$/,                 name: 'Pápa' },
  ],

  /* ── Common medications ─────────────────────── */
  MEDICATIONS: [
    'Aerius', 'Claritin', 'Zyrtec', 'Clarityn', 'Telfast',
    'Flonase', 'Nasonex', 'Beconase', 'Avamys',
    'Ventolin', 'Symbicort', 'Seretide', 'Singulair',
    'Hydrocortison krém', 'Betnovate', 'Locoid',
    'Zaditen', 'Opticrom',
  ],

  /* ── Hungarian months ───────────────────────── */
  MONTHS: ['Január','Február','Március','Április','Május','Június',
           'Július','Augusztus','Szeptember','Október','November','December'],
  MONTHS_SHORT: ['Jan','Feb','Már','Ápr','Máj','Jún','Júl','Aug','Szep','Okt','Nov','Dec'],
  DAYS_SHORT: ['H','K','Sz','Cs','P','Sz','V'],
  DAYS_LONG: ['Hétfő','Kedd','Szerda','Csütörtök','Péntek','Szombat','Vasárnap'],

  /* ── Helpers ────────────────────────────────── */
  getAllergenById(id) {
    const all = [
      ...this.ALLERGENS.seasonal,
      ...this.ALLERGENS.general,
      ...this.ALLERGENS.food,
    ];
    return all.find(a => a.id === id) || null;
  },

  getSymptomById(id) {
    return this.SYMPTOMS.find(s => s.id === id) || null;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}. ${this.MONTHS[d.getMonth()]} ${d.getDate()}.`;
  },

  formatDateShort(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${this.MONTHS_SHORT[d.getMonth()]} ${d.getDate()}.`;
  },

  todayISO() {
    return new Date().toISOString().split('T')[0];
  },

  riskLabel(level) {
    return this.RISK_LEVELS[Math.min(level, 3)];
  },

  /* Convert concentration number to risk level 0-3 */
  concToRisk(value, allergenId) {
    /* Hungarian standard thresholds (grains/m³) vary by pollen type */
    const thresholds = {
      ambrosia:  [10, 30, 90],
      betula:    [10, 50, 150],
      poaceae:   [10, 30, 100],
      default:   [5,  20,  60],
    };
    const t = thresholds[allergenId] || thresholds.default;
    if (value < t[0]) return 0;
    if (value < t[1]) return 1;
    if (value < t[2]) return 2;
    return 3;
  },

  greetingText() {
    const h = new Date().getHours();
    if (h < 5)  return 'Jó éjszakát';
    if (h < 12) return 'Jó reggelt';
    if (h < 18) return 'Jó napot';
    return 'Jó estét';
  },
};
