import React, { useState, useEffect } from 'react';
import { findCompatibleParents } from '../../../../domain/services/breedingFinder';
import { generateBreedingTree } from '../../../../domain/services/breedingTreeGenerator';
import { getBiomeCaptures } from '../../../../domain/services/biomeService';
import { estimateRoute } from '../../../../domain/services/routeEstimator';
import { SpeciesSelector } from '../molecules/SpeciesSelector';
import { RoleSlot } from '../atoms/RoleSlot';
import { BiomeCaptureList } from '../molecules/BiomeCaptureList';
import { BreedingTree } from '../organisms/BreedingTree';
import { EstimationPanel } from '../organisms/EstimationPanel';
import { ALL_STATS } from '../../../../domain/types/stat';
import { Gender } from '../../../../domain/types/pokemon';

/**
 * IVsMapApp - Componente organismo orchestrador principal para el IVsMap.
 *
 * Flujo completo de crianza:
 * 1. Seleccionar especie objetivo
 * 2. Elegir padres (RoleSlot - Role slot con toggle padre/madre para genderless)
 * 3. Validar compatibilidad de cría
 * 4. Generar árbol de cría y estimación
 * 5. Renderizar BreedingTree + BiomeCaptureList + EstimationPanel
 *
 * Estado del componente:
 * - goalSpecies: especie objetivo seleccionada
 * - parents: padres compatibles encontrados
 * - tree: árbol de cría generado
 * - biomeCaptures: captura bioma de las especies
 * - estimate: estimación de tiempo y costo
 * - showTree: si mostrar el árbol de cría
 */
interface IVsMapAppState {
  goalSpecies: { id: number; name: string } | null;
  parents: {
    compatible: boolean;
    father: any;
    mother: any;
    reason?: string;
  } | null;
  tree: {
    root: any;
    allNodes: any[];
    maxDepth: number;
  } | null;
  biomeCaptures: any[];
  estimate: {
    totalTime: string;
    totalSteps: number;
    totalCost: number;
    itemBreakdown: { type: string; count: number; cost: number }[];
    ivBreakdown: { perfect: number; missing: number };
  } | null;
  showTree: boolean;
  formStep: 'select-species' | 'select-parents' | 'generated' | 'review';
}

/**
 * IVsMapApp - Componente orchestrador principal
 */
