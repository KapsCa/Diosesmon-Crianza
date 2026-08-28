# Repository Standards

## Branch Protection (GitHub)

- **No push directo a `main`** — siempre usar PR
- **PR obligatorio** — GitHub requiere PR antes de merge
- **Checks funcionales** — CI debe pasar antes de merge (status check: `test`)
- **Conversation resolution** — todas las conversaciones deben resolverse
- **Dismiss stale reviews** — reviews se invalidan con nuevos pushes
- **No force pushes** — bloqueado en `main`
- **No deletions** — bloqueado en `main`
- **Enforce admins** — las reglas aplican incluso a administradores

## Commits

- **Conventional Commits** — `feat(scope): description`, `fix(scope): description`, etc.
- **Commits atómicos** — un cambio lógico por commit
- **Tests con código** — si cambias comportamiento, actualiza tests

## Estructura del repositorio

### Regla general
- Mantener la raíz del repo lo más limpia posible.
- En `root` solo deben vivir archivos de coordinación del proyecto: configuración, documentación principal y archivos que realmente sean globales.
- Si un archivo ya no aporta al flujo diario, moverlo a `docs/`, `tests/` o eliminarlo cuando deje de servir.

### React / Vite
- `src/` contiene todo el código de la app.
- `App.tsx` y `main.tsx` deben quedar livianos: composición, providers y arranque.
- La lógica de negocio no debe vivir en componentes raíz.
- Preferir organización por **feature** o por **dominio** cuando el proyecto crezca.
- Compartir solo lo realmente reusable en carpetas comunes pequeñas.
- Evitar deep nesting innecesario y imports cruzados entre features si se puede.

### Estructura recomendada para este repo
```text
src/
  app/        # composición global, providers, layout
  features/   # módulos por dominio o funcionalidad
  shared/     # utilidades y UI reutilizable
  domain/     # reglas y tipos del negocio
  assets/     # recursos estáticos de la app
```

## Flujo de Trabajo

```bash
# 1. Crear rama
git switch -c feat/mi-cambio

# 2. Hacer commits
git commit -m "feat(core): add new feature"

# 3. Push
git push -u origin feat/mi-cambio

# 4. Abrir PR
gh pr create

# 5. Esperar checks
# 6. Merge cuando todo pase
```

> El cuerpo de la PR se completa y se refresca automáticamente con un bot que resume los archivos cambiados.

## Stack

- **Runtime**: React 19 + TypeScript 6
- **Build**: Vite 8
- **Tests**: Vitest 4 + @testing-library/react
- **Lint**: oxlint
- **Releases**: release-please

## Comandos Útiles

```bash
npm test              # Ejecutar tests
npx tsc --noEmit      # Type check
npx oxlint .          # Lint
```
