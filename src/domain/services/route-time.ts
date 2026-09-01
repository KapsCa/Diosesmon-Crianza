import type { BreedingTree } from '../types/route';
import type { NurseryCapacityConfig, TimeEstimate } from '../types/costs';
import { calculateTotalSlots } from '../types/costs';

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} minutos`;
  }

  if (minutes === 0) {
    return `${hours} horas`;
  }

  return `${hours} horas ${minutes} minutos`;
}

/**
 * Estima el tiempo de una ruta de crianza usando un modelo simple de camino
 * crítico y capacidad disponible.
 */
export function estimateRouteTime(
  tree: BreedingTree,
  nursery: NurseryCapacityConfig,
  timePerStep: number
): TimeEstimate {
  const totalSteps = tree.maxDepth;
  const availableSlots = Math.max(1, calculateTotalSlots(nursery));
  const criticalPathSteps = tree.maxDepth;
  const parallelBatches = Math.max(1, Math.ceil(tree.allNodes.length / availableSlots));
  const effectiveBatches = Math.max(criticalPathSteps, parallelBatches);
  const totalMinutes = effectiveBatches * timePerStep;

  return {
    totalSteps,
    criticalPathSteps,
    timePerStep,
    availableSlots,
    parallelBatches,
    totalMinutes,
    formattedTime: formatMinutes(totalMinutes),
  };
}
