# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `746c129`  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent  
**Delta desde:** `e3a9819` (6 commits, 9 archivos)

---

## Resumen ejecutivo

El prototipo Lovable define un **sitio corporativo B2B completo** con design system dark-first (navy + cyan + púrpura), 10 rutas navegables y dos componentes interactivos de alta complejidad: `MultiAgentDemo` (solución AI Agents) y `NovusDevFrameworkDemo` (modal en landing). El delta más reciente introduce un **rediseño visual significativo** de la sección Testimonials (fondo claro contrastante, tarjetas tipo contacto con logos) y cambia la interacción del Hero hacia una simulación del framework NADF.

---

## Delta reciente (commits `dd9f5e2` → `746c129`)

| Cambio | Tipo | Impacto WEB | Prioridad |
|--------|------|-------------|-----------|
| CHG-014 NovusDevFrameworkDemo | Funcional + visual | Nuevo modal con diagrama 4 columnas, 9 pasos, controles play/pausa | **Alta** |
| CHG-015 Hero CTA/interacción | Funcional | CTA secundario abre modal; logo clickeable; evento custom | Alta |
| CHG-016 Header home trigger | Funcional | Click en Inicio en `/` abre modal | Media |
| CHG-017 Testimonials redesign | Visual | Sección clara, tarjetas blancas, layout contacto | **Alta** |
| CHG-018 Logos clientes CDN | Contenido + assets | Requiere assets reales en WEB, no URLs Lovable | Alta |
| CHG-019 CI notify-nadf | Estructural | Sin impacto directo en código WEB | N/A |

---

## Alcance de impacto por sección

| Sección Lovable | Ruta Lovable | Ruta WEB esperada | Prioridad | Complejidad |
|-----------------|--------------|-------------------|-----------|-------------|
| Landing / Hero | `/` | `/` | Alta | **Alta** (modal demo) |
| Header / Footer | Layout | Layout compartido | Alta | Media |
| Testimonials / Casos | `/` (sección) | `/` o `/cases` | Alta | **Alta** (rediseño) |
| Servicios (5 pilares) | `/services` | `/services` | Alta | Baja |
| Soluciones (grid) | `/solutions` | `/solutions` | Alta | Baja |
| Detalle solución | `/solutions/$slug` | `/solutions/:slug` | Alta | Media |
| MultiAgentDemo | `/solutions/ai-agents` | `/solutions/ai-agents` | Alta | **Alta** |
| NovusDevFrameworkDemo | `/` (modal) | `/` (modal) | Alta | **Alta** |
| Nosotros | `/about` | `/about` | Alta | Baja |
| Contacto | `/contact` | `/contact` | Alta | Media |
| Páginas legales | `/privacy`, etc. | Rutas equivalentes | Media | Baja |

---

## Cambios visuales a traducir

### Design system (CHG-002)

- **Paleta:** navy profundo como fondo, cyan neón como primary, púrpura como secondary/accent. Todos en oklch.
- **Tipografía:** Space Grotesk para headings, Inter para body.
- **Utilities a replicar conceptualmente:** gradientes de marca, sombras glow, grid background, animaciones pulse/float.
- **Prohibido:** copiar `src/styles.css` literal ni clases Tailwind de Lovable.

### Testimonials redesign (CHG-017) — Nuevo en delta

- **Contraste de sección:** fondo claro (oklch 0.98→0.94) rompe el dark-first del resto de la página; debe replicarse exactamente para paridad visual (ADR-0006).
- **Tarjetas:** fondo blanco, `rounded-3xl`, sombra multicapa, hover `-translate-y-1`.
- **Encabezado tipo contacto:** logo 80×80px en contenedor con borde inset, industria en uppercase, nombre cliente, país con MapPin, website con Globe.
- **Estilos inline oklch:** Lovable usa `style={{}}` en lugar de tokens CSS; traducir a variables del design system WEB.
- **Icono ArrowUpRight:** badge circular con gradiente, rotación 45° en hover.

### Layout (CHG-003, CHG-016)

