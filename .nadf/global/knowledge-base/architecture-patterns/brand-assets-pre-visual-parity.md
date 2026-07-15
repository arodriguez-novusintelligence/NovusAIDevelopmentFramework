# Patrón: Checklist assets de marca antes de visual-parity-agent

## Contexto

Workflows `lovable-to-web` con gate `visual_exact_parity` bloqueante. Los assets de marca (logo, favicon, OG image) deben estar conectados en layout antes de activar paridad visual; de lo contrario, el gate falla transversalmente en todas las rutas.

## Solución

Verificar como prerequisito de handoff frontend → visual-parity-agent:

| # | Verificación | Criterio de aceptación |
|---|--------------|------------------------|
| 1 | Logo en `public/assets/novus/` | `logo.jpeg` accesible vía URL pública |
| 2 | Header renderiza logo real | Sin placeholder (checkmark, icono genérico) |
| 3 | Footer renderiza logo real | Mismo asset que Header |
| 4 | Alt text configurado | Accesibilidad y SEO básico |
| 5 | OG image | `brand-publicidad.png` referenciado en meta tags |

**Bloquear handoff** si cualquier item falla. Incluir en planning (CHG-013) y en `tareas-ejecutor.json` como tarea explícita antes de Fase 9 (Validación).

## Ejemplo

Corrida novus-intelligence (2026-07-15):
- GAP-P0-001: logo placeholder en Header/Footer en 4 rutas × 3 viewports.
- maxDiffRatio ~18 % incluso sin otros gaps de tema.
- Evidencia: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006 (paridad visual y auto-deploy DEV)
- `.nadf/projects/novus-intelligence/rules/visual-parity-rules.md`
- Workflow improvement WF-001 (`brand_assets_wired`)

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-008, ANTI-002 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
