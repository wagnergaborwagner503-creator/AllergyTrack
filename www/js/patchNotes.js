/* ═══════════════════════════════════════════
   AllergyTrack – Patch Notes
   Verziónkénti újdonságok és javítások
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.PatchNotes = {

  CURRENT_VERSION: '1.6.0',

  /* Verzió-lista (legújabb elöl) */
  NOTES: [
    {
      version: '1.6.0',
      date: '2026-06-14',
      title: 'Kollektív pollenadatok + kontrasztos kijelölés',
      summary: 'A pollenadatok mostantól közösek: egy központi fiók tölti fel őket a szerverre, és minden felhasználó automatikusan letölti azokat az app újranyitásakor és lefelé húzáskor. Az új bejegyzésnél a kiválasztott tünetek, környezet és kiváltó tényezők sokkal egyértelműbbek lettek.',
      changes: [
        { type: 'new', text: 'Kollektív pollen: a megosztott (publikus) pollenadatok minden fióknál automatikusan frissülnek app-újranyitáskor és lefelé húzáskor (pull-to-refresh)' },
        { type: 'new', text: 'A megosztott pollenadatokat egyetlen központi fiók tölti fel – így mindenkinél egységes, megbízható adat jelenik meg' },
        { type: 'fix', text: 'Kijelölt tünet / környezet / kiváltó tényező gombok: telt zöld háttér, kontrasztos felirat, kiemelő gyűrű és pipa jel – egyértelmű, mi van kiválasztva' },
      ],
    },
    {
      version: '1.5.0',
      date: '2026-06-10',
      title: 'GitHub PWA + Supabase felhő profil',
      summary: 'Az AllergyTrack mostantól telepíthető webalkalmazásként (PWA), offline is teljesen működőképes service worker-rel. Opcionális Supabase felhő-szinkronizáció: regisztrálj és allergen profilod több eszközön is elérhető. A fejléc jobb sarkában kör alakú profil gomb jelenik meg.',
      changes: [
        { type: 'new', text: 'PWA – az alkalmazás telepíthető Android és iOS eszközökre böngészőből (Add to Home Screen)' },
        { type: 'new', text: 'Service Worker: offline mód, az app internet nélkül is teljesen működik' },
        { type: 'new', text: 'Profil gomb: kör alakú avatár ikon a fejléc jobb sarkában' },
        { type: 'new', text: 'Supabase auth: e-mail/jelszó regisztráció és bejelentkezés' },
        { type: 'new', text: 'Profil panel: megjelenítési név, allergen profil feltöltés/letöltés felhőbe' },
        { type: 'new', text: 'Felhő szinkronizáció: allergen profil backup és visszaállítás Supabase-ből' },
        { type: 'new', text: 'Offline mód: Supabase konfiguráció nélkül az app ugyanúgy működik (helyi IndexedDB)' },
        { type: 'new', text: 'GitHub projekt struktúra: .gitignore, supabase_schema.sql' },
      ],
    },
    {
      version: '1.4.1',
      date: '2026-06-08',
      title: 'Teljes magyarországi vegetációs adatbázis',
      summary: 'Mind a 18 monitorvárosra teljes, numerikus súlyozású allergén-jelenlét térkép és az összes allergén pontos allergenicitási értéke – az elemzés mostantól valós vegetációs arányokat használ.',
      changes: [
        { type: 'new', text: '18 magyar monitorváros teljes allergén-jelenlét profilja numerikus 0–1 súlyokkal (pl. Szeged: ambrosia=0.98, Szombathely: betula=0.88, pinaceae=0.25)' },
        { type: 'new', text: 'Magyarország-szintű átlagos fallback térkép ismeretlen helyszínekre' },
        { type: 'new', text: 'Minden allergén IgE-alapú allergenicitási szorzója irodalmi forrásokból (EAACI, WAO): ambrosia/poaceae/betula=1.0, pinaceae=0.08' },
        { type: 'new', text: 'cityAllergenScore(): jelenlét × allergenicitás kombinált pontszám – az elemzés ezt használja' },
        { type: 'fix', text: 'Fenyőfélék: Szombathelyen magasabb (erdős régió), Alföldi városokban alacsony' },
        { type: 'fix', text: 'Szeged, Debrecen, Békéscsaba: parlagfű 0.95–0.98, Szombathely, Zalaegerszeg: parlagfű 0.38' },
      ],
    },
    {
      version: '1.4.0',
      date: '2026-06-08',
      title: 'Nagy frissítés – Időjárás, Értesítések, Intelligens elemzés',
      summary: 'Időjárás-előrejelzés a főoldalon, napi tünet-emlékeztető értesítések, tünetmentes napok rögzítése, automatikus helyszín+hőmérséklet kitöltés, városnövényzet-alapú allergén pontozás és sok más.',
      changes: [
        { type: 'new', text: 'Időjárás a főoldalon: jelenlegi hőmérséklet, páratartalom és felhőzet az üdvözlő kártyán' },
        { type: 'new', text: 'Időjárás-előrejelzés az „Előrejelzések" szekcióban, 7 napra (WMO kódok, csapadék, pollen-mosás jelzés)' },
        { type: 'new', text: 'Napi tünet-emlékeztető: 30 játékos, vicces értesítési szöveg – reggel, délben és este 9-kor' },
        { type: 'new', text: 'Tünetmentes nap gyors rögzítés: „Ma nincsenek tüneteim" gomb az új bejegyzés oldalon' },
        { type: 'new', text: 'Helyszín és hőmérséklet auto-kitöltés GPS + időjárás API alapján az új bejegyzésnél' },
        { type: 'new', text: 'Városnövényzet térkép: 18 magyar város jellemző allergénjei – fenyőfélék alacsony allergenicitással penalizálva' },
        { type: 'new', text: 'Pollen vs. tünetek grafikon: top-3 scoring városi növényzet + időjárás (esős napok 60% pollen-mosás)' },
        { type: 'new', text: 'Exportálás formátum-választóval: JSON (biztonsági mentés) vagy CSV (Messenger-barát)' },
        { type: 'new', text: 'Értesítések be/ki kapcsoló a beállításoknál' },
        { type: 'new', text: 'Patch notes: korábbi verziók legördülő menüből megtekinthetők' },
        { type: 'fix', text: 'Előrejelzési adatok felülírása (nem átlagolás) – friss előrejelzés mindig pontos' },
        { type: 'fix', text: 'Forrás-dedulikáció: ugyanaz a forrás nem kerül kétszer az adatbázisba' },
        { type: 'fix', text: 'Pollen trend nyilak: az előző naphoz képest mutatja a változást (nem a maihoz)' },
        { type: 'fix', text: 'Fenyőfélék allergenicitása 0.15× szorzóval – nem jelenik meg indokolatlanul elsőként' },
      ],
    },
    {
      version: '1.3.58',
      date: '2026-05-29',
      title: 'Pollen átlag szűrés (Nincs/n.a. kizárva)',
      summary: 'A Pollen vs. Tünetek grafikon zöld és sárga vonala mostantól csak az Alacsony (≥1) és feletti pollen értékeket átlagolja – a Nincs (0) és n.a. adatok nem torzítják az átlagot.',
      changes: [
        { type: 'fix', text: 'Pollenszint vonal (zöld): csak risk_level ≥ 1 értékek kerülnek az átlagba' },
        { type: 'fix', text: 'Előrejelzés vonal (sárga): szintén csak risk_level ≥ 1 értékek alapján átlagolva' },
      ],
    },
    {
      version: '1.3.57',
      date: '2026-05-29',
      title: 'Naptár popup – helyszínenkénti pollen',
      summary: 'A naptárban egy napra kattintva az összes látogatott helyszín (Győr, Budapest stb.) külön szekcióban mutatja a Közepes/Magas/Extrém allergéneket.',
      changes: [
        { type: 'new', text: 'Naptár popup: pollen adatok helyszínenként csoportosítva – minden látogatott városnak saját szekciója van' },
        { type: 'new', text: 'Helyszín-forrás: tünetnapló bejegyzések + GPS helyzetnaplózás kombinálva' },
        { type: 'new', text: 'Küszöb: Közepes (2+) értékek is megjelennek (korábban csak Magas/Extrém)' },
        { type: 'fix', text: 'Tünetek listájában az időpont mellé a helyszín is megjelenik' },
        { type: 'fix', text: 'Tünetek időrendi sorrendben (korábbi időpont felül)' },
      ],
    },
    {
      version: '1.3.56',
      date: '2026-05-29',
      title: 'Tünetnapló sorrend javítás',
      summary: 'A tünetnapló mostantól a bejegyzés dátuma+ideje alapján rendez, csökkenő sorrendben – legfrissebb felül.',
      changes: [
        { type: 'fix', text: 'Tünetnapló: rendezés a bejegyzés dátuma+ideje alapján (nem created_at), legfrissebb felül – visszamenőleg rögzített adatok is helyesen sorolódnak be' },
      ],
    },
    {
      version: '1.3.55',
      date: '2026-05-29',
      title: 'Tünetnapló időrendi sorrend (visszavonva)',
      summary: 'Kísérlet növekvő sorrendre – felülírva v1.3.56-ban.',
      changes: [
        { type: 'fix', text: 'Tünetnapló: növekvő sorrend (visszavonva v1.3.56-ban)' },
      ],
    },
    {
      version: '1.3.54',
      date: '2026-05-29',
      title: 'Intelligens allergén-azonosítás',
      summary: 'A top-3 allergén pontozása háromtényezőssé vált: trend-korreláció (Pearson r), helyzet-alapú egyidejűség és tünet-típus egyezés kombinációja.',
      changes: [
        { type: 'new', text: 'Trend-korreláció (40%): ha az allergén erősödik és a tünetek is erősödnek → magasabb pontszám (Pearson r)' },
        { type: 'new', text: 'Helyzet-alapú egyidejűség (35%): tünetes napokon a felhasználó tartózkodási helyén volt-e magas az allergén?' },
        { type: 'new', text: 'Tünet-típus egyezés (25%): az allergén ismert tünetei mennyire fedik a naplózott tüneteket' },
        { type: 'fix', text: 'Fallback: ha nincs tünetnapló, a 3 legmagasabb kockázatú allergén jelenik meg' },
      ],
    },
    {
      version: '1.3.53',
      date: '2026-05-29',
      title: 'Top-3 egyező allergén a grafikonon',
      summary: 'A „Pollen vs. tünetek" grafikon most megjeleníti a felhasználó tüneteivel legjobban egyező 3 allergén vonalát is.',
      changes: [
        { type: 'new', text: 'Elemzés: „Pollen vs. tünetek" grafikon – top-3 egyező allergén teal/lila/narancs szaggatott vonallal jelölve' },
        { type: 'new', text: 'Pontozás: tünet-egyezési arány × átlagos pollen-kockázat tünetes napokon; ha nincs elég napló, a legmagasabb kockázatú 3 allergén jelenik meg' },
      ],
    },
    {
      version: '1.3.52',
      date: '2026-05-29',
      title: 'Navigáció & grafikon javítás (2. kör)',
      summary: 'Oldalváltáskor valódi window.scrollTo(0,0) hívás, grafikon sárga híd spanGaps-szel javítva.',
      changes: [
        { type: 'fix', text: 'Oldalnavigáció: window.scrollTo(0,0) + requestAnimationFrame – minden oldalon visszaugrik a tetejére' },
        { type: 'fix', text: 'Pollen vs. tünetek grafikon: spanGaps:true az előrejelzés dataseten – a sárga összekötő vonal dátumhézag esetén is megjelenik' },
      ],
    },
    {
      version: '1.3.51',
      date: '2026-05-29',
      title: 'Pull-to-refresh & térképes pan javítás',
      summary: 'Pull-to-refresh window.scrollY alapon ellenőrzi az oldal pozícióját; pinch zoom után az ujjal azonnal lehet húzni a térképet.',
      changes: [
        { type: 'fix', text: 'Pull-to-refresh: window.scrollY figyelése (a #page-content scrollTop mindig 0 volt) + küszöb 144px + statikus 🔄 ikon' },
        { type: 'fix', text: 'Térkép: pinch zoom után az egyedül maradt ujj azonnal tudja húzni a térképet (dragging újraindul touchend-nél)' },
      ],
    },
    {
      version: '1.3.5',
      date: '2026-05-29',
      title: 'Zoom javítás & Pull-to-refresh finomítás',
      summary: 'Térkép zoom középpontja javítva, pull-to-refresh csak az oldal tetején aktiválódik (csak ikon), pollen–előrejelzés grafikon összekötve, oldalnavigáció tetejére ugrik.',
      changes: [
        { type: 'fix', text: 'Térkép: zoom középpontja most pontosan az ujjak/kurzor pozíciójára esik (canvas transform offset javítva)' },
        { type: 'fix', text: 'Pull-to-refresh: csak akkor aktiválódik, ha az oldal tetején vagyunk – normál görgetésnél nem sül el' },
        { type: 'fix', text: 'Pull-to-refresh: csak a körös 🔄 ikon jelenik meg, felirat nélkül' },
        { type: 'fix', text: 'Pollen vs. tünetek grafikon: az utolsó zöld és első sárga pont között most sárga összekötő vonal húzódik' },
        { type: 'fix', text: 'Oldalnavigáció: minden oldalváltáskor az oldal tetejére ugrik a tartalom' },
      ],
    },
    {
      version: '1.3.4',
      date: '2026-05-28',
      title: 'Térkép zoom & Helyzet-alapú elemzés',
      summary: 'Zoomolható térkép felhasználói pozícióval, helyzet-alapú korrelációs elemzés, frissített előrejelzés (Magyarország átlag), kibővített tudástár, pull-to-refresh, aktuális pollenszint eltávolítva.',
      changes: [
        { type: 'new',  text: 'Térkép: pinch-zoom + drag, duplaérintés visszaállítja a nézetet' },
        { type: 'new',  text: 'Térkép: felhasználói GPS pozíció kék ponttal jelölve, 5 percenként frissül' },
        { type: 'new',  text: 'Térkép: megnyitáskor automatikusan a mai dátumra és a legerősebb allergénre áll' },
        { type: 'new',  text: 'Pull-to-refresh: képernyő lehúzásával frissítés (helyadat + oldal újratöltés)' },
        { type: 'new',  text: 'Helyzet-alapú elemzés: a korrelációs elemzés csak a tartózkodási hely pollenadatait veszi figyelembe (GPS-előzmény alapján)' },
        { type: 'new',  text: 'Allergen veszélyek: felhasználó régiójában érvényes adatok (GPS-pozíció vagy Magyarország átlaga)' },
        { type: 'new',  text: 'Pollen előrejelzés: egész Magyarország átlagolása (nem max) a főoldalon és az elemzésnél' },
        { type: 'new',  text: 'Tudástár: fenyőfélék, ciprusfélék, olajfa, gyertyán, sóska, libatop cikkek hozzáadva' },
        { type: 'fix',  text: 'Pollen vs. tünetek grafikon: pollen vonal szolid (nem szaggatott), csak mai dátumig, előrejelzés sárga körrel jelölve' },
        { type: 'fix',  text: 'Naptár popup: összes pollen-forrásból mutat adatot (nem csak az elemzési időszakból)' },
        { type: 'fix',  text: 'Napi súlyosság grafikon eltávolítva az elemzés oldalról' },
        { type: 'fix',  text: 'Aktuális pollenszint csík eltávolítva a főoldalról' },
      ],
    },
    {
      version: '1.3.3',
      date: '2026-05-28',
      title: 'Naptár előretekintés & PDF skála javítás',
      summary: 'Naptárban előre is lehet navigálni, tudástárban képek legelöl, valódi mintázatfelismerés, naptár popup szűrés, PDF skála 0–4 szintre javítva.',
      changes: [
        { type: 'new',  text: 'Naptár: előre is lehet lapozni – jövőbeli hónapokban szezon-előrejelzés jelenik meg (allergén ikon + latin név + szezon időszak)' },
        { type: 'new',  text: 'Tudástár: fotók most a szöveg előtt jelennek meg minden kártyán' },
        { type: 'new',  text: 'Elemzés: „Ismétlődő pollen–tünet mintázatok" – csak legalább 3 napos visszatérő egybeesés jelenik meg (statisztikai mintázat, nem diagnózis)' },
        { type: 'fix',  text: 'Naptár popup: csak Magas/Extrém (≥ 3) kockázatú pollen jelenik meg, és csak a felhasználó által bejárt helyszínekről' },
        { type: 'fix',  text: 'PDF importálás: skála javítva – „-" és „n.a." = Nincs (szürke, 0), „+" = Alacsony (1), „++" = Közepes (2), „+++" = Magas (3), „++++" = Extrém (4)' },
      ],
    },
    {
      version: '1.3.2',
      date: '2026-05-28',
      title: 'API frissítés & Előrejelzés a főoldalon',
      summary: 'Open-Meteo API kiterjesztve: olive pollen + PM10, 3 múltbeli + 5 előrejelzési nap. Főoldalon pollen-trend (nő/csökken). Elemzésnél előrejelzés grafikon. Kritikus DB javítások.',
      changes: [
        { type: 'new',  text: 'Főoldal: „Pollen előrejelzés" szekció – következő 5 nap, allergénenként ▲▼▶ trend a maihoz képest' },
        { type: 'new',  text: 'Elemzés: előrejelzés bar chart – 7 nap × 7 allergén kockázati szint (Nincs–Extrém)' },
        { type: 'new',  text: 'Elemzés: korrelációs grafikon kibővítve – narancssárga szaggatott vonal a jövőbeli pollenre' },
        { type: 'new',  text: 'Open-Meteo API: olive pollen (🫒 Olajfa) + PM10 szálló por hozzáadva' },
        { type: 'new',  text: 'API paraméterek: past_days=3 + forecast_days=5 + current= → valódi multi-day adat' },
        { type: 'new',  text: 'PM10 kockázati skála: WHO/EU határértékek alapján (0–4 szint, µg/m³)' },
        { type: 'fix',  text: 'Online frissítés gomb: auto-menti az adatot manuális jóváhagyás nélkül, helyes statisztikával' },
        { type: 'fix',  text: 'DB: getLatestPollenData() csak mai vagy múltbeli adatot ad vissza (korábban forecast napot adott)' },
        { type: 'fix',  text: 'DB: savePollenEntries() alias hozzáadva – az előrejelzés gomb bug javítva' },
      ],
    },
    {
      version: '1.3.1',
      date: '2026-05-27',
      title: 'Naptár & Előrejelzés & Képek',
      summary: 'Hagyományos havi naptárnézet, holnapi pollen-előrejelzés, tudástár képekkel és Wikipedia linkekkel, beállítások iOS-stílusú csoportosítása és egyéb javítások.',
      changes: [
        { type: 'new',  text: 'Holnapi előrejelzés gomb – NNK/ÁNTSZ forrásból kéri le a másnapi adatokat' },
        { type: 'new',  text: 'Hagyományos havi naptár – hónap léptető nyilakkal, szezon-sáv mutatja az aktuális pollenszezonokat' },
        { type: 'new',  text: 'Tudástár: minden allergen cikkhez fotó és Magyar Wikipédia link (Wikimedia Commons alapján)' },
        { type: 'fix',  text: 'Beállítások: iOS-stílusú csoportosítás – azonos szekciók egy közös lekerekített dobozban, belső elválasztókkal' },
        { type: 'fix',  text: 'Tünetnapló rendezés: a legfrissebb bejegyzés kerül legelőre (created_at alapján)' },
        { type: 'fix',  text: 'Patch notes / modal „Bezárás" gomb már nem lóg ki safe area területen kívülre – sticky pozicionálással javítva' },
        { type: 'fix',  text: 'NNK/ÁNTSZ „További információ" linkek pontosítva: Open-Meteo API docs + NNK pollenjelentés + ÁNTSZ polleninformációk' },
        { type: 'fix',  text: 'Naptár intervallum-váltó eltávolítva – az időszak kiválasztó mostantól csak a grafikonokat érinti' },
      ],
    },
    {
      version: '1.3.0',
      date: '2026-05-27',
      title: 'Színkódolás & AI export',
      summary: 'Egységes pollen-kockázati színskála, javított korrelációs elemzés, AI adatexport, bővített tudástár és patch notes javítás.',
      changes: [
        { type: 'new',  text: 'AI elemzési segítség – prompt másolása és adatexport LLM modellekhez (Beállítások)' },
        { type: 'new',  text: 'Egységes színkódolás: térkép és naptár mostantól azonos Nincs/Alacsony/Közepes/Magas/Extrém skálát használ' },
        { type: 'new',  text: 'Kockázati szintek átnevezve: Nincs · Alacsony · Közepes · Magas · Extrém (a „V. Magas" eltávolítva)' },
        { type: 'new',  text: 'Bővített tudástár: 15+ allergén részletes adatokkal, keresztreakciók, szezon-időszakok' },
        { type: 'fix',  text: 'NNK/ÁNTSZ adatforrás javítva: az efop180.antsz.hu helyett az nnk.gov.hu-ról kéri le az adatokat' },
        { type: 'fix',  text: 'Legvalószínűbb allergiák: relatív arány és adatmegbízhatóság jelzés hozzáadva (⚠ kevés adat figyelmeztetés)' },
        { type: 'fix',  text: 'Patch notes: frissítés után mostantól az összes kimaradt változás megjelenik (nem csak az előző verzió)' },
        { type: 'fix',  text: 'Patch notes: a verziót csak az „Rendben" gomb megnyomása után jelöli látottnak' },
        { type: 'fix',  text: 'Pollen koncentráció → kockázati szint átalakítás 0–4 tartományra bővítve (korábban max. 3 volt)' },
        { type: 'ui',   text: 'Alkalmazás ikon: 🌿 emoji világoszöld háttéren' },
        { type: 'ui',   text: 'Biztonságos terület (safe area) kezelés javítva: modal és toast az Android gesture bar fölé kerül' },
      ],
    },
    {
      version: '1.2.0',
      date: '2026-05-26',
      title: 'Helymeghatározás & Elemzések',
      summary: 'GPS pozíció, naptár-színezés, easter egg és sok apró javítás.',
      changes: [
        { type: 'new',  text: 'GPS helymeghatározás – az alkalmazás a legközelebbi mérőállomáshoz csatolja pozíciódat' },
        { type: 'new',  text: 'Naptár nézet szín-kódolás: zöld → piros skálán mutatja az átlagos napi súlyosságot' },
        { type: 'new',  text: 'Allergia tudástár – kereshető ismerettár a pollenszezonokról és tünetekről' },
        { type: 'new',  text: 'Patch notes megjelenítő – minden frissítés után értesítést kapsz az újdonságokról' },
        { type: 'new',  text: 'Pollenadatok exportálása/importálása a Beállításokban' },
        { type: 'new',  text: 'Allergen veszélyek blokk: minden magas szintű allergen megjelenik a főoldalon' },
        { type: 'fix',  text: 'PDF feltöltés javítva – PDF.js mostantól lokálisan töltődik be (offline is működik)' },
        { type: 'fix',  text: 'Duplikált pollenadatok kezelése: azonos forrásból érkező ismétlések átlagolódnak' },
        { type: 'fix',  text: 'Skálák normalizálása – minden forrás adatait 0–3 kockázati skálára hozza a rendszer' },
        { type: 'ui',   text: 'FAB gomb (+ hozzáadás) áthelyezve a navigációs sáv közepére' },
        { type: 'ui',   text: 'PDF feltöltési doboz kisebb, kompaktabb megjelenés' },
        { type: 'ui',   text: 'Verzió: 1.2.0 megjelenítve a beállítások oldalon' },
      ],
    },
    {
      version: '1.1.2',
      date: '2026-05-26',
      title: 'PDF feltöltés & Per-city adatok',
      summary: 'Helyi PDF.js, városonkénti pollen lekérés, skála javítás.',
      changes: [
        { type: 'new',  text: 'Open-Meteo integráció: 18 magyar városra külön pollenadat' },
        { type: 'new',  text: 'Otthoni tippek tünetek enyhítésére (főoldalon)' },
        { type: 'fix',  text: 'Import/export javítva Android APK-ban' },
        { type: 'fix',  text: 'Súlyosság skála 10-ről 5-re módosítva' },
        { type: 'ui',   text: 'Téma fül eltávolítva a beállításokból' },
      ],
    },
  ],

  /* Típus → ikon és szín */
  TYPE_META: {
    new:  { icon: '✨', label: 'Új funkció',   color: '#2E7D32' },
    fix:  { icon: '🔧', label: 'Javítás',      color: '#1565C0' },
    ui:   { icon: '🎨', label: 'Megjelenés',   color: '#7B1FA2' },
    perf: { icon: '⚡', label: 'Teljesítmény', color: '#E65100' },
  },

  /* ── Semver összehasonlítás (a > b → 1, egyenlő → 0, a < b → -1) */
  _cmpVersion(a, b) {
    const pa = (a || '0.0.0').split('.').map(Number);
    const pb = (b || '0.0.0').split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pa[i] || 0) > (pb[i] || 0)) return  1;
      if ((pa[i] || 0) < (pb[i] || 0)) return -1;
    }
    return 0;
  },

  /* ── Megjelenítés első induláskor ─────────── */
  async checkAndShow() {
    const lastSeen = await App.db.getSetting('lastSeenVersion', '');

    /* Already up to date – nothing to show */
    if (lastSeen === this.CURRENT_VERSION) return;

    /* Collect all notes newer than lastSeen (or all if lastSeen is empty) */
    const newNotes = this.NOTES.filter(n =>
      !lastSeen || this._cmpVersion(n.version, lastSeen) > 0
    );

    if (newNotes.length === 0) {
      /* Edge case: DB has a future version somehow – still mark current */
      await App.db.setSetting('lastSeenVersion', this.CURRENT_VERSION);
      return;
    }

    /* Small delay so the app finishes rendering before the modal pops up */
    setTimeout(() => this._showUpdateModal(newNotes, lastSeen), 800);
  },

  /* ── Modal for "new since last seen" ─────── */
  _showUpdateModal(newNotes, lastSeen) {
    const meta       = this.TYPE_META;
    const isFirstRun = !lastSeen;
    const topNote    = newNotes[0]; /* newest */

    /* Build change list across all new versions */
    const changeHtml = newNotes.map(note => {
      const versionHeader = newNotes.length > 1
        ? `<div style="font-size:11px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;padding:10px 0 4px;border-top:1px solid var(--border-2);margin-top:4px">v${note.version} – ${note.title}</div>`
        : '';
      return versionHeader + note.changes.map(c => {
        const m = meta[c.type] || meta.fix;
        return `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-2)">
          <span style="font-size:16px;line-height:1;flex-shrink:0;margin-top:1px">${m.icon}</span>
          <div style="flex:1">
            <span style="font-size:10px;font-weight:700;color:${m.color};text-transform:uppercase;letter-spacing:.5px">${m.label}</span>
            <div style="font-size:13px;color:var(--text-2);margin-top:2px;line-height:1.5">${c.text}</div>
          </div>
        </div>`;
      }).join('');
    }).join('');

    const sinceLabel = isFirstRun
      ? 'Üdvözlünk az AllergyTrack-ben!'
      : `Újdonságok v${lastSeen} → v${this.CURRENT_VERSION}`;

    App.showModal(`
      <div class="modal-handle"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
        <div style="font-size:28px">🎉</div>
        <div>
          <div class="modal-title" style="margin-bottom:2px">${sinceLabel}</div>
          <div style="font-size:12px;color:var(--text-3)">${topNote.date}</div>
        </div>
      </div>
      ${newNotes.length === 1
        ? `<p style="font-size:13px;color:var(--text-2);margin:10px 0 14px;line-height:1.6">${topNote.summary}</p>`
        : `<p style="font-size:13px;color:var(--text-2);margin:10px 0 14px;line-height:1.6">${newNotes.length} verzió újdonsága – összesen ${newNotes.reduce((s,n) => s + n.changes.length, 0)} változás.</p>`}
      <div style="max-height:360px;overflow-y:auto;margin-bottom:16px">
        ${changeHtml}
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="pn-close-btn">Rendben</button>
      </div>
    `);

    /* Mark as seen ONLY after user acknowledges */
    document.getElementById('pn-close-btn')?.addEventListener('click', async () => {
      await App.db.setSetting('lastSeenVersion', this.CURRENT_VERSION);
      App.closeModal();
    });
  },

  /* ── Egy adott verzió modal-ja (beállítások oldalról) */
  showModal(version) {
    const note = this.NOTES.find(n => n.version === version) || this.NOTES[0];
    if (!note) return;

    const meta = this.TYPE_META;

    App.showModal(`
      <div class="modal-handle"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
        <div style="font-size:28px">📋</div>
        <div>
          <div class="modal-title" style="margin-bottom:2px">v${note.version} – ${note.title}</div>
          <div style="font-size:12px;color:var(--text-3)">${note.date}</div>
        </div>
      </div>
      <p style="font-size:13px;color:var(--text-2);margin:10px 0 14px;line-height:1.6">${note.summary}</p>
      <div style="max-height:320px;overflow-y:auto;margin-bottom:16px">
        ${note.changes.map(c => {
          const m = meta[c.type] || meta.fix;
          return `
          <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-2)">
            <span style="font-size:16px;line-height:1;flex-shrink:0;margin-top:1px">${m.icon}</span>
            <div style="flex:1">
              <span style="font-size:10px;font-weight:700;color:${m.color};text-transform:uppercase;letter-spacing:.5px">${m.label}</span>
              <div style="font-size:13px;color:var(--text-2);margin-top:2px;line-height:1.5">${c.text}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
      ${this.NOTES.length > 1 ? `
      <div style="margin-bottom:14px">
        <div style="font-size:12px;font-weight:700;color:var(--text-3);margin-bottom:8px">Korábbi verziók</div>
        <select id="pn-version-select" class="form-control" style="font-size:13px">
          <option value="">-- Válassz verziót --</option>
          ${this.NOTES.filter(n => n.version !== note.version).map(n =>
            `<option value="${n.version}">v${n.version} – ${n.title}</option>`
          ).join('')}
        </select>
      </div>` : ''}
      <div class="modal-actions">
        <button class="btn btn-primary" onclick="App.closeModal()">Bezárás</button>
      </div>
    `);

    /* Legördülő verzióváltás */
    document.getElementById('pn-version-select')?.addEventListener('change', (e) => {
      const v = e.target.value;
      if (v) { App.PatchNotes.showModal(v); }
    });
  },

  /* ── Összes verzió listája (beállítások oldalról) */
  showAllVersions() {
    this.showModal(this.NOTES[0].version);
  },
};
