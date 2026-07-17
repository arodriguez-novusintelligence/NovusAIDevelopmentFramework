# NADF Meta Model — Especificación Oficial

**Versión:** 1.1  
**Estado:** Normativo  
**Fecha de adopción:** 2026-07-04 (v1.0) · **Actualización minor:** 2026-07-14 (v1.1)  
**Autoridad:** ADR-0004 · ADR-0007  
**Ámbito:** NovusAIDevelopmentFramework (NADF)

---

## Declaración de autoridad

> **Esta documentación constituye la especificación oficial (v1.1) de NovusAIDevelopmentFramework.**

El NADF Meta Model v1.1 es la **especificación central y normativa** del framework. Define el lenguaje conceptual, las entidades, relaciones, eventos, ciclos de vida y flujos semánticos que rigen todos los agentes, workflows, artefactos, integraciones MCP y proyectos bajo NADF. La v1.1 extiende de forma **compatible** el Core Domain con la Requirement Intake Layer (ADR-0007), sin invalidar contratos v1.0.

Ningún componente del framework — agente, workflow, comando, skill registry, ADR o extensión de proyecto — puede contradecir esta especificación sin seguir el proceso de evolución definido en [governance.md](governance.md) y [versioning.md](versioning.md).

---

## Alcance

### Incluido

| Ámbito | Descripción |
|--------|-------------|
| **Core Domain** | Entidades v1.0 + extensión Requirement Intake (opt-in) |
| **Dominios complementarios** | Intención, requerimientos, contexto, capacidades, memoria, calidad, aprendizaje, artefactos, despliegue, herramientas y MCP |
| **Flujos semánticos** | Context → Intent → Plan → Workflow → Task → Execution → Artifact → Validation → Knowledge; rama opt-in RawRequirementEvent → Requirement → Intent |
| **Eventos** | Catálogo oficial de eventos tipados con payloads estructurados |
| **Gobernanza** | Políticas, reglas y quality gates como entidades de primera clase |
| **Principios arquitectónicos** | 10 principios oficiales documentados en [architecture-principles.md](architecture-principles.md) |

### Excluido

| Ámbito | Razón |
|--------|-------|
| Implementación de código | El meta model es conceptual; no prescribe runtime, orquestador ni lógica productiva |
| Configuración de proveedores | Provider, Tool y MCP Server abstraen backends; la configuración concreta es responsabilidad de proyecto |
| Esquemas JSON formales | Corresponden a M1 (Contract & Schema Layer); esta especificación es la base semántica |
| Workflows YAML concretos | Los workflows instancian entidades del meta model; su definición declarativa está en `.nadf/global/workflow-library/` |

---

## Relación con otros documentos del Meta Model

### Documentos normativos (obligatorios)

| Documento | Rol |
|-----------|-----|
| [specification.md](specification.md) | **Este documento** — Declaración de autoridad, alcance y cumplimiento |
| [meta-model-overview.md](meta-model-overview.md) | Visión general v1.0, mapa de dominios, macro-ciclo y glosario |
| [governance.md](governance.md) | Proceso de modificación, aprobación y registro |
| [versioning.md](versioning.md) | Reglas de versionado Major / Minor / Patch |
| [architecture-principles.md](architecture-principles.md) | Principios arquitectónicos oficiales del framework |

### Documentos de dominio (complementarios normativos)

| Documento | Entidades / Dominio |
|-----------|---------------------|
| [entity-model.md](entity-model.md) | 24 entidades del Core Domain |
| [relationship-model.md](relationship-model.md) | Composición, agregación, dependencia, asociación |
| [event-model.md](event-model.md) | Catálogo de eventos y enrutamiento |
| [intent-model.md](intent-model.md) | Flujo Intent → Knowledge |
| [requirement-model.md](requirement-model.md) | Requirement Intake Layer (v1.1, ADR-0007) |
| [capability-model.md](capability-model.md) | Capability, Skill, Tool |
| [memory-model.md](memory-model.md) | 6 tipos de memoria NADF |
| [quality-model.md](quality-model.md) | Quality Gate, Policy, Rule, Validation |
| [learning-model.md](learning-model.md) | Reflection pattern y aprendizaje |
| [artifact-model.md](artifact-model.md) | Catálogo oficial de artefactos |
| [context-model.md](context-model.md) | Fuentes y ensamblaje de contexto |
| [deployment-model.md](deployment-model.md) | Environment, Deployment, multi-cloud |
| [tool-model.md](tool-model.md) | Abstracción de Tool |
| [mcp-model.md](mcp-model.md) | MCP Server como conector estándar |

### Documentos de referencia externa

| Documento | Relación |
|-----------|----------|
| [architecture.md](../architecture.md) | Capas arquitectónicas reconciliadas con entidades del meta model |
| [multiagent-architecture.md](../multiagent-architecture.md) | Patrones multiagente mapeados a entidades Agent, Workflow, Knowledge |
| [agent-model.md](../agent-model.md) | Catálogo de 27 agentes (core + Requirement Intake) como instancias de Agent + Skill + Capability |
| [workflow-model.md](../workflow-model.md) | Workflows como instancias de Workflow + Task |
| [ADR-0002](../../.nadf/global/decision-history/adr/ADR-0002-multiagent-patterns.md) | Arquitectura multiagente base |
| [ADR-0004](../../.nadf/global/decision-history/adr/ADR-0004-nadf-meta-model.md) | Decisión de adopción formal |

---

## Requisitos de cumplimiento

Todo agente, workflow, proyecto y extensión del framework **debe cumplir** los siguientes requisitos:

### 1. Lectura obligatoria previa

Antes de implementar cualquier funcionalidad o ejecutar cualquier tarea:

1. Leer `CLAUDE.md`
2. Leer `docs/meta-model/meta-model-overview.md`
3. Leer `project-context.yml` del proyecto activo

### 2. Entidades oficiales

- Solo se utilizan entidades definidas en [entity-model.md](entity-model.md) o extensiones aprobadas según [governance.md](governance.md).
- Ningún agente crea entidades ad hoc fuera del meta model.

### 3. Flujo semántico obligatorio

```
Context → Intent → Plan → Workflow → Task → Execution → Artifact → Validation → Knowledge
```

Rama opt-in (proyectos con `requirement-sources/`):

```
RawRequirementEvent → Requirement → Context → Intent → (flujo canónico)
```

- **Planner** opera sobre Intent; produce Plan.
- **Requirement Intake** opera antes de Intent; nunca produce Execution de código.
- **Execution** opera sobre Plan aprobado; produce Execution y Artifact.
- **Validation** opera sobre Execution y Artifact; produce Validation.
- **Reflection** opera post-ejecución; produce Knowledge.

### 4. Artefactos mapeados

- Toda salida de agente es un `Artifact` versionado según [artifact-model.md](artifact-model.md).
- Los artefactos se publican en rutas del Blackboard (Knowledge Layer).

### 5. Eventos tipados

- Todo cambio significativo se modela como evento según [event-model.md](event-model.md).
- Los workflows se disparan por eventos, no por invocación directa entre agentes.

### 6. Calidad gobernada

- Quality Gates, Policies y Rules son entidades obligatorias según [quality-model.md](quality-model.md).
- Ningún workflow avanza sin pasar gates definidos en `project-context.yml`.

### 7. Extensión formal

- Nuevas entidades, relaciones o flujos requieren proceso de gobernanza ([governance.md](governance.md)).
- Cambios Major requieren ADR; cambios Minor/Patch siguen [versioning.md](versioning.md).

### 8. Independencia de proveedor

- Acceso a servicios externos vía MCP Server y Tool según [mcp-model.md](mcp-model.md) y [tool-model.md](tool-model.md).
- Ninguna entidad del meta model depende de un proveedor concreto de IA o cloud.

---

## Jerarquía normativa

En caso de conflicto entre documentos, prevalece el siguiente orden:

1. **ADR** (decisiones arquitectónicas formales)
2. **specification.md** (esta especificación)
3. **meta-model-overview.md** + documentos de dominio en `docs/meta-model/`
4. **CLAUDE.md** (reglas operativas de agentes)
5. **Documentación complementaria** en `docs/`
6. **Configuración declarativa** (skill registry, workflows YAML, project-context.yml)

---

## Referencias

- [ADR-0004 — Adopción del Meta Model](../../.nadf/global/decision-history/adr/ADR-0004-nadf-meta-model.md)
- [Visión general del Meta Model](meta-model-overview.md)
- [Gobernanza](governance.md)
- [Versionado](versioning.md)
- [Principios arquitectónicos](architecture-principles.md)
