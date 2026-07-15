# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `61bb6d8`  
**Baseline anterior:** `e3a9819`  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-15  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

Desde el análisis previo (`e3a9819`), Lovable introdujo **8 cambios incrementales** centrados en tres áreas: (1) unificación visual de `/contact` con la paleta Navy Neón dark-first, (2) nuevo componente interactivo `NovusDevFrameworkDemo` en el Hero de landing, y (3) rediseño de la sección Testimonials con fondo claro contrastante y logos de clientes. No hay cambios funcionales en el formulario de contacto ni nuevas rutas.

---

## Delta por cambio

### CHG-014: Página de contacto — Navy Neón

| Aspecto | Intención Lovable | Acción en WEB |
|---------|-------------------|---------------|
| Sección formulario | Dark con `bg-gradient-section` + grid-bg | Replicar contraste dark coherente con resto del sitio |
| Tarjetas info | `bg-navy-elevated`, `shadow-elevated` | Traducir a tokens equivalentes del design system productivo |
| Inputs | `bg-navy-surface/50` | Aplicar fondo semitransparente en inputs del formulario |
| Partner card | `border-primary/20 bg-primary/10` | Usar primary (cyan) en lugar de secondary (púrpura) |

**Nota de diseño:** Entre commits intermedios la sección usó variante clara (`contact-light`); el estado final vuelve a dark. El frontend productivo debe implementar la versión **dark final** (commit `61bb6d8`), no la intermedia.

**Ruta afectada:** `/contact` — prioridad alta (gate visual_exact_parity).

---

### CHG-015/016/017: NovusDevFrameworkDemo en Hero

Nuevo componente modal de alta complejidad, distinto del `MultiAgentDemo` en `/solutions/ai-agents`:

| Característica | Detalle |
|----------------|---------|
| Ubicación | Hero de landing (`/`) |
| Trigger | Botón "Ver simulación", logo clickable, click en "Inicio" del Header cuando ya en `/` |
| UI | Dialog shadcn con 4 columnas, 9 pasos, SVG animado, log panel |
| Estado | step, playing, auto-advance 1200ms, play/pause/reset |
| Evento | `CustomEvent('novus:open-dev-framework')` |

**Complejidad:** Alta — similar a MultiAgentDemo pero con Dialog, columnas responsivas y contenido educativo del framework NADF.

**Recomendaciones de traducción:**
- Implementar como componente lazy-loaded (`React.lazy`) para no penalizar LCP del Hero.
- Respetar `prefers-reduced-motion`: pausar animaciones SVG y auto-advance.
- No copiar JSX/CSS literal; traducir la intención del diagrama de 4 columnas.
- El evento custom puede mapearse a React Context o callback prop en el layout productivo.

---

### CHG-018/019: Testimonials rediseñados

| Aspecto | Intención Lovable | Acción en WEB |
|---------|-------------------|---------------|
| Fondo sección | Claro contrastante (oklch inline) vs resto dark | Sección light band en landing — decisión de contraste intencional |
| Tarjetas | Estilo contact-card blanco, rounded-3xl, hover -translate-y-1 | Replicar jerarquía visual sin inline styles oklch |
| Logos clientes | banco-santa-cruz.png, doevents.jpg vía asset.json | Copiar **assets reales** (permitido); no copiar código |
| Metadata | País, sitio web con iconos MapPin/Globe | Mantener datos de `cases.ts` |

**Assets a sincronizar:**
- `src/assets/logos/banco-santa-cruz.png.asset.json` → URL del logo
- `src/assets/logos/doevents.jpg.asset.json` → URL del logo

---

### CHG-020: Utility bg-gradient-section

Nueva utility CSS para secciones dark intermedias. El frontend productivo debe:
- Mapear semánticamente a token/utility equivalente (gradiente navy con acentos cyan/purple).
- No copiar bloque CSS literal de `styles.css`.

---

## Alcance de impacto actualizado

| Sección | Delta | Prioridad | Complejidad |
|---------|-------|-----------|-------------|
| `/contact` | Paleta dark unificada | Alta | Baja |
| Hero `/` | NovusDevFrameworkDemo + triggers | Alta | **Alta** |
| Testimonials (landing) | Rediseño light + logos | Media | Media |
| Header | Evento demo en nav Inicio | Baja | Baja |
| Design tokens | bg-gradient-section | Baja | Baja |

---

## Rutas en gate visual_exact_parity

Según `project-context.yml`, validar paridad en:
- `/` — **actualizado:** incluir modal NovusDevFrameworkDemo (estado abierto para captura)
- `/contact` — **actualizado:** nueva paleta dark en sección formulario
- `/about`, `/services` — sin cambios en este delta

---

## Componentes reutilizables — actualización

| Componente Lovable (intención) | Estado previo | Acción delta |
|--------------------------------|---------------|--------------|
| NovusDevFrameworkDemo | Nuevo | Crear componente aislado en landing |
| Testimonials | Existía (dark cards) | **Rediseñar** a variante light con logos |
| Contact form layout | Existía | Actualizar tokens visuales, sin cambio funcional |
| Hero CTA secundario | Link a /solutions | Cambiar a trigger de demo |

---

## Dependencias sin cambio

- Formulario contacto: misma integración `submitContact()` → `POST /api/v1/contact`
- Routing: sin rutas nuevas
- MultiAgentDemo en `/solutions/ai-agents`: sin cambios en este delta

---

## Restricciones NADF aplicables

- **NO_LOVABLE_CODE_COPY:** Reimplementar intención; especialmente evitar copiar inline oklch de Testimonials y SVG de NovusDevFrameworkDemo.
- **NO_PRODUCTIVE_CODE:** Este agente solo documenta impacto.
- **NO_MOCK_IN_PRODUCTION:** El fallback demo en `contact.ts` sigue siendo riesgo R-001 del análisis previo.

---

## Próximo agente

**planner-agent** debe incorporar CHG-015 (NovusDevFrameworkDemo) como tarea de alta complejidad y CHG-014/018 como tareas de paridad visual en `/contact` y landing Testimonials.
