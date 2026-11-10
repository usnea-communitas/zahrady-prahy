'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { gardens } from '@/lib/gardens';
import {
  LOCALE_STORAGE_KEY,
  defaultLocale,
  dictionaries,
  type Dictionary,
  type Locale,
} from '@/lib/i18n';
import { parseRoutePath, routePath } from '@/lib/routes';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: dictionaries[defaultLocale],
});

const gardenIds = gardens.map((garden) => garden.id);

function remember(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* Storage can be unavailable, for example in private browsing. */
  }
}

/* The address names the language: `/…` for English, `/cs/…` for Czech.
 * Switching keeps the garden, the search and the filters. */
function showInAddress(locale: Locale) {
  try {
    const url = new URL(window.location.href);
    const { gardenId } = parseRoutePath(url.pathname, gardenIds);
    url.pathname = routePath({ locale, gardenId });
    if (url.href !== window.location.href)
      window.history.replaceState(window.history.state, '', url);
  } catch {
    /* A sandboxed page may refuse history changes; the language still applies. */
  }
}

/**
 * Holds the current language. Each page is built in its language (`/` English,
 * `/cs/` Czech), so the first render already matches the address. The
 * switcher changes the language in place and replaces the address; it is
 * remembered (`zahrady.lang`), and a script in the head of `/` sends a visitor
 * who chose Czech to `/cs/` before anything renders. Opening a Czech address
 * also remembers Czech, as the older `?lang=cs` links did.
 */
export function LocaleProvider({
  initialLocale = defaultLocale,
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    remember(next);
    showInAddress(next);
  }, []);

  useEffect(() => {
    if (initialLocale !== defaultLocale) remember(initialLocale);
    // Back and forward may cross a language switch: follow the address.
    const onPopState = () =>
      setLocaleState(
        parseRoutePath(window.location.pathname, gardenIds).locale,
      );
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/** Current locale, the setter and the matching interface dictionary. */
export function useLocale() {
  return useContext(LocaleContext);
}

/** Shorthand for the interface dictionary of the current language. */
export function useT() {
  return useContext(LocaleContext).t;
}
