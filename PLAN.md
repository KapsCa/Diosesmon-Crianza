# Diosesmon Crianza — Plan de Desarrollo v2

## Resumen Ejecutivo

Herramienta web SPA para calcular rutas de crianza Pokémon **óptimas** (más baratas) para el servidor Diosesmon (Cobblemon mod). El usuario ingresa su inventario y objetivo, la app genera el árbol genealógico visual con la ruta más económica.

**Stack:** React + Vite + TypeScript + Vitest + React Flow + Web Workers
**Arquitectura:** Screaming Architecture / Hexagonal
**Solver:** A* + Branch & Bound (garantiza ruta óptima)
**MVP:** Algoritmo core + árbol visual interactivo

---

## Directrices del Agente

- **NO ATACAR EL CÓDIGO SIN ENTENDER EL DOMINIO.**
- Usar estricto tipado (TypeScript).
- Aplicar TDD en la capa de dominio (Vitest).
- **USAR CONVENTIONAL COMMITS estrictamente.** No generar código sin el commit asociado.
- Si falta contexto técnico, **DETENERSE Y PREGUNTAR.**

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

## Restricciones de Arquitectura (CRÍTICO)

El input base del inventario puede llegar a **64 Pokémon**. Para evitar que el Main Thread colapse por la explosión combinatoria:

### 1. Optimización de Memoria (Bitmasks)

El estado de los IVs en el DOMINIO se representa como **Bitmasks** (Entero de 8 bits):
- `00111111` = 6x31 IVs
- `00000001` = Solo HP en 31
- Operaciones rápidas a nivel de bits (`&`, `|`) para herencia y solapamiento
- **PROHIBIDO** usar arrays de booleanos o `Record<Stat, number>`

```typescript
// IVs como bitmask (entero de 8 bits)
type IVBitmask = number; // 0-63

// Bits: Speed(5) SpDef(4) SpAtk(3) Defense(2) Attack(1) HP(0)
const HP_BIT     = 1;      // 0b000001
const ATTACK_BIT = 1 << 1; // 0b000010
const DEFENSE_BIT= 1 << 2; // 0b000100
const SPATK_BIT  = 1 << 3; // 0b001000
const SPDEF_BIT  = 1 << 4; // 0b010000
const SPEED_BIT  = 1 << 5; // 0b100000

// Operaciones
const hasHP = (ivs & HP_BIT) !== 0;
const addHP = ivs | HP_BIT;
const overlap = fatherIVs & motherIVs; // Stats donde ambos tienen 31
```

### 2. Threading (Web Worker)

El algoritmo `route-optimizer` (A* + Branch & Bound) corre **EXCLUSIVAMENTE** en un Web Worker:
- Main Thread delega el estado inicial
- Worker computa y devuelve el DAG resuelto
- UI nunca se bloquea

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
│   │   │   ├── stat.ts            # Stat enum, IVBitmask, operaciones bits
│   │   │   ├── pokemon.ts         # Pokemon, Gender, Species
│   │   │   ├── items.ts           # HeldItem, ItemType
│   │   │   ├── breeding.ts        # BreedingPair, OverlapResult
│   │   │   ├── route.ts           # BreedingRoute, BreedingStep, TreeNode
│   │   │   ├── costs.ts           # CostModel, NurseryConfig
│   │   │   └── search.ts          # SearchState, SearchAction, SolverConfig
│   │   ├── services/
│   │   │   ├── overlap.ts         # Detección de solapamiento (bitmask ops)
│   │   │   ├── validation.ts      # Compatibilidad de cruces
│   │   │   ├── route-optimizer.ts # A* + Branch & Bound
│   │   │   ├── cost-calculator.ts # Presupuesto
│   │   │   └── time-estimator.ts  # Tiempo con slots paralelos
│   │   ├── rules/
│   │   │   ├── egg-groups.ts      # Tabla grupos huevo (bitmask)
│   │   │   └── gender.ts          # Compatibilidad género
│   │   └── data/
│   │       ├── species.ts         # Interface SpeciesData
│   │       └── species.json       # Gen 1-3 estático (generado por script)
│   ├── workers/
│   │   └── solver.worker.ts       # Web Worker para A*
│   ├── adapters/
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── atoms/         # IVBadge, GenderIcon, StatBar
│   │   │   │   ├── molecules/     # PokemonCard, CostSummary
│   │   │   │   └── organisms/     # BreedingTree (React Flow)
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
├── scripts/
│   └── fetch-species.ts           # Ingesta de datos desde PokeAPI
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

### Skill / Tarea 1: Domain & Data Modeling (Foundation)
**Objetivo:** Estructuras puras inmutables con Bitmasks.
**Output:** Pruebas unitarias pasando al 100%.

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 1.1 | Tipos del dominio con Bitmasks | `types/*.ts` | — |
| 1.2 | Servicio overlap (bitmask ops) | `services/overlap.ts` | `overlap.test.ts` |
| 1.3 | Validación de cruces | `services/validation.ts` | `validation.test.ts` |
| 1.4 | Reglas grupo huevo | `rules/egg-groups.ts` | `validation.test.ts` |
| 1.5 | Reglas género | `rules/gender.ts` | `validation.test.ts` |

