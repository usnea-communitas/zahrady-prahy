'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  LOCALE_PARAM,
  LOCALE_STORAGE_KEY,
  defaultLocale,
  dictionaries,
  isLocale,
  readStoredLocale,
  type Dictionary,
  type Locale,
} from '@/lib/i18n';

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

/* A tiny external store: the server always renders English, the browser
 * resolves the language once (a `?lang=cs` link first, then the stored
 * preference) and then follows the switcher. */
let currentLocale: Locale | null = null;
const listeners = new Set<() => void>();

function localeFromAddress(): Locale | null {
  try {
    const value = new URL(window.location.href).searchParams.get(LOCALE_PARAM);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

function readLocale(): Locale {
  currentLocale ??=
    localeFromAddress() ?? readStoredLocale(localStorage) ?? defaultLocale;
  return currentLocale;
}

function remember(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* Storage can be unavailable, for example in private browsing. */
  }
}

/* The address names the language too, so a copied link opens in it:
 * `?lang=cs` for Czech, no parameter for the English default. Other
 * parameters (`?zahrada=`, search, filters) stay as they are. */
function showInAddress(locale: Locale) {
  try {
    const url = new URL(window.location.href);
    if (locale === defaultLocale) url.searchParams.delete(LOCALE_PARAM);
    else url.searchParams.set(LOCALE_PARAM, locale);
    if (url.href !== window.location.href)
      window.history.replaceState(window.history.state, '', url);
  } catch {
    /* A sandboxed page may refuse history changes; the language still applies. */
  }
}

function serverLocale(): Locale {
  return defaultLocale;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Follow a change made in another tab of the same browser.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LOCALE_STORAGE_KEY) return;
    currentLocale = readStoredLocale(localStorage) ?? defaultLocale;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function setLocale(next: Locale) {
  currentLocale = next;
  remember(next);
  for (const listener of listeners) listener();
}

/**
 * Holds the current language. English is the default; a `?lang=cs` link or a
 * stored Czech preference (`zahrady.lang`) is applied right after hydration,
 * and the document language and the address follow it. Opening a link with
 * `?lang=` also remembers that language, as choosing it in the switcher does.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, serverLocale);

  useEffect(() => {
    // The hydration render still shows the server's English: wait for the
    // language the browser resolved before touching the page or the address.
    if (locale !== readLocale()) return;
    document.documentElement.lang = locale;
    if (localeFromAddress() === locale) remember(locale);
    showInAddress(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale],
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
