import React, { useState } from 'react';
import type { BreedingTree as BreedingTreeType } from '../../../../domain/types/route';
import { BreedingTreePro } from './BreedingTreePro';

interface BreedingTreeProps {
  /** Datos del árbol de breeding */
  treeData: BreedingTreeType;
  /** Si true, muestra modo simple (resumido); false = modo avanzado */
  simpleMode?: boolean;
  /** Callback opcional cuando un nodo es expandido/collapse o cambia de modo */
  onNodeToggle?: (mode: 'simple' | 'advanced') => void;
  /** Nombre opcional de la especie objetivo */
  targetSpeciesName?: string;
  /** ID opcional de la especie objetivo */
  targetSpeciesId?: number;
  /** Naturaleza deseada si aplica */
  nature?: string;
  /** Cantidad de IVs objetivo (5 o 6) */
  targetIVsCount?: number;
  /** Si se usa Piedra Eterna para herencia */
  useEverstone?: boolean;
}

export const BreedingTree: React.FC<BreedingTreeProps> = ({
  treeData,
  simpleMode = false,
  onNodeToggle,
  targetSpeciesName,
  targetSpeciesId,
  nature,
  targetIVsCount = 6,
  useEverstone = false,
}) => {
  const [internalSimpleMode, setInternalSimpleMode] = useState(simpleMode);
  const effectiveSimpleMode = onNodeToggle ? simpleMode : internalSimpleMode;

  const handleToggle = (mode: 'simple' | 'advanced') => {
    setInternalSimpleMode(mode === 'simple');
    onNodeToggle?.(mode);
  };

  return (
    <div className="breeding-tree-container flex flex-col gap-5 w-full">
      {/* Controles de accesibilidad para modo de visualización */}
      <div className="sr-only" aria-hidden="false">
        <label>
          <input
            type="radio"
            name="tree-mode"
            value="simple"
            checked={effectiveSimpleMode}
            onChange={() => handleToggle('simple')}
          />
          Simple
        </label>
        <label>
          <input
            type="radio"
            name="tree-mode"
            value="advanced"
            checked={!effectiveSimpleMode}
            onChange={() => handleToggle('advanced')}
          />
          Avanzado
        </label>
      </div>

      {/* Árbol Visual Pro con Zoom, Brazales y Auditoría Financiera */}
      <BreedingTreePro
        treeData={treeData}
        targetSpeciesName={targetSpeciesName || treeData.root?.pokemon?.species?.name}
        targetSpeciesId={targetSpeciesId || treeData.root?.pokemon?.species?.id}
        nature={nature}
        targetIVsCount={targetIVsCount}
        useEverstone={useEverstone}
        simpleMode={effectiveSimpleMode}
        onModeToggle={handleToggle}
      />
    </div>
  );
};

export default BreedingTree;
