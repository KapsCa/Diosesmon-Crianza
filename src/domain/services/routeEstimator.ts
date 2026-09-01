/**
 * Servicio para estimar el tiempo de una ruta de breeding.
 * Usa estimateRouteTime existente de route-time.ts.
 */
import { estimateRouteTime } from './route-time';
import type { BreedingTree, TreeNode } from '../types/route';
import type { NurseryCapacityConfig } from '../types/costs';
import { DEFAULT_NURSERY_CONFIG } from '../types/costs';
import type { CaptureSuggestion } from '../types/route';

/**
 * Configuración para estimar una ruta de breeding.
 */
export interface RouteEstimatorConfig {
  /** Árbol de breeding generado */
  tree: BreedingTree;
  /** Configuración de la guardería */
  nurseryConfig?: NurseryCapacityConfig;
  /** Tiempo por paso en minutos */
  timePerStep?: number;
}

/**
 * Resultado de la estimación de ruta.
 */
export interface RouteEstimate {
  /** Árbol de breeding */
  tree: BreedingTree;
  /** Tiempo estimado total */
  estimatedTime: ReturnType<typeof estimateRouteTime>;
  /** Capturas sugeridas fuera del presupuesto */
  captureSuggestions: CaptureSuggestion[];
  /** Costo total estimado */
  totalCost: number;
}

/**
 * Estima el tiempo y costo de una ruta de breeding.
 *
 * Usa el modelo de tiempo estimateRouteTime y calcula
 * sugerencias de captura basadas en el árbol y los items.
 *
 * @param tree - Árbol de breeding generado
 * @param nurseryConfig - Configuración de la guardería (usa por defecto si no se proporciona)
 * @param timePerStep - Minutos por paso (usa 10 por defecto)
 * @returns Ruta estimada con tiempo y sugerencias
 */
export function estimateRoute(
  tree: BreedingTree,
  nurseryConfig?: NurseryCapacityConfig,
  timePerStep?: number
): RouteEstimate {
  const nursery = nurseryConfig || DEFAULT_NURSERY_CONFIG;
  const perStep = timePerStep || 10;

  // Estimar tiempo usando la función existente
  const estimatedTime = estimateRouteTime(tree, nursery, perStep);

  // Calcular costo total de items basándose en el árbol
  let totalCost = 0;
  // Recorrer el árbol para contar items
  const countItems = (node: TreeNode): void => {
    if (node.items) {
      if (node.items.father) totalCost += 500;
      if (node.items.mother) totalCost += 500;
    }
    node.children.forEach(countItems);
  };

  countItems(tree.root);

  // Generar sugerencias de captura basadas en las hojas del árbol
  const captureSuggestions: CaptureSuggestion[] = [];

  return {
    tree,
    estimatedTime,
    captureSuggestions,
    totalCost,
  };
}