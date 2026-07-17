# Golden Path — Manual Requirement

**Caso:** Agregar campo teléfono al formulario Mi Perfil  
**Versión:** NADF `1.1.0-rc.1`

## Cadena

```text
EVT-2026-000001 (RawRequirementEvent)
→ REQ-2026-000001 (Requirement APPROVED)
→ INT-2026-000001 (Intent ACCEPTED)
→ MIS-2026-000001 (Mission alias of Plan)
→ PLAN-2026-000001 (ExecutionPlan alias)
→ EXEC-2026-000001 (Execution COMPLETED)
→ ART-2026-000001 (Artifact)
(+ Validation implied COMPLETED)
```

Mission y ExecutionPlan son **aliases** del Plan del Meta Model (no entidades nuevas).

Validar con:

```bash
python -m tools.nadf-validator golden
```
