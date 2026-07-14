# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `f97e53e`  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable define un **sitio corporativo B2B completo** con design system dark-first (navy + cyan + púrpura), 10 rutas navegables y **dos componentes interactivos de simulación**: `MultiAgentDemo` en `/solutions/ai-agents` y el nuevo `NovusDevFrameworkDemo` modal en la landing. El delta del commit `f97e53e` introduce la simulación del framework NADF directamente en el Hero, cambiando el CTA secundario y añadiendo triggers cruzados con el Header. La traducción al frontend productivo requiere **reimplementar la intención visual y funcional** sin copiar código.

---

## Delta reciente (commit f97e53e)

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `NovusDevFrameworkDemo.tsx` | Nuevo (~467 líneas) | **Alta** — modal interactivo en landing |
| `Hero.tsx` | CTA, logo clickeable, integración modal | **Alta** — cambia flujo de navegación en home |
| `Header.tsx` | CustomEvent al re-clicar Home en `/` | **Media** — acoplamiento evento global |
| `package.json` | Bump dev dep Lovable 2.7.0→2.7.1 | **Ninguno** en productivo |
| `notify-nadf.yml` | CI dispatch a Framework | **Ninguno** en frontend WEB |

---

## Alcance de impacto por sección

| Sección Lovable | Ruta Lovable | Ruta WEB esperada | Prioridad | Complejidad |
|-----------------|--------------|-------------------|-----------|-------------|
| Landing / Hero | `/` | `/` | Alta | **Alta** (nuevo modal) |
| NovusDevFrameworkDemo | `/` (modal) | `/` (modal/dialog) | Alta | **Alta** |
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
- **Tipografía:** Space Grotesk para headings, Inter para body.
- **Utilities a replicar conceptualmente:** gradientes de marca, sombras glow, grid background, animaciones pulse/float.
- **Prohibido:** copiar `src/styles.css` literal ni clases Tailwind de Lovable.

### Layout (CHG-003)

- Header sticky con blur, navegación de 6 ítems, CTA persistente y menú móvil.
- Footer con contacto, redes (LinkedIn, Instagram, Facebook) y enlaces legales.
- PageShell como wrapper consistente con Toaster/notificaciones.

### Hero actualizado (CHG-004, CHG-015)

- Badge, headline gradiente, dual CTA: **primario** "Agenda una demo" (sin cambio), **secundario** ahora "Ver simulación" (antes "Ver soluciones").
- Logo animado convertido en `<button>` con overlay "Click para simular el framework" y hover scale.
- **Nota de planificación:** evaluar si mantener link a `/solutions` además del botón de simulación, o reubicar acceso a soluciones en otra sección.

### NovusDevFrameworkDemo (CHG-014) — Nueva alta complejidad

- **Modal Dialog** (`max-w-6xl`) con header gradiente y descripción del framework.
- **Grid 4 columnas** en desktop: Triggers (4 ítems) → Framework (canvas SVG mini) → Agentes IA (4) → Entregables (4).
- **9 pasos** con auto-advance cada 1.2s; log panel monospace; barra de progreso segmentada clickeable.
- **Controles:** play/pausa, reiniciar; estado `finished` revela tarjeta "Producto entregado" (Lead Manager B2B MVP).
- **SVG inline:** edges con gradiente oklch, `animateMotion` en partículas cuando `playing`.
- **Recomendación:** lazy-load del modal; `prefers-reduced-motion`; no usar `window.CustomEvent` en productivo — preferir React context o callback props entre Header/Hero.

### MultiAgentDemo (CHG-009)

- Diagrama SVG con nodos, curvas Bézier, partículas animadas, timeline de 8 pasos.
- Implementar como componente aislado solo en `/solutions/ai-agents`.
- **No copiar:** SVG inline ni clases de Lovable.

### Secciones landing (CHG-006)

- Grids de servicios y soluciones con cards hover.
- Testimonials, CTA reutilizable.

---

## Cambios funcionales a traducir

