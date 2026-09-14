/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen, fireEvent } from '@testing-library/react';
import { IVsMapApp } from '../../src/adapters/ui/components/organisms/IVsMapApp';
import { repoPath, readRepoFile } from '../support/repo';

const manifest = JSON.parse(readRepoFile('package.json')) as { version: string };

const enterPlanner = () =>
  fireEvent.click(screen.getByRole('button', { name: /comenzar a planificar/i }));

describe('presentation screen', () => {
  it('is what the application opens on, instead of the planner', () => {
    render(<IVsMapApp />);

    expect(
      screen.getByRole('button', { name: /comenzar a planificar/i }),
    ).toBeInTheDocument();
    // The wizard must not be reachable before the call to action: if it were, the
    // presentation would be decoration rather than a screen.
    expect(screen.queryByText(/¿Qué Pokémon deseas criar\?/i)).not.toBeInTheDocument();
  });

  it('shows the release version, so the badge and the footer cannot disagree', () => {
    render(<IVsMapApp />);

    expect(screen.getByText(`v${manifest.version}`)).toBeInTheDocument();
  });

  it('enters the planner when the call to action is used, and leaves the presentation', () => {
    render(<IVsMapApp />);
    enterPlanner();

    expect(screen.getByText(/¿Qué Pokémon deseas criar\?/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /comenzar a planificar/i }),
    ).not.toBeInTheDocument();
  });

  // The session slot exists because a per-user bank is coming, but there is no
  // identity layer behind it yet. A control that looks like it signs you in while
  // storing nothing would be a lie, so it has to stay disabled until #77 lands.
  it('offers the profile slot as explicitly disabled', () => {
    render(<IVsMapApp />);

    const profile = screen.getByRole('button', { name: /perfiles/i });
    expect(profile).toBeDisabled();
    expect(profile).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('footer credits', () => {
  it('credits the author with a link, next to the release version', () => {
    render(<IVsMapApp />);

    const link = screen.getByRole('link', { name: '@KapsCa' });
    expect(link).toHaveAttribute('href', 'https://github.com/KapsCa');
    // Off-site link: rel has to say so.
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveAttribute('target', '_blank');

    expect(
      screen.getByText(`Diosesmon Crianza Pro • v${manifest.version}`),
    ).toBeInTheDocument();
  });
});

describe('presentation screen styling', () => {
  // The reference design paints the call to action with a violet to light-violet
  // gradient under light text, which measures 2.60 to 1 at its light end and fails
  // AA. This asserts the fix stays in place, since a "prettier" gradient is exactly
  // the kind of thing a later change would reintroduce.
  it('keeps the call to action gradient on the darker brand stops', () => {
    render(<IVsMapApp />);

    const cta = screen.getByRole('button', { name: /comenzar a planificar/i });
    expect(cta.className).toContain('from-brand-deep');
    expect(cta.className).toContain('to-brand');
    expect(cta.className).not.toContain('to-brand-soft');
  });

  it('is fully on role tokens, with no raw palette classes', () => {
    const source = readFileSync(
      repoPath('src/adapters/ui/components/organisms/WelcomeScreen.tsx'),
      'utf8',
    );

    expect(source).not.toMatch(/\b(purple|slate|indigo|emerald|sky|pink)-\d{2,3}\b/);
  });
});
