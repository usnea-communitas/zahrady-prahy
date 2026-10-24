/**
 * The garden catalogue and the shared search/filter logic.
 *
 * Names, districts and street addresses are proper nouns and stay in Czech.
 * Everything else a visitor reads is bilingual (`{ cs, en }`). `lat`/`lon`
 * are public-source coordinates used for the real-map link; `artPositions`
 * are editorial placements on the illustration and are never used for
 * navigation.
 */
import { gardenVisits, type GardenVisit } from './garden-visits.ts';
import type { Locale, Localized } from './i18n.ts';

export type GardenCategory =
  | 'community'
  | 'urban-farm'
  | 'education'
  | 'courtyard'
  | 'nature';

export const categoryLabels: Record<GardenCategory, Localized> = {
  community: { cs: 'Komunitní zahrada', en: 'Community garden' },
  'urban-farm': { cs: 'Městská farma', en: 'Urban farm' },
  education: { cs: 'Vzdělávací zahrada', en: 'Educational garden' },
  courtyard: { cs: 'Vnitroblok', en: 'Courtyard garden' },
  nature: { cs: 'Přírodní zahrada', en: 'Natural garden' },
};

export type GardenTag =
  | 'beds'
  | 'volunteering'
  | 'animals'
  | 'compost'
  | 'accessible'
  | 'eco-centre'
  | 'orchard'
  | 'children'
  | 'events'
  | 'families'
  | 'book-box'
  | 'public'
  | 'oven'
  | 'housing-estate'
  | 'neighbourhood'
  | 'school'
  | 'workshops'
  | 'new-place'
  | 'ecology';

export const tagLabels: Record<GardenTag, Localized> = {
  beds: { cs: 'záhonky', en: 'garden beds' },
  volunteering: { cs: 'dobrovolnictví', en: 'volunteering' },
  animals: { cs: 'zvířata', en: 'animals' },
  compost: { cs: 'kompost', en: 'compost' },
  accessible: { cs: 'bezbariérové', en: 'wheelchair accessible' },
  'eco-centre': { cs: 'ekocentrum', en: 'eco-centre' },
  orchard: { cs: 'sad', en: 'orchard' },
  children: { cs: 'pro děti', en: 'for children' },
  events: { cs: 'akce', en: 'events' },
  families: { cs: 'rodiny', en: 'families' },
  'book-box': { cs: 'knihobudka', en: 'book exchange box' },
  public: { cs: 'veřejná', en: 'public' },
  oven: { cs: 'pec', en: 'oven' },
  'housing-estate': { cs: 'sídliště', en: 'housing estate' },
  neighbourhood: { cs: 'sousedství', en: 'neighbourhood' },
  school: { cs: 'školní', en: 'school grounds' },
  workshops: { cs: 'workshopy', en: 'workshops' },
  'new-place': { cs: 'nové místo', en: 'new place' },
  ecology: { cs: 'ekologie', en: 'ecology' },
};

export type Garden = {
  artPosition: { x: number; y: number };
  id: string;
  /** Proper name as the garden calls itself (Czech). */
  name: string;
  /** Optional English gloss of the name, shown next to it in the English UI. */
  gloss?: string;
  /** Neighbourhood, a proper noun. */
  district: string;
  /** Administrative district, e.g. Praha 7 / Prague 7. */
  area: Localized;
  description: Localized;
  tags: GardenTag[];
  lat: number;
  lon: number;
  locationStatus?: Localized;
  sourceUrl: string;
  illustration: string;
  category: GardenCategory;
  visit: GardenVisit;
};

const prague = (number: string | number): Localized => ({
  cs: `Praha ${number}`,
  en: `Prague ${number}`,
});

