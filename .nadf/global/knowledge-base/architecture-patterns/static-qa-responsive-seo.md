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

> **No sustituye paridad visual.** El gate `visual_exact_parity` (threshold 0.2 %) requiere visual-parity-agent y capturas pixel-a-pixel. QA estático puede PASS mientras paridad visual falla al 100 %. Ver `visual-exact-parity-gate.md`.

## Ejemplo

novus-intelligence (2026-07-15): QA PASS responsive/SEO por análisis estático; paridad visual FAIL (0/12 capturas).
- Evidencia: `artifacts/informe-qa.md`, `artifacts/visual-parity-result.json`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-007, KB-012 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | medium |
| Fecha | 2026-07-15 (actualizado) |
