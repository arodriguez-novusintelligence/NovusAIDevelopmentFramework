<!-- NADF-GUIDE
Propósito: Documenta Riesgos — Análisis Lovable (paso-01).
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `974dc61` (delta último commit)  
**Fecha:** 2026-07-17  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers críticos — repositorio accesible, delta analizado

---

## Resumen de riesgos (delta 974dc61)

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-011 | CI fuerza `mode=visual-fast` sin analizar tipo de cambio | **Alta** | Alta | Usar routing dinámico post-analyzer; este artifact marca `route: full` |
| R-012 | Delta CI-only sin cambios UI dispara pipeline completo | **Media** | Media | Planner debe evaluar si hay trabajo real; evitar deploy vacío |
| R-013 | Desalineación commit padre vs modo visual-fast | **Alta** | Alta | `e2aa094` incluye Supabase/auth — requiere workflow `full` si se sincroniza |
| R-014 | Secret `NADF_DISPATCH_TOKEN` en workflow | **Media** | Baja | Mantener en GitHub Secrets; nunca versionar en artefactos |
| R-015 | Ref hardcodeada `feature/novus-intelligence` | **Media** | Media | Parametrizar branch destino según entorno |

---

## R-011: CI fuerza visual-fast

**Descripción:** El commit `974dc61` configura el workflow `notify-nadf.yml` para invocar siempre `mode=visual-fast`, independientemente del contenido del push.

**Impacto:** Cambios funcionales o estructurales en commits anteriores o futuros podrían saltarse backend-impact, database-agent y security review si el router confía ciegamente en el parámetro CI.

**Mitigación:**
- El analyzer establece `summary.route: full` porque el delta incluye cambio `structural`.
- El script `route-lovable-change.ts` debe priorizar `latestDelta.changeTypes` del artifact sobre el parámetro CI.
- DevOps: considerar pasar `mode` desde el analyzer, no hardcodearlo en novus-nexus.

**Responsable downstream:** workflow-agent, devops-agent

---

## R-012: Pipeline sin trabajo frontend

**Descripción:** El último commit no modifica UI. Ejecutar frontend-integration + deploy dev consumiría recursos sin delta visual que traducir.

**Impacto:** PRs vacíos, ruido en métricas, falsa sensación de sincronización completada.

**Mitigación:**
- Planner-agent verifica `summary.latestDelta.changeTypes` antes de generar tareas.
- Si solo hay cambios CI, cerrar workflow con status informativo o skip execution.

**Responsable downstream:** planner-agent, workflow-agent

---

## R-013: Commit padre con backend pendiente

**Descripción:** El padre inmediato `e2aa094` ("Añadió registro empresas") agrega autenticación Supabase, rutas `/auth` y `/register-company`, tabla `companies` y migración SQL. Requiere backend y base de datos.

**Impacto:** Si el equipo asume que visual-fast cubre el estado actual de Lovable, se omitiría auth empresarial y persistencia.

**Mitigación:**
- Tratar `e2aa094` como backlog separado con `route: full` cuando se decida sincronizar.
- No copiar integración Supabase literal; evaluar stack AWS serverless + ADR.
- Documentar en plan-implementacion.md como scope explícito, no implícito.

**Responsable downstream:** planner-agent, backend-impact-agent, architect-agent

---

## R-014: Gestión de secretos CI

**Descripción:** El workflow usa `${{ secrets.NADF_DISPATCH_TOKEN }}` para invocar GitHub API.

**Impacto:** Exposición accidental del PAT en logs o artefactos.

**Mitigación:**
- Secret solo en configuración GitHub del repo novus-nexus.
- Prohibido incluir tokens en artifacts NADF (constraint NO_SECRETS_IN_REPO).

**Responsable downstream:** devops-agent, security-agent

---

## R-015: Branch destino fija

**Descripción:** El workflow referencia `--ref feature/novus-intelligence` de forma estática.

**Impacto:** Despliegues a branch incorrecta si el framework migra a `main` u otra rama canónica.

**Mitigación:** Externalizar ref a variable de entorno o secret; alinear con `project-context.yml`.

**Responsable downstream:** devops-agent

---

## Riesgos históricos (snapshot previo — no reclasificados)

Los riesgos R-001 a R-010 del análisis @ `e3a9819` siguen vigentes para el sitio corporativo base (contacto demo, MultiAgentDemo, routing TanStack, etc.) pero **no son introducidos por el delta `974dc61`**. Consultar análisis anterior si el planner retoma sincronización del snapshot completo.

---

## Blockers

**Ninguno.** Repositorio `novus-nexus` accesible; diff del último commit disponible y clasificado.

---

## Decisión de routing

| Campo | Valor |
|-------|-------|
| summary.route | `full` |
| Motivo | Delta contiene cambio `structural` (CI); no cumple criterio visual-fast |
| latestDelta.backendRequired | false |
| latestDelta.changeTypes | `["structural"]` |
