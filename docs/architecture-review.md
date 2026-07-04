# Revisión arquitectónica — NovusAIDevelopmentFramework (NADF)

**Repositorio:** `c:\NovusIntelligence\FrameworkMultiagenticoIA\Workspace\NovusAIDevelopmentFramework`  
**Fecha:** 2026-07-04  
**Alcance:** Revisión arquitectónica exclusiva (sin código productivo)  
**Versión analizada:** NADF 2.0.0 · rama `feature/nadf-foundation`

> **Nota (post-revisión):** La divergencia workflow global ↔ proyecto (18 vs 15 pasos) fue resuelta según [ADR-0003](../.nadf/global/decision-history/adr/ADR-0003-lovable-to-web-canonicalization.md). Ver [architecture-review-final.md](architecture-review-final.md) para el estado actual.

---

## Resumen ejecutivo

NADF es un **framework declarativo de gobernanza multiagente** (Markdown + YAML), no un runtime ejecutable. Presenta documentación extensa y una visión arquitectónica coherente: 7 capas, 7 patrones, 19 agentes, modelo de 9 fases, MCP-first e independencia de proveedor declarada. Constituye una base sólida para Fase 1 piloto.

Las brechas más relevantes son: **orquestador inexistente** (ejecución manual), **divergencia crítica entre el workflow global y el de proyecto** `novus-intelligence` (orden de fases invertido para `backend-impact-agent`), **ausencia de contratos formales** (JSON Schema para YAML de config), **Knowledge Base vacía**, **MCP documentado pero no operacionalizado**, y **sin CI/validador de coherencia**.

El framework es apto como **guía operativa manual** con supervisión humana; no es production-ready como plataforma enterprise autónoma.

**Puntuación arquitectónica: 7.0/10**

---

## Fortalezas

1. **Separación conceptual en 7 capas** — Design Source → Planning → Execution → Validation → Knowledge → Tooling → Runtime, documentada en `docs/architecture.md`, `docs/multiagent-architecture.md` y ADR-0002.
2. **Modelo dual 19 agentes** — Paridad 1:1 entre `.claude/agents/*.md` (19 archivos) y `.nadf/global/skill-registry/*.yml` (19 archivos) con referencias cruzadas `definition:` verificables.
3. **Gobernanza centralizada en `CLAUDE.md`** — Reglas obligatorias: contexto, MCP, prohibición Lovable, quality gates, ADR, métricas, reflexión, alcance prohibido.
4. **Workflow library global (8 workflows)** — `.nadf/global/workflow-library/` alineados al modelo de 9 fases.
5. **Trazabilidad** — ADR-0001/0002, `metrics-schema.json` (JSON Schema draft-07), `memory/decision-log.md`, carpeta `artifacts/` por proyecto.
6. **Onboarding multi-proyecto** — `docs/project-onboarding.md`, comando `setup-project-context`, workflow `create-project.yml`.
7. **Abstracción de proveedor en diseño** — `provider-independence.md` y `environments/dev.yml` usan capacidades (`object_storage`, `nosql_database`) además de `provider: aws`.
8. **Alcance consciente Fase 1** — `orchestrator-pattern.md` declara orquestación manual; `CLAUDE.md` prohíbe implementar orquestador productivo.
9. **Reglas por proyecto** — `.nadf/projects/novus-intelligence/rules/` complementan reglas globales sin duplicación excesiva.

---

## Debilidades

