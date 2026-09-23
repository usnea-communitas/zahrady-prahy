'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  List,
  Navigation,
  Share2,
  Flower2,
  Leaf,
  LoaderCircle,
  MapPin,
  Maximize2,
  Minimize2,
  Move,
  MoveDiagonal2,
  Music2,
  Pause,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Sprout,
  School,
  Tractor,
  Trees,
  House,
  Wheat,
  Check,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapMotionLayer } from '@/components/map/MapMotionLayer';
import { MapViewport } from '@/components/map/MapViewport';
import { registerGardenSearch } from '@/lib/webmcp';
import {
  emptyNavigation,
  readAtlasUrl,
  writeAtlasUrl,
  gardenShareUrl,
  type AtlasNavigation,
} from '@/lib/atlas-navigation';
import {
  gardens,
  filterOptions,
  filterGardenCatalogue,
  navigationUrl,
  type GardenCategory,
  type FilterId,
} from '@/lib/gardens';
import type { GardenVisit } from '@/lib/garden-visits';

const gardenCategoryMeta = {
  community: { label: 'Komunitní zahrada', icon: Sprout },
  'urban-farm': { label: 'Městská farma', icon: Tractor },
  education: { label: 'Vzdělávací zahrada', icon: School },
  courtyard: { label: 'Vnitroblok', icon: House },
  nature: { label: 'Přírodní zahrada', icon: Trees },
} satisfies Record<GardenCategory, { label: string; icon: typeof Sprout }>;

const gardenCategoryOrder: GardenCategory[] = [
  'community',
  'urban-farm',
  'education',
  'courtyard',
  'nature',
];

type SoundState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
type IntroInteractionMode = 'move' | 'resize';
type IntroGeometry = {
  left: number;
  top: number;
  width: number;
  height: number;
};
type IntroInteraction = {
  mode: IntroInteractionMode;
  pointerId: number;
  startX: number;
  startY: number;
  geometry: IntroGeometry;
};

const AUDIO_TARGET_VOLUME = 0.38;
const INTRO_VIEWPORT_MARGIN = 12;
const INTRO_MIN_WIDTH = 180;
const INTRO_MIN_HEIGHT = 120;
const INTRO_MINIMIZED_WIDTH = 104;
const INTRO_MINIMIZED_HEIGHT = 56;
const INTRO_DEFAULT_WIDTH = 396;
const INTRO_DEFAULT_HEIGHT = 346;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function uniqueVisitSources(visit: GardenVisit) {
  return [visit.access, visit.hours, visit.entrance, visit.participation]
    .flatMap((fact) => fact?.sources ?? [])
    .filter(
      (source, index, sources) =>
        sources.findIndex((candidate) => candidate.url === source.url) ===
        index,
    );
}

