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
  type SyntheticEvent,
} from 'react';
import Image from 'next/image';
import {
  ArrowRight,
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

type GardenCategory =
  | 'community'
  | 'urban-farm'
  | 'education'
  | 'courtyard'
  | 'nature';

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
  illustration: string;
  category: GardenCategory;
};

const gardenCategoryMeta = {
  community: { label: 'Komunitní zahrada', icon: Sprout },
  'urban-farm': { label: 'Městské pěstování', icon: Tractor },
  education: { label: 'Učení a děti', icon: School },
  courtyard: { label: 'Vnitroblok', icon: House },
  nature: { label: 'Přírodní areál', icon: Trees },
} satisfies Record<GardenCategory, { label: string; icon: typeof Sprout }>;

const gardenCategoryOrder: GardenCategory[] = [
  'community',
  'urban-farm',
  'education',
  'courtyard',
  'nature',
];

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
    sourceUrl: 'https://www.mapko.cz/4432-komunitni-zahrada-vidimova',
    illustration: '/gardens/vidimova-illustrated.webp',
    category: 'courtyard',
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
      'Pětihhektarová zahrada u lesa se záhony, pergolou, květnatou loukou, včelími úly a výběhem pro koně.',
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
    category: 'urban-farm',
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

type FilterId = 'children' | 'accessible' | 'compost' | 'events';
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
const WIDE_MAP_CONTENT_SCALE = 0.8;
const INTRO_VIEWPORT_MARGIN = 12;
const INTRO_MIN_WIDTH = 180;
const INTRO_MIN_HEIGHT = 120;
const INTRO_MINIMIZED_WIDTH = 104;
const INTRO_MINIMIZED_HEIGHT = 56;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function projectToWideMapPercent(point: Garden) {
  const projected = projectToPercent(point);

  return {
    x: 50 + (projected.x - 50) * WIDE_MAP_CONTENT_SCALE,
    y: 50 + (projected.y - 50) * WIDE_MAP_CONTENT_SCALE,
  };
}

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
  const introCardRef = useRef<HTMLElement>(null);
  const introInteractionRef = useRef<IntroInteraction | null>(null);
  const introLiveGeometryRef = useRef<IntroGeometry | null>(null);
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
  const [introMinimized, setIntroMinimized] = useState(false);
  const [introGeometry, setIntroGeometry] = useState<IntroGeometry | null>(
    null,
  );
  const [introInteractionMode, setIntroInteractionMode] =
    useState<IntroInteractionMode | null>(null);

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
    const audio = audioRef.current;
    if (!audio) return;

    let disposed = false;
    let waitingForGesture = false;

    const removeUnlockListeners = () => {
      window.removeEventListener('pointerdown', unlockSound, true);
      window.removeEventListener('keydown', unlockSound, true);
    };

    const attemptAutoplay = async () => {
      if (disposed) return;

      cancelAudioFade();
      audio.volume = 0;
      setSoundState('loading');

      try {
        await audio.play();
        waitingForGesture = false;
        removeUnlockListeners();
      } catch (error) {
        if (disposed) return;
        if (error instanceof DOMException && error.name === 'AbortError')
          return;

        waitingForGesture = true;
        setSoundState('paused');
        window.addEventListener('pointerdown', unlockSound, {
          capture: true,
          once: true,
        });
        window.addEventListener('keydown', unlockSound, {
          capture: true,
          once: true,
        });
      }
    };

    function unlockSound(event: Event) {
      if (!waitingForGesture) return;
      waitingForGesture = false;
      removeUnlockListeners();
      if (
        event.target instanceof Element &&
        event.target.closest('.header-sound')
      ) {
        return;
      }
      void attemptAutoplay();
    }

    void attemptAutoplay();

    return () => {
      disposed = true;
      removeUnlockListeners();
    };
  }, [cancelAudioFade]);

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

  useEffect(() => {
    introLiveGeometryRef.current = introGeometry;
  }, [introGeometry]);

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

  function readIntroGeometry() {
    const card = introCardRef.current;
    if (!card) return null;

    const rect = card.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: introMinimized ? (introGeometry?.width ?? 396) : rect.width,
      height: introMinimized ? (introGeometry?.height ?? 264) : rect.height,
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
            src="/map/prague-storybook-vltava-v6-wide.webp"
            alt="Široký pohádkově ilustrovaný pohled na Prahu se zvětšenými památkami a Vltavou"
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
              const position = projectToWideMapPercent(garden);
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
                  onClick={() => setSelectedId(garden.id)}
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
        </div>

        <aside
          className={`map-legend${selectedGarden ? ' is-muted' : ''}`}
          aria-label="Legenda typů zahrad"
        >
          <div className="legend-heading">
            <Flower2 aria-hidden="true" />
            <strong>Typy míst</strong>
          </div>
          <ul>
            {gardenCategoryOrder.map((categoryId) => {
              const category = gardenCategoryMeta[categoryId];
              const CategoryIcon = category.icon;

              return (
                <li key={categoryId}>
                  <span
                    className={`legend-symbol marker-${categoryId}`}
                    aria-hidden="true"
                  >
                    <CategoryIcon />
                  </span>
                  <span>{category.label}</span>
                </li>
              );
            })}
          </ul>
        </aside>

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
              preload="auto"
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

        <aside
          className={`intro-card${introMinimized ? ' is-minimized' : ''}${
            selectedGarden || filtersOpen ? ' is-quiet' : ''
          }${introGeometry ? ' is-positioned' : ''}${
            introInteractionMode ? ` is-${introInteractionMode}` : ''
          }`}
          id="top"
          ref={introCardRef}
          style={introStyle}
          aria-label="Pohlednice Zahrady Prahy"
        >
          <span className="sr-only" id="intro-controls-help">
            Šipkami ovládáte jemný posun nebo změnu velikosti. S klávesou Shift
            se panel mění po větších krocích.
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
              <Image src="/zahrady-prahy-og.png" alt="" fill sizes="396px" />
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
        </aside>

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
                src={selectedGarden.illustration}
                alt=""
                fill
                sizes="368px"
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
              veřejných zdrojů a každý údaj před zveřejněním kontrolujeme. U
              připravovaných projektů vždy označujeme orientační polohu.
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
                <small>Každá zahrada má vlastní příběh a ověřený zdroj.</small>
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
                <strong>Přidejte tip</strong>
                <small>
                  Nové zahrady nejprve ověříme a teprve potom zveřejníme.
                </small>
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
