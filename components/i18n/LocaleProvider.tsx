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
  LOCALE_STORAGE_KEY,
  defaultLocale,
  dictionaries,
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
 * resolves the stored preference once and then follows the switcher. */
let currentLocale: Locale | null = null;
const listeners = new Set<() => void>();

function readLocale(): Locale {
  currentLocale ??= readStoredLocale(localStorage) ?? defaultLocale;
  return currentLocale;
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
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* Storage can be unavailable, for example in private browsing. */
  }
  for (const listener of listeners) listener();
}

/**
 * Holds the current language. English is the default; a stored Czech
 * preference (`zahrady.lang`) is applied right after hydration and the
 * document language follows it.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, serverLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
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
