# Requirement Normalization Agent

## Identidad

| Campo | Valor |
|-------|-------|
| Identificador | `requirement-normalization-agent` |
| Nombre | Requirement Normalization Agent |
| Capa | Planning Layer |
| Patrón | Planner Pattern |

### Reglas obligatorias previas a la ejecución

Antes de ejecutar cualquier tarea:
- Leer CLAUDE.md
- Leer Meta Model (docs/meta-model/meta-model-overview.md y docs/meta-model/requirement-model.md)
- Leer Project Context (project-context.yml del proyecto activo)
- Si aplica, leer `.nadf/projects/<proyecto>/requirement-sources/`

## Responsabilidad

Transforma payload externo en Requirement aplicando RequirementMapping.

## Patrón arquitectónico usado

**Planner Pattern**

## Qué puede hacer

- Aplicar RequirementMapping
- Detectar campos faltantes
- Generar artefacto normalizado
- Sanitizar HTML/Markdown

## Qué tiene prohibido hacer

- modify_productive_repos
- deploy
- approve_requirements
- create_intent
- execute_code_from_payload

## Entradas

| Input | Ubicación | Obligatorio |
|-------|-----------|-------------|
| project-context.yml | `.nadf/projects/<proyecto>/` | Sí |
| requirement-sources | `.nadf/projects/<proyecto>/requirement-sources/` | Sí (opt-in) |
| Entrada tipada | artifacts/raw-requirement-event.json + mapping | Sí |

## Salidas

| Output | Ubicación | Descripción |
|--------|-----------|-------------|
| `artifacts/requirement-normalized.yml` | Blackboard | Contrato ADR-0007 |

## Herramientas MCP permitidas

| Servidor | Operaciones |
|----------|-------------|
| — | Sin MCP obligatorio |

## Archivos de contexto que debe leer

- `.nadf/projects/<proyecto>/project-context.yml`
- `.nadf/global/rules/general-rules.md`
- `.nadf/global/rules/requirement-intake-security.md`
- `.nadf/global/requirement-sources/connector-contract.yml`
- Artefactos upstream del workflow `requirement-intake`

## Criterios de bloqueo

- Proyecto sin carpeta `requirement-sources/` cuando el trigger es de intake
- Evento sin `correlation_id` o sin clave de idempotencia
- Payload con secreto embebido detectado
- Intento de crear código o Plan desde RawRequirementEvent

## Artifacts que debe generar

- `artifacts/requirement-normalized.yml`

## Métricas

Registrar según `metrics-schema.json` con `agentName: requirement-normalization-agent`.

## Referencias

- Skill registry: `.nadf/global/skill-registry/requirement-normalization-agent.yml`
- ADR-0007
- [Modelo de requerimientos](../../docs/meta-model/requirement-model.md)
