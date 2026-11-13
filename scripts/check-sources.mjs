/**
 * The monthly check of the atlas's sources.
 *
 * Every visiting fact names its sources and the day they were last checked
 * (lib/garden-visits.ts), and every garden names the page its description
 * comes from (`sourceUrl` in lib/gardens.ts). This script
 *
 * - opens every source address once and lists the ones that no longer
 *   answer, or that now lead to a different page;
 * - lists the facts last checked more than 120 days ago, and the seasonal
 *   facts that name a season which is already over;
 * - keeps apart the sources GitHub's servers cannot open but a person read
 *   in a browser in the last 120 days (scripts/sources-read-by-hand.json),
 *   so a known gap does not keep the issue's title from saying "nothing";
 *
 * and writes the result as Markdown, for one issue that
 * `.github/workflows/source-check.yml` updates once a month. It never changes
 * a fact: what a source says has to be read by a person, and a gap stays a
 * gap (see "Truthfulness over completeness" in AGENTS.md).
 *
 *   node scripts/check-sources.mjs [--out report.md] [--title-out title.txt]
 *                                  [--today YYYY-MM-DD]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** A fact older than this is due for a re-check. */
export const MAX_AGE_DAYS = 120;

const FACT_NAMES = {
  special: 'what makes it special',
  hours: 'hours',
  access: 'access',
  entrance: 'entrance',
  transport: 'getting there',
  accessibility: 'accessibility',
  participation: 'how to join in',
};
const DAY = 24 * 60 * 60 * 1000;

/** Every source address once, with the places that use it. */
export function collectSources(gardens) {
  const sources = new Map();
  const note = (url, garden, where) => {
    if (!sources.has(url)) sources.set(url, { url, uses: [] });
    sources.get(url).uses.push({ garden: garden.name, where });
  };
  for (const garden of gardens) {
    note(garden.sourceUrl, garden, 'description');
    for (const [key, fact] of Object.entries(garden.visit)) {
      for (const source of fact.sources)
        note(source.url, garden, FACT_NAMES[key] ?? key);
    }
  }
  return [...sources.values()];
}

/** Whole days from one ISO date to another. */
export function daysBetween(from, to) {
  return Math.floor((Date.parse(to) - Date.parse(from)) / DAY);
}

/** The register of sources read by hand (scripts/sources-read-by-hand.json). */
export function loadReadByHand() {
  return JSON.parse(
    readFileSync(
      new URL('./sources-read-by-hand.json', import.meta.url),
      'utf8',
    ),
  ).sources;
}

/** The facts whose last check is more than `maxDays` old on `today`. */
export function staleFacts(gardens, today, maxDays = MAX_AGE_DAYS) {
  const stale = [];
  for (const garden of gardens) {
    for (const [key, fact] of Object.entries(garden.visit)) {
      const days = daysBetween(fact.checkedAt, today);
      if (days > maxDays) {
        stale.push({
          garden: garden.name,
          fact: FACT_NAMES[key] ?? key,
          checkedAt: fact.checkedAt,
          days,
        });
      }
    }
  }
  return stale;
}

/** Seasonal facts whose season (a year in `appliesTo`) is over on `today`. */
export function pastSeasons(gardens, today) {
  const year = Number(today.slice(0, 4));
  const past = [];
  for (const garden of gardens) {
    for (const [key, fact] of Object.entries(garden.visit)) {
      const season = fact.appliesTo?.en;
      const years = (season?.match(/\b(19|20)\d\d\b/g) ?? []).map(Number);
      if (years.length && Math.max(...years) < year) {
        past.push({
          garden: garden.name,
          fact: FACT_NAMES[key] ?? key,
          season,
        });
      }
    }
  }
  return past;
}

