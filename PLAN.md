# Diosesmon Crianza — Plan de Desarrollo Final v4

## Contexto del Sistema y Directivas del Agente

**Objetivo:** Herramienta web SPA para calcular rutas de crianza Pokémon óptimas en el servidor Diosesmon (Cobblemon mod). El usuario ingresa su inventario y objetivo, la app genera el árbol genealógico visual con la ruta más económica.

**Stack:** React + Vite + TypeScript + Vitest + React Flow + Web Workers + Zustand
**Arquitectura:** Screaming Architecture / Hexagonal
**Solver:** A* + Branch & Bound (garantiza ruta óptima)
**MVP:** Algoritmo core + árbol visual interactivo

### Directivas Estrictas para el Agente

- **BASES SÓLIDAS:** CONCEPTOS > CÓDIGO. Prohibido codificar interfaces visuales antes de que el dominio esté cerrado con TDD (cobertura total).
- **Commits:** Usar estrictamente **Conventional Commits** en cada iteración. No generar código sin su respectivo commit.
- **Inmutabilidad:** Todo el dominio debe diseñarse sin mutar el estado original.
- **Bloqueos:** Si falta contexto técnico para implementar una función matemática o de negocio, **DETENERSE Y PREGUNTAR.** Cero alucinaciones.
- **TDD:** Escribir los casos de prueba ANTES de la lógica en cada fase del dominio.
- **NO CONFUNDIR "IMPLEMENTADO" CORRECCIÓN DEL DOMINIO > CORRECCIÓN MATEMÁTICA > PRUEBA DE OPTIMALIDAD > PERFORMANCE > UI**

---

## 1. Reglas de Negocio

| Regla | Detalle |
|-------|---------|
| Herencia de especie | Siempre la madre |
| Genderless | Derivado de `species.genderRate === -1`. No hardcodear nombres |
| Ditto | Genderless, puede ambos sexos para breeding |
| Género de cría | **Aleatorio** por defecto. **500$ para elegir** el sexo deseado |
| Guardería | 2 gratis + 1 por 10k$ + 2 maestro + 2 Diosescoin = **7 máximo** |
| Items | Power items / Everstone = 500$ c/u |
| Lazo Destino | **PROHIBIDO** en rutas (introduce RNG) |
| Pokeball | 200$ (costo de captura NO incluido en ruta) |
| Tiempo guardería | 25 min/paso (usuario) / 10 min/paso (maestro) |
| Grupos huevo | Mismos que juegos base |
| Determinismo | 100% sin RNG — solo Power Items + Overlap |
| Máximo items | 2 por cruce (1 por padre) |
| Overlap | Ambos padres 31 en mismo stat = herencia gratis |
| **Exclusión** | Regla `BreedingEligibility`: Pokémon sin egg_group válidos se descartan |

---

## 2. Modelo de Dominio Formal

### 2.1 BreedingGoal (Objetivo configurable)

```typescript
interface BreedingGoal {
  species: SpeciesId;
  requiredIVs: IVBitmask;  // Qué IVs necesita (no asumir 6x31)
  requiredGender?: Gender;
}
```

Permite objetivos como: `Feebas + HP|DEF|SPATK|SPDEF|SPEED` sin hardcodear "5x31".

### 2.2 Función de Transición (Breed)

```typescript
// Determinista: el resultado es predecible con items correctos
function breed(
  parentA: BreedingCapability,
  parentB: BreedingCapability,
  items: [HeldItem | null, HeldItem | null],
  rules: BreedingRules
): Offspring

// Donde:
interface Offspring {
  species: SpeciesId;      // Siempre la madre
  gender: Gender;          // Aleatorio o forzado
  ivs: IVBitmask;         // Heredados según reglas
  inheritedFrom: Stat[];  // Qué IVs vinieron de cada padre
}
```

### 2.3 Reglas de Herencia de IVs

```
PARA CADA STAT (HP, Atk, Def, SpAtk, SpDef, Speed):

CASO 1: Ambos padres tienen 31 → se hereda GRATIS (overlap)
CASO 2: Solo padre A tiene 31 + item protege ese stat → se hereda por item
CASO 3: Solo padre B tiene 31 + item protege ese stat → se hereda por item
CASO 4: Solo 1 padre tiene 31 sin item → RNG (evitar en ruta óptima)
CASO 5: Ninguno tiene 31 → no se hereda

MÁXIMO 2 items por cruce (1 por padre).
```

### 2.4 Separación de Concerns: Breeding vs Capture

```
┌─────────────────────────────┐
│     Breeding Optimizer      │  ← Resuelve: "¿Qué puedo hacer con mi inventario?"
│     (Solver principal)      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     Capture Advisor         │  ← Resuelve: "¿Qué capacidades genéticas faltan?"
│     (Análisis de desbloqueo)│
└─────────────────────────────┘
```

El solver NO debe considerar capturas como "gratis". El Capture Advisor indica qué falta.

---

## 3. Modelo de Estado del Solver

### 3.1 SearchState (Rediseñado)

