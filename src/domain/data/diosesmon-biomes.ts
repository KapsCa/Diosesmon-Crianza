/**
 * Datos estáticos de biomas para Diosesmon.
 * Mapea especies Pokémon a biomas con tasas de encuentro y captura.
 * Esto es datos duros (hardcoded) para MVP; interfaz BiomeProvider
 * estará disponible para futuros datos dinámicos/servicios.
 */

import type { Species } from '../types/pokemon';

/** Todas las entradas de bioma conocidas en el sistema */
export const biomes: BiomeEntry[] = [
  {
    species: {
      id: 1,
      name: 'Testmon',
      genderRatio: 0.5,
      eggGroups: [{ name: 'Field' }],
      gen: 1,
      baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 },
      captureRate: 45,
    },
    biome: 'Forest',
    encounterRate: 0.4,
    captureChance: 0.8,
    notes: 'Bioma base para especies de prueba',
  },
  {
    species: {
      id: 328,
      name: 'Trapinch',
      genderRatio: 0.5,
      eggGroups: [{ name: 'Bug' }, { name: 'Dragon' }],
      gen: 3,
      baseStats: { hp: 45, attack: 100, defense: 45, spatk: 45, spdef: 45, speed: 10 },
      captureRate: 255,
    },
    biome: 'Desert',
    encounterRate: 0.15,
    captureChance: 0.5,
    notes: 'Trapinch prefiere ambientes áridos con alta exposición solar',
  },
  {
    species: {
      id: 10,
      name: 'Caterpie',
      genderRatio: 0.5,
      eggGroups: [{ name: 'Bug' }],
      gen: 1,
      baseStats: { hp: 45, attack: 30, defense: 35, spatk: 20, spdef: 20, speed: 45 },
      captureRate: 255,
    },
    biome: 'Forest',
    encounterRate: 0.5,
    captureChance: 0.9,
    notes: 'Caterpie muy común en áreas boscosas',
  },
  {
    species: {
      id: 132,
      name: 'Ditto',
      genderRatio: 0,
      eggGroups: [{ name: 'Ditto' }],
      gen: 1,
      baseStats: { hp: 48, attack: 48, defense: 48, spatk: 48, spdef: 48, speed: 48 },
      captureRate: 35,
    },
    biome: 'Any',
    encounterRate: 0.05,
    captureChance: 0.3,
    notes: 'Ditto es genderless y aparece en cualquier bioma',
  },
  {
    species: {
      id: 25,
      name: 'Pikachu',
      genderRatio: 0.5,
      eggGroups: [{ name: 'Fairy' }, { name: 'Dragon' }],
      gen: 1,
      baseStats: { hp: 35, attack: 55, defense: 40, spatk: 50, spdef: 50, speed: 90 },
      captureRate: 190,
    },
    biome: 'Forest',
    encounterRate: 0.2,
    captureChance: 0.7,
    notes: 'Aparece en bosques con clima eléctrico',
  },
  {
    species: {
      id: 3,
      name: 'Vulpix',
      genderRatio: 0.5,
      eggGroups: [{ name: 'Field' }, { name: 'Fairy' }],
      gen: 1,
      baseStats: { hp: 38, attack: 41, defense: 40, spatk: 50, spdef: 65, speed: 65 },
      captureRate: 190,
    },
    biome: 'Ice',
    encounterRate: 0.1,
    captureChance: 0.4,
    notes: 'Vulpix de hielo; requiere condiciones de temperatura baja',
  },
  {
    species: {
      id: 57,
      name: 'Clefairy',
      genderRatio: 0.5,
      eggGroups: [{ name: 'Fairy' }],
      gen: 1,
      baseStats: { hp: 70, attack: 45, defense: 45, spatk: 60, spdef: 110, speed: 60 },
      captureRate: 25,
    },
    biome: 'Mountain',
    encounterRate: 0.08,
    captureChance: 0.35,
    notes: 'Clefairy es tímido y aparece en cuevas montañosas',
  },
];

/** Entrada individual de bioma */
export interface BiomeEntry {
  /** Datos de la especie Pokémon */
  species: Species;
  /** Nombre del bioma */
  biome: string;
  /** Tasa de encuentro base (0-1, donde 1 = máximo posible) */
  encounterRate: number;
  /** Tasa de captura efectiva (0-1, considerando stats y nivel) */
  captureChance: number;
  /** Notas adicionales sobre las condiciones de este bioma */
  notes?: string;
}