/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { IVsMapApp } from '../../src/adapters/ui/components/organisms/IVsMapApp';

// The footer promises the version of the release the user is looking at, and it
// used to be a hardcoded `1.0.0` that fell three releases behind. This test reads
// the same manifest the build reads, so a stale literal cannot pass: if the footer
// stops following `package.json`, this fails.
// Relative to the project root, which is where vitest runs. `import.meta.url` is
// not a file URL under the happy-dom environment, so it cannot be used here.
const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

describe('footer version', () => {
  it('shows the version of the release, read from package.json', () => {
    render(<IVsMapApp />);

    expect(
      screen.getByText(`Diosesmon Crianza Pro • v${manifest.version}`),
    ).toBeInTheDocument();
  });

  it('gets that version injected at build time, not from a literal in the component', () => {
    expect(__APP_VERSION__).toBe(manifest.version);
    expect(__APP_VERSION__).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('no longer lists store tariffs, which a source of truth no UI reads', () => {
    render(<IVsMapApp />);

    expect(screen.queryByText(/Tarifas Tienda/)).not.toBeInTheDocument();
  });
});
