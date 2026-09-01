/**
 * Servicio para obtener datos de biomas basados en especies Pokémon.
 * Consume el data placeholder de Diosesmon biomas y mapea especies a captures bioma.
 */
import { biomes } from '../data/diosesmon-biomes';
import type { BiomeEntry } from '../data/diosesmon-biomes';
import type { Species } from '../types/pokemon';

/**
 * Obtiene la información de bioma para una lista de especies.
 * @param speciesList - Lista de especies Pokémon (objetos Species o parciales)
 * @returns Array de BiomeCapture con los datos de bioma para cada especie encontrada
 */
export function getBiomeCaptures(speciesList: Species[]): BiomeEntry[] {
  return speciesList
    .map((species): BiomeEntry | undefined => {
      const biomeEntry = biomes.find(
        (b) => b.species.id === species.id && b.species.name === species.name
      );
      return biomeEntry;
    })
    .filter((entry): entry is BiomeEntry => entry !== undefined);
}

/**
 * Obtiene la captura biome para una sola especie.
 * Retorna undefined si la especie no está en los biomas conocidos.
 */
export function getBiomeCapture(
  species: Species
): BiomeEntry | undefined {
  return biomes.find(
    (b) => b.species.id === species.id && b.species.name === species.name
  );
}

/**
 * Filtra biomas por nombre (ej: "Forest", "Desert", "Any").
 */
export function filterBiomesByName(
  biomesList: BiomeEntry[],
  biomeName: string
): BiomeEntry[] {
  return biomesList.filter((b) => b.biome === biomeName);
}