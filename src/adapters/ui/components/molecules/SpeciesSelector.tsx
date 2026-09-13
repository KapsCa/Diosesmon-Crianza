import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import { EggGroup, EGG_GROUP_NAMES_ES } from '../../../../domain/types/eggGroup';

/**
 * Tope de filas que se renderizan a la vez.
 *
 * El dex tiene 1026 especies. Volcarlas todas cuesta ~1.8 s por render (insertar cada
 * <option> crece de forma superlineal: 100 opciones = 90 ms, 1026 = 1775 ms) y congela
 * la UI. El buscador y el filtro por generación son el camino para llegar al resto del
 * dex, así que la lista se acota.
 */
const MAX_VISIBLE_SPECIES = 60;

/**
 * SpeciesSelector - Componente unificado para buscar y seleccionar una especie Pokémon.
 *
 * Combina en un solo control la escritura y la selección de la lista desplegable,
 * incorporando los sprites oficiales de cada Pokémon.
 */
interface SpeciesSelectorProps {
  speciesList: {
    id: number;
    name: string;
    genderRatio: number;
    eggGroups: { name: string }[];
    gen: number;
    baseStats: {
      hp: number;
      attack: number;
      defense: number;
      spatk: number;
      spdef: number;
      speed: number;
    };
    captureRate: number;
  }[];
  eggGroupFilter?: string;
  onSelect?: (species: { id: number; name: string }) => void;
  disabled?: boolean;
  selectedSpeciesId?: number;
}

