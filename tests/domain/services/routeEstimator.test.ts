import { describe, it, expect } from 'vitest';
import { estimateRouteTime } from '../../../src/domain/services/route-time';
import { estimateRoute } from '../../../src/domain/services/routeEstimator';
import { BreedingTree, TreeNode } from '../../../src/domain/types/route';
import { DEFAULT_NURSERY_CONFIG, DEFAULT_COST_MODEL } from '../../../src/domain/types/costs';
import { ItemType } from '../../../src/domain/types/items';
import { Stat } from '../../../src/domain/types/stat';

describe('estimateRouteTime', () => {
  it('should estimate route time for a linear tree with default nursery', () => {
    const tree: BreedingTree = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      },
      allNodes: Array(5).fill({
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      }),
      maxDepth: 5,
    };

    const result = estimateRouteTime(tree, DEFAULT_NURSERY_CONFIG, 10);

    // maxDepth = 5, totalSteps = maxDepth = 5, criticalPathSteps = 5
    // availableSlots = 6, parallelBatches = ceil(5/6) = 1, effectiveBatches = max(5,1) = 5
    // totalMinutes = 5 * 10 = 50
    expect(result.totalSteps).toBe(5);
    expect(result.criticalPathSteps).toBe(5);
    expect(result.availableSlots).toBe(6);
    expect(result.parallelBatches).toBe(1);
    expect(result.totalMinutes).toBe(5 * 10);
    expect(result.formattedTime).toBe('50 minutos');
  });

  it('should estimate route time when batches dominate critical path', () => {
    const tree: BreedingTree = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      },
      allNodes: Array(20).fill({
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      }),
      maxDepth: 5,
    };

    const result = estimateRouteTime(tree, DEFAULT_NURSERY_CONFIG, 10);

    // maxDepth = 5, totalSteps = maxDepth = 5
    // availableSlots = 6, parallelBatches = ceil(20/6) = 4, effectiveBatches = max(5,4) = 5
    // totalMinutes = 5 * 10 = 50
    expect(result.totalSteps).toBe(5);
    expect(result.criticalPathSteps).toBe(5);
    expect(result.availableSlots).toBe(6);
    expect(result.parallelBatches).toBe(4);
    expect(result.totalMinutes).toBe(5 * 10);
    expect(result.formattedTime).toBe('50 minutos');
  });

  it('should estimate route time where critical path dominates', () => {
    const tree: BreedingTree = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      },
      allNodes: Array(30).fill({
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      }),
      maxDepth: 3,
    };

    const result = estimateRouteTime(tree, DEFAULT_NURSERY_CONFIG, 10);

    // maxDepth = 3, totalSteps = maxDepth = 3
    // availableSlots = 6, parallelBatches = ceil(30/6) = 5, effectiveBatches = max(3,5) = 5
    // totalMinutes = 5 * 10 = 50
    expect(result.totalSteps).toBe(3);
    expect(result.criticalPathSteps).toBe(3);
    expect(result.availableSlots).toBe(6);
    expect(result.parallelBatches).toBe(5);
    expect(result.totalMinutes).toBe(5 * 10);
    expect(result.formattedTime).toBe('50 minutos');
  });

  it('should handle empty tree', () => {
    const tree: BreedingTree = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      },
      allNodes: [],
      maxDepth: 0,
    };

    const result = estimateRouteTime(tree, DEFAULT_NURSERY_CONFIG, 10);

    // maxDepth = 0, totalSteps = 0, criticalPathSteps = 0
    // availableSlots = max(1, 6) = 6
    // parallelBatches = max(1, ceil(0/6)) = max(1, 0) = 1
    // effectiveBatches = max(0, 1) = 1
    // totalMinutes = 1 * 10 = 10
    expect(result.totalSteps).toBe(0);
    expect(result.criticalPathSteps).toBe(0);
    expect(result.availableSlots).toBe(6);
    expect(result.parallelBatches).toBe(1);
    expect(result.totalMinutes).toBe(1 * 10);
    expect(result.formattedTime).toBe('10 minutos');
  });

  it('should format time correctly for hours', () => {
    const tree: BreedingTree = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      },
      allNodes: Array(6).fill({
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
      }),
      maxDepth: 6,
    };

    const result = estimateRouteTime(tree, DEFAULT_NURSERY_CONFIG, 60); // 6 horas
    expect(result.formattedTime).toBe('6 horas');

    const result2 = estimateRouteTime(tree, DEFAULT_NURSERY_CONFIG, 65); // 6 horas 30 minutos (approx)
    expect(result2.formattedTime).toBe('6 horas 30 minutos');

    const result3 = estimateRouteTime(tree, DEFAULT_NURSERY_CONFIG, 10); // 1 hora
    expect(result3.formattedTime).toBe('1 horas');

    const result4 = estimateRouteTime(tree, DEFAULT_NURSERY_CONFIG, 0); // 0 minutos
    expect(result4.formattedTime).toBe('0 minutos');
  });
});

