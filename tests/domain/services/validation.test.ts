import { describe, it, expect } from 'vitest';
import {
  checkBreedingCompatibility,
  canBreed,
  checkItemCompatibility,
  getOffspringSpecies,
  validateBreedingEntry,
} from '../../../src/domain/services/validation';
import { Stat } from '../../../src/domain/types/stat';
import { Gender } from '../../../src/domain/types/pokemon';
import {
  createMockPokemon,
  createDitto,
  MOCK_CATERPIE,
  MOCK_TRAPINCH,
  MOCK_BABY_SPECIES,
  MOCK_NON_BREEDABLE_SPECIES,
} from '../../helpers';

describe('checkBreedingCompatibility', () => {
  // ─── CASO BASE: macho + hembra compatible ───────────
  it('debería permitir breeding entre macho y hembra del mismo grupo huevo', () => {
    const father = createMockPokemon({ gender: Gender.Male });
    const mother = createMockPokemon({ gender: Gender.Female });

    const result = checkBreedingCompatibility(father, mother);

    expect(result.isCompatible).toBe(true);
  });

  // ─── CASO: ambos macho ──────────────────────────────
  it('debería rechazar breeding entre dos machos', () => {
    const father = createMockPokemon({ gender: Gender.Male });
    const mother = createMockPokemon({ gender: Gender.Male });

    const result = checkBreedingCompatibility(father, mother);

    expect(result.isCompatible).toBe(false);
    expect(result.reason).toContain('mismo género');
  });

  // ─── CASO: ambos hembra ─────────────────────────────
  it('debería rechazar breeding entre dos hembras', () => {
    const father = createMockPokemon({ gender: Gender.Female });
    const mother = createMockPokemon({ gender: Gender.Female });

    const result = checkBreedingCompatibility(father, mother);

    expect(result.isCompatible).toBe(false);
    expect(result.reason).toContain('mismo género');
  });

  // ─── CASO: Ditto como padre ─────────────────────────
  it('debería permitir breeding con Ditto como padre', () => {
    const ditto = createDitto();
    ditto.gender = Gender.Male; // Ditto puede ser ambos sexos
    const mother = createMockPokemon({ gender: Gender.Female });

    const result = checkBreedingCompatibility(ditto, mother);

    expect(result.isCompatible).toBe(true);
  });

  // ─── CASO: Ditto como madre ─────────────────────────
  it('debería permitir breeding con Ditto como madre', () => {
    const father = createMockPokemon({ gender: Gender.Male });
    const ditto = createDitto();
    ditto.gender = Gender.Female;

    const result = checkBreedingCompatibility(father, ditto);

    expect(result.isCompatible).toBe(true);
  });

  // ─── CASO: Genderless no Ditto ──────────────────────
  it('debería rechazar breeding con genderless que no es Ditto', () => {
    const magnemite = createMockPokemon({
      gender: Gender.Genderless,
      species: {
        id: 81,
        name: 'Magnemite',
        genderRatio: 0,
        eggGroups: [{ name: 'Mineral' }],
        gen: 1,
        baseStats: { hp: 25, attack: 35, defense: 70, spatk: 95, spdef: 55, speed: 45 },
        captureRate: 190,
      },
    });
    const mother = createMockPokemon({ gender: Gender.Female });

    const result = checkBreedingCompatibility(magnemite, mother);

    expect(result.isCompatible).toBe(false);
    expect(result.reason).toContain('genderless');
    expect(result.reason).toContain('Ditto');
  });

  // ─── CASO: Nidoran macho solo con Ditto ─────────────
  it('debería rechazar breeding de Nidoran macho con no-Ditto', () => {
    const nidoranM = createMockPokemon({
      gender: Gender.Male,
      species: {
        id: 32,
        name: 'Nidoran♂',
        genderRatio: 1, // Solo macho
        eggGroups: [{ name: 'Field' }, { name: 'Monster' }],
        gen: 1,
        baseStats: { hp: 46, attack: 57, defense: 40, spatk: 40, spdef: 40, speed: 50 },
        captureRate: 235,
      },
    });
    const mother = createMockPokemon({ gender: Gender.Female });

    const result = checkBreedingCompatibility(nidoranM, mother);

    expect(result.isCompatible).toBe(false);
    expect(result.reason).toContain('Nidoran');
    expect(result.reason).toContain('Ditto');
  });

  // ─── CASO: Nidoran macho con Ditto ──────────────────
  it('debería permitir breeding de Nidoran macho con Ditto', () => {
    const nidoranM = createMockPokemon({
      gender: Gender.Male,
      species: {
        id: 32,
        name: 'Nidoran♂',
        genderRatio: 1,
        eggGroups: [{ name: 'Field' }, { name: 'Monster' }],
        gen: 1,
        baseStats: { hp: 46, attack: 57, defense: 40, spatk: 40, spdef: 40, speed: 50 },
        captureRate: 235,
      },
    });
    const ditto = createDitto();
    ditto.gender = Gender.Female;

    const result = checkBreedingCompatibility(nidoranM, ditto);

    expect(result.isCompatible).toBe(true);
  });

  // ─── CASO: Sin shared egg groups ────────────────────
  it('debería rechazar breeding cuando no comparten grupo huevo', () => {
    const father = createMockPokemon({
      gender: Gender.Male,
      species: MOCK_CATERPIE, // Bug group
    });
    const mother = createMockPokemon({
      gender: Gender.Female,
      species: {
        id: 133,
        name: 'Eevee',
        genderRatio: 0.875, // 87.5% macho
        eggGroups: [{ name: 'Field' }],
        gen: 1,
        baseStats: { hp: 55, attack: 55, defense: 50, spatk: 45, spdef: 65, speed: 55 },
        captureRate: 45,
      },
    });

    const result = checkBreedingCompatibility(father, mother);

    expect(result.isCompatible).toBe(false);
    expect(result.reason).toContain('grupo huevo');
  });

  // ─── CASO: Comparten múltiples grupos huevo ─────────
  it('debería permitir breeding cuando comparten al menos un grupo huevo', () => {
    const father = createMockPokemon({
      gender: Gender.Male,
      species: MOCK_TRAPINCH, // Bug + Dragon
    });
    const mother = createMockPokemon({
      gender: Gender.Female,
      species: MOCK_CATERPIE, // Bug
    });

    const result = checkBreedingCompatibility(father, mother);

    expect(result.isCompatible).toBe(true);
  });
});

