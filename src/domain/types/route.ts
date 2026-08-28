import { Pokemon } from './pokemon';
import { HeldItem } from './items';
import { Stat } from './stat';

/**
 * Un paso individual en el árbol de breeding.
 * Representa una cría entre dos padres produciendo una cría.
 */
export interface BreedingStep {
  /** ID único del paso */
  id: string;
  /** El padre (macho) */
  father: Pokemon;
  /** La madre (hembra) */
  mother: Pokemon;
  /** Items equipados en cada padre */
  fatherItem: HeldItem | null;
  motherItem: HeldItem | null;
  /** La cría resultante */
  offspring: Pokemon;
  /** IVs que se heredaron en esta cría */
  inheritedIVs: Stat[];
  /** Costo de esta cría (items + selección de género) */
  cost: number;
  /** Profundidad en el árbol (0 = base, N = raíz) */
  depth: number;
  /** Si el usuario eligió el género de la cría */
  genderChosen: boolean;
}

/**
 * Nodo visual en el árbol de breeding.
 * Usado para renderizar el diagrama.
 */
export interface TreeNode {
  /** El paso de breeding (null para nodos base) */
  step: BreedingStep | null;
  /** Pokémon en este nodo */
  pokemon: Pokemon;
  /** IVs que tiene este Pokémon */
  ivsAtNode: Stat[];
  /** Items equipados (null para base) */
  items: { father: HeldItem | null; mother: HeldItem | null } | null;
  /** Hijos de este nodo */
  children: TreeNode[];
  /** Nivel de progreso (1x31, 2x31, etc.) */
  progressLevel: number;
}

/**
 * Árbol completo de breeding.
 */
export interface BreedingTree {
  /** Nodo raíz (el Pokémon objetivo) */
  root: TreeNode;
  /** Todos los nodos en el árbol (para búsqueda) */
  allNodes: TreeNode[];
  /** Profundidad máxima del árbol */
  maxDepth: number;
}

/**
 * Ruta completa de breeding.
 * Incluye el árbol, costo total, tiempo y sugerencias de captura.
 */
export interface BreedingRoute {
  /** Árbol de breeding */
  tree: BreedingTree;
  /** Costo total de items y selección de género */
  totalCost: number;
  /** Tiempo estimado en minutos */
  estimatedTime: number;
  /** Pokémon que el usuario necesita capturar (fuera del presupuesto) */
  captureSuggestions: CaptureSuggestion[];
  /** Número total de operaciones de breeding */
  totalBreedingSteps: number;
}

/**
 * Sugerencia de captura para un Pokémon necesario.
 */
export interface CaptureSuggestion {
  /** El Pokémon que necesita capturar */
  species: { id: number; name: string };
  /** Grupo huevo al que pertenece */
  eggGroup: string;
  /** Cuántos necesitas capturar */
  quantity: number;
  /** Cuántos IVs necesitan tener 31 */
  requiredIVs: Stat[];
  /** Indicador de facilidad de captura */
  captureDifficulty: 'easy' | 'medium' | 'hard';
}
