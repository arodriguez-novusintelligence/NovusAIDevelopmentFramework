# Requirement Intake — Gap Closure Report (2026-07-15)

**Estado final:** `IMPLEMENTED`  
**ADR:** ADR-0007 (Accepted) · Meta Model **v1.1**  
**Validator:** `python tools/validators/requirement_intake_validator.py` → **PASSED** (15/15 fixtures)

---

## 1. Resumen ejecutivo

La **Requirement Intake Layer** ya existía mayormente en NADF (docs, ADR, 7 agentes, workflow, 15 definiciones, fixtures). Esta pasada **cerró gaps** de mappings globales, ejemplos de artefactos Blackboard, schemas Jira referenciados, conteo de agentes (19→27) y opt-in explícito en `novus-intelligence`.

No se reescribió el framework. `lovable-to-web` y proyectos sin fuentes remotas habilitadas siguen intactos.

---

## 2. Hallazgos del estado actual (pre-closure)

| Área | Estado previo |
|------|---------------|
| ADR-0007 + docs intake | Presente |
| 15 source definitions | Presente |
| 7 agentes + skills | Presente |
| Workflow `requirement-intake.yml` | Presente |
| Fixtures 01–15 + validator | Presente / PASS |
| Mappings globales | Solo ServiceNow |
| Artifact examples | Ausentes (solo contracts.yml) |
| Schemas jira-config/payload | Referenciados, ausentes |
| Docs “19 agentes” | Stale vs 27 en disco |

---

## 3. Decisiones arquitectónicas (reafirmadas)

1. Requirement ≠ Intent; solo `APPROVED` → Intent.  
2. Un contrato `RequirementSourceConnector`; no un agente por proveedor.  
3. Credenciales solo por `CredentialReference`.  
4. Opt-in vía `requirement-sources/`.  
5. 9 fases NADF conservadas en el workflow de intake.

---

## 4. Archivos creados (esta pasada)

- `.nadf/global/requirement-sources/mappings/*.yml` (15)
- `.nadf/global/artifact-contracts/requirement-intake/examples/*` (9)
- `docs/meta-model/schemas/jira-config.json`
- `docs/meta-model/schemas/jira-payload.json`
- `tools/validators/generate_intake_mappings_and_examples.py`
- `artifacts/requirement-intake-gap-closure-2026-07-15.md` (este)

---

## 5. Archivos modificados (esta pasada)

- `CLAUDE.md`, `README.md`
- `docs/meta-model/{meta-model-overview,specification,versioning,requirement-model,entity-model,governance}.md`
- `docs/agent-model.md`
- `.nadf/projects/novus-intelligence/project-context.yml`

---

## 6. Compatibilidad

- IDs de agentes/workflows core sin cambios destructivos.
- Fuentes remotas del piloto siguen **disabled**.
- Fixture `15-project-without-sources` sigue PASS.
- No se introdujeron secretos reales.

---

## 7. Riesgos residuales

| Riesgo | Mitigación |
|--------|------------|
| Drift histórico en ADR-0002/reviews que aún dicen “19” | Documentos históricos; living docs actualizados |
| Runtime MCP Slack/Jira aún no operacional | Contrato + definitions listos; implementación M4 |
| Auto-approval mal configurado | Policies `requires_human_approval: true` por defecto |

---

## 8. Pruebas ejecutadas

```text
python tools/validators/requirement_intake_validator.py
RESULT: PASSED (15/15)
```

---

## 9. Pendientes (no bloqueantes)

- Orquestador M5 ejecutando `requirement-intake` end-to-end.
- MCP servers Slack/Teams/ServiceNow operativos.
- UI Control Plane: CRUD visual de source instances (InterfazNADF).
- Suite pytest de pipeline (hoy: fixtures estructurales).

---

## 10. Estado

```text
IMPLEMENTED
```
