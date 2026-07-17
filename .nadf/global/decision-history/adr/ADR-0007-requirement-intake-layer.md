<!-- NADF-GUIDE
Propósito: Documenta ADR-0007 — Requirement Intake Layer and Multi-Source Requirement Connectors.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# ADR-0007 — Requirement Intake Layer and Multi-Source Requirement Connectors

**Estado:** Accepted  
**Fecha:** 2026-07-14  
**Decisores:** Framework Architect Agent  
**Meta Model afectado:** v1.0.0 → v1.1.0 (Minor)  
**Supersede:** Ninguno  
**Relacionado:** ADR-0001, ADR-0002, ADR-0004, ADR-0005

---

## Contexto

NADF opera bajo el principio *Everything starts with Intent* y el flujo semántico `Context → Intent → Plan → Workflow → Task → Execution → Artifact → Validation → Knowledge`. En la práctica empresarial, los requerimientos llegan desde Jira, Slack, Teams, GitHub/GitLab/Bitbucket, correo, webhooks, APIs, formularios, ServiceNow, bases de datos y eventos programados.

Hoy el Meta Model reconoce fuentes de contexto (Lovable, Jira, GitHub, conversación) y eventos externos, pero **no define un contrato normativo común** para:

- validar y asegurar entradas externas,
- normalizar payloads heterogéneos,
- deduplicar e idempotenciar,
- exigir aprobación humana antes de crear Intent,
- trazar el origen hasta Deployment.

Sin esa capa, existe riesgo de tratar un mensaje de Slack o un webhook como orden de ejecución.

---

## Problema

1. No hay entidad `Requirement` separada de `Intent`.
2. No hay abstracción `RequirementSourceConnector` provider-independent.
3. Credenciales no tienen modelo de referencia.
4. No hay política uniforme de aprobación, sanitización y quarantine.
5. Añadir cada fuente como agente propio escalaría mal.

---

## Alternativas consideradas

| Alternativa | Evaluación |
|-------------|------------|
| A. Extender Intent con campos de proveedor | Rechazada — acopla Intent a proveedor y diluye semántica |
| B. Un agente por fuente (Jira Agent, Slack Agent…) | Rechazada — explosión de agentes; viola MCP First genérico |
| C. Requirement Intake Layer + conectores declarativos | **Elegida** — opt-in, extensible, trazable |
| D. Hacer Requirement obligatorio en el flujo v1.0 | Rechazada — sería MAJOR y rompería proyectos existentes |

---

## Decisión

Se adopta la **Requirement Intake Layer** como extensión **MINOR** del Meta Model (v1.1.0):

```text
External Requirement Source
  → Source Connector
  → RawRequirementEvent
  → Validation & Security
  → Normalization
  → Deduplication
  → Classification
  → Human Approval / Clarification
  → Requirement
  → Context Assembly
  → Intent
  → Existing NADF Workflow
```

### Reglas de decisión

1. Ninguna fuente crea Plan, Mission, código ni Deployment directamente.
2. Toda fuente produce primero `RawRequirementEvent` y después `Requirement`.
3. Solo un `Requirement` en estado `APPROVED` puede convertirse en `Intent`.
4. Credenciales: solo `CredentialReference` (secret manager path); nunca valor.
5. Preferir MCP; permitir adapter HTTP/event broker con el mismo contrato.
6. Activación **opt-in** vía `.nadf/projects/<project>/requirement-sources/`.
7. Siete agentes funcionales (no uno por proveedor).
8. Workflow `requirement-intake` respeta las **9 fases** NADF.

---

## Meta model changes

### Entidades nuevas

- RequirementSourceDefinition  
- RequirementSourceInstance  
- CredentialReference  
- RawRequirementEvent  
- Requirement  
- RequirementAttachment  
- RequirementMapping  
- RequirementPolicy  
- TraceabilityLink  

### Extensiones

- `Intent.requirement_id` (opcional)
- Context source type `requirement`
- Catálogo de eventos de intake
- Artefactos Blackboard de intake

Detalle: [docs/meta-model/requirement-model.md](../../../docs/meta-model/requirement-model.md)

---

## Security model

- Validación de firma webhook cuando el proveedor lo permita
- Replay protection + idempotency key
- Rate limiting, allowlists, sanitización HTML/Markdown
- Attachment quarantine (tipo/tamaño/seguridad)
- Secret references; redacción PII en logs
- Tenant/project isolation; least privilege
- Dead-letter / QUARANTINED
- Aprobación humana obligatoria para cambios de código, infra y producción (salvo política explícita documentada)

Reglas: `.nadf/global/rules/requirement-intake-security.md`  
Doc: [docs/requirement-security.md](../../../docs/requirement-security.md)

---

## Connector abstraction

Contrato `RequirementSourceConnector` (normativo YAML + interfaz conceptual):

- `validateConfiguration`, `testConnection`, `receiveEvent`
- Opcionales: `poll`, `fetchDetails`, `fetchAttachments`, `acknowledge`, `updateExternalStatus`, `addExternalComment`

Modos: WEBHOOK, POLLING, MANUAL, SCHEDULED, API_PUSH, DATABASE_CDC, FILE_UPLOAD, EMAIL_INBOUND.

Catálogo inicial: 15 definiciones en `.nadf/global/requirement-sources/definitions/`.

---

## Event model

Nuevos eventos tipados: `RequirementSourceConfigured`, `RawRequirementReceived`, `RequirementNormalized`, `RequirementDuplicateDetected`, `RequirementClassified`, `RequirementNeedsClarification`, `RequirementAwaitingApproval`, `RequirementApproved`, `RequirementRejected`, `RequirementConvertedToIntent`, `RequirementProcessingFailed`, `RequirementQuarantined`, etc.

Ver [docs/meta-model/event-model.md](../../../docs/meta-model/event-model.md).

---

## Compatibility

- Sin cambios destructivos a agentes, workflows, artefactos o ADRs previos.
- Proyectos sin `requirement-sources/` funcionan igual que v1.0.
- Compatibility analysis: `artifacts/compatibility-analysis.md`.

---

## Consecuencias

### Positivas

- Ingesta uniforme multi-fuente
- Trazabilidad Requirement → Intent → Plan → Execution → Artifact → Validation → Deployment
- Escalabilidad por definición declarativa
- Seguridad y gobernanza explícitas

### Negativas / costos

- Más agentes y documentación
- Complejidad operativa de políticas por proyecto
- Dependencia de MCP/adapters aún no implementados en runtime

---

## Migration path

1. Publicar Meta Model v1.1 + ADR-0007.
2. Desplegar workflow y agentes (documentales/contractuales).
3. Proyectos opt-in crean `requirement-sources/`.
4. Configuran CredentialReference en secret manager.
5. Prueban conexión (`source-connection-test.json`).
6. Habilitan fuentes y triggers.

No hay migración de datos históricos obligatoria.

---

## Rejected alternatives

- Agente por proveedor  
- Requirement = Intent  
- Ejecución directa desde mensaje externo  
- Requirement obligatorio en flujos Lovable existentes  
- Secretos embebidos en YAML de fuente  

---

## Referencias

- [requirement-intake-architecture.md](../../../docs/requirement-intake-architecture.md)
- [requirement-source-connectors.md](../../../docs/requirement-source-connectors.md)
- [ADR-0004](ADR-0004-nadf-meta-model.md)
- [ADR-0001](ADR-0001-nadf-foundation.md)
