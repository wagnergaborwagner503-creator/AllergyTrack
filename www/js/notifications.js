/* ═══════════════════════════════════════════
   AllergyTrack – Tünet-emlékeztető értesítések
   @capacitor/local-notifications
   Napi 3 értesítés: ~9:00 / ~12:00 / ~21:00

   Gyors akció az értesítésen:
   "😌 Tünetmentes" → app megnyitása nélkül
   rögzíti az aktuális helyszínt, időpontot
   és hogy nem volt tünet.
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Notifications = {

  /* ── 30 játékos, rövid értesítési szöveg ── */
  MESSAGES: [
    { title: '🌿 Hogy vagy most?',         body: 'Pár kattintás és megvan a mai tünetnapló! (vagy → Tünetmentes)' },
    { title: '🌿 Napi check-in!',           body: 'Allergénje vár rád... vagy nem? Rögzítsd most!' },
    { title: '🌿 Pollen-detektív ideje!',   body: 'Ma mit csinált a pollened? Tünet volt? Gyorsan rögzítsd!' },
    { title: '🌿 Tüsszentet már ma?',       body: 'Ha igen, rögzítsük. Ha nem → nyomd meg a Tünetmentes gombot!' },
    { title: '🌿 Nyomozás ideje!',          body: 'Ma mért volt olyan nap... rögzítsd a tüneteid!' },
    { title: '🌿 Virágzik valami?',         body: 'Az orrod tudja a választ. Segíts az elemzésnek!' },
    { title: '🌿 Gyógyszert szedtél?',      body: 'Legyen benne a naplóban – a statisztika hálás lesz!' },
    { title: '🌿 Jobban vagy? Rosszabbul?', body: 'Mondd el az AllergyTracknek – ő nem ítélkezik!' },
    { title: '🌿 Hol jártál ma?',           body: 'A helyszín fontos! Add hozzá a mai bejegyzéshez.' },
    { title: '🌿 Az adat hatalom!',         body: 'Minél több napló, annál pontosabb az elemzés. Most!' },
    { title: '🌿 Hőmérséklet-riport',       body: 'Meleg volt? Hűvös? A hőmérséklet befolyásolja a pollent!' },
    { title: '🌿 Lélegezz... és rögzíts!',  body: 'Egy mély levegő, egy gyors bejegyzés. Kész!' },
    { title: '🌿 Szeles volt a nap?',       body: 'A szél pollen-bomba! Rögzítsd, hogy érezted magad.' },
    { title: '🌿 Viszkető szemek?',         body: 'Ha igen, az AllergyTrack tudni akarja. Ha nem, szuper!' },
    { title: '🌿 Allergia-nyomozó',         body: 'Minden napló egy nyom. Ma mi volt a gyanús?' },
    { title: '🌿 Ma jobb nap volt?',        body: 'Tünetmentes nap? → nyomd meg az értesítés gombját!' },
    { title: '🌿 Virágok vs. te!',          body: 'A virágok virágoznak... az orrod tud erről valamit?' },
    { title: '🌿 Borult az ég?',            body: 'Felhős napokon kevesebb pollen van. Érezted?' },
    { title: '🌿 Jó? Rossz? Közepes?',      body: 'Mindegy melyik – rögzítsd! Minden adat számít.' },
    { title: '🌿 Fák vs. te.',              body: 'Ki nyert ma? Rögzítsd az eredményt!' },
    { title: '🌿 Fáradtabb voltál?',        body: 'Az allergia kimerít! Ha igen, írd be a naplóba.' },
    { title: '🌿 Napi adat célba ér!',      body: 'Célozz rá a pollen-elemzésre – rögzítsd most!' },
    { title: '🌿 Tudományos adatgyűjtés',   body: 'A te adataid teszik pontossá az elemzést. Köszönjük!' },
    { title: '🌿 Tartsd a tempót!',         body: 'Minden naplózott nap közelebb visz az allergénedhez.' },
    { title: '🌿 Virágszezón van!',         body: 'Rögzítsd, mielőtt elfelejtened! Tünetmentes? → gomb!' },
    { title: '🌿 Bent vagy? Kint voltál?',  body: 'A helyszín sokat elárul! Rögzítsd gyorsan.' },
    { title: '🌿 Hol töltötted a napod?',   body: 'Budapest? Győr? Vidék? Fontosabb, mint gondolnád!' },
    { title: '🌿 Könnyű szemed?',           body: 'Ha folynak a szemeid, az AllergyTrack segít kideríteni, miért.' },
    { title: '🌿 A pollen napja!',          body: 'Főszereplő: te. Rögzítsd a mai tüneteket!' },
    { title: '🌿 2 perc az egészségedért',  body: 'Gyors naplózás = pontosabb elemzés = jobb ellátás.' },
  ],

  _randomMessage() {
    return this.MESSAGES[Math.floor(Math.random() * this.MESSAGES.length)];
  },

  /* ── Initialize ─────────────────────────── */
  async init() {
    if (!window.Capacitor?.isNativePlatform?.()) return;
    const { LocalNotifications } = Capacitor.Plugins;
    if (!LocalNotifications) return;

    try {
      /* Jogosultság kérés */
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') return;

      /* Gyors-akció típus regisztrálása:
         "😌 Tünetmentes" gomb az értesítésen.
         foreground: false → az app HÁTTÉRBEN fut, nem kerül előtérbe.
         Az akciót az addActionListener kezeli le.                      */
      await LocalNotifications.registerActionTypes({
        types: [{
          id: 'LOG_SYMPTOM',
          actions: [{
            id:         'no_symptoms',
            title:      '😌 Tünetmentes',
            foreground: false,   /* app marad háttérben */
          }],
        }],
      });

      /* Figyelő: ha a felhasználó megnyomta a "Tünetmentes" gombot */
      await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        async (event) => {
          if (event.actionId === 'no_symptoms') {
            await this._logNoSymptoms();
          }
        }
      );

      /* Ha még nincsenek beütemezve, most ütemezzük */
      const scheduled  = await LocalNotifications.getPending();
      const allergyIds = [101, 102, 103];
      const alreadySet = allergyIds.every(id =>
        scheduled.notifications?.some(n => n.id === id)
      );
      if (!alreadySet) await this.schedule();

    } catch (e) {
      console.warn('[Notifications] init error:', e);
    }
  },

  /* ── Tünetmentes nap rögzítése értesítésből ──────────────────────────
     Az app NEM nyílik meg. Az adatokat a tárolt GPS-adatból és az
     Open-Meteo cache-ből vesszük.                                       */
  async _logNoSymptoms() {
    try {
      const now  = new Date();
      const date = now.toISOString().split('T')[0];
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

      /* Helyszín a tárolt GPS-adatból */
      const loc  = await App.db.getSetting('userLocation', null);
      const city = loc?.nearestCity || '';

      /* Hőmérséklet az időjárás cache-ből */
      let temp = null;
      try {
        const wxCache = await App.db.getSetting('weatherCache', null);
        if (wxCache?.current?.temp != null) {
          temp = Math.round(wxCache.current.temp);
        }
      } catch (_) {}

      await App.db.saveSymptomsLog({
        date,
        time,
        location:         city,
        temperature:      temp,
        symptoms:         [],
        overall_severity: 0,
        no_symptoms:      true,
        notes:            'Tünetmentes – értesítésből rögzítve',
        medication_taken: false,
        medications_taken:[],
        triggers:         [],
        environment:      {},
      });

      /* Rövid megerősítő értesítés */
      const { LocalNotifications } = Capacitor.Plugins;
      if (LocalNotifications) {
        await LocalNotifications.schedule({
          notifications: [{
            id:    999,
            title: '✅ Rögzítve!',
            body:  `Tünetmentes nap – ${date} ${time}${city ? ` · ${city}` : ''}`,
            schedule: { at: new Date(Date.now() + 500) },
          }],
        });
      }
    } catch (e) {
      console.warn('[Notifications] _logNoSymptoms error:', e);
    }
  },

  /* ── Értesítések ütemezése ──────────────── */
  async schedule() {
    if (!window.Capacitor?.isNativePlatform?.()) return;
    const { LocalNotifications } = Capacitor.Plugins;
    if (!LocalNotifications) return;

    /* Meglévők törlése */
    try {
      await LocalNotifications.cancel({ notifications: [
        { id: 101 }, { id: 102 }, { id: 103 },
      ]});
    } catch (_) {}

    const enabled = await App.db.getSetting('notificationsEnabled', true);
    if (!enabled) return;

    const slots = [
      { id: 101, hour: 9,  minute: 0  },   /* reggel  */
      { id: 102, hour: 12, minute: 30 },   /* délben  */
      { id: 103, hour: 21, minute: 0  },   /* este    */
    ];

    const notifications = slots.map(slot => {
      const msg  = this._randomMessage();
      const next = this._nextOccurrence(slot.hour, slot.minute);
      return {
        id:           slot.id,
        title:        msg.title,
        body:         msg.body,
        schedule:     { at: next, repeats: true, every: 'day' },
        smallIcon:    'ic_notification',
        iconColor:    '#2E7D32',
        sound:        null,
        actionTypeId: 'LOG_SYMPTOM',   /* ez adja hozzá a Tünetmentes gombot */
        extra: { slot: slot.hour < 12 ? 'morning' : slot.hour < 18 ? 'noon' : 'evening' },
      };
    });

    try {
      await LocalNotifications.schedule({ notifications });
      console.log('[Notifications] 3 napi emlékeztető + Tünetmentes gomb beütemezve.');
    } catch (e) {
      console.warn('[Notifications] schedule error:', e);
    }
  },

  async cancel() {
    if (!window.Capacitor?.isNativePlatform?.()) return;
    const { LocalNotifications } = Capacitor.Plugins;
    if (!LocalNotifications) return;
    try {
      await LocalNotifications.cancel({ notifications: [
        { id: 101 }, { id: 102 }, { id: 103 },
      ]});
    } catch (_) {}
  },

  _nextOccurrence(hour, minute) {
    const now  = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  },
};
