# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `20d79e1`  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable define un **sitio corporativo B2B completo** con design system dark-first (navy + cyan + púrpura), 10 rutas navegables y **dos componentes interactivos de alta complejidad**: `MultiAgentDemo` (solución AI Agents) y `NovusDevFrameworkDemo` (modal en Hero). El delta desde `e3a9819` introduce la simulación del framework NADF en landing, rediseña la sección de testimonios/casos bancarios y refina triggers de navegación. La traducción al frontend productivo requiere **reimplementar la intención visual y funcional** sin copiar código, adaptando routing (TanStack → React Router) y tokens al design system existente.

---

## Delta reciente (e3a9819 → 20d79e1)

| Cambio | Componente | Impacto WEB | Prioridad |
|--------|------------|-------------|-----------|
| CHG-014 | NovusDevFrameworkDemo | Nuevo modal con simulación animada de 9 pasos | **Alta** |
| CHG-015 | Hero demo triggers | CTA secundario + logo clickeable + evento custom | Alta |
| CHG-016 | Testimonials | Sección clara contrastante, tarjetas contact-card | Media |
| CHG-017 | Bank logos | Assets CDN Lovable → assets reales en WEB | Baja |
| CHG-018 | notify-nadf.yml | Solo CI/orquestación; sin impacto WEB directo | N/A |

---

## Alcance de impacto por sección

| Sección Lovable | Ruta Lovable | Ruta WEB esperada | Prioridad | Complejidad |
|-----------------|--------------|-------------------|-----------|-------------|
| Landing / Hero | `/` | `/` | Alta | **Alta** (por demo modal) |
| Header / Footer | Layout | Layout compartido | Alta | Media |
| Servicios (5 pilares) | `/services` | `/services` o sección `/` | Alta | Baja |
| Soluciones (grid) | `/solutions` | `/services` o `/solutions` | Alta | Baja |
| Detalle solución | `/solutions/$slug` | `/solutions/:slug` | Alta | Media |
| MultiAgentDemo | `/solutions/ai-agents` | `/solutions/ai-agents` | Alta | **Alta** |
| NovusDevFrameworkDemo | `/` (modal) | `/` (modal/dialog) | Alta | **Alta** |
| Nosotros | `/about` | `/about` | Alta | Baja |
| Casos de éxito | `/cases` | `/cases` o sección | Media | Media |
| Contacto | `/contact` | `/contact` | Alta | Media |
| Páginas legales | `/privacy`, `/data-treatment`, `/terms` | Rutas equivalentes | Media | Baja |

---

## Cambios visuales a traducir

### Design system (CHG-002)

- **Paleta:** navy profundo como fondo, cyan neón como primary, púrpura como secondary/accent. Todos en oklch.
- **Tipografía:** Space Grotesk para headings, Inter para body.
- **Utilities a replicar conceptualmente:** gradientes de marca, sombras glow, grid background, animaciones pulse/float.
- **Prohibido:** copiar `src/styles.css` literal ni clases Tailwind de Lovable.

### Layout (CHG-003)

- Header sticky con blur, navegación de 6 ítems, CTA persistente y menú móvil.
- Footer con contacto, redes (LinkedIn, Instagram, Facebook) y enlaces legales (`nav.legal`).
- PageShell como wrapper consistente con Toaster/notificaciones.

### Hero actualizado (CHG-004, CHG-015)

- Badge, headline gradiente, stats inline y logo animado.
- **Nuevo:** CTA secundario "Ver simulación" (no navega; abre modal).
- **Nuevo:** Logo clickeable con `aria-label` y hover scale.
- **Nuevo:** Listener de evento `novus:open-dev-framework` desde Header.

### Testimonials rediseñado (CHG-016, CHG-017)

- Sección con **fondo claro** que contrasta con el resto dark-first del sitio.
- Tarjetas estilo contact-card: logo 80×80, industria, cliente, país, sitio web.
- Logos vía `.asset.json` de Lovable CDN — en productivo usar assets en `/public` o CDN propio.
- Hover con `-translate-y-1` y sombra elevada.

