import React, { useState, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Coins,
  Info,
  X,
  Layers,
  HelpCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Table,
  ListFilter,
  ShoppingBag,
} from 'lucide-react';
import type { BreedingTree as BreedingTreeType } from '../../../../domain/types/route';
import { ItemSprite } from '../atoms/ItemSprite';

export interface BreedingTreeProProps {
  treeData: BreedingTreeType;
  targetSpeciesName?: string;
  targetSpeciesId?: number;
  nature?: string;
  targetIVsCount?: number;
  simpleMode?: boolean;
  onModeToggle?: (mode: 'simple' | 'advanced') => void;
  useEverstone?: boolean;
}

interface StatDefinition {
  id: string;
  name: string;
  short: string;
  color: string;
  powerItem: string;
  itemKey: string;
  textColor?: string;
}

interface TournamentNode {
  id: string;
  branch: 'A' | 'B';
  level: number;
  index: number;
  x: number;
  y: number;
  r: number;
  gender: 'female' | 'male';
  stats: number[]; // Indices inside activeStats
  isNatureNode?: boolean;
  label: string;
  powerItemNeeded?: string;
  itemKey?: string;
}

interface SimplifiedRow {
  key: string;
  type: 'stat' | 'nature';
  statName: string;
  statColor: string;
  textColor?: string;
  itemKey: string;
  itemName: string;
  females: number;
  males: number;
  totalCaptures: number;
  brazales: number;
  costText: string;
}

export type TreeModelType = '6x31-pure' | '5x31-nature' | '5x31-basic' | '6x31-nature';

