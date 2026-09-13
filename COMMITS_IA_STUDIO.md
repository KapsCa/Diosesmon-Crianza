# Commits y Registro de Cambios - IA Studio

## Fecha: 2026-09-02 / 2026-09-03
## Proyecto: IVsMap - Planificador y Optimizador de Crianza Pokémon

---

### Commit 1: Refactorización del Modelo de Costos Dinámico
- **Archivos modificados**: `src/domain/services/routeEstimator.ts`, `src/domain/services/routeEstimator.test.ts`
- **Descripción**:
  - Se sustituyeron las constantes numéricas cableadas (hardcoded) por las constantes del modelo oficial `DEFAULT_COST_MODEL` (`src/domain/types/costs.ts`).
  - Se utiliza `costModel.powerItemPrice` (15,000 P$) en lugar de 10,000.
  - Se utiliza `costModel.everstonePrice` (20,000 P$) en lugar de 10,000.
  - Se utiliza `costModel.baseBreedingFee` (1,000 P$) para el costo de guardería.
  - Se añadieron pruebas unitarias para verificar la actualización automática de precios ante cambios en el modelo de costos.

---

### Commit 2: Ampliación de la Base de Datos de Especies Pokémon (+120 Especies)
- **Archivos creados/modificados**: `src/domain/data/speciesData.ts`, `src/domain/services/biomeService.ts`
- **Descripción**:
  - Se creó un repositorio exhaustivo de especies Pokémon con más de 120 especies de todas las generaciones (Kanto hasta Paldea).
  - Cada especie incluye estadísticas base completas (`hp`, `attack`, `defense`, `spatk`, `spdef`, `speed`), grupos huevo (`eggGroups`), ratios de género (`genderRatio`), generación (`gen`) y tasa de captura (`captureRate`).
  - Incluye Pokémon competitivos y populares: Bulbasaur, Charmander, Squirtle, Pikachu, Gengar, Gyarados, Eevee, Dragonite, Lucario, Garchomp, Greninja, Tinkaton, Dragapult, etc.
  - Se crearon utilidades de búsqueda `findSpeciesById` y `findSpeciesByName`.
  - Se implementó un sistema de bioma inteligente con fallback por grupo huevo en `biomeService.ts`.

---

### Commit 3: Selector de Especie con Búsqueda y Escritura de Texto
- **Archivos modificados**: 
  - `src/adapters/ui/components/molecules/SpeciesSelector.tsx`
  - `src/adapters/ui/components/molecules/SpeciesSelector.test.tsx`
  - `src/adapters/ui/components/organisms/IVsMapApp.tsx`
  - `src/index.css`
- **Descripción**:
  - Se implementó un campo de entrada de texto (`<input type="text">`) que permite al usuario escribir libremente el nombre del Pokémon deseado.
  - Búsqueda y filtrado en tiempo real de especies coincidentes.
  - Chips de sugerencias interactivas para selección rápida con un clic.
  - Compatibilidad con pulsación de la tecla `Enter` para selección instantánea.
  - Sincronización bidireccional entre el campo de búsqueda de texto y el menú desplegable (`<select>`).
  - Integración completa en el flujo principal `IVsMapApp`.

---

### Commit 4: Corrección Integral de Errores y Advertencias de Consola
- **Archivos modificados**:
  - `src/adapters/ui/components/atoms/RoleSlot.tsx`
  - `src/adapters/ui/components/organisms/BreedingTree.tsx`
  - `src/adapters/ui/components/organisms/IVsMapApp.tsx`
- **Descripción**:
  - Se eliminó el conflicto de accesibilidad ARIA en `RoleSlot` (removiendo `role="radio"` redundante de un contenedor `div`).
  - Se controlaron los inputs de tipo radio para especies sin género (`genderless`) para evitar advertencias de React.
  - Se agregaron identificadores únicos a los grupos de radio para evitar colisiones de estado en el DOM.
  - Se corrigió la generación de claves en `BreedingTree` combinando prefijo, paso, especie, nivel y profundidad (`key`), eliminando la advertencia de claves duplicadas de React.
  - Se aseguró que los cálculos de ruta y renderizado de resultados muestren adecuadamente los datos en tiempo real.
