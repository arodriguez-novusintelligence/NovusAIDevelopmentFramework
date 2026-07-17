<!-- NADF-GUIDE
Propósito: Documenta State Machines — NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# State Machines — NADF

**Version:** 1.1.0-rc.1  
**Declarative source:** `.nadf/global/state-machines/`

## Immutability

| Entity | Rule |
|--------|------|
| RawRequirementEvent | Immutable after ACCEPTED |
| Requirement | Mutable until APPROVED |
| Intent | Immutable after ACCEPTED |
| Mission / ExecutionPlan | Versioned Plan aliases |
| Execution | Immutable historical record |
| TraceabilityLink | Append-only |
| Official AgentDefinition | Immutable |
| Published AgentVersion / WorkflowVersion | Immutable |

## Chain aliases

```text
Mission        == Plan (kind=mission)
ExecutionPlan  == Plan (kind=execution-plan) + tasks[]
ImprovementProposal == Knowledge/Reflection entry
```

## Validation

```bash
python -m tools.nadf_validator states
# or
python tools/nadf-validator/__main__.py states
```

Invalid transitions must be rejected (`NADF-EXE-001`).
