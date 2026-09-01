import type { SearchState } from '../types/search';

/**
 * Heurística admisible del solver.
 *
 * MVP: se mantiene en 0 hasta que el solver tenga un objetivo y una cota
 * segura más rica. Esto evita sobreestimar el costo.
 */
export function estimateSearchHeuristic(_state: SearchState): number {
  return 0;
}
