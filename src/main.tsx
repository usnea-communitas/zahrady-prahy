import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import '../app/globals.css';
import '../app/atlas.css';
import '../app/gallery.css';
import '../app/mobile.css';
import './fonts.css';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import Page from '../app/page';

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <LocaleProvider>
      <Page />
    </LocaleProvider>
  </StrictMode>,
);
