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

El análisis estático de clases responsive **no valida** el gate `visual_exact_parity`. Cuando `visual_parity.enabled: true`, solo `visual-parity-agent` con checker Playwright+pixelmatch puede declarar PASS. Comparación manual en `resumen-frontend.md` produjo anti-patrón ANTI-VP-001 (0/12 capturas FAIL en corrida 2026-07-16).

## Ejemplo

novus-intelligence (2026-07-14): QA aceptó PASS responsive/SEO por análisis estático.
- Evidencia: `artifacts/informe-qa.md`, `artifacts/qa-result.json`.
- Limitación confirmada 2026-07-16: paridad visual requiere checker automatizado independiente.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-007, ANTI-VP-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | medium |
| Fecha | 2026-07-16 |
