/* ═══════════════════════════════════════════
   AllergyTrack – Allergia Tudástár
   Alapja: pollen_allergy_knowledge_base.json
   ═══════════════════════════════════════════ */

window.App = window.App || {};

App.Knowledge = {

  ARTICLES: [

    /* ══════════════════════════════════════════
       POLLEN TÍPUSOK – Fák (jan–máj)
    ══════════════════════════════════════════ */
    {
      id: 'corylus',
      title: 'Mogyoró (Corylus avellana)',
      icon: '🌰',
      tag: 'Pollen',
      tagColor: '#8D6E63',
      wikiImg: 'Corylus_avellana1.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/K%C3%B6z%C3%B6ns%C3%A9ges_mogyoró',
      content: `A mogyoró (Corylus avellana) az allergiaszezon első jelzője: januártól márciusig virágzik, enyhe teleken már január végétől. Csúcsideje február.

<strong>Szezon:</strong> jan.–már. · Csúcs: február

<strong>Tünetprofil:</strong> Erős tüsszögés, orrfolyás, orrviszketés; szemviszketés, könnyezés. Tünetei nem különíthetők el könnyen az éger- és nyírfapollentől – ezekkel szinte egy időben virágzik.

<strong>Mikor a legerősebb?</strong> Délelőtt (10–14 óra), száraz, meleg, szeles napokon. Esős hideg időben csökken a pollenszint.

<strong>Keresztreakciók (OAS):</strong>
• Mogyoró (nyers) – közepes erősségű reakció
• Alma, barack (nyers) – enyhe szájviszketés
• Nyírfával, égerrel erős keresztreakció (közös Bet v 1 antigén)

<strong>Diagnosztikai jelek:</strong>
• Tünetek február körül, hidegben is megjelennek
• „Az első szénanáthás nap" jellemzően mogyoróhoz kötött
• Ha nyers mogyorótól viszket a szád – erős jel`
    },

    {
      id: 'alnus',
      title: 'Éger (Alnus glutinosa)',
      icon: '🌲',
      tag: 'Pollen',
      tagColor: '#795548',
      wikiImg: 'Alnus_glutinosa_catkins.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/M%C3%A9zg%C3%A1s_%C3%A9ger',
      content: `Az égerfa (Alnus glutinosa) a mogyoróval szinte párhuzamosan virágzik – február-március a fő időszak. Vízpartok, patakok, tavak mellett különösen magas koncentrációban fordul elő.

<strong>Szezon:</strong> jan.–már. · Csúcs: feb.–már.

<strong>Tünetprofil:</strong> Tüsszögés, orrfolyás, orrviszketés, szemviszketés, könnyezés. Orrtorlódás is előfordulhat.

<strong>Mikor a legerősebb?</strong> Délelőtt, száraz szeles időben. Fagy és eső lecsökkenti.

<strong>Keresztreakciók (OAS):</strong>
• Alma, körte, cseresznye (nyers) – enyhe szájviszketés
• Nyírfával és mogyoróval erős keresztreakció – azonos Bet v 1 antigén

<strong>Diagnosztikai jelek:</strong>
• Vízpartok közelén élőknél erősebb tünetek
• Mogyoróval szinte egyidejű – naptár nélkül nehéz elkülöníteni`
    },

    {
      id: 'betula',
      title: 'Nyírfa (Betula pendula)',
      icon: '🌳',
      tag: 'Pollen',
      tagColor: '#4CAF50',
      wikiImg: 'Betula_pendula.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Cs%C3%BCng%C5%91_ny%C3%ADrfa',
      content: `A nyírfa (Betula pendula) az egyik legfontosabb allergén Közép-Európában. Március végétől május elejéig virágzik, csúcsa április. Magyarország érintett lakosságának 20–30%-a nyírfa-allergiás.

<strong>Szezon:</strong> már.–máj. · Csúcs: április

<strong>Tünetprofil (általában erős):</strong>
• Elsődleges: erős tüsszögés, bőséges orrfolyás, orrviszketés, szemviszketés, könnyezés, vörös szem
• Másodlagos: orrtorlódás, duzzadt szemhéj, száraz köhögés, fáradtság, fejfájás
• Ritkán: sípoló légzés, asztmás roham

<strong>Különleges körülmény:</strong> Meleg zápor utáni első napon robbanásszerűen magas lehet a pollenkoncentráció.

<strong>Keresztreakciók (OAS) – Bet v 1 antigén:</strong>
• Alma, körte, cseresznye, őszibarack, szilva (nyers)
• Nyers sárgarépa, zeller – közepes reakció
• Mogyoró, dió (nyers)
• Kivi, eper, mandula
<em>Fontos: főzés/sütés inaktiválja az allergént – a főtt alma általában tolerálható!</em>

<strong>Diagnosztikai jelek:</strong>
• Április a „legrosszabb hónap" – napsütéses meleg idő + erős tünetek
• Nyers alma/sárgarépa után száj/torok viszketése
• Tünetek április végén hirtelen enyhülnek`
    },

    {
      id: 'fraxinus',
      title: 'Kőris (Fraxinus excelsior)',
      icon: '🌿',
      tag: 'Pollen',
      tagColor: '#558B2F',
      wikiImg: 'Fraxinus_excelsior_flowers.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/K%C3%B6z%C3%B6ns%C3%A9ges_k%C5%91ris',
      content: `A kőrisfa (Fraxinus excelsior) március-április folyamán virágzik, sokszor a nyírfával párhuzamosan. Városokban díszfaként elterjedt – ezért városi élőknél erősebb tüneteket okozhat.

<strong>Szezon:</strong> már.–máj. · Csúcs: már.–ápr.

<strong>Tünetprofil:</strong> Tüsszögés, orrfolyás, orrviszketés, szemviszketés, könnyezés, fáradtság. Tünetei hasonlóak a nyírfáéhoz, mivel ugyanabban az időszakban virágzik.

<strong>Keresztreakciók:</strong>
• Oleaceae-n belüli keresztreakció: olajfa, orgona, fagylalcserje
• Olajbogyó fogyasztásakor enyhe keresztreakció lehetséges

<strong>Fő allergén:</strong> Fra e 1 (Oleaceae-csoport)

<strong>Diagnosztikai jel:</strong>
• Ha a nyírfaszezonban (ápr.) erős tüneteid vannak, de nincs OAS gyümölcstől – lehetséges, hogy kőris a kiváltó
• Városokban díszfaként ültetik – kerületi parkoknál erőteljesebb tünetek`
    },

    {
      id: 'quercus',
      title: 'Tölgy (Quercus)',
      icon: '🌳',
      tag: 'Pollen',
      tagColor: '#795548',
      wikiImg: 'Quercus_robur.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Kocsányos_t%C3%B6lgy',
      content: `A tölgy (Quercus robur / Q. petraea) április-május folyamán virágzik. Nagy mennyiségű pollent termel, de allergicitása mérsékelt a nyírfához képest. Erdőlakóknál és Dunántúlon erősebb lehet a hatás.

<strong>Szezon:</strong> ápr.–máj. · Csúcs: ápr.–máj.

<strong>Tünetprofil:</strong> Enyhe-közepes tüsszögés, orrfolyás, szemviszketés. A tünetei általában kevésbé súlyosak, mint a nyírfáé.

<strong>Keresztreakciók:</strong>
• Nyírfával és bükkfával enyhe keresztreakció
• Természetes élőhelyeken (tölgyesekben) erőteljesebb expozíció

<strong>Diagnosztikai jel:</strong>
• Ha tüneteid május-ben is fennmaradnak, miután a nyírfaszezon véget ért – tölgy is lehet a kiváltó`
    },

    /* ══════════════════════════════════════════
       POLLEN TÍPUSOK – Fenyőfélék & egyéb fák
    ══════════════════════════════════════════ */
    {
      id: 'pinaceae',
      title: 'Fenyőfélék (Pinaceae)',
      icon: '🌲',
      tag: 'Pollen',
      tagColor: '#388E3C',
      wikiImg: 'Pinus_sylvestris_Luc_Viatour.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Erd%C5%91i_feny%C5%91',
      content: `A fenyőfélék (Pinaceae) nagy mennyiségű, jól látható sárga pollent termelnek, amelyek szabad szemmel is láthatók a levegőben és vízfelszíneken. A látványos mennyiség ellenére a fenyőpollen ritkán okoz erős allergiát, mivel a nagy szemcse nem jut mélyen a légutak ba.

<strong>Szezon:</strong> ápr.–jún. · Csúcs: május

<strong>Allergenitás:</strong> Általában ALACSONY – a nagy pollen méret (50–80 µm) miatt kevésbé allergizáló, mint a kisebb szemcsék. Ennek ellenére érzékeny embereknél tüneteket okozhat.

<strong>Tünetprofil (ha allergiás):</strong>
• Enyhe-közepes tüsszögés, orrfolyás
• Szemirritáció (viszketés, könnyezés)
• Orrnyálkahártya irritáció

<strong>Mikor a legerősebb?</strong> Reggel, meleg és száraz napokon. A sárga "por" látható vízfelszíneken, autókon – ez a pollen. Esőben teljesen lehull.

<strong>Fontos tudni:</strong>
• Az erős láthatóság megtévesztő – más allergenek is lehetnek a levegőben, amelyek nem láthatók, de sokkal erősebb allergiát okoznak (pl. pázsitfű, nyírfa)
• Ha fenyőerdőben töltöd az időt és tüneteid vannak, nem feltétlenül a fenyő az ok – egyidejűleg más pollenek is jelen lehetnek

<strong>Keresztreakciók:</strong> Ritka. Néha ciprusfélékkel (Cupressus) enyhébb keresztreakció lehetséges.

<strong>Diagnosztikai jelek:</strong>
• Tünetek CSAK amikor sárga por látható + fenyőerdőben vagy → lehet fenyő
• De ha az otthonodban is megjelennek (ahol nincs fenyő) → más allergén is lehetséges`
    },

    {
      id: 'cupressus',
      title: 'Ciprusfélék (Cupressaceae)',
      icon: '🌿',
      tag: 'Pollen',
      tagColor: '#546E7A',
      wikiImg: 'Cupressus_sempervirens_Luc_Viatour.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/K%C3%B6z%C3%B6ns%C3%A9ges_ciprus',
      content: `A ciprusfélék (Cupressaceae) – ide tartozik a ciprus (Cupressus), a tuja (Thuja) és a boróka (Juniperus) – Közép-Európában növekvő allergiás problémát okoznak. Dél-Európában ez az allergia rendkívül elterjedt.

<strong>Szezon:</strong> jan.–márc. (téli-kora tavaszi) · Mediterrán területeken dec.–márc.

<strong>Tünetprofil:</strong>
• Tüsszögés, orrfolyás, orrviszketés
• Szemviszketés, könnyezés (erős)
• Köhögés, torokviszktetés
• Fejfájás (orrmelléküregek elzáródása esetén)

<strong>Mikor jellemző Magyarországon?</strong>
• Parkokban, kertekben ültetett tuják, ciprusok, boróka bokrok
• Téli–tavaszi tünetek január-februárban = valószínű ciprusféle
• Enyhe teleken már decemberben megkezdődhet

<strong>Keresztreakciók:</strong>
• Fenyőfélékkel enyhe keresztreakció
• „Őszibarack-szindróma": egyes ciprus-allergiásoknál őszibarack OAS

<strong>Diagnosztikai jelek:</strong>
• Tünetek január-februárban, MIELŐTT a mogyoró virágzana → ciprus/tuja gyanú
• Parkban, temetőben töltött idő után rosszabb tünetek`
    },

    {
      id: 'olea',
      title: 'Olajfa / Olívafa (Olea europaea)',
      icon: '🫒',
      tag: 'Pollen',
      tagColor: '#8BC34A',
      wikiImg: 'Olive_Europe.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Europ%C3%A1i_olajfa',
      content: `Az olívafa (Olea europaea) Dél-Európában az egyik legfontosabb allergén, és Magyarországon is egyre több dísznövényként ültetett példány jelenik meg. Klimaváltozással terjedőben van.

<strong>Szezon:</strong> ápr.–jún. · Csúcs: május (Dél-Európában), Magyarországon kisebb mennyiségben

<strong>Tünetprofil:</strong>
• Tüsszögés, erős orrfolyás, orrviszketés
• Szemviszketés, könnyezés
• Köhögés, hörgőspazmus (súlyosabb esetben)
• Fejfájás

<strong>Magyarországi helyzet:</strong>
Az olívafa pollen Magyarországon főleg légi úton érkező, dél-európai forrásból (Adriai, Mediterrán területek). Nagy távolságra is eljut. Budapesten is mérhető mennyiségek kerülnek a levegőbe meleg, déli szeles napokon.

<strong>Keresztreakciók (OAS):</strong>
• Olívaolaj és nyers olívabogyó – ritka
• Kőrisfa (Fraxinus) – erős keresztreakció, azonos Bet v 1-szerű antigén
• Ligustrum (fagyöngy) – keresztreakció lehetséges
• Zeller, sárgarépa – enyhe OAS lehetséges

<strong>Diagnosztikai jelek:</strong>
• Tünetek Dél-Európából hazatérés után (nyaralás)
• Dél-magyarországi lakóknál, parkokban olívaültevénnyel`
    },

    {
      id: 'carpinus',
      title: 'Gyertyán (Carpinus betulus)',
      icon: '🌳',
      tag: 'Pollen',
      tagColor: '#6D4C41',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/K%C3%B6z%C3%B6ns%C3%A9ges_gyerty%C3%A1n',
      content: `A gyertyán (Carpinus betulus) az egyik leggyakoribb lombhullató fa Magyarország erdeiben, és mérsékelt allergenitású pollent termel. Sokszor egyidejűleg a nyírfával virágzik, ami megnehezíti az elkülönítést.

<strong>Szezon:</strong> márc.–ápr. · Csúcs: április eleje

<strong>Tünetprofil:</strong>
• Közepes-erős tüsszögés, orrfolyás
• Szemviszketés, könnyezés
• A nyírfával való egyidejű virágzás miatt nehéz elkülöníteni

<strong>Keresztreakciók:</strong>
• Nyírfával és mogyoróval erős keresztreakció (Bet v 1 antigén csoport)
• Nyers alma, körte, cseresznye – OAS lehetséges

<strong>Diagnosztikai jelek:</strong>
• Erdős, gyertyános területeken (Dunántúli-dombvidék, Északi-középhegység) erősebb expozíció
• Tünetek március végétől, nyírfával egyidőben`
    },

    /* ══════════════════════════════════════════
       POLLEN TÍPUSOK – Füvek (máj–aug)
    ══════════════════════════════════════════ */
    {
      id: 'poaceae',
      title: 'Pázsitfüvek (Poaceae)',
      icon: '🌾',
      tag: 'Pollen',
      tagColor: '#CDDC39',
      wikiImg: 'Phleum_pratense.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/P%C3%A1zsitf%C5%B1f%C3%A9l%C3%A9k',
      content: `A pázsitfűfélék (Poaceae) a leggyakoribb allergiás pollen Európában: az allergiások 40–50%-ánál érintett. Május közepétől júliusig virágzik, csúcsa júniusra esik.

<strong>Szezon:</strong> máj.–aug. · Csúcs: június

<strong>Jellemző növények:</strong> réti perje (Poa pratensis), timoté (Phleum pratense), csenkesz (Festuca), ebír (Dactylis glomerata), nádas (Phragmites), rozsperje.

<strong>Tünetprofil:</strong>
• Elsődleges: tüsszögés, orrfolyás, orrviszketés, szemviszketés, könnyezés
• Másodlagos: orrtorlódás, torokviszketés, száraz köhögés, sípoló légzés (ritkán asztma)

<strong>Pollen mérete:</strong> 30–40 µm – elsősorban a felső légutakat irritálja.

<strong>Keresztreakciók:</strong>
• Búza, árpa, rozs (főleg nyers) – enyhe OAS
• Paradicsomtól enyhe orális reakció
• Füvekkel az összes fűfaj egymással keresztreaktív

<strong>Mikor a legerősebb?</strong> Hajnalban (4–8 óra) és kora reggel. Kaszálás után közvetlen közelben nagyon magas.

<strong>Diagnosztikai jelek:</strong>
• Legelőn, kaszáló közelében azonnal erős tünetek
• Kaszálás szaga + tüsszögés = pázsitfű`
    },

    /* ══════════════════════════════════════════
       POLLEN TÍPUSOK – Gyomok (júl–okt)
    ══════════════════════════════════════════ */
    {
      id: 'ambrosia',
      title: 'Parlagfű (Ambrosia artemisiifolia) ⭐',
      icon: '🌿',
      tag: 'Pollen',
      tagColor: '#FF6B35',
      wikiImg: 'Ambrosia_artemisiifolia.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Parlagf%C5%B1',
      content: `A parlagfű Magyarország legjelentősebb allergén növénye – az ország érintett lakóinak 20–30%-a szenved tőle. Augusztus elejétől október közepéig virágzik, csúcsideje augusztus–szeptember.

<strong>Szezon:</strong> aug.–okt. · Csúcs: aug.–szept.

<strong>Miért olyan veszélyes?</strong> Egyetlen növény napi 8–10 millió pollenszemet bocsát ki. A szemcsék rendkívül apróak (20 µm) – mélyen behatolnak a légutakba és 1-3 szemcse/m³ elég a tünetek kiváltásához.

<strong>Tünetprofil:</strong>
• Elsődleges: erős tüsszögés, bőséges orrfolyás, orrviszketés, szemviszketés, könnyezés, vörös szem
• Másodlagos: orrtorlódás, torokviszketés, köhögés, fáradtság
• Súlyos esetben: zihálás, asztmás roham, csalánkiütés

<strong>Mikor a legerősebb?</strong> Reggel 5–10 óra között a pollenkoncentráció a legmagasabb. Szeles, meleg napokon is magas. Esős napok után átmeneti csökkentés, majd visszaugrás.

<strong>Keresztreakciók (OAS):</strong>
• Dinnye, görögdinnye – közepes reakció
• Uborka, cukkini – enyhe
• Banán, kamilla tea – enyhe

<strong>Leginkább érintett területek:</strong> Dél-Alföld (Bács-Kiskun, Csongrád, Békés megye), Pécs és környéke.

<strong>Diagnosztikai jelek:</strong>
• Tünetek augusztus elején jelennek meg hirtelen
• A nyár legszárazabb, legmelegebb napjain a legrosszabb
• Szeptemberben csúcson van, míg a pázsitfű már lejárt`
    },

    {
      id: 'artemisia',
      title: 'Üröm (Artemisia vulgaris)',
      icon: '🌿',
      tag: 'Pollen',
      tagColor: '#827717',
      wikiImg: 'Artemisia_vulgaris.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Fekete_%C3%BCr%C3%B6m',
      content: `Az üröm (Artemisia vulgaris) július végétől szeptemberig virágzik – részben egybeesik a parlagfűvel, ami megnehezíti a diagnosztikát.

<strong>Szezon:</strong> júl.–szept. · Csúcs: aug.

<strong>Tünetprofil:</strong> Tüsszögés, orrfolyás, orrviszketés, szemviszketés, könnyezés, orrtorlódás. Köhögés, zihálás is előfordulhat.

<strong>Keresztreakciók:</strong>
• Zellerrel erős keresztreakció (Sellerie-Beifuß szindróma)
• Sárgarépa, paprika, petrezselyem, mango – enyhe-közepes OAS
• Parlagfűvel részleges keresztreakció

<strong>Diagnosztikai jelek:</strong>
• Ha parlagfűszezonban erős tüneteid vannak, de nincs OAS dinnyétől – üröm is szerepet játszhat
• Zellertől vagy nyers sárgarépától OAS + nyár végi tünetek erős jel`
    },

    {
      id: 'plantago',
      title: 'Útifű (Plantago lanceolata)',
      icon: '🌱',
      tag: 'Pollen',
      tagColor: '#558B2F',
      wikiImg: 'Plantago_lanceolata.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/L%C3%A1ndz%C3%A1s_%C3%BAtif%C5%B1',
      content: `Az útifű (Plantago lanceolata) május végétől szeptemberig virágzik, csúcsa júniusra–júliusra esik. Útszéleken, réteken, parkokban egyaránt megtalálható.

<strong>Szezon:</strong> máj.–szept. · Csúcs: jún.–júl.

<strong>Tünetprofil:</strong> Tüsszögés, orrfolyás, szemviszketés, köhögés. Tünetei enyhébbek, mint a főbb allergéneké. Asztmás betegeknél súlyosabb reakciót válthat ki.

<strong>Keresztreakciók:</strong>
• Dinnye, búza – enyhe keresztreakció
• Pázsitfüvekkel részleges keresztreakció

<strong>Diagnosztikai jel:</strong>
• Útszélen, parkban rövid séta után erős tünetek pázsitfű szezontól eltérő időpontban`
    },

    {
      id: 'urtica',
      title: 'Csalán (Urtica dioica)',
      icon: '🌿',
      tag: 'Pollen',
      tagColor: '#388E3C',
      wikiImg: 'Urtica_dioica.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Nagy_csal%C3%A1n',
      content: `A csalán (Urtica dioica) júniustól szeptemberig virágzik – főleg nedves helyeken, árkok mentén, kertekben. Allergénitása mérsékelt, de érzékeny egyéneknél komoly tüneteket okozhat.

<strong>Szezon:</strong> jún.–szept. · Csúcs: júl.

<strong>Tünetprofil:</strong> Orrfolyás, tüsszögés, szemviszketés. Bőrtünetek (csalánkiütés) is előfordulhatnak – de ez jellemzőbb az érintkezéses formánál, nem a pollen-expozíciónál.

<strong>Diagnosztikai jel:</strong>
• Nedves, bokorral teli területeken séta után tünetek – parlagfű szezontól különálló időpontban`
    },

    {
      id: 'rumex',
      title: 'Sóska / Lórom (Rumex)',
      icon: '🌱',
      tag: 'Pollen',
      tagColor: '#558B2F',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/L%C3%B3rom',
      content: `A sóska és a lórom fajok (Rumex acetosa, R. crispus) tavaszi-nyári pollen-forrást jelentenek. Magyarország rétjein, mezsgyéin, útszéleken közönséges növények.

<strong>Szezon:</strong> máj.–aug. · Csúcs: június-július

<strong>Allergenitás:</strong> Közepes – a pázsitfűpollen-allergiásoknál sokszor egyidejűleg fennáll Rumex-érzékenység is.

<strong>Tünetprofil:</strong>
• Orrfolyás, tüsszögés, szemviszketés
• Pázsitfű-allergiával nehéz elkülöníteni (egyidejű virágzás)

<strong>Keresztreakciók:</strong>
• Pázsitfűfélékkel részleges keresztreakció lehetséges

<strong>Diagnosztikai jelek:</strong>
• Réten, kaszálón töltött idő után erősebb tünetek
• Pázsitfű-allergiával párhuzamosan fennálló érzékenység`
    },

    {
      id: 'chenopodium',
      title: 'Libatop (Chenopodium)',
      icon: '🌿',
      tag: 'Pollen',
      tagColor: '#689F38',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Libatop',
      content: `A libatop (Chenopodium album) és rokon fajai (Atriplex, szikes területek növényei) nyár végi – őszi allergiát okoznak. Magyarországon főleg az Alföldön fordul elő nagy mennyiségben.

<strong>Szezon:</strong> júl.–szept. · Csúcs: augusztus-szeptember

<strong>Allergenitás:</strong> Közepes – főleg az ürömmel és parlagfűvel egyidejűleg virágzik, amelyek erősebbek.

<strong>Tünetprofil:</strong>
• Tüsszögés, orrfolyás, köhögés
• Az üröm- és parlagfű-allergiától nehéz elkülöníteni

<strong>Keresztreakciók:</strong>
• Ürömmel (Artemisia) erős keresztreakció – közös profilin antigének
• Zeller, paprika – OAS lehetséges (az üröm-parlagfű-zeller-fűszer szindróma)

<strong>Diagnosztikai jelek:</strong>
• Alföldön, szikes területeken, kertekben töltött nyár végi idő után
• Parlagfű-szezonban egyidejűleg fennálló tünetek, amelyek ürömre/libatopra is ráfoghatók`
    },

    /* ══════════════════════════════════════════
       ÁLTALÁNOS ALLERGÉNEK
    ══════════════════════════════════════════ */
    {
      id: 'dust_mite',
      title: 'Poratkák (Dermatophagoides)',
      icon: '🛏️',
      tag: 'Allergén',
      tagColor: '#5D4037',
      wikiImg: 'House_dust_mite.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Poratka',
      content: `A poratkák (Dermatophagoides pteronyssinus / farinae) egész éves allergiát okoznak – nincs szezonalitásuk. Ágyneműkben, párnákban, szőnyegeken, plüssjátékokban élnek.

<strong>Szezon:</strong> Egész év – csúcs: ősz-tél (zárt, párás lakások)

<strong>Tünetprofil:</strong>
• Elsődleges: orrtorlódás, orrfolyás, tüsszögés, szemviszketés, köhögés, zihálás
• Másodlagos: ekcéma, bőrviszketés, fáradtság

<strong>Jellemző:</strong> Tünetek reggel ébredésre a legerősebbek (az éjszakai expozíció után). Ágyban-számlapon fekve rosszabb.

<strong>Csökkentési tippek:</strong>
• Poratka-ellenes ágyneműhuzatok
• 60°C-on mosni az ágyneműt hetente
• Szőnyegek eltávolítása a hálóból
• Párásság 50% alatt tartása
• HEPA szűrős porszívó

<strong>Diagnosztikai jel:</strong>
• Reggeli tünetek jók napközben – de bent maradva rosszak
• Nyáron (alacsonyabb páratartalom) kissé jobb, télen rosszabb`
    },

    {
      id: 'cat_dog',
      title: 'Macska és kutya allergia',
      icon: '🐱',
      tag: 'Allergén',
      tagColor: '#FF9800',
      wikiImg: 'Cat_poster_1.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Macska',
      content: `A macska- és kutyaallergia nem a szőrtől, hanem az állatok nyálától, bőrsejtektől (danderekből) és vizeletkiválasztástól ered. Egész éves tüneteket okoz.

<strong>Macska (Felis catus) – Fel d 1:</strong>
• Rendkívül apró és stabil allergén – hónapokig lebeg a levegőben
• Még azokban a lakásokban is jelen van, ahol korábban élt macska
• Tünetek: erős szemviszketés, könnyezés, vörös szem, tüsszögés, orrfolyás, zihálás

<strong>Kutya (Canis lupus familiaris) – Can f 1:</strong>
• Fajtától függő mértékű allergénkibocsátás
• Tünetek: tüsszögés, orrfolyás, szemviszketés, köhögés

<strong>Diagnosztikai jelek:</strong>
• Tünetek cicás/kutyás ismerősnél vagy állatmenhelyen azonnali megjelenése
• Barátok lakásánál rosszabb közérzet (ahol macska él)
• Tünetek csökkentése macska nélküli szobában`
    },

    {
      id: 'mold',
      title: 'Penészgombák (Alternaria, Cladosporium)',
      icon: '🍄',
      tag: 'Allergén',
      tagColor: '#6D4C41',
      wikiImg: 'Alternaria_sp._2.jpg',
      wikiLinkHu: 'https://hu.wikipedia.org/wiki/Alternaria_(gomba)',
      content: `A légköri penészgombák spórái tavasztól őszig jelen vannak a levegőben – csúcsuk júliustól szeptemberig tart. Párás, esős időszakokban különösen magas a spóraszám.

<strong>Fő fajok:</strong> Alternaria alternata, Cladosporium herbarum – ezek a leggyakoribb légköri allergén penészek Magyarországon.

<strong>Szezon:</strong> ápr.–okt. · Csúcs: júl.–szept.

<strong>Tünetprofil:</strong> Tüsszögés, orrfolyás, szemviszketés, köhögés; asztmás betegeknél súlyosabb légzési tünetek.

<strong>Mikor a legerősebb?</strong> Aratás (gabona)után, esős időszakokban, párás avarlevelek közelében, komposzt/falomb közelében.

<strong>Diagnosztikai jelek:</strong>
• Őszi lombhullás, aratás idején hirtelen tünetromlás
• Nedves pincében/garázsban tartózkodáskor rosszabb közérzet
• Lakásban penészerjedés esetén egész éves tünetek`
    },

    /* ══════════════════════════════════════════
       KERESZTREAKTIVITÁS & OAS
    ══════════════════════════════════════════ */
    {
      id: 'cross_reactivity',
      title: 'Keresztreaktivitás & Orális allergiás szindróma',
      icon: '🍎',
      tag: 'Infó',
      tagColor: '#7B1FA2',
      content: `A keresztreaktivitás akkor lép fel, ha egy allergén fehérje hasonlít egy másik allergén fehérjéjéhez. Az immunrendszer mindkettőre reagál – így bizonyos pollenkre érzékeny emberek egyes nyersételektől is tüneteket kapnak.

<strong>Ez az „Orális allergiás szindróma" (OAS):</strong>
Ajkak, száj, torok viszketése, bizsergése, enyhe duzzanata röviddel az étel elfogyasztása után. Általában nem súlyos – de zavaró.

<strong>4 fő keresztreakciós szindróma:</strong>

🌳 <strong>Nyírfa-szindróma (Bet v 1 antigén):</strong>
Alma, körte, cseresznye, őszibarack, szilva, szeder, kivi, eper, mandula (nyers) · Sárgarépa, zeller, pasztinák · Mogyoró, dió
→ Főzés/sütés inaktiválja: főtt alma, kompót általában tolerálható!

🌾 <strong>Pázsitfű-szindróma:</strong>
Búza, árpa (nyers tészta, sörből is) · Paradicsom · Mogyoró · Dinnye (enyhe)
→ Főtt gabona általában jól tolerálható.

🌿 <strong>Parlagfű-szindróma (Art v 1 / profilin):</strong>
Dinnye, görögdinnye, uborka, cukkini · Banán · Kamilla tea (erős keresztreakció!) · Méz (parlagfűpollen-tartalom miatt)

🌿 <strong>Üröm–Zeller szindróma:</strong>
Zeller (nyers – erős!), sárgarépa, petrezselyem, paprika · Fűszerek: koriander, kömény, ánizs · Mangó

<strong>Fontos különbség:</strong>
OAS ≠ valódi anafilaxia. Ha torokszorítást, nehézlégzést, arcödémát, szívdobogást tapasztalsz – hívj mentőt!`
    },

    /* ══════════════════════════════════════════
       POLLENNAPTÁR
    ══════════════════════════════════════════ */
    {
      id: 'pollen_season',
      title: 'Magyar pollenszezon naptár',
      icon: '📅',
      tag: 'Infó',
      tagColor: '#00695C',
      content: `Magyarország pollenszezonjai hónapok szerint:

<strong>Január–február:</strong>
🌰 Mogyoró (jan. végétől, enyhe télen) · 🌲 Éger (feb.) · 🌲 Ciprus/tiszafa

<strong>Február–március:</strong>
🌰 Mogyoró (csúcs: feb.) · 🌲 Éger (csúcs: feb.–már.) · 🌳 Nyírfa (kezdet: már. vége)

<strong>Március–április:</strong>
🌳 Nyírfa (csúcs: ápr. eleje) · 🌿 Kőris (már.–ápr.) · 🌳 Nyár (márc.–ápr.) · 🌳 Platán (ápr.) · 🌳 Juhar (ápr.)

<strong>Április–május:</strong>
🌳 Nyírfa (lefutás) · 🌳 Tölgy (csúcs: ápr.–máj.) · 🌳 Hárs (máj.) · 🌰 Dió (ápr.–máj.)

<strong>Május–július:</strong>
🌾 Pázsitfüvek ⬅ CSÚCS: jún. · 🌱 Útifű (jún.–júl.) · 🌿 Csalán (jún.–szept.) · 🍄 Alternaria spóra

<strong>Július–október:</strong>
🌿 Üröm (júl.–szept.) · 🌿 Parlagfű ⬅ CSÚCS: aug.–szept. · 🍃 Libatop (aug.–szept.) · 🌿 Lórom (jún.–aug.)

<strong>Időjárási módosítók:</strong>
• Meleg, korai tavasz → szezon 2–3 héttel korábban indul
• Hideg, késő tél → szezon késhet
• Szeles, száraz nap → pollenszint magas
• Esős nap → pollenszint alacsony (de utána robbanásszerű felszabadulás)
• Hajnal–délelőtt → legtöbb allergen, délután–este → kevesebb`
    },

    /* ══════════════════════════════════════════
       TÜNETEK
    ══════════════════════════════════════════ */
    {
      id: 'rhinitis',
      title: 'Allergiás nátha (rhinitis allergica)',
      icon: '🤧',
      tag: 'Tünet',
      tagColor: '#1565C0',
      content: `Az allergiás nátha a leggyakoribb allergiás tünet: az érintett légúti nyálkahártya pollenre, poratkára vagy állati szőrre adott gyulladásos reakciója.

<strong>Tünetek:</strong>
• Vizes, átlátszó orrfolyás (nem zavaros – az fertőzéses eredetre utal)
• Sorozatos tüsszögés (reggel erősebb, napközben enyhülhet)
• Orrtorlódás – orrnyálkahártya duzzanat
• Orrviszketés (belső, amely tüsszögésre késztet)
• Utócsepegés: váladék a torokba folyik, enyhe köhögést okoz
• Szaglás csökkenése
• Arcüregi nyomás/fejfájás

<strong>Otthoni enyhítés:</strong>
• 🧂 Sóoldatos orrspray vagy öblítőkanna (neti pot) naponta 1–2×
• 🌡️ Hideg borogatás homlokra
• 🚿 Hazaérés után azonnal mosd meg az arcod és a hajad
• 🪟 Zárt ablak pollencsúcs idején (reggel 5–10 óra)
• 💧 Napi 1,5–2 liter folyadék

<strong>Orvosi kezelés jelzései:</strong>
Ha a tünetek 2 hétnél tovább fennállnak, alvásra is hatással vannak, vagy gyógyszer nélkül nem tolerálhatók – fordulj allergológushoz.`
    },

    {
      id: 'conjunctivitis',
      title: 'Allergiás kötőhártya-gyulladás',
      icon: '👁️',
      tag: 'Tünet',
      tagColor: '#1565C0',
      content: `Az allergiás kötőhártya-gyulladás (allergic conjunctivitis) a pollenek közvetlen szem-kontaktusából ered. Szinte mindig kísérője az allergiás náthának.

<strong>Tünetek:</strong>
• Intenzív szemviszketés (ne dörzsöld! – rontja a gyulladást)
• Fokozott könnyezés
• Szemkipirosodás (kötőhártya-gyulladás)
• Szemhéjduzzanat – különösen reggel
• Égő, csípő érzés
• Fényérzékenység (erős esetben)

<strong>Enyhítés:</strong>
• 🧊 Hideg vizes borogatás 5–10 percig csukott szemre
• 🕶️ Kültéren zárt napszemüveg – szél ellen is véd
• 💧 Hazaéréskor szemöblítés tiszta langyos vízzel
• 🚿 Tiszta kézzel érintsd csak a szemed

<strong>Gyógyszeres lehetőségek (vény nélkül):</strong>
Antihisztamin szemcseppek, mesterséges könny. Súlyos esetben allergológus által felírt kortikoszteroid csepp.`
    },

    {
      id: 'asthma_allergy',
      title: 'Allergén-indukált asztma',
      icon: '😮‍💨',
      tag: 'Tünet',
      tagColor: '#C62828',
      content: `A pollenszezoni asztma az allergiás légzési reakció súlyosabb formája. Magyarországon főleg a parlagfű okozza (aug–szept), de a pázsitfűfélék és a nyírfa is kiválthatják.

<strong>⚠️ FIGYELMEZTETŐ JELEK – orvoshoz menj:</strong>
• Éjszakai köhögés – kialvást akadályoz
• Terhelésre megjelenő légszomj
• Sípoló, zihálós légzés
• Mellkasi szorítás, nyomás
• Asztmás roham (sürgős orvosi ellátás!)

<strong>Pollenszezonban asztmával:</strong>
• Mindig tartsd magadnál az orvos által felírt inhalátort
• Pollencsúcs napokon kerüld a hosszú kültéri tartózkodást
• Beltéri tevékenységeket reggel 5–10 előttre és esti időre időzítsd

<strong>⚠️ Fontos:</strong> Az asztmás tünetek otthoni kezeléssel nem megoldhatók tartósan – allergológus/pulmonológus szükséges a megfelelő kezelési terv kialakításához.`
    },

    /* ══════════════════════════════════════════
       TIPPEK & KÖRNYEZETI MÓDOSÍTÓK
    ══════════════════════════════════════════ */
    {
      id: 'env_modifiers',
      title: 'Mikor a legtöbb és legkevesebb a pollen?',
      icon: '🌤️',
      tag: 'Tipp',
      tagColor: '#E65100',
      content: `A pollenkoncentráció napszaktól, időjárástól és helyszíntől függően nagyon eltérhet. Ezek ismeretével sokat javíthatsz a mindennapokon.

<strong>⬆️ Pollenszint magas, amikor:</strong>
• Reggel 5–10 óra között (a legtöbb pollen ekkor szabadul fel)
• Meleg, száraz, napos napokon
• Szeles időben – szél távolabb is viszi a pollent
• Csapadék után az első napon (visszapattanó hatás)
• Kaszálás/aratás közelében
• Városközpontban (épületek visszatartják)

<strong>⬇️ Pollenszint alacsony, amikor:</strong>
• Eső közben és közvetlenül utána
• Felhős, hűvös napokon
• Délután 14–18 óra között (relatív minimum)
• Este és éjjel (de ez pollenfajtától függ)
• Tengerpart közelében
• Nagy magasságban (hegyekben)

<strong>Praktikus tanácsok:</strong>
• 🏃 Sportolj délután – pollenszint kisebb
• 🚗 Zárt ablakkal vezess pollenszezonnban, légkondicionáló szűrőt cseréltess
• 🪟 Éjszakára ne nyisd az ablakot pollenszezonban
• 🚿 Este zuhanyzás: eltávolítod a bőrre/hajra rakódott pollent`
    },

    {
      id: 'home_remedies',
      title: 'Otthoni tünetek enyhítése',
      icon: '🏠',
      tag: 'Tipp',
      tagColor: '#2E7D32',
      content: `Az allergiás tünetek otthoni, gyógyszer nélküli kezelési lehetőségei:

<strong>Légúti tünetek:</strong>
• 🧂 Sóoldatos orrspray vagy neti pot – eltávolítja a pollent és megvédi a nyálkahártyát
• ♨️ Gőzbelégzés (kamilla, eukaliptusz) – 5–10 perc, légutakat megnyitja
• 🍯 Meleg méz-citromos víz – megnyugtatja a toroknyálkahártyát
• 🫖 Kamilla- vagy hársfatea (de: kamilla keresztreakciót okozhat parlagfű-allergiásoknál!)

<strong>Szemtünetek:</strong>
• 🧊 Hideg borogatás csukott szemre 5–10 percig
• 💧 Szemöblítés tiszta vízzel hazaérés után
• NE dörzsöld! – csak fokozza a gyulladást

<strong>Bőrtünetek:</strong>
• 🛁 Langyos fürdő (NEM forró – az ront)
• 🧴 Illatmentes, hypoallergén hidratáló krém

<strong>Általános megelőzés:</strong>
• 🚿 Hazaéréskor zuhanyzás, hajmosás
• 🪟 Pollencsúcs idején (reggel 5–10) zárd az ablakot
• 🏠 HEPA szűrős légtisztító a hálóban – éjszakai védelemre
• 💧 Napi 1,5–2 liter folyadék – hígítja a váladékot
• 🌿 Ha kertész vagy: pollencsúcs után kertészkedj, vagy maszkban`
    },

    {
      id: 'diagnostic_rules',
      title: 'Hogyan azonosítsd az allergénedet?',
      icon: '🔬',
      tag: 'Infó',
      tagColor: '#1565C0',
      content: `Az allergén azonosítása tünetnapló + pollenjelentés + keresztreakció-elemzés alapján lehetséges. Néhány szabály, ami segít:

<strong>Dátum alapján:</strong>
• Jan–feb tünetek → mogyoró, éger
• Már–ápr tünetek → nyírfa, kőris
• Máj–jún tünetek → pázsitfüvek
• Júl–szept tünetek → parlagfű, üröm
• Egész évben → poratka, macska/kutya, penész

<strong>Tünetprofil alapján:</strong>
• Erős szemtünet (viszketés, könnyezés) + tüsszögés → nyírfa, parlagfű, pázsitfű
• Főleg orrtorlódás reggel → poratka
• Asztmás komponens + aug–szept → parlagfű
• Éjszaka rosszabb, hétvégén jobb → munkahelyi allergén

<strong>Keresztreakció alapján:</strong>
• Nyers alma/sárgarépa OAS + tavaszi tünetek → nyírfa
• Dinnye OAS + nyár végi tünetek → parlagfű
• Zeller OAS + nyár végi tünetek → üröm
• Nyers mogyoró OAS + kora tavaszi tünetek → mogyoró/éger

<strong>Biztos diagnózishoz:</strong>
Bőr prick teszt vagy ISAC vérvizsgálat allergológusnál. Az alkalmazás segíthet az orvosi konzultáció előkészítésében – a tünetnapló adatok bemutatásával.`
    },
  ],

  async render() {
    return `
    <div class="page" id="page-knowledge">
      <div class="section-title mb-3">Allergia Tudástár</div>
      <p style="font-size:13px;color:var(--text-3);margin-bottom:16px;line-height:1.6">
        Kereshető ismerettár allergénekről, tünetekről és otthoni megoldásokról.
      </p>

      <!-- Keresőmező -->
      <div style="position:relative;margin-bottom:16px">
        <input type="text" class="form-control" id="knowledge-search"
          placeholder="🔍 Keresés... (pl. nyírfa, tüsszögés, dinnye)"
          style="padding-left:12px;font-size:14px">
      </div>

      <!-- Szűrő chipek -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px" id="knowledge-filters">
        <button class="chip chip-default knowledge-filter active" data-filter="all">Mind</button>
        <button class="chip knowledge-filter" data-filter="Pollen"   style="background:#FF6B3520;color:#FF6B35">🌿 Pollen</button>
        <button class="chip knowledge-filter" data-filter="Allergén" style="background:#FF980020;color:#E65100">🐾 Allergén</button>
        <button class="chip knowledge-filter" data-filter="Tünet"    style="background:#1565C020;color:#1565C0">🤧 Tünetek</button>
        <button class="chip knowledge-filter" data-filter="Infó"     style="background:#7B1FA220;color:#7B1FA2">ℹ️ Infó</button>
        <button class="chip knowledge-filter" data-filter="Tipp"     style="background:#2E7D3220;color:#2E7D32">💡 Tippek</button>
      </div>

      <!-- Cikkek -->
      <div id="knowledge-list">
        ${this.ARTICLES.map(a => this._renderCard(a)).join('')}
      </div>
      <div style="height:16px"></div>
    </div>`;
  },

  _renderCard(article) {
    const imgHtml = article.wikiImg ? `
      <div style="margin:10px 0 6px;text-align:center">
        <img src="https://commons.wikimedia.org/wiki/Special:FilePath/${article.wikiImg}?width=320"
             alt="${article.title}"
             style="max-width:100%;border-radius:var(--r-md);max-height:180px;object-fit:cover;display:block;margin:0 auto"
             onerror="this.style.display='none'">
      </div>` : '';

    const wikiHtml = article.wikiLinkHu ? `
      <a href="${article.wikiLinkHu}" target="_blank" rel="noopener"
         style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--info);margin-top:6px;text-decoration:none;opacity:.85">
        📖 Részletes leírás – Wikipédia
      </a>` : '';

    return `
    <div class="knowledge-card" data-kid="${article.id}" data-tag="${article.tag}">
      <div class="knowledge-card-header" data-expand="${article.id}">
        <span style="font-size:22px;line-height:1">${article.icon}</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:var(--text)">${article.title}</div>
          <span class="knowledge-tag" style="background:${article.tagColor}20;color:${article.tagColor};margin-top:3px">${article.tag}</span>
        </div>
        <svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18" style="color:var(--text-3);flex-shrink:0;transition:transform .2s">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="knowledge-card-body" style="display:none">
        ${imgHtml}
        ${article.content.split('\n\n').map(p =>
          `<p style="margin-bottom:10px">${p.trim().replace(/\n/g,'<br>')}</p>`
        ).join('')}
        ${wikiHtml}
      </div>
    </div>`;
  },

  mount() {
    /* Expand/collapse */
    document.querySelectorAll('[data-expand]').forEach(header => {
      header.addEventListener('click', () => {
        const id   = header.dataset.expand;
        const card = document.querySelector(`[data-kid="${id}"]`);
        const body = card?.querySelector('.knowledge-card-body');
        const icon = card?.querySelector('.expand-icon');
        if (!body) return;
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : '';
        if (icon) icon.style.transform = open ? '' : 'rotate(180deg)';
      });
    });

    /* Keresés */
    document.getElementById('knowledge-search')?.addEventListener('input', e => {
      this._filterCards(e.target.value, this._activeFilter);
    });

    /* Szűrők */
    this._activeFilter = 'all';
    document.querySelectorAll('.knowledge-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.knowledge-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._activeFilter = btn.dataset.filter;
        this._filterCards(document.getElementById('knowledge-search')?.value || '', this._activeFilter);
      });
    });
  },

  _activeFilter: 'all',

  _filterCards(query, filter) {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.knowledge-card').forEach(card => {
      const kid  = card.dataset.kid;
      const tag  = card.dataset.tag;
      const art  = this.ARTICLES.find(a => a.id === kid);
      if (!art) return;

      const matchFilter = filter === 'all' || tag === filter;
      const matchQuery  = !q ||
        art.title.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        art.tag.toLowerCase().includes(q);

      card.style.display = matchFilter && matchQuery ? '' : 'none';
    });
  },
};
