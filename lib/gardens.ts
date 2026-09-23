import { gardenVisits, type GardenVisit } from './garden-visits.ts';

export type GardenCategory =
  | 'community'
  | 'urban-farm'
  | 'education'
  | 'courtyard'
  | 'nature';

export type Garden = {
  artPosition: { x: number; y: number };
  id: string;
  name: string;
  district: string;
  area: string;
  description: string;
  tags: string[];
  lat: number;
  lon: number;
  locationStatus?: string;
  sourceUrl: string;
  illustration: string;
  category: GardenCategory;
  visit: GardenVisit;
};

const gardenRecords: Omit<Garden, 'artPosition' | 'visit'>[] = [
  {
    id: 'metrofarm',
    name: 'MetroFarm Císařský ostrov',
    district: 'Císařský ostrov',
    area: 'Praha 7',
    description:
      'Komunitní zahrada a městská farma s vlastními záhonky, společným políčkem, kompostem i zvířaty.',
    tags: ['záhonky', 'dobrovolnictví', 'zvířata', 'kompost'],
    lat: 50.1121511,
    lon: 14.4147114,
    sourceUrl: 'https://www.metrofarm.cz/metrofarm/',
    illustration: '/gardens/metrofarm-illustrated.webp',
    category: 'urban-farm',
  },
  {
    id: 'prales',
    name: 'Komunitní zahrada Prales',
    district: 'Kbely',
    area: 'Praha 19',
    description:
      'Bezbariérová zahrada ekocentra s vyvýšenými záhony, foliovníkem, dešťovou vodou a kompostem.',
    tags: ['bezbariérové', 'kompost', 'ekocentrum'],
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
    district: 'Libeň',
    area: 'Praha 8',
    description:
      'Rozlehlá zahrada se starým sadem, komunitními záhonky, programem pro děti a kulturními akcemi.',
    tags: ['sad', 'pro děti', 'akce'],
    lat: 50.1071472,
    lon: 14.476603,
    sourceUrl: 'https://www.kckotlaska.cz/',
    illustration: '/gardens/kotlaska-illustrated.webp',
    category: 'community',
  },
  {
    id: 'troja',
    name: 'Komunitní zahrada Troja',
    district: 'Podhoří',
    area: 'Praha-Troja',
    description:
      'Místo pro sousedy a rodiny, které spojuje pěstování, veřejný kompostér, knihobudku a týpí.',
    tags: ['rodiny', 'kompost', 'knihobudka'],
    lat: 50.1267793,
    lon: 14.4078329,
    sourceUrl: 'https://www.komunitnizahrada.cz/',
    illustration: '/gardens/troja-illustrated.webp',
    category: 'community',
  },
  {
    id: 'mecislavka',
    name: 'Vnitroblok Mečislavka',
    district: 'Nusle',
    area: 'Praha 4',
    description:
      'Veřejně přístupná zahrada s vyvýšenými záhony, kompostérem, grilem a komunitní pecí na pizzu.',
    tags: ['veřejná', 'kompost', 'pec'],
    lat: 50.0649253,
    lon: 14.4442846,
    sourceUrl: 'https://www.vnitrobloky.cz/mecislavka',
    illustration: '/gardens/mecislavka-illustrated.webp',
    category: 'courtyard',
  },
  {
    id: 'vidimova',
    name: 'Komunitní zahrada Vidimova',
    district: 'Chodov',
    area: 'Praha 11',
    description:
      'Sousedská zahrada mezi domy, která vrací pěstování a společná setkání do sídliště.',
    tags: ['sídliště', 'sousedství', 'záhony'],
    lat: 50.0254095,
    lon: 14.5248575,
    sourceUrl: 'https://www.kokoza.cz/projekty/komunitni-zahrada-vidimova/',
    illustration: '/gardens/vidimova-illustrated.webp',
    category: 'community',
  },
  {
    id: 'prokopka',
    name: 'Zahrada Prokopka',
    district: 'Velká Ohrada',
    area: 'Praha 13',
    description:
      'Komunitní zahrada na školním pozemku, kde spolek Pro kořínky pořádá pěstební i sousedské akce.',
    tags: ['školní', 'workshopy', 'sousedství'],
    lat: 50.0398094,
    lon: 14.3437361,
    sourceUrl: 'https://www.zahradaprokopka.cz/',
    illustration: '/gardens/prokopka-illustrated.webp',
    category: 'education',
  },
  {
    id: 'velky-haj',
    name: 'Komunitní zahrada Velký háj',
    district: 'Krč',
    area: 'Praha 4',
    description:
      'Pětihektarová zahrada u lesa se záhony, pergolou, květnatou loukou, včelími úly a výběhem pro koně.',
    tags: ['nové místo', 'sad', 'záhony'],
    lat: 50.0327,
    lon: 14.4446,
    locationStatus: 'orientační poloha',
    sourceUrl:
      'https://tucnak.praha4.cz/06-2026/pestujte-ovoce-a-zeleninu-v-nove-komunitni-zahrade',
    illustration: '/gardens/velky-haj-illustrated.webp',
    category: 'nature',
  },
  {
    id: 'liboza',
    name: 'Komunitní zahrada LIBÓZA',
    district: 'Liboc',
    area: 'Praha 6',
    description:
      'Sousedská zahrada u obory Hvězda s vyvýšenými záhony, jedlými keři, kompostem a dřevěným altánem.',
    tags: ['záhony', 'kompost', 'akce'],
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
    area: 'Praha 7',
    description:
      'Pěstitelský klub u Vltavy se společnými i vlastními záhony, nářadím a komunitní maringotkou.',
    tags: ['záhony', 'akce', 'sousedství'],
    lat: 50.106771,
    lon: 14.438531,
    sourceUrl: 'https://prazelenina.cz/',
    illustration: '/gardens/prazelenina-illustrated.webp',
    category: 'community',
  },
  {
    id: 'na-plani',
    name: 'Komunitní zahrada Na Pláni',
    district: 'Malvazinky',
    area: 'Praha 5',
    description:
      'Komunitní zahrada v obnoveném svažitém parku se zázemím pro sousedská setkání, cestami a výhledy.',
    tags: ['veřejná', 'akce', 'sousedství'],
    lat: 50.0620561,
    lon: 14.3932811,
    sourceUrl: 'https://www.praha5.cz/praha-5-otevrela-novy-park-na-plani/',
    illustration: '/gardens/na-plani-illustrated.webp',
    category: 'nature',
  },
  {
    id: 'zizkovska-zahradka',
    name: 'Žižkovská komunitní zahrádka',
    district: 'Žižkov',
    area: 'Praha 3',
    description:
      'Permakulturní zahrada se záhonky, dýňovištěm, jahodami, ovocnými stromy, kompostem a prostorem pro akce.',
    tags: ['záhony', 'kompost', 'akce'],
    lat: 50.085611,
    lon: 14.465931,
    sourceUrl: 'https://www.zizkovskazahradka.cz/',
    illustration: '/gardens/zizkovska-zahradka-illustrated.webp',
    category: 'community',
  },
  {
    id: 'na-polske',
    name: 'Komunitní zahrada Na Polské',
    district: 'Čimice',
    area: 'Praha 8',
    description:
      'Přírodní zahrada s jurtou, ekologickým pěstováním a venkovním zázemím pro děti.',
    tags: ['pro děti', 'záhony', 'ekologie'],
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
  label: string;
  matches: (garden: Garden) => boolean;
}> = [
  {
    id: 'children',
    label: 'Pro děti',
    matches: (garden) =>
      garden.tags.includes('pro děti') || garden.tags.includes('rodiny'),
  },
  {
    id: 'accessible',
    label: 'Bezbariérové',
    matches: (garden) => garden.tags.includes('bezbariérové'),
  },
  {
    id: 'compost',
    label: 'Kompost',
    matches: (garden) => garden.tags.includes('kompost'),
  },
  {
    id: 'events',
    label: 'Akce',
    matches: (garden) =>
      garden.tags.includes('akce') || garden.tags.includes('workshopy'),
  },
];

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('cs')
    .trim();
}
export function matchesSearch(garden: Garden, query: string) {
  const haystack = normalizeSearch(
    [garden.name, garden.district, garden.area, ...garden.tags].join(' '),
  );
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
