# Patrón: Checklist pre-paridad visual Lovable→Web

## Contexto

Workflows `lovable-to-web` con gate `visual_exact_parity` habilitado (ADR-0006). Aplica antes de ejecutar `visual-parity-agent` o declarar fase frontend completa. La reimplementación sin copia directa puede pasar gates de código (`no_lovable_code_copy`, `build_success`) y aun así fallar paridad pixel-a-pixel por desalineación de copy, tokens y layout.

## Solución

Antes del pixel-diff, sincronizar con la referencia Lovable (URL o build local fijada por `NADF_LOVABLE_REFERENCE_URL`):

| # | Área | Verificación |
|---|------|--------------|
| 1 | **Referencia fijada** | `NADF_LOVABLE_REFERENCE_URL` definida; commit alineado con baseline del plan |
| 2 | **Design tokens** | Colores oklch, gradientes, sombras glow, `grid-bg`, tipografías Space Grotesk/Inter |
| 3 | **Hero** | Headline, dual CTA (demo + simulación), stats strip, asset de marca con glow |
| 4 | **Partners** | Logos AWS/Azure/GCP y copy de infraestructura cloud |
| 5 | **Secciones landing** | ServicesGrid (5-col), SolutionsGrid (2×3), ImpactStats (iconos+texto), Testimonials (fondo claro), CTA |
| 6 | **Header/Footer** | Logo, indicador ruta activa (underline gradiente), footer 5 columnas con servicios/soluciones/legales |
| 7 | **About** | Hero 2-col, cards misión/visión/valores 3-col, CTA intermedia |
| 8 | **Services** | Hero copy, grid 5 pilares en fila desktop, CTA final |
| 9 | **Contact** | Layout 2-col, sidebar cards, proporciones formulario |
| 10 | **Contenido** | `src/content/` y copy alineados con intención visual de novus-nexus, no solo `brand-context.md` propio |

Usar `gaps-paridad.json` como checklist ejecutable. Umbral gate: `maxDiffRatio ≤ 0.002` en rutas y viewports configurados en `project-context.yml`.

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-14):
- QA y Security PASS tras remediación iterativa.
- Paridad visual FAIL: 0/12 capturas PASS; `maxDiffRatio: 0.234509` (117× sobre umbral).
- Gaps P0: Hero, Partners, secciones landing, Header/Footer, tokens, About, Services.
- Evidencia: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006 (visual parity gate)
- `project-context.yml` → `visual_parity.routes`, `visual_parity.viewports`
- `artifacts/gaps-paridad.json`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-008, PAT-008, ANTI-006, VP-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
| Estado | activo (VP-001 pendiente remediación) |
