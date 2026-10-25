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
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { registerGardenSearch } from '@/lib/webmcp';
import {
  emptyNavigation,
  readAtlasUrl,
  writeAtlasUrl,
  gardenShareUrl,
  type AtlasNavigation,
} from '@/lib/atlas-navigation';
import {
  categoryLabels,
  gardens,
  filterOptions,
  filterGardenCatalogue,
  navigationUrl,
  tagLabels,
  thumbnailUrl,
  type GardenCategory,
  type FilterId,
} from '@/lib/gardens';
import type { GardenVisit } from '@/lib/garden-visits';
import { formatDate } from '@/lib/i18n';

const gardenCategoryIcons = {
  community: Sprout,
  'urban-farm': Tractor,
  education: School,
  courtyard: House,
  nature: Trees,
} satisfies Record<GardenCategory, typeof Sprout>;

const gardenCategoryOrder: GardenCategory[] = [
  'community',
  'urban-farm',
  'education',
  'courtyard',
  'nature',
];

/** Where the markers lie on the illustration (percent), for the phone overview. */
const gardenBounds = {
  left: Math.min(...gardens.map((garden) => garden.artPosition.x)),
  right: Math.max(...gardens.map((garden) => garden.artPosition.x)),
  top: Math.min(...gardens.map((garden) => garden.artPosition.y)),
  bottom: Math.max(...gardens.map((garden) => garden.artPosition.y)),
};

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
/** v4: earlier versions also stored automatic folding, which then stuck. */
const INTRO_STORAGE_KEY = 'prague-atlas-panel-v4';
/** A desktop window too low for the full postcard above the map. */
const LOW_WINDOW =
  '(max-height: 800px) and (min-height: 501px) and (min-width: 721px)';

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
  const { locale, t } = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioFadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const markerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const introCardRef = useRef<HTMLElement>(null);
  const mapCanvasRef = useRef<HTMLElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const introInteractionRef = useRef<IntroInteraction | null>(null);
  const introLiveGeometryRef = useRef<IntroGeometry | null>(null);
  const introTouchedRef = useRef(false);
  const [navigation, setNavigation] =
    useState<AtlasNavigation>(emptyNavigation);
  const navigationRef = useRef<AtlasNavigation>(emptyNavigation);
  const { query, selectedId, category: categoryFilter } = navigation;
  const activeFilters = useMemo(
    () => new Set(navigation.filters),
    [navigation.filters],
  );
  const [listOpen, setListOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<'copied' | 'fallback' | ''>(
    '',
  );
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
  const [fullscreenStatus, setFullscreenStatus] = useState<
    'on' | 'failed' | ''
  >('');

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
      const clean = writeAtlasUrl(url, next);
      if (clean.href !== url.href)
        window.history.replaceState(window.history.state, '', clean);
    };
    restoreLink();
    window.addEventListener('popstate', restoreLink);
    // A visitor's own choice is remembered; otherwise the postcard starts
    // folded in a low window, where the map needs the height.
    let minimized = window.matchMedia(LOW_WINDOW).matches;
    try {
      const saved = JSON.parse(
        localStorage.getItem(INTRO_STORAGE_KEY) ?? 'null',
      );
      if (typeof saved?.minimized === 'boolean') minimized = saved.minimized;
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
    // oxlint-disable-next-line react/react-compiler -- Restore browser-only preferences after server hydration.
    setIntroMinimized(minimized);
    setPreferencesReady(true);
    return () => window.removeEventListener('popstate', restoreLink);
  }, []);
  /* oxlint-enable react/react-compiler */

  useEffect(() => {
    // Only what the visitor did is stored, never an automatic change.
    if (!preferencesReady || !introTouchedRef.current) return;
    try {
      localStorage.setItem(
        INTRO_STORAGE_KEY,
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
      setShareStatus('copied');
    } catch {
      setShareStatus('fallback');
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
      setFullscreenStatus(isFullscreen ? 'on' : '');
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

  // The map may finish loading before hydration, when onLoad has already
  // fired; the ref callback sees the element's state as soon as it mounts.
  const mapArtRef = useCallback((art: HTMLImageElement | null) => {
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
      introTouchedRef.current = true;
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
    introTouchedRef.current = true;
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
      setFullscreenStatus('failed');
    }
  }

  const introCard = (
    <aside
      className={`intro-card${introMinimized ? ' is-minimized' : ''}${
        introGeometry && (selectedGarden || filtersOpen || listOpen)
          ? ' is-quiet'
          : ''
      }${preferencesReady ? ' is-ready' : ''}${
        introGeometry ? ' is-positioned' : ''
      }${introInteractionMode ? ` is-${introInteractionMode}` : ''}`}
      ref={introCardRef}
      style={introStyle}
      aria-label={t.intro.label}
    >
      <span className="sr-only" id="intro-controls-help">
        {t.intro.controlsHelp}
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
        aria-label={t.intro.move}
        aria-describedby="intro-controls-help"
        title={t.intro.moveShort}
      >
        <Move />
      </button>
      <button
        id="intro-postcard"
        className="intro-postcard"
        type="button"
        onClick={() => setAboutOpen(true)}
        aria-label={t.intro.openStory}
        tabIndex={introMinimized ? -1 : 0}
      >
        <span className="intro-visual" aria-hidden="true">
          <Image src="/zahrady-prahy-postcard.webp" alt="" fill sizes="396px" />
        </span>
      </button>
      <button
        className="intro-minimize"
        type="button"
        onClick={() => {
          introTouchedRef.current = true;
          setIntroMinimized((minimized) => !minimized);
        }}
        aria-label={introMinimized ? t.intro.expand : t.intro.minimize}
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
          aria-label={t.intro.resize}
          aria-describedby="intro-controls-help"
          title={t.intro.resizeShort}
        >
          <MoveDiagonal2 />
        </button>
      )}
      {!introMinimized && (
        <div
          className="map-legend intro-legend"
          aria-label={t.intro.legendLabel}
        >
          <div className="legend-heading">
            <Flower2 aria-hidden="true" />
            <strong>{t.intro.legendTitle}</strong>
          </div>
          <ul>
            {gardenCategoryOrder.map((categoryId) => {
              const CategoryIcon = gardenCategoryIcons[categoryId];

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
                    <span>{categoryLabels[categoryId][locale]}</span>
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
          <p className="atlas-note">{t.intro.note}</p>
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
          if (selectedGarden) setRevealRequest((request) => request + 1);
        }}
      >
        {t.skipLink}
      </a>

      <section
        ref={mapCanvasRef}
        className={`map-canvas${selectedGarden ? ' has-selection' : ''}${
          filtersOpen ? ' filters-open' : ''
        }${mapFullscreen ? ' is-map-fullscreen' : ''}`}
        aria-label={t.map.canvasLabel}
      >
        <MapViewport
          focusTarget={
            selectedGarden
              ? { id: selectedGarden.id, ...selectedGarden.artPosition }
              : undefined
          }
          gardenBounds={gardenBounds}
          revealRequest={revealRequest}
          isFullscreen={mapFullscreen}
          onToggleFullscreen={toggleMapFullscreen}
          controls={
            <button
              className="motion-toggle"
              type="button"
              onClick={() => setMotionPaused((paused) => !paused)}
              disabled={prefersReducedMotion}
              aria-pressed={prefersReducedMotion ? undefined : isMotionPaused}
              aria-label={
                prefersReducedMotion
                  ? t.footer.motionSystem
                  : t.footer.motionPause
              }
              title={
                prefersReducedMotion
                  ? t.footer.motionSystemTitle
                  : isMotionPaused
                    ? t.footer.motionResume
                    : t.footer.motionPause
              }
            >
              {isMotionPaused ? <Play /> : <Pause />}
            </button>
          }
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
            ref={mapArtRef}
            className="map-art"
            src="/map/prague-storybook-vltava-v6-wide.webp"
            alt={t.map.artAlt}
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
            <legend className="sr-only">{t.map.markersLegend}</legend>
            {filteredGardens.map((garden) => {
              const isSelected = selectedId === garden.id;
              const position = garden.artPosition;
              const CategoryIcon = gardenCategoryIcons[garden.category];

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
                  aria-label={t.map.markerLabel(
                    garden.name,
                    garden.area[locale],
                  )}
                  aria-pressed={isSelected}
                >
                  <span className="marker-aura" aria-hidden="true" />
                  <span className="marker-core" aria-hidden="true">
                    <CategoryIcon />
                  </span>
                  <span className="marker-label">
                    <strong>{garden.name}</strong>
                    <small>
                      {garden.district} ·{' '}
                      {categoryLabels[garden.category][locale]}
                    </small>
                  </span>
                </button>
              );
            })}
          </fieldset>
        </MapViewport>

        {!mapLoaded && (
          <output className="map-loading">
            <LoaderCircle aria-hidden="true" /> {t.map.loading}
          </output>
        )}

        <output className="sr-only" aria-live="polite">
          {fullscreenStatus === 'on'
            ? t.map.fullscreenOn
            : fullscreenStatus === 'failed'
              ? t.map.fullscreenFailed
              : ''}
        </output>

        <header className="map-header">
          <a className="brand" href="#top" aria-label={t.header.home}>
            <span className="brand-mark" aria-hidden="true">
              <Leaf />
            </span>
            <span>
              <strong>{t.header.brand}</strong>
              <small>{t.header.brandSub}</small>
            </span>
          </a>

          <search className="search-shell">
            <Search aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => {
                updateNavigation({ query: event.target.value.slice(0, 200) });
                setListOpen(true);
                if (selectedGarden) setRevealRequest((request) => request + 1);
              }}
              placeholder={t.header.searchPlaceholder}
              aria-label={t.header.searchLabel}
            />
            {query ? (
              <button
                className="clear-search"
                type="button"
                onClick={() => updateNavigation({ query: '' })}
                aria-label={t.header.clearSearch}
              >
                <X />
              </button>
            ) : (
              <span className="search-count">
                {t.header.placesCount(filteredGardens.length)}
              </span>
            )}
          </search>

          <div className="header-actions">
            <LanguageSwitcher />
            <Button
              className="glass-button"
              variant="outline"
              size="lg"
              aria-expanded={listOpen}
              aria-controls="garden-list"
              aria-label={listOpen ? t.header.listClose : t.header.listOpen}
              onClick={() => {
                setListOpen((open) => !open);
                if (selectedGarden) setRevealRequest((request) => request + 1);
              }}
            >
              <List />
              <span>{t.header.list}</span>
            </Button>
            <button
              className={`header-sound is-${soundState}`}
              type="button"
              onClick={toggleSound}
              aria-label={isSoundPlaying ? t.sound.pause : t.sound.play}
              aria-pressed={isSoundPlaying}
              aria-busy={soundState === 'loading'}
              title={isSoundPlaying ? t.sound.pauseShort : t.sound.playShort}
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
            {/* The instrumental soundscape contains no spoken word, so there is nothing to caption. */}
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
                ? t.sound.loading
                : soundState === 'error'
                  ? t.sound.error
                  : isSoundPlaying
                    ? t.sound.playing
                    : ''}
            </output>
            <Button
              className="glass-button"
              variant="outline"
              size="lg"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="garden-filters"
              aria-label={t.header.filtersLabel(activeFilters.size)}
            >
              <SlidersHorizontal />
              <span>{t.header.filters}</span>
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
              aria-label={t.header.addLabel}
            >
              <Plus />
              <span>{t.header.add}</span>
            </Button>
          </div>
        </header>

        <div
          className={`filter-tray${filtersOpen ? ' is-open' : ''}`}
          id="garden-filters"
          aria-hidden={!filtersOpen}
        >
          <span className="filter-title">{t.filterTray.title}</span>
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
                {option.label[locale]}
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
              {t.filterTray.clearAll}
            </button>
          )}
        </div>

        {filteredGardens.length === 0 && (
          <output className="empty-state" aria-live="polite">
            <Sprout aria-hidden="true" />
            <strong>{t.empty.title}</strong>
            <span>{t.empty.hint}</span>
            <button
              type="button"
              className="text-action"
              onClick={resetFilters}
            >
              {t.empty.reset}
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
              aria-label={t.preview.close}
            >
              <X />
            </button>
            <div className="preview-scroll">
              <div className="preview-illustration">
                <Image
                  src={selectedGarden.illustration}
                  alt={t.preview.illustrationAlt(selectedGarden.name)}
                  fill
                  sizes="420px"
                />
                <span className="preview-glyph">
                  <Leaf />
                </span>
                <span className="illustration-caption">
                  {t.preview.illustrationCaption}
                </span>
              </div>
              <div className="preview-body">
                <div className="preview-meta">
                  <span>
                    <MapPin /> {selectedGarden.district}
                  </span>
                  <span className="verified-dot">
                    {selectedGarden.locationStatus?.[locale] ??
                      t.preview.publicSource}
                  </span>
                </div>
                <h2 lang="cs">{selectedGarden.name}</h2>
                {locale !== 'cs' && selectedGarden.gloss && (
                  <p className="preview-gloss">{selectedGarden.gloss}</p>
                )}
                <button
                  type="button"
                  className="reveal-garden"
                  onClick={() => setRevealRequest((request) => request + 1)}
                >
                  <MapPin /> {t.preview.showOnMap}
                </button>
                <p>{selectedGarden.description[locale]}</p>
                <div className="tag-list" aria-label={t.preview.tagsLabel}>
                  {selectedGarden.tags.map((tag) => (
                    <span key={tag}>{tagLabels[tag][locale]}</span>
                  ))}
                </div>
                {selectedVisit && (
                  <div className="visit-note">
                    <div className="visit-note-heading">
                      <strong>{t.preview.visit}</strong>
                      <span>
                        {t.preview.sourcesChecked(
                          formatDate(selectedVisit.access.checkedAt, locale),
                        )}
                      </span>
                    </div>
                    <dl className="visit-facts">
                      <div className="visit-fact">
                        <dt>{t.preview.when}</dt>
                        <dd>
                          {selectedVisit.hours.text[locale]}
                          {selectedVisit.hours.appliesTo && (
                            <small>
                              {selectedVisit.hours.appliesTo[locale]}
                            </small>
                          )}
                        </dd>
                      </div>
                      <div className="visit-fact">
                        <dt>{t.preview.access}</dt>
                        <dd>
                          {selectedVisit.access.text[locale]}
                          {selectedVisit.access.appliesTo && (
                            <small>
                              {selectedVisit.access.appliesTo[locale]}
                            </small>
                          )}
                        </dd>
                      </div>
                      {selectedVisit.entrance && (
                        <div className="visit-fact">
                          <dt>{t.preview.where}</dt>
                          <dd>
                            {selectedVisit.entrance.text[locale]}
                            {selectedVisit.entrance.appliesTo && (
                              <small>
                                {selectedVisit.entrance.appliesTo[locale]}
                              </small>
                            )}
                          </dd>
                        </div>
                      )}
                      {selectedVisit.participation && (
                        <div className="visit-fact">
                          <dt>{t.preview.participation}</dt>
                          <dd>
                            {selectedVisit.participation.text[locale]}
                            {selectedVisit.participation.appliesTo && (
                              <small>
                                {selectedVisit.participation.appliesTo[locale]}
                              </small>
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <p className="visit-disclaimer">
                      {t.preview.disclaimer}
                      {selectedGarden.locationStatus
                        ? t.preview.disclaimerAlsoApprox
                        : ''}
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
                          {source.label[locale]} <ArrowRight />
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
                    <Navigation /> {t.preview.openInMap}
                  </a>
                  <button
                    type="button"
                    className="share-button"
                    onClick={shareGarden}
                    aria-label={t.preview.share}
                  >
                    <Share2 />
                  </button>
                </div>
                <output className="share-feedback" aria-live="polite">
                  {shareStatus === 'copied'
                    ? t.preview.shareCopied
                    : shareStatus === 'fallback'
                      ? t.preview.shareFallback
                      : ''}
                </output>
                <a
                  className="source-link"
                  href={selectedGarden.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.preview.sourceLink} <ArrowRight />
                </a>
              </div>
            </div>
          </aside>
        )}

        <footer className="map-footer">
          <output className="result-count">
            <i aria-hidden="true" />{' '}
            {t.footer.discovered(filteredGardens.length)}
          </output>
          <div className="footer-meta">
            <a
              className="prototype-note"
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              <span className="osm-full">{t.footer.osm}</span>
              <span className="osm-short">{t.footer.osmShort}</span>
            </a>
          </div>
        </footer>

        <section
          className="garden-directory"
          id="garden-list"
          aria-label={t.directory.label}
          hidden={!listOpen}
        >
          <div className="directory-heading">
            <div>
              <span className="directory-eyebrow">{t.directory.eyebrow}</span>
              <h2>{t.directory.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setListOpen(false)}
              aria-label={t.directory.close}
            >
              <X />
            </button>
          </div>
          <p className="directory-summary" aria-live="polite">
            {t.directory.summary(filteredGardens.length, gardens.length)}
            {categoryFilter
              ? ` · ${categoryLabels[categoryFilter][locale]}`
              : ''}
          </p>
          {(query || categoryFilter || activeFilters.size > 0) && (
            <button
              className="text-action"
              type="button"
              onClick={resetFilters}
            >
              {t.empty.reset}
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
                    <Image
                      src={thumbnailUrl(garden)}
                      alt=""
                      fill
                      sizes="56px"
                    />
                  </span>
                  <span>
                    <strong lang="cs">{garden.name}</strong>
                    <small>
                      {garden.district} · {garden.area[locale]}
                    </small>
                  </span>
                  <ArrowRight />
                </button>
              </li>
            ))}
          </ul>
          {filteredGardens.length === 0 && <p>{t.directory.noMatch}</p>}
          <p className="directory-footnote">{t.directory.footnote}</p>
        </section>
      </section>

      <div className="gallery-caption" id="top">
        <div>
          <h1>{t.caption.title}</h1>
          <p>{t.caption.subtitle}</p>
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
          aria-label={t.caption.about}
        >
          <Leaf aria-hidden="true" />
        </button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="add-garden-dialog"
          closeLabel={t.dialog.close}
        >
          <DialogHeader>
            <span className="dialog-eyebrow">
              <Sprout /> {t.addDialog.eyebrow}
            </span>
            <DialogTitle>{t.addDialog.title}</DialogTitle>
            <DialogDescription>{t.addDialog.description}</DialogDescription>
          </DialogHeader>
          <Button className="dialog-primary" onClick={() => setAddOpen(false)}>
            {t.addDialog.back} <ArrowRight />
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="about-dialog" closeLabel={t.dialog.close}>
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
              {t.aboutDialog.eyebrow}
            </span>
            <DialogTitle>
              {t.aboutDialog.titleStart}{' '}
              <span>{t.aboutDialog.titleAccent}</span>
            </DialogTitle>
            <DialogDescription>{t.aboutDialog.description}</DialogDescription>
          </DialogHeader>
          <ol className="how-list">
            <li>
              <span className="how-icon" aria-hidden="true">
                <Search />
              </span>
              <div className="how-step-copy">
                <strong>{t.aboutDialog.step1Title}</strong>
                <small>{t.aboutDialog.step1Text}</small>
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
                <strong>{t.aboutDialog.step2Title}</strong>
                <small>{t.aboutDialog.step2Text}</small>
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
                <strong>{t.aboutDialog.step3Title}</strong>
                <small>{t.aboutDialog.step3Text}</small>
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
