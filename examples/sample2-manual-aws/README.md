# Sample 2 — Manual → AWS

Demuestra una solicitud manual greenfield que produce una calculadora Lambda,
DynamoDB y Function URL en AWS DEV.

```bash
python -m unittest discover -s examples/sample2-manual-aws/tests
sam build -t examples/sample2-manual-aws/template.yml
sam deploy --stack-name sample2-calculator-dev --region sa-east-1 \
  --capabilities CAPABILITY_IAM --resolve-s3 --no-confirm-changeset
```

El rol OIDC esperado es `nadf-sample-dev-deploy`. No se usan AWS keys en Cloud
Agent. Teardown: `aws cloudformation delete-stack --stack-name
sample2-calculator-dev --region sa-east-1`.
