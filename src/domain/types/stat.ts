/**
 * Stats individuales de un Pokémon.
 * Cada stat puede tener un IV de 0 a 31.
 */
export const Stat = {
  HP: 'hp' as const,
  Attack: 'attack' as const,
  Defense: 'defense' as const,
  SpAtk: 'spatk' as const,
  SpDef: 'spdef' as const,
  Speed: 'speed' as const,
} as const;

export type Stat = (typeof Stat)[keyof typeof Stat];

/** Array de todas las stats para iteración */
export const ALL_STATS: Stat[] = [
  Stat.HP,
  Stat.Attack,
  Stat.Defense,
  Stat.SpAtk,
  Stat.SpDef,
  Stat.Speed,
];

/** Valor máximo de un IV */
export const IV_MAX = 31;

/** Valor mínimo de un IV */
export const IV_MIN = 0;

/** Spread de IVs: cada stat tiene un valor de 0 a 31 */
export type IVSpread = Record<Stat, number>;

/** Crea un IVSpread con todos los stats en 0 */
export function createEmptyIVs(): IVSpread {
  return {
    [Stat.HP]: IV_MIN,
    [Stat.Attack]: IV_MIN,
    [Stat.Defense]: IV_MIN,
    [Stat.SpAtk]: IV_MIN,
    [Stat.SpDef]: IV_MIN,
    [Stat.Speed]: IV_MIN,
  };
}

/** Crea un IVSpread con todos los stats en 31 */
export function createPerfectIVs(): IVSpread {
  return {
    [Stat.HP]: IV_MAX,
    [Stat.Attack]: IV_MAX,
    [Stat.Defense]: IV_MAX,
    [Stat.SpAtk]: IV_MAX,
    [Stat.SpDef]: IV_MAX,
    [Stat.Speed]: IV_MAX,
  };
}

/** Cuenta cuántos IVs están en 31 */
export function countPerfectIVs(ivs: IVSpread): number {
  return ALL_STATS.filter((stat) => ivs[stat] === IV_MAX).length;
}

/** Retorna los stats que están en 31 */
export function getPerfectStats(ivs: IVSpread): Stat[] {
  return ALL_STATS.filter((stat) => ivs[stat] === IV_MAX);
}

/** Retorna los stats que NO están en 31 */
export function getMissingStats(ivs: IVSpread): Stat[] {
  return ALL_STATS.filter((stat) => ivs[stat] !== IV_MAX);
}