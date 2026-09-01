import type { IVSpread } from './stat';
import type { HeldItem } from './items';

/**
 * Género de un Pokémon.
 * Genderless = solo cría con Ditto.
 */
export const Gender = {
  Male: 'male' as const,
  Female: 'female' as const,
  Genderless: 'genderless' as const,
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

/**
 * Grupo huevo de un Pokémon.
 * Basado en los grupos huevo oficiales de Pokémon.
 */
export interface EggGroup {
  name: string;
}

/**
 * Datos de una especie Pokémon.
 * Contiene información estática que no cambia entre individuos.
 */
export interface Species {
  id: number;
  name: string;
  /** Ratio de género: 0 = sin género, 0.5 = 50/50, 1 = solo macho */
  genderRatio: number;
  eggGroups: EggGroup[];
  /** Generación de origen (1, 2, 3, ...) */
  gen: number;
  /** Stats base del Pokémon (para calcular rendimiento relativo) */
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spatk: number;
    spdef: number;
    speed: number;
  };
  /** Tasa de captura (0-255, mayor = más fácil) */
  captureRate: number;
  /** Metadatos de crianza para validar entradas de la app */
  breeding?: {
    /** Si la especie puede participar en crianza */
    canBreed: boolean;
    /** Si la especie es un bebé que requiere evolución previa */
    isBaby?: boolean;
    /** Sugerencia de evolución para el usuario */
    evolveInto?: string;
  };
}

/**
 * Pokémon individual con IVs, género y item equipado.
 */
export interface Pokemon {
  species: Species;
  gender: Gender;
  ivs: IVSpread;
  heldItem: HeldItem | null;
  /** Nombre personalizado (opcional) */
  nickname?: string;
}

/**
 * Información de una cría resultado de breeding.
 */
export interface Offspring extends Pokemon {
  /** Los IVs que fueron heredados determinísticamente */
  inheritedIVs: { stat: number; source: 'overlap' | 'item' }[];
}