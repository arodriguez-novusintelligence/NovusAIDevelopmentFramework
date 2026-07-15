# Decision Log — Novus Intelligence Solutions

Registro cronológico de decisiones del proyecto.

---

## 2026-07-15 — Primera corrida Lovable→Web — consolidación y bloqueo por paridad visual

**Contexto:** Se completó la primera ejecución end-to-end del workflow `novus-intelligence-lovable-to-web` (plan `PLAN-NOVUS-LOVABLE-2026-07-14`, baseline novus-nexus @ `e3a9819`). La corrida evolucionó en dos ciclos de validación: inicial (2026-07-14) con QA/Security FAIL, y re-validación (2026-07-15) con remediación exitosa.

**Decisión:**
- **Aceptar** implementación frontend y backend en `main` de NovusIntelligenceWEB y NovusIntelligenceBack tras QA PASS (qualityScore 100) y Security PASS (securityScore 88).
- **Bloquear** auto-deploy DEV y reviewer-agent hasta cumplir gate `visual_exact_parity` (umbral ≤ 0,2 %; resultado actual maxDiffRatio 0,486653 en `/contact`).
- **Mantener** `NO_DEPLOY` en ejecuciones de agentes; despliegue DEV solo tras paridad visual + `deploy_human_approval`.
- **Documentar** remediaciones QA-001, SEC-001 y SEC-002 como cerradas; VP-001 a VP-003 como bloqueantes activos.
- **Registrar** 17 de 19 agentes ejecutados; devops-agent (`pipeline-config.md`) y reviewer-agent pendientes.

**Rationale:** Los gates de intención (sin copia Lovable, sin mocks, sin secrets) y calidad de código (build/lint) están cumplidos. La paridad visual exacta (ADR-0006) es prerequisito explícito para auto-merge/auto-deploy DEV. Consolidar estado en `resumen-ejecucion.md` habilita trazabilidad y handoff a `frontend-integration-agent`.

**Artefactos:** `artifacts/resumen-ejecucion.md`, PRs #84–#92 (Framework), `informe-paridad-visual.md`

**ADR:** ADR-0006-visual-parity-and-auto-dev-deploy

---

## 2026-07-14 — MVP automatización + paridad visual exacta

**Contexto:** El sitio DEV no igualaba Lovable y no había trigger automático ante `lovable.commit`.

**Decisión:**
- Añadir `visual-parity-agent` y gate `visual_exact_parity` (diff ≤ 0.2%)
- Activar MVP event-driven: notify novus-nexus → `Lovable sync DEV` → pipeline → merge → deploy **solo DEV**
- Mantener `no_lovable_code_copy`; paridad = resultado visual, no clon de código

**ADR:** ADR-0006-visual-parity-and-auto-dev-deploy

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

## Template para nuevas entradas

```
## YYYY-MM-DD — Título de la decisión

**Contexto:** [Por qué se necesitaba decidir]

**Decisión:** [Qué se decidió]

**Rationale:** [Por qué esta opción]

**ADR:** [Referencia si aplica]
```
