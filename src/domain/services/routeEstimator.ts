/**
 * Servicio para estimar el tiempo de una ruta de breeding.
 * Usa estimateRouteTime existente de route-time.ts.
 */
import { estimateRouteTime } from './route-time';
import type { BreedingTree, TreeNode } from '../types/route';
import type { NurseryCapacityConfig, BreedingCostModel } from '../types/costs';
import { DEFAULT_NURSERY_CONFIG, DEFAULT_COST_MODEL } from '../types/costs';
import type { CaptureSuggestion } from '../types/route';

/**
 * Configuración para estimar una ruta de breeding.
 */
export interface RouteEstimatorConfig {
  /** Árbol de breeding generado */
  tree: BreedingTree;
  /** Configuración de la guardería */
  nurseryConfig?: NurseryCapacityConfig;
  /** Modelo de costos */
  costModel?: BreedingCostModel;
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
 * costos basados en el modelo de costos (DEFAULT_COST_MODEL por defecto).
 *
 * @param tree - Árbol de breeding generado
 * @param nurseryConfig - Configuración de la guardería (usa por defecto si no se proporciona)
 * @param timePerStep - Minutos por paso (usa 10 por defecto)
 * @param costModel - Modelo de costos de breeding (usa DEFAULT_COST_MODEL por defecto)
 * @returns Ruta estimada con tiempo, sugerencias y costo total
 */
export function estimateRoute(
  tree: BreedingTree,
  nurseryConfig?: NurseryCapacityConfig,
  timePerStep?: number,
  costModel?: BreedingCostModel
): RouteEstimate {
  const nursery = nurseryConfig || DEFAULT_NURSERY_CONFIG;
  const perStep = timePerStep || 10;
  const costs = costModel || DEFAULT_COST_MODEL;

  // Estimar tiempo usando la función existente
  const estimatedTime = estimateRouteTime(tree, nursery, perStep);

  // Calcular costo total basándose en el árbol y modelo de costos
  let totalCost = 0;
  // Recorrer el árbol para contar items y gastos de pasos
  const countCosts = (node: TreeNode): void => {
    if (node.items) {
      if (node.items.father) {
        totalCost += costs.itemCosts[node.items.father.type] ?? 500;
      }
      if (node.items.mother) {
        totalCost += costs.itemCosts[node.items.mother.type] ?? 500;
      }
    }
    if (node.step) {
      if (node.step.genderChosen) {
        totalCost += costs.genderSelectionCost;
      }
      if (costs.breedingStepFee) {
        totalCost += costs.breedingStepFee;
      }
    }
    node.children.forEach(countCosts);
  };

  countCosts(tree.root);

  // Generar sugerencias de captura basadas en las hojas del árbol
  const captureSuggestions: CaptureSuggestion[] = [];

  return {
    tree,
    estimatedTime,
    captureSuggestions,
    totalCost,
  };
}