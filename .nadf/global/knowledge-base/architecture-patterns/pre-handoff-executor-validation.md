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
| 6 | Checklist pre-paridad visual completado si `visual_exact_parity` habilitado | frontend-integration-agent |
| 7 | `visual-parity-agent` ejecutado antes de declarar fase frontend completa | frontend-integration-agent |
| 8 | `NADF_LOVABLE_REFERENCE_URL` definida y alineada con baseline del plan | visual-parity-agent |

## Ejemplo

Corrida novus-intelligence — pre-checks 1 y 2 omitidos inicialmente (remediados); pre-checks 6–8 omitidos (activos):
- Build Vite OK pero lint FAIL (QA-001) — **remediado**.
- IAM SES wildcard no alineado con propuesta (SEC-001) — **remediado**.
- `resumen-frontend.md` declaró fases completas sin pixel-diff; paridad 0/12 PASS (VP-001, VP-002).
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/informe-qa.md`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-004, KB-008, KB-009, ANTI-005, ANTI-007, ANTI-008 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
| Última actualización | 2026-07-14 — reflexión consolidada (qualityScore 74) |
