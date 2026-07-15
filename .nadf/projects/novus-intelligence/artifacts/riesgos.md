# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `61bb6d8`  
**Baseline anterior:** `e3a9819`  
**Fecha:** 2026-07-15  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers críticos — repositorio accesible y delta analizado

---

## Resumen de riesgos (delta + persistentes)

| ID | Riesgo | Severidad | Prob. | Estado | Mitigación |
|----|--------|-----------|-------|--------|------------|
| R-001 | Modo demo en formulario contacto | Alta | Alta | Persistente | No replicar fallback demo en producción |
| R-002 | Copia directa código Lovable | Alta | Media | Persistente | Quality gate no_lovable_code_copy |
| R-011 | Complejidad NovusDevFrameworkDemo | **Alta** | Media | **Nuevo** | Lazy-load, prefers-reduced-motion, componente aislado |
| R-012 | Oscilación diseño contacto (light→dark) | Media | Media | **Nuevo** | Implementar versión final dark (61bb6d8), no intermedia |
| R-013 | Inline oklch en Testimonials | Media | Alta | **Nuevo** | Traducir a tokens del design system WEB |
| R-014 | Dos demos interactivos similares | Media | Media | **Nuevo** | Diferenciar MultiAgentDemo vs NovusDevFrameworkDemo en plan |
| R-004 | Complejidad MultiAgentDemo | Media | Media | Persistente | Sin cambios en este delta |
| R-008 | Sin captcha contacto | Media | Alta | Persistente | hCaptcha/Turnstile pre-prod |

---

## R-011: Complejidad NovusDevFrameworkDemo (NUEVO)

**Descripción:** Componente nuevo (~467 líneas) en Hero con Dialog modal, 4 columnas responsivas, 9 pasos animados, SVG con `animateMotion`, estado React con intervalos y CustomEvent cross-component.

**Impacto:** Alto esfuerzo de traducción; posible degradación de LCP si se carga eager en landing; riesgo de accesibilidad (focus trap en Dialog, animaciones continuas).

**Mitigación:**
- Lazy-load del Dialog y su contenido.
- Respetar `prefers-reduced-motion: reduce`.
- Probar focus management y cierre con Escape.
- No copiar SVG inline; traducir intención del diagrama.

**Responsable downstream:** frontend-integration-agent, qa-agent, visual-parity-agent

---

## R-012: Oscilación diseño contacto (NUEVO)

**Descripción:** Entre `e3a9819` y `61bb6d8`, la sección de contacto pasó por variante clara (`contact-light`, commit intermedio ~749430f) y volvió a dark Navy Neón. Indica iteración activa de diseño en Lovable.

**Impacto:** Implementar versión intermedia obsoleta; paridad visual incorrecta.

**Mitigación:**
- Usar commit `61bb6d8` como referencia definitiva para `/contact`.
- visual-parity-agent debe capturar estado dark final.
- Planner debe documentar que la variante light de contacto **no** es objetivo.

**Responsable downstream:** planner-agent, visual-parity-agent

---

## R-013: Inline oklch en Testimonials (NUEVO)

**Descripción:** Testimonials rediseñado usa `style={{ color: "oklch(...)" }}` inline en lugar de tokens semánticos CSS. Patrón difícil de mantener y inconsistente con el resto del design system.

**Impacto:** Traducción literal generaría deuda técnica; paridad visual requiere mapeo cuidadoso de colores.

**Mitigación:**
- Extraer valores oklch como referencia semántica (text-primary-dark, bg-section-light).
- Mapear a variables del design system productivo.
- No copiar bloques `style={{}}` literalmente.

**Responsable downstream:** frontend-integration-agent

---

## R-014: Dos demos interactivos (NUEVO)

**Descripción:** Coexisten `MultiAgentDemo` (/solutions/ai-agents, 8 pasos, SVG arquitectura) y `NovusDevFrameworkDemo` (Hero, 9 pasos, 4 columnas framework). Ambos son simulaciones educativas con animaciones similares.

**Impacto:** Duplicación de esfuerzo si se implementan como componentes independientes sin abstracción; confusión en planificación.

**Mitigación:**
- Planner debe tratarlos como componentes distintos con props/ubicación diferente.
- Evaluar utilidades compartidas (hook de simulación, controles play/pause) sin over-engineering.
- Priorizar NovusDevFrameworkDemo en landing (visible en gate `/`).

**Responsable downstream:** planner-agent, architect-agent

---

## Riesgos persistentes (análisis previo)

### R-001: Modo demo contacto
Sin cambios en `contact.ts`. Sigue activo el fallback demo.

### R-002: Copia código Lovable
Incrementado por volumen de NovusDevFrameworkDemo (+467 LOC) y Testimonials (+160 LOC).

### R-004: MultiAgentDemo
Sin cambios en este delta; sigue en `/solutions/ai-agents`.

### R-008: Sin captcha
Sin cambios; pendiente pre-prod.

---

## R-010: Resuelto

La documentación `docs/cloud-agent-integration.md` ahora existe en el framework (leída en esta ejecución).

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` está accesible en `/agent/repos/novus-nexus`, branch `main`, commit `61bb6d8`. Diff analizado desde baseline `e3a9819` (33 commits, 12 archivos modificados).

---

## Checklist pre-planificación

- [x] Repositorio Lovable accesible
- [x] Delta clasificado (visual, functional, content, structural)
- [x] Modo demo documentado como riesgo persistente (R-001)
- [x] Backend requirement sin cambios (contact API)
- [x] NovusDevFrameworkDemo analizado como delta principal
- [x] Testimonials rediseño y logos documentados
- [x] Oscilación contacto light→dark documentada

---

## Próximo agente

**planner-agent** debe incorporar mitigaciones R-011, R-012 y R-014 como tareas explícitas; mantener R-001 y R-002 del plan previo.
