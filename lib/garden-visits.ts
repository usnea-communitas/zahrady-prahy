/**
 * Practical visiting information for the illustrated atlas.
 *
 * These notes deliberately distinguish a garden's public access, the opening
 * hours of a wider site, and membership/volunteer times. `not-found` means we
 * checked the listed source but it did not publish a regular schedule; it does
 * not mean that the place is closed.
 */
export type VisitFactState = 'published' | 'not-found' | 'not-checked';

export type VisitSource = {
  url: string;
  label: string;
};

export type VisitFact = {
  text: string;
  state: VisitFactState;
  sources: VisitSource[];
  checkedAt: string;
  appliesTo?: string;
};

export type GardenVisit = {
  access: VisitFact;
  hours: VisitFact;
  entrance?: VisitFact;
  participation?: VisitFact;
};

export const GARDEN_VISIT_CHECKED_AT = '6. 9. 2026';

function fact(
  text: string,
  state: VisitFactState,
  sources: VisitSource[],
  appliesTo?: string,
): VisitFact {
  return {
    text,
    state,
    sources,
    checkedAt: GARDEN_VISIT_CHECKED_AT,
    ...(appliesTo ? { appliesTo } : {}),
  };
}

function source(url: string, label: string): VisitSource {
  return { url, label };
}

const metroFarm = source(
  'https://www.metrofarm.cz/metrofarm/',
  'MetroFarm · návštěva',
);
const metroFarmField = source(
  'https://metrofarm.cz/metrofarm/komunitni-policko.html',
  'MetroFarm · komunitní políčko',
);
const pralesGarden = source(
  'https://lesypraha.cz/vzdelavani/ekocentrum-prales/komunitni-zahrada/',
  'Lesy hl. m. Prahy · komunitní zahrada Prales',
);
const pralesVisit = source(
  'https://lesypraha.cz/vzdelavani/ekocentrum-prales/kudy-a-kdy-do-pralesa/',
  'Lesy hl. m. Prahy · kudy a kdy do Pralesa',
);
const kotlaskaContact = source(
  'https://www.kckotlaska.cz/kontakt/',
  'KC Kotlaska · kontakt',
);
const kotlaskaRules = source(
  'https://www.kckotlaska.cz/wp-content/uploads/2026/04/provozni_rad.pdf',
  'KC Kotlaska · provozní řád',
);
const trojaContact = source(
  'https://www.komunitnizahrada.cz/kontakt/',
  'Komunitní zahrada Troja · kontakt',
);
const mecislavka = source(
  'https://www.vnitrobloky.cz/mecislavka',
  'Bieno · Vnitroblok Mečislavka',
);
const vidimova = source(
  'https://www.kokoza.cz/projekty/komunitni-zahrada-vidimova/',
  'Kokoza · komunitní zahrada Vidimova',
);
const prokopkaRules = source(
  'https://www.zahradaprokopka.cz/provozni-rad/',
  'Zahrada Prokopka · provozní řád',
);
const velkyHaj = source(
  'https://tucnak.praha4.cz/06-2026/pestujte-ovoce-a-zeleninu-v-nove-komunitni-zahrade',
  'Tučňák Praha 4 · Velký háj',
);
const naPlani = source(
  'https://www.praha5.cz/praha-5-otevrela-novy-park-na-plani/',
  'MČ Praha 5 · park Na Pláni',
);
const naPlaniStudy = source(
  'https://naplani.praha5.cz/files/Na_Plani_Studie_Break_Point_sro.pdf',
  'Na Pláni · studie lokality',
);
const libozaGuide = source(
  'https://nesedimsousedim.cz/wp-content/uploads/2025/05/Sousedsky-pruvodce_Praha6-online-final.pdf',
  'Sousedský průvodce Prahou 6 · Libóza',
);
const prazeleninaRules = source(
  'https://prazelenina.cz/pages/pravidla/',
  'Prazelenina · pravidla',
);
const prazeleninaHome = source(
  'https://www.prazelenina.cz/',
  'Prazelenina · sezona',
);
const zizkovskaHome = source(
  'https://www.zizkovskazahradka.cz/',
  'Žižkovská zahrádka · domů',
);
const naPolskePublic = source(
  'https://prazsky-magazin.cz/zpravy-prazskeho-magazinu/zpravy-z-prahy/deti-z-cimic-si-samy-stavi-skolu/',
  'Pražský magazín · Na Polské',
);
const naPolskeAddress = source(
  'https://www.3udoli.cz/komunitni-zahrada/',
  '3 údolí · komunitní zahrada Na Polské',
);

