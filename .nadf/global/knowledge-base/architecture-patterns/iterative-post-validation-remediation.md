# Patrón: Remediación iterativa post-validación

## Contexto

Ciclo Validator FAIL → Executor fix → Validator re-run en workflows NADF. Aplica cuando un gate bloqueante se detecta en fase Validation pero la corrección no requiere replanificación ni aprobación humana (p. ej. deploy).

## Solución

1. **Validator documenta hallazgo** con ID (QA-xxx, SEC-xxx), gate afectado y agente responsable.
2. **Executor corrige en repo productivo** (rama `main` o feature según política del proyecto).
3. **Validator re-ejecuta** el gate específico y confirma PASS.
4. **Metrics y reflexión** registran estado `remediated` y `qualityScore` actualizado.
5. **Cadena continúa** al siguiente validator o gate bloqueante.

No sustituye gates que requieren aprobación humana (`deploy_human_approval`) ni replanificación arquitectónica.

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-14):

| ID | Gate | Corrección | Resultado |
|----|------|------------|-----------|
| QA-001 | `build_success` | Interfaces vacías → type alias en componentes UI | PASS |
| SEC-001 | `security_pass` | IAM SES `Resource: '*'` → ARN acotado | PASS |
| SEC-002 | `security_pass` | `isIpRateLimited()` conectado en handler | PASS |

`qualityScore` incrementó de 62 a 74 tras remediación. Gate `visual_exact_parity` permanece bloqueante (VP-001) — no remediado en esta iteración.

Evidencia: `artifacts/informe-qa.md`, `artifacts/informe-seguridad.md`, `artifacts/metricas-ejecucion.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `docs/reflection-learning.md`
- Quality gates en `project-context.yml`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-010, PAT-007 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
