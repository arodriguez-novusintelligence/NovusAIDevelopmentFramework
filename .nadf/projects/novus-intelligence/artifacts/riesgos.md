# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `20d79e1`  
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
| R-005 | Complejidad NovusDevFrameworkDemo (nuevo) | **Media** | Media | Modal aislado; reducir animaciones en mobile |
| R-006 | Design tokens oklch no portados correctamente | **Media** | Media | Traducir a tokens del design system WEB |
| R-007 | Testimonials fondo claro vs dark-first | **Media** | Media | Replicar contraste intencional en paridad visual |
| R-008 | Logos bancarios vía CDN Lovable | **Media** | Alta | Obtener assets reales; no depender de .asset.json Lovable |
| R-009 | Sin captcha en formulario contacto | **Media** | Alta | Implementar hCaptcha/Turnstile pre-prod |
| R-010 | Commit message vs delta real | **Baja** | Alta | Baseline 20d79e1; delta técnico documentado en artifacts |
| R-011 | Secret NADF_DISPATCH_TOKEN en CI | **Baja** | Baja | Mantener en GitHub Secrets; nunca en repo |

---

## R-001: Modo demo en formulario de contacto

**Descripción:** `src/lib/api/contact.ts` retorna éxito simulado cuando `VITE_DEMO_MODE=true` o en entorno DEV sin `VITE_NOVUS_API_URL`.

**Impacto:** Usuarios en producción podrían creer que su mensaje fue enviado cuando no lo fue.

**Mitigación:**
- Frontend productivo: eliminar fallback demo; mostrar error claro si API no disponible.
- Backend: implementar `POST /api/v1/contact` antes de habilitar formulario.
- Deploy: `VITE_DEMO_MODE=false` obligatorio en prod.

**Responsable downstream:** frontend-integration-agent, backend-agent, qa-agent

---

## R-002: Copia directa de código Lovable

**Descripción:** El prototipo acumula componentes complejos: MultiAgentDemo (~280 líneas SVG), NovusDevFrameworkDemo (~467 líneas), Testimonials con estilos inline oklch.

**Impacto:** Deuda técnica, incompatibilidad de stack, violación de quality gate `no_lovable_code_copy`.

**Mitigación:**
- Traducir intención visual/funcional al stack React Router + Tailwind de NovusIntelligenceWEB.
- Usar componentes existentes del design system productivo.
- Reviewer-agent valida ausencia de código copiado.

**Responsable downstream:** frontend-integration-agent, reviewer-agent

---

## R-003: Incompatibilidad de routing

**Descripción:** Lovable usa TanStack Start con `routeTree.gen.ts` y registro SSR. El frontend productivo usa React Router según `project-context.yml`.

**Impacto:** Rutas mal mapeadas, links rotos, meta tags incorrectos.

**Mitigación:**
- Confirmar convención real de NovusIntelligenceWEB.
- Planner-agent documenta tabla de mapeo definitiva.
- Probar navegación completa de 10 rutas + 6 slugs.

**Responsable downstream:** planner-agent, architect-agent

---

## R-004: Complejidad MultiAgentDemo

**Descripción:** Componente en `/solutions/ai-agents` con SVG inline, `animateMotion`, timeline de 8 pasos.

**Impacto:** Alto esfuerzo de traducción; problemas de accesibilidad y rendimiento en mobile.

**Mitigación:**
- Componente aislado con `prefers-reduced-motion`.
- Considerar versión estática simplificada para mobile.
- Visual-parity-agent valida en ruta `/solutions/ai-agents`.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

## R-005: Complejidad NovusDevFrameworkDemo (nuevo en delta)

**Descripción:** Modal de 4 columnas con 9 pasos animados, log panel, controles play/pausa/reset. Integrado en Hero vía estado y evento custom `novus:open-dev-framework`.

**Impacto:** Segundo componente interactivo de alta complejidad; posible sobrecarga en landing mobile.

**Mitigación:**
- Implementar como Dialog lazy-loaded (code splitting).
- Pausar animaciones si `prefers-reduced-motion: reduce`.
- No bloquear render inicial del Hero.

**Responsable downstream:** frontend-integration-agent, qa-agent

---

## R-006: Design tokens oklch

**Descripción:** Lovable usa colores oklch extensivamente, incluyendo estilos inline en Testimonials (fondo claro `oklch(0.98 0.005 240)`).

**Impacto:** Paridad visual fallida si tokens no se traducen al design system WEB.

**Mitigación:**
- Mapear tokens a variables CSS del proyecto productivo.
- Documentar tokens en plan-implementacion.md.
- Visual-parity-agent con threshold ≤ 0.002.

**Responsable downstream:** planner-agent, visual-parity-agent

---

## R-007: Contraste Testimonials fondo claro

**Descripción:** La sección Testimonials usa fondo claro deliberado que rompe el patrón dark-first del resto del sitio.

**Impacto:** Implementadores podrían unificar todo a dark y perder la intención de contraste.

**Mitigación:**
- Documentar como decisión de diseño intencional.
- Incluir en rutas de paridad visual la sección Testimonials en `/`.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

## R-008: Logos bancarios vía CDN Lovable

**Descripción:** Logos de Banco Santa Cruz y doevents referenciados vía `.asset.json` de Lovable CDN, no como archivos locales en `public/`.

**Impacto:** URLs externas pueden expirar o no estar disponibles en entorno productivo.

**Mitigación:**
- Obtener logos oficiales de clientes y alojar en assets del proyecto WEB.
- Validar permisos de uso de marca.

**Responsable downstream:** frontend-integration-agent

---

## R-009: Sin captcha en formulario

**Descripción:** Formulario de contacto sin protección anti-spam/bot.

**Impacto:** Abuso del endpoint, costos SES, spam.

**Mitigación:**
- Implementar hCaptcha o Cloudflare Turnstile antes de producción.
- Rate limiting en API Gateway + Lambda.

**Responsable downstream:** backend-agent, security-agent

---

## R-010: Discrepancia commit message vs delta técnico

**Descripción:** El commit `20d79e1` declara implementación de secciones About/Contact/Privacy/Data-treatment, pero esas rutas ya existían en `e3a9819`. El delta real son NovusDevFrameworkDemo, Hero, Header, Testimonials y routeTree SSR.

**Impacto:** Confusión en planificación si se asume trabajo ya hecho en productivo.

**Mitigación:**
- Usar `cambios-lovable.json` baseline `20d79e1` como fuente de verdad.
- Planner prioriza delta documentado en `latestDelta`.

**Responsable downstream:** planner-agent

---

## R-011: Secret en workflow CI

**Descripción:** `notify-nadf.yml` requiere `NADF_DISPATCH_TOKEN` como GitHub Secret en novus-nexus.

**Impacto:** Si el secret se expone en código o artifacts, compromete el dispatch al Framework.

**Mitigación:**
- Mantener solo en GitHub Secrets.
- No incluir en artifacts ni prompts de agentes.

**Responsable downstream:** devops-agent

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` está accesible en `/agent/repos/novus-nexus`, branch `main` @ `20d79e1`, con diff analizable respecto a baseline `e3a9819`.

---

## Próximo agente

**planner-agent** — usar artifacts de este paso para generar `plan-implementacion.md` con priorización del delta reciente.