### Skill / Tarea 2: Automated Data Ingestion (REST API)
**Objetivo:** Generar diccionario estático de especies Gen 1-3.
**Output:** Archivo estático `src/domain/data/species.json`. NINGUNA llamada a API en runtime.

| # | Tarea | Archivo |
|---|-------|---------|
| 2.1 | Script de ingesta PokeAPI | `scripts/fetch-species.ts` |
| 2.2 | Fetch ID 1-386 (Gen 1-3) | `scripts/fetch-species.ts` |
| 2.3 | Extraer: name, egg_groups, gender_rate | `scripts/fetch-species.ts` |
| 2.4 | Convertir egg_groups a Bitmasks | `scripts/fetch-species.ts` |
| 2.5 | Generar `species.json` | `data/species.json` |
| 2.6 | Sugerencia de especies fáciles | `data/capture-suggestions.ts` |

### Skill / Tarea 3: Web Worker & A* Solver
**Objetivo:** Motor de búsqueda aislado en Web Worker.
**Output:** Capacidad de resolver cruces de 64 entidades en < 5 segundos.

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 3.1 | Modelo de estado | `types/search.ts` | — |
| 3.2 | A* + Branch & Bound | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.3 | Heurística admissible | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.4 | Memoización | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.5 | Web Worker wrapper | `workers/solver.worker.ts` | — |
| 3.6 | Cost calculator | `services/cost-calculator.ts` | `cost-calculator.test.ts` |
| 3.7 | Time estimator | `services/time-estimator.ts` | `time-estimator.test.ts` |
| 3.8 | Benchmark 64 Pokémon <5s | — | `full-route.test.ts` |

### Skill / Tarea 4: UI Shell & DAG Visualization
**Objetivo:** Renderizar árbol genealógico con React Flow.
**Output:** UI interactiva sin bloquear el navegador.

| # | Tarea | Componente |
|---|-------|-----------|
| 4.1 | Átomos | `IVBadge`, `GenderIcon`, `StatBar` |
| 4.2 | Moléculas | `PokemonCard`, `CostSummary` |
| 4.3 | Formulario objetivo | `pages/Home.tsx` |
| 4.4 | Formulario inventario | `pages/Inventory.tsx` |
| 4.5 | Árbol visual (React Flow) | `organisms/BreedingTree.tsx` |
| 4.6 | Página resultado | `pages/Result.tsx` |
| 4.7 | Hook useBreedingCalculator | `hooks/useBreedingCalculator.ts` |
| 4.8 | Conectar UI ↔ Worker | `hooks/useBreedingCalculator.ts` |

### Fase 5: Integración (Días 13-14)

| # | Tarea |
|---|-------|
| 5.1 | Pipeline: Input → Worker → React Flow |
| 5.2 | Responsive design |
| 5.3 | Loading/empty/error states |
| 5.4 | sessionStorage persistence |
| 5.5 | Performance profiling |

---

## Stack Tecnológico

- **Framework:** React 18+ con Vite
- **Lenguaje:** TypeScript estricto
- **Tests:** Vitest + @testing-library/react
- **UI Tree:** React Flow
- **Threading:** Web Workers
- **Estilos:** Por definir (CSS Modules o Tailwind)
- **Persistencia:** sessionStorage (MVP)
- **Deploy:** GitHub Pages vía GitHub Actions (futuro)

---

## Output Esperado

### Árbol Visual (Bottom → Up) con React Flow

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

## Decisiones Técnicas

| # | Pregunta | Decisión |
|---|----------|----------|
| 1 | ¿Ditto tiene género en Cobblemon? | Genderless |
| 2 | ¿Qué otros Pokémon son genderless? | Porygon, Beldum, Starmie |
| 3 | ¿Árbol interactivo? | Sí, React Flow con zoom |
| 4 | ¿sessionStorage? | Sí, para continuar |
| 5 | ¿Framework UI? | React |
| 6 | ¿Runner de tests? | Vitest |
| 7 | ¿Solver óptimo o greedy? | Óptimo (A*) |
| 8 | ¿Representación de IVs? | **Bitmasks** (performance) |
| 9 | ¿Dónde corre el solver? | **Web Worker** (no bloquea UI) |
| 10 | ¿Librería de árbol? | **React Flow** |
| 11 | ¿Fuente de datos Pokémon? | **PokeAPI** → JSON estático |

---

## Repositorio

- **SSH:** git@github.com:KapsCa/Diosesmon-Crianza.git
- **Branch principal:** main
- **Local:** /home/kkaps/dev/diosesmon-crianza
