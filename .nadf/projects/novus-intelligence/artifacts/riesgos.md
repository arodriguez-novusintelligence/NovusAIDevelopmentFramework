# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `719ea6b` (delta: `e3a9819..719ea6b`)  
**Fecha:** 2026-07-15  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers críticos — repositorio accesible y delta analizado

---

## Resumen de riesgos

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-001 | Modo demo en formulario de contacto | **Alta** | Alta | No replicar fallback demo en producción |
| R-002 | Copia directa de código Lovable | **Alta** | Media | Quality gate no_lovable_code_copy |
| R-011 | Dual theme dark/light inconsistente | **Media** | Alta | Unificar tokens de variante clara en design system WEB |
| R-012 | Complejidad NovusDevFrameworkDemo | **Media** | Media | Componente aislado; lazy-load; prefers-reduced-motion |
| R-013 | Contenido ficticio del demo como producto real | **Media** | Baja | Documentar como narrativa educativa; no fixtures prod |
| R-014 | Logos CDN Lovable en producción | **Media** | Alta | Self-host assets reales de clientes |
| R-015 | CustomEvent cross-component frágil | **Baja** | Media | Preferir React context o state lift en WEB |
| R-004 | Complejidad MultiAgentDemo (previo) | **Media** | Media | Sin cambios en delta; mantener mitigación previa |
| R-008 | Sin captcha en contacto | **Media** | Alta | hCaptcha/Turnstile pre-prod |

---

## R-011: Dual theme dark/light inconsistente

**Descripción:** Lovable introduce secciones claras (`contact-light`, Testimonials) con tokens oklch inline mientras el resto del sitio es dark-first. Riesgo de inconsistencia al traducir parcialmente solo contacto sin Testimonials o viceversa.

**Impacto:** Paridad visual fallida en gate `visual_exact_parity` para `/` y `/contact`.

**Mitigación:**
- Definir en planner un **patrón de sección clara** reutilizable (tokens compartidos).
- Implementar contacto y Testimonials en la misma iteración visual.
- visual-parity-agent valida ambas rutas/secciones.

**Responsable:** planner-agent, frontend-integration-agent, visual-parity-agent

---

## R-012: Complejidad NovusDevFrameworkDemo

**Descripción:** Nuevo componente ~467 líneas con Dialog, SVG animateMotion, 9 pasos, 4 columnas y estado de simulación. Similar en complejidad a MultiAgentDemo.

**Impacto:** Alto esfuerzo de traducción; posible degradación en mobile; animaciones continuas sin accesibilidad.

**Mitigación:**
- Lazy-load del modal (solo cargar al abrir).
- `prefers-reduced-motion`: desactivar animateMotion y auto-advance.
- Simplificar SVG preservando intención educativa del flujo NADF.
- QA en viewports sm/md/lg.

**Responsable:** frontend-integration-agent, qa-agent

---

## R-013: Contenido ficticio del demo

**Descripción:** La simulación muestra "Lead Manager B2B — MVP funcional", URL `leadmgr.novus.dev`, stack TanStack+Postgres como si fuera producto entregado.

**Impacto:** Confusión de stakeholders; riesgo de implementar scope no solicitado.

**Mitigación:**
- Tratar como **contenido de marketing/educación** del framework NADF.
- No crear backend ni rutas productivas para Lead Manager.
- Copy puede adaptarse a "Novus Intelligence Solutions" como caso ilustrativo genérico.

**Responsable:** planner-agent, frontend-integration-agent

---

## R-014: Logos CDN Lovable

**Descripción:** Testimonials referencia logos vía `.asset.json` con URLs del CDN Lovable (`banco-santa-cruz.png`, `doevents.jpg`).

**Impacto:** Dependencia externa; URLs pueden expirar o cambiar; violación de independencia de proveedor.

**Mitigación:**
- Copiar assets reales al repo NovusIntelligenceWEB (`public/assets/clients/` o similar).
- No usar URLs CDN Lovable en producción.

**Responsable:** frontend-integration-agent

---

## R-015: CustomEvent novus:open-dev-framework

**Descripción:** Header y Hero se comunican vía `window.dispatchEvent` / `addEventListener`, patrón global frágil.

**Impacto:** Dificultad de testing; posibles memory leaks; no idiomático en React productivo.

**Mitigación:**
- En WEB: React Context, Zustand ligero o state lift desde layout.
- Evitar replicar CustomEvent en producción.

**Responsable:** frontend-integration-agent, architect-agent

---

## Riesgos heredados (vigentes)

### R-001: Modo demo contacto

Sin cambios en delta. `submitContact()` mantiene fallback demo en Lovable. **No replicar en producción.**

### R-002: Copia código Lovable

Incrementada por volumen de NovusDevFrameworkDemo (+467 LOC). Reforzar revisión en PR.

### R-008: Sin captcha

Sin cambios. Pendiente pre-prod.

---

## Blockers

**Ninguno.** Repositorio `novus-nexus` accesible en `/agent/repos/novus-nexus`, branch `main`, commit `719ea6b`. Delta analizado: 12 archivos, +797/-152 líneas.

---

## Checklist pre-planificación

- [x] Repositorio Lovable accesible
- [x] Delta `e3a9819..719ea6b` clasificado
- [x] Tema claro contacto documentado (CHG-014)
- [x] Testimonials + logos documentados (CHG-015)
- [x] NovusDevFrameworkDemo analizado (CHG-016)
- [x] Sin nuevos requisitos backend en delta
- [x] Riesgos de variante clara y demo ficticio documentados

---

## Próximo agente

**planner-agent** debe incorporar mitigaciones R-011, R-012 y R-014 como tareas explícitas; confirmar que R-013 excluye scope Lead Manager del MVP web.
