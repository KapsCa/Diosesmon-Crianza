import { Stat, ALL_STATS, type IVSpread, createEmptyIVs } from '../types/stat';
import { ItemType } from '../types/items';

export interface UserDitto {
  id: string;
  name: string;
  ivs: IVSpread;
  notes?: string;
}

export interface DittoBreedingStep {
  stepNumber: number;
  generation: number;
  parentSpecies: {
    name: string;
    speciesId: number;
    gender: 'female' | 'male' | 'genderless';
    ivs: IVSpread;
    heldItem: {
      type: ItemType;
      name: string;
      stat?: Stat;
      itemKey: string;
    } | null;
  };
  parentDitto: {
    id: string;
    name: string;
    speciesId: number;
    ivs: IVSpread;
    heldItem: {
      type: ItemType;
      name: string;
      stat?: Stat;
      itemKey: string;
    } | null;
  };
  statInheritance: {
    stat: Stat;
    statName: string;
    method: 'band_species' | 'band_ditto' | 'herencia_fija';
    description: string;
  }[];
  offspring: {
    name: string;
    speciesId: number;
    gender: 'female' | 'male';
    ivs: IVSpread;
    perfectCount: number;
  };
  cost: number;
}

export interface DittoBreedingPlan {
  success: boolean;
  targetSpecies: { id: number; name: string };
  targetIVs: Stat[];
  steps: DittoBreedingStep[];
  totalSteps: number;
  totalCost: number;
  powerItemsCount: number;
  missingStats: Stat[];
  herenciaFijaOccurrences: number;
  dittosUsed: { id: string; name: string; timesUsed: number }[];
  warningMessage?: string;
}

export const STAT_METADATA: Record<
  Stat,
  { name: string; short: string; item: ItemType; itemName: string; itemKey: string; color: string }
> = {
  [Stat.HP]: {
    name: 'Puntos de Salud',
    short: 'PS',
    item: ItemType.PowerWeight,
    itemName: 'Pesa Recia',
    itemKey: 'power_weight',
    color: '#22c55e',
  },
  [Stat.Attack]: {
    name: 'Ataque',
    short: 'Atk',
    item: ItemType.PowerBracer,
    itemName: 'Brazal Recio',
    itemKey: 'power_bracer',
    color: '#ef4444',
  },
  [Stat.Defense]: {
    name: 'Defensa',
    short: 'Def',
    item: ItemType.PowerBelt,
    itemName: 'Cinto Recio',
    itemKey: 'power_belt',
    color: '#f97316',
  },
  [Stat.SpAtk]: {
    name: 'At. Especial',
    short: 'At.Esp',
    item: ItemType.PowerLens,
    itemName: 'Lente Recia',
    itemKey: 'power_lens',
    color: '#a855f7',
  },
  [Stat.SpDef]: {
    name: 'Def. Especial',
    short: 'Def.Esp',
    item: ItemType.PowerBand,
    itemName: 'Banda Recia',
    itemKey: 'power_band',
    color: '#eab308',
  },
  [Stat.Speed]: {
    name: 'Velocidad',
    short: 'Vel',
    item: ItemType.PowerAnklet,
    itemName: 'Franja Recia',
    itemKey: 'power_anklet',
    color: '#0ea5e9',
  },
};

/**
 * Genera presets de Dittos frecuentes para el usuario
 */
