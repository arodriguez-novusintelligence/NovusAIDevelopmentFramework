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
| 6 | `visual-parity-result.json` generado si `visual_parity.enabled: true` | visual-parity-agent |

## Ejemplo

Corrida novus-intelligence bloqueada por omitir pre-checks 1, 2 y 6:
- Build Vite OK pero lint FAIL (QA-001) — resuelto 2026-07-16.
- IAM SES wildcard no alineado con propuesta (SEC-001) — resuelto 2026-07-16.
- Paridad declarada manualmente sin checker → VP-001 FAIL 0/12 capturas.
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/informe-qa.md`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-004, ANTI-005, KB-010, ANTI-VP-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-16 |
