import React, { useState } from 'react';
import { Database, X, Check } from 'lucide-react';
import { type StoredPokemon, getStoredSpecimens } from '../../../../domain/data/pcStorage';

interface PCQuickPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'father' | 'mother' | 'base';
  onSelect: (specimen: StoredPokemon, role: 'father' | 'mother' | 'base') => void;
}

export const PCQuickPickerModal: React.FC<PCQuickPickerModalProps> = ({
  isOpen,
  onClose,
  targetRole = 'base',
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const specimens = getStoredSpecimens();

  if (!isOpen) return null;

  const filtered = specimens.filter(
    (s) =>
      s.speciesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.speciesId.toString() === searchTerm ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSpriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  const statKeys: ('hp' | 'attack' | 'defense' | 'spatk' | 'spdef' | 'speed')[] = [
    'hp',
    'attack',
    'defense',
    'spatk',
    'spdef',
    'speed',
  ];

  const statLabels = {
    hp: 'PS',
    attack: 'Atk',
    defense: 'Def',
    spatk: 'SpA',
    spdef: 'SpD',
    speed: 'Spe',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-surface border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-surface-sunken">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Sora'] flex items-center gap-2">
                Banco PC - Seleccionar Ejemplar
                {targetRole === 'mother' && (
                  <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Para Madre (♀)
                  </span>
                )}
                {targetRole === 'father' && (
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Para Padre (♂)
                  </span>
                )}
                {targetRole === 'base' && (
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Ejemplar Base
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Elige uno de tus Pokémon guardados para iniciar o continuar la cría
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800/80 bg-canvas">
          <input
            type="text"
            placeholder="Filtrar por especie o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-surface-sunken border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            autoFocus
          />
        </div>

        {/* Specimen List */}
        <div className="p-4 overflow-y-auto flex flex-col gap-3 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <Database className="w-8 h-8 opacity-40 text-slate-600" />
              <span>No hay ejemplares que coincidan con la búsqueda</span>
            </div>
          ) : (
            filtered.map((specimen) => {
              const count31 = Object.values(specimen.ivs).filter((v) => v === 31).length;

              return (
                <div
                  key={specimen.id}
                  className="p-3.5 rounded-xl bg-surface-sunken border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-canvas border border-slate-800 flex items-center justify-center shrink-0">
                      <img
                        src={getSpriteUrl(specimen.speciesId)}
                        alt={specimen.speciesName}
                        className="w-10 h-10 object-contain drop-shadow"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          {specimen.speciesName}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400">
                          #{String(specimen.speciesId).padStart(3, '0')}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            specimen.gender === 'female'
                              ? 'bg-pink-950/60 text-pink-300 border border-pink-800/60'
                              : specimen.gender === 'male'
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {specimen.gender === 'female'
                            ? '♀ Hembra'
                            : specimen.gender === 'male'
                            ? '♂ Macho'
                            : '⚲ Neutro'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                          {count31}x31
                        </span>
                      </div>

                      {specimen.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{specimen.notes}</p>
                      )}

                      {/* IVs Badges */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {statKeys.map((key) => {
                          const val = specimen.ivs[key];
                          const is31 = val === 31;
                          const is0 = val === 0;

                          return (
                            <span
                              key={key}
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                is31
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                                  : is0
                                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              {statLabels[key]}: {val !== undefined ? val : 'X'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Select button */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(specimen, targetRole);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Seleccionar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PCQuickPickerModal;
