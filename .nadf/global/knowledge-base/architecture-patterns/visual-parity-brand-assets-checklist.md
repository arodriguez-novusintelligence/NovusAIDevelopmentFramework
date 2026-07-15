# Patrón: Checklist assets de marca antes de visual-parity-agent

## Contexto

Workflows `lovable-to-web` con gate `visual_exact_parity` habilitado (ADR-0006). Aplica antes de activar visual-parity-agent en fase Validation cuando el plan incluye CHG-013 (assets de marca) o layout global con Header/Footer.

## Solución

Integrar assets de marca en el layout global **antes** de la primera corrida de paridad visual:

| # | Asset | Ubicación esperada | Verificación |
|---|-------|-------------------|--------------|
| 1 | Logo de marca | `public/assets/novus/logo.jpeg` referenciado en Header y Footer | Visible en capturas de rutas gate |
| 2 | Imagen OG | Configurada en `PageMetaTags` / Helmet por ruta | Meta tag presente en build |
| 3 | Favicon | `public/favicon.ico` o equivalente | Referenciado en `index.html` |
| 4 | Assets publicitarios | `public/assets/novus/brand-publicidad.png` si aplica en landing | Referenciado en secciones correspondientes |

Incluir este checklist en Fase 1 del plan (CHG-013) como **prerequisito de Validation paso 12**, no como tarea post-paridad.

## Ejemplo

Corrida novus-intelligence (2026-07-15):
- GAP-P0-001: logo no integrado en Header/Footer amplificó diff global en 12/12 capturas.
- maxDiffRatio global 0,486653 en `/contact` @ 390×844; assets ausentes contribuyeron al fallo antes de evaluar layout por ruta.
- Evidencia: `artifacts/resumen-metricas.md`, `artifacts/resumen-ejecucion.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006 (visual parity and auto-dev-deploy)
- `project-context.yml` → `visual_parity.routes`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-008, ANTI-007, GAP-P0-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