/** The same page, give or take `www.`, a trailing slash or http → https. */
export function samePage(a, b) {
  const key = (address) => {
    const url = new URL(address);
    return (
      url.host.replace(/^www\./, '') +
      url.pathname.replace(/\/+$/, '') +
      url.search
    );
  };
  return key(a) === key(b);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Opens one address: HEAD first (some servers refuse it, then GET), one retry
 * after a network error or a 5xx/429 answer. `status` is 0 when nothing answered.
 */
export async function checkUrl(
  url,
  { fetch = globalThis.fetch, retryDelay = 3000, timeout = 20000 } = {},
) {
  const headers = {
    'user-agent':
      'zahrady-prahy source check (+https://github.com/usnea-communitas/zahrady-prahy)',
    accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8',
  };
  let last = { url, status: 0, finalUrl: url, error: '' };
  for (let attempt = 1; attempt <= 2; attempt++) {
    for (const method of ['HEAD', 'GET']) {
      try {
        const res = await fetch(url, {
          method,
          headers,
          redirect: 'follow',
          signal: AbortSignal.timeout(timeout),
        });
        await res.body?.cancel();
        last = { url, status: res.status, finalUrl: res.url || url, error: '' };
        if (res.ok) return last;
      } catch (e) {
        last = {
          url,
          status: 0,
          finalUrl: url,
          error: e.cause?.code || e.name || String(e),
        };
      }
    }
    const retry =
      last.status === 0 || last.status === 429 || last.status >= 500;
    if (!retry || attempt === 2) break;
    await sleep(retryDelay);
  }
  return last;
}

/** "Garden: description, hours; Other garden: access" */
const usedFor = (uses) => {
  const byGarden = new Map();
  for (const u of uses)
    byGarden.set(u.garden, [
      ...new Set([...(byGarden.get(u.garden) ?? []), u.where]),
    ]);
  return [...byGarden]
    .map(([garden, where]) => `${garden}: ${where.join(', ')}`)
    .join('; ');
};
/** "1 address", "2 addresses" */
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const cell = (text) => String(text).replace(/\|/g, '\\|');
const table = (head, rows) =>
  [
    `| ${head.join(' | ')} |`,
    `|${head.map(() => '---').join('|')}|`,
    ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`),
  ].join('\n');

/** The issue: a summary, then only the lists that have something in them. */
export function formatReport({
  today,
  sources,
  results,
  stale,
  seasons,
  factCount,
  readByHand = [],
}) {
  const byUrl = new Map(results.map((r) => [r.url, r]));
  const ok = (r) => r && r.status >= 200 && r.status < 300;
  // a source the check could not open but a person read recently enough
  const reading = (s) => {
    const entry = readByHand.find((e) => e.url === s.url);
    return entry && daysBetween(entry.readAt, today) <= MAX_AGE_DAYS
      ? entry
      : null;
  };
  const readLately = sources.filter((s) => !ok(byUrl.get(s.url)) && reading(s));
  // an error page, or no connection at all (status 0)
  const failed = sources.filter(
    (s) => byUrl.get(s.url)?.status > 0 && !ok(byUrl.get(s.url)) && !reading(s),
  );
  const unreachable = sources.filter(
    (s) => !(byUrl.get(s.url)?.status > 0) && !reading(s),
  );
  // the date of an older reading, said where the source is listed again
  const lastRead = (s) => {
    const entry = readByHand.find((e) => e.url === s.url);
    return entry ? `; last read by hand on ${entry.readAt}` : '';
  };
  const moved = sources.filter((s) => {
    const r = byUrl.get(s.url);
    return ok(r) && !samePage(s.url, r.finalUrl);
  });
  const answering =
    sources.length -
    failed.length -
    unreachable.length -
    moved.length -
    readLately.length;
  const todo =
    failed.length +
    unreachable.length +
    moved.length +
    stale.length +
    seasons.length;
  const lines = [
    `## Source check, ${today}`,
    '',
    `**${todo ? `${todo} to look at` : 'Nothing to look at'}.** ` +
      `${count(sources.length, 'source address', 'source addresses')}: ` +
      `${count(answering, 'answers', 'answer')} as before, ` +
      `${count(moved.length, 'now leads', 'now lead')} elsewhere, ` +
      `${count(failed.length, 'answers', 'answer')} with an error, ` +
      `${count(unreachable.length, 'could', 'could')} not be reached` +
      (readLately.length
        ? `, ${count(readLately.length, 'was', 'were')} read by hand instead. `
        : '. ') +
      `${count(factCount, 'visiting fact', 'visiting facts')}: ` +
      `${count(stale.length, 'was', 'were')} last checked more than ${MAX_AGE_DAYS} days ago, ` +
      `${count(seasons.length, 'is', 'are')} for a season that is over.`,
  ];
  if (failed.length) {
    lines.push(
      '',
      '### Sources that answer with an error',
      '',
      'A 403 can mean the site refuses automated visits; open the address in a browser before changing anything.',
      '',
      table(
        ['Address', 'Answer', 'Used for'],
        failed.map((s) => [
          s.url,
          String(byUrl.get(s.url).status) + lastRead(s),
          usedFor(s.uses),
        ]),
      ),
    );
  }
  if (unreachable.length) {
    lines.push(
      '',
      '### Sources the check could not reach',
      '',
      "The check runs on GitHub's servers abroad, and some Czech sites do not accept connections from there. Open the address in a browser: if the page is there and still says the same, nothing needs to change.",
      '',
      table(
        ['Address', 'What happened', 'Used for'],
        unreachable.map((s) => [
          s.url,
          `no connection (${byUrl.get(s.url)?.error || 'unknown'})${lastRead(s)}`,
          usedFor(s.uses),
        ]),
      ),
    );
  }
  if (readLately.length) {
    lines.push(
      '',
      '### Sources read by hand',
      '',
      `The check cannot open these addresses from GitHub's servers, so a person reads them in a browser; a reading counts for ${MAX_AGE_DAYS} days (\`scripts/sources-read-by-hand.json\`). Nothing to do until then.`,
      '',
      table(
        ['Address', 'Read by hand', 'Used for'],
        readLately.map((s) => {
          const { readAt } = reading(s);
          return [
            s.url,
            `${readAt} (${daysBetween(readAt, today)} days ago)`,
            usedFor(s.uses),
          ];
        }),
      ),
    );
  }
  if (moved.length) {
    lines.push(
      '',
      '### Sources that now lead elsewhere',
      '',
      table(
        ['Address', 'Leads to', 'Used for'],
        moved.map((s) => [s.url, byUrl.get(s.url).finalUrl, usedFor(s.uses)]),
      ),
    );
  }
  if (stale.length) {
    lines.push(
      '',
      `### Facts last checked more than ${MAX_AGE_DAYS} days ago`,
      '',
      table(
        ['Garden', 'Fact', 'Checked', 'Days ago'],
        stale.map((f) => [f.garden, f.fact, f.checkedAt, String(f.days)]),
      ),
    );
  }
  if (seasons.length) {
    lines.push(
      '',
      '### Seasonal facts for a season that is over',
      '',
      table(
        ['Garden', 'Fact', 'Season'],
        seasons.map((f) => [f.garden, f.fact, f.season]),
      ),
    );
  }
  if (todo) {
    lines.push(
      '',
      '### What to do',
      '',
      "1. Read the source again (the garden's own page first) and correct the fact in both languages in `lib/garden-visits.ts`. What the source no longer says becomes an honest gap, never a guess.",
      '2. Change the check date only when every source of that fact has been re-read, then open a pull request that names the sources.',
      '3. A source that the check cannot reach but a browser can: when it still says the same, write the day you read it in `scripts/sources-read-by-hand.json`.',
    );
  }
  lines.push(
    '',
    `<sub>Made by \`scripts/check-sources.mjs\` on ${today}. The check runs on the 3rd of every month and replaces this text; it changes nothing in the atlas.</sub>`,
    '',
  );
  return lines.join('\n');
}

