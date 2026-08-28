# Diosesmon Crianza — Plan de Desarrollo Final

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

---

## 1. Reglas de Negocio

| Regla | Detalle |
|-------|---------|
| Herencia de especie | Siempre la madre |
| Genderless | Ditto, Porygon, Beldum, Starmie, etc. Solo crían con Ditto |
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
| **Exclusión** | Pokémon con egg_group `"no-eggs-discovered"` se descartan (legendarios, baby Pokémon) |

---

## 2. Restricciones Arquitectónicas Core (CRÍTICO)

El input base del inventario puede llegar a **64 Pokémon**. Para evitar que el Main Thread colapse por la explosión combinatoria:

| Restricción | Implementación | Justificación |
|:---|:---|:---|
| **Optimización de Memoria** | **Bitmasks** (entero 8-bit) para IVs. Prohibido arrays u objetos pesados. | Soporte para inventarios de hasta 64 Pokémon sin saturar RAM durante explosión combinatoria del A*. |
| **Aislamiento de Cómputo** | Solver A* + Branch & Bound exclusivamente en **Web Worker**. | Garantiza UI a 60 FPS. Main Thread nunca se congela. |
| **Persistencia Global** | **Zustand** con middleware `persist` atacando `localStorage`. | Sincronización instantánea del inventario sin re-renders masivos. |
| **Inmutabilidad** | Dominio diseñado sin mutar estado original. | Previene bugs por side effects en el solver. |

---

## 3. Representación de IVs (Bitmasks)

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

## 4. Algoritmo Core

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

### Modelo de Costos de Género

```typescript
// Género: aleatorio por defecto, 500$ para elegir
const GENDER_SELECTION_COST = 500;

// En el árbol, cada nodo indica:
// - Si el usuario pagó por elegir género
// - El género resultante (aleatorio o forzado)
```

### Podas

- Si `costo_actual > mejor_solución_encontrada` → podar
- Si `estado_ya_visitado_con_menor_costo` → podar
- Si `inventario_vacío` y no se puede capturar → podar

---

## 5. Estructura de Carpetas

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
│   │       └── localStorage.ts    # Zustand persist middleware
│   ├── stores/
│   │   └── inventoryStore.ts      # Zustand store con persist
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

## 6. Fases de Implementación (TDD)

### Fase 1: Dominio y Tipado Puro (Días 1-2)
**Objetivo:** Fundaciones matemáticas sin dependencias externas.
**Output:** Pruebas unitarias pasando al 100%.

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 1.1 | Tipos del dominio con Bitmasks | `types/*.ts` | — |
| 1.2 | Servicio overlap (bitmask ops) | `services/overlap.ts` | `overlap.test.ts` |
| 1.3 | Validación de cruces | `services/validation.ts` | `validation.test.ts` |
| 1.4 | Reglas grupo huevo (exclusión baby/legendarios) | `rules/egg-groups.ts` | `validation.test.ts` |
| 1.5 | Reglas género (aleatorio + selección 500$) | `rules/gender.ts` | `validation.test.ts` |
| 1.6 | Cost model (ITEM_COST=500, GENDER_COST=500) | `types/costs.ts` | — |
| | **Commit:** | `feat(domain): implement core entity types and bitmask overlap validation` |

### Fase 2: Ingesta de Datos Determinista (Build-Time) (Días 3-4)
**Objetivo:** Pipeline de datos libre de nodos muertos.
**Output:** Archivo estático `species.json`. NINGUNA llamada a API en runtime.

| # | Tarea | Archivo |
|---|-------|---------|
| 2.1 | Script de ingesta PokeAPI | `scripts/fetch-species.ts` |
| 2.2 | Fetch ID 1-386 (Gen 1-3) | `scripts/fetch-species.ts` |
| 2.3 | Extraer: name, egg_groups, gender_rate | `scripts/fetch-species.ts` |
| 2.4 | **Exclusión:** Si egg_groups incluye `"no-eggs-discovered"` → DESCARTAR | `scripts/fetch-species.ts` |
| 2.5 | Convertir egg_groups a Bitmasks | `scripts/fetch-species.ts` |
| 2.6 | Generar `species.json` | `data/species.json` |
| 2.7 | Sugerencia de especies fáciles por grupo huevo | `data/capture-suggestions.ts` |
| | **Commit:** | `feat(data): implement build-time exclusion for unbreedable species and generate static dictionary` |

### Fase 3: Solver Óptimo y Web Worker (Días 5-8)
**Objetivo:** Búsqueda A* aislada e inmaculada.
**Output:** Capacidad de resolver 64 Pokémon en < 5 segundos.

