# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `f97e53e`  
**Delta desde:** `e3a9819`  
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
| R-005 | Design tokens oklch no portados correctamente | **Media** | Media | Traducir a tokens del design system WEB |
| R-006 | Contenido Lovable vs memoria de marca | **Media** | Baja | Validar con brand-context.md en planificación |
| R-007 | Logo JPEG vs SVG vectorial | **Baja** | Alta | Usar asset actual; planificar SVG definitivo |
| R-008 | Sin captcha en formulario contacto | **Media** | Alta | Implementar hCaptcha/Turnstile pre-prod |
| R-009 | Datos de contacto expuestos en Lovable | **Baja** | Alta | Datos públicos de negocio; no son secrets |
| R-011 | **Mock data en NovusDevFrameworkDemo** | **Alta** | Alta | Marcar como demo educativa; no presentar Lead Manager como producto real |
| R-012 | **Dos simulaciones interactivas similares** | **Media** | Alta | Documentar diferencias MultiAgentDemo vs NovusDevFrameworkDemo |
| R-013 | **CustomEvent window para comunicación** | **Baja** | Media | Usar Context/callbacks en implementación productiva |
| R-014 | **Pérdida de CTA "Ver soluciones"** | **Media** | Alta | Planner evalúa recuperar enlace secundario además de simulación |

---

## R-011: Mock data en NovusDevFrameworkDemo (NUEVO)

**Descripción:** El modal de simulación (commit `f97e53e`) presenta contenido ficticio al finalizar: producto "Lead Manager B2B — MVP funcional", URL `leadmgr.novus.dev`, tiempo `~9 min`, stack "TanStack + AWS Lambda + Postgres" y logs que narran deploy/commit reales.

**Impacto:** Usuarios podrían interpretar el ejemplo como un producto existente de Novus. Violación potencial de `no_mock_data_in_production` si se replica sin disclaimers.

**Mitigación:**
- En productivo: panel final con copy de marca ("Así funciona nuestro framework") sin producto ficticio nombrado.
- Badge visible "Simulación educativa" en el modal.
- No enlazar a URLs ficticias; usar CTA real a contacto o documentación NADF.
- QA valida que no hay URLs o métricas engañosas.

**Responsable downstream:** frontend-integration-agent, qa-agent

---

## R-012: Dos simulaciones interactivas (NUEVO)

**Descripción:** Coexisten `MultiAgentDemo` en `/solutions/ai-agents` (8 pasos, diagrama circular) y `NovusDevFrameworkDemo` en Hero (9 pasos, 4 columnas). Ambos usan play/pausa, SVG animado y logs técnicos.

**Impacto:** Esfuerzo duplicado de traducción; posible confusión de propósito (arquitectura técnica vs narrativa comercial del framework).

**Mitigación:**
- Planner define prioridad y alcance de cada demo en el plan.
- Mantener mensajes diferenciados: MultiAgentDemo = arquitectura de solución IA; NovusDevFrameworkDemo = propuesta de valor del framework NADF.
- Considerar componente base compartido en WEB (hook de simulación), sin copiar de Lovable.

**Responsable downstream:** planner-agent, architect-agent

---

## R-013: CustomEvent para apertura de modal (NUEVO)

**Descripción:** Header dispara `window.dispatchEvent(new CustomEvent("novus:open-dev-framework"))` y Hero escucha con `addEventListener`. Patrón acoplado a `window`.

**Impacto:** Difícil de testear; posibles conflictos si múltiples instancias; no idiomático en React productivo.

**Mitigación:**
- Reemplazar por React Context (`DemoModalProvider`) o estado elevado en layout.
- Si se mantiene evento, documentar contrato y limpiar listeners.

**Responsable downstream:** frontend-integration-agent

---

## R-014: Pérdida de navegación a soluciones desde Hero (NUEVO)

**Descripción:** El CTA secundario "Ver soluciones" fue reemplazado por "Ver simulación". Ya no hay enlace directo desde Hero a `/solutions`.

**Impacto:** Posible reducción de conversión hacia catálogo de soluciones; desalineación con CTAs definidos en brand-context.md ("Conoce nuestros servicios" → sección servicios).

**Mitigación:**
- Planner evalúa tercer CTA o enlace en copy del Hero.
- Alternativa: mantener "Ver soluciones" como tercer botón o link inline en descripción.

**Responsable downstream:** planner-agent

---

## R-001: Modo demo en formulario de contacto

**Descripción:** `src/lib/api/contact.ts` retorna éxito simulado cuando `VITE_DEMO_MODE=true` o en DEV sin `VITE_NOVUS_API_URL`.

**Impacto:** Usuarios en producción podrían creer que su mensaje fue enviado cuando no lo fue.

**Mitigación:**
- Frontend productivo: eliminar fallback demo; error claro si API no disponible.
- Backend: implementar `POST /api/v1/contact` antes de habilitar formulario.
- Deploy: `VITE_DEMO_MODE=false` obligatorio en prod.

**Responsable downstream:** frontend-integration-agent, backend-agent, qa-agent

---

## R-002: Copia directa de código Lovable

**Descripción:** NovusDevFrameworkDemo añade ~467 líneas con SVG inline, subcomponentes y estilos shadcn. Tentación alta de copiar JSX/CSS.

**Impacto:** Deuda técnica, incompatibilidad de stack, violación de quality gate.

**Mitigación:**
- Traducir intención al design system WEB.
- Reviewer-agent valida ausencia de código copiado.

**Responsable downstream:** frontend-integration-agent, reviewer-agent

---

## R-003: Incompatibilidad de routing

**Descripción:** Lovable usa TanStack Start; productivo usa React Router.

**Impacto:** Rutas mal mapeadas, links rotos, 404 en slugs.

**Mitigación:**
- Confirmar convención de NovusIntelligenceWEB.
- Probar navegación de 10 rutas + 6 slugs + apertura modal en `/`.

**Responsable downstream:** planner-agent, architect-agent

---

## R-004: Complejidad MultiAgentDemo

**Descripción:** SVG inline, `animateMotion`, timeline de 8 pasos en `/solutions/ai-agents`.

**Impacto:** Alto esfuerzo; accesibilidad y rendimiento mobile.

**Mitigación:**
- Componente aislado con `prefers-reduced-motion`.
- Visual-parity-agent en rutas definidas.

**Responsable downstream:** frontend-integration-agent, visual-parity-agent

---

## Blockers

**Ninguno.** Repositorio `novus-nexus` accesible en `/agent/repos/novus-nexus`, commit `f97e53e` analizado con diff desde `e3a9819`.

---

## Siguiente agente

**planner-agent** — incorporar riesgos R-011 a R-014 en el plan de implementación del delta `f97e53e`.
