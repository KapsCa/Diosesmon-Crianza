import { describe, it, expect } from 'vitest';
import {
  analyzeOverlap,
  calculateMissingIVs,
  isValidOverlap,
  calculateOverlapCost,
} from '../../../src/domain/services/overlap';
import { Stat } from '../../../src/domain/types/stat';
import { Gender } from '../../../src/domain/types/pokemon';
import { createMockPokemon, createPokemonWithPerfectIVs } from '../../helpers';

describe('analyzeOverlap', () => {
  // ─── CASO BASE: ambos padres comparten 31 en HP ──────
  it('debería detectar herencia libre cuando ambos padres tienen 31 en el mismo stat', () => {
    const father = createPokemonWithPerfectIVs([Stat.HP], undefined, Gender.Male);
    const mother = createPokemonWithPerfectIVs([Stat.HP, Stat.Attack], undefined, Gender.Female);

    const result = analyzeOverlap(father, mother);

    // HP: ambos tienen 31 → herencia libre (no necesita item)
    expect(result.freeInheritance).toContain(Stat.HP);
    // Attack: solo madre tiene 31 → necesita item o es RNG
    expect(result.freeInheritance).not.toContain(Stat.Attack);
  });

  // ─── CASO: sin overlap, todo requiere item o RNG ─────
  it('debería retornar herencia libre vacío cuando no hay stats compartidos en 31', () => {
    const father = createPokemonWithPerfectIVs(
      [Stat.HP, Stat.Attack, Stat.Defense],
      undefined,
      Gender.Male
    );
    const mother = createPokemonWithPerfectIVs(
      [Stat.SpAtk, Stat.SpDef, Stat.Speed],
      undefined,
      Gender.Female
    );

    const result = analyzeOverlap(father, mother);

    expect(result.freeInheritance).toHaveLength(0);
    // Todos los stats 31 requieren protección o son RNG
  });

  // ─── LÍMITE: máximo 2 items por cruce ────────────────
  it('debería indicar RNG cuando se necesitan más de 2 items para proteger todos los stats', () => {
    const father = createPokemonWithPerfectIVs(
      [Stat.HP, Stat.Attack, Stat.Defense],
      undefined,
      Gender.Male
    );
    const mother = createPokemonWithPerfectIVs(
      [Stat.SpAtk, Stat.SpDef, Stat.Speed],
      undefined,
      Gender.Female
    );

    const result = analyzeOverlap(father, mother);

    expect(result.rng.length).toBeGreaterThan(0);
    expect(result.itemProtected.length).toBeLessThanOrEqual(2);
  });

  // ─── CASO: 6x31 vs 6x31 ─────────────────────────────
  it('debería retornar todos los stats en herencia libre cuando ambos padres son 6x31', () => {
    const father = createPokemonWithPerfectIVs(
      [Stat.HP, Stat.Attack, Stat.Defense, Stat.SpAtk, Stat.SpDef, Stat.Speed],
      undefined,
      Gender.Male
    );
    const mother = createPokemonWithPerfectIVs(
      [Stat.HP, Stat.Attack, Stat.Defense, Stat.SpAtk, Stat.SpDef, Stat.Speed],
      undefined,
      Gender.Female
    );

    const result = analyzeOverlap(father, mother);

    expect(result.freeInheritance).toHaveLength(6);
    expect(result.itemProtected).toHaveLength(0);
    expect(result.rng).toHaveLength(0);
  });

  // ─── CASO: 1x31 vs 1x31 diferente ───────────────────
  it('debería retornar herencia libre vacío cuando los 31 son en stats diferentes', () => {
    const father = createPokemonWithPerfectIVs([Stat.HP], undefined, Gender.Male);
    const mother = createPokemonWithPerfectIVs([Stat.Attack], undefined, Gender.Female);

    const result = analyzeOverlap(father, mother);

    expect(result.freeInheritance).toHaveLength(0);
  });

  // ─── CASO: Padre tiene item protegiendo stat ─────────
  it('debería contar como protegido el stat que tiene item en el padre', () => {
    const father = createPokemonWithPerfectIVs([Stat.HP, Stat.Attack], undefined, Gender.Male);
    father.heldItem = { type: 'power_weight' as any, stat: Stat.HP };

    const mother = createPokemonWithPerfectIVs([Stat.Defense], undefined, Gender.Female);

    const result = analyzeOverlap(father, mother);

    expect(result.itemProtected).toHaveLength(1);
    expect(result.itemProtected[0].stat).toBe(Stat.HP);
    expect(result.itemProtected[0].byParent).toBe('father');
  });

  // ─── CASO: Madre tiene item protegiendo stat ─────────
  it('debería contar como protegido el stat que tiene item en la madre', () => {
    const father = createPokemonWithPerfectIVs([Stat.HP], undefined, Gender.Male);
    const mother = createPokemonWithPerfectIVs([Stat.Attack], undefined, Gender.Female);
    mother.heldItem = { type: 'power_bracer' as any, stat: Stat.Attack };

    const result = analyzeOverlap(father, mother);

    expect(result.itemProtected).toHaveLength(1);
    expect(result.itemProtected[0].stat).toBe(Stat.Attack);
    expect(result.itemProtected[0].byParent).toBe('mother');
  });

  // ─── CASO: Ejemplo real Trapinch + Weedle ────────────
  it('debería manejar correctamente el ejemplo real de Trapinch + Weedle', () => {
    // Trapinch hembra: HP, Def, SpAtk, SpDef, Speed = 31
    const trapinch = createPokemonWithPerfectIVs(
      [Stat.HP, Stat.Defense, Stat.SpAtk, Stat.SpDef, Stat.Speed],
      undefined,
      Gender.Female
    );

    // Weedle macho: Atk, Def, SpAtk, SpDef, Speed = 31
    const weedle = createPokemonWithPerfectIVs(
      [Stat.Attack, Stat.Defense, Stat.SpAtk, Stat.SpDef, Stat.Speed],
      undefined,
      Gender.Male
    );

    const result = analyzeOverlap(trapinch, weedle);

    // Overlap: Def, SpAtk, SpDef, Speed (4 stats)
    expect(result.freeInheritance).toContain(Stat.Defense);
    expect(result.freeInheritance).toContain(Stat.SpAtk);
    expect(result.freeInheritance).toContain(Stat.SpDef);
    expect(result.freeInheritance).toContain(Stat.Speed);
    expect(result.freeInheritance).toHaveLength(4);

    // Sin items = 0 protegidos
    expect(result.itemProtected).toHaveLength(0);

    // HP y Attack quedan sin proteger (necesitan items)
    expect(result.rng).toContain(Stat.HP);
    expect(result.rng).toContain(Stat.Attack);
  });
});

