import { ItemType } from './items';

/**
 * Modelo de costos para el breeding.
 * Define los precios de cada componente del proceso.
 */
export interface CostModel {
  /** Costo por tipo de item */
  itemCosts: Record<ItemType, number>;
  /** Costo de guardería por paso (gratis = 0) */
  nurseryFee: number;
  /** Costo de selección de género (500$) */
  genderSelectionCost: number;
  /** Costo de captura base por pokeball */
  pokeballCost: number;
  /** Mínimo de pokeballs por captura */
  minPokeballs: number;
  /** Máximo de pokeballs por captura */
  maxPokeballs: number;
}

/**
 * Costo detallado de un paso de breeding.
 */
export interface BreedingCost {
  /** Costo de items del padre */
  fatherItemCost: number;
  /** Costo de items de la madre */
  motherItemCost: number;
  /** Costo de selección de género */
  genderCost: number;
  /** Costo total del paso */
  totalStepCost: number;
}

/**
 * Presupuesto completo de una ruta de breeding.
 */
export interface Budget {
  /** Desglose por paso */
  stepCosts: BreedingCost[];
  /** Total de items */
  itemsTotal: number;
  /** Total de selecciones de género */
  genderTotal: number;
  /** Total general */
  grandTotal: number;
}

/**
 * Estimación de tiempo de una ruta.
 */
export interface TimeEstimate {
  /** Número total de pasos de breeding */
  totalSteps: number;
  /** Tiempo por paso en minutos */
  timePerStep: number;
  /** Número de slots disponibles */
  availableSlots: number;
  /** Tiempo total estimado en minutos */
  totalMinutes: number;
  /** Tiempo formateado (ej: "2 horas 15 minutos") */
  formattedTime: string;
}

/**
 * Configuración de slots de guardería.
 */
export interface NurseryConfig {
  /** Slots gratis (2) */
  freeSlots: number;
  /** Slots por rango maestro (2) */
  masterSlots: number;
  /** Slots por Diosescoin (2) */
  premiumSlots: number;
  /** Slots comprados con pokedollars (1) */
  purchasedSlots: number;
  /** Costo de slot extra en pokedollars */
  slotUpgradeCost: number;
}

/** Configuración por defecto */
export const DEFAULT_NURSERY_CONFIG: NurseryConfig = {
  freeSlots: 2,
  masterSlots: 2,
  premiumSlots: 2,
  purchasedSlots: 0,
  slotUpgradeCost: 10000,
};

/**
 * Calcula el número total de slots disponibles.
 */
export function calculateTotalSlots(config: NurseryConfig): number {
  return (
    config.freeSlots +
    config.masterSlots +
    config.premiumSlots +
    config.purchasedSlots
  );
}

/**
 * Costo de breeding por defecto para Diosesmon.
 */
export const DEFAULT_COST_MODEL: CostModel = {
  itemCosts: {
    [ItemType.PowerWeight]: 500,
    [ItemType.PowerBracer]: 500,
    [ItemType.PowerBelt]: 500,
    [ItemType.PowerLens]: 500,
    [ItemType.PowerBand]: 500,
    [ItemType.PowerAnklet]: 500,
    [ItemType.Everstone]: 500,
  },
  nurseryFee: 0, // Guardería gratis
  genderSelectionCost: 500,
  pokeballCost: 200,
  minPokeballs: 1,
  maxPokeballs: 10,
};
