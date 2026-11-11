/**
 * Practical visiting information for the illustrated atlas.
 *
 * These notes deliberately distinguish a garden's public access, the opening
 * hours of a wider site, and membership/volunteer times. `not-found` means we
 * checked the listed source but it did not publish the information (a regular
 * schedule, a stop, step-free access); it does not mean that the place is
 * closed, out of reach or inaccessible.
 *
 * Every garden answers the same seven questions, in the order the detail
 * panel shows them (`visitFactKeys`): what makes it special, when to come,
 * access, where, getting there, accessibility and how to join in. `entrance`
 * is the only one a garden may leave out, when no source names a place to go
 * in. `transport` names only a stop that a source gives; `accessibility` says
 * only what a source says about step-free access; `special` is one sourced
 * line beyond the garden's short description.
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
  special: VisitFact;
  hours: VisitFact;
  access: VisitFact;
  entrance?: VisitFact;
  transport: VisitFact;
  accessibility: VisitFact;
  participation: VisitFact;
};

export type VisitFactKey = keyof GardenVisit;

/** The facts in the order the detail panel lists them. */
export const visitFactKeys = [
  'special',
  'hours',
  'access',
  'entrance',
  'transport',
  'accessibility',
  'participation',
] as const satisfies readonly VisitFactKey[];

/** A garden's facts in panel order, without the ones it leaves out. */
export function visitFacts(visit: GardenVisit) {
  return visitFactKeys.flatMap((key) => {
    const fact = visit[key];
    return fact ? [{ key, fact }] : [];
  });
}

/** The oldest check among a garden's facts: every source was read on it. */
export function visitCheckedAt(visit: GardenVisit) {
  return visitFacts(visit)
    .map(({ fact }) => fact.checkedAt)
    .sort()[0];
}

/** The day all listed sources were last checked (11 November 2026). */
export const GARDEN_VISIT_CHECKED_AT = '2026-11-11';

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

/** The same honest gap, worded once for one website, one source or several. */
function gap(what: Localized) {
  return {
    website: {
      cs: `${what.cs} jsme na uvedeném webu nenašli.`,
      en: `We did not find ${what.en} on the listed website.`,
    },
    source: {
      cs: `${what.cs} jsme v uvedeném zdroji nenašli.`,
      en: `We did not find ${what.en} in the listed source.`,
    },
    sources: {
      cs: `${what.cs} jsme v uvedených zdrojích nenašli.`,
      en: `We did not find ${what.en} in the listed sources.`,
    },
  } satisfies Record<string, Localized>;
}

