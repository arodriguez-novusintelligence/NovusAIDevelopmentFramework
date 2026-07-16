# Patrón: Remediación iterativa post-merge en workflows multi-repo

## Contexto

Workflows multi-repo (`lovable-to-web`) donde validadores (qa-agent, security-agent) fallan en ramas feature o tras merge a `main`, pero los cambios de corrección están dentro del alcance CHG-xxx del plan `approved`. Re-planificar es innecesario si la remediación no altera arquitectura ni alcance.

## Solución

1. **Corregir en repo productivo.** Aplicar fix en NovusIntelligenceWEB / NovusIntelligenceBack en rama feature o en `main` según política del proyecto.
2. **Merge a main** cuando el fix esté listo y build local pase.
3. **Re-ejecutar validators** sin repetir Planning ni Plan Review: qa-agent, security-agent según gates fallidos.
4. **El bloqueo migra al siguiente gate fallido.** Security PASS no desbloquea `visual_exact_parity` ni `reviewer-agent`.
5. **Actualizar Blackboard:** reflexión versionada, métricas y entradas KB (marcar errores como `resolved`).

### Cuándo NO aplicar

- Cambio fuera del alcance CHG-xxx aprobado → requiere nuevo plan.
- Decisión arquitectónica nueva → ADR antes de implementar.
- Gate `visual_exact_parity` → usar `visual-parity-revalidation-chain.md`.

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-14 → 2026-07-16):

| ID | Gate | Remediación | Revalidación |
|----|------|-------------|--------------|
| QA-001 | build_success | `type` alias en componentes UI | Lint 0 errores (2026-07-16); QA-RE pendiente |
| SEC-001 | security_pass | IAM SES ARN acotado | Security PASS (2026-07-16) |
| SEC-002 | security_pass | `rateLimitResponse()` conectado en handler | Security PASS (2026-07-16) |
| VP-001 | visual_exact_parity | Gaps P0 pendientes | Bloqueo activo tras security PASS |

Sin re-ejecutar planner-agent ni architect-agent. `qualityScore` 61: ejecución sólida penalizada por paridad visual 0/12.

Evidencia: `artifacts/informe-seguridad.md`, `artifacts/metricas-ejecucion.json`, `artifacts/reflexion-ejecucion.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `architecture-patterns/multi-repo-feature-branch-validation.md`
- `architecture-patterns/visual-parity-revalidation-chain.md`
- `common-errors/QA-001-eslint-no-empty-object-type.md`
- `common-errors/SEC-001-iam-ses-wildcard.md`
- `common-errors/SEC-002-rate-limit-not-connected.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | PAT-004, KB-012 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-16 |
