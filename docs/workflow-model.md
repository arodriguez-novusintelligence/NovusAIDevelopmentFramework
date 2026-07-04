# Modelo de workflows NADF

## Concepto

Un **workflow NADF** es una secuencia ordenada de pasos que coordina agentes especializados siguiendo el **modelo multiagente de 9 fases**. Los workflows se definen en YAML, son versionados, reutilizables y pueden dispararse por eventos.

Ver [event-driven-workflows.md](event-driven-workflows.md) y [orchestrator-pattern.md](orchestrator-pattern.md).

## Modelo de 9 fases (obligatorio)

Todo workflow de implementación debe incluir estas fases:

| # | Fase | Agentes típicos |
|---|------|-----------------|
| 1 | Event Trigger | Workflow Agent |
| 2 | Planning | Lovable Analyzer, Planner, Backend Impact |
| 3 | Plan Review | Architect Agent |
| 4 | Execution | Frontend, Backend, Database, Cloud, DevOps |
| 5 | Validation | QA, Security, Reviewer |
| 6 | Documentation | Documentation Agent |
| 7 | Metrics | Metrics Agent |
| 8 | Reflection | Reflection Agent |
| 9 | Knowledge Base Update | Knowledge Base Agent, ADR Agent |

## Ubicaciones

| Tipo | Ruta | Alcance |
|------|------|---------|
| Global | `.nadf/global/workflow-library/` | Reutilizable en cualquier proyecto |
| Proyecto | `.nadf/projects/<proyecto>/workflows/` | Específico del proyecto |

## Anatomía de un workflow YAML

```yaml
id: identificador-unico
name: Nombre descriptivo
version: "2.0.0"
description: Qué hace este workflow
project: nombre-proyecto | "*"
triggers:
  - manual
  - command:nombre-comando
  - event:tipo.evento

model:
  phases:
    - event_trigger
    - planning
    - plan_review
    - execution
    - validation
    - documentation
    - metrics
    - reflection
    - knowledge_base_update

agents:
  - agent-id

steps:
  - id: paso-id
    phase: planning
    agent: agent-id
    action: descripcion
    conditions: [...]
    inputs: [...]
    outputs: [...]

quality_gates:
  - gate-id

metrics:
  enabled: true
  schema: metrics-schema.json
```

## Workflows globales disponibles

| ID | Archivo | Descripción |
|----|---------|-------------|
| lovable-to-web | `lovable-to-web.yml` | Sincronizar Lovable al stack productivo |
| create-project | `create-project.yml` | Incorporar proyecto a NADF |
| modify-feature | `modify-feature.yml` | Modificar funcionalidad |
| fix-bug | `fix-bug.yml` | Corregir bug |
| cloud-deployment | `cloud-deployment.yml` | Preparar despliegue cloud |
| security-review | `security-review.yml` | Revisión de seguridad |
| qa-validation | `qa-validation.yml` | Validación QA independiente |
| reflection-learning | `reflection-learning.yml` | Reflexión y KB post-workflow |

## Workflow de proyecto: novus-intelligence

`lovable-to-web.yml` — **15 pasos** ante evento `lovable.commit` en novus-nexus:

1. Lovable Analyzer → 2. Planner → 3. Architect → 4. Frontend → 5. Backend Impact → 6. Backend (cond.) → 7. Database (cond.) → 8. Cloud (cond.) → 9. QA → 10. Security → 11. Documentation → 12. Metrics → 13. Reflection → 14. KB → 15. ADR

## Flujo de ejecución

```mermaid
sequenceDiagram
    participant E as Evento
    participant O as Orquestador
    participant P as Planning
    participant X as Execution
    participant V as Validation
    participant K as Knowledge

    E->>O: Disparar workflow
    O->>P: Fases 1-3
    P->>O: Plan aprobado
    O->>X: Fase 4
    X->>O: Implementación
    O->>V: Fase 5
    V->>O: Pass/Fail
    O->>K: Fases 6-9
    K-->>O: Artefactos + métricas
```

## Quality gates en workflows

Gates estándar:

- `plan_approved` — Plan aprobado por Architect Agent
- `no_lovable_code_copy` — Sin copia Lovable
- `no_mock_data_in_production` — Sin mocks en prod
- `build_success` — Build exitoso
- `responsive_validation` — Responsive OK
- `seo_basic_validation` — SEO básico OK
- `security_pass` — Security Agent pass

Un gate crítico fallido **bloquea** el workflow.

## Condiciones y ramificaciones

```yaml
- id: implementar-backend
  agent: backend-agent
  conditions:
    - evaluacion-backend.md:requires_backend == true
    - plan-implementacion.md:status == approved
```

## Comandos asociados

| Comando | Workflow |
|---------|----------|
| `novus-lovable-sync` | novus-intelligence/lovable-to-web (15 pasos) |
| `setup-project-context` | create-project |

## Métricas

Cada ejecución registra métricas según `metrics-schema.json`, incluyendo campos de reflexión: `reflectionSummary`, `patternsIdentified`, `failuresDocumented`, `kbUpdatesRecommended`.

## Principios

1. **Workflows declarativos** — Orquestación en YAML, no código productivo.
2. **Separación de fases** — Planning ≠ Execution ≠ Validation.
3. **Trazabilidad** — Cada paso genera artefactos en Blackboard.
4. **Event-driven** — Triggers por eventos del ecosistema.
5. **Extensibilidad** — Nuevos workflows sin modificar existentes.

## Referencias

- Workflow library: `.nadf/global/workflow-library/`
- Proyecto novus-intelligence: `.nadf/projects/novus-intelligence/workflows/`
- [Planificación, ejecución y validación](planning-execution-validation.md)
