import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gardens } from '../lib/gardens.ts';
import { GARDEN_VISIT_CHECKED_AT } from '../lib/garden-visits.ts';
import {
  MAX_AGE_DAYS,
  checkUrl,
  collectSources,
  formatReport,
  loadReadByHand,
  pastSeasons,
  samePage,
  staleFacts,
} from '../scripts/check-sources.mjs';

const addDays = (iso, days) =>
  new Date(Date.parse(iso) + days * 86400000).toISOString().slice(0, 10);
const facts = gardens.flatMap((garden) => Object.values(garden.visit));

await test('the check opens every source the atlas names, each once', () => {
  const sources = collectSources(gardens);
  const urls = sources.map((source) => source.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const garden of gardens) assert.ok(urls.includes(garden.sourceUrl));
  for (const fact of facts) {
    for (const source of fact.sources) assert.ok(urls.includes(source.url));
  }
  assert.ok(
    sources.some((source) => source.uses.length > 1),
    'an address used twice is opened once',
  );
});

await test(`a fact is due for a re-check after ${MAX_AGE_DAYS} days`, () => {
  assert.deepEqual(
    staleFacts(gardens, addDays(GARDEN_VISIT_CHECKED_AT, MAX_AGE_DAYS)),
    [],
  );
  const due = staleFacts(
    gardens,
    addDays(GARDEN_VISIT_CHECKED_AT, MAX_AGE_DAYS + 1),
  );
  assert.equal(due.length, facts.length);
  assert.equal(due[0].days, MAX_AGE_DAYS + 1);
});

await test('a seasonal fact is flagged once its season is over', () => {
  const seasonal = facts.filter((fact) =>
    /\b20\d\d\b/.test(fact.appliesTo?.en ?? ''),
  );
  assert.ok(seasonal.length > 0);
  assert.deepEqual(pastSeasons(gardens, '2026-11-11'), []);
  assert.equal(pastSeasons(gardens, '2027-01-03').length, seasonal.length);
});

await test('only a different page counts as leading elsewhere', () => {
  assert.ok(samePage('https://prazelenina.cz/', 'https://www.prazelenina.cz'));
  assert.ok(samePage('http://example.org/a/', 'https://example.org/a'));
  assert.ok(
    !samePage(
      'https://www.3udoli.cz/komunitni-zahrada/',
      'https://www.3udoli.cz/komunitni-zahrada-leden/',
    ),
  );
});

// a fetch that answers from a script of responses, one per call
function scripted(...answers) {
  const calls = [];
  const fetch = async (url, options) => {
    calls.push(options.method);
    const answer = answers.shift();
    if (answer instanceof Error) throw answer;
    return {
      ok: answer.status >= 200 && answer.status < 300,
      status: answer.status,
      url: answer.url ?? url,
      body: { cancel: async () => {} },
    };
  };
  return { fetch, calls };
}

await test('an address is opened with HEAD, then GET, and retried once', async () => {
  const ok = scripted({ status: 200 });
  assert.equal(
    (await checkUrl('https://a.example/', { fetch: ok.fetch })).status,
    200,
  );
  assert.deepEqual(ok.calls, ['HEAD']);

  const noHead = scripted(
    { status: 405 },
    { status: 200, url: 'https://a.example/new' },
  );
  const moved = await checkUrl('https://a.example/', { fetch: noHead.fetch });
  assert.deepEqual(
    [moved.status, moved.finalUrl],
    [200, 'https://a.example/new'],
  );
  assert.deepEqual(noHead.calls, ['HEAD', 'GET']);

  const gone = scripted({ status: 404 }, { status: 404 });
  assert.equal(
    (await checkUrl('https://a.example/', { fetch: gone.fetch, retryDelay: 0 }))
      .status,
    404,
  );
  assert.deepEqual(gone.calls, ['HEAD', 'GET'], 'a 404 is not retried');

  const down = new TypeError('fetch failed', { cause: { code: 'ENOTFOUND' } });
  const flaky = scripted(down, down, { status: 200 });
  assert.equal(
    (
      await checkUrl('https://a.example/', {
        fetch: flaky.fetch,
        retryDelay: 0,
      })
    ).status,
    200,
  );
  const dead = scripted(down, down, down, down);
  const result = await checkUrl('https://a.example/', {
    fetch: dead.fetch,
    retryDelay: 0,
  });
  assert.deepEqual([result.status, result.error], [0, 'ENOTFOUND']);
});

await test('the report lists only what needs a look', () => {
  const sources = collectSources(gardens);
  const allFine = sources.map((source) => ({
    url: source.url,
    status: 200,
    finalUrl: source.url,
  }));
  const quiet = formatReport({
    today: '2026-11-11',
    sources,
    results: allFine,
    stale: [],
    seasons: [],
    factCount: facts.length,
  });
  assert.match(quiet, /\*\*Nothing to look at\.\*\*/);
  assert.doesNotMatch(quiet, /###/);

  const [first, second, third] = sources;
  const results = allFine.map((r) =>
    r.url === first.url
      ? { ...r, status: 404 }
      : r.url === second.url
        ? { ...r, finalUrl: second.url + 'elsewhere/' }
        : r.url === third.url
          ? { ...r, status: 0, error: 'ETIMEDOUT' }
          : r,
  );
  const stale = staleFacts(
    gardens,
    addDays(GARDEN_VISIT_CHECKED_AT, 200),
  ).slice(0, 1);
  const report = formatReport({
    today: '2027-03-25',
    sources,
    results,
    stale,
    seasons: [],
    factCount: facts.length,
  });
  assert.match(report, /\*\*4 to look at\.\*\*/);
  assert.match(report, /1 answers with an error, 1 could not be reached/);
  assert.match(report, /### Sources that answer with an error[\s\S]*\| 404 \|/);
  assert.match(
    report,
    /### Sources the check could not reach[\s\S]*no connection \(ETIMEDOUT\)/,
  );
  assert.match(report, /### Sources that now lead elsewhere/);
  assert.match(report, /### Facts last checked more than 120 days ago/);
  assert.doesNotMatch(report, /### Seasonal facts/);
  for (const source of [first, second, third]) {
    assert.ok(report.includes(source.url), source.url);
  }
});

await test('a source read by hand stays out of the count for 120 days, then counts again', () => {
  const sources = collectSources(gardens);
  const register = loadReadByHand();
  assert.ok(register.length > 0);
  for (const entry of register) {
    assert.ok(
      sources.some((s) => s.url === entry.url),
      `${entry.url} is a source the atlas names`,
    );
    assert.match(entry.readAt, /^\d{4}-\d{2}-\d{2}$/);
  }
  // what the check sees from GitHub: the registered addresses time out
  const results = sources.map((s) =>
    register.some((e) => e.url === s.url)
      ? { url: s.url, status: 0, finalUrl: s.url, error: 'ETIMEDOUT' }
      : { url: s.url, status: 200, finalUrl: s.url },
  );
  const report = (today) =>
    formatReport({
      today,
      sources,
      results,
      stale: [],
      seasons: [],
      factCount: facts.length,
      readByHand: register,
    });
  const newest = register.map((e) => e.readAt).sort()[0];

  const fresh = report(addDays(newest, MAX_AGE_DAYS));
  assert.match(fresh, /\*\*Nothing to look at\.\*\*/);
  assert.match(
    fresh,
    new RegExp(
      `0 could not be reached, ${register.length} (was|were) read by hand instead`,
    ),
  );
  assert.match(fresh, /### Sources read by hand/);
  assert.doesNotMatch(fresh, /### Sources the check could not reach/);

  const old = report(addDays(newest, MAX_AGE_DAYS + 1));
  assert.match(old, new RegExp(`\\*\\*${register.length} to look at\\.\\*\\*`));
  assert.match(
    old,
    /### Sources the check could not reach[\s\S]*last read by hand on \d{4}-\d{2}-\d{2}/,
  );
  assert.doesNotMatch(old, /### Sources read by hand/);

  // a registered source that answers again is simply counted as answering
  const answering = formatReport({
    today: addDays(newest, 10),
    sources,
    results: sources.map((s) => ({ url: s.url, status: 200, finalUrl: s.url })),
    stale: [],
    seasons: [],
    factCount: facts.length,
    readByHand: register,
  });
  assert.match(answering, new RegExp(`${sources.length} answer as before`));
  assert.doesNotMatch(answering, /read by hand/);
});
