# Roadmap de implementaciÃ³n â€” NovusAIDevelopmentFramework (NADF 2.0.0)

**VersiÃ³n del documento:** 1.0.0  
**Fecha:** 2026-07-04  
**Autor:** Chief Software Architect  
**Estado del framework:** Fase 1 (documentaciÃ³n + orquestaciÃ³n manual) â€” puntuaciÃ³n arquitectÃ³nica ~7.8/10  
**Proyecto piloto:** `novus-intelligence` (NovusIntelligenceWEB, NovusIntelligenceBack, novus-nexus)

---

## 1. Resumen ejecutivo del roadmap

NADF 2.0.0 es un **framework declarativo de gobernanza multiagente** (Markdown + YAML) que coordina 27 agentes especializados en 7 capas y 7 patrones arquitectÃ³nicos, con un workflow canÃ³nico `lovable-to-web` de 18 pasos y 9 fases. Tras las correcciones crÃ­ticas documentadas en [architecture-review-final.md](architecture-review-final.md) y [ADR-0003](../.nadf/global/decision-history/adr/ADR-0003-lovable-to-web-canonicalization.md), el framework es **coherente y operable como guÃ­a manual**, pero no autÃ³nomo.

Este roadmap define **15 mÃ³dulos independientes** (M0â€“M14) con interfaces claras, prioridades y dependencias explÃ­citas. La estrategia es **incremental y reversible**: cada mÃ³dulo entrega valor verificable sin bloquear el uso manual del framework mientras avanzan los mÃ³dulos de automatizaciÃ³n.

**Horizonte estimado:**

| Horizonte | Objetivo principal |
|-----------|-------------------|
| **Corto plazo (Q3 2026)** | Contratos formales (M1), validaciÃ³n CI (M7), MCP mÃ­nimo operativo (M4) |
| **Medio plazo (Q4 2026 â€“ Q1 2027)** | Orquestador ejecutable (M5), puente runtime (M6), pipeline Lovable semi-automÃ¡tico (M9) |
| **Largo plazo (2027+)** | Multi-proyecto/tenant (M10), multi-cloud (M11), multi-LLM (M12), observabilidad y hardening (M13â€“M14) |

**Meta de madurez:** pasar de **7.8/10** (guÃ­a manual coherente) a **â‰¥9.0/10** (orquestaciÃ³n semi-autÃ³noma con gates bloqueantes, trazabilidad completa y abstracciÃ³n de proveedores verificable).

---

## 2. Principios de implementaciÃ³n incremental

1. **DocumentaciÃ³n primero, cÃ³digo despuÃ©s** â€” NingÃºn mÃ³dulo de runtime contradice lo ya canonizado en YAML, ADRs y `CLAUDE.md`. Los contratos (M1) preceden a la ejecuciÃ³n automatizada (M5, M6).

2. **Interfaces estables, implementaciones intercambiables** â€” Cada mÃ³dulo expone contratos (schemas, APIs, manifests) que otros consumen sin acoplarse a la implementaciÃ³n interna.

3. **Valor incremental por mÃ³dulo** â€” Cada entrega debe ser utilizable de forma aislada. Ejemplo: M7 (CI) aporta valor aunque M5 (orquestador) no exista.

4. **OrquestaciÃ³n manual como fallback permanente** â€” `orchestrator_mode: manual` y el comando `novus-lovable-sync` siguen siendo vÃ¡lidos hasta que M5 demuestre paridad funcional en el piloto.

5. **Piloto antes de generalizar** â€” Todo mÃ³dulo de ejecuciÃ³n se valida contra `novus-intelligence` antes de habilitar multi-proyecto (M10).

6. **MCP como Ãºnica vÃ­a externa** â€” Integraciones con GitHub, AWS, DB, Terraform, Jira y K8s pasan por M4; sin bypass directo en agentes.

7. **Gates bloqueantes no negociables** â€” Los 10 quality gates de `project-context.yml` y las reglas de `CLAUDE.md` se convierten en validaciones ejecutables progresivamente (M7 â†’ M5).

8. **SeparaciÃ³n planificaciÃ³n / ejecuciÃ³n / validaciÃ³n** â€” NingÃºn mÃ³dulo de runtime permite que agentes Planner modifiquen cÃ³digo productivo ni que Executors cambien arquitectura sin ADR.

9. **Trazabilidad obligatoria** â€” MÃ©tricas (M3), reflexiÃ³n, ADRs y KB (M2) son requisitos de cierre, no opcionales.

10. **Independencia de proveedor declarada y verificada** â€” Abstracciones multi-cloud (M11) y multi-LLM (M12) se prueban con al menos dos backends antes de declararse estables.

---

## 3. VisiÃ³n por fases

### Fase 0 â€” FundaciÃ³n declarativa âœ… **Completada**

**Alcance:** Gobernanza, arquitectura multiagente, skill registry, workflow library, ADRs base, proyecto piloto configurado.

