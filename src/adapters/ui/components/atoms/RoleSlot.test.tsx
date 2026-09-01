/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { RoleSlot } from './RoleSlot';
import { render, screen } from '@testing-library/react';

describe('RoleSlot', () => {
  it('should render with male gender and be read-only', () => {
    const pokemon = {
      species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      gender: 'male' as const,
      ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      heldItem: null,
    };

    render(<RoleSlot pokemon={pokemon} />);

    // Para género fijo, el slot tiene un div con class "role-slot" y data attributes
    // y muestra badge "Male" en lugar de toggle
    const roleSlot = screen.getByText(/Male/)!.parentElement as HTMLElement;

    expect(roleSlot).toHaveAttribute('data-gender', 'male');
    expect(roleSlot).toHaveAttribute('data-readonly', 'true');
    // No debería haber toggle "Ser Padre/Ser Madre" para género fijo
    const padreLabel = screen.queryByLabelText('Ser Padre');
    const madreLabel = screen.queryByLabelText('Ser Madre');
    expect(padreLabel).not.toBeInTheDocument();
    expect(madreLabel).not.toBeInTheDocument();
  });

  it('should render with female gender and be read-only', () => {
    const pokemon = {
      species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      gender: 'female' as const,
      ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      heldItem: null,
    };

    render(<RoleSlot pokemon={pokemon} />);

    const roleSlot = screen.getByText(/Female/)!.parentElement as HTMLElement;

    expect(roleSlot).toHaveAttribute('data-gender', 'female');
    expect(roleSlot).toHaveAttribute('data-readonly', 'true');
    const padreLabel = screen.queryByLabelText('Ser Padre');
    const madreLabel = screen.queryByLabelText('Ser Madre');
    expect(padreLabel).not.toBeInTheDocument();
    expect(madreLabel).not.toBeInTheDocument();
  });

  it('should render genderless with toggle for parent/mother', () => {
    const pokemon = {
      species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      gender: 'genderless' as const,
      ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      heldItem: null,
    };

    render(<RoleSlot pokemon={pokemon} />);

    // Para genderless, navegar desde el label "Ser Padre" al div padre
    // Estructura: label → div.gender-toggle → div.role-slot
    const padreLabel = screen.getByLabelText('Ser Padre');
    const roleSlot = padreLabel.parentElement!.parentElement!.parentElement as HTMLElement;

    expect(roleSlot).toHaveAttribute('data-gender', 'genderless');
    expect(roleSlot).toHaveAttribute('data-readonly', 'false');
  });

  it('should display result badge with mother species', () => {
    const pokemon = {
      species: { id: 1, name: 'Testmon', genderRatio: 0.5, eggGroups: [{ name: 'Field' }], gen: 1, baseStats: { hp: 45, attack: 60, defense: 40, spatk: 70, spdef: 50, speed: 45 }, captureRate: 45 },
      gender: 'genderless' as const,
      ivs: { hp: 31, attack: 31, defense: 31, spatk: 31, spdef: 31, speed: 31 },
      heldItem: null,
    };

    render(<RoleSlot pokemon={pokemon} />);
    const badge = screen.getByText(/Resultado: Testmon/);

    expect(badge).toBeInTheDocument();
  });
});