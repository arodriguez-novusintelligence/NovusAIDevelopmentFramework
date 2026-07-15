# Patrón: Validación responsive/SEO por análisis estático (Cloud Agent)

## Contexto

Ejecución de qa-agent en entornos sin browser automation (Cursor Cloud Agent). El gate `responsive_validation` y `seo_basic_validation` pueden evaluarse por revisión de código cuando se documenta la limitación explícitamente.

## Solución

Verificar en código fuente:

| Área | Qué revisar |
|------|-------------|
| Responsive | Clases Tailwind `sm:`, `md:`, `lg:`; menú móvil; `prefers-reduced-motion` |
| SEO | Un `<h1>` por página; `PageMetaTags` con `title`, `description`, `og:*` |
| Accesibilidad básica | `aria-*` en navegación; labels en formularios |

Registrar en `qa-result.json`:
- `method: static_code_review`
- Limitación declarada: sin prueba en viewport real ni Lighthouse.

### Limitación crítica: no sustituye paridad visual

El análisis estático de clases Tailwind **no detecta** diff pixel en layout móvil. En novus-intelligence (2026-07-15), QA PASS y `responsive_validation` PASS coexistieron con `visual_exact_parity` FAIL (diff 9,6 % en hero móvil 390×844).

**Complementar obligatoriamente** con `visual-parity-agent` cuando `visual_parity.enabled: true` (ADR-0006). Ver `architecture-patterns/visual-parity-pre-merge-checklist.md` y anti-patrón ANTI-003 en `reflexion-ejecucion.md`.

## Ejemplo

novus-intelligence (2026-07-14 → 2026-07-15): QA aceptó PASS responsive/SEO por análisis estático; paridad visual requirió agente dedicado.
- Evidencia: `artifacts/informe-qa.md`, `artifacts/qa-result.json`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-007, ANTI-003, WF-004 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | medium |
| Fecha | 2026-07-14 |
| Última actualización | 2026-07-15 |