**Entregables completados:**
- 27 agentes definidos (`.claude/agents/` + skill registry)
- 8 workflows globales + workflow de proyecto reconciliado (18 pasos)
- ADR-0001 (superseded), ADR-0002, ADR-0003
- `project-context.yml` completo (19/27 agentes, 10 quality gates)
- DocumentaciÃ³n arquitectÃ³nica (`docs/`, `CLAUDE.md`)
- Comandos manuales: `novus-lovable-sync`, `setup-project-context`

**MÃ³dulo principal:** M0 (Foundation & Governance)

---

### Fase 1 â€” OperaciÃ³n manual guiada ðŸ”„ **En curso (estable)**

**Alcance:** EjecuciÃ³n humana del workflow canÃ³nico vÃ­a Cursor / Claude Code con supervisiÃ³n; sin motor de orquestaciÃ³n productivo.

**Estado actual:**
- Orquestador conceptual; `orchestrator_mode: manual`
- MÃ©tricas parcialmente definidas (`metrics-schema.json` existe)
- MCP documentado, no operacionalizado en repo
- Knowledge Base vacÃ­a
- Sin validador estÃ¡tico ni CI de coherencia

**Criterio de cierre Fase 1:** Primera ejecuciÃ³n end-to-end manual completa del piloto `novus-intelligence` (landing page) con todos los gates documentados cumplidos y artefactos en Blackboard.

**MÃ³dulos activos:** M0 (mantenimiento), preparaciÃ³n M1

---

### Fase 2 â€” Contratos y validaciÃ³n estÃ¡tica

**Alcance:** JSON Schemas, contratos de artefactos, linter de coherencia, CI en GitHub Actions.

**MÃ³dulos:** M1 (Contract & Schema Layer), M7 (Validation & CI Layer)

**Resultado esperado:** Deriva docs â†” YAML detectada automÃ¡ticamente en PR; schemas versionados como fuente de verdad contractual.

---

### Fase 3 â€” IntegraciÃ³n MCP y conocimiento operativo

**Alcance:** Servidores MCP mÃ­nimos (GitHub, AWS), manifests en repo, KB poblada desde reflexiÃ³n.

**MÃ³dulos:** M4 (MCP Integration Layer), M2 (Knowledge Base Engine), M3 (Metrics & Reflection Pipeline)

**Resultado esperado:** Agentes Executor acceden a GitHub/AWS vÃ­a MCP con trazabilidad; aprendizajes persisten en KB.

---

### Fase 4 â€” Motor de workflows y puente runtime

**Alcance:** IntÃ©rprete YAML de workflows, gates bloqueantes, abstracciÃ³n Claude Code / Cloud Agent / Cursor SDK.

**MÃ³dulos:** M5 (Workflow Engine / Orchestrator), M6 (Agent Runtime Bridge)

**Resultado esperado:** `novus-lovable-sync` ejecutable con estado de workflow persistido y gates enforced.

---

### Fase 5 â€” AutomatizaciÃ³n Lovable â†’ Web (piloto)

**Alcance:** Pipeline end-to-end semi-automÃ¡tico para `novus-intelligence`; onboarding automatizado de proyectos.

**MÃ³dulos:** M9 (Lovable Sync Pipeline), M8 (Project Onboarding Automation)

**Resultado esperado:** Evento `lovable.commit` â†’ PR listo en < 2 horas (mÃ©trica de visiÃ³n).

---

### Fase 6 â€” Escala operacional

**Alcance:** Multi-proyecto, dashboard de observabilidad, hardening de seguridad.

**MÃ³dulos:** M10 (Multi-Project & Multi-Tenant), M13 (Observability & Dashboard), M14 (Security & Compliance Hardening)

---

### Fase 7 â€” AbstracciÃ³n de proveedores

**Alcance:** Runtime desacoplado de AWS y de un Ãºnico LLM; verificaciÃ³n con segundo proveedor.

**MÃ³dulos:** M11 (Multi-Cloud Provider Abstraction), M12 (Multi-LLM Provider Abstraction)

**Resultado esperado:** Cambio de proveedor cloud o LLM sin modificar definiciones de agentes ni workflows.

---

## 4. MÃ³dulos independientes

### M0: Foundation & Governance

| Atributo | Detalle |
|----------|---------|
| **Estado** | âœ… ~95% completado (Fase 0) |
| **Objetivo** | Mantener la capa declarativa de gobernanza: reglas globales, ADRs, arquitectura multiagente, skill registry, workflow library y documentaciÃ³n canÃ³nica. |
| **Dependencias** | Ninguna (mÃ³dulo raÃ­z) |
| **Prioridad** | P0 (mantenimiento continuo) |
| **Complejidad** | Media |
| **Agentes involucrados** | Framework Architect, ADR Agent, Workflow Agent, Documentation Agent |
| **Entregables** | `CLAUDE.md`, `docs/*`, `.nadf/global/rules/`, skill registry (19 YAML), workflow library (8 YAML), ADRs, comandos `.claude/commands/`, **NADF Meta Model v1.0 normativo** (ADR-0004) |
| **Criterios de finalizaciÃ³n** | âœ… 27 agentes alineados MDâ†”YAML; âœ… workflow canÃ³nico 18 pasos; âœ… ADR-0003 aplicado; âœ… ADR-0004 Meta Model adoptado; âœ… project-context piloto completo; mantenimiento: zero drift entre docs y YAML verificado por M7 |

