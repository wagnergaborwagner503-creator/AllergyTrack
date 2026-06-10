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
      { id: 'olea',       name: 'Olajfa',        latinName: 'Olea europaea',           season: 'Ápr–Máj', icon: '🫒', color: '#8BC34A', riskMonths: [3,4] },
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
      { id: 'pm10',         name: 'Finom por (PM10)',  icon: '💨', color: '#78909C' },
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
    { id: 0, label: 'Nincs',    short: 'Nincs',    cssClass: 'risk-label-0', color: '#9E9E9E' },
    { id: 1, label: 'Alacsony', short: 'Alacsony', cssClass: 'risk-label-1', color: '#4CAF50' },
    { id: 2, label: 'Közepes',  short: 'Közepes',  cssClass: 'risk-label-2', color: '#FF9800' },
    { id: 3, label: 'Magas',    short: 'Magas',    cssClass: 'risk-label-3', color: '#E53935' },
    { id: 4, label: 'Extrém',   short: 'Extrém',   cssClass: 'risk-label-4', color: '#7B0000' },
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

  /* ── Allergen → Symptom database ───────────────
     Orvosi tényeken alapuló allergen-tünet térkép.
     primary:  a legtipikusabb / legjellemzőbb tünetek
     secondary: lehetséges, de kevésbé specifikus tünetek
     crossReacts: keresztreaktív allergenek
  ─────────────────────────────────────────────── */
  /* ── Allergen–Tünet adatbázis (tudásbázis alapján) ─────────────────────
     Forrás: pollen_allergy_knowledge_base.json v1.0.0
     primary:    legjellemzőbb tünetek (2× súly a match-nél)
     secondary:  lehetséges tünetek (1× súly)
     crossReacts: keresztreaktív allergenek
     oasFoods:  orális allergiás szindróma – keresztreaktív nyers ételek
  ──────────────────────────────────────────────────────────────────────── */
  ALLERGEN_SYMPTOM_MAP: {
    /* ── Fák ── */
    betula: {  /* Nyírfa – Bet v 1, nagyon erős allergen */
      primary:   ['sneezing','runny_nose','itchy_nose','itchy_eyes','watery_eyes','red_eyes'],
      secondary: ['nasal_congestion','swollen_eyes','cough','wheezing','fatigue','headache'],
      crossReacts: ['alnus','corylus','quercus'],
      oasFoods:  'Alma, körte, cseresznye, őszibarack, szilva, nyers sárgarépa, zeller, mogyoró, dió, kivi, eper, mandula',
    },
    alnus: {  /* Éger */
      primary:   ['sneezing','runny_nose','itchy_nose','itchy_eyes','watery_eyes'],
      secondary: ['nasal_congestion','red_eyes','cough'],
      crossReacts: ['betula','corylus'],
      oasFoods:  'Alma, körte, cseresznye (nyírfa-szindróma)',
    },
    corylus: {  /* Mogyoró */
      primary:   ['sneezing','runny_nose','itchy_nose','itchy_eyes','watery_eyes'],
      secondary: ['nasal_congestion','red_eyes','cough','fatigue'],
      crossReacts: ['betula','alnus'],
      oasFoods:  'Nyers mogyoró, alma, körte, őszibarack',
    },
    fraxinus: {  /* Kőris – Fra e 1, Oleaceae */
      primary:   ['sneezing','runny_nose','itchy_nose','itchy_eyes','watery_eyes'],
      secondary: ['nasal_congestion','cough','fatigue'],
      crossReacts: ['betula'],
      oasFoods:  'Olajbogyó (gyenge keresztreakció)',
    },
    quercus: {  /* Tölgy – mérsékelt allergén */
      primary:   ['nasal_congestion','runny_nose','sneezing'],
      secondary: ['itchy_eyes','watery_eyes','cough'],
      crossReacts: ['betula'],
      oasFoods:  '',
    },
    platanus: {  /* Platán – főleg városokban */
      primary:   ['sneezing','itchy_nose','itchy_eyes','watery_eyes','cough'],
      secondary: ['itchy_skin','runny_nose'],
      crossReacts: [],
      oasFoods:  '',
    },
    populus: {  /* Nyárfa – alacsony allergicitás */
      primary:   ['nasal_congestion','runny_nose'],
      secondary: ['itchy_eyes','watery_eyes'],
      crossReacts: [],
      oasFoods:  '',
    },
    /* ── Lágyszárúak / Füvek ── */
    poaceae: {  /* Pázsitfüvek – nagyon erős */
      primary:   ['sneezing','runny_nose','itchy_nose','itchy_eyes','watery_eyes','red_eyes'],
      secondary: ['nasal_congestion','cough','wheezing','fatigue','headache','throat_itch'],
      crossReacts: [],
      oasFoods:  'Nyers paradicsom, dinnye, búza/gabona',
    },
    /* ── Gyomok ── */
    ambrosia: {  /* Parlagfű – extrém allergén, Magyarország #1 */
      primary:   ['sneezing','runny_nose','itchy_nose','itchy_eyes','watery_eyes','red_eyes'],
      secondary: ['nasal_congestion','headache','cough','wheezing','asthma','fatigue','hives','swollen_eyes'],
      crossReacts: ['artemisia'],
      oasFoods:  'Sárgadinnye, görögdinnye, uborka, cukkíni, banán, napraforgó mag, kamilla tea',
    },
    artemisia: {  /* Közönséges üröm – Art v 1 */
      primary:   ['sneezing','runny_nose','itchy_nose','itchy_eyes'],
      secondary: ['nasal_congestion','watery_eyes','cough','fatigue'],
      crossReacts: ['ambrosia'],
      oasFoods:  'Zeller, sárgarépa, petrezselyem, paprika, kamilla tea, napraforgó',
    },
    plantago: {  /* Útifű */
      primary:   ['sneezing','runny_nose','itchy_eyes'],
      secondary: ['nasal_congestion','watery_eyes','cough'],
      crossReacts: [],
      oasFoods:  '',
    },
    urtica: {  /* Csalán */
      primary:   ['nasal_congestion','runny_nose','sneezing'],
      secondary: ['itchy_eyes','watery_eyes'],
      crossReacts: [],
      oasFoods:  '',
    },
    rumex: {  /* Lórom/Sóska */
      primary:   ['sneezing','runny_nose','itchy_eyes'],
      secondary: ['nasal_congestion'],
      crossReacts: [],
      oasFoods:  '',
    },
    chenopodium: {  /* Libatop */
      primary:   ['sneezing','runny_nose','nasal_congestion'],
      secondary: ['itchy_eyes','asthma'],
      crossReacts: ['ambrosia','artemisia'],
      oasFoods:  '',
    },
    /* ── Perenniális allergenek ── */
    cat: {  /* Macska – Fel d 1, rendkívül erős */
      primary:   ['sneezing','runny_nose','itchy_eyes','watery_eyes','red_eyes','wheezing'],
      secondary: ['nasal_congestion','itchy_skin','hives'],
      crossReacts: ['dog'],
      oasFoods:  '',
    },
    dog: {  /* Kutya – Can f 1 */
      primary:   ['sneezing','runny_nose','itchy_eyes','wheezing'],
      secondary: ['nasal_congestion','itchy_skin'],
      crossReacts: ['cat'],
      oasFoods:  '',
    },
    dust_mite: {  /* Háziporatka – Der p 1, egész éves */
      primary:   ['nasal_congestion','runny_nose','sneezing','itchy_eyes','cough','wheezing'],
      secondary: ['eczema','itchy_skin'],
      crossReacts: [],
      oasFoods:  'Rákok, garnéla (tropomyozin keresztreakció)',
    },
    alternaria: {  /* Alternaria penészgomba */
      primary:   ['sneezing','nasal_congestion','itchy_eyes'],
      secondary: ['asthma','cough','wheezing'],
      crossReacts: ['mold'],
      oasFoods:  '',
    },
    mold: {  /* Penészgomba (egyéb) */
      primary:   ['sneezing','runny_nose','nasal_congestion','wheezing','cough'],
      secondary: ['headache','fatigue'],
      crossReacts: ['alternaria'],
      oasFoods:  '',
    },
    latex: {  /* Latex – latex-gyümölcs szindróma */
      primary:   ['itchy_skin','hives','rash'],
      secondary: ['asthma','watery_eyes','angioedema'],
      crossReacts: [],
      oasFoods:  'Banán, avokádó, kivi, gesztenye',
    },
    /* ── Étel allergenek ── */
    peanut: {
      primary:   ['hives','itchy_skin','rash','nausea','abdominal'],
      secondary: ['asthma','angioedema','throat_itch'],
      crossReacts: ['tree_nuts'],
      oasFoods:  '',
    },
    milk: {
      primary:   ['abdominal','nausea','rash'],
      secondary: ['hives','itchy_skin','cough'],
      crossReacts: [],
      oasFoods:  '',
    },
    wheat: {
      primary:   ['abdominal','nausea','rash','itchy_skin'],
      secondary: ['hives','asthma','fatigue'],
      crossReacts: ['poaceae'],
      oasFoods:  '',
    },
  },

  /* ═══════════════════════════════════════════════════════════════════════
     CITY_VEGETATION – Numerikus jelenlét-súlyok allergénenként és városonként
     ─────────────────────────────────────────────────────────────────────────
     Értékek (0.0 – 1.0): a növényzet tényleges arányát és pollenterhelési
     valószínűségét fejezik ki a város és közvetlen vonzáskörzete alapján.

     0.90–1.0  Nagyon magas – domináns allergén, komoly terhelés
     0.70–0.89 Magas – jellemző, rendszeresen jelen van
     0.50–0.69 Közepes – előfordul, de nem meghatározó
     0.25–0.49 Alacsony – ritka, alkalomszerű jelenlét
     0.05–0.24 Nagyon alacsony – elvétve, klinikai szempontból elhanyagolható
     0.00–0.04 Lényegében hiányzik a térségből

     Forrás: Magyar Allergia Társaság adatai, Magyarország vegetációtérképe
     (Zólyomi 1967, Király et al. 2011), ÁNTSZ pollenmonitoring-statisztikák,
     EAN (European Aeroallergen Network) éves összefoglalók.
     ═══════════════════════════════════════════════════════════════════════ */
  CITY_VEGETATION: {

    /* ── Budapest – főváros, 525 km² beépített + szuburbán zóna ──────────
       Duna-part, Budai-hegység nyúlványai, városi parkok, parlagi területek.
       Extrém magas parlagfű; erős nyír, platán, kőris; mérsékelt éger.     */
    'Budapest': {
      ambrosia:    0.95, poaceae:   0.88, betula:    0.78,
      platanus:    0.72, artemisia: 0.70, fraxinus:  0.65,
      urtica:      0.60, plantago:  0.55, quercus:   0.52,
      rumex:       0.48, alnus:     0.38, corylus:   0.32,
      chenopodium: 0.35, juglans:   0.28, carpinus:  0.30,
      fagus:       0.18, aesculus:  0.30, moraceae:  0.20,
      populus:     0.40, cupressus: 0.08, pinaceae:  0.06,
      olea:        0.02, pm10:      0.92,
    },

    /* ── Debrecen – Tiszántúl, Nagy-Alföld; Nagyerdő-tölgyesek ───────────
       Hazánk parlagfű-fővárosai közé tartozik. Tiszántúli agrárterületek.  */
    'Debrecen': {
      ambrosia:    0.97, poaceae:   0.85, artemisia: 0.82,
      betula:      0.58, quercus:   0.60, plantago:  0.55,
      urtica:      0.52, chenopodium:0.48, rumex:    0.45,
      fraxinus:    0.28, alnus:     0.22, corylus:   0.18,
      carpinus:    0.25, juglans:   0.22, fagus:     0.12,
      aesculus:    0.15, platanus:  0.08, moraceae:  0.15,
      populus:     0.30, cupressus: 0.04, pinaceae:  0.04,
      olea:        0.01, pm10:      0.50,
    },

    /* ── Győr – Kisalföld, Mosoni-Duna mentén; ipari körzet ──────────────
       Éger és kőris erős a folyó mentén. Kisalföldi rétek magas pázsit.    */
    'Győr': {
      poaceae:     0.87, ambrosia:  0.72, betula:    0.68,
      fraxinus:    0.70, alnus:     0.65, corylus:   0.55,
      quercus:     0.48, urtica:    0.50, plantago:  0.52,
      artemisia:   0.48, rumex:     0.45, carpinus:  0.35,
      juglans:     0.30, chenopodium:0.28, aesculus: 0.20,
      platanus:    0.15, fagus:     0.12, moraceae:  0.12,
      populus:     0.42, cupressus: 0.05, pinaceae:  0.05,
      olea:        0.02, pm10:      0.62,
    },

    /* ── Pécs – Mecsek, mediterrán hatás, dél-dunántúli szőlős-gyümölcsös  */
    'Pécs': {
      poaceae:     0.82, ambrosia:  0.75, betula:    0.60,
      quercus:     0.68, fraxinus:  0.55, artemisia: 0.55,
      urtica:      0.52, plantago:  0.50, carpinus:  0.45,
      cupressus:   0.28, olea:      0.18, corylus:   0.42,
      alnus:       0.35, rumex:     0.42, juglans:   0.38,
      fagus:       0.35, platanus:  0.30, moraceae:  0.20,
      aesculus:    0.22, chenopodium:0.30, populus:  0.25,
      pinaceae:    0.08, pm10:      0.55,
    },

    /* ── Miskolc – Bükk-lába, észak-magyarországi lombos erdők ───────────
       Bükkös-tölgyes övezet; mérsékelten szeles, parlagfű közepes.         */
    'Miskolc': {
      betula:      0.80, quercus:   0.75, poaceae:   0.72,
      alnus:       0.55, fraxinus:  0.52, corylus:   0.50,
      carpinus:    0.48, fagus:     0.42, ambrosia:  0.55,
      urtica:      0.48, plantago:  0.45, artemisia: 0.40,
      rumex:       0.38, juglans:   0.25, aesculus:  0.18,
      chenopodium: 0.25, platanus:  0.10, moraceae:  0.12,
      populus:     0.30, cupressus: 0.04, pinaceae:  0.06,
      olea:        0.01, pm10:      0.58,
    },

    /* ── Nyíregyháza – Szabolcs-Szatmár; homokvidék, akácosok ───────────
       Északkelet-Alföld; magas parlagfű és üröm, akác nem allergizál.      */
    'Nyíregyháza': {
      ambrosia:    0.93, poaceae:   0.85, artemisia: 0.78,
      betula:      0.55, quercus:   0.48, plantago:  0.55,
      urtica:      0.50, chenopodium:0.42, rumex:    0.42,
      fraxinus:    0.25, alnus:     0.20, corylus:   0.18,
      carpinus:    0.20, juglans:   0.22, fagus:     0.10,
      aesculus:    0.12, platanus:  0.06, moraceae:  0.12,
      populus:     0.35, cupressus: 0.04, pinaceae:  0.04,
      olea:        0.01, pm10:      0.45,
    },

    /* ── Szeged – Dél-Alföld, Tisza-völgy; homokpuszta ──────────────────
       A parlagfű „fővárosa": kiemelkedően magas ambrosia-terhelés.          */
    'Szeged': {
      ambrosia:    0.98, poaceae:   0.88, artemisia: 0.82,
      plantago:    0.60, urtica:    0.55, chenopodium:0.52,
      rumex:       0.50, betula:    0.42, quercus:   0.35,
      fraxinus:    0.22, alnus:     0.18, corylus:   0.12,
      carpinus:    0.15, juglans:   0.20, fagus:     0.08,
      aesculus:    0.12, platanus:  0.10, moraceae:  0.12,
      populus:     0.38, cupressus: 0.04, pinaceae:  0.03,
      olea:        0.01, pm10:      0.48,
    },

    /* ── Kecskemét – Duna–Tisza-köze, homokos alföldi terület ───────────  */
    'Kecskemét': {
      ambrosia:    0.92, poaceae:   0.85, artemisia: 0.78,
      plantago:    0.58, urtica:    0.52, betula:    0.40,
      chenopodium: 0.45, rumex:     0.45, quercus:  0.30,
      fraxinus:    0.20, alnus:     0.15, corylus:   0.12,
      carpinus:    0.12, juglans:   0.22, fagus:     0.08,
      aesculus:    0.10, platanus:  0.08, moraceae:  0.10,
      populus:     0.40, cupressus: 0.04, pinaceae:  0.04,
      olea:        0.01, pm10:      0.45,
    },

    /* ── Szombathely – Nyugat-Dunántúl, Alpokalja; csapadékos, erdős ─────
       Hazánk legsűrűbben erdősített régiója (Vendvidéki fenyvesek is!).
       Nyír, éger, mogyoró domináns; parlagfű jóval alacsonyabb.            */
    'Szombathely': {
      betula:      0.88, alnus:     0.80, corylus:   0.75,
      poaceae:     0.72, fraxinus:  0.65, quercus:   0.58,
      carpinus:    0.55, fagus:     0.50, urtica:    0.48,
      plantago:    0.45, ambrosia:  0.38, artemisia: 0.32,
      rumex:       0.40, juglans:   0.30, aesculus:  0.22,
      pinaceae:    0.25, cupressus: 0.10, moraceae:  0.12,
      platanus:    0.10, chenopodium:0.18, populus:  0.28,
      olea:        0.02, pm10:      0.40,
    },

    /* ── Eger – Mátra–Bükk-lába, borvidék; tölgyes-bükkös hegyek ─────── */
    'Eger': {
      betula:      0.78, quercus:   0.75, poaceae:   0.70,
      fraxinus:    0.58, alnus:     0.45, corylus:   0.48,
      carpinus:    0.52, fagus:     0.45, ambrosia:  0.58,
      urtica:      0.48, plantago:  0.45, artemisia: 0.42,
      rumex:       0.38, juglans:   0.32, aesculus:  0.20,
      platanus:    0.15, moraceae:  0.12, chenopodium:0.25,
      populus:     0.25, cupressus: 0.05, pinaceae:  0.08,
      olea:        0.01, pm10:      0.45,
    },

    /* ── Veszprém – Bakony-lába, dolomit-sziklás gyepek, tölgyesek ──── */
    'Veszprém': {
      betula:      0.80, quercus:   0.78, corylus:   0.68,
      poaceae:     0.72, fraxinus:  0.58, alnus:     0.45,
      carpinus:    0.50, fagus:     0.48, ambrosia:  0.52,
      urtica:      0.45, plantago:  0.48, artemisia: 0.40,
      rumex:       0.42, juglans:   0.30, aesculus:  0.22,
      platanus:    0.12, moraceae:  0.12, chenopodium:0.22,
      populus:     0.25, cupressus: 0.05, pinaceae:  0.08,
      olea:        0.01, pm10:      0.42,
    },

    /* ── Kaposvár – Somogy, dombvidéki vegyes erdők, rétek ───────────── */
    'Kaposvár': {
      poaceae:     0.80, ambrosia:  0.72, betula:    0.65,
      quercus:     0.60, fraxinus:  0.50, urtica:    0.52,
      artemisia:   0.55, plantago:  0.52, alnus:     0.38,
      corylus:     0.40, rumex:     0.45, carpinus:  0.40,
      fagus:       0.30, juglans:   0.32, aesculus:  0.20,
      platanus:    0.12, chenopodium:0.28, moraceae: 0.12,
      populus:     0.30, cupressus: 0.05, pinaceae:  0.06,
      olea:        0.02, pm10:      0.45,
    },

    /* ── Zalaegerszeg – Délnyugat-Dunántúl; csapadékos, éger-égeres ── */
    'Zalaegerszeg': {
      betula:      0.85, alnus:     0.82, corylus:   0.78,
      poaceae:     0.72, fraxinus:  0.62, quercus:   0.55,
      carpinus:    0.52, fagus:     0.45, urtica:    0.48,
      plantago:    0.45, ambrosia:  0.38, artemisia: 0.30,
      rumex:       0.42, juglans:   0.28, aesculus:  0.20,
      pinaceae:    0.20, cupressus: 0.08, moraceae:  0.10,
      platanus:    0.08, chenopodium:0.18, populus:  0.30,
      olea:        0.02, pm10:      0.38,
    },

    /* ── Szolnok – Közép-Tisza-völgy, ártéri ligeterdők, szántók ─────  */
    'Szolnok': {
      ambrosia:    0.90, poaceae:   0.85, artemisia: 0.75,
      plantago:    0.60, urtica:    0.55, betula:    0.45,
      alnus:       0.40, fraxinus:  0.35, chenopodium:0.45,
      rumex:       0.50, quercus:   0.30, corylus:   0.18,
      carpinus:    0.18, juglans:   0.22, fagus:     0.08,
      aesculus:    0.12, platanus:  0.10, moraceae:  0.12,
      populus:     0.45, cupressus: 0.04, pinaceae:  0.04,
      olea:        0.01, pm10:      0.50,
    },

    /* ── Tatabánya – Gerecse-lába, bányaipari; kevés természetes veg. */
    'Tatabánya': {
      betula:      0.72, poaceae:   0.72, quercus:   0.65,
      fraxinus:    0.60, alnus:     0.45, corylus:   0.42,
      ambrosia:    0.58, artemisia: 0.48, urtica:    0.48,
      carpinus:    0.42, plantago:  0.45, rumex:     0.40,
      fagus:       0.25, juglans:   0.28, aesculus:  0.20,
      platanus:    0.18, moraceae:  0.12, chenopodium:0.28,
      populus:     0.30, cupressus: 0.05, pinaceae:  0.08,
      olea:        0.01, pm10:      0.72,
    },

    /* ── Székesfehérvár – Közép-Dunántúl, Velencei-hegység lába ──── */
    'Székesfehérvár': {
      betula:      0.75, poaceae:   0.78, fraxinus:  0.65,
      ambrosia:    0.68, quercus:   0.58, artemisia: 0.52,
      platanus:    0.35, urtica:    0.50, plantago:  0.50,
      alnus:       0.38, corylus:   0.38, carpinus:  0.38,
      rumex:       0.42, juglans:   0.28, fagus:     0.20,
      aesculus:    0.22, chenopodium:0.30, moraceae: 0.12,
      populus:     0.32, cupressus: 0.05, pinaceae:  0.06,
      olea:        0.01, pm10:      0.60,
    },

    /* ── Szekszárd – Dél-Dunántúl; löszpusztagyepek, gyümölcsösök ── */
    'Szekszárd': {
      poaceae:     0.82, ambrosia:  0.80, artemisia: 0.72,
      quercus:     0.62, urtica:    0.55, plantago:  0.55,
      betula:      0.48, rumex:     0.48, fraxinus:  0.42,
      platanus:    0.32, juglans:   0.38, chenopodium:0.35,
      alnus:       0.28, corylus:   0.28, carpinus:  0.30,
      fagus:       0.20, aesculus:  0.18, moraceae:  0.18,
      populus:     0.32, cupressus: 0.06, pinaceae:  0.05,
      olea:        0.03, pm10:      0.45,
    },

    /* ── Békéscsaba – Délkelet-Alföld; Körös-vidéki síkság ───────────
       Az ország legmagasabb éves parlagfű-terhelésű területei közé tartozik. */
    'Békéscsaba': {
      ambrosia:    0.98, poaceae:   0.90, artemisia: 0.85,
      plantago:    0.62, urtica:    0.58, chenopodium:0.55,
      rumex:       0.52, betula:    0.38, quercus:   0.28,
      fraxinus:    0.18, alnus:     0.15, corylus:   0.10,
      carpinus:    0.12, juglans:   0.22, fagus:     0.06,
      aesculus:    0.10, platanus:  0.06, moraceae:  0.10,
      populus:     0.40, cupressus: 0.03, pinaceae:  0.03,
      olea:        0.01, pm10:      0.48,
    },
  },

  /* ── Magyarország-szintű átlagos vegetáció (fallback) ──────────────────
     Ha a felhasználó tartózkodási helye nem szerepel a város-listában.     */
  HUNGARY_VEGETATION: {
    ambrosia:    0.80, poaceae:   0.83, artemisia: 0.65,
    betula:      0.65, quercus:   0.55, fraxinus:  0.50,
    alnus:       0.42, corylus:   0.38, urtica:    0.52,
    plantago:    0.52, carpinus:  0.35, rumex:     0.44,
    chenopodium: 0.35, platanus:  0.22, juglans:   0.28,
    fagus:       0.25, aesculus:  0.18, moraceae:  0.14,
    populus:     0.33, cupressus: 0.06, pinaceae:  0.06,
    olea:        0.02, pm10:      0.55,
  },

  /* ── Allergenicitás alap-szorzó (intrinsic potency) ─────────────────────
     Az adott növényfaj pollenjének valódi IgE-mediált allergiakiváltó
     képességét fejezi ki, a vegetáció-jelenléttől FÜGGETLENÜL.

     Forrás: EAACI Position Papers, WAO White Book on Allergy,
     Spieksma et al. európai allergén-fontossági rangsorok.

     1.00 Kimagasló – Közegészségügyileg is prioritás
     0.85 Magas
     0.70 Közepes–magas
     0.55 Közepes
     0.40 Alacsony–közepes
     0.25 Alacsony
     0.10 Nagyon alacsony
     0.05 Klinikai szempontból elhanyagolható                               */
  ALLERGEN_SENSITIVITY: {
    ambrosia:    1.00,  /* Parlagfű – legfontosabb allergen Magyarországon  */
    poaceae:     1.00,  /* Pázsitfűfélék – universálisan magas              */
    betula:      1.00,  /* Nyírfa – Bet v 1, rendkívül potens               */
    artemisia:   0.88,  /* Üröm – fontos szeptemberi allergen               */
    alnus:       0.88,  /* Éger – Bet v 1-keresztreaktív, korai szezon      */
    corylus:     0.85,  /* Mogyoró – Bet v 1-keresztreaktív                 */
    fraxinus:    0.82,  /* Kőris – erős városi allergen                     */
    plantago:    0.80,  /* Útifű – pázsitfűvel együtt magas                 */
    urtica:      0.72,  /* Csalán – nyár-ősz, tartósan jelen                */
    rumex:       0.70,  /* Sóska – nyár, mérsékelt fontosság                */
    quercus:     0.68,  /* Tölgy – közepes, de hosszú szezon                */
    carpinus:    0.65,  /* Gyertyán – nyírfa-keresztreaktív                 */
    chenopodium: 0.60,  /* Libatop – disznóparéjjal együtt                  */
    olea:        0.58,  /* Olajfa – dél-dunántúli, mediterrán               */
    cupressus:   0.52,  /* Ciprusfélék – téli-tavaszi, korlátolt területen  */
    platanus:    0.50,  /* Platán – főváros, allé-fák                       */
    fagus:       0.38,  /* Bükk – ritkán okoz IgE allergiát                 */
    juglans:     0.35,  /* Dió – IgE-reakció inkább étel-allergia           */
    moraceae:    0.32,  /* Eperfafélék – ritka                              */
    aesculus:    0.28,  /* Vadgesztenye – nagy pollen, nem légiesen szálló  */
    populus:     0.25,  /* Nyárfa – gyapjas termés, NEM a pollen allergiás  */
    pinaceae:    0.08,  /* Fenyőfélék – nagy, nehéz pollen, nem szálló      */
    alternaria:  0.85,  /* Alternaria gombaspóra – asztmás trigger          */
    pm10:        0.60,  /* Szálló por – irritáló, nem IgE-mediált           */
  },

  /* Allergen-tünet egyezési pontszám kiszámítása (0–100)
     Az allergenicitás szorzóját is alkalmazza.            */
  matchSymptoms(allergenId, userSymptomIds) {
    const db  = this.ALLERGEN_SYMPTOM_MAP[allergenId];
    if (!db) return 0;
    const all    = [...new Set([...(db.primary || []), ...(db.secondary || [])])];
    if (!all.length) return 0;
    const set    = new Set(userSymptomIds);
    const score  = (db.primary || []).reduce((s, id) => s + (set.has(id) ? 2 : 0), 0)
                 + (db.secondary || []).reduce((s, id) => s + (set.has(id) ? 1 : 0), 0);
    const maxScore = (db.primary || []).length * 2 + (db.secondary || []).length;
    const raw = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    /* Allergenicitás korrekció – az érzékenységi szorzóval együtt */
    const sensitivity = this.ALLERGEN_SENSITIVITY[allergenId] ?? 0.80;
    return Math.round(raw * sensitivity);
  },

  /* ── Városra jellemző allergén jelenlét-súly (0.0–1.0) ─────────────────
     Visszaad egy valószínűségi szorzót: mennyire valószínű, hogy az adott
     allergén JELEN VAN a felhasználó tartózkodási helyén?
     Végsőszorzó = jelenlét × allergenicitás (ld. cityAllergenFactor caller).  */
  cityAllergenFactor(allergenId, cityName) {
    if (!cityName) return this.HUNGARY_VEGETATION[allergenId] ?? 0.30;

    /* Város keresése (részleges egyezés is elfogadott) */
    const lower = cityName.toLowerCase().trim();
    const cityKey = Object.keys(this.CITY_VEGETATION).find(k =>
      lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
    );

    const vegMap = cityKey
      ? this.CITY_VEGETATION[cityKey]
      : this.HUNGARY_VEGETATION;

    /* Ha az allergén nincs a térképen → nagyon alacsony alapérték */
    return vegMap[allergenId] ?? 0.05;
  },

  /* ── Teljes valószínűségi pontszám: jelenlét × allergenicitás ──────────
     Ezt a függvényt hívja az analitika a top-3 scoring-hoz.                */
  cityAllergenScore(allergenId, cityName) {
    const presence     = this.cityAllergenFactor(allergenId, cityName);
    const sensitivity  = this.ALLERGEN_SENSITIVITY[allergenId] ?? 0.80;
    return presence * sensitivity;   /* 0.0 – 1.0 */
  },

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

  /* Convert concentration number to risk level 0-4 */
  concToRisk(value, allergenId) {
    /* Hungarian standard thresholds (grains/m³) vary by pollen type */
    const thresholds = {
      ambrosia:  [10, 30, 90,  250],
      betula:    [10, 50, 150, 400],
      poaceae:   [10, 30, 100, 250],
      default:   [5,  20,  60, 150],
    };
    const t = thresholds[allergenId] || thresholds.default;
    if (value < t[0]) return 0;
    if (value < t[1]) return 1;
    if (value < t[2]) return 2;
    if (value < t[3]) return 3;
    return 4;
  },

  riskLabel(level) {
    return this.RISK_LEVELS[Math.min(level, 4)];
  },

  greetingText() {
    const h = new Date().getHours();
    if (h < 5)  return 'Jó éjszakát';
    if (h < 12) return 'Jó reggelt';
    if (h < 18) return 'Jó napot';
    return 'Jó estét';
  },
};
