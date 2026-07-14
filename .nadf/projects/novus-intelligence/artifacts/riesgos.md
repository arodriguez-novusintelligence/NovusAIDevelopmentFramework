# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `f97e53e`  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers críticos — repositorio accesible y analizado

---

## Resumen de riesgos

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-001 | Modo demo en formulario de contacto | **Alta** | Alta | No replicar fallback demo en producción |
| R-002 | Copia directa de código Lovable | **Alta** | Alta | Quality gate no_lovable_code_copy |
| R-003 | Incompatibilidad routing TanStack → React Router | **Alta** | Alta | Seguir port-map.yml |
| R-004 | Complejidad MultiAgentDemo (SVG + animaciones) | **Media** | Media | Componente aislado; prefers-reduced-motion |
| R-005 | Design tokens oklch no portados correctamente | **Media** | Media | Traducir a tokens del design system WEB |
| R-006 | Contenido Lovable vs memoria de marca | **Media** | Baja | Validar con brand-context.md |
| R-007 | Logo JPEG vs SVG vectorial | **Baja** | Alta | Usar asset actual; planificar SVG |
| R-008 | Sin captcha en formulario contacto | **Media** | Alta | hCaptcha/Turnstile pre-prod |
| R-009 | Datos de contacto expuestos en Lovable | **Baja** | Alta | Datos públicos; no son secrets |
| R-011 | Complejidad NovusDevFrameworkDemo (nuevo) | **Alta** | Alta | Lazy-load; reduced-motion; no copiar JSX |
| R-012 | CustomEvent global Header↔Hero | **Media** | Media | Reemplazar por React Context en productivo |
| R-013 | CTA secundario pierde link a /solutions | **Media** | Alta | Validar UX; considerar tercer CTA o nav |
| R-014 | Contenido ficticio presentado como real | **Media** | Media | Etiquetar como demo; no publicar URLs ficticias |
| R-015 | Secret NADF_DISPATCH_TOKEN en CI Lovable | **Baja** | Baja | Mantener solo en GitHub Secrets; no en repo |

---

## R-011: Complejidad NovusDevFrameworkDemo (nuevo — delta f97e53e)

**Descripción:** Componente de ~467 líneas con Dialog modal, grid 4 columnas, hook `useSimulation`, 9 pasos, SVG con `animateMotion`, barra de progreso interactiva y tarjeta de producto entregado.

**Impacto:** Esfuerzo de traducción comparable o superior a MultiAgentDemo; riesgo de copia directa por volumen de código.

**Mitigación:**
- Implementar como módulo lazy-loaded solo en landing.
- Extraer subcomponentes (Column, EngineColumn, BetweenArrow) con props tipadas.
- Respetar `prefers-reduced-motion`.
- Preservar intención educativa del flujo NADF sin replicar estructura JSX literal.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

## R-012: CustomEvent global entre Header y Hero

**Descripción:** `Header.tsx` dispara `window.dispatchEvent(new CustomEvent('novus:open-dev-framework'))` cuando el usuario re-clickea "Home" estando en `/`. `Hero.tsx` escucha con `addEventListener`.

**Impacto:** Acoplamiento implícito difícil de testear; anti-patrón en React productivo; posibles memory leaks si no se limpia listener.

**Mitigación:**
- En NovusIntelligenceWEB usar React Context (`SimulationModalContext`) o estado elevado en layout.
- Documentar comportamiento UX en plan; evaluar si re-clic Home debe abrir modal o scroll-to-top.

**Responsable downstream:** planner-agent, frontend-integration-agent

---

## R-013: Pérdida de acceso directo a soluciones desde Hero

**Descripción:** El CTA secundario cambió de `<Link to="/solutions">Ver soluciones</Link>` a botón "Ver simulación" que abre el modal.

**Impacto:** Posible reducción de conversión hacia página de soluciones; usuarios pueden no descubrir `/solutions` desde Hero.

**Mitigación:**
- Planner valida con stakeholder si el cambio es intencional.
- Alternativas: mantener ambos CTAs, o añadir link en copy del Hero, o CTA en sección SolutionsGrid.

**Responsable downstream:** planner-agent

---

## R-014: Contenido ficticio en simulación

**Descripción:** Al finalizar la simulación se muestra "Lead Manager B2B — MVP funcional", URL `leadmgr.novus.dev` y tiempo "~9 min" como si fueran entregables reales.

**Impacto:** Confusión de marca si se publica sin contexto; expectativas irreales sobre tiempos de desarrollo.

**Mitigación:**
- Etiquetar claramente como "simulación" / "ejemplo ilustrativo".
- Adaptar copy a casos reales de Novus Intelligence o usar disclaimer visible.
- No registrar URLs ficticias en sitemap ni meta tags.

**Responsable downstream:** planner-agent, frontend-integration-agent

---

## R-001: Modo demo en formulario de contacto

**Descripción:** `src/lib/api/contact.ts` retorna éxito simulado con `VITE_DEMO_MODE` o en DEV sin API.

**Mitigación:** Eliminar fallback en producción; implementar API antes de habilitar formulario.

**Responsable downstream:** frontend-integration-agent, backend-agent, qa-agent

---

## R-002: Copia directa de código Lovable

**Descripción:** Volumen alto de código interactivo (~467 + ~280 líneas en dos demos).

**Mitigación:** Traducir intención al stack React Router; reviewer valida ausencia de copia.

**Responsable downstream:** frontend-integration-agent, reviewer-agent

---

## R-003: Incompatibilidad de routing

**Descripción:** TanStack Start vs React Router en productivo.

**Mitigación:** Confirmar convención WEB; probar 10 rutas + 6 slugs.

**Responsable downstream:** planner-agent, architect-agent

---

## R-004 a R-010

Sin cambios respecto al análisis previo. Ver secciones detalladas en historial de artifacts.

**R-010 actualizado:** `docs/cloud-agent-integration.md` ya existe en el framework (2026-07-14). Riesgo resuelto.

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` está accesible en `/agent/repos/novus-nexus`, branch `main`, commit `f97e53e`.

---

## Checklist pre-planificación

- [x] Repositorio Lovable accesible
- [x] Cambios clasificados (visual, functional, content, structural)
- [x] Delta f97e53e analizado (NovusDevFrameworkDemo)
- [x] Modo demo documentado como riesgo alto
- [x] Backend requirement identificado (solo contact API)
- [x] CustomEvent y CTA documentados como riesgos nuevos
- [x] Contenido ficticio de simulación marcado

---

## Próximo agente

**planner-agent** debe incorporar mitigaciones R-001, R-002, R-011, R-012 y R-013 como tareas explícitas en el plan de implementación.
