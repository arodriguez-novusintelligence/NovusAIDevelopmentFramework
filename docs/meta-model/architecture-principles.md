# NADF Meta Model â€” Principios ArquitectÃ³nicos Oficiales

**VersiÃ³n:** 1.0  
**Estado:** Normativo  
**Autoridad:** ADR-0004

---

## PropÃ³sito

Este documento consolida los **10 principios arquitectÃ³nicos oficiales** del NovusAIDevelopmentFramework. Cada principio deriva del NADF Meta Model v1.0 y es vinculante para agentes, workflows, proyectos y extensiones del framework.

Los principios complementan â€” no sustituyen â€” los documentos de dominio en `docs/meta-model/` y las reglas operativas en `CLAUDE.md`.

---

## 1. Everything starts with Intent

**Todo comienza con Intent.**

NingÃºn plan, workflow, ejecuciÃ³n ni validaciÃ³n puede iniciarse sin una entidad `Intent` formalizada. Las fuentes externas (Lovable, Jira, commits, solicitudes humanas) se transforman primero en contexto ensamblado (`Context`) y luego en `Intent` explÃ­cito.

**Implicaciones:**

- Lovable Analyzer produce artefactos que alimentan Intent, no cÃ³digo productivo.
- El Planner Agent opera exclusivamente sobre Intent validado.
- Workflows sin Intent de entrada estÃ¡n incompletos por definiciÃ³n.

**Entidades relacionadas:** Context, Intent, Project, Domain

---

## 2. Planning before Execution

**PlanificaciÃ³n antes de ejecuciÃ³n.**

La capa de Planning (Planner, Architect, Workflow, Backend Impact) analiza, diseÃ±a y genera `Plan` aprobado **sin modificar cÃ³digo productivo**. NingÃºn agente Executor actÃºa sin Plan en estado `approved`.

**Implicaciones:**

- SeparaciÃ³n estricta de permisos: Planner Pattern no codea; Executor Pattern no planifica.
- Plan Review es gate bloqueante entre Planning y Execution.
- Cambios de alcance durante ejecuciÃ³n requieren replanificaciÃ³n formal.

**Entidades relacionadas:** Intent, Plan, Workflow, Task, Agent (Planner)

---

## 3. Validation before Delivery

**ValidaciÃ³n antes de entrega.**

Todo `Execution` que produce `Artifact` debe pasar por `Validation` antes de considerarse entregable. QA, Security y Reviewer operan sobre artefactos y ejecuciones, no sobre planes.

**Implicaciones:**

- Quality Gates son bloqueantes; fallos crÃ­ticos detienen el workflow.
- Validators no modifican lÃ³gica productiva salvo autorizaciÃ³n explÃ­cita.
- Un PR solo se prepara tras Validation passed.

**Entidades relacionadas:** Execution, Artifact, Validation, Quality Gate, Policy, Rule

---

## 4. Knowledge after Reflection

**Conocimiento tras reflexiÃ³n.**

El aprendizaje reutilizable (`Knowledge`) se genera exclusivamente despuÃ©s de la fase de Reflection post-ejecuciÃ³n. MÃ©tricas, artefactos y resultados de validaciÃ³n alimentan Reflection; Reflection consolida Knowledge y recomienda ADRs.

**Implicaciones:**

- Workflows de implementaciÃ³n relevantes incluyen fase Reflection obligatoria.
- Knowledge Base Agent actualiza patrones a partir de reflexiones, no de suposiciones.
- La memoria evoluciona; no se descarta al cerrar un workflow.

**Entidades relacionadas:** Metric, Memory, Knowledge, Decision (ADR), Reflection

---

## 5. Provider Independence

**Independencia de proveedor.**

El framework abstrae proveedores de IA (Claude, OpenAI, Gemini), cloud (AWS, Azure, GCP), IDE (Cursor) y diseÃ±o (Lovable) mediante entidades `Provider`, `Tool` y `MCP Server`. Cambiar proveedor no requiere modificar el meta model.

