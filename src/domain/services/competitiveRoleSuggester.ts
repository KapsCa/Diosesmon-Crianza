import type { Species } from '../types/pokemon';
import type { IVTargetConfig } from '../../adapters/ui/components/molecules/IVProfileBuilder';

export interface RoleSuggestion {
  id: string;
  label: string;
  badge?: string;
  isRecommended?: boolean;
  ivsSummary: string; // e.g. "6x31", "5x31 Especial"
  roleDescription: string;
  config: IVTargetConfig;
}

export interface SpeciesRoleProfile {
  speciesId: number;
  speciesName: string;
  headlineRole: string; // e.g. "Atacante Mixto / Mega Lucario"
  explanation: string;
  megaInfo?: {
    megaName: string;
    details: string;
  };
  defaultSuggestionId: string;
  suggestions: RoleSuggestion[];
}

/**
 * Mapeo de pre-evoluciones a su evolución final o forma más competitiva
 * para evaluar correctamente el rol competitivo (ej: Riolu -> Lucario, Feebas -> Milotic)
 */
interface FinalEvoMeta {
  finalName: string;
  megaName?: string;
  megaSpecialty?: 'special' | 'physical' | 'mixed';
  preferredRole?: 'special' | 'physical' | 'mixed' | 'tank_special' | 'tank_physical';
  specialNote?: string;
}

