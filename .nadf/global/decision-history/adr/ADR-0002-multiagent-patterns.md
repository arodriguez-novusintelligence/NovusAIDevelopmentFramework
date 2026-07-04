# ADR-0002: NADF adopta arquitectura multiagente basada en Planner, Executor, Validator, Mediator, Blackboard, Event Driven y Reflection Patterns

## Estado

Aceptado

## Fecha

2026-07-04

## Contexto

Tras la fundación de NADF (ADR-0001), el framework contaba con 6 agentes y una arquitectura en 6 capas orientada principalmente al flujo Lovable → Web. La evolución del ecosistema Novus Intelligence requiere:

- Separación formal entre planificación, ejecución y validación
- Integración estándar con servicios externos vía MCP
- Patrones arquitectónicos multiagente reconocidos (Mediator, Blackboard, etc.)
- Capacidad de disparar workflows por eventos (commits, PRs, bugs, releases)
- Aprendizaje acumulativo post-ejecución (Reflection Pattern)
- Agentes especializados para backend, base de datos, cloud, DevOps, seguridad y métricas

## Decisión

NADF adopta formalmente una **arquitectura multiagente** con los siguientes elementos:

### 1. Siete capas arquitectónicas

1. Design Source Layer (Lovable, novus-nexus)
2. Planning Layer (Planner, Architect, Workflow)
3. Execution Layer (Frontend, Backend, Database, Cloud, DevOps)
4. Validation Layer (QA, Security, Reviewer)
5. Knowledge Layer (KB, ADR, Memory, Metrics, Skill Registry)
6. Tooling Layer (MCP: GitHub, AWS, Database, Terraform, Jira, Docker/K8s)
7. Runtime Layer (Hosting, APIs, DB, Storage, Auth, Observability)

### 2. Siete patrones arquitectónicos

| Patrón | Aplicación |
|--------|------------|
| Planner | Agentes que analizan y diseñan sin modificar código |
| Executor | Agentes que implementan planes aprobados |
| Validator | Agentes que validan y bloquean en fallos |
| Mediator | Orquestador coordina agentes sin comunicación directa |
| Blackboard | Knowledge Base, ADR, Memory, Metrics, Artifacts |
| Event Driven | Workflows disparados por eventos del ecosistema |
| Reflection | Aprendizaje post-ejecución y actualización KB |

### 3. Modelo de workflow de 9 fases

Event Trigger → Planning → Plan Review → Execution → Validation → Documentation → Metrics → Reflection → Knowledge Base Update

### 4. Integración MCP obligatoria cuando aplique

Todo acceso externo a GitHub, AWS, bases de datos, Terraform, Jira y contenedores debe realizarse vía MCP.

### 5. Expansión del catálogo de agentes

De 6 agentes iniciales a 19 agentes especializados con skill registry estructurado.

## Alternativas consideradas

| Alternativa | Descartada porque |
|-------------|-------------------|
| Mantener arquitectura monolítica de 6 agentes | Insuficiente separación planificación/ejecución/validación |
| Comunicación directa entre agentes | Acoplamiento, difícil trazabilidad y control de permisos |
| SDKs propietarios por servicio | Viola independencia de proveedor; MCP estandariza integración |
| Sin fase de reflexión | Pérdida de aprendizaje acumulativo y repetición de errores |
| Orquestador imperativo en código (Fase 1) | Prematuro; workflows YAML declarativos suficientes inicialmente |

## Consecuencias positivas

- Separación clara de responsabilidades y permisos por agente
- Workflows repetibles, auditables y extensibles por eventos
- Integración estandarizada con ecosistema externo vía MCP
- Knowledge Base y ADRs alimentados sistemáticamente
- Preparación para orquestador automático en fases futuras
- Alineación con mejores prácticas de arquitectura multiagente

## Consecuencias negativas

- Mayor volumen de documentación y configuración inicial
- Curva de aprendizaje del equipo sobre patrones y agentes
- Overhead de fases (plan review, reflection, KB update) en cambios menores
- Orquestación manual hasta implementación del motor automático
- Mantenimiento del skill registry sincronizado con definiciones de agentes

## Impacto técnico

- Reestructuración de `docs/architecture.md` a 7 capas
- 8 nuevos documentos en `docs/` sobre patrones multiagente
- 13 agentes nuevos + 6 agentes actualizados en `.claude/agents/`
- Skill registry con esquema YAML unificado por agente
- Workflows globales y de proyecto actualizados al modelo de 9 fases
- Flujo `lovable-to-web` expandido a 15 pasos para novus-intelligence
- `metrics-schema.json` ampliado con campos de reflexión/aprendizaje
- `CLAUDE.md` con reglas globales multiagente

## Referencias

- [ADR-0001](ADR-0001-nadf-foundation.md)
- [multiagent-architecture.md](../../../docs/multiagent-architecture.md)
- [agent-patterns.md](../../../docs/agent-patterns.md)
- [planning-execution-validation.md](../../../docs/planning-execution-validation.md)
