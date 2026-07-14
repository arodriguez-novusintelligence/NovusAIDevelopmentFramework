# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `746c129`  
**Delta desde:** `e3a9819` (17 commits, 9 archivos)  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable mantiene un **sitio corporativo B2B dark-first** con dos novedades significativas en el delta reciente:

1. **NovusDevFrameworkDemo** — modal interactivo de simulación multiagente en el Hero (alta complejidad, ~467 líneas de intención funcional/visual).
2. **Testimonials rediseñado** — sección de casos con **fondo claro contrastante**, tarjetas estilo contacto y logos de clientes (Banco Santa Cruz, doevents).

La traducción al frontend productivo requiere **reimplementar la intención** sin copiar código, adaptando routing (TanStack → React Router), assets (CDN Lovable → assets propios) y el patrón de eventos custom (`novus:open-dev-framework`).

---

## Delta reciente (e3a9819 → 746c129)

| ID | Componente | Tipo | Prioridad | Complejidad |
|----|------------|------|-----------|-------------|
| CHG-014 | NovusDevFrameworkDemo | Funcional + Visual | **Alta** | **Alta** |
| CHG-015 | Hero CTA simulación | Funcional | Alta | Baja |
| CHG-016 | Header trigger demo | Funcional | Media | Baja |
| CHG-017 | Testimonials banking | Visual | **Alta** | Media |
| CHG-018 | Logos clientes CDN | Estructural + Visual | Alta | Media |
| CHG-019 | CI notify-nadf | Estructural | Baja | N/A (no WEB) |
| CHG-020 | Badge removal Hero | Visual | Baja | Trivial |

---

## Alcance de impacto por sección

| Sección Lovable | Ruta Lovable | Ruta WEB esperada | Prioridad | Complejidad |
|-----------------|--------------|-------------------|-----------|-------------|
| Landing / Hero + Demo | `/` | `/` | Alta | **Alta** |
| Testimonials / Casos | `/` (sección) | `/` o `/cases` | Alta | Media |
| Header / Footer | Layout | Layout compartido | Alta | Media |
| Servicios (5 pilares) | `/services` | `/services` | Alta | Baja |
| Soluciones (grid) | `/solutions` | `/solutions` | Alta | Baja |
| Detalle solución | `/solutions/$slug` | `/solutions/:slug` | Alta | Media |
| MultiAgentDemo | `/solutions/ai-agents` | `/solutions/ai-agents` | Alta | Alta |
| Nosotros | `/about` | `/about` | Alta | Baja |
| Contacto | `/contact` | `/contact` | Alta | Media |
| Páginas legales | `/privacy`, `/data-treatment`, `/terms` | Rutas equivalentes | Media | Baja |

---

## Cambios visuales a traducir

### Testimonials — rediseño bancario (CHG-017) — NUEVO

- **Contraste de sección:** fondo claro (oklch 0.98→0.94) dentro de página oscura. Requiere token de sección `light-surface` o equivalente en design system WEB.
- **Tarjetas:** fondo blanco, `rounded-3xl`, sombra elevada, hover `-translate-y-1`.
- **Header de tarjeta:** contenedor logo 80×80px, industria en uppercase, nombre cliente bold, metadatos con iconos MapPin/Globe.
- **Fallback:** icono Building2 si no hay logo.
- **Prohibido:** copiar estilos inline oklch literales; traducir a tokens del design system.

### NovusDevFrameworkDemo (CHG-014) — NUEVO

- **Modal Dialog** max-w-6xl con header gradiente y grid de 4 columnas (Triggers, Framework, Agentes, Entregables).
- **Simulación:** 9 pasos con auto-advance cada 1.2s, log panel monospace, barra de progreso clickeable.
- **SVG inline:** mini-canvas estilo n8n con nodos, edges gradiente y partículas `animateMotion`.
- **Estado final:** tarjeta "Producto entregado" con tags de stack (TanStack, AWS, etc.).
- **Recomendación:** componente aislado con props `open/onOpenChange`; usar patrón React (context o callback) en lugar de `window.dispatchEvent`.
- **Accesibilidad:** `prefers-reduced-motion`, focus trap en modal, aria-labels en controles.

### Hero actualizado (CHG-004, CHG-015, CHG-020)

- CTA secundario: "Ver simulación" con icono Play (antes "Ver soluciones").
- Logo clickeable abre modal; hover `scale-[1.02]`.
- Sin badge decorativo sobre logo.

### Design system existente (CHG-002)

- Paleta dark-first navy + cyan + púrpura en oklch.
- Tipografía Space Grotesk + Inter.
- Utilities: gradientes, glow, grid-bg, animaciones pulse/float.

### Logos de clientes (CHG-018)

- En Lovable: URLs `/__l5e/assets-v1/{uuid}/...` vía `.asset.json`.
- En productivo: **copiar assets reales** a `public/assets/clients/` o CDN propio; nunca depender de CDN Lovable.

---

## Cambios funcionales a traducir

### Trigger de simulación (CHG-015, CHG-016)

| Lovable | Productivo recomendado |
|---------|------------------------|
| `window.dispatchEvent('novus:open-dev-framework')` | React Context o state lifting desde Hero |
| Click logo Hero → `setOpen(true)` | Mismo patrón con `useState` |
| Click "Inicio" en / → abre modal | Evaluar UX: ¿scroll top o abrir demo? Planner debe decidir |

### Routing (CHG-010)

| Lovable (TanStack) | Productivo (React Router) |
|--------------------|---------------------------|
| `createFileRoute("/")` | `<Route path="/" />` |
| `src/routes/solutions.$slug.tsx` | `/solutions/:slug` |
| `Link` TanStack | `Link` react-router-dom |
| `useRouterState` | `useLocation` |

### Formulario de contacto (CHG-008)

- Validación inline, estados submitting/success/error.
- Conectar a `POST /api/v1/contact` real.
- **Prohibido:** replicar fallback demo de Lovable.

### MultiAgentDemo (CHG-009)

- Diagrama SVG en `/solutions/ai-agents`; complejidad similar a NovusDevFrameworkDemo.
- Implementar como componente aislado; no copiar SVG inline.

---

## Componentes a crear o modificar en NovusIntelligenceWEB

| Componente | Acción | Dependencias |
|------------|--------|--------------|
| `NovusDevFrameworkDemo` | Crear (nuevo) | Dialog/Modal, SVG animado, hooks simulación |
| `Testimonials` / `CaseStudies` | Rediseñar | Assets logos clientes, tokens light-surface |
| `Hero` | Modificar | Integrar demo, nuevo CTA |
| `Header` | Modificar | Trigger demo en Inicio (si se mantiene) |
| Assets clientes | Añadir | banco-santa-cruz.png, doevents.jpg en repo WEB |

---

## Paridad visual (ADR-0006)

Rutas afectadas por el delta:

| Ruta | Viewports | Elemento crítico |
|------|-----------|------------------|
| `/` | 1440×900, 768×1024, 390×844 | Hero + Testimonials claro + modal demo |

El rediseño de Testimonials con fondo claro es **crítico para paridad** — cambio visual de alto impacto en landing.

---

## Quality gates aplicables

- [ ] No copia directa de código Lovable
- [ ] Assets de clientes en repo productivo (no CDN Lovable)
- [ ] Sin mocks en formulario de contacto
- [ ] Modal accesible (focus, reduced-motion)
- [ ] Paridad visual en `/` tras implementación

---

## Próximo agente

**planner-agent** — debe priorizar CHG-014 (demo modal) y CHG-017 (Testimonials) en el plan de implementación, evaluando si el trigger de Inicio→demo es intención de diseño o artefacto Lovable.
