<!-- NADF-GUIDE
Propósito: Documenta Riesgos — Análisis Lovable (paso-01).
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `e3a9819`  
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
| R-004 | Complejidad MultiAgentDemo (SVG + animaciones) | **Media** | Media | Componente aislado; prefers-reduced-motion; pruebas visuales |
| R-005 | Design tokens oklch no portados correctamente | **Media** | Media | Traducir a tokens del design system WEB, no CSS literal |
| R-006 | Contenido Lovable vs memoria de marca | **Media** | Baja | Validar con brand-context.md en planificación |
| R-007 | Logo JPEG vs SVG vectorial | **Baja** | Alta | Usar asset actual; planificar SVG definitivo |
| R-008 | Sin captcha en formulario contacto | **Media** | Alta | Implementar hCaptcha/Turnstile pre-prod |
| R-009 | Datos de contacto expuestos en Lovable | **Baja** | Alta | Son datos públicos de negocio; no son secrets |
| R-010 | Documentación cloud-agent-integration.md ausente | **Baja** | Alta | No bloquea análisis; adaptador M6 cursor-cloud operativo |

---

## R-001: Modo demo en formulario de contacto

**Descripción:** `src/lib/api/contact.ts` retorna éxito simulado cuando `VITE_DEMO_MODE=true` o en entorno DEV sin `VITE_NOVUS_API_URL`. El mensaje incluye `requestId: demo-{timestamp}`.

**Impacto:** Usuarios en producción podrían creer que su mensaje fue enviado cuando no lo fue.

**Mitigación:**
- Frontend productivo: eliminar fallback demo; mostrar error claro si API no disponible.
- Backend: implementar `POST /api/v1/contact` antes de habilitar formulario.
- Deploy: `VITE_DEMO_MODE=false` obligatorio en prod (documentado en `reglasInfra/aws-prod.yml`).
- QA: validar que submit sin API retorna error, no éxito.

**Responsable downstream:** frontend-integration-agent, backend-agent, qa-agent

---

## R-002: Copia directa de código Lovable

**Descripción:** El prototipo usa TanStack Start, shadcn/ui y utilities CSS propias. La tentación de copiar JSX/CSS es alta dado el volumen de código (~280 líneas solo en MultiAgentDemo).

**Impacto:** Deuda técnica, incompatibilidad de stack, violación de quality gate `no_lovable_code_copy`.

**Mitigación:**
- Traducir intención visual/funcional al stack React Router + Tailwind de NovusIntelligenceWEB.
- Usar componentes existentes del design system productivo.
- Reviewer-agent valida ausencia de código copiado.

**Responsable downstream:** frontend-integration-agent, reviewer-agent

---

## R-003: Incompatibilidad de routing

**Descripción:** Lovable usa TanStack Start (`src/routes/`, `createFileRoute`, `routeTree.gen.ts`). El frontend productivo usa React Router según `project-context.yml`. El port-map asume Next.js App Router como destino alternativo.

**Impacto:** Rutas mal mapeadas, links rotos, meta tags incorrectos, 404 en slugs dinámicos.

**Mitigación:**
- Confirmar convención real de NovusIntelligenceWEB (React Router vs App Router).
- Planner-agent documenta tabla de mapeo definitiva.
- Probar navegación completa de 10 rutas + 6 slugs.

**Responsable downstream:** planner-agent, architect-agent

---

## R-004: Complejidad MultiAgentDemo

**Descripción:** Componente nuevo (commit `e3a9819`) con SVG inline, `animateMotion`, estado React con intervalos, 7 nodos posicionados en porcentajes y timeline de 8 pasos.

**Impacto:** Alto esfuerzo de traducción; posibles problemas de accesibilidad (animaciones continuas) y rendimiento en mobile.

**Mitigación:**
- Implementar como componente lazy-loaded solo en `/solutions/ai-agents`.
- Respetar `prefers-reduced-motion: reduce` (pausar animaciones).
- Simplificar SVG si la traducción literal es inviable; preservar intención educativa.
- QA responsive en viewports sm/md/lg.

**Responsable downstream:** frontend-integration-agent, qa-agent

---

## R-005: Design tokens oklch

**Descripción:** Todo el design system Lovable usa oklch en CSS custom properties. NovusIntelligenceWEB puede usar convención diferente (HSL, hex, Tailwind config).

**Impacto:** Inconsistencia visual entre prototipo y producción.

**Mitigación:**
- Extraer tokens semánticos (primary, secondary, navy-deep, etc.) como referencia.
- Mapear a variables del design system productivo.
- No copiar valores oklch literalmente si el sistema productivo no los soporta.

**Responsable downstream:** frontend-integration-agent

---

## R-006: Contenido vs memoria de marca

**Descripción:** `brand-context.md` define tono y paleta genérica; Lovable tiene contenido específico (founder, casos, 6 soluciones). Pueden existir divergencias.

**Impacto:** Mensaje de marca inconsistente.

**Mitigación:**
- Planner valida copy contra `memory/brand-context.md` y `memory/business-context.md`.
- Aprobar textos con stakeholder si hay conflicto.

**Responsable downstream:** planner-agent

---

## R-007: Logo JPEG

**Descripción:** Lovable usa `logo.jpeg` (binario ~987KB). La documentación de reestructuración marca SVG vectorial como gap pendiente.

**Impacto:** Calidad visual en retina/alto DPI; peso de asset.

**Mitigación:**
- Usar JPEG actual como asset real (permitido: assets, no código).
- Planificar migración a SVG en iteración futura.

**Responsable downstream:** frontend-integration-agent

---

## R-008: Sin captcha

**Descripción:** `docs/changes/reestructuracion-inicial.md` lista captcha (hCaptcha/Turnstile) como TODO pre-prod.

**Impacto:** Spam en formulario de contacto; abuso de API.

**Mitigación:**
- Backend valida token captcha antes de procesar.
- Frontend integra widget captcha.
- Security-agent revisa en fase de validación.

**Responsable downstream:** backend-agent, security-agent

---

## R-009: Datos de contacto en código

**Descripción:** Email, teléfono y redes sociales están en `src/content/site.ts`.

**Impacto:** Bajo — son datos públicos de contacto comercial, no secrets.

**Mitigación:** Ninguna acción requerida. No confundir con API keys o tokens.

---

## R-010: Documentación cloud-agent ausente

**Descripción:** `docs/cloud-agent-integration.md` no existe en el repositorio framework (referenciado en instrucciones de runtime).

**Impacto:** Bajo para este paso. El análisis se completó vía acceso directo al workspace.

**Mitigación:** Framework Architect puede crear el documento en iteración futura.

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` está accesible en `/agent/repos/novus-nexus`, en branch `main`, commit `e3a9819`.

---

## Checklist pre-planificación

- [x] Repositorio Lovable accesible
- [x] Cambios clasificados (visual, functional, content, structural)
- [x] Modo demo documentado como riesgo alto
- [x] Backend requirement identificado (contact API)
- [x] port-map.yml referenciado para traducción routing
- [x] MultiAgentDemo analizado como delta principal

---

## Próximo agente

**planner-agent** debe incorporar mitigaciones R-001, R-002 y R-003 como tareas explícitas en el plan de implementación.
