/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { BiomeCaptureList } from './BiomeCaptureList';
import { render, screen } from '@testing-library/react';

describe('BiomeCaptureList', () => {
  it('should render biome captures grouped by biome', () => {
    const biomeCaptures = [
      {
        species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
        biome: 'Forest',
        encounterRate: 0.4,
        captureChance: 0.8,
      },
      {
        species: { id: 328, name: 'Trapinch', genderRatio: 0.5, eggGroups: [{ name: 'Bug' }, { name: 'Dragon' }], gen: 3, baseStats: { hp: 45, attack: 100, defense: 45, spatk: 45, spdef: 45, speed: 10 }, captureRate: 255 },
        biome: 'Desert',
        encounterRate: 0.15,
        captureChance: 0.5,
      },
      {
        species: { id: 10, name: 'Caterpie', genderRatio: 0.5, eggGroups: [{ name: 'Bug' }], gen: 1, baseStats: { hp: 45, attack: 30, defense: 35, spatk: 20, spdef: 20, speed: 45 }, captureRate: 255 },
        biome: 'Forest',
        encounterRate: 0.5,
        captureChance: 0.9,
      },
    ];

    render(<BiomeCaptureList biomeCaptures={biomeCaptures} />);

    // Debería haber secciones para cada bioma
    const biomeSections = screen.getAllByRole('region', { name: /bioma/i });
    expect(biomeSections).toHaveLength(2); // Forest y Desert (Caterpie también está en Forest)

    // Forest debe tener 2 species (Testmon y Caterpie)
    const forestSection = screen.getByRole('region', { name: /Forest/i });
    expect(forestSection).toBeInTheDocument();
    const forestCaptures = screen.getAllByText(/Testmon|Caterpie/);
    expect(forestCaptures.length).toBe(2);

    // Desert debe tener 1 species (Trapinch)
    const desertSection = screen.getByRole('region', { name: /Desert/i });
    expect(desertSection).toBeInTheDocument();
    const desertCaptures = screen.getAllByText(/Trapinch/);
    expect(desertCaptures.length).toBe(1);
  });

  it('should display encounter rate and capture chance for each capture', () => {
    const biomeCaptures = [
      {
        species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
        biome: 'Forest',
        encounterRate: 0.4,
        captureChance: 0.8,
      },
    ];

    render(<BiomeCaptureList biomeCaptures={biomeCaptures} />);

    // Debe mostrar la tasa de encuentro
    const encounterRate = screen.getByText(/Tasa de encuentro: 0.4/);
    expect(encounterRate).toBeInTheDocument();
    // Debe mostrar la tasa de captura
    const captureChance = screen.getByText(/Taza de captura: 0.8/);
    expect(captureChance).toBeInTheDocument();
  });

  it('should show species name and capture rate badge', () => {
    const biomeCaptures = [
      {
        species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
        biome: 'Forest',
        encounterRate: 0.4,
        captureChance: 0.8,
      },
    ];

    render(<BiomeCaptureList biomeCaptures={biomeCaptures} />);

    // Debe mostrar el nombre de la species
    const speciesName = screen.getByText(/Testmon/);
    expect(speciesName).toBeInTheDocument();
    // Debe mostrar la captura rate badge
    const captureRateBadge = screen.getByText(/Capture Rate: 45/);
    expect(captureRateBadge).toBeInTheDocument();
  });
});