1. **Orquestador inexistente** — Mediator documentado; ejecución manual vía `novus-lovable-sync`. Sin motor de estados, ramificaciones automáticas ni enforcement de gates.
2. **Divergencia crítica `lovable-to-web`** — Global: 18 pasos, incluye `workflow-agent` y `reviewer-agent`, `backend-impact-agent` en Planning **antes** de Plan Review. Proyecto: 15 pasos, omite ambos agentes, coloca `backend-impact-agent` en paso 5 **después** del frontend (paso 4).
3. **Inconsistencia documental interna** — `workflow-model.md` (tabla 9 fases) exige Backend Impact en Planning, pero su sección de proyecto (líneas 92-94) y `novus-lovable-sync.md` (tabla fases: Planning = pasos 1,2,5) codifican el orden invertido.
4. **`extends:` sin especificación** — Usado en `.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml` pero no documentado en `workflow-model.md`. El proyecto redefine todos los pasos; la herencia es nominal.
5. **`project-context.yml` incompleto** — `agents_enabled`: 15/19 (faltan `workflow-agent`, `reviewer-agent`, `devops-agent`, `framework-architect-agent`). Quality gates omiten métricas, reflexión y ADR vs `CLAUDE.md`.
6. **ADR-0001 obsoleto** — Describe 6 capas y 6 agentes; ADR-0002 introduce 7 capas y 19 agentes sin marcar ADR-0001 como *Superseded*.
7. **Knowledge Base vacía** — Solo `knowledge-base/README.md`; subdirectorios (`architecture-patterns/`, `common-errors/`, `reusable-components/`) no existen.
8. **Sin JSON Schema para YAML de configuración** — Solo `metrics-schema.json`. No hay esquemas para `project-context.yml`, skill-registry ni workflows.
9. **MCP documentado, no operacionalizado** — `docs/mcp-integration.md` define servidores; no hay `.nadf/global/mcp/`, manifests ni configs verificables.
10. **Acoplamiento AWS práctico** — `project-context.yml` (`cloud: AWS`, Serverless Framework), `backend-impact-rules.md` y agentes (`cloud-agent.md`, `database-agent.md`) referencian Lambda/DynamoDB directamente.
11. **Runtime acoplado a `.claude/`** — Sin abstracción para otros motores (Cursor SDK, LangGraph, OpenAI Agents).
12. **Sin CI ni validador estático** — No existe `.github/`; no hay linter de coherencia agente/registry/workflow.
13. **`devops-agent` ausente del workflow piloto** — Solo aparece en `cloud-deployment.yml` global, no en `lovable-to-web`.

---

## Riesgos

| Riesgo | Severidad | Evidencia |
|--------|-----------|-----------|
| Ejecución frontend sin evaluación backend previa | **Alto** | Proyecto paso 4 (Execution) antes paso 5 (Planning/backend-impact) |
| Plan Review sin alcance backend/infra completo | **Alto** | Architect paso 3 sin `evaluacion-backend.md` previa |
| Omisión Reviewer Agent en validación | **Medio** | Ausente en workflow proyecto y `agents_enabled` |
| Deriva documentación ↔ configuración | **Medio** | 18 vs 15 pasos; ADR-0001 vs 0002; `workflow-model.md` contradictorio |
| Orquestación manual → errores humanos | **Medio** | Sin motor; gates no enforceables automáticamente |
| MCP inexistente → bypass de reglas MCP-first | **Medio** | Sin configs MCP en repo |
| Multi-proyecto sin validación cross-project | **Bajo** | Sin esquema formal ni CI |
| KB vacía → repetición de errores | **Bajo** | Reflection sin destino operativo |

---

## Mejoras prioritarias (ordenadas)

1. **Reconciliar `lovable-to-web` global y proyecto** — Backend Impact y Workflow Agent en Planning; Plan Review completo antes de Execution; incluir Reviewer en Validation. Actualizar `novus-lovable-sync.md` y `workflow-model.md`.
2. **Especificar semántica `extends:`** en `workflow-model.md` — Merge de steps/agents/gates, o eliminar `extends` si es decorativo.
3. **Actualizar `project-context.yml`** — Completar `agents_enabled` (19/19), quality gates alineados con `CLAUDE.md`, referencia al workflow canónico global.
4. **Superseder ADR-0001** — Estado "Superseded by ADR-0002" o ADR-0003 de transición.
5. **Definir JSON Schemas** — `project-context.schema.json`, `skill-registry.schema.json`, `workflow.schema.json`.
6. **Documentar contratos de artefactos** — Schemas para `cambios-lovable.json`, `plan-implementacion.md` (status), `qa-result.json`.
7. **Validador estático + CI** — Verificar 19 agentes ↔ 19 YAML, referencias `definition:` válidas, workflows referencian agentes existentes, coherencia de fases.
8. **Plantilla MCP mínima** — `.nadf/global/mcp/` con servidores esperados, permisos por agente y variables de entorno.

