<!-- NADF-GUIDE
Propósito: Documenta AI Runtime Providers (Cursor / Anthropic / noop).
Configuración: NADF_CODING_RUNTIME + secrets; ver .nadf/global/ai-runtime/.
-->
# AI Runtime Providers — independencia de vendor

NADF **no** está atado a una sola tecnología de IA. Elige un **Coding Runtime** (quién puede escribir código / abrir PRs) y, si aplica, un proveedor de **inferencia**.

## Importante

| Producto | ¿Sirve como auth NADF? |
|----------|-------------------------|
| Claude.ai (chat web) | **No** |
| `ANTHROPIC_API_KEY` (API) | Sí, runtime `anthropic` (solo inferencia en v1) |
| `CURSOR_API_KEY` | Sí, runtime `cursor-cloud` (coding + PR) |

## Runtimes v1

| Id | Capacidades | Secret |
|----|-------------|--------|
| `cursor-cloud` (default) | invoke, stream, pr, resume, repo_write | `CURSOR_API_KEY` |
| `anthropic` | invoke (texto) | `ANTHROPIC_API_KEY` |
| `noop` | invoke dry-run | — |

Si un paso pide `autoCreatePR` / escritura de repos y el runtime no soporta `pr` → **blocked**.

## Uso

```bash
# Default histórico
export NADF_CODING_RUNTIME=cursor-cloud
export CURSOR_API_KEY=...

# Solo inferencia (sin PR)
export NADF_CODING_RUNTIME=anthropic
export ANTHROPIC_API_KEY=...

# Dry-run CI
export NADF_CODING_RUNTIME=noop
```

Factory: `prototypes/m6-cloud-agent/src/ai-runtime/createAdapter.ts`  
Catálogo: `.nadf/global/ai-runtime/providers.yml`  
Política: `enterprise-governance/ai-runtime.yml`
