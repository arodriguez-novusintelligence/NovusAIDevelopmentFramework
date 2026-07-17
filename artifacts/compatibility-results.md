# Compatibility Results — NADF v1.1.0-rc.1

**Fecha:** 2026-07-15

## Matriz (resumen)

| Componente | Versión / estado | Compatible con Core 1.1 RC |
|------------|------------------|----------------------------|
| NADF Core | stable | Sí |
| Meta Model | 1.1.0 | Sí |
| Agent / Workflow / Artifact schema | 1.1.0 | Sí |
| Requirement Intake | release-candidate | Opt-in |
| Projects sin intake | minimumProjectVersion 1.0.0 | Sí (`legacyProjectsWithoutSources: supported`) |
| Cursor / n8n adapters | experimental | No bloquean RC |
| InterfazNADF | consumer externo | Compatible contractualmente (no en este repo) |
| Conectores Jira/Slack/GitHub… | experimental | Opt-in |

Fuentes: `nadf-manifest.yml`, `COMPATIBILITY.md`, `docs/compatibility-matrix.yml`.

## Evidencia

- Fixture `15-project-without-sources` PASSED.
- `requirementIntakeOptional: true` en manifiesto.
- Mission / ExecutionPlan = alias de Plan (sin romper Meta Model v1.0).

## Veredicto

**Compatible hacia atrás** para proyectos legacy. Intake no es obligatorio.