const EVOLUTION_META_MAP: Record<number, FinalEvoMeta> = {
  // Riolu -> Lucario / Mega Lucario
  447: {
    finalName: 'Lucario',
    megaName: 'Mega Lucario',
    megaSpecialty: 'special',
    preferredRole: 'mixed',
    specialNote: 'Riolu tiene mayor Atk base (70 vs 35), pero para Mega Lucario (140 SpA / 145 Atk con Adaptabilidad) se recomienda un objetivo 6x31 o enfoque competitivo a Atk. Especial (Esfera Aural / Nasty Plot).',
  },
  448: {
    finalName: 'Lucario',
    megaName: 'Mega Lucario',
    megaSpecialty: 'special',
    preferredRole: 'mixed',
    specialNote: 'Mega Lucario destaca tanto con Maquinación + Atk Especial como con Danza Espada. Recomendamos 6x31 para versatilidad total o 5x31 con enfoque en Atk Especial.',
  },

  // Feebas -> Milotic
  349: {
    finalName: 'Milotic',
    preferredRole: 'special',
    specialNote: 'Feebas evoluciona a Milotic (100 SpA / 125 SpD). El estándar competitivo es 5x31 con enfoque en Atk. Especial y 0 en Ataque Físico para minimizar daño de Confusión y Juego Sucio (Foul Play).',
  },
  350: {
    finalName: 'Milotic',
    preferredRole: 'special',
    specialNote: 'Milotic es un baluarte defensivo especial. Sugerido 5x31 con 0 Atk y naturaleza Modesta u Osada/Serena.',
  },

  // Pichu / Pikachu / Raichu
  172: {
    finalName: 'Raichu',
    preferredRole: 'mixed',
    specialNote: 'Raichu tiene stats balanceados (90 Atk / 90 SpA / 110 Spe). Puede desempeñarse con enfoque Físico (Placaje Eléctrico), Especial (Rayo / Maquinación) o 6x31 Mixto.',
  },
  25: {
    finalName: 'Raichu',
    preferredRole: 'mixed',
    specialNote: 'Pikachu/Raichu son atacantes mixtos viables. Sugerimos alternar entre 5x31 Especial, 5x31 Físico o 6x31 Mixto.',
  },
  26: {
    finalName: 'Raichu',
    preferredRole: 'mixed',
    specialNote: 'Raichu cuenta con 90 Atk y 90 SpA. Puedes optar por 5x31 Especial (Maquinación), 5x31 Físico (Placaje Eléctrico) o 6x31 Mixto.',
  },

  // Charmander / Charmeleon / Charizard
  4: {
    finalName: 'Charizard',
    megaName: 'Mega Charizard X / Y',
    megaSpecialty: 'mixed',
    preferredRole: 'special',
    specialNote: 'Charizard posee dos megas: Mega Charizard Y (enfoque especial demoledor con Sequía) y Mega Charizard X (físico con Garra Dura).',
  },
  5: { finalName: 'Charizard', megaName: 'Mega Charizard X / Y', megaSpecialty: 'mixed', preferredRole: 'special' },
  6: {
    finalName: 'Charizard',
    megaName: 'Mega Charizard X / Y',
    megaSpecialty: 'mixed',
    preferredRole: 'special',
    specialNote: 'Mega Charizard Y prefiere 5x31 Especial (0 Atk), mientras que Mega Charizard X prefiere 5x31 Físico o 6x31 Mixto.',
  },

  // Gastly / Haunter / Gengar
  92: { finalName: 'Gengar', megaName: 'Mega Gengar', megaSpecialty: 'special', preferredRole: 'special', specialNote: 'Línea de atacante especial puro (130 SpA base, 170 en Mega). Se recomienda 5x31 Especial con 0 Atk.' },
  93: { finalName: 'Gengar', megaName: 'Mega Gengar', megaSpecialty: 'special', preferredRole: 'special' },
  94: { finalName: 'Gengar', megaName: 'Mega Gengar', megaSpecialty: 'special', preferredRole: 'special', specialNote: 'Atacante especial de máxima velocidad. 5x31 con 0 Atk y naturaleza Miedosa (Timid).' },

  // Abra / Kadabra / Alakazam
  63: { finalName: 'Alakazam', megaName: 'Mega Alakazam', megaSpecialty: 'special', preferredRole: 'special' },
  64: { finalName: 'Alakazam', megaName: 'Mega Alakazam', megaSpecialty: 'special', preferredRole: 'special' },
  65: { finalName: 'Alakazam', megaName: 'Mega Alakazam', megaSpecialty: 'special', preferredRole: 'special', specialNote: 'Mega Alakazam (175 SpA). Sugerido 5x31 con 0 en Ataque y naturaleza Miedosa.' },

  // Machop / Machoke / Machamp
  66: { finalName: 'Machamp', preferredRole: 'physical', specialNote: 'Atacante físico contundente (130 Atk). Sugerido 5x31 Físico con naturaleza Firme.' },
  67: { finalName: 'Machamp', preferredRole: 'physical' },
  68: { finalName: 'Machamp', preferredRole: 'physical' },

  // Magikarp / Gyarados
  129: { finalName: 'Gyarados', megaName: 'Mega Gyarados', megaSpecialty: 'physical', preferredRole: 'physical', specialNote: 'Gyarados y Mega Gyarados son atacantes físicos (125 / 155 Atk). Sugerido 5x31 Físico (Alegre o Firme).' },
  130: { finalName: 'Gyarados', megaName: 'Mega Gyarados', megaSpecialty: 'physical', preferredRole: 'physical' },

  // Ralts / Kirlia / Gardevoir / Gallade
  280: {
    finalName: 'Gardevoir / Gallade',
    megaName: 'Mega Gardevoir / Mega Gallade',
    megaSpecialty: 'mixed',
    preferredRole: 'special',
    specialNote: 'Ralts puede evolucionar a Gardevoir (Especial) o Gallade (Físico). Si buscas Gardevoir, elige 5x31 Especial; si buscas Gallade, 5x31 Físico.',
  },
  281: { finalName: 'Gardevoir / Gallade', megaName: 'Mega Gardevoir / Mega Gallade', preferredRole: 'special' },
  282: { finalName: 'Gardevoir', megaName: 'Mega Gardevoir', megaSpecialty: 'special', preferredRole: 'special' },
  475: { finalName: 'Gallade', megaName: 'Mega Gallade', megaSpecialty: 'physical', preferredRole: 'physical' },

  // Bagon / Shelgon / Salamence
  371: { finalName: 'Salamence', megaName: 'Mega Salamence', megaSpecialty: 'mixed', preferredRole: 'mixed', specialNote: 'Salamence y Mega Salamence pueden ser Físicos (Danza Dragón), Especiales (Voz Cautivadora) o 6x31 Mixtos.' },
  372: { finalName: 'Salamence', megaName: 'Mega Salamence', preferredRole: 'mixed' },
  373: { finalName: 'Salamence', megaName: 'Mega Salamence', preferredRole: 'mixed' },

  // Larvitar / Pupitar / Tyranitar
  246: { finalName: 'Tyranitar', megaName: 'Mega Tyranitar', preferredRole: 'physical', specialNote: 'Tyranitar es principalmente físico (134 Atk), pero a menudo usa Llamarada/Rayo Hielo en sets mixtos competitivos.' },
  247: { finalName: 'Tyranitar', megaName: 'Mega Tyranitar', preferredRole: 'physical' },
  248: { finalName: 'Tyranitar', megaName: 'Mega Tyranitar', preferredRole: 'physical' },

  // Gible / Gabite / Garchomp
  443: { finalName: 'Garchomp', megaName: 'Mega Garchomp', preferredRole: 'physical', specialNote: 'Garchomp es una amenaza física (130 Atk / 102 Spe). En Mega Garchomp puede llevarse mixto con Llamarada.' },
  444: { finalName: 'Garchomp', megaName: 'Mega Garchomp', preferredRole: 'physical' },
  445: { finalName: 'Garchomp', megaName: 'Mega Garchomp', preferredRole: 'physical' },

  // Beldum / Metang / Metagross
  374: { finalName: 'Metagross', megaName: 'Mega Metagross', preferredRole: 'physical', specialNote: 'Metagross y Mega Metagross (Garra Dura) son atacantes físicos de primer nivel.' },
  375: { finalName: 'Metagross', megaName: 'Mega Metagross', preferredRole: 'physical' },
  376: { finalName: 'Metagross', megaName: 'Mega Metagross', preferredRole: 'physical' },

  // Treecko / Grovyle / Sceptile
  252: { finalName: 'Sceptile', megaName: 'Mega Sceptile', megaSpecialty: 'special', preferredRole: 'special', specialNote: 'Mega Sceptile (145 SpA / 145 Spe). Sugerido 5x31 Especial o 6x31 Mixto.' },
  254: { finalName: 'Sceptile', megaName: 'Mega Sceptile', megaSpecialty: 'special', preferredRole: 'special' },

  // Torchic / Combusken / Blaziken
  255: { finalName: 'Blaziken', megaName: 'Mega Blaziken', preferredRole: 'physical', specialNote: 'Mega Blaziken (160 Atk / 130 SpA). Puede ser 5x31 Físico o 6x31 Mixto.' },
  257: { finalName: 'Blaziken', megaName: 'Mega Blaziken', preferredRole: 'physical' },

  // Mudkip / Marshtomp / Swampert
  258: { finalName: 'Swampert', megaName: 'Mega Swampert', preferredRole: 'physical', specialNote: 'Mega Swampert con Nado Rápido es un demoledor atacante físico bajo lluvia (150 Atk).' },
  260: { finalName: 'Swampert', megaName: 'Mega Swampert', preferredRole: 'physical' },

  // Chansey / Blissey
  113: { finalName: 'Chansey / Blissey', preferredRole: 'tank_special', specialNote: 'Tanque especial legendario. Se recomienda 5x31 con 0 Atk y naturaleza Osada (Bold).' },
  242: { finalName: 'Blissey', preferredRole: 'tank_special', specialNote: 'Tanque especial con 0 Atk para resistir Foul Play. Naturaleza Osada (Bold).' },

  // Eevee
  133: {
    finalName: 'Eeveeluciones',
    preferredRole: 'special',
    specialNote: 'Eevee tiene múltiples evoluciones: Especiales (Espeon, Jolteon, Vaporeon, Glaceon, Sylveon) y Físicas (Flareon, Leafeon, Umbreon).',
  },
};