describe('validateBreedingEntry', () => {
  it('debería permitir una especie normal', () => {
    const pokemon = createMockPokemon({ gender: Gender.Male });

    const result = validateBreedingEntry(pokemon);

    expect(result.isValid).toBe(true);
  });

  it('debería bloquear un bebé y sugerir evolución', () => {
    const pokemon = createMockPokemon({
      gender: Gender.Genderless,
      species: MOCK_BABY_SPECIES,
    });

    const result = validateBreedingEntry(pokemon);

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('bebé');
    expect(result.suggestion).toContain('Pikachu');
  });

  it('debería bloquear una especie no criable', () => {
    const pokemon = createMockPokemon({
      gender: Gender.Genderless,
      species: MOCK_NON_BREEDABLE_SPECIES,
    });

    const result = validateBreedingEntry(pokemon);

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('no puede criar');
  });
});

describe('canBreed', () => {
  it('debería retornar true para machos', () => {
    const pokemon = createMockPokemon({ gender: Gender.Male });
    expect(canBreed(pokemon)).toBe(true);
  });

  it('debería retornar true para hembras', () => {
    const pokemon = createMockPokemon({ gender: Gender.Female });
    expect(canBreed(pokemon)).toBe(true);
  });

  it('debería retornar true para Ditto', () => {
    const ditto = createDitto();
    expect(canBreed(ditto)).toBe(true);
  });

  it('debería retornar false para genderless que no es Ditto', () => {
    const pokemon = createMockPokemon({ gender: Gender.Genderless });
    expect(canBreed(pokemon)).toBe(false);
  });

  it('debería retornar false para un bebé', () => {
    const pokemon = createMockPokemon({
      gender: Gender.Genderless,
      species: MOCK_BABY_SPECIES,
    });

    expect(canBreed(pokemon)).toBe(false);
  });

  it('debería retornar false para una especie no criable', () => {
    const pokemon = createMockPokemon({
      gender: Gender.Genderless,
      species: MOCK_NON_BREEDABLE_SPECIES,
    });

    expect(canBreed(pokemon)).toBe(false);
  });
});

describe('checkItemCompatibility', () => {
  it('debería permitir 2 items diferentes', () => {
    const fatherItem = { type: 'power_weight' as any, stat: Stat.HP };
    const motherItem = { type: 'power_bracer' as any, stat: Stat.Attack };

    const result = checkItemCompatibility(fatherItem, motherItem);

    expect(result.isCompatible).toBe(true);
  });

  it('debería permitir 1 solo item', () => {
    const fatherItem = { type: 'power_weight' as any, stat: Stat.HP };

    const result = checkItemCompatibility(fatherItem, null);

    expect(result.isCompatible).toBe(true);
  });

  it('debería permitir sin items', () => {
    const result = checkItemCompatibility(null, null);

    expect(result.isCompatible).toBe(true);
  });

  it('debería rechazar 2 Power Items protegiendo el mismo stat', () => {
    // Usamos items diferentes pero protegiendo el mismo stat
    const fatherItem = { type: 'power_weight' as any, stat: Stat.HP };
    const motherItem = { type: 'power_bracer' as any, stat: Stat.HP };

    const result = checkItemCompatibility(fatherItem, motherItem);

    expect(result.isCompatible).toBe(false);
    expect(result.reason).toContain('mismo stat');
  });

  it('debería rechazar el mismo tipo de item en ambos padres', () => {
    const fatherItem = { type: 'power_weight' as any, stat: Stat.HP };
    const motherItem = { type: 'power_weight' as any, stat: Stat.Attack };

    const result = checkItemCompatibility(fatherItem, motherItem);

    expect(result.isCompatible).toBe(false);
    expect(result.reason).toContain('mismo item');
  });
});

describe('getOffspringSpecies', () => {
  it('debería retornar la especie de la madre', () => {
    const mother = createMockPokemon({
      gender: Gender.Female,
      species: MOCK_TRAPINCH,
    });

    const result = getOffspringSpecies(mother.species);

    expect(result).toBe(mother.species);
    expect(result.name).toBe('Trapinch');
  });
});
