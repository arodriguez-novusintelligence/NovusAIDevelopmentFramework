# Patrón: Remediación iterativa post-merge

## Contexto

Gates bloqueantes detectados tras merge a `main` en repos productivos (lint, IAM, rate limiting). Aplica cuando la corrección requiere commit directo en `main` seguido de re-ejecución del agente validador correspondiente.

## Solución

Ciclo iterativo:

1. **Detectar** — Validador reporta FAIL con ID de hallazgo (p. ej. QA-001, SEC-001).
2. **Corregir** — Executor aplica fix mínimo en repo productivo (`main` o rama hotfix).
3. **Revalidar** — Mismo validador re-ejecuta contra commit corregido.
4. **Documentar** — Informe actualizado con SHA evaluado y estado PASS/FAIL.

Patrón verificado en novus-intelligence:

| Hallazgo | Corrección | Commit | Revalidación |
|----------|------------|--------|--------------|
| QA-001 lint | `type` alias en shadcn/ui | `eead55f` | qa-agent PASS |
| SEC-001 IAM SES | ARN acotado a `identity/*` | `d851201` | security-agent PASS |
| SEC-002 rate limit | `isIpRateLimited()` conectado | `d851201` | security-agent PASS |

## Ejemplo

Corrida novus-intelligence (2026-07-14): gates QA y Security remediados en `main` antes de revalidación; paridad visual permanece FAIL.
- Evidencia: `artifacts/informe-qa.md`, `artifacts/informe-seguridad.md`, `artifacts/reflexion-ejecucion.md`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | PAT-004 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
