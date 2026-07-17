# Meta Model Consistency Report — NADF v1.1

**Fecha:** 2026-07-15

## Cadena canónica v1.0 vs vocabulario ADR-0007

| Término | Estado en Meta Model | Decisión RC |
|---------|----------------------|-------------|
| RawRequirementEvent | v1.1 entidad | Obligatorio en Intake |
| Requirement | v1.1 entidad | Obligatorio en Intake |
| Context | v1.0 | Obligatorio |
| Intent | v1.0 | Obligatorio |
| Mission | **No formal** | Alias tipado de Plan (scope mission) |
| ExecutionPlan | **No formal** | Alias tipado de Plan + tasks[] |
| Plan | v1.0 | Entidad formal |
| Execution | v1.0 | Entidad formal |
| Task | v1.0 | Entidad formal |
| Artifact | v1.0 | Entidad formal |
| Validation | v1.0 | Entidad formal |
| Deployment | v1.0 | Opcional / approval |
| ImprovementProposal | Reflection/KB | Map a Knowledge entry |

## Cardinalidades (propuestas RC)

```
RawRequirementEvent 1 — 0..1 Requirement
Requirement 1 — 0..1 Intent (only if APPROVED)
Intent 1 — 0..* Plan
Plan 1 — 0..* Task
Plan 1 — 0..* Execution
Execution 1 — 0..* Artifact
Artifact 1 — 0..* Validation
```

## Mutabilidad

Ver `docs/state-machines.md` (a crear): RawEvent immutable; Requirement mutable until approval; Intent immutable after acceptance; Execution historical immutable; TraceabilityLink append-only.

## Inconsistencias a cerrar

1. Documentar Mission/ExecutionPlan como aliases — no nuevas entidades core.  
2. Alinear conteo entidades (24/25 + Intake 9).  
3. Incluir `metaModel.version: 1.1.0` en project-context.
