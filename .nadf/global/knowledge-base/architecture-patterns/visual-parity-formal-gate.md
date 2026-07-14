# Patrón: Gate visual_exact_parity con artefacto formal

## Contexto

Workflows `lovable-to-web` con gate `visual_exact_parity` habilitado (`project-context.yml` → `visual_parity.enabled: true`). Aplica cuando visual-parity-agent compara rutas productivas contra referencia Lovable y el umbral `threshold_max_diff_ratio` es bloqueante.

## Solución

1. **Remediación manual no cierra el gate.** Mejoras visuales en frontend-integration-agent no sustituyen la comparación formal documentada.
2. **Ejecutar visual-parity-agent** tras cualquier remediación visual, en rutas y viewports definidos en `project-context.yml`:
   - Rutas: `/`, `/about`, `/services`, `/contact`
   - Viewports: `1440x900`, `768x1024`, `390x844`
3. **Publicar `visual-parity-result.json`** con `diff_ratio ≤ 0.002` por ruta/viewport.
4. **No avanzar a reviewer-agent** con gate `visual_exact_parity` en estado `pending`.
5. **Bloquear cierre de paso-12-paridad-visual** sin artefacto formal (WF-003 en `recomendaciones-kb.json`).

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- Remediación manual de paridad en rama `cursor/visual-parity-novus-frontend-9ec7`.
- `visual-parity-result.json` ausente → gate VP-001 pendiente, workflow blocked.
- Evidencia: `artifacts/metricas-ejecucion.json`, `artifacts/resumen-metricas.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006 (visual parity y auto-deploy DEV)
- `.nadf/projects/novus-intelligence/project-context.yml` → `visual_parity`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-008, ANTI-006, VP-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
