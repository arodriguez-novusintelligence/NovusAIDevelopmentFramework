# Credenciales y OIDC

## Modelo recomendado

- Cloud Agent: código y PR, sin AWS keys.
- GitHub Actions: `id-token: write`, asume el rol
  `nadf-sample-dev-deploy` mediante OIDC.
- AWS: trust policy limitada a organización, repo, branch/environment `dev`.
- Secretos: referencias, nunca valores en prompts, YAML o artifacts.

## Checklist

- Crear el provider OIDC de GitHub en la cuenta AWS del cliente.
- Crear rol con permisos mínimos a stacks `sample1-*` / `sample2-*`.
- Configurar `AWS_ROLE_ARN` como variable del environment `dev`.
- Proteger environment y requerir reviewer cuando la policy lo indique.
- Activar CloudTrail y tags de coste.
- Confirmar que PROD no aparece en `AllowedValues` ni workflow.

Si falta OIDC, los samples se validan localmente y el deploy queda
`SKIPPED`, no se solicitan keys temporales por chat.