```typescript
interface SearchState {
  // Capacidad genética del inventario (no identidad física)
  inventory: BreedingCapability[];
  cost: number;
  // NO incluir steps aquí (solo para reconstruir solución)
}

// Identidad física vs capacidad genética
interface BreedingCapability {
  species: SpeciesId;
  gender: Gender;
  ivs: IVBitmask;
  // NO incluir: nickname, level, stats base (irrelevante para solver)
}
```

### 3.2 Canonicalización de Estados

```typescript
// Dos Pokémon con mismos IVs = mismo estado para el solver
function canonicalize(state: SearchState): string {
  // Ordenar inventory por species + ivs
  // No incluir IDs físicos ni nicknames
}

// Propiedad: canonicalize(A) === canonicalize(B) si A y B son equivalentes
```

### 3.3 Equivalencia de Estados

```
State A ≡ State B cuando:
- Mismas especies disponibles
- Mismos IVs en cada especie
- Mismos géneros disponibles
- Mismos recursos (items, dinero)
```

---

## 4. Modelo de Costos

### 4.1 Definición Explícita

```typescript
interface CostModel {
  // Dinero (participa en optimización PRIMARY)
  itemCost: number;           // 500$ por Power Item
  genderSelectionCost: number; // 500$ para elegir género
  nurserySlotCost: number;    // 10,000$ por slot extra (decisión REAL de dinero)
  
  // Breedings (participa en optimización SECONDARY)
  // Conteo de operaciones de breed
  
  // NO incluido en optimización (solo informativo/metadata)
  captureCost: number;        // Variable, NO optimizar
  timeCost: number;           // Minutos, NO optimizar en MVP
}
```

### 4.2 Política de Optimización (Lexicográfica con Scalarización)

```
PRIMARY   = minimizar dinero (items + selección de género + slots extra)
SECONDARY = minimizar número de breedings

Implementación: g(n) = dinero(n) * K + breedings(n)
donde K > maxPossibleBreedings (ej. K = 1000)

Heurística escalada: h(n) = missingIVs * 500 * K

DESEMPATE = orden canónico de operaciones (determinista)
```

### 4.3 Categorías de Resultado

```typescript
type SolverResult = 
  | { status: 'SUCCESS'; route: BreedingRoute; cost: number }
  | { status: 'NO_SOLUTION'; reason: string }
  | { status: 'SEARCH_LIMIT_REACHED'; statesExplored: number }
  | { status: 'CANCELLED' }
  | { status: 'INVALID_INPUT'; errors: string[] };
```

---

## 5. Función Heurística

### 5.1 Definición

```typescript
const K = 1000; // Mayor que max posibles breedings

function g(n: SearchState): number {
  return n.moneyCost * K + n.breedingCount;
}

function heuristic(state: SearchState, goal: BreedingGoal): number {
  const missingIVs = countMissingIVs(state.inventory, goal.requiredIVs);
  const moneyH = missingIVs * 500;
  // HEURÍSTICA PURA (sin K) — admisible solo en dinero
  return moneyH * K;
}
```

### 5.2 Admisibilidad (A demostrar)

```
Para que A* encuentre el óptimo lexicográfico:
  h(n) <= optimalCost(n)  para todo estado n

La heurística subestima breedings (los pone en 0) — esto es admisible porque
underestimate está permitido. El dinero estimado nunca sobreestima porque
cada IV faltante requiere mínimo 1 item de 500$.

DEMO: h(n) <= g*(n) donde g* es el costo óptimo real desde n.

ESTO DEBE DEMOSTRARSE CON TESTS CONTRA UN REFERENCE SOLVER.
```

---

## 6. Domain Invariants

```typescript
// INV-001: IV mask solo utiliza bits 0..5
INV001: (ivs & ~0x3F) === 0

// INV-002: IVs garantizados (overlap + items) SIEMPRE están en el hijo
// NO: isSubset(parents.ivs, child.ivs) — eso sería falso
// SÍ: guaranteedIVs ⊆ child.ivs
INV002: guaranteedInheritedIVs(overlap(parentA, parentB), items) ⊆ child.ivs

// INV-003: La especie del hijo cumple la regla
INV003: child.species === mother.species

// INV-004: Máximo 1 item por padre (estructuralmente tipado)
INV004: items.parentA === null | HeldItem, items.parentB === null | HeldItem

// INV-005: Solo padres compatibles pueden generar una cría
INV005: checkCompatibility(parentA, parentB) === true

// INV-006: Los padres se CONSUMEN al criar (confirmado Diosesmon)
INV006: inventory.length decreases by 1 after breed (2 padres → 1 hijo neto)

// INV-007: Un Pokémon nunca puede tener más de seis IVs perfectos
INV007: countPerfectIVs(ivs) <= 6

// INV-008: requiredGender requiere que la especie tenga género
INV008: goal.requiredGender !== undefined → species.genderRate !== -1
```

---

## 7. Reference Solver

### 7.1 Propósito

Implementar un solver SIMPLE y LENTO que:
- Sea fácil de razonar
- Encuentre el óptimo por fuerza bruta
- Se use SOLO para escenarios pequeños
- Valide que A* encuentra el mismo resultado

