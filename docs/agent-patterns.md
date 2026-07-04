# Patrones de agentes NADF

## Visión general

Cada agente NADF adopta uno o más patrones arquitectónicos que definen sus permisos, artefactos y restricciones. Los patrones garantizan separación de responsabilidades y evitan que un agente asuma roles fuera de su alcance.

## Planner Pattern

**Agentes:** Planner Agent, Architect Agent, Workflow Agent (parcial), Backend Impact Agent (evaluación)

**Propósito:** Analizar, diseñar y planificar sin modificar código productivo.

| Puede hacer | Prohibido |
|-------------|-----------|
| Generar planes de implementación | Modificar repos productivos |
| Evaluar impacto arquitectónico | Desplegar |
| Proponer cambios de diseño | Crear secrets |
| Documentar decisiones preliminares | Ejecutar código en runtime |

**Artefactos típicos:** `plan-implementacion.md`, `impacto-arquitectonico.md`, `evaluacion-backend.md`

## Executor Pattern

**Agentes:** Frontend Integration, Backend, Database, Cloud, DevOps

**Propósito:** Ejecutar planes aprobados en repositorios productivos o generar propuestas de infraestructura.

| Puede hacer | Prohibido |
|-------------|-----------|
| Implementar código según plan aprobado | Cambiar arquitectura sin ADR |
| Generar IaC o propuestas cloud | Desplegar sin aprobación |
| Modificar schemas de BD (con plan) | Copiar código Lovable |
| Crear PRs y commits | Ignorar quality gates |

**Artefactos típicos:** código en repos productivos, `resumen-frontend.md`, `especificacion-backend.md`, `propuesta-infra.md`

## Validator Pattern

**Agentes:** QA Agent, Security Agent, Reviewer Agent

**Propósito:** Validar resultados y bloquear el workflow ante fallos críticos.

| Puede hacer | Prohibido |
|-------------|-----------|
| Ejecutar validaciones automatizadas | Modificar lógica productiva (salvo autorización) |
| Generar informes pass/fail | Desplegar |
| Bloquear workflow en gates críticos | Omitir gates definidos |
| Calcular qualityScore | Corregir errores sin escalar |

**Artefactos típicos:** `informe-qa.md`, `informe-seguridad.md`, `informe-revision.md`, `qa-result.json`

## Mediator Pattern

**Componente:** Orquestador (conceptual; no implementado en Fase 1)

**Propósito:** Coordinar agentes sin comunicación directa entre ellos.

- Recibe eventos y selecciona workflow
- Pasa artefactos entre agentes según el flujo YAML
- Aplica condiciones y ramificaciones
- Registra métricas por paso

Ver [orchestrator-pattern.md](orchestrator-pattern.md).

## Blackboard Pattern

**Agentes:** Knowledge Base, ADR, Metrics, Documentation, Memory Engine

**Propósito:** Espacio compartido y controlado para artefactos, decisiones, métricas y aprendizajes.

| Recurso compartido | Ubicación |
|--------------------|-----------|
| Knowledge Base | `.nadf/global/knowledge-base/` |
| ADRs | `.nadf/global/decision-history/adr/` |
| Memoria de proyecto | `.nadf/projects/<proyecto>/memory/` |
| Artefactos de workflow | `.nadf/projects/<proyecto>/artifacts/` |
| Skill Registry | `.nadf/global/skill-registry/` |
| Métricas | `.nadf/global/metrics/` |

Ver [blackboard-pattern.md](blackboard-pattern.md).

## Event Driven Pattern

**Disparadores típicos:**

- Cambio detectado en `novus-nexus` (Lovable)
- Apertura o actualización de PR
- Reporte de bug
- Solicitud de release
- Cambio de infraestructura

Ver [event-driven-workflows.md](event-driven-workflows.md).

## Reflection Pattern

**Agente:** Reflection Agent

**Propósito:** Tras cada ejecución, documentar qué se hizo, qué falló, qué se aprendió y qué patrones deben actualizarse en la knowledge base.

Ver [reflection-learning.md](reflection-learning.md).

## Matriz agente ↔ patrón ↔ capa

| Agente | Patrón | Capa |
|--------|--------|------|
| Planner Agent | Planner | Planning |
| Architect Agent | Planner | Planning |
| Workflow Agent | Event Driven | Planning |
| Lovable Analyzer | Event Driven | Design Source |
| Frontend Integration | Executor | Execution |
| Backend Impact | Planner | Planning |
| Backend Agent | Executor | Execution |
| Database Agent | Executor | Execution |
| Cloud Agent | Executor | Execution |
| DevOps Agent | Executor | Execution |
| QA Agent | Validator | Validation |
| Security Agent | Validator | Validation |
| Reviewer Agent | Validator | Validation |
| Documentation Agent | Blackboard | Knowledge |
| Metrics Agent | Blackboard | Knowledge |
| Knowledge Base Agent | Blackboard | Knowledge |
| ADR Agent | Blackboard | Knowledge |
| Reflection Agent | Reflection | Knowledge |
| Framework Architect | Mediator/Blackboard | Framework |

## Referencias

- Definiciones: `.claude/agents/`
- Skill registry: `.nadf/global/skill-registry/`
- [Arquitectura multiagente](multiagent-architecture.md)
