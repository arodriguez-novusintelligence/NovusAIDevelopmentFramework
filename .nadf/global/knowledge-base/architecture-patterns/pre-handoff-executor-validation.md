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
| 6 | Assets de marca integrados (logo, favicon, OG) en layout global | frontend-integration-agent |
| 7 | Mapeo secciones claro/oscuro por ruta gate documentado | frontend-integration-agent |

## Ejemplo

Corrida novus-intelligence bloqueada por omitir pre-checks 1 y 2:
- Build Vite OK pero lint FAIL (QA-001).
- IAM SES wildcard no alineado con propuesta (SEC-001).
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/informe-qa.md`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-004, KB-008, ANTI-005, ANTI-007 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 (actualizado 2026-07-15) |
