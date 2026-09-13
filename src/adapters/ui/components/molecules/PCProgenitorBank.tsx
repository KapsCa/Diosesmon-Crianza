import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, X, Search } from 'lucide-react';
import { POKEMON_SPECIES_LIST } from '../../../../domain/data/speciesData';
import {
  type StoredPokemon,
  DEFAULT_SPECIMENS,
} from '../../../../domain/data/pcStorage';

export type { StoredPokemon };

interface PCProgenitorBankProps {
  onSelectProgenitor?: (specimen: StoredPokemon, role: 'father' | 'mother') => void;
  selectedSpeciesName?: string;
}

export const PCProgenitorBank: React.FC<PCProgenitorBankProps> = ({
  onSelectProgenitor,
  selectedSpeciesName: _selectedSpeciesName,
}) => {
  const [specimens, setSpecimens] = useState<StoredPokemon[]>(() => {
    try {
      const saved = localStorage.getItem('diosesmon_pc_specimens');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read pc specimens from storage', e);
    }
    return DEFAULT_SPECIMENS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [filterSpecies, setFilterSpecies] = useState('');

  // Form state
  const [formSpecies, setFormSpecies] = useState('Ditto');
  const [formGender, setFormGender] = useState<'male' | 'female' | 'genderless'>('genderless');
  const [formIVs, setFormIVs] = useState({
    hp: 31,
    attack: 31,
    defense: 31,
    spatk: 31,
    spdef: 31,
    speed: 31,
  });
  const [formNotes, setFormNotes] = useState('');

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('diosesmon_pc_specimens', JSON.stringify(specimens));
    } catch (e) {
      console.warn('Could not save pc specimens to storage', e);
    }
  }, [specimens]);

  const handleAddSpecimen = (e: React.FormEvent) => {
    e.preventDefault();
    const found = POKEMON_SPECIES_LIST.find(
      (s) => s.name.toLowerCase() === formSpecies.toLowerCase()
    );

    const newSpecimen: StoredPokemon = {
      id: `specimen-${Date.now()}`,
      speciesName: found ? found.name : formSpecies,
      speciesId: found ? found.id : 132,
      gender: formSpecies.toLowerCase() === 'ditto' ? 'genderless' : formGender,
      ivs: { ...formIVs },
      notes: formNotes || undefined,
    };

    setSpecimens([newSpecimen, ...specimens]);
    setIsAdding(false);
    setFormNotes('');
  };

  const handleDelete = (id: string) => {
    setSpecimens(specimens.filter((s) => s.id !== id));
  };

  const filteredSpecimens = specimens.filter((s) => {
    if (!filterSpecies) return true;
    return s.speciesName.toLowerCase().includes(filterSpecies.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#0f131c] border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">
            Banco de Progenitores (PC Local)
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {specimens.length} especímenes
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-purple-600/30 text-purple-200 border border-purple-500/40 hover:bg-purple-600/50 transition-colors"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isAdding ? 'Cancelar' : 'Registrar Espécimen'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          placeholder="Buscar espécimen en PC (ej: Ditto, Gible, Dragón)..."
          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* New specimen form */}
      {isAdding && (
        <form
          onSubmit={handleAddSpecimen}
          className="p-3.5 rounded-lg bg-[#0a0e17] border border-purple-500/40 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
            <span>Registrar Nuevo Pokémon en tu PC</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Especie</label>
              <select
                value={formSpecies}
                onChange={(e) => {
                  setFormSpecies(e.target.value);
                  if (e.target.value.toLowerCase() === 'ditto') {
                    setFormGender('genderless');
                  }
                }}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-[#131722] border border-slate-700 text-white"
              >
                <option value="Ditto">Ditto (Comodín Universal)</option>
                {POKEMON_SPECIES_LIST.filter((s) => s.id <= 1025).map((s) => (
                  <option key={s.id} value={s.name}>
                    #{String(s.id).padStart(3, '0')} {s.name} (Gen {s.gen})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Género</label>
              <select
                value={formGender}
                disabled={formSpecies.toLowerCase() === 'ditto'}
                onChange={(e) => setFormGender(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-[#131722] border border-slate-700 text-white disabled:opacity-50"
              >
                <option value="male">♂ Macho</option>
                <option value="female">♀ Hembra</option>
                <option value="genderless">⚲ Sin género</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Notas / Origen</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Ej: Capturado en bioma montaña..."
                className="w-full text-xs px-2.5 py-1.5 rounded bg-[#131722] border border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Quick IV toggles for the 6 stats */}
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">
              IVs del espécimen (clic para alternar 31 o valor estándar)
            </label>
            <div className="grid grid-cols-6 gap-2">
              {(['hp', 'attack', 'defense', 'spatk', 'spdef', 'speed'] as const).map((st) => {
                const is31 = formIVs[st] === 31;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      setFormIVs({
                        ...formIVs,
                        [st]: is31 ? 0 : 31,
                      })
                    }
                    className={`py-1.5 px-1 rounded text-center text-xs font-mono font-bold transition-all border ${
                      is31
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] block uppercase font-sans font-normal opacity-70">
                      {st === 'spatk' ? 'SpA' : st === 'spdef' ? 'SpD' : st}
                    </span>
                    {formIVs[st]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Guardar en PC
            </button>
          </div>
        </form>
      )}

      {/* Specimens List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredSpecimens.map((item) => {
          const perfectCount = Object.values(item.ivs).filter((v) => v === 31).length;
          const isGenderless = item.gender === 'genderless';
          const isMale = item.gender === 'male';

          return (
            <div
              key={item.id}
              className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{item.speciesName}</span>
                  <span
                    className={`text-xs font-bold ${
                      isGenderless
                        ? 'text-purple-400'
                        : isMale
                        ? 'text-sky-400'
                        : 'text-pink-400'
                    }`}
                  >
                    {isGenderless ? '⚲' : isMale ? '♂' : '♀'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                    {perfectCount}x31
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-600 hover:text-rose-400 p-0.5"
                    title="Eliminar de PC"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* IVs Badges */}
              <div className="grid grid-cols-6 gap-1 text-[10px] font-mono text-center">
                {(['hp', 'attack', 'defense', 'spatk', 'spdef', 'speed'] as const).map((stat) => {
                  const val = item.ivs[stat];
                  return (
                    <span
                      key={stat}
                      className={`rounded px-1 py-0.5 ${
                        val === 31
                          ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {val === 31 ? '31' : val}
                    </span>
                  );
                })}
              </div>

              {item.notes && (
                <p className="text-[10px] text-slate-400 truncate">{item.notes}</p>
              )}

              {onSelectProgenitor && (
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onSelectProgenitor(item, 'father')}
                    className="flex-1 py-1 text-[11px] rounded bg-sky-950/40 text-sky-300 border border-sky-800/40 hover:bg-sky-900/50 transition-colors"
                  >
                    Usar como Padre ♂
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectProgenitor(item, 'mother')}
                    className="flex-1 py-1 text-[11px] rounded bg-pink-950/40 text-pink-300 border border-pink-800/40 hover:bg-pink-900/50 transition-colors"
                  >
                    Usar como Madre ♀
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PCProgenitorBank;
