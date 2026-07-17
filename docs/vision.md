<!-- NADF-GUIDE
Propósito: Documenta VisiÃ³n del NovusAIDevelopmentFramework.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# VisiÃ³n del NovusAIDevelopmentFramework

## PropÃ³sito

NADF existe para transformar la forma en que Novus Intelligence desarrolla software: pasando de procesos manuales fragmentados a un **ecosistema multiagente orquestado**, gobernado por reglas explÃ­citas, patrones arquitectÃ³nicos formales e integraciÃ³n MCP con servicios externos.

## Problema que resuelve

El desarrollo asistido por IA genera velocidad, pero tambiÃ©n riesgos:

- CÃ³digo generado sin estÃ¡ndares ni contexto de negocio
- Copia directa de prototipos sin adaptaciÃ³n al stack productivo
- Decisiones implÃ­citas que no quedan documentadas
- Falta de gates de calidad antes de producciÃ³n
- Agentes con roles mezclados (planifican y ejecutan sin separaciÃ³n)
- Dependencia de un Ãºnico proveedor de nube o IA
- Sin aprendizaje acumulativo entre ejecuciones

NADF aborda estos riesgos con una capa de **gobernanza multiagente, contexto estructurado, workflows event-driven y blackboard de conocimiento**.

## VisiÃ³n a largo plazo

> Un ecosistema donde cualquier cambio de diseÃ±o en Lovable se traduce automÃ¡ticamente â€” mediante agentes especializados coordinados por un Orquestador â€” en implementaciÃ³n productiva verificada, documentada, medida y lista para revisiÃ³n humana en Cursor.

### Pilares

1. **IntenciÃ³n separada de implementaciÃ³n** â€” Lovable define el quÃ©; los repositorios productivos definen el cÃ³mo.
2. **Agentes especializados por patrÃ³n** â€” Planner, Executor, Validator, con permisos acotados.
3. **ComunicaciÃ³n mediada** â€” Orquestador + Blackboard; sin comunicaciÃ³n directa entre agentes.
4. **Workflows event-driven** â€” Disparados por commits, PRs, bugs, releases e infra.
5. **IntegraciÃ³n MCP** â€” GitHub, AWS, DB, Terraform, Jira como servicios estÃ¡ndar.
6. **Conocimiento acumulativo** â€” KB, ADRs, reflexiÃ³n y mÃ©tricas en cada ciclo.
7. **Calidad by design** â€” Quality gates en Planning, Execution y Validation.
8. **Multi-proveedor** â€” Arquitectura preparada para AWS hoy y otros proveedores maÃ±ana.

## Arquitectura multiagente

NADF adopta 7 capas y 7 patrones documentados en [multiagent-architecture.md](multiagent-architecture.md) y [ADR-0002](../.nadf/global/decision-history/adr/ADR-0002-multiagent-patterns.md).

## Alcance inicial (Fase 1)

- Proyecto piloto: **Novus Intelligence Solutions**
- Flujo principal: Lovable â†’ Web (18 pasos multiagente, alineado al canÃ³nico global â€” [ADR-0003](../.nadf/global/decision-history/adr/ADR-0003-lovable-to-web-canonicalization.md))
- 27 agentes definidos con skill registry
- Workflows declarativos con modelo de 9 fases
- IntegraciÃ³n MCP documentada (implementaciÃ³n progresiva)

## Alcance futuro (Fases posteriores)

- Orquestador automÃ¡tico de workflows
- Servidores MCP operativos para todos los servicios
- IntegraciÃ³n CI/CD completa
- Dashboard de mÃ©tricas, reflexiÃ³n y decisiones
- Soporte multi-proyecto simultÃ¡neo

## MÃ©tricas de Ã©xito

| MÃ©trica | Objetivo inicial |
|---------|------------------|
| Tiempo Lovable â†’ PR listo | < 2 horas |
| Tasa de rechazo en QA | < 15% |
| Decisiones documentadas (ADR) | 100% de cambios arquitectÃ³nicos |
| Copia directa de Lovable | 0% |
| Mocks en producciÃ³n | 0% |
| Workflows con reflexiÃ³n | 100% de implementaciones |
| Planes aprobados antes de ejecuciÃ³n | 100% |

## Principios no negociables

1. La calidad no se negocia por velocidad.
2. Toda decisiÃ³n relevante queda registrada (ADR).
3. Los humanos aprueban; los agentes ejecutan dentro de su patrÃ³n.
4. Planner no codea; Executor no cambia arquitectura sin ADR.
5. Todo acceso externo vÃ­a MCP cuando aplique.
6. El framework evoluciona; los principios permanecen.
