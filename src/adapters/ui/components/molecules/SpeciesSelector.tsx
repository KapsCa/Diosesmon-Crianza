import React from 'react';

/**
 * SpeciesSelector - Componente molécula que muestra un dropdown para seleccionar una especie Pokémon.
 *
 * Features:
 * - Renderiza un <select> con todas las especies proporcionadas
 * - Opcional filtro por eggGroup (solo muestra species que tienen ese grupo huevo)
 * - Cada option muestra el nombre de la species y tiene el ID como value
 *
 * @param speciesList - Lista de especies Pokémon disponibles
 * @param eggGroupFilter - Opcional: filtrar species por este grupo huevo
 * @param onSelect - Callback cuando se selecciona una especie
 * @param disabled - Si true, deshabilita el selector
 */
interface SpeciesSelectorProps {
  speciesList: {
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
  }[];
  eggGroupFilter?: string;
  onSelect?: (species: { id: number; name: string }) => void;
  disabled?: boolean;
}

export const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({ speciesList, eggGroupFilter, onSelect, disabled }) => {
  // Filtrar species por eggGroup si se proporciona
  const filteredSpecies = eggGroupFilter
    ? speciesList.filter((species) =>
        species.eggGroups.some((group) => group.name === eggGroupFilter)
      )
    : speciesList;

  return (
    <div className="species-selector">
      <label htmlFor="species-selector">Especie Pokémon</label>
      <select
        id="species-selector"
        className="species-select"
        onChange={(e) => {
          const selectedId = Number(e.target.value);
          const selectedSpecies = speciesList.find((s) => s.id === selectedId);
          if (selectedSpecies && onSelect) {
            onSelect({ id: selectedSpecies.id, name: selectedSpecies.name });
          }
        }}
        disabled={disabled}
      >
        <option value="" disabled>
          Seleccioná una especie
        </option>
        {filteredSpecies.map((species) => (
          <option key={species.id} value={species.id}>
            {species.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SpeciesSelector;