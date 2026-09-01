import type { Species, Gender } from './pokemon';
import type { IVSpread, Stat } from './stat';
import type { HeldItem } from './items';

/**
 * Nodo en el árbol de breeding (específico de IVsMap).
 * Diferente de TreeNode de route.ts: este está optimizado para el
 * flujo de IVsMap y las reglas de cría de Diosesmon.
 */
export interface BreedingTreeNode {
  /** Paso de breeding en este nodo (null para nodo base) */
  step: {
    /** ID único del paso */
    id: string;
    /** El padre (macho) */
    father: {
      species: Species;
      gender: Gender;
      ivs: IVSpread;
      heldItem: HeldItem | null;
      nickname?: string;
    };
    /** La madre (hembra) */
    mother: {
      species: Species;
      gender: Gender;
      ivs: IVSpread;
      heldItem: HeldItem | null;
      nickname?: string;
    };
    /** Items equipados en cada padre */
    fatherItem: HeldItem | null;
    motherItem: HeldItem | null;
    /** La cría resultante */
    offspring: {
      species: Species;
      gender: Gender;
      ivs: IVSpread;
      heldItem: HeldItem | null;
      nickname?: string;
    };
    /** IVs que se heredaron en esta cría */
    inheritedIVs: Stat[];
    /** Costo de esta cría (items + selección de género) */
    cost: number;
    /** Profundidad en el árbol (0 = base, N = raíz) */
    depth: number;
    /** Si el usuario eligió el género de la cría */
    genderChosen: boolean;
  };
  /** Pokémon en este nodo */
  pokemon: {
    species: Species;
    gender: Gender;
    ivs: IVSpread;
    heldItem: HeldItem | null;
    nickname?: string;
  };
  /** Items equipados (null para base) */
  items: { father: HeldItem | null; mother: HeldItem | null } | null;
  /** Hijos de este nodo */
  children: BreedingTreeNode[];
  /** Nivel de progreso (1x31, 2x31, etc.) */
  progressLevel: number;
  /** ID único del nodo */
  nodeId: string;
}