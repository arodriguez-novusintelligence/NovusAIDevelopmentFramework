# NADF-GUIDE
# Propósito: ADR — AI Runtime Providers (desacoplar vendors de IA).
# Configuración: Relacionado con ADR-0005 Agent Runtime Bridge.
# ADR-0008: AI Runtime Providers

- **Status:** Accepted
- **Date:** 2026-07-19
- **Deciders:** NADF maintainers

## Context

El prototipo M6 solo ejecutaba Cursor Cloud Agent (`@cursor/sdk`), aunque el contrato `RuntimeAdapter` era agnóstico. Usuarios con Claude.ai asumían que bastaba ese login; Claude.ai no autentica agentes NADF.

## Decision

1. Separar **Coding Runtime** (repos/PR) de **Inference Provider** (texto).
2. Factory `createRuntimeAdapter()` seleccionada por `NADF_CODING_RUNTIME`.
3. Default `cursor-cloud` (compatibilidad).
4. `anthropic` v1 = solo inferencia (sin `pr` / `repo_write`).
5. `noop` para dry-run.
6. Claude.ai web **no** es provider; se requiere API key del vendor.

## Consequences

- Invokes M6 y fast-paths del framework usan la factory.
- Cambiar de vendor = config/env, no reescribir cada script.
- Un coding agent completo sobre Anthropic (tools+git+PR) queda fuera de v1.
