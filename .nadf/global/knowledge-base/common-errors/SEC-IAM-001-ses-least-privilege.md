# Error: SEC-IAM-001

## Síntoma

El gate `security_pass` falla con hallazgo de IAM sobre-permisivo en funciones Serverless que envían correo vía AWS SES.

```
Resource: '*' en permisos ses:SendEmail / ses:SendRawEmail
```

El security-agent reporta violación de least-privilege (SEC-001).

## Causa

Plantillas Serverless Framework o configuración inicial usan wildcard global en `iamRoleStatements` para SES, asumiendo que simplifica el despliegue. Esto otorga permiso de envío sobre cualquier identidad SES de la cuenta.

## Solución

Acotar progresivamente el ARN de recurso:

```yaml
# Incorrecto
- Effect: Allow
  Action:
    - ses:SendEmail
    - ses:SendRawEmail
  Resource: '*'

# Mitigado (iteración 2)
- Effect: Allow
  Action:
    - ses:SendEmail
    - ses:SendRawEmail
  Resource: arn:aws:ses:${aws:region}:${aws:accountId}:identity/*

# Objetivo (producción)
- Effect: Allow
  Action:
    - ses:SendEmail
    - ses:SendRawEmail
  Resource: arn:aws:ses:${aws:region}:${aws:accountId}:identity/novusintelligence.com
```

Validar alineación con `propuesta-infra.md` del proyecto.

## Prevención

1. Nunca usar `Resource: '*'` para SES en código productivo.
2. Incluir verificación IAM en checklist serverless post-cada fix de seguridad.
3. Documentar dominio verificado en SES antes del primer deploy.

## Proyectos donde se observó

- novus-intelligence (SEC-001 mitigado en iteración 2; pendiente acotar a dominio específico)

## Referencias

- Fuente: `artifacts/informe-seguridad.md`, `artifacts/security-result.json`
- Recomendación: KB-002 en `artifacts/recomendaciones-kb.json`
