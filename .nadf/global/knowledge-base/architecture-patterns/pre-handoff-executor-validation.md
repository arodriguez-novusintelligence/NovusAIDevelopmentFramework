# Patrón: Checklist pre-handoff executor → validation

## Contexto

Transición de fase Execution a Validation en workflows NADF. Evita ciclos de re-validación y bloqueos por gates detectados tarde (lint, IAM, artefactos ausentes).

## Solución

Antes de activar qa-agent, el executor (o agente responsable) debe verificar:

| # | Verificación | Responsable |
|---|--------------|-------------|
| 1 | `npm run lint` sin errores en repos productivos | frontend-integration-agent, backend-agent |
| 2 | Logo y assets de marca renderizados en Header/Footer (sin placeholder) | frontend-integration-agent |
| 3 | Diff `serverless.yml` ↔ `propuesta-infra.md` (IAM, CORS, región) | backend-agent |
| 4 | Artefactos `resumen-{frontend,backend,cloud}.md` publicados en Blackboard | respectivos agentes |
| 5 | `pipeline-config.md` presente si `requires_infra: true` y DevOps aplica | devops-agent |
| 6 | Utilidades de seguridad definidas conectadas en handlers | backend-agent |
| 7 | `NADF_LOVABLE_REFERENCE_URL` configurada si aplica paridad visual | devops-agent / workflow-agent |

## Ejemplo

Corrida novus-intelligence (2026-07-14 → 2026-07-15):
- Build Vite OK pero lint FAIL (QA-001) — remediado en main.
- IAM SES wildcard no alineado con propuesta (SEC-001) — remediado.
- Logo placeholder en Header/Footer (GAP-P0-001) — pendiente; bloqueó paridad visual.
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/gaps-paridad.json`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-004, KB-008, KB-013, ANTI-005 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 (actualizado) |
