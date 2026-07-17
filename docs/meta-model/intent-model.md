<!-- NADF-GUIDE
Propósito: Documenta NADF Meta Model v1.1 — Modelo de Intención.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# NADF Meta Model v1.1 — Modelo de Intención

**Versión:** 1.1  
**Prioridad:** Crítica — documento más importante del meta model  
**Relacionado con:** [entity-model.md](entity-model.md), [context-model.md](context-model.md), [event-model.md](event-model.md), [requirement-model.md](requirement-model.md)

---

## Propósito

El **Modelo de Intención** define el flujo semántico completo desde la captura de intención de diseño/negocio hasta su consolidación como conocimiento reutilizable. Es el eje central de NADF: garantiza que la intención fluye de forma **unidireccional** (diseño → plan → ejecución → conocimiento) sin copia directa de código ni pérdida de trazabilidad.

---

## Principios del flujo de intención

1. **Intención ≠ Implementación** — `Intent` captura el *qué* y *por qué*; `Execution` produce el *cómo* productivo.
2. **Trazabilidad de origen** — Todo `Intent` registra su fuente (`Context`) y evento disparador.
3. **Aprobación explícita** — Ningún `Intent` avanza a `Execution` sin `Plan` aprobado en Plan Review.
4. **Cierre en Knowledge** — Todo ciclo de intención debe terminar en actualización de `Knowledge`, `Memory` o `Decision (ADR)`.
5. **Independencia de proveedor** — La intención se modela igual independientemente de Lovable, Cursor, Claude u otro motor.

---

## Nacimiento del Intent

### Fuentes de origen

| Fuente | Mecanismo | Evento típico |
|--------|-----------|---------------|
| Lovable / novus-nexus | Commit en repositorio de diseño | `lovable.commit` |
| Conversación humana | Solicitud explícita en IDE | `intent.manual` |
| Jira | Ticket de feature/bug | `jira.story.created`, `jira.bug.reported` |
| GitHub | Issue o PR | `github.issue.opened` |
| Markdown / PDF | Documento de requisitos | `context.document.ingested` |
| Knowledge Base | Patrón reutilizable | `knowledge.pattern.requested` |
| Requirement Intake (v1.1) | Requirement aprobado multi-fuente | `RequirementConvertedToIntent` |

> **v1.1:** Cuando el proyecto tiene intake habilitado, Jira/Slack/GitHub/etc. deben producir `Requirement` antes de `Intent`. Sin intake, el nacimiento directo Event → Intent (v1.0) permanece válido.

### Proceso de nacimiento

```mermaid
flowchart TD
    SRC["Fuente externa<br/>(Lovable, Jira, Conversación...)"]
    EVT["Evento tipado"]
    CTX["Context ensamblado"]
    LA["Lovable Analyzer / Agente clasificador"]
    INT["Intent formalizado"]

    SRC --> EVT
    EVT --> CTX
    CTX --> LA
    LA -->|"analiza cambios / requisitos"| INT
    INT -->|"emite"| IC["IntentCreated"]
```

### Atributos iniciales del Intent

Al nacer, un `Intent` contiene como mínimo:

- `id`, `source`, `type`, `scope`, `priority`
- Referencia al `Context` ensamblado
- Referencia al `Event` disparador
- `requirement_id` (opcional, ADR-0007)
- `status: captured`

---

## Evolución del Intent

### Estados del ciclo de vida

```mermaid
stateDiagram-v2
    [*] --> Captured: IntentCreated
    Captured --> Analyzed: Análisis completado
    Analyzed --> Planned: PlanGenerated
    Planned --> Approved: PlanApproved
    Planned --> Rejected: PlanRejected
    Rejected --> Analyzed: Re-análisis
    Approved --> InExecution: WorkflowStarted
    InExecution --> Validated: ValidationPassed
    InExecution --> Failed: ExecutionFailed / ValidationFailed
    Failed --> Analyzed: ReplanRequested
    Validated --> Consolidated: KnowledgeUpdated
    Consolidated --> [*]
    Approved --> Cancelled: IntentCancelled
    Cancelled --> [*]
```

### Transiciones y eventos asociados

