# Comando: novus-lovable-sync

## Descripción

Comando reutilizable para ejecutar el workflow multiagente de **18 pasos** que sincroniza cambios Lovable → stack productivo para Novus Intelligence Solutions.

**Evento disparador:** Cambio detectado en `novus-nexus` (`lovable.commit`)

## Uso

```
Ejecutar novus-lovable-sync [--desde=<commit|fecha>] [--scope=<all|visual|functional>] [--dry-run]
```

## Parámetros

| Parámetro | Default | Descripción |
|-----------|---------|-------------|
| `--desde` | último sync | Commit o fecha desde la cual analizar cambios |
| `--scope` | `all` | Alcance: all, visual, functional, content |
| `--dry-run` | `false` | Solo Planning + Plan Review (pasos 1-6), sin Execution |

## Workflow invocado

`.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml`

Extiende (canónico): `.nadf/global/workflow-library/lovable-to-web.yml`

Referencia: ADR-0003

## Precondiciones

1. `project-context.yml` completo con sección `multiagent`
2. Repositorio `novus-nexus` accesible (MCP GitHub)
3. Repositorios productivos accesibles para fase Execution
4. Reglas del proyecto en `.nadf/projects/novus-intelligence/rules/`

## Modelo de 9 fases

| Fase | Pasos |
|------|-------|
| Event Trigger | 1, 2 |
| Planning | 3, 4, 5 |
| Plan Review | 6 |
| Execution | 7, 8, 9, 10 |
| Validation | 11, 12, 13 |
| Documentation | 14 |
| Metrics | 15 |
| Reflection | 16 |
| Knowledge Base Update | 17, 18 |

## Pasos de ejecución (18)

### Paso 1: Clasificar evento
- **Agente:** `workflow-agent` (Event Driven)
- **Salidas:** evento-clasificado.json, plan-workflow.md

### Paso 2: Cargar contexto
- **Agente:** null (operador/orquestador manual)
- **Salidas:** contexto-cargado (project-context, reglas, memoria)

### Paso 3: Analizar Lovable
- **Agente:** `lovable-analyzer-agent` (Planner)
- **Salidas:** cambios-lovable.json, frontend-impact.md, backend-impact.md, riesgos.md

### Paso 4: Generar plan
- **Agente:** `planner-agent` (Planner)
- **Salidas:** plan-implementacion.md, tareas-ejecutor.json

### Paso 5: Evaluar backend impacto
- **Agente:** `backend-impact-agent` (Planner)
- **Salidas:** evaluacion-backend.md, especificacion-backend.md
- **Nota:** Debe completarse **antes** de Plan Review y **antes** de Execution

### Paso 6: Revisar plan (Plan Review)
- **Agente:** `architect-agent` (Planner)
- **Inputs:** plan-implementacion.md, evaluacion-backend.md
- **Salidas:** impacto-arquitectonico.md, plan status approved/rejected

### Paso 7: Implementar frontend
- **Agente:** `frontend-integration-agent` (Executor)
- **Condición:** plan approved + cambios frontend
- **Salidas:** NovusIntelligenceWEB/**, resumen-frontend.md

### Paso 8: Implementar backend (condicional)
- **Agente:** `backend-agent` (Executor)
- **Condición:** requires_backend == true
- **Salidas:** NovusIntelligenceBack/**, resumen-backend.md

### Paso 9: Diseño database (condicional)
- **Agente:** `database-agent` (Executor)
- **Condición:** requires_database == true
- **Salidas:** especificacion-database.md, resumen-database.md

### Paso 10: Propuesta infra (condicional)
- **Agente:** `cloud-agent` (Executor)
- **Condición:** requires_infra == true
- **Salidas:** propuesta-infra.md, resumen-cloud.md

### Paso 11: Validar QA
- **Agente:** `qa-agent` (Validator)
- **Salidas:** informe-qa.md, qa-result.json

### Paso 12: Revisión seguridad
- **Agente:** `security-agent` (Validator)
- **Salidas:** informe-seguridad.md, security-result.json

### Paso 13: Revisión coherencia
- **Agente:** `reviewer-agent` (Validator)
- **Salidas:** informe-revision.md, checklist-cursor-review.md

### Paso 14: Documentar
- **Agente:** `documentation-agent` (Blackboard)
- **Salidas:** resumen-ejecucion.md, decision-log.md

### Paso 15: Registrar métricas
- **Agente:** `metrics-agent` (Blackboard)
- **Salidas:** metricas-ejecucion.json, resumen-metricas.md

### Paso 16: Reflexión
- **Agente:** `reflection-agent` (Reflection)
- **Salidas:** reflexion-ejecucion.md, recomendaciones-kb.json

### Paso 17: Actualizar Knowledge Base
- **Agente:** `knowledge-base-agent` (Blackboard)
- **Salidas:** actualizacion-kb.md, entradas en knowledge-base/

### Paso 18: Registrar ADRs
- **Agente:** `adr-agent` (Blackboard)
- **Salidas:** registro-adr.md, ADR-NNNN-*.md si aplica

## Quality gates finales

- [ ] `plan_approved`
- [ ] `no_lovable_code_copy`
- [ ] `no_mock_data_in_production`
- [ ] `build_success`
- [ ] `responsive_validation`
- [ ] `seo_basic_validation`
- [ ] `security_pass`
- [ ] `metrics_registered`
- [ ] `reflection_generated`
- [ ] `adr_if_architectural`

## Salida esperada

```
✓ Paso 1-2: Event Trigger completado
✓ Paso 3-5: Planning completado (incl. evaluación backend)
✓ Paso 6: Plan Review (plan: approved/rejected)
✓ Paso 7: Frontend implementado | ⊘ Omitido
✓ Paso 8-10: Backend/DB/Infra implementado | ⊘ Omitido
✓ Paso 11-13: QA PASS/FAIL | Security PASS/FAIL | Reviewer PASS/FAIL
✓ Paso 14-18: Docs, métricas, reflexión, KB, ADR
→ PR listo para Cursor Review
```

## Manejo de errores

| Error | Acción |
|-------|--------|
| Plan rejected (paso 6) | Detener antes de Execution |
| QA/Security/Reviewer FAIL crítico | Bloquear workflow |
| `--dry-run` | Detener tras paso 6 |
| Riesgo alto (paso 3) | Pausar para revisión humana |

## Métricas

- `workflowId`: `novus-intelligence-lovable-to-web`
- Incluir: phase, pattern, reflectionSummary, mcpServersUsed

## Referencias

- Workflow canónico: `.nadf/global/workflow-library/lovable-to-web.yml`
- Workflow proyecto: `.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml`
- [Integración Lovable](../docs/lovable-integration.md)
- [Multiagent architecture](../docs/multiagent-architecture.md)
- ADR-0002, ADR-0003