---

## Mejoras futuras

- Motor de orquestación con estados y gates bloqueantes (intérprete YAML).
- Capa `.nadf/global/runtime/` desacoplada de `.claude/` para multi-LLM.
- Dashboard de métricas consumiendo `metrics-schema.json`.
- KB operativa poblada desde Reflection Agent.
- CI/CD event-driven (webhooks GitHub/Jira → Workflow Agent).
- Templates multi-cloud Azure/GCP en `environments/` con ADR por migración.
- Testing dry-run de workflows con fixtures de artefactos.

---

## Puntuación arquitectónica: 7.0/10

| Criterio | Nota | Comentario |
|----------|------|------------|
| Organización de carpetas | 8/10 | Estructura `.nadf/`, `docs/`, `.claude/` clara y predecible |
| Separación de responsabilidades | 7/10 | Bien en docs/agentes; rota en workflow proyecto |
| Componentes duplicados | 6/10 | `lovable-to-web.yml` duplicado con divergencia pese a `extends` |
| Dependencias incorrectas | 5/10 | Orden invertido Planning/Execution en workflow piloto |
| Escalabilidad | 6/10 | Multi-proyecto diseñado; sin runtime ni validación automática |
| Consistencia agentes | 8/10 | 19/19 pares MD↔YAML alineados |
| Consistencia workflows | 4/10 | Divergencia global/proyecto crítica |
| Calidad `CLAUDE.md` | 8/10 | Referencia operativa clara; falta procedimiento de reconciliación |
| Calidad `project-context.yml` | 6/10 | Bien estructurado; incompleto en agentes y gates |
| Documentación | 8/10 | 15 docs; inconsistencias internas en orden de fases |
| Claude Code / Cloud Agent | 6/10 | `.claude/` listo; sin config cloud ni hooks |
| MCP | 5/10 | Documentado; no implementado en repo |
| Multi-proyecto | 7/10 | Onboarding sólido; un solo proyecto configurado |
| Multi-cloud | 6/10 | Reglas buenas; acoplamiento AWS en práctica |
| Multi-LLM | 6/10 | Reglas declaradas; runtime acoplado a Claude/Cursor |

**Justificación:** Fundamento documental sólido con gaps ejecutables e inconsistencias operativas. Framework de gobernanza Fase 1, no enterprise production-ready.

---

## Tablas comparativas

### Agentes: `.claude/agents/` vs `skill-registry/` vs `project-context.yml`

| Agente | MD | YAML | project-context |
|--------|:--:|:----:|:---------------:|
| framework-architect-agent | ✓ | ✓ | ✗ |
| lovable-analyzer-agent | ✓ | ✓ | ✓ |
| planner-agent | ✓ | ✓ | ✓ |
| architect-agent | ✓ | ✓ | ✓ |
| workflow-agent | ✓ | ✓ | ✗ |
| backend-impact-agent | ✓ | ✓ | ✓ |
| frontend-integration-agent | ✓ | ✓ | ✓ |
| backend-agent | ✓ | ✓ | ✓ |
| database-agent | ✓ | ✓ | ✓ |
| cloud-agent | ✓ | ✓ | ✓ |
| devops-agent | ✓ | ✓ | ✗ |
| qa-agent | ✓ | ✓ | ✓ |
| security-agent | ✓ | ✓ | ✓ |
| reviewer-agent | ✓ | ✓ | ✗ |
| documentation-agent | ✓ | ✓ | ✓ |
| metrics-agent | ✓ | ✓ | ✓ |
| reflection-agent | ✓ | ✓ | ✓ |
| knowledge-base-agent | ✓ | ✓ | ✓ |
| adr-agent | ✓ | ✓ | ✓ |

**Resumen:** 19/19 pares MD↔YAML alineados. `project-context.yml` habilita 15 de 19 agentes; ausentes: `workflow-agent`, `reviewer-agent`, `devops-agent`, `framework-architect-agent`.

