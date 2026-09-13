import { Stat } from './stat';

/**
 * Tipos de items que se pueden equipar en un Pokémon para breeding.
 * Solo Power Items y Everstone son permitidos en rutas determinísticas.
 * Lazo Destino está PROHIBIDO porque introduce RNG.
 */
export const ItemType = {
  // Power Items - Heredan un IV específico del padre equipado
  PowerWeight: 'power_weight' as const,    // Hereda HP
  PowerBracer: 'power_bracer' as const,   // Hereda Attack
  PowerBelt: 'power_belt' as const,       // Hereda Defense
  PowerLens: 'power_lens' as const,       // Hereda SpAtk
  PowerBand: 'power_band' as const,       // Hereda SpDef
  PowerAnklet: 'power_anklet' as const,   // Hereda Speed

  // Everstone - Hereda la naturaleza del padre equipado (solo si la tiene)
  Everstone: 'everstone' as const,

  // MirrorHerb - Transfiere la habilidad del padre equipado (solo si la tiene, estándar u oculta)
  MirrorHerb: 'mirror_herb' as const,

  // PROHIBIDO en rutas determinísticas:
  // DestinyKnot: 'destiny_knot', // Hereda 5 IVs de 12 + 1 random
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

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
  [ItemType.MirrorHerb]: 500,
};

/** Costos oficiales de la Tienda de Crianza en el servidor Diosesmon (500 Pk$ por ítem) */
export const DIOSESMON_ITEM_COSTS: Record<ItemType, number> = {
  [ItemType.PowerWeight]: 500,
  [ItemType.PowerBracer]: 500,
  [ItemType.PowerBelt]: 500,
  [ItemType.PowerLens]: 500,
  [ItemType.PowerBand]: 500,
  [ItemType.PowerAnklet]: 500,
  [ItemType.Everstone]: 500,
  [ItemType.MirrorHerb]: 500,
};

/** Nombres en español de cada ítem de crianza */
export const ITEM_NAMES_ES: Record<ItemType, string> = {
  [ItemType.PowerWeight]: 'Pesa Recia',
  [ItemType.PowerBracer]: 'Brazal Recio',
  [ItemType.PowerBelt]: 'Cinto Recio',
  [ItemType.PowerLens]: 'Lente Recia',
  [ItemType.PowerBand]: 'Banda Recia',
  [ItemType.PowerAnklet]: 'Franja Recia',
  [ItemType.Everstone]: 'Piedra Eterna',
  [ItemType.MirrorHerb]: 'Hierba Copia',
};

/** Descripciones tácticas del efecto de cada ítem */
export const ITEM_DESCRIPTIONS_ES: Record<ItemType, string> = {
  [ItemType.PowerWeight]: 'Fija y hereda el IV de PS (HP) al 100%. Consumo 1x cruza.',
  [ItemType.PowerBracer]: 'Fija y hereda el IV de Ataque al 100%. Consumo 1x cruza.',
  [ItemType.PowerBelt]: 'Fija y hereda el IV de Defensa al 100%. Consumo 1x cruza.',
  [ItemType.PowerLens]: 'Fija y hereda el IV de At. Especial al 100%. Consumo 1x cruza.',
  [ItemType.PowerBand]: 'Fija y hereda el IV de Def. Especial al 100%. Consumo 1x cruza.',
  [ItemType.PowerAnklet]: 'Fija y hereda el IV de Velocidad al 100%. Consumo 1x cruza.',
  [ItemType.Everstone]: 'Fija y transmite la Naturaleza del portador al 100%. Solo si el padre la tiene. Consumo 1x cruza.',
  [ItemType.MirrorHerb]: 'Transfiere la Habilidad del portador (estándar u oculta). Solo si uno de los padres la posee.',
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

/** Crea una Hierba Copia (Mirror Herb) */
export function createMirrorHerb(): HeldItem {
  return { type: ItemType.MirrorHerb };
}

/** Verifica si un item es un Power Item */
export function isPowerItem(item: HeldItem): boolean {
  return Object.values(POWER_ITEM_STAT).includes(item.stat!);
}

/** Obtiene la stat que protege un Power Item, o null si no es Power Item */
export function getProtectedStat(item: HeldItem): Stat | null {
  if (item.stat && item.type !== ItemType.Everstone && item.type !== ItemType.MirrorHerb) {
    return item.stat;
  }
  return null;
}