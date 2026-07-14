# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `746c129`  
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
| R-004 | Complejidad MultiAgentDemo (SVG + animaciones) | **Media** | Media | Componente aislado; prefers-reduced-motion |
| R-005 | Design tokens oklch no portados correctamente | **Media** | Media | Traducir a tokens del design system WEB |
| R-006 | Contenido Lovable vs memoria de marca | **Media** | Baja | Validar con brand-context.md |
| R-007 | Logo JPEG vs SVG vectorial | **Baja** | Alta | Usar asset actual; planificar SVG |
| R-008 | Sin captcha en formulario contacto | **Media** | Alta | hCaptcha/Turnstile pre-prod |
| R-009 | Datos de contacto expuestos en Lovable | **Baja** | Alta | Datos públicos; no son secrets |
| R-010 | URLs CDN Lovable para logos clientes | **Alta** | Alta | Alojar assets en WEB/CDN propio |
| R-011 | Complejidad NovusDevFrameworkDemo | **Alta** | Media | Componente aislado; planificar sprint dedicado |
| R-012 | Estilos inline oklch en Testimonials | **Media** | Alta | Mapear a tokens CSS del design system |
| R-013 | Sección clara rompe dark-first | **Media** | Alta | Replicar contraste exacto para paridad visual |
| R-014 | CustomEvent window para modal | **Baja** | Media | Preferir Context/estado React en WEB |

---

## Riesgos del delta reciente

### R-010: URLs CDN Lovable para logos clientes

**Descripción:** Los logos de Banco Santa Cruz y doevents usan URLs `/__l5e/assets-v1/{asset_id}/` servidas por CDN interno de Lovable. Los archivos PNG/JPG locales fueron eliminados del repo.

**Impacto:** En NovusIntelligenceWEB las imágenes no cargarán si se copian las URLs literalmente.

**Mitigación:**
- Exportar logos originales desde Lovable o fuente de diseño.
- Alojar en `public/assets/clients/` del frontend productivo o CDN CloudFront.
- No referenciar rutas `__l5e` en código productivo.

**Responsable downstream:** frontend-integration-agent

---

### R-011: Complejidad NovusDevFrameworkDemo

**Descripción:** Nuevo componente de 467 líneas con modal Dialog, diagrama 4 columnas, 9 pasos animados, log panel, controles play/pausa/reset y múltiples iconos Lucide.

**Impacto:** Alto esfuerzo de traducción; riesgo de no alcanzar paridad visual exacta (gate ADR-0006).

**Mitigación:**
- Planificar como tarea dedicada en plan-implementacion.md.
- Implementar por fases: estructura modal → diagrama estático → animaciones.
- Respetar `prefers-reduced-motion`.
- No copiar JSX/CSS literal.

**Responsable downstream:** planner-agent, frontend-integration-agent, visual-parity-agent

---

### R-012: Estilos inline oklch en Testimonials

**Descripción:** El rediseño de Testimonials usa `style={{ color: "oklch(...)" }}` en ~15 elementos en lugar de clases Tailwind o variables CSS del design system.

**Impacto:** Dificulta mantenimiento y consistencia; valores exactos pueden perderse en traducción.

**Mitigación:**
- Extraer valores oklch a tokens del design system WEB (ej. `--section-light-bg`, `--card-text-primary`).
- Documentar en plan los valores exactos para paridad visual.
- Visual-parity-agent valida la sección clara en 3 viewports.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

### R-013: Sección clara rompe dark-first

**Descripción:** Testimonials introduce un bloque con fondo claro (oklch 0.98→0.94) contrastando con el resto del sitio dark-first. Es intencional en Lovable pero no estaba en el análisis anterior.

**Impacto:** Si el frontend productivo mantiene todo dark, fallará el gate `visual_exact_parity`.

**Mitigación:**
- Replicar el contraste de sección exactamente (no forzar dark en Testimonials).
- Incluir `/` con scroll a Testimonials en rutas de paridad visual.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

### R-014: CustomEvent window para modal

**Descripción:** Hero, Header y modal se coordinan vía `window.dispatchEvent(new CustomEvent("novus:open-dev-framework"))`.

**Impacto:** Patrón funcional en Lovable pero menos idiomático en React; posibles race conditions.

**Mitigación:**
- En WEB productivo usar React Context o estado en layout compartido.
- Mantener misma UX: CTA, logo y click Inicio en `/` abren modal.

**Responsable downstream:** frontend-integration-agent

---

## Riesgos heredados (sin cambio)

### R-001: Modo demo en formulario de contacto

`src/lib/api/contact.ts` retorna éxito simulado con `requestId: demo-{timestamp}` en modo demo.

**Mitigación:** Eliminar fallback en producción; implementar API real primero.

### R-002: Copia directa de código Lovable

Volumen alto: NovusDevFrameworkDemo (467 líneas) + MultiAgentDemo (~280 líneas) + Testimonials rediseñado (~190 líneas).

**Mitigación:** Traducir intención; reviewer-agent valida ausencia de código copiado.

### R-003: Incompatibilidad de routing

TanStack Start vs React Router. Sin cambios en delta.

**Mitigación:** Planner define mapeo definitivo de rutas.

### R-008: Sin captcha

Formulario de contacto sin protección anti-bot.

**Mitigación:** hCaptcha o Cloudflare Turnstile antes de prod.

---

## Blockers

| Blocker | Estado |
|---------|--------|
| novus-nexus inaccesible | **No** — repo clonado y analizado |
| project-context.yml ausente | **No** — presente |
| Sin diffs ni snapshot | **No** — delta `e3a9819..746c129` disponible |
| Cambio severidad alta sin documentar | **No** — CHG-014, CHG-017 documentados |

**Estado general: sin blockers — workflow puede continuar a planner-agent.**

---

## Checklist pre-planificación

- [x] Cambios clasificados (visual | functional | content | structural)
- [x] Riesgos de logos CDN documentados (R-010)
- [x] NovusDevFrameworkDemo evaluado como frontend-only
- [x] Testimonials redesign marcado para paridad visual
- [x] Modo demo contacto sigue siendo riesgo alto
- [x] Sin secrets detectados en artefactos ni código analizado