export const gardenVisits = {
  metrofarm: {
    access: fact('Nový člen, návštěvník i dobrovolník je vítán.', 'published', [
      metroFarm,
    ]),
    hours: fact(
      'Pravidelnou otevírací dobu jsme na uvedeném webu nenašli.',
      'not-found',
      [metroFarm],
    ),
    entrance: fact('Císařský ostrov, Praha 7.', 'published', [metroFarmField]),
    participation: fact(
      'Komunitní políčko: ne + út 16:00–19:00 (duben–říjen); ne 14:00–16:00 (listopad–březen).',
      'published',
      [metroFarmField],
      'komunitní políčko a pracovní setkání',
    ),
  },
  prales: {
    access: fact(
      'Horní část areálu Prales je přístupná nepřetržitě; komunitní zahrada je součástí areálu.',
      'published',
      [pralesVisit, pralesGarden],
    ),
    hours: fact(
      'Dolní oplocená část areálu: listopad–březen po–pá 7:00–15:30; duben–říjen po–pá 7:00–17:00, so 9:00–17:00, ne zavřeno. Ve všední státní svátky je zavřeno.',
      'published',
      [pralesVisit],
      'spodní oplocená část ekocentra, ne samostatně komunitní zahrada',
    ),
    entrance: fact('Mladoboleslavská 953, Praha 19.', 'published', [
      pralesVisit,
    ]),
    participation: fact(
      'Stránka zahrady uváděla k 10. 2. 2026 plnou kapacitu sezony.',
      'published',
      [pralesGarden],
      'pěstitelská sezona 2026',
    ),
  },
  kotlaska: {
    access: fact(
      'Zahrada je veřejně přístupná v uvedené otevírací době, pokud není uzavřena pro rezervaci.',
      'published',
      [kotlaskaRules],
    ),
    hours: fact(
      'Út 10:00–18:00 a čt 10:00–18:00; ostatní dny zavřeno.',
      'published',
      [kotlaskaContact, kotlaskaRules],
    ),
    entrance: fact('Nad Kotlaskou I, Praha 8.', 'published', [kotlaskaContact]),
  },
  troja: {
    access: fact(
      'Průvodce v komunitním prostoru je k dispozici nepravidelně nebo po domluvě.',
      'published',
      [trojaContact],
    ),
    hours: fact(
      'Pravidelnou otevírací dobu jsme na uvedeném webu nenašli.',
      'not-found',
      [trojaContact],
    ),
    entrance: fact('Na Farkách ev. č. 92, Praha–Troja.', 'published', [
      trojaContact,
    ]),
  },
  mecislavka: {
    access: fact(
      'Projekt vnitrobloku popisuje místo jako přístupný plácek s komunitní zahradou.',
      'published',
      [mecislavka],
    ),
    hours: fact(
      'Pravidelnou otevírací dobu jsme na uvedeném webu nenašli.',
      'not-found',
      [mecislavka],
    ),
  },
  vidimova: {
    access: fact(
      'Kokoza uvádí pravidelné návštěvy veřejnosti a týdenní otevírací dobu.',
      'published',
      [vidimova],
    ),
    hours: fact(
      'Přesný týdenní rozvrh jsme na aktuální stránce nenašli; starší články proto nepřebíráme jako platné hodiny.',
      'not-found',
      [vidimova],
    ),
    participation: fact(
      'Konkrétní návštěvní termín ověřte u Kokozy podle aktuálního týdenního programu.',
      'published',
      [vidimova],
    ),
  },
  prokopka: {
    access: fact(
      'Návštěvníci se řídí provozním řádem; víkendové akce se koordinují s provozovatelem.',
      'published',
      [prokopkaRules],
    ),
    hours: fact(
      'Pravidelnou otevírací dobu jsme na uvedeném webu nenašli.',
      'not-found',
      [prokopkaRules],
    ),
    participation: fact(
      'Provozní řád stanovuje klidový režim 22:00–6:00 a další omezení u školy.',
      'published',
      [prokopkaRules],
    ),
  },
  'velky-haj': {
    access: fact(
      'Nová zahrada byla otevřena zájemcům; samostatný režim návštěvy pěstitelské části zdroj neuvádí.',
      'published',
      [velkyHaj],
    ),
    hours: fact(
      'Pravidelnou otevírací dobu zahrady jsme na uvedeném zdroji nenašli.',
      'not-found',
      [velkyHaj],
    ),
    entrance: fact(
      'Park leží na okraji lesa mezi Novodvorskou a zámkem Krč; přesný vstup zahrady zatím není ověřený.',
      'published',
      [velkyHaj],
      'orientační popis lokality',
    ),
  },
  liboza: {
    access: fact(
      'Zdroj ji popisuje jako komunitní prostor pro zahradničení, setkávání a kulturní akce; návštěvu doporučujeme předem domluvit.',
      'published',
      [libozaGuide],
    ),
    hours: fact(
      'Pravidelnou otevírací dobu jsme na uvedeném zdroji nenašli.',
      'not-found',
      [libozaGuide],
    ),
    entrance: fact('Za domem Libocká 39, Praha 6–Liboc.', 'published', [
      libozaGuide,
    ]),
  },
  prazelenina: {
    access: fact(
      'Registrovaní členové mohou do zahrady kdykoli; vstupní kód dostanou po registraci.',
      'published',
      [prazeleninaRules],
    ),
    hours: fact(
      'Bar/kavárna: út–pá a ne 17:00–21:00; po a so zavřeno. Tento rozvrh není otevírací dobou samotné zahrady.',
      'published',
      [prazeleninaRules],
      'bar a kavárna',
    ),
    participation: fact(
      'Sezona 2026 je uvedena jako duben–říjen; členství a záhonek se řeší registrací.',
      'published',
      [prazeleninaHome, prazeleninaRules],
    ),
  },
  'na-plani': {
    access: fact(
      'Park Na Pláni je veřejný park s komunitní zahradou a zázemím pro veřejnost; samostatný režim pěstitelské části zdroj neuvádí.',
      'published',
      [naPlani],
    ),
    hours: fact(
      'Pravidelnou otevírací dobu parku ani komunitní zahrady jsme na stránkách MČ Praha 5 nenašli.',
      'not-found',
      [naPlani],
    ),
    entrance: fact(
      'Park je mezi ulicemi Na Pláni a K Vodojemu; komunitní zahrada je v západní části parku.',
      'published',
      [naPlani, naPlaniStudy],
      'orientační popis lokality',
    ),
  },
  'zizkovska-zahradka': {
    access: fact(
      'Členové mají neomezený vstup; pro návštěvu, zapojení nebo veřejnou akci doporučujeme napsat provozovatelům.',
      'published',
      [zizkovskaHome],
    ),
    hours: fact(
      'Pravidelnou otevírací dobu pro veřejnost jsme na oficiálním webu nenašli.',
      'not-found',
      [zizkovskaHome],
    ),
    entrance: fact(
      'Na začátku Malešické ulice, mezi Parukářkou a Kapslovnou.',
      'published',
      [zizkovskaHome],
    ),
    participation: fact(
      'Možné je členství se záhonkem i běžné členství bez záhonku; dostupnost provozovatelé sdělí e-mailem.',
      'published',
      [zizkovskaHome],
    ),
  },
  'na-polske': {
    access: fact(
      'Magická zahrada je podle aktuálního článku otevřena široké veřejnosti.',
      'published',
      [naPolskePublic],
    ),
    hours: fact(
      'Pravidelnou otevírací dobu jsme na uvedených zdrojích nenašli.',
      'not-found',
      [naPolskePublic, naPolskeAddress],
    ),
    entrance: fact('Na Průhonu, naproti domu č. 46, Praha 8.', 'published', [
      naPolskeAddress,
    ]),
  },
} satisfies Record<string, GardenVisit>;

export type GardenVisitId = keyof typeof gardenVisits;
