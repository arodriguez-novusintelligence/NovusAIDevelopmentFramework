# Documentation Consistency Report

**Fecha:** 2026-07-15

## Living docs OK (post gap-closure)

- `CLAUDE.md`, `README.md`, `meta-model-overview.md`, `specification.md`, `agent-model.md` → 27 agentes / v1.1

## Living docs STALE (bloquear RC hasta fix)

| Archivo | Problema |
|---------|----------|
| `docs/roadmap.md` | 19 agentes, 2.0.0 |
| `docs/vision.md` | 19 agentes |
| `docs/cloud-agent-integration.md` | Título «19 agentes» |
| `docs/meta-model/architecture-principles.md` | «19 agentes» |
| `docs/meta-model/meta-model-overview.md` | Algunas secciones aún etiquetadas «v1.0» |

## Históricos (OK archival)

- ADR-0002/0004/0005, architecture-review*.md — snapshots; no reescribir historia; añadir nota «figures as of acceptance date».

## Ausentes para RC

- CHANGELOG.md, RELEASE-NOTES.md, MIGRATION-GUIDE.md, COMPATIBILITY.md, SECURITY.md, CONTRIBUTING.md
- docs/naming-conventions.md, state-machines.md, error-catalog.md, stability-policy.md, release-definition-of-done.md

## Número de pasos lovable-to-web

Alinear a un único número en project-context + workflow YAML + docs (recomendación: contar pasos declarados en YAML).
