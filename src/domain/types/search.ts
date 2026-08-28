import { Pokemon } from './pokemon';
import { HeldItem } from './items';
import { Stat } from './stat';
import { BreedingStep } from './route';

/**
 * Acción posible desde un estado de búsqueda.
 */
export type SearchAction =
  | {
      type: 'breed';
      father: Pokemon;
      mother: Pokemon;
      fatherItem: HeldItem | null;
      motherItem: HeldItem | null;
      /** Si el usuario quiere elegir el género de la cría */
      chooseGender: boolean;
    }
  | {
      type: 'capture';
      speciesName: string;
      targetIVs: Stat[];
    };

/**
 * Estado de búsqueda para A*.
 */
export interface SearchState {
  /** Pokémon disponibles en el inventario */
  inventory: Pokemon[];
  /** Costo acumulado hasta este estado */
  cost: number;
  /** Pasos de breeding realizados */
  steps: BreedingStep[];
  /** Profundidad actual en el árbol */
  depth: number;
}

/**
 * Nodo en la cola de prioridad de A*.
 */
export interface SearchNode {
  /** Estado actual */
  state: SearchState;
  /** g(n) = costo desde el inicio */
  g: number;
  /** h(n) = estimación heurística al objetivo */
  h: number;
  /** f(n) = g(n) + h(n) */
  f: number;
  /** Acción que led a este estado */
  action: SearchAction | null;
  /** Nodo padre (para reconstruir el camino) */
  parent: SearchNode | null;
}

/**
 * Resultado de la búsqueda A*.
 */
export interface SearchResult {
  /** Si se encontró una solución */
  found: boolean;
  /** El nodo final (si found es true) */
  finalNode: SearchNode | null;
  /** Nodos explorados durante la búsqueda */
  nodesExplored: number;
  /** Tiempo de ejecución en ms */
  executionTime: number;
  /** Si se alcanzó el límite de iteraciones */
  iterationLimitReached: boolean;
}

/**
 * Configuración del solver A*.
 */
export interface SolverConfig {
  /** Límite máximo de iteraciones */
  maxIterations: number;
  /** Límite máximo de tiempo en ms */
  maxTimeMs: number;
  /** Si debe encontrar la ruta ÓPTIMA o una "suficientemente buena" */
  findOptimal: boolean;
}

/** Configuración por defecto del solver */
export const DEFAULT_SOLVER_CONFIG: SolverConfig = {
  maxIterations: 100000,
  maxTimeMs: 30000, // 30 segundos
  findOptimal: true,
};
