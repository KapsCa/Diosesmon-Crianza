import React from 'react';

/**
 * EstimationPanel - Componente organismo que muestra el tiempo, items y desglose de IVs.
 *
 * Features:
 * - Muestra el tiempo estimado de la ruta de cría
 * - Muestra el número total de steps
 * - Muestra el costo total en pokedollars
 * - Desglose de items por tipo y cantidad
 * - Desglose de IVs: perfectos y faltantes para completar el objetivo
 */
interface EstimationPanelProps {
  /** Tiempo estimado formateado (ej: "2 horas 30 minutos") */
  totalTime: string;
  /** Número total de steps de cría */
  totalSteps: number;
  /** Costo total en pokedollars */
  totalCost: number;
  /** Desglose de items equipados */
  itemBreakdown: { type: string; count: number; cost: number }[];
  /** Desglose de IVs */
  ivBreakdown: { perfect: number; missing: number };
}

/**
 * EstimationPanel - Componente organismo de估 estimation panel.
 */
export const EstimationPanel: React.FC<EstimationPanelProps> = ({
  totalTime,
  totalSteps,
  totalCost,
  itemBreakdown,
  ivBreakdown,
}) => {
  return (
    <div className="estimation-panel">
      <header className="estimation-panel-header">
        <h3 className="panel-title">Resumen de Ruta</h3>
      </header>

      <section className="estimation-panel-content">
        {/* Tiempo y steps */}
        <div className="estimation-time">
          <span className="time-label">Tiempo estimado:</span>
          <span className="time-value">{totalTime}</span>
        </div>

        <div className="estimation-steps">
          <span className="steps-label">Steps:</span>
          <span className="steps-value">{totalSteps}</span>
        </div>

        {/* Costo total */}
        <div className="estimation-cost">
          <span className="cost-label">Costo total:</span>
          <span className="cost-value">{totalCost} $</span>
        </div>
      </section>

      {/* Desglose de items */}
      <section className="item-breakdown">
        <h4 className="breakdown-title">Desglose de Items</h4>
        <ul className="item-list">
          {itemBreakdown.map((item, index) => (
            <li key={index} className="item-row">
              <span className="item-type">{item.type}</span>
              <span className="item-count">{item.count}x</span>
              <span className="item-cost">{item.cost} $</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Desglose de IVs */}
      <section className="iv-breakdown">
        <h4 className="breakdown-title">Desglose de IVs</h4>
        <div className="iv-stats">
          <span className="iv-perfect">
            <strong>Perfectos:</strong> {ivBreakdown.perfect}
          </span>
          <span className="iv-missing">
            <strong>Faltantes:</strong> {ivBreakdown.missing}
          </span>
        </div>
      </section>
    </div>
  );
};

export default EstimationPanel;