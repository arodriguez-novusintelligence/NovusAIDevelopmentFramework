# Comando: novus-lovable-sync

## Descripción

Comando reutilizable para ejecutar el workflow multiagente de **15 pasos** que sincroniza cambios Lovable → stack productivo para Novus Intelligence Solutions.

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
| `--dry-run` | `false` | Solo Planning (pasos 1-3), sin Execution |

## Workflow invocado

`.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml`

Extiende: `.nadf/global/workflow-library/lovable-to-web.yml`

## Precondiciones

1. `project-context.yml` completo con sección `multiagent`
2. Repositorio `novus-nexus` accesible (MCP GitHub)
3. Repositorios productivos accesibles para fase Execution
4. Reglas del proyecto en `.nadf/projects/novus-intelligence/rules/`

## Modelo de 9 fases

| Fase | Pasos |
|------|-------|
| Event Trigger | Clasificación evento |
| Planning | 1, 2, 5 |
| Plan Review | 3 |
| Execution | 4, 6, 7, 8 |
| Validation | 9, 10 |
| Documentation | 11 |
| Metrics | 12 |
| Reflection | 13 |
| Knowledge Base Update | 14, 15 |

## Pasos de ejecución (15)

### Paso 1: Analizar Lovable
- **Agente:** `lovable-analyzer-agent` (Event Driven)
- **Salidas:** cambios-lovable.json, frontend-impact.md, backend-impact.md, riesgos.md

### Paso 2: Generar plan
- **Agente:** `planner-agent` (Planner)
- **Salidas:** plan-implementacion.md, tareas-ejecutor.json

### Paso 3: Validar arquitectura
- **Agente:** `architect-agent` (Planner)
- **Salidas:** impacto-arquitectonico.md, plan status approved/rejected

### Paso 4: Implementar frontend
- **Agente:** `frontend-integration-agent` (Executor)
- **Condición:** plan approved + cambios frontend
- **Salidas:** NovusIntelligenceWEB/**, resumen-frontend.md

### Paso 5: Evaluar backend
- **Agente:** `backend-impact-agent` (Planner)
- **Salidas:** evaluacion-backend.md, especificacion-backend.md

### Paso 6: Implementar backend (condicional)
- **Agente:** `backend-agent` (Executor)
- **Condición:** requires_backend == true
- **Salidas:** NovusIntelligenceBack/**, resumen-backend.md

### Paso 7: Diseño database (condicional)
- **Agente:** `database-agent` (Executor)
- **Condición:** requires_database == true
- **Salidas:** especificacion-database.md, resumen-database.md

### Paso 8: Propuesta infra (condicional)
- **Agente:** `cloud-agent` (Executor)
- **Condición:** requires_infra == true
- **Salidas:** propuesta-infra.md, resumen-cloud.md

### Paso 9: Validar QA
- **Agente:** `qa-agent` (Validator)
- **Salidas:** informe-qa.md, qa-result.json

### Paso 10: Revisión seguridad
- **Agente:** `security-agent` (Validator)
- **Salidas:** informe-seguridad.md, security-result.json

### Paso 11: Documentar
- **Agente:** `documentation-agent` (Blackboard)
- **Salidas:** resumen-ejecucion.md, decision-log.md

### Paso 12: Registrar métricas
- **Agente:** `metrics-agent` (Blackboard)
- **Salidas:** metricas-ejecucion.json, resumen-metricas.md

### Paso 13: Reflexión
- **Agente:** `reflection-agent` (Reflection)
- **Salidas:** reflexion-ejecucion.md, recomendaciones-kb.json

### Paso 14: Actualizar Knowledge Base
- **Agente:** `knowledge-base-agent` (Blackboard)
- **Salidas:** actualizacion-kb.md, entradas en knowledge-base/

### Paso 15: Registrar ADRs
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

## Salida esperada

```
✓ Paso 1-3: Planning completado (plan: approved/rejected)
✓ Paso 4: Frontend implementado | ⊘ Omitido
✓ Paso 5-8: Backend/DB/Infra evaluado e implementado | ⊘ Omitido
✓ Paso 9-10: QA PASS/FAIL | Security PASS/FAIL
✓ Paso 11-15: Docs, métricas, reflexión, KB, ADR
→ PR listo para Cursor Review
```

## Manejo de errores

| Error | Acción |
|-------|--------|
| Plan rejected (paso 3) | Detener antes de Execution |
| QA/Security FAIL crítico | Bloquear workflow |
| `--dry-run` | Detener tras paso 3 |
| Riesgo alto (paso 1) | Pausar para revisión humana |

## Métricas

- `workflowId`: `novus-intelligence-lovable-to-web`
- Incluir: phase, pattern, reflectionSummary, mcpServersUsed

## Referencias

- Workflow: `.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml`
- [Integración Lovable](../docs/lovable-integration.md)
- [Multiagent architecture](../docs/multiagent-architecture.md)
- ADR-0002
