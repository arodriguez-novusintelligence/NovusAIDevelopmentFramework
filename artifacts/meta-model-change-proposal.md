# Meta Model Change Proposal — v1.0.0 → v1.1.0

**Tipo:** MINOR (extensión compatible)  
**Autoridad:** ADR-0007 + governance.md  
**Fecha:** 2026-07-14

---

## Motivación

Unificar la ingesta de requerimientos multi-fuente sin romper el flujo canónico `Context → Intent → Plan → Workflow → Task → Execution → Artifact → Validation → Knowledge`.

---

## Flujo semántico propuesto (opt-in)

```text
External Source
  → RawRequirementEvent
  → Requirement (normalizado, clasificado, aprobado)
  → Context Assembly (+ requirement source)
  → Intent
  → (flujo NADF existente)
```

El tramo `Requirement → Intent` es **opcional**. Proyectos sin Requirement Intake siguen usando `Event + Context → Intent` como en v1.0.

---

## Entidades nuevas

| Entidad | Dominio | Notas |
|---------|---------|-------|
| RequirementSourceDefinition | Intake | Tipo reutilizable de fuente |
| RequirementSourceInstance | Intake | Conexión por proyecto |
| CredentialReference | Seguridad | Solo referencia; nunca secreto |
| RawRequirementEvent | Intake / Event | Evento crudo pre-normalización |
| Requirement | Intake | Requerimiento normalizado |
| RequirementAttachment | Intake | Adjunto validado |
| RequirementMapping | Intake | Mapeo payload → Requirement |
| RequirementPolicy | Gobernanza | Especialización de Policy |
| TraceabilityLink | Relación | Cadena Requirement→…→Deployment |

## Extensiones a entidades existentes

| Entidad | Cambio |
|---------|--------|
| Intent | `requirement_id` opcional |
| Context | Fuente tipada `requirement` |
| Event | Catálogo de eventos de intake |
| Artifact | Contratos Blackboard de intake |
| Policy | Relación con RequirementPolicy |
| MCP Server | Servidores previstos Slack/Teams/GitLab/… |

---

## Estados

### RawRequirementEvent

`RECEIVED → AUTHENTICATING → VALIDATING → REJECTED | NORMALIZING → DUPLICATE | ACCEPTED | FAILED | QUARANTINED`

### Requirement

`RECEIVED → CLASSIFYING → NEEDS_CLARIFICATION | AWAITING_APPROVAL → APPROVED | REJECTED → CONVERTED_TO_INTENT → IN_EXECUTION → VALIDATING → COMPLETED | BLOCKED | CANCELLED`

---

## Compatibilidad

- Cardinalidades v1.0 **no** se hacen obligatorias hacia Requirement.
- Introducir Requirement como **intermedio obligatorio** sería MAJOR — **rechazado**.
- Versionado: SemVer MINOR `1.1.0`.

---

## Rechazado

1. Un agente distinto por proveedor.
2. Fusionar Requirement con Intent.
3. Ejecutar workflows de código desde RawRequirementEvent.
4. Almacenar secretos en CredentialReference.