export const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({
  speciesList,
  eggGroupFilter,
  onSelect,
  disabled,
  selectedSpeciesId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [internalSelectedId, setInternalSelectedId] = useState<number | ''>(selectedSpeciesId ?? '');
  const selectedId = selectedSpeciesId !== undefined ? selectedSpeciesId : internalSelectedId;

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar species por eggGroup si se proporciona
  const baseFilteredSpecies = useMemo(() => {
    return eggGroupFilter
      ? speciesList.filter((species) =>
          species.eggGroups.some((group) => group.name === eggGroupFilter)
        )
      : speciesList;
  }, [speciesList, eggGroupFilter]);

  // Especie actualmente seleccionada
  const currentSelectedSpecies = useMemo(() => {
    return baseFilteredSpecies.find((s) => s.id === selectedId);
  }, [baseFilteredSpecies, selectedId]);

  // Filtrar especies por generación y búsqueda de texto
  const filteredSpecies = useMemo(() => {
    let result = baseFilteredSpecies;
    if (selectedGen !== 'all') {
      result = result.filter((s) => s.gen === selectedGen);
    }

    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return result;

    return result.filter(
      (species) =>
        species.name.toLowerCase().includes(cleanSearch) ||
        species.id.toString() === cleanSearch ||
        species.eggGroups.some((g) => g.name.toLowerCase().includes(cleanSearch))
    );
  }, [baseFilteredSpecies, selectedGen, searchTerm]);

  // Lo que se dibuja realmente: la lista acotada, no el resultado completo.
  const visibleSpecies = useMemo(
    () =>
      filteredSpecies.length > MAX_VISIBLE_SPECIES
        ? filteredSpecies.slice(0, MAX_VISIBLE_SPECIES)
        : filteredSpecies,
    [filteredSpecies]
  );

  const handleSelectSpecies = (species: { id: number; name: string }) => {
    setInternalSelectedId(species.id);
    setSearchTerm('');
    setIsOpen(false);
    if (onSelect) {
      onSelect({ id: species.id, name: species.name });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);

    // Si el usuario escribe exactamente el nombre de una especie, seleccionarla
    const exactMatch = baseFilteredSpecies.find(
      (s) => s.name.toLowerCase() === val.trim().toLowerCase()
    );
    if (exactMatch) {
      setInternalSelectedId(exactMatch.id);
      if (onSelect) {
        onSelect({ id: exactMatch.id, name: exactMatch.name });
      }
    } else if (selectedId !== '') {
      setInternalSelectedId('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSpecies.length > 0) {
        handleSelectSpecies(filteredSpecies[0]);
      } else if (searchTerm.trim() && onSelect) {
        handleSelectSpecies({ id: 99999, name: searchTerm.trim() });
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && !isOpen) {
      setIsOpen(true);
    }
  };

  const getSpriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return (
    <div ref={containerRef} className="species-selector w-full flex flex-col gap-2 relative">
      <label htmlFor="species-search-input" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
        <span>Especie Pokémon Objetivo</span>
        {currentSelectedSpecies && (
          <span className="text-[11px] font-mono text-purple-400">
            #{String(currentSelectedSpecies.id).padStart(3, '0')} • {currentSelectedSpecies.name}
          </span>
        )}
      </label>

      {/* Select nativo accesible para mantener compatibilidad con tests y lectores de pantalla */}
      <select
        id="species-selector"
        aria-label="Especie Pokémon"
        className="opacity-0 pointer-events-none absolute h-0 w-0 overflow-hidden"
        tabIndex={-1}
        value={selectedId}
        onChange={(e) => {
          const id = Number(e.target.value);
          const chosen = speciesList.find((s) => s.id === id);
          if (chosen) {
            handleSelectSpecies(chosen);
          }
        }}
        disabled={disabled}
      >
        <option value="" disabled>
          Seleccioná una especie
        </option>
        {visibleSpecies.map((species) => (
          <option key={species.id} value={species.id}>
            {species.name}
          </option>
        ))}
      </select>

      {/* Campo unificado de búsqueda y selección con Sprite */}
      <div
        className={`w-full rounded-xl border transition-all duration-200 bg-[#0a0e17] flex items-center gap-2.5 px-3 py-2 ${
          isOpen
            ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg shadow-purple-950/20'
            : 'border-slate-800 hover:border-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        {/* Sprite del Pokémon seleccionado o Icono de Búsqueda */}
        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
          {currentSelectedSpecies ? (
            <img
              src={getSpriteUrl(currentSelectedSpecies.id)}
              alt={currentSelectedSpecies.name}
              className="w-8 h-8 object-contain drop-shadow-sm"
              loading="lazy"
              onError={(e) => {
                // Fallback visual si el sprite no carga
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Search className="w-4 h-4 text-slate-500" />
          )}
        </div>

        {/* Input para escribir y filtrar al mismo tiempo */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <input
            ref={inputRef}
            id="species-search-input"
            type="text"
            className="w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none"
            placeholder={
              currentSelectedSpecies
                ? `${currentSelectedSpecies.name} (Escribe para cambiar...)`
                : 'Escribe el nombre del Pokémon o selecciona de la lista...'
            }
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            autoComplete="off"
          />
          {currentSelectedSpecies && !searchTerm && (
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <span>Grupos:</span>
              <span className="text-purple-300">
                {currentSelectedSpecies.eggGroups
                  .map((g) => EGG_GROUP_NAMES_ES[g.name as EggGroup] || g.name)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Botón de limpiar o badge */}
        {searchTerm && (
          <button
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSearchTerm('');
              inputRef.current?.focus();
            }}
            aria-label="Borrar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Chevron para abrir/cerrar la lista */}
        <button
          type="button"
          tabIndex={-1}
          className="p-1 text-slate-400 hover:text-white transition-transform duration-200"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(!isOpen);
            }
          }}
          aria-label={isOpen ? 'Cerrar lista' : 'Abrir lista'}
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
        </button>
      </div>

      {/* Menú Desplegable Unificado con Sprites de cada Pokémon */}
      {isOpen && !disabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-[#0f131c] border border-purple-500/30 rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col backdrop-blur-md max-h-72">
          {/* Header informativo dentro del select */}
          <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              {filteredSpecies.length} especies encontradas
              {filteredSpecies.length > MAX_VISIBLE_SPECIES && (
                <span className="text-slate-500">
                  · mostrando {MAX_VISIBLE_SPECIES}, afiná la búsqueda
                </span>
              )}
            </span>
            {searchTerm && <span className="font-mono text-purple-300">Filtro: "{searchTerm}"</span>}
          </div>

          {/* Filtro rápido por Generación (1 a 9) */}
          <div className="px-2 py-1.5 bg-[#0a0e17] border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-[10px] scrollbar-none">
            <span className="text-slate-500 shrink-0 px-1 font-semibold">Gen:</span>
            <button
              type="button"
              onClick={() => setSelectedGen('all')}
              className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
                selectedGen === 'all'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Todas (1025)
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((genNum) => (
              <button
                key={genNum}
                type="button"
                onClick={() => setSelectedGen(genNum)}
                className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
                  selectedGen === genNum
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Gen {genNum}
              </button>
            ))}
          </div>

          {/* Lista scrolleable con sprites */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50 p-1">
            {filteredSpecies.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No se encontró ninguna especie con ese criterio.
              </div>
            ) : (
              visibleSpecies.map((species) => {
                const isSelected = selectedId === species.id;
                return (
                  <button
                    key={species.id}
                    type="button"
                    aria-label={species.name}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? 'bg-purple-600/20 text-white border border-purple-500/40'
                        : 'hover:bg-slate-800/80 text-slate-200 hover:text-white'
                    }`}
                    onClick={() => handleSelectSpecies(species)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Sprite de Pokémon */}
                      <div className="w-8 h-8 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-center shrink-0">
                        <img
                          src={getSpriteUrl(species.id)}
                          alt={species.name}
                          className="w-7 h-7 object-contain drop-shadow"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Info de Especie */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate">{species.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            #{String(species.id).padStart(3, '0')}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            Gen {species.gen}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {species.eggGroups
                            .map((g) => EGG_GROUP_NAMES_ES[g.name as EggGroup] || g.name)
                            .join(', ')}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesSelector;