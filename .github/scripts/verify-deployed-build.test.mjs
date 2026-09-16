import { test } from 'node:test';
import assert from 'node:assert/strict';

import { extractAsset, verifyAndReport, verifyDeployedBuild } from './verify-deployed-build.mjs';

const ASSET = 'assets/index-DGmOj9zy.js';

// A page that references the build under test: what production looks like when the
// deploy worked.
const livePage = `<script type="module" crossorigin src="/Diosesmon-Crianza/${ASSET}"></script>`;

// The development index.html this repository once served from production: HTTP 200,
// a blank page, and no hashed asset to point at. This is the regression.
const developmentPage = `<script type="module" src="/src/main.tsx"></script>`;

const quiet = () => {};

test('extractAsset reads the hashed entry point a build emitted', () => {
  assert.equal(extractAsset(livePage), ASSET);
});

test('extractAsset returns null for a page with no hashed asset', () => {
  // Not a corner case: returning a made-up value here would let the verification
  // compare against nothing and pass.
  assert.equal(extractAsset(developmentPage), null);
});

test('passes on the first attempt when production already serves this build', async () => {
  const calls = [];
  const result = await verifyDeployedBuild({
    pageUrl: 'https://example.test/Diosesmon-Crianza/',
    expectedAsset: ASSET,
    fetchImpl: async (url) => {
      calls.push(url);
      return { ok: true, status: 200, text: async () => livePage };
    },
    sleep: async () => {},
    log: quiet,
  });

  assert.deepEqual(result, { ok: true, attempts: 1 });
  // The cache-busting query is what stops a cached copy of a previous build from
  // being read as evidence about this one.
  assert.equal(calls.length, 1);
  assert.match(calls[0], /verify=1$/);
});

test('keeps trying while the CDN still serves the previous build', async () => {
  let attempt = 0;
  const result = await verifyDeployedBuild({
    pageUrl: 'https://example.test/',
    expectedAsset: ASSET,
    fetchImpl: async () => {
      attempt += 1;
      return { ok: true, status: 200, text: async () => (attempt < 3 ? developmentPage : livePage) };
    },
    sleep: async () => {},
    log: quiet,
  });

  assert.deepEqual(result, { ok: true, attempts: 3 });
});

test('fails when production never serves this build', async () => {
  const result = await verifyDeployedBuild({
    pageUrl: 'https://example.test/',
    expectedAsset: ASSET,
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => developmentPage }),
    attempts: 4,
    sleep: async () => {},
    log: quiet,
  });

  assert.deepEqual(result, { ok: false, attempts: 4 });
});

test('retries through transient network failures instead of failing on the first', async () => {
  let attempt = 0;
  const result = await verifyDeployedBuild({
    pageUrl: 'https://example.test/',
    expectedAsset: ASSET,
    fetchImpl: async () => {
      attempt += 1;
      if (attempt < 3) throw new Error('ECONNRESET');
      return { ok: true, status: 200, text: async () => livePage };
    },
    sleep: async () => {},
    log: quiet,
  });

  assert.deepEqual(result, { ok: true, attempts: 3 });
});

test('treats a non-200 response as not-verified', async () => {
  const result = await verifyDeployedBuild({
    pageUrl: 'https://example.test/',
    expectedAsset: ASSET,
    fetchImpl: async () => ({ ok: false, status: 404, text: async () => 'not found' }),
    attempts: 2,
    sleep: async () => {},
    log: quiet,
  });

  assert.deepEqual(result, { ok: false, attempts: 2 });
});

test('a page that mentions the asset only in another path does not count as verification', async () => {
  // Guards against a substring match that would accept a page referencing a
  // different build's asset with a similar name.
  const result = await verifyDeployedBuild({
    pageUrl: 'https://example.test/',
    expectedAsset: ASSET,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      text: async () => `<script src="/Diosesmon-Crianza/assets/index-OTHER999.js"></script>`,
    }),
    attempts: 1,
    sleep: async () => {},
    log: quiet,
  });

  assert.deepEqual(result, { ok: false, attempts: 1 });
});

// The regression this pair exists for: the step summary was written before the check ran,
// so a run that failed afterwards still claimed the asset had been `verified ... on the
// published site` — a false green printed by the script that exists to remove false greens.
test('does not claim verification when the published site never serves the build', async () => {
  const written = [];
  const failures = [];

  const result = await verifyAndReport({
    pageUrl: 'https://example.test/',
    expectedAsset: ASSET,
    summaryPath: 'step-summary.md',
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => developmentPage }),
    attempts: 1,
    sleep: async () => {},
    log: quiet,
    fail: (message) => failures.push(message),
    append: (_path, content) => written.push(content),
  });

  assert.equal(result.ok, false);
  assert.equal(failures.length, 1);
  assert.deepEqual(written, []);
});

test('claims verification once, and only after the check passes', async () => {
  const written = [];

  const result = await verifyAndReport({
    pageUrl: 'https://example.test/',
    expectedAsset: ASSET,
    summaryPath: 'step-summary.md',
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => livePage }),
    sleep: async () => {},
    log: quiet,
    fail: () => {
      throw new Error('this run should not have failed');
    },
    append: (_path, content) => written.push(content),
  });

  assert.equal(result.ok, true);
  assert.equal(written.length, 1);
  assert.match(written[0], /verified `assets\/index-DGmOj9zy\.js` on the published site/);
});
