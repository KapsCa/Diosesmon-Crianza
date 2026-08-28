# Diosesmon Crianza — Plan de Desarrollo

## Resumen Ejecutivo

Herramienta web SPA para calcular rutas de crianza Pokémon **óptimas** (más baratas) para el servidor Diosesmon (Cobblemon mod). El usuario ingresa su inventario y objetivo, la app genera el árbol genealógico visual con la ruta más económica.

**Stack:** React + Vite + TypeScript + Vitest
**Arquitectura:** Screaming Architecture / Hexagonal
**Solver:** A* + Branch & Bound (garantiza ruta óptima)
**MVP:** Algoritmo core + árbol visual interactivo

---

## Reglas de Negocio

| Regla | Detalle |
|-------|---------|
| Herencia de especie | Siempre la madre |
| Genderless | Ditto, Porygon, Beldum, Starmie, etc. Solo crían con Ditto |
| Ditto | Genderless, puede ambos sexos para breeding |
| Selección de sexo | 500$ antes de ingresar a guardería |
| Guardería | 2 gratis + 1 por 10k$ + 2 maestro + 2 Diosescoin = **7 máximo** |
| Items | Power items / Everstone = 500$ c/u |
| Lazo Destino | **PROHIBIDO** en rutas (introduce RNG) |
| Pokeball | 200$ (costo de captura NO incluido en ruta) |
| Tiempo | 25 min/paso (usuario) / 10 min/paso (maestro) |
| Grupos huevo | Mismos que juegos base |
| Determinismo | 100% sin RNG — solo Power Items + Overlap |
| Máximo items | 2 por cruce (1 por padre) |
| Overlap | Ambos padres 31 en mismo stat = herencia gratis |

---

## Algoritmo Core

### Modelo de Estado

```typescript
interface SearchState {
  inventory: Pokemon[];      // Pokémon disponibles
  cost: number;              // Costo acumulado (items + género)
  steps: BreedingStep[];     // Historial de operaciones
}
```

### Acciones

1. **Breed:** Dos padres compatibles → 1 cría (consumo padres, costo items + género)
2. **Capture:** Agregar Pokémon nuevo (costo NO incluido en ruta, solo sugerencia)

### Solver: A* + Branch & Bound

```
PriorityQueue ordenada por (costo_acumulado + heurística)
visited = Map<serialización_estado, mejor_costo>

1. Estado inicial = inventario del usuario
2. Mientras haya estados por explorar:
   a. Sacar estado con menor f(n) = g(n) + h(n)
   b. Si algún Pokémon tiene los IVs objetivo → ¡ENCONTRADO!
   c. Generar todos los cruces posibles (compatibilidad + items)
   d. Generar capturas sugeridas (si faltan especies)
   e. Para cada hijo, si mejora un estado conocido → agregar a la cola
3. Heurística h(n) = costo_mínimo_estimado_para_completar
```

### Heurística (Admissible)

```
h(n) = IVs_faltantes * 500 (Power items) + gender_selections * 500
```

### Podas

- Si `costo_actual > mejor_solución_encontrada` → podar
- Si `estado_ya_visitado_con_menor_costo` → podar
- Si `inventario_vacío` y no se puede capturar → podar

---

## Estructura de Carpetas