export function getDefaultDittoPresets(): {
  pack1x31: UserDitto[];
  ditto4x31: UserDitto[];
  ditto5x31: UserDitto[];
} {
  const pack1x31: UserDitto[] = [
    {
      id: 'ditto-hp',
      name: 'Ditto 1x31 (PS)',
      ivs: { hp: 31, attack: 0, defense: 0, spatk: 0, spdef: 0, speed: 0 },
      notes: 'Ditto capturado con 31 en PS',
    },
    {
      id: 'ditto-atk',
      name: 'Ditto 1x31 (Ataque)',
      ivs: { hp: 0, attack: 31, defense: 0, spatk: 0, spdef: 0, speed: 0 },
      notes: 'Ditto capturado con 31 en Ataque',
    },
    {
      id: 'ditto-def',
      name: 'Ditto 1x31 (Defensa)',
      ivs: { hp: 0, attack: 0, defense: 31, spatk: 0, spdef: 0, speed: 0 },
      notes: 'Ditto capturado con 31 en Defensa',
    },
    {
      id: 'ditto-spa',
      name: 'Ditto 1x31 (At. Especial)',
      ivs: { hp: 0, attack: 0, defense: 0, spatk: 31, spdef: 0, speed: 0 },
      notes: 'Ditto capturado con 31 en At. Especial',
    },
    {
      id: 'ditto-spd',
      name: 'Ditto 1x31 (Def. Especial)',
      ivs: { hp: 0, attack: 0, defense: 0, spatk: 0, spdef: 31, speed: 0 },
      notes: 'Ditto capturado con 31 en Def. Especial',
    },
    {
      id: 'ditto-spe',
      name: 'Ditto 1x31 (Velocidad)',
      ivs: { hp: 0, attack: 0, defense: 0, spatk: 0, spdef: 0, speed: 31 },
      notes: 'Ditto capturado con 31 en Velocidad',
    },
  ];

  const ditto4x31: UserDitto[] = [
    {
      id: 'ditto-4x31-main',
      name: 'Ditto 4x31 Principal',
      ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 0, speed: 0 },
      notes: 'Ditto 4x31 del PC (PS, Atk, Def, At.Esp)',
    },
    {
      id: 'ditto-spdef-sup',
      name: 'Ditto Apoyo (Def.Esp + Vel)',
      ivs: { hp: 0, attack: 0, defense: 0, spatk: 0, spdef: 31, speed: 31 },
      notes: 'Ditto complementario con Def.Esp y Velocidad',
    },
  ];

  const ditto5x31: UserDitto[] = [
    {
      id: 'ditto-5x31-god',
      name: 'Ditto 5x31 Élite',
      ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 0 },
      notes: 'Ditto 5x31 (Todo excepto Velocidad)',
    },
    {
      id: 'ditto-spe-sup',
      name: 'Ditto Velocidad (31 Vel)',
      ivs: { hp: 0, attack: 0, defense: 0, spatk: 0, spdef: 0, speed: 31 },
      notes: 'Ditto para transferir Velocidad',
    },
  ];

  return { pack1x31, ditto4x31, ditto5x31 };
}

/**
 * Planifica de manera 100% determinista la crianza con Dittos.
 * Reglas fundamentales de Cobblemon / Diosesmon:
 * 1. Máximo 1 Power Item (banda recia) por progenitor (máx 2 bandas en total por cruce).
 * 2. Cualquier otra estadística 31 requerida debe provenir de HERENCIA FIJA
 *    (ambos progenitores deben tener 31 en esa estadística para asegurar el 100%).
 * 3. La cría resultante de una cruza con Ditto SIEMPRE hereda la especie del progenitor no-Ditto.
 */
