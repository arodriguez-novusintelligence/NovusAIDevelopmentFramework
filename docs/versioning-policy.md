<!-- NADF-GUIDE
Propósito: Documenta Versioning Policy — NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Versioning Policy — NADF

See also `docs/meta-model/versioning.md`.

| Line | Meaning |
|------|---------|
| `nadf.version` (manifest) | Product / distribution SemVer (`1.1.0-rc.1`) |
| `metaModelVersion` | Meta Model SemVer (`1.1.0`) |
| `project.metadata.nadf_version` | Must track distribution SemVer for RC/GA |
| `project.metadata.metaModel.version` | Must track Meta Model |

## Pre-release

- `rc.N` — release candidates; feature freeze except blockers.
- Intake may stay `release-candidate` while core is `stable`.
