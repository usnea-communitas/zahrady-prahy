'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Leaf,
  LoaderCircle,
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
import { MapMotionLayer } from '@/components/map/MapMotionLayer';
import { projectToPercent } from '@/lib/map/projection';

type Garden = {
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
    lat: 50.1121511,
    lon: 14.4147114,
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
    lat: 50.1336044,
    lon: 14.5607443,
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
    lat: 50.1071472,
    lon: 14.476603,
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
    lat: 50.1267793,
    lon: 14.4078329,
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
    lat: 50.0649253,
    lon: 14.4442846,
    sourceUrl: 'https://www.vnitrobloky.cz/mecislavka',
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
    lat: 50.0398094,
    lon: 14.3437361,
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
    lat: 50.0327,
    lon: 14.4446,
    locationStatus: 'orientační poloha',
    sourceUrl:
      'https://www.kokoza.cz/komunitni-zahrady/dve-nove-komunitni-zahrady/',
  },
];

type FilterId = 'children' | 'accessible' | 'compost' | 'events';
type SoundState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

const AUDIO_TARGET_VOLUME = 0.38;

const filterOptions: Array<{
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

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioFadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<FilterId>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [soundState, setSoundState] = useState<SoundState>('idle');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
  const selectedPosition = selectedGarden
    ? projectToPercent(selectedGarden)
    : null;
  const isSoundPlaying = soundState === 'playing';
  const isMotionPaused = motionPaused || prefersReducedMotion;

  const cancelAudioFade = useCallback(() => {
    if (audioFadeTimerRef.current !== null) {
      clearInterval(audioFadeTimerRef.current);
      audioFadeTimerRef.current = null;
    }
  }, []);

  const fadeAudio = useCallback(
    (
      audio: HTMLAudioElement,
      targetVolume: number,
      duration: number,
      onComplete?: () => void,
    ) => {
      cancelAudioFade();
      const startVolume = audio.volume;
      const startTime = performance.now();

      audioFadeTimerRef.current = setInterval(() => {
        const progress = Math.min(
          (performance.now() - startTime) / duration,
          1,
        );
        const eased = 1 - (1 - progress) ** 3;
        audio.volume = startVolume + (targetVolume - startVolume) * eased;

        if (progress >= 1) {
          cancelAudioFade();
          onComplete?.();
        }
      }, 16);
    },
    [cancelAudioFade],
  );

  const pauseSound = useCallback(
    (audio: HTMLAudioElement) => {
      setSoundState('paused');
      fadeAudio(audio, 0, 240, () => {
        audio.pause();
        audio.volume = AUDIO_TARGET_VOLUME;
      });
    },
    [fadeAudio],
  );

  useEffect(() => cancelAudioFade, [cancelAudioFade]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(preference.matches);
    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (document.hidden && audio && !audio.paused) pauseSound(audio);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseSound]);

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

    if (soundState === 'loading' || !audio.paused) {
      pauseSound(audio);
      return;
    }

    cancelAudioFade();
    audio.volume = 0;
    setSoundState('loading');

    try {
      await audio.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setSoundState('error');
    }
  }

  function closePreview() {
    const closingId = selectedId;
    setSelectedId('');
    requestAnimationFrame(() => markerRefs.current[closingId]?.focus());
  }

  return (
    <main className="map-experience">
      <a className="skip-link" href="#garden-list">
        Přeskočit mapu a zobrazit seznam zahrad
      </a>

      <section
        className={`map-canvas${selectedGarden ? ' has-selection' : ''}${
          filtersOpen ? ' filters-open' : ''
        }`}
        aria-label="Ilustrovaná mapa Prahy"
      >
        <div className="map-plane">
          <Image
            className="map-art"
            src="/map/prague-illustrated-v2.webp"
            alt="Ručně malovaná, geograficky věrná mapa Prahy se skutečným tokem Vltavy, čtvrtěmi a zelenými plochami"
            fill
            priority
            sizes="100vw"
            onLoad={() => setMapLoaded(true)}
          />
          <div className="map-wash" aria-hidden="true" />
          <div className="paper-grain" aria-hidden="true" />
          <MapMotionLayer
            paused={isMotionPaused}
            quiet={Boolean(selectedGarden) || filtersOpen}
            ready={mapLoaded}
          />

          <fieldset className="garden-markers">
            <legend className="sr-only">Zahrady na mapě</legend>
            {filteredGardens.map((garden) => {
              const isSelected = selectedId === garden.id;
              const position = projectToPercent(garden);

              return (
                <button
                  key={garden.id}
                  ref={(node) => {
                    markerRefs.current[garden.id] = node;
                  }}
                  type="button"
                  className={`garden-marker${isSelected ? ' is-selected' : ''}`}
                  style={
                    {
                      left: `${position.x}%`,
                      top: `${position.y}%`,
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
          </fieldset>
        </div>

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
              <span className="search-count">
                {filteredGardens.length} míst
              </span>
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
              aria-label={`Filtry zahrad${
                activeFilters.size ? `, ${activeFilters.size} aktivní` : ''
              }`}
            >
              <SlidersHorizontal />
              <span>Filtry</span>
              {activeFilters.size > 0 && (
                <span className="active-filter-count">
                  {activeFilters.size}
                </span>
              )}
            </Button>
            <Button
              className="add-button"
              size="lg"
              onClick={() => setAddOpen(true)}
              aria-label="Přidat zahradu"
            >
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
          <div
            className={`sound-control is-${soundState}`}
            aria-busy={soundState === 'loading'}
          >
            <Music2 aria-hidden="true" />
            <span className="sound-copy">
              <small>Zvuková krajina</small>
              <strong>Mezi listím a kamenem</strong>
            </span>
            <button
              className="sound-toggle"
              type="button"
              onClick={toggleSound}
              aria-label="Zvuková krajina Mezi listím a kamenem"
              aria-pressed={isSoundPlaying}
            >
              {soundState === 'loading' ? (
                <LoaderCircle className="sound-loader" aria-hidden="true" />
              ) : isSoundPlaying ? (
                <Pause aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
            </button>
            {/* Instrumentální zvuková krajina neobsahuje mluvené slovo. */}
            {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              ref={audioRef}
              loop
              preload="none"
              onPlaying={() => {
                setSoundState('playing');
                const audio = audioRef.current;
                if (audio) fadeAudio(audio, AUDIO_TARGET_VOLUME, 520);
              }}
              onWaiting={() => {
                if (!audioRef.current?.paused) setSoundState('loading');
              }}
              onStalled={() => {
                if (!audioRef.current?.paused) setSoundState('loading');
              }}
              onPause={() =>
                setSoundState((state) => (state === 'error' ? state : 'paused'))
              }
              onError={() => setSoundState('error')}
            >
              <source src="/audio/mezi-listim-a-kamenem.m4a" type="audio/mp4" />
              <source
                src="/audio/mezi-listim-a-kamenem.mp3"
                type="audio/mpeg"
              />
            </audio>
          </div>
          <output className="sound-status" aria-live="polite">
            {soundState === 'loading'
              ? 'Načítám zvukovou krajinu…'
              : soundState === 'error'
                ? 'Zvuk se nepodařilo přehrát.'
                : ''}
          </output>
          <button
            className="text-link"
            type="button"
            onClick={() => setAboutOpen(true)}
          >
            Jak mapa funguje <ArrowRight />
          </button>
        </section>

        {filteredGardens.length === 0 && (
          <output className="empty-state" aria-live="polite">
            <Sprout aria-hidden="true" />
            <strong>Nic jsme nenašli.</strong>
            <span>Zkuste jiný název nebo čtvrť.</span>
          </output>
        )}

        {selectedGarden && (
          <aside
            key={selectedGarden.id}
            className="garden-preview"
            aria-live="polite"
          >
            <button
              className="preview-close"
              type="button"
              onClick={closePreview}
              aria-label="Zavřít detail zahrady"
            >
              <X />
            </button>
            <div className="preview-illustration" aria-hidden="true">
              <Image
                src="/map/prague-illustrated-v2.webp"
                alt=""
                fill
                sizes="368px"
                style={{
                  objectPosition: `${selectedPosition?.x}% ${selectedPosition?.y}%`,
                }}
              />
              <span className="preview-glyph">
                <Leaf />
              </span>
            </div>
            <div className="preview-body">
              <div className="preview-meta">
                <span>
                  <MapPin /> {selectedGarden.district}
                </span>
                <span className="verified-dot">
                  {selectedGarden.locationStatus ?? 'ověřeno'}
                </span>
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
          <div className="footer-meta">
            <button
              className="motion-toggle"
              type="button"
              onClick={() => setMotionPaused((paused) => !paused)}
              disabled={prefersReducedMotion}
              aria-pressed={isMotionPaused}
              title={
                prefersReducedMotion
                  ? 'Pohyb je vypnutý podle nastavení systému'
                  : undefined
              }
            >
              {isMotionPaused ? <Play /> : <Pause />}
              <span>
                {prefersReducedMotion
                  ? 'Pohyb omezen systémem'
                  : isMotionPaused
                    ? 'Rozpohybovat mapu'
                    : 'Pozastavit pohyb'}
              </span>
            </button>
            <a
              className="prototype-note"
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              © OpenStreetMap contributors
            </a>
          </div>
        </footer>
      </section>

      <section className="sr-only" id="garden-list" aria-label="Seznam zahrad">
        <h2>Seznam zahrad</h2>
        <ul>
          {filteredGardens.map((garden) => (
            <li key={garden.id}>{garden.name}</li>
          ))}
        </ul>
      </section>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) setSubmitted(false);
        }}
      >
        <DialogContent className="add-garden-dialog">
          {submitted ? (
            <section className="submission-success" aria-live="polite">
              <span className="success-icon" aria-hidden="true">
                <Check />
              </span>
              <DialogHeader>
                <DialogTitle>Děkujeme. Tip jsme přijali.</DialogTitle>
                <DialogDescription>
                  Než se zahrada objeví na mapě, ověříme místo i uvedené
                  informace. Potom vám dáme vědět.
                </DialogDescription>
              </DialogHeader>
              <Button
                className="dialog-primary"
                onClick={() => setAddOpen(false)}
              >
                Zpět na mapu
              </Button>
            </section>
          ) : (
            <>
              <DialogHeader>
                <span className="dialog-eyebrow">Nový tip na mapu</span>
                <DialogTitle>Znáte zahradu, která tu chybí?</DialogTitle>
                <DialogDescription>
                  Pošlete nám místo a kontakt. Každý tip před zveřejněním osobně
                  ověříme.
                </DialogDescription>
              </DialogHeader>
              <form className="garden-form" onSubmit={submitGarden}>
                <div className="form-grid">
                  <div className="form-field">
                    <Label htmlFor="garden-name">Název zahrady</Label>
                    <Input
                      id="garden-name"
                      name="gardenName"
                      placeholder="Např. Zahrada u parku"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="garden-place">Adresa nebo místo</Label>
                    <Input
                      id="garden-place"
                      name="gardenPlace"
                      placeholder="Ulice, čtvrť nebo bod"
                      required
                    />
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
                  <Input
                    id="garden-email"
                    name="gardenEmail"
                    type="email"
                    placeholder="pro případ doplnění informací"
                    required
                  />
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
              Body na mapě odkazují na skutečná pražská místa. Vybíráme je z
              veřejných zdrojů a každý údaj před zveřejněním kontrolujeme. U
              připravovaných projektů vždy označujeme orientační polohu.
            </DialogDescription>
          </DialogHeader>
          <ol className="how-list">
            <li>
              <span>1</span>
              <div>
                <strong>Objevujte</strong>
                <small>Hledejte podle názvu, čtvrti nebo vlastností.</small>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Rozklikněte místo</strong>
                <small>Každá zahrada má vlastní příběh a ověřený zdroj.</small>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Přidejte tip</strong>
                <small>
                  Nové zahrady nejprve ověříme a teprve potom zveřejníme.
                </small>
              </div>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </main>
  );
}
