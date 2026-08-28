import { Stat, IVSpread, createEmptyIVs } from '../src/domain/types/stat';
import { Gender, Pokemon, Species } from '../src/domain/types/pokemon';
import { HeldItem } from '../src/domain/types/items';

/** Species mock para tests */
export const MOCK_SPECIES: Species = {
  id: 1,
  name: 'Testmon',
  genderRatio: 0.5,
  eggGroups: [{ name: 'Field' }],
  gen: 1,
  baseStats: {
    hp: 45,
    attack: 60,
    defense: 40,
    spatk: 70,
    spdef: 50,
    speed: 45,
  },
  captureRate: 45,
};

/** Species mock para Ditto */
export const MOCK_DITTO: Species = {
  id: 132,
  name: 'Ditto',
  genderRatio: 0, // Genderless
  eggGroups: [{ name: 'Ditto' }],
  gen: 1,
  baseStats: {
    hp: 48,
    attack: 48,
    defense: 48,
    spatk: 48,
    spdef: 48,
    speed: 48,
  },
  captureRate: 35,
};

/** Species mock para Caterpie (mismo egg group que Trapinch) */
export const MOCK_CATERPIE: Species = {
  id: 10,
  name: 'Caterpie',
  genderRatio: 0.5,
  eggGroups: [{ name: 'Bug' }],
  gen: 1,
  baseStats: {
    hp: 45,
    attack: 30,
    defense: 35,
    spatk: 20,
    spdef: 20,
    speed: 45,
  },
  captureRate: 255,
};

/** Species mock para Trapinch */
export const MOCK_TRAPINCH: Species = {
  id: 328,
  name: 'Trapinch',
  genderRatio: 0.5,
  eggGroups: [{ name: 'Bug' }, { name: 'Dragon' }],
  gen: 3,
  baseStats: {
    hp: 45,
    attack: 100,
    defense: 45,
    spatk: 45,
    spdef: 45,
    speed: 10,
  },
  captureRate: 255,
};

/** Crea un Pokémon mock para tests */
export function createMockPokemon(
  overrides: Partial<Pokemon> = {}
): Pokemon {
  const defaultIVs = createEmptyIVs();

  return {
    species: MOCK_SPECIES,
    gender: Gender.Male,
    ivs: defaultIVs,
    heldItem: null,
    ...overrides,
  };
}

/** Crea un Pokémon con IVs específicos */
export function createPokemonWithIVs(
  ivs: Partial<IVSpread>,
  species: Species = MOCK_SPECIES,
  gender: Gender = Gender.Male
): Pokemon {
  const defaultIVs = createEmptyIVs();

  return {
    species,
    gender,
    ivs: { ...defaultIVs, ...ivs },
    heldItem: null,
  };
}

/** Crea un Ditto mock */
export function createDitto(ivs: Partial<IVSpread> = {}): Pokemon {
  return createPokemonWithIVs(ivs, MOCK_DITTO, Gender.Genderless);
}

/** Crea un Pokémon con 31 en stats específicos */
export function createPokemonWithPerfectIVs(
  stats: Stat[],
  species: Species = MOCK_SPECIES,
  gender: Gender = Gender.Male
): Pokemon {
  const ivs = createEmptyIVs();
  stats.forEach((stat) => {
    ivs[stat] = 31;
  });

  return {
    species,
    gender,
    ivs,
    heldItem: null,
  };
}

/** Crea un item mock */
export function createMockItem(stat?: Stat): HeldItem {
  return {
    type: 'power_weight' as any,
    stat,
  };
}