**Trabajo pendiente en M0:** SincronizaciÃ³n continua con validador CI (M7); ADRs para cada mÃ³dulo nuevo del roadmap.

---

### M1: Contract & Schema Layer

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Pendiente |
| **Objetivo** | Definir contratos formales (JSON Schema) para todos los artefactos declarativos NADF y establecer reglas de versionado de contratos. |
| **Dependencias** | M0 |
| **Prioridad** | P0 |
| **Complejidad** | Media |
| **Agentes involucrados** | Framework Architect, Architect Agent, ADR Agent |
| **Entregables** | JSON Schemas: `project-context`, `skill-registry`, `workflow`, `quality-gates`, `artifact-contracts`; catÃ¡logo de artefactos Blackboard (`plan-implementacion.md`, `evaluacion-backend.md`, etc.); `docs/contract-catalog.md`; ADR de versionado de schemas |
| **Criterios de finalizaciÃ³n** | 100% de YAML NADF validables contra schema; contratos de entrada/salida por paso de workflow documentados; semver de schemas definido; `metrics-schema.json` integrado al catÃ¡logo |

**Interfaces expuestas:**
- `schemas/v1/*.schema.json` â€” validaciÃ³n estÃ¡tica
- `ArtifactContract` â€” tipo, ruta, productor, consumidor, schema

---

### M2: Knowledge Base Engine

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Pendiente (KB vacÃ­a) |
| **Objetivo** | Operacionalizar el Blackboard de conocimiento reutilizable: indexaciÃ³n, bÃºsqueda, ciclo de vida de entradas y vinculaciÃ³n con reflexiÃ³n y ADRs. |
| **Dependencias** | M0, M1 (contratos de artefactos KB) |
| **Prioridad** | P1 |
| **Complejidad** | Media |
| **Agentes involucrados** | Knowledge Base Agent, Reflection Agent, ADR Agent, Documentation Agent |
| **Entregables** | Estructura operativa `.nadf/global/knowledge-base/` (categorÃ­as: patterns, failures, decisions); API/CLI de consulta e ingesta; plantillas de entrada KB; integraciÃ³n con salida de Reflection Agent |
| **Criterios de finalizaciÃ³n** | â‰¥10 entradas KB pobladas desde ejecuciones piloto; bÃºsqueda por tag/patrÃ³n/proyecto funcional; cada workflow de implementaciÃ³n genera â‰¥1 actualizaciÃ³n KB recomendada y trazable |

**Interfaces expuestas:**
- `KBStore.query(filters)` â€” lectura
- `KBStore.ingest(entry)` â€” escritura (solo agentes Blackboard autorizados)

---

### M3: Metrics & Reflection Pipeline

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Parcial (`metrics-schema.json` existe) |
| **Objetivo** | Pipeline end-to-end de captura, almacenamiento, agregaciÃ³n y reflexiÃ³n post-workflow con campos obligatorios de aprendizaje. |
| **Dependencias** | M1, M2 |
| **Prioridad** | P1 |
| **Complejidad** | Media |
| **Agentes involucrados** | Metrics Agent, Reflection Agent, Knowledge Base Agent |
| **Entregables** | AlmacÃ©n de mÃ©tricas por proyecto (`.nadf/projects/<p>/metrics/`); validador contra `metrics-schema.json`; plantilla de reflexiÃ³n; pipeline Reflection â†’ KB; reportes agregados por workflow/agente |
| **Criterios de finalizaciÃ³n** | 100% de ejecuciones piloto registran mÃ©tricas vÃ¡lidas; reflexiÃ³n generada en workflows de implementaciÃ³n; campos `reflectionSummary`, `patternsIdentified`, `failuresDocumented`, `kbUpdatesRecommended` poblados |

**Interfaces expuestas:**
- `MetricsCollector.record(event)` â€” ingesta
- `ReflectionPipeline.run(workflowRunId)` â€” generaciÃ³n reflexiÃ³n + recomendaciones KB

---

