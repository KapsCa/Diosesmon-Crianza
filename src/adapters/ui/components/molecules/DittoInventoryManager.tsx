import React from 'react';
import {
  type UserDitto,
  getDefaultDittoPresets,
  STAT_METADATA,
} from '../../../../domain/services/dittoBreedingPlanner';
import { Stat, ALL_STATS } from '../../../../domain/types/stat';
import { type StoredPokemon, getStoredSpecimens } from '../../../../domain/data/pcStorage';
import { Plus, Trash2, Sparkles, Database, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DittoInventoryManagerProps {
  dittos: UserDitto[];
  onChange: (dittos: UserDitto[]) => void;
  targetStats: Stat[];
}

export const DittoInventoryManager: React.FC<DittoInventoryManagerProps> = ({
  dittos,
  onChange,
  targetStats,
}) => {
  const presets = getDefaultDittoPresets();

  // Verificar cobertura de stats del objetivo
  const coveredStats = new Set<Stat>();
  for (const ditto of dittos) {
    for (const s of ALL_STATS) {
      if (ditto.ivs[s] === 31) {
        coveredStats.add(s);
      }
    }
  }

  const missingStats = targetStats.filter((s) => !coveredStats.has(s));

  const handleApplyPreset = (presetKey: 'pack1x31' | 'ditto4x31' | 'ditto5x31') => {
    onChange([...presets[presetKey]]);
  };

  const handleImportFromPC = () => {
    const pcSpecimens: StoredPokemon[] = getStoredSpecimens();
    const pcDittos = pcSpecimens.filter(
      (p) => p.speciesId === 132 || p.speciesName.toLowerCase() === 'ditto'
    );

    if (pcDittos.length > 0) {
      const imported: UserDitto[] = pcDittos.map((p, idx) => ({
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
        notes: p.notes || 'Importado desde Banco PC',
      }));

      onChange(imported);
    } else {
      // Si no hay en PC, aplicar preset 4x31
      handleApplyPreset('ditto4x31');
    }
  };

  const handleToggleStat = (dittoIndex: number, stat: Stat) => {
    const updated = [...dittos];
    const currentVal = updated[dittoIndex].ivs[stat];
    const nextVal = currentVal === 31 ? 0 : 31;

    updated[dittoIndex] = {
      ...updated[dittoIndex],
      ivs: {
        ...updated[dittoIndex].ivs,
        [stat]: nextVal,
      },
    };

    // Actualizar nombre si es automático
    const perfectCount = Object.values(updated[dittoIndex].ivs).filter((v) => v === 31).length;
    if (updated[dittoIndex].name.includes('Ditto')) {
      updated[dittoIndex].name = `Ditto #${dittoIndex + 1} (${perfectCount}x31)`;
    }

    onChange(updated);
  };

  const handleAddDitto = () => {
    const newDitto: UserDitto = {
      id: `ditto-custom-${Date.now()}`,
      name: `Ditto #${dittos.length + 1} (1x31)`,
      ivs: { hp: 31, attack: 0, defense: 0, spatk: 0, spdef: 0, speed: 0 },
      notes: 'Ditto personalizado',
    };
    onChange([...dittos, newDitto]);
  };

  const handleRemoveDitto = (index: number) => {
    if (dittos.length <= 1) return;
    const updated = dittos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c101a] to-[#090d15] border border-brand/30 shadow-xl flex flex-col gap-4">
      {/* Encabezado con aclaración de reglas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/50 flex items-center justify-center text-brand-soft shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-brand-soft" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-['Sora'] flex items-center gap-2">
              <span>¿Qué Dittos tienes en tu PC / Mochila?</span>
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Configura tus Dittos. El árbol armará la ruta exacta asignando <strong>1 banda por progenitor</strong> y aprovechando <strong>Herencia Fija</strong> (stats compartidos en 31).
            </p>
          </div>
        </div>

        {/* Cobertura de stats del objetivo */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {missingStats.length === 0 ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-success/15 text-success border border-success/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              <span>Todos los stats cubiertos</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-warning/15 text-warning border border-warning/30 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-warning" />
              <span>Falta Ditto para: {missingStats.map((s) => STAT_METADATA[s].short).join(', ')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Presets rápidos */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
          Presets rápidos:
        </span>

        <button
          type="button"
          onClick={() => handleApplyPreset('pack1x31')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-sunken hover:bg-brand/15 text-ink hover:text-white border border-line-strong/80 hover:border-brand/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span>⚡ Pack 6x Dittos 1x31</span>
        </button>

        <button
          type="button"
          onClick={() => handleApplyPreset('ditto4x31')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-sunken hover:bg-brand/15 text-ink hover:text-white border border-line-strong/80 hover:border-brand/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span>💎 Ditto 4x31 + Apoyo</span>
        </button>

        <button
          type="button"
          onClick={() => handleApplyPreset('ditto5x31')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-sunken hover:bg-brand/15 text-ink hover:text-white border border-line-strong/80 hover:border-brand/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span>👑 Ditto 5x31</span>
        </button>

        <button
          type="button"
          onClick={handleImportFromPC}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-brand/10 hover:bg-brand/20 text-brand-soft border border-brand/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Database className="w-3 h-3" />
          <span>Importar de Banco PC</span>
        </button>
      </div>

      {/* Lista de Dittos interactiva */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {dittos.map((ditto, index) => {
          const perfectCount = Object.values(ditto.ivs).filter((v) => v === 31).length;

          return (
            <div
              key={ditto.id || index}
              className="p-3.5 rounded-xl bg-canvas/60 border border-line/90 hover:border-brand/40 transition-all flex flex-col gap-2.5 shadow-md group relative"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"
                    alt="Ditto"
                    className="w-7 h-7 object-contain drop-shadow"
                    loading="lazy"
                  />
                  <div>
                    <input
                      type="text"
                      value={ditto.name}
                      onChange={(e) => {
                        const updated = [...dittos];
                        updated[index] = { ...updated[index], name: e.target.value };
                        onChange(updated);
                      }}
                      className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-line-strong focus:border-brand focus:outline-none max-w-[140px]"
                    />
                    <div className="text-[10px] text-brand-soft/80 font-mono">
                      {perfectCount}x31 Perfectos
                    </div>
                  </div>
                </div>

                {dittos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDitto(index)}
                    className="p-1 rounded-lg text-ink-faint hover:text-danger hover:bg-danger/10 transition-all opacity-60 group-hover:opacity-100"
                    title="Eliminar este Ditto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botones interactivos para conmutar cada Stat 31 */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-line/60">
                {ALL_STATS.map((stat) => {
                  const is31 = ditto.ivs[stat] === 31;
                  const isTarget = targetStats.includes(stat);
                  const meta = STAT_METADATA[stat];

                  return (
                    <button
                      key={stat}
                      type="button"
                      onClick={() => handleToggleStat(index, stat)}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        is31
                          ? 'bg-brand text-white shadow-sm ring-1 ring-brand-soft'
                          : 'bg-surface-sunken text-ink-faint hover:text-ink border border-line'
                      } ${!isTarget && is31 ? 'opacity-70' : ''}`}
                      title={`${meta.name}: ${is31 ? '31 IVs (Activo)' : '0 IVs (Click para marcar 31)'}`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span>{meta.short}</span>
                      {is31 && <span className="text-[9px]">31</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón para añadir más Dittos */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleAddDitto}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-soft hover:text-white bg-brand/10 hover:bg-brand/20 border border-brand/30 hover:border-brand transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar otro Ditto a la lista</span>
        </button>

        <span className="text-[11px] text-ink-muted">
          Total de Dittos disponibles: <strong className="text-brand-soft">{dittos.length}</strong>
        </span>
      </div>
    </div>
  );
};

export default DittoInventoryManager;
