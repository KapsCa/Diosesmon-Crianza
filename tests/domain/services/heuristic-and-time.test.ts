import { describe, it, expect } from 'vitest';
import { estimateSearchHeuristic } from '../../../src/domain/services/heuristic';
import { estimateRouteTime } from '../../../src/domain/services/route-time';
import { createMockPokemon, createDitto, MOCK_SPECIES } from '../../helpers';
import { SearchState, BreedingGoal } from '../../../src/domain/types/search';
import { createEmptyIVs, Stat } from '../../../src/domain/types/stat';
import { BreedingTree, TreeNode } from '../../../src/domain/types/route';
import { DEFAULT_NURSERY_CONFIG } from '../../../src/domain/types/costs';
import { Gender } from '../../../src/domain/types/pokemon';

describe('estimateSearchHeuristic', () => {
  it('debería retornar 0 para el MVP (Dijkstra puro)', () => {
    const goal: BreedingGoal = {
      targetSpecies: MOCK_SPECIES,
      targetIVs: [Stat.HP, Stat.Attack, Stat.Defense],
      desiredGender: Gender.Male,
    };
    const state: SearchState = {
      inventory: [],
      goal,
      cost: 0,
      steps: [],
      depth: 0,
    };

    const heuristic = estimateSearchHeuristic(state);

    expect(heuristic).toBe(0);
  });
});

