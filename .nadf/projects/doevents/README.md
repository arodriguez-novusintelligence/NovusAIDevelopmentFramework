# NADF-GUIDE
# Propósito: Documenta DoEvents como empresa cliente del Administrador de IA NADF.
# Configuración: empresa `doevents` en el portal; conectores GitHub App NADF + AWS; motor Claude.
# DoEvents — empresa cliente de NADF

DoEvents usa NADF como **empresa propia** en el Administrador de IA (portal.novusintelligencesolutions.com).
Los repositorios, la nube y los datos son de DoEvents; NADF entra solo con los permisos que DoEvents otorga.

## Flujo

```text
Funcional de DoEvents pide un ajuste en el centro de mando
  → Analista (Claude) aclara dudas y arma criterios de aceptación
  → Desarrollo en rama nadf/req-{id} del repo real (Claude Code)
  → Lint, build, pruebas y deploy a DEV + evidencias E2E
  → Informe al funcional (hecho, no hecho, límites, preguntas)
  → Aprobación de un aprobador de DoEvents (con MFA)
  → Preflight PROD (PROD == main) → despliegue con consola en vivo → rollback si falla
```

## Repos (reales)

| App | Repo | Rama base |
|-----|------|-----------|
| WEB | [doeventsrepo/DoEventsWEB](https://github.com/doeventsrepo/DoEventsWEB) | `main` |
| Back | [doeventsrepo/DoEventsBack](https://github.com/doeventsrepo/DoEventsBack) | `main` |
| IA | [doeventsrepo/DoEventsIA](https://github.com/doeventsrepo/DoEventsIA) | `main` |

La app móvil (`DoEventsApp/DoEventsFront`) queda **excluida temporalmente**. La prioridad del piloto es la web.

Las copias en `arodriguez-novusintelligence/*` y el flujo Issues + Cursor quedan retirados.

## Administradores y aprobadores

- arodriguez@doeventsapp.com (Admin y Aprobador)
- admin.developer.platform@doeventsapp.com (Admin y Aprobador)

Una aprobación por despliegue, con MFA. DoEvents Back (pagos, sesiones, datos bancarios) exige además revisión de un Desarrollador.

## Reglas que se respetan

- Un pedido = un cambio acotado (aislamiento por entidad: eventos, lugares, servicios).
- Sin refactors masivos ni borrado de funciones ajenas.
- Antes de PROD se compara lo desplegado con `main`: WEB y Back de PROD a veces se despliegan desde código no publicado y un deploy desde `main` revertiría cambios vivos.

## Pendientes para conectar

1. ~~Instalar la GitHub App NADF en `doeventsrepo`~~ — hecho 2026-11-10 (`nadf-novus-intelligence`, DoEventsWEB, DoEventsBack, DoEventsIA).
2. ~~Roles de despliegue de la web por entorno en AWS~~ — creados 2026-11-10 (`nadf-doevents-web-deploy-{dev,qa,prod}`).
3. Clave de Claude de NADF en Secrets Manager (`/nadf/platform/claude-api-key`, sa-east-1).
4. Confirmar comandos de pruebas de WEB y Back y la región DEV de Back.

Ver `project-context.yml` y la guía `docs/md/21-project-context-guide.md`.
