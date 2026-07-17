# Test Results — NADF v1.1.0-rc.1

**Fecha:** 2026-07-15

## Suites

| Suite | Ubicación | Resultado |
|-------|-----------|-----------|
| Requirement Intake fixtures | `tests/requirement-intake/fixtures` (15) | PASSED |
| Schema válidos | `tests/schemas/valid` | PASSED |
| Schema inválidos | `tests/schemas/invalid` | PASSED |
| State transitions | `tests/state-machines/transitions.json` | PASSED |
| Golden Path | `examples/golden-path-manual-requirement` | PASSED |
| Golden Failure | `examples/golden-failure-missing-credential` | PASSED |

## Casos cubiertos (matriz §15)

| Caso | Estado |
|------|--------|
| Schema válido / inválido | Cubierto |
| Estado / transición válida / inválida | Cubierto |
| Workflow eventos catalogados | Cubierto (validator) |
| Agent con skill registrada | Cubierto (parity) |
| Event registrado | Cubierto |
| Requirement → Intent (fixture 13) | Cubierto |
| Trazabilidad completa (fixture 14 + golden) | Cubierto |
| Falta credential (golden failure) | Cubierto |
| Proyecto legacy sin sources (fixture 15) | Cubierto |
| Secret scan policy | Cubierto (validator security) |

## Notas

- No se añade pytest suite separada en este RC; la ejecución canónica es el CLI `nadf-validator` + intake validator.
- Cycles / broken workflow refs: chequeo estructural vía eventos de workflow-intake; análisis de ciclos profundos de grafo queda como mejora post-RC (ver open risks).
