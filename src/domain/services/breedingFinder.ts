/**
 * Servicio para encontrar padres compatibles para breeding.
 * Usa validación de grupos huevo, género y validación existente del dominio.
 * Encuentra un par padre-madre de la especie objetivo.
 */
import type { Species, Pokemon } from '../types/pokemon';
import { Gender } from '../types/pokemon';
import { checkBreedingCompatibility, validateBreedingEntry } from './validation';
import { createPerfectIVs } from '../types/stat';

/**
 * Encuentra padres compatibles para criar una especie objetivo.
 *
 * Busca un par padre-madre de la especie objetivo que cumpla:
 * 1. Grupos huevo compartidos
 * 2. Reglas de género (macho + hembra, o compatible con Ditto)
 * 3. Validación de entrada de breeding
 *
 * @param targetSpecies - Especie objetivo de la cría
 * @returns Objeto con padres compatibles y metadatos
 */
export function findCompatibleParents(
  targetSpecies: Species
): {
  parents: Pokemon[];
  compatible: boolean;
  reason?: string;
  eggGroupMatch: boolean;
  genderRules: boolean;
} {
  // Caso especial: Ditto puede criar con cualquier especie
  if (targetSpecies.name === 'Ditto') {
    const dittoEggGroups = targetSpecies.eggGroups
      ? targetSpecies.eggGroups.map((g) => g.name)
      : [];
    const hasUndiscovered = dittoEggGroups.includes('Undiscovered');

    return {
      parents: [
        {
          species: targetSpecies,
          gender: Gender.Genderless,
          ivs: createPerfectIVs(),
          heldItem: null,
        },
      ],
      compatible: hasUndiscovered ? false : true,
      eggGroupMatch: hasUndiscovered ? false : true,
      genderRules: true,
    };
  }

  // Para especies normales, verificar si tiene grupo Undiscovered (impide breeding normal)
  const targetEggGroups = targetSpecies.eggGroups
    ? targetSpecies.eggGroups.map((g) => g.name).filter((g) => g !== 'Undiscovered')
    : [];
  const hasUndiscoveredOnly =
    targetEggGroups.length === 0 && targetSpecies.eggGroups?.length === 1;

  if (hasUndiscoveredOnly) {
    return {
      parents: [],
      compatible: false,
      reason: 'Esta especie no puede criar: no comparten grupo huevo',
      eggGroupMatch: false,
      genderRules: false,
    };
  }

  // Crear padre y madre del objetivo
  const father: Pokemon = {
    species: targetSpecies,
    gender: Gender.Male,
    ivs: createPerfectIVs(),
    heldItem: null,
  };

  const mother: Pokemon = {
    species: targetSpecies,
    gender: Gender.Female,
    ivs: createPerfectIVs(),
    heldItem: null,
  };

  // Validar entradas de breeding
  const fatherValid = validateBreedingEntry(father).isValid;
  const motherValid = validateBreedingEntry(mother).isValid;

  // Si alguna entrada no es válida, usar Ditto
  const fatherToUse = fatherValid ? father : {
    species: targetSpecies,
    gender: Gender.Genderless,
    ivs: createPerfectIVs(),
    heldItem: null,
  };

  const motherToUse = motherValid ? mother : {
    species: targetSpecies,
    gender: Gender.Genderless,
    ivs: createPerfectIVs(),
    heldItem: null,
  };

  // Verificar compatibilidad de la pareja
  const compatibility = checkBreedingCompatibility(
    fatherToUse,
    motherToUse
  );

  // Verificar match de grupos huevo (excluir Undiscovered que impede breeding normal)
  const fg = fatherToUse.species.eggGroups || [];
  const mg = motherToUse.species.eggGroups || [];
  const fatherGroups = fg.map((g: { name: string }) => g.name).filter((g) => g !== 'Undiscovered');
  const motherGroups = mg.map((g: { name: string }) => g.name).filter((g) => g !== 'Undiscovered');
  const sharedGroups = fatherGroups.filter((g) => motherGroups.includes(g));
  const eggGroupMatch =
    sharedGroups.length > 0 ||
    fatherToUse.species.name === 'Ditto' ||
    motherToUse.species.name === 'Ditto';

  // Verificar reglas de género
  const genderRules =
    (fatherToUse.gender === Gender.Male && motherToUse.gender === Gender.Female) ||
    fatherToUse.gender === Gender.Genderless ||
    motherToUse.gender === Gender.Genderless;

  const parents: Pokemon[] = [];
  if (compatibility.isCompatible) {
    parents.push(fatherToUse);
    parents.push(motherToUse);
  }

  return {
    parents,
    compatible: compatibility.isCompatible,
    reason: compatibility.reason,
    eggGroupMatch,
    genderRules,
  };
}