| Transición | Evento | Agente responsable |
|------------|--------|-------------------|
| Captured → Analyzed | `IntentAnalyzed` | Lovable Analyzer, Planner |
| Analyzed → Planned | `PlanGenerated` | Planner Agent |
| Planned → Approved | `PlanApproved` | Architect Agent |
| Planned → Rejected | `PlanRejected` | Architect Agent |
| Approved → InExecution | `WorkflowStarted` | Workflow Agent, Orquestador |
| InExecution → Validated | `ValidationPassed` | QA, Security, Reviewer |
| Validated → Consolidated | `KnowledgeUpdated` | Reflection, KB, ADR Agents |

---

## Transformación Intent → Plan

### Semántica de la transformación

El `Plan` es la **traducción estructurada** del `Intent` en acciones concretas, evaluaciones de impacto y criterios de aceptación. No es código; es un artefacto de planificación aprobable.

```mermaid
flowchart LR
    INT["Intent<br/>(intención visual/funcional)"]
    ANA["Análisis Lovable<br/>cambios-lovable.json"]
    EVAL["Evaluación Backend<br/>evaluacion-backend.md"]
    PLN["Plan<br/>plan-implementacion.md"]
    IMP["Impacto<br/>impacto-arquitectonico.md"]

    INT --> ANA
    INT --> PLN
    ANA --> PLN
    EVAL --> PLN
    PLN --> IMP
```

### Contenido conceptual del Plan

| Sección | Origen | Propósito |
|---------|--------|-----------|
| Resumen de intención | Intent | Trazabilidad al origen |
| Alcance frontend | Intent + Context | Componentes afectados |
| Alcance backend | Backend Impact Agent | APIs, schemas, infra |
| Criterios de aceptación | Intent + Quality Gates | Condiciones de cierre |
| Restricciones | Policy, Rule, ADR | Límites no negociables |
| Status | Architect Agent | `draft` → `approved` / `rejected` |

### Precondiciones

- `Intent.status >= analyzed`
- `Context` cargado (project-context.yml + memoria)
- `Backend Impact` completado **antes** de Plan Review (ADR-0003)

---

## Generación de Workflows

### Selección de workflow

El **Workflow Agent** transforma un `Plan` aprobado en una instancia de `Workflow` parametrizada:

```mermaid
sequenceDiagram
    participant I as Intent
    participant P as Plan (approved)
    participant WA as Workflow Agent
    participant WL as Workflow Library
    participant W as Workflow Instance
    participant O as Orquestador

    I->>P: PlanApproved
    P->>WA: Plan + Event context
    WA->>WL: Resolver workflow canónico
    WL-->>WA: lovable-to-web.yml (18 pasos)
    WA->>W: Instanciar + parametrizar
    W->>O: WorkflowCreated
    O->>O: Descomponer en Tasks
```

### Reglas de instanciación

1. El workflow global en `.nadf/global/workflow-library/` es **canónico** (ADR-0003).
2. El workflow de proyecto **extiende** el global; no puede invertir fases.
3. Cada fase del modelo de 9 fases genera uno o más `Task`.
4. Condiciones del Plan determinan ramificaciones (p. ej. `requires_backend == true`).

### Mapeo Plan → Workflow (novus-intelligence)

| Elemento del Plan | Parámetro del Workflow |
|-------------------|------------------------|
| Componentes frontend | `mapping.components` |
| Requiere backend | `conditions.requires_backend` |
| Cambio infra | `conditions.requires_cloud` |
| Severidad | `priority`, gates adicionales |

---

## Ejecución y validación

Durante la ejecución, el `Intent` permanece como **referencia de trazabilidad** en cada `Task` y `Execution`:

```
Intent (ref) → Task → Execution → Artifact → Validation
```

Los agentes Executor consultan el Plan aprobado, no el Intent crudo. El Intent sirve para:

- Coherencia en Reviewer Agent (plan vs implementación vs intención original)
- Reflexión post-ejecución (¿se cumplió la intención?)
- Métricas de alineación intención-resultado

---

## Cierre en Knowledge

### Flujo final: Intent → Knowledge

