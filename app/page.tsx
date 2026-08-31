'use client';

import { useMemo, useRef, useState, type CSSProperties, type SyntheticEvent } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Leaf,
  MapPin,
  Music2,
  Pause,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Check,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Garden = {
  id: string;
  name: string;
  district: string;
  area: string;
  description: string;
  tags: string[];
  x: number;
  y: number;
  accent: 'lime' | 'gold' | 'mint';
  sourceUrl: string;
};

const gardens: Garden[] = [
  {
    id: 'metrofarm',
    name: 'MetroFarm Císařský ostrov',
    district: 'Císařský ostrov',
    area: 'Praha 7',
    description:
      'Komunitní zahrada a městská farma s vlastními záhonky, společným políčkem, kompostem i zvířaty.',
    tags: ['záhonky', 'dobrovolnictví', 'zvířata'],
    x: 58,
    y: 26,
    accent: 'lime',
    sourceUrl: 'https://www.metrofarm.cz/metrofarm/',
  },
  {
    id: 'prales',
    name: 'Komunitní zahrada Prales',
    district: 'Kbely',
    area: 'Praha 19',
    description:
      'Bezbariérová zahrada ekocentra s vyvýšenými záhony, foliovníkem, dešťovou vodou a kompostem.',
    tags: ['bezbariérové', 'kompost', 'ekocentrum'],
    x: 88,
    y: 23,
    accent: 'mint',
    sourceUrl:
      'https://lesypraha.cz/vzdelavani/ekocentrum-prales/komunitni-zahrada/',
  },
  {
    id: 'kotlaska',
    name: 'Komunitní centrum a zahrada Kotlaska',
    district: 'Libeň',
    area: 'Praha 8',
    description:
      'Rozlehlá zahrada se starým sadem, komunitními záhonky, programem pro děti a kulturními akcemi.',
    tags: ['sad', 'pro děti', 'akce'],
    x: 75,
    y: 35,
    accent: 'gold',
    sourceUrl: 'https://www.kckotlaska.cz/',
  },
  {
    id: 'troja',
    name: 'Komunitní zahrada Troja',
    district: 'Podhoří',
    area: 'Praha-Troja',
    description:
      'Místo pro sousedy a rodiny, které spojuje pěstování, veřejný kompostér, knihobudku a týpí.',
    tags: ['rodiny', 'kompost', 'knihobudka'],
    x: 66,
    y: 18,
    accent: 'lime',
    sourceUrl: 'https://www.komunitnizahrada.cz/',
  },
  {
    id: 'mecislavka',
    name: 'Vnitroblok Mečislavka',
    district: 'Nusle',
    area: 'Praha 4',
    description:
      'Veřejně přístupná zahrada s vyvýšenými záhony, kompostérem, grilem a komunitní pecí na pizzu.',
    tags: ['veřejná', 'kompost', 'pec'],
    x: 57,
    y: 66,
    accent: 'gold',
    sourceUrl: 'https://www.mapko.cz/4519-vnitroblok-mecislavova',
  },
  {
    id: 'vidimova',
    name: 'Komunitní zahrada Vidimova',
    district: 'Chodov',
    area: 'Praha 11',
    description:
      'Sousedská zahrada mezi domy, která vrací pěstování a společná setkání do sídliště.',
    tags: ['sídliště', 'sousedství', 'záhony'],
    x: 65,
    y: 82,
    accent: 'mint',
    sourceUrl: 'https://www.mapko.cz/4432-komunitni-zahrada-vidimova',
  },
  {
    id: 'prokopka',
    name: 'Zahrada Prokopka',
    district: 'Velká Ohrada',
    area: 'Praha 13',
    description:
      'Komunitní zahrada na školním pozemku, kde spolek Pro kořínky pořádá pěstební i sousedské akce.',
    tags: ['školní', 'workshopy', 'sousedství'],
    x: 23,
    y: 75,
    accent: 'lime',
    sourceUrl: 'https://www.zahradaprokopka.cz/',
  },
  {
    id: 'velky-haj',
    name: 'Komunitní zahrada Velký háj',
    district: 'Krč',
    area: 'Praha 4',
    description:
      'Nový velkorysý projekt mezi Novodvorskou a Chateau Havel se sadem, společným zázemím a záhony.',
    tags: ['nové místo', 'sad', 'záhony'],
    x: 53,
    y: 86,
    accent: 'gold',
    sourceUrl:
      'https://www.kokoza.cz/komunitni-zahrady/dve-nove-komunitni-zahrady/',
  },
];

