import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Repository files are resolved from THIS file, never from the process working
// directory. Reading them as `readFileSync('package.json')` only works because
// Vitest happens to run from the project root, so it silently reads whatever the
// runner's cwd points at. Two consecutive reviews flagged it, which makes it a
// pattern rather than an incident.
//
// `import.meta.url` is not reliably a file URL: under Vitest's module runner the
// same construct was observed as `http:` in one run (throwing "The URL must be of
// scheme file") and as `file:` in another. So: take `import.meta.dirname` when the
// runner provides it, and fall back to `fileURLToPath`. `import.meta.dirname` alone
// requires Node >= 20.11, which the CI's floating `node-version: 20` should satisfy
// but does not guarantee.
const meta = import.meta as unknown as { dirname?: string };
const here = meta.dirname ?? dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(here, '..', '..');

// The guard is the point of this module. If the resolution above ever changes
// shape, this throws instead of quietly reading a different file and producing a
// test result that means nothing.
if (!existsSync(resolve(repoRoot, 'package.json'))) {
  throw new Error(
    `could not locate the repository root from ${here} (resolved to ${repoRoot})`,
  );
}

/** Absolute path to a repository file or directory. */
export const repoPath = (...segments: string[]): string =>
  resolve(repoRoot, ...segments);

/** Reads a repository text file by its path relative to the repository root. */
export const readRepoFile = (relativePath: string): string =>
  readFileSync(repoPath(relativePath), 'utf8');