describe('calculateMissingIVs', () => {
  it('debería retornar 0 cuando todos los IVs objetivo ya están cubiertos', () => {
    const overlap = {
      freeInheritance: [Stat.HP, Stat.Attack],
      itemProtected: [],
      rng: [],
    };

    const result = calculateMissingIVs(
      [Stat.HP, Stat.Attack],
      [Stat.HP, Stat.Attack],
      overlap
    );

    expect(result).toBe(0);
  });

  it('debería contar IVs que no están ni en actuales ni en overlap', () => {
    const overlap = {
      freeInheritance: [Stat.HP],
      itemProtected: [],
      rng: [],
    };

    const result = calculateMissingIVs(
      [Stat.HP],
      [Stat.HP, Stat.Attack, Stat.Defense],
      overlap
    );

    expect(result).toBe(2); // Attack y Defense faltan
  });
});

describe('isValidOverlap', () => {
  it('debería retornar true cuando hay 2 o menos items', () => {
    const overlap = {
      freeInheritance: [],
      itemProtected: [
        { stat: Stat.HP, byParent: 'father' as const },
        { stat: Stat.Attack, byParent: 'mother' as const },
      ],
      rng: [],
    };

    expect(isValidOverlap(overlap)).toBe(true);
  });

  it('debería retornar false cuando hay más de 2 items', () => {
    const overlap = {
      freeInheritance: [],
      itemProtected: [
        { stat: Stat.HP, byParent: 'father' as const },
        { stat: Stat.Attack, byParent: 'mother' as const },
        { stat: Stat.Defense, byParent: 'father' as const },
      ],
      rng: [],
    };

    expect(isValidOverlap(overlap)).toBe(false);
  });
});

describe('calculateOverlapCost', () => {
  it('debería calcular 0 cuando no hay items', () => {
    const overlap = {
      freeInheritance: [Stat.HP],
      itemProtected: [],
      rng: [],
    };

    expect(calculateOverlapCost(overlap)).toBe(0);
  });

  it('debería calcular 500 por cada item', () => {
    const overlap = {
      freeInheritance: [],
      itemProtected: [
        { stat: Stat.HP, byParent: 'father' as const },
        { stat: Stat.Attack, byParent: 'mother' as const },
      ],
      rng: [],
    };

    expect(calculateOverlapCost(overlap)).toBe(1000);
  });
});