export const IVsMapApp: React.FC = () => {
  // Estado inicial
  const [state, setState] = useState<IVsMapAppState>({
    goalSpecies: null,
    parents: null,
    tree: null,
    biomeCaptures: [],
    estimate: null,
    showTree: false,
    formStep: 'select-species',
  });

  // Efecto al cambiar la especie objetivo
  useEffect(() => {
    if (state.formStep === 'select-species' && state.goalSpecies) {
      // Buscar padres compatibles
      const targetSpecies = findSpeciesById(state.goalSpecies!.id);
      if (targetSpecies) {
        const result = findCompatibleParents(
          targetSpecies
        );

        setState({
          ...state,
          parents: {
            compatible: result.compatible,
            father: result.parents[0],
            mother: result.parents[1],
            reason: result.reason,
          },
          formStep: 'select-parents',
        });
      }
    }
  }, [state.goalSpecies]);

  // Efecto al generar el árbol
  useEffect(() => {
    if (state.formStep === 'select-parents' && state.parents?.compatible) {
      const targetSpecies = findSpeciesById(state.goalSpecies!.id);
      if (targetSpecies) {
        const config = {
          targetSpecies,
          targetIVs: ALL_STATS.map((s) => s),
          chooseGender: false,
          nurseryConfig: undefined,
        };

        const result = generateBreedingTree(config);

        // Obtener capturas biome de las especies del árbol
        const speciesList = [result.tree.root.pokemon.species];
        const biomeCaptures = getBiomeCaptures(speciesList);

        // Estimar ruta
        const routeEstimate = estimateRoute(result.tree);

        // Transformar RouteEstimate al formato esperado por el estado
        const estimate = {
          totalTime: routeEstimate.estimatedTime.formattedTime,
          totalSteps: routeEstimate.estimatedTime.totalSteps,
          totalCost: routeEstimate.totalCost,
          itemBreakdown: [], // Simplificado - no hay desglose detallado en RouteEstimate
          ivBreakdown: { perfect: 6, missing: 0 }, // Placeholder
        };

        setState({
          ...state,
          tree: {
            root: result.tree.root,
            allNodes: result.tree.allNodes,
            maxDepth: result.tree.maxDepth,
          },
          biomeCaptures,
          estimate,
          showTree: true,
          formStep: 'generated',
        });
      }
    }
  }, [state.parents, state.goalSpecies]);

  // Helper para encontrar species por ID (usando datos placeholder)
  const findSpeciesById = (id: number) => {
    // En un proyecto real, esto cargaría desde la base de datos/CRUD
    // Por ahora retornamos un especie genérica con el ID
    return {
      id: id,
      name: `Pokémon ${id}`,
      genderRatio: 0.5,
      eggGroups: [{ name: 'Field' }],
      gen: 1,
      baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 },
      captureRate: 45,
    } as any;
  };

  // Manejadores de paso
  const handleGoalChange = (species: { id: number; name: string }) => {
    setState({
      ...state,
      goalSpecies: species,
      parents: null,
      tree: null,
      biomeCaptures: [],
      estimate: null,
      showTree: false,
      formStep: 'select-species',
    });
  };

  // Renderizar el selector de especie
  const renderSpeciesSelector = () => {
    // Species placeholder - en un proyecto real vendría de una API
    const speciesList = [
      { id: 1, name: 'Pikachu', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 35, attack: 55, defense: 40, spatk: 50, spdef: 50, speed: 90 }, captureRate: 190 },
      { id: 4, name: 'Bulbasaur', genderRatio: 0.5, eggGroups: [{ name: 'Monster' }, { name: 'Grass' }], gen: 1, baseStats: { hp: 45, attack: 49, defense: 49, spatk: 65, spdef: 65, speed: 45 }, captureRate: 45 },
      { id: 25, name: 'Clefairy', genderRatio: 0.5, eggGroups: [{ name: 'Fairy' }], gen: 1, baseStats: { hp: 40, attack: 48, defense: 65, spatk: 60, spdef: 105, speed: 60 }, captureRate: 255 },
    ].map((s) => ({
      ...s,
      genderRatio: s.genderRatio || 0.5,
    }));

    return (
      <div className="ivsmap-step">
        <h4 className="step-title">1. Seleccionar especie objetivo</h4>
        <SpeciesSelector
          speciesList={speciesList}
          onSelect={handleGoalChange}
          disabled={state.formStep !== 'select-species'}
        />
      </div>
    );
  };

  // Renderizar selector de padres
  const renderParentSelector = () => {
    if (!state.parents) {
      return null;
    }

    return (
      <div className="ivsmap-step">
        <h4 className="step-title">2. Elegir padres</h4>
        <p className="compatibility-status">
          {state.parents.compatible
            ? 'Esta pareja es compatible para cría'
            : 'Esta pareja no es compatible: ' + (state.parents.reason || 'Verificar')}
        </p>

        <div className="parents-display">
          <RoleSlot
          pokemon={{
            species: state.parents.father.species,
            gender: 'male' as Gender,
            ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
            heldItem: null,
          }}
          onGenderChange={() => {}}
          />
          <RoleSlot
          pokemon={{
            species: state.parents.mother.species,
            gender: 'female' as Gender,
            ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
            heldItem: null,
          }}
          onGenderChange={() => {}}
          />
        </div>

        <button
          className="btn-generate"
          onClick={() => setState({ ...state, formStep: 'generated' })}
          disabled={!state.parents.compatible}
        >
          Generar ruta de cría
        </button>
      </div>
    );
  };

  // Renderizar árbol y paneles
  const renderGeneratedContent = () => {
    if (!state.tree || !state.estimate || state.biomeCaptures.length === 0) {
      return null;
    }

    return (
      <div className="ivsmap-results">
        <h3 className="results-title">Resultado de la Cría</h3>

        {/* Mostrar resultado en tiempo real */}
        <div className="real-time-result">
          <p>
            <strong>Resultado:</strong> {state.parents?.mother.species?.name || 'Por definir'}
          </p>
          <p>
            <strong>Slot Madre:</strong> {state.parents?.mother.species?.name || 'Esperando...'}
          </p>
        </div>

        <BreedingTree
          treeData={state.tree}
          simpleMode={true}
          onNodeToggle={() => {}}
        />

        <BiomeCaptureList biomeCaptures={state.biomeCaptures} />

        <EstimationPanel
          totalTime={state.estimate.totalTime}
          totalSteps={state.estimate.totalSteps}
          totalCost={state.estimate.totalCost}
          itemBreakdown={state.estimate.itemBreakdown}
          ivBreakdown={state.estimate.ivBreakdown}
        />
      </div>
    );
  };

  return (
    <div className="ivsmap-app">
      <header className="ivsmap-header">
        <h2 className="app-title">IVsMap - Mapas de Cría IVs</h2>
        <p className="app-description">
          Herramienta guiada para planear cría de Pokémon con IVs objetivo
        </p>
      </header>

      <main className="ivsmap-main">
        {state.formStep === 'select-species' && renderSpeciesSelector()}

        {state.formStep === 'select-parents' && renderParentSelector()}

        {state.formStep === 'generated' && renderGeneratedContent()}

        {state.formStep === 'review' && (
          <p>Modo revisión</p>
        )}
      </main>
    </div>
  );
};

export default IVsMapApp;