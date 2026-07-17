<!-- NADF-GUIDE
Propósito: Documenta Error: DEVOPS-001.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Error: DEVOPS-001

## Síntoma

Fase 7 del plan (Infra/DevOps) incompleta: `pipeline-config.md` ausente. TASK-DEVOPS-001 no ejecutada por devops-agent. El workflow avanza a Validation con gap operativo.

## Causa

El workflow no tiene gate bloqueante explícito para documentación CI/CD. devops-agent omitido en la corrida mientras frontend, backend y cloud completaron sus tareas.

## Solución

1. devops-agent ejecuta TASK-DEVOPS-001: documentar pipeline CI con gates `no_lovable_code_copy` y `VITE_DEMO_MODE=false`.
2. Publicar `pipeline-config.md` en Blackboard del proyecto.

## Prevención

1. Añadir gate `devops_pipeline_documented` antes de Validation cuando `requires_infra: true`.
2. Incluir `pipeline-config.md` en checklist pre-handoff executor → validation.
3. Workflow improvement WF-001 documentado en `recomendaciones-kb.json`.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/resumen-ejecucion.md`, `artifacts/metricas-ejecucion.json`
- Agente responsable: devops-agent

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | ANTI-004 |
| Severidad | medium |
| Gate bloqueante | no (execution_completion) |
| Fecha | 2026-07-14 |
