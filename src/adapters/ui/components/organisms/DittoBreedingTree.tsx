import React, { useState } from 'react';
import {
  type DittoBreedingPlan,
  STAT_METADATA,
} from '../../../../domain/services/dittoBreedingPlanner';
import { ALL_STATS } from '../../../../domain/types/stat';
import { ItemSprite } from '../atoms/ItemSprite';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Clock,
  Coins,
  AlertTriangle,
} from 'lucide-react';

interface DittoBreedingTreeProps {
  plan: DittoBreedingPlan;
  targetSpeciesName?: string;
  targetSpeciesId?: number;
  nature?: string;
  useEverstone?: boolean;
}

export const DittoBreedingTree: React.FC<DittoBreedingTreeProps> = ({
  plan,
  targetSpeciesName = plan.targetSpecies.name,
  targetSpeciesId = plan.targetSpecies.id,
  nature,
  useEverstone = false,
}) => {
  const [activeView, setActiveView] = useState<'steps' | 'tree'>('steps');

  if (!plan.success || plan.steps.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-canvas border border-warning/40 flex flex-col gap-4 text-center items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-warning/20 text-warning flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white font-['Sora']">
            No se pudo trazar la ruta con los Dittos actuales
          </h4>
          <p className="text-xs text-ink max-w-xl mt-1 leading-relaxed">
            {plan.warningMessage ||
              'Asegúrate de configurar Dittos que cubran todas las estadísticas 31 de tu objetivo.'}
          </p>
        </div>
      </div>
    );
  }

  const speciesSpriteUrl = targetSpeciesId
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${targetSpeciesId}.png`
    : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png';

  const dittoSpriteUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png';

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Barra de Resumen Ejecutivo y Métricas de la Ruta con Dittos */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand/10 via-surface-sunken/90 to-canvas border border-brand/30 shadow-lg flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/50 flex items-center justify-center text-brand-soft shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-brand-soft" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-soft">
                  Ruta Optimizada con Dittos:
                </span>
                <span className="text-base font-extrabold text-white font-['Sora']">
                  {targetSpeciesName}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-brand/20 text-brand-soft border border-brand/40">
                  {plan.targetIVs.length}x31
                </span>
                {nature && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-info/20 text-info border border-info/40">
                    {useEverstone ? `Naturaleza ${nature} (Piedra Eterna)` : `Menta: ${nature}`}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Ruta 100% determinista. Asignación estricta de <strong>máx 1 banda por progenitor</strong> y aprovechamiento de <strong>Herencia Fija</strong>.
              </p>
            </div>
          </div>

          {/* Selector de vista: Pasos vs Árbol */}
          <div className="inline-flex rounded-lg bg-surface-sunken/90 p-1 border border-line gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveView('steps')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'steps'
                  ? 'bg-brand text-white shadow font-semibold'
                  : 'text-ink-muted hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cadena de Pasos ({plan.totalSteps})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('tree')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'tree'
                  ? 'bg-brand text-white shadow font-semibold'
                  : 'text-ink-muted hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Diagrama Visual</span>
            </button>
          </div>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-line/80">
          <div className="p-2.5 rounded-xl bg-canvas/50 border border-line flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-brand-soft" />
              Total Cruces
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {plan.totalSteps} eclosiones
            </span>
            <span className="text-[10px] text-success font-medium">
              vs 15-31 con capturas
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-canvas/50 border border-line flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3 text-success" />
              Costo de Brazales
            </span>
            <span className="text-sm font-bold text-success font-mono">
              {plan.totalCost.toLocaleString()} Pk$
            </span>
            <span className="text-[10px] text-ink-muted">
              {plan.powerItemsCount} bandas (500 Pk$ c/u)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-canvas/50 border border-line flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-info" />
              Herencia Fija
            </span>
            <span className="text-sm font-bold text-info font-mono">
              {plan.herenciaFijaOccurrences} activaciones
            </span>
            <span className="text-[10px] text-ink-muted">
              31 compartido en ambos
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-canvas/50 border border-line flex flex-col gap-0.5">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-warning" />
              Tiempo Estimado
            </span>
            <span className="text-sm font-bold text-warning font-mono">
              {plan.totalSteps * 20} - {plan.totalSteps * 30} min
            </span>
            <span className="text-[10px] text-ink-muted">
              Acelerado con Dittos
            </span>
          </div>
        </div>
      </div>

      {/* Banner Informativo de Reglas del Servidor Cobblemon */}
      <div className="p-3.5 rounded-xl bg-info/10 border border-info/30 flex items-start gap-2.5 text-xs text-ink">
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 leading-relaxed">
          <span className="font-bold text-info">
            Regla de Herencia Determinista en Diosesmon:
          </span>
          <p className="text-[11px] text-ink">
            Cada progenitor solo puede equipar <strong>1 Power Item</strong> (máximo 2 IVs forzados por huevo).
            Las estadísticas 31 restantes se conservan de forma 100% garantizada gracias a la <strong>Herencia Fija</strong>,
            que ocurre cuando <strong>ambos progenitores (la especie y el Ditto) ya poseen 31 en esa misma estadística</strong>.
          </p>
        </div>
      </div>

      {/* VISTA 1: Cadena de Pasos Detallada */}
      {activeView === 'steps' && (
        <div className="flex flex-col gap-3.5">
          {plan.steps.map((step) => {
            return (
              <div
                key={step.stepNumber}
                className="p-4 rounded-xl bg-canvas border border-line hover:border-brand/40 transition-all shadow-md flex flex-col gap-3"
              >
                {/* Header del Paso */}
                <div className="flex items-center justify-between border-b border-line/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-brand text-white">
                      Paso {step.stepNumber}
                    </span>
                    <span className="text-xs font-semibold text-ink">
                      Generación {step.generation}: Cruce con {step.parentDitto.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-success font-semibold">
                    Costo: {step.cost} Pk$
                  </span>
                </div>

                {/* Cruce visual: Progenitor Especie + Ditto ➔ Cría */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  {/* Progenitor 1: Especie */}
                  <div className="p-3 rounded-lg bg-surface-sunken/60 border border-line flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={speciesSpriteUrl}
                          alt={step.parentSpecies.name}
                          className="w-8 h-8 object-contain drop-shadow"
                          loading="lazy"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{step.parentSpecies.name}</span>
                            <span className={step.parentSpecies.gender === 'female' ? 'text-role-female' : 'text-role-male'}>
                              {step.parentSpecies.gender === 'female' ? '♀' : '♂'}
                            </span>
                          </div>
                          <span className="text-[10px] text-ink-muted font-mono">
                            {Object.values(step.parentSpecies.ivs).filter((v) => v === 31).length}x31
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Objeto equipado */}
                    {step.parentSpecies.heldItem ? (
                      <div className="p-1.5 rounded bg-brand/10 border border-brand/30 flex items-center gap-1.5 text-[11px] text-brand-soft">
                        <ItemSprite item={step.parentSpecies.heldItem.itemKey} size={18} />
                        <span>
                          <strong>{step.parentSpecies.heldItem.name}</strong> (+{step.parentSpecies.heldItem.stat?.toUpperCase()})
                        </span>
                      </div>
                    ) : (
                      <div className="p-1.5 rounded bg-surface-sunken border border-line text-[11px] text-ink-faint italic">
                        Sin objeto (o Piedra Eterna si aplica)
                      </div>
                    )}

                    {/* Stats chips */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {ALL_STATS.map((s) => {
                        const is31 = step.parentSpecies.ivs[s] === 31;
                        return (
                          <span
                            key={s}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                              is31
                                ? 'bg-brand/20 text-brand-soft font-bold border border-brand/30'
                                : 'bg-surface-sunken text-ink-faint'
                            }`}
                          >
                            {STAT_METADATA[s].short}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progenitor 2: Ditto */}
                  <div className="p-3 rounded-lg bg-surface-sunken/60 border border-line flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={dittoSpriteUrl}
                          alt={step.parentDitto.name}
                          className="w-8 h-8 object-contain drop-shadow"
                          loading="lazy"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{step.parentDitto.name}</span>
                            <span className="text-role-genderless text-[10px] font-mono">⚲</span>
                          </div>
                          <span className="text-[10px] text-ink-muted font-mono">
                            {Object.values(step.parentDitto.ivs).filter((v) => v === 31).length}x31
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Objeto equipado Ditto */}
                    {step.parentDitto.heldItem ? (
                      <div className="p-1.5 rounded bg-brand/10 border border-brand/30 flex items-center gap-1.5 text-[11px] text-brand-soft">
                        <ItemSprite item={step.parentDitto.heldItem.itemKey} size={18} />
                        <span>
                          <strong>{step.parentDitto.heldItem.name}</strong> (+{step.parentDitto.heldItem.stat?.toUpperCase()})
                        </span>
                      </div>
                    ) : (
                      <div className="p-1.5 rounded bg-surface-sunken border border-line text-[11px] text-ink-faint italic">
                        Sin objeto
                      </div>
                    )}

                    {/* Stats chips Ditto */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {ALL_STATS.map((s) => {
                        const is31 = step.parentDitto.ivs[s] === 31;
                        return (
                          <span
                            key={s}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                              is31
                                ? 'bg-brand/20 text-brand-soft font-bold border border-brand/30'
                                : 'bg-surface-sunken text-ink-faint'
                            }`}
                          >
                            {STAT_METADATA[s].short}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cría Resultante */}
                  <div className="p-3 rounded-lg bg-success/10 border border-success/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={speciesSpriteUrl}
                          alt={step.offspring.name}
                          className="w-8 h-8 object-contain drop-shadow"
                          loading="lazy"
                        />
                        <div>
                          <div className="text-xs font-bold text-success flex items-center gap-1">
                            <span>Cría ({step.offspring.name})</span>
                            <span className={step.offspring.gender === 'female' ? 'text-role-female' : 'text-role-male'}>
                              {step.offspring.gender === 'female' ? '♀' : '♂'}
                            </span>
                          </div>
                          <span className="text-[10px] text-success font-mono font-bold">
                            Alcanza {step.offspring.perfectCount}x31
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-success/20 text-success font-mono font-bold border border-success/40">
                        {step.offspring.perfectCount}x31
                      </span>
                    </div>

                    {/* Desglose de Herencia del Paso */}
                    <div className="flex flex-col gap-1 pt-1 border-t border-success/30 text-[10px]">
                      {step.statInheritance.map((inh) => (
                        <div key={inh.stat} className="flex items-center gap-1.5">
                          {inh.method === 'herencia_fija' ? (
                            <span className="px-1.5 py-0.2 rounded bg-info/20 text-info border border-info/30 font-bold font-mono">
                              ⭐ FIJA: {inh.statName}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-brand/20 text-brand-soft border border-brand/30 font-bold font-mono">
                              🎒 BANDA: {inh.statName}
                            </span>
                          )}
                          <span className="text-ink-muted truncate" title={inh.description}>
                            {inh.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 2: Diagrama de Árbol Visual con Dittos */}
      {activeView === 'tree' && (
        <div className="p-5 rounded-2xl bg-canvas border border-line flex flex-col gap-6 items-center overflow-x-auto">
          <div className="text-xs font-semibold text-ink flex items-center gap-2 self-start">
            <Zap className="w-4 h-4 text-brand-soft" />
            <span>Flujo Jerárquico de Crianza con Dittos:</span>
          </div>

          <div className="flex flex-col items-center gap-5 w-full max-w-2xl py-2">
            {plan.steps.map((step, idx) => {
              const isLast = idx === plan.steps.length - 1;

              return (
                <div key={step.stepNumber} className="flex flex-col items-center w-full">
                  {/* Tarjeta de Cruce */}
                  <div className="w-full p-3.5 rounded-xl bg-surface-sunken/80 border border-brand/30 flex items-center justify-between gap-4 shadow-lg">
                    {/* Lado Especie */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={speciesSpriteUrl}
                        alt="Especie"
                        className="w-7 h-7 object-contain"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">
                          {step.parentSpecies.name}{' '}
                          <span className="text-[10px] text-brand-soft font-mono">
                            ({Object.values(step.parentSpecies.ivs).filter((v) => v === 31).length}x31)
                          </span>
                        </span>
                        {step.parentSpecies.heldItem && (
                          <span className="text-[10px] text-brand-soft flex items-center gap-1">
                            <ItemSprite item={step.parentSpecies.heldItem.itemKey} size={12} />
                            {step.parentSpecies.heldItem.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-brand-soft">+</span>

                    {/* Lado Ditto */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={dittoSpriteUrl}
                        alt="Ditto"
                        className="w-7 h-7 object-contain"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">
                          {step.parentDitto.name}{' '}
                          <span className="text-[10px] text-brand-soft font-mono">
                            ({Object.values(step.parentDitto.ivs).filter((v) => v === 31).length}x31)
                          </span>
                        </span>
                        {step.parentDitto.heldItem && (
                          <span className="text-[10px] text-brand-soft flex items-center gap-1">
                            <ItemSprite item={step.parentDitto.heldItem.itemKey} size={12} />
                            {step.parentDitto.heldItem.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-success shrink-0" />

                    {/* Cría resultante */}
                    <div className="flex items-center gap-2 bg-success/10 px-2.5 py-1 rounded-lg border border-success/30">
                      <img
                        src={speciesSpriteUrl}
                        alt="Cría"
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-xs font-bold text-success font-mono">
                        {step.offspring.perfectCount}x31
                      </span>
                    </div>
                  </div>

                  {/* Flecha conectora hacia el siguiente paso si no es el último */}
                  {!isLast && (
                    <div className="h-6 w-0.5 bg-gradient-to-b from-brand/60 to-brand/20 my-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DittoBreedingTree;