### Routing (CHG-010)

| Lovable (TanStack) | Productivo (React Router) |
|--------------------|---------------------------|
| `createFileRoute("/")` | `<Route path="/" />` |
| `src/routes/solutions.$slug.tsx` | `/solutions/:slug` con `useParams()` |
| `head()` meta tags | React Helmet o equivalente |
| `Link` de TanStack | `Link` de react-router-dom |

Referencia: `novus-nexus/reglasEmpalme/port-map.yml`.

### Triggers de simulación (CHG-015)

| Trigger Lovable | Traducción sugerida en WEB |
|---------------|----------------------------|
| Botón "Ver simulación" en Hero | `onClick` → abrir Dialog |
| Click en logo Hero | Mismo handler |
| `CustomEvent('novus:open-dev-framework')` desde Header | Context API o prop drilling; evitar eventos globales window |
| Re-clic Home en `/` abre modal | Comportamiento opcional; validar UX con stakeholder |

### Formulario de contacto (CHG-008)

- Campos: name*, company, email*, phone, solutionInterest, message*.
- Integración API real (`VITE_NOVUS_API_URL`); **sin modo demo en producción**.

### Páginas dinámicas (CHG-007)

- Loader por slug, query param `interest`, soluciones relacionadas.

---

## Contenido a sincronizar (CHG-005)

Validar coherencia con:

- `.nadf/projects/novus-intelligence/memory/brand-context.md`
- `.nadf/projects/novus-intelligence/memory/business-context.md` (si existe)

**Contenido demo hardcoded en NovusDevFrameworkDemo (no productivo):**

- Producto ficticio: "Lead Manager B2B — MVP funcional"
- URL ficticia: `leadmgr.novus.dev`
- Tiempo estimado: "~9 min"
- Stack tags: TanStack Start, shadcn/ui, AWS Lambda, Postgres, CI/CD

Este contenido es **educativo/demostrativo**; en producción puede adaptarse al caso real de Novus Intelligence sin inventar URLs.

---

## Componentes reutilizables sugeridos

| Componente Lovable (intención) | Acción en WEB |
|--------------------------------|---------------|
| Hero | Actualizar CTAs y triggers de simulación |
| NovusDevFrameworkDemo | **Nuevo** — modal en landing |
| MultiAgentDemo | Nuevo — página ai-agents |
| ServicesGrid / SolutionsGrid | Nuevo |
| CTA | Extraer como compartido |
| NovusLogo | Verificar existente |

---

## Dependencias y stack

| Lovable | Productivo | Acción |
|---------|------------|--------|
| TanStack Router/Start | React Router | Traducir rutas |
| shadcn/ui Dialog | Verificar en WEB | Reutilizar si existe |
| lucide-react | Probablemente en WEB | Reutilizar iconos |
| CustomEvent window | React Context | Refactorizar patrón |

---

## Estimación de esfuerzo relativo

| Área | Esfuerzo | Notas |
|------|----------|-------|
| NovusDevFrameworkDemo | **Muy alto** | ~467 líneas; modal + SVG + estado |
| Hero + triggers | Alto | Cambio de CTA y acoplamiento Header |
| MultiAgentDemo | Alto | SVG + animaciones |
| Design tokens + layout | Alto | Base del sitio |
| Landing (resto secciones) | Alto | 6 secciones adicionales |
| Contacto | Medio | Depende de API backend |
| Páginas estáticas | Medio | Contenido textual |

---

## Restricciones NADF aplicables

- **NO_LOVABLE_CODE_COPY:** Reimplementar intención, no JSX/CSS literal.
- **NO_PRODUCTIVE_CODE:** Este agente no implementa; solo documenta impacto.
- Contenido demo ficticio no debe publicarse como producto real en producción.

---

## Próximo agente

**planner-agent** debe priorizar `NovusDevFrameworkDemo` y la actualización del Hero en el plan de implementación, junto con `MultiAgentDemo` y el formulario de contacto.
