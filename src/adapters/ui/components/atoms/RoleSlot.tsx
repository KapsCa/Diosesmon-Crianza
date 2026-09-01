import React from 'react';
import type { Gender } from '../../../../domain/types/pokemon';

/**
 * RoleSlot - Componente atom que representa el rol de padre o madre en un slot de crianza.
 * 
 * Comportamiento:
 * - Si el Pokémon tiene género fijo (macho/hembra): el slot es read-only según su sexo
 * - Si el Pokémon es genderless: muestra un toggle para elegir "Ser Padre" o "Ser Madre"
 * - Siempre muestra un badge con el resultado: "Resultado: [Especie del slot Madre]"
 *
 * @param pokemon - El Pokémon asignado a este slot
 * @param onGenderChange - Callback opcional cuando cambia el género (solo para genderless)
 */
interface RoleSlotProps {
  pokemon: {
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
    gender: Gender;
    ivs: {
      hp: number;
      attack: number;
      defense: number;
      spatk: number;
      spdef: number;
      speed: number;
    };
    heldItem: null | {
      type: string;
      stat?: string;
    };
    nickname?: string | undefined;
  };
  onGenderChange?: (gender: Gender) => void;
}

export const RoleSlot: React.FC<RoleSlotProps> = ({ pokemon, onGenderChange }) => {
  const { gender, species } = pokemon;
  const isGenderless = gender === 'genderless';
  const isFixedGender = gender === 'male' || gender === 'female';

  return (
    <div
      className="role-slot"
      data-gender={gender}
      data-readonly={isFixedGender.toString()}
      role="radio"
    >
      {/* Badge con el resultado - siempre muestra la especie del slot Madre */}
      <span className="result-badge">
        Resultado: {species.name}
      </span>

      {/* Toggle solo para Pokémon genderless */}
      {isGenderless && (
        <div className="gender-toggle">
          <label>
            <input
              type="radio"
              name="role-slot-{species.id}"
              value="male"
              checked={true}
              onChange={() => onGenderChange?.('male')}
              disabled={isFixedGender}
            />
            Ser Padre
          </label>
          <label>
            <input
              type="radio"
              name="role-slot-{species.id}"
              value="female"
              onChange={() => onGenderChange?.('female')}
              disabled={isFixedGender}
            />
            Ser Madre
          </label>
        </div>
      )}

      {/* Para géneros fijos, mostram el género pero sin toggle */}
      {isFixedGender && (
        <span className="fixed-gender-badge">
          {gender.charAt(0).toUpperCase() + gender.slice(1)}
        </span>
      )}
    </div>
  );
};

export default RoleSlot;