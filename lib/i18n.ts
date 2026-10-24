/**
 * Lightweight localisation for the atlas: a typed dictionary, a locale
 * helper for bilingual content fields and the storage key the provider uses.
 *
 * Interface strings live here. Catalogue content (garden descriptions, visit
 * facts) is bilingual at the data level, see `lib/gardens.ts` and
 * `lib/garden-visits.ts`, and resolved with `pick()`.
 *
 * English is the default; Czech is selected with the switcher in the header
 * or by a stored preference (`zahrady.lang`). No dependency is needed.
 */
export const locales = ['en', 'cs'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'zahrady.lang';

/** A value written in both languages. */
export type Localized<T = string> = Readonly<Record<Locale, T>>;

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (locales as readonly string[]).includes(value)
  );
}

/** Resolve a bilingual field for a locale. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

/** Czech counts need three plural forms; English needs two. */
export function plural(
  count: number,
  forms: { one: string; few: string; many: string },
): string {
  if (count === 1) return forms.one;
  if (count >= 2 && count <= 4) return forms.few;
  return forms.many;
}

const englishMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Format an ISO date (YYYY-MM-DD) the way each language writes dates:
 * `6. 9. 2026` in Czech, `6 September 2026` in English. Deterministic on the
 * server and in the browser, so hydration never disagrees.
 */
export function formatDate(isoDate: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (locale === 'cs') return `${Number(day)}. ${Number(month)}. ${year}`;
  return `${Number(day)} ${englishMonths[monthIndex] ?? month} ${year}`;
}

/* The English dictionary defines the shape; Czech must provide every key. */
const en = {
  langName: 'English',
  langSwitch: {
    label: 'Language',
    announce: 'Language changed to English.',
  },
  meta: {
    title: 'Gardens of Prague — a living map of community gardens',
    tagline: 'Prague grows together.',
  },
  skipLink: 'Skip the map and show the list of gardens',
  map: {
    canvasLabel: 'Illustrated map of Prague',
    artAlt:
      'A wide storybook-style illustrated view of Prague with enlarged landmarks and the Vltava river',
    loading: 'Loading the map…',
    markersLegend: 'Gardens on the map',
    markerLabel: (name: string, area: string) =>
      `${name}, ${area}, open details`,
    planeRole: 'interactive map',
    planeLabel:
      'Map: arrow keys pan, plus and minus zoom, the 0 key shows the whole map',
    zoomLegend: 'Map zoom',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    fullscreenEnter: 'Show the whole map in full screen',
    fullscreenExit: 'Return the map to its frame',
    fullscreenEnterShort: 'Full map',
    fullscreenExitShort: 'Exit full map',
    resetView: 'Reset zoom and position to the default overview',
    resetViewTitle: 'Default overview (key 0)',
    fullscreenOn: 'The map is shown in full screen.',
    fullscreenFailed: 'Full screen could not be opened. Please try again.',
  },
  header: {
    home: 'Zahrady Prahy, home',
    brand: 'Zahrady',
    brandSub: 'Prahy',
    searchPlaceholder: 'Search a garden or district…',
    searchLabel: 'Search a garden or district',
    clearSearch: 'Clear search',
    placesCount: (count: number) =>
      `${count} ${count === 1 ? 'place' : 'places'}`,
    list: 'List',
    listOpen: 'Show the list of gardens',
    listClose: 'Close the list of gardens',
    filters: 'Filters',
    filtersLabel: (active: number) =>
      `Garden filters${active ? `, ${active} active` : ''}`,
    add: 'Add a place · soon',
    addLabel: 'Adding gardens is being prepared',
  },
  sound: {
    play: 'Play the soundscape Gardens above the Vltava',
    pause: 'Pause the soundscape Gardens above the Vltava',
    playShort: 'Play the soundscape',
    pauseShort: 'Pause the soundscape',
    loading: 'Loading the soundscape…',
    error: 'The sound could not be played.',
    playing: 'The soundscape is playing.',
  },
  filterTray: {
    title: 'Show places',
    clearAll: 'Clear all',
  },
  empty: {
    title: 'Nothing found.',
    hint: 'Try another name or district.',
    reset: 'Clear search and filters',
  },
  preview: {
    close: 'Close the garden details',
    illustrationAlt: (name: string) =>
      `Artistic illustration of the garden ${name}, not an accurate plan`,
    illustrationCaption: 'Artistic illustration',
    publicSource: 'public source',
    showOnMap: 'Show on the illustrated map',
    tagsLabel: 'Garden features',
    visit: 'Visiting',
    sourcesChecked: (date: string) => `Sources checked ${date}`,
    when: 'When to come',
    access: 'Access',
    where: 'Where',
    participation: 'Taking part',
    disclaimer:
      'According to the listed sources. Check for changes before you go; the position on the drawing is approximate',
    disclaimerAlsoApprox: ' (so is the location)',
    openInMap: 'Open in a map',
    share: 'Copy a link to this garden',
    shareCopied: 'Link copied.',
    shareFallback: 'You can copy the link from the address bar.',
    sourceLink: 'Source and visiting information',
  },
  footer: {
    discovered: (count: number) =>
      `${count} ${count === 1 ? 'place discovered' : 'places discovered'}`,
    motionSystem: 'Motion reduced by your system',
    motionSystemTitle: 'Motion is off according to your system settings',
    motionResume: 'Animate the map',
    motionPause: 'Pause motion',
    osm: '© OpenStreetMap contributors',
  },
  directory: {
    label: 'List of gardens',
    eyebrow: 'Green places of Prague',
    title: 'Where to today?',
    close: 'Close the list',
    summary: (shown: number, total: number) => `${shown} of ${total} places`,
    noMatch: 'No place matches your selection. Try removing a filter.',
    footnote: 'Pick a place and plan your visit.',
  },
  caption: {
    title: 'Zahrady Prahy',
    subtitle: 'Gardens of Prague · Prague grows together.',
    about: 'About the map Zahrady Prahy',
  },
  intro: {
    label: 'Zahrady Prahy postcard',
    controlsHelp:
      'Arrow keys nudge or resize the postcard. Hold Shift for larger steps.',
    move: 'Move the postcard around the map',
    moveShort: 'Move',
    openStory: 'Open the story of the map',
    expand: 'Expand the Zahrady Prahy postcard',
    minimize: 'Minimise the Zahrady Prahy postcard',
    resize: 'Resize the postcard',
    resizeShort: 'Resize',
    legendLabel: 'Legend of garden types',
    legendTitle: 'Character of the place',
    note: 'Illustrated atlas · positions on the drawing are approximate.',
  },
  addDialog: {
    eyebrow: 'The map grows step by step',
    title: 'Suggestions are being prepared.',
    description:
      'New places can be suggested once their storage and personal review are ready. For now we accept no tips and no contact details here.',
    back: 'Back to exploring',
  },
  aboutDialog: {
    eyebrow: 'How the map works',
    titleStart: 'Every garden is',
    titleAccent: 'a small living world.',
    description:
      'The points on the map refer to real places in Prague. We pick them from public sources, listed with every garden. The drawing is an artistic atlas, not a navigation map. For the real location use the link in the details.',
    step1Title: 'Explore',
    step1Text: 'Search by name, district or features.',
    step2Title: 'Open a place',
    step2Text: 'See the illustration, the source and the real location.',
    step3Title: 'New places, gradually',
    step3Text: 'Accepting and reviewing your tips is being prepared.',
  },
  dialog: {
    close: 'Close',
  },
};