### Workflows: global vs proyecto (`lovable-to-web`)

| Aspecto | Global (`.nadf/global/workflow-library/lovable-to-web.yml`) | Proyecto (`.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml`) |
|---------|--------------------------------------------------------------|----------------------------------------------------------------------------|
| Pasos totales | 18 | 15 |
| workflow-agent | ✓ (event_trigger, paso 1) | ✗ |
| backend-impact fase | Planning (paso 5, **antes** de Plan Review) | Paso 5, fase Planning, **después** de frontend (paso 4) |
| Plan Review (architect) | Paso 6, con evaluación backend previa | Paso 3, **sin** evaluación backend previa |
| reviewer-agent | ✓ (validation, paso 13) | ✗ |
| devops-agent | ✗ | ✗ |
| extends | N/A (workflow canónico) | `extends: lovable-to-web` (sin merge documentado) |
| Comando referencia | Indirecto | `novus-lovable-sync.md` → workflow proyecto |
| Event trigger explícito | ✓ (workflow-agent + cargar-contexto) | ✗ (omite fase event_trigger) |

**Impacto:** El workflow de proyecto invierte el orden crítico Planning/Execution para backend-impact y omite validación de coherencia (Reviewer), generando riesgo alto de implementación frontend sin evaluación backend previa.

### Quality gates: `CLAUDE.md` vs `project-context.yml`

| Gate | CLAUDE.md | project-context |
|------|:---------:|:---------------:|
| plan_approved | ✓ | ✓ |
| no_lovable_code_copy | ✓ | ✓ |
| no_mock_data_in_production | ✓ | ✓ |
| build_success | ✓ | ✓ |
| responsive_validation | ✓ | ✓ |
| seo_basic_validation | ✓ | ✓ |
| security_pass | ✓ | ✓ |
| metrics_registered | ✓ | ✗ |
| reflection_generated | ✓ | ✗ |
| adr_if_architectural | ✓ | ✗ |

---

## Evaluación detallada por las 15 áreas

### 1. Organización de carpetas — **8/10**

Estructura clara y predecible:

| Ruta | Propósito |
|------|-----------|
| `.nadf/global/` | Reglas, skill-registry, workflow-library, metrics, ADRs, knowledge-base |
| `.nadf/projects/<proyecto>/` | project-context, workflows, rules, memory, artifacts, environments |
| `.claude/agents/` | Definiciones operativas de agentes (Markdown) |
| `.claude/commands/` | Comandos de invocación manual |
| `docs/` | Documentación arquitectónica y operativa |

Separación `global/` vs `projects/` facilita multi-proyecto. Faltan carpetas `.nadf/global/mcp/` y `.nadf/global/runtime/` previstas conceptualmente.

### 2. Separación de responsabilidades — **7/10**

Fuerte en definición de agentes por capa (Planning no modifica código; Execution no cambia arquitectura sin ADR). Débil en el workflow piloto `novus-intelligence`: frontend se ejecuta antes de evaluar backend-impact, rompiendo el principio documentado en `planning-execution-validation.md`.

### 3. Componentes duplicados — **6/10**

`lovable-to-web.yml` existe en global y proyecto con contenido divergente pese a `extends: lovable-to-web`. La herencia no reduce duplicación ni garantiza alineación. Reglas de proyecto (`rules/*.md`) complementan reglas globales sin duplicación excesiva.

### 4. Dependencias incorrectas — **5/10**

Dependencia invertida en workflow proyecto: paso 4 (frontend, Execution) precede paso 5 (backend-impact, Planning). Plan Review (paso 3) ocurre sin `evaluacion-backend.md`. El workflow global corrige este orden pero no es el referenciado por `novus-lovable-sync.md`.

### 5. Escalabilidad — **6/10**

Diseño extensible para multi-proyecto (workflow-library, skill-registry compartido, environments por entorno). Cuello de botella: orquestación manual, ausencia de validación automática, KB vacía y sin motor de estados. Añadir proyectos escala documentalmente, no operativamente.

