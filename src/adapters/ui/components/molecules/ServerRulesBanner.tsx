import React, { useState } from 'react';
import { ShieldCheck, Flame, Coins, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface ServerRulesBannerProps {
  onNavigateToRules?: () => void;
}

export const ServerRulesBanner: React.FC<ServerRulesBannerProps> = ({ onNavigateToRules }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-surface border border-brand/20 rounded-xl overflow-hidden shadow-sm">
      {/* Top Banner Row - streamlined & friendly */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-brand/10 via-surface-sunken/40 to-brand/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-brand/15 border border-brand/30 flex items-center justify-center text-brand-soft shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-ink">Reglas Diosesmon:</span>
            <span className="text-ink-muted">
              Guardería <strong className="text-success font-medium">Gratis (0 Pk$)</strong> • Tienda de Crianza <strong className="text-danger font-medium">500 Pk$</strong> • Determinismo 100%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToRules && (
            <button
              type="button"
              onClick={onNavigateToRules}
              className="text-xs text-brand-soft hover:text-white px-2.5 py-1 rounded-md bg-brand/10 hover:bg-brand/15 border border-brand/20 transition-all flex items-center gap-1 font-medium"
            >
              <span>Ver matriz de reglas</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink px-2 py-1 rounded bg-surface-sunken/80 border border-line transition-colors"
          >
            <span>{expanded ? 'Menos info' : 'Detalles'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-canvas/80 text-xs text-ink border-t border-line">
          <div className="p-3 rounded-lg bg-surface-sunken/70 border border-line flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-danger font-semibold">
              <Flame className="w-4 h-4" />
              <span>Tienda de Crianza: 500 Pk$ por Ítem</span>
            </div>
            <p className="text-ink-muted leading-relaxed">
              En Diosesmon, los Power Items y la Piedra Eterna cuestan <strong>500 Pk$ cada uno</strong> y tienen consumo 1x Burn. Se accede a la Tienda de crianza a través del <strong>PokéPad</strong> o en el <strong>spawn en el piso superior de la guardería</strong>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface-sunken/70 border border-line flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-success font-semibold">
              <Coins className="w-4 h-4" />
              <span>Sin Tarifa de Guardería (0 Pk$)</span>
            </div>
            <p className="text-ink-muted leading-relaxed">
              El servidor cuenta con <strong>guardería gratuita (0 Pk$)</strong> por ciclo de cruza. Solo se aplica una tarifa opcional de <strong>500 Pk$</strong> si decides seleccionar y garantizar el sexo de la cría resultante.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-surface-sunken/70 border border-line flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-role-male font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Determinismo & Selección de Sexo</span>
            </div>
            <p className="text-ink-muted leading-relaxed">
              Herencia 100% determinista sin RNG. La especie se hereda de la madre (o de la especie base con Ditto). Puedes fijar el sexo de la cría por una tarifa fija de <strong>500 Pk$</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerRulesBanner;
