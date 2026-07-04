# Visión del NovusAIDevelopmentFramework

## Propósito

NADF existe para transformar la forma en que Novus Intelligence desarrolla software: pasando de procesos manuales fragmentados a un **ecosistema multiagente orquestado**, gobernado por reglas explícitas, patrones arquitectónicos formales e integración MCP con servicios externos.

## Problema que resuelve

El desarrollo asistido por IA genera velocidad, pero también riesgos:

- Código generado sin estándares ni contexto de negocio
- Copia directa de prototipos sin adaptación al stack productivo
- Decisiones implícitas que no quedan documentadas
- Falta de gates de calidad antes de producción
- Agentes con roles mezclados (planifican y ejecutan sin separación)
- Dependencia de un único proveedor de nube o IA
- Sin aprendizaje acumulativo entre ejecuciones

NADF aborda estos riesgos con una capa de **gobernanza multiagente, contexto estructurado, workflows event-driven y blackboard de conocimiento**.

## Visión a largo plazo

> Un ecosistema donde cualquier cambio de diseño en Lovable se traduce automáticamente — mediante agentes especializados coordinados por un Orquestador — en implementación productiva verificada, documentada, medida y lista para revisión humana en Cursor.

### Pilares

1. **Intención separada de implementación** — Lovable define el qué; los repositorios productivos definen el cómo.
2. **Agentes especializados por patrón** — Planner, Executor, Validator, con permisos acotados.
3. **Comunicación mediada** — Orquestador + Blackboard; sin comunicación directa entre agentes.
4. **Workflows event-driven** — Disparados por commits, PRs, bugs, releases e infra.
5. **Integración MCP** — GitHub, AWS, DB, Terraform, Jira como servicios estándar.
6. **Conocimiento acumulativo** — KB, ADRs, reflexión y métricas en cada ciclo.
7. **Calidad by design** — Quality gates en Planning, Execution y Validation.
8. **Multi-proveedor** — Arquitectura preparada para AWS hoy y otros proveedores mañana.

## Arquitectura multiagente

NADF adopta 7 capas y 7 patrones documentados en [multiagent-architecture.md](multiagent-architecture.md) y [ADR-0002](../.nadf/global/decision-history/adr/ADR-0002-multiagent-patterns.md).

## Alcance inicial (Fase 1)

- Proyecto piloto: **Novus Intelligence Solutions**
- Flujo principal: Lovable → Web (15 pasos multiagente)
- 19 agentes definidos con skill registry
- Workflows declarativos con modelo de 9 fases
- Integración MCP documentada (implementación progresiva)

## Alcance futuro (Fases posteriores)

- Orquestador automático de workflows
- Servidores MCP operativos para todos los servicios
- Integración CI/CD completa
- Dashboard de métricas, reflexión y decisiones
- Soporte multi-proyecto simultáneo

## Métricas de éxito

| Métrica | Objetivo inicial |
|---------|------------------|
| Tiempo Lovable → PR listo | < 2 horas |
| Tasa de rechazo en QA | < 15% |
| Decisiones documentadas (ADR) | 100% de cambios arquitectónicos |
| Copia directa de Lovable | 0% |
| Mocks en producción | 0% |
| Workflows con reflexión | 100% de implementaciones |
| Planes aprobados antes de ejecución | 100% |

## Principios no negociables

1. La calidad no se negocia por velocidad.
2. Toda decisión relevante queda registrada (ADR).
3. Los humanos aprueban; los agentes ejecutan dentro de su patrón.
4. Planner no codea; Executor no cambia arquitectura sin ADR.
5. Todo acceso externo vía MCP cuando aplique.
6. El framework evoluciona; los principios permanecen.
