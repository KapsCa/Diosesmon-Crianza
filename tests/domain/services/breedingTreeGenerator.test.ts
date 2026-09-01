import { describe, it, expect } from 'vitest';
import { Stat } from '../../../src/domain/types/stat';
import { Species } from '../../../src/domain/types/pokemon';
import { generateBreedingTree } from '../../../src/domain/services/breedingTreeGenerator';
import { analyzeOverlap, calculateMissingIVs, findBestItemCombination } from '../../../src/domain/services/overlap';
import { Gender } from '../../../src/domain/types/pokemon';
import { findCompatibleParents } from '../../../src/domain/services/breedingFinder';

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

describe('generateBreedingTree', () => {
  it('should generate a breeding tree with overlap analysis', () => {
    const config = {
      targetSpecies: MOCK_TRAPINCH,
      targetIVs: [Stat.HP, Stat.Attack, Stat.Defense],
      chooseGender: false,
    };
    const result = generateBreedingTree(config);
    expect(result).toBeDefined();
    expect(result.tree).toBeDefined();
    expect(result.tree.maxDepth).toBeDefined();
  });

  it('should analyze overlap between parent Pokémon', () => {
    const father = {
      species: MOCK_TRAPINCH,
      gender: Gender.Male,
      ivs: {
        [Stat.HP]: 31,
        [Stat.Attack]: 31,
        [Stat.Defense]: 31,
        [Stat.SpAtk]: 0,
        [Stat.SpDef]: 0,
        [Stat.Speed]: 0,
      },
      heldItem: null,
    };

    const mother = {
      species: MOCK_TRAPINCH,
      gender: Gender.Female,
      ivs: {
        [Stat.HP]: 0,
        [Stat.Attack]: 0,
        [Stat.Defense]: 31,
        [Stat.SpAtk]: 0,
        [Stat.SpDef]: 0,
        [Stat.Speed]: 0,
      },
      heldItem: null,
    };

    const overlap = analyzeOverlap(father, mother);
    expect(overlap.freeInheritance).toBeDefined();
    expect(overlap.itemProtected).toBeDefined();
    expect(overlap.rng).toBeDefined();
  });

  it('should calculate missing IVs given current spread and overlap', () => {
    const overlap = {
      freeInheritance: [Stat.HP, Stat.Attack],
      itemProtected: [{ stat: Stat.Defense, byParent: 'father' as const }],
      rng: [],
    };

    const currentIVs = [Stat.HP, Stat.Attack, Stat.Defense];
    const targetIVs = [Stat.HP, Stat.Attack, Stat.Defense, Stat.SpAtk];

    const missing = calculateMissingIVs(currentIVs, targetIVs, overlap);
    expect(missing).toBe(1); // Only SpAtk falta
  });

  it('should find best item combination for protecting IVs', () => {
    const father = {
      species: MOCK_TRAPINCH,
      gender: Gender.Male,
      ivs: {
        [Stat.HP]: 31,
        [Stat.Attack]: 31,
        [Stat.Defense]: 31,
        [Stat.SpAtk]: 0,
        [Stat.SpDef]: 0,
        [Stat.Speed]: 0,
      },
      heldItem: null,
    };

    const mother = {
      species: MOCK_TRAPINCH,
      gender: Gender.Female,
      ivs: {
        [Stat.HP]: 0,
        [Stat.Attack]: 0,
        [Stat.Defense]: 31,
        [Stat.SpAtk]: 0,
        [Stat.SpDef]: 0,
        [Stat.Speed]: 0,
      },
      heldItem: null,
    };

    const targetIVs = [Stat.HP, Stat.Attack, Stat.Defense, Stat.SpAtk];

    const combination = findBestItemCombination(father, mother, targetIVs);
    expect(combination).toBeDefined();
    expect(combination.fatherItem).toBeDefined();
    expect(combination.motherItem).toBeDefined();
  });

  it('should handle target species with genderless (Ditto)', () => {
    const config = {
      targetSpecies: MOCK_DITTO,
      targetIVs: [Stat.Speed],
      chooseGender: false,
    };
    const result = generateBreedingTree(config);
    expect(result).toBeDefined();
    // Ditto can be parent or mother, tree should generate
    expect(result.tree.maxDepth).toBeGreaterThanOrEqual(0);
  });
});