/**
 * Obtiene la configuración de IVs y las recomendaciones competitivas
 * para cualquier especie dada.
 */
export function getSpeciesRoleProfile(species: Species): SpeciesRoleProfile {
  const meta = EVOLUTION_META_MAP[species.id];
  const stats = species.baseStats || { hp: 50, attack: 50, defense: 50, spatk: 50, spdef: 50, speed: 50 };

  const isRioluFamily = species.id === 447 || species.id === 448;
  const isFeebasFamily = species.id === 349 || species.id === 350;
  const isRaichuFamily = species.id === 25 || species.id === 26 || species.id === 172;

  // CASO ESPECIAL 1: Riolu / Lucario (Mencionado explícitamente en el prompt del usuario)
  if (isRioluFamily) {
    const isRiolu = species.id === 447;
    return {
      speciesId: species.id,
      speciesName: species.name,
      headlineRole: isRiolu ? 'Mega Lucario Ready (Mixto / Atk. Especial)' : 'Mega Lucario (Mixto / Especial)',
      explanation: isRiolu
        ? 'Riolu tiene mayor Ataque físico base (70 vs 35), pero para su evolución Mega Lucario (140 SpAtk / 145 Atk) se recomienda un objetivo 6x31 o enfoque a Atk. Especial.'
        : 'Lucario y Mega Lucario destacan con Atk. Especial (Esfera Aural / Foco Resplandor) y como atacante mixto. Te sugerimos 6x31 o 5x31 Especial.',
      megaInfo: {
        megaName: 'Mega Lucario',
        details: 'Base Stats Mega: 145 Atk / 140 SpAtk / 112 Spe (Habilidad Adaptabilidad).',
      },
      defaultSuggestionId: 'riolu_6x31',
      suggestions: [
        {
          id: 'riolu_6x31',
          label: '6x31 Absoluto (Sugerido para Mega)',
          badge: 'Sugerido 6x31',
          isRecommended: true,
          ivsSummary: '6x31',
          roleDescription: 'Perfecto para Mega Lucario mixto, garantizando daño máximo tanto físico como especial.',
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature: 'Timid',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'riolu_5x31_spatk',
          label: '5x31 Enfoque Atk. Especial',
          badge: 'Recomendado Atk Esp.',
          isRecommended: false,
          ivsSummary: '5x31 SpAtk (0 Atk)',
          roleDescription: 'Enfoque puro en Atk Especial (Maquinación, Esfera Aural, Onda Vacío). Minimiza daño de confusión/Foul Play.',
          config: {
            hp: 31,
            attack: 0,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature: 'Timid',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'riolu_5x31_physical',
          label: '5x31 Enfoque Atk. Físico',
          badge: 'Físico',
          isRecommended: false,
          ivsSummary: '5x31 Físico (-SpA)',
          roleDescription: 'Para sets clásicos de Danza Espada, A Bocajarro, Puño Meteoro y Velocidad Extrema.',
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: -1,
            spdef: 31,
            speed: 31,
            nature: 'Jolly',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'riolu_trick_room',
          label: 'Trick Room (0 Vel • Audaz)',
          badge: 'Espacio Raro',
          isRecommended: false,
          ivsSummary: '0 Vel (Audaz)',
          roleDescription: '0 IVs en Velocidad y naturaleza Audaz (+Atk, -Vel). El último IV (SpA) es irrelevante.',
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: -1,
            spdef: 31,
            speed: 0,
            nature: 'Brave',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
      ],
    };
  }

  // CASO ESPECIAL 2: Feebas / Milotic (Mencionado explícitamente en el prompt)
  if (isFeebasFamily) {
    return {
      speciesId: species.id,
      speciesName: species.name,
      headlineRole: 'Atacante Especial & Tanque Defensivo (Milotic)',
      explanation: 'Feebas evoluciona al formidable Milotic (100 SpAtk / 125 SpDef). La configuración óptima recomendada es 5x31 con enfoque en Atk. Especial.',
      defaultSuggestionId: 'feebas_5x31_spatk',
      suggestions: [
        {
          id: 'feebas_5x31_spatk',
          label: '5x31 Enfoque Atk. Especial (Recomendado)',
          badge: 'Recomendado 5x31',
          isRecommended: true,
          ivsSummary: '5x31 SpAtk (0 Atk)',
          roleDescription: 'Milotic ofensivo/especial con Escaldar, Rayo Hielo y Recuperación. 0 IVs en Ataque para mitigar Foul Play.',
          config: {
            hp: 31,
            attack: 0,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature: 'Modest',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'feebas_tank_spdef',
          label: '5x31 Tanque Defensivo Especial',
          badge: 'Tanque SpD',
          isRecommended: false,
          ivsSummary: '5x31 SpD (Serena)',
          roleDescription: 'Enfocado en resistir atacantes especiales con naturaleza Serena (+SpDef, -Atk).',
          config: {
            hp: 31,
            attack: 0,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature: 'Calm',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'feebas_6x31',
          label: '6x31 Absoluto',
          badge: 'Absoluto',
          isRecommended: false,
          ivsSummary: '6x31',
          roleDescription: 'Máximos stats en los 6 atributos.',
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature: 'Modest',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
      ],
    };
  }

  // CASO ESPECIAL 3: Raichu / Pikachu (Mencionado en el prompt como ejemplo de rol versátil)
  if (isRaichuFamily) {
    return {
      speciesId: species.id,
      speciesName: species.name,
      headlineRole: 'Atacante Mixto Versátil (Físico o Especial)',
      explanation: 'Raichu posee un balance idéntico de 90 Atk y 90 SpAtk con 110 de Velocidad. Puede criarse con enfoque Físico, Especial o 6x31 Mixto.',
      defaultSuggestionId: 'raichu_5x31_spatk',
      suggestions: [
        {
          id: 'raichu_5x31_spatk',
          label: '5x31 Enfoque Atk. Especial',
          badge: 'Sugerido Especial',
          isRecommended: true,
          ivsSummary: '5x31 SpAtk (0 Atk)',
          roleDescription: 'Aprovecha Rayo, Onda Certera y Maquinación con máxima velocidad (Miedosa).',
          config: {
            hp: 31,
            attack: 0,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature: 'Timid',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'raichu_5x31_phys',
          label: '5x31 Enfoque Atk. Físico',
          badge: 'Físico',
          isRecommended: false,
          ivsSummary: '5x31 Físico (-SpA)',
          roleDescription: 'Para builds de Placaje Eléctrico (Volt Tackle), Sorpresa y Demolición con naturaleza Alegre.',
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: -1,
            spdef: 31,
            speed: 31,
            nature: 'Jolly',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'raichu_6x31',
          label: '6x31 Mixto Absoluto',
          badge: 'Mixto 6x31',
          isRecommended: false,
          ivsSummary: '6x31 Mixto',
          roleDescription: 'Permite combinar Placaje Eléctrico con ataques especiales sorpresa sin penalizaciones.',
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature: 'Hasty',
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
      ],
    };
  }

  // CASO GENERAL: Basado en metadatos o análisis algorítmico de Stats Base
  const preferred = meta?.preferredRole;
  const hasMega = Boolean(meta?.megaName);
  const diff = stats.spatk - stats.attack;

  const isSpecial = preferred === 'special' || (diff >= 15 && preferred !== 'physical');
  const isPhysical = preferred === 'physical' || (diff <= -15 && preferred !== 'special');

  if (isSpecial) {
    const fast = stats.speed >= 80;
    const nature = fast ? 'Timid' : 'Modest';
    return {
      speciesId: species.id,
      speciesName: species.name,
      headlineRole: meta?.megaName ? `Atacante Especial (${meta.megaName})` : 'Atacante Especial Predominante',
      explanation: meta?.specialNote || `${species.name} tiene un Ataque Especial superior (${stats.spatk} SpA vs ${stats.attack} Atk). El estándar competitivo es 5x31 Especial con 0 en Ataque.`,
      megaInfo: meta?.megaName ? { megaName: meta.megaName, details: `Compatible con evolución/mega ${meta.megaName}.` } : undefined,
      defaultSuggestionId: 'gen_5x31_spatk',
      suggestions: [
        {
          id: 'gen_5x31_spatk',
          label: '5x31 Enfoque Atk. Especial',
          badge: 'Recomendado',
          isRecommended: true,
          ivsSummary: '5x31 SpAtk (0 Atk)',
          roleDescription: `Optimizado para ataques especiales. 0 IVs en Ataque reducen daño de Foul Play. Naturaleza ${nature === 'Timid' ? 'Miedosa' : 'Modesta'}.`,
          config: {
            hp: 31,
            attack: 0,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature,
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'gen_6x31',
          label: '6x31 Absoluto',
          badge: 'Absoluto',
          isRecommended: false,
          ivsSummary: '6x31',
          roleDescription: '31 IVs en todas las estadísticas.',
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature,
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
      ],
    };
  }

  if (isPhysical) {
    const fast = stats.speed >= 80;
    const nature = fast ? 'Jolly' : 'Adamant';
    return {
      speciesId: species.id,
      speciesName: species.name,
      headlineRole: meta?.megaName ? `Atacante Físico (${meta.megaName})` : 'Atacante Físico Predominante',
      explanation: meta?.specialNote || `${species.name} cuenta con un Ataque Físico destacado (${stats.attack} Atk vs ${stats.spatk} SpA). Se sugiere 5x31 Físico.`,
      megaInfo: meta?.megaName ? { megaName: meta.megaName, details: `Compatible con evolución/mega ${meta.megaName}.` } : undefined,
      defaultSuggestionId: 'gen_5x31_phys',
      suggestions: [
        {
          id: 'gen_5x31_phys',
          label: '5x31 Enfoque Atk. Físico',
          badge: 'Recomendado',
          isRecommended: true,
          ivsSummary: '5x31 Físico (-SpA)',
          roleDescription: `Ataque físico y velocidad priorizados. Atk Especial irrelevante. Naturaleza ${nature === 'Jolly' ? 'Alegre' : 'Firme'}.`,
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: -1,
            spdef: 31,
            speed: 31,
            nature,
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
        {
          id: 'gen_6x31',
          label: '6x31 Absoluto',
          badge: 'Absoluto',
          isRecommended: false,
          ivsSummary: '6x31',
          roleDescription: 'Los 6 atributos en 31 IVs.',
          config: {
            hp: 31,
            attack: 31,
            defense: 31,
            spatk: 31,
            spdef: 31,
            speed: 31,
            nature,
            useEverstone: true,
            hasHiddenAbility: false,
          },
        },
      ],
    };
  }

  // Mixto / Versátil
  return {
    speciesId: species.id,
    speciesName: species.name,
    headlineRole: hasMega ? `Atacante Versátil / Mega (${meta?.megaName})` : 'Atacante Mixto / Versátil',
    explanation: meta?.specialNote || `${species.name} tiene stats ofensivos muy equilibrados (${stats.attack} Atk y ${stats.spatk} SpA). Puede desempeñarse con enfoque Físico, Especial o 6x31 Mixto.`,
    megaInfo: meta?.megaName ? { megaName: meta.megaName, details: `Recomendado 6x31 si planeas usarlo como ${meta.megaName}.` } : undefined,
    defaultSuggestionId: 'gen_mixed_6x31',
    suggestions: [
      {
        id: 'gen_mixed_6x31',
        label: '6x31 Mixto Absoluto',
        badge: 'Sugerido 6x31',
        isRecommended: true,
        ivsSummary: '6x31',
        roleDescription: 'Garantiza máxima efectividad para sets híbridos, megas y versatilidad total.',
        config: {
          hp: 31,
          attack: 31,
          defense: 31,
          spatk: 31,
          spdef: 31,
          speed: 31,
          nature: 'Timid',
          useEverstone: true,
          hasHiddenAbility: false,
        },
      },
      {
        id: 'gen_mixed_spatk',
        label: '5x31 Enfoque Atk. Especial',
        badge: 'Especial',
        isRecommended: false,
        ivsSummary: '5x31 SpAtk',
        roleDescription: 'Centrado en ataques especiales.',
        config: {
          hp: 31,
          attack: 0,
          defense: 31,
          spatk: 31,
          spdef: 31,
          speed: 31,
          nature: 'Modest',
          useEverstone: true,
          hasHiddenAbility: false,
        },
      },
      {
        id: 'gen_mixed_phys',
        label: '5x31 Enfoque Atk. Físico',
        badge: 'Físico',
        isRecommended: false,
        ivsSummary: '5x31 Físico',
        roleDescription: 'Centrado en ataques físicos.',
        config: {
          hp: 31,
          attack: 31,
          defense: 31,
          spatk: -1,
          spdef: 31,
          speed: 31,
          nature: 'Adamant',
          useEverstone: true,
          hasHiddenAbility: false,
        },
      },
    ],
  };
}
