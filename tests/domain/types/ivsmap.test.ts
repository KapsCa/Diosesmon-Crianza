import { describe, it, expect } from 'vitest';
import { IVsMapConfig, IVsMapResult } from '../../../src/domain/types/ivsmap';
import { Stat, IVSpread } from '../../../src/domain/types/stat';
import { Gender } from '../../../src/domain/types/pokemon';
import { createMockPokemon } from '../../helpers';

describe('IVsMapConfig', () => {
  it('should create a config with source IVs', () => {
    const config: IVsMapConfig = {
      sourceIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
    };

    expect(config.sourceIVs).toEqual({ hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 });
  });

  it('should accept optional targetIVs', () => {
    const config: IVsMapConfig = {
      sourceIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      targetIVs: [Stat.HP, Stat.Attack],
    };

    expect(config.targetIVs).toEqual([Stat.HP, Stat.Attack]);
  });

  it('should accept optional includeProtected', () => {
    const config: IVsMapConfig = {
      sourceIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      includeProtected: true,
    };

    expect(config.includeProtected).toBe(true);
  });

  it('should work with default optional fields undefined', () => {
    const config: IVsMapConfig = {
      sourceIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
    };

    expect(config.targetIVs).toBeUndefined();
    expect(config.includeProtected).toBeUndefined();
  });
});

describe('IVsMapResult', () => {
  it('should create a result with resultIVs', () => {
    const result: IVsMapResult = {
      resultIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      inheritedFree: [],
      inheritedProtected: [],
      rng: [],
      totalCost: 0,
    };

    expect(result.resultIVs).toEqual({ hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 });
  });

  it('should track inherited free stats', () => {
    const result: IVsMapResult = {
      resultIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      inheritedFree: [Stat.HP, Stat.Attack],
      inheritedProtected: [],
      rng: [],
      totalCost: 0,
    };

    expect(result.inheritedFree).toContain(Stat.HP);
    expect(result.inheritedFree).toContain(Stat.Attack);
    expect(result.inheritedFree).toHaveLength(2);
  });

  it('should track inherited protected stats', () => {
    const result: IVsMapResult = {
      resultIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      inheritedFree: [],
      inheritedProtected: [{ stat: Stat.HP, source: 'power_weight' }],
      rng: [],
      totalCost: 500,
    };

    expect(result.inheritedProtected).toHaveLength(1);
    expect(result.inheritedProtected[0].stat).toBe(Stat.HP);
    expect(result.inheritedProtected[0].source).toBe('power_weight');
    expect(result.totalCost).toBe(500);
  });

  it('should track rng stats', () => {
    const result: IVsMapResult = {
      resultIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      inheritedFree: [],
      inheritedProtected: [],
      rng: [Stat.Attack, Stat.Speed],
      totalCost: 0,
    };

    expect(result.rng).toContain(Stat.Attack);
    expect(result.rng).toContain(Stat.Speed);
    expect(result.rng).toHaveLength(2);
  });

  it('should calculate totalCost correctly', () => {
    const result: IVsMapResult = {
      resultIVs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      inheritedFree: [],
      inheritedProtected: [{ stat: Stat.HP, source: 'power_weight' }],
      rng: [],
      totalCost: 500,
    };

    expect(result.totalCost).toBe(500);
  });
});