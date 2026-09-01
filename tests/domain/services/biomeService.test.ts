import { describe, it, expect } from 'vitest';
import { biomes } from '../../../src/domain/data/diosesmon-biomes';
import { getBiomeCaptures } from '../../../src/domain/services/biomeService';

describe('getBiomeCaptures', () => {
  it('should return biome capture info for a single species', () => {
    const result = getBiomeCaptures([{ id: 1, name: 'Testmon' } as any]);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return biome captures for known species from diosesmon-biomes', () => {
    const testSpecies = biomes[0].species;
    const result = getBiomeCaptures([testSpecies]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].biome).toBe('Forest');
    expect(result[0].encounterRate).toBe(0.4);
    expect(result[0].captureChance).toBe(0.8);
  });

  it('should return empty array for unknown species not in biomes data', () => {
    const result = getBiomeCaptures([{ id: 999, name: 'Unknownmon' } as any]);
    expect(result).toEqual([]);
  });

  it('should return captures for multiple species including Ditto', () => {
    const dittoSpecies = biomes.find((b) => b.species.name === 'Ditto')?.species;
    const result = getBiomeCaptures([dittoSpecies]);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].biome).toBe('Any');
  });

  it('should handle mixed known and unknown species', () => {
    const knownSpecies = biomes[0].species;
    const result = getBiomeCaptures([knownSpecies, { id: 999, name: 'Unknown' } as any]);
    expect(result.length).toBe(1);
    expect(result[0].biome).toBe('Forest');
  });
});