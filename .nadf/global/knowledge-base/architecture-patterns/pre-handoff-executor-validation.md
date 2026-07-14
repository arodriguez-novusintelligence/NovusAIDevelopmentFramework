# Patrón: Checklist pre-handoff executor → validation

## Contexto

Transición de fase Execution a Validation en workflows NADF. Evita ciclos de re-validación y bloqueos por gates detectados tarde (lint, IAM, artefactos ausentes).

## Solución

Antes de activar qa-agent, el executor (o agente responsable) debe verificar:

| # | Verificación | Responsable |
|---|--------------|-------------|
| 1 | `npm run lint` sin errores en repos productivos | frontend-integration-agent, backend-agent |
| 2 | Diff `serverless.yml` ↔ `propuesta-infra.md` (IAM, CORS, región) | backend-agent |
| 3 | Artefactos `resumen-{frontend,backend,cloud}.md` publicados en Blackboard | respectivos agentes |
| 4 | `pipeline-config.md` presente si `requires_infra: true` y DevOps aplica | devops-agent |
| 5 | Utilidades de seguridad definidas conectadas en handlers | backend-agent |
| 6 | Paridad visual ejecutada en rama feature (si `visual_parity.enabled`) | visual-parity-agent |
| 7 | `gaps-paridad.json` sin gaps P0 pendientes antes de merge | frontend-integration-agent |

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- Lint FAIL inicial (QA-001) — remediado post-merge en `eead55f`.
- IAM SES wildcard (SEC-001) — remediado en `d851201`.
- Paridad visual omitida pre-merge — 0/12 capturas FAIL (VP-001).
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/gaps-paridad.json`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-004, KB-008, ANTI-001, ANTI-005 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
