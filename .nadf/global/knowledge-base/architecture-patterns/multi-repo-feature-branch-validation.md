# Patrón: Validación en ramas feature multi-repo

## Contexto

Workflows que modifican múltiples repositorios productivos (frontend + backend) manteniendo `main` en estado scaffold o estable. Aplica cuando QA y Security deben evaluar código sin merge prematuro.

## Solución

1. Implementar en ramas `cursor/*` por repositorio (p. ej. `cursor/implement-novus-frontend-2d22`, `cursor/implement-contact-api-04c8`).
2. Publicar artefactos de resumen en el Blackboard del Framework antes de activar Validation.
3. Ejecutar qa-agent y security-agent contra las ramas feature, no contra `main`.
4. Merge a `main` solo tras gates PASS y aprobación de reviewer-agent.

## Variante: Re-validación post-merge sobre main

Cuando los repos productivos se mergean a `main` antes de completar Validation:

1. Re-ejecutar qa-agent y security-agent **sobre `main`**, no solo feature branches.
2. Remediaciones de lint, IAM y rate limit pueden desbloquearse independientemente de otros gates (p. ej. paridad visual).
3. Documentar evolución de qualityScore en Blackboard para permitir re-reflexión sin reiniciar la corrida.

Corrida novus-intelligence (2026-07-15):
- Merge a `main` en NovusIntelligenceWEB y NovusIntelligenceBack.
- Re-validación QA: lint 0 errores (QA-001 remediado).
- Re-validación Security: IAM scoped (SEC-001), rate limit activo (SEC-002).
- qualityScore evolucionó 62 → 78; workflow sigue blocked por VP-001.
- Evidencia: `artifacts/metricas-ejecucion.json`, `artifacts/resumen-metricas.md`.

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- 2 ramas productivas pendientes de merge.
- QA y Security evaluaron código en feature branches sin contaminar scaffold.
- Evidencia: `artifacts/qa-result.json`, `artifacts/security-result.json`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | PAT-005, PAT-006 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 (actualizado 2026-07-15) |
