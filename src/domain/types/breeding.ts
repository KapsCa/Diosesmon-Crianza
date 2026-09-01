import type { Stat } from './stat';
import type { Pokemon } from './pokemon';
import type { HeldItem } from './items';

/**
 * Resultado del análisis de solapamiento entre dos padres.
 * Determina qué IVs se heredan gratis (overlap) y cuáles necesitan item.
 */
export interface OverlapResult {
  /** Stats donde AMBOS padres tienen 31 → herencia libre (0 costo) */
  freeInheritance: Stat[];
  /** Stats protegidos por item en el padre correspondiente */
  itemProtected: { stat: Stat; byParent: 'father' | 'mother' }[];
  /** Stats que quedan al azar (sin protección) */
  rng: Stat[];
}

/**
 * Par de padres para una cría.
 * Contiene los padres, el resultado de overlap y los items usados.
 */
export interface BreedingPair {
  father: Pokemon;
  mother: Pokemon;
  overlap: OverlapResult;
  /** Máximo 2 items (1 por padre) */
  itemsUsed: HeldItem[];
}

/**
 * Verifica si dos padres son compatibles para breeding.
 */
export interface CompatibilityCheck {
  isCompatible: boolean;
  reason?: string;
}

/**
 * Resultado de una operación de breeding.
 */
export interface BreedingResult {
  /** La cría resultante */
  offspring: Pokemon;
  /** IVs heredados y su fuente */
  inheritedStats: { stat: Stat; source: 'overlap' | 'item' | 'rng' }[];
  /** Costo total de esta cría (items + selección de género) */
  cost: number;
}

/**
 * Configuración de un paso de breeding en el árbol.
 */
export interface BreedingConfig {
  /** Qué IVs quiere el usuario en la cría */
  targetIVs: Stat[];
  /** Si el usuario quiere elegir el género de la cría */
  chooseGender: boolean;
  /** Género deseado de la cría (si chooseGender es true) */
  desiredGender?: 'male' | 'female';
}