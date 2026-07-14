# Patrón: Validación en ramas feature multi-repo

## Contexto

Workflows que modifican múltiples repositorios productivos (frontend + backend) manteniendo `main` en estado scaffold o estable. Aplica cuando QA y Security deben evaluar código sin merge prematuro.

## Solución

1. Implementar en ramas `cursor/*` por repositorio (p. ej. `cursor/implement-novus-frontend-2d22`, `cursor/implement-contact-api-04c8`).
2. Publicar artefactos de resumen en el Blackboard del Framework antes de activar Validation.
3. Ejecutar qa-agent y security-agent contra las ramas feature, no contra `main`.
4. Ejecutar `visual-parity-agent` en rama feature antes de merge si `visual_parity.enabled`.
5. Merge a `main` solo tras gates PASS (incluido `visual_exact_parity`) y aprobación de reviewer-agent.
6. Tras merge, aplicar flujo de revalidación post-merge (`post-merge-revalidation-flow.md`).

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- Frontend y backend mergeados a `main` sin paridad visual previa.
- QA y Security revalidados post-merge con PASS; paridad visual FAIL (VP-001).
- Evidencia: `artifacts/qa-result.json`, `artifacts/security-result.json`, `artifacts/gaps-paridad.json`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | PAT-005, KB-002, ANTI-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
