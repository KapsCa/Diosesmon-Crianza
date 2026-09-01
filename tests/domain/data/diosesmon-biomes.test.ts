import { describe, it, expect } from 'vitest';
import { MOCK_SPECIES } from '../../helpers';
import { biomes } from '../../../src/domain/data/diosesmon-biomes';

describe('diosesmon-biomes', () => {
  it('should export a biomes array', () => {
    expect(Array.isArray(biomes)).toBe(true);
  });

  it('should contain biomes with species, biome, encounterRate, and captureChance', () => {
    const firstBiome = biomes[0];
    expect(firstBiome).toHaveProperty('species');
    expect(firstBiome).toHaveProperty('biome');
    expect(firstBiome).toHaveProperty('encounterRate');
    expect(firstBiome).toHaveProperty('captureChance');
  });

  it('should have biome entries for common Pokémon species', () => {
    const speciesNames = biomes.map((b) => b.species.name);
    expect(speciesNames).toContain('Trapinch');
    expect(speciesNames).toContain('Caterpie');
  });

  it('should have valid encounter rates between 0 and 1', () => {
    for (const biome of biomes) {
      expect(biome.encounterRate).toBeGreaterThanOrEqual(0);
      expect(biome.encounterRate).toBeLessThanOrEqual(1);
    }
  });

  it('should have valid capture chances between 0 and 1', () => {
    for (const biome of biomes) {
      expect(biome.captureChance).toBeGreaterThanOrEqual(0);
      expect(biome.captureChance).toBeLessThanOrEqual(1);
    }
  });

  it('should have at least one biome entry', () => {
    expect(biomes.length).toBeGreaterThan(0);
  });

  it('should have biome data for Trapinch in Desert', () => {
    const trapinchBiome = biomes.find(
      (b) => b.species.name === 'Trapinch' && b.biome === 'Desert'
    );
    expect(trapinchBiome).toBeDefined();
    expect(trapinchBiome?.encounterRate).toBeGreaterThan(0);
  });
});