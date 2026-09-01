/**
 * Datos de captura en un bioma específico.
 * Mapea una especie Pokémon a un bioma con tasas de encuentro y captura.
 */
export interface BiomeCapture {
  /** Datos de la especie Pokémon */
  species: {
    id: number;
    name: string;
    genderRatio: number;
    eggGroups: { name: string }[];
    gen: number;
    baseStats: {
      hp: number;
      attack: number;
      defense: number;
      spatk: number;
      spdef: number;
      speed: number;
    };
    captureRate: number;
  };
  /** Nombre del bioma (ej: "Forest", "Cave", "Desert", "Water") */
  biome: string;
  /** Tasa de encuentro base en este bioma (0-1, donde 1 = máximo) */
  encounterRate: number;
  /** Taza de captura efectiva considerando los stats y nivel */
  captureChance: number;
}