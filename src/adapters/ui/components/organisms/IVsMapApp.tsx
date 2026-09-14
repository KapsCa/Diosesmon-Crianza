import React, { useState } from 'react';
import { findCompatibleParents } from '../../../../domain/services/breedingFinder';
import { generateBreedingTree } from '../../../../domain/services/breedingTreeGenerator';
import { getBiomeCaptures } from '../../../../domain/services/biomeService';
import { estimateRoute } from '../../../../domain/services/routeEstimator';
import { SpeciesSelector } from '../molecules/SpeciesSelector';
import { RoleSlot } from '../atoms/RoleSlot';
import { BreedingTree } from '../organisms/BreedingTree';
import { ALL_STATS, Stat } from '../../../../domain/types/stat';
import { Gender } from '../../../../domain/types/pokemon';
import { POKEMON_SPECIES_LIST, findSpeciesById, findSpeciesByName } from '../../../../domain/data/speciesData';
import { DIOSESMON_OFFICIAL_COST_MODEL } from '../../../../domain/types/costs';
import { DiosesmonLogo } from '../atoms/DiosesmonLogo';
import { WelcomeScreen } from '../organisms/WelcomeScreen';
import { IVProfileBuilder, type IVTargetConfig, COMMON_NATURES } from '../molecules/IVProfileBuilder';
import { StrategySelector, type BreedingStrategy } from '../molecules/StrategySelector';
import { PCProgenitorBank } from '../molecules/PCProgenitorBank';
import { type StoredPokemon, getStoredSpecimens } from '../../../../domain/data/pcStorage';
import { PCQuickPickerModal } from '../molecules/PCQuickPickerModal';
import { DaycareChecklist } from '../organisms/DaycareChecklist';
import { CompatibilityRulesMatrix } from '../organisms/CompatibilityRulesMatrix';
import { getSpeciesRoleProfile } from '../../../../domain/services/competitiveRoleSuggester';
import { DittoInventoryManager } from '../molecules/DittoInventoryManager';
import { DittoBreedingTree } from '../organisms/DittoBreedingTree';
import {
  type UserDitto,
  type DittoBreedingPlan,
  planDittoBreedingRoute,
  getDefaultDittoPresets,
} from '../../../../domain/services/dittoBreedingPlanner';
import {
  GitBranch,
  ClipboardList,
  Database,
  BookOpen,
  Sparkles,
  ArrowRight,
  Compass,
  ChevronDown,
  Check,
  Target,
  PiggyBank,
  Zap,
  User,
} from 'lucide-react';

interface IVsMapAppState {
  goalSpecies: { id: number; name: string } | null;
  parents: {
    compatible: boolean;
    father: any;
    mother: any;
    reason?: string;
  } | null;
  tree: {
    root: any;
    allNodes: any[];
    maxDepth: number;
  } | null;
  biomeCaptures: any[];
  estimate: {
    totalTime: string;
    totalSteps: number;
    totalCost: number;
    itemBreakdown: { type: string; count: number; cost: number }[];
    ivBreakdown: { perfect: number; missing: number };
  } | null;
  showTree: boolean;
  formStep: 'select-species' | 'select-parents' | 'generated' | 'review';
}

const POPULAR_SPECIES = [
  { id: 147, name: 'Dratini', tag: 'Dragón / Agua 1' },
  { id: 443, name: 'Gible', tag: 'Monstruo / Dragón' },
  { id: 246, name: 'Larvitar', tag: 'Monstruo' },
  { id: 371, name: 'Bagon', tag: 'Dragón' },
  { id: 374, name: 'Beldum', tag: 'Mineral' },
  { id: 447, name: 'Riolu', tag: 'Campo / Humanoide' },
  { id: 129, name: 'Magikarp', tag: 'Agua 2 / Dragón' },
  { id: 4, name: 'Charmander', tag: 'Monstruo / Dragón' },
];

