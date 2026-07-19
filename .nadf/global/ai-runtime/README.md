# NADF-GUIDE
# Propósito: Documenta el catálogo AI Runtime (Coding Runtime + Inference).
# Configuración: Ver providers.yml y enterprise-governance/ai-runtime.yml.
# AI Runtime — provider independence

NADF no se acopla a un único vendor de IA.

| Capa | Qué hace | v1 |
|------|----------|----|
| Coding Runtime | Repos, tools, PR | `cursor-cloud` (default) |
| Inference | Texto / JSON | `anthropic` (sin PR) |
| Dry-run | Sin vendors | `noop` |

Selección: `NADF_CODING_RUNTIME` o `enterprise-governance/ai-runtime.yml`.

Claude.ai (producto chat) **no** es provider. Hace falta `CURSOR_API_KEY` o `ANTHROPIC_API_KEY` según el runtime.
