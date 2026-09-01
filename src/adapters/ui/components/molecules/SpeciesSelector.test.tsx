/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { SpeciesSelector } from './SpeciesSelector';
import { render, screen } from '@testing-library/react';

describe('SpeciesSelector', () => {
  it('should render dropdown with all species by default', () => {
    const speciesList = [
      { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      { id: 2, name: 'Caterpie', genderRatio: 0.5, eggGroups: [{ name: 'Bug' }], gen: 1, baseStats: { hp: 45, attack: 30, defense: 35, spatk: 20, spdef: 20, speed: 45 }, captureRate: 255 },
      { id: 3, name: 'Pikachu', genderRatio: 0.5, eggGroups: [{ name: 'Fairy' }, { name: 'Dragon' }], gen: 1, baseStats: { hp: 35, attack: 55, defense: 40, spatk: 50, spdef: 50, speed: 90 }, captureRate: 190 },
    ];

    render(<SpeciesSelector speciesList={speciesList} />);

    const selectElement = screen.getByRole('combobox');

    expect(selectElement).toBeInTheDocument();
    // Opciones por defecto (todas las especies + option vacío/placeholder)
    const options = selectElement.querySelectorAll('option');
    expect(options).toHaveLength(speciesList.length + 1); // +1 por el option vacío/placeholder
    // Option vacío/placeholder
    expect(options[0]).toHaveAttribute('value', '');
    expect(options[0]).toHaveAttribute('disabled', '');
    // Opciones de species
    expect(options[1]).toHaveAttribute('value', '1');
    expect(options[1].textContent).toBe('Testmon');
    expect(options[2]).toHaveAttribute('value', '2');
    expect(options[2].textContent).toBe('Caterpie');
    expect(options[3]).toHaveAttribute('value', '3');
    expect(options[3].textContent).toBe('Pikachu');
  });

  it('should render dropdown filtered by eggGroup', () => {
    const speciesList = [
      { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      { id: 2, name: 'Caterpie', genderRatio: 0.5, eggGroups: [{ name: 'Bug' }], gen: 1, baseStats: { hp: 45, attack: 30, defense: 35, spatk: 20, spdef: 20, speed: 45 }, captureRate: 255 },
      { id: 3, name: 'Pikachu', genderRatio: 0.5, eggGroups: [{ name: 'Fairy' }, { name: 'Dragon' }], gen: 1, baseStats: { hp: 35, attack: 55, defense: 40, spatk: 50, spdef: 50, speed: 90 }, captureRate: 190 },
    ];

    render(<SpeciesSelector speciesList={speciesList} eggGroupFilter="Bug" />);

    const selectElement = screen.getByRole('combobox');

    expect(selectElement).toBeInTheDocument();
    // Solo debería tener species con grupo huevo "Bug" + option vacío
    // Caterpie tiene grupo Bug, Testmon y Pikachu no
    const options = selectElement.querySelectorAll('option');
    expect(options.length).toBe(2); // +1 vacío + Caterpie
    expect(options[0]).toHaveAttribute('value', '');
    expect(options[0]).toHaveAttribute('disabled', '');
    expect(options[1]).toHaveAttribute('value', '2');
    expect(options[1].textContent).toBe('Caterpie');
  });

  it('should display species name as option label', () => {
    const speciesList = [
      { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
    ];

    render(<SpeciesSelector speciesList={speciesList} />);

    const selectElement = screen.getByRole('combobox');
    const options = selectElement.querySelectorAll('option');

    // Debería haber 2 options: el vacío + Testmon
    expect(options).toHaveLength(2);
    // Option vacío
    expect(options[0]).toHaveAttribute('value', '');
    expect(options[0]).toHaveAttribute('disabled', '');
    // Option Testmon
    expect(options[1]).toHaveAttribute('value', '1');
    expect(options[1].textContent).toBe('Testmon');
  });
});