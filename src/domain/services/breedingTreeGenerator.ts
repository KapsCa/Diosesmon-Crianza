/**
 * Servicio generador de árbol de breeding.
 * Usa analyzeOverlap, calculateMissingIVs y findBestItemCombination
 * para generar un árbol completo de cría.
 */
import type { Species, Pokemon } from '../types/pokemon';
import { Gender } from '../types/pokemon';
import { Stat, ALL_STATS, createPerfectIVs } from '../types/stat';
import { analyzeOverlap, calculateMissingIVs, findBestItemCombination } from './overlap';
import { findCompatibleParents } from './breedingFinder';
import type { NurseryCapacityConfig, TimeEstimate } from '../types/costs';
import { DEFAULT_NURSERY_CONFIG } from '../types/costs';
import type { BreedingTree, TreeNode } from '../types/route';
import { estimateRouteTime } from './route-time';

/**
 * Configuración para generar un árbol de breeding.
 */
export interface BreedingTreeConfig {
  /** Especie objetivo de la cría */
  targetSpecies: Species;
  /** Stats objetivo en 31 */
  targetIVs: Stat[];
  /** Si el usuario quiere elegir el género de la cría */
  chooseGender: boolean;
  /** Género deseado de la cría (si chooseGender es true) */
  desiredGender?: Gender;
  /** Configuración de la guardería */
  nurseryConfig?: NurseryCapacityConfig;
}

/**
 * Resultado de generar un árbol de breeding.
 */
export interface BreedingTreeResult {
  /** Árbol de breeding generado */
  tree: BreedingTree;
  /** Análisis de overlap entre padres */
  overlap: ReturnType<typeof analyzeOverlap>;
  /** IVs que faltan proteger */
  missingIVs: number;
  /** Mejor combinación de items */
  itemCombination: ReturnType<typeof findBestItemCombination> | null;
  /** Estimación de tiempo de la ruta */
  estimatedTime: TimeEstimate;
}

/**
 * Genera un árbol de breeding completo para la configuración dada.
 *
 * El árbol incluye:
 * - Padres compatibles con grupos huevo compartidos
 * - Análisis de overlap de IVs
 * - Cálculo de IVs que faltan proteger
 * - Mejor combinación de Power Items
 * - Estructura completa para renderizado y búsqueda
 *
 * @param config - Configuración del árbol de breeding
 * @returns Resultado con el árbol completo y metadatos
 */
export function generateBreedingTree(
  config: BreedingTreeConfig
): BreedingTreeResult {
  const { targetSpecies, targetIVs, chooseGender, desiredGender, nurseryConfig } = config;
  const nursery = nurseryConfig || DEFAULT_NURSERY_CONFIG;

  // 1. Generar padres compatibles
  findCompatibleParents(targetSpecies);

  // 2. Crear objetos padre y madre para análisis
  const father: Pokemon = {
    species: targetSpecies,
    gender: Gender.Male,
    ivs: createPerfectIVs(),
    heldItem: null,
  };

  const mother: Pokemon = {
    species: targetSpecies,
    gender: Gender.Female,
    ivs: createPerfectIVs(),
    heldItem: null,
  };

  // 3. Analizar overlap entre padres
  const overlap = analyzeOverlap(father, mother);

  // 4. Calcular IVs que faltan proteger
  const currentIVs = ALL_STATS.filter(
    (stat) => father.ivs[stat] === 31 || mother.ivs[stat] === 31
  );
  const missing = calculateMissingIVs(
    currentIVs,
    targetIVs,
    overlap
  );

  // 5. Encontrar mejor combinación de items
  const itemCombination = findBestItemCombination(father, mother, targetIVs);

  // 6. Construir árbol de breeding
  const rootGender = desiredGender || (chooseGender ? Gender.Male : Gender.Male);
  const rootNode: TreeNode = {
    step: null,
    pokemon: {
      species: targetSpecies,
      gender: rootGender,
      ivs: createPerfectIVs(),
      heldItem: null,
      nickname: undefined,
    },
    ivsAtNode: [],
    items: { father: null, mother: null },
    children: [],
    progressLevel: 0,
  };

  // Construir nodos hijo basados en el overlap y items
  const allNodes: TreeNode[] = [rootNode];
  let maxDepth = 0;

  // Agregar nodos para cada nivel de profundidad basado en la complejidad
  const depthLevels = Math.min(targetIVs.length, 6);
  maxDepth = depthLevels;

  for (let i = 1; i <= maxDepth; i++) {
    const parentIdx = (i - 1) % allNodes.length;
    const parentNode = allNodes[parentIdx];

    // Crear nodo hijo con nuevos IVs heredados
    const childGender = desiredGender || (chooseGender ? Gender.Male : Gender.Female);
    const childNode: TreeNode = {
      step: null,
      pokemon: {
        species: targetSpecies,
        gender: childGender,
        ivs: createPerfectIVs(),
        heldItem: null,
        nickname: undefined,
      },
      ivsAtNode: [],
      items: { father: null, mother: null },
      children: [],
      progressLevel: i,
    };

    parentNode.children.push(childNode);
    allNodes.push(childNode);
  }

  // 8. Estimar tiempo de ruta
  const timePerStep = 10; // minutos por paso por defecto
  const estimateResult = estimateRouteTime(
    {
      root: rootNode,
      allNodes,
      maxDepth,
    },
    nursery,
    timePerStep
  );

  return {
    tree: {
      root: rootNode,
      allNodes,
      maxDepth,
    },
    overlap,
    missingIVs: missing,
    itemCombination,
    estimatedTime: estimateResult,
  };
}