export const BreedingTreePro: React.FC<BreedingTreeProProps> = ({
  treeData,
  targetSpeciesName = 'Lucario',
  targetSpeciesId = 448,
  nature = 'Firme (Adamant)',
  targetIVsCount = 6,
  simpleMode: _simpleMode = false,
  onModeToggle: _onModeToggle,
  useEverstone = false,
}) => {
  // Modelo por defecto:
  // Si targetIVsCount === 6 -> 6x31-pure
  // Si targetIVsCount === 5:
  //   - Si usa Piedra Eterna -> 5x31-nature (doble rama trazada)
  //   - Si NO usa Piedra Eterna -> 5x31-basic (1 sola rama de 16 capturas + Menta recomendada)
  const defaultModel: TreeModelType = useMemo(() => {
    if (targetIVsCount === 6) return '6x31-pure';
    if (targetIVsCount === 5) {
      return useEverstone ? '5x31-nature' : '5x31-basic';
    }
    return '6x31-pure';
  }, [targetIVsCount, useEverstone]);

  const currentConfigKey = `${targetIVsCount}-${useEverstone}`;
  const [userModelOverride, setUserModelOverride] = useState<{ key: string; model: TreeModelType } | null>(null);

  const activeModel =
    userModelOverride && userModelOverride.key === currentConfigKey
      ? userModelOverride.model
      : defaultModel;

  const setActiveModel = (model: TreeModelType) => {
    setUserModelOverride({ key: currentConfigKey, model });
  };
  const [zoom, setZoom] = useState(90);
  const [selectedNode, setSelectedNode] = useState<TournamentNode | null>(null);
  const [pricingMode, setPricingMode] = useState<'diosesmon' | 'external'>('diosesmon');
  const [auditViewMode, setAuditViewMode] = useState<'simple' | 'matrix'>('simple');
  const [showExplanation, setShowExplanation] = useState(false);

  // 1. Estadísticas activas según el modelo
  const activeStats: StatDefinition[] = useMemo(() => {
    if (activeModel === '6x31-pure' || activeModel === '6x31-nature') {
      return [
        { id: 'hp', name: 'PS', short: 'PS', color: '#22c55e', powerItem: 'Pesa Recia', itemKey: 'power_weight' },
        { id: 'attack', name: 'Ataque', short: 'Atk', color: '#ef4444', powerItem: 'Brazal Recio', itemKey: 'power_bracer' },
        { id: 'defense', name: 'Defensa', short: 'Def', color: '#f97316', powerItem: 'Cinto Recio', itemKey: 'power_belt' },
        { id: 'spatk', name: 'A. Especial', short: 'At.Esp', color: '#a855f7', powerItem: 'Lente Recia', itemKey: 'power_lens' },
        { id: 'spdef', name: 'D. Especial', short: 'Def.Esp', color: '#eab308', powerItem: 'Banda Recia', itemKey: 'power_band', textColor: 'text-slate-950' },
        { id: 'speed', name: 'Velocidad', short: 'Vel', color: '#0ea5e9', powerItem: 'Franja Recia', itemKey: 'power_anklet' },
      ];
    }

    const ivs = treeData.root?.pokemon?.ivs;
    const isSpecial = !ivs || (ivs.spatk === 31 && ivs.attack !== 31) || (ivs.spatk || 0) > (ivs.attack || 0);

    if (isSpecial) {
      return [
        { id: 'hp', name: 'PS', short: 'PS', color: '#22c55e', powerItem: 'Pesa Recia', itemKey: 'power_weight' },
        { id: 'spatk', name: 'A. Especial', short: 'At.Esp', color: '#a855f7', powerItem: 'Lente Recia', itemKey: 'power_lens' },
        { id: 'defense', name: 'Defensa', short: 'Def', color: '#f97316', powerItem: 'Cinto Recio', itemKey: 'power_belt' },
        { id: 'spdef', name: 'D. Especial', short: 'Def.Esp', color: '#eab308', powerItem: 'Banda Recia', itemKey: 'power_band', textColor: 'text-slate-950' },
        { id: 'speed', name: 'Velocidad', short: 'Vel', color: '#0ea5e9', powerItem: 'Franja Recia', itemKey: 'power_anklet' },
      ];
    } else {
      return [
        { id: 'hp', name: 'PS', short: 'PS', color: '#22c55e', powerItem: 'Pesa Recia', itemKey: 'power_weight' },
        { id: 'attack', name: 'Ataque', short: 'Atk', color: '#ef4444', powerItem: 'Brazal Recio', itemKey: 'power_bracer' },
        { id: 'defense', name: 'Defensa', short: 'Def', color: '#f97316', powerItem: 'Cinto Recio', itemKey: 'power_belt' },
        { id: 'spdef', name: 'D. Especial', short: 'Def.Esp', color: '#eab308', powerItem: 'Banda Recia', itemKey: 'power_band', textColor: 'text-slate-950' },
        { id: 'speed', name: 'Velocidad', short: 'Vel', color: '#0ea5e9', powerItem: 'Franja Recia', itemKey: 'power_anklet' },
      ];
    }
  }, [treeData, activeModel]);

  const natureColor = '#ffffff';

  // 2. Construcción biológica y genética rigurosa de las ramas
  const { treeA, treeB, isDualTree } = useMemo(() => {
    // Generador de rama con herencia real:
    // Regla: La madre pasa exactamente 1 stat (o Naturaleza con Piedra Eterna),
    // el padre pasa exactamente 1 stat con su brazal recio,
    // y los stats que ambos progenitores ya tienen al 31 se conservan íntegros.
    const generateBranch = (
      branch: 'A' | 'B',
      yOffset: number,
      config: {
        apexStats: number[];
        p1: { stats: number[]; hasNat?: boolean }[];
        p2: { stats: number[]; hasNat?: boolean }[];
        p3: { stats: number[]; hasNat?: boolean; gender: 'female' | 'male' }[];
        p4: { stat: number; hasNat?: boolean; gender: 'female' | 'male' }[];
        hasNatureBranch?: boolean;
      }
    ) => {
      const nodeList: TournamentNode[] = [];
      const connList: { from: TournamentNode; to: TournamentNode }[] = [];

      // Nivel 0 (Ápice)
      const apex: TournamentNode = {
        id: `${branch}-0-0`,
        branch,
        level: 0,
        index: 0,
        x: 440,
        y: yOffset + 40,
        r: 24,
        gender: branch === 'A' ? 'female' : 'male',
        stats: config.apexStats,
        isNatureNode: config.hasNatureBranch,
        label: `Progenitor Rama ${branch} (${config.hasNatureBranch ? 'Naturaleza + 4x31' : `${config.apexStats.length}x31`})`,
        powerItemNeeded: config.hasNatureBranch
          ? 'Piedra Eterna'
          : activeStats[config.apexStats[0]]?.powerItem,
        itemKey: config.hasNatureBranch ? 'everstone' : activeStats[config.apexStats[0]]?.itemKey,
      };
      nodeList.push(apex);

      // Nivel 1 (2 Padres de la rama)
      const p1_0: TournamentNode = {
        id: `${branch}-1-0`,
        branch,
        level: 1,
        index: 0,
        x: 250,
        y: yOffset + 105,
        r: 20,
        gender: 'female',
        stats: config.p1[0].stats,
        isNatureNode: config.p1[0].hasNat,
        label: `Madre N1 (Rama ${branch})`,
        powerItemNeeded: config.p1[0].hasNat
          ? 'Piedra Eterna'
          : activeStats[config.p1[0].stats[0]]?.powerItem,
        itemKey: config.p1[0].hasNat ? 'everstone' : activeStats[config.p1[0].stats[0]]?.itemKey,
      };
      const p1_1: TournamentNode = {
        id: `${branch}-1-1`,
        branch,
        level: 1,
        index: 1,
        x: 630,
        y: yOffset + 105,
        r: 20,
        gender: 'male',
        stats: config.p1[1].stats,
        label: `Padre N1 (Rama ${branch})`,
        powerItemNeeded: activeStats[config.p1[1].stats[config.p1[1].stats.length - 1]]?.powerItem,
        itemKey: activeStats[config.p1[1].stats[config.p1[1].stats.length - 1]]?.itemKey,
      };
      nodeList.push(p1_0, p1_1);
      connList.push({ from: apex, to: p1_0 }, { from: apex, to: p1_1 });

      // Nivel 2 (4 Abuelos)
      const p2X = [160, 340, 540, 720];
      const p2Genders: ('female' | 'male')[] = ['female', 'male', 'female', 'male'];
      const p2Nodes: TournamentNode[] = config.p2.map((cfg, i) => ({
        id: `${branch}-2-${i}`,
        branch,
        level: 2,
        index: i,
        x: p2X[i],
        y: yOffset + 170,
        r: 17,
        gender: p2Genders[i],
        stats: cfg.stats,
        isNatureNode: cfg.hasNat,
        label: `${p2Genders[i] === 'female' ? 'Abuela' : 'Abuelo'} F2-${i + 1} (Rama ${branch})`,
        powerItemNeeded: cfg.hasNat ? 'Piedra Eterna' : activeStats[cfg.stats[0]]?.powerItem,
        itemKey: cfg.hasNat ? 'everstone' : activeStats[cfg.stats[0]]?.itemKey,
      }));
      nodeList.push(...p2Nodes);
      connList.push(
        { from: p1_0, to: p2Nodes[0] },
        { from: p1_0, to: p2Nodes[1] },
        { from: p1_1, to: p2Nodes[2] },
        { from: p1_1, to: p2Nodes[3] }
      );

      // Nivel 3 (8 Bisabuelos)
      const p3X = [110, 210, 290, 390, 490, 590, 670, 770];
      const p3Nodes: TournamentNode[] = config.p3.map((cfg, i) => ({
        id: `${branch}-3-${i}`,
        branch,
        level: 3,
        index: i,
        x: p3X[i],
        y: yOffset + 235,
        r: 15,
        gender: cfg.gender,
        stats: cfg.stats,
        isNatureNode: cfg.hasNat,
        label: `Bisabuelo/a N3-${i + 1} (Rama ${branch})`,
        powerItemNeeded: cfg.hasNat
          ? 'Piedra Eterna'
          : activeStats[cfg.stats[0]]?.powerItem,
        itemKey: cfg.hasNat ? 'everstone' : activeStats[cfg.stats[0]]?.itemKey,
      }));
      nodeList.push(...p3Nodes);

      for (let i = 0; i < 4; i++) {
        connList.push(
          { from: p2Nodes[i], to: p3Nodes[2 * i] },
          { from: p2Nodes[i], to: p3Nodes[2 * i + 1] }
        );
      }

      // Nivel 4 (16 Hojas Base 1x31)
      const p4X = [75, 120, 175, 220, 270, 315, 365, 410, 470, 515, 565, 610, 660, 705, 755, 800];
      const p4Nodes: TournamentNode[] = config.p4.map((cfg, i) => {
        const itemNeeded = cfg.hasNat
          ? 'Piedra Eterna'
          : activeStats[cfg.stat]?.powerItem;
        const itemKey = cfg.hasNat ? 'everstone' : activeStats[cfg.stat]?.itemKey;

        return {
          id: `${branch}-4-${i}`,
          branch,
          level: 4,
          index: i,
          x: p4X[i],
          y: yOffset + 300,
          r: 13,
          gender: cfg.gender,
          stats: [cfg.stat],
          isNatureNode: cfg.hasNat,
          label: cfg.hasNat
            ? `Captura Base con Naturaleza (${nature.split(' ')[0]}) + Piedra Eterna`
            : `Captura Base 1x31 ${activeStats[cfg.stat]?.name || ''}`,
          powerItemNeeded: itemNeeded,
          itemKey,
        };
      });
      nodeList.push(...p4Nodes);

      for (let i = 0; i < 8; i++) {
        connList.push(
          { from: p3Nodes[i], to: p4Nodes[2 * i] },
          { from: p3Nodes[i], to: p4Nodes[2 * i + 1] }
        );
      }

      return { nodeList, connList, apex };
    };

    if (activeModel === '6x31-pure') {
      // 6x31 COMPLETO (32 capturas base, 31 cruces sin fallas)
      // Rama A: Produce un 5x31 con stats [0, 1, 2, 3, 4] (PS, Atk, Def, SpA, SpD)
      // Rama B: Produce un 5x31 complementario con stats [1, 2, 3, 4, 5] (Atk, Def, SpA, SpD, Vel)
      // Cruce Final entre Apex A y Apex B:
      // Apex A equipa Pesa Recia (PS 0), Apex B equipa Franja Recia (Vel 5).
      // Comparten [1, 2, 3, 4] (Atk, Def, SpA, SpD).
      // RESULTADO: [0, 1, 2, 3, 4, 5] = 6x31 PERFECTO!

      const subA = generateBranch('A', 0, {
        apexStats: [0, 1, 2, 3, 4],
        p1: [
          { stats: [0, 1, 2, 3] }, // Madre N1: PS, Atk, Def, SpA
          { stats: [1, 2, 3, 4] }, // Padre N1: Atk, Def, SpA, SpD
        ],
        p2: [
          { stats: [0, 1, 2] },    // F2-1: PS, Atk, Def
          { stats: [1, 2, 3] },    // F2-2: Atk, Def, SpA
          { stats: [1, 2, 3] },    // F2-3: Atk, Def, SpA
          { stats: [2, 3, 4] },    // F2-4: Def, SpA, SpD
        ],
        p3: [
          { stats: [0, 1], gender: 'female' }, // PS, Atk
          { stats: [1, 2], gender: 'male' },   // Atk, Def
          { stats: [1, 2], gender: 'female' }, // Atk, Def
          { stats: [1, 3], gender: 'male' },   // Atk, SpA
          { stats: [1, 2], gender: 'female' }, // Atk, Def
          { stats: [1, 3], gender: 'male' },   // Atk, SpA
          { stats: [2, 3], gender: 'female' }, // Def, SpA
          { stats: [2, 4], gender: 'male' },   // Def, SpD
        ],
        p4: [
          { stat: 0, gender: 'female' }, // PS (1x31 Base PS Hembra)
          { stat: 1, gender: 'male' },   // Atk
          { stat: 1, gender: 'female' }, // Atk
          { stat: 2, gender: 'male' },   // Def
          { stat: 1, gender: 'female' }, // Atk
          { stat: 2, gender: 'male' },   // Def
          { stat: 1, gender: 'female' }, // Atk
          { stat: 3, gender: 'male' },   // SpA
          { stat: 1, gender: 'female' }, // Atk
          { stat: 2, gender: 'male' },   // Def
          { stat: 1, gender: 'female' }, // Atk
          { stat: 3, gender: 'male' },   // SpA
          { stat: 2, gender: 'female' }, // Def
          { stat: 3, gender: 'male' },   // SpA
          { stat: 2, gender: 'female' }, // Def
          { stat: 4, gender: 'male' },   // SpD
        ],
      });

      const subB = generateBranch('B', 0, {
        apexStats: [1, 2, 3, 4, 5],
        p1: [
          { stats: [1, 2, 3, 4] }, // Madre N1: Atk, Def, SpA, SpD
          { stats: [2, 3, 4, 5] }, // Padre N1: Def, SpA, SpD, Vel
        ],
        p2: [
          { stats: [1, 2, 3] },    // F2-1: Atk, Def, SpA
          { stats: [2, 3, 4] },    // F2-2: Def, SpA, SpD
          { stats: [2, 3, 4] },    // F2-3: Def, SpA, SpD
          { stats: [3, 4, 5] },    // F2-4: SpA, SpD, Vel
        ],
        p3: [
          { stats: [1, 2], gender: 'female' }, // Atk, Def
          { stats: [1, 3], gender: 'male' },   // Atk, SpA
          { stats: [2, 3], gender: 'female' }, // Def, SpA
          { stats: [2, 4], gender: 'male' },   // Def, SpD
          { stats: [2, 3], gender: 'female' }, // Def, SpA
          { stats: [2, 4], gender: 'male' },   // Def, SpD
          { stats: [3, 4], gender: 'female' }, // SpA, SpD
          { stats: [3, 5], gender: 'male' },   // SpA, Vel
        ],
        p4: [
          { stat: 1, gender: 'female' }, // Atk
          { stat: 2, gender: 'male' },   // Def
          { stat: 1, gender: 'female' }, // Atk
          { stat: 3, gender: 'male' },   // SpA
          { stat: 2, gender: 'female' }, // Def
          { stat: 3, gender: 'male' },   // SpA
          { stat: 2, gender: 'female' }, // Def
          { stat: 4, gender: 'male' },   // SpD
          { stat: 2, gender: 'female' }, // Def
          { stat: 3, gender: 'male' },   // SpA
          { stat: 2, gender: 'female' }, // Def
          { stat: 4, gender: 'male' },   // SpD
          { stat: 3, gender: 'female' }, // SpA
          { stat: 4, gender: 'male' },   // SpD
          { stat: 3, gender: 'female' }, // SpA
          { stat: 5, gender: 'male' },   // Vel
        ],
      });

      return { treeA: subA, treeB: subB, isDualTree: true };
    }

    if (activeModel === '5x31-nature') {
      // 5x31 CON SELECCIÓN DE NATURALEZA (CORREGIDO BIOLÓGICAMENTE)
      // Rama A: Stats [0, 1, 2, 3] (PS, Atk, Def, SpD)
      const subA = generateBranch('A', 0, {
        apexStats: [0, 1, 2, 3],
        p1: [
          { stats: [0, 1, 2] },
          { stats: [1, 2, 3] },
        ],
        p2: [
          { stats: [0, 1] },
          { stats: [1, 2] },
          { stats: [1, 2] },
          { stats: [2, 3] },
        ],
        p3: [
          { stats: [0, 1], gender: 'female' },
          { stats: [1, 2], gender: 'male' },
          { stats: [1, 2], gender: 'female' },
          { stats: [1, 3], gender: 'male' },
          { stats: [1, 2], gender: 'female' },
          { stats: [1, 3], gender: 'male' },
          { stats: [2, 3], gender: 'female' },
          { stats: [2, 3], gender: 'male' },
        ],
        p4: [
          { stat: 0, gender: 'female' }, // PS Base (1x31 Hembra)
          { stat: 1, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 2, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 2, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 3, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 2, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 3, gender: 'male' },
          { stat: 2, gender: 'female' },
          { stat: 3, gender: 'male' },
          { stat: 2, gender: 'female' },
          { stat: 3, gender: 'male' },
        ],
      });

      // Rama B con Naturaleza:
      // Hoja 0: Hembra con Naturaleza (⚪ Piedra Eterna)
      // Hoja 1: Macho con Stat 1 (🔴 Brazal Recio)
      // CRÍA F3-0: HEREDA NATURALEZA (⚪) Y STAT 1 (🔴) -> ¡Tiene ⚪ y 🔴!
      const subB = generateBranch('B', 0, {
        apexStats: [1, 2, 4],
        hasNatureBranch: true,
        p1: [
          { stats: [1, 2], hasNat: true }, // Madre N1: ⚪ Naturaleza + Stat 1 + Stat 2
          { stats: [1, 2, 4] },            // Padre N1: Stat 1 + Stat 2 + Stat 4 (Vel)
        ],
        p2: [
          { stats: [1, 2], hasNat: true }, // F2-1: ⚪ Naturaleza + Stat 1 + Stat 2
          { stats: [1, 2] },               // F2-2: Stat 1 + Stat 2
          { stats: [1, 2] },               // F2-3: Stat 1 + Stat 2
          { stats: [2, 4] },               // F2-4: Stat 2 + Stat 4
        ],
        p3: [
          // ¡Aquí está la corrección clave que solicitó el usuario!
          // Madre (Hoja 0) con ⚪ + Padre (Hoja 1) con 🔴 -> Cría F3-0 tiene ⚪ (Naturaleza) Y 🔴 (Stat 1)
          { stats: [1], hasNat: true, gender: 'female' },
          { stats: [1, 2], gender: 'male' },
          { stats: [1, 2], gender: 'female' },
          { stats: [1, 4], gender: 'male' },
          { stats: [1, 2], gender: 'female' },
          { stats: [1, 4], gender: 'male' },
          { stats: [2, 4], gender: 'female' },
          { stats: [2, 4], gender: 'male' },
        ],
        p4: [
          { stat: 0, hasNat: true, gender: 'female' }, // Hoja 0: Naturaleza + Piedra Eterna
          { stat: 1, gender: 'male' },                 // Hoja 1: Stat 1 (Rojo) + Brazal Recio
          { stat: 1, gender: 'female' },
          { stat: 2, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 2, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 4, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 2, gender: 'male' },
          { stat: 1, gender: 'female' },
          { stat: 4, gender: 'male' },
          { stat: 2, gender: 'female' },
          { stat: 4, gender: 'male' },
          { stat: 2, gender: 'female' },
          { stat: 4, gender: 'male' },
        ],
      });

      return { treeA: subA, treeB: subB, isDualTree: true };
    }

    // 5x31 Básico (1 Rama)
    const subA = generateBranch('A', 0, {
      apexStats: [0, 1, 2, 3, 4],
      p1: [{ stats: [0, 1, 2, 3] }, { stats: [1, 2, 3, 4] }],
      p2: [
        { stats: [0, 1, 2] },
        { stats: [1, 2, 3] },
        { stats: [1, 2, 3] },
        { stats: [2, 3, 4] },
      ],
      p3: [
        { stats: [0, 1], gender: 'female' },
        { stats: [1, 2], gender: 'male' },
        { stats: [1, 2], gender: 'female' },
        { stats: [1, 3], gender: 'male' },
        { stats: [1, 2], gender: 'female' },
        { stats: [1, 3], gender: 'male' },
        { stats: [2, 3], gender: 'female' },
        { stats: [2, 4], gender: 'male' },
      ],
      p4: [
        { stat: 0, gender: 'female' },
        { stat: 1, gender: 'male' },
        { stat: 1, gender: 'female' },
        { stat: 2, gender: 'male' },
        { stat: 1, gender: 'female' },
        { stat: 2, gender: 'male' },
        { stat: 1, gender: 'female' },
        { stat: 3, gender: 'male' },
        { stat: 1, gender: 'female' },
        { stat: 2, gender: 'male' },
        { stat: 1, gender: 'female' },
        { stat: 3, gender: 'male' },
        { stat: 2, gender: 'female' },
        { stat: 3, gender: 'male' },
        { stat: 2, gender: 'female' },
        { stat: 4, gender: 'male' },
      ],
    });

    return { treeA: subA, treeB: null, isDualTree: false };
  }, [activeModel, activeStats, nature]);

  // 3. Auditoría Financiera y de Capturas
  const auditData = useMemo(() => {
    if (activeModel === '6x31-pure') {
      // 6 Stats Completos (32 capturas 1x31 base, 31 cruces, 62 brazales)
      const femaleCounts = [5, 10, 10, 5, 1, 0];
      const maleCounts = [0, 1, 5, 10, 10, 5];
      const totalCaptures = [1, 5, 10, 10, 5, 1]; // Suma = 32 capturas base
      const brazales = [5, 11, 15, 15, 11, 5];   // Suma = 62 brazales (31 cruces * 2)
      const totalBrazales = 62;
      const totalEverstone = 0;

      const diosesmonBrazalesCost = totalBrazales * 500; // 31,000 Pk$
      const diosesmonEverstoneCost = 0;
      const diosesmonSexCost = 31 * 500; // 15,500 Pk$
      const diosesmonTotal = diosesmonBrazalesCost + diosesmonSexCost; // 46,500 Pk$

      const externalBrazalesByStat = [50, 110, 150, 150, 110, 50]; // en 'k'
      const externalTotalK = 775; // 775k Pk$

      return {
        femaleCounts,
        maleCounts,
        totalCaptures,
        brazales,
        totalBrazales,
        totalEverstone,
        diosesmonBrazalesCost,
        diosesmonEverstoneCost,
        diosesmonSexCost,
        diosesmonTotal,
        externalBrazalesByStat,
        externalTotalK,
      };
    } else if (activeModel === '5x31-nature') {
      // 5 Stats + Naturaleza (31 cruces, 57 brazales + 5 piedras eternas = 62 objetos)
      // Pesa Recia (PS): 5 hembras la equipan en el árbol (incluyendo el cruce final) y 0 machos = 5 pesas recias
      const femaleCounts = [5, 14, 7, 1, 0];
      const maleCounts = [0, 2, 8, 10, 10];
      const totalCaptures = [1, 10, 9, 6, 5];
      const brazales = [5, 16, 15, 11, 10];
      const totalBrazales = 57;
      const totalEverstone = 5;

      const diosesmonBrazalesCost = totalBrazales * 500; // 28,500 Pk$
      const diosesmonEverstoneCost = totalEverstone * 500; // 2,500 Pk$
      const diosesmonSexCost = 31 * 500; // 15,500 Pk$
      const diosesmonTotal = diosesmonBrazalesCost + diosesmonEverstoneCost + diosesmonSexCost; // 46,500 Pk$

      const externalBrazalesByStat = [50, 160, 150, 110, 100];
      const externalTotalK = 686;

      return {
        femaleCounts,
        maleCounts,
        totalCaptures,
        brazales,
        totalBrazales,
        totalEverstone,
        diosesmonBrazalesCost,
        diosesmonEverstoneCost,
        diosesmonSexCost,
        diosesmonTotal,
        externalBrazalesByStat,
        externalTotalK,
      };
    } else {
      // 5x31 Básico (1 Rama, 15 cruces, 30 brazales)
      const femaleCounts = [4, 6, 4, 1, 0];
      const maleCounts = [0, 1, 4, 6, 4];
      const totalCaptures = [1, 5, 5, 4, 1];
      const brazales = [4, 7, 8, 7, 4];
      const totalBrazales = 30;
      const totalEverstone = 0;
      const diosesmonBrazalesCost = 30 * 500;
      const diosesmonEverstoneCost = 0;
      const diosesmonSexCost = 15 * 500;
      const diosesmonTotal = diosesmonBrazalesCost + diosesmonSexCost;
      const externalBrazalesByStat = [40, 70, 80, 70, 40];
      const externalTotalK = 350;

      return {
        femaleCounts,
        maleCounts,
        totalCaptures,
        brazales,
        totalBrazales,
        totalEverstone,
        diosesmonBrazalesCost,
        diosesmonEverstoneCost,
        diosesmonSexCost,
        diosesmonTotal,
        externalBrazalesByStat,
        externalTotalK,
      };
    }
  }, [activeModel]);

  // Filas para la tabla simplificada limpia y fácil de entender
  const simplifiedRows = useMemo(() => {
    const rows: SimplifiedRow[] = activeStats.map((st, i) => {
      const fCount = auditData.femaleCounts[i] || 0;
      const mCount = auditData.maleCounts[i] || 0;
      const captures = auditData.totalCaptures[i] || 0;
      const brazales = auditData.brazales[i] || 0;
      const costText =
        pricingMode === 'diosesmon'
          ? `${(brazales * 500).toLocaleString()} Pk$`
          : `${auditData.externalBrazalesByStat[i]}k Pk$`;

      return {
        key: st.id,
        type: 'stat' as const,
        statName: st.name,
        statColor: st.color,
        textColor: st.textColor,
        itemKey: st.itemKey,
        itemName: st.powerItem,
        females: fCount,
        males: mCount,
        totalCaptures: captures,
        brazales,
        costText,
      };
    });

    if (activeModel === '5x31-nature') {
      rows.push({
        key: 'nature',
        type: 'nature' as const,
        statName: `Naturaleza (${nature.split(' ')[0]})`,
        statColor: '#ffffff',
        textColor: 'text-slate-900',
        itemKey: 'everstone',
        itemName: 'Piedra Eterna',
        females: 4,
        males: 1,
        totalCaptures: 1,
        brazales: auditData.totalEverstone,
        costText:
          pricingMode === 'diosesmon'
            ? `${(auditData.totalEverstone * 500).toLocaleString()} Pk$`
            : '50k Pk$',
      });
    }

    return rows;
  }, [activeStats, auditData, activeModel, nature, pricingMode]);

  const totalFemales = useMemo(() => {
    const statsF = auditData.femaleCounts.reduce((a, b) => a + b, 0);
    return activeModel === '5x31-nature' ? statsF + 4 : statsF;
  }, [auditData.femaleCounts, activeModel]);

  const totalMales = useMemo(() => {
    const statsM = auditData.maleCounts.reduce((a, b) => a + b, 0);
    return activeModel === '5x31-nature' ? statsM + 1 : statsM;
  }, [auditData.maleCounts, activeModel]);

  const totalCapturesCount = totalFemales + totalMales;
  const totalItemsCount = auditData.totalBrazales + auditData.totalEverstone;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 140));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 55));
  const handleZoomReset = () => setZoom(90);

  // Scroll suave hacia secciones del árbol
  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Helper para renderizar un nodo circular con sus rebanadas de color
  const renderCircleNode = (node: TournamentNode) => {
    const isSelected = selectedNode?.id === node.id;
    const totalSlices = node.stats.length + (node.isNatureNode ? 1 : 0);

    return (
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        className="cursor-pointer group"
        onClick={() => setSelectedNode(node)}
      >
        <defs>
          <clipPath id={`clip-${node.id}`}>
            <circle r={node.r} cx={0} cy={0} />
          </clipPath>
        </defs>

        {/* Halo de selección */}
        {isSelected && (
          <circle
            r={node.r + 5}
            cx={0}
            cy={0}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            className="animate-spin"
          />
        )}

        {/* Franjas verticales de stats */}
        <g clipPath={`url(#clip-${node.id})`} filter="url(#nodeShadow)">
          {/* Si es nodo con naturaleza, la primera franja es blanca */}
          {node.isNatureNode && (
            <rect
              x={-node.r}
              y={-node.r}
              width={(2 * node.r) / totalSlices + 0.4}
              height={2 * node.r}
              fill={natureColor}
            />
          )}

          {node.stats.map((statIdx, sIdx) => {
            const offsetIdx = node.isNatureNode ? sIdx + 1 : sIdx;
            const sliceWidth = (2 * node.r) / totalSlices;
            const sliceX = -node.r + offsetIdx * sliceWidth;
            const color = activeStats[statIdx]?.color || '#94a3b8';
            return (
              <rect
                key={sIdx}
                x={sliceX}
                y={-node.r}
                width={sliceWidth + 0.4}
                height={2 * node.r}
                fill={color}
              />
            );
          })}
        </g>

        {/* Borde exterior del nodo */}
        <circle
          r={node.r}
          cx={0}
          cy={0}
          fill="none"
          stroke="rgba(15, 23, 42, 0.95)"
          strokeWidth="1.8"
        />

        {/* Símbolo de Sexo (♀ Rosa / ♂ Azul) centrado */}
        <text
          x={0}
          y={node.r * 0.38}
          textAnchor="middle"
          fontSize={node.r * 1.15}
          fontWeight="900"
          fill={node.gender === 'female' ? 'var(--color-role-female)' : 'var(--color-role-male)'}
          stroke="rgba(0, 0, 0, 0.85)"
          strokeWidth="1.2"
          className="select-none pointer-events-none font-bold"
        >
          {node.gender === 'female' ? '♀' : '♂'}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 rounded-2xl bg-canvas border border-purple-500/25 shadow-2xl">
      {/* Header Principal con Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold font-['Sora'] text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Árbol de Cría IVsMap
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-semibold">
              Cobblemon Engine
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              Tarifas Diosesmon (500 Pk$)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualización determinista para <strong>{targetSpeciesName}</strong>
            {activeModel === '5x31-basic'
              ? ` • Menta recomendada: ${nature.split(' ')[0]} (1 sola rama de 16 base)`
              : activeModel === '5x31-nature'
              ? ` • Naturaleza ${nature.split(' ')[0]} heredada con Piedra Eterna (doble rama)`
              : nature
              ? ` con Naturaleza ${nature}`
              : ''} • Modelo piramidal binario
          </p>
        </div>

        {/* Selector de Modelos de Árbol */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveModel('6x31-pure')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer ${
                activeModel === '6x31-pure'
                  ? 'bg-purple-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Árbol completo de 6x31 con 32 capturas base y 31 cruzas garantizadas"
            >
              <span>💎</span>
              <span>6x31 Completo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModel('5x31-basic')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer ${
                activeModel === '5x31-basic'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Método económico de 1 sola rama de 16 base (15 cruces) + uso de Menta al final (Ahorro 50%)"
            >
              <span>🌱</span>
              <span>5x31 + Menta</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold ml-0.5">
                Ahorro 50%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModel('5x31-nature')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer ${
                activeModel === '5x31-nature'
                  ? 'bg-purple-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Árbol doble trazado con Piedra Eterna si uno de los progenitores ya posee la naturaleza deseada"
            >
              <span>⭐</span>
              <span>5x31 + Piedra Eterna</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              title="Alejar Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 min-w-[36px] text-center">{zoom}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              title="Acercar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white ml-0.5 cursor-pointer"
              title="Restablecer vista"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* TARJETA DE RECOMENDACIÓN ESTRATÉGICA: MÉTODO ECONÓMICO VS MÉTODO RÁPIDO CON PADRES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Opción 1: Método Económico con Menta al final */}
        <div
          onClick={() => setActiveModel('5x31-basic')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
            activeModel === '5x31-basic'
              ? 'bg-gradient-to-br from-emerald-950/70 to-slate-900/90 border-emerald-500/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ItemSprite item="mint" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-300 text-xs font-['Sora']">
                    Método Económico Recomendado
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-500/40">
                    Ahorra 50%
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  1 Rama • 16 Capturas • 15 Cruces + Menta
                </span>
              </div>
            </div>
            {activeModel === '5x31-basic' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                Activo
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Cría este árbol en <strong>1 sola rama (15 cruces)</strong>. Al eclosionar tu cría 5x31, simplemente dale una{' '}
            <strong className="text-emerald-300">Menta de Naturaleza ({nature.split(' ')[0]})</strong> para fijar los modificadores.
            Ahorras <strong>16 capturas silvestres</strong> y <strong>~24,000 Pk$</strong> en brazales y sexo.
          </p>
        </div>

        {/* Opción 2: Método Rápido con Naturaleza en los Padres */}
        <div
          onClick={() => setActiveModel('5x31-nature')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
            activeModel === '5x31-nature'
              ? 'bg-gradient-to-br from-purple-950/70 to-slate-900/90 border-purple-500/70 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/30'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <ItemSprite item="everstone" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-purple-300 text-xs font-['Sora']">
                    Método Rápido con Naturaleza en Padres
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-500/40">
                    Trazado Heredado
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  2 Ramas • Piedra Eterna en cadena
                </span>
              </div>
            </div>
            {activeModel === '5x31-nature' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                Activo
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Si uno de tus Pokémon capturados o en tu PC ya tiene la naturaleza deseada (
            <strong className="text-purple-300">{nature.split(' ')[0]}</strong>), se traza el árbol asignándole directamente la{' '}
            <strong className="text-white">Piedra Eterna</strong> a ese padre en la rama inferior para transmitirla en cada cruce.
          </p>
        </div>
      </div>

      {/* Botones de navegación rápida para navegar el árbol fácilmente */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
        <span className="font-semibold text-purple-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          Navegación del Árbol:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => scrollToSection('rama-superior-a')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/50 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowUp className="w-3 h-3 text-purple-400" />
            <span>{isDualTree ? 'Rama Superior A' : 'Árbol Principal (15 Cruces)'}</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('resultado-final-banner')}
            className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>Resultado Final</span>
          </button>
          {isDualTree && (
            <button
              type="button"
              onClick={() => scrollToSection('rama-inferior-b')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/50 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowDown className="w-3 h-3 text-purple-400" />
              <span>Rama Inferior B</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenedor del Mapa Visual (Lienzo completo sin cortes inferiores) */}
      <div className="relative w-full rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0e1626] via-[#090f1a] to-[#060910] shadow-2xl p-4 sm:p-6 flex flex-col items-center pb-12">
        {/* Fondo estilizado */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* 1. LEYENDA SUPERIOR CON SPRITES DE LOS BRAZALES */}
        <div className="z-10 mb-6 px-5 py-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg flex items-center justify-center gap-4 sm:gap-6 flex-wrap backdrop-blur-md">
          {activeStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <ItemSprite item={stat.itemKey} size={22} showTooltip />
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: stat.color }}
              />
              <span>{stat.name}</span>
            </div>
          ))}

          {/* Naturaleza (Piedra Eterna) */}
          {activeModel === '5x31-nature' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <ItemSprite item="everstone" size={22} showTooltip />
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-900 shadow-sm shrink-0" />
              <span>Naturaleza ({nature.split(' ')[0]})</span>
            </div>
          )}
        </div>

        {/* 2. ÁRBOLES SVG CON ZOOM Y CONTENEDOR TOTALMENTE VISIBLE */}
        <div className="w-full overflow-x-auto overflow-y-visible flex justify-center py-2">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              marginBottom: isDualTree ? `${Math.round(80 * (zoom / 100))}px` : '0px',
            }}
            className="w-[880px] shrink-0 flex flex-col items-center gap-6"
          >
            {/* Defs de sombras */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.45" />
                </filter>
              </defs>
            </svg>

            {/* ÁRBOL SUPERIOR (Rama A) */}
            <div
              id="rama-superior-a"
              className="w-full p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner"
            >
              <div className="text-[11px] font-mono text-purple-300 font-bold mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>
                    {isDualTree
                      ? activeModel === '6x31-pure'
                        ? 'RAMA SUPERIOR A (5x31: PS + Atk + Def + SpA + SpD - 16 Capturas Base)'
                        : 'RAMA SUPERIOR A (Línea de Stats Principales - 16 Capturas Base)'
                      : 'Árbol de Crianza Completo (16 Capturas Base)'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">15 Cruces • 30 Brazales</span>
              </div>
              <svg viewBox="0 0 880 340" className="w-full h-auto overflow-visible select-none drop-shadow-md">
                {/* Conexiones */}
                <g className="connections">
                  {treeA.connList.map((conn, idx) => (
                    <line
                      key={idx}
                      x1={conn.from.x}
                      y1={conn.from.y + conn.from.r}
                      x2={conn.to.x}
                      y2={conn.to.y - conn.to.r}
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  ))}
                </g>
                {/* Nodos */}
                <g className="nodes">{treeA.nodeList.map((node) => renderCircleNode(node))}</g>
              </svg>
            </div>

            {/* BANNER CENTRAL "RESULTADO FINAL" CON 6 STATS COMPLETOS */}
            {isDualTree && treeB && (
              <div
                id="resultado-final-banner"
                className="w-full max-w-xl my-2 p-4 rounded-2xl bg-gradient-to-r from-slate-200 via-white to-slate-200 shadow-2xl border border-slate-300 flex flex-col items-center justify-center text-slate-900"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-black tracking-wider text-red-600 font-['Sora'] uppercase">
                    RESULTADO FINAL: {activeModel === '6x31-pure' ? '6x31 PERFECTO' : '5x31 CON NATURALEZA'}
                  </h3>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>

                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                  {/* Progenitor Rama A */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="relative flex items-center justify-center">
                      <svg width="56" height="56" viewBox="0 0 56 56" className="overflow-visible drop-shadow">
                        <g transform="translate(28, 28)">
                          <defs>
                            <clipPath id="clip-final-a">
                              <circle r="24" cx="0" cy="0" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#clip-final-a)">
                            {activeModel === '6x31-pure' ? (
                              <>
                                <rect x="-24" y="-24" width="9.6" height="48" fill={activeStats[0]?.color} />
                                <rect x="-14.4" y="-24" width="9.6" height="48" fill={activeStats[1]?.color} />
                                <rect x="-4.8" y="-24" width="9.6" height="48" fill={activeStats[2]?.color} />
                                <rect x="4.8" y="-24" width="9.6" height="48" fill={activeStats[3]?.color} />
                                <rect x="14.4" y="-24" width="9.6" height="48" fill={activeStats[4]?.color} />
                              </>
                            ) : (
                              <>
                                <rect x="-24" y="-24" width="12" height="48" fill={activeStats[0]?.color} />
                                <rect x="-12" y="-24" width="12" height="48" fill={activeStats[1]?.color} />
                                <rect x="0" y="-24" width="12" height="48" fill={activeStats[2]?.color} />
                                <rect x="12" y="-24" width="12" height="48" fill={activeStats[3]?.color} />
                              </>
                            )}
                          </g>
                          <circle r="24" cx="0" cy="0" fill="none" stroke="var(--color-line)" strokeWidth="2.2" />
                          <text
                            x="0"
                            y="9"
                            textAnchor="middle"
                            fontSize="26"
                            fontWeight="900"
                            fill="var(--color-role-female)"
                            stroke="#000"
                            strokeWidth="1"
                          >
                            ♀
                          </text>
                        </g>
                      </svg>
                      {/* Sprite de brazal equipado */}
                      <div className="absolute -top-1 -right-2 bg-slate-900 rounded-full p-0.5 border border-slate-700 shadow">
                        <ItemSprite
                          item={activeModel === '6x31-pure' ? activeStats[0]?.itemKey : activeStats[0]?.itemKey}
                          size={18}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">
                      {activeModel === '6x31-pure' ? 'Rama A (5x31)' : 'Rama A (4x31)'}
                    </span>
                  </div>

                  <span className="text-2xl font-black text-slate-800">+</span>

                  {/* Progenitor Rama B */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="relative flex items-center justify-center">
                      <svg width="56" height="56" viewBox="0 0 56 56" className="overflow-visible drop-shadow">
                        <g transform="translate(28, 28)">
                          <defs>
                            <clipPath id="clip-final-b">
                              <circle r="24" cx="0" cy="0" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#clip-final-b)">
                            {activeModel === '6x31-pure' ? (
                              <>
                                <rect x="-24" y="-24" width="9.6" height="48" fill={activeStats[1]?.color} />
                                <rect x="-14.4" y="-24" width="9.6" height="48" fill={activeStats[2]?.color} />
                                <rect x="-4.8" y="-24" width="9.6" height="48" fill={activeStats[3]?.color} />
                                <rect x="4.8" y="-24" width="9.6" height="48" fill={activeStats[4]?.color} />
                                <rect x="14.4" y="-24" width="9.6" height="48" fill={activeStats[5]?.color} />
                              </>
                            ) : (
                              <>
                                <rect x="-24" y="-24" width="12" height="48" fill="#ffffff" />
                                <rect x="-12" y="-24" width="12" height="48" fill={activeStats[1]?.color} />
                                <rect x="0" y="-24" width="12" height="48" fill={activeStats[2]?.color} />
                                <rect x="12" y="-24" width="12" height="48" fill={activeStats[4]?.color} />
                              </>
                            )}
                          </g>
                          <circle r="24" cx="0" cy="0" fill="none" stroke="var(--color-line)" strokeWidth="2.2" />
                          <text
                            x="0"
                            y="9"
                            textAnchor="middle"
                            fontSize="26"
                            fontWeight="900"
                            fill="var(--color-role-male)"
                            stroke="#000"
                            strokeWidth="1"
                          >
                            ♂
                          </text>
                        </g>
                      </svg>
                      {/* Sprite de brazal equipado */}
                      <div className="absolute -top-1 -right-2 bg-slate-900 rounded-full p-0.5 border border-slate-700 shadow">
                        <ItemSprite
                          item={activeModel === '6x31-pure' ? activeStats[5]?.itemKey : 'everstone'}
                          size={18}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">
                      {activeModel === '6x31-pure' ? 'Rama B (5x31)' : 'Rama B (Naturaleza)'}
                    </span>
                  </div>

                  <span className="text-2xl font-black text-slate-800">=</span>

                  {/* Cría Final (6x31 con todos los colores y Pokémon) */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="relative flex items-center justify-center">
                      <svg width="64" height="64" viewBox="0 0 64 64" className="overflow-visible drop-shadow-xl">
                        <g transform="translate(32, 32)">
                          <defs>
                            <clipPath id="clip-final-child">
                              <circle r="28" cx="0" cy="0" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#clip-final-child)">
                            {activeModel === '6x31-pure' ? (
                              <>
                                <rect x="-28" y="-28" width="9.33" height="56" fill={activeStats[0]?.color} />
                                <rect x="-18.66" y="-28" width="9.33" height="56" fill={activeStats[1]?.color} />
                                <rect x="-9.33" y="-28" width="9.33" height="56" fill={activeStats[2]?.color} />
                                <rect x="0" y="-28" width="9.33" height="56" fill={activeStats[3]?.color} />
                                <rect x="9.33" y="-28" width="9.33" height="56" fill={activeStats[4]?.color} />
                                <rect x="18.66" y="-28" width="9.34" height="56" fill={activeStats[5]?.color} />
                              </>
                            ) : (
                              <>
                                <rect x="-28" y="-28" width="9.33" height="56" fill="#ffffff" />
                                <rect x="-18.66" y="-28" width="9.33" height="56" fill={activeStats[0]?.color} />
                                <rect x="-9.33" y="-28" width="9.33" height="56" fill={activeStats[1]?.color} />
                                <rect x="0" y="-28" width="9.33" height="56" fill={activeStats[2]?.color} />
                                <rect x="9.33" y="-28" width="9.33" height="56" fill={activeStats[3]?.color} />
                                <rect x="18.66" y="-28" width="9.34" height="56" fill={activeStats[4]?.color} />
                              </>
                            )}
                          </g>
                          <circle r="28" cx="0" cy="0" fill="none" stroke="#e11d48" strokeWidth="3" />
                        </g>
                      </svg>
                      {/* Avatar del Pokémon en miniatura sobrepuesto */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${targetSpeciesId || 448}.png`}
                          alt={targetSpeciesName}
                          className="w-12 h-12 object-contain drop-shadow"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                      <span>{targetSpeciesName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-rose-600 text-white rounded font-mono font-bold">
                        {activeModel === '6x31-pure' ? '6x31' : '5x31 Nat.'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-600 text-center flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {activeModel === '6x31-pure'
                      ? 'Herencia determinista 100%: 6 stats garantizados al 31'
                      : 'Herencia determinista 100%: Naturaleza fija + 5 stats al 31'}
                  </span>
                </div>
              </div>
            )}

            {/* BANNER RESULTADO FINAL PARA 5x31 BÁSICO (1 RAMA) CON IMAGEN DEL POKÉMON Y MENTA */}
            {!isDualTree && (
              <div
                id="resultado-final-banner"
                className="w-full max-w-xl my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-100 via-white to-emerald-100 shadow-2xl border border-emerald-300 flex flex-col items-center justify-center text-slate-900"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-black tracking-wider text-emerald-800 font-['Sora'] uppercase">
                    RESULTADO FINAL: 5x31 (MÉTODO ECONÓMICO)
                  </h3>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                  {/* Progenitor Madre N1 */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="relative flex items-center justify-center">
                      <svg width="56" height="56" viewBox="0 0 56 56" className="overflow-visible drop-shadow">
                        <g transform="translate(28, 28)">
                          <defs>
                            <clipPath id="clip-final-basic-mother">
                              <circle r="24" cx="0" cy="0" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#clip-final-basic-mother)">
                            <rect x="-24" y="-24" width="12" height="48" fill={activeStats[0]?.color} />
                            <rect x="-12" y="-24" width="12" height="48" fill={activeStats[1]?.color} />
                            <rect x="0" y="-24" width="12" height="48" fill={activeStats[2]?.color} />
                            <rect x="12" y="-24" width="12" height="48" fill={activeStats[3]?.color} />
                          </g>
                          <circle r="24" cx="0" cy="0" fill="none" stroke="var(--color-line)" strokeWidth="2.2" />
                          <text
                            x="0"
                            y="9"
                            textAnchor="middle"
                            fontSize="26"
                            fontWeight="900"
                            fill="var(--color-role-female)"
                            stroke="#000"
                            strokeWidth="1"
                          >
                            ♀
                          </text>
                        </g>
                      </svg>
                      {/* Sprite de brazal equipado */}
                      <div className="absolute -top-1 -right-2 bg-slate-900 rounded-full p-0.5 border border-slate-700 shadow">
                        <ItemSprite
                          item={activeStats[0]?.itemKey}
                          size={18}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Madre N1 (4x31)</span>
                  </div>

                  <span className="text-2xl font-black text-slate-800">+</span>

                  {/* Progenitor Padre N1 */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="relative flex items-center justify-center">
                      <svg width="56" height="56" viewBox="0 0 56 56" className="overflow-visible drop-shadow">
                        <g transform="translate(28, 28)">
                          <defs>
                            <clipPath id="clip-final-basic-father">
                              <circle r="24" cx="0" cy="0" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#clip-final-basic-father)">
                            <rect x="-24" y="-24" width="12" height="48" fill={activeStats[1]?.color} />
                            <rect x="-12" y="-24" width="12" height="48" fill={activeStats[2]?.color} />
                            <rect x="0" y="-24" width="12" height="48" fill={activeStats[3]?.color} />
                            <rect x="12" y="-24" width="12" height="48" fill={activeStats[4]?.color} />
                          </g>
                          <circle r="24" cx="0" cy="0" fill="none" stroke="var(--color-line)" strokeWidth="2.2" />
                          <text
                            x="0"
                            y="9"
                            textAnchor="middle"
                            fontSize="26"
                            fontWeight="900"
                            fill="var(--color-role-male)"
                            stroke="#000"
                            strokeWidth="1"
                          >
                            ♂
                          </text>
                        </g>
                      </svg>
                      {/* Sprite de brazal equipado */}
                      <div className="absolute -top-1 -right-2 bg-slate-900 rounded-full p-0.5 border border-slate-700 shadow">
                        <ItemSprite
                          item={activeStats[4]?.itemKey}
                          size={18}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Padre N1 (4x31)</span>
                  </div>

                  <span className="text-2xl font-black text-slate-800">=</span>

                  {/* Cría Final (5x31 con todos los colores y Pokémon) */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="relative flex items-center justify-center">
                      <svg width="64" height="64" viewBox="0 0 64 64" className="overflow-visible drop-shadow-xl">
                        <g transform="translate(32, 32)">
                          <defs>
                            <clipPath id="clip-final-child-basic">
                              <circle r="28" cx="0" cy="0" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#clip-final-child-basic)">
                            <rect x="-28" y="-28" width="11.2" height="56" fill={activeStats[0]?.color} />
                            <rect x="-16.8" y="-28" width="11.2" height="56" fill={activeStats[1]?.color} />
                            <rect x="-5.6" y="-28" width="11.2" height="56" fill={activeStats[2]?.color} />
                            <rect x="5.6" y="-28" width="11.2" height="56" fill={activeStats[3]?.color} />
                            <rect x="16.8" y="-28" width="11.2" height="56" fill={activeStats[4]?.color} />
                          </g>
                          <circle r="28" cx="0" cy="0" fill="none" stroke="#059669" strokeWidth="3" />
                        </g>
                      </svg>
                      {/* Avatar del Pokémon en miniatura sobrepuesto */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${targetSpeciesId || 448}.png`}
                          alt={targetSpeciesName}
                          className="w-12 h-12 object-contain drop-shadow"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                      <span>{targetSpeciesName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-600 text-white rounded font-mono font-bold">
                        5x31
                      </span>
                    </span>
                  </div>
                </div>

                {/* Paso Final: Menta de Naturaleza recomendada */}
                <div className="mt-3 w-full p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-600/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ItemSprite item="mint" size={24} />
                    <div className="text-left">
                      <span className="font-bold text-emerald-900 block leading-tight">
                        Paso Final Recomendado: Dale una Menta {nature.split(' ')[0]}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Al nacer la cría 5x31, usa una Menta de Naturaleza para cambiar sus stats a {nature.split(' ')[0]} sin gastar en otra rama.
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-700 text-white font-mono font-bold text-[10px]">
                    Ahorro 50%
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-600 text-center flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Herencia determinista 100%: 5 stats garantizados al 31 + Naturaleza por Menta
                  </span>
                </div>
              </div>
            )}

            {/* ÁRBOL INFERIOR (Rama B) */}
            {isDualTree && treeB && (
              <div
                id="rama-inferior-b"
                className="w-full p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner"
              >
                <div className="text-[11px] font-mono text-purple-300 font-bold mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {activeModel === '6x31-pure'
                        ? 'RAMA INFERIOR B (5x31: Atk + Def + SpA + SpD + Vel - 16 Capturas Base)'
                        : 'RAMA INFERIOR B (Línea con Naturaleza Favorable & Piedra Eterna - 16 Capturas Base)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans">15 Cruces • 30 Brazales</span>
                </div>
                <svg viewBox="0 0 880 340" className="w-full h-auto overflow-visible select-none drop-shadow-md">
                  {/* Conexiones */}
                  <g className="connections">
                    {treeB.connList.map((conn, idx) => (
                      <line
                        key={idx}
                        x1={conn.from.x}
                        y1={conn.from.y + conn.from.r}
                        x2={conn.to.x}
                        y2={conn.to.y - conn.to.r}
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="opacity-75"
                      />
                    ))}
                  </g>
                  {/* Nodos */}
                  <g className="nodes">{treeB.nodeList.map((node) => renderCircleNode(node))}</g>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Detalle de Nodo Seleccionado con Sprite de Objeto */}
        {selectedNode && (
          <div className="z-20 mt-4 w-full max-w-lg p-3.5 rounded-xl bg-slate-900/95 border border-purple-500/50 shadow-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center font-bold text-sm shadow shrink-0"
                style={{
                  backgroundColor: selectedNode.isNatureNode
                    ? '#ffffff'
                    : selectedNode.stats.length === 1
                    ? activeStats[selectedNode.stats[0]]?.color
                    : '#1e293b',
                  color: selectedNode.gender === 'female' ? 'var(--color-role-female)' : 'var(--color-role-male)',
                }}
              >
                {selectedNode.gender === 'female' ? '♀' : '♂'}
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>{selectedNode.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-mono">
                    Rama {selectedNode.branch} • Nivel {selectedNode.level}
                  </span>
                </div>
                <div className="text-slate-300 mt-1 flex items-center gap-2 flex-wrap text-[11px]">
                  {selectedNode.isNatureNode && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-900 shadow-xs flex items-center gap-1">
                      <ItemSprite item="everstone" size={14} />
                      <span>Naturaleza ({nature.split(' ')[0]})</span>
                    </span>
                  )}
                  {selectedNode.stats.map((stIdx) => (
                    <span
                      key={stIdx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: activeStats[stIdx]?.color }}
                    >
                      31 {activeStats[stIdx]?.name}
                    </span>
                  ))}
                  {selectedNode.powerItemNeeded && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <span>• Equipar:</span>
                      {selectedNode.itemKey && <ItemSprite item={selectedNode.itemKey} size={16} />}
                      <strong className="text-purple-300">{selectedNode.powerItemNeeded}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. TABLA DE CRIANZA Y AUDITORÍA DE COSTOS CON DISEÑO SIMPLE Y CLARO */}
      <div className="flex flex-col gap-4">
        {/* Encabezado y controles de la tabla */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Coins className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-['Sora']">
              Lista de Capturas & Compra de Objetos
            </h3>
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 ml-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>¿Cómo funciona?</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Selector de modo de vista: Simple vs Matriz Tradicional */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setAuditViewMode('simple')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  auditViewMode === 'simple'
                    ? 'bg-purple-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Diseño Simple</span>
              </button>
              <button
                type="button"
                onClick={() => setAuditViewMode('matrix')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  auditViewMode === 'matrix'
                    ? 'bg-purple-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Matriz Tradicional</span>
              </button>
            </div>

            {/* Toggle de Precios: Oficial Diosesmon vs Guía Externa Clásica */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPricingMode('diosesmon')}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  pricingMode === 'diosesmon'
                    ? 'bg-emerald-600 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Diosesmon (500 Pk$)
              </button>
              <button
                type="button"
                onClick={() => setPricingMode('external')}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  pricingMode === 'external'
                    ? 'bg-slate-700 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Guía Externa (10k)
              </button>
            </div>
          </div>
        </div>

        {/* 3 TARJETAS DE RESUMEN EJECUTIVO RÁPIDO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tarjeta 1: Capturas */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-role-female font-bold shrink-0">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <div className="text-xs text-slate-400">Capturas Base Silvestres (1x31)</div>
              <div className="text-base font-black text-white font-mono">
                {totalCapturesCount} Pokémon
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-role-female font-bold">{totalFemales} ♀ Hembras</span>
                <span>•</span>
                <span className="text-role-male font-bold">{totalMales} ♂ Machos</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Objetos Recios */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold shrink-0">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Objetos a Comprar en Tienda</div>
              <div className="text-base font-black text-purple-300 font-mono">
                {totalItemsCount} Objetos
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {auditData.totalBrazales} Brazales Recios
                {auditData.totalEverstone > 0 ? ` + ${auditData.totalEverstone} Piedras Eternas` : ''}
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Gasto Total */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Coins className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Gasto Total {pricingMode === 'diosesmon' ? 'en Servidor' : 'Guía Externa'}
              </div>
              <div className="text-base font-black text-emerald-300 font-mono">
                {pricingMode === 'diosesmon'
                  ? `${auditData.diosesmonTotal.toLocaleString()} Pk$`
                  : `${auditData.externalTotalK}k Pk$`}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {pricingMode === 'diosesmon'
                  ? `Objetos: ${(auditData.diosesmonBrazalesCost + auditData.diosesmonEverstoneCost).toLocaleString()} Pk$ • Sexo: ${auditData.diosesmonSexCost.toLocaleString()} Pk$`
                  : 'Tarifa clásica 10k por brazal'}
              </div>
            </div>
          </div>
        </div>

        {/* Explicación desplegable de cómo se lee la información */}
        {showExplanation && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-xs text-slate-300 leading-relaxed flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-purple-300">
              <Info className="w-4 h-4" />
              <span>Aclaración de las cantidades:</span>
            </div>
            <p>
              • <strong>Pokémon que Equipa (♀ Hembra / ♂ Macho):</strong> Muestra cuántos Pokémon hembras y machos equipan ese objeto a lo largo de todo el árbol genealógico (incluyendo el cruce final del resultado). Por ejemplo, la <strong>Pesa Recia</strong> la equipan exactamente <strong>5 hembras ♀</strong> (Hoja base N4, Bisabuela N3, Abuela N2, Madre N1 y Ápice 5x31 en el resultado final) y <strong>0 machos ♂</strong>.
            </p>
            <p>
              • <strong>Brazales a Usar:</strong> Muestra el total de veces que se equipa ese objeto a lo largo de las cruzas en la pirámide de crianza (57 brazales + 5 piedras eternas = 62 objetos en total para los 31 cruces en 5x31 con Naturaleza).
            </p>
            <p>
              • <strong>Guardería Diosesmon:</strong> En el servidor Cobblemon Diosesmon, depositar Pokémon es <strong>gratis (0 Pk$)</strong>. El costo de dinero es únicamente <strong>500 Pk$ por brazal/piedra eterna</strong> y <strong>500 Pk$ por forzar el sexo</strong> de la cría.
            </p>
          </div>
        )}

        {/* 1. VISTA SIMPLE: TABLA LIMPIA Y DIRECTA POR ATRIBUTO */}
        {auditViewMode === 'simple' ? (
          <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-canvas shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                  <th className="py-3 px-4 font-bold text-slate-300 min-w-[140px]">
                    Atributo / Stat
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-300 min-w-[180px]">
                    Objeto Recio Necesario
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-300 min-w-[210px]">
                    Pokémon que Equipa (♀ / ♂)
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-300 text-center min-w-[110px]">
                    Brazales a Usar
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-300 text-right min-w-[110px]">
                    Costo Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {simplifiedRows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-900/50 transition-colors">
                    {/* Stat */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0 border border-slate-950"
                          style={{ backgroundColor: row.statColor }}
                        />
                        <span className="font-bold text-white text-sm">
                          {row.statName}
                        </span>
                      </div>
                    </td>

                    {/* Objeto */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <ItemSprite item={row.itemKey} size={24} showTooltip />
                        <div>
                          <div className="font-bold text-slate-200">{row.itemName}</div>
                          <div className="text-[11px] text-slate-400">
                            {row.type === 'nature' ? 'Hereda Naturaleza 100%' : `Garantiza 31 en ${row.statName}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Equipamiento desglosado por sexo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-pink-950/70 border border-pink-700/50 text-pink-300 font-mono font-bold text-xs flex items-center gap-1">
                          <span>♀</span>
                          <span>{row.females}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-700/50 text-sky-300 font-mono font-bold text-xs flex items-center gap-1">
                          <span>♂</span>
                          <span>{row.males}</span>
                        </span>
                        <span className="text-slate-400 text-xs">
                          = <strong className="text-white font-mono">{row.females + row.males}</strong> {row.females + row.males === 1 ? 'uso' : 'usos'}
                        </span>
                      </div>
                    </td>

                    {/* Brazales a Usar */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-700/50 text-purple-200 font-mono font-bold text-xs inline-block">
                        {row.brazales}
                      </span>
                    </td>

                    {/* Costo Subtotal */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {row.costText}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-900/90 font-bold text-xs">
                  <td className="py-3 px-4 text-white font-bold">
                    TOTAL GENERAL
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {totalItemsCount} Objetos en Tienda
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-mono">
                    <span className="text-role-female font-bold">{totalFemales} ♀</span> +{' '}
                    <span className="text-role-male font-bold">{totalMales} ♂</span> ={' '}
                    <span className="text-white font-black">{totalItemsCount} Usos en Cruces</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-black text-purple-300">
                    {totalItemsCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-300 text-sm">
                    {pricingMode === 'diosesmon'
                      ? `${(auditData.diosesmonBrazalesCost + auditData.diosesmonEverstoneCost).toLocaleString()} Pk$`
                      : `${auditData.externalTotalK}k Pk$`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          /* 2. VISTA MATRIZ TRADICIONAL */
          <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-canvas shadow-xl">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-2.5 px-4 bg-slate-900 text-slate-200 font-bold text-left min-w-[170px]">
                    Crianza & Objetos
                  </th>
                  {activeStats.map((st, i) => (
                    <th
                      key={i}
                      style={{ backgroundColor: st.color }}
                      className={`py-2 px-3 font-bold min-w-[105px] ${
                        st.textColor || (st.color === '#eab308' ? 'text-slate-950' : 'text-white')
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <ItemSprite item={st.itemKey} size={22} showTooltip />
                        <span>{st.name}</span>
                      </div>
                    </th>
                  ))}
                  <th className="py-2.5 px-4 bg-slate-900 text-white font-bold min-w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {/* Fila 1: Hembra */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-4 text-left font-bold text-role-female flex items-center gap-2">
                    <span className="text-base leading-none font-black">♀</span>
                    <span>Hembra</span>
                  </td>
                  {auditData.femaleCounts.map((cnt, i) => (
                    <td key={i} className="py-2.5 px-3 text-slate-200 font-mono font-semibold">
                      {cnt}
                    </td>
                  ))}
                  <td className="py-2.5 px-4 font-mono font-bold text-white bg-slate-900/50">
                    {auditData.femaleCounts.reduce((a, b) => a + b, 0)}
                  </td>
                </tr>

                {/* Fila 2: Macho */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-4 text-left font-bold text-role-male flex items-center gap-2">
                    <span className="text-base leading-none font-black">♂</span>
                    <span>Macho</span>
                  </td>
                  {auditData.maleCounts.map((cnt, i) => (
                    <td key={i} className="py-2.5 px-3 text-slate-200 font-mono font-semibold">
                      {cnt}
                    </td>
                  ))}
                  <td className="py-2.5 px-4 font-mono font-bold text-white bg-slate-900/50">
                    {auditData.maleCounts.reduce((a, b) => a + b, 0)}
                  </td>
                </tr>

                {/* Fila 3: Total Capturas Base */}
                <tr className="bg-slate-900/40 text-slate-300 font-semibold border-t border-slate-700/60">
                  <td className="py-2 px-4 text-left text-slate-400 flex items-center gap-2">
                    <span className="text-xs">∑</span>
                    <span>Capturas Base (1x31)</span>
                  </td>
                  {auditData.totalCaptures.map((cnt, i) => (
                    <td key={i} className="py-2 px-3 text-slate-300 font-mono text-[11px]">
                      {cnt}
                    </td>
                  ))}
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-300 bg-slate-900/60 text-[11px]">
                    {auditData.totalCaptures.reduce((a, b) => a + b, 0)}
                    {activeModel === '5x31-nature' ? ' (+1 Nat.)' : ''}
                  </td>
                </tr>

                {/* Fila 4: Brazales */}
                <tr className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-4 text-left font-bold text-purple-300 flex items-center gap-2">
                    <ItemSprite item="power_bracer" size={20} />
                    <span>Brazales Recios</span>
                  </td>
                  {auditData.brazales.map((cnt, i) => (
                    <td key={i} className="py-2.5 px-3 text-purple-200 font-mono font-bold">
                      {cnt}
                    </td>
                  ))}
                  <td className="py-2.5 px-4 font-mono font-black text-purple-300 bg-purple-950/40">
                    {auditData.totalBrazales}
                  </td>
                </tr>

                {/* Fila 5: P. Eterna (Solo si aplica naturaleza) */}
                {auditData.totalEverstone > 0 && (
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-4 text-left font-bold text-slate-300 flex items-center gap-2">
                      <ItemSprite item="everstone" size={20} />
                      <span>Piedra Eterna</span>
                    </td>
                    {auditData.brazales.map((_, i) => (
                      <td key={i} className="py-2.5 px-3 text-slate-500 font-mono">
                        -
                      </td>
                    ))}
                    <td className="py-2.5 px-4 font-mono font-black text-white bg-slate-900/50">
                      {auditData.totalEverstone}
                    </td>
                  </tr>
                )}

                {/* Fila 6: Dinero */}
                <tr className="bg-slate-900/90 font-bold border-t-2 border-slate-700">
                  <td className="py-2.5 px-4 text-left text-emerald-400 flex items-center gap-2">
                    <span className="text-sm font-black">$</span>
                    <span>
                      Dinero ({pricingMode === 'diosesmon' ? '500 Pk$/brazal' : '10k/brazal'})
                    </span>
                  </td>
                  {pricingMode === 'diosesmon'
                    ? auditData.brazales.map((cnt, i) => {
                        const cost = cnt * 500;
                        return (
                          <td key={i} className="py-2.5 px-3 text-emerald-300 font-mono font-semibold">
                            {cost >= 1000 ? `${cost / 1000}k` : `${cost}`}
                          </td>
                        );
                      })
                    : auditData.externalBrazalesByStat.map((kVal, i) => (
                        <td key={i} className="py-2.5 px-3 text-emerald-300 font-mono font-semibold">
                          {kVal}k
                        </td>
                      ))}
                  <td className="py-2.5 px-4 font-mono font-black text-emerald-300 bg-emerald-950/60 text-sm">
                    {pricingMode === 'diosesmon'
                      ? `${auditData.diosesmonTotal.toLocaleString()} Pk$`
                      : `${auditData.externalTotalK}k`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Resumen de Costos Oficiales Diosesmon */}
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-purple-200">
                Desglose Oficial Servidor Diosesmon:
              </span>{' '}
              {auditData.totalBrazales} Brazales Recios (500 Pk$ c/u = {auditData.diosesmonBrazalesCost.toLocaleString()} Pk$) +{' '}
              {auditData.totalEverstone > 0
                ? `${auditData.totalEverstone} Piedras Eternas (500 Pk$ c/u = ${auditData.diosesmonEverstoneCost.toLocaleString()} Pk$) + `
                : ''}
              {auditData.diosesmonSexCost.toLocaleString()} Pk$ en selecciones de sexo (500 Pk$ por cruce) + Guardería Gratis (0 Pk$).
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono font-bold text-sm text-emerald-300 shrink-0 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 shadow">
            <span>Costo Total:</span>
            <span>
              {pricingMode === 'diosesmon'
                ? `${auditData.diosesmonTotal.toLocaleString()} Pk$`
                : `${auditData.externalTotalK}k Pk$`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreedingTreePro;
