# Diosesmon Crianza — Plan de ejecución

Este documento existe para responder una sola pregunta: **qué vamos a construir, en qué orden y cómo sabremos que está listo**.

Para las reglas del dominio, modelos formales y contexto largo, ver `CONTEXT.md`.

## 1. Objetivo

Construir una app que ayude a planear la crianza en Diosesmon de forma clara, visual y fácil de seguir.

## 2. Alcance del MVP

### Incluye
- Elegir Pokémon objetivo.
- Ver el camino de crianza necesario.
- Estimar costo y progreso.
- Mostrar un árbol visual entendible.
- Guardar el flujo de trabajo del usuario durante la sesión.

### No incluye
- Captura automática.
- Reglas futuras no confirmadas.
- Optimización visual avanzada fuera del flujo principal.
- Funciones que no aporten al primer valor usable.

## 3. Estado actual

### Ya hecho
- README simplificado.
- Base del repo preparada para trabajo ordenado.
- Tests existentes pasando.
- Reglas principales del dominio ya definidas en el contexto histórico.

### Pendiente
- Separar el plan operativo del contexto largo.
- Ordenar fases de implementación.
- Definir entregables por etapa.
- Mantener el documento corto y escaneable.

## 4. Ruta de ejecución

### Fase 1 — Base del producto
**Objetivo:** dejar claro el problema, el alcance y la estructura del trabajo.

**Entregables:**
- PLAN.md limpio y operativo.
- CONTEXT.md con reglas y referencias.
- README.md mantenido como presentación simple.

**Listo cuando:**
- un lector entiende qué construir sin leer teoría extensa.
- el contexto pesado ya no estorba en el plan.

### Fase 2 — Dominio y datos
**Objetivo:** asegurar que las reglas de crianza estén representadas correctamente.

**Entregables:**
- reglas de dominio consolidadas.
- modelos y validaciones coherentes.
- referencias claras a las restricciones del juego.

**Listo cuando:**
- las reglas importantes están documentadas una sola vez.
- no hay contradicciones entre secciones.

### Fase 3 — Motor de solución
**Objetivo:** resolver el cálculo del árbol de crianza de forma confiable.

**Entregables:**
- flujo de cálculo definido.
- criterios de costo y progreso claros.
- decisión sobre visualización y recorrido.

**Listo cuando:**
- el resultado esperado puede describirse sin ambigüedad.
- el usuario entiende por qué una ruta es mejor que otra.

### Fase 4 — Experiencia visual
**Objetivo:** convertir el resultado en una vista útil y fácil de leer.

**Entregables:**
- árbol visual.
- resumen de costo y pasos.
- navegación simple entre resultados.

**Listo cuando:**
- el flujo se entiende sin ayuda externa.
- la lectura del árbol no requiere conocer detalles internos.

### Fase 5 — Verificación y ajustes
**Objetivo:** confirmar que el plan y la implementación sigan alineados.

**Entregables:**
- checklist de validación.
- estados actuales visibles.
- próximos pasos definidos.

**Listo cuando:**
- lo hecho y lo pendiente quedan claros.
- el proyecto puede seguir sin rehacer contexto.

## 5. Criterios de éxito

- El plan se lee rápido.
- El contexto largo está fuera del camino principal.
- Cada fase tiene un propósito claro.
- No hay repetición innecesaria entre documentos.
- Cualquier IA o humano puede retomar el trabajo sin perder el rumbo.

## 6. Próximo paso

Completar `CONTEXT.md` con las reglas y decisiones que ya no deben vivir dentro del plan.
