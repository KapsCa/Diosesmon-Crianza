/**
 * Grupos Huevo oficiales de Pokémon para crianza determinista en Diosesmon.
 * Utiliza const object compatible con erasableSyntaxOnly.
 */
export const EggGroup = {
  Monster: 'Monster',
  Water1: 'Water 1',
  Bug: 'Bug',
  Flying: 'Flying',
  Field: 'Field',
  Fairy: 'Fairy',
  Grass: 'Grass',
  HumanLike: 'Human-Like',
  Water3: 'Water 3',
  Mineral: 'Mineral',
  Amorphous: 'Amorphous',
  Water2: 'Water 2',
  Ditto: 'Ditto',
  Dragon: 'Dragon',
  Undiscovered: 'Undiscovered',
} as const;

export type EggGroup = (typeof EggGroup)[keyof typeof EggGroup];

/**
 * Nombres en español de los grupos huevo.
 */
export const EGG_GROUP_NAMES_ES: Record<EggGroup, string> = {
  [EggGroup.Monster]: 'Monstruo',
  [EggGroup.Water1]: 'Agua 1',
  [EggGroup.Bug]: 'Bicho',
  [EggGroup.Flying]: 'Volador',
  [EggGroup.Field]: 'Campo',
  [EggGroup.Fairy]: 'Hada',
  [EggGroup.Grass]: 'Planta',
  [EggGroup.HumanLike]: 'Humanoide',
  [EggGroup.Water3]: 'Agua 3',
  [EggGroup.Mineral]: 'Mineral',
  [EggGroup.Amorphous]: 'Amorfo',
  [EggGroup.Water2]: 'Agua 2',
  [EggGroup.Ditto]: 'Ditto',
  [EggGroup.Dragon]: 'Dragón',
  [EggGroup.Undiscovered]: 'Desconocido (No cría)',
};
