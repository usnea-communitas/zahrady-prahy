// The app itself, loaded by src/main.tsx once the page as built is on screen.
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { gardens } from '@/lib/gardens';
import { parseRoutePath } from '@/lib/routes';
import Home from '../app/page';

// Each page was built for its address; hydrate it with the same route.
const route = parseRoutePath(
  window.location.pathname,
  gardens.map((garden) => garden.id),
);

const app = (
  <StrictMode>
    <LocaleProvider initialLocale={route.locale}>
      <Home initialGardenId={route.gardenId} />
    </LocaleProvider>
  </StrictMode>
);
const root = document.getElementById('root')!;
// The built pages are hydrated; the development server sends an empty page.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
