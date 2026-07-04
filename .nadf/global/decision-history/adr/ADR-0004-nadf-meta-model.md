# ADR-0004: NADF adopta oficialmente el Meta Model como especificación central del framework

## Estado

Aceptado

## Fecha

2026-07-04

## Contexto

Tras la fundación de NADF (ADR-0001) y la adopción de la arquitectura multiagente (ADR-0002), el framework cuenta con 19 agentes, 7 capas arquitectónicas, 7 patrones y un workflow canónico de 18 pasos / 9 fases. La canonización del flujo Lovable → Web (ADR-0003) consolidó la separación entre intención de diseño e implementación productiva.

En paralelo, el equipo de arquitectura desarrolló el **NADF Meta Model v1.0** en `docs/meta-model/`: una especificación conceptual de 24 entidades, relaciones, eventos, ciclos de vida y flujos semánticos que unifican agentes, workflows, artefactos, MCP y gobernanza bajo un lenguaje común.

Hasta esta decisión, el meta model existía como documentación de referencia sin estatus normativo formal. Los agentes, workflows y ADRs se alineaban implícitamente con sus conceptos, pero no existía una declaración de autoridad, gobernanza de versiones ni requisitos de cumplimiento explícitos.

## Problema

Sin una especificación central oficialmente adoptada, el framework enfrenta los siguientes riesgos:

1. **Fragmentación semántica** — Cada agente o workflow podría introducir entidades, artefactos o flujos ad hoc sin contrato común.
2. **Inconsistencia arquitectónica** — Las 7 capas de ADR-0002 y los dominios del meta model podrían divergir sin mecanismo de reconciliación.
3. **Evolución no gobernada** — Cambios al modelo conceptual carecerían de criterios de versionado, aprobación y compatibilidad.
4. **Onboarding costoso** — Nuevos proyectos y agentes no tendrían un punto de entrada normativo único para entender el dominio NADF.
5. **Trazabilidad incompleta** — El flujo Intent → Plan → Execution → Validation → Knowledge no estaría formalizado como contrato obligatorio.

## Decisión

NADF adopta oficialmente el **NADF Meta Model v1.0** (`docs/meta-model/`) como la **especificación central y normativa** del framework.

Esta adopción implica:

1. El Meta Model es el **lenguaje oficial** del framework: toda entidad, relación, evento y flujo debe expresarse en sus términos o extenderlo formalmente.
2. Ningún agente puede crear entidades nuevas sin **extender el Meta Model** mediante el proceso de gobernanza definido en `docs/meta-model/governance.md`.
3. Todos los workflows deben operar sobre **entidades oficiales** del meta model (Intent, Plan, Workflow, Task, Execution, Artifact, Validation, Knowledge, etc.).
4. Todos los artefactos deben **mapearse** a entidades del meta model según `docs/meta-model/artifact-model.md`.
5. Todo contexto de entrada se transforma primero en **Intent** antes de planificar o ejecutar.
6. La documentación normativa oficial queda constituida por:
   - `docs/meta-model/specification.md` — Declaración de autoridad y cumplimiento
   - `docs/meta-model/meta-model-overview.md` — Visión general v1.0
   - `docs/meta-model/governance.md` — Proceso de modificación
   - `docs/meta-model/versioning.md` — Reglas de versionado
   - `docs/meta-model/architecture-principles.md` — Principios arquitectónicos oficiales
   - Los 13 documentos de dominio complementarios en `docs/meta-model/`

## Motivación

- **Unificar el vocabulario** entre los 19 agentes, 8 workflows y múltiples proyectos bajo un contrato semántico compartido.
- **Formalizar el flujo Intent → Knowledge** como columna vertebral del ciclo de vida NADF, alineado con ADR-0002 y ADR-0003.
- **Preparar M1 (Contract & Schema Layer)** con una base conceptual estable antes de definir JSON Schemas formales.
- **Garantizar independencia de proveedor** abstrayendo IA, cloud e IDE en entidades Provider, Tool y MCP Server.
- **Establecer gobernanza explícita** para evolucionar el modelo sin rupturas no documentadas.

## Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| Lenguaje común | Agentes, workflows y ADRs comparten vocabulario y contratos semánticos |
| Trazabilidad end-to-end | Cadena auditable Context → Intent → Plan → Execution → Validation → Knowledge |
| Extensibilidad controlada | Nuevas entidades solo vía proceso de gobernanza y versionado |
| Alineación arquitectónica | Reconciliación explícita entre capas ADR-0002 y capas del meta model |
| Base para contratos formales | M1 puede derivar JSON Schemas directamente de entidades del meta model |
| Onboarding estandarizado | Punto de entrada único: `specification.md` + `meta-model-overview.md` |
| Cumplimiento verificable | Requisitos de conformidad documentados y aplicables a agentes y workflows |

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Sobrecarga documental inicial | Priorizar lectura obligatoria de overview + specification; dominios bajo demanda |
| Resistencia al proceso de gobernanza | ADR-0004 y governance.md definen criterios claros de cuándo se requiere ADR |
| Desalineación docs ↔ YAML | M7 (validador CI) verificará conformidad; M0 mantiene sincronización continua |
| Rigidez excesiva en cambios menores | Versionado Minor/Patch permite extensiones compatibles sin ADR |
| Curva de aprendizaje del meta model | Integración en CLAUDE.md y reglas obligatorias en los 19 agentes |

## Consecuencias

### Positivas

- `CLAUDE.md`, `README.md` y `docs/architecture.md` referencian el Meta Model como especificación central.
- Los 19 agentes incluyen reglas obligatorias de lectura previa (CLAUDE.md, meta-model-overview, project-context.yml).
- Framework Architect Agent custodia la evolución del meta model.
- ADR Agent registra toda modificación mayor del modelo.
- El flujo semántico Intent → Knowledge queda formalizado como contrato del framework.

### Negativas

- Incremento del corpus documental normativo (4 documentos nuevos + actualizaciones).
- Toda extensión del framework requiere verificación de conformidad con el meta model.
- Workflows y agentes existentes deben revisarse periódicamente para detectar drift semántico.

## Compatibilidad

Esta decisión es **totalmente compatible** con decisiones previas:

| ADR / Documento | Relación |
|-----------------|----------|
| **ADR-0001** | El meta model formaliza el dominio conceptual implícito en la fundación de NADF |
| **ADR-0002** | Las 7 capas arquitectónicas se reconcilian con las 6 capas del meta model (Intent + Infrastructure); los 7 patrones se mapean a entidades Agent, Workflow, Knowledge |
| **ADR-0003** | El flujo Lovable → Web opera sobre Intent (captura) → Plan (planificación) → Execution (implementación) → Validation → Knowledge |
| **docs/architecture.md** | Se amplía con sección Architecture Layers alineada al meta model sin invalidar las 7 capas originales |
| **Agentes existentes (19)** | Se añade sección de reglas obligatorias; definiciones de agente permanecen válidas |
| **Workflow library (8 YAML)** | Sin cambio estructural; deben conformarse progresivamente a entidades oficiales |

No se requiere migración de código ni de workflows. La conformidad se verifica documentalmente en M0 y, futuramente, mediante M7 (validador CI).

## Evolución futura

1. **M1 (Contract & Schema Layer)** — Derivar JSON Schemas de las 24 entidades del Core Domain.
2. **M7 (Validador CI)** — Automatizar verificación de conformidad agentes ↔ meta model ↔ skill registry.
3. **Meta Model v1.1** — Extensiones Minor (nuevas entidades compatibles, atributos opcionales) vía governance.md.
4. **Meta Model v2.0** — Cambios Major (ruptura de contratos) requieren ADR dedicado y plan de migración.
5. **Orquestador automático** — El motor de runtime consumirá entidades del meta model como contratos de orquestación.

## Referencias

- [NADF Meta Model v1.0 — Visión general](../../../docs/meta-model/meta-model-overview.md)
- [Especificación oficial](../../../docs/meta-model/specification.md)
- [Gobernanza del Meta Model](../../../docs/meta-model/governance.md)
- [Versionado del Meta Model](../../../docs/meta-model/versioning.md)
- [Principios arquitectónicos](../../../docs/meta-model/architecture-principles.md)
- [ADR-0001](ADR-0001-nadf-foundation.md)
- [ADR-0002](ADR-0002-multiagent-patterns.md)
- [ADR-0003](ADR-0003-lovable-to-web-canonicalization.md)
