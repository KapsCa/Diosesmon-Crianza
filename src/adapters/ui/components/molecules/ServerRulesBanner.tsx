import React, { useState } from 'react';
import { ShieldCheck, Flame, Coins, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface ServerRulesBannerProps {
  onNavigateToRules?: () => void;
}

export const ServerRulesBanner: React.FC<ServerRulesBannerProps> = ({ onNavigateToRules }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-[#0d111a] border border-purple-500/20 rounded-xl overflow-hidden shadow-sm">
      {/* Top Banner Row - streamlined & friendly */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-purple-950/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">Reglas Diosesmon:</span>
            <span className="text-slate-400">
              Guardería <strong className="text-emerald-400 font-medium">Gratis (0 Pk$)</strong> • Tienda de Crianza <strong className="text-rose-400 font-medium">500 Pk$</strong> • Determinismo 100%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToRules && (
            <button
              type="button"
              onClick={onNavigateToRules}
              className="text-xs text-purple-300 hover:text-white px-2.5 py-1 rounded-md bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/20 transition-all flex items-center gap-1 font-medium"
            >
              <span>Ver matriz de reglas</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 transition-colors"
          >
            <span>{expanded ? 'Menos info' : 'Detalles'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0a0e17]/80 text-xs text-slate-300 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <Flame className="w-4 h-4" />
              <span>Tienda de Crianza: 500 Pk$ por Ítem</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              En Diosesmon, los Power Items y la Piedra Eterna cuestan <strong>500 Pk$ cada uno</strong> y tienen consumo 1x Burn. Se accede a la Tienda de crianza a través del <strong>PokéPad</strong> o en el <strong>spawn en el piso superior de la guardería</strong>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Coins className="w-4 h-4" />
              <span>Sin Tarifa de Guardería (0 Pk$)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              El servidor cuenta con <strong>guardería gratuita (0 Pk$)</strong> por ciclo de cruza. Solo se aplica una tarifa opcional de <strong>500 Pk$</strong> si decides seleccionar y garantizar el sexo de la cría resultante.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Determinismo & Selección de Sexo</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Herencia 100% determinista sin RNG. La especie se hereda de la madre (o de la especie base con Ditto). Puedes fijar el sexo de la cría por una tarifa fija de <strong>500 Pk$</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerRulesBanner;
