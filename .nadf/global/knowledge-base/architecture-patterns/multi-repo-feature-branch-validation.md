# Patrón: Validación en ramas feature multi-repo

## Contexto

Workflows que modifican múltiples repositorios productivos (frontend + backend) manteniendo `main` en estado scaffold o estable. Aplica cuando QA y Security deben evaluar código sin merge prematuro.

## Solución

1. Implementar en ramas `cursor/*` por repositorio (p. ej. `cursor/implement-novus-frontend-2d22`, `cursor/implement-contact-api-04c8`).
2. Publicar artefactos de resumen en el Blackboard del Framework antes de activar Validation.
3. Ejecutar qa-agent y security-agent contra las ramas feature, no contra `main`.
4. Merge a `main` solo tras gates PASS y aprobación de reviewer-agent.
5. **Re-validación post-merge obligatoria** — tras integrar a `main`, re-ejecutar qa-agent y security-agent sobre `main`. Ver `post-merge-revalidation.md`.

## Ejemplo

Corrida novus-intelligence (2026-07-14 → 2026-07-15):
- Implementación en ramas `cursor/*`; merge a `main` (WEB @ `2634029`, Back @ `c929e2b`).
- Re-validación post-merge confirmó remediación QA-001, SEC-001-v1, SEC-002-v1.
- qualityScore: 62 → 78; paridad visual independiente (0/12 capturas).
- Evidencia: `artifacts/qa-result.json`, `artifacts/security-result.json`, `artifacts/metricas-ejecucion.json`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | PAT-005, KB-011 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 (actualizado) |