```mermaid
flowchart TB
    INT["Intent original"]
    EXE["Execution completada"]
    ART["Artifacts en Blackboard"]
    VAL["ValidationPassed"]
    DOC["Documentation Agent"]
    MET["Metrics Agent"]
    REF["Reflection Agent"]
    KB["Knowledge Base Agent"]
    ADR["ADR Agent"]
    KNO["Knowledge consolidado"]
    MEM["Memory actualizada"]

    INT -.->|"trazabilidad"| REF
    EXE --> ART
    ART --> VAL
    VAL --> DOC
    DOC --> MET
    MET --> REF
    REF --> KB
    REF --> ADR
    KB --> KNO
    ADR --> KNO
    DOC --> MEM
    REF --> MEM

    style INT fill:#e1f5fe
    style KNO fill:#f3e5f5
```

### Artefactos de cierre

| Artefacto | Agente | Contribución a Knowledge |
|-----------|--------|--------------------------|
| `reflexion-ejecucion.md` | Reflection | Aprendizajes, anti-patrones |
| Patrones en KB | Knowledge Base | Reutilización futura |
| ADR | ADR Agent | Decisiones arquitectónicas |
| `decision-log.md` | Documentation | Historial de decisiones |
| Métricas | Metrics | Datos cuantitativos del ciclo |

### Criterios de cierre del Intent

Un `Intent` alcanza estado `Consolidated` cuando:

1. Todos los quality gates aplicables han pasado
2. `ReflectionCompleted` registrado
3. `KnowledgeUpdated` o justificación documentada de no actualización
4. ADR creado si hubo decisión arquitectónica (gate `adr_if_architectural`)
5. `Intent.status = consolidated`

---

## Diagrama de flujo completo

```mermaid
flowchart TD
    subgraph CAPTURE["1. Captura"]
        S1["Fuente: Lovable / Jira / Conversación"]
        S2["Evento disparador"]
        S3["Context ensamblado"]
    end

    subgraph INTENT_PHASE["2. Intención"]
        I1["IntentCreated"]
        I2["Intent analizado"]
    end

    subgraph PLANNING["3. Planificación"]
        P1["PlanGenerated"]
        P2["Backend Impact evaluado"]
        P3["PlanApproved / PlanRejected"]
    end

    subgraph ORCHESTRATION["4. Orquestación"]
        W1["WorkflowCreated"]
        W2["Tasks asignadas"]
    end

    subgraph EXECUTION["5. Ejecución"]
        E1["ExecutionStarted"]
        E2["Artifacts generados"]
        E3["ExecutionFinished"]
    end

    subgraph VALIDATION["6. Validación"]
        V1["ValidationPassed / ValidationFailed"]
    end

    subgraph KNOWLEDGE["7. Conocimiento"]
        K1["Metrics + Reflection"]
        K2["KnowledgeUpdated"]
        K3["Intent Consolidated"]
    end

    S1 --> S2 --> S3 --> I1 --> I2
    I2 --> P1 --> P2 --> P3
    P3 -->|approved| W1 --> W2 --> E1 --> E2 --> E3
    P3 -->|rejected| I2
    E3 --> V1
    V1 -->|pass| K1 --> K2 --> K3
    V1 -->|fail crítico| I2

    style I1 fill:#e1f5fe
    style K3 fill:#f3e5f5
```

---

## Ejemplo: novus-intelligence / lovable-to-web

| Fase del flujo | Instancia concreta |
|----------------|-------------------|
| Fuente | Commit en `novus-nexus` (Lovable) |
| Evento | `lovable.commit` |
| Intent | «Actualizar landing page con nueva sección de servicios» |
| Plan | `plan-implementacion.md` (status: approved) |
| Workflow | `lovable-to-web` (18 pasos, extends canónico) |
| Execution | Frontend Integration en NovusIntelligenceWEB |
| Validation | QA + Security + Reviewer pass |
| Knowledge | Patrón «sección servicios responsive» en KB |

---

## Referencias

- [entity-model.md](entity-model.md) — Entidades Intent, Plan, Workflow
- [context-model.md](context-model.md) — Fuentes de contexto
- [event-model.md](event-model.md) — IntentCreated, PlanApproved, KnowledgeUpdated
- [learning-model.md](learning-model.md) — Reflection y cierre
- [artifact-model.md](artifact-model.md) — Artefactos del flujo
- [planning-execution-validation.md](../planning-execution-validation.md)
