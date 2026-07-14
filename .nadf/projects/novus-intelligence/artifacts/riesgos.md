# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `746c129`  
**Delta desde:** `e3a9819`  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers críticos — repositorio accesible y analizado

---

## Resumen de riesgos

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-001 | Modo demo en formulario de contacto | **Alta** | Alta | No replicar fallback demo en producción |
| R-002 | Copia directa de código Lovable | **Alta** | Media | Quality gate no_lovable_code_copy |
| R-003 | Incompatibilidad routing TanStack → React Router | **Alta** | Alta | Seguir port-map.yml |
| R-004 | Complejidad MultiAgentDemo (SVG + animaciones) | **Media** | Media | Componente aislado; reduced-motion |
| R-005 | Design tokens oklch no portados correctamente | **Media** | Media | Traducir a tokens del design system WEB |
| R-006 | Contenido Lovable vs memoria de marca | **Media** | Baja | Validar con brand-context.md |
| R-007 | Logo JPEG vs SVG vectorial | **Baja** | Alta | Usar asset actual; planificar SVG |
| R-008 | Sin captcha en formulario contacto | **Media** | Alta | hCaptcha/Turnstile pre-prod |
| R-011 | URLs CDN Lovable para logos clientes | **Alta** | Alta | Copiar assets a repo WEB/CDN propio |
| R-012 | Sección clara en sitio dark — inconsistencia | **Media** | Media | Definir token light-surface en design system |
| R-013 | Complejidad NovusDevFrameworkDemo (~467 líneas) | **Alta** | Alta | Reimplementar intención; no copiar SVG/modal |
| R-014 | CustomEvent window para trigger demo | **Baja** | Media | Usar React Context/state en productivo |
| R-015 | UX Inicio→abre demo en lugar de scroll top | **Baja** | Alta | Planner valida intención con diseño |

---

## Riesgos nuevos del delta (e3a9819 → 746c129)

### R-011: URLs CDN Lovable para logos clientes

**Descripción:** Los logos de Banco Santa Cruz y doevents usan `.asset.json` con URLs `/__l5e/assets-v1/{uuid}/...`. Estas rutas solo funcionan en runtime Lovable.

**Impacto:** Logos rotos en frontend productivo si se copian las URLs literalmente.

**Mitigación:**
- Descargar imágenes originales y alojar en `NovusIntelligenceWEB/public/assets/clients/`.
- Mapear por `case.id` igual que Lovable, pero con rutas locales.
- QA: verificar carga de logos en los 3 viewports de paridad.

**Responsable downstream:** frontend-integration-agent

---

### R-012: Sección clara en sitio dark

**Descripción:** Testimonials usa fondo claro (oklch 0.98) contrastando con el resto dark-first. Es decisión de diseño intencional pero rompe la uniformidad del design system actual.

**Impacto:** Paridad visual fallida si el productivo mantiene todo dark; o inconsistencia si no se replica el contraste.

**Mitigación:**
- Definir token semántico `surface-light` o `section-contrast` en design system WEB.
- Documentar en plan como patrón de sección (no excepción ad-hoc).
- Visual-parity-agent debe capturar screenshot de Testimonials específicamente.

**Responsable downstream:** planner-agent, frontend-integration-agent, visual-parity-agent

---

### R-013: Complejidad NovusDevFrameworkDemo

**Descripción:** Nuevo componente de 467 líneas con Dialog, grid 4 columnas, SVG animado, 9 pasos de simulación, log panel y tarjeta de producto final. Segundo componente interactivo complejo junto a MultiAgentDemo.

**Impacto:** Alto esfuerzo de traducción; riesgo de copia directa; problemas de accesibilidad (animaciones, focus trap).

**Mitigación:**
- Implementar como componente aislado con API clara (`open`, `onOpenChange`).
- `prefers-reduced-motion`: desactivar partículas SVG y auto-advance.
- No copiar STEPS/logs literalmente si el producto final difiere; traducir narrativa NADF real.
- Considerar lazy-load del modal para no impactar LCP del Hero.

**Responsable downstream:** frontend-integration-agent, qa-agent

---

### R-014: CustomEvent para trigger demo

**Descripción:** Hero y Header comunican vía `window.dispatchEvent(new CustomEvent('novus:open-dev-framework'))`. Patrón válido en Lovable pero no idiomático en React productivo.

**Impacto:** Acoplamiento global, difícil de testear, posibles memory leaks si listeners mal gestionados.

**Mitigación:**
- Reemplazar por React Context (`DemoModalProvider`) o state lifting desde layout.
- Si se mantiene patrón evento, encapsular en hook `useNovusDemo()`.

**Responsable downstream:** frontend-integration-agent, architect-agent

---

### R-015: UX click Inicio abre demo

**Descripción:** Al hacer click en "Inicio" estando ya en `/`, se abre el modal de simulación en lugar del comportamiento habitual (scroll to top o no-op).

**Impacto:** Comportamiento inesperado para usuarios; puede ser artefacto de prototipado Lovable.

**Mitigación:**
- Planner-agent consulta intención de diseño.
- Si no es intencional, implementar scroll-to-top estándar en productivo.

**Responsable downstream:** planner-agent

---

## Riesgos preexistentes (vigentes)

### R-001: Modo demo en formulario de contacto

`submitContact()` retorna éxito simulado con `VITE_DEMO_MODE` o sin API URL. No replicar en producción.

### R-002: Copia directa de código Lovable

Volumen alto (~467 líneas NovusDevFrameworkDemo + ~280 MultiAgentDemo + Testimonials rediseñado). Quality gate `no_lovable_code_copy` obligatorio.

### R-003: Routing TanStack → React Router

Sin cambios en el delta; sigue siendo riesgo alto para navegación completa.

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` es accesible, el diff está disponible y el análisis se completó correctamente.

---

## Checklist pre-planificación

- [x] Repositorio Lovable accesible
- [x] Delta analizado (17 commits, 9 archivos)
- [x] Cambios de severidad alta documentados (CHG-014, CHG-017, R-011, R-013)
- [x] Sin secrets detectados en artifacts
- [x] Sin recomendación de mocks productivos

---

## Próximo agente

**planner-agent** — incorporar CHG-014 y CHG-017 como ítems prioritarios; resolver R-015 (UX Inicio) antes de ejecutar frontend.
