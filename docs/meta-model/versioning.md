<!-- NADF-GUIDE
Propósito: Documenta NADF Meta Model — Versionado.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# NADF Meta Model — Versionado

**Versión del documento:** 1.0  
**Estado:** Normativo  
**Autoridad:** ADR-0004  
**Meta Model vigente:** v1.1

---

## Propósito

Este documento define las reglas de versionado del NADF Meta Model. Garantiza que las evoluciones del modelo sean predecibles, compatibles y trazables, protegiendo a agentes, workflows y proyectos existentes de rupturas no documentadas.

---

## Esquema de versionado

El Meta Model sigue **Versionado Semántico** (SemVer): `MAJOR.MINOR.PATCH`

| Componente | Incremento | Significado |
|------------|------------|-------------|
| **MAJOR** | Cambio incompatible | Ruptura de contratos: entidades eliminadas, relaciones redefinidas, flujos semánticos alterados |
| **MINOR** | Extensión compatible | Nuevas entidades, atributos opcionales, relaciones adicionales, dominios nuevos |
| **PATCH** | Corrección compatible | Clarificaciones, correcciones tipográficas, ejemplos, glosario; sin cambio semántico |

**Versión actual:** `1.1.0` (publicada como **v1.1** en documentación)

---

## Reglas por tipo de cambio

### MAJOR (v2.0, v3.0, …)

**Requiere:**

- ADR dedicado que documente la ruptura, motivación, plan de migración y timeline
- Aprobación del Framework Architect Agent
- Revisión de impacto en los 27 agentes, workflows globales y proyectos activos
- Periodo de deprecación mínimo de **90 días** para entidades/relaciones eliminadas
- Actualización de `specification.md`, `meta-model-overview.md` y documentos de dominio afectados

**Ejemplos:**

- Eliminar la entidad `Task` y fusionarla con `Execution`
- Redefinir el flujo semántico Intent → Plan (p. ej. introducir `Requirement` intermedio obligatorio)
- Cambiar cardinalidad obligatoria de relaciones core

### MINOR (v1.1, v1.2, …)

**Requiere:**

- Entrada en el changelog del meta model (`.nadf/global/decision-history/` o sección en governance.md)
- Revisión del Framework Architect Agent
- ADR **opcional** (recomendado si el cambio afecta ≥ 3 agentes o workflows)
- Actualización de documentos de dominio afectados
- Compatibilidad hacia atrás garantizada: entidades y flujos v1.0 siguen válidos

**Ejemplos:**

- Añadir entidad `Requirement` como extensión opcional de Intent
- Nuevo tipo de memoria en memory-model.md
- Nuevo evento en event-model.md sin alterar eventos existentes
- Nuevo artefacto en artifact-model.md

### PATCH (v1.0.1, v1.0.2, …)

**Requiere:**

- Commit documental con descripción del cambio
- Sin ADR
- Sin periodo de deprecación

**Ejemplos:**

- Corregir definición de glosario
- Añadir diagrama explicativo
- Clarificar precondición de ciclo de vida en entity-model.md
- Corregir referencia cruzada rota

---

## Compatibilidad

### Compatibilidad hacia atrás (Backward Compatibility)

| Versión origen | Versión destino | Compatibilidad |
|----------------|-----------------|----------------|
| v1.0 | v1.x (Minor) | ✅ Total — entidades y flujos v1.0 permanecen válidos |
| v1.0 | v1.x.y (Patch) | ✅ Total — solo clarificaciones |
| v1.x | v2.0 (Major) | ⚠️ Parcial — requiere plan de migración documentado en ADR |

### Compatibilidad entre capas

| Capa | Regla |
|------|-------|
| **Agentes** | Skill registry debe referenciar entidades de la versión vigente del meta model |
| **Workflows** | Fases y tareas deben mapear a entidades oficiales de la versión vigente |
| **Proyectos** | `project-context.yml` declara la versión del meta model soportada (default: v1.0) |
| **M1 (Schemas)** | JSON Schemas derivan de la versión Major.Minor del meta model |

### Compatibilidad con ADRs

- Un ADR que modifica el meta model **no invalida ADRs previos** salvo que documente explícitamente la supersión.
- ADR-0002 y ADR-0003 permanecen válidos; ADR-0004 extiende el marco normativo sin contradecirlos.

---

## Reglas de deprecación

### Proceso de deprecación

1. **Anuncio** — Marcar entidad, atributo o relación como `@deprecated` en entity-model.md con fecha efectiva y alternativa recomendada.
2. **Periodo de gracia** — Mínimo 90 días (Major) o 30 días (Minor con eliminación) antes de retirar.
3. **Migración** — Documentar mapping deprecated → replacement en governance.md.
4. **Retirada** — Solo en versión Major siguiente al anuncio; requiere ADR.

### Elementos que no se deprecan en Patch

- Entidades del Core Domain
- Relaciones con cardinalidad obligatoria
- Flujos semánticos principales (Intent → Knowledge)
- Eventos del catálogo oficial en uso por workflows activos

---

## Identificación de versión

### En documentación

Cada documento normativo del meta model incluye en su cabecera:

```markdown
**Versión:** 1.0
**Estado:** Normativo
**Meta Model vigente:** v1.0
```

### En project-context.yml

```yaml
metaModel:
  version: "1.0"
  specification: "docs/meta-model/specification.md"
```

*(Campo recomendado; formalización en M1)*

### En ADRs

Los ADRs que afecten el meta model deben declarar:

```markdown
**Meta Model afectado:** v1.0 → v1.1 (Minor)
```

---

## Historial de versiones

| Versión | Fecha | Tipo | Descripción |
|---------|-------|------|-------------|
| **1.1.0** | 2026-07-14 | Minor | Requirement Intake Layer — entidades Requirement*, conectores multi-fuente, ADR-0007 (opt-in) |
| **1.0.0** | 2026-07-04 | Major | Adopción oficial v1.0 — 24 entidades, 13 documentos de dominio, ADR-0004 |

---

## Referencias

- [Especificación oficial](specification.md)
- [Gobernanza del Meta Model](governance.md)
- [ADR-0004](../../.nadf/global/decision-history/adr/ADR-0004-nadf-meta-model.md)