### M4: MCP Integration Layer

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Documentado, no operacional |
| **Objetivo** | Operacionalizar la capa MCP: manifests, configuraciÃ³n por proyecto, permisos por agente y servidores mÃ­nimos (GitHub, AWS) con trazabilidad. |
| **Dependencias** | M0, M1 (schema de permisos MCP) |
| **Prioridad** | P0 |
| **Complejidad** | Alta |
| **Agentes involucrados** | Cloud Agent, DevOps Agent, Backend Agent, Database Agent, Lovable Analyzer Agent, Reviewer Agent |
| **Entregables** | `.nadf/global/mcp/` (manifests, capability matrix); configuraciÃ³n MCP por proyecto; integraciÃ³n GitHub (repos, PRs, diffs); integraciÃ³n AWS (Lambda, S3, DynamoDB â€” lectura/describe); logging de operaciones MCP en mÃ©tricas; `docs/mcp-integration.md` actualizado con manifests |
| **Criterios de finalizaciÃ³n** | GitHub y AWS operativos en piloto; permisos enforced por skill registry; cero bypass documentado; fallos MCP bloquean paso y escalan al orquestador |

**Interfaces expuestas:**
- `MCPGateway.invoke(server, tool, params, agentContext)` â€” abstracciÃ³n Ãºnica
- `MCPCapabilityMatrix` â€” servidor Ã— agente Ã— operaciÃ³n

**Servidores planificados (fases):**

| Fase | Servidores |
|------|------------|
| 4.1 | GitHub |
| 4.2 | AWS |
| 4.3 | Database, Terraform |
| 4.4 | Jira, Docker/Kubernetes |

---

### M5: Workflow Engine / Orchestrator

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Conceptual/manual |
| **Objetivo** | Transformar workflows YAML declarativos en ejecuciÃ³n con estado, transiciones de fase, condiciones, gates bloqueantes y semÃ¡ntica `extends:` enforced en runtime. |
| **Dependencias** | M1, M4 (parcial), M7 (validaciÃ³n previa de YAML) |
| **Prioridad** | P0 |
| **Complejidad** | Muy alta |
| **Agentes involucrados** | Workflow Agent (orquestador lÃ³gico), todos los agentes como participantes |
| **Entregables** | Motor de interpretaciÃ³n YAML; modelo de estado (pending â†’ running â†’ blocked â†’ completed/failed); enforcement de 9 fases y orden canÃ³nico ADR-0003; evaluador de condiciones (`plan-implementacion.md:status == approved`); gate checker integrado; persistencia de ejecuciÃ³n; API `WorkflowRun` |
| **Criterios de finalizaciÃ³n** | Workflow `lovable-to-web` ejecutable end-to-end en piloto; gates bloqueantes detienen flujo; merge `extends:` verificado en runtime; paridad funcional con guÃ­a manual de 18 pasos |

**Interfaces expuestas:**
- `Orchestrator.start(workflowId, projectId, trigger)` â†’ `WorkflowRun`
- `Orchestrator.advance(runId)` â€” siguiente paso elegible
- `Orchestrator.getStatus(runId)` â€” estado + artefactos

---

### M6: Agent Runtime Bridge

| Atributo | Detalle |
|----------|---------|
| **Estado** | ðŸ”„ **Iniciado** (ADR-0005 Accepted; adaptador `cursor-cloud` v0.1 + prototipo paso 1) |
| **Objetivo** | Abstraer la invocaciÃ³n de agentes sobre motores de ejecuciÃ³n externos (Claude Code, Cloud Agent, Cursor SDK) con contrato uniforme de prompt, contexto y artefactos. |
| **Dependencias** | M1, M4, M5 (parcial) â€” el prototipo v0.1 puede operar sin M5 para un solo paso |
| **Prioridad** | P1 |
| **Complejidad** | Muy alta |
| **Agentes involucrados** | Todos (como unidades invocables); Framework Architect (diseÃ±o) |
| **Entregables** | `AgentRuntime` interface; adaptadores: Claude Code, Cloud Agent, Cursor SDK; inyecciÃ³n de `project-context.yml`, reglas y memoria; restricciones por patrÃ³n (Planner/Executor/Validator); registro de invocaciones en mÃ©tricas |
| **Criterios de finalizaciÃ³n** | â‰¥2 runtimes soportados; invocaciÃ³n de agente desde M5 sin acoplamiento directo a `.claude/`; permisos de patrÃ³n enforced (Planner no escribe cÃ³digo productivo) |
| **Hecho en v0.1** | Contrato `docs/runtime/agent-runtime-contract.md`; guÃ­a `docs/cloud-agent-integration.md`; prototipo `prototypes/m6-cloud-agent/` (`lovable-analyzer`) |

**Interfaces expuestas:**
- `AgentRuntime.invoke(agentId, stepContract, context)` â†’ `AgentResult`
- `RuntimeAdapter` â€” plugin por motor externo

---

