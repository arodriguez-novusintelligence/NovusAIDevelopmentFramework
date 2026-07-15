# Patrón: Remediación iterativa post-merge

## Contexto

Workflows multi-repo donde validadores (qa-agent, security-agent) fallan en ramas feature o tras merge a `main`, pero los cambios de corrección están dentro del alcance CHG-xxx del plan `approved`. Re-planificar es innecesario si la remediación no altera arquitectura ni alcance.

## Solución

1. **Corregir en repo productivo.** Aplicar fix en NovusIntelligenceWEB / NovusIntelligenceBack (o repo afectado) en rama feature o directamente en `main` según política del proyecto.
2. **Merge a main** cuando el fix esté listo y build local pase.
3. **Re-ejecutar validators** sin repetir Planning ni Plan Review: qa-agent, security-agent según gates fallidos.
4. **Actualizar Blackboard:** reflexión versionada, métricas y entradas KB (marcar errores como `remediated`).

### Cuándo NO aplicar

- Cambio fuera del alcance CHG-xxx aprobado → requiere nuevo plan.
- Decisión arquitectónica nueva → ADR antes de implementar.
- Gate `visual_exact_parity` → usar `visual-parity-remediation-flow.md` (secuencia distinta).

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-14 → 2026-07-15):

| ID | Gate | Remediación | Revalidación |
|----|------|-------------|--------------|
| QA-001 | build_success | `type` alias en componentes UI | QA PASS 2026-07-15 |
| SEC-001-prev | security_pass | IAM SES `identity/*` (no `*`) | Security PASS |
| SEC-002-prev | security_pass | `isIpRateLimited()` en handler | Security PASS |

Sin re-ejecutar planner-agent ni architect-agent. Evidencia: `artifacts/informe-qa.md`, `artifacts/informe-seguridad.md`, `artifacts/resumen-ejecucion.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `architecture-patterns/multi-repo-feature-branch-validation.md`
- `common-errors/QA-001-eslint-no-empty-object-type.md`
- `common-errors/SEC-001-iam-ses-wildcard.md`
- `common-errors/SEC-002-rate-limit-not-connected.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | PAT-005, KB-014 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
