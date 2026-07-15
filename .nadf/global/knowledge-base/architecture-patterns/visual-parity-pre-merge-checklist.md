# Patrón: Checklist paridad visual pre-merge

## Contexto

Workflows `lovable-to-web` con gate `visual_exact_parity` habilitado. Validar paridad visual solo post-merge a `main` es costoso: remediar tokens, tipografía y layout en rama principal retrasa reviewer-agent y deploy.

Aplica cuando `visual_parity.enabled: true` en `project-context.yml` y las rutas gate están definidas.

## Solución

### Secuencia recomendada

1. **Fase 0 — Tokens definidos.** Tras establecer design system (colores, tipografía, sombras), ejecutar captura piloto `visual-parity-check` en `/` @ 390×844.
2. **Umbral temprano.** Si `maxDiffRatio > threshold_max_diff_ratio` (p. ej. 0,002), corregir gaps P0 antes de layout completo y merge.
3. **Rutas gate completas.** Antes de merge, validar las rutas configuradas × viewports:
   - Rutas: `/`, `/about`, `/services`, `/contact`
   - Viewports: 1440×900, 768×1024, 390×844
4. **Re-validar tras cada gap P0.** Orden sugerido: tokens → tipografía → hero móvil → layout contacto → header móvil.

### Criterios de aceptación pre-merge

| Check | Responsable |
|-------|-------------|
| Captura piloto `/` @ 390×844 PASS | frontend-integration-agent |
| 12/12 capturas gate PASS | visual-parity-agent |
| `gaps-paridad.json` sin items P0 abiertos | visual-parity-agent |

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-15):
- Paridad validada post-merge → 0/12 capturas PASS; remediación en `main` requerida.
- Anti-patrón **ANTI-002** documentado; este checklist mitiga el riesgo en futuras corridas.
- Evidencia: `artifacts/informe-paridad-visual.md`, `artifacts/reflexion-ejecucion.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006
- `architecture-patterns/oklch-token-mapping-lovable-to-web.md`
- `architecture-patterns/visual-parity-remediation-flow.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-002, KB-009, WF-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
