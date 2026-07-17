<!-- NADF-GUIDE
Propósito: Documenta Implementation Report — Requirement Intake Layer.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Implementation Report — Requirement Intake Layer

**Fecha:** 2026-07-14  
**Estado:** IMPLEMENTED (contractual / documental)  
**Meta Model:** v1.0.0 → v1.1.0  
**ADR:** ADR-0007

---

## Resumen ejecutivo

Se evoluyó NADF con una **Requirement Intake Layer** opt-in que unifica 15 fuentes empresariales bajo el contrato `RequirementSourceConnector`, sin romper workflows, agentes ni el proyecto `novus-intelligence`.

## Decisiones arquitectónicas

1. Extensión **MINOR** (no MAJOR): Requirement no es obligatorio en flujos v1.0.
2. Siete agentes funcionales (no uno por proveedor).
3. Workflow `requirement-intake` respeta las **9 fases**.
4. Credenciales solo por `CredentialReference`.
5. MCP First + fallback HTTP con el mismo contrato.

## Archivos creados (principales)

| Área | Rutas |
|------|-------|
| ADR | `.nadf/global/decision-history/adr/ADR-0007-requirement-intake-layer.md` |
| Meta model | `docs/meta-model/requirement-model.md` |
| Docs | `docs/requirement-*.md` (5) |
| Contrato | `.nadf/global/requirement-sources/connector-contract.yml` |
| Fuentes | `.nadf/global/requirement-sources/definitions/*.yml` (15) |
| Workflow | `.nadf/global/workflow-library/requirement-intake.yml` |
| Agentes | `.claude/agents/requirement-*-agent.md` (7) + skill registries |
| Proyecto | `.nadf/projects/novus-intelligence/requirement-sources/` |
| Rules | `.nadf/global/rules/requirement-intake-security.md` |
| Contracts | `.nadf/global/artifact-contracts/requirement-intake/` |
| Tests | `tests/requirement-intake/fixtures/*.json` (15) |
| Validator | `tools/validators/requirement_intake_validator.py` |
| Pre-artifacts | `artifacts/*-impact*.md`, `meta-model-change-proposal.md`, … |

## Archivos modificados (principales)

- `docs/meta-model/{specification,versioning,entity-model,event-model,context-model,intent-model,artifact-model,relationship-model,meta-model-overview}.md`
- `docs/{agent-model,workflow-model,mcp-integration}.md`
- `README.md`, `CLAUDE.md`

## Compatibilidad

- IDs de agentes/workflows existentes intactos.
- Proyectos sin `requirement-sources/` = comportamiento v1.0.
- Ejemplo en novus-intelligence: fuentes remotas `enabled: false`; manual ejemplo opt-in.

## Riesgos residuales

- MCP servers nuevos aún no materializados en runtime.
- Dedup semántica requiere modelo/runtime futuro.
- Auto-approval mal configurado: mitigado por reglas + validadores.

## Pendientes (runtime)

- Implementar adapters MCP/HTTP reales por fuente.
- Orquestador productivo que despache `requirement.*.received`.
- UI de gestión de conectores sobre los contratos.

## Pruebas

Ver `artifacts/requirement-intake-validation-report.md`.