### 7.2 Comparación

```typescript
// Para fixtures pequeños:
const reference = referenceSolver(input);
const optimized = aStarSolver(input);

assert(reference.cost === optimized.cost);
assert(reference.routeisValid(optimized.route));
```

---

## 8. Web Worker como Adapter

### 8.1 Arquitectura

```
domain/
    route-optimizer.ts      ← Solver puro (corre en Vitest)

workers/
    solver.worker.ts        ← Adapter que invoca el solver
```

### 8.2 Contratos de Comunicación

```typescript
// Request
interface CalculateRouteRequest {
  requestId: string;
  inventory: BreedingCapability[];
  goal: BreedingGoal;
  rules: BreedingRules;
}

// Response
interface CalculateRouteResponse {
  requestId: string;
  result: SolverResult;
}

// Progress
interface SolverProgress {
  requestId: string;
  statesExplored: number;
  percentage: number;
}

// Cancel
interface CancelSolver {
  requestId: string;
}
```

### 8.3 Estados del Solver

```typescript
type SolverStatus = 
  | 'IDLE'
  | 'RUNNING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'LIMIT_REACHED'
  | 'NO_SOLUTION';
```

---

## 9. Capa Application

```typescript
// application/calculate-breeding-route.ts
function calculateBreedingRoute(input: UserInput): SolverResult {
  // 1. Validar input
  const validated = validateInput(input);
  
  // 2. Convertir a dominio
  const goal = toBreedingGoal(validated);
  const inventory = toBreedingCapabilityList(validated);
  
  // 3. Ejecutar solver
  const result = solve(inventory, goal, rules);
  
  // 4. Convertir a output
  return toOutput(result);
}
```

---

## 10. Representación de IVs (Bitmasks)

```typescript
// IVs como bitmask (entero de 8 bits)
type IVBitmask = number; // 0-63

// Bits: Speed(5) SpDef(4) SpAtk(3) Defense(2) Attack(1) HP(0)
const HP_BIT      = 1;      // 0b000001
const ATTACK_BIT  = 1 << 1; // 0b000010
const DEFENSE_BIT = 1 << 2; // 0b000100
const SPATK_BIT   = 1 << 3; // 0b001000
const SPDEF_BIT   = 1 << 4; // 0b010000
const SPEED_BIT   = 1 << 5; // 0b100000

// Operaciones
const hasHP      = (ivs & HP_BIT) !== 0;
const addHP      = ivs | HP_BIT;
const overlap    = fatherIVs & motherIVs;  // Stats donde ambos tienen 31
const countPerfect = (ivs: number) => bits_set_lookup[ivs]; // Lookup table O(1)
```

---

## 11. Algoritmo Core

### Solver: A* + Branch & Bound

```
PriorityQueue ordenada por (costo_acumulado + heurística)
visited = Map<canonicalState, mejorCosto>

1. Estado inicial = inventario del usuario
2. Mientras haya estados por explorar:
   a. Sacar estado con menor f(n) = g(n) + h(n)
   b. Si goal.requiredIVs ⊆ mejorIVsDelInventario → ¡ENCONTRADO!
   c. Generar todos los cruces posibles (compatibilidad + items)
   d. Para cada hijo, si canonicalize(hijo) mejora estado conocido → agregar
3. Heurística h(n) = IVs_faltantes * 500
```

### Podas

- Si `costo_actual > mejor_solución_encontrada` → podar
- Si `canonicalize(estado) ya visitado con menor costo` → podar
- Si `inventario_vacío` y no hay solución → podar

---

## 12. Testing Strategy

### 12.1 Prioridad de Calidad (NO es solo coverage)

```
1. Domain Invariants (INV-001 a INV-008)
2. Property-Based Tests (fast-check)
3. Reference Solver validation
4. Optimality Tests
5. Determinism Tests
6. Mutation Testing (si viable)
7. Coverage como métrica secundaria
```

### 12.2 Categorías de Tests

```
Functional Tests:
  - Breed funciona correctamente
  - Overlap funciona
  - Compatibilidad funciona
  - Canonicalización funciona
  - Genderless validation (INV-008)

Optimality Tests:
  - Reference Solver == Optimized Solver en fixtures
  - Heurística nunca sobreestima (admisibilidad)
  - No existe ruta más barata que la encontrada
  - Costo lexicográfico correcto (dinero primero, breedings después)

Property-Based Tests:
  - overlap(A, B) ⊆ A
  - overlap(A, B) ⊆ B
  - countPerfect(mask) ∈ [0,6]
  - canonicalize(state) es idempotente
  - child.species === mother.species
  - guaranteedInheritedIVs ⊆ child.ivs

Determinism Tests:
  - solve(input) === solve(input) siempre

Monotonicity Tests:
  - OptimalCost(I ∪ {P}) <= OptimalCost(I) cuando P no introduce costo
```

---

## 13. Non Goals — MVP

