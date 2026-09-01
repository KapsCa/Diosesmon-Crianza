import { Stat, ALL_STATS } from '../types/stat';
import type { Pokemon } from '../types/pokemon';
import type { HeldItem } from '../types/items';
import { isPowerItem, getProtectedStat } from '../types/items';
import type { OverlapResult } from '../types/breeding';

/**
 * Analiza el solapamiento de IVs entre dos padres.
 *
 * Reglas:
 * - Si AMBOS padres tienen 31 en la misma stat → herencia libre (overlap)
 * - Si solo un padre tiene 31 y está protegido por item → hereda por item
 * - Si solo un padre tiene 31 y NO está protegido → RNG (evitar)
 *
 * @param father - Padre (macho)
 * @param mother - Madre (hembra)
 * @returns OverlapResult con stats heredados, protegidos y RNG
 */
export function analyzeOverlap(
  father: Pokemon,
  mother: Pokemon
): OverlapResult {
  const freeInheritance: Stat[] = [];
  const itemProtected: { stat: Stat; byParent: 'father' | 'mother' }[] = [];
  const rng: Stat[] = [];

  for (const stat of ALL_STATS) {
    const fatherHas31 = father.ivs[stat] === 31;
    const motherHas31 = mother.ivs[stat] === 31;

    // Caso 1: Ambos tienen 31 → herencia libre
    if (fatherHas31 && motherHas31) {
      freeInheritance.push(stat);
      continue;
    }

    // Caso 2: Solo el padre tiene 31
    if (fatherHas31 && !motherHas31) {
      if (father.heldItem && isPowerItem(father.heldItem) && getProtectedStat(father.heldItem) === stat) {
        itemProtected.push({ stat, byParent: 'father' });
      } else {
        rng.push(stat);
      }
      continue;
    }

    // Caso 3: Solo la madre tiene 31
    if (!fatherHas31 && motherHas31) {
      if (mother.heldItem && isPowerItem(mother.heldItem) && getProtectedStat(mother.heldItem) === stat) {
        itemProtected.push({ stat, byParent: 'mother' });
      } else {
        rng.push(stat);
      }
      continue;
    }

    // Caso 4: Ninguno tiene 31 → nada que heredar
    // (no agregamos a ningún array)
  }

  return {
    freeInheritance,
    itemProtected,
    rng,
  };
}

/**
 * Calcula cuántos IVs faltan para llegar al objetivo dado el overlap actual.
 *
 * @param currentIVs - IVs actuales de la cría potencial
 * @param targetIVs - Stats que el usuario quiere en 31
 * @param overlap - Resultado del análisis de overlap
 * @returns Número de IVs que necesitan protección adicional
 */
export function calculateMissingIVs(
  currentIVs: Stat[],
  targetIVs: Stat[],
  overlap: OverlapResult
): number {
  const protectedStats = [
    ...overlap.freeInheritance,
    ...overlap.itemProtected.map((ip) => ip.stat),
  ];

  return targetIVs.filter(
    (stat) => !currentIVs.includes(stat) && !protectedStats.includes(stat)
  ).length;
}

/**
 * Verifica si el overlap es válido (no excede 2 items).
 *
 * @param overlap - Resultado del análisis de overlap
 * @returns true si el overlap es válido
 */
export function isValidOverlap(overlap: OverlapResult): boolean {
  return overlap.itemProtected.length <= 2;
}

/**
 * Calcula el costo del overlap en items.
 * Cada item cuesta 500 pokedollars.
 *
 * @param overlap - Resultado del análisis de overlap
 * @param itemCost - Costo por item (default: 500)
 * @returns Costo total de items
 */
export function calculateOverlapCost(
  overlap: OverlapResult,
  itemCost: number = 500
): number {
  return overlap.itemProtected.length * itemCost;
}

/**
 * Encuentra la mejor combinación de items para proteger los IVs faltantes.
 * Respeta la restricción de máximo 2 items.
 *
 * @param father - Padre
 * @param mother - Madre
 * @param targetIVs - Stats objetivo en 31
 * @returns Mejor combinación de items (o null si no es posible)
 */
export function findBestItemCombination(
  father: Pokemon,
  mother: Pokemon,
  targetIVs: Stat[]
): { fatherItem: HeldItem | null; motherItem: HeldItem | null } | null {
  // Primero analizamos sin items
  const baseOverlap = analyzeOverlap(father, mother);

  // Stats que ya tenemos gratis
  const covered = new Set([
    ...baseOverlap.freeInheritance,
    ...targetIVs.filter((s) => s in father.ivs && father.ivs[s] === 31 && mother.ivs[s] === 31),
  ]);

  // Stats que necesitamos proteger
  const needsProtection = targetIVs.filter(
    (stat) => !covered.has(stat) && (father.ivs[stat] === 31 || mother.ivs[stat] === 31)
  );

  // Si necesitamos más de 2 items, no es posible con esta pareja
  if (needsProtection.length > 2) {
    return null;
  }

  // Asignamos items al padre que tenga el IV
  let fatherItem: HeldItem | null = null;
  let motherItem: HeldItem | null = null;

  for (const stat of needsProtection) {
    const fatherHas = father.ivs[stat] === 31;
    const motherHas = mother.ivs[stat] === 31;

    if (fatherHas && !fatherItem) {
      fatherItem = { type: `power_${getStatSuffix(stat)}` as any, stat };
    } else if (motherHas && !motherItem) {
      motherItem = { type: `power_${getStatSuffix(stat)}` as any, stat };
    }
  }

  return { fatherItem, motherItem };
}

/** Helper para obtener el suffix del Power Item */
function getStatSuffix(stat: Stat): string {
  const suffixes: Record<Stat, string> = {
    [Stat.HP]: 'weight',
    [Stat.Attack]: 'bracer',
    [Stat.Defense]: 'belt',
    [Stat.SpAtk]: 'lens',
    [Stat.SpDef]: 'band',
    [Stat.Speed]: 'anklet',
  };
  return suffixes[stat];
}