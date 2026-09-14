import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readRepoFile, repoRoot } from '../support/repo';

/**
 * `base` has to equal the repository name, and nothing derives it: it is a hand-written
 * string in `vite.config.ts`. Renaming the repository — or forking it — leaves that string
 * stale, and a stale base means every emitted asset URL 404s under the project page. The
 * failure looks exactly like the one this repository already had: the site answers 200
 * with a blank screen and no check turns red. This test is here to make it loud.
 */
const configuredBase = /base:\s*'([^']+)'/.exec(readRepoFile('vite.config.ts'))?.[1];

/**
 * The real repository name, from the two places that know it: the CI environment, and the
 * `origin` remote. Neither is derived from the base itself, which is the point.
 */
const repositoryName = (): string => {
  const fromCi = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (fromCi) return fromCi;

  try {
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
    // Handles both `git@github.com:owner/repo.git` and `https://github.com/owner/repo`.
    return remote.replace(/\.git$/, '').split(/[/:]/).pop() ?? '';
  } catch {
    return '';
  }
};

describe('the deploy base path', () => {
  it('is declared in vite.config.ts', () => {
    expect(configuredBase).toBeDefined();
  });

  it('matches the repository name', () => {
    const name = repositoryName();

    // Fails loudly instead of skipping: without a name there is nothing to compare, and a
    // green result would mean the test verified nothing.
    expect(
      name,
      'could not determine the repository name: set GITHUB_REPOSITORY or keep an `origin` remote',
    ).not.toBe('');

    expect(configuredBase).toBe(`/${name}/`);
  });
});