export function planDittoBreedingRoute(
  targetSpecies: { id: number; name: string },
  targetIVs: Stat[],
  availableDittos: UserDitto[],
  baseSpeciesSpecimen?: { ivs: IVSpread; gender?: 'female' | 'male'; name?: string }
): DittoBreedingPlan {
  // Verificar qué estadísticas faltan en la piscina de Dittos + espécimen base
  const availableStats = new Set<Stat>();
  if (baseSpeciesSpecimen) {
    for (const stat of ALL_STATS) {
      if (baseSpeciesSpecimen.ivs[stat] === 31) {
        availableStats.add(stat);
      }
    }
  }

  for (const ditto of availableDittos) {
    for (const stat of ALL_STATS) {
      if (ditto.ivs[stat] === 31) {
        availableStats.add(stat);
      }
    }
  }

  const missingStats = targetIVs.filter((s) => !availableStats.has(s));
  if (missingStats.length > 0) {
    const missingNames = missingStats.map((s) => STAT_METADATA[s].short).join(', ');
    return {
      success: false,
      targetSpecies,
      targetIVs,
      steps: [],
      totalSteps: 0,
      totalCost: 0,
      powerItemsCount: 0,
      missingStats,
      herenciaFijaOccurrences: 0,
      dittosUsed: [],
      warningMessage: `No posees ningún Ditto con 31 IVs en: ${missingNames}. Necesitas al menos un Ditto con estas estadísticas para transmitirlas.`,
    };
  }

  const steps: DittoBreedingStep[] = [];
  const dittoUsageCount = new Map<string, number>();
  let herenciaFijaTotal = 0;

  // Estado inicial del espécimen de la especie
  let currentSpeciesIVs: IVSpread = baseSpeciesSpecimen
    ? { ...baseSpeciesSpecimen.ivs }
    : createEmptyIVs();

  let currentGender: 'female' | 'male' = baseSpeciesSpecimen?.gender || 'female';
  let stepIndex = 1;

  // Clasificar targetIVs en: ya obtenidos vs pendientes
  const pendingStats = targetIVs.filter((s) => currentSpeciesIVs[s] !== 31);

  // Si ya tiene todas las targetIVs:
  if (pendingStats.length === 0) {
    return {
      success: true,
      targetSpecies,
      targetIVs,
      steps: [],
      totalSteps: 0,
      totalCost: 0,
      powerItemsCount: 0,
      missingStats: [],
      herenciaFijaOccurrences: 0,
      dittosUsed: [],
    };
  }

  // Ordenar Dittos por utilidad: los que tienen más stats del objetivo van primero (Multi-IV Dittos)
  const sortedDittos = [...availableDittos].sort((a, b) => {
    const countA = targetIVs.filter((s) => a.ivs[s] === 31).length;
    const countB = targetIVs.filter((s) => b.ivs[s] === 31).length;
    return countB - countA;
  });

  // Paso inicial si la especie parte con 0 stats o necesita el primer stat
  const currentPerfectStats = targetIVs.filter((s) => currentSpeciesIVs[s] === 31);

  if (currentPerfectStats.length === 0) {
    // Tomar el primer stat deseado y el mejor Ditto disponible para él
    const firstStat = pendingStats[0];
    const bestDitto = sortedDittos.find((d) => d.ivs[firstStat] === 31) || sortedDittos[0];

    const offspringIVs: IVSpread = { ...currentSpeciesIVs, [firstStat]: 31 };

    steps.push({
      stepNumber: stepIndex++,
      generation: 1,
      parentSpecies: {
        name: targetSpecies.name,
        speciesId: targetSpecies.id,
        gender: currentGender,
        ivs: { ...currentSpeciesIVs },
        heldItem: null,
      },
      parentDitto: {
        id: bestDitto.id,
        name: bestDitto.name,
        speciesId: 132,
        ivs: { ...bestDitto.ivs },
        heldItem: {
          type: STAT_METADATA[firstStat].item,
          name: STAT_METADATA[firstStat].itemName,
          stat: firstStat,
          itemKey: STAT_METADATA[firstStat].itemKey,
        },
      },
      statInheritance: [
        {
          stat: firstStat,
          statName: STAT_METADATA[firstStat].short,
          method: 'band_ditto',
          description: `Garantizado 100% mediante ${STAT_METADATA[firstStat].itemName} equipada en ${bestDitto.name}`,
        },
      ],
      offspring: {
        name: targetSpecies.name,
        speciesId: targetSpecies.id,
        gender: currentGender === 'female' ? 'male' : 'female', // alterna para flexibilidad
        ivs: offspringIVs,
        perfectCount: 1,
      },
      cost: 500, // 1 brazal
    });

    dittoUsageCount.set(bestDitto.id, (dittoUsageCount.get(bestDitto.id) || 0) + 1);
    currentSpeciesIVs = offspringIVs;
    currentGender = currentGender === 'female' ? 'male' : 'female';
  }

  // Iterativamente incorporar cada stat pendiente
  // REGLA CRÍTICA:
  // - 1 stat puede transmitirse por la banda de la Especie (stat que la especie ya tiene).
  // - 1 stat puede transmitirse por la banda de Ditto (nuevo stat que Ditto tiene).
  // - TODOS los demás stats 31 acumulados deben estar presentes en AMBOS para Herencia Fija.
  let remainingTargets = targetIVs.filter((s) => currentSpeciesIVs[s] !== 31);
  let attempts = 0;

  while (remainingTargets.length > 0 && attempts < 20) {
    attempts++;
    const nextStat = remainingTargets[0];

    // Buscar si existe un Ditto que:
    // 1. Tenga nextStat al 31.
    // 2. Y comparta la mayor cantidad de stats ya consolidadas en currentSpeciesIVs (para Herencia Fija).
    const alreadyAcquiredStats = targetIVs.filter((s) => currentSpeciesIVs[s] === 31);

    // Encontrar el mejor Ditto para este paso
    let candidateDitto = sortedDittos
      .filter((d) => d.ivs[nextStat] === 31)
      .sort((a, b) => {
        // Cuántos stats acumulados comparte cada Ditto
        const sharedA = alreadyAcquiredStats.filter((s) => a.ivs[s] === 31).length;
        const sharedB = alreadyAcquiredStats.filter((s) => b.ivs[s] === 31).length;
        return sharedB - sharedA;
      })[0];

    if (!candidateDitto) {
      // Fallback
      candidateDitto = sortedDittos.find((d) => d.ivs[nextStat] === 31) || sortedDittos[0];
    }

    // Identificar los stats compartidos (31 en ambos) que pasarán por HERENCIA FIJA
    const shared31s = alreadyAcquiredStats.filter((s) => candidateDitto.ivs[s] === 31);

    // Los stats que la especie tiene pero que el Ditto NO tiene:
    const nonSharedStats = alreadyAcquiredStats.filter((s) => candidateDitto.ivs[s] !== 31);

    // La especie puede proteger exactamente 1 stat con su Power Item
    // Escogemos proteger uno de los nonSharedStats si hay alguno, o el primer stat acumulado
    const speciesProtectedStat =
      nonSharedStats.length > 0 ? nonSharedStats[0] : alreadyAcquiredStats[0];

    // El Ditto protege nextStat con su Power Item
    const dittoProtectedStat = nextStat;

    // Herencia fija: todos los stats que están en ambos y no son el protegido por la banda
    const herenciaFijaStats = shared31s.filter(
      (s) => s !== speciesProtectedStat && s !== dittoProtectedStat
    );

    // Construir cría resultante
    const nextOffspringIVs: IVSpread = { ...currentSpeciesIVs };
    nextOffspringIVs[dittoProtectedStat] = 31;
    if (speciesProtectedStat) {
      nextOffspringIVs[speciesProtectedStat] = 31;
    }
    for (const hStat of herenciaFijaStats) {
      nextOffspringIVs[hStat] = 31;
    }

    const inheritances: DittoBreedingStep['statInheritance'] = [];

    // Banda Ditto
    inheritances.push({
      stat: dittoProtectedStat,
      statName: STAT_METADATA[dittoProtectedStat].short,
      method: 'band_ditto',
      description: `Banda Recia en Ditto: ${STAT_METADATA[dittoProtectedStat].itemName} (Garantiza ${STAT_METADATA[dittoProtectedStat].short} 31)`,
    });

    // Banda Especie
    if (speciesProtectedStat) {
      inheritances.push({
        stat: speciesProtectedStat,
        statName: STAT_METADATA[speciesProtectedStat].short,
        method: 'band_species',
        description: `Banda Recia en ${targetSpecies.name}: ${STAT_METADATA[speciesProtectedStat].itemName} (Garantiza ${STAT_METADATA[speciesProtectedStat].short} 31)`,
      });
    }

    // Herencia Fija
    for (const hStat of herenciaFijaStats) {
      inheritances.push({
        stat: hStat,
        statName: STAT_METADATA[hStat].short,
        method: 'herencia_fija',
        description: `Herencia Fija 100%: Ambos padres poseen ${STAT_METADATA[hStat].name} al 31`,
      });
      herenciaFijaTotal++;
    }

    const newPerfectCount = Object.values(nextOffspringIVs).filter((v) => v === 31).length;

    steps.push({
      stepNumber: stepIndex++,
      generation: stepIndex - 1,
      parentSpecies: {
        name: targetSpecies.name,
        speciesId: targetSpecies.id,
        gender: currentGender,
        ivs: { ...currentSpeciesIVs },
        heldItem: speciesProtectedStat
          ? {
              type: STAT_METADATA[speciesProtectedStat].item,
              name: STAT_METADATA[speciesProtectedStat].itemName,
              stat: speciesProtectedStat,
              itemKey: STAT_METADATA[speciesProtectedStat].itemKey,
            }
          : null,
      },
      parentDitto: {
        id: candidateDitto.id,
        name: candidateDitto.name,
        speciesId: 132,
        ivs: { ...candidateDitto.ivs },
        heldItem: {
          type: STAT_METADATA[dittoProtectedStat].item,
          name: STAT_METADATA[dittoProtectedStat].itemName,
          stat: dittoProtectedStat,
          itemKey: STAT_METADATA[dittoProtectedStat].itemKey,
        },
      },
      statInheritance: inheritances,
      offspring: {
        name: targetSpecies.name,
        speciesId: targetSpecies.id,
        gender: currentGender === 'female' ? 'male' : 'female',
        ivs: nextOffspringIVs,
        perfectCount: newPerfectCount,
      },
      cost: (speciesProtectedStat ? 500 : 0) + 500, // 500 por brazal
    });

    dittoUsageCount.set(candidateDitto.id, (dittoUsageCount.get(candidateDitto.id) || 0) + 1);
    currentSpeciesIVs = nextOffspringIVs;
    currentGender = currentGender === 'female' ? 'male' : 'female';

    remainingTargets = targetIVs.filter((s) => currentSpeciesIVs[s] !== 31);
  }

  const totalCost = steps.reduce((sum, s) => sum + s.cost, 0);
  const powerItemsCount = steps.reduce(
    (sum, s) => sum + (s.parentSpecies.heldItem ? 1 : 0) + (s.parentDitto.heldItem ? 1 : 0),
    0
  );

  const dittosUsed = Array.from(dittoUsageCount.entries()).map(([id, timesUsed]) => {
    const found = availableDittos.find((d) => d.id === id);
    return {
      id,
      name: found ? found.name : 'Ditto',
      timesUsed,
    };
  });

  return {
    success: true,
    targetSpecies,
    targetIVs,
    steps,
    totalSteps: steps.length,
    totalCost,
    powerItemsCount,
    missingStats: [],
    herenciaFijaOccurrences: herenciaFijaTotal,
    dittosUsed,
  };
}