### M7: Validation & CI Layer

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Pendiente |
| **Objetivo** | ValidaciÃ³n estÃ¡tica de coherencia NADF en CI: schemas, alineaciÃ³n agenteâ†”registryâ†”workflow, semÃ¡ntica `extends:`, quality gates declarados. |
| **Dependencias** | M1 |
| **Prioridad** | P0 |
| **Complejidad** | Media |
| **Agentes involucrados** | Framework Architect, QA Agent, Reviewer Agent |
| **Entregables** | CLI `nadf-validate`; GitHub Action `nadf-coherence-check`; reglas: 27 agentes en registry, fases inmutables, backend-impact antes de Plan Review, reviewer en Validation; reporte de drift docsâ†”YAML |
| **Criterios de finalizaciÃ³n** | CI bloquea PR con YAML invÃ¡lido o incoherente; tiempo de validaciÃ³n < 2 min; integrado en repo framework y documentado en `docs/` |

**Interfaces expuestas:**
- `nadf-validate --project <id> --strict` â€” exit code 0/1
- `CoherenceReport` â€” findings categorizados (error/warning)

---

### M8: Project Onboarding Automation

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Manual (`setup-project-context` documentado) |
| **Objetivo** | Automatizar la incorporaciÃ³n de nuevos proyectos: estructura `.nadf/projects/`, `project-context.yml`, workflows que extienden globales, ADR de onboarding. |
| **Dependencias** | M1, M7 |
| **Prioridad** | P1 |
| **Complejidad** | Media |
| **Agentes involucrados** | Framework Architect, Planner Agent, Architect Agent, ADR Agent, Workflow Agent |
| **Entregables** | Comando/script `setup-project-context` ejecutable; plantillas parametrizadas; workflow `create-project.yml` invocable desde M5; checklist automatizado de validaciÃ³n post-onboarding |
| **Criterios de finalizaciÃ³n** | Nuevo proyecto onboarded en < 30 min; pasa `nadf-validate` sin errores; ADR de onboarding generado automÃ¡ticamente |

**Interfaces expuestas:**
- `Onboarder.create(config)` â†’ estructura de proyecto + ADR draft
- Plantillas en `.nadf/templates/project/`

---

### M9: Lovable Sync Pipeline

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Manual vÃ­a `novus-lovable-sync` |
| **Objetivo** | Automatizar el flujo end-to-end Lovable â†’ Web: detecciÃ³n de evento, 18 pasos, artefactos, PR y preparaciÃ³n para revisiÃ³n Cursor. |
| **Dependencias** | M4, M5, M6, M8; M3 y M2 para cierre de ciclo |
| **Prioridad** | P1 |
| **Complejidad** | Muy alta |
| **Agentes involucrados** | Los 27 agentes del workflow canÃ³nico |
| **Entregables** | Pipeline event-driven (`lovable.commit`); integraciÃ³n GitHub MCP (detecciÃ³n commit novus-nexus); ejecuciÃ³n orquestada de 18 pasos; generaciÃ³n de PR en NovusIntelligenceWEB/Back; verificaciÃ³n de gates (no copia Lovable, no mocks prod); comando `novus-lovable-sync` wired al motor M5 |
| **Criterios de finalizaciÃ³n** | Piloto completo: commit Lovable â†’ PR listo; tiempo < 2 h; 0 copia directa Lovable; 100% gates pass; mÃ©tricas + reflexiÃ³n + KB update generados |

**Interfaces expuestas:**
- `LovableSyncPipeline.run(projectId, event)` â†’ `PipelineResult`
- Evento: `lovable.commit` en repo design_source

---

### M10: Multi-Project & Multi-Tenant Support

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ DiseÃ±o declarativo (estructura `.nadf/projects/`) |
| **Objetivo** | Ejecutar y aislar mÃºltiples proyectos NADF simultÃ¡neamente con contextos, reglas, mÃ©tricas y KB segregados. |
| **Dependencias** | M5, M8, M2, M3 |
| **Prioridad** | P2 |
| **Complejidad** | Alta |
| **Agentes involucrados** | Framework Architect, Workflow Agent |
| **Entregables** | ResoluciÃ³n de proyecto activo; aislamiento de artefactos/mÃ©tricas/KB; registry de proyectos; polÃ­tica de recursos compartidos vs. segregados; documentaciÃ³n multi-tenant |
| **Criterios de finalizaciÃ³n** | â‰¥2 proyectos activos sin interferencia; `extends:` y workflows globales compartidos sin deriva; validaciÃ³n CI por proyecto |

---

### M11: Multi-Cloud Provider Abstraction

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Declarado en `provider-independence.md` |
| **Objetivo** | Desacoplar operaciones cloud de AWS mediante capa de abstracciÃ³n sobre MCP y contratos de capacidad, permitiendo segundo proveedor (Azure/GCP). |
| **Dependencias** | M4 |
| **Prioridad** | P2 |
| **Complejidad** | Alta |
| **Agentes involucrados** | Cloud Agent, DevOps Agent, Backend Agent |
| **Entregables** | `CloudProvider` interface; adaptador AWS (actual); adaptador secundario (PoC); mapping de capacidades (Lambdaâ†”Functions, S3â†”Blob, etc.); ADR de estrategia multi-cloud |
| **Criterios de finalizaciÃ³n** | Cloud Agent opera con â‰¥2 proveedores en escenario de prueba; cambio de proveedor sin modificar skill registry ni workflows |

