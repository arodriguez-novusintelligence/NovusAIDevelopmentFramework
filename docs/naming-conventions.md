# Naming Conventions — NADF

**Version:** 1.1.0-rc.1

## IDs

| Prefijo | Entidad |
|---------|---------|
| REQ-YYYY-NNNNNN | Requirement |
| INT-YYYY-NNNNNN | Intent |
| MIS-YYYY-NNNNNN | Mission (Plan alias) |
| PLAN-YYYY-NNNNNN | ExecutionPlan / Plan |
| EXEC-YYYY-NNNNNN | Execution |
| TASK-YYYY-NNNNNN | Task |
| ART-YYYY-NNNNNN | Artifact |
| EVT-YYYY-NNNNNN | Event / RawRequirementEvent |
| TRL-YYYY-NNNNNN | TraceabilityLink |

Alternativa slug: `^[a-z0-9][a-z0-9_.:-]{2,}$` para definiciones/workflows.

## Fechas

- ISO-8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`).

## Correlation / Causation

- `correlation_id`: obligatorio en Intake y Execution.
- `causation_id`: opcional; requerido en eventos tipados `*.v1` con side-effects.

## Scope IDs

- `tenant_id`, `workspace_id`, `project_id`: kebab-case slugs.

## Agents / Workflows

- Agents: `*-agent` kebab-case.
- Workflows: kebab-case (`lovable-to-web`, `requirement-intake`).

## Events

- Prefer `domain.action.vN` (e.g. `intent.created.v1`).
- Legacy `lovable.commit` retained for compatibility.

## Status names

- UPPER_SNAKE_CASE enums in schemas/state-machines.

## Error codes

- `NADF-<CAT>-NNN` (see error-catalog).

## Schema versions

- Package: `schemaVersion: 1.1.0-rc.1` in normative schemas.
- Meta Model line: `1.1.0`.
