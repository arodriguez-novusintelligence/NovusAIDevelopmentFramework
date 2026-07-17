<!-- NADF-GUIDE
Propósito: Documenta Workflows orientados a eventos.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Workflows orientados a eventos

## Propósito

NADF adopta el **Event Driven Pattern**: los workflows se disparan por eventos observables en el ecosistema de desarrollo, no solo por invocación manual.

## Tipos de eventos

| Evento | Origen | Workflow típico |
|--------|--------|-----------------|
| `lovable.commit` | Cambio en novus-nexus | `lovable-to-web` |
| `github.pr.opened` | Pull request creado | `qa-validation`, `security-review` |
| `github.pr.updated` | Push a rama de PR | `qa-validation` |
| `jira.bug.reported` | Ticket de bug | `fix-bug` |
| `release.requested` | Solicitud de release | `cloud-deployment` |
| `infra.change` | Cambio Terraform/IaC | `cloud-deployment`, `security-review` |
| `workflow.completed` | Fin de workflow de implementación | `reflection-learning` |
| `project.onboard` | Nuevo proyecto | `create-project` |

## Modelo de evento

```yaml
event:
  id: evt-uuid
  type: lovable.commit
  source: novus-nexus
  timestamp: "2026-07-04T12:00:00Z"
  payload:
    repository: novus-nexus
    ref: main
    commit_sha: abc123
  project: novus-intelligence
```

## Workflow Agent

El **Workflow Agent** (Planning Layer) selecciona y parametriza el workflow según el evento recibido:

1. Clasificar tipo de evento
2. Resolver proyecto desde `project-context.yml`
3. Seleccionar workflow de `.nadf/global/workflow-library/` o proyecto
4. Inyectar parámetros (commit, scope, severidad)
5. Entregar plan de ejecución al Orquestador

## Integración con MCP

Eventos pueden originarse vía servidores MCP:

- **GitHub MCP:** webhooks de push, PR, issues
- **Jira MCP:** creación/actualización de tickets
- **AWS MCP:** cambios de infra detectados

## Fases post-evento

Tras el evento inicial, todo workflow sigue el modelo estándar de 9 fases (ver [planning-execution-validation.md](planning-execution-validation.md)).

## Event chaining

Un workflow puede disparar otro:

```
lovable-to-web (completed) → reflection-learning
fix-bug (completed) → qa-validation
cloud-deployment (requested) → security-review → cloud-deployment (execution)
```

## Referencias

- [Orquestador](orchestrator-pattern.md)
- Workflow library: `.nadf/global/workflow-library/`
- [Workflow model](workflow-model.md)