---

### M12: Multi-LLM Provider Abstraction

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Acoplado a Claude/Cursor |
| **Objetivo** | Permitir intercambio de proveedor LLM en M6 sin alterar definiciones de agentes, prompts base ni contratos de artefactos. |
| **Dependencias** | M6 |
| **Prioridad** | P2 |
| **Complejidad** | Alta |
| **Agentes involucrados** | Framework Architect; todos vÃ­a M6 |
| **Entregables** | `LLMProvider` interface; configuraciÃ³n por proyecto (`llm_provider`, `model`); adaptadores mÃºltiples; polÃ­tica de fallback y lÃ­mites de costo |
| **Criterios de finalizaciÃ³n** | Mismo workflow ejecutado con â‰¥2 proveedores LLM; paridad de gates y artefactos; ADR de selecciÃ³n de modelo por tipo de agente |

---

### M13: Observability & Dashboard

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Pendiente |
| **Objetivo** | Visibilidad operacional: estado de workflows, mÃ©tricas agregadas, reflexiones, ADRs y salud MCP en un dashboard consumible por humanos. |
| **Dependencias** | M3, M5; M4 para telemetrÃ­a MCP |
| **Prioridad** | P2 |
| **Complejidad** | Alta |
| **Agentes involucrados** | Metrics Agent, Documentation Agent; consumo humano (Cursor, web interna) |
| **Entregables** | Dashboard (web o integrado); vistas: workflows activos/histÃ³rico, KPIs de visiÃ³n, gates fallidos, timeline ADR; export CSV/JSON; alertas bÃ¡sicas (gate fail, MCP down) |
| **Criterios de finalizaciÃ³n** | Dashboard refleja ejecuciones piloto en tiempo diferido < 5 min; KPIs de `vision.md` visualizados; acceso role-based |

---

### M14: Security & Compliance Hardening

| Atributo | Detalle |
|----------|---------|
| **Estado** | â³ Reglas declarativas (`security-rules.md`) |
| **Objetivo** | Endurecer seguridad operativa: secrets scanning, permisos MCP, audit trail, compliance con polÃ­ticas Novus (no deploy sin aprobaciÃ³n, no secrets en cÃ³digo). |
| **Dependencias** | M4, M5, M7; M6 para restricciones runtime |
| **Prioridad** | P1 (continuo), P0 para controles bloqueantes |
| **Complejidad** | Alta |
| **Agentes involucrados** | Security Agent, Reviewer Agent, ADR Agent |
| **Entregables** | Scanner de secrets en CI; audit log de operaciones MCP y despliegues; enforcement de `no deploy without approval`; revisiÃ³n periÃ³dica de permisos por agente; runbook de incidentes; integraciÃ³n con Security Agent en Validation |
| **Criterios de finalizaciÃ³n** | Cero secrets en PRs (CI block); audit trail completo por workflow run; operaciones destructivas MCP requieren aprobaciÃ³n humana registrada; Security Agent pass obligatorio antes de merge |

---

## 5. Diagrama de dependencias entre mÃ³dulos

```mermaid
flowchart TD
    M0[M0: Foundation & Governance<br/>âœ… Completado]

    M1[M1: Contract & Schema Layer]
    M7[M7: Validation & CI Layer]
    M4[M4: MCP Integration Layer]
    M2[M2: Knowledge Base Engine]
    M3[M3: Metrics & Reflection]
    M5[M5: Workflow Engine / Orchestrator]
    M6[M6: Agent Runtime Bridge]
    M8[M8: Project Onboarding]
    M9[M9: Lovable Sync Pipeline]
    M10[M10: Multi-Project / Multi-Tenant]
    M11[M11: Multi-Cloud Abstraction]
    M12[M12: Multi-LLM Abstraction]
    M13[M13: Observability Dashboard]
    M14[M14: Security & Compliance]

    M0 --> M1
    M1 --> M7
    M1 --> M2
    M1 --> M4
    M1 --> M5
    M1 --> M6
    M1 --> M8

    M7 --> M8
    M7 --> M5

    M2 --> M3
    M3 --> M13

    M4 --> M5
    M4 --> M6
    M4 --> M9
    M4 --> M11
    M4 --> M14

    M5 --> M6
    M5 --> M9
    M5 --> M10
    M5 --> M13
    M5 --> M14

    M6 --> M9
    M6 --> M12

    M8 --> M9
    M8 --> M10

    M2 --> M9
    M3 --> M9

    M9 --> M10

    M11 -.-> M9
    M12 -.-> M9
    M13 -.-> M10
    M14 -.-> M9

    classDef done fill:#d4edda,stroke:#28a745
    classDef critical fill:#fff3cd,stroke:#ffc107
    classDef future fill:#e2e3e5,stroke:#6c757d

    class M0 done
    class M1,M4,M5,M7 critical
    class M10,M11,M12,M13 future
```

