<!-- NADF-GUIDE
Propósito: Documenta ADR-0005: NADF adopta Agent Runtime Bridge (M6) con Cursor Cloud Agent como primer adaptador.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# ADR-0005: NADF adopta Agent Runtime Bridge (M6) con Cursor Cloud Agent como primer adaptador

## Estado

Accepted

## Fecha

2026-07-14

## Contexto

NADF 2.0 dispone de Meta Model normativo (ADR-0004), arquitectura multiagente (ADR-0002), workflow canónico Lovable→Web (ADR-0003) y 19 agentes declarativos. La ejecución real se realiza hoy de forma **manual** (Cursor IDE / Claude Code) interpretando `.claude/agents/*.md`.

El roadmap define el módulo **M6 — Agent Runtime Bridge** como abstracción entre roles NADF y motores de ejecución externos. El equipo ya cuenta con **Cursor Cloud Agent** y necesita un puente formal que:

1. No acople el Meta Model a un proveedor de IA concreto.
2. Permita invocar un rol NADF (p. ej. `lovable-analyzer-agent`) de forma repetible.
3. Preserve Planner ≠ Executor ≠ Validator.
4. Registre trazas (`agentId`, `runId`) para métricas y reflexión.

## Problema

Sin un contrato de runtime:

- Cada integración reinventaría prompts y repos.
- Cloud Agent se confundiría con el rol NADF `cloud-agent` (IaC).
- No habría camino claro hacia el orquestador M5.
- El framework permanecería como documentación sin puente ejecutable verificable.

## Decisión

1. Se adopta el contrato **`AgentRuntime`** documentado en `docs/runtime/agent-runtime-contract.md` como interfaz oficial M6.
2. El **primer adaptador** es **Cursor Cloud Agent** vía Cursor SDK (`@cursor/sdk`, opción `cloud:`).
3. Adaptadores futuros (Local Cursor SDK, Claude Code, otros) implementan el mismo contrato.
4. Un **prototipo mínimo** en `prototypes/m6-cloud-agent/` demuestra la invocación del paso 1 (`lovable-analyzer-agent`).
5. **No** se implementa aún el orquestador completo de 18 pasos (pertenece a M5).
6. La guía operativa es `docs/cloud-agent-integration.md`.

## Motivación

- Separar **definición de agente** (NADF) de **motor de ejecución** (Cloud Agent).
- Habilitar automatización incremental sin romper independencia de proveedor.
- Preparar M5 para orquestar `AgentRuntime.invoke(...)` sin conocer Cursor.

## Beneficios

- Contrato único para todos los motores.
- Reutilización de roles `.claude/agents/*.md` sin duplicarlos en la UI Cloud.
- Trazabilidad (`bc-*` agent IDs) alineada a Metrics/Reflection.
- Onboarding de apps nuevas sin reescribir runtime.

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Acoplamiento a Cursor | Contrato M6 + adaptadores futuros |
| Confusión Cloud Agent vs `cloud-agent` NADF | Documentación explícita en guía |
| Ejecución sin Plan | Restricciones por patrón en el contrato |
| Secretos en prompts | Solo `CURSOR_API_KEY` vía env; MCP para secretos externos |
| Prototipo interpretado como orquestador | Scope limitado a un paso; roadmap M5 |

## Consecuencias

### Positivas

- Hito M6 iniciado con evidencia ejecutable.
- Equipo puede correr Analyzer en Cloud con cuenta existente.

### Negativas / deuda

- M5 aún necesario para cadenas de 18 pasos.
- MCP (M4) y schemas (M1) siguen pendientes para hardening.

## Compatibilidad

- Compatible con ADR-0002, ADR-0003, ADR-0004.
- No modifica el Meta Model; usa entidades Execution, Agent, Artifact, Metric.
- No reemplaza `orchestrator_mode: manual` hasta que M5 demuestre paridad.

## Evolución futura

1. Adaptador Local SDK.
2. Adaptador Claude Code.
3. Orquestador M5 llama a `AgentRuntime` por paso.
4. Inyección MCP en `cloud` runs.
5. Gates automáticos pre-invoke (Planner no escribe código).

## Referencias

- `docs/runtime/agent-runtime-contract.md`
- `docs/cloud-agent-integration.md`
- `prototypes/m6-cloud-agent/`
- `docs/roadmap.md` — módulo M6
- [Cursor SDK — TypeScript](https://cursor.com/docs/sdk/typescript)
- [Cloud Agents](https://cursor.com/docs/cloud-agent)
