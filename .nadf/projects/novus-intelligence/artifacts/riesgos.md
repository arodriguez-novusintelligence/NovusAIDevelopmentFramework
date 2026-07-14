# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `dd9f5e2`  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers críticos — repositorio accesible y analizado

---

## Resumen de riesgos

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-001 | Modo demo en formulario de contacto | **Alta** | Alta | No replicar fallback demo en producción; exigir API real |
| R-002 | Copia directa de código Lovable | **Alta** | Media | Quality gate no_lovable_code_copy; reimplementar intención |
| R-003 | Incompatibilidad routing TanStack → React Router | **Alta** | Alta | Seguir port-map.yml; planner define mapeo de rutas |
| R-004 | Complejidad MultiAgentDemo (SVG + animaciones) | **Media** | Media | Componente aislado; prefers-reduced-motion |
| R-005 | Complejidad NovusDevFrameworkDemo (modal + timeline) | **Media** | Media | Componente aislado; no copiar 467 líneas literal |
| R-006 | Pérdida de affordance tras eliminar badge logo | **Baja** | Media | Mantener hover scale, botón "Ver simulación" y aria-label en logo |
| R-007 | Design tokens oklch no portados correctamente | **Media** | Media | Traducir a tokens del design system WEB |
| R-008 | Contenido Lovable vs memoria de marca | **Media** | Baja | Validar con brand-context.md en planificación |
| R-009 | Sin captcha en formulario contacto | **Media** | Alta | Implementar hCaptcha/Turnstile pre-prod |
| R-010 | CustomEvent entre Header y Hero | **Baja** | Baja | Traducir a React Context en productivo |

---

## R-001: Modo demo en formulario de contacto

**Descripción:** `src/lib/api/contact.ts` retorna éxito simulado cuando `VITE_DEMO_MODE=true` o en DEV sin `VITE_NOVUS_API_URL`.

**Impacto:** Usuarios en producción podrían creer que su mensaje fue enviado cuando no lo fue.

**Mitigación:**
- Frontend productivo: eliminar fallback demo; mostrar error claro si API no disponible.
- Backend: implementar `POST /api/v1/contact` antes de habilitar formulario.
- Deploy: `VITE_DEMO_MODE=false` obligatorio en prod.

**Responsable downstream:** frontend-integration-agent, backend-agent, qa-agent

---

## R-002: Copia directa de código Lovable

**Descripción:** El prototipo incluye componentes complejos (`NovusDevFrameworkDemo` ~467 líneas, `MultiAgentDemo` ~280 líneas) con shadcn/ui y utilities CSS propias.

**Impacto:** Deuda técnica, incompatibilidad de stack, violación de quality gate `no_lovable_code_copy`.

**Mitigación:**
- Traducir intención visual/funcional al stack React Router + Tailwind de NovusIntelligenceWEB.
- Usar componentes existentes del design system productivo.
- Reviewer-agent valida ausencia de código copiado.

**Responsable downstream:** frontend-integration-agent, reviewer-agent

---

## R-003: Incompatibilidad de routing

**Descripción:** Lovable usa TanStack Start; el frontend productivo usa React Router según `project-context.yml`.

**Impacto:** Rutas mal mapeadas, links rotos, 404 en slugs dinámicos.

**Mitigación:**
- Confirmar convención real de NovusIntelligenceWEB.
- Planner-agent documenta tabla de mapeo definitiva.
- Probar navegación completa de 10 rutas + 6 slugs.

**Responsable downstream:** planner-agent, architect-agent

---

## R-004: Complejidad MultiAgentDemo

**Descripción:** Componente en `/solutions/ai-agents` con SVG inline, `animateMotion`, estado React con intervalos y timeline de 8 pasos.

**Impacto:** Alto esfuerzo de traducción; posibles problemas de accesibilidad y rendimiento en mobile.

**Mitigación:**
- Implementar como componente aislado con `prefers-reduced-motion`.
- Pruebas visuales en 3 viewports (ADR-0006).
- Considerar versión estática simplificada como fallback accesible.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