**Leyenda:** lÃ­nea sÃ³lida = dependencia dura; lÃ­nea punteada = dependencia opcional o de refuerzo transversal.

---

## 6. Orden de implementaciÃ³n recomendado

Secuencia optimizada para **mÃ¡ximo valor temprano** y **mÃ­nimo rework**, con hitos verificables:

| Orden | MÃ³dulo | Fase | JustificaciÃ³n |
|-------|--------|------|---------------|
| **0** | M0 | 0 | âœ… Base completada; mantener sincronizado |
| **1** | M1 | 2 | Desbloquea validaciÃ³n, orquestador y contratos de artefactos |
| **2** | M7 | 2 | CI inmediato; previene regresiÃ³n post ADR-0003 |
| **3** | M4.1 (GitHub) | 3 | Prerrequisito para detecciÃ³n Lovable y PRs automatizados |
| **4** | M2 | 3 | Destino operativo para reflexiÃ³n antes de escalar automatizaciÃ³n |
| **5** | M3 | 3 | Trazabilidad de ejecuciones manuales y futuras automÃ¡ticas |
| **6** | M4.2 (AWS) | 3 | Cloud/Backend agents en piloto |
| **7** | M5 | 4 | NÃºcleo de automatizaciÃ³n; depende de M1, M7, M4 parcial |
| **8** | M6 | 4 | En paralelo parcial con M5 una vez contratos M1 estables |
| **9** | M14 (core) | 4 | Gates de seguridad en CI y MCP antes de pipeline completo |
| **10** | M8 | 5 | Replicabilidad mÃ¡s allÃ¡ del piloto |
| **11** | M9 | 5 | Objetivo de negocio: Lovable â†’ PR |
| **12** | M13 | 6 | Visibilidad para operaciÃ³n multi-workflow |
| **13** | M10 | 6 | Escala a mÃºltiples productos Novus |
| **14** | M11 | 7 | Tras estabilizar piloto AWS |
| **15** | M12 | 7 | Tras estabilizar M6 |
| **16** | M14 (completo) | 6â€“7 | Hardening continuo |
| **17** | M4.3â€“4.4 | 6+ | Database, Terraform, Jira, K8s segÃºn demanda |

### Hitos (milestones)

| Hito | MÃ³dulos | Fecha orientativa | SeÃ±al de Ã©xito |
|------|---------|-------------------|----------------|
| **H1 â€” Contratos firmes** | M1 + M7 | Q3 2026 | CI verde en framework; cero drift YAML |
| **H2 â€” MCP mÃ­nimo** | M4.1 + M4.2 | Q3â€“Q4 2026 | Agentes acceden GitHub/AWS vÃ­a gateway |
| **H3 â€” Conocimiento vivo** | M2 + M3 | Q4 2026 | KB poblada; mÃ©tricas por ejecuciÃ³n piloto |
| **H4 â€” Orquestador MVP** | M5 + M6 | Q1 2027 | Un workflow ejecutable con gates enforced |
| **H5 â€” Lovable automÃ¡tico** | M9 | Q1â€“Q2 2027 | PR desde commit Lovable en piloto |
| **H6 â€” Escala** | M10 + M13 + M14 | Q2â€“Q3 2027 | Multi-proyecto con dashboard y audit |
| **H7 â€” Proveedores** | M11 + M12 | Q4 2027 | Segundo cloud + segundo LLM verificados |

---

## 7. Riesgos del roadmap y mitigaciones

| Riesgo | Prob. | Impacto | MitigaciÃ³n |
|--------|-------|---------|------------|
| **Sobre-ingenierÃ­a del orquestador (M5)** antes de contratos estables | Media | Alto | M1 + M7 obligatorios antes de M5; MVP con un solo workflow (`lovable-to-web`) |
| **Deriva docs â†” YAML** tras Fase 0 | Alta | Medio | M7 en CI; ADR obligatorio por cambio de workflow; revisiÃ³n Framework Architect |
| **Acoplamiento persistente a `.claude/`** | Media | Alto | M6 como capa obligatoria; prohibir invocaciÃ³n directa desde M5 |
| **MCP no disponible o inestable** | Media | Alto | Fallback manual documentado; M5 debe soportar `step_mode: manual_override` |
| **Scope creep en M9** (automatizar 18 pasos a la vez) | Alta | Alto | Entregas incrementales por fase (Planning automÃ¡tico primero, luego Execution) |
| **KB vacÃ­a â†’ reflexiÃ³n sin valor** | Media | Medio | M2 antes de escalar M9; plantillas KB mÃ­nimas desde dÃ­a 1 |
| **Bypass de MCP por agentes** | Media | Alto | M14 audit + M4 gateway Ãºnico; CI detecta SDK directo en prompts/skills |
| **Multi-cloud/LLM prematuro** | Media | Medio | M11/M12 en Fase 7; AWS + Claude como baseline hasta H5 |
| **Costo LLM en pipeline completo** | Alta | Medio | M12 lÃ­mites de costo; pasos condicionales ya definidos en YAML |
| **RegresiÃ³n de orden Planning/Execution** | Baja | CrÃ­tico | M7 regla ADR-0003; tests de orden de pasos en CI |
| **Secrets en artefactos generados** | Media | CrÃ­tico | M14 scanner; Security Agent gate; revisiÃ³n humana pre-merge |
| **Dependencia de aprobaciÃ³n humana mal modelada** | Media | Alto | M5 estado `awaiting_human_approval`; audit en M14 |

