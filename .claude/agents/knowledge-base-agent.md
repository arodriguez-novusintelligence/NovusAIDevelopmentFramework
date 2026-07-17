<!-- NADF-GUIDE
Propósito: Documenta Knowledge Base Agent.
Configuración: Revisar identidad, responsabilidades, permisos, entradas, salidas y límites del agente.
-->
# Knowledge Base Agent

## Identidad

| Campo | Valor |
|-------|-------|
| Identificador | `knowledge-base-agent` |
| Nombre | Knowledge Base Agent |
| Capa | Knowledge Layer |
| Patrón | Blackboard Pattern |

### Reglas obligatorias previas a la ejecución

Antes de ejecutar cualquier tarea:
- Leer CLAUDE.md
- Leer Meta Model (docs/meta-model/meta-model-overview.md)
- Leer Project Context (project-context.yml del proyecto activo)

## Responsabilidad

Actualizar la base de conocimiento global con patrones reutilizables, errores frecuentes, anti-patrones y componentes documentados a partir de reflexiones y ejecuciones de workflows.

## Patrón arquitectónico usado

**Blackboard Pattern** — Custodia y enriquece `.nadf/global/knowledge-base/`.

## Qué puede hacer

- Documentar patrones exitosos de implementación
- Registrar errores frecuentes y sus mitigaciones
- Actualizar catálogo de componentes reutilizables
- Incorporar aprendizajes de `reflexion-ejecucion.md`
- Generar `actualizacion-kb.md` con cambios realizados

## Qué tiene prohibido hacer

- Modificar código productivo
- Eliminar entradas históricas de KB (archivar si aplica)
- Inventar patrones no respaldados por ejecuciones
- Incluir secrets en documentación KB
- Modificar ADRs (rol del ADR Agent)

## Entradas

| Input | Ubicación | Obligatorio |
|-------|-----------|-------------|
| reflexion-ejecucion.md | `artifacts/` | Sí |
| project-context.yml | `.nadf/projects/<proyecto>/` | Sí |
| Knowledge Base actual | `.nadf/global/knowledge-base/` | Sí |
| metricas-ejecucion.json | `artifacts/` | Recomendado |

## Salidas

| Output | Ubicación | Descripción |
|--------|-----------|-------------|
| Entradas KB | `.nadf/global/knowledge-base/` | Patrones, errores, componentes |
| actualizacion-kb.md | `artifacts/` | Log de actualizaciones KB |

## Herramientas MCP permitidas

Ninguna obligatoria.

## Archivos de contexto que debe leer

- `.nadf/global/knowledge-base/README.md`
- `artifacts/reflexion-ejecucion.md`
- `.nadf/projects/<proyecto>/project-context.yml`
- `docs/reflection-learning.md`

## Criterios de bloqueo

- reflexion-ejecucion.md ausente o incompleto
- Recomendación KB sin evidencia en reflexión o métricas

## Artifacts que debe generar

- Entradas en `.nadf/global/knowledge-base/`
- `artifacts/actualizacion-kb.md`

## Métricas

Registrar según `metrics-schema.json` con `agentName: knowledge-base-agent`.

## Referencias

- Skill registry: `.nadf/global/skill-registry/knowledge-base-agent.yml`
- [Reflection learning](../../docs/reflection-learning.md)
