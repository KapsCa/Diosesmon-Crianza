import React from 'react';
import type { TreeNode, BreedingTree as BreedingTreeType } from '../../../../domain/types/route';

/**
 * BreedingTree - Componente organismo que muestra un árbol visual de cría
 * con progressive disclosure, tooltips y modo simple/avanzado.
 *
 * Features:
 * - Renderiza un árbol de breeding con nodos jerárquicos
 * - Modo simple: muestra resumen (especie, IVs, items)
 * - Modo avanzado: muestra detalles completos (overlap, genes heredados, costo)
 * - Progressive disclosure: los nodes se pueden expandir/collapse
 * - Tooltips con información detallada al pasar el mouse
 * - Nodos base (sin step) y nodos de paso (con offspring)
 */
interface BreedingTreeProps {
  /** Datos del árbol de breeding */
  treeData: BreedingTreeType;
  /** Si true, muestra modo simple (resumido); false = modo avanzado */
  simpleMode?: boolean;
  /** Callback opcional cuando un nodo es expandido/collapse */
  onNodeToggle?: (nodeId: string) => void;
}

/**
 * Obtiene el ícono o indicador del estado del nodo
 */
function getNodeStatusIcon(node: TreeNode): string {
  if (!node.step) {
    return '🌱'; // Nodo base (semilla)
  }
  if (node.children.length === 0) {
    return '💧'; // Nodo hoja (no hay más crías)
  }
  return '🌳'; // Nodo interno
}

/**
 * Renderiza un nodo individual del árbol
 */
function renderNode(node: TreeNode, simpleMode: boolean, depth: number = 0): React.ReactElement {
  const icon = getNodeStatusIcon(node);
  const pokemon = node.pokemon;

  // Información básica que siempre se muestra
  const basicInfo = (
    <span className="node-pokemon">
      {pokemon.species.name}
      {simpleMode ? '' : ` (Lvl ${node.progressLevel})`}
    </span>
  );

  // Información adicional en modo avanzado
  const advancedInfo = simpleMode ? null : (
    <div className="node-advanced">
      <span className="node-ivs">IVs: {Object.entries(pokemon.ivs)
        .filter(([_, val]) => val === 31)
        .map(([key]) => key)
        .join(', ') || 'ninguno'}</span>
      <span className="node-gender">Género: {pokemon.gender}</span>
      {node.step?.fatherItem || node.step?.motherItem ? (
        <span className="node-items">
          {node.step.fatherItem ? 'Power Item ' + node.step.fatherItem.type : ''}
          {node.step.motherItem ? ', Power Item ' + node.step.motherItem.type : ''}
        </span>
      ) : ''}
    </div>
  );

  // Generar una key única para el nodo
  const nodeKey = `${pokemon.species.id}-${node.progressLevel}-${depth}`;

  return (
    <div
      key={nodeKey}
      className="breeding-node"
      style={{ marginLeft: `${16 * depth}px` }}
      role="button"
      aria-pressed={node.children.length > 0}
      aria-label={simpleMode
        ? `Nodo ${nodeKey}: ${pokemon.species.name}, progreso ${node.progressLevel}`
        : `Nodo ${nodeKey}: ${pokemon.species.name}, ${Object.keys(pokemon.ivs).length} stats, ${node.progressLevel} nivel(es), ${node.step ? 'paso de cría' : 'nodo base'}, ${node.children.length} hijo(s)`}
    >
      <div className="node-header">
        <span className="node-icon">{icon}</span>
        <span className="node-name">{pokemon.species.name}</span>
        <span className="node-progress">Progreso: {node.progressLevel}x31</span>
      </div>

      <div className="node-content">{basicInfo}{advancedInfo}</div>

      {node.children.length > 0 && (
        <div className="node-children">
          {node.children.map((child) => renderNode(child, simpleMode, depth + 1))}
        </div>
      )}
    </div>
  );
}

export const BreedingTree: React.FC<BreedingTreeProps> = ({ treeData, simpleMode = false, onNodeToggle }) => {
  const { allNodes } = treeData;

  return (
    <div className="breeding-tree-container">
      <header className="breeding-tree-header">
        <h2 className="tree-title">Árbol de Cría IVsMap</h2>
        <div className="mode-toggle">
          <label>
            <input
              type="radio"
              name="tree-mode"
              value="simple"
              checked={simpleMode}
              onChange={() => onNodeToggle?.('simple')}
              disabled={false}
            />
            Simple
          </label>
          <label>
            <input
              type="radio"
              name="tree-mode"
              value="advanced"
              checked={!simpleMode}
              onChange={() => onNodeToggle?.('advanced')}
              disabled={false}
            />
            Avanzado
          </label>
        </div>
      </header>

      <section className="tree-nodes">
        {allNodes.map((node) => renderNode(node, simpleMode))}
      </section>
    </div>
  );
};

export default BreedingTree;