const gardenRecords: Omit<Garden, 'artPosition' | 'visit'>[] = [
  {
    id: 'metrofarm',
    name: 'MetroFarm Císařský ostrov',
    gloss: 'MetroFarm on Císařský Island',
    district: 'Císařský ostrov',
    area: prague(7),
    description: {
      cs: 'Komunitní zahrada a městská farma s vlastními záhonky, společným políčkem, kompostem i zvířaty.',
      en: 'A community garden and urban farm with individual beds, a shared field, compost and animals.',
    },
    tags: ['beds', 'volunteering', 'animals', 'compost'],
    lat: 50.1121511,
    lon: 14.4147114,
    sourceUrl: 'https://www.metrofarm.cz/metrofarm/',
    illustration: '/gardens/metrofarm-illustrated.webp',
    category: 'urban-farm',
  },
  {
    id: 'prales',
    name: 'Komunitní zahrada Prales',
    gloss: 'Prales Community Garden',
    district: 'Kbely',
    area: prague(19),
    description: {
      cs: 'Bezbariérová zahrada ekocentra s vyvýšenými záhony, foliovníkem, dešťovou vodou a kompostem.',
      en: 'A wheelchair-accessible eco-centre garden with raised beds, a polytunnel, rainwater and compost.',
    },
    tags: ['accessible', 'compost', 'eco-centre'],
    lat: 50.1336044,
    lon: 14.5607443,
    sourceUrl:
      'https://lesypraha.cz/vzdelavani/ekocentrum-prales/komunitni-zahrada/',
    illustration: '/gardens/prales-illustrated.webp',
    category: 'education',
  },
  {
    id: 'kotlaska',
    name: 'Komunitní centrum a zahrada Kotlaska',
    gloss: 'Kotlaska Community Centre and Garden',
    district: 'Libeň',
    area: prague(8),
    description: {
      cs: 'Rozlehlá zahrada se starým sadem, komunitními záhonky, programem pro děti a kulturními akcemi.',
      en: 'A spacious garden with an old orchard, community beds, a programme for children and cultural events.',
    },
    tags: ['orchard', 'children', 'events'],
    lat: 50.1071472,
    lon: 14.476603,
    sourceUrl: 'https://www.kckotlaska.cz/',
    illustration: '/gardens/kotlaska-illustrated.webp',
    category: 'community',
  },
  {
    id: 'troja',
    name: 'Komunitní zahrada Troja',
    gloss: 'Troja Community Garden',
    district: 'Podhoří',
    area: { cs: 'Praha-Troja', en: 'Prague-Troja' },
    description: {
      cs: 'Místo pro sousedy a rodiny, které spojuje pěstování, veřejný kompostér, knihobudku a týpí.',
      en: 'A place for neighbours and families that brings together growing, a public composter, a book exchange box and a tipi.',
    },
    tags: ['families', 'compost', 'book-box'],
    lat: 50.1267793,
    lon: 14.4078329,
    sourceUrl: 'https://www.komunitnizahrada.cz/',
    illustration: '/gardens/troja-illustrated.webp',
    category: 'community',
  },
  {
    id: 'mecislavka',
    name: 'Vnitroblok Mečislavka',
    gloss: 'Mečislavka Courtyard',
    district: 'Nusle',
    area: prague(4),
    description: {
      cs: 'Veřejně přístupná zahrada s vyvýšenými záhony, kompostérem, grilem a komunitní pecí na pizzu.',
      en: 'A publicly accessible garden with raised beds, a composter, a grill and a community pizza oven.',
    },
    tags: ['public', 'compost', 'oven'],
    lat: 50.0649253,
    lon: 14.4442846,
    sourceUrl: 'https://www.vnitrobloky.cz/mecislavka',
    illustration: '/gardens/mecislavka-illustrated.webp',
    category: 'courtyard',
  },
  {
    id: 'vidimova',
    name: 'Komunitní zahrada Vidimova',
    gloss: 'Vidimova Community Garden',
    district: 'Chodov',
    area: prague(11),
    description: {
      cs: 'Sousedská zahrada mezi domy, která vrací pěstování a společná setkání do sídliště.',
      en: 'A neighbourhood garden between apartment blocks that brings growing and shared gatherings back to the housing estate.',
    },
    tags: ['housing-estate', 'neighbourhood', 'beds'],
    lat: 50.0254095,
    lon: 14.5248575,
    sourceUrl: 'https://www.kokoza.cz/projekty/komunitni-zahrada-vidimova/',
    illustration: '/gardens/vidimova-illustrated.webp',
    category: 'community',
  },
  {
    id: 'prokopka',
    name: 'Zahrada Prokopka',
    gloss: 'Prokopka Garden',
    district: 'Velká Ohrada',
    area: prague(13),
    description: {
      cs: 'Komunitní zahrada na školním pozemku, kde spolek Pro kořínky pořádá pěstební i sousedské akce.',
      en: 'A community garden on school grounds where the association Pro kořínky holds growing and neighbourhood events.',
    },
    tags: ['school', 'workshops', 'neighbourhood'],
    lat: 50.0398094,
    lon: 14.3437361,
    sourceUrl: 'https://www.zahradaprokopka.cz/',
    illustration: '/gardens/prokopka-illustrated.webp',
    category: 'education',
  },
  {
    id: 'velky-haj',
    name: 'Komunitní zahrada Velký háj',
    gloss: 'Velký háj Community Garden',
    district: 'Krč',
    area: prague(4),
    description: {
      cs: 'Pětihektarová zahrada u lesa se záhony, pergolou, květnatou loukou, včelími úly a výběhem pro koně.',
      en: 'A five-hectare garden by the forest with beds, a pergola, a flower meadow, beehives and a horse paddock.',
    },
    tags: ['new-place', 'orchard', 'beds'],
    lat: 50.0327,
    lon: 14.4446,
    locationStatus: { cs: 'orientační poloha', en: 'approximate location' },
    sourceUrl:
      'https://tucnak.praha4.cz/06-2026/pestujte-ovoce-a-zeleninu-v-nove-komunitni-zahrade',
    illustration: '/gardens/velky-haj-illustrated.webp',
    category: 'nature',
  },
  {
    id: 'liboza',
    name: 'Komunitní zahrada LIBÓZA',
    gloss: 'LIBÓZA Community Garden',
    district: 'Liboc',
    area: prague(6),
    description: {
      cs: 'Sousedská zahrada u obory Hvězda s vyvýšenými záhony, jedlými keři, kompostem a dřevěným altánem.',
      en: 'A neighbourhood garden by the Hvězda game reserve with raised beds, edible shrubs, compost and a wooden gazebo.',
    },
    tags: ['beds', 'compost', 'events'],
    lat: 50.086202,
    lon: 14.328564,
    sourceUrl: 'https://www.napadprosestku.cz/napady/komunitni-zahrada-liboza/',
    illustration: '/gardens/liboza-illustrated.webp',
    category: 'community',
  },
  {
    id: 'prazelenina',
    name: 'Prazelenina',
    district: 'Holešovice',
    area: prague(7),
    description: {
      cs: 'Pěstitelský klub u Vltavy se společnými i vlastními záhony, nářadím a komunitní maringotkou.',
      en: 'A growers’ club by the Vltava with shared and individual beds, tools and a community caravan.',
    },
    tags: ['beds', 'events', 'neighbourhood'],
    lat: 50.106771,
    lon: 14.438531,
    sourceUrl: 'https://prazelenina.cz/',
    illustration: '/gardens/prazelenina-illustrated.webp',
    category: 'community',
  },
  {
    id: 'na-plani',
    name: 'Komunitní zahrada Na Pláni',
    gloss: 'Na Pláni Community Garden',
    district: 'Malvazinky',
    area: prague(5),
    description: {
      cs: 'Komunitní zahrada v obnoveném svažitém parku se zázemím pro sousedská setkání, cestami a výhledy.',
      en: 'A community garden in a restored hillside park with facilities for neighbourhood gatherings, paths and views.',
    },
    tags: ['public', 'events', 'neighbourhood'],
    lat: 50.0620561,
    lon: 14.3932811,
    sourceUrl: 'https://www.praha5.cz/praha-5-otevrela-novy-park-na-plani/',
    illustration: '/gardens/na-plani-illustrated.webp',
    category: 'nature',
  },
  {
    id: 'zizkovska-zahradka',
    name: 'Žižkovská komunitní zahrádka',
    gloss: 'Žižkov Community Garden',
    district: 'Žižkov',
    area: prague(3),
    description: {
      cs: 'Permakulturní zahrada se záhonky, dýňovištěm, jahodami, ovocnými stromy, kompostem a prostorem pro akce.',
      en: 'A permaculture garden with beds, a pumpkin patch, strawberries, fruit trees, compost and space for events.',
    },
    tags: ['beds', 'compost', 'events'],
    lat: 50.085611,
    lon: 14.465931,
    sourceUrl: 'https://www.zizkovskazahradka.cz/',
    illustration: '/gardens/zizkovska-zahradka-illustrated.webp',
    category: 'community',
  },
  {
    id: 'na-polske',
    name: 'Komunitní zahrada Na Polské',
    gloss: 'Na Polské Community Garden',
    district: 'Čimice',
    area: prague(8),
    description: {
      cs: 'Přírodní zahrada s jurtou, ekologickým pěstováním a venkovním zázemím pro děti.',
      en: 'A natural garden with a yurt, ecological growing and outdoor facilities for children.',
    },
    tags: ['children', 'beds', 'ecology'],
    lat: 50.13762,
    lon: 14.4386,
    sourceUrl: 'https://www.3udoli.cz/komunitni-zahrada/',
    illustration: '/gardens/na-polske-illustrated.webp',
    category: 'education',
  },
];

