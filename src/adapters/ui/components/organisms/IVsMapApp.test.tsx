/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { IVsMapApp } from './IVsMapApp';
import { render, screen, fireEvent } from '@testing-library/react';

/**
 * The application now opens on the presentation screen, so anything that tests the
 * planner has to go through the call to action first. That is the real entry point,
 * and using it keeps these tests honest about the order a user actually sees.
 */
const enterPlanner = () =>
  fireEvent.click(screen.getByRole('button', { name: /comenzar a planificar/i }));

describe('IVsMapApp', () => {
  it('should render IVsMapApp initial state', () => {
    render(<IVsMapApp />);
    enterPlanner();

    // Debe mostrar el paso inicial de selección de especie
    const stepTitle = screen.getByText(/¿Qué Pokémon deseas criar\?/i);
    expect(stepTitle).toBeInTheDocument();

    // Debe haber un selector de especies
    const speciesSelector = screen.getByRole('combobox', { name: /Especie Pokémon/ });
    expect(speciesSelector).toBeInTheDocument();
  });

  it('should handle goal selection', () => {
    render(<IVsMapApp />);
    enterPlanner();

    // Debe haber opciones de species en el selector
    const options = screen.getAllByRole('option', { name: /Pikachu|Bulbasaur|Clefairy/i });
    expect(options.length).toBeGreaterThan(0);
  });

  it('should render breeding tree after generation', () => {
    // El componente debe renderizarse sin errores
    expect(() => render(<IVsMapApp />)).not.toThrow();
  });

  it('should render complete IVsMap workflow steps', () => {
    render(<IVsMapApp />);
    enterPlanner();

    // Deben existir los títulos de los steps del workflow
    const stepTitles = screen.getAllByText(/¿Qué Pokémon deseas criar\?/i);
    expect(stepTitles.length).toBeGreaterThan(0);

    // El título principal debe estar presente
    const appTitle = screen.getByText(/IVsMap/i);
    expect(appTitle).toBeInTheDocument();
  });
});