### Secciones landing restantes (CHG-006)

- Grids de servicios y soluciones con cards hover.
- CTA reutilizable al final de páginas.

---

## Cambios funcionales a traducir

### NovusDevFrameworkDemo (CHG-014) — Nueva alta complejidad

- Modal Dialog (shadcn) con grid de 4 columnas: Triggers, Framework, Agentes, Entregables.
- Simulación de 9 pasos con auto-advance cada 1.2s, controles play/pausa/reset.
- Log panel con mensajes secuenciales del flujo Lovable → NADF → deploy.
- Estado React: `step`, `playing`, `open` controlado desde Hero.
- **Recomendación:** componente aislado con props `open`/`onOpenChange`; respetar `prefers-reduced-motion`.
- **No copiar:** JSX del Dialog ni estilos inline de Lovable.

### MultiAgentDemo (CHG-009)

- Diagrama SVG con nodos, curvas Bézier, partículas animadas.
- Timeline de 8 pasos con controles play/pausa/step.
- Implementar como componente aislado en `/solutions/ai-agents`.

### Routing (CHG-010)

| Lovable (TanStack) | Productivo (React Router) |
|--------------------|---------------------------|
| `createFileRoute("/")` | `<Route path="/" />` |
| `src/routes/solutions.$slug.tsx` | `/solutions/:slug` con `useParams()` |
| `head()` meta tags | React Helmet o equivalente |
| `Link` de TanStack | `Link` de react-router-dom |
| `useRouterState` | `useLocation` / `useParams` |
| Evento custom `novus:open-dev-framework` | `CustomEvent` o state manager equivalente |

Referencia de mapeo: `novus-nexus/reglasEmpalme/port-map.yml`.

### Formulario de contacto (CHG-008)

- Campos: nombre*, empresa, email*, teléfono, solución de interés (select), mensaje*.
- Estados: submitting, done (pantalla de gracias), validación inline.
- Enlaces legales en pie del formulario a `/privacy` y `/data-treatment`.
- Integración con `POST /api/v1/contact` — **sin fallback demo en producción**.

### Páginas legales y About (CHG-012)

- Contenido estático extenso; traducir texto respetando `brand-context.md`.
- SEO: meta title/description por página.

---

## Componentes a crear o extender en NovusIntelligenceWEB

| Componente | Acción | Dependencias |
|------------|--------|--------------|
| `NovusDevFrameworkDemo` | Crear (nuevo) | Dialog, Button, iconos Lucide |
| `MultiAgentDemo` | Crear | SVG custom, animaciones CSS |
| `Testimonials` / CasesSection | Actualizar diseño | Assets logos bancarios reales |
| `Hero` | Actualizar CTAs y triggers | NovusDevFrameworkDemo |
| `Header` | Añadir handler evento demo | CustomEvent o context |
| `ContactForm` | Crear/actualizar | API contact, toast |
| Layout (Header/Footer) | Actualizar nav legal | site content module |
| Páginas legales | Crear rutas | Contenido estático |

---

## Paridad visual (ADR-0006)

Rutas obligatorias para `visual-parity-agent`:

- `/` (incluye modal abierto en viewport de prueba)
- `/about`
- `/services`
- `/contact`

Viewports: 1440×900, 768×1024, 390×844.

**Nota:** La sección Testimonials con fondo claro es un contraste intencional que debe replicarse exactamente.

---

## Restricciones NADF aplicables

- **NO_LOVABLE_CODE_COPY:** Traducir intención, no JSX/CSS literal.
- **NO_MOCK_DATA:** Contenido de `site.ts`, `cases.ts`, etc. es estático válido; no replicar `VITE_DEMO_MODE` en contacto.
- **NO_PRODUCTIVE_CODE:** Este agente solo produce artifacts; la implementación corresponde a `frontend-integration-agent`.

---

## Próximo agente

**planner-agent** debe usar este artifact junto con `cambios-lovable.json` para generar `plan-implementacion.md`, priorizando NovusDevFrameworkDemo y Testimonials en el delta reciente.
