# Patrón: Paridad tipográfica Space Grotesk / Inter

## Contexto

Workflows `lovable-to-web` donde Lovable y el frontend productivo usan las mismas familias tipográficas (Space Grotesk para display, Inter para body) pero difieren en métricas renderizadas (tracking, line-height, peso, font-feature-settings). El gate `visual_exact_parity` detecta diff transversal en headlines, navegación y hero aunque las fuentes estén «correctamente» importadas.

## Solución

Auditar y alinear entre referencia Lovable y WEB:

| Área | Qué verificar |
|------|---------------|
| Carga de fuentes | `@font-face` vs Google Fonts; `font-display`; subset y pesos cargados |
| Métricas | `letter-spacing`, `line-height`, `font-weight` en Header, Hero y títulos |
| Features | `font-feature-settings`, `font-variant-numeric` si aplica |
| Tailwind | Clases `font-display`, `tracking-*`, `leading-*` equivalentes a tokens Lovable |

Validar con capturas en 1440×900 (desktop) y 390×844 (móvil) antes de merge.

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-15):
- Gap **VP-GAP-TYPO** afectó 4 rutas gate.
- Diff visible en headlines y nav; QA estático PASS no lo detectó.
- Evidencia: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `architecture-patterns/visual-parity-pre-merge-checklist.md`
- `architecture-patterns/static-qa-responsive-seo.md` (limitación QA estático)

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-010 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
