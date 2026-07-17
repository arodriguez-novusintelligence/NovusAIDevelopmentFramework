<!-- NADF-GUIDE
Propósito: Documenta Riesgos — Análisis Lovable (paso-01).
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `df1b9f9` (delta único)  
**Fecha:** 2026-07-17  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers — repositorio accesible y delta analizado

---

## Resumen de riesgos (delta actual)

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-DELTA-001 | Inconsistencia copy ES/EN en metadatos | **Baja** | Alta | Badge Hero en ES; `site.ts`, OG y `<title>` aún en EN — sincronizar en iteración futura si se desea paridad total |
| R-DELTA-002 | Confusión commit `style` vs tipo `content` | **Baja** | Media | Clasificar por intención semántica (copy), no por prefijo del mensaje de commit |
| R-DELTA-003 | Paridad visual en badge tras cambio de texto | **Baja** | Baja | Verificar longitud del string no rompe layout en mobile; gate `visual_exact_parity` en `/` |

---

## R-DELTA-001: Inconsistencia copy ES/EN

**Descripción:** El commit actualiza solo el badge del Hero a español. Permanecen en inglés:

- `src/content/site.ts` → `taglineEn: "Building Autonomous Intelligence"`
- `src/routes/__root.tsx` → title por defecto con texto EN
- `src/routes/index.tsx` → `og:description` en EN

**Impacto:** Usuario ve badge en español pero pestaña del navegador / preview social puede seguir mostrando inglés.

**Mitigación:**

- Frontend-integration: aplicar **solo** el delta del badge en esta iteración visual-fast.
- Planner (opcional): registrar tarea de alineación i18n/meta en backlog si stakeholder lo requiere.

**Responsable downstream:** frontend-integration-agent, planner-agent

---

## R-DELTA-002: Mensaje de commit vs clasificación

**Descripción:** El commit usa prefijo `style(hero)` pero el cambio es semánticamente **content** (texto), no estilos CSS ni tokens.

**Impacto:** Ninguno operativo si el analyzer clasifica por diff real, no por convención de commits.

**Mitigación:** Mantener clasificación `content` en `cambios-lovable.json`.

---

## R-DELTA-003: Layout del badge con texto más largo

**Descripción:** "Inteligencia Autónoma para Empresas" es más largo que "Building Autonomous Intelligence" (~+6 caracteres visibles en español con acentos).

**Impacto:** Posible wrap o overflow en viewports estrechos si el badge no tiene flex-wrap adecuado.

**Mitigación:**

- QA responsive en 390×844.
- Visual-parity-agent compara screenshot post-implementación.

**Responsable downstream:** frontend-integration-agent, qa-agent, visual-parity-agent

---

## Riesgos históricos (fuera del delta `df1b9f9`)

Los riesgos R-001 a R-010 documentados en análisis previos (modo demo contacto, routing TanStack, MultiAgentDemo, etc.) **permanecen válidos para el alcance completo del sitio**, pero **no son activados ni modificados** por este commit. Consultar artifacts históricos si el workflow escala a perfil `full`.

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` está accesible en `/agent/repos/novus-nexus`, branch `main`, commit `df1b9f9`.

---

## Checklist pre-planificación (delta)

- [x] Repositorio Lovable accesible
- [x] Delta del último commit analizado (1 archivo, 1 línea)
- [x] Cambio clasificado como `content`
- [x] `backendRequired: false` confirmado
- [x] Ruta `visual-fast` justificada
- [x] Inconsistencia ES/EN residual documentada (no bloqueante)

---

## Próximo agente

**planner-agent** (full) o **frontend-integration-agent** (visual-fast) debe aplicar CHG-DELTA-001 en NovusIntelligenceWEB.