## R-005: Complejidad NovusDevFrameworkDemo (nuevo)

**Descripción:** Modal añadido en commit `f97e53e` con diagrama de 4 columnas, 9 pasos animados, canvas estilo n8n, log panel y controles play/pausa/reset. Integrado en Hero vía estado React y CustomEvent desde Header.

**Impacto:** Segundo componente interactivo de alta complejidad; riesgo de copia literal dado el volumen de código.

**Mitigación:**
- Traducir intención del flujo educativo NADF, no el JSX literal.
- Props `open`/`onOpenChange` para reutilización.
- Reemplazar CustomEvent por React Context en productivo (ver R-010).
- Documentar en plan como tarea de esfuerzo alto junto a MultiAgentDemo.

**Responsable downstream:** planner-agent, frontend-integration-agent

---

## R-006: Pérdida de affordance tras eliminar badge logo (delta dd9f5e2)

**Descripción:** Commit `dd9f5e2` eliminó el badge overlay "Click para simular el framework" sobre el logo. La interacción sigue disponible por click en logo y botón "Ver simulación", pero sin indicador visual explícito en el logo.

**Impacto:** Usuarios podrían no descubrir la simulación si solo exploran el logo sin hover ni lectura de CTAs.

**Mitigación:**
- Mantener `aria-label` descriptivo en botón del logo.
- Conservar hover scale (`group-hover:scale-[1.02]`) en traducción productiva.
- Botón secundario "Ver simulación" como affordance principal.
- Validar usabilidad en QA; no reintroducir badge si Lovable lo eliminó intencionalmente.

**Responsable downstream:** frontend-integration-agent, qa-agent

---

## R-007: Design tokens oklch

**Descripción:** Lovable define colores en oklch con utilities personalizadas (gradient-brand, shadow-glow, navy-surface).

**Impacto:** Paridad visual incorrecta si los tokens no se mapean al design system productivo.

**Mitigación:**
- Extraer valores semánticos (primary, secondary, surface) como referencia.
- Configurar en `tailwind.config` del WEB, no copiar CSS literal.
- Visual-parity-agent valida con threshold ≤ 0.002.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

## R-008: Contenido vs memoria de marca

**Descripción:** Textos en Lovable (headlines, CTAs, stats) pueden divergir de `memory/brand-context.md`.

**Impacto:** Inconsistencia de tono o mensaje de marca.

**Mitigación:**
- Planner valida contenido contra brand-context y business-context.
- Priorizar memoria de proyecto sobre texto literal de Lovable cuando haya conflicto.

**Responsable downstream:** planner-agent

---

## R-009: Sin captcha en formulario

**Descripción:** Formulario de contacto sin protección anti-spam en Lovable.

**Impacto:** Abuso del endpoint de contacto en producción.

**Mitigación:**
- Implementar hCaptcha o Cloudflare Turnstile pre-prod.
- Backend valida token antes de procesar.

**Responsable downstream:** backend-agent, security-agent

---

## R-010: CustomEvent Header ↔ Hero

**Descripción:** Header dispara `window.dispatchEvent(new CustomEvent('novus:open-dev-framework'))` al click en "Inicio" estando en `/`. Hero escucha con `addEventListener`.

**Impacto:** Patrón frágil en React productivo; posibles memory leaks si no se limpia correctamente.

**Mitigación:**
- Reemplazar por React Context o Zustand store compartido.
- Evitar eventos DOM globales en productivo.

**Responsable downstream:** frontend-integration-agent, architect-agent

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` es accesible en `/agent/repos/novus-nexus`. Commit analizado: `dd9f5e2`. Diff disponible respecto a baseline `e3a9819` y delta incremental `f97e53e..dd9f5e2`.

---

## Próximo agente

**planner-agent** debe incorporar el delta reciente (NovusDevFrameworkDemo, Hero simplificado, integración Header) en `plan-implementacion.md`.