- Header sticky con blur, navegación de 6 ítems, CTA persistente y menú móvil.
- **Nuevo:** click en Inicio cuando pathname es `/` debe abrir modal demo (evento custom o estado compartido).
- Footer con contacto, redes y enlaces legales.

### Hero (CHG-004, CHG-015)

- Badge "Building Autonomous Intelligence", headline gradiente, stats inline.
- **Cambio:** CTA secundario es "Ver simulación" (no link a /solutions).
- Logo animado es botón accesible que abre modal.
- Integración con NovusDevFrameworkDemo vía estado React + CustomEvent.

### NovusDevFrameworkDemo (CHG-014) — Nuevo en delta

- Modal Dialog (shadcn) con diagrama de 4 columnas: Triggers, Framework, Agentes, Entregables.
- 9 pasos con log panel, highlight de items activos, conectores animados.
- Controles: Play, Pause, Reset, indicadores de progreso.
- **Recomendación:** componente aislado con props `open`/`onOpenChange`; respetar `prefers-reduced-motion`.
- **No copiar:** JSX/CSS literal; traducir intención del diagrama y flujo educativo.

### MultiAgentDemo (CHG-009)

- Diagrama SVG con nodos, curvas Bézier, partículas animadas.
- Estado React con timeline de 8 pasos.
- Permanece en `/solutions/ai-agents`; distinto de NovusDevFrameworkDemo (landing).

---

## Cambios funcionales a traducir

### Evento custom (CHG-015, CHG-016)

```text
Evento: novus:open-dev-framework
Emisores: Hero (CTA + logo), Header (click Inicio en /)
Receptor: componente modal demo
```

En React Router: usar Context o estado elevado en layout; no depender de `window.dispatchEvent` en producción si hay alternativa más idiomática.

### Routing (CHG-010)

| Lovable (TanStack) | Productivo (React Router) |
|--------------------|---------------------------|
| `createFileRoute("/")` | `<Route path="/" />` |
| `src/routes/solutions.$slug.tsx` | `/solutions/:slug` |
| `Link` de TanStack | `Link` de react-router-dom |
| `useRouterState` | `useLocation` |

### Formulario de contacto (CHG-008)

- Campos: name, company, email, phone, solutionInterest, message.
- Estados: idle → submitting → done/error.
- Conectar a `POST /api/v1/contact` real; **sin fallback demo**.

### Assets de clientes (CHG-018)

- Lovable usa URLs `/__l5e/assets-v1/...` (CDN interno).
- WEB productivo debe alojar logos en `public/assets/clients/` o CDN propio.
- Obtener archivos originales (banco-santa-cruz.png, doevents.jpg) fuera del prototipo Lovable.

---

## Componentes a crear o modificar en NovusIntelligenceWEB

| Componente WEB | Origen Lovable | Acción |
|----------------|----------------|--------|
| `NovusDevFrameworkDemo` | `NovusDevFrameworkDemo.tsx` | **Crear** (alta complejidad) |
| `TestimonialsSection` | `Testimonials.tsx` | **Rediseñar** (paridad sección clara) |
| `HeroSection` | `Hero.tsx` | **Modificar** (CTA + modal trigger) |
| `SiteHeader` | `Header.tsx` | **Modificar** (home click handler) |
| `MultiAgentDemo` | `MultiAgentDemo.tsx` | Crear (si no existe) |
| `ContactForm` | `contact.tsx` | Crear/modificar |
| Layout, Footer, grids | Varios | Crear según plan |

---

## Quality gates aplicables

- [ ] `no_lovable_code_copy` — reimplementar intención, no copiar JSX/CSS
- [ ] `visual_exact_parity` — Testimonials claro + Hero modal + resto de rutas
- [ ] `responsive_validation` — modal demo y tarjetas en 390/768/1440
- [ ] `no_mock_data_in_production` — logos y API reales

---

## Dependencias downstream

| Agente | Input de este artefacto |
|--------|-------------------------|
| planner-agent | Priorizar CHG-014, CHG-017, CHG-015 en plan |
| frontend-integration-agent | Implementar modal demo y Testimonials |
| visual-parity-agent | Validar sección clara y modal en 3 viewports |
| backend-impact-agent | Sin cambios (contacto ya documentado) |
