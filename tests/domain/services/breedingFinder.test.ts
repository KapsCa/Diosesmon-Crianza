import { describe, it, expect } from 'vitest';
import { findCompatibleParents } from '../../../src/domain/services/breedingFinder';
import { Stat } from '../../../src/domain/types/stat';
import { Species } from '../../../src/domain/types/pokemon';
import { Gender } from '../../../src/domain/types/pokemon';

// Species mock para tests - usamos las definiciones del tipo Species
const MOCK_TRAPINCH: Species = {
  id: 328,
  name: 'Trapinch',
  genderRatio: 0.5,
  eggGroups: [{ name: 'Bug' }, { name: 'Dragon' }],
  gen: 3,
  baseStats: {
    hp: 45,
    attack: 100,
    defense: 45,
    spatk: 45,
    spdef: 45,
    speed: 10,
  },
  captureRate: 255,
};

const MOCK_DITTO: Species = {
  id: 132,
  name: 'Ditto',
  genderRatio: 0,
  eggGroups: [{ name: 'Ditto' }],
  gen: 1,
  baseStats: {
    hp: 48,
    attack: 48,
    defense: 48,
    spatk: 48,
    spdef: 48,
    speed: 48,
  },
  captureRate: 35,
};

const MOCK_SPECIES: Species = {
  id: 1,
  name: 'Testmon',
  genderRatio: 0.5,
  eggGroups: [{ name: 'Field' }],
  gen: 1,
  baseStats: {
    hp: 45,
    attack: 60,
    defense: 40,
    spatk: 70,
    spdef: 50,
    speed: 45,
  },
  captureRate: 45,
};

describe('findCompatibleParents', () => {
  it('should find compatible parents when egg groups match and gender rules are satisfied', () => {
    const targetIVs: Stat[] = [Stat.HP, Stat.Attack];
    const result = findCompatibleParents(MOCK_TRAPINCH, targetIVs);

    expect(result).toBeDefined();
    expect(result.eggGroupMatch).toBe(true);
    expect(result.genderRules).toBe(true);
    // Trapinch has Bug and Dragon egg groups
    // Parents should share at least one of these
    if (result.parents.length > 0) {
      for (const parent of result.parents) {
        const targetGroupNames = MOCK_TRAPINCH.eggGroups.map((g) => g.name);
        const parentGroupNames = parent.species.eggGroups.map((g) => g.name);
        const shared = targetGroupNames.filter((g) => parentGroupNames.includes(g));
        expect(shared.length).toBeGreaterThan(0);
      }
    }
  });

  it('should include Ditto as compatible parent (genderless)', () => {
    const targetIVs: Stat[] = [Stat.HP];
    const result = findCompatibleParents(MOCK_DITTO, targetIVs);

    // Ditto should be compatible
    expect(result.compatible).toBe(true);
    // At least one parent should be Ditto or have matching egg groups
    const hasDitto = result.parents.some((p) => p.species.name === 'Ditto');
    expect(hasDitto || result.eggGroupMatch).toBe(true);
  });

  it('should return incompatible when no egg group overlap', () => {
    // Create a species with unique egg group not shared
    const uniqueSpecies: Species = {
      id: 999,
      name: 'UniqueSpecies',
      genderRatio: 0.5,
      eggGroups: [{ name: 'Undiscovered' }],
      gen: 1,
      baseStats: { hp: 50, attack: 50, defense: 50, spatk: 50, spdef: 50, speed: 50 },
      captureRate: 45,
    };

    const targetIVs: Stat[] = [Stat.HP];
    const result = findCompatibleParents(uniqueSpecies, targetIVs);

    expect(result.compatible).toBe(false);
    expect(result.eggGroupMatch).toBe(false);
    expect(result.reason).toContain('no comparten grupo huevo');
  });

  it('should require both male and female parents (gender rules)', () => {
    const targetIVs: Stat[] = [Stat.Speed];
    const result = findCompatibleParents(MOCK_SPECIES, targetIVs);

    expect(result.genderRules).toBe(true);
    // When we have parents, they should include both genders
    if (result.parents.length >= 2) {
      const genders = result.parents.map((p) => p.gender);
      expect(genders).toContain(Gender.Male);
      expect(genders).toContain(Gender.Female);
    }
  });

  it('should handle empty target IVs array', () => {
    const result = findCompatibleParents(MOCK_TRAPINCH, []);
    expect(result).toBeDefined();
    expect(result.compatible || result.eggGroupMatch).toBe(true);
  });
});