import { describe, it, expect } from 'vitest';
import { BreedingTreeNode } from '../../../src/domain/types/breedingTree';
import { Stat } from '../../../src/domain/types/stat';
import { Gender, Pokemon, Species } from '../../../src/domain/types/pokemon';
import { createMockPokemon, MOCK_SPECIES, MOCK_TRAPINCH } from '../../helpers';

describe('BreedingTreeNode', () => {
  it('should create a BreedingTreeNode with required fields', () => {
    const node: BreedingTreeNode = {
      step: null,
      pokemon: createMockPokemon({ gender: Gender.Male }),
      ivsAtNode: [Stat.HP, Stat.Attack],
      items: { father: null, mother: null },
      children: [],
      progressLevel: 1,
    };

    expect(node.step).toBeNull();
    expect(node.pokemon.gender).toBe(Gender.Male);
    expect(node.ivsAtNode).toContain(Stat.HP);
    expect(node.items).toEqual({ father: null, mother: null });
    expect(node.children).toHaveLength(0);
    expect(node.progressLevel).toBe(1);
  });

  it('should support a step with breeding data', () => {
    const node: BreedingTreeNode = {
      step: {
        id: 'step-1',
        father: createMockPokemon({ gender: Gender.Male, species: MOCK_TRAPINCH }),
        mother: createMockPokemon({ gender: Gender.Female, species: MOCK_TRAPINCH }),
        fatherItem: null,
        motherItem: null,
        offspring: createMockPokemon(),
        inheritedIVs: [Stat.HP],
        cost: 0,
        depth: 1,
        genderChosen: false,
      },
      pokemon: createMockPokemon({ gender: Gender.Female }),
      ivsAtNode: [Stat.Defense, Stat.SpAtk],
      items: { father: null, mother: null },
      children: [],
      progressLevel: 2,
    };

    expect(node.step).toBeDefined();
    expect(node.step?.father?.species.name).toBe('Trapinch');
    expect(node.step?.mother?.species.name).toBe('Trapinch');
    expect(node.ivsAtNode).toContain(Stat.Defense);
    expect(node.progressLevel).toBe(2);
  });

  it('should support multiple children', () => {
    const node: BreedingTreeNode = {
      step: null,
      pokemon: createMockPokemon({ gender: Gender.Male }),
      ivsAtNode: [],
      items: { father: null, mother: null },
      children: [
        { step: null, pokemon: createMockPokemon({ gender: Gender.Male }), ivsAtNode: [Stat.HP], items: { father: null, mother: null }, children: [], progressLevel: 1 },
        { step: null, pokemon: createMockPokemon({ gender: Gender.Female }), ivsAtNode: [Stat.Attack], items: { father: null, mother: null }, children: [], progressLevel: 1 },
      ],
      progressLevel: 1,
    };

    expect(node.children).toHaveLength(2);
    expect(node.children[0].pokemon.gender).toBe(Gender.Male);
    expect(node.children[1].pokemon.gender).toBe(Gender.Female);
  });

  it('should track progress level correctly', () => {
    const node: BreedingTreeNode = {
      step: null,
      pokemon: createMockPokemon(),
      ivsAtNode: [Stat.HP],
      items: { father: null, mother: null },
      children: [],
      progressLevel: 5,
    };

    expect(node.progressLevel).toBe(5);
    expect(node.ivsAtNode).toContain(Stat.HP);
  });
});