| # | Tarea | Archivo | Test |
|---|-------|---------|------|
| 3.1 | Modelo de estado | `types/search.ts` | — |
| 3.2 | Cola de Prioridad (MinHeap) | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.3 | A* + Branch & Bound | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.4 | Costo g(n): RNG género vs 500$ forzado | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.5 | Heurística h(n): `(IVs_Objetivo - IVs_Actuales) * 500` | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.6 | Memoización de estados | `services/route-optimizer.ts` | `route-optimizer.test.ts` |
| 3.7 | Web Worker wrapper | `workers/solver.worker.ts` | — |
| 3.8 | Cost calculator | `services/cost-calculator.ts` | `cost-calculator.test.ts` |
| 3.9 | Time estimator | `services/time-estimator.ts` | `time-estimator.test.ts` |
| 3.10 | **Prueba de fuego:** 64 Pokémon → 6x31 en <5s | — | `full-route.test.ts` |
| | **Commit:** | `feat(solver): isolate admissible A* breeding algorithm within web worker` |

### Fase 4: Estado y Shell Visual (DAG) (Días 9-12)
**Objetivo:** Conexión interactiva.
**Output:** UI interactiva renderizando resultado del solver sin bloquear navegador.

| # | Tarea | Componente |
|---|-------|-----------|
| 4.1 | Zustand store + persist middleware | `stores/inventoryStore.ts` |
| 4.2 | Átomos | `IVBadge`, `GenderIcon`, `StatBar` |
| 4.3 | Moléculas | `PokemonCard`, `CostSummary` |
| 4.4 | Formulario objetivo | `pages/Home.tsx` |
| 4.5 | Formulario inventario | `pages/Inventory.tsx` |
| 4.6 | Mapeo Worker → React Flow (Nodes/Edges) | `hooks/useBreedingCalculator.ts` |
| 4.7 | Árbol visual (React Flow) | `organisms/BreedingTree.tsx` |
| 4.8 | Página resultado | `pages/Result.tsx` |
| 4.9 | Alerta si especie in-criable | `pages/Result.tsx` |
| | **Commit:** | `feat(ui): integrate Zustand persistence and React Flow DAG rendering` |

### Fase 5: Integración (Días 13-14)

| # | Tarea |
|---|-------|
| 5.1 | Pipeline: Input → Worker → React Flow |
| 5.2 | Responsive design |
| 5.3 | Loading/empty/error states |
| 5.4 | Performance profiling |
| | **Commit:** `chore: final integration and responsive polish` |

---

## 7. Stack Tecnológico

- **Framework:** React 18+ con Vite
- **Lenguaje:** TypeScript estricto
- **Tests:** Vitest + @testing-library/react
- **UI Tree:** React Flow
- **Threading:** Web Workers
- **State Management:** Zustand + persist middleware
- **Persistencia:** localStorage (via Zustand)
- **Estilos:** Por definir (CSS Modules o Tailwind)
- **Deploy:** GitHub Pages vía GitHub Actions (futuro)

---

## 8. Output Esperado

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

## 9. Decisiones Técnicas Finales

| # | Pregunta | Decisión |
|---|----------|----------|
| 1 | ¿Ditto tiene género? | Genderless |
| 2 | ¿Otros genderless? | Porygon, Beldum, Starmie |
| 3 | ¿Género de cría? | **Aleatorio** (500$ para elegir) |
| 4 | ¿Árbol interactivo? | Sí, React Flow con zoom |
| 5 | ¿Persistencia? | **localStorage** (Zustand persist) |
| 6 | ¿Framework? | React |
| 7 | ¿Tests? | Vitest |
| 8 | ¿Solver? | **Óptimo** (A* + Branch & Bound) |
| 9 | ¿IVs representation? | **Bitmasks** (8-bit integer) |
| 10 | ¿Dónde corre solver? | **Web Worker** |
| 11 | ¿Librería de árbol? | **React Flow** |
| 12 | ¿Fuente de datos? | **PokeAPI** → JSON estático |
| 13 | ¿State management? | **Zustand** |
| 14 | ¿Exclusiones? | Baby Pokémon + Legendarios (no-eggs-discovered) |

---

## 10. Repositorio

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
├── Dropdown con todos los Pokémon Gen 1-3
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
□ Script de ingesta PokeAPI → species.json
□ Solver A* + Branch & Bound en Web Worker
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

### Referencia Visual de Colores de IVs

```
HP      = 🟢 Verde    (badge: "HP")
Attack  = 🔴 Rojo     (badge: "Atk")
Defense = 🟠 Naranja  (badge: "Def")
SpAtk   = 🟣 Morado   (badge: "SpAtk")
SpDef   = 🔵 Azul     (badge: "SpDef")
Speed   = 🩵 Cyan     (badge: "Spe")
```