**Implicaciones:**

- AWS es proveedor inicial; la arquitectura no estÃ¡ acoplada a AWS.
- Acceso externo estandarizado vÃ­a MCP, no SDKs propietarios directos.
- `project-context.yml` declara proveedores por proyecto sin alterar entidades core.

**Entidades relacionadas:** Provider, Tool, MCP Server, Environment, Deployment

---

## 6. Event Driven

**Orientado a eventos.**

Todo cambio significativo en el ecosistema se modela como `Event` tipado con payload estructurado. Los workflows se disparan por eventos (commits, PRs, bugs, releases), no por invocaciÃ³n directa entre agentes.

**Implicaciones:**

- Workflow Agent clasifica eventos y selecciona workflow de la library.
- El Orquestador (Mediator) enruta eventos; los agentes no se llaman entre sÃ­.
- Trazabilidad completa: cada transiciÃ³n queda registrada como evento.

**Entidades relacionadas:** Event, Workflow, Task, Orchestrator

---

## 7. MCP First

**MCP primero.**

Todo acceso externo a GitHub, AWS, bases de datos, Terraform, Jira, Docker/Kubernetes debe realizarse **vÃ­a MCP Server** cuando el servidor estÃ© disponible. MCP es el conector estÃ¡ndar entre agentes y servicios externos.

**Implicaciones:**

- Skill registry declara servidores MCP permitidos por agente.
- Tools nativos solo cuando MCP no estÃ© disponible y estÃ© documentado en ADR.
- Nuevas integraciones externas se registran en mcp-model.md.

**Entidades relacionadas:** MCP Server, Tool, Skill, Capability

---

## 8. Context Before Action

**Contexto antes de acciÃ³n.**

NingÃºn agente ejecuta tarea alguna sin leer previamente: `CLAUDE.md`, `meta-model-overview.md` y `project-context.yml` del proyecto activo. El contexto ensamblado (`Context`) precede a toda acciÃ³n.

**Implicaciones:**

- Regla obligatoria en los 27 agentes (secciÃ³n Â«Reglas obligatorias previas a la ejecuciÃ³nÂ»).
- Memory Engine y decision-log son fuentes de contexto complementarias.
- Falta de contexto es criterio de bloqueo documentado por agente.

**Entidades relacionadas:** Context, Project, Memory, Domain

---

## 9. Explicit Architecture Decisions

**Decisiones arquitectÃ³nicas explÃ­citas.**

Toda decisiÃ³n arquitectÃ³nica relevante genera un ADR (`Decision`) registrado en `.nadf/global/decision-history/adr/`. Las decisiones implÃ­citas o no documentadas no tienen validez en el framework.

**Implicaciones:**

- ADR Agent registra; Architect Agent identifica decisiones que lo requieren.
- Modificaciones Major al meta model requieren ADR dedicado.
- Executors no cambian arquitectura sin ADR aprobado.

**Entidades relacionadas:** Decision (ADR), Policy, Rule, Knowledge

---

## 10. Human Approval for Critical Operations

**AprobaciÃ³n humana para operaciones crÃ­ticas.**

Despliegues a QA o producciÃ³n, cambios Major al meta model, deprecaciones de entidades core y operaciones irreversibles requieren aprobaciÃ³n humana explÃ­cita. Los agentes preparan artefactos; no publican ni despliegan autonomamente.

**Implicaciones:**

- DevOps y Cloud Agent preparan configuraciones; no ejecutan deploy.
- Plan Review incluye validaciÃ³n humana cuando el riesgo lo requiere.
- Deployment es entidad sujeta a gate de aprobaciÃ³n en deployment-model.md.

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

- [EspecificaciÃ³n oficial](specification.md)
- [VisiÃ³n general del Meta Model](meta-model-overview.md)
- [Gobernanza](governance.md)
- [ADR-0004](../../.nadf/global/decision-history/adr/ADR-0004-nadf-meta-model.md)
- [CLAUDE.md](../../CLAUDE.md)
