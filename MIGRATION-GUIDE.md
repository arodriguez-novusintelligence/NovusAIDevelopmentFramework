# MIGRATION GUIDE — → NADF 1.1.0-rc.1

## From Meta Model 1.0 / framework without Intake

1. Pull framework changes.
2. Set in `project-context.yml`:

```yaml
metadata:
  nadf_version: "1.1.0-rc.1"
  metaModel:
    version: "1.1.0"
```

3. **Optional:** add `requirement-sources/` to enable Intake.
4. Run:

```bash
python tools/nadf-validator/__main__.py repository
python tools/validators/requirement_intake_validator.py
```

5. No change required for `lovable-to-web` projects that omit Intake.

## Breaking changes

None intended for v1.0 projects. Intake is opt-in.

## Alias note

If docs mention Mission / ExecutionPlan, treat as Plan aliases (`kind`).
