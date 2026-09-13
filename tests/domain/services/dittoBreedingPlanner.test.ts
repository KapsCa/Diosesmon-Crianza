import { describe, it, expect } from 'vitest';
import {
  planDittoBreedingRoute,
  type UserDitto,
} from '../../../src/domain/services/dittoBreedingPlanner';
import { Stat, createEmptyIVs, type IVSpread } from '../../../src/domain/types/stat';
import { ItemType } from '../../../src/domain/types/items';

// Cost model verified in src/domain/services/dittoBreedingPlanner.ts:
// every equipped Power item costs 500. Step 1 equips only the Ditto band (500);
// each loop step equips a species band + a Ditto band (500 + 500 = 1000).
const BAND_COST = 500;

function ivsFrom(spec: Partial<Record<Stat, number>>): IVSpread {
  return { ...createEmptyIVs(), ...spec };
}

function ditto(id: string, name: string, spec: Partial<Record<Stat, number>>): UserDitto {
  return { id, name, ivs: ivsFrom(spec) };
}

const TARGET = { id: 25, name: 'Pikachu' };
const TARGET_STATS = [Stat.HP, Stat.Attack, Stat.Defense];
const TRIPLE_DITTO = [ditto('d1', 'Ditto 3x31', { hp: 31, attack: 31, defense: 31 })];

function planTripleDitto() {
  return planDittoBreedingRoute(TARGET, TARGET_STATS, TRIPLE_DITTO);
}

describe('planDittoBreedingRoute', () => {
  it('builds a deterministic 3-generation plan for a fresh specimen with one 3x31 Ditto', () => {
    const plan = planTripleDitto();

    expect(plan.success).toBe(true);
    expect(plan.missingStats).toEqual([]);
    expect(plan.targetSpecies).toEqual(TARGET);
    expect(plan.targetIVs).toEqual(TARGET_STATS);
    expect(plan.totalSteps).toBe(3);
    expect(plan.steps.map((s) => s.stepNumber)).toEqual([1, 2, 3]);
    expect(plan.steps.map((s) => s.generation)).toEqual([1, 2, 3]);
    // each generation adds exactly one new 31 on top of the previous IVs
    expect(plan.steps.map((s) => s.offspring.ivs)).toEqual([
      ivsFrom({ hp: 31 }),
      ivsFrom({ hp: 31, attack: 31 }),
      ivsFrom({ hp: 31, attack: 31, defense: 31 }),
    ]);
    expect(plan.steps.map((s) => s.offspring.perfectCount)).toEqual([1, 2, 3]);
    // first cross: untouched species parent without band, Ditto holds the HP band
    expect(plan.steps[0].parentSpecies.ivs).toEqual(createEmptyIVs());
    expect(plan.steps[0].parentSpecies.heldItem).toBeNull();
    expect(plan.steps[0].parentDitto.heldItem).toMatchObject({
      type: ItemType.PowerWeight,
      stat: Stat.HP,
      itemKey: 'power_weight',
    });
    // gender alternates each generation starting from 'female'
    expect(plan.steps.map((s) => s.offspring.gender)).toEqual(['male', 'female', 'male']);
  });

  it('allocates Herencia Fija for stats both parents hold that no band protects', () => {
    const plan = planTripleDitto();
    const last = plan.steps[2];

    // In step 3 the Ditto band protects Defense and the species band protects HP,
    // so Attack (31 in both parents) must be fixed by herencia fija.
    expect(last.statInheritance.filter((i) => i.method === 'band_ditto').map((i) => i.stat)).toEqual([
      Stat.Defense,
    ]);
    expect(
      last.statInheritance.filter((i) => i.method === 'band_species').map((i) => i.stat)
    ).toEqual([Stat.HP]);
    expect(last.parentSpecies.heldItem?.stat).toBe(Stat.HP);
    expect(last.parentDitto.heldItem?.stat).toBe(Stat.Defense);

    const fija = last.statInheritance.filter((i) => i.method === 'herencia_fija');
    expect(fija.map((i) => i.stat)).toEqual([Stat.Attack]);
    expect(fija[0].description).toContain('Ambos padres');
    expect(plan.herenciaFijaOccurrences).toBe(1);
    // steps 1 and 2 have no fixed inheritance: each protected stat uses a band
    expect(
      plan.steps
        .slice(0, 2)
        .every((s) => s.statInheritance.every((i) => i.method !== 'herencia_fija'))
    ).toBe(true);
  });

  it('accounts 500 per power item: 500 in step 1 and 1000 in each two-band step', () => {
    const plan = planTripleDitto();

    expect(plan.steps.map((s) => s.cost)).toEqual([BAND_COST, BAND_COST * 2, BAND_COST * 2]);
    expect(plan.totalCost).toBe(BAND_COST * 5);
    // 1 band in step 1 (Ditto only) + 2 bands in each of steps 2 and 3
    expect(plan.powerItemsCount).toBe(5);
    // band type follows STAT_METADATA: HP->PowerWeight, Attack->PowerBracer, Defense->PowerBelt
    expect(plan.steps.map((s) => s.parentDitto.heldItem?.type)).toEqual([
      ItemType.PowerWeight,
      ItemType.PowerBracer,
      ItemType.PowerBelt,
    ]);
    expect(plan.steps.slice(1).map((s) => s.parentSpecies.heldItem?.type)).toEqual([
      ItemType.PowerWeight,
      ItemType.PowerWeight,
    ]);
    // the single Ditto is reused in every step
    expect(plan.dittosUsed).toEqual([{ id: 'd1', name: 'Ditto 3x31', timesUsed: 3 }]);
  });

  it('fails with missingStats when no Ditto covers a requested stat', () => {
    const plan = planDittoBreedingRoute(TARGET, [Stat.HP, Stat.Speed], [
      ditto('d-hp', 'Ditto HP', { hp: 31 }),
    ]);

    expect(plan.success).toBe(false);
    expect(plan.missingStats).toEqual([Stat.Speed]);
    expect(plan.steps).toEqual([]);
    expect(plan.totalSteps).toBe(0);
    expect(plan.totalCost).toBe(0);
    expect(plan.powerItemsCount).toBe(0);
    expect(plan.dittosUsed).toEqual([]);
    expect(plan.warningMessage).toContain('Vel');
  });

  it('returns an empty free plan when the base specimen already has every target stat', () => {
    const plan = planDittoBreedingRoute(
      TARGET,
      [Stat.HP],
      [ditto('d1', 'Ditto HP', { hp: 31 })],
      { ivs: ivsFrom({ hp: 31 }), gender: 'female' }
    );

    expect(plan.success).toBe(true);
    expect(plan.steps).toEqual([]);
    expect(plan.totalSteps).toBe(0);
    expect(plan.totalCost).toBe(0);
    expect(plan.herenciaFijaOccurrences).toBe(0);
  });
});
