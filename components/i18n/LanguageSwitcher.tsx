'use client';

import { useState } from 'react';

import { locales, type Locale } from '@/lib/i18n';
import { useLocale } from '@/components/i18n/LocaleProvider';

const shortNames: Record<Locale, string> = { en: 'EN', cs: 'CS' };
const longNames: Record<Locale, string> = { en: 'English', cs: 'Čeština' };

/**
 * A two-option language toggle for the header. Rendered as a group of
 * pressable buttons (not a select) so it works with a single key press,
 * shows the active language at a glance and announces each change.
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const [announcement, setAnnouncement] = useState('');

  function choose(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    // The announcement must be in the language that was just chosen.
    setAnnouncement(
      next === 'cs'
        ? 'Jazyk přepnut na češtinu.'
        : 'Language changed to English.',
    );
  }

  return (
    <fieldset className="language-switcher">
      <legend className="sr-only">{t.langSwitch.label}</legend>
      {locales.map((option) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={locale === option}
          aria-label={longNames[option]}
          title={longNames[option]}
          onClick={() => choose(option)}
        >
          {shortNames[option]}
        </button>
      ))}
      <output className="sr-only" aria-live="polite">
        {announcement}
      </output>
    </fieldset>
  );
}
