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

## Validación de PRs (issue-first)

Todo PR debe estar vinculado a un issue aprobado y clasificado con un label de tipo. Los checks de PR Validation lo verifican en cada PR:

- **Referencia a issue** — el cuerpo de la PR debe incluir `Closes #N` (también válido `Fixes #N` o `Resolves #N`), escrito en el cuerpo visible, no dentro de comentarios HTML (`<!-- ... -->`).
- **Issue aprobado** — el issue referenciado debe tener el label `status:approved` antes de que la PR pueda pasar.
- **Label de tipo** — la PR debe llevar exactamente un label `type:*`. Los válidos son: `type:bug`, `type:feature`, `type:docs`, `type:refactor`, `type:chore`, `type:breaking-change`.
- **Presupuesto de tamaño** — PRs de más de 400 líneas cambiadas (adiciones + eliminaciones) requieren el label `size:exception`, que degrada el fallo a un warning. Sin ese label, el check falla.
- **PRs automatizadas exentas** — las PRs de release-please y Dependabot quedan fuera de todos estos checks: no tienen autor humano que pueda agregar labels ni vincular issues, y bloquearlas rompería la automatización de releases.

### Estos checks son requeridos, y bloquean

Los seis son **required status checks** de branch protection: un check rojo **bloquea el merge**. La fuente de verdad es la API, no este documento — consultala antes de asumir que algo no bloquea:

```bash
gh api repos/KapsCa/Diosesmon-Crianza/branches/main/protection/required_status_checks
```

| check requerido | workflow → job | qué verifica |
| --- | --- | --- |
| `test` | `ci.yml` → `test` | la suite completa |
| `Check PR Cognitive Load` | `pr-check.yml` → `check-pr-size` | el presupuesto de 400 líneas |
| `Check Workflow Scripts` | `pr-check.yml` → `check-workflow-scripts` | los scripts de `.github/` |
| `Check Issue Reference` | `pr-check.yml` → `check-issue-reference` | `Closes #N` en el cuerpo |
| `Check Issue Has status:approved` | `pr-check.yml` → `check-issue-approved` | el label del issue referenciado |
| `Check PR Has type:* Label` | `pr-check.yml` → `check-type-label` | exactamente un `type:*` en la PR |

**`strict: true`** — además de los seis checks, la rama tiene que estar **al día con `main`** antes de mergear. Si `main` se movió, `mergeStateStatus` pasa a `BEHIND` y hay que actualizar la rama con un merge (o un rebase) de `main`, **aunque los seis checks estén en verde**.

> **Ojo con `gh pr checks`**: muestra el **mejor** resultado por nombre, mientras que la protección evalúa el **último** check-run de ese nombre. Cuando el mismo check corrió dos veces, las dos vistas dicen cosas distintas y el PR queda `BLOCKED` con todo aparentemente en verde. El diagnóstico es `gh api repos/KapsCa/Diosesmon-Crianza/commits/<sha>/check-runs`, no `gh pr checks`.
>
> **`deploy-pages.yml` no debe agregarse como required check**: no dispara en `pull_request`, así que nunca reportaría un check-run y todo PR quedaría esperando un estado que no va a llegar. Está explicado en el encabezado de ese workflow.

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