export default function Home() {
  useEffect(registerGardenSearch, []);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioFadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const introCardRef = useRef<HTMLElement>(null);
  const mapCanvasRef = useRef<HTMLElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const introInteractionRef = useRef<IntroInteraction | null>(null);
  const introLiveGeometryRef = useRef<IntroGeometry | null>(null);
  const [navigation, setNavigation] =
    useState<AtlasNavigation>(emptyNavigation);
  const navigationRef = useRef<AtlasNavigation>(emptyNavigation);
  const { query, selectedId, category: categoryFilter } = navigation;
  const activeFilters = useMemo(
    () => new Set(navigation.filters),
    [navigation.filters],
  );
  const [listOpen, setListOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [revealRequest, setRevealRequest] = useState(0);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [soundState, setSoundState] = useState<SoundState>('idle');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [introMinimized, setIntroMinimized] = useState(false);
  const [introGeometry, setIntroGeometry] = useState<IntroGeometry | null>(
    null,
  );
  const [introInteractionMode, setIntroInteractionMode] =
    useState<IntroInteractionMode | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [postcardSlotHeight, setPostcardSlotHeight] = useState<number | null>(
    null,
  );
  const [fullscreenStatus, setFullscreenStatus] = useState('');

  const filteredGardens = useMemo(
    () => filterGardenCatalogue(query, navigation.filters, categoryFilter),
    [query, navigation.filters, categoryFilter],
  );

  const selectedGarden =
    filteredGardens.find((garden) => garden.id === selectedId) ?? null;
  const selectedVisit = selectedGarden?.visit ?? null;
  const isSoundPlaying = soundState === 'playing';
  const isMotionPaused = motionPaused || prefersReducedMotion;

  /* oxlint-disable react/react-compiler -- Browser-only preferences and URL state must be restored after SSR hydration. */
  useEffect(() => {
    const restoreLink = () => {
      const url = new URL(window.location.href);
      const next = readAtlasUrl(
        url,
        gardens.map((garden) => garden.id),
      );
      if (
        next.selectedId &&
        !filterGardenCatalogue(next.query, next.filters, next.category).some(
          (garden) => garden.id === next.selectedId,
        )
      )
        next.selectedId = '';
      navigationRef.current = next;
      setNavigation(next);
      setShareStatus('');
      if (next.query || next.filters.length || next.category) setListOpen(true);
      if (next.selectedId) setIntroMinimized(true);
      const clean = writeAtlasUrl(url, next);
      if (clean.href !== url.href)
        window.history.replaceState(window.history.state, '', clean);
    };
    restoreLink();
    window.addEventListener('popstate', restoreLink);
    try {
      const saved = JSON.parse(
        localStorage.getItem('prague-atlas-panel-v3') ?? 'null',
      );
      // oxlint-disable-next-line react/react-compiler -- Restore browser-only preferences after server hydration.
      if (
        saved &&
        typeof saved.minimized === 'boolean' &&
        !navigationRef.current.selectedId
      )
        setIntroMinimized(saved.minimized);
      if (
        saved?.geometry &&
        ['left', 'top', 'width', 'height'].every((key) =>
          Number.isFinite(saved.geometry[key]),
        )
      ) {
        const width = clamp(
          saved.geometry.width,
          INTRO_MIN_WIDTH,
          window.innerWidth - 24,
        );
        const height = clamp(
          saved.geometry.height,
          INTRO_MIN_HEIGHT,
          window.innerHeight - 24,
        );
        setIntroGeometry({
          width,
          height,
          left: clamp(saved.geometry.left, 12, window.innerWidth - width - 12),
          top: clamp(saved.geometry.top, 12, window.innerHeight - height - 12),
        });
      }
    } catch {
      /* Preferences are optional, including in private browsing. */
    }
    setPreferencesReady(true);
    return () => window.removeEventListener('popstate', restoreLink);
  }, []);
  /* oxlint-enable react/react-compiler */

  useEffect(() => {
    if (!preferencesReady) return;
    try {
      localStorage.setItem(
        'prague-atlas-panel-v3',
        JSON.stringify({ minimized: introMinimized, geometry: introGeometry }),
      );
    } catch {
      /* Storage can be unavailable. */
    }
  }, [introMinimized, introGeometry, preferencesReady]);

  const updateNavigation = useCallback(
    (patch: Partial<AtlasNavigation>, mode: 'push' | 'replace' = 'replace') => {
      const next = { ...navigationRef.current, ...patch };
      if (
        next.selectedId &&
        !filterGardenCatalogue(next.query, next.filters, next.category).some(
          (garden) => garden.id === next.selectedId,
        )
      )
        next.selectedId = '';
      navigationRef.current = next;
      setNavigation(next);
      setShareStatus('');
      const url = writeAtlasUrl(new URL(window.location.href), next);
      if (url.href !== window.location.href) {
        if (mode === 'push')
          window.history.pushState(window.history.state, '', url);
        else window.history.replaceState(window.history.state, '', url);
      }
    },
    [],
  );

  const selectGarden = useCallback(
    (id: string) => {
      if (id) {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLElement)
          lastFocusRef.current = activeElement;
      }
      updateNavigation({ selectedId: id }, 'push');
      setIntroMinimized(true);
      if (id)
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLButtonElement>('.preview-close')
            ?.focus({ preventScroll: true }),
        );
    },
    [updateNavigation],
  );

  async function shareGarden() {
    if (!selectedGarden) return;
    const url = gardenShareUrl(
      new URL(window.location.href),
      selectedGarden.id,
    );
    try {
      await navigator.clipboard.writeText(url.href);
      setShareStatus('Odkaz zkopírován.');
    } catch {
      setShareStatus('Odkaz můžete zkopírovat z adresního řádku.');
    }
  }

  function resetFilters() {
    updateNavigation({ query: '', filters: [], category: null });
  }

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

  // The soundscape starts only when the visitor presses the sound button:
  // no autoplay and no start on the first click anywhere on the page.

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(preference.matches);
    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    const syncFullscreen = () => {
      const isFullscreen = document.fullscreenElement === mapCanvasRef.current;
      setMapFullscreen(isFullscreen);
      setFullscreenStatus(
        isFullscreen ? 'Mapa je zobrazena přes celou obrazovku.' : '',
      );
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    syncFullscreen();
    return () =>
      document.removeEventListener('fullscreenchange', syncFullscreen);
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

  useEffect(() => {
    introLiveGeometryRef.current = introGeometry;
  }, [introGeometry]);

  useEffect(() => {
    const card = introCardRef.current;
    if (!card || introMinimized || introGeometry) return;
    const measure = () => {
      const height = Math.round(card.getBoundingClientRect().height);
      if (height > 0) setPostcardSlotHeight(height);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [introMinimized, introGeometry]);

  useEffect(() => {
    // the map may finish loading before hydration, when onLoad has already fired
    const art = document.querySelector<HTMLImageElement>('.map-art');
    if (art?.complete && art.naturalWidth > 0) setMapLoaded(true);
  }, []);

  useEffect(() => {
    function keepIntroInViewport() {
      setIntroGeometry((current) => {
        if (!current) return current;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const width = introMinimized
          ? INTRO_MINIMIZED_WIDTH
          : clamp(
              current.width,
              Math.min(INTRO_MIN_WIDTH, viewportWidth - 24),
              viewportWidth - 24,
            );
        const height = introMinimized
          ? INTRO_MINIMIZED_HEIGHT
          : clamp(
              current.height,
              Math.min(INTRO_MIN_HEIGHT, viewportHeight - 24),
              viewportHeight - 24,
            );

        return {
          left: clamp(
            current.left,
            INTRO_VIEWPORT_MARGIN,
            viewportWidth - width - INTRO_VIEWPORT_MARGIN,
          ),
          top: clamp(
            current.top,
            INTRO_VIEWPORT_MARGIN,
            viewportHeight - height - INTRO_VIEWPORT_MARGIN,
          ),
          width: introMinimized ? current.width : width,
          height: introMinimized ? current.height : height,
        };
      });
    }

    keepIntroInViewport();
    window.addEventListener('resize', keepIntroInViewport);
    return () => window.removeEventListener('resize', keepIntroInViewport);
  }, [introMinimized]);

  function toggleFilter(filterId: FilterId) {
    const next = new Set(navigationRef.current.filters);
    if (next.has(filterId)) next.delete(filterId);
    else next.add(filterId);
    updateNavigation({ filters: [...next] });
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

  const closePreview = useCallback(() => {
    const closingId = selectedId;
    const returnTarget = lastFocusRef.current;
    selectGarden('');
    requestAnimationFrame(() => {
      const focusTarget = returnTarget?.isConnected
        ? returnTarget
        : markerRefs.current[closingId];
      focusTarget?.focus({ preventScroll: true });
      lastFocusRef.current = null;
    });
  }, [selectedId, selectGarden]);

  useEffect(() => {
    if (!selectedGarden || addOpen || aboutOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePreview();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedGarden, addOpen, aboutOpen, closePreview]);

  function readIntroGeometry() {
    const card = introCardRef.current;
    if (!card) return null;

    const rect = card.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: introMinimized
        ? (introGeometry?.width ?? INTRO_DEFAULT_WIDTH)
        : rect.width,
      height: introMinimized
        ? (introGeometry?.height ?? INTRO_DEFAULT_HEIGHT)
        : rect.height,
    };
  }

  function beginIntroInteraction(
    event: ReactPointerEvent<HTMLButtonElement>,
    mode: IntroInteractionMode,
  ) {
    if (mode === 'resize' && introMinimized) return;

    const geometry = readIntroGeometry();
    if (!geometry) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    introInteractionRef.current = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      geometry,
    };
    introLiveGeometryRef.current = geometry;
    setIntroGeometry(geometry);
    setIntroInteractionMode(mode);
  }

  function paintIntroGeometry(geometry: IntroGeometry) {
    const card = introCardRef.current;
    if (!card) return;

    introLiveGeometryRef.current = geometry;
    card.style.left = `${geometry.left}px`;
    card.style.top = `${geometry.top}px`;
    if (!introMinimized) {
      card.style.width = `${geometry.width}px`;
      card.style.height = `${geometry.height}px`;
    }
  }

  function updateIntroInteraction(event: ReactPointerEvent<HTMLButtonElement>) {
    const interaction = introInteractionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;

    event.preventDefault();
    const deltaX = event.clientX - interaction.startX;
    const deltaY = event.clientY - interaction.startY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (interaction.mode === 'move') {
      const renderedWidth = introMinimized
        ? INTRO_MINIMIZED_WIDTH
        : interaction.geometry.width;
      const renderedHeight = introMinimized
        ? INTRO_MINIMIZED_HEIGHT
        : interaction.geometry.height;

      paintIntroGeometry({
        ...interaction.geometry,
        left: clamp(
          interaction.geometry.left + deltaX,
          INTRO_VIEWPORT_MARGIN,
          viewportWidth - renderedWidth - INTRO_VIEWPORT_MARGIN,
        ),
        top: clamp(
          interaction.geometry.top + deltaY,
          INTRO_VIEWPORT_MARGIN,
          viewportHeight - renderedHeight - INTRO_VIEWPORT_MARGIN,
        ),
      });
      return;
    }

    const maxWidth = Math.max(
      Math.min(INTRO_MIN_WIDTH, viewportWidth - 24),
      viewportWidth - interaction.geometry.left - INTRO_VIEWPORT_MARGIN,
    );
    const maxHeight = Math.max(
      Math.min(INTRO_MIN_HEIGHT, viewportHeight - 24),
      viewportHeight - interaction.geometry.top - INTRO_VIEWPORT_MARGIN,
    );

    paintIntroGeometry({
      ...interaction.geometry,
      width: clamp(
        interaction.geometry.width + deltaX,
        Math.min(INTRO_MIN_WIDTH, maxWidth),
        maxWidth,
      ),
      height: clamp(
        interaction.geometry.height + deltaY,
        Math.min(INTRO_MIN_HEIGHT, maxHeight),
        maxHeight,
      ),
    });
  }

  function endIntroInteraction(event: ReactPointerEvent<HTMLButtonElement>) {
    const interaction = introInteractionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (introLiveGeometryRef.current) {
      setIntroGeometry(introLiveGeometryRef.current);
    }
    introInteractionRef.current = null;
    setIntroInteractionMode(null);
  }

  function adjustIntroWithKeyboard(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    mode: IntroInteractionMode,
  ) {
    if (mode === 'resize' && introMinimized) return;

    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!direction) return;

    const geometry = readIntroGeometry();
    if (!geometry) return;

    event.preventDefault();
    const step = event.shiftKey ? 24 : 8;
    const [horizontal, vertical] = direction;

    if (mode === 'move') {
      const renderedWidth = introMinimized
        ? INTRO_MINIMIZED_WIDTH
        : geometry.width;
      const renderedHeight = introMinimized
        ? INTRO_MINIMIZED_HEIGHT
        : geometry.height;

      setIntroGeometry({
        ...geometry,
        left: clamp(
          geometry.left + horizontal * step,
          INTRO_VIEWPORT_MARGIN,
          window.innerWidth - renderedWidth - INTRO_VIEWPORT_MARGIN,
        ),
        top: clamp(
          geometry.top + vertical * step,
          INTRO_VIEWPORT_MARGIN,
          window.innerHeight - renderedHeight - INTRO_VIEWPORT_MARGIN,
        ),
      });
      return;
    }

    const maxWidth = window.innerWidth - geometry.left - INTRO_VIEWPORT_MARGIN;
    const maxHeight = window.innerHeight - geometry.top - INTRO_VIEWPORT_MARGIN;
    setIntroGeometry({
      ...geometry,
      width: clamp(
        geometry.width + horizontal * step,
        Math.min(INTRO_MIN_WIDTH, maxWidth),
        maxWidth,
      ),
      height: clamp(
        geometry.height + vertical * step,
        Math.min(INTRO_MIN_HEIGHT, maxHeight),
        maxHeight,
      ),
    });
  }

  const introStyle = introGeometry
    ? ({
        left: `${introGeometry.left}px`,
        top: `${introGeometry.top}px`,
        ...(!introMinimized && {
          width: `${introGeometry.width}px`,
          height: `${introGeometry.height}px`,
        }),
      } as CSSProperties)
    : undefined;

  async function toggleMapFullscreen() {
    const map = mapCanvasRef.current;
    if (!map) return;

    try {
      if (document.fullscreenElement === map) await document.exitFullscreen();
      else await map.requestFullscreen();
    } catch {
      setFullscreenStatus(
        'Celou obrazovku se nepodařilo otevřít. Zkuste to prosím znovu.',
      );
    }
  }

  const introCard = (
    <aside
      className={`intro-card${introMinimized ? ' is-minimized' : ''}${
        selectedGarden || filtersOpen || listOpen ? ' is-quiet' : ''
      }${introGeometry ? ' is-positioned' : ''}${
        introInteractionMode ? ` is-${introInteractionMode}` : ''
      }`}
      ref={introCardRef}
      style={introStyle}
      aria-label="Pohlednice Zahrady Prahy"
    >
      <span className="sr-only" id="intro-controls-help">
        Šipkami ovládáte jemný posun nebo změnu velikosti. S klávesou Shift se
        panel mění po větších krocích.
      </span>
      <button
        className="intro-drag-handle"
        type="button"
        onPointerDown={(event) => beginIntroInteraction(event, 'move')}
        onPointerMove={updateIntroInteraction}
        onPointerUp={endIntroInteraction}
        onPointerCancel={endIntroInteraction}
        onLostPointerCapture={endIntroInteraction}
        onKeyDown={(event) => adjustIntroWithKeyboard(event, 'move')}
        aria-label="Přesunout pohlednici po mapě"
        aria-describedby="intro-controls-help"
        title="Přesunout"
      >
        <Move />
      </button>
      <button
        id="intro-postcard"
        className="intro-postcard"
        type="button"
        onClick={() => setAboutOpen(true)}
        aria-label="Otevřít příběh mapy"
        tabIndex={introMinimized ? -1 : 0}
      >
        <span className="intro-visual" aria-hidden="true">
          <Image src="/zahrady-prahy-postcard.webp" alt="" fill sizes="396px" />
        </span>
      </button>
      <button
        className="intro-minimize"
        type="button"
        onClick={() => setIntroMinimized((minimized) => !minimized)}
        aria-label={
          introMinimized
            ? 'Rozbalit pohlednici Zahrady Prahy'
            : 'Minimalizovat pohlednici Zahrady Prahy'
        }
        aria-expanded={!introMinimized}
        aria-controls="intro-postcard"
      >
        {introMinimized ? <Maximize2 /> : <Minimize2 />}
      </button>
      {!introMinimized && (
        <button
          className="intro-resize-handle"
          type="button"
          onPointerDown={(event) => beginIntroInteraction(event, 'resize')}
          onPointerMove={updateIntroInteraction}
          onPointerUp={endIntroInteraction}
          onPointerCancel={endIntroInteraction}
          onLostPointerCapture={endIntroInteraction}
          onKeyDown={(event) => adjustIntroWithKeyboard(event, 'resize')}
          aria-label="Změnit velikost pohlednice"
          aria-describedby="intro-controls-help"
          title="Změnit velikost"
        >
          <MoveDiagonal2 />
        </button>
      )}
      {!introMinimized && (
        <div
          className="map-legend intro-legend"
          aria-label="Legenda typů zahrad"
        >
          <div className="legend-heading">
            <Flower2 aria-hidden="true" />
            <strong>Charakter místa</strong>
          </div>
          <ul>
            {gardenCategoryOrder.map((categoryId) => {
              const category = gardenCategoryMeta[categoryId];
              const CategoryIcon = category.icon;

              return (
                <li key={categoryId}>
                  <button
                    type="button"
                    className="legend-filter"
                    aria-pressed={categoryFilter === categoryId}
                    onClick={() =>
                      updateNavigation({
                        category:
                          categoryFilter === categoryId ? null : categoryId,
                      })
                    }
                  >
                    <span
                      className={`legend-symbol marker-${categoryId}`}
                      aria-hidden="true"
                    >
                      <CategoryIcon />
                    </span>
                    <span>{category.label}</span>
                    <small>
                      {
                        gardens.filter(
                          (garden) => garden.category === categoryId,
                        ).length
                      }
                    </small>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="atlas-note">
            Ilustrovaný atlas · polohy na kresbě jsou orientační.
          </p>
        </div>
      )}
    </aside>
  );

  return (
    <main className="map-experience">
      <a
        className="skip-link"
        href="#garden-list"
        onClick={() => {
          setListOpen(true);
          setIntroMinimized(true);
          if (selectedGarden) setRevealRequest((request) => request + 1);
        }}
      >
        Přeskočit mapu a zobrazit seznam zahrad
      </a>

      <section
        ref={mapCanvasRef}
        className={`map-canvas${selectedGarden ? ' has-selection' : ''}${
          filtersOpen ? ' filters-open' : ''
        }${mapFullscreen ? ' is-map-fullscreen' : ''}`}
        aria-label="Ilustrovaná mapa Prahy"
      >
        <MapViewport
          focusTarget={
            selectedGarden
              ? { id: selectedGarden.id, ...selectedGarden.artPosition }
              : undefined
          }
          revealRequest={revealRequest}
          isFullscreen={mapFullscreen}
          onToggleFullscreen={toggleMapFullscreen}
        >
          {!mapLoaded && (
            // eslint-disable-next-line @next/next/no-img-element -- 1.5 kB inline placeholder
            <img
              className="map-art-placeholder"
              src="/map/prague-storybook-vltava-v6-placeholder.webp"
              alt=""
              aria-hidden="true"
            />
          )}
          <Image
            className="map-art"
            src="/map/prague-storybook-vltava-v6-wide.webp"
            alt="Široký pohádkově ilustrovaný pohled na Prahu se zvětšenými památkami a Vltavou"
            fill
            priority
            sizes="100vw"
            onLoad={() => setMapLoaded(true)}
            onError={() => setMapLoaded(true)}
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
              const position = garden.artPosition;
              const category = gardenCategoryMeta[garden.category];
              const CategoryIcon = category.icon;

              return (
                <button
                  key={garden.id}
                  ref={(node) => {
                    markerRefs.current[garden.id] = node;
                  }}
                  type="button"
                  className={`garden-marker marker-${garden.category}${
                    isSelected ? ' is-selected' : ''
                  }`}
                  style={
                    {
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    } as CSSProperties
                  }
                  onClick={() => selectGarden(garden.id)}
                  aria-label={`${garden.name}, ${garden.area}, otevřít detail`}
                  aria-pressed={isSelected}
                >
                  <span className="marker-aura" aria-hidden="true" />
                  <span className="marker-core" aria-hidden="true">
                    <CategoryIcon />
                  </span>
                  <span className="marker-label">
                    <strong>{garden.name}</strong>
                    <small>
                      {garden.district} · {category.label}
                    </small>
                  </span>
                </button>
              );
            })}
          </fieldset>
        </MapViewport>

        {!mapLoaded && (
          <div className="map-loading" role="status">
            <LoaderCircle aria-hidden="true" /> Načítám mapu…
          </div>
        )}

        <output className="sr-only" aria-live="polite">
          {fullscreenStatus}
        </output>

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
              onChange={(event) => {
                updateNavigation({ query: event.target.value.slice(0, 200) });
                setListOpen(true);
                setIntroMinimized(true);
                if (selectedGarden) setRevealRequest((request) => request + 1);
              }}
              placeholder="Hledat zahradu nebo čtvrť…"
              aria-label="Hledat zahradu nebo čtvrť"
            />
            {query ? (
              <button
                className="clear-search"
                type="button"
                onClick={() => updateNavigation({ query: '' })}
                aria-label="Vymazat hledání"
              >
                <X />
              </button>
            ) : (
              <span className="search-count">
                {filteredGardens.length}{' '}
                {filteredGardens.length === 1
                  ? 'místo'
                  : filteredGardens.length >= 2 && filteredGardens.length <= 4
                    ? 'místa'
                    : 'míst'}
              </span>
            )}
          </search>

          <div className="header-actions">
            <Button
              className="glass-button"
              variant="outline"
              size="lg"
              aria-expanded={listOpen}
              aria-controls="garden-list"
              aria-label={
                listOpen ? 'Zavřít seznam zahrad' : 'Zobrazit seznam zahrad'
              }
              onClick={() => {
                setListOpen((open) => !open);
                setIntroMinimized(true);
                if (selectedGarden) setRevealRequest((request) => request + 1);
              }}
            >
              <List />
              <span>Seznam</span>
            </Button>
            <button
              className={`header-sound is-${soundState}`}
              type="button"
              onClick={toggleSound}
              aria-label={
                isSoundPlaying
                  ? 'Pozastavit zvukovou krajinu Zahrady nad Vltavou'
                  : 'Přehrát zvukovou krajinu Zahrady nad Vltavou'
              }
              aria-pressed={isSoundPlaying}
              aria-busy={soundState === 'loading'}
              title={
                isSoundPlaying
                  ? 'Pozastavit zvukovou krajinu'
                  : 'Přehrát zvukovou krajinu'
              }
            >
              <Music2 className="sound-note" aria-hidden="true" />
              <span className="sound-action" aria-hidden="true">
                {soundState === 'loading' ? (
                  <LoaderCircle className="sound-loader" />
                ) : isSoundPlaying ? (
                  <Pause />
                ) : (
                  <Play />
                )}
              </span>
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
                if (audio) fadeAudio(audio, AUDIO_TARGET_VOLUME, 720);
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
              <source src="/audio/zahrady-nad-vltavou.m4a" type="audio/mp4" />
              <source src="/audio/zahrady-nad-vltavou.mp3" type="audio/mpeg" />
            </audio>
            <output className="sr-only" aria-live="polite">
              {soundState === 'loading'
                ? 'Načítám zvukovou krajinu…'
                : soundState === 'error'
                  ? 'Zvuk se nepodařilo přehrát.'
                  : isSoundPlaying
                    ? 'Zvuková krajina hraje.'
                    : ''}
            </output>
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
              aria-label="Přidávání zahrad připravujeme"
            >
              <Plus />
              <span>Přidat místo · brzy</span>
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
              onClick={() => updateNavigation({ filters: [] })}
              tabIndex={filtersOpen ? 0 : -1}
            >
              Zrušit vše
            </button>
          )}
        </div>

        {filteredGardens.length === 0 && (
          <output className="empty-state" aria-live="polite">
            <Sprout aria-hidden="true" />
            <strong>Nic jsme nenašli.</strong>
            <span>Zkuste jiný název nebo čtvrť.</span>
            <button
              type="button"
              className="text-action"
              onClick={resetFilters}
            >
              Zrušit hledání a filtry
            </button>
          </output>
        )}

        {selectedGarden && (
          <aside
            key={selectedGarden.id}
            className="garden-preview"
            aria-live="polite"
            aria-label={selectedGarden.name}
          >
            <button
              className="preview-close"
              type="button"
              onClick={closePreview}
              aria-label="Zavřít detail zahrady"
            >
              <X />
            </button>
            <div className="preview-scroll">
              <div className="preview-illustration">
                <Image
                  src={selectedGarden.illustration}
                  alt={`Umělecká ilustrace zahrady ${selectedGarden.name}, nikoli přesný plán`}
                  fill
                  sizes="420px"
                />
                <span className="preview-glyph">
                  <Leaf />
                </span>
                <span className="illustration-caption">Umělecká ilustrace</span>
              </div>
              <div className="preview-body">
                <div className="preview-meta">
                  <span>
                    <MapPin /> {selectedGarden.district}
                  </span>
                  <span className="verified-dot">
                    {selectedGarden.locationStatus ?? 'veřejný zdroj'}
                  </span>
                </div>
                <h2>{selectedGarden.name}</h2>
                <button
                  type="button"
                  className="reveal-garden"
                  onClick={() => setRevealRequest((request) => request + 1)}
                >
                  <MapPin /> Ukázat na kreslené mapě
                </button>
                <p>{selectedGarden.description}</p>
                <div className="tag-list" aria-label="Vlastnosti zahrady">
                  {selectedGarden.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                {selectedVisit && (
                  <div className="visit-note">
                    <div className="visit-note-heading">
                      <strong>Návštěva</strong>
                      <span>
                        Zdroje zkontrolovány {selectedVisit.access.checkedAt}
                      </span>
                    </div>
                    <dl className="visit-facts">
                      <div className="visit-fact">
                        <dt>Kdy přijít</dt>
                        <dd>
                          {selectedVisit.hours.text}
                          {selectedVisit.hours.appliesTo && (
                            <small>{selectedVisit.hours.appliesTo}</small>
                          )}
                        </dd>
                      </div>
                      <div className="visit-fact">
                        <dt>Vstup</dt>
                        <dd>
                          {selectedVisit.access.text}
                          {selectedVisit.access.appliesTo && (
                            <small>{selectedVisit.access.appliesTo}</small>
                          )}
                        </dd>
                      </div>
                      {selectedVisit.entrance && (
                        <div className="visit-fact">
                          <dt>Kde</dt>
                          <dd>
                            {selectedVisit.entrance.text}
                            {selectedVisit.entrance.appliesTo && (
                              <small>{selectedVisit.entrance.appliesTo}</small>
                            )}
                          </dd>
                        </div>
                      )}
                      {selectedVisit.participation && (
                        <div className="visit-fact">
                          <dt>Zapojení</dt>
                          <dd>
                            {selectedVisit.participation.text}
                            {selectedVisit.participation.appliesTo && (
                              <small>
                                {selectedVisit.participation.appliesTo}
                              </small>
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <p className="visit-disclaimer">
                      Podle uvedených zdrojů. Před cestou ověřte případné změny;
                      poloha na kresbě je orientační
                      {selectedGarden.locationStatus ? ' (také přibližná)' : ''}
                      .
                    </p>
                    <div className="visit-sources">
                      {uniqueVisitSources(selectedVisit).map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.label} <ArrowRight />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="preview-actions">
                  <a
                    className="preview-button"
                    href={navigationUrl(selectedGarden)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation /> Otevřít v mapě
                  </a>
                  <button
                    type="button"
                    className="share-button"
                    onClick={shareGarden}
                    aria-label="Zkopírovat odkaz na zahradu"
                  >
                    <Share2 />
                  </button>
                </div>
                <output className="share-feedback" aria-live="polite">
                  {shareStatus}
                </output>
                <a
                  className="source-link"
                  href={selectedGarden.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Zdroj a informace o návštěvě <ArrowRight />
                </a>
              </div>
            </div>
          </aside>
        )}

        <footer className="map-footer">
          <output className="result-count">
            <i aria-hidden="true" /> {filteredGardens.length}{' '}
            {filteredGardens.length === 1
              ? 'objevené místo'
              : filteredGardens.length >= 2 && filteredGardens.length <= 4
                ? 'objevená místa'
                : 'objevených míst'}
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

        <section
          className="garden-directory"
          id="garden-list"
          aria-label="Seznam zahrad"
          hidden={!listOpen}
        >
          <div className="directory-heading">
            <div>
              <span className="directory-eyebrow">Zelená místa Prahy</span>
              <h2>Kam dnes?</h2>
            </div>
            <button
              type="button"
              onClick={() => setListOpen(false)}
              aria-label="Zavřít seznam"
            >
              <X />
            </button>
          </div>
          <p className="directory-summary" aria-live="polite">
            {filteredGardens.length} z {gardens.length} míst
            {categoryFilter
              ? ` · ${gardenCategoryMeta[categoryFilter].label}`
              : ''}
          </p>
          {(query || categoryFilter || activeFilters.size > 0) && (
            <button
              className="text-action"
              type="button"
              onClick={resetFilters}
            >
              Zrušit hledání a filtry
            </button>
          )}
          <ul>
            {filteredGardens.map((garden) => (
              <li key={garden.id}>
                <button
                  type="button"
                  aria-pressed={selectedId === garden.id}
                  onClick={() => selectGarden(garden.id)}
                >
                  <span className="directory-image">
                    <Image src={garden.illustration} alt="" fill sizes="72px" />
                  </span>
                  <span>
                    <strong>{garden.name}</strong>
                    <small>
                      {garden.district} · {garden.area}
                    </small>
                  </span>
                  <ArrowRight />
                </button>
              </li>
            ))}
          </ul>
          {filteredGardens.length === 0 && (
            <p>Žádné místo neodpovídá výběru. Zkuste ubrat některý filtr.</p>
          )}
          <p className="directory-footnote">
            Vyberte místo a naplánujte si návštěvu.
          </p>
        </section>
      </section>

      <div className="gallery-caption" id="top">
        <div>
          <h1>Zahrady Prahy</h1>
          <p>Praha roste společně.</p>
        </div>
        <div
          className="gallery-postcard-slot"
          style={
            postcardSlotHeight ? { minHeight: postcardSlotHeight } : undefined
          }
        >
          {introCard}
        </div>
        <button
          className="gallery-seal"
          type="button"
          onClick={() => setAboutOpen(true)}
          aria-label="O mapě Zahrady Prahy"
        >
          <Leaf aria-hidden="true" />
        </button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="add-garden-dialog">
          <DialogHeader>
            <span className="dialog-eyebrow">
              <Sprout /> Mapa roste postupně
            </span>
            <DialogTitle>Přijímání tipů připravujeme.</DialogTitle>
            <DialogDescription>
              Nová místa bude možné navrhovat, až bude připravené jejich
              ukládání a osobní schvalování. Zatím zde žádné tipy ani kontaktní
              údaje nepřijímáme.
            </DialogDescription>
          </DialogHeader>
          <Button className="dialog-primary" onClick={() => setAddOpen(false)}>
            Zpět k objevování <ArrowRight />
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="about-dialog">
          <div className="about-botanical-field" aria-hidden="true">
            <Image
              className="about-canopy about-canopy-left"
              src="/map/motion/tree-cluster-v1.png"
              alt=""
              width={384}
              height={256}
              sizes="260px"
            />
            <Image
              className="about-canopy about-canopy-right"
              src="/map/motion/tree-cluster-v1.png"
              alt=""
              width={384}
              height={256}
              sizes="260px"
            />
            <span className="about-sprig about-sprig-one">
              <Leaf />
            </span>
            <span className="about-sprig about-sprig-two">
              <Flower2 />
            </span>
            <span className="about-sprig about-sprig-three">
              <Wheat />
            </span>
          </div>
          <DialogHeader className="about-dialog-header">
            <span className="dialog-eyebrow">
              <span className="dialog-eyebrow-icon" aria-hidden="true">
                <Leaf />
              </span>
              Jak mapa funguje
            </span>
            <DialogTitle>
              Každá zahrada je <span>malý živý svět.</span>
            </DialogTitle>
            <DialogDescription>
              Body na mapě odkazují na skutečná pražská místa. Vybíráme je z
              veřejných zdrojů, které najdete u každé zahrady. Kresba je
              umělecký atlas, ne navigační mapa. Pro skutečnou polohu použijte
              odkaz v detailu.
            </DialogDescription>
          </DialogHeader>
          <ol className="how-list">
            <li>
              <span className="how-icon" aria-hidden="true">
                <Search />
              </span>
              <div className="how-step-copy">
                <strong>Objevujte</strong>
                <small>Hledejte podle názvu, čtvrti nebo vlastností.</small>
              </div>
              <span className="how-step-number" aria-hidden="true">
                01
              </span>
            </li>
            <li>
              <span className="how-icon" aria-hidden="true">
                <Sprout />
              </span>
              <div className="how-step-copy">
                <strong>Rozklikněte místo</strong>
                <small>
                  Prohlédněte si ilustraci, zdroj a skutečnou polohu.
                </small>
              </div>
              <span className="how-step-number" aria-hidden="true">
                02
              </span>
            </li>
            <li>
              <span className="how-icon" aria-hidden="true">
                <Flower2 />
              </span>
              <div className="how-step-copy">
                <strong>Nová místa postupně</strong>
                <small>Přijímání a schvalování vašich tipů připravujeme.</small>
              </div>
              <span className="how-step-number" aria-hidden="true">
                03
              </span>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </main>
  );
}
