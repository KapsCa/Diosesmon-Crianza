/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { BreedingTree } from './BreedingTree';
import { render, screen } from '@testing-library/react';

describe('BreedingTree', () => {
  it('should render breeding tree container and header title', () => {
    const treeData = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male' as const,
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
        nodeId: 'root',
      },
      allNodes: [],
      maxDepth: 1,
    };

    render(<BreedingTree treeData={treeData} />);

    // El título del árbol debe ser visible
    const title = screen.getByText(/Árbol de Cría IVsMap/i);
    expect(title).toBeInTheDocument();
  });

  it('should render tree with simple mode by default', () => {
    const treeData = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male' as const,
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
        nodeId: 'root',
      },
      allNodes: [],
      maxDepth: 1,
    };

    render(<BreedingTree treeData={treeData} />);

    // Por defecto el modo simple debe estar checked
    const simpleLabel = screen.getByLabelText('Simple');
    expect(simpleLabel).toBeInTheDocument();
  });

  it('should show advanced mode when simpleMode is false', () => {
    const treeData = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male' as const,
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
        nodeId: 'root',
      },
      allNodes: [],
      maxDepth: 1,
    };

    render(<BreedingTree treeData={treeData} simpleMode={false} />);

    // Cuando simpleMode es false, el modo avanzado debe estar checked
    const advancedLabel = screen.getByLabelText('Avanzado');
    expect(advancedLabel).toBeInTheDocument();
  });

  it('component renders without throwing', () => {
    const treeData = {
      root: {
        step: null,
        pokemon: {
          species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
          gender: 'male' as const,
          ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
          heldItem: null,
          nickname: undefined,
        },
        ivsAtNode: [],
        items: { father: null, mother: null },
        children: [],
        progressLevel: 0,
        nodeId: 'root',
      },
      allNodes: [],
      maxDepth: 1,
    };

    // El componente debe renderizarse sin lanzar errores
    expect(() => {
      render(<BreedingTree treeData={treeData} />);
    }).not.toThrow();
  });
});