describe('estimateRoute', () => {
  it('should use DEFAULT_COST_MODEL to estimate costs when no custom model is provided', () => {
    const tree: BreedingTree = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
        },
        ivsAtNode: [],
        items: {
          father: { type: ItemType.PowerBracer },
          mother: { type: ItemType.Everstone },
        },
        children: [],
        progressLevel: 1,
      },
      allNodes: [],
      maxDepth: 1,
    };

    const estimate = estimateRoute(tree);
    // father (500) + mother (500) = 1000 according to DEFAULT_COST_MODEL
    expect(estimate.totalCost).toBe(1000);
  });

  it('should use custom costModel values when provided', () => {
    const tree: BreedingTree = {
      root: {
        step: {
          id: 'step-1',
          father: { species: { id: 1, name: 'P1' } } as any,
          mother: { species: { id: 1, name: 'P2' } } as any,
          fatherItem: { type: ItemType.PowerBracer },
          motherItem: { type: ItemType.Everstone },
          offspring: { species: { id: 1, name: 'Child' } } as any,
          inheritedIVs: [],
          cost: 0,
          depth: 1,
          genderChosen: true,
        },
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
        },
        ivsAtNode: [],
        items: {
          father: { type: ItemType.PowerBracer },
          mother: { type: ItemType.Everstone },
        },
        children: [],
        progressLevel: 1,
      },
      allNodes: [],
      maxDepth: 1,
    };

    const customCostModel = {
      ...DEFAULT_COST_MODEL,
      itemCosts: {
        ...DEFAULT_COST_MODEL.itemCosts,
        [ItemType.PowerBracer]: 750,
        [ItemType.Everstone]: 1200,
      },
      genderSelectionCost: 800,
      breedingStepFee: 100,
    };

    const estimate = estimateRoute(tree, undefined, undefined, customCostModel);
    // Items: 750 + 1200 = 1950. Step: genderSelectionCost (800) + breedingStepFee (100) = 900. Total = 2850
    expect(estimate.totalCost).toBe(2850);
  });

  it('should calculate accurate Diosesmon server costs using DIOSESMON_OFFICIAL_COST_MODEL', async () => {
    const { DIOSESMON_OFFICIAL_COST_MODEL } = await import('../../../src/domain/types/costs');
    const tree: BreedingTree = {
      root: {
        step: {
          id: 'diosesmon-step-1',
          father: { species: { id: 1, name: 'P1' } } as any,
          mother: { species: { id: 1, name: 'P2' } } as any,
          fatherItem: { type: ItemType.PowerBracer },
          motherItem: { type: ItemType.Everstone },
          offspring: { species: { id: 1, name: 'Child' } } as any,
          inheritedIVs: [],
          cost: 0,
          depth: 1,
          genderChosen: false,
        },
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
        },
        ivsAtNode: [],
        items: {
          father: { type: ItemType.PowerBracer },
          mother: { type: ItemType.Everstone },
        },
        children: [],
        progressLevel: 1,
      },
      allNodes: [],
      maxDepth: 1,
    };

    const estimate = estimateRoute(tree, undefined, undefined, DIOSESMON_OFFICIAL_COST_MODEL);
    // Items: PowerBracer (500) + Everstone (500) = 1,000 Pk$
    // Daycare fee: 0 Pk$
    // Total = 1,000 Pk$
    expect(estimate.totalCost).toBe(1000);
  });
});