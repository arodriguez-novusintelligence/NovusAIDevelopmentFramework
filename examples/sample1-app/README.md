<!-- NADF-GUIDE
Propósito: Documenta Sample 1 app.
Configuración: Adaptar IDs, paths y criterios del sample manteniendo aislamiento y PROD prohibido.
-->
# Sample 1 app

Aplicación demo **dentro del Framework**. Demuestra:

`GitHub Issue (sample1) → Requirement → Human Gates → cambio → QA/Security → AWS DEV`

No referencia ni modifica `NovusIntelligenceWEB`, `NovusIntelligenceBack` o
`novus-nexus`.

## Prueba local

```bash
python -m unittest discover -s examples/sample1-app/tests
```

## Deploy DEV

El deploy ocurre desde CI con OIDC y rol `nadf-sample-dev-deploy`; Cloud Agent
no recibe credenciales AWS.

```bash
sam build -t examples/sample1-app/template.yml
sam deploy --stack-name sample1-api-dev --region sa-east-1 \
  --capabilities CAPABILITY_IAM --resolve-s3 --no-confirm-changeset
```

PROD está fuera de alcance y prohibido por policy.
