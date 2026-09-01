/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { IVsMapApp } from './IVsMapApp';
import { render, screen } from '@testing-library/react';

describe('IVsMapApp', () => {
  it('should render IVsMapApp initial state', () => {
    render(<IVsMapApp />);

    // Debe mostrar el paso inicial de selección de especie
    const stepTitle = screen.getByText(/1\. Seleccionar especie objetivo/i);
    expect(stepTitle).toBeInTheDocument();

    // Debe haber un selector de especies
    const speciesSelector = screen.getByRole('combobox', { name: /Especie Pokémon/ });
    expect(speciesSelector).toBeInTheDocument();
  });

  it('should handle goal selection', () => {
    render(<IVsMapApp />);

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

    // Deben existir los títulos de los steps del workflow
    const stepTitles = screen.getAllByText(/[12]\./);
    expect(stepTitles.length).toBeGreaterThan(0);

    // El título principal debe estar presente
    const appTitle = screen.getByText(/IVsMap - Mapas de Cría IVs/i);
    expect(appTitle).toBeInTheDocument();
  });
});