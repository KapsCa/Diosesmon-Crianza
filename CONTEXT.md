# Diosesmon Crianza — Contexto del proyecto

Este archivo guarda el contexto largo del proyecto. El objetivo es que `PLAN.md` quede limpio y que este documento concentre las reglas, modelos y decisiones que explican cómo funciona el dominio.

## 1. Qué es el proyecto

Diosesmon Crianza es una app para ayudar a planear crianza de Pokémon dentro del servidor Diosesmon. La idea es que el usuario pueda entender rápido qué cruzas hacer, cuánto costará y cómo avanzar sin perderse en cálculos manuales.

## 2. Principios del dominio

- La crianza es el centro del producto.
- La app debe mostrar caminos claros, no solo resultados finales.
- El costo importa tanto como el resultado.
- La experiencia debe servir para decidir, no solo para mostrar datos.
- Las reglas del dominio se documentan una sola vez.

## 3. Reglas de crianza

### Alcance de generaciones
- El proyecto cubre todas las generaciones disponibles en el servidor.
- La ingesta debe contemplar el rango completo soportado por el sistema.

### Herencia de IVs
- Los IVs heredados forman parte del criterio central del cálculo.
- La validación de herencia debe ser consistente con las reglas del servidor.
- Las reglas no deben asumir el comportamiento vanilla si Diosesmon se desvía de él.

### Género
- Hay especies con género fijo y especies con restricciones específicas.
- El género puede afectar la validez de una cruza.
- Las especies sin determinismo de género siguen reglas particulares y deben tratarse explícitamente.

### Ditto y compatibilidad
- La compatibilidad de crianza debe contemplar casos especiales.
- Ditto es una excepción importante dentro del dominio.
- No todas las combinaciones posibles son válidas.

### Power Items
- Se consideran consumibles por uso.
- No deben tratarse como reutilizables.
- El costo debe reflejar el uso real dentro de cada cruza.

## 4. Modelo formal del sistema

### Objetivo de crianza
El sistema trabaja con un objetivo configurable que define qué resultado se quiere lograr.

### Transición de crianza
Cada cruza genera un nuevo estado del problema y puede tener costo, restricciones y variantes.

### Canonicalización
Los estados equivalentes deben identificarse de forma consistente.
La canonicalización debe incluir los campos relevantes para que no se pierdan diferencias importantes.

### Modelo de estado
El estado de búsqueda debe representar:
- progreso alcanzado,
- costo acumulado,
- variantes disponibles,
- restricciones activas,
- información suficiente para comparar rutas.

## 5. Costos y optimización

### Costos relevantes
- dinero,
- cantidad de cruces,
- uso de recursos consumibles,
- decisiones que afectan el camino final.

### Prioridad de optimización
El sistema no debe optimizar solo un número aislado si eso oculta una mejor solución práctica.
La prioridad es encontrar una solución buena, consistente y explicable.

## 6. Arquitectura conceptual

- El dominio debe mantenerse separado de la interfaz.
- La lógica pesada debe poder evaluarse sin depender de la UI.
- La visualización debe consumir resultados ya resueltos.
- Un worker o capa equivalente puede encargarse del cálculo si hace falta aislar carga.

## 7. Estrategia de trabajo

- TDD como guía de calidad cuando se implemente lógica nueva.
- Reglas e invariantes antes que optimizaciones prematuras.
- Una fuente de verdad para decisiones ya cerradas.
- Evitar repetir la misma explicación en varios archivos.

## 8. Invariantes importantes

- No inventar reglas nuevas sin documentarlas.
- No mezclar contexto largo con el plan operativo.
- No asumir que una solución es válida si viola una regla del dominio.
- No cambiar el significado de una decisión sin actualizar este archivo.

## 9. Decisiones ya consolidadas

- El proyecto usa una estructura pensada para crianza visual.
- El árbol de resultados debe ser fácil de leer.
- El costo total es parte del valor principal de la app.
- El plan de trabajo debe permanecer separado del contexto largo.
- `README.md` se mantiene simple y público.

## 10. Referencias útiles

- `README.md` — presentación simple del proyecto.
- `PLAN.md` — guía de ejecución y fases.

## 11. Resumen

Si quieres entender qué hacer, lee `PLAN.md`.
Si quieres entender cómo funciona el dominio, lee este archivo.
