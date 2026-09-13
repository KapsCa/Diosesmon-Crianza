import React, { useState } from 'react';
import { CheckCircle2, Circle, Coins, Sparkles, RotateCcw } from 'lucide-react';

interface ChecklistStep {
  id: string;
  cycleNumber: number;
  title: string;
  father: { name: string; gender: 'male' | 'genderless'; item: string; stat: string };
  mother: { name: string; gender: 'female'; item: string; stat: string };
  cost: number;
  expectedResult: string;
  ivsLocked: string[];
}

interface DaycareChecklistProps {
  targetSpeciesName?: string;
}

export const DaycareChecklist: React.FC<DaycareChecklistProps> = ({
  targetSpeciesName = 'Pokémon Objetivo',
}) => {
  // 4 sequential breeding steps for demonstration with Diosesmon pricing (500 Pk$ per item, 0 Pk$ daycare)
  const steps: ChecklistStep[] = [
    {
      id: 'step-1',
      cycleNumber: 1,
      title: `Cruza Inicial 1: Transferencia de PS (HP) y Ataque`,
      father: {
        name: targetSpeciesName,
        gender: 'male',
        item: 'Pesa Recia (500 Pk$)',
        stat: '31 PS (HP)',
      },
      mother: {
        name: targetSpeciesName,
        gender: 'female',
        item: 'Brazal Recio (500 Pk$)',
        stat: '31 Ataque',
      },
      cost: 1500, // 2 items (1,000 Pk$) + 500 Pk$ selección de sexo Macho + 0 Pk$ guardería
      expectedResult: `Cría F1-A con 2x31 asegurados (PS + Ataque). Selección de sexo Macho ♂ en guardería.`,
      ivsLocked: ['HP: 31', 'Atk: 31'],
    },
    {
      id: 'step-2',
      cycleNumber: 2,
      title: `Cruza Inicial 2: Transferencia de Defensa y Velocidad`,
      father: {
        name: targetSpeciesName,
        gender: 'male',
        item: 'Cinto Recio (500 Pk$)',
        stat: '31 Defensa',
      },
      mother: {
        name: targetSpeciesName,
        gender: 'female',
        item: 'Franja Recia (500 Pk$)',
        stat: '31 Velocidad',
      },
      cost: 1500, // 2 items (1,000 Pk$) + 500 Pk$ selección de sexo Hembra + 0 Pk$ guardería
      expectedResult: `Cría F1-B con 2x31 asegurados (Defensa + Velocidad). Selección de sexo Hembra ♀ en guardería.`,
      ivsLocked: ['Def: 31', 'Spe: 31'],
    },
    {
      id: 'step-3',
      cycleNumber: 3,
      title: `Cruza de Consolidación F1 → F2 (4x31)`,
      father: {
        name: `${targetSpeciesName} (F1-A 2x31)`,
        gender: 'male',
        item: 'Pesa Recia (500 Pk$)',
        stat: '31 PS (HP)',
      },
      mother: {
        name: `${targetSpeciesName} (F1-B 2x31)`,
        gender: 'female',
        item: 'Franja Recia (500 Pk$)',
        stat: '31 Velocidad',
      },
      cost: 1000, // 2 items (1,000 Pk$) + 0 Pk$ guardería
      expectedResult: `Cría F2 con 4x31 garantizados. Asignar Piedra Eterna en la cruza final.`,
      ivsLocked: ['HP: 31', 'Atk: 31', 'Def: 31', 'Spe: 31'],
    },
    {
      id: 'step-4',
      cycleNumber: 4,
      title: `Cruza Final: Consolidación 5x31 y Naturaleza`,
      father: {
        name: `Ditto / Donante 5x31`,
        gender: 'male',
        item: 'Banda Recia (500 Pk$)',
        stat: '31 Def. Esp.',
      },
      mother: {
        name: `${targetSpeciesName} (F2 4x31)`,
        gender: 'female',
        item: 'Piedra Eterna (500 Pk$)',
        stat: 'Naturaleza Fijada',
      },
      cost: 1000, // 2 items (1,000 Pk$) + 0 Pk$ guardería
      expectedResult: `¡Eclosión Exitosa! ${targetSpeciesName} Competitivo 5x31 con Naturaleza deseada.`,
      ivsLocked: ['HP: 31', 'Atk: 31', 'Def: 31', 'SpD: 31', 'Spe: 31', 'Naturaleza 100%'],
    },
  ];

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReset = () => {
    setCompletedSteps({});
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const totalSpent = steps.reduce(
    (acc, step) => acc + (completedSteps[step.id] ? step.cost : 0),
    0
  );
  const totalRemaining = steps.reduce(
    (acc, step) => acc + (!completedSteps[step.id] ? step.cost : 0),
    0
  );

  return (
    <div className="w-full flex flex-col gap-4 p-5 rounded-2xl bg-[#0b0f19] border border-purple-500/25 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-bold font-['Sora'] text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Checklist de Guardería en Vivo
          </h3>
          <p className="text-xs text-slate-400">
            Modo operativo paso a paso frente al NPC de Diosesmon
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar Checklist</span>
          </button>
        </div>
      </div>

      {/* Progress & Live Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Progreso de Cruzas</span>
            <span className="font-mono text-white font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
            />
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {completedCount} de {steps.length} cruzas completadas
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            Pk$ Invertido (Gastado)
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {totalSpent.toLocaleString()} Pk$
          </span>
          <span className="text-[11px] text-slate-500">Tarifas e ítems quemados</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Pk$ Pendiente por Invertir
          </span>
          <span className="text-lg font-bold font-mono text-amber-300">
            {totalRemaining.toLocaleString()} Pk$
          </span>
          <span className="text-[11px] text-slate-500">Para completar el 100% de la ruta</span>
        </div>
      </div>

      {/* Step by step cards */}
      <div className="flex flex-col gap-3">
        {steps.map((step) => {
          const isDone = Boolean(completedSteps[step.id]);

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-950/15 border-emerald-500/40 opacity-80'
                  : 'bg-[#0f131c] border-slate-800 hover:border-purple-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Paso #{step.cycleNumber}
                      </span>
                      <h4
                        className={`text-sm font-semibold ${
                          isDone ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 mt-1">
                      <strong>Resultado Esperado:</strong> {step.expectedResult}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {step.cost.toLocaleString()} Pk$
                  </span>
                  <span className="block text-[10px] text-slate-500">Costo del paso</span>
                </div>
              </div>

              {/* Instructions box */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 font-bold">♂ Padre:</span>
                  <span className="text-slate-200">{step.father.name}</span>
                  <span className="text-slate-400 text-[11px]">— Equipar: {step.father.item}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-pink-400 font-bold">♀ Madre:</span>
                  <span className="text-slate-200">{step.mother.name}</span>
                  <span className="text-slate-400 text-[11px]">— Equipar: {step.mother.item}</span>
                </div>
              </div>

              {/* Locked stats badges */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 font-mono">IVs Asegurados:</span>
                {step.ivsLocked.map((iv, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono border border-emerald-500/30 font-semibold"
                  >
                    ✓ {iv}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DaycareChecklist;
