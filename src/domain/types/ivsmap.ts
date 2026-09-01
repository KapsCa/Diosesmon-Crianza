import type { IVSpread, Stat } from './stat';

/**
 * Configuración para el mapeo de IVs.
 * Define los parámetros de entrada para una operación de IVsMap.
 */
export interface IVsMapConfig {
  /** IVs de origen (spread de valores 0-31) */
  sourceIVs: IVSpread;
  /** Stats objetivo opcionales a los que mapear */
  targetIVs?: Stat[];
  /** Si incluir stats que ya tienen protección de items */
  includeProtected?: boolean;
}

/**
 * Resultado de una operación de IVsMap.
 * Contiene los IVs resultantes y el desglose de herencia.
 */
export interface IVsMapResult {
  /** IVs resultantes después del mapeo */
  resultIVs: IVSpread;
  /** Stats que se heredaron libremente (0 costo) */
  inheritedFree: Stat[];
  /** Stats que requirieron protección de items */
  inheritedProtected: { stat: Stat; source: 'power_item' | 'everstone' }[];
  /** Stats que quedaron al azar (sin protección) */
  rng: Stat[];
  /** Costo total en items (500$ por power item) */
  totalCost: number;
}