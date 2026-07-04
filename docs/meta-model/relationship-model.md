# NADF Meta Model v1.0 — Modelo de Relaciones

**Versión:** 1.0  
**Relacionado con:** [entity-model.md](entity-model.md), [meta-model-overview.md](meta-model-overview.md)

---

## Propósito

Este documento define las **relaciones formales** entre las entidades del Core Domain NADF, clasificadas en cuatro tipos UML: **composición**, **agregación**, **dependencia** y **asociación**. Las relaciones son independientes del proveedor de IA o cloud.

---

## Tipos de relación

| Tipo | Símbolo | Semántica NADF |
|------|---------|----------------|
| **Composición** | ◆—— | La entidad hija no existe sin la padre; ciclo de vida acoplado |
| **Agregación** | ◇—— | Relación «tiene»; la hija puede existir independientemente |
| **Dependencia** | - - → | La entidad origen requiere la destino para operar |
| **Asociación** | ——— | Relación estructural sin propiedad de ciclo de vida |

---

## Diagrama general de relaciones

```mermaid
erDiagram
    PROJECT ||--o{ CONTEXT : "ensambla"
    PROJECT ||--o{ MEMORY : "posee"
    PROJECT ||--o{ WORKFLOW : "instancia"
    PROJECT }o--|| DOMAIN : "pertenece"
    PROJECT }o--o{ POLICY : "aplica"
    PROJECT }o--o{ QUALITY_GATE : "requiere"

    DOMAIN ||--o{ KNOWLEDGE : "clasifica"

    CONTEXT }o--|| PROJECT : "pertenece"
    CONTEXT }o--o{ ARTIFACT : "referencia"

    INTENT ||--o{ PLAN : "genera"
    INTENT }o--|| EVENT : "originado_por"
    INTENT }o--|| CONTEXT : "consume"

    PLAN ||--o{ WORKFLOW : "instancia"
    PLAN }o--|| INTENT : "traduce"

    WORKFLOW ||--|{ TASK : "compone"
    WORKFLOW }o--o{ AGENT : "referencia"
    WORKFLOW }o--o{ QUALITY_GATE : "aplica"

    TASK ||--o{ EXECUTION : "produce"
    TASK }o--|| AGENT : "asigna"

    AGENT ||--|{ SKILL : "compone"
    AGENT }o--o{ CAPABILITY : "agrega"
    AGENT }o--o{ TOOL : "usa"
    AGENT }o--o{ MCP_SERVER : "accede"

    CAPABILITY ||--o{ SKILL : "especializa"

    SKILL }o--o{ TOOL : "invoca"

    TOOL }o--|| MCP_SERVER : "via_mcp"
    TOOL }o--|| PROVIDER : "provisto_por"

    MCP_SERVER }o--|| PROVIDER : "abstrae"

    EXECUTION ||--|{ ARTIFACT : "compone"
    EXECUTION ||--o{ METRIC : "compone"
    EXECUTION }o--|| TASK : "ejecuta"
    EXECUTION }o--|| AGENT : "realizada_por"

    ARTIFACT }o--o{ VALIDATION : "evaluado_por"
    ARTIFACT }o--o{ KNOWLEDGE : "alimenta"

    VALIDATION }o--|| QUALITY_GATE : "aplica"
    VALIDATION }o--|| AGENT : "realizada_por"

    QUALITY_GATE }o--|| POLICY : "deriva"
    POLICY ||--|{ RULE : "compone"
    RULE }o--o{ DECISION : "fundamenta"

    KNOWLEDGE }o--o{ DECISION : "coherente_con"
    KNOWLEDGE }o--o{ MEMORY : "consolida"

    ENVIRONMENT ||--o{ DEPLOYMENT : "compone"
    ENVIRONMENT }o--o{ PROVIDER : "configura"
    DEPLOYMENT }o--|| PROJECT : "pertenece"
```

---

## Composición (◆——)

Relaciones de propiedad fuerte; eliminación de la entidad padre implica eliminación lógica de las hijas.

