# NADF-GUIDE
# Propósito: Documenta el proyecto DoEvents en NADF (Issues → DEV).
# Configuración: Secrets CURSOR_API_KEY/GH_PAT; vars AWS_ROLE_ARN en DoEventsWEB.
# DoEvents — NADF via GitHub Issues

## Flujo

```text
Issue en DoEventsWEB (label `nadf`)
  → Complexity Routing (WEB / Back / full)
  → Cloud Agent (solo el alcance del issue)
  → Build / validate
  → Deploy DEV (WEB: S3+CloudFront; Back: según labels)
  → Comentario en el issue
```

## Repos

| Rol | Repo | Rama NADF |
|-----|------|-----------|
| WEB | [DoEventsWEB](https://github.com/arodriguez-novusintelligence/DoEventsWEB) | `feature/NovusAIDevelopmentFramework` |
| Back | [DoEventsBack](https://github.com/arodriguez-novusintelligence/DoEventsBack) | `feature/NovusAIDevelopmentFramework` |
| Issues | [DoEventsWEB/issues](https://github.com/arodriguez-novusintelligence/DoEventsWEB/issues) | — |

## Principio de aislamiento

Cada issue ajusta **solo** la funcionalidad pedida. Prohibido eliminar u
otras features, refactors masivos o deploy a producción.

## Disparo

1. Crear issue con plantilla `issue-seed.md`.
2. Añadir label `nadf` (o `nadf:approved`).
3. Ver Action **NADF DoEvents issue → DEV** en DoEventsWEB.
