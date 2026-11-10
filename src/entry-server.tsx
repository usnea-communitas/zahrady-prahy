import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import Page from '../app/page';

export function render(): string {
  return renderToString(
    <StrictMode>
      <LocaleProvider>
        <Page />
      </LocaleProvider>
    </StrictMode>,
  );
}
