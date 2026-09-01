import { describe, it, expect } from 'vitest';
import { BiomeCapture } from '../../../src/domain/types/biome';
import { Stat } from '../../../src/domain/types/stat';

describe('BiomeCapture', () => {
  it('should create a BiomeCapture with all required fields', () => {
    const capture: BiomeCapture = {
      species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      biome: 'Forest',
      encounterRate: 0.3,
      captureChance: 0.75,
    };

    expect(capture.species).toBeDefined();
    expect(capture.biome).toBe('Forest');
    expect(capture.encounterRate).toBe(0.3);
    expect(capture.captureChance).toBe(0.75);
  });

  it('should work with minimal fields', () => {
    const capture: BiomeCapture = {
      species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      biome: ' Cave',
    };

    expect(capture.biome).toBe(' Cave');
    expect(capture.encounterRate).toBeUndefined();
    expect(capture.captureChance).toBeUndefined();
  });

  it('should contain valid species data', () => {
    const capture: BiomeCapture = {
      species: { id: 328, name: 'Trapinch', genderRatio: 0.5, eggGroups: [{ name: 'Bug' }, { name: 'Dragon' }], gen: 3, baseStats: { hp: 45, attack: 100, defense: 45, spatk: 45, spdef: 45, speed: 10 }, captureRate: 255 },
      biome: 'Desert',
      encounterRate: 0.1,
    };

    expect(capture.species.name).toBe('Trapinch');
    expect(capture.species.captureRate).toBe(255);
    expect(capture.biome).toBe('Desert');
    expect(typeof capture.encounterRate).toBe('number');
  });

  it('should allow zero encounter rate', () => {
    const capture: BiomeCapture = {
      species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      biome: 'Unknown',
      encounterRate: 0,
      captureChance: 0,
    };

    expect(capture.encounterRate).toBe(0);
    expect(capture.captureChance).toBe(0);
  });
});