/**
 * Practical visiting information for the illustrated atlas.
 *
 * These notes deliberately distinguish a garden's public access, the opening
 * hours of a wider site, and membership/volunteer times. `not-found` means we
 * checked the listed source but it did not publish a regular schedule; it does
 * not mean that the place is closed.
 *
 * Every fact is written in both languages. The English text must say exactly
 * what the Czech text says: where the Czech admits a gap, the English admits
 * the same gap. Never fill a gap with a guess.
 *
 * To correct a fact, change the text in both languages, keep (or add) the
 * source that supports it and update `GARDEN_VISIT_CHECKED_AT` only when you
 * have re-checked every source.
 */
import type { Localized } from './i18n.ts';

export type VisitFactState = 'published' | 'not-found' | 'not-checked';

export type VisitSource = {
  url: string;
  label: Localized;
};

export type VisitFact = {
  text: Localized;
  state: VisitFactState;
  sources: VisitSource[];
  /** ISO date (YYYY-MM-DD) on which the sources were last checked. */
  checkedAt: string;
  appliesTo?: Localized;
};

export type GardenVisit = {
  access: VisitFact;
  hours: VisitFact;
  entrance?: VisitFact;
  participation?: VisitFact;
};

/** The day all listed sources were last checked (6 September 2026). */
export const GARDEN_VISIT_CHECKED_AT = '2026-09-06';

function fact(
  text: Localized,
  state: VisitFactState,
  sources: VisitSource[],
  appliesTo?: Localized,
): VisitFact {
  return {
    text,
    state,
    sources,
    checkedAt: GARDEN_VISIT_CHECKED_AT,
    ...(appliesTo ? { appliesTo } : {}),
  };
}

function source(url: string, label: Localized): VisitSource {
  return { url, label };
}

/** The same honest gap, worded once. */
const hoursNotFound = {
  website: {
    cs: 'Pravidelnou otevírací dobu jsme na uvedeném webu nenašli.',
    en: 'We did not find regular opening hours on the listed website.',
  },
  source: {
    cs: 'Pravidelnou otevírací dobu jsme na uvedeném zdroji nenašli.',
    en: 'We did not find regular opening hours in the listed source.',
  },
  sources: {
    cs: 'Pravidelnou otevírací dobu jsme na uvedených zdrojích nenašli.',
    en: 'We did not find regular opening hours in the listed sources.',
  },
} satisfies Record<string, Localized>;

const approximateLocation: Localized = {
  cs: 'orientační popis lokality',
  en: 'approximate description of the location',
};