```
NO se implementará en esta versión:
- Costo real de captura (solo informativo)
- Simulación probabilística
- Sincronización cloud
- Autenticación
- Optimización multiobjetivo avanzada
- Automatización dentro del juego
- Datos fuera de todas las generaciones (Gen 1-9) — **EXPANDIDO**
- Scheduler de guardería (solo estimación)
```

---

## 14. Known Unknowns

```
ANTES de implementar el solver, resolver:

1. ¿Los padres se consumen al criar? → **SÍ** (confirmado Diosesmon)
2. ¿Qué IVs hereda exactamente un hijo? → RESUELTO (overlap + items = garantizados)
3. ¿Cómo funciona exactamente Power Item? → RESUELTO (protege 1 IV específico del padre equipado)
4. ¿Qué sucede con dos Power Items? → RESUELTO (máximo 2, diferentes stats, 1 por padre)
5. ¿El género seleccionado cuesta siempre $500? → RESUELTO
6. ¿La captura se considera costo? → NO (solo informativo)
7. ¿El tiempo de guardería es por breeding? → SÍ
8. ¿Qué generaciones cubrimos? → TODAS (Gen 1-9, ~1025 Pokémon)
9. ¿Qué reglas especiales tiene Diosesmon vs Cobblemon vanilla? → Confirmado: padres se consumen (diferente a vanilla)
10. ¿Validación de requiredGender en genderless? → Inv-008 agregada (error explícito)
```

---

## 15. Definition of Done — Fase Solver

```
[ ] Reference Solver implementado
[ ] Optimized Solver (A*) implementado
[ ] Ambos coinciden en fixtures pequeños
[ ] Heurística demostrablemente admisible
[ ] Estados canónicos implementados
[ ] Memoización validada
[ ] Determinismo validado
[ ] Cancelación implementada
[ ] Límites de recursos implementados
[ ] Benchmarks reproducibles
[ ] Domain Invariants con tests
[ ] Property-Based Tests implementados
```

---

## 16. Estructura de Carpetas

