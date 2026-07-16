# Error: SEC-001

## Síntoma

Gate `security_pass` falla por política IAM con `Resource: '*'` en permisos AWS SES dentro de `serverless.yml`. Violación de mínimo privilegio.

## Causa

Plantilla Serverless Framework o copy-paste de permisos genéricos sin acotar al dominio/identidad SES verificada en la región target.

## Solución

Reemplazar wildcard por ARN acotado:

```yaml
# Incorrecto
Resource: '*'

# Correcto (ejemplo sa-east-1)
Resource: arn:aws:ses:sa-east-1:${aws:accountId}:identity/novusintelligence.com
```

Verificar alineación con `propuesta-infra.md` del mismo workflow.

## Prevención

1. Checklist post cloud-agent: comparar `serverless.yml` ↔ `propuesta-infra.md` (IAM, CORS, región).
2. security-agent valida ARNs antes de merge.
3. Incluir permisos `secretsmanager:GetSecretValue` y `ssm:GetParameter` solo si se adoptan referencias SSM — también acotados.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/informe-seguridad.md`, `artifacts/propuesta-infra.md`
- Agente responsable corrección: backend-agent

## Estado de remediación

| Campo | Valor |
|-------|-------|
| `remediationStatus` | resolved |
| `resolutionDate` | 2026-07-16 |
| Notas | ARN acotado a identidad dominio en `sa-east-1`; security-agent PASS score 88 |

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-003, KB-002 |
| Severidad | high |
| Gate bloqueante | security_pass |
| Fecha | 2026-07-14 |
| Última actualización | 2026-07-16 |
