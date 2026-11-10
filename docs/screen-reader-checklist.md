# Screen-reader check on a real phone

The browser tests (Playwright and axe) cover keyboard use, focus return and
the accessible names, but not a real screen reader on a phone. This checklist
is for that manual check (issue #3). It takes about 20 minutes per phone.

Use the live atlas, <https://zahrady-prahy.vercel.app/>, once in English and
once via <https://zahrady-prahy.vercel.app/?lang=cs> in Czech. Write down the
phone, the system version and the browser, and attach a screenshot or a short
note for every item that fails.

## Before you start

- **iPhone (VoiceOver):** Settings → Accessibility → VoiceOver. Swipe right
  or left to move, double-tap to activate, two-finger swipe up to read all.
  The rotor (twist two fingers) switches to headings or links.
- **Android (TalkBack):** Settings → Accessibility → TalkBack. Swipe right or
  left to move, double-tap to activate. Swipe down then right for the reading
  controls (headings, links).
- Safari on iPhone, Chrome on Android. Phone held upright.

## Checks

1. **Page start.** The page title is read in the chosen language ("Gardens of
   Prague — a living map of community gardens" / "Zahrady Prahy — živá mapa
   komunitních zahrad"), followed by the main heading.
2. **Language switch.** The EN | CS switcher is read as two toggle buttons,
   the current language announced as pressed or on; switching announces the
   change once and the page then reads in the new language.
3. **Map markers.** Swiping through the map reads every one of the 13 gardens
   by name, in a sensible order; each marker is a button.
4. **Opening a garden.** Double-tapping a marker opens its detail; the focus
   moves into the detail and its heading (the garden's name) is read.
5. **Visiting facts.** Opening hours, access and entrance are read with their
   labels; a missing fact is read as "not found" text, not skipped; each source
   link is read as a link with its name.
6. **Closing.** The close button is read as "Close"; after closing, the focus
   returns to the marker that opened the detail.
7. **Search and filters.** The search field is announced with its label;
   typing announces the number of results; filters are read as buttons that
   say whether they are on.
8. **Announcements.** Changing the language, the search or a filter is
   announced once (the `aria-live` messages), not repeated and not silent.
9. **Sound and motion.** Nothing plays or moves by itself; the soundscape and
   the animation pause controls are read with their state.
10. **Zoom and pan.** With the screen reader on, the map can still be moved
    and zoomed (VoiceOver: three-finger swipe; TalkBack: two-finger swipe), or
    the list gives the same information.
11. **Rotate the phone.** In landscape, the header, the map and the detail are
    still reachable and nothing is read twice.

Record the result in issue #3 as: phone, system, browser, language, and for
each check "OK" or what went wrong.
