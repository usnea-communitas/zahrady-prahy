'use client';

import { useState } from 'react';

import { dictionaries, locales, type Locale } from '@/lib/i18n';
import { isPlainClick, routePath } from '@/lib/routes';
import { useLocale } from '@/components/i18n/LocaleProvider';

const shortNames: Record<Locale, string> = { en: 'EN', cs: 'CS' };
const longNames: Record<Locale, string> = { en: 'English', cs: 'Čeština' };

/**
 * A two-option language toggle for the header. Each option is a link to the
 * same page in that language, so it opens in a new tab and search engines
 * find both versions; a plain click switches in place, keeps the search and
 * the filters, shows the active language at a glance and announces the change.
 */
export function LanguageSwitcher({ gardenId = '' }: { gardenId?: string }) {
  const { locale, setLocale, t } = useLocale();
  const [announcement, setAnnouncement] = useState('');

  function choose(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    // The announcement must be in the language that was just chosen.
    setAnnouncement(dictionaries[next].langSwitch.announce);
  }

  return (
    <fieldset className="language-switcher">
      <legend className="sr-only">{t.langSwitch.label}</legend>
      {locales.map((option) => (
        <a
          key={option}
          href={routePath({ locale: option, gardenId })}
          hrefLang={option}
          lang={option}
          aria-current={locale === option ? 'page' : undefined}
          title={longNames[option]}
          onClick={(event) => {
            if (!isPlainClick(event)) return;
            event.preventDefault();
            choose(option);
          }}
        >
          {/* The name starts with the visible code, then the full name. */}
          {shortNames[option]}
          <span className="sr-only"> {longNames[option]}</span>
        </a>
      ))}
      <output className="sr-only" aria-live="polite">
        {announcement}
      </output>
    </fieldset>
  );
}