export type Dictionary = typeof en;

const cs: Dictionary = {
  langName: 'Čeština',
  langSwitch: {
    label: 'Jazyk',
    announce: 'Jazyk přepnut na češtinu.',
  },
  meta: {
    title: 'Zahrady Prahy — živá mapa komunitních zahrad',
    tagline: 'Praha roste společně.',
  },
  skipLink: 'Přeskočit mapu a zobrazit seznam zahrad',
  map: {
    canvasLabel: 'Ilustrovaná mapa Prahy',
    artAlt:
      'Široký pohádkově ilustrovaný pohled na Prahu se zvětšenými památkami a Vltavou',
    loading: 'Načítám mapu…',
    markersLegend: 'Zahrady na mapě',
    markerLabel: (name: string, area: string) =>
      `${name}, ${area}, otevřít detail`,
    planeRole: 'interaktivní mapa',
    planeLabel:
      'Mapa: šipkami posun, plus a minus přiblížení, klávesou 0 celá mapa',
    zoomLegend: 'Přiblížení mapy',
    zoomOut: 'Oddálit mapu',
    zoomIn: 'Přiblížit mapu',
    fullscreenEnter: 'Zobrazit celou mapu přes celou obrazovku',
    fullscreenExit: 'Vrátit mapu do rámu',
    fullscreenEnterShort: 'Celá mapa',
    fullscreenExitShort: 'Vrátit mapu',
    resetView: 'Vrátit přiblížení a posun na výchozí přehled',
    resetViewTitle: 'Výchozí přehled (klávesa 0)',
    fullscreenOn: 'Mapa je zobrazena přes celou obrazovku.',
    fullscreenFailed:
      'Celou obrazovku se nepodařilo otevřít. Zkuste to prosím znovu.',
  },
  header: {
    home: 'Zahrady Prahy, domů',
    brand: 'Zahrady',
    brandSub: 'Prahy',
    searchPlaceholder: 'Hledat zahradu nebo čtvrť…',
    searchLabel: 'Hledat zahradu nebo čtvrť',
    clearSearch: 'Vymazat hledání',
    placesCount: (count: number) =>
      `${count} ${plural(count, { one: 'místo', few: 'místa', many: 'míst' })}`,
    list: 'Seznam',
    listOpen: 'Zobrazit seznam zahrad',
    listClose: 'Zavřít seznam zahrad',
    filters: 'Filtry',
    filtersLabel: (active: number) =>
      `Filtry zahrad${active ? `, ${active} aktivní` : ''}`,
    add: 'Přidat místo · brzy',
    addLabel: 'Přidávání zahrad připravujeme',
  },
  sound: {
    play: 'Přehrát zvukovou krajinu Zahrady nad Vltavou',
    pause: 'Pozastavit zvukovou krajinu Zahrady nad Vltavou',
    playShort: 'Přehrát zvukovou krajinu',
    pauseShort: 'Pozastavit zvukovou krajinu',
    loading: 'Načítám zvukovou krajinu…',
    error: 'Zvuk se nepodařilo přehrát.',
    playing: 'Zvuková krajina hraje.',
  },
  filterTray: {
    title: 'Ukázat místa',
    clearAll: 'Zrušit vše',
  },
  empty: {
    title: 'Nic jsme nenašli.',
    hint: 'Zkuste jiný název nebo čtvrť.',
    reset: 'Zrušit hledání a filtry',
  },
  preview: {
    close: 'Zavřít detail zahrady',
    illustrationAlt: (name: string) =>
      `Umělecká ilustrace zahrady ${name}, nikoli přesný plán`,
    illustrationCaption: 'Umělecká ilustrace',
    publicSource: 'veřejný zdroj',
    showOnMap: 'Ukázat na kreslené mapě',
    tagsLabel: 'Vlastnosti zahrady',
    visit: 'Návštěva',
    sourcesChecked: (date: string) => `Zdroje zkontrolovány ${date}`,
    when: 'Kdy přijít',
    access: 'Vstup',
    where: 'Kde',
    participation: 'Zapojení',
    disclaimer:
      'Podle uvedených zdrojů. Před cestou ověřte případné změny; poloha na kresbě je orientační',
    disclaimerAlsoApprox: ' (také přibližná)',
    openInMap: 'Otevřít v mapě',
    share: 'Zkopírovat odkaz na zahradu',
    shareCopied: 'Odkaz zkopírován.',
    shareFallback: 'Odkaz můžete zkopírovat z adresního řádku.',
    sourceLink: 'Zdroj a informace o návštěvě',
  },
  footer: {
    discovered: (count: number) =>
      `${count} ${plural(count, {
        one: 'objevené místo',
        few: 'objevená místa',
        many: 'objevených míst',
      })}`,
    motionSystem: 'Pohyb omezen systémem',
    motionSystemTitle: 'Pohyb je vypnutý podle nastavení systému',
    motionResume: 'Rozpohybovat mapu',
    motionPause: 'Pozastavit pohyb',
    osm: '© Přispěvatelé OpenStreetMap',
  },
  directory: {
    label: 'Seznam zahrad',
    eyebrow: 'Zelená místa Prahy',
    title: 'Kam dnes?',
    close: 'Zavřít seznam',
    summary: (shown: number, total: number) => `${shown} z ${total} míst`,
    noMatch: 'Žádné místo neodpovídá výběru. Zkuste ubrat některý filtr.',
    footnote: 'Vyberte místo a naplánujte si návštěvu.',
  },
  caption: {
    title: 'Zahrady Prahy',
    subtitle: 'Praha roste společně.',
    about: 'O mapě Zahrady Prahy',
  },
  intro: {
    label: 'Pohlednice Zahrady Prahy',
    controlsHelp:
      'Šipkami ovládáte jemný posun nebo změnu velikosti. S klávesou Shift se panel mění po větších krocích.',
    move: 'Přesunout pohlednici po mapě',
    moveShort: 'Přesunout',
    openStory: 'Otevřít příběh mapy',
    expand: 'Rozbalit pohlednici Zahrady Prahy',
    minimize: 'Minimalizovat pohlednici Zahrady Prahy',
    resize: 'Změnit velikost pohlednice',
    resizeShort: 'Změnit velikost',
    legendLabel: 'Legenda typů zahrad',
    legendTitle: 'Charakter místa',
    note: 'Ilustrovaný atlas · polohy na kresbě jsou orientační.',
  },
  addDialog: {
    eyebrow: 'Mapa roste postupně',
    title: 'Přijímání tipů připravujeme.',
    description:
      'Nová místa bude možné navrhovat, až bude připravené jejich ukládání a osobní schvalování. Zatím zde žádné tipy ani kontaktní údaje nepřijímáme.',
    back: 'Zpět k objevování',
  },
  aboutDialog: {
    eyebrow: 'Jak mapa funguje',
    titleStart: 'Každá zahrada je',
    titleAccent: 'malý živý svět.',
    description:
      'Body na mapě odkazují na skutečná pražská místa. Vybíráme je z veřejných zdrojů, které najdete u každé zahrady. Kresba je umělecký atlas, ne navigační mapa. Pro skutečnou polohu použijte odkaz v detailu.',
    step1Title: 'Objevujte',
    step1Text: 'Hledejte podle názvu, čtvrti nebo vlastností.',
    step2Title: 'Rozklikněte místo',
    step2Text: 'Prohlédněte si ilustraci, zdroj a skutečnou polohu.',
    step3Title: 'Nová místa postupně',
    step3Text: 'Přijímání a schvalování vašich tipů připravujeme.',
  },
  dialog: {
    close: 'Zavřít',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, cs };

/** Read the stored preference; `null` when nothing valid is stored. */
export function readStoredLocale(
  storage: Pick<Storage, 'getItem'>,
): Locale | null {
  try {
    const value = storage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}
