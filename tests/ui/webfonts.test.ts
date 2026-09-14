/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { repoPath, readRepoFile } from '../support/repo';

// The three type stacks used to name webfonts that were never loaded: no
// @font-face, no <link>, no files. Nothing failed, because a webfont that never
// arrives looks exactly like one that works — the text just renders in the system
// font. These assertions exist so that failure mode cannot come back silently.
const FONTS = [
  { family: 'Sora', file: 'sora-latin.woff2', token: '--font-heading' },
  { family: 'Plus Jakarta Sans', file: 'plus-jakarta-sans-latin.woff2', token: '--font-sans' },
  { family: 'JetBrains Mono', file: 'jetbrains-mono-latin.woff2', token: '--font-mono' },
];

const css = readRepoFile('src/index.css');
const html = readRepoFile('index.html');

describe('self-hosted webfonts', () => {
  it.each(FONTS)('ships the actual file for $family', ({ file }) => {
    expect(existsSync(repoPath('public/fonts', file))).toBe(true);

    // WOFF2 files start with the signature 'wOF2'. Without this check an empty
    // placeholder would satisfy the test while shipping a broken font.
    const bytes = readFileSync(repoPath('public/fonts', file));
    expect(bytes.subarray(0, 4).toString('latin1')).toBe('wOF2');
    expect(bytes.byteLength).toBeGreaterThan(4096);
  });

  it.each(FONTS)('declares a swapping @font-face for $family', ({ family, file }) => {
    const face = new RegExp(
      `@font-face\\s*\\{[^}]*font-family:\\s*"${family}"[^}]*\\}`,
      's',
    ).exec(css)?.[0];

    expect(face).toBeDefined();
    expect(face).toContain(`url("/fonts/${file}")`);
    expect(face).toContain('font-display: swap');
  });

  it('preloads every font from index.html, with crossorigin for font preloads', () => {
    for (const { file } of FONTS) {
      const link = new RegExp(`<link[^>]*href="/fonts/${file}"[^>]*>`).exec(html)?.[0];
      expect(link, `preload missing for ${file}`).toBeDefined();
      expect(link).toContain('as="font"');
      expect(link).toContain('crossorigin');
    }
  });

  // The stack order is a separate defect from the missing load: `ui-monospace`
  // came first, every modern system resolves it, so the webfont could never win
  // even with the file present.
  it('puts each webfont ahead of the generic fallbacks in its stack', () => {
    for (const { family, token } of FONTS) {
      const stack = new RegExp(`${token}:\\s*([^;]+);`).exec(css)?.[1] ?? '';
      expect(stack, `${token} stack not found`).not.toBe('');
      expect(stack.indexOf(`"${family}"`)).toBe(0);
    }
  });

  it('does not reach for a third-party font host', () => {
    expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });
});
