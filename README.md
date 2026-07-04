# NovusAIDevelopmentFramework (NADF)

## ¿Qué es NADF?

**NovusAIDevelopmentFramework** es el marco operativo de Novus Intelligence para automatizar el desarrollo de software mediante **agentes de IA especializados** coordinados por patrones arquitectónicos multiagente (Planner, Executor, Validator, Mediator, Blackboard, Event Driven, Reflection).

NADF **no es código productivo** ni es Cursor, Claude Code o Lovable. Es la capa de gobernanza, workflows declarativos, skill registry y conocimiento compartido que guía a los motores de ejecución.

Ver [docs/multiagent-architecture.md](docs/multiagent-architecture.md).

## Objetivo

Automatizar el ciclo de desarrollo con agentes IA, manteniendo:

- **Separación planificación / ejecución / validación**
- **Comunicación mediada** (Orquestador + Blackboard)
- **Integración MCP** con GitHub, AWS, DB, Terraform, Jira
- Calidad verificable mediante gates en cada fase
- Trazabilidad via ADRs, métricas y reflexión
- Independencia de proveedor de nube e IA

## Proyecto inicial

**Novus Intelligence Solutions** — flujo Lovable → Web de 15 pasos multiagente.

## Repositorios

| Rol | Repositorio |
|-----|-------------|
| Framework | NovusAIDevelopmentFramework |
| Diseño | novus-nexus (Lovable) |
| Frontend | NovusIntelligenceWEB |
| Backend | NovusIntelligenceBack |

## Flujo multiagente

```
Lovable → GitHub → Orquestador → Planning → Execution → Validation
→ Knowledge → PR → Cursor Review → Deployment (aprobado)
```

## 7 capas arquitectónicas

1. Design Source — 2. Planning — 3. Execution — 4. Validation — 5. Knowledge — 6. Tooling (MCP) — 7. Runtime

Detalle: [docs/architecture.md](docs/architecture.md)

## 19 agentes

Planner, Architect, Workflow, Lovable Analyzer, Frontend, Backend Impact, Backend, Database, Cloud, DevOps, QA, Security, Reviewer, Documentation, Metrics, Knowledge Base, ADR, Reflection, Framework Architect.

Catálogo: [docs/agent-model.md](docs/agent-model.md)

## Estructura del framework

```
NovusAIDevelopmentFramework/
├── CLAUDE.md
├── docs/                    # Incluye multiagent-architecture.md, agent-patterns.md, mcp-integration.md
├── .claude/agents/          # 19 definiciones de agentes
├── .claude/commands/
└── .nadf/
    ├── global/
    │   ├── skill-registry/  # YAML por agente
    │   ├── workflow-library/ # 8 workflows, modelo 9 fases
    │   ├── decision-history/adr/
    │   └── metrics/
    └── projects/
```

## Cómo empezar

1. Leer `CLAUDE.md` y `docs/multiagent-architecture.md`
2. Revisar `.nadf/projects/novus-intelligence/project-context.yml`
3. Ejecutar `novus-lovable-sync` (15 pasos)
4. Consultar `docs/project-onboarding.md` para nuevos proyectos

## Principios fundamentales

- Lovable es intención, no código productivo
- Planner no codea; Executor no cambia arquitectura sin ADR
- Validators no modifican lógica sin autorización
- Todo acceso externo vía MCP cuando aplique
- Sin mocks en producción; sin deploy sin aprobación; sin secrets en código
- Toda decisión arquitectónica → ADR; todo aprendizaje reutilizable → Knowledge Base

## Licencia

Framework propietario de Novus Intelligence. Uso interno exclusivo.
