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
  readUrlLocale,
  withLocale,
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

/* A tiny external store: the server renders the language of the link
 * (English unless it says `?lang=cs`), the browser resolves the link or the
 * stored preference once and then follows the switcher. */
let currentLocale: Locale | null = null;
const listeners = new Set<() => void>();

function readLocale(): Locale {
  currentLocale ??=
    readUrlLocale(new URL(window.location.href)) ??
    readStoredLocale(localStorage) ??
    defaultLocale;
  return currentLocale;
}

function storeLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* Storage can be unavailable, for example in private browsing. */
  }
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
  storeLocale(next);
  for (const listener of listeners) listener();
}

/**
 * Holds the current language. English is the default; a link with
 * `?lang=cs` is rendered in Czech, and a stored Czech preference
 * (`zahrady.lang`) is applied right after hydration. The document language,
 * the title and the address bar follow it.
 */
export function LocaleProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: ReactNode;
  /** The language the server rendered, from the link. */
  initialLocale?: Locale;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    readLocale,
    () => initialLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = dictionaries[locale].meta.title;
    // A language in the link is remembered like a choice in the switcher,
    // and the address bar carries the language, so a copied link opens in it.
    const syncAddress = () => {
      const url = new URL(window.location.href);
      if (readUrlLocale(url) === locale) storeLocale(locale);
      const next = withLocale(url, locale);
      if (next.href !== url.href)
        window.history.replaceState(window.history.state, '', next);
    };
    syncAddress();
    window.addEventListener('popstate', syncAddress);
    return () => window.removeEventListener('popstate', syncAddress);
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