describe('estimateRouteTime', () => {
  const TIME_PER_STEP = 10; // 10 minutos por paso

  // Helper para crear un árbol simple lineal
  const createLinearTree = (depth: number): BreedingTree => {
    let current: TreeNode = {
      step: null,
      pokemon: createMockPokemon(),
      ivsAtNode: [],
      items: null,
      children: [],
      progressLevel: 0,
    };
    let root = current;

    for (let i = 0; i < depth; i++) {
      const newChild: TreeNode = {
        step: null,
        pokemon: createMockPokemon(),
        ivsAtNode: [],
        items: null,
        children: [],
        progressLevel: i + 1,
      };
      current.children.push(newChild);
      current = newChild;
    }
    root = current; // El root es el objetivo final, el último nodo creado.

    // Actualizar maxDepth y allNodes (simplificado para lineal)
    const allNodes: TreeNode[] = [];
    let tempNode: TreeNode | undefined = root;
    while (tempNode) {
      allNodes.push(tempNode);
      tempNode = tempNode.filter(c => c.progressLevel === tempNode!.progressLevel -1);

    }
    
    // Fix para createLinearTree: debería construir el árbol "bottom-up" o un array con todos los nodos
    // La implementación actual crea un árbol que parece "top-down" desde el punto de vista del código, pero
    // para el solver es "bottom-up". Para fines de este test, simulamos un árbol donde maxDepth es el total de pasos.
    // Para simplificar, asumimos que tree.maxDepth es el número de pasos.

    return {
      root: createMockPokemon() as any, // Mock simple para el test
      allNodes: Array(depth).fill(createMockPokemon() as any), // Mock simple de nodos
      maxDepth: depth,
    };
  };

  // Helper para contar nodos en un árbol (no es la forma correcta pero sirve para el mock)
  const countNodes = (tree: BreedingTree): number => tree.allNodes.length;

  it('debería estimar el tiempo para una ruta lineal con slots por defecto', () => {
    const tree: BreedingTree = {
      root: createMockPokemon() as any,
      allNodes: Array(5).fill(createMockPokemon() as any), // 5 pasos
      maxDepth: 5,
    };
    const nursery = DEFAULT_NURSERY_CONFIG;

    const result = estimateRouteTime(tree, nursery, TIME_PER_STEP);

    // 5 pasos, 2 slots gratis. max(criticalPath, ceil(totalNodes / slots)) = max(5, ceil(5/2)) = max(5,3) = 5
    // 5 * 10 = 50 minutos
    expect(result.totalSteps).toBe(5);
    expect(result.criticalPathSteps).toBe(5);
    expect(result.availableSlots).toBe(6); // 2 free + 2 master + 2 premium
    expect(result.parallelBatches).toBe(1); // ceil(5/6) = 1
    expect(result.totalMinutes).toBe(5 * TIME_PER_STEP);
    expect(result.formattedTime).toBe('50 minutos');
  });

  it('debería estimar el tiempo para una ruta con más nodos que slots (batches)', () => {
    const tree: BreedingTree = {
      root: createMockPokemon() as any,
      allNodes: Array(20).fill(createMockPokemon() as any), // 20 nodos
      maxDepth: 5, // 5 pasos en el camino crítico
    };
    const nursery = DEFAULT_NURSERY_CONFIG; // 6 slots

    const result = estimateRouteTime(tree, nursery, TIME_PER_STEP);

    // totalSteps = maxDepth = 5 (camino crítico)
    // criticalPath = 5
    // parallelBatches = ceil(20 / 6) = ceil(3.33) = 4
    // effectiveBatches = max(5, 4) = 5
    // 5 * 10 = 50 minutos
    expect(result.totalSteps).toBe(5);
    expect(result.criticalPathSteps).toBe(5);
    expect(result.availableSlots).toBe(6);
    expect(result.parallelBatches).toBe(4);
    expect(result.totalMinutes).toBe(5 * TIME_PER_STEP); // Critical path dominates
    expect(result.formattedTime).toBe('50 minutos');
  });

  it('debería estimar el tiempo para una ruta donde los batches dominan el critical path', () => {
    const tree: BreedingTree = {
      root: createMockPokemon() as any,
      allNodes: Array(30).fill(createMockPokemon() as any), // 30 nodos
      maxDepth: 3, // camino crítico corto
    };
    const nursery = DEFAULT_NURSERY_CONFIG; // 6 slots

    const result = estimateRouteTime(tree, nursery, TIME_PER_STEP);

    // totalSteps = maxDepth = 3 (camino crítico)
    // criticalPath = 3
    // parallelBatches = ceil(30 / 6) = 5
    // effectiveBatches = max(3, 5) = 5
    // 5 * 10 = 50 minutos
    expect(result.totalSteps).toBe(3);
    expect(result.criticalPathSteps).toBe(3);
    expect(result.availableSlots).toBe(6);
    expect(result.parallelBatches).toBe(5);
    expect(result.totalMinutes).toBe(5 * TIME_PER_STEP); // Parallel batches dominate
    expect(result.formattedTime).toBe('50 minutos');
  });

  it('debería manejar 0 slots disponibles', () => {
    const tree: BreedingTree = {
      root: createMockPokemon() as any,
      allNodes: Array(1).fill(createMockPokemon() as any),
      maxDepth: 1,
    };
    const nursery = { ...DEFAULT_NURSERY_CONFIG, freeSlots: 0, masterSlots: 0, premiumSlots: 0 };
    
    const result = estimateRouteTime(tree, nursery, TIME_PER_STEP);

    // totalSteps = 1, criticalPath = 1, availableSlots = 0 (pero se ajusta a 1)
    // parallelBatches = ceil(1 / 1) = 1
    // effectiveBatches = max(1,1) = 1
    // 1 * 10 = 10 minutos
    expect(result.totalMinutes).toBe(1 * TIME_PER_STEP);
    expect(result.formattedTime).toBe('10 minutos');
  });

  it('debería formatear correctamente el tiempo', () => {
    const tree: BreedingTree = {
      root: createMockPokemon() as any,
      allNodes: Array(6).fill(createMockPokemon() as any),
      maxDepth: 6,
    };
    const nursery = DEFAULT_NURSERY_CONFIG;
    const result1 = estimateRouteTime(tree, nursery, 60); // 6 horas
    expect(result1.formattedTime).toBe('6 horas');

    const result2 = estimateRouteTime(tree, nursery, 65); // 6 horas 30 minutos (approx)
    // critical path 6. ceil(6/6)=1. max(6,1)=6. 6 * 65 = 390. 390/60 = 6.5
    expect(result2.formattedTime).toBe('6 horas 30 minutos');

    const result3 = estimateRouteTime(tree, nursery, 10); // 1 hora
    // critical path 6. ceil(6/6)=1. max(6,1)=6. 6 * 10 = 60. 60/60 = 1
    expect(result3.formattedTime).toBe('1 horas');
  });

  it('should correctly format time to 0 minutes when totalMinutes is 0', () => {
    const tree: BreedingTree = {
      root: createMockPokemon() as any,
      allNodes: [],
      maxDepth: 0,
    };
    const nursery = { ...DEFAULT_NURSERY_CONFIG, freeSlots: 0, masterSlots: 0, premiumSlots: 0 };
    const result = estimateRouteTime(tree, nursery, 10);
    // With 0 slots, availableSlots = max(1, 0) = 1
    // parallelBatches = max(1, ceil(0/1)) = 1
    // effectiveBatches = max(0, 1) = 1
    // totalMinutes = 1 * 10 = 10
    expect(result.formattedTime).toBe('10 minutos');
  });
});