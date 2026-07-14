# Patrón: Reconciliación de región cloud en planning constraints

## Contexto

Cuando `project-context.yml` o artefactos IaC existentes definen una región distinta a la del `targetEnvironment` del workflow (p. ej. `us-east-1` en contexto vs `sa-east-1` en constraints). Ocurre frecuentemente en workflows con `requires_infra: true`.

## Solución

1. Incluir tarea explícita en el plan (p. ej. TASK-INFRA-001) para alinear `environments/dev.yml` con la región target.
2. Ejecutar cloud-agent en paralelo o antes del handoff a deploy, sin bloquear frontend/backend.
3. Documentar stacks, secrets paths y checklist en `propuesta-infra.md`.
4. Verificar alineación post-ejecución: región en serverless.yml, ARNs SES y CORS.

## Ejemplo

novus-intelligence (2026-07-14):
- Discrepancia `us-east-1` (project-context) vs `sa-east-1` (constraint `TARGET_DEV_REGION_SA_EAST_1`).
- cloud-agent reconcilió `dev.yml` y generó `propuesta-infra.md` sin despliegue (`NO_DEPLOY`).
- Evidencia: `artifacts/resumen-cloud.md`, `artifacts/propuesta-infra.md`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | PAT-004 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | medium |
| Fecha | 2026-07-14 |