type FilterId = 'children' | 'accessible' | 'compost' | 'events';

const filterOptions: Array<{
  id: FilterId;
  label: string;
  matches: (garden: Garden) => boolean;
}> = [
  {
    id: 'children',
    label: 'Pro děti',
    matches: (garden) => garden.tags.includes('pro děti') || garden.tags.includes('rodiny'),
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
    matches: (garden) => garden.tags.includes('akce') || garden.tags.includes('workshopy'),
  },
];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(gardens[0].id);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<FilterId>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [soundError, setSoundError] = useState(false);

  const filteredGardens = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('cs');
    return gardens.filter((garden) => {
      const matchesQuery =
        !normalizedQuery ||
        [garden.name, garden.district, garden.area, ...garden.tags]
          .join(' ')
          .toLocaleLowerCase('cs')
          .includes(normalizedQuery);
      const matchesFilters = [...activeFilters].every((activeId) =>
        filterOptions.find((option) => option.id === activeId)?.matches(garden),
      );

      return matchesQuery && matchesFilters;
    });
  }, [activeFilters, query]);

  const selectedGarden =
    filteredGardens.find((garden) => garden.id === selectedId) ?? null;

  function toggleFilter(filterId: FilterId) {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(filterId)) next.delete(filterId);
      else next.add(filterId);
      return next;
    });
  }

  function submitGarden(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  async function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;

    setSoundError(false);

    if (!audio.paused) {
      audio.pause();
      return;
    }

    audio.volume = 0.38;

    try {
      await audio.play();
    } catch {
      setIsSoundPlaying(false);
      setSoundError(true);
    }
  }

  return (
    <main className="map-experience">
      <a className="skip-link" href="#garden-list">
        Přeskočit mapu a zobrazit seznam zahrad
      </a>

      <div className="map-canvas" aria-label="Ilustrovaná mapa Prahy">
        <Image
          className="map-art"
          src="/prague-garden-map.png"
          alt="Ručně malovaná ptačí perspektiva Prahy s Vltavou, mosty a zelenými čtvrtěmi"
          fill
          priority
          sizes="100vw"
        />
        <div className="map-wash" aria-hidden="true" />
        <div className="paper-grain" aria-hidden="true" />

        <header className="map-header">
          <a className="brand" href="#top" aria-label="Zahrady Prahy, domů">
            <span className="brand-mark" aria-hidden="true">
              <Leaf />
            </span>
            <span>
              <strong>Zahrady</strong>
              <small>Prahy</small>
            </span>
          </a>

          <search className="search-shell">
            <Search aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hledat zahradu nebo čtvrť…"
              aria-label="Hledat zahradu nebo čtvrť"
            />
            {query ? (
              <button
                className="clear-search"
                type="button"
                onClick={() => setQuery('')}
                aria-label="Vymazat hledání"
              >
                <X />
              </button>
            ) : (
              <span className="search-count">{filteredGardens.length} míst</span>
            )}
          </search>

          <div className="header-actions">
            <Button
              className="glass-button"
              variant="outline"
              size="lg"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="garden-filters"
            >
              <SlidersHorizontal />
              <span>Filtry</span>
            </Button>
            <Button className="add-button" size="lg" onClick={() => setAddOpen(true)}>
              <Plus />
              <span>Přidat zahradu</span>
            </Button>
          </div>
        </header>

        <div
          className={`filter-tray${filtersOpen ? ' is-open' : ''}`}
          id="garden-filters"
          aria-hidden={!filtersOpen}
        >
          <span className="filter-title">Ukázat místa</span>
          {filterOptions.map((option) => {
            const isActive = activeFilters.has(option.id);
            return (
              <button
                key={option.id}
                type="button"
                className={isActive ? 'is-active' : undefined}
                onClick={() => toggleFilter(option.id)}
                aria-pressed={isActive}
                tabIndex={filtersOpen ? 0 : -1}
              >
                {isActive && <Check />}
                {option.label}
              </button>
            );
          })}
          {activeFilters.size > 0 && (
            <button
              className="clear-filters"
              type="button"
              onClick={() => setActiveFilters(new Set())}
              tabIndex={filtersOpen ? 0 : -1}
            >
              Zrušit vše
            </button>
          )}
        </div>

        <section className="intro-card" id="top" aria-labelledby="intro-title">
          <span className="eyebrow">
            <Sparkles /> živá mapa města
          </span>
          <h1 id="intro-title">Praha roste společně.</h1>
          <p>Objevte místa, kde se sousedé potkávají a město kvete.</p>
          <div className={`sound-control${isSoundPlaying ? ' is-playing' : ''}`}>
            <Music2 aria-hidden="true" />
            <span className="sound-copy">
              <small>Zvuková krajina</small>
              <strong>Mezi listím a kamenem</strong>
            </span>
            <button
              className="sound-toggle"
              type="button"
              onClick={toggleSound}
              aria-label={
                isSoundPlaying
                  ? 'Pozastavit skladbu Mezi listím a kamenem'
                  : 'Přehrát skladbu Mezi listím a kamenem'
              }
              aria-pressed={isSoundPlaying}
            >
              {isSoundPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
            {/* Instrumentální zvuková krajina neobsahuje mluvené slovo. */}
            {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              ref={audioRef}
              loop
              preload="none"
              onPlay={() => setIsSoundPlaying(true)}
              onPause={() => setIsSoundPlaying(false)}
              onError={() => {
                setIsSoundPlaying(false);
                setSoundError(true);
              }}
            >
              <source src="/audio/mezi-listim-a-kamenem.m4a" type="audio/mp4" />
              <source src="/audio/mezi-listim-a-kamenem.mp3" type="audio/mpeg" />
            </audio>
          </div>
          <output className="sound-status" aria-live="polite">
            {soundError ? 'Zvuk se nepodařilo přehrát.' : ''}
          </output>
          <button className="text-link" type="button" onClick={() => setAboutOpen(true)}>
            Jak mapa funguje <ArrowRight />
          </button>
        </section>

        <div className="garden-markers" aria-label="Zahrady na mapě">
          {filteredGardens.map((garden, index) => {
            const isSelected = selectedId === garden.id;

            return (
              <button
                key={garden.id}
                type="button"
                className={`garden-marker marker-${garden.accent}${
                  isSelected ? ' is-selected' : ''
                }`}
                style={
                  {
                    left: `${garden.x}%`,
                    top: `${garden.y}%`,
                    '--marker-delay': `${index * -0.72}s`,
                  } as CSSProperties
                }
                onClick={() => setSelectedId(garden.id)}
                aria-label={`${garden.name}, ${garden.area}, otevřít detail`}
                aria-pressed={isSelected}
              >
                <span className="marker-aura" aria-hidden="true" />
                <span className="marker-core" aria-hidden="true">
                  <Sprout />
                </span>
                <span className="marker-label">
                  <strong>{garden.name}</strong>
                  <small>{garden.district}</small>
                </span>
              </button>
            );
          })}
        </div>

        {filteredGardens.length === 0 && (
          <output className="empty-state" aria-live="polite">
            <Sprout aria-hidden="true" />
            <strong>Nic jsme nenašli.</strong>
            <span>Zkuste jiný název nebo čtvrť.</span>
          </output>
        )}

        {selectedGarden && (
          <aside className="garden-preview" aria-live="polite">
            <button
              className="preview-close"
              type="button"
              onClick={() => setSelectedId('')}
              aria-label="Zavřít detail zahrady"
            >
              <X />
            </button>
            <div className="preview-illustration" aria-hidden="true">
              <Leaf />
              <i className="plant plant-one" />
              <i className="plant plant-two" />
              <i className="plant plant-three" />
            </div>
            <div className="preview-body">
              <div className="preview-meta">
                <span>
                  <MapPin /> {selectedGarden.district}
                </span>
                <span className="verified-dot">ověřeno</span>
              </div>
              <h2>{selectedGarden.name}</h2>
              <p>{selectedGarden.description}</p>
              <div className="tag-list" aria-label="Vlastnosti zahrady">
                {selectedGarden.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <a
                className="preview-button preview-link"
                href={selectedGarden.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Prozkoumat zahradu <ArrowRight />
              </a>
            </div>
          </aside>
        )}

        <footer className="map-footer">
          <output className="result-count">
            <i aria-hidden="true" /> {filteredGardens.length} objevených míst
          </output>
          <span className="prototype-note">Praha · první ilustrovaný výřez</span>
        </footer>
      </div>

      <section className="sr-only" id="garden-list" aria-label="Seznam zahrad">
        <h2>Seznam zahrad</h2>
        <ul>
          {filteredGardens.map((garden) => (
            <li key={garden.id}>{garden.name}</li>
          ))}
        </ul>
      </section>

      <Dialog open={addOpen} onOpenChange={(open) => {
        setAddOpen(open);
        if (!open) setSubmitted(false);
      }}>
        <DialogContent className="add-garden-dialog">
          {submitted ? (
            <section className="submission-success" aria-live="polite">
              <span className="success-icon" aria-hidden="true"><Check /></span>
              <DialogHeader>
                <DialogTitle>Děkujeme. Tip jsme přijali.</DialogTitle>
                <DialogDescription>
                  Než se zahrada objeví na mapě, ověříme místo i uvedené informace. Potom vám dáme vědět.
                </DialogDescription>
              </DialogHeader>
              <Button className="dialog-primary" onClick={() => setAddOpen(false)}>
                Zpět na mapu
              </Button>
            </section>
          ) : (
            <>
              <DialogHeader>
                <span className="dialog-eyebrow">Nový tip na mapu</span>
                <DialogTitle>Znáte zahradu, která tu chybí?</DialogTitle>
                <DialogDescription>
                  Pošlete nám místo a kontakt. Každý tip před zveřejněním osobně ověříme.
                </DialogDescription>
              </DialogHeader>
              <form className="garden-form" onSubmit={submitGarden}>
                <div className="form-grid">
                  <div className="form-field">
                    <Label htmlFor="garden-name">Název zahrady</Label>
                    <Input id="garden-name" name="gardenName" placeholder="Např. Zahrada u parku" required />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="garden-place">Adresa nebo místo</Label>
                    <Input id="garden-place" name="gardenPlace" placeholder="Ulice, čtvrť nebo bod" required />
                  </div>
                </div>
                <div className="form-field">
                  <Label htmlFor="garden-note">Co o místě víte?</Label>
                  <textarea
                    id="garden-note"
                    name="gardenNote"
                    placeholder="Krátký popis, odkaz nebo kontakt na provozovatele…"
                    rows={4}
                    required
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="garden-email">Váš e-mail</Label>
                  <Input id="garden-email" name="gardenEmail" type="email" placeholder="pro případ doplnění informací" required />
                  <small>Nezveřejníme ho a nepoužijeme k ničemu jinému.</small>
                </div>
                <Button className="dialog-primary" type="submit" size="lg">
                  Odeslat ke schválení <ArrowRight />
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="about-dialog">
          <DialogHeader>
            <span className="dialog-eyebrow">Jak mapa funguje</span>
            <DialogTitle>Každá zahrada je malý živý svět.</DialogTitle>
            <DialogDescription>
              Body na mapě odkazují na skutečná pražská místa. Vybíráme je z veřejných zdrojů a každý údaj před zveřejněním kontrolujeme.
            </DialogDescription>
          </DialogHeader>
          <ol className="how-list">
            <li><span>1</span><div><strong>Objevujte</strong><small>Hledejte podle názvu, čtvrti nebo vlastností.</small></div></li>
            <li><span>2</span><div><strong>Rozklikněte místo</strong><small>Každá zahrada má vlastní příběh a ověřený zdroj.</small></div></li>
            <li><span>3</span><div><strong>Přidejte tip</strong><small>Nové zahrady nejprve ověříme a teprve potom zveřejníme.</small></div></li>
          </ol>
        </DialogContent>
      </Dialog>
    </main>
  );
}
