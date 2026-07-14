# Error: VP-001

## Síntoma

Gate `visual_exact_parity` permanece en estado `pending`. `visual-parity-result.json` ausente en Blackboard aunque el código frontend haya sido remediado manualmente para mejorar paridad visual.

## Causa

Anti-patrón «remediación visual sin artefacto formal»: frontend-integration-agent o intervención manual corrige estilos/layout sin ejecutar visual-parity-agent para generar comparación documentada Lovable vs productivo.

## Solución

1. Ejecutar visual-parity-agent en rutas y viewports definidos en `project-context.yml`.
2. Publicar `visual-parity-result.json` con métricas `diff_ratio` por ruta/viewport.
3. Si `diff_ratio > 0.002`, iterar remediación y re-ejecutar comparación formal.
4. Solo entonces marcar gate `visual_exact_parity` como PASS.

## Prevención

1. Incluir `visual-parity-result.json` en checklist pre-handoff executor → validation.
2. No cerrar paso-12-paridad-visual sin artefacto formal (WF-003).
3. Separar remediación visual (frontend) de validación formal (visual-parity-agent).

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/metricas-ejecucion.json`, `artifacts/resumen-metricas.md`, `artifacts/reflexion-ejecucion.md`
- Agente responsable: visual-parity-agent

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-006, KB-008, VP-001 |
| Severidad | high |
| Gate bloqueante | visual_exact_parity |
| Fecha | 2026-07-14 |
