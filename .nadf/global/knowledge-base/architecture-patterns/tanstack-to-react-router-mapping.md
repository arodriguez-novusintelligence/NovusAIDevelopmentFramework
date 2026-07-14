# Patrón: Traducción TanStack Router → React Router v6

## Contexto

Prototipos Lovable que usan TanStack Router deben migrarse a React Router v6 en el stack productivo NovusIntelligenceWEB. Aplica en workflows `lovable-to-web` con múltiples rutas y parámetros dinámicos.

## Solución

| TanStack Router | React Router v6 |
|-----------------|-----------------|
| `/solutions/$slug` | `/solutions/:slug` |
| File-based routing | `createBrowserRouter` o `<Routes>` declarativas |
| Route loaders | `useParams()` + fetch en componente o loader (si se adopta data router) |

Convenciones validadas:
- Lazy loading por ruta (`React.lazy` + `Suspense`).
- `PageMetaTags` (react-helmet-async) por página para SEO.
- Query params (`?interest=`) preservados en navegación a `/contact`.
- Referencia de mapeo en `port-map.yml` adaptado — no copiado de Lovable.

## Ejemplo

novus-intelligence (2026-07-14): 10 rutas navegables, 6 slugs de soluciones.
- Evidencia: `artifacts/plan-implementacion.md`, `artifacts/resumen-frontend.md`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | KB-005 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