/** Runs the check: opens every address (four at a time) and makes the report. */
export async function runCheck({
  gardens,
  today,
  fetch,
  readByHand = loadReadByHand(),
} = {}) {
  const sources = collectSources(gardens);
  const results = Array.from({ length: sources.length });
  let next = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < sources.length) {
        const i = next++;
        results[i] = await checkUrl(sources[i].url, fetch ? { fetch } : {});
      }
    }),
  );
  const factCount = gardens.reduce(
    (n, g) => n + Object.keys(g.visit).length,
    0,
  );
  const stale = staleFacts(gardens, today);
  const seasons = pastSeasons(gardens, today);
  const report = formatReport({
    today,
    sources,
    results,
    stale,
    seasons,
    factCount,
    readByHand,
  });
  // the issue's title repeats the summary: "Source check: 2 to look at"
  const summary = report.match(/\*\*(.+?)\.\*\*/)[1];
  return {
    report,
    title: `Source check: ${summary.charAt(0).toLowerCase()}${summary.slice(1)}`,
    sources,
    results,
    stale,
    seasons,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const arg = (name) => {
    const i = process.argv.indexOf(name);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  const today = arg('--today') ?? new Date().toISOString().slice(0, 10);
  const { gardens } = await import('../lib/gardens.ts');
  const { report, title, sources, results } = await runCheck({
    gardens,
    today,
  });
  const titleOut = arg('--title-out');
  if (titleOut) writeFileSync(titleOut, title);
  const out = arg('--out');
  if (out) writeFileSync(out, report);
  process.stdout.write(report);
  // a note in the Actions log for every address that did not answer
  for (const r of results) {
    if (!(r.status >= 200 && r.status < 300)) {
      console.log(`::warning::${r.url} ${r.status || r.error}`);
    }
  }
  console.error(`${sources.length} addresses checked`);
}
