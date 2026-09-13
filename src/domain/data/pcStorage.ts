export interface StoredPokemon {
  id: string;
  speciesName: string;
  speciesId: number;
  gender: 'male' | 'female' | 'genderless';
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    spatk: number;
    spdef: number;
    speed: number;
  };
  notes?: string;
}

export const DEFAULT_SPECIMENS: StoredPokemon[] = [
  {
    id: 'specimen-1',
    speciesName: 'Ditto',
    speciesId: 132,
    gender: 'genderless',
    ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 15, speed: 20 },
    notes: 'Ditto 4x31 silvestre capturado en bioma llanura',
  },
  {
    id: 'specimen-2',
    speciesName: 'Magikarp',
    speciesId: 129,
    gender: 'male',
    ivs: { hp: 12, attack: 31, defense: 20, spatk: 5, spdef: 10, speed: 31 },
    notes: 'Padre Grupo Dragón / Agua 2 con 31 Atk y 31 Spe',
  },
  {
    id: 'specimen-3',
    speciesName: 'Gible',
    speciesId: 443,
    gender: 'female',
    ivs: { hp: 31, attack: 14, defense: 31, spatk: 10, spdef: 25, speed: 18 },
    notes: 'Madre base Grupo Monstruo / Dragón',
  },
];

export function getStoredSpecimens(): StoredPokemon[] {
  try {
    const saved = localStorage.getItem('diosesmon_pc_specimens');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Could not read pc specimens from storage', e);
  }
  return DEFAULT_SPECIMENS;
}
