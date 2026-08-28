import { Stat } from './stat';

/**
 * Tipos de items que se pueden equipar en un Pokémon para breeding.
 * Solo Power Items y Everstone son permitidos en rutas determinísticas.
 * Lazo Destino está PROHIBIDO porque introduce RNG.
 */
export enum ItemType {
  // Power Items - Heredan un IV específico del padre equipado
  PowerWeight = 'power_weight',    // Hereda HP
  PowerBracer = 'power_bracer',   // Hereda Attack
  PowerBelt = 'power_belt',       // Hereda Defense
  PowerLens = 'power_lens',       // Hereda SpAtk
  PowerBand = 'power_band',       // Hereda SpDef
  PowerAnklet = 'power_anklet',   // Hereda Speed

  // Everstone - Hereda la naturaleza del padre equipado
  Everstone = 'everstone',

  // PROHIBIDO en rutas determinísticas:
  // DestinyKnot = 'destiny_knot', // Hereda 5 IVs de 12 + 1 random
}

/** Mapeo de Power Items a la stat que protegen */
export const POWER_ITEM_STAT: Record<string, Stat> = {
  [ItemType.PowerWeight]: Stat.HP,
  [ItemType.PowerBracer]: Stat.Attack,
  [ItemType.PowerBelt]: Stat.Defense,
  [ItemType.PowerLens]: Stat.SpAtk,
  [ItemType.PowerBand]: Stat.SpDef,
  [ItemType.PowerAnklet]: Stat.Speed,
};

/** Item equipado en un Pokémon */
export interface HeldItem {
  type: ItemType;
  /** Stat que protege (solo aplica para Power Items) */
  stat?: Stat;
}

/** Costo de cada item en pokedollars */
export const ITEM_COSTS: Record<ItemType, number> = {
  [ItemType.PowerWeight]: 500,
  [ItemType.PowerBracer]: 500,
  [ItemType.PowerBelt]: 500,
  [ItemType.PowerLens]: 500,
  [ItemType.PowerBand]: 500,
  [ItemType.PowerAnklet]: 500,
  [ItemType.Everstone]: 500,
};

/** Crea un Power Item para una stat específica */
export function createPowerItem(stat: Stat): HeldItem {
  const typeMap: Record<Stat, ItemType> = {
    [Stat.HP]: ItemType.PowerWeight,
    [Stat.Attack]: ItemType.PowerBracer,
    [Stat.Defense]: ItemType.PowerBelt,
    [Stat.SpAtk]: ItemType.PowerLens,
    [Stat.SpDef]: ItemType.PowerBand,
    [Stat.Speed]: ItemType.PowerAnklet,
  };

  return { type: typeMap[stat], stat };
}

/** Crea un Everstone */
export function createEverstone(): HeldItem {
  return { type: ItemType.Everstone };
}

/** Verifica si un item es un Power Item */
export function isPowerItem(item: HeldItem): boolean {
  return Object.values(POWER_ITEM_STAT).includes(item.stat!);
}

/** Obtiene la stat que protege un Power Item, o null si no es Power Item */
export function getProtectedStat(item: HeldItem): Stat | null {
  if (item.stat && item.type !== ItemType.Everstone) {
    return item.stat;
  }
  return null;
}
