<!-- NADF-GUIDE
Propósito: Documenta Impacto Frontend — Análisis Lovable (paso-01).
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `e3a9819`  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable define un **sitio corporativo B2B completo** con design system dark-first (navy + cyan + púrpura), 10 rutas navegables y un componente interactivo nuevo (`MultiAgentDemo`) en la solución AI Agents. La traducción al frontend productivo requiere **reimplementar la intención visual y funcional** sin copiar código, adaptando routing (TanStack → React Router) y tokens al design system existente de NovusIntelligenceWEB.

---

## Alcance de impacto por sección

| Sección Lovable | Ruta Lovable | Ruta WEB esperada | Prioridad | Complejidad |
|-----------------|--------------|-------------------|-----------|-------------|
| Landing / Hero | `/` | `/` | Alta | Media |
| Header / Footer | Layout | Layout compartido | Alta | Media |
| Servicios (5 pilares) | `/services` | `/services` o sección `/` | Alta | Baja |
| Soluciones (grid) | `/solutions` | `/services` o `/solutions` | Alta | Baja |
| Detalle solución | `/solutions/$slug` | `/solutions/:slug` | Alta | Media |
| MultiAgentDemo | `/solutions/ai-agents` | `/solutions/ai-agents` | Alta | **Alta** |
| Nosotros | `/about` | `/about` | Alta | Baja |
| Casos de éxito | `/cases` | `/cases` o sección | Media | Baja |
| Contacto | `/contact` | `/contact` | Alta | Media |
| Páginas legales | `/privacy`, `/data-treatment`, `/terms` | Rutas equivalentes | Media | Baja |

---

## Cambios visuales a traducir

### Design system (CHG-002)

- **Paleta:** navy profundo como fondo, cyan neón como primary, púrpura como secondary/accent. Todos en oklch.
- **Tipografía:** Space Grotesk para headings, Inter para body. Verificar si NovusIntelligenceWEB ya las incluye; si no, añadir vía Google Fonts o self-host.
- **Utilities a replicar conceptualmente:** gradientes de marca, sombras glow, grid background, animaciones pulse/float.
- **Prohibido:** copiar `src/styles.css` literal ni clases Tailwind de Lovable.

### Layout (CHG-003)

- Header sticky con blur, navegación de 6 ítems, CTA persistente y menú móvil.
- Footer con contacto, redes (LinkedIn, Instagram, Facebook) y enlaces legales.
- PageShell como wrapper consistente con Toaster/notificaciones.

### Secciones landing (CHG-004, CHG-006)

- Hero con badge, headline gradiente, dual CTA, stats inline y logo animado.
- Grids de servicios y soluciones con cards hover (translate, border glow).
- Testimonials reutilizando datos de `cases.ts`.
- CTA reutilizable al final de páginas.

### MultiAgentDemo (CHG-009) — Mayor complejidad

- Diagrama SVG con nodos posicionados en porcentajes, curvas Bézier, partículas animadas (`animateMotion`).
- Estado React: step, playing, timeline de 8 pasos con auto-advance cada 1.8s.
- Controles: play/pause, step manual, indicadores de progreso.
- **Recomendación:** implementar como componente aislado con props; considerar `prefers-reduced-motion` para accesibilidad.
- **No copiar:** el SVG inline ni las clases de Lovable; traducir la intención del diagrama.

---

## Cambios funcionales a traducir

### Routing (CHG-010)

| Lovable (TanStack) | Productivo (React Router) |
|--------------------|---------------------------|
| `createFileRoute("/")` | `<Route path="/" />` |
| `src/routes/solutions.$slug.tsx` | `/solutions/:slug` con `useParams()` |
| `head()` meta tags | React Helmet o equivalente |
| `Link` de TanStack | `Link` de react-router-dom |
| `useRouterState` | `useLocation` / `useParams` |

Referencia de mapeo: `novus-nexus/reglasEmpalme/port-map.yml`.

### Formulario de contacto (CHG-008)

- Campos: name*, company, email*, phone, solutionInterest (select), message*.
- Estados: idle → submitting → done (con opción "enviar otro").
- Validación client-side antes de submit.
- Integración con API real (`VITE_NOVUS_API_URL`); **sin modo demo en producción**.

### Páginas dinámicas (CHG-007)

- Loader de solución por slug con 404 custom.
- Query param `interest` en link desde detalle → contacto.
- Sección "También te puede interesar" con 3 soluciones relacionadas.

---

## Contenido a sincronizar (CHG-005)

Los archivos `src/content/` de Lovable son la fuente de intención de contenido. El planner debe validar coherencia con:

- `.nadf/projects/novus-intelligence/memory/brand-context.md`
- `.nadf/projects/novus-intelligence/memory/business-context.md` (si existe)

Datos clave detectados en Lovable:

- **Founder:** Andrés D. Rodríguez Vargas, Founder & CEO
- **Contacto:** arodriguez@novusintelligencesolutions.com, +57 302 757 6511, Bogotá
- **6 soluciones:** ai-agents, automation, integrations, analytics, documents-ai, customer-ai
- **2 casos:** Banco Santa Cruz, doevents.com

---

## Componentes reutilizables sugeridos

| Componente Lovable (intención) | Acción en WEB |
|--------------------------------|---------------|
| Hero | Nuevo o extender existente |
| ServicesGrid | Nuevo |
| SolutionsGrid | Nuevo |
| MultiAgentDemo | Nuevo (alta prioridad para ai-agents) |
| CTA | Extraer como componente compartido |
| NovusLogo | Verificar existente; adaptar si difiere |
| PageShell | Extender layout actual |

---

## Dependencias y stack

| Lovable | Productivo | Acción |
|---------|------------|--------|
| TanStack Router/Start | React Router | Traducir rutas |
| shadcn/ui | Verificar en WEB | Reutilizar si existe; no copiar de Lovable |
| lucide-react | Probablemente ya en WEB | Reutilizar iconos |
| sonner (toast) | Verificar en WEB | Equivalente o alternativa |
| @tanstack/react-query | Verificar necesidad | Solo si se usa en WEB |

---

## SEO y meta

Cada ruta Lovable define `head()` con title, description y og:*. El frontend productivo debe replicar:

- Titles por página (ej. "Novus Intelligence Solutions — Inteligencia que genera resultados")
- Descriptions orientadas a IA/multiagente
- OG image: `/assets/novus/brand-publicidad.png`

---

## Estimación de esfuerzo relativo

| Área | Esfuerzo | Notas |
|------|----------|-------|
| Design tokens + layout | Alto | Base para todo el sitio |
| Landing completa | Alto | 7 secciones |
| Páginas estáticas (about, legal) | Medio | Contenido mayormente textual |
| Soluciones + detalle | Medio | 6 slugs + routing dinámico |
| MultiAgentDemo | Alto | SVG + animaciones + estado |
| Contacto | Medio | Depende de API backend |
| Assets | Bajo | Copiar assets reales (no código) |

---

## Restricciones NADF aplicables

- **NO_LOVABLE_CODE_COPY:** Reimplementar intención, no JSX/CSS literal.
- **NO_PRODUCTIVE_CODE:** Este agente no implementa; solo documenta impacto.
- Contenido debe alinearse con memoria de marca, no con placeholders Lovable.

---

## Próximo agente

**planner-agent** debe usar este documento junto con `cambios-lovable.json` y `backend-impact.md` para generar `plan-implementacion.md`.
