import React, { useState, useMemo } from 'react';
import { Flame, Coins, Check, X, BookOpen, Search, ArrowRightLeft, Sparkles, Heart, MapPin } from 'lucide-react';
import { EggGroup, EGG_GROUP_NAMES_ES } from '../../../../domain/types/eggGroup';
import { POKEMON_SPECIES_LIST } from '../../../../domain/data/speciesData';
import type { Species } from '../../../../domain/types/pokemon';
import { DIOSESMON_ITEM_COSTS, ITEM_NAMES_ES, ITEM_DESCRIPTIONS_ES, ItemType } from '../../../../domain/types/items';

export const CompatibilityRulesMatrix: React.FC = () => {
  // Select Pokémon species directly instead of egg groups
  const [selectedIdA, setSelectedIdA] = useState<number>(443); // Gible por defecto
  const [selectedIdB, setSelectedIdB] = useState<number>(132); // Ditto por defecto
  const [suggestionFilter, setSuggestionFilter] = useState<string>('');

  const speciesA: Species = useMemo(() => {
    return POKEMON_SPECIES_LIST.find((s) => s.id === selectedIdA) || POKEMON_SPECIES_LIST[0];
  }, [selectedIdA]);

  const speciesB: Species = useMemo(() => {
    return POKEMON_SPECIES_LIST.find((s) => s.id === selectedIdB) || POKEMON_SPECIES_LIST[1];
  }, [selectedIdB]);

  // Formateador de nombres de grupos huevo en español
  const getEggGroupNames = (species: Species): string[] => {
    return (species.eggGroups || []).map(
      (g) => EGG_GROUP_NAMES_ES[g.name as EggGroup] || g.name
    );
  };

  // Determinar compatibilidad entre dos Pokémon
  const checkCompatibility = (a: Species, b: Species) => {
    const isDittoA = a.name === 'Ditto';
    const isDittoB = b.name === 'Ditto';

    const hasUndiscoveredA = (a.eggGroups || []).some((g) => g.name === 'Undiscovered');
    const hasUndiscoveredB = (b.eggGroups || []).some((g) => g.name === 'Undiscovered');

    if (hasUndiscoveredA) {
      return {
        compatible: false,
        reason: `${a.name} pertenece al grupo Desconocido / Bebé / No Huevos y no puede criar.`,
      };
    }

    if (hasUndiscoveredB) {
      return {
        compatible: false,
        reason: `${b.name} pertenece al grupo Desconocido / Bebé / No Huevos y no puede criar.`,
      };
    }

    // Dos Dittos no pueden criar entre sí
    if (isDittoA && isDittoB) {
      return {
        compatible: false,
        reason: 'Dos Ditto no pueden reproducirse entre sí.',
      };
    }

    // Cruza con Ditto (compatible con cualquier especie no-Undiscovered)
    if (isDittoA || isDittoB) {
      return {
        compatible: true,
        sharedGroups: ['Ditto (Comodín Universal)'],
        reason: 'Compatible al 100% mediante reproducción universal con Ditto.',
      };
    }

    // Especies normales: buscar grupos huevo compartidos (excluyendo Undiscovered)
    const groupsA = (a.eggGroups || []).map((g) => g.name).filter((g) => g !== 'Undiscovered');
    const groupsB = (b.eggGroups || []).map((g) => g.name).filter((g) => g !== 'Undiscovered');

    const shared = groupsA.filter((g) => groupsB.includes(g));

    if (shared.length > 0) {
      const sharedInEs = shared.map((g) => EGG_GROUP_NAMES_ES[g as EggGroup] || g);
      return {
        compatible: true,
        sharedGroups: sharedInEs,
        reason: `Comparten grupo huevo: ${sharedInEs.join(', ')}.`,
      };
    }

    return {
      compatible: false,
      reason: `${a.name} (${getEggGroupNames(a).join(', ')}) y ${b.name} (${getEggGroupNames(b).join(', ')}) no comparten ningún grupo huevo.`,
    };
  };

  const compatibilityResult = useMemo(() => {
    return checkCompatibility(speciesA, speciesB);
  }, [speciesA, speciesB]);

  // Lista de Pokémon sugeridos que son compatibles con speciesA
  const compatibleSuggestions = useMemo(() => {
    const isUndiscoveredA = (speciesA.eggGroups || []).some((g) => g.name === 'Undiscovered');
    if (isUndiscoveredA) return [];

    const isDittoA = speciesA.name === 'Ditto';

    const groupsA = (speciesA.eggGroups || [])
      .map((g) => g.name)
      .filter((g) => g !== 'Undiscovered');

    return POKEMON_SPECIES_LIST.filter((candidate) => {
      if (candidate.id === speciesA.id) return false;

      const isUndiscoveredCand = (candidate.eggGroups || []).some((g) => g.name === 'Undiscovered');
      if (isUndiscoveredCand) return false;

      // Si A es Ditto, puede criar con cualquier no-Undiscovered y no-Ditto
      if (isDittoA) {
        return candidate.name !== 'Ditto';
      }

      // Ditto siempre es compatible con especies que no sean Undiscovered
      if (candidate.name === 'Ditto') {
        return true;
      }

      // Si comparten al menos un grupo huevo
      const candGroups = (candidate.eggGroups || []).map((g) => g.name);
      return groupsA.some((g) => candGroups.includes(g));
    });
  }, [speciesA]);

  // Filtrar sugerencias por búsqueda del usuario
  const filteredSuggestions = useMemo(() => {
    if (!suggestionFilter.trim()) return compatibleSuggestions.slice(0, 18);
    const query = suggestionFilter.toLowerCase();
    return compatibleSuggestions
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          getEggGroupNames(s).some((g) => g.toLowerCase().includes(query))
      )
      .slice(0, 24);
  }, [compatibleSuggestions, suggestionFilter]);

  const handleSwap = () => {
    const temp = selectedIdA;
    setSelectedIdA(selectedIdB);
    setSelectedIdB(temp);
  };

  return (
    <div className="w-full flex flex-col gap-5 p-5 rounded-2xl bg-[#0b0f19] border border-purple-500/25 shadow-xl">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold font-['Sora'] text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Verificador de Compatibilidad & Tienda de Crianza
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Comprobador entre Pokémon con sugerencias de parejas compatibles y tarifas del servidor
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
          <Heart className="w-3.5 h-3.5 text-pink-400" />
          <span>{POKEMON_SPECIES_LIST.length} Pokémon en base de datos</span>
        </div>
      </div>

      {/* Interactive Pokémon Compatibility Checker */}
      <div className="p-4 rounded-xl bg-[#0f131c] border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Verificador Rápido de Compatibilidad entre Pokémon
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Selecciona dos Pokémon para comprobar su compatibilidad directa
          </span>
        </div>

        {/* Selectors Row */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
          {/* Pokémon A Selector */}
          <div className="p-3 rounded-xl bg-[#0a0e17] border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                <span>Padre / Pokémon A</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">#{speciesA.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesA.id}.png`}
                  alt={speciesA.name}
                  className="w-8 h-8 object-contain drop-shadow"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <select
                value={selectedIdA}
                onChange={(e) => setSelectedIdA(Number(e.target.value))}
                className="flex-1 text-xs px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              >
                {POKEMON_SPECIES_LIST.filter((sp) => sp.id <= 1025).map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    #{String(sp.id).padStart(3, '0')} {sp.name} — {getEggGroupNames(sp).join(', ')} (Gen {sp.gen})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="text-slate-500">Grupos Huevo:</span>
              <span className="text-purple-300 font-medium">
                {getEggGroupNames(speciesA).join(', ')}
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-1 md:my-0">
            <button
              type="button"
              onClick={handleSwap}
              title="Intercambiar Pokémon A y B"
              className="p-2.5 rounded-full bg-slate-800 hover:bg-purple-900/50 text-slate-300 hover:text-white border border-slate-700 hover:border-purple-500/50 transition-colors shadow-md"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Pokémon B Selector */}
          <div className="p-3 rounded-xl bg-[#0a0e17] border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-pink-400 flex items-center gap-1">
                <span>Madre / Pokémon B</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">#{speciesB.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesB.id}.png`}
                  alt={speciesB.name}
                  className="w-8 h-8 object-contain drop-shadow"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <select
                value={selectedIdB}
                onChange={(e) => setSelectedIdB(Number(e.target.value))}
                className="flex-1 text-xs px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
              >
                {POKEMON_SPECIES_LIST.filter((sp) => sp.id <= 1025).map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    #{String(sp.id).padStart(3, '0')} {sp.name} — {getEggGroupNames(sp).join(', ')} (Gen {sp.gen})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="text-slate-500">Grupos Huevo:</span>
              <span className="text-purple-300 font-medium">
                {getEggGroupNames(speciesB).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Compatibility Verdict Box */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            compatibilityResult.compatible
              ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/25 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                compatibilityResult.compatible
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {compatibilityResult.compatible ? (
                <Check className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  {compatibilityResult.compatible ? '¡100% Compatibles!' : 'Incompatibles para Crianza'}
                </span>
                <span className="text-[11px] font-mono opacity-80">
                  ({speciesA.name} + {speciesB.name})
                </span>
              </div>
              <p className="text-xs mt-0.5 opacity-90">{compatibilityResult.reason}</p>
            </div>
          </div>

          {compatibilityResult.compatible && (
            <div className="text-xs bg-slate-900/60 px-3 py-1.5 rounded-lg border border-emerald-500/20 shrink-0 text-slate-300 font-mono flex items-center gap-2">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                  speciesB.name === 'Ditto' ? speciesA.id : speciesB.id
                }.png`}
                alt="Cría resultante"
                className="w-6 h-6 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>
                Cría resultante:{' '}
                <strong className="text-white">
                  {speciesB.name === 'Ditto' ? speciesA.name : speciesB.name}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Suggested Compatible Pokémon for Pokémon A */}
        <div className="mt-1 pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              <span>
                Pokémon sugeridos compatibles con <strong className="text-white">{speciesA.name}</strong>:
              </span>
              <span className="text-[11px] text-purple-400 font-mono">
                ({compatibleSuggestions.length} encontrados)
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={suggestionFilter}
                onChange={(e) => setSuggestionFilter(e.target.value)}
                placeholder="Filtrar compatibles..."
                className="w-full text-xs pl-8 pr-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {compatibleSuggestions.length === 0 ? (
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
              Este Pokémon no tiene parejas compatibles (grupo Desconocido o No Huevos).
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {filteredSuggestions.map((candidate) => {
                const isCurrentlySelected = candidate.id === speciesB.id;
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => setSelectedIdB(candidate.id)}
                    className={`p-2 rounded-lg text-left transition-all border flex items-center gap-2 ${
                      isCurrentlySelected
                        ? 'bg-purple-900/40 border-purple-500 text-white shadow-sm shadow-purple-950/40'
                        : 'bg-[#0a0e17] border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${candidate.id}.png`}
                        alt={candidate.name}
                        className="w-7 h-7 object-contain drop-shadow"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold truncate">{candidate.name}</span>
                        {isCurrentlySelected && (
                          <span className="text-[8px] px-1 rounded bg-purple-500/40 text-purple-200">
                            Activo
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate">
                        {getEggGroupNames(candidate).join(', ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <span className="text-[11px] text-slate-500 italic">
            * Haz clic en cualquier sugerencia para seleccionarla como pareja de cruza directamente.
          </span>
        </div>
      </div>

      {/* Official NPC Store: Tienda de Crianza */}
      <div className="p-4 rounded-xl bg-[#0f131c] border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Tienda de crianza (Catálogo Oficial de Precios)
          </span>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Tarifa fija de 500 Pk$ por ítem
          </span>
        </div>

        {/* Comment / Accessibility note requested by user */}
        <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 flex items-start gap-2 text-xs text-purple-200">
          <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Acceso a la Tienda de crianza:</strong> Se accede a través del <strong>PokéPad</strong> o en el <strong>spawn en el piso superior de la guardería</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-1">
          {Object.entries(DIOSESMON_ITEM_COSTS).map(([itemKey, price]) => {
            const itemType = itemKey as ItemType;
            const name = ITEM_NAMES_ES[itemType] || itemKey;
            const desc = ITEM_DESCRIPTIONS_ES[itemType] || '';
            const isEverstone = itemType === ItemType.Everstone;
            const isMirrorHerb = itemType === ItemType.MirrorHerb;

            return (
              <div
                key={itemKey}
                className="p-3 rounded-lg bg-[#0a0e17] border border-slate-800/80 flex flex-col justify-between gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame
                      className={`w-3.5 h-3.5 ${
                        isEverstone
                          ? 'text-purple-400'
                          : isMirrorHerb
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    />
                    {name}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {price.toLocaleString()} Pk$
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                  <span>1x Burn</span>
                  <span>Tienda de crianza</span>
                </div>
              </div>
            );
          })}

          {/* Gender selection fee entry */}
          <div className="p-3 rounded-lg bg-[#0a0e17] border border-sky-500/30 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-sky-400" />
                Selección de Sexo de la Cría
              </span>
              <span className="text-xs font-mono font-bold text-sky-300">
                500 Pk$
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Tarifa única para garantizar el género (Macho ♂ o Hembra ♀) de la cría al eclosionar.
            </p>
            <div className="flex items-center justify-between text-[10px] text-sky-400/80 font-mono pt-1 border-t border-slate-800/60">
              <span>Opcional por cruza</span>
              <span>Guardería Diosesmon</span>
            </div>
          </div>

          {/* Daycare service entry (Gratis / 0 Pk$) */}
          <div className="p-3 rounded-lg bg-[#0a0e17] border border-emerald-500/30 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Tarifa de Guardería
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                0 Pk$ (¡Gratis!)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Sin tarifa de guardería en el servidor. Las parejas de cría se incuban sin costo adicional por ciclo.
            </p>
            <div className="flex items-center justify-between text-[10px] text-emerald-400/80 font-mono pt-1 border-t border-slate-800/60">
              <span>Sin costo base</span>
              <span>Guardería Diosesmon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reglas de Herencia: Naturaleza y Habilidad */}
      <div className="p-4 rounded-xl bg-[#0f131c] border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            Reglas de Herencia: Naturaleza y Habilidad (Sin opción de pago)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Naturaleza */}
          <div className="p-3.5 rounded-lg bg-[#0a0e17] border border-purple-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Naturaleza (Piedra Eterna)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para garantizar que la cría herede una naturaleza específica al 100%, se debe equipar la <strong>Piedra Eterna</strong> (500 Pk$ en la tienda de crianza).
            </p>
            <div className="p-2 rounded bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200">
              ⚠ <strong>Condición estricta:</strong> Solo funciona si el progenitor que equipa la piedra ya posee dicha naturaleza. <strong>No se puede pagar para fijarla arbitrariamente</strong> si ningún padre la tiene.
            </div>
          </div>

          {/* Habilidad */}
          <div className="p-3.5 rounded-lg bg-[#0a0e17] border border-emerald-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Habilidad y Habilidad Oculta (Hierba Copia)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              La transferencia de habilidad se realiza mediante la <strong>Hierba Copia</strong> (500 Pk$), como en el Pokémon original.
            </p>
            <div className="p-2 rounded bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-200">
              ★ <strong>Condición estricta:</strong> Al igual que con la naturaleza, <strong>solo se transfiere si uno de los padres ya posee la habilidad</strong> (aplica tanto a habilidades comunes como a la <strong>Habilidad Oculta</strong>). No existe método de pago para fijar una habilidad.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityRulesMatrix;
