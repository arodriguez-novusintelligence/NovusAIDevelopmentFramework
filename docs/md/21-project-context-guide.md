<!-- NADF-GUIDE
Propósito: Guía de project-context.yml — dónde vive, qué configurar por app.
Configuración: Crear .nadf/projects/<project-id>/project-context.yml en el framework.
-->
# Guía: `project-context.yml` en NADF

## Dónde va

El archivo canónico vive **en el framework**, no en cada app:

```text
NovusAIDevelopmentFramework/
  .nadf/
    projects/
      <project-id>/          ← un directorio por producto/servicio
        project-context.yml  ← OBLIGATORIO (contrato del proyecto)
        README.md
        budget-policy.yml    ← opcional (override)
        agent-selection.yml  ← opcional
        issue-seed.md        ← plantilla de issues (si adapter=github-issue)
```

Ejemplos reales:

| Proyecto | Path |
|----------|------|
| **DoEvents** (el que debes mirar como referencia) | `.nadf/projects/doevents/project-context.yml` |
| Novus Intelligence | `.nadf/projects/novus-intelligence/project-context.yml` |
| Sample 2 | `.nadf/projects/sample2-manual-aws/project-context.yml` |

El **workflow de GitHub** de la app (p.ej. `DoEventsWEB/.github/workflows/nadf-issue-dev.yml`) hace checkout del framework y usa los scripts M6 declarados en `runtime.scripts`.

## Qué archivo se configura

Para un servicio nuevo: **solo** `.nadf/projects/<tu-id>/project-context.yml` (+ README + policies si hace falta).

No copies el workflow DoEvents a ciegas: reutiliza el runtime M6 y declara targets/gates en el context.

## Estructura correcta (plantilla)

```yaml
# .nadf/projects/<project-id>/project-context.yml
project:
  id: mi-app                 # único, kebab-case
  name: Mi App
  kind: product              # product | demonstration
  environment: [dev]         # solo entornos permitidos
  production_deploy: forbidden

source:
  adapter: github-issue      # github-issue | manual | lovable | ...
  repository: org/MiAppWEB   # repo de issues (si aplica)
  required_label: nadf
  approval_label: "nadf:approved"
  never_auto_execute_body: true

targets:
  frontend:
    repo: https://github.com/org/MiAppWEB.git
    branch: feature/nadf-dev
    deploy: deploy-dev       # nombre lógico del script/workflow
    region: sa-east-1
  backend:
    repo: https://github.com/org/MiAppBack.git
    branch: feature/nadf-dev
    deploy: serverless-dev
    region: sa-east-1

scope:
  isolation: single-issue
  domain_entities: []        # o [eventos, ...] si hay gate de dominio
  forbidden:
    - production_deploy
    - broad_refactors

automation:
  github_workflow: .github/workflows/nadf-issue-dev.yml  # en el repo de issues
  complexity_routing:
    enabled: true
    policy: enterprise-governance/complexity-routing.yml
    fail_safe: FULL
  default_branch_work: feature/nadf-dev
  auto_merge_dev: true
  auto_deploy_dev: true
  production_deploy: false

runtime:
  entrypoint: prototypes/m6-cloud-agent
  scripts:
    route: route:doevents-issue      # o route genérico cuando exista
    invoke: invoke:doevents-issue
    verify: verify:doevents-agent-prs
    report: report:doevents-execution
  model_env: NADF_MODEL

governance:
  human_approval_model: enterprise-governance/human-approval-model.yml
  budget_policy: budget-policy.yml
  agent_selection: agent-selection.yml
  production_deploy: forbidden

quality_gates:
  - complexity_routed
  - agent_pr_verified          # tipifica REPO_PUSH_DENIED / PR_NOT_CREATED
  - scope_isolation            # si aplica
  - build_env_assert           # env de bundle correcto (api-dev vs api-qa)
  - deploy_dev_when_configured # OIDC fail = FAIL si auto_deploy
  - smoke_or_wiring            # smoke del síntoma

error_reporting:
  taxonomy: doevents           # códigos estables (ver M6 error-codes.ts)
  issue_comment: true
  actions_console: true        # ::error::CODE + NADF_RUN_REPORT=
  artifact: execution-report.json

postconditions:
  # Éxito del run = todas las que estén enabled
  agent_pass: true
  pr_opened_or_noop: true
  merged_to_work_branch: true
  deployed_dev: true
  gates_pass: true
```

## Checklist al onboardear otro servicio

1. Crear `.nadf/projects/<id>/project-context.yml` (este archivo).
2. Secrets en el repo de issues: `CURSOR_API_KEY`, `GH_PAT` (write en todos los targets).
3. Vars: `AWS_ROLE_ARN`, bucket/CloudFront, API keys de build.
4. Workflow en el repo de issues que haga checkout de `feature/nadf-foundation` y llame a `runtime.scripts`.
5. Smoke mínimo del síntoma (API o wiring) listado en `quality_gates`.
6. Probar un issue con label `nadf` y leer el comentario final (`primaryCode` + `why`).

## DoEvents (referencia)

Ver [`.nadf/projects/doevents/project-context.yml`](../../.nadf/projects/doevents/project-context.yml) y [19-doevents-issues-nadf.md](19-doevents-issues-nadf.md).
