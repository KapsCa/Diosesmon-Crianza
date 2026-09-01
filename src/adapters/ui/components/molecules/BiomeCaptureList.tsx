import React from 'react';

/**
 * BiomeCapture - Interfaz para datos de captura en un bioma
 */
interface BiomeCapture {
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

/**
 * BiomeCaptureList - Componente molécula que muestra una lista de capturas biomegrupada por bioma con tasas.
 *
 * Features:
 * - Agrupa las capturas por nombre de bioma
 * - Muestra la tasa de encuentro base (0-1)
 * - Muestra la tasa de captura efectiva (0-1)
 * - Lista las especies encontradas en cada bioma
 * - Muestra la tasa de captura de la species
 *
 * @param biomeCaptures - Array de datos de captura biome
 */
interface BiomeCaptureListProps {
  biomeCaptures: BiomeCapture[];
}

/**
 * Agrupa las capturas por nombre de bioma y renderiza secciones separadas.
 */
export const BiomeCaptureList: React.FC<BiomeCaptureListProps> = ({ biomeCaptures }) => {
  // Agrupar capturas por bioma
  const groupedByBiome = biomeCaptures.reduce((acc, capture) => {
    const biomeName = capture.biome;
    if (!acc[biomeName]) {
      acc[biomeName] = [];
    }
    acc[biomeName].push(capture);
    return acc;
  }, {} as Record<string, BiomeCapture[]>);

  return (
    <div className="biome-capture-list">
      {Object.entries(groupedByBiome).map(([biomeName, captures]) => (
        <section
          key={biomeName}
          role="region"
          aria-label={`Bioma: ${biomeName}`}
          className="biome-section"
        >
          <h3 className="biome-title">{biomeName}</h3>
          <ul className="biome-list">
            {captures.map((capture) => (
              <li key={capture.species.id} className="biome-item">
                <span className="species-name">{capture.species.name}</span>
                <div className="capture-rates">
                  <span className="encounter-rate">
                    Tasa de encuentro: {capture.encounterRate}
                  </span>
                  <span className="capture-chance">
                    Taza de captura: {capture.captureChance}
                  </span>
                  <span className="capture-rate-badge">
                    Capture Rate: {capture.species.captureRate}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default BiomeCaptureList;