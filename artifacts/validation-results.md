# Validation Results — NADF v1.1.0-rc.1

**Fecha:** 2026-07-15  
**Comando:** `python tools/nadf-validator/__main__.py repository`

## Resultado

```text
Warnings: 0
Errors: 0
RESULT: PASSED
```

## Comandos ejecutados

| Comando | Resultado |
|---------|-----------|
| `repository` | PASSED |
| `security` | PASSED |
| `compatibility` | PASSED |
| `event` | PASSED |
| `traceability` / golden | PASSED |
| `tools/validators/requirement_intake_validator.py` | PASSED 15/15 |

## Cobertura validada

- Manifiesto `1.1.0-rc.1`
- Paridad agentes/skills (27/27)
- Presencia y JSON válido de schemas normativos
- Fixtures schema válidos / inválidos (incl. Mission `$ref` offline vía registry local)
- Máquinas de estado + transiciones allow/deny
- Catálogo de eventos y errores (`NADF-SEC-001`)
- Golden Path instancias + trazabilidad IDs
- Golden Failure Path `BLOCKED` + `NADF-SEC-001`
- Proyecto `novus-intelligence` compatible (intake opt-in)

## Dependencias

```text
pip install -r tools/nadf-validator/requirements.txt
```
