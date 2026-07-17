# Security Results — NADF v1.1.0-rc.1

**Fecha:** 2026-07-15  
**Comando:** `python tools/nadf-validator/__main__.py security`

## Resultado

```text
RESULT: PASSED
```

## Controles verificados

| Control | Estado |
|---------|--------|
| `.gitignore` incluye `.env`, `node_modules`, `dist`, `__pycache__` | OK |
| Scan patrones `crsr_`, `ghp_`, `AKIA` | OK (sin hallazgos en rutas no documentales) |
| Prototypes / `.env` locales excluidos de distribución | OK (`prototypes/` skip + gitignore) |
| CredentialReference + error `NADF-SEC-001` | OK (failure path) |
| Auto-deploy productivo | Forbidden en manifiesto |
| Secrets en docs/ejemplos conceptuales | Excluidos del scan estricto |

## Residual

- Connectors MCP runtime E2E no forman parte del RC contractual.
- Rate-limit/retry se declaran en políticas intake; enforcement runtime pendiente.
