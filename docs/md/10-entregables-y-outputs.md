# Entregables y outputs

Cada ejecución deja evidencia en `.nadf/projects/<project>/output/`:

- `execution-report.json`: estado, steps, approvals, artifacts y siguiente
  acción.
- `metrics-summary.json`: duración, espera humana, tokens/coste estimados,
  skips y fallos.
- `latest/execution-report.json`: resultado más reciente.
- `runs/<runId>.json`: histórico local o almacenado por CI.

`tools/nadf-output-reporter` genera estos archivos sin LLM. `output/**` se
ignora en Git salvo README para no mezclar evidencia entre clientes.

Una entrega de adopción incluye distribución limpia, proyecto configurado,
catálogo input/output, adapters cableados, reportes, runbooks, métricas y
checklist de operación. No incluye secretos ni despliegue PROD automático.
