# Patrón: Traducción TanStack Router → React Router v6

## Contexto

Proyectos Lovable (novus-nexus) usan TanStack Router. El stack productivo NADF (NovusIntelligenceWEB) usa React Router v6. Durante workflows Lovable→Web se requiere mapeo sistemático de rutas, parámetros y metadatos SEO.

## Solución

### Convenciones de mapeo

| TanStack Router | React Router v6 |
|-----------------|-----------------|
| `/solutions/$slug` | `/solutions/:slug` |
| `createFileRoute` | `<Route path="..." element={...} />` |
| Search params tipados | `useSearchParams()` |
| Layout routes | `<Outlet />` en layout component |

### Prácticas validadas

1. **Lazy loading por ruta** — `React.lazy()` + `Suspense` para rutas pesadas (p. ej. `MultiAgentDemo`).
2. **PageMetaTags (Helmet)** — un componente por página con `title`, `description`, `og:*`.
3. **Query params preservados** — navegación a `/contact?interest=...` mantiene parámetros del CTA origen.
4. **10 rutas corporativas** — landing, about, services, contact, solutions (6 slugs), demo.

### Estructura recomendada

```
src/
├── routes/           # Definición centralizada en App.tsx o router config
├── pages/            # Un componente por ruta
├── components/seo/   # PageMetaTags reutilizable
└── lib/navigation.ts # Helpers para preservar query params
```

## Ejemplo

- Plan: PLAN-NOVUS-LOVABLE-2026-07-14 — mapeo CHG-001 a CHG-013
- Implementación: NovusIntelligenceWEB @ `cdd9f95` — 10 rutas, build OK

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Recomendación: KB-005 en `artifacts/recomendaciones-kb.json`
