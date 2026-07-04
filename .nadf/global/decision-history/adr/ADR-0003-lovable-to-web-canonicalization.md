# ADR-0003: Canonicalización del workflow lovable-to-web y orden de fases Planning/Execution

## Estado

Aceptado

## Fecha

2026-07-04

## Contexto

La revisión arquitectónica de NADF 2.0.0 identificó una **divergencia crítica** entre el workflow canónico global (`lovable-to-web.yml`, 18 pasos) y el workflow de proyecto `novus-intelligence` (15 pasos):

1. El workflow de proyecto omitía `workflow-agent` (Event Trigger) y `reviewer-agent` (Validation).
2. El paso `backend-impact-agent` estaba en posición 5 **después** de la implementación frontend (paso 4), invirtiendo el orden Planning/Execution documentado en `planning-execution-validation.md`.
3. `architect-agent` (Plan Review) ejecutaba en paso 3 **sin** `evaluacion-backend.md` previa.
4. La clave `extends: lovable-to-web` carecía de semántica documentada; el proyecto redefinía todos los pasos sin garantizar alineación con el canónico.

Esta divergencia generaba riesgo alto de implementación frontend sin evaluación backend previa y Plan Review incompleto.

## Decisión

Se **canoniza** el workflow global como fuente de verdad para el orden de fases y se reconcilia el workflow de proyecto:

### Orden de fases obligatorio (18 pasos)

| # | Fase | Agente(s) |
|---|------|-----------|
| 1-2 | Event Trigger | workflow-agent, cargar-contexto |
| 3-5 | Planning | lovable-analyzer, planner, **backend-impact** |
| 6 | Plan Review | architect (con evaluacion-backend.md previa) |
| 7-10 | Execution | frontend, backend, database, cloud (condicionales) |
| 11-13 | Validation | qa, security, **reviewer** |
| 14-18 | Knowledge | documentation, metrics, reflection, kb, adr |

### Reglas de herencia (`extends:`)

1. El workflow global en `.nadf/global/workflow-library/` es **canónico**.
2. Los workflows de proyecto **extienden** el global y solo pueden añadir: mapeo de rutas, inputs/outputs específicos, reglas locales y metadatos de evento.
3. **Prohibido** invertir el orden de fases o mover agentes de Planning a Execution o viceversa.
4. `backend-impact-agent` debe completarse en Planning **antes** de Plan Review y **antes** de cualquier paso de Execution.
5. `frontend-integration-agent` solo ejecuta en Execution **después** de plan aprobado.

### Actualizaciones aplicadas

- `.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml` — 18 pasos alineados al global
- `docs/workflow-model.md` — Semántica de `extends:` documentada
- `.claude/commands/novus-lovable-sync.md` — Orden de pasos corregido
- `project-context.yml` — 19 agentes, quality gates completos, referencia al workflow canónico

## Alternativas consideradas

| Alternativa | Descuento |
|-------------|-----------|
| Mantener workflow de 15 pasos y actualizar solo documentación | No resuelve el riesgo operativo de orden invertido |
| Eliminar `extends:` y duplicar workflow completo por proyecto | Aumenta deriva; pierde trazabilidad al canónico |
| Mover backend-impact a Plan Review en lugar de Planning | Contradice el modelo global y la separación de responsabilidades (evaluación vs aprobación) |
| Implementar merge automático en runtime | Fuera de alcance Fase 1; orquestador es conceptual/manual |

## Consecuencias

### Positivas

- Coherencia global ↔ proyecto verificable
- Plan Review con alcance backend/infra completo
- Reviewer Agent incluido en Validation
- Semántica `extends:` explícita para futuros proyectos

### Negativas / trade-offs

- Workflow de proyecto pasa de 15 a 18 pasos (más pasos manuales en Fase 1)
- Workflows existentes que referenciaban el orden anterior deben actualizarse
- Sin validador automático, la reconciliación depende de revisión humana

## Impacto técnico

| Área | Cambio |
|------|--------|
| Workflows | Proyecto alineado a 18 pasos; fase order inmutable vía `extends` |
| Agentes | `workflow-agent` y `reviewer-agent` habilitados en project-context |
| Quality gates | Añadidos `metrics_registered`, `reflection_generated`, `adr_if_architectural` |
| Documentación | workflow-model, lovable-integration, novus-lovable-sync, planning-execution-validation |
| ADRs | ADR-0001 marcado como Superseded by ADR-0002; este ADR-0003 registra la reconciliación |

## Referencias

- [Revisión arquitectónica](../../../docs/architecture-review.md)
- [Modelo de workflows](../../../docs/workflow-model.md)
- [Planificación, ejecución y validación](../../../docs/planning-execution-validation.md)
- Workflow canónico: `.nadf/global/workflow-library/lovable-to-web.yml`
- ADR-0002: Arquitectura multiagente
