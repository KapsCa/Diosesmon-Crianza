# Repository Standards

## Branch Protection

- **No push directo a `main`** — siempre usar PR
- **PR obligatorio** — GitHub requiere PR antes de merge
- **Checks funcionales** — CI debe pasar antes de merge

## Commits

- **Conventional Commits** — `feat(scope): description`, `fix(scope): description`, etc.
- **Commits atómicos** — un cambio lógico por commit
- **Tests con código** — si cambias comportamiento, actualiza tests

## Flujo de Trabajo

```bash
# 1. Crear rama
git switch -c feat/mi-cambio

# 2. Hacer commits
git commit -m "feat(core): add new feature"

# 3. Push
git push -u origin feat/mi-cambio

# 4. Abrir PR
gh pr create --fill

# 5. Esperar checks
# 6. Merge cuando todo pase
```

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