const hoursNotFound = gap({
  cs: 'Pravidelnou otevírací dobu',
  en: 'regular opening hours',
});
const transportNotFound = gap({
  cs: 'Zastávku MHD',
  en: 'a public transport stop',
});
const accessibilityNotFound = gap({
  cs: 'Údaje o bezbariérovém přístupu',
  en: 'any information on step-free access',
});

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
const kotlaskaAbout = source('https://www.kckotlaska.cz/kdo-jsme/', {
  cs: 'KC Kotlaska · kdo jsme',
  en: 'KC Kotlaska · who we are',
});
const trojaContact = source('https://www.komunitnizahrada.cz/kontakt/', {
  cs: 'Komunitní zahrada Troja · kontakt',
  en: 'Komunitní zahrada Troja · contact',
});
const trojaHome = source('https://www.komunitnizahrada.cz/', {
  cs: 'Komunitní zahrada Troja · úvod',
  en: 'Komunitní zahrada Troja · home page',
});
const trojaActivities = source('https://www.komunitnizahrada.cz/aktivity/', {
  cs: 'Komunitní zahrada Troja · aktivity',
  en: 'Komunitní zahrada Troja · activities',
});
const mecislavka = source('https://www.vnitrobloky.cz/mecislavka', {
  cs: 'Bieno · Mečislavka (festival 2018)',
  en: 'Bieno · Mečislavka (2018 festival)',
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
const prokopkaHome = source('https://www.zahradaprokopka.cz/', {
  cs: 'Zahrada Prokopka · o nás',
  en: 'Zahrada Prokopka · about us',
});
const prokopkaMembership = source('https://www.zahradaprokopka.cz/clenstvi/', {
  cs: 'Zahrada Prokopka · členství',
  en: 'Zahrada Prokopka · membership',
});
const prokopkaContact = source('https://www.zahradaprokopka.cz/kontakt/', {
  cs: 'Zahrada Prokopka · kontakt',
  en: 'Zahrada Prokopka · contact',
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
const naPlaniStreets = source(
  'https://www.archiweb.cz/n/home/na-prazskych-malvazinkach-vznikl-novy-park-asi-za-35-milionu-korun',
  {
    cs: 'Archiweb (ČTK) · park Na Pláni',
    en: 'Archiweb (ČTK) · Na Pláni park',
  },
);
const libozaGuide = source(
  'https://nesedimsousedim.cz/wp-content/uploads/2025/05/Sousedsky-pruvodce_Praha6-online-final.pdf',
  {
    cs: 'Sousedský průvodce Prahou 6 · Libóza',
    en: 'Neighbourhood guide to Prague 6 · Libóza',
  },
);
const libozaProposal = source(
  'https://www.napadprosestku.cz/napady/komunitni-zahrada-liboza/',
  {
    cs: 'Nápad pro šestku · návrh z roku 2017',
    en: 'Nápad pro šestku · 2017 proposal',
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
const naPolskeGarden = source('https://napolske.eu/komunitni-zahrada/', {
  cs: 'Na Polské · komunitní zahrada',
  en: 'Na Polské · community garden',
});
const naPolskeHome = source('https://napolske.eu/', {
  cs: 'Na Polské · úvod',
  en: 'Na Polské · home page',
});
const naPolskeAddress = source('https://www.3udoli.cz/', {
  cs: '333 údolí · adresa zahrady',
  en: '333 údolí · garden address',
});

export const gardenVisits = {
  metrofarm: {
    special: fact(
      {
        cs: 'Slepice tu žijí ve volném výběhu a kozičku si lze adoptovat. Komunitní políčko spojuje tržní zahradu s komunitou podporovaným zemědělstvím; dobrovolníci dostávají za práci bedýnky zeleniny.',
        en: 'The hens live in a free-range run and you can adopt one of the goats. The community field combines a market garden with community-supported agriculture; volunteers are rewarded with boxes of vegetables.',
      },
      'published',
      [metroFarm, metroFarmField],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [metroFarm]),
    access: fact(
      {
        cs: 'Nový člen, návštěvník i dobrovolník je vítán.',
        en: 'New members, visitors and volunteers are all welcome.',
      },
      'published',
      [metroFarm],
    ),
    entrance: fact(
      { cs: 'Císařský ostrov, Praha 7.', en: 'Císařský ostrov, Prague 7.' },
      'published',
      [metroFarmField],
    ),
    transport: fact(transportNotFound.website, 'not-found', [
      metroFarm,
      metroFarmField,
    ]),
    accessibility: fact(accessibilityNotFound.website, 'not-found', [
      metroFarm,
      metroFarmField,
    ]),
    participation: fact(
      {
        cs: 'Nejjednodušší první krok je přijít na pracovní brigádu na komunitním políčku: ne a út 16:00–19:00 (duben–říjen), od listopadu do března jen ne 14:00–16:00. Vlastní zahrádka má 5 nebo 10 m².',
        en: 'The simplest first step is to come to a work party on the community field: Sun and Tue 16:00–19:00 (April–October), only Sun 14:00–16:00 from November to March. An individual plot is 5 or 10 m².',
      },
      'published',
      [metroFarmField, metroFarm],
    ),
  },
  prales: {
    special: fact(
      {
        cs: 'Komunitní foliovník s vyvýšenými záhony v několika velikostech výrazně prodlužuje pěstitelskou sezonu.',
        en: 'A community polytunnel with raised beds in several sizes extends the growing season considerably.',
      },
      'published',
      [pralesGarden],
    ),
    hours: fact(
      {
        cs: 'Dolní oplocená část areálu: zimní sezona (10. října – březen) po–pá 7:00–15:30, so a ne zavřeno; letní sezona (duben – 9. října) po–pá 7:00–17:00, so 9:00–17:00, ne zavřeno. Ve všední státní svátky je zavřeno.',
        en: 'Lower fenced part of the site: winter season (10 October – March) Mon–Fri 7:00–15:30, closed at weekends; summer season (April – 9 October) Mon–Fri 7:00–17:00, Sat 9:00–17:00, closed on Sundays. Closed on weekday public holidays.',
      },
      'published',
      [pralesVisit],
      {
        cs: 'spodní oplocená část ekocentra, ne samostatně komunitní zahrada',
        en: 'the lower fenced part of the eco-centre, not the community garden on its own',
      },
    ),
    access: fact(
      {
        cs: 'Horní část areálu Prales je přístupná nepřetržitě; komunitní zahrada je součástí areálu.',
        en: 'The upper part of the Prales site is open at all times; the community garden is part of the site.',
      },
      'published',
      [pralesVisit, pralesGarden],
    ),
    entrance: fact(
      {
        cs: 'Mladoboleslavská 953, Praha 19.',
        en: 'Mladoboleslavská 953, Prague 19.',
      },
      'published',
      [pralesVisit],
    ),
    transport: fact(
      {
        cs: 'Autobusy 375, 376 a 378 do zastávky Mladějovská přímo před dolní částí areálu; nedaleko je vlaková zastávka Praha-Kbely.',
        en: 'Buses 375, 376 and 378 to the Mladějovská stop, right in front of the lower part of the site; Praha-Kbely railway station is nearby.',
      },
      'published',
      [pralesVisit],
    ),
    accessibility: fact(
      {
        cs: 'Ekocentrum nabízí bezbariérovou komunitní zahradu se speciálními vyvýšenými záhony, bezbariérovým sociálním zařízením a parkovištěm.',
        en: 'The eco-centre offers a step-free community garden with special raised beds, accessible toilets and a car park.',
      },
      'published',
      [pralesGarden],
    ),
    participation: fact(
      {
        cs: 'Stránka zahrady k 10. 2. 2026 uvádí, že je zahrada plně obsazená a na záhony je pořadník. Přihlásit se na pěstitelskou sezonu lze do 28. 2. daného roku.',
        en: 'As of 10 February 2026 the garden page says the garden is fully taken and there is a waiting list for beds. Applications for a growing season close on 28 February of that year.',
      },
      'published',
      [pralesGarden],
      { cs: 'pěstitelská sezona 2026', en: 'growing season 2026' },
    ),
  },
  kotlaska: {
    special: fact(
      {
        cs: 'Zahradu provozuje nezisková organizace RUBIKON Centrum, která od roku 1994 pomáhá lidem překročit trestní minulost; někteří její klienti tu na tréninkových místech pomáhají udržovat zahradu i centrum.',
        en: 'The garden is run by the non-profit RUBIKON Centrum, which has helped people move beyond a criminal past since 1994; some of its clients help look after the garden and the centre in training jobs.',
      },
      'published',
      [kotlaskaAbout],
    ),
    hours: fact(
      {
        cs: 'Út 10:00–18:00 a čt 10:00–18:00; ostatní dny zavřeno.',
        en: 'Tue 10:00–18:00 and Thu 10:00–18:00; closed on other days.',
      },
      'published',
      [kotlaskaContact, kotlaskaRules],
    ),
    access: fact(
      {
        cs: 'Zahrada je veřejně přístupná v uvedené otevírací době, pokud není uzavřena pro rezervaci.',
        en: 'The garden is open to the public during the listed hours unless it is closed for a booking.',
      },
      'published',
      [kotlaskaRules],
    ),
    entrance: fact(
      { cs: 'Nad Kotlaskou I, Praha 8.', en: 'Nad Kotlaskou I, Prague 8.' },
      'published',
      [kotlaskaContact],
    ),
    transport: fact(transportNotFound.website, 'not-found', [
      kotlaskaContact,
      kotlaskaAbout,
    ]),
    accessibility: fact(accessibilityNotFound.website, 'not-found', [
      kotlaskaContact,
      kotlaskaRules,
      kotlaskaAbout,
    ]),
    participation: fact(
      {
        cs: 'Kdo chce pěstovat, stane se členem komunitní zahrady: přečte si pravidla a vyplní přihlášku, kterou vezme s sebou při první návštěvě; vyplnit ji jde i na místě.',
        en: 'To grow here, become a member of the community garden: read the rules and fill in the application, then bring it on your first visit; you can also fill it in there.',
      },
      'published',
      [kotlaskaAbout],
    ),
  },
  troja: {
    special: fact(
      {
        cs: 'Chce tvořit komunitu na principech rozšířené rodiny: kromě záhonků má knihobudku, veřejný kompostér, regál na výměnu věcí, týpí a nástěnku pro sousedskou výpomoc.',
        en: 'It aims to build a community on the principles of an extended family: besides the beds there is a book exchange box, a public composter, a swap shelf, a tipi and a noticeboard for neighbourly help.',
      },
      'published',
      [trojaHome, trojaActivities],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [trojaContact]),
    access: fact(
      {
        cs: 'Průvodce v komunitním prostoru je k dispozici nepravidelně nebo po domluvě.',
        en: 'A guide is present in the community space irregularly or by arrangement.',
      },
      'published',
      [trojaContact],
    ),
    entrance: fact(
      {
        cs: 'Na Farkách ev. č. 92, Praha–Troja.',
        en: 'Na Farkách ev. č. 92, Prague-Troja.',
      },
      'published',
      [trojaContact],
      {
        cs: 'adresa v kontaktu; patička webu uvádí ev. č. 124',
        en: 'the address given under contact; the website footer gives ev. č. 124',
      },
    ),
    transport: fact(
      {
        cs: 'Z metra Kobylisy autobusem 144 nebo 177 na konečnou Poliklinika Mazurská, dál ulicí Pomořanská a na konci zahrady školky doleva.',
        en: 'From Kobylisy metro station take bus 144 or 177 to the Poliklinika Mazurská terminus, then walk along Pomořanská street and turn left at the end of the nursery school garden.',
      },
      'published',
      [trojaContact],
    ),
    accessibility: fact(accessibilityNotFound.website, 'not-found', [
      trojaContact,
      trojaHome,
    ]),
    participation: fact(
      {
        cs: 'Členové mají vlastní záhon a neomezený přístup na odpočinkovou zahradu; k pronájmu jsou paletové záhonky o ploše 1,5 m². Seznámit se dá na akcích pro veřejnost, které jsou každý měsíc.',
        en: 'Members get their own bed and unlimited access to the garden; pallet beds of 1.5 m² are for rent. You can get to know the garden at the public events held every month.',
      },
      'published',
      [trojaHome, trojaActivities],
    ),
  },
  mecislavka: {
    special: fact(
      {
        cs: 'Dříve zanedbaný plácek proměnili v komunitní zahradu sousedé společně s Kokozou a MČ Praha 4; je tu voda, ohniště a gril, pískoviště i houpačka.',
        en: 'Neighbours turned a once neglected plot into a community garden together with Kokoza and the Prague 4 district; there is water, a fire pit and a grill, a sandpit and a swing.',
      },
      'published',
      [mecislavka],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [mecislavka]),
    access: fact(
      {
        cs: 'Projekt vnitrobloku popisuje místo jako přístupný plácek s komunitní zahradou.',
        en: 'The courtyard project describes the place as an accessible open space with a community garden.',
      },
      'published',
      [mecislavka],
    ),
    entrance: fact(
      {
        cs: 'Mečislavova 22, Praha 4; vstup rampou mezi domem a tratí, volný přístup je koncem ulice Ctiradova podél náspu železnice.',
        en: 'Mečislavova 22, Prague 4; the way in is a ramp between the building and the railway, with open access from the end of Ctiradova street along the railway embankment.',
      },
      'published',
      [mecislavka],
    ),
    transport: fact(transportNotFound.website, 'not-found', [mecislavka]),
    accessibility: fact(
      {
        cs: 'Do zapuštěného dvora vede dlážděná rampa; zda je přístup bezbariérový, zdroj neuvádí.',
        en: 'A paved ramp leads into the sunken courtyard; the source does not say whether access is step-free.',
      },
      'published',
      [mecislavka],
    ),
    participation: fact(
      {
        cs: 'Podle popisu z roku 2018 je po obvodu zahrady 20 vyvýšených záhonů, které si pronajímají obyvatelé i širší veřejnost; 24 truhlíků se sezonně adoptuje a několik z nich je veřejných a bez poplatku.',
        en: 'According to the 2018 description, 20 raised beds around the garden are rented by residents and the wider public; 24 planters are adopted each season, and several are public and free of charge.',
      },
      'published',
      [mecislavka],
    ),
  },
  vidimova: {
    special: fact(
      {
        cs: 'Kokoza ji založila v roce 2013 jako ukázku městského pěstování uprostřed sídliště. Koncept je od začátku integrační: komunita pěstuje spolu s částí zaměstnanců Kokozy, kteří mají zkušenost s duševním onemocněním.',
        en: 'Kokoza founded it in 2013 as a showcase of urban growing in the middle of a housing estate. From the start the idea has been inclusive: the community grows alongside some of Kokoza’s staff who have experience of mental illness.',
      },
      'published',
      [vidimova],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [vidimova]),
    access: fact(
      {
        cs: 'Podle Kokozy zahrada otevírá prostor pro odpočinek, sdílení a setkávání lidí a pořádá workshopy a akce pro širokou veřejnost; pravidelný režim návštěv stránka neuvádí.',
        en: 'According to Kokoza, the garden opens its space for rest, sharing and meeting people and holds workshops and events for the general public; the page does not give regular visiting arrangements.',
      },
      'published',
      [vidimova],
    ),
    transport: fact(transportNotFound.website, 'not-found', [vidimova]),
    accessibility: fact(accessibilityNotFound.website, 'not-found', [vidimova]),
    participation: fact(
      {
        cs: 'Od sezony 2021 vedou zahradu místní komunitní zahradníci ze spolku Komunitní zahrada Vidimova; na padesáti záhonech pěstuje 45 rodin z okolí. Jak se přidat, stránka nepopisuje.',
        en: 'Since the 2021 season the garden has been run by local community gardeners in the association Komunitní zahrada Vidimova; 45 local families grow on fifty beds. The page does not describe how to join.',
      },
      'published',
      [vidimova],
    ),
  },
  prokopka: {
    special: fact(
      {
        cs: 'Spolek Pro kořínky začal pozemek upravovat v létě 2022 a první sezona byla v roce 2023. Chce vytvářet bezpečný prostor pro sousedská setkávání.',
        en: 'The association Pro kořínky began preparing the land in summer 2022, and the first season was in 2023. It wants to create a safe space for neighbours to meet.',
      },
      'published',
      [prokopkaHome],
    ),
    hours: fact(hoursNotFound.website, 'not-found', [
      prokopkaRules,
      prokopkaHome,
    ]),
    access: fact(
      {
        cs: 'Návštěvníci se řídí provozním řádem: noční klid 22:00–6:00, od 12:30 do 14:30 ohled na sousední školku, psi a jiná domácí zvířata do zahrady nesmějí; víkendové akce se koordinují s provozovateli.',
        en: 'Visitors follow the site rules: quiet at night from 22:00 to 6:00, consideration for the neighbouring nursery school from 12:30 to 14:30, no dogs or other pets; weekend events are coordinated with the operators.',
      },
      'published',
      [prokopkaRules],
    ),
    entrance: fact(
      {
        cs: 'Herčíkova ulice, Praha 13, vedle školky Úsměv.',
        en: 'Herčíkova street, Prague 13, next to the Úsměv nursery school.',
      },
      'published',
      [prokopkaContact],
    ),
    transport: fact(transportNotFound.website, 'not-found', [prokopkaContact]),
    accessibility: fact(accessibilityNotFound.website, 'not-found', [
      prokopkaRules,
      prokopkaContact,
    ]),
    participation: fact(
      {
        cs: 'Spolek Pro kořínky nabízí na rok 2026 tři kategorie členství; v kategoriích s pěstováním je v prvním roce pěstební plocha 1 m². Přihlásit se lze formulářem „Přidejte se k nám“ nebo e-mailem.',
        en: 'For 2026 the association Pro kořínky offers three membership categories; in the categories that include growing, the first year’s growing area is 1 m². You can sign up with the “Přidejte se k nám” (Join us) form or by e-mail.',
      },
      'published',
      [prokopkaMembership, prokopkaHome],
      { cs: 'členství na rok 2026', en: 'membership for 2026' },
    ),
  },
  'velky-haj': {
    special: fact(
      {
        cs: 'S rozlohou kolem pěti hektarů je to podle článku největší komunitní zahrada svého druhu v Praze; jsou tu včelí úly a výběh s koňmi a zájemci si mohou vyzkoušet apiterapii.',
        en: 'At around five hectares it is, according to the article, the largest community garden of its kind in Prague; there are beehives and a horse paddock, and those interested can try apitherapy.',
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
    access: fact(
      {
        cs: 'Nová zahrada byla otevřena zájemcům; samostatný režim návštěvy pěstitelské části zdroj neuvádí.',
        en: 'The new garden was opened to interested people; the source does not describe separate visiting rules for the growing area.',
      },
      'published',
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
    transport: fact(transportNotFound.source, 'not-found', [velkyHaj]),
    accessibility: fact(accessibilityNotFound.source, 'not-found', [velkyHaj]),
    participation: fact(
      {
        cs: 'Jak se přihlásit, jsme v uvedeném článku nenašli; podle něj se před otevřením přihlásilo přes 150 zájemců.',
        en: 'We did not find how to sign up in the listed article; it says over 150 people had applied before the opening.',
      },
      'not-found',
      [velkyHaj],
    ),
  },
  liboza: {
    special: fact(
      {
        cs: 'Vznikla s myšlenkou vytvořit „venkovní obývák Liboce“; na zahradních slavnostech organizátoři zdůrazňují hravost, podporu fantazie a environmentální přesah.',
        en: 'It was created as the “outdoor living room of Liboc”; at its garden festivals the organisers stress playfulness, encouraging imagination and an environmental dimension.',
      },
      'published',
      [libozaGuide],
    ),
    hours: fact(hoursNotFound.source, 'not-found', [libozaGuide]),
    access: fact(
      {
        cs: 'Zdroj ji popisuje jako komunitní prostor pro zahradničení, setkávání a kulturní akce; návštěvu doporučujeme předem domluvit.',
        en: 'The source describes it as a community space for gardening, meeting and cultural events; we recommend arranging a visit in advance.',
      },
      'published',
      [libozaGuide],
    ),
    entrance: fact(
      {
        cs: 'Za domem Libocká 39, Praha 6–Liboc.',
        en: 'Behind the house at Libocká 39, Prague 6-Liboc.',
      },
      'published',
      [libozaGuide],
    ),
    transport: fact(
      {
        cs: 'Návrh projektu z roku 2017 uvádí, že místo je v těsné blízkosti autobusové zastávky Libocká.',
        en: 'The 2017 project proposal says the site is right next to the Libocká bus stop.',
      },
      'published',
      [libozaProposal],
    ),
    accessibility: fact(accessibilityNotFound.sources, 'not-found', [
      libozaGuide,
      libozaProposal,
    ]),
    participation: fact(
      {
        cs: 'Jak se dnes zapojit, jsme v uvedených zdrojích nenašli; návrh projektu z roku 2017 počítal s pronájmem vyvýšených záhonků jednotlivcům či institucím.',
        en: 'We did not find how to take part today in the listed sources; the 2017 project proposal planned to rent raised beds to individuals or institutions.',
      },
      'not-found',
      [libozaGuide, libozaProposal],
    ),
  },
  prazelenina: {
    special: fact(
      {
        cs: 'Heslem zahrady je „zván a vítán je každý, kdo touží pěstovat plodiny i mezilidské vztahy“. Plazivé rostliny jako dýně a cukety rostou na společných záhonech v zadní části.',
        en: 'The garden’s motto is that “everyone who longs to grow crops and human relationships is invited and welcome”. Sprawling plants such as pumpkins and courgettes grow in the shared beds at the back.',
      },
      'published',
      [prazeleninaHome, prazeleninaRules],
    ),
    hours: fact(
      {
        cs: 'Bar/kavárna v sezoně 2026 (duben–říjen): út–pá a ne 17:00–21:00; po a so zavřeno, na začátku sezony podle počasí. Rozvrh mimo sezonu jsme nenašli. Tento rozvrh není otevírací dobou samotné zahrady.',
        en: 'Bar/café in the 2026 season (April–October): Tue–Fri and Sun 17:00–21:00; closed on Mon and Sat, at the start of the season depending on the weather. We did not find a schedule outside the season. These are not the opening hours of the garden itself.',
      },
      'published',
      [prazeleninaRules, prazeleninaHome],
      { cs: 'bar a kavárna, sezona 2026', en: 'bar and café, 2026 season' },
    ),
    access: fact(
      {
        cs: 'Registrovaní členové mohou do zahrady kdykoli; vstupní kód dostanou po registraci.',
        en: 'Registered members can enter the garden at any time; they receive an entry code after registering.',
      },
      'published',
      [prazeleninaRules],
    ),
    transport: fact(transportNotFound.website, 'not-found', [
      prazeleninaRules,
      prazeleninaHome,
    ]),
    accessibility: fact(accessibilityNotFound.website, 'not-found', [
      prazeleninaRules,
      prazeleninaHome,
    ]),
    participation: fact(
      {
        cs: 'Pěstitelem se lze stát za příspěvek 1 500 Kč za rok; záhonek je třeba si domluvit e-mailem před začátkem sezony. Na rok 2026 jsou podle webu záhonky zadané.',
        en: 'You can become a grower for a contribution of CZK 1,500 a year; arrange a bed by e-mail before the season starts. According to the website, the beds for 2026 are already assigned.',
      },
      'published',
      [prazeleninaRules, prazeleninaHome],
      { cs: 'sezona 2026', en: '2026 season' },
    ),
  },
  'na-plani': {
    special: fact(
      {
        cs: 'Park vznikl na místě bývalé zahrádkářské kolonie, kde se dříve plánovalo postavit patnáct bytových domů; změna územního plánu tu prosadila zeleň místo bydlení.',
        en: 'The park was built on a former allotment colony where fifteen apartment buildings had once been planned; a change to the zoning plan made it green space instead of housing.',
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
    access: fact(
      {
        cs: 'Park Na Pláni je veřejný park s komunitní zahradou a zázemím pro veřejnost; samostatný režim pěstitelské části zdroj neuvádí.',
        en: 'Na Pláni is a public park with a community garden and public facilities; the source does not describe separate rules for the growing area.',
      },
      'published',
      [naPlani],
    ),
    entrance: fact(
      {
        cs: 'Park je mezi ulicemi K Vodojemu a Na Pláni ve vilové čtvrti na Smíchově; kde přesně v parku je komunitní zahrada, jsme v aktuálních zdrojích nenašli.',
        en: 'The park lies between K Vodojemu and Na Pláni streets in the villa quarter of Smíchov; we did not find in current sources where exactly in the park the community garden is.',
      },
      'published',
      [naPlaniStreets],
      approximateLocation,
    ),
    transport: fact(transportNotFound.sources, 'not-found', [
      naPlani,
      naPlaniStreets,
    ]),
    accessibility: fact(accessibilityNotFound.sources, 'not-found', [
      naPlani,
      naPlaniStreets,
    ]),
    participation: fact(
      {
        cs: 'Kdo komunitní zahradu provozuje a jak se zapojit, jsme v uvedených zdrojích nenašli.',
        en: 'We did not find who runs the community garden or how to take part in the listed sources.',
      },
      'not-found',
      [naPlani, naPlaniStreets],
    ),
  },
  'zizkovska-zahradka': {
    special: fact(
      {
        cs: 'Rozvoj zahrádky vychází z permakulturních principů: záhony se mulčují listím a do půdy se vrací kompost a hnůj. Okolí kdysi dodávalo rostliny do pražských parků, což dodnes připomíná ulice U Zásobní zahrady.',
        en: 'The garden follows permaculture principles: beds are mulched with leaves, and compost and manure go back into the soil. The area once supplied plants to Prague’s parks, as the nearby street U Zásobní zahrady still recalls.',
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
    access: fact(
      {
        cs: 'Členové mají neomezený vstup; pro návštěvu, zapojení nebo veřejnou akci doporučujeme napsat provozovatelům.',
        en: 'Members have unlimited access; for a visit, getting involved or a public event we recommend writing to the operators.',
      },
      'published',
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
    transport: fact(transportNotFound.website, 'not-found', [zizkovskaHome]),
    accessibility: fact(accessibilityNotFound.website, 'not-found', [
      zizkovskaHome,
    ]),
    participation: fact(
      {
        cs: 'Možné je členství se záhonkem (37 členských záhonků, 20 hlubinných a 17 vyvýšených) i běžné členství bez záhonku; zda je záhonek volný, sdělí provozovatelé e-mailem.',
        en: 'Membership with a bed (37 member beds, 20 in the ground and 17 raised) and regular membership without one are both possible; the operators confirm by e-mail whether a bed is free.',
      },
      'published',
      [zizkovskaHome],
    ),
  },
  'na-polske': {
    special: fact(
      {
        cs: 'Zahrada vznikla na bývalém poli, které leželo ladem; vedle je palouček s ohništěm a pergolou a okolo lesík se schovávačkami pro děti. Spolek 333 údolí má pozemek od roku 2022 zapůjčený od hlavního města.',
        en: 'The garden grew on a former field that had lain fallow; next to it is a clearing with a fire pit and a pergola, and around it a small wood with hiding places for children. The association 333 údolí has had the land on loan from the City of Prague since 2022.',
      },
      'published',
      [naPolskeGarden, naPolskeHome],
    ),
    hours: fact(hoursNotFound.sources, 'not-found', [
      naPolskePublic,
      naPolskeGarden,
    ]),
    access: fact(
      {
        cs: 'Magická zahrada je podle aktuálního článku otevřena široké veřejnosti.',
        en: 'According to the current article, the "Magická zahrada" (Magical Garden) is open to the general public.',
      },
      'published',
      [naPolskePublic],
    ),
    entrance: fact(
      {
        cs: 'Na Průhonu, naproti domu č. 46, Praha 8.',
        en: 'Na Průhonu street, opposite house no. 46, Prague 8.',
      },
      'published',
      [naPolskeAddress, naPolskePublic],
    ),
    transport: fact(transportNotFound.sources, 'not-found', [
      naPolskeGarden,
      naPolskePublic,
    ]),
    accessibility: fact(accessibilityNotFound.sources, 'not-found', [
      naPolskeGarden,
      naPolskePublic,
    ]),
    participation: fact(
      {
        cs: 'Kdo se chce přidat, vyplní přihlášku. Na sezonu 2026 je roční provozní poplatek 1 900 Kč, k tomu 250 Kč za první vyvýšený záhon a 200 Kč za každý další; plocha na poli stojí 35 Kč za m² na rok.',
        en: 'To join, fill in an application. For the 2026 season the annual operating fee is CZK 1,900, plus CZK 250 for the first raised bed and CZK 200 for each further one; growing space in the field costs CZK 35 per m² a year.',
      },
      'published',
      [naPolskeGarden],
      { cs: 'zahradnická sezona 2026', en: '2026 gardening season' },
    ),
  },
} satisfies Record<string, GardenVisit>;

export type GardenVisitId = keyof typeof gardenVisits;