### 6. Consistencia agentes — **8/10**

19 archivos `.md` y 19 archivos `.yml` en skill-registry con correspondencia 1:1. Referencias `definition:` verificables. Contenido alineado en muestra (`lovable-analyzer-agent`, `planner-agent`). Gaps en `project-context.yml` (4 agentes ausentes en `agents_enabled`).

### 7. Consistencia workflows — **4/10**

Divergencia crítica global (18 pasos) vs proyecto (15 pasos). Agentes omitidos: `workflow-agent`, `reviewer-agent`. Orden de fases incompatible. Requiere reconciliación urgente antes de operación piloto.

### 8. Calidad `CLAUDE.md` — **8/10**

Referencia operativa clara: 19 agentes, 7 capas, quality gates completos, prohibiciones Lovable, MCP-first, métricas y reflexión obligatorias. Enlaza documentación y ADR-0002. No incluye procedimiento de reconciliación cuando workflow proyecto diverge del global.

### 9. Calidad `project-context.yml` — **6/10**

Bien estructurado (application, architecture, repositories, multiagent, quality_gates, metadata). Incompleto: 15/19 agentes en `agents_enabled`; gates omiten métricas, reflexión y ADR; `orchestrator: conceptual` sin enlace al workflow canónico global; acoplamiento AWS explícito.

### 10. Calidad documentación — **8/10**

15 documentos en `docs/` con cobertura amplia (visión, arquitectura, agentes, workflows, MCP, patrones, onboarding). Inconsistencias internas: ADR-0001 obsoleto; `workflow-model.md` no documenta `extends:`; orden de pasos en workflow-model vs `planning-execution-validation.md`.

### 11. Claude Code / Cloud Agent — **6/10**

`.claude/agents/` (19 agentes) y `.claude/commands/` (2 comandos) listos para invocación manual. Sin configuración Cloud Agent, hooks de ejecución ni automatización de gates. Dependencia total del operador humano como orquestador.

### 12. MCP — **5/10**

`docs/mcp-integration.md` define principios, servidores previstos (GitHub, AWS, Database, Terraform, Jira, Docker/K8s) y flujo con orquestador. Permisos declarados en skill-registry (`mcp_servers` en project-context: github, aws). Sin configs MCP, manifests ni servidores verificables en el repositorio.

### 13. Multi-proyecto — **7/10**

Onboarding documentado (`project-onboarding.md`, `create-project.yml`, `setup-project-context`). Estructura `.nadf/projects/<proyecto>/` aislada por proyecto. Un solo proyecto configurado (`novus-intelligence`). Falta validación cross-project y esquema formal de `project-context.yml`.

### 14. Multi-cloud — **6/10**

`provider-independence.md` y `environments/*.yml` usan abstracciones (`object_storage`, `nosql_database`, `provider: aws`). Implementación práctica AWS-centric: Serverless Framework, DynamoDB, región `us-east-1` en project-context y agentes. Sin templates Azure/GCP ni ADR de migración.

### 15. Multi-LLM — **6/10**

`provider-independence.md` declara independencia de LLM y runtime. Runtime acoplado a `.claude/` (Claude Code/Cursor). Sin capa `.nadf/global/runtime/`, configuración de proveedor/modelo ni abstracción verificable para OpenAI, Anthropic API directa u otros motores.

---

## Conclusión

NADF 2.0.0 constituye una **base documental sólida** para gobernanza multiagente en Fase 1 piloto. La arquitectura conceptual (7 capas, 7 patrones, 19 agentes, 9 fases) es coherente y trazable. Las brechas más urgentes son la **divergencia del workflow `lovable-to-web`**, la **ausencia de orquestador ejecutable** y la **falta de contratos formales** (JSON Schema, MCP operacional, validador CI).

La puntuación **7.0/10** refleja un framework apto como guía operativa manual para equipos que ejecutan workflows con supervisión humana, pero **no production-ready** como plataforma enterprise autónoma hasta resolver las mejoras prioritarias 1–8.

---

*Revisión arquitectónica generada el 2026-07-04. No modifica configuración ni código productivo.*
