import React from 'react';
import { PiggyBank, Zap } from 'lucide-react';

export type BreedingStrategy = 'economic' | 'ditto_speed';

interface StrategySelectorProps {
  strategy: BreedingStrategy;
  onChange: (strategy: BreedingStrategy) => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  strategy,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface border border-line">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-brand-soft" />
          Estrategia Algorítmica de Crianza
        </span>
        <span className="text-[11px] text-ink-muted font-mono">
          Optimización Diosesmon
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
        {/* Economic Route */}
        <button
          type="button"
          onClick={() => onChange('economic')}
          className={`p-3.5 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
            strategy === 'economic'
              ? 'bg-brand/10 border-brand shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-brand/40'
              : 'bg-surface-sunken/40 border-line hover:border-line-strong opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-success" />
              Ruta Económica (Mínimo Costo)
            </span>
            {strategy === 'economic' && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-success/20 text-success border border-success/30 font-mono">
                ACTIVA
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Aprovecha capturas silvestres de 1x31 y 2x31 en grupos huevo compartidos. Minimiza el gasto en Power Items y cuotas de guardería.
          </p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-ink-faint mt-1">
            <span>• 100% Determinista</span>
            <span>• Sin Ditto exótico requerido</span>
          </div>
        </button>

        {/* Fast Ditto Route */}
        <button
          type="button"
          onClick={() => onChange('ditto_speed')}
          className={`p-3.5 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
            strategy === 'ditto_speed'
              ? 'bg-brand/10 border-brand shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-brand/40'
              : 'bg-surface-sunken/40 border-line hover:border-line-strong opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-soft" />
              Ruta Rápida (Ditto Multi-IV)
            </span>
            {strategy === 'ditto_speed' && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand/20 text-brand-soft border border-brand/30 font-mono">
                ACTIVA
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Utiliza Ditto con múltiples IVs perfectos (3x31 / 4x31 / 5x31) del PC. Reduce drásticamente las generaciones intermedias.
          </p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-ink-faint mt-1">
            <span>• Menos generaciones</span>
            <span>• Máxima velocidad de eclosión</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default StrategySelector;
