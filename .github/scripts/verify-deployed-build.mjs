import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * The hashed JS entry point a build emitted, read from its own `index.html`.
 *
 * `null` when the page references no hashed asset at all — which is not a corner
 * case: it is exactly what the development `index.html` looks like, and serving
 * that file is the failure this script exists to catch.
 *
 * @param {string} html
 * @returns {string | null}
 */
export function extractAsset(html) {
  const match = /assets\/index-[A-Za-z0-9_-]+\.js/.exec(html);
  return match ? match[0] : null;
}

/**
 * Polls the published page until it references `expectedAsset`.
 *
 * A green `deploy-pages` step only proves the artifact was uploaded and the Pages
 * API accepted it. It does not prove production serves it: this repository already
 * shipped a deploy that reported success while the site served the raw development
 * tree, HTTP 200 with a blank page and no failing check to explain it.
 *
 * `fetchImpl` and `sleep` are injected so every branch below is testable without a
 * network. A verifier nobody ever watched fail is just another false green.
 *
 * @param {object} options
 * @param {string} options.pageUrl published site root
 * @param {string} options.expectedAsset asset filename this build emitted
 * @param {typeof fetch} [options.fetchImpl]
 * @param {number} [options.attempts]
 * @param {number} [options.delayMs]
 * @param {(ms: number) => Promise<void>} [options.sleep]
 * @param {(message: string) => void} [options.log]
 * @returns {Promise<{ ok: boolean, attempts: number }>}
 */
export async function verifyDeployedBuild({
  pageUrl,
  expectedAsset,
  fetchImpl = fetch,
  attempts = 12,
  delayMs = 10_000,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  log = (message) => console.log(message),
}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    // The cache-busting query matters: without it a cached copy of the previous
    // build can be mistaken for evidence about this one.
    const separator = pageUrl.includes('?') ? '&' : '?';
    const url = `${pageUrl}${separator}verify=${attempt}`;

    let body = '';
    let failure = null;
    try {
      const response = await fetchImpl(url);
      if (!response.ok) {
        failure = `HTTP ${response.status}`;
      } else {
        body = await response.text();
      }
    } catch (cause) {
      failure = cause instanceof Error ? cause.message : String(cause);
    }

    if (!failure && body.includes(expectedAsset)) {
      log(`verified on attempt ${attempt}/${attempts}: the published page references ${expectedAsset}`);
      return { ok: true, attempts: attempt };
    }

    log(
      failure
        ? `attempt ${attempt}/${attempts}: request failed (${failure})`
        : `attempt ${attempt}/${attempts}: page served, but does not reference ${expectedAsset}`,
    );

    if (attempt < attempts) await sleep(delayMs);
  }

  return { ok: false, attempts };
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  const pageUrl = process.env.PAGE_URL;
  const indexPath = process.env.INDEX_HTML ?? 'dist/index.html';

  if (!pageUrl) {
    console.error('::error::PAGE_URL is required: there is no published URL to verify.');
    process.exit(1);
  }

  const expectedAsset = extractAsset(readFileSync(indexPath, 'utf8'));
  if (!expectedAsset) {
    console.error(
      `::error::${indexPath} references no hashed JS asset, so the deployed page cannot be ` +
        'verified against this build. Refusing to report success on a check that verified nothing.',
    );
    process.exit(1);
  }

  console.log(`this build emitted ${expectedAsset}`);
  console.log(`deployed commit ${process.env.GITHUB_SHA ?? '(unknown)'}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `Deployed \`${process.env.GITHUB_SHA ?? 'unknown'}\` — verified \`${expectedAsset}\` on the published site.\n`,
    );
  }

  const result = await verifyDeployedBuild({
    pageUrl,
    expectedAsset,
    attempts: Number(process.env.ATTEMPTS ?? 12),
    delayMs: Number(process.env.DELAY_MS ?? 10_000),
  });

  if (!result.ok) {
    console.error(
      `::error::the published site never served ${expectedAsset} after ${result.attempts} attempts. ` +
        'The deploy step reported success, but production is not serving this build — the same ' +
        'silent failure that served the development tree with HTTP 200 and a blank page.',
    );
    process.exit(1);
  }
}
