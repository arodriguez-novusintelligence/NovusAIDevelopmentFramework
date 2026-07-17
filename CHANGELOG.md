<!-- NADF-GUIDE
Propósito: Documenta CHANGELOG — NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# CHANGELOG — NADF

## [1.1.0-rc.1] — 2026-07-15

### Added
- Requirement Intake Layer (ADR-0007) — opt-in multi-source requirements.
- Normative JSON Schemas under `schemas/`.
- Event catalog, error catalog, state machines.
- `tools/nadf-validator` repository validator.
- Golden path + golden failure examples.
- `nadf-manifest.yml`.

### Changed
- Meta Model 1.0 → 1.1 (compatible).
- Agent catalog 20 core + 7 intake (+ visual-parity) = 27.
- Project metadata now tracks `nadf_version: 1.1.0-rc.1` and `metaModel.version`.

### Security
- CredentialReference-only for secrets.
- Secret scan in validator; `.gitignore` hardened.

## [1.0.0] — 2026-07-04

- Initial Meta Model adoption (ADR-0004), multiagent architecture, lovable-to-web canonicalization.
