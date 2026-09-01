/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { EstimationPanel } from './EstimationPanel';
import { render, screen } from '@testing-library/react';

describe('EstimationPanel', () => {
  it('should render estimation panel with time and items', () => {
    render(
      <EstimationPanel
        totalTime="2 horas 30 minutos"
        totalSteps={15}
        totalCost={3500}
        itemBreakdown={[
          { type: 'Power Bracer', count: 1, cost: 500 },
          { type: 'Power Lens', count: 1, cost: 500 },
        ]}
        ivBreakdown={{ perfect: 4, missing: 2 }}
      />
    );

    // Debe mostrar el tiempo estimado
    const totalTime = screen.getByText(/2 horas 30 minutos/i);
    expect(totalTime).toBeInTheDocument();

    // Debe mostrar el número de steps (el número está en la value, no con la palabra "pasos")
    const stepsValue = screen.getByText(/15/);
    expect(stepsValue).toBeInTheDocument();

    // Debe mostrar el costo total
    const totalCost = screen.getByText(/3500/);
    expect(totalCost).toBeInTheDocument();
  });

  it('should show IV breakdown', () => {
    render(
      <EstimationPanel
        totalTime="3 horas"
        totalSteps={20}
        totalCost={5000}
        itemBreakdown={[
          { type: 'Power Anklet', count: 2, cost: 1000 },
        ]}
        ivBreakdown={{ perfect: 5, missing: 1 }}
      />
    );

    // Debe mostrar el número de steps
    const stepsValue = screen.getByText(/20/);
    expect(stepsValue).toBeInTheDocument();

    // Debe mostrar perfectos y faltantes - el número está después de "Perfectos:"
    const perfectIVs = screen.getByText(/Perfectos:/);
    expect(perfectIVs).toBeInTheDocument();

    const missingIVs = screen.getByText(/Faltantes:/);
    expect(missingIVs).toBeInTheDocument();
  });

  it('should show item breakdown', () => {
    render(
      <EstimationPanel
        totalTime="1 hora"
        totalSteps={10}
        totalCost={2000}
        itemBreakdown={[
          { type: 'Power Weight', count: 1, cost: 500 },
          { type: 'Power Bracer', count: 1, cost: 500 },
          { type: 'Power Belt', count: 1, cost: 500 },
        ]}
        ivBreakdown={{ perfect: 3, missing: 3 }}
      />
    );

    // Debe mostrar cada type de item
    const itemTypes = screen.getAllByText(/Power (Weight|Bracer|Belt)/i);
    expect(itemTypes.length).toBe(3);

    // Debe mostrar el costo total
    const itemCosts = screen.getByText(/2000/);
    expect(itemCosts).toBeInTheDocument();
  });

  it('component renders without throwing', () => {
    // El componente debe renderizarse sin lanzar errores
    expect(() => {
      render(
        <EstimationPanel
          totalTime="2 horas"
          totalSteps={12}
          totalCost={3000}
          itemBreakdown={[]}
          ivBreakdown={{ perfect: 6, missing: 0 }}
        />
      );
    }).not.toThrow();
  });
});