# CLAUDE.md — Reglas globales para agentes NADF

Este archivo define las reglas obligatorias que **todo agente** del NovusAIDevelopmentFramework debe seguir en cada sesión de trabajo.

## NADF Meta Model

El **NADF Meta Model v1.0** es el **lenguaje oficial** del framework — la especificación normativa de entidades, relaciones, eventos y flujos semánticos. Referencia: [docs/meta-model/specification.md](docs/meta-model/specification.md) y ADR-0004.

### Reglas del Meta Model

- **Ningún agente crea entidades nuevas** sin extender el Meta Model primero (ver [governance.md](docs/meta-model/governance.md)).
- **Todos los workflows** operan sobre entidades oficiales (Intent, Plan, Workflow, Task, Execution, Artifact, Validation, Knowledge).
- **Todos los artefactos** se mapean a entidades del Meta Model ([artifact-model.md](docs/meta-model/artifact-model.md)).
- **Todo contexto** se transforma en **Intent** antes de planificar o ejecutar.
- **Planner** opera sobre Intent; **Execution** sobre Plan; **Validation** sobre Execution; **Reflection** genera Knowledge.

### Lectura obligatoria antes de implementar

Antes de implementar cualquier funcionalidad:

1. Leer este archivo (`CLAUDE.md`)
2. Leer [docs/meta-model/meta-model-overview.md](docs/meta-model/meta-model-overview.md)
3. Leer `project-context.yml` del proyecto activo

## Contexto obligatorio

1. **Siempre leer `project-context.yml`** del proyecto activo antes de cualquier acción.
   - Ruta: `.nadf/projects/<nombre-proyecto>/project-context.yml`
   - El contexto define repositorios, stack, alcance y quality gates.

2. **Leer las reglas globales** en `.nadf/global/rules/` y las reglas específicas del proyecto en `.nadf/projects/<nombre-proyecto>/rules/`.

3. **Consultar la memoria del proyecto** en `.nadf/projects/<nombre-proyecto>/memory/` para contexto de negocio, marca y decisiones previas.

## Arquitectura multiagente

NADF opera con **19 agentes especializados** organizados en 7 capas y 7 patrones arquitectónicos. Referencia: `docs/multiagent-architecture.md` y ADR-0002.

### Separación planificación / ejecución / validación

- **Todo workflow** debe separar fases de Planning, Plan Review, Execution y Validation.
- Los workflows de proyecto **deben alinearse** con el orden de fases del workflow canónico global (`.nadf/global/workflow-library/`). Ver `docs/workflow-model.md` (semántica `extends:`) y ADR-0003.
- Los agentes **no se comunican directamente**; el Orquestador (Mediator) coordina y el Blackboard (Knowledge Layer) comparte artefactos.

### Reglas por patrón

| Patrón | Regla |
|--------|-------|
| Planner (Planner, Architect) | **No pueden modificar código** productivo |
| Executor (Frontend, Backend, DB, Cloud, DevOps) | **No pueden cambiar arquitectura sin ADR** |
| Validator (QA, Security, Reviewer) | **No modifican lógica productiva** salvo autorización explícita |
| Blackboard (KB, ADR, Metrics, Docs) | Publican en rutas definidas del skill registry |
| Reflection | Obligatorio tras workflows de implementación relevantes |

## Runtime: Cursor Cloud Agent (M6)

- **Cloud Agent de Cursor** es un *motor de ejecución*, no un rol NADF. El rol NADF `cloud-agent` es el Executor de infraestructura/IaC.
- Para invocar un rol en Cloud Agent: leer [docs/cloud-agent-integration.md](docs/cloud-agent-integration.md), aplicar plantilla de prompt y el contrato [AgentRuntime](docs/runtime/agent-runtime-contract.md) (ADR-0005).
- Prototipo mínimo: `prototypes/m6-cloud-agent/` (`npm run invoke:lovable-analyzer`).
- Un Cloud Agent = **un** rol NADF por invocación (salvo orquestación M5 futura). No saltar Planning.

## Integración MCP

- **Todo acceso externo** a GitHub, AWS, bases de datos, Terraform, Jira, Docker/Kubernetes debe realizarse **vía MCP** cuando el servidor esté disponible.
- Referencia: `docs/mcp-integration.md` y `.nadf/global/rules/provider-independence.md`.

## Reglas de implementación

### Lovable — prohibición de copia directa

- Lovable (`novus-nexus`) es **fuente de intención visual y funcional únicamente**.
- **Nunca** copiar código, componentes o estilos directamente desde Lovable al frontend productivo.
- Traducir la intención al stack real: React + TypeScript + Tailwind en `NovusIntelligenceWEB`.
- Referencia: `docs/lovable-integration.md` y `.nadf/global/rules/general-rules.md`.

### Sin mocks en producción

- No usar datos simulados, placeholders ni fixtures en rutas o componentes de producción.
- Los mocks solo están permitidos en entornos de desarrollo local explícitamente marcados.
- Referencia: `.nadf/global/rules/no-mock-policy.md`.

### Sin despliegue sin aprobación

- **Nunca** ejecutar despliegues a QA o producción sin aprobación humana explícita.
- Los agentes pueden preparar artefactos, PRs y configuraciones, pero no publicar.
- Referencia: `.nadf/global/rules/security-rules.md`.

### Sin secrets en código

- **Nunca** incluir API keys, tokens, passwords ni credenciales en código, artefactos ni configuración versionada.
- Referencia: `.nadf/global/rules/security-rules.md`.

### Decisiones arquitectónicas (ADR)

- **Toda decisión arquitectónica relevante** debe generar ADR.
- Ubicación: `.nadf/global/decision-history/adr/`
- Formato: `ADR-NNNN-titulo-corto.md`
- Agente responsable: **ADR Agent** (registro) + **Architect Agent** (identificación).

### Métricas

- **Todo cambio relevante debe generar métricas** según `.nadf/global/metrics/metrics-schema.json`.
- Agente responsable: **Metrics Agent**.
- Incluir campos de reflexión cuando aplique: `reflectionSummary`, `patternsIdentified`, `failuresDocumented`.

### Knowledge Base

- **Todo aprendizaje reutilizable** debe actualizar la Knowledge Base.
- Agente responsable: **Knowledge Base Agent**, alimentado por **Reflection Agent**.
- Ubicación: `.nadf/global/knowledge-base/`

### Independencia de proveedor

- El framework debe mantener abstracción respecto al proveedor de nube e IA.
- AWS es el proveedor inicial; MCP permite abstracción de servicios externos.
- Referencia: `.nadf/global/rules/provider-independence.md`.

## Flujo de trabajo estándar (9 fases)

```
Event Trigger → Planning → Plan Review → Execution → Validation
→ Documentation → Metrics → Reflection → Knowledge Base Update
```

## Agentes disponibles

| Capa | Agentes |
|------|---------|
| Framework | Framework Architect |
| Design Source | Lovable Analyzer |
| Planning | Planner, Architect, Workflow, Backend Impact |
| Execution | Frontend Integration, Backend, Database, Cloud, DevOps |
| Validation | QA, Security, Reviewer |
| Knowledge | Documentation, Metrics, Knowledge Base, ADR, Reflection |

Definiciones completas en `.claude/agents/` y skill registry en `.nadf/global/skill-registry/`.

## Comandos reutilizables

- `novus-lovable-sync` — Ejecutar workflow Lovable → Web (18 pasos)
- `setup-project-context` — Configurar contexto de un nuevo proyecto

Ubicación: `.claude/commands/`.

## Quality gates (obligatorios)

Antes de considerar un cambio como completado:

- [ ] No hay copia directa de código Lovable
- [ ] No hay mocks en código de producción
- [ ] Plan aprobado por Architect Agent
- [ ] Build exitoso
- [ ] Validación responsive
- [ ] Validación SEO básica
- [ ] Revisión de seguridad pass
- [ ] Sin secrets expuestos
- [ ] Métricas registradas
- [ ] Reflexión generada (workflows de implementación)
- [ ] ADR registrado si hubo decisión arquitectónica
- [ ] Documentación actualizada si aplica

## Idioma

- Toda documentación, artefactos y comunicación entre agentes: **español**.
- Código y nombres técnicos: inglés (convención estándar de la industria).

## Alcance prohibido para agentes

Los agentes NADF **no deben**:

- Implementar lógica de negocio compleja sin instrucción explícita
- Crear o usar API keys, secrets o credenciales
- Desplegar a entornos remotos
- Modificar la estructura del framework sin rol de Framework Architect
- Copiar código de Lovable directamente
- Implementar orquestador productivo (solo documentación y workflows YAML)

## Referencias

- [NADF Meta Model — Especificación oficial](docs/meta-model/specification.md)
- [Meta Model — Visión general](docs/meta-model/meta-model-overview.md)
- [Arquitectura multiagente](docs/multiagent-architecture.md)
- [Patrones de agentes](docs/agent-patterns.md)
- [ADR-0002](.nadf/global/decision-history/adr/ADR-0002-multiagent-patterns.md)
- [ADR-0003](.nadf/global/decision-history/adr/ADR-0003-lovable-to-web-canonicalization.md)
- [ADR-0004](.nadf/global/decision-history/adr/ADR-0004-nadf-meta-model.md)
