<!-- NADF-GUIDE
Propósito: Documenta Sample 2 — Iniciativa manual multi-requerimiento → AWS.
Configuración: Adaptar IDs, paths y criterios del sample manteniendo aislamiento y PROD prohibido.
-->
# Sample 2 — Iniciativa manual → AWS

Demuestra una **iniciativa con varios requerimientos** (`initiative.yml` +
`requests/REQ-*.yml`) que produce un API REST serverless en AWS DEV:

| Requerimiento | API REST | Lambda |
|---|---|---|
| REQ-001-calculadora | `POST /calculate` | `sample2-calculator-dev` |
| REQ-002-historial | `GET /history` | `sample2-history-dev` |
| REQ-003-health | `GET /health` | `sample2-calculator-dev` |

## Ejecutar a través del NADF (local)

```bash
python examples/sample2-manual-aws/run_nadf.py
```

El runner aplica el flujo NADF: intake de los requerimientos → gate de
aprobación humana por requerimiento → pruebas unitarias por requerimiento →
verificación del deploy → evidencia en
`.nadf/projects/sample2-manual-aws/output/` (incluye la sección `endpoints`
con las URLs de las Lambdas; quedan `PENDIENTE-DEPLOY` hasta desplegar).

## Deploy a AWS DEV (requiere aprobación humana)

Vía GitHub Actions (workflow `samples-dev`, input `sample2`) o manualmente:

```bash
sam build -t examples/sample2-manual-aws/template.yml
sam deploy --stack-name sample2-calculator-dev --region sa-east-1 \
  --capabilities CAPABILITY_IAM --resolve-s3 --no-confirm-changeset
```

Tras el deploy, vuelve a ejecutar `run_nadf.py`: leerá los Outputs del stack
y reportará las URLs reales.

## Uso de las APIs REST

Con `API=$(aws cloudformation describe-stacks --stack-name sample2-calculator-dev \
  --region sa-east-1 --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)`:

```bash
# REQ-001: calcular (200)
curl -s -X POST "$API/calculate" -H "content-type: application/json" \
  -d '{"operation": "add", "left": 2, "right": 3}'
# → {"result": "5", "operation": "add", "id": "calc-..."}

# REQ-001: división por cero (400)
curl -s -X POST "$API/calculate" -H "content-type: application/json" \
  -d '{"operation": "divide", "left": 1, "right": 0}'
# → {"error": "division_by_zero"}

# REQ-002: historial de cálculos
curl -s "$API/history"
# → {"items": [...], "count": N}

# REQ-003: salud del servicio
curl -s "$API/health"
# → {"status": "ok", "service": "sample2-calculator"}
```

El rol OIDC esperado es `nadf-sample-dev-deploy`. No se usan AWS keys en Cloud
Agent. Teardown: `aws cloudformation delete-stack --stack-name
sample2-calculator-dev --region sa-east-1`.