---

## 8. MÃ©tricas de progreso

### 8.1 MÃ©tricas de madurez del framework

| MÃ©trica | Baseline (Fase 1) | Objetivo H4 | Objetivo H7 |
|---------|-------------------|-------------|-------------|
| PuntuaciÃ³n arquitectÃ³nica | 7.8/10 | 8.5/10 | â‰¥9.0/10 |
| MÃ³dulos completados (M0â€“M14) | 1/15 (~95% M0) | 9/15 | 15/15 |
| YAML validado por schema | 0% | 100% | 100% |
| Workflows con CI coherence check | 0% | 100% | 100% |
| Servidores MCP operativos | 0 | 2 (GitHub, AWS) | â‰¥6 |
| Ejecuciones con mÃ©tricas registradas | 0% | 80% | 100% |
| Workflows con reflexiÃ³n + KB update | 0% | 80% | 100% |
| Gates enforced automÃ¡ticamente | 0% | 70% | 100% |
| Tiempo Lovable â†’ PR listo (piloto) | Manual (horas) | < 4 h | < 2 h |
| Proyectos onboarded vÃ­a M8 | 1 (manual) | 2 | â‰¥5 |

### 8.2 KPIs operativos (alineados a `vision.md`)

| KPI | Objetivo |
|-----|----------|
| Tasa de rechazo QA | < 15% |
| Decisiones arquitectÃ³nicas documentadas (ADR) | 100% |
| Copia directa de Lovable | 0% |
| Mocks en producciÃ³n | 0% |
| Planes aprobados antes de ejecuciÃ³n | 100% |
| Workflows de implementaciÃ³n con reflexiÃ³n | 100% |

### 8.3 Seguimiento por mÃ³dulo

Cada mÃ³dulo reporta estado en escala:

| Estado | Significado |
|--------|-------------|
| **No iniciado** | Sin entregables |
| **En diseÃ±o** | ADR o contrato en progreso |
| **En desarrollo** | ImplementaciÃ³n activa |
| **En piloto** | ValidaciÃ³n con `novus-intelligence` |
| **Completo** | Criterios de finalizaciÃ³n cumplidos |
| **Estable** | Operando en â‰¥2 proyectos o â‰¥3 meses sin regresiÃ³n crÃ­tica |

**Cadencia de revisiÃ³n:** quincenal (Framework Architect + stakeholders); actualizaciÃ³n de este documento en cada hito H1â€“H7.

### 8.4 Definition of Done (DoD) global del roadmap

El roadmap se considerarÃ¡ **materializado** cuando:

1. M0â€“M9 estÃ©n en estado **Completo** o **Estable** en el piloto.
2. CI (M7) bloquee incoherencias en todos los PRs del framework.
3. Al menos una ejecuciÃ³n end-to-end M9 demuestre paridad con el flujo manual de 18 pasos.
4. PuntuaciÃ³n arquitectÃ³nica â‰¥ 9.0 en revisiÃ³n tipo `architecture-review-final.md`.
5. ADR por mÃ³dulo mayor (M1, M4, M5, M6, M9) registrado en `.nadf/global/decision-history/adr/`.

---

## Referencias

- [VisiÃ³n NADF](vision.md)
- [Arquitectura multiagente](multiagent-architecture.md)
- [Modelo de workflows](workflow-model.md)
- [IntegraciÃ³n MCP](mcp-integration.md)
- [RevisiÃ³n arquitectÃ³nica final](architecture-review-final.md)
- [ADR-0002](../.nadf/global/decision-history/adr/ADR-0002-multiagent-patterns.md)
- [ADR-0003](../.nadf/global/decision-history/adr/ADR-0003-lovable-to-web-canonicalization.md)
- [Project context piloto](../.nadf/projects/novus-intelligence/project-context.yml)
- [CLAUDE.md](../CLAUDE.md)

---

*Documento de arquitectura â€” solo planificaciÃ³n. No implica implementaciÃ³n de cÃ³digo. VersiÃ³n 1.0.0 â€” 2026-07-04.*
