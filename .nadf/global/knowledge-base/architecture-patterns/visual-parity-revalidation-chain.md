# Patrón: Cadena revalidación post-remediación visual

## Contexto

Tras remediar gaps P0 de paridad visual en workflows `lovable-to-web`, los gates `build_success` y `security_pass` pueden estar ya en PASS. Saltar pasos de revalidación o activar `reviewer-agent` antes de `visual_exact_parity` PASS reproduce bloqueos y retrabajo.

## Solución

### Secuencia obligatoria

```mermaid
flowchart LR
    FE[frontend-integration-agent] --> VP[visual-parity-agent]
    VP --> QA[qa-agent]
    QA --> REV[reviewer-agent]
    REV --> DEVOPS[devops-agent]
```

| Orden | Agente | Acción | Criterio de salida |
|-------|--------|--------|-------------------|
| 1 | frontend-integration-agent | Remediar gaps P0 según `gaps-paridad.json` | Cambios en repo productivo |
| 2 | visual-parity-agent | Re-ejecutar checker Playwright+pixelmatch | 12/12 capturas PASS; `maxDiffRatio ≤ 0.002` |
| 3 | qa-agent | Re-validar `npm run lint` + build en `main` | `build_success` PASS formal |
| 4 | reviewer-agent | Revisión coherencia y `no_lovable_code_copy` | Solo tras PASS visual |
| 5 | devops-agent | Completar `pipeline-config.md` (DEVOPS-001) | Artefacto en Blackboard |

### Reglas

- No activar `reviewer-agent` con `visual_exact_parity` FAIL.
- No declarar paridad en `resumen-frontend.md` sin `visual-parity-result.json`.
- E2E contacto post-deploy queda bloqueado por `NO_DEPLOY` hasta `deploy_human_approval` explícita.
- Actualizar reflexión y KB tras PASS visual completo.

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-16):
- Security PASS (88) tras remediación SEC-001/SEC-002; lint remediado (QA-001).
- `reviewer-agent` correctamente bloqueado por VP-001 (0/12 capturas).
- QA re-validación formal pendiente (QA-RE) hasta paridad visual PASS.
- Evidencia: `artifacts/metricas-ejecucion.json`, `artifacts/resumen-ejecucion.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006
- `architecture-patterns/visual-parity-remediation-order.md`
- `architecture-patterns/pre-handoff-executor-validation.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-011, PAT-005, WF-003 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-16 |