| Padre | Hijo | Cardinalidad | Descripción |
|-------|------|--------------|-------------|
| Workflow | Task | 1:N | Un workflow se compone de tareas ordenadas |
| Task | Execution | 1:N | Una tarea puede tener múltiples ejecuciones (reintentos) |
| Execution | Artifact | 1:N | Una ejecución produce uno o más artefactos |
| Execution | Metric | 1:N | Una ejecución registra múltiples métricas |
| Agent | Skill | 1:N | Un agente se compone de skills registradas |
| Policy | Rule | 1:N | Una política se operacionaliza en reglas |
| Environment | Deployment | 1:N | Un ambiente contiene despliegues |
| MCP Server | Tool (MCP) | 1:N | Un servidor MCP expone herramientas |

### Diagrama de composición — Ejecución

```mermaid
classDiagram
    class Workflow {
        +id
        +phases
        +steps
    }
    class Task {
        +id
        +phase
        +agent_id
    }
    class Execution {
        +id
        +status
        +result
    }
    class Artifact {
        +name
        +path
    }
    class Metric {
        +name
        +value
    }

    Workflow "1" *-- "N" Task : compone
    Task "1" *-- "N" Execution : produce
    Execution "1" *-- "N" Artifact : genera
    Execution "1" *-- "N" Metric : registra
```

---

## Agregación (◇——)

Relaciones «tiene» sin acoplamiento de ciclo de vida.

| Contenedor | Contenido | Cardinalidad | Descripción |
|------------|-----------|--------------|-------------|
| Project | Workflow | 1:N | Proyecto agrega instancias de workflow |
| Project | Memory | 1:N | Proyecto agrega memorias |
| Domain | Project | 1:N | Dominio agrupa proyectos |
| Agent | Capability | N:M | Agente agrega capacidades abstractas |
| Capability | Skill | 1:N | Capability se concreta en skills |
| Environment | Provider | N:M | Ambiente configura proveedores |
| Project | Quality Gate | N:M | Proyecto adopta gates |

### Diagrama de agregación — Agente

```mermaid
classDiagram
    class Agent {
        +id
        +pattern
        +layer
    }
    class Capability {
        +id
        +name
    }
    class Skill {
        +id
        +input_contract
        +output_contract
    }
    class Tool {
        +id
        +type
    }

    Agent o-- Capability : agrega
    Capability o-- Skill : especializa
    Agent o-- Skill : posee
    Skill ..> Tool : usa
```

---

## Dependencia (- - →)

Relaciones de uso; la entidad origen necesita la destino para completar su función.

| Origen | Destino | Descripción |
|--------|---------|-------------|
| Intent | Context | Intent requiere contexto ensamblado |
| Intent | Event | Intent depende del evento disparador |
| Plan | Intent | Plan traduce un Intent |
| Workflow | Plan | Workflow se parametriza desde Plan aprobado |
| Task | Agent | Task depende de Agent asignado |
| Task | Artifact (input) | Task consume artefactos previos |
| Agent | Context | Agent lee contexto antes de actuar |
| Agent | Tool | Agent invoca tools para actuar |
| Tool | MCP Server | Tool MCP depende del servidor |
| Tool | Provider | Tool depende del proveedor subyacente |
| Validation | Quality Gate | Validation evalúa un gate |
| Validation | Artifact | Validation evalúa un artefacto |
| Rule | Policy | Rule deriva de Policy |
| Rule | Decision | Rule puede fundamentarse en ADR |
| Deployment | Environment | Deployment requiere ambiente destino |
| Deployment | Project | Deployment pertenece a proyecto |
| Knowledge | Artifact | Knowledge se extrae de artefactos |

### Diagrama de dependencia — Flujo Intent

```mermaid
flowchart LR
    EVT["Event"] -.-> INT["Intent"]
    CTX["Context"] -.-> INT
    INT -.-> PLN["Plan"]
    PLN -.-> WF["Workflow"]
    WF -.-> TSK["Task"]
    TSK -.-> AGT["Agent"]
    CTX -.-> AGT
    AGT -.-> TOL["Tool"]
    TOL -.-> MCP["MCP Server"]
```

