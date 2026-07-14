# Error: VP-002

## Síntoma

`resumen-frontend.md` declara fases frontend completas o remediación terminada, pero `visual-parity-agent` reporta FAIL (0/N capturas PASS). El handoff executor → validator queda incompleto y `reviewer-agent` queda bloqueado.

## Causa

Cuando `visual_exact_parity` está habilitado (ADR-0006), el executor marca la fase como completa basándose en build/lint exitosos o análisis estático, sin evidencia de comparación visual objetiva. El análisis estático de QA (responsive/SEO) no sustituye pixel-diff.

## Solución

1. No marcar fases 0–N como completas en `resumen-frontend.md` sin resultado de `visual-parity-agent`.
2. Incluir `visual-parity-result.json` en Blackboard o declarar explícitamente «paridad visual pendiente».
3. Ejecutar `visual-parity-agent` antes de activar `reviewer-agent`.
4. Si FAIL: remediar según `gaps-paridad.json` y re-ejecutar paridad.

## Prevención

1. Añadir criterio de aceptación en `tareas-ejecutor.json`: PASS de `visual_exact_parity` o estado explícito `parity_pending`.
2. Incluir en checklist pre-handoff (KB-004, ítem 6): ejecutar visual-parity-agent si gate habilitado.
3. Workflow improvement WF-003: visual-parity antes de declarar frontend completo.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/resumen-frontend.md`, `artifacts/visual-parity-result.json`, `artifacts/informe-paridad-visual.md`
- Agente responsable: frontend-integration-agent
- Estado: **activo** (pendiente remediación VP-001)

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-009, ANTI-007 |
| Severidad | high |
| Gate bloqueante | visual_exact_parity (indirecto → reviewer_validation) |
| Fecha | 2026-07-14 |
| Estado | active |
