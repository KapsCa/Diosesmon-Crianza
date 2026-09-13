import { describe, it, expect } from 'vitest';
import { getSpeciesRoleProfile } from '../../../src/domain/services/competitiveRoleSuggester';
import { findSpeciesById, findSpeciesByName } from '../../../src/domain/data/speciesData';

describe('competitiveRoleSuggester', () => {
  it('should suggest 6x31 and special attack focus for Riolu (#447)', () => {
    const riolu = findSpeciesById(447)!;
    expect(riolu).toBeDefined();

    const profile = getSpeciesRoleProfile(riolu);
    expect(profile).toBeDefined();
    expect(profile.speciesName).toBe('Riolu');

    // Debe sugerir objetivo 6x31 predeterminado para Mega Lucario
    expect(profile.defaultSuggestionId).toBe('riolu_6x31');
    const defaultSugg = profile.suggestions.find((s) => s.id === profile.defaultSuggestionId);
    expect(defaultSugg).toBeDefined();
    expect(defaultSugg?.ivsSummary).toContain('6x31');
    expect(defaultSugg?.config.attack).toBe(31);
    expect(defaultSugg?.config.spatk).toBe(31);

    // Debe incluir sugerencia de enfoque en Atk. Especial
    const specialSugg = profile.suggestions.find((s) => s.id === 'riolu_5x31_spatk');
    expect(specialSugg).toBeDefined();
    expect(specialSugg?.config.spatk).toBe(31);
    expect(specialSugg?.config.attack).toBe(0); // 0 Atk para mitigar Foul Play

    // Debe incluir sugerencia física
    const physicalSugg = profile.suggestions.find((s) => s.id === 'riolu_5x31_physical');
    expect(physicalSugg).toBeDefined();
    expect(physicalSugg?.config.attack).toBe(31);
  });

  it('should suggest 5x31 with special attack focus for Feebas (#349)', () => {
    const feebas = findSpeciesById(349)!;
    expect(feebas).toBeDefined();

    const profile = getSpeciesRoleProfile(feebas);
    expect(profile).toBeDefined();
    expect(profile.defaultSuggestionId).toBe('feebas_5x31_spatk');

    const defaultSugg = profile.suggestions.find((s) => s.id === profile.defaultSuggestionId);
    expect(defaultSugg).toBeDefined();
    expect(defaultSugg?.config.spatk).toBe(31);
    expect(defaultSugg?.config.attack).toBe(0); // 0 Atk para mitigar Foul Play
    expect(defaultSugg?.config.nature).toBe('Modest');
  });

  it('should suggest physical and special options for Raichu (#26)', () => {
    const raichu = findSpeciesByName('Raichu')!;
    expect(raichu).toBeDefined();

    const profile = getSpeciesRoleProfile(raichu);
    expect(profile).toBeDefined();

    const suggIds = profile.suggestions.map((s) => s.id);
    expect(suggIds).toContain('raichu_5x31_spatk');
    expect(suggIds).toContain('raichu_5x31_phys');
    expect(suggIds).toContain('raichu_6x31');
  });

  it('should correctly handle special attackers like Gengar (#94)', () => {
    const gengar = findSpeciesById(94)!;
    expect(gengar).toBeDefined();

    const profile = getSpeciesRoleProfile(gengar);
    const defaultSugg = profile.suggestions.find((s) => s.id === profile.defaultSuggestionId);
    expect(defaultSugg?.config.spatk).toBe(31);
    expect(defaultSugg?.config.attack).toBe(0);
  });

  it('should correctly handle physical attackers like Machamp (#68)', () => {
    const machamp = findSpeciesById(68)!;
    expect(machamp).toBeDefined();

    const profile = getSpeciesRoleProfile(machamp);
    const defaultSugg = profile.suggestions.find((s) => s.id === profile.defaultSuggestionId);
    expect(defaultSugg?.config.attack).toBe(31);
    expect(defaultSugg?.config.spatk).toBe(-1); // No prioritario
  });
});