---

## Asociación (———)

Relaciones estructurales sin propiedad de ciclo de vida.

| Entidad A | Entidad B | Cardinalidad | Descripción |
|-----------|-----------|--------------|-------------|
| Project | Policy | N:M | Proyecto asociado a políticas |
| Project | Domain | N:1 | Proyecto clasificado en dominio |
| Artifact | Knowledge | N:M | Artefactos alimentan conocimiento |
| Artifact | Validation | 1:N | Artefacto evaluado múltiples veces |
| Knowledge | Decision | N:M | Coherencia entre KB y ADRs |
| Knowledge | Memory | N:M | Conocimiento consolidado en memoria |
| Agent | MCP Server | N:M | Agentes acceden a servidores MCP |
| Workflow | Quality Gate | N:M | Workflow aplica gates |
| Metric | Knowledge | N:1 | Métricas informan aprendizaje |

---

## Relaciones por dominio

### Dominio de Intención

```mermaid
graph LR
    subgraph INTENTION["Dominio de Intención"]
        I[Intent]
        P[Plan]
        W[Workflow]
        T[Task]
    end

    I -->|"1:N genera"| P
    P -->|"1:N instancia"| W
    W -->|"1:N compone"| T
```

### Dominio de Conocimiento

```mermaid
graph TB
    subgraph KNOWLEDGE["Dominio de Conocimiento"]
        E[Execution]
        A[Artifact]
        V[Validation]
        M[Metric]
        K[Knowledge]
        MEM[Memory]
        D[Decision]
    end

    E -->|"compone"| A
    E -->|"compone"| M
    A -->|"asocia"| V
    A -->|"alimenta"| K
    V -->|"informa"| M
    M -->|"asocia"| K
    K -->|"consolida"| MEM
    D -->|"asocia"| K
```

### Dominio de Gobernanza

```mermaid
graph TB
    POL[Policy] -->|"compone"| RUL[Rule]
    RUL -->|"fundamenta"| DEC[Decision]
    POL -->|"deriva"| QG[Quality Gate]
    QG -->|"evalúa"| VAL[Validation]
    PRJ[Project] -->|"aplica"| POL
    PRJ -->|"requiere"| QG
```

---

## Matriz de relaciones críticas

| Relación | Tipo | Regla NADF |
|----------|------|------------|
| Intent → Plan | Dependencia | Un Plan siempre referencia su Intent origen |
| Plan → Workflow | Dependencia | Workflow requiere Plan con status `approved` |
| Workflow → Task | Composición | Orden de fases inmutable (ADR-0003) |
| Task → Agent | Dependencia | Agent debe estar en `agents_enabled` del proyecto |
| Agent → Tool | Dependencia | Solo tools declaradas en skill registry |
| Execution → Artifact | Composición | Todo Execution produce ≥1 Artifact |
| Validation → Quality Gate | Dependencia | Validation siempre referencia un gate |
| Policy → Rule | Composición | Toda Rule pertenece a una Policy |
| Environment → Deployment | Composición | Deployment siempre en un Environment |
| MCP Server → Provider | Dependencia | MCP abstrae un Provider concreto |

---

## Restricciones de integridad

1. **No comunicación directa Agent ↔ Agent** — Solo via Orquestador (Mediator) y Blackboard (Artifact/Knowledge).
2. **Plan antes de Execution** — No existe relación Task(Execution) → Plan(approved) invertida.
3. **Backend Impact antes de Plan Review** — Task(backend-impact) precede Task(architect) en composición de Workflow.
4. **ADR inmutable** — Decision(Accepted) no se modifica; se supersede con nuevo ADR.
5. **Deployment con aprobación** — Relación Deployment → approved_by es obligatoria.
6. **MCP first** — Relación Agent → Tool externa debe pasar por MCP Server cuando aplique.

---

## Referencias

- [entity-model.md](entity-model.md)
- [intent-model.md](intent-model.md)
- [event-model.md](event-model.md)
- [ADR-0003](../../.nadf/global/decision-history/adr/ADR-0003-lovable-to-web-canonicalization.md)
