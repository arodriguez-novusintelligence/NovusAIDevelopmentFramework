# Requirement Traceability

**Autoridad:** ADR-0007

---

## Cadena normativa

```text
RawRequirementEvent
  → Requirement
  → Context
  → Intent
  → Plan
  → Execution
  → Artifact
  → Validation
  → Deployment
```

## Entidad TraceabilityLink

```yaml
from_entity_type: Requirement
from_entity_id: req-uuid
to_entity_type: Intent
to_entity_id: intent-uuid
relation: converted_to
correlation_id: corr-uuid
```

## Artefactos

| Artefacto | Contenido |
|-----------|-----------|
| `requirement-to-intent-map.yml` | `requirement_id` ↔ `intent_id` |
| `requirement-traceability.json` | Lista de `TraceabilityLink` |

## Reglas

- Intent creado vía intake **debe** tener `requirement_id`.
- No romper la cadena al seleccionar workflow downstream.
- Validador: Intent sin Requirement trazable → fallo cuando intake produjo el Intent.

## Agente

`requirement-traceability-agent`
