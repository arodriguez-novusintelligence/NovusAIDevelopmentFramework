# Validation Report — Requirement Intake

**Fecha:** 2026-07-14  
**Comando:** `python tools/validators/requirement_intake_validator.py`  
**Resultado:** PASSED

---

## Framework checks

| Check | Resultado |
|-------|-----------|
| 15 definiciones de fuente | PASS |
| Workflow `requirement-intake.yml` | PASS |
| 7 agentes + skill registries | PASS |
| sources.yml novus-intelligence | PASS (enabled sources validan cred/mapping/policy) |

## Fixtures (15/15 PASS)

| # | Fixture | Resultado |
|---|---------|-----------|
| 1 | manual válido | PASS |
| 2 | jira válido | PASS |
| 3 | slack no autorizado | PASS |
| 4 | slack comando autorizado | PASS |
| 5 | github issue duplicado | PASS |
| 6 | webhook firma inválida | PASS |
| 7 | API idempotency replay | PASS |
| 8 | email dominio no autorizado | PASS |
| 9 | archivo tipo prohibido | PASS |
| 10 | servicenow válido | PASS |
| 11 | scheduled → requirement | PASS |
| 12 | incomplete NEEDS_CLARIFICATION | PASS |
| 13 | approved → Intent | PASS |
| 14 | trazabilidad completa | PASS |
| 15 | proyecto sin sources | PASS |

## Criterios de aceptación (checklist)

- [x] 15 fuentes con contrato común
- [x] RawRequirementEvent / Requirement modelados
- [x] Requirement aprobado → Intent
- [x] TraceabilityLink documentado
- [x] Config por proyecto opt-in
- [x] CredentialReference
- [x] Dedup/idempotencia
- [x] Políticas de aprobación
- [x] Workflows actuales preservados
- [x] Provider independence
- [x] Contratos listos para UI futura
- [x] Diagramas/docs actualizados
- [x] Sin cambios destructivos
- [x] Validadores y fixtures PASS
