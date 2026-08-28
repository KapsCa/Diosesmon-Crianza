import { Pokemon, Gender, Species } from '../types/pokemon';
import { HeldItem, ItemType } from '../types/items';
import { CompatibilityCheck } from '../types/breeding';

/**
 * Verifica si dos Pokémon son compatibles para breeding.
 *
 * Reglas de compatibilidad:
 * 1. Ambos deben tener género diferente (macho + hembra)
 * 2. EXCEPTO si uno es Ditto (genderless puede cruzar con cualquiera)
 * 3. Genderless (no Ditto) solo crían con Ditto
 * 4. Deben compartir al menos un grupo huevo
 * 5. Nidoran macho solo cría con Ditto hembra
 *
 * @param father - Padre (macho)
 * @param mother - Madre (hembra)
 * @returns CompatibilityCheck con resultado y razón
 */
export function checkBreedingCompatibility(
  father: Pokemon,
  mother: Pokemon
): CompatibilityCheck {
  // Regla 1: Verificar si uno es Ditto
  const fatherIsDitto = father.species.name === 'Ditto';
  const motherIsDitto = mother.species.name === 'Ditto';

  // Regla 2: Genderless (no Ditto) solo crían con Ditto
  if (father.gender === Gender.Genderless && !fatherIsDitto) {
    if (!motherIsDitto) {
      return {
        isCompatible: false,
        reason: `${father.species.name} es genderless y solo puede criar con Ditto`,
      };
    }
  }

  if (mother.gender === Gender.Genderless && !motherIsDitto) {
    if (!fatherIsDitto) {
      return {
        isCompatible: false,
        reason: `${mother.species.name} es genderless y solo puede criar con Ditto`,
      };
    }
  }

  // Regla 3: Nidoran macho solo cría con Ditto hembra
  if (father.species.name === 'Nidoran♂' && mother.species.name !== 'Ditto') {
    return {
      isCompatible: false,
      reason: 'Nidoran macho solo puede criar con Ditto hembra',
    };
  }

  // Regla 4: Si ambos son genderless (y no son Ditto), no pueden criar
  if (father.gender === Gender.Genderless && mother.gender === Gender.Genderless) {
    return {
      isCompatible: false,
      reason: 'Ambos Pokémon son genderless, no pueden criar',
    };
  }

  // Regla 5: Si ambos son del mismo género y no hay Ditto
  if (
    father.gender === mother.gender &&
    !fatherIsDitto &&
    !motherIsDitto
  ) {
    return {
      isCompatible: false,
      reason: `Ambos Pokémon son del mismo género (${father.gender})`,
    };
  }

  // Regla 6: Verificar grupos huevo
  const fatherGroups = father.species.eggGroups.map((g) => g.name);
  const motherGroups = mother.species.eggGroups.map((g) => g.name);

  // Ditto es compatible con cualquier grupo
  if (fatherIsDitto || motherIsDitto) {
    return { isCompatible: true };
  }

  const sharedGroups = fatherGroups.filter((g) => motherGroups.includes(g));

  if (sharedGroups.length === 0) {
    return {
      isCompatible: false,
      reason: `${father.species.name} (${fatherGroups.join(', ')}) y ${mother.species.name} (${motherGroups.join(', ')}) no comparten grupo huevo`,
    };
  }

  return { isCompatible: true };
}

/**
 * Verifica si un Pokémon puede ser usado como padre para breeding.
 *
 * @param pokemon - Pokémon a verificar
 * @returns true si puede ser padre
 */
export function canBreed(pokemon: Pokemon): boolean {
  // Ditto siempre puede criar
  if (pokemon.species.name === 'Ditto') return true;

  // Genderless no puede ser padre (excepto Ditto)
  if (pokemon.gender === Gender.Genderless) return false;

  // Necesita tener género (macho o hembra)
  return pokemon.gender === Gender.Male || pokemon.gender === Gender.Female;
}

/**
 * Verifica si se pueden equipar los items especificados.
 *
 * @param fatherItem - Item del padre
 * @param motherItem - Item de la madre
 * @returns CompatibilityCheck
 */
export function checkItemCompatibility(
  fatherItem: HeldItem | null,
  motherItem: HeldItem | null
): CompatibilityCheck {
  const items = [fatherItem, motherItem].filter(Boolean);

  // Máximo 2 items
  if (items.length > 2) {
    return {
      isCompatible: false,
      reason: 'No se pueden equipar más de 2 items',
    };
  }

  // Verificar que no hayaitems duplicados
  const itemTypes = items.map((i) => i!.type);
  const uniqueTypes = new Set(itemTypes);

  if (uniqueTypes.size !== itemTypes.length) {
    return {
      isCompatible: false,
      reason: 'No se pueden equipar el mismo item en ambos padres',
    };
  }

  // Verificar que no haya dos Power Items protegiendo el mismo stat
  const powerItems = items.filter(
    (i) => i!.type !== ItemType.Everstone && i!.stat !== undefined
  );
  const protectedStats = powerItems.map((i) => i!.stat);
  const uniqueStats = new Set(protectedStats);

  if (uniqueStats.size !== protectedStats.length) {
    return {
      isCompatible: false,
      reason: 'No se pueden equipar dos Power Items protegiendo el mismo stat',
    };
  }

  return { isCompatible: true };
}

/**
 * Obtiene el género que hereda la cría.
 * Siempre es la especie de la madre.
 *
 * @param mother - Madre
 * @returns Especie de la madre
 */
export function getOffspringSpecies(mother: Species): Species {
  return mother;
}