const metroFarm = source('https://www.metrofarm.cz/metrofarm/', {
  cs: 'MetroFarm · návštěva',
  en: 'MetroFarm · visiting',
});
const metroFarmField = source(
  'https://metrofarm.cz/metrofarm/komunitni-policko.html',
  { cs: 'MetroFarm · komunitní políčko', en: 'MetroFarm · community field' },
);
const pralesGarden = source(
  'https://lesypraha.cz/vzdelavani/ekocentrum-prales/komunitni-zahrada/',
  {
    cs: 'Lesy hl. m. Prahy · komunitní zahrada Prales',
    en: 'Lesy hl. m. Prahy · Prales community garden',
  },
);
const pralesVisit = source(
  'https://lesypraha.cz/vzdelavani/ekocentrum-prales/kudy-a-kdy-do-pralesa/',
  {
    cs: 'Lesy hl. m. Prahy · kudy a kdy do Pralesa',
    en: 'Lesy hl. m. Prahy · how and when to get to Prales',
  },
);
const kotlaskaContact = source('https://www.kckotlaska.cz/kontakt/', {
  cs: 'KC Kotlaska · kontakt',
  en: 'KC Kotlaska · contact',
});
const kotlaskaRules = source(
  'https://www.kckotlaska.cz/wp-content/uploads/2026/04/provozni_rad.pdf',
  { cs: 'KC Kotlaska · provozní řád', en: 'KC Kotlaska · site rules' },
);
const trojaContact = source('https://www.komunitnizahrada.cz/kontakt/', {
  cs: 'Komunitní zahrada Troja · kontakt',
  en: 'Komunitní zahrada Troja · contact',
});
const mecislavka = source('https://www.vnitrobloky.cz/mecislavka', {
  cs: 'Bieno · Vnitroblok Mečislavka',
  en: 'Bieno · Vnitroblok Mečislavka',
});
const vidimova = source(
  'https://www.kokoza.cz/projekty/komunitni-zahrada-vidimova/',
  {
    cs: 'Kokoza · komunitní zahrada Vidimova',
    en: 'Kokoza · Vidimova community garden',
  },
);
const prokopkaRules = source('https://www.zahradaprokopka.cz/provozni-rad/', {
  cs: 'Zahrada Prokopka · provozní řád',
  en: 'Zahrada Prokopka · site rules',
});
const velkyHaj = source(
  'https://tucnak.praha4.cz/06-2026/pestujte-ovoce-a-zeleninu-v-nove-komunitni-zahrade',
  {
    cs: 'Tučňák Praha 4 · Velký háj',
    en: 'Tučňák, Prague 4 district magazine · Velký háj',
  },
);
const naPlani = source(
  'https://www.praha5.cz/praha-5-otevrela-novy-park-na-plani/',
  { cs: 'MČ Praha 5 · park Na Pláni', en: 'Prague 5 district · Na Pláni park' },
);
const naPlaniStudy = source(
  'https://naplani.praha5.cz/files/Na_Plani_Studie_Break_Point_sro.pdf',
  { cs: 'Na Pláni · studie lokality', en: 'Na Pláni · site study' },
);
const libozaGuide = source(
  'https://nesedimsousedim.cz/wp-content/uploads/2025/05/Sousedsky-pruvodce_Praha6-online-final.pdf',
  {
    cs: 'Sousedský průvodce Prahou 6 · Libóza',
    en: 'Neighbourhood guide to Prague 6 · Libóza',
  },
);
const prazeleninaRules = source('https://prazelenina.cz/pages/pravidla/', {
  cs: 'Prazelenina · pravidla',
  en: 'Prazelenina · rules',
});
const prazeleninaHome = source('https://www.prazelenina.cz/', {
  cs: 'Prazelenina · sezona',
  en: 'Prazelenina · season',
});
const zizkovskaHome = source('https://www.zizkovskazahradka.cz/', {
  cs: 'Žižkovská zahrádka · domů',
  en: 'Žižkovská zahrádka · home page',
});
const naPolskePublic = source(
  'https://prazsky-magazin.cz/zpravy-prazskeho-magazinu/zpravy-z-prahy/deti-z-cimic-si-samy-stavi-skolu/',
  { cs: 'Pražský magazín · Na Polské', en: 'Pražský magazín · Na Polské' },
);
const naPolskeAddress = source('https://www.3udoli.cz/komunitni-zahrada/', {
  cs: '3 údolí · komunitní zahrada Na Polské',
  en: '3 údolí · Na Polské community garden',
});

