# Decision Log — Novus Intelligence Solutions

Registro cronológico de decisiones del proyecto.

---

## 2026-07-04 — Incorporación del proyecto a NADF

**Contexto:** Novus Intelligence Solutions es el primer proyecto bajo el NovusAIDevelopmentFramework.

**Decisión:** Configurar el proyecto con flujo Lovable → Web, quality gates estándar y separación estricta entre diseño e implementación.

**Rationale:** Establecer un modelo repetible para futuros proyectos, empezando por el sitio corporativo.

**ADR:** ADR-0001-nadf-foundation

---

## 2026-07-04 — Stack tecnológico confirmado

**Contexto:** Definición del stack para frontend y backend productivos.

**Decisión:**
- Frontend: React + TypeScript + Tailwind + Vite + React Router
- Backend: Serverless Framework + Node.js 20 + TypeScript + AWS
- Diseño: Lovable (novus-nexus) como intención only

**Rationale:** Stack moderno, ampliamente soportado, alineado con capacidades del equipo y proveedor cloud inicial (AWS).

---

## 2026-07-04 — Alcance inicial del sitio

**Contexto:** Definición de funcionalidades para la primera iteración.

**Decisión:** Landing page, perfil de empresa, sección de servicios, formulario de contacto, CTAs y diseño responsive.

**Rationale:** Cubrir presencia digital corporativa mínima viable con path claro a funcionalidades futuras (blog, CMS).

---

## 2026-07-04 — Endpoint de contacto planificado

**Contexto:** El formulario de contacto requiere backend para envío de emails.

**Decisión:** Planificar `POST /contact` con AWS SES. No implementar en Fase 1 del framework — solo especificar.

**Rationale:** El framework Fase 1 se enfoca en estructura y frontend. Backend se implementará en fase posterior con aprobación.

---

## 2026-07-04 — Reconciliación workflow lovable-to-web

**Contexto:** La revisión arquitectónica detectó divergencia crítica entre el workflow global (18 pasos) y el de proyecto (15 pasos): orden invertido de backend-impact vs frontend, ausencia de workflow-agent y reviewer-agent.

**Decisión:** Alinear el workflow de proyecto al canónico global con 18 pasos. Backend Impact en Planning (paso 5) antes de Plan Review (paso 6) y antes de Execution. Incluir workflow-agent en Event Trigger y reviewer-agent en Validation.

**Rationale:** Eliminar riesgo de implementación frontend sin evaluación backend previa y garantizar Plan Review con alcance completo.

**ADR:** ADR-0003-lovable-to-web-canonicalization

---

## 2026-07-04 — Adopción oficial del NADF Meta Model v1.0

**Contexto:** El framework contaba con documentación del meta model en `docs/meta-model/` sin estatus normativo formal. Se requería unificar el lenguaje conceptual de agentes, workflows y artefactos bajo una especificación central adoptada.

**Decisión:** Adoptar oficialmente el NADF Meta Model v1.0 como especificación central del framework. Establecer documentos normativos (specification, governance, versioning, architecture-principles) y reglas obligatorias de lectura previa en CLAUDE.md y los 19 agentes.

**Rationale:** Eliminar fragmentación semántica, formalizar el flujo Intent → Knowledge y preparar la base conceptual para M1 (Contract & Schema Layer).

**ADR:** ADR-0004-nadf-meta-model

---

## 2026-07-14 — Agent Runtime Bridge (M6) con Cursor Cloud Agent

**Contexto:** El equipo dispone de cuenta Cursor Cloud Agent y necesita un puente formal entre roles NADF y el motor de ejecución cloud, sin reinventar los 19 agentes en la UI.

**Decisión:** Adoptar contrato `AgentRuntime` (ADR-0005), adaptar primero Cursor Cloud vía `@cursor/sdk`, y entregar prototipo del paso 1 (`lovable-analyzer-agent`) en `prototypes/m6-cloud-agent/`. Documentar la operación en `docs/cloud-agent-integration.md`.

**Rationale:** Separar definición de agente (NADF) de motor (Cloud Agent); habilitar automatización incremental hacia M5 sin acoplar el Meta Model a un proveedor.

**ADR:** ADR-0005-agent-runtime-bridge

---

## 2026-07-14 — Primera corrida workflow Lovable → Web (M6)

**Contexto:** Ejecución piloto del workflow `novus-intelligence-lovable-to-web` sobre baseline Lovable `novus-nexus@e3a9819` (13 cambios, `backendRequired: true`). Runtime Cursor Cloud Agent (M6), target DEV AWS `sa-east-1`.

**Decisión:** Documentar la corrida como **parcialmente completada con bloqueos de validación**. No proceder a merge de ramas productivas ni despliegue DEV hasta resolver hallazgos bloqueantes.

**Resultados clave (iteración inicial):**

- Plan `PLAN-NOVUS-LOVABLE-2026-07-14` aprobado por architect-agent.
- Frontend implementado en rama feature; backend con API contacto.
- Infra propuesta en `propuesta-infra.md`; región DEV reconciliada a `sa-east-1`.
- QA FAIL: 4 errores ESLint en componentes UI WEB (`qualityScore: 0`).
- Security FAIL: IAM SES wildcard + rate limit por IP ausente (`securityScore: 72`).
- 8 PRs en Framework (#1–#8); `NO_DEPLOY` respetado.

**Rationale:** La documentación consolida evidencia auditable para corrección dirigida según workflow canónico NADF.

**Artefacto:** `artifacts/resumen-ejecucion.md`

---

## 2026-07-14 — Re-consolidación corrida Lovable → Web (post-remediación)

**Contexto:** Tras iteraciones de remediación, los repos productivos **NovusIntelligenceWEB** y **NovusIntelligenceBack** tienen implementación mergeada en `main`. Se re-ejecutaron validaciones QA, seguridad y paridad visual.

**Decisión:** Actualizar `resumen-ejecucion.md` y este log con el estado **bloqueado por validación**, distinguiendo mejoras logradas de bloqueos activos.

**Resultados clave (re-validación):**

- **QA PASS** (`qualityScore: 100`) — build y lint exitosos en WEB y Back en `main`.
- **Security FAIL** (`securityScore: 84`) — SEC-002 (rate limit) resuelto; SEC-001 (IAM) mitigado a `identity/*`; bloqueante actual: SEC-CORS-001 (wildcard en fallback CORS).
- **Paridad visual FAIL** — gate `visual_exact_parity`: 0/12 capturas PASS; `maxDiffRatio: 23,45%` vs umbral 0,2%.
- **Reviewer-agent** no ejecutado — pendiente hasta `security_pass` y remediación VP-P0.
- Métricas, reflexión, KB y ADR completados en iteraciones previas; sin ADR nuevo requerido.
- `NO_DEPLOY` y `NO_SECRETS_IN_REPO` respetados en toda la corrida.

**Rationale:** La re-consolidación refleja el progreso real (código en `main`, QA PASS) sin ocultar bloqueos que impiden deploy DEV y revisión de coherencia.

**Artefacto:** `artifacts/resumen-ejecucion.md`

**Próximos agentes:** backend-agent (CORS) → security-agent → frontend-integration-agent (paridad) → visual-parity-agent → reviewer-agent.

---

## Template para nuevas entradas

```
## YYYY-MM-DD — Título de la decisión

**Contexto:** [Por qué se necesitaba decidir]

**Decisión:** [Qué se decidió]

**Rationale:** [Por qué esta opción]

**ADR:** [Referencia si aplica]
```