export const IVsMapApp: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'planner' | 'checklist' | 'pc' | 'rules'>('planner');
  // The application opens on the presentation screen. The planner flow is untouched:
  // it simply is not the first thing you see. Reached from the welcome CTA.
  const [showWelcome, setShowWelcome] = useState(true);
  const startPlanning = () => {
    setShowWelcome(false);
    setActiveTab('planner');
  };

  // Modo de inicio: 'scratch' (empezar de 0) vs 'existing' (ya tengo uno)
  const [startingMode, setStartingMode] = useState<'scratch' | 'existing'>('scratch');
  const [existingSpecimen, setExistingSpecimen] = useState<StoredPokemon | null>(null);

  // Modal para seleccionar desde el Banco PC rápido
  const [pcModalState, setPcModalState] = useState<{
    isOpen: boolean;
    role: 'father' | 'mother' | 'base';
  }>({
    isOpen: false,
    role: 'base',
  });

  // IV profile configuration (6x31 por defecto)
  const [ivConfig, setIvConfig] = useState<IVTargetConfig>({
    hp: 31,
    attack: 31,
    defense: 31,
    spatk: 31, // 6x31 por defecto
    spdef: 31,
    speed: 31,
    nature: 'Adamant',
    useEverstone: false,
    hasHiddenAbility: false,
  });

  // Rol competitivo sugerido activo (ej: 6x31, 5x31 SpAtk, 5x31 Físico)
  const [activeSuggestionId, setActiveSuggestionId] = useState<string>('');

  // Strategy
  const [strategy, setStrategy] = useState<BreedingStrategy>('economic');

  // Dittos configurados por el usuario para la estrategia con Dittos (ditto_speed)
  const [userDittos, setUserDittos] = useState<UserDitto[]>(() => {
    try {
      const stored = getStoredSpecimens();
      const pcDittos = stored.filter(
        (p) => p.speciesId === 132 || p.speciesName.toLowerCase() === 'ditto'
      );
      if (pcDittos.length > 0) {
        return pcDittos.map((p, idx) => ({
          id: `pc-ditto-${p.id || idx}`,
          name: `Ditto PC (${Object.values(p.ivs).filter((v) => v === 31).length}x31)`,
          ivs: {
            hp: p.ivs.hp || 0,
            attack: p.ivs.attack || 0,
            defense: p.ivs.defense || 0,
            spatk: p.ivs.spatk || 0,
            spdef: p.ivs.spdef || 0,
            speed: p.ivs.speed || 0,
          },
          notes: p.notes || 'De Banco PC',
        }));
      }
    } catch {
      // Fallback a preset
    }
    return getDefaultDittoPresets().ditto4x31;
  });

  // Plan calculado para la crianza con Dittos
  const [dittoPlan, setDittoPlan] = useState<DittoBreedingPlan | null>(null);

  // Vista en resultados para alternar entre árbol de Dittos o torneo
  const [resultsViewMode, setResultsViewMode] = useState<'ditto' | 'tournament'>('ditto');

  // Control para desplegar configuración avanzada de IVs y Naturaleza (modo amigable)
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Estado del flujo principal
  const [state, setState] = useState<IVsMapAppState>({
    goalSpecies: null,
    parents: null,
    tree: null,
    biomeCaptures: [],
    estimate: null,
    showTree: false,
    formStep: 'select-species',
  });

  // Perfil competitivo del Pokémon objetivo actual
  const currentRoleProfile = React.useMemo(() => {
    if (!state.goalSpecies) return null;
    const targetSpecies =
      findSpeciesById(state.goalSpecies.id) || findSpeciesByName(state.goalSpecies.name);
    return targetSpecies ? getSpeciesRoleProfile(targetSpecies) : null;
  }, [state.goalSpecies]);

  const effectiveActiveSuggestionId =
    activeSuggestionId || (currentRoleProfile ? currentRoleProfile.defaultSuggestionId : '');

  const activeTargetStats = React.useMemo(() => {
    const list: Stat[] = [];
    if (ivConfig.hp === 31) list.push(Stat.HP);
    if (ivConfig.attack === 31) list.push(Stat.Attack);
    if (ivConfig.defense === 31) list.push(Stat.Defense);
    if (ivConfig.spatk === 31) list.push(Stat.SpAtk);
    if (ivConfig.spdef === 31) list.push(Stat.SpDef);
    if (ivConfig.speed === 31) list.push(Stat.Speed);
    return list.length > 0 ? list : ALL_STATS;
  }, [ivConfig]);

  // Helper para verificar compatibilidad de cualquier pareja en tiempo real
  const evaluateCompatibility = (father: any, mother: any) => {
    if (!father || !mother) return { compatible: false, reason: 'Falta un progenitor' };

    const isFatherDitto = father.species?.id === 132 || father.species?.name?.toLowerCase() === 'ditto';
    const isMotherDitto = mother.species?.id === 132 || mother.species?.name?.toLowerCase() === 'ditto';

    if (isFatherDitto && isMotherDitto) {
      return { compatible: false, reason: 'Dos Dittos no pueden criar entre sí.' };
    }
    if (isFatherDitto || isMotherDitto) {
      return { compatible: true, reason: 'Ditto actúa como reproductor universal compatible.' };
    }

    const isFatherUndiscovered = father.species?.eggGroups?.some((g: any) =>
      g.name?.toLowerCase().includes('undiscovered') || g.name?.toLowerCase().includes('no descubierto')
    );
    const isMotherUndiscovered = mother.species?.eggGroups?.some((g: any) =>
      g.name?.toLowerCase().includes('undiscovered') || g.name?.toLowerCase().includes('no descubierto')
    );
    if (isFatherUndiscovered || isMotherUndiscovered) {
      return { compatible: false, reason: 'Uno de los Pokémon pertenece al grupo Sin Descubrir (no puede criar).' };
    }

    const fatherGroups = new Set(father.species?.eggGroups?.map((g: any) => g.name?.toLowerCase()) || []);
    const motherGroups = mother.species?.eggGroups?.map((g: any) => g.name?.toLowerCase()) || [];
    const sharesGroup = motherGroups.some((g: string) => fatherGroups.has(g));

    if (!sharesGroup) {
      return { compatible: false, reason: 'Los progenitores no comparten ningún Grupo Huevo en común.' };
    }

    if (father.gender === mother.gender && father.gender !== 'genderless') {
      return {
        compatible: false,
        reason: `Ambos progenitores son del mismo sexo (${father.gender}). Se requiere un macho y una hembra.`,
      };
    }

    return { compatible: true, reason: 'Pareja fértil y compatible para herencia en guardería.' };
  };

  // Manejadores de paso
  const handleGoalChange = (species: { id: number; name: string }) => {
    const targetSpecies =
      findSpeciesById(species.id) ||
      findSpeciesByName(species.name) || {
        id: species.id,
        name: species.name,
        genderRatio: 0.5,
        eggGroups: [{ name: 'Field' }],
        gen: 1,
        baseStats: { hp: 50, attack: 50, defense: 50, spatk: 50, spdef: 50, speed: 50 },
        captureRate: 45,
      };

    const result = findCompatibleParents(targetSpecies);

    let father = result.parents[0] || null;
    let mother = result.parents[1] || result.parents[0] || null;

    const dittoSpecies = findSpeciesById(132) || {
      id: 132,
      name: 'Ditto',
      genderRatio: -1,
      eggGroups: [{ name: 'Ditto' }],
      gen: 1,
      baseStats: { hp: 48, attack: 48, defense: 48, spatk: 48, spdef: 48, speed: 48 },
      captureRate: 35,
    };

    const isTargetGenderless =
      targetSpecies.genderRatio === -1 ||
      targetSpecies.name?.toLowerCase() === 'ditto';

    if (isTargetGenderless) {
      father = {
        species: dittoSpecies,
        gender: 'genderless',
        ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
        heldItem: null,
      };
      mother = {
        species: targetSpecies,
        gender: 'genderless',
        ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
        heldItem: null,
      };
    } else {
      if (!father) {
        father = {
          species: targetSpecies,
          gender: 'male',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
        };
      }
      if (!mother) {
        mother = {
          species: targetSpecies,
          gender: 'female',
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
        };
      }
    }

    // Si el usuario eligió "Ya tengo uno" y tiene un espécimen configurado
    if (startingMode === 'existing' && existingSpecimen) {
      const existingSpeciesObj =
        findSpeciesById(existingSpecimen.speciesId) ||
        findSpeciesByName(existingSpecimen.speciesName) ||
        targetSpecies;

      const loadedSpecimenParent = {
        species: existingSpeciesObj,
        gender: existingSpecimen.gender === 'genderless' ? 'male' : existingSpecimen.gender,
        ivs: existingSpecimen.ivs,
        heldItem: null,
        fromPC: true,
      };

      if (existingSpecimen.gender === 'female' || existingSpeciesObj.id === targetSpecies.id) {
        mother = loadedSpecimenParent;
      } else {
        father = loadedSpecimenParent;
      }
    }

    const comp = evaluateCompatibility(father, mother);

    // Configurar objetivo competitivo coherente con el rol y sugerencias (ej: 6x31 o Atk. Esp para Riolu/Mega, 5x31 SpAtk para Feebas)
    const roleProfile = getSpeciesRoleProfile(targetSpecies);
    const defaultSugg =
      roleProfile.suggestions.find((s) => s.id === roleProfile.defaultSuggestionId) ||
      roleProfile.suggestions[0];

    if (defaultSugg) {
      setActiveSuggestionId(defaultSugg.id);
      setIvConfig(defaultSugg.config);
    }

    setState((prev) => ({
      ...prev,
      goalSpecies: { id: targetSpecies.id, name: targetSpecies.name },
      parents: {
        compatible: comp.compatible,
        father,
        mother,
        reason: comp.reason,
      },
      tree: null,
      biomeCaptures: [],
      estimate: null,
      showTree: false,
      // Si se elige empezar de 0, no mostrar la pantalla de progenitores ya que no hay pokemon en banco aun
      formStep: startingMode === 'scratch' ? 'select-species' : 'select-parents',
    }));
  };

  const handleGenerateRoute = () => {
    if (!state.goalSpecies) return;
    const targetSpecies = findSpeciesById(state.goalSpecies.id);
    if (!targetSpecies) return;

    // Filter target IVs based on ivConfig
    const targetIVs: Stat[] = [];
    if (ivConfig.hp === 31) targetIVs.push(Stat.HP);
    if (ivConfig.attack === 31) targetIVs.push(Stat.Attack);
    if (ivConfig.defense === 31) targetIVs.push(Stat.Defense);
    if (ivConfig.spatk === 31) targetIVs.push(Stat.SpAtk);
    if (ivConfig.spdef === 31) targetIVs.push(Stat.SpDef);
    if (ivConfig.speed === 31) targetIVs.push(Stat.Speed);

    const config = {
      targetSpecies,
      targetIVs: targetIVs.length > 0 ? targetIVs : ALL_STATS.map((s) => s),
      chooseGender: false,
      nurseryConfig: undefined,
    };

    const result = generateBreedingTree(config);

    // Generar plan de Dittos si corresponde a la estrategia ditto_speed
    let dittoRes: DittoBreedingPlan | null = null;
    if (strategy === 'ditto_speed') {
      const plan = planDittoBreedingRoute(
        { id: targetSpecies.id, name: targetSpecies.name },
        targetIVs.length > 0 ? targetIVs : ALL_STATS.map((s) => s),
        userDittos,
        startingMode === 'existing' && existingSpecimen
          ? {
              ivs: {
                hp: existingSpecimen.ivs.hp || 0,
                attack: existingSpecimen.ivs.attack || 0,
                defense: existingSpecimen.ivs.defense || 0,
                spatk: existingSpecimen.ivs.spatk || 0,
                spdef: existingSpecimen.ivs.spdef || 0,
                speed: existingSpecimen.ivs.speed || 0,
              },
              gender: (existingSpecimen.gender as any) || 'female',
              name: existingSpecimen.speciesName,
            }
          : undefined
      );
      dittoRes = plan;
      setDittoPlan(plan);
      setResultsViewMode('ditto');
    } else {
      setResultsViewMode('tournament');
    }

    // Obtener capturas biome de las especies del árbol
    const speciesList = [result.tree.root.pokemon.species];
    const biomeCaptures = getBiomeCaptures(speciesList);

    // Estimar ruta usando DIOSESMON_OFFICIAL_COST_MODEL
    const routeEstimate = estimateRoute(
      result.tree,
      undefined,
      undefined,
      DIOSESMON_OFFICIAL_COST_MODEL
    );

    // Desglose de ítems auditados con reglas de la Tienda de Crianza Diosesmon (500 Pk$ c/u)
    const isUsingDittoPlan = Boolean(strategy === 'ditto_speed' && dittoRes && dittoRes.success);
    const baseSteps = (isUsingDittoPlan && dittoRes)
      ? dittoRes.totalSteps
      : routeEstimate.estimatedTime.totalSteps;

    // Si parte de un espécimen existente con IVs en ruta tradicional, reducimos los pasos
    const savedSteps = !isUsingDittoPlan && startingMode === 'existing' && existingSpecimen
      ? Math.min(Math.floor(baseSteps * 0.4), Object.values(existingSpecimen.ivs).filter(v => v === 31).length)
      : 0;
    const totalSteps = Math.max(1, baseSteps - savedSteps);
    const powerItemCount = (isUsingDittoPlan && dittoRes)
      ? dittoRes.powerItemsCount
      : totalSteps * 2; // 2 power items per breeding step
    const everstoneCount = ivConfig.useEverstone ? 1 : 0;
    const mirrorHerbCount = ivConfig.hasHiddenAbility ? 1 : 0;

    const itemBreakdown = [
      {
        type: isUsingDittoPlan ? 'Bandas Recias en Especie y Dittos (500 Pk$ c/u)' : 'Power Items Recios (500 Pk$ c/u - 1x Burn)',
        count: powerItemCount,
        cost: powerItemCount * 500,
      },
      ...(everstoneCount > 0
        ? [
            {
              type: 'Piedra Eterna (500 Pk$ - 1x Burn)',
              count: 1,
              cost: 500,
            },
          ]
        : []),
      ...(mirrorHerbCount > 0
        ? [
            {
              type: 'Hierba Copia (500 Pk$ - 1x Burn)',
              count: 1,
              cost: 500,
            },
          ]
        : []),
      {
        type: 'Tarifa de Guardería (Gratis - 0 Pk$)',
        count: totalSteps,
        cost: 0,
      },
    ];

    const perfectCount = targetIVs.length > 0 ? targetIVs.length : 5;

    // Transformar RouteEstimate al formato esperado con precios actualizados de Diosesmon
    const estimate = {
      totalTime: `${totalSteps * 20} - ${totalSteps * 30} mins (Aprox. ${totalSteps} eclosiones)`,
      totalSteps,
      totalCost:
        powerItemCount * 500 +
        (everstoneCount > 0 ? 500 : 0) +
        (mirrorHerbCount > 0 ? 500 : 0),
      itemBreakdown,
      ivBreakdown: { perfect: perfectCount, missing: 6 - perfectCount },
    };

    setState((prev) => ({
      ...prev,
      tree: {
        root: result.tree.root,
        allNodes: result.tree.allNodes,
        maxDepth: result.tree.maxDepth,
      },
      biomeCaptures,
      estimate,
      showTree: true,
      formStep: 'generated',
    }));
  };

  const handleProgenitorFromBank = (specimen: StoredPokemon, role: 'father' | 'mother') => {
    const speciesObj = findSpeciesById(specimen.speciesId) || {
      id: specimen.speciesId,
      name: specimen.speciesName,
      genderRatio: 0.5,
      eggGroups: [{ name: 'Field' }],
      gen: 1,
      baseStats: { hp: 50, attack: 50, defense: 50, spatk: 50, spdef: 50, speed: 50 },
      captureRate: 45,
    };

    setState((prev) => {
      const currentParents = prev.parents || {
        compatible: true,
        father: null,
        mother: null,
      };

      const updated = {
        ...currentParents,
        [role]: {
          species: speciesObj,
          gender: specimen.gender === 'genderless' ? 'male' : specimen.gender,
          ivs: specimen.ivs,
          heldItem: null,
          fromPC: true,
        },
      };

      const comp = evaluateCompatibility(updated.father, updated.mother);

      return {
        ...prev,
        parents: {
          ...updated,
          compatible: comp.compatible,
          reason: comp.reason,
        },
        formStep: 'select-parents',
      };
    });

    setActiveTab('planner');
  };

  const handleModalSelect = (specimen: StoredPokemon, role: 'father' | 'mother' | 'base') => {
    if (role === 'base') {
      setExistingSpecimen(specimen);
      setStartingMode('existing');
      const targetSpecies = findSpeciesById(specimen.speciesId) || findSpeciesByName(specimen.speciesName);
      if (targetSpecies) {
        handleGoalChange({ id: targetSpecies.id, name: targetSpecies.name });
      }
    } else {
      handleProgenitorFromBank(specimen, role);
    }
  };

  // Handlers para edición interactiva de los progenitores
  const handleParentSpeciesChange = (role: 'father' | 'mother', sp: any) => {
    setState((prev) => {
      if (!prev.parents) return prev;
      const father = role === 'father' ? { ...prev.parents.father, species: sp, fromPC: false } : prev.parents.father;
      const mother = role === 'mother' ? { ...prev.parents.mother, species: sp, fromPC: false } : prev.parents.mother;
      const comp = evaluateCompatibility(father, mother);

      return {
        ...prev,
        parents: {
          ...prev.parents,
          [role]: {
            ...prev.parents[role],
            species: sp,
            fromPC: false,
          },
          compatible: comp.compatible,
          reason: comp.reason,
        },
      };
    });
  };

  const handleParentGenderChange = (role: 'father' | 'mother', gender: Gender) => {
    setState((prev) => {
      if (!prev.parents) return prev;
      const father = role === 'father' ? { ...prev.parents.father, gender } : prev.parents.father;
      const mother = role === 'mother' ? { ...prev.parents.mother, gender } : prev.parents.mother;
      const comp = evaluateCompatibility(father, mother);

      return {
        ...prev,
        parents: {
          ...prev.parents,
          [role]: {
            ...prev.parents[role],
            gender,
          },
          compatible: comp.compatible,
          reason: comp.reason,
        },
      };
    });
  };

  const handleParentIVChange = (
    role: 'father' | 'mother',
    statKey: 'hp' | 'attack' | 'defense' | 'spatk' | 'spdef' | 'speed',
    value: number
  ) => {
    setState((prev) => {
      if (!prev.parents || !prev.parents[role]) return prev;
      // Si el pokémon proviene de la PC, sus IVs ya fueron fijados y no pueden alterarse
      if (prev.parents[role]?.fromPC) return prev;

      return {
        ...prev,
        parents: {
          ...prev.parents,
          [role]: {
            ...prev.parents[role],
            ivs: {
              ...(prev.parents[role].ivs || { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 }),
              [statKey]: value,
            },
          },
        },
      };
    });
  };

  const handleParentHeldItemChange = (
    role: 'father' | 'mother',
    heldItem: null | { type: string; stat?: string }
  ) => {
    setState((prev) => {
      if (!prev.parents || !prev.parents[role]) return prev;
      return {
        ...prev,
        parents: {
          ...prev.parents,
          [role]: {
            ...prev.parents[role],
            heldItem,
          },
        },
      };
    });
  };

  // Renderizar el selector de especie
  const renderSpeciesSelector = () => {
    const perfectIVsCount = [
      ivConfig.hp,
      ivConfig.attack,
      ivConfig.defense,
      ivConfig.spatk,
      ivConfig.spdef,
      ivConfig.speed,
    ].filter((v) => v === 31).length;

    const isTrickRoom = ivConfig.speed === 0;

    const currentNatureName =
      COMMON_NATURES.find((n) => n.name === ivConfig.nature)?.es || ivConfig.nature || 'Firme';

    return (
      <div className="ivsmap-step flex flex-col gap-5 p-5 rounded-2xl bg-surface border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="step-title text-base font-bold text-white font-['Sora'] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs font-mono border border-purple-500/40">
                1
              </span>
              ¿Qué Pokémon deseas criar?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Busca tu especie o elige una sugerencia popular para calcular la ruta de cría óptima.
            </p>
          </div>
        </div>

        {/* Especie Seleccionada (Feedback visual inmediato sin botones prematuros) */}
        {state.goalSpecies && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-canvas border border-purple-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-900/30 border border-purple-500/30 p-1 flex items-center justify-center shrink-0">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${state.goalSpecies.id}.png`}
                  alt={state.goalSpecies.name}
                  className="w-11 h-11 object-contain drop-shadow"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white font-['Sora']">
                    {state.goalSpecies.name}
                  </span>
                  <span className="text-[11px] font-mono text-purple-300 font-semibold">
                    #{String(state.goalSpecies.id).padStart(3, '0')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 font-mono">
                    Objetivo
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {startingMode === 'scratch' ? 'Desde Cero' : 'Con Banco PC'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Especie seleccionada. Ajusta los IVs y naturaleza a continuación antes de calcular la ruta.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-purple-300/80 bg-purple-950/40 px-3 py-1.5 rounded-lg border border-purple-800/40 font-mono">
              <span>Configura los IVs abajo ↓</span>
            </div>
          </div>
        )}

        {/* Sugerencias Frecuentes */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Sugerencias populares:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {POPULAR_SPECIES.map((spec) => (
              <button
                key={spec.id}
                type="button"
                onClick={() => handleGoalChange(spec)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  state.goalSpecies?.id === spec.id
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-purple-500/40 hover:text-white'
                }`}
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spec.id}.png`}
                  alt={spec.name}
                  className="w-5 h-5 object-contain shrink-0 drop-shadow-sm"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span>{spec.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Buscador de especies */}
        <div>
          <SpeciesSelector
            speciesList={POKEMON_SPECIES_LIST}
            selectedSpeciesId={state.goalSpecies?.id}
            onSelect={handleGoalChange}
            disabled={false}
          />
        </div>

        {/* Punto de Partida: amigable y sin saturación de texto */}
        <div className="p-3.5 rounded-xl bg-canvas border border-slate-800/80 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">
                Punto de partida:
              </span>
            </div>

            <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setStartingMode('scratch');
                  setExistingSpecimen(null);
                  setState((prev) => ({
                    ...prev,
                    formStep: prev.formStep === 'select-parents' ? 'select-species' : prev.formStep,
                  }));
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  startingMode === 'scratch'
                    ? 'bg-purple-600 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Empezar de 0</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStartingMode('existing');
                  if (!existingSpecimen) {
                    const stored = getStoredSpecimens();
                    if (stored.length > 0) {
                      setExistingSpecimen(stored[0]);
                    }
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  startingMode === 'existing'
                    ? 'bg-purple-600 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Tengo un ejemplar (Banco PC)</span>
              </button>
            </div>
          </div>

          {/* Tarjeta de ejemplar cargado si eligió 'existing' */}
          {startingMode === 'existing' && (
            <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {existingSpecimen ? (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${existingSpecimen.speciesId}.png`}
                      alt={existingSpecimen.speciesName}
                      className="w-7 h-7 object-contain drop-shadow"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="font-semibold text-white">
                      {existingSpecimen.speciesName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                      {Object.values(existingSpecimen.ivs).filter((v) => v === 31).length}x31
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ({existingSpecimen.notes || 'En PC'})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">
                    Ningún ejemplar seleccionado aún.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPcModalState({ isOpen: true, role: 'base' })}
                className="px-2.5 py-1 text-xs rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white font-medium flex items-center gap-1.5 self-start sm:self-auto transition-all"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{existingSpecimen ? 'Cambiar de Banco PC' : 'Elegir de Banco PC'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Configuración de Objetivo: inteligente, consistente con el rol y desplegable */}
        <div className="rounded-xl bg-canvas border border-purple-900/30 overflow-hidden shadow-lg">
          <div className="p-4 sm:p-5 flex flex-col gap-3.5 bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-canvas border-b border-purple-500/20">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-sm shrink-0 mt-0.5">
                  <Target className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 font-medium">Objetivo:</span>
                    <span className="font-mono text-purple-300 font-extrabold text-sm">
                      {perfectIVsCount}x31
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-purple-200 font-medium">
                      {currentNatureName}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-normal text-[11px]">
                      {strategy === 'economic' ? 'Económica' : 'Ditto Rápida'}
                    </span>
                    {currentRoleProfile && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>{currentRoleProfile.headlineRole}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {currentRoleProfile
                      ? currentRoleProfile.explanation
                      : 'Preconfigurado automáticamente según el rol competitivo de la especie. Puedes ajustar las sugerencias rápidas o personalizar cada estadística.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-purple-300 border border-purple-500/30 hover:border-purple-500/60 transition-all flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer shadow-sm"
              >
                <span>{showAdvancedConfig ? 'Ocultar personalización' : 'Personalizar IVs y Naturaleza'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedConfig ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Fila de sugerencias inteligentes interactivas (6x31, Enfoque Atk Esp, etc.) */}
            {currentRoleProfile && currentRoleProfile.suggestions.length > 0 && (
              <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <span className="text-[11px] font-semibold text-purple-300/90 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <span>Sugerencias para {state.goalSpecies?.name}:</span>
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {currentRoleProfile.suggestions.map((sugg) => {
                    const isSelected = effectiveActiveSuggestionId === sugg.id;
                    return (
                      <button
                        key={sugg.id}
                        type="button"
                        onClick={() => {
                          setActiveSuggestionId(sugg.id);
                          setIvConfig(sugg.config);
                        }}
                        title={sugg.roleDescription}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 border border-purple-400 font-semibold scale-[1.02]'
                            : 'bg-slate-900/90 hover:bg-purple-950/40 text-slate-300 hover:text-white border border-slate-700/80 hover:border-purple-500/40'
                        }`}
                      >
                        {sugg.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              isSelected
                                ? 'bg-purple-800/90 text-purple-100'
                                : 'bg-purple-950/90 text-purple-300 border border-purple-800/50'
                            }`}
                          >
                            {sugg.badge}
                          </span>
                        )}
                        <span>{sugg.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-300 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {showAdvancedConfig && (
            <div className="p-4 border-t border-slate-800/80 flex flex-col gap-4 bg-slate-950/40">
              <IVProfileBuilder config={ivConfig} onChange={setIvConfig} />
              <StrategySelector strategy={strategy} onChange={setStrategy} />
            </div>
          )}
        </div>

        {/* Selector de Método de Crianza y Configuración de Dittos */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-canvas border border-purple-900/40 flex flex-col gap-3.5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">
                Estrategia de Crianza:
              </span>
            </div>

            <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setStrategy('economic')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  strategy === 'economic'
                    ? 'bg-purple-600 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ruta Silvestre Tradicional</span>
              </button>

              <button
                type="button"
                onClick={() => setStrategy('ditto_speed')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  strategy === 'ditto_speed'
                    ? 'bg-purple-600 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Crianza con Dittos (Rápida con PC)</span>
              </button>
            </div>
          </div>

          {/* Si eligió crianza con Dittos, mostrar el administrador de inventario de Dittos */}
          {strategy === 'ditto_speed' && (
            <div className="pt-2 border-t border-slate-800/80">
              <DittoInventoryManager
                dittos={userDittos}
                onChange={setUserDittos}
                targetStats={activeTargetStats}
              />
            </div>
          )}
        </div>

        {/* Botón de Acción Principal: al final, tras elegir stats y naturaleza */}
        {state.goalSpecies && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d121f] via-purple-950/40 to-surface border border-purple-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                    Objetivo Final:
                  </span>
                  <span className="text-sm font-bold text-white font-['Sora']">
                    {state.goalSpecies.name}
                  </span>
                  <span className="font-mono text-purple-300 text-xs font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60">
                    {perfectIVsCount}x31
                  </span>
                  {ivConfig.useEverstone ? (
                    <span className="text-xs text-purple-200">
                      • Naturaleza: {currentNatureName} (Piedra Eterna)
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-300">
                      • Menta recomendada: {currentNatureName}
                    </span>
                  )}
                  {ivConfig.hasHiddenAbility && (
                    <span className="text-xs text-emerald-200">
                      • Habilidad: Hierba Copia
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isTrickRoom
                    ? '🌀 Espacio Raro (Trick Room): 0 IVs en Velocidad y naturaleza reductora (-Vel) fijados.'
                    : perfectIVsCount === 5
                    ? ivConfig.useEverstone
                      ? '⭐ Árbol trazado con Piedra Eterna para heredar la naturaleza directamente de un progenitor.'
                      : '⚡ Método económico recomendado: 1 sola rama (15 cruces) + Menta de Naturaleza al eclosionar.'
                    : 'Configuración lista. Presiona el botón para calcular la ruta determinista de cría.'}
                </p>
              </div>
            </div>

            {startingMode === 'scratch' || strategy === 'ditto_speed' ? (
              <button
                type="button"
                onClick={handleGenerateRoute}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {strategy === 'ditto_speed'
                    ? `Generar ruta de cría con Dittos (${userDittos.length} disponibles)`
                    : 'Generar ruta de cría (Desde 0)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, formStep: 'select-parents' }))}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all cursor-pointer shrink-0"
              >
                <Database className="w-4 h-4" />
                <span>Continuar a Progenitores (Banco PC)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar selector de padres
  const renderParentSelector = () => {
    if (!state.parents) {
      return null;
    }

    return (
      <div className="ivsmap-step flex flex-col gap-5 p-5 rounded-2xl bg-surface border border-slate-800 shadow-xl">
        <div className="step-header-row flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="step-title text-base font-bold text-white font-['Sora'] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs font-mono border border-purple-500/40">
                2
              </span>
              2. Elegir padres
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Especie seleccionada: <strong className="text-purple-300">{state.goalSpecies?.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/60 text-purple-300 flex items-center gap-1.5 transition-colors"
              onClick={() => setPcModalState({ isOpen: true, role: 'mother' })}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Cargar de PC Box</span>
            </button>
            <button
              type="button"
              className="btn-link text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium"
              onClick={() => setState((prev) => ({ ...prev, formStep: 'select-species' }))}
            >
              ← Cambiar especie
            </button>
          </div>
        </div>

        {/* Div de compatibilidad: no aparece al inicio si falta seleccionar algo */}
        {state.parents &&
          state.parents.father?.species &&
          state.parents.mother?.species &&
          (state.parents.compatible || (state.parents.reason && state.parents.reason !== 'Falta un progenitor')) && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              state.parents.compatible
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <span className="compatibility-status font-medium">
              {state.parents.compatible
                ? '✓ ' + (state.parents.reason || 'Esta pareja es fértil y compatible para cría y herencia determinista')
                : '✗ Esta pareja no es compatible: ' + (state.parents.reason || 'Verificar grupos huevo')}
            </span>
          </div>
        )}

        {/* Quick reminder on maternal species rule */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-center justify-between">
          <span>
            <strong className="text-pink-300 font-semibold">Regla Materna Diosesmon:</strong> La especie resultante de la eclosión siempre corresponde a la <strong className="text-pink-300">madre</strong> (o a la especie base no-Ditto si se cruza con Ditto).
          </span>
          <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-2">
            Ambos slots son 100% interactivos y configurables
          </span>
        </div>

        <div className="parents-display grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.parents.father && (
            <RoleSlot
              key="father"
              slotId="father"
              pokemon={{
                species: state.parents.father.species,
                gender: (state.parents.father.gender as Gender) || ('male' as Gender),
                ivs: state.parents.father.ivs || {
                  hp: 31,
                  attack: 31,
                  defense: 31,
                  spatk: 31,
                  spdef: 31,
                  speed: 31,
                },
                heldItem: state.parents.father.heldItem || null,
                fromPC: Boolean(state.parents.father.fromPC),
              }}
              ivsReadOnly={Boolean(state.parents.father.fromPC)}
              onGenderChange={(g) => handleParentGenderChange('father', g)}
              onSpeciesChange={(sp) => handleParentSpeciesChange('father', sp)}
              onIVChange={(statKey, val) => handleParentIVChange('father', statKey, val)}
              onHeldItemChange={(item) => handleParentHeldItemChange('father', item)}
              onOpenPCModal={() => setPcModalState({ isOpen: true, role: 'father' })}
            />
          )}
          {state.parents.mother && (
            <RoleSlot
              key="mother"
              slotId="mother"
              pokemon={{
                species: state.parents.mother.species,
                gender: (state.parents.mother.gender as Gender) || ('female' as Gender),
                ivs: state.parents.mother.ivs || {
                  hp: 31,
                  attack: 31,
                  defense: 31,
                  spatk: 31,
                  spdef: 31,
                  speed: 31,
                },
                heldItem: state.parents.mother.heldItem || null,
                fromPC: Boolean(state.parents.mother.fromPC),
              }}
              ivsReadOnly={Boolean(state.parents.mother.fromPC)}
              onGenderChange={(g) => handleParentGenderChange('mother', g)}
              onSpeciesChange={(sp) => handleParentSpeciesChange('mother', sp)}
              onIVChange={(statKey, val) => handleParentIVChange('mother', statKey, val)}
              onHeldItemChange={(item) => handleParentHeldItemChange('mother', item)}
              onOpenPCModal={() => setPcModalState({ isOpen: true, role: 'mother' })}
            />
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            className="btn-generate w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerateRoute}
            disabled={!state.parents.compatible}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar ruta de cría</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Renderizar árbol y paneles
  const renderGeneratedContent = () => {
    if (!state.tree || !state.estimate) {
      return null;
    }

    return (
      <div className="ivsmap-results flex flex-col gap-6">
        <div className="results-header-row flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-slate-800">
          <div>
            <h3 className="results-title text-base font-bold text-white font-['Sora'] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Resultado de la Cría & Árbol Visual
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ruta 100% determinista generada para {state.goalSpecies?.name}
              {startingMode === 'existing' && ' (Acelerada desde ejemplar base)'}
            </p>
          </div>

          {startingMode === 'existing' ? (
            <button
              type="button"
              className="btn-secondary px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
              onClick={() => setState((prev) => ({ ...prev, formStep: 'select-parents' }))}
            >
              Configurar Padres
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
              onClick={() => setState((prev) => ({ ...prev, formStep: 'select-species' }))}
            >
              ← Modificar Objetivo
            </button>
          )}
        </div>

        {/* Selector de visualización si hay ruta con Dittos o si se usó la estrategia con Dittos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Visualización de Ruta:
            </span>
            <span className="text-xs font-bold text-purple-300">
              {resultsViewMode === 'ditto' ? '🧬 Ruta Rápida con tus Dittos' : '🌿 Árbol de Torneo Tradicional'}
            </span>
          </div>

          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setResultsViewMode('ditto');
                if (!dittoPlan && state.goalSpecies) {
                  const plan = planDittoBreedingRoute(
                    { id: state.goalSpecies.id, name: state.goalSpecies.name },
                    activeTargetStats,
                    userDittos
                  );
                  setDittoPlan(plan);
                }
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                resultsViewMode === 'ditto'
                  ? 'bg-purple-600 text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Ruta con tus Dittos</span>
            </button>
            <button
              type="button"
              onClick={() => setResultsViewMode('tournament')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                resultsViewMode === 'tournament'
                  ? 'bg-purple-600 text-white shadow font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>Árbol de Torneo</span>
            </button>
          </div>
        </div>

        {/* Mostrar resultado en tiempo real: Árbol Visual y Tabla de Auditoría */}
        <div className="w-full">
          {resultsViewMode === 'ditto' ? (
            <DittoBreedingTree
              plan={
                dittoPlan ||
                planDittoBreedingRoute(
                  { id: state.goalSpecies?.id || 1, name: state.goalSpecies?.name || 'Pokémon' },
                  activeTargetStats,
                  userDittos
                )
              }
              targetSpeciesName={state.goalSpecies?.name}
              targetSpeciesId={state.goalSpecies?.id}
              nature={ivConfig.nature}
              useEverstone={ivConfig.useEverstone}
            />
          ) : (
            <BreedingTree
              treeData={state.tree}
              targetSpeciesName={state.goalSpecies?.name}
              targetSpeciesId={state.goalSpecies?.id}
              nature={ivConfig.nature}
              useEverstone={ivConfig.useEverstone}
              targetIVsCount={
                [ivConfig.hp, ivConfig.attack, ivConfig.defense, ivConfig.spatk, ivConfig.spdef, ivConfig.speed].filter(
                  (v) => v === 31
                ).length
              }
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ivsmap-app flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header institucional Diosesmon */}
      <header className="ivsmap-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-3">
          <DiosesmonLogo />
          <div>
            <h1 className="text-xl font-black tracking-tight text-ink font-['Sora']">
              IVsMap
            </h1>
            <p className="text-xs text-ink-muted">
              Planificador de Crianza • Cobblemon Diosesmon
            </p>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-line">
          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'planner'
                ? 'bg-brand text-ink shadow-[0_0_12px] shadow-brand/25 font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Planificador</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'pc'
                ? 'bg-brand text-ink shadow-[0_0_12px] shadow-brand/25 font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Banco PC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'rules'
                ? 'bg-brand text-ink shadow-[0_0_12px] shadow-brand/25 font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reglas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'checklist'
                ? 'bg-brand text-ink shadow-[0_0_12px] shadow-brand/25 font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Checklist</span>
          </button>
        </nav>

            {/*
              Session slot, deliberately inert. There is no identity layer yet: the PC
              bank lives in this browser's localStorage as a single implicit profile. A
              control that looks like it signs you in but does nothing would be a lie, so
              this one is disabled and its label says why. The storage contract is
              designed in #77 and lands after the breeding engine.
            */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Perfiles: próximamente"
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink-faint cursor-not-allowed"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfiles</span>
            </button>
      </header>

      {/* Contenido principal según pestaña activa */}
      <main className="ivsmap-main">

          {showWelcome && <WelcomeScreen onStart={startPlanning} />}

          {/* Every tab is gated on !showWelcome so the presentation replaces the flow
              instead of stacking above it. */}
        {!showWelcome && activeTab === 'planner' && (
          <>
            {state.formStep === 'select-species' && renderSpeciesSelector()}

            {state.formStep === 'select-parents' && startingMode === 'existing' && renderParentSelector()}

            {state.formStep === 'select-parents' && startingMode === 'scratch' && renderSpeciesSelector()}

            {state.formStep === 'generated' && renderGeneratedContent()}

            {state.formStep === 'review' && <p>Modo revisión</p>}
          </>
        )}

        {!showWelcome && activeTab === 'checklist' && (
          <DaycareChecklist targetSpeciesName={state.goalSpecies?.name || 'Pokémon Objetivo'} />
        )}

        {!showWelcome && activeTab === 'pc' && (
          <PCProgenitorBank
            selectedSpeciesName={state.goalSpecies?.name}
            onSelectProgenitor={handleProgenitorFromBank}
          />
        )}

        {!showWelcome && activeTab === 'rules' && <CompatibilityRulesMatrix />}
      </main>

      {/* Modal rápido del Banco PC */}
      <PCQuickPickerModal
        isOpen={pcModalState.isOpen}
        onClose={() => setPcModalState({ isOpen: false, role: 'base' })}
        targetRole={pcModalState.role}
        onSelect={handleModalSelect}
      />

      {/* Subtle brand footer */}
      <footer className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-faint font-mono">
        {/* The version is injected at build time from `package.json`, so it follows
            every release on its own. The store tariffs that used to sit here are
            gone: they were retyped from a source of truth no UI reads, and they
            listed three of the eight items. Money belongs next to the plan. */}
        <span>Diosesmon Crianza Pro • v{__APP_VERSION__}</span>
            <span>
              Desarrollado por{' '}
              <a
                href="https://github.com/KapsCa"
                target="_blank"
                rel="noreferrer"
                className="text-brand-soft underline-offset-2 transition-colors hover:text-ink hover:underline"
              >
                @KapsCa
              </a>
            </span>
      </footer>
    </div>
  );
};

export default IVsMapApp;