```
diosesmon-crianza/
├── src/
│   ├── domain/                    # CERO imports de UI
│   │   ├── types/
│   │   │   ├── stat.ts            # Stat enum, IVSpread
│   │   │   ├── pokemon.ts         # Pokemon, Gender, Species
│   │   │   ├── items.ts           # HeldItem, ItemType
│   │   │   ├── breeding.ts        # BreedingPair, OverlapResult
│   │   │   ├── route.ts           # BreedingRoute, BreedingStep
│   │   │   ├── costs.ts           # CostModel
│   │   │   └── search.ts          # SearchState, SearchAction
│   │   ├── services/
│   │   │   ├── overlap.ts         # Detección de solapamiento
│   │   │   ├── validation.ts      # Compatibilidad de cruces
│   │   │   ├── route-optimizer.ts # A* + Branch & Bound
│   │   │   ├── cost-calculator.ts # Presupuesto
│   │   │   └── time-estimator.ts  # Tiempo con slots paralelos
│   │   ├── rules/
│   │   │   ├── egg-groups.ts      # Tabla grupos huevo
│   │   │   └── gender.ts          # Compatibilidad género
│   │   └── data/
│   │       ├── species.ts         # Interface SpeciesData
│   │       ├── gen1.ts            # Kanto (151)
│   │       ├── gen2.ts            # Johto (100)
│   │       ├── gen3.ts            # Hoenn (135)
│   │       └── capture-suggestions.ts  # Especies fáciles por grupo huevo
│   ├── adapters/
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── atoms/         # IVBadge, GenderIcon, StatBar
│   │   │   │   ├── molecules/     # PokemonCard, CostSummary
│   │   │   │   └── organisms/     # BreedingTree, InventoryForm
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx       # Selección de Pokémon objetivo
│   │   │   │   ├── Inventory.tsx  # Registro de inventario
│   │   │   │   └── Result.tsx     # Árbol visual
│   │   │   ├── hooks/
│   │   │   │   └── useBreedingCalculator.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── persistence/
│   │       └── sessionStorage.ts  # MVP: sesión actual
│   └── ports/
│       └── index.ts
├── tests/
│   ├── domain/
│   │   ├── services/
│   │   │   ├── overlap.test.ts
│   │   │   ├── validation.test.ts
│   │   │   ├── route-optimizer.test.ts
│   │   │   └── cost-calculator.test.ts
│   │   └── helpers.ts
│   └── integration/
│       └── full-route.test.ts
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Plan de Implementación (TDD)

### Fase 1: Foundation (Días 1-2)

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 1.1 | Tipos del dominio | `types/*.ts` | — |
| 1.2 | Servicio overlap | `services/overlap.ts` | `overlap.test.ts` |
| 1.3 | Validación de cruces | `services/validation.ts` | `validation.test.ts` |
| 1.4 | Reglas grupo huevo | `rules/egg-groups.ts` | `validation.test.ts` |
| 1.5 | Reglas género | `rules/gender.ts` | `validation.test.ts` |

### Fase 2: Data Layer (Días 3-4)

| # | Tarea | Archivo |
|---|-------|---------|
| 2.1 | Interface SpeciesData | `data/species.ts` |
| 2.2 | Gen 1 (151 Pokémon) | `data/gen1.ts` |
| 2.3 | Gen 2 (100 Pokémon) | `data/gen2.ts` |
| 2.4 | Gen 3 (135 Pokémon) | `data/gen3.ts` |
| 2.5 | Sugerencia de especies fáciles | `data/capture-suggestions.ts` |

### Fase 3: Solver Óptimo (Días 5-8)

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 3.1 | Modelo de estado | `types/search.ts` | — |
| 3.2 | A* + Branch & Bound | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.3 | Heurística admissible | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.4 | Memoización | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.5 | Cost calculator | `services/cost-calculator.ts` | `cost-calculator.test.ts` |
| 3.6 | Time estimator | `services/time-estimator.ts` | `time-estimator.test.ts` |
| 3.7 | Test end-to-end | — | `full-route.test.ts` |

### Fase 4: UI Shell (Días 9-12)

| # | Tarea | Componente |
|---|-------|-----------|
| 4.1 | Átomos | `IVBadge`, `GenderIcon`, `StatBar` |
| 4.2 | Moléculas | `PokemonCard`, `CostSummary` |
| 4.3 | Formulario objetivo | `pages/Home.tsx` |
| 4.4 | Formulario inventario | `pages/Inventory.tsx` |
| 4.5 | Árbol visual (zoom) | `organisms/BreedingTree.tsx` |
| 4.6 | Página resultado | `pages/Result.tsx` |

### Fase 5: Integración (Días 13-14)

| # | Tarea |
|---|-------|
| 5.1 | Hook `useBreedingCalculator` |
| 5.2 | Pipeline: Input → Solver → Árbol |
| 5.3 | Responsive design |
| 5.4 | Loading/empty/error states |
| 5.5 | sessionStorage persistence |

---

## Stack Tecnológico

- **Framework:** React 18+ con Vite
- **Lenguaje:** TypeScript estricto
- **Tests:** Vitest + @testing-library/react
- **Estilos:** Por definir (CSS Modules o Tailwind)
- **Persistencia:** sessionStorage (MVP)
- **Deploy:** GitHub Pages vía GitHub Actions (futuro)

---

## Output Esperado

### Árbol Visual (Bottom → Up)

```
Nivel 0 (base):     Pokémon capturados con IVs1x31
Nivel 1:            Primeras crías 2x31
Nivel 2:            Crías 3x31
...
Nivel N (raíz):     Pokémon objetivo (6x31 o 5x31)
```

### Cada Nodo Contiene

- Nombre de especie
- Símbolo de género (♂/♀)
- Badges de color por IV heredado
- Sección "Equipar:" con items de cada padre
- Líneas de conexión padres → cría

### Colores de IVs

- HP = Verde
- Attack = Rojo
- Defense = Naranja
- SpAtk = Morado
- SpDef = Azul
- Speed = Cyan

---

## Decisiones Pendientes

| # | Pregunta | Estado |
|---|----------|--------|
| 1 | ¿Ditto tiene género en Cobblemon? | Resuelto: Genderless |
| 2 | ¿Qué otros Pokémon son genderless? | Resuelto: Porygon, Beldum, Starmie |
| 3 | ¿Árbol interactivo? | Resuelto: Sí, con zoom |
| 4 | ¿sessionStorage? | Resuelto: Sí, para continuar |
| 5 | ¿Framework UI? | Resuelto: React |
| 6 | ¿Runner de tests? | Resuelto: Vitest |
| 7 | ¿Solver óptimo o greedy? | Resuelto: Óptimo (A*) |

---

## Repositorio

- **SSH:** git@github.com:KapsCa/Diosesmon-Crianza.git
- **Branch principal:** main
- **Local:** /home/kkaps/dev/diosesmon-crianza
