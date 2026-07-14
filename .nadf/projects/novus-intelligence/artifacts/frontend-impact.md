# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `f97e53e`  
**Delta desde:** `e3a9819`  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable mantiene el **sitio corporativo B2B completo** (10 rutas, design system dark-first) y añade en el commit `f97e53e` un **modal interactivo de simulación NADF** (`NovusDevFrameworkDemo`) integrado en el Hero de landing. El CTA secundario dejó de enlazar a `/solutions` y ahora abre esta simulación. La traducción al frontend productivo requiere **reimplementar la intención** sin copiar código, con especial atención a dos componentes interactivos: `MultiAgentDemo` (solución ai-agents) y `NovusDevFrameworkDemo` (Hero).

---

## Delta del commit f97e53e

| Archivo | Tipo de cambio | Impacto WEB |
|---------|----------------|-------------|
| `NovusDevFrameworkDemo.tsx` | Nuevo (467 líneas) | Componente modal a reimplementar |
| `Hero.tsx` | Modificado | CTAs, logo interactivo, integración modal |
| `Header.tsx` | Modificado | Evento custom para abrir modal desde nav Home |
| `package.json` | Bump devDep | Sin impacto productivo |

---

## Alcance de impacto por sección

| Sección Lovable | Ruta Lovable | Ruta WEB esperada | Prioridad | Complejidad |
|-----------------|--------------|-------------------|-----------|-------------|
| Landing / Hero + Demo | `/` | `/` | **Alta** | **Alta** |
| Header / Footer | Layout | Layout compartido | Alta | Media |
| Servicios (5 pilares) | `/services` | `/services` o sección `/` | Alta | Baja |
| Soluciones (grid) | `/solutions` | `/services` o `/solutions` | Alta | Baja |
| Detalle solución | `/solutions/$slug` | `/solutions/:slug` | Alta | Media |
| MultiAgentDemo | `/solutions/ai-agents` | `/solutions/ai-agents` | Alta | Alta |
| NovusDevFrameworkDemo | `/` (modal) | `/` (modal) | **Alta** | **Alta** |
| Nosotros | `/about` | `/about` | Alta | Baja |
| Casos de éxito | `/cases` | `/cases` o sección | Media | Baja |
| Contacto | `/contact` | `/contact` | Alta | Media |
| Páginas legales | `/privacy`, `/data-treatment`, `/terms` | Rutas equivalentes | Media | Baja |

---

## Cambios visuales a traducir

### Design system (CHG-002)

- **Paleta:** navy profundo, cyan neón primary, púrpura secondary en oklch.
- **Tipografía:** Space Grotesk (headings), Inter (body).
- **Utilities:** gradientes de marca, shadow-glow, grid-bg, animaciones pulse/float.
- **Prohibido:** copiar `src/styles.css` ni clases Tailwind literales de Lovable.

### Hero actualizado (CHG-004, CHG-015, CHG-016)

- CTA principal: "Agenda una demo" → `/contact` (sin cambio).
- CTA secundario: **nuevo** "Ver simulación" con icono Play; abre modal en lugar de navegar.
- Logo: área clickeable con badge "Click para simular el framework", hover scale y focus accesible.
- **Intención:** el Hero promociona el framework NADF como diferenciador de marca, no solo servicios.

### NovusDevFrameworkDemo (CHG-014) — Nueva complejidad alta

- **Patrón UI:** Dialog modal full-width (`max-w-6xl`) con header gradiente.
- **Layout:** 4 columnas en desktop (Triggers, Framework engine, Agentes IA, Entregables) con flechas SVG entre columnas.
- **Simulación:** 9 pasos con auto-advance 1.2s, log panel mono, barra de progreso segmentada clickeable.
- **Controles:** play/pausa, reiniciar; estado `finished` revela panel "Producto entregado".
- **SVG inline:** mini-canvas estilo n8n en columna Framework con `animateMotion` en edges.
- **Recomendación productiva:**
  - Implementar como componente aislado `DevFrameworkSimulationModal` con props `open/onOpenChange`.
  - Usar Dialog del design system WEB (no shadcn copiado de Lovable).
  - Respetar `prefers-reduced-motion`: pausar animaciones SVG y auto-advance.
  - **Contenido del panel final:** traducir a mensaje de marca real (no "Lead Manager B2B" ficticio).

### MultiAgentDemo (CHG-009)

- Permanece en `/solutions/ai-agents`; diagrama SVG distinto al de NovusDevFrameworkDemo.
- Ambos comparten patrón (timeline + play/pausa) pero con layouts diferentes: considerar abstracción conceptual, no código compartido desde Lovable.

### Layout (CHG-003, CHG-017)

- Header: al hacer clic en "Home" estando en `/`, debe abrir el modal (CustomEvent `novus:open-dev-framework`).
- **Traducción:** preferir React Context o callback prop en lugar de `window.dispatchEvent` en productivo.

---

## Cambios funcionales a traducir

### Routing (CHG-010)

| Lovable (TanStack) | Productivo (React Router) |
|--------------------|---------------------------|
| `createFileRoute("/")` | `<Route path="/" />` |
| `src/routes/solutions.$slug.tsx` | `/solutions/:slug` con `useParams()` |
| `Link` de TanStack | `Link` de react-router-dom |

Referencia: `novus-nexus/reglasEmpalme/port-map.yml`.

### Formulario de contacto (CHG-008)

- Validación inline, estados submitting/success/error.
- Conectar a `POST /api/v1/contact` real; **sin** fallback demo en producción.

### Simulaciones interactivas (CHG-009, CHG-014)

- Puramente frontend; sin API.
- Datos de pasos y logs son contenido estático de marketing.
- El panel "Producto entregado" muestra datos ficticios (URL `leadmgr.novus.dev`, tiempo `~9 min`) — **no replicar como datos reales**.

---

## Componentes a crear o extender en NovusIntelligenceWEB

| Componente Lovable | Acción sugerida | Prioridad |
|--------------------|-----------------|-----------|
| `NovusDevFrameworkDemo` | Crear modal de simulación NADF en Hero | Alta |
| `Hero` | Actualizar CTAs y logo interactivo | Alta |
| `Header` | Handler Home → abrir modal si en `/` | Media |
| `MultiAgentDemo` | Crear en ruta ai-agents | Alta |
| `ContactForm` | Conectar API real | Alta |
| Layout (Header/Footer) | Sincronizar navegación y legal | Alta |

---

## Dependencias y stack

- Lovable: TanStack Start, shadcn/ui, lucide-react, sonner.
- Productivo: React Router, Tailwind, Vite (según `project-context.yml`).
- **No importar** `@lovable.dev/vite-tanstack-config` ni dependencias exclusivas de Lovable.

---

## Quality gates aplicables

- [ ] `no_lovable_code_copy` — reimplementar intención
- [ ] `no_mock_data_in_production` — simulación claramente marcada como demo educativa
- [ ] `visual_exact_parity` — rutas `/`, `/about`, `/services`, `/contact` + modal Hero
- [ ] `responsive_validation` — modal usable en 390px
- [ ] Accesibilidad — focus trap en Dialog, aria-labels, reduced motion

---

## Siguiente agente

**planner-agent** debe priorizar el delta `f97e53e` (Hero + NovusDevFrameworkDemo) dentro del plan de sincronización global, definiendo si el CTA "Ver soluciones" se recupera además del botón de simulación.