```
diosesmon-crianza/
├── src/
│   ├── domain/                    # CERO imports de UI
│   │   ├── types/
│   │   │   ├── stat.ts            # Stat enum, IVBitmask, operaciones bits
│   │   │   ├── pokemon.ts         # Pokemon, Gender, Species, BreedingCapability
│   │   │   ├── items.ts           # HeldItem, ItemType
│   │   │   ├── breeding.ts        # BreedingPair, OverlapResult, Offspring
│   │   │   ├── route.ts           # BreedingRoute, BreedingStep, BreedingGraph
│   │   │   ├── costs.ts           # CostModel, NurseryConfig
│   │   │   ├── search.ts          # SearchState, SearchAction, SolverConfig
│   │   │   ├── goal.ts            # BreedingGoal, SolverResult
│   │   │   └── rules.ts           # BreedingRules (versionado)
│   │   ├── services/
│   │   │   ├── overlap.ts         # Detección de solapamiento (bitmask ops)
│   │   │   ├── validation.ts      # Compatibilidad de cruces
│   │   │   ├── eligibility.ts     # BreedingEligibility (regla declarativa)
│   │   │   ├── breed.ts           # Función de transición Breed()
│   │   │   ├── route-optimizer.ts # A* + Branch & Bound
│   │   │   ├── reference-solver.ts# Solver de referencia (fuerza bruta)
│   │   │   ├── cost-calculator.ts # Presupuesto
│   │   │   └── capture-advisor.ts # Análisis de desbloqueo
│   │   ├── rules/
│   │   │   ├── egg-groups.ts      # Reglas de grupo huevo (declarativo)
│   │   │   └── gender.ts          # Compatibilidad género
│   │   └── data/
│   │       ├── species.ts         # Interface SpeciesData
│   │       └── species.json       # Gen 1-9 estático (generado por script)
│   ├── application/
│   │   ├── calculate-breeding-route.ts
│   │   └── analyze-capture-requirements.ts
│   ├── adapters/
│   │   ├── solver/
│   │   │   └── solver.worker.ts       # Web Worker para A* (implementa SolverPort)
│   │   ├── persistence/
│   │   │   └── localStorage.ts        # Zustand persist middleware
│   │   ├── state/
│   │   │   └── inventoryStore.ts      # Zustand store (implementa StatePort)
│   │   └── ui/
│   │       ├── components/
│   │       │   ├── atoms/             # IVBadge, GenderIcon, StatBar
│   │       │   ├── molecules/         # PokemonCard, CostSummary
│   │       │   └── organisms/         # BreedingTree (React Flow)
│   │       ├── pages/
│   │       │   ├── Home.tsx           # Selección de Pokémon objetivo
│   │       │   ├── Inventory.tsx      # Registro de inventario
│   │       │   └── Result.tsx         # Árbol visual
│   │       ├── hooks/
│   │       │   └── useBreedingCalculator.ts
│   │       ├── App.tsx
│   │       └── main.tsx
│   └── ports/
│       ├── solver.port.ts             # SolverPort (interfaz para solver)
│       ├── persistence.port.ts        # PersistencePort (interfaz para storage)
│       └── state.port.ts              # StatePort (interfaz para estado)
├── scripts/
│   └── fetch-species.ts           # Ingesta de datos desde PokeAPI
├── tests/
│   ├── domain/
│   │   ├── services/
│   │   │   ├── overlap.test.ts
│   │   │   ├── validation.test.ts
│   │   │   ├── breed.test.ts
│   │   │   ├── eligibility.test.ts
│   │   │   ├── route-optimizer.test.ts
│   │   │   ├── reference-solver.test.ts
│   │   │   └── cost-calculator.test.ts
│   │   ├── properties/            # Property-Based Tests
│   │   │   ├── overlap-properties.test.ts
│   │   │   └── breed-properties.test.ts
│   │   └── helpers.ts
│   ├── integration/
│   │   ├── full-route.test.ts
│   │   └── solver-optimality.test.ts
│   └── fixtures/                  # Escenarios de prueba
│       ├── simple-2pokemon.json
│       ├── medium-10pokemon.json
│       └── worst-case-64pokemon.json
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 17. Fases de Implementación (TDD)

### Fase 0: Formalización (Días 0-1)
**Objetivo:** Cerrar todas las preguntas abiertas antes de codear.

| # | Tarea | Output |
|---|-------|--------|
| 0.1 | Resolver Known Unknowns | Documento actualizado |
| 0.2 | Definir BreedingGoal | Interface |
| 0.3 | Definir función Breed() | Especificación |
| 0.4 | Definir CostModel | Política de optimización |
| 0.5 | Definir Domain Invariants | Lista con tests |

### Fase 1: Dominio y Tipado Puro (Días 1-2)
**Objetivo:** Fundaciones matemáticas sin dependencias externas.
**Output:** Pruebas unitarias pasando al 100%.

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 1.1 | Tipos del dominio con Bitmasks | `types/*.ts` | — |
| 1.2 | BreedingCapability (separar de PhysicalIdentity) | `types/pokemon.ts` | — |
| 1.3 | Servicio overlap (bitmask ops) | `services/overlap.ts` | `overlap.test.ts` |
| 1.4 | Función Breed() | `services/breed.ts` | `breed.test.ts` |
| 1.5 | Validación de cruces | `services/validation.ts` | `validation.test.ts` |
| 1.6 | BreedingEligibility (declarativo) | `services/eligibility.ts` | `eligibility.test.ts` |
| 1.7 | Reglas grupo huevo | `rules/egg-groups.ts` | `eligibility.test.ts` |
| 1.8 | Reglas género | `rules/gender.ts` | `validation.test.ts` |
| 1.9 | Cost model | `types/costs.ts` | — |
| 1.10 | BreedingRules (versionado) | `types/rules.ts` | — |
| | **Commit:** | `feat(domain): implement core types, breed function, and eligibility rules` |

### Fase 2: Ingesta de Datos (Días 3-4)
**Objetivo:** Pipeline de datos libre de nodos muertos.
**Output:** Archivo estático `species.json`. NINGUNA llamada a API en runtime.

| # | Tarea | Archivo |
|---|-------|---------|
| 2.1 | Script de ingesta PokeAPI con rate-limiting | `scripts/fetch-species.ts` |
| 2.2 | Fetch ID 1-1025 (Gen 1-9) con retry + backoff exponencial | `scripts/fetch-species.ts` |
| 2.3 | Extraer: name, egg_groups, gender_rate | `scripts/fetch-species.ts` |
| 2.4 | Filtrar: excluir sin egg_group válido | `scripts/fetch-species.ts` |
| 2.5 | Convertir egg_groups a Bitmasks | `scripts/fetch-species.ts` |
| 2.6 | Generar `species.json` | `data/species.json` |
| 2.7 | Sugerencia de especies fáciles | `data/capture-suggestions.ts` |
| | **Commit:** | `feat(data): implement build-time data pipeline with exclusion rules` |

### Fase 3: Reference Solver (Días 5-6)
**Objetivo:** Solver de referencia para validar optimalidad.
**Output:** Solver que resuelve escenarios pequeños correctamente.

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 3.1 | Canonicalización de estados | `services/optimizer.ts` | `optimizer.test.ts` |
| 3.2 | Reference Solver (fuerza bruta) | `services/reference-solver.ts` | `reference-solver.test.ts` |
| 3.3 | Validar contra fixtures pequeños | — | `solver-optimality.test.ts` |
| | **Commit:** | `feat(solver): implement reference solver for optimality validation` |

### Fase 4: Solver Optimizado y Web Worker (Días 7-10)
**Objetivo:** Búsqueda A* aislada e inmaculada.
**Output:** Capacidad de resolver 64 Pokémon (meta aspiracional — validar con benchmarks).

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 4.1 | Cola de Prioridad (MinHeap) | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 4.2 | A* + Branch & Bound | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 4.3 | Heurística (demostrar admisibilidad) | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 4.4 | Memoización canónica | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 4.5 | Cancelación del solver | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 4.6 | Límites de recursos | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 4.7 | Web Worker adapter | `workers/solver.worker.ts` | — |
| 4.8 | Contratos de comunicación | `types/worker.ts` | — |
| 4.9 | Property-Based Tests | `tests/properties/` | `*.test.ts` |
| 4.10 | Benchmark reproducible | — | `full-route.test.ts` |
| | **Commit:** | `feat(solver): implement optimized A* with worker adapter and validation` |

### Fase 5: Application Layer (Días 11-12)
**Objetivo:** Orquestación entre domain y adapters.

| # | Tarea | Archivo |
|---|-------|---------|
| 5.1 | calculateBreedingRoute | `application/calculate-breeding-route.ts` |
| 5.2 | analyzeCaptureRequirements | `application/analyze-capture-requirements.ts` |
| 5.3 | Validación de input | `application/validate-input.ts` |
| | **Commit:** | `feat(application): implement orchestration layer` |

### Fase 6: Estado y Shell Visual (Días 13-16)
**Objetivo:** Conexión interactiva.

| # | Tarea | Componente |
|---|-------|-----------|
| 6.1 | Zustand store + persist middleware | `stores/inventoryStore.ts` |
| 6.2 | Átomos | `IVBadge`, `GenderIcon`, `StatBar` |
| 6.3 | Moléculas | `PokemonCard`, `CostSummary` |
| 6.4 | Formulario objetivo | `pages/Home.tsx` |
| 6.5 | Formulario inventario | `pages/Inventory.tsx` |
| 6.6 | Mapeo Worker → React Flow | `hooks/useBreedingCalculator.ts` |
| 6.7 | Árbol visual (React Flow) | `organisms/BreedingTree.tsx` |
| 6.8 | Página resultado | `pages/Result.tsx` |
| 6.9 | Manejo de errores (NO_SOLUTION, etc.) | `pages/Result.tsx` |
| | **Commit:** | `feat(ui): integrate Zustand persistence and React Flow DAG rendering` |

### Fase 7: Integración (Días 17-18)

| # | Tarea |
|---|-------|
| 7.1 | Pipeline completo: Input → Application → Worker → UI |
| 7.2 | Responsive design |
| 7.3 | Loading/empty/error states |
| 7.4 | Performance profiling |
| | **Commit:** `chore: final integration and responsive polish` |

---

## 18. Stack Tecnológico

- **Framework:** React 18+ con Vite
- **Lenguaje:** TypeScript estricto
- **Tests:** Vitest + @testing-library/react + fast-check (property-based)
- **UI Tree:** React Flow
- **Threading:** Web Workers
- **State Management:** Zustand + persist middleware
- **Persistencia:** localStorage (via Zustand)
- **Estilos:** Por definir (CSS Modules o Tailwind)
- **Deploy:** GitHub Pages vía GitHub Actions (futuro)

---

## 19. Output Esperado

### Árbol Visual (Bottom → Up) con React Flow

```
Nivel 0 (base):     Pokémon a capturar (IVs1x31)
Nivel 1:            Primeras crías 2x31
Nivel 2:            Crías 3x31
...
Nivel N (raíz):     Pokémon objetivo (6x31 o 5x31)
```

### Cada Nodo Contiene

- Nombre de especie
- Símbolo de género (♂/♀) + indicador si fue elegido (500$)
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

## 20. Decisiones Técnicas Finales

| # | Pregunta | Decisión |
|---|----------|----------|
| 1 | ¿Ditto tiene género? | Genderless (derivar de genderRate) |
| 2 | ¿Otros genderless? | Derivar de species数据, no hardcodear |
| 3 | ¿Género de cría? | **Aleatorio** (500$ para elegir) |
| 4 | ¿Árbol interactivo? | Sí, React Flow con zoom |
| 5 | ¿Persistencia? | **localStorage** (Zustand persist) |
| 6 | ¿Framework? | React |
| 7 | ¿Tests? | Vitest + fast-check |
| 8 | ¿Solver? | **Óptimo** (A* + Branch & Bound) |
| 9 | ¿IVs representation? | **Bitmasks** (8-bit integer) |
| 10 | ¿Dónde corre solver? | **Web Worker** (adapter) |
| 11 | ¿Librería de árbol? | **React Flow** |
| 12 | ¿Fuente de datos? | **PokeAPI** → JSON estático |
| 13 | ¿State management? | **Zustand** |
| 14 | ¿Exclusiones? | BreedingEligibility (declarativo) |
| 15 | ¿Reference Solver? | **Sí** (validar optimalidad) |
| 16 | ¿Capa Application? | **Sí** (orquestación) |
| 17 | ¿Domain Invariants? | **Sí** (INV-001 a INV-007) |
| 18 | ¿Property-Based Tests? | **Sí** (fast-check) |

---

## 21. Repositorio

- **URL:** https://github.com/KapsCa/Diosesmon-Crianza
- **Branch principal:** main

---

<!-- 
================================================================================
CONTEXTO COMPLETO PARA IA — NO FORMA PARTE DEL PLAN
================================================================================
Esta sección es un bloque de contexto puro para que cualquier IA entienda el 
proyecto al 100% sin necesidad de preguntar. Si le pasas este PLAN.md a otra IA,
esta sección le dará todo el contexto necesario.
================================================================================
-->

## CONTEXTO COMPLETO PARA IA (Referencia Rápida)

### ¿Qué es este proyecto?

Una aplicación web SPA que resuelve ESTE problema específico:

**Problema:** Un jugador de Pokémon en el servidor "Diosesmon" (basado en el mod Cobblemon de Minecraft) quiere criar un Pokémon con todos sus IVs en 31 (6x31 o 5x31 ignorando stats irrelevantes). Actualmente hace esto en papel, calculando mentalmente los cruces necesarios, lo cual es lento, propenso a errores y no optimiza costos.

**Solución:** Una app web donde el usuario:
1. Selecciona qué Pokémon quiere criar (ej. Milotic)
2. La app conoce los stats base y sugiere qué IVs ignorar (ej. "Attack no importa en Milotic, cria 5x31")
3. El usuario registra qué Pokémon tiene en su inventario (o empieza desde cero)
4. La app calcula la ruta de crianza MÁS BARATA (algoritmo A*)
5. Muestra un árbol visual ascendente (bottom→up) con cada paso detallado

### ¿Qué es PokéMMO / Cobblemon / Diosesmon?

- **PokéMMO:** Un MMO público basado en los juegos principales de Pokémon
- **Cobblemon:** Un mod de Minecraft que agrega mecánicas de Pokémon al juego
- **Diosesmon:** Un servidor específico que usa Cobblemon con mecánicas personalizadas de breeding

### Mecánicas de Breeding en Diosesmon (CRÍTICO para entender el dominio)

```
CÓMO FUNCIONA LA CRÍA:
1. Pones dos Pokémon en la guardería (máximo 7 slots según tu rango)
2. Esperas 25 min (usuario) o 10 min (maestro)
3. Sale un huevo con la ESPECIE de la MADRE siempre
4. El sexo del huevo es ALEATORIO (puedes pagar 500$ para elegir)
5. Los IVs del huevo se determinan así:

REGLAS DE HERENCIA DE IVs:
- Cada padre puede equipar 1 Power Item que protege 1 IV específico
- Si AMBOS padres tienen 31 en la misma stat → se hereda GRATIS (overlap)
- Si solo 1 padre tiene 31 y no tiene item → ese IV es al azar (RNG)
- Máximo 2 items por cruce (1 por padre)
- Lazo Destino HEREDA 5 IVs de 12 + 1 random → PROHIBIDO en rutas óptimas

EJEMPLO REAL:
- Trapinch hembra: HP=31, Def=31, SpAtk=31, SpDef=31, Speed=31 (falta Attack)
- Weedle macho: Attack=31, Def=31, SpAtk=31, SpDef=31, Speed=31 (falta HP)
- Overlap: Def, SpAtk, SpDef, Speed (4 stats = gratis)
- Items necesarios: Brazal HP en Trapinch + Brazal Atk en Weedle = 1000$
- Resultado: Trapinch 6x31

COSTOS:
- Power Item / Everstone / Lazo Destino = 500$ c/u
- Selección de género = 500$ (antes de ingresar a guardería)
- Guardería = gratis
- Pokeball = 200$ (costo de captura, NO incluido en ruta)
- Slot extra de guardería = 10,000$
```

### Información que NO está en PokéAPI

PokeAPI (https://pokeapi.co) tiene datos útiles PERO faltan cosas específicas de Cobblemon:

```
LO QUE SÍ TIENE POKÉAPI:
✓ Nombre del Pokémon
✓ Egg groups (grupos huevo)
✓ Gender rate (ratio de género: 0=female only, 1=male only, -1=genderless)
✓ Stats base
✓ Capture rate
✓ Generación

LO QUE NO TIENE POKÉAPI (específico de Cobblemon):
✗ Tasas de spawn por área
✗ Disponibilidad real en el servidor
✗ Precios del GTS (Mercado de intercambio)
✗ Costos específicos de items en el servidor
✗ Rangos de guardería
```

### Flujo de Usuario Detallado

```
PANTALLA 1: Selección de Pokémon objetivo
├── Dropdown con todos los Pokémon Gen 1-9
├── Al seleccionar, muestra stats base
├── Checkboxes: "¿Qué IVs quieres?" (HP, Atk, Def, SpAtk, SpDef, Speed)
├── Default: todos marcados (6x31)
├── El usuario puede desmarcar stats irrelevantes (ej. Atk en Milotic)
└── Botón "Calcular ruta"

PANTALLA 2: Registro de inventario
├── Pregunta: "¿Tienes Pokémon con IVs ya?" 
├── Opción A: "Sí, quiero registrarlos"
│   ├── Formulario: Especie, Género, IVs (badges clickeables), Item equipado
│   ├── Botón "Agregar otro Pokémon"
│   └── Lista de Pokémon registrados
├── Opción B: "No, empezar desde cero"
│   └── La app sugerirá qué capturar
├── Pregunta: "¿Qué rango tienes?" (usuario/maestro)
│   └── Determina slots disponibles y tiempo de guardería
└── Botón "Calcular"

PANTALLA 3: Resultado
├── Resumen: Costo total, tiempo estimado, Pokémon a capturar
├── Árbol visual (React Flow):
│   ├── Nodos base: Pokémon a capturar (abajo)
│   ├── Nodos intermedios: Crías 2x31, 3x31, 4x31
│   ├── Nodo raíz: Pokémon objetivo 6x31 (arriba)
│   ├── Cada nodo muestra: especie, género, IVs heredados, items
│   └── Zoom/pan para navegar árbol grande
├── Lista de capturas sugeridas (fuera del presupuesto)
└── Botón "Volver a calcular"
```

### Estado del Proyecto Actual

```
LO QUE YA ESTÁ HECHO (Fase 1 completa):
✓ Proyecto scaffolded: Vite + React + TypeScript + Vitest
✓ Git conectado a GitHub
✓ Tipos del dominio: stat.ts, pokemon.ts, items.ts, breeding.ts, route.ts, costs.ts, search.ts
✓ overlap.ts con 14 tests pasando
✓ validation.ts con 20 tests pasando
✓ Helper de testing: createMockPokemon, createPokemonWithPerfectIVs, createDitto
✓ Estructura de carpetas: domain/, adapters/, ports/, tests/

LO QUE FALTA POR HACER:
□ Refactorizar a Bitmasks (actualmente usa Record<Stat, number>)
□ Implementar BreedingGoal interface
□ Implementar función Breed()
□ Implementar canonicalización de estados
□ Implementar Reference Solver
□ Script de ingesta PokeAPI → species.json
□ Solver A* + Branch & Bound en Web Worker
□ Capa Application
□ Zustand store con persist middleware
□ UI: formularios + React Flow tree
□ Integración completa
```

### Ejemplo de Árbol Visual (Output Esperado)

```
                    [Milotic♀ 6x31]
                    Equipar: -
                    ┌───────────────┘
            ┌───────┴───────┐
    [Feebas♂ 3x31]     [Magikarp♀ 3x31]
    HP,Atk,Def          SpAtk,SpDef,Speed
    Equipar: HP+Def     Equipar: SpAtk+Speed
    ┌───────────┘           ┌───────────┘
┌───┴───┐               ┌───┴───┐
[Ditto♀ 1x31] [Ditto♂ 1x31] [Ditto♀ 1x31] [Ditto♂ 1x31]
   HP            Atk          SpAtk          Speed
   Equipar: -    Equipar: -   Equipar: -     Equipar: -
   ↓ capturar    ↓ capturar   ↓ capturar     ↓ capturar
```

### Glosario de Términos

| Término | Significado |
|---------|-------------|
| **IV** | Individual Value. Stat oculta de 0-31 que define el potencial máximo |
| **31** | IV perfecto (máximo) |
| **6x31** | Pokémon con los 6 IVs en 31 (perfecto) |
| **5x31** | Pokémon con 5 IVs en 31 (1 stat ignorado) |
| **Overlap** | Cuando ambos padres tienen 31 en la misma stat → herencia gratis |
| **Power Item** | Objeto que fuerza la herencia de 1 IV específico (500$) |
| **Everstone** | Objeto que hereda la naturaleza (no IVs) |
| **Lazo Destino** | Objeto que hereda 5 IVs de 12 + 1 random (PROHIBIDO) |
| **Egg Group** | Grupo de compatibilidad para breeding |
| **Genderless** | Sin género. Solo cría con Ditto |
| **Ditto** | Pokémon genderless que puede criar con cualquiera |
| **Bitmask** | Representación de IVs como entero binario (ej. 0b111111 = 6x31) |
| **A*** | Algoritmo de búsqueda que garantiza la ruta óptima |
| **Branch & Bound** | Técnica de poda para acelerar A* |
| **Web Worker** | Hilo de ejecución separado que no bloquea la UI |
| **React Flow** | Librería para renderizar grafos/árboles interactivos |
| **Zustand** | State manager ligero para React |
| **Conventional Commits** | Estándar de mensajes de commit: feat, fix, docs, chore |
| **Reference Solver** | Solver de referencia (fuerza bruta) para validar optimalidad |
| **Canonicalización** | Conversión de estados equivalentes a representación única |
| **BreedingEligibility** | Regla declarativa que determina si un Pokémon puede criar |
| **BreedingCapability** | Capacidad genética de un Pokémon (sin identidad física) |
| **Domain Invariant** | Propiedad que siempre debe cumplirse en el dominio |

### Referencia Visual de Colores de IVs

```
HP      = 🟢 Verde    (badge: "HP")
Attack  = 🔴 Rojo     (badge: "Atk")
Defense = 🟠 Naranja  (badge: "Def")
SpAtk   = 🟣 Morado   (badge: "SpAtk")
SpDef   = 🔵 Azul     (badge: "SpDef")
Speed   = 🩵 Cyan     (badge: "Spe")
```
