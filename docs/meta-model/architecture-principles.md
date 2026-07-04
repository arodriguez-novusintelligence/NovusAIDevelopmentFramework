# NADF Meta Model — Principios Arquitectónicos Oficiales

**Versión:** 1.0  
**Estado:** Normativo  
**Autoridad:** ADR-0004

---

## Propósito

Este documento consolida los **10 principios arquitectónicos oficiales** del NovusAIDevelopmentFramework. Cada principio deriva del NADF Meta Model v1.0 y es vinculante para agentes, workflows, proyectos y extensiones del framework.

Los principios complementan — no sustituyen — los documentos de dominio en `docs/meta-model/` y las reglas operativas en `CLAUDE.md`.

---

## 1. Everything starts with Intent

**Todo comienza con Intent.**

Ningún plan, workflow, ejecución ni validación puede iniciarse sin una entidad `Intent` formalizada. Las fuentes externas (Lovable, Jira, commits, solicitudes humanas) se transforman primero en contexto ensamblado (`Context`) y luego en `Intent` explícito.

**Implicaciones:**

- Lovable Analyzer produce artefactos que alimentan Intent, no código productivo.
- El Planner Agent opera exclusivamente sobre Intent validado.
- Workflows sin Intent de entrada están incompletos por definición.

**Entidades relacionadas:** Context, Intent, Project, Domain

---

## 2. Planning before Execution

**Planificación antes de ejecución.**

La capa de Planning (Planner, Architect, Workflow, Backend Impact) analiza, diseña y genera `Plan` aprobado **sin modificar código productivo**. Ningún agente Executor actúa sin Plan en estado `approved`.

**Implicaciones:**

- Separación estricta de permisos: Planner Pattern no codea; Executor Pattern no planifica.
- Plan Review es gate bloqueante entre Planning y Execution.
- Cambios de alcance durante ejecución requieren replanificación formal.

**Entidades relacionadas:** Intent, Plan, Workflow, Task, Agent (Planner)

---

## 3. Validation before Delivery

**Validación antes de entrega.**

Todo `Execution` que produce `Artifact` debe pasar por `Validation` antes de considerarse entregable. QA, Security y Reviewer operan sobre artefactos y ejecuciones, no sobre planes.

**Implicaciones:**

- Quality Gates son bloqueantes; fallos críticos detienen el workflow.
- Validators no modifican lógica productiva salvo autorización explícita.
- Un PR solo se prepara tras Validation passed.

**Entidades relacionadas:** Execution, Artifact, Validation, Quality Gate, Policy, Rule

---

## 4. Knowledge after Reflection

**Conocimiento tras reflexión.**

El aprendizaje reutilizable (`Knowledge`) se genera exclusivamente después de la fase de Reflection post-ejecución. Métricas, artefactos y resultados de validación alimentan Reflection; Reflection consolida Knowledge y recomienda ADRs.

**Implicaciones:**

- Workflows de implementación relevantes incluyen fase Reflection obligatoria.
- Knowledge Base Agent actualiza patrones a partir de reflexiones, no de suposiciones.
- La memoria evoluciona; no se descarta al cerrar un workflow.

**Entidades relacionadas:** Metric, Memory, Knowledge, Decision (ADR), Reflection

---

## 5. Provider Independence

**Independencia de proveedor.**

El framework abstrae proveedores de IA (Claude, OpenAI, Gemini), cloud (AWS, Azure, GCP), IDE (Cursor) y diseño (Lovable) mediante entidades `Provider`, `Tool` y `MCP Server`. Cambiar proveedor no requiere modificar el meta model.

**Implicaciones:**

- AWS es proveedor inicial; la arquitectura no está acoplada a AWS.
- Acceso externo estandarizado vía MCP, no SDKs propietarios directos.
- `project-context.yml` declara proveedores por proyecto sin alterar entidades core.

**Entidades relacionadas:** Provider, Tool, MCP Server, Environment, Deployment

---

## 6. Event Driven

**Orientado a eventos.**

Todo cambio significativo en el ecosistema se modela como `Event` tipado con payload estructurado. Los workflows se disparan por eventos (commits, PRs, bugs, releases), no por invocación directa entre agentes.

**Implicaciones:**

- Workflow Agent clasifica eventos y selecciona workflow de la library.
- El Orquestador (Mediator) enruta eventos; los agentes no se llaman entre sí.
- Trazabilidad completa: cada transición queda registrada como evento.

**Entidades relacionadas:** Event, Workflow, Task, Orchestrator

---

## 7. MCP First

**MCP primero.**

Todo acceso externo a GitHub, AWS, bases de datos, Terraform, Jira, Docker/Kubernetes debe realizarse **vía MCP Server** cuando el servidor esté disponible. MCP es el conector estándar entre agentes y servicios externos.

**Implicaciones:**

- Skill registry declara servidores MCP permitidos por agente.
- Tools nativos solo cuando MCP no esté disponible y esté documentado en ADR.
- Nuevas integraciones externas se registran en mcp-model.md.

**Entidades relacionadas:** MCP Server, Tool, Skill, Capability

---

## 8. Context Before Action

**Contexto antes de acción.**

Ningún agente ejecuta tarea alguna sin leer previamente: `CLAUDE.md`, `meta-model-overview.md` y `project-context.yml` del proyecto activo. El contexto ensamblado (`Context`) precede a toda acción.

**Implicaciones:**

- Regla obligatoria en los 19 agentes (sección «Reglas obligatorias previas a la ejecución»).
- Memory Engine y decision-log son fuentes de contexto complementarias.
- Falta de contexto es criterio de bloqueo documentado por agente.

**Entidades relacionadas:** Context, Project, Memory, Domain

---

## 9. Explicit Architecture Decisions

**Decisiones arquitectónicas explícitas.**

Toda decisión arquitectónica relevante genera un ADR (`Decision`) registrado en `.nadf/global/decision-history/adr/`. Las decisiones implícitas o no documentadas no tienen validez en el framework.

**Implicaciones:**

- ADR Agent registra; Architect Agent identifica decisiones que lo requieren.
- Modificaciones Major al meta model requieren ADR dedicado.
- Executors no cambian arquitectura sin ADR aprobado.

**Entidades relacionadas:** Decision (ADR), Policy, Rule, Knowledge

---

## 10. Human Approval for Critical Operations

**Aprobación humana para operaciones críticas.**

Despliegues a QA o producción, cambios Major al meta model, deprecaciones de entidades core y operaciones irreversibles requieren aprobación humana explícita. Los agentes preparan artefactos; no publican ni despliegan autonomamente.

**Implicaciones:**

- DevOps y Cloud Agent preparan configuraciones; no ejecutan deploy.
- Plan Review incluye validación humana cuando el riesgo lo requiere.
- Deployment es entidad sujeta a gate de aprobación en deployment-model.md.

**Entidades relacionadas:** Deployment, Environment, Quality Gate, Plan

---

## Matriz de principios por capa

| Capa | Principios aplicables |
|------|----------------------|
| Intent Layer | 1, 8 |
| Planning Layer | 1, 2, 8, 9 |
| Execution Layer | 2, 5, 7, 8, 9 |
| Validation Layer | 3, 8, 10 |
| Knowledge Layer | 4, 8, 9 |
| Infrastructure Layer | 5, 6, 7, 10 |

---

## Referencias

- [Especificación oficial](specification.md)
- [Visión general del Meta Model](meta-model-overview.md)
- [Gobernanza](governance.md)
- [ADR-0004](../../.nadf/global/decision-history/adr/ADR-0004-nadf-meta-model.md)
- [CLAUDE.md](../../CLAUDE.md)
