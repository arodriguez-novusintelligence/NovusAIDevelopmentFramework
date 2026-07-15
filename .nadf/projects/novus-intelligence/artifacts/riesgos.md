# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `749430f` (delta desde `e3a9819`)  
**Fecha:** 2026-07-15  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers críticos — repositorio accesible y delta analizado

---

## Resumen de riesgos (delta)

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-001 | Modo demo en formulario de contacto | **Alta** | Alta | Sin cambio; persistir mitigación del snapshot previo |
| R-002 | Copia directa de código Lovable | **Alta** | Media | Quality gate no_lovable_code_copy; NovusDevFrameworkDemo ~467 LOC |
| R-011 | Inline oklch en Testimonials viola tokens.yml | **Media** | Alta | Traducir a tokens del design system WEB; no copiar style={{}} |
| R-012 | Variante light contact-light no portada | **Media** | Media | Definir scope light en design system productivo antes de implementar |
| R-013 | Dos simulaciones interactivas (Hero + ai-agents) | **Media** | Alta | Planificar componentes separados; shared hooks opcionales |
| R-014 | Secret NADF_DISPATCH_TOKEN no configurado | **Media** | Media | DevOps valida secret en novus-nexus antes de depender del trigger |
| R-015 | Paridad visual light vs dark en misma página | **Media** | Media | Incluir landing y contact en visual-parity-agent |
| R-016 | Logos clientes — derechos/formato | **Baja** | Baja | Confirmar licencia de uso; optimizar formatos para WEB |

---

## Riesgos heredados del snapshot previo (siguen vigentes)

| ID | Riesgo | Estado |
|----|--------|--------|
| R-003 | Routing TanStack → React Router | Vigente |
| R-004 | Complejidad MultiAgentDemo | Vigente |
| R-005 | Design tokens oklch | Vigente — agravado por R-011 |
| R-006 | Contenido vs brand-context | Vigente |
| R-007 | Logo JPEG vs SVG | Vigente |
| R-008 | Sin captcha en contacto | Vigente |
| R-009 | Datos contacto públicos | Vigente — sin cambio |

---

## R-011: Inline oklch en Testimonials

**Descripción:** El rediseño de `Testimonials.tsx` usa `style={{ color: "oklch(...)" }}` y gradientes inline en lugar de utilities del design system. Esto contradice `reglasDiseno/tokens.yml` (prohibido tokens locales fuera de `styles.css`).

**Impacto:** Inconsistencia visual al traducir; dificultad de mantenimiento; posible fallo de paridad exacta.

**Mitigación:**
- Extraer valores oklch como referencia semántica en plan de implementación.
- Implementar en WEB con tokens nombrados del design system.
- visual-parity-agent compara sección Testimonials específicamente.

**Responsable downstream:** planner-agent, frontend-integration-agent

---

## R-012: Variante light contact-light

**Descripción:** Nueva utility `contact-light` sobreescribe 15+ variables CSS semánticas solo dentro de la sección contacto. NovusIntelligenceWEB debe replicar el contraste claro sin copiar el bloque CSS.

**Impacto:** Formulario ilegible si tokens light no se aplican correctamente; inputs/select con fondo incorrecto.

**Mitigación:**
- Documentar tokens light en plan (ver `frontend-impact.md`).
- Probar contraste de labels, inputs, select dropdown y estados focus.
- Validar en 3 viewports del gate de paridad.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

## R-013: Dos simulaciones interactivas

**Descripción:** El sitio Lovable ahora tiene `NovusDevFrameworkDemo` (Hero, 9 pasos, Dialog) y `MultiAgentDemo` (`/solutions/ai-agents`, 8 pasos, SVG). Ambos son componentes complejos con animaciones y controles similares.

**Impacto:** Duplicación de esfuerzo; inconsistencia UX entre simulaciones; riesgo de copiar código entre traducciones.

**Mitigación:**
- planner-agent define si ambos son obligatorios en MVP o se prioriza uno.
- Considerar abstracción de "SimulationPlayer" en WEB (intención, no copia).
- `prefers-reduced-motion` obligatorio en ambos.

**Responsable downstream:** planner-agent, architect-agent

---

## R-014: Workflow notify-nadf y secret

**Descripción:** `notify-nadf.yml` requiere `NADF_DISPATCH_TOKEN` en secrets de novus-nexus. Sin el secret, el push no dispara el workflow NADF automáticamente.

**Impacto:** Sincronización manual necesaria; evento `lovable.commit` no se propaga.

**Mitigación:**
- Verificar secret en configuración GitHub del repo novus-nexus.
- Documentar en runbook si el trigger falla (fallback: invocación manual Cloud Agent).

**Responsable downstream:** devops-agent, workflow-agent

---

## R-015: Paridad visual light/dark mixta

**Descripción:** Landing ahora mezcla secciones dark (Hero, grids) con secciones light (Testimonials). Contacto es dark hero + light body. Esto aumenta superficie de paridad visual.

**Impacto:** Gate `visual_exact_parity` puede fallar en bordes entre secciones o colores de transición.

**Mitigación:**
- Ampliar rutas/viewports en visual-parity-agent.
- Capturas de sección completa, no solo above-the-fold.

**Responsable downstream:** visual-parity-agent

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` está accesible, el diff `e3a9819..749430f` fue analizado y los cambios están documentados.

---

## Checklist pre-planificación

- [x] Repositorio Lovable accesible
- [x] Delta clasificado (visual | functional | content | structural)
- [x] Impacto frontend documentado
- [x] Impacto backend evaluado (sin nuevos endpoints)
- [x] Riesgos de severidad alta documentados (R-001, R-002 heredados)
- [x] Sin copia de código Lovable en artefactos
- [x] Sin secrets en artefactos

---

## Referencias

- Cambios: `artifacts/cambios-lovable.json`
- Impacto frontend: `artifacts/frontend-impact.md`
- Impacto backend: `artifacts/backend-impact.md`
- Política no-mock: `.nadf/global/rules/no-mock-policy.md`
- Tokens Lovable: `novus-nexus/reglasDiseno/tokens.yml`