export const gardenVisits = {
  metrofarm: {
    access: fact(
      {
        cs: 'Nový člen, návštěvník i dobrovolník je vítán.',
        en: 'New members, visitors and volunteers are all welcome.',
      },
      'published',
      [metroFarm],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [metroFarm]),
    entrance: fact(
      { cs: 'Císařský ostrov, Praha 7.', en: 'Císařský ostrov, Prague 7.' },
      'published',
      [metroFarmField],
    ),
    participation: fact(
      {
        cs: 'Komunitní políčko: ne + út 16:00–19:00 (duben–říjen); ne 14:00–16:00 (listopad–březen).',
        en: 'Community field: Sun and Tue 16:00–19:00 (April–October); Sun 14:00–16:00 (November–March).',
      },
      'published',
      [metroFarmField],
      {
        cs: 'komunitní políčko a pracovní setkání',
        en: 'community field and work meetings',
      },
    ),
  },
  prales: {
    access: fact(
      {
        cs: 'Horní část areálu Prales je přístupná nepřetržitě; komunitní zahrada je součástí areálu.',
        en: 'The upper part of the Prales site is open at all times; the community garden is part of the site.',
      },
      'published',
      [pralesVisit, pralesGarden],
    ),
    hours: fact(
      {
        cs: 'Dolní oplocená část areálu: listopad–březen po–pá 7:00–15:30; duben–říjen po–pá 7:00–17:00, so 9:00–17:00, ne zavřeno. Ve všední státní svátky je zavřeno.',
        en: 'Lower fenced part of the site: November–March Mon–Fri 7:00–15:30; April–October Mon–Fri 7:00–17:00, Sat 9:00–17:00, closed on Sundays. Closed on weekday public holidays.',
      },
      'published',
      [pralesVisit],
      {
        cs: 'spodní oplocená část ekocentra, ne samostatně komunitní zahrada',
        en: 'the lower fenced part of the eco-centre, not the community garden on its own',
      },
    ),
    entrance: fact(
      {
        cs: 'Mladoboleslavská 953, Praha 19.',
        en: 'Mladoboleslavská 953, Prague 19.',
      },
      'published',
      [pralesVisit],
    ),
    participation: fact(
      {
        cs: 'Stránka zahrady uváděla k 10. 2. 2026 plnou kapacitu sezony.',
        en: 'As of 10 February 2026 the garden page reported that the season was fully booked.',
      },
      'published',
      [pralesGarden],
      { cs: 'pěstitelská sezona 2026', en: 'growing season 2026' },
    ),
  },
  kotlaska: {
    access: fact(
      {
        cs: 'Zahrada je veřejně přístupná v uvedené otevírací době, pokud není uzavřena pro rezervaci.',
        en: 'The garden is open to the public during the listed hours unless it is closed for a booking.',
      },
      'published',
      [kotlaskaRules],
    ),
    hours: fact(
      {
        cs: 'Út 10:00–18:00 a čt 10:00–18:00; ostatní dny zavřeno.',
        en: 'Tue 10:00–18:00 and Thu 10:00–18:00; closed on other days.',
      },
      'published',
      [kotlaskaContact, kotlaskaRules],
    ),
    entrance: fact(
      { cs: 'Nad Kotlaskou I, Praha 8.', en: 'Nad Kotlaskou I, Prague 8.' },
      'published',
      [kotlaskaContact],
    ),
  },
  troja: {
    access: fact(
      {
        cs: 'Průvodce v komunitním prostoru je k dispozici nepravidelně nebo po domluvě.',
        en: 'A guide is present in the community space irregularly or by arrangement.',
      },
      'published',
      [trojaContact],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [trojaContact]),
    entrance: fact(
      {
        cs: 'Na Farkách ev. č. 92, Praha–Troja.',
        en: 'Na Farkách ev. č. 92, Prague-Troja.',
      },
      'published',
      [trojaContact],
    ),
  },
  mecislavka: {
    access: fact(
      {
        cs: 'Projekt vnitrobloku popisuje místo jako přístupný plácek s komunitní zahradou.',
        en: 'The courtyard project describes the place as an accessible open space with a community garden.',
      },
      'published',
      [mecislavka],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [mecislavka]),
  },
  vidimova: {
    access: fact(
      {
        cs: 'Kokoza uvádí pravidelné návštěvy veřejnosti a týdenní otevírací dobu.',
        en: 'Kokoza mentions regular public visits and weekly opening hours.',
      },
      'published',
      [vidimova],
    ),
    hours: fact(
      {
        cs: 'Přesný týdenní rozvrh jsme na aktuální stránce nenašli; starší články proto nepřebíráme jako platné hodiny.',
        en: 'We did not find an exact weekly schedule on the current page, so we do not treat older articles as valid hours.',
      },
      'not-found',
      [vidimova],
    ),
    participation: fact(
      {
        cs: 'Konkrétní návštěvní termín ověřte u Kokozy podle aktuálního týdenního programu.',
        en: 'Check a specific visiting time with Kokoza according to the current weekly programme.',
      },
      'published',
      [vidimova],
    ),
  },
  prokopka: {
    access: fact(
      {
        cs: 'Návštěvníci se řídí provozním řádem; víkendové akce se koordinují s provozovatelem.',
        en: 'Visitors follow the site rules; weekend events are coordinated with the operator.',
      },
      'published',
      [prokopkaRules],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [prokopkaRules]),
    participation: fact(
      {
        cs: 'Provozní řád stanovuje klidový režim 22:00–6:00 a další omezení u školy.',
        en: 'The site rules set quiet hours from 22:00 to 6:00 and further restrictions near the school.',
      },
      'published',
      [prokopkaRules],
    ),
  },
  'velky-haj': {
    access: fact(
      {
        cs: 'Nová zahrada byla otevřena zájemcům; samostatný režim návštěvy pěstitelské části zdroj neuvádí.',
        en: 'The new garden was opened to interested people; the source does not describe separate visiting rules for the growing area.',
      },
      'published',
      [velkyHaj],
    ),
    hours: fact(
      {
        cs: 'Pravidelnou otevírací dobu zahrady jsme na uvedeném zdroji nenašli.',
        en: 'We did not find regular opening hours for the garden in the listed source.',
      },
      'not-found',
      [velkyHaj],
    ),
    entrance: fact(
      {
        cs: 'Park leží na okraji lesa mezi Novodvorskou a zámkem Krč; přesný vstup zahrady zatím není ověřený.',
        en: 'The park lies at the edge of the forest between Novodvorská street and Krč chateau; the exact entrance to the garden has not been verified yet.',
      },
      'published',
      [velkyHaj],
      approximateLocation,
    ),
  },
  liboza: {
    access: fact(
      {
        cs: 'Zdroj ji popisuje jako komunitní prostor pro zahradničení, setkávání a kulturní akce; návštěvu doporučujeme předem domluvit.',
        en: 'The source describes it as a community space for gardening, meeting and cultural events; we recommend arranging a visit in advance.',
      },
      'published',
      [libozaGuide],
    ),
    hours: fact(hoursNotFound.source, 'not-found', [libozaGuide]),
    entrance: fact(
      {
        cs: 'Za domem Libocká 39, Praha 6–Liboc.',
        en: 'Behind the house at Libocká 39, Prague 6-Liboc.',
      },
      'published',
      [libozaGuide],
    ),
  },
  prazelenina: {
    access: fact(
      {
        cs: 'Registrovaní členové mohou do zahrady kdykoli; vstupní kód dostanou po registraci.',
        en: 'Registered members can enter the garden at any time; they receive an entry code after registering.',
      },
      'published',
      [prazeleninaRules],
    ),
    hours: fact(
      {
        cs: 'Bar/kavárna: út–pá a ne 17:00–21:00; po a so zavřeno. Tento rozvrh není otevírací dobou samotné zahrady.',
        en: 'Bar/café: Tue–Fri and Sun 17:00–21:00; closed on Mon and Sat. These are not the opening hours of the garden itself.',
      },
      'published',
      [prazeleninaRules],
      { cs: 'bar a kavárna', en: 'bar and café' },
    ),
    participation: fact(
      {
        cs: 'Sezona 2026 je uvedena jako duben–říjen; členství a záhonek se řeší registrací.',
        en: 'The 2026 season is listed as April–October; membership and a bed are arranged by registration.',
      },
      'published',
      [prazeleninaHome, prazeleninaRules],
    ),
  },
  'na-plani': {
    access: fact(
      {
        cs: 'Park Na Pláni je veřejný park s komunitní zahradou a zázemím pro veřejnost; samostatný režim pěstitelské části zdroj neuvádí.',
        en: 'Na Pláni is a public park with a community garden and public facilities; the source does not describe separate rules for the growing area.',
      },
      'published',
      [naPlani],
    ),
    hours: fact(
      {
        cs: 'Pravidelnou otevírací dobu parku ani komunitní zahrady jsme na stránkách MČ Praha 5 nenašli.',
        en: 'We did not find regular opening hours for the park or the community garden on the Prague 5 district website.',
      },
      'not-found',
      [naPlani],
    ),
    entrance: fact(
      {
        cs: 'Park je mezi ulicemi Na Pláni a K Vodojemu; komunitní zahrada je v západní části parku.',
        en: 'The park lies between Na Pláni and K Vodojemu streets; the community garden is in the western part of the park.',
      },
      'published',
      [naPlani, naPlaniStudy],
      approximateLocation,
    ),
  },
  'zizkovska-zahradka': {
    access: fact(
      {
        cs: 'Členové mají neomezený vstup; pro návštěvu, zapojení nebo veřejnou akci doporučujeme napsat provozovatelům.',
        en: 'Members have unlimited access; for a visit, getting involved or a public event we recommend writing to the operators.',
      },
      'published',
      [zizkovskaHome],
    ),
    hours: fact(
      {
        cs: 'Pravidelnou otevírací dobu pro veřejnost jsme na oficiálním webu nenašli.',
        en: 'We did not find regular public opening hours on the official website.',
      },
      'not-found',
      [zizkovskaHome],
    ),
    entrance: fact(
      {
        cs: 'Na začátku Malešické ulice, mezi Parukářkou a Kapslovnou.',
        en: 'At the beginning of Malešická street, between Parukářka and Kapslovna.',
      },
      'published',
      [zizkovskaHome],
    ),
    participation: fact(
      {
        cs: 'Možné je členství se záhonkem i běžné členství bez záhonku; dostupnost provozovatelé sdělí e-mailem.',
        en: 'Membership with a bed and regular membership without one are both possible; the operators confirm availability by e-mail.',
      },
      'published',
      [zizkovskaHome],
    ),
  },
  'na-polske': {
    access: fact(
      {
        cs: 'Magická zahrada je podle aktuálního článku otevřena široké veřejnosti.',
        en: 'According to the current article, the Magical Garden is open to the general public.',
      },
      'published',
      [naPolskePublic],
    ),
    hours: fact(hoursNotFound.sources, 'not-found', [
      naPolskePublic,
      naPolskeAddress,
    ]),
    entrance: fact(
      {
        cs: 'Na Průhonu, naproti domu č. 46, Praha 8.',
        en: 'Na Průhonu street, opposite house no. 46, Prague 8.',
      },
      'published',
      [naPolskeAddress],
    ),
  },
} satisfies Record<string, GardenVisit>;

export type GardenVisitId = keyof typeof gardenVisits;
