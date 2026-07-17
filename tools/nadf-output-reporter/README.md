<!-- NADF-GUIDE
Propósito: Documenta NADF output reporter.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# NADF output reporter

Genera evidencia JSON determinista sin usar un LLM.

```bash
python tools/nadf-output-reporter/reporter.py \
  --input examples/sample1-github-issues/sample-run.json \
  --project-dir .nadf/projects/sample1-github-issues
```

Escribe `execution-report.json`, `metrics-summary.json`, `latest/` y el
histórico por `runId`. Los outputs se ignoran en Git salvo el README de cada
proyecto.