/** Editorial placement on storybook-v6, not a geographic projection.
 * Coordinates for navigation remain untouched. Outlying districts are compressed
 * into the atlas; every marker and detail explicitly identify this convention. */
export const artPositions: Record<string, { x: number; y: number }> = {
  metrofarm: { x: 53.5, y: 13.5 },
  troja: { x: 61, y: 12 },
  'na-polske': { x: 70, y: 10 },
  prales: { x: 86, y: 17 },
  kotlaska: { x: 76, y: 29 },
  prazelenina: { x: 62, y: 24 },
  liboza: { x: 15, y: 35 },
  'na-plani': { x: 27, y: 64 },
  prokopka: { x: 18, y: 82 },
  'zizkovska-zahradka': { x: 77, y: 46 },
  mecislavka: { x: 64, y: 68 },
  'velky-haj': { x: 58, y: 86 },
  vidimova: { x: 81, y: 80 },
};
export const gardens: Garden[] = gardenRecords.map((garden) => ({
  ...garden,
  artPosition: artPositions[garden.id],
  visit: gardenVisits[garden.id as keyof typeof gardenVisits],
}));
export type FilterId = 'children' | 'accessible' | 'compost' | 'events';
export const filterOptions: Array<{
  id: FilterId;
  label: Localized;
  matches: (garden: Garden) => boolean;
}> = [
  {
    id: 'children',
    label: { cs: 'Pro děti', en: 'For children' },
    matches: (garden) =>
      garden.tags.includes('children') || garden.tags.includes('families'),
  },
  {
    id: 'accessible',
    label: { cs: 'Bezbariérové', en: 'Wheelchair accessible' },
    matches: (garden) => garden.tags.includes('accessible'),
  },
  {
    id: 'compost',
    label: { cs: 'Kompost', en: 'Compost' },
    matches: (garden) => garden.tags.includes('compost'),
  },
  {
    id: 'events',
    label: { cs: 'Akce', en: 'Events' },
    matches: (garden) =>
      garden.tags.includes('events') || garden.tags.includes('workshops'),
  },
];

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('cs')
    .trim();
}

/** Words of both languages are searchable regardless of the interface language. */
function searchHaystack(garden: Garden) {
  const locales: Locale[] = ['cs', 'en'];
  return normalizeSearch(
    [
      garden.name,
      garden.gloss ?? '',
      garden.district,
      ...locales.map((locale) => garden.area[locale]),
      ...locales.map((locale) => categoryLabels[garden.category][locale]),
      ...garden.tags.flatMap((tag) =>
        locales.map((locale) => tagLabels[tag][locale]),
      ),
    ].join(' '),
  );
}
export function matchesSearch(garden: Garden, query: string) {
  const haystack = searchHaystack(garden);
  return normalizeSearch(query)
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}
export function navigationUrl(garden: Garden) {
  return (
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(garden.lat + ',' + garden.lon)
  );
}

export function filterGardenCatalogue(
  query: string,
  activeFilters: readonly FilterId[],
  category: GardenCategory | null,
) {
  return gardens.filter(
    (garden) =>
      matchesSearch(garden, query) &&
      (!category || garden.category === category) &&
      activeFilters.every((id) =>
        filterOptions.find((option) => option.id === id)?.matches(garden),
      ),
  );
}
