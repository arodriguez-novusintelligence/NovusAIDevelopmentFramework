# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `719ea6b` (delta: `e3a9819..719ea6b`)  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-15  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

Desde el análisis anterior (`e3a9819`), Lovable introdujo **tres áreas de impacto principal** en frontend productivo:

1. **Tema claro en contacto** — variante `contact-light` con tokens semánticos locales y gradiente radial.
2. **Sección Testimonials rediseñada** — contraste claro/oscuro, logos de clientes y tarjetas tipo contact card.
3. **Simulación NovusAIDevelopmentFramework** — modal interactivo en Hero con diagrama de 4 columnas y timeline de 9 pasos.

El resto del sitio (routing, design system dark-first, MultiAgentDemo en ai-agents, formulario funcional) permanece vigente del snapshot previo. La traducción sigue siendo **reimplementación de intención**, sin copiar JSX/CSS de Lovable.

---

## Delta reciente — impacto por cambio

| ID | Componente | Tipo | Prioridad | Complejidad | Acción en WEB |
|----|------------|------|-----------|-------------|---------------|
| CHG-014 | contact-light-theme | visual | Alta | Media | Crear variante de sección clara en `/contact`; mapear tokens al design system productivo |
| CHG-015 | Testimonials | visual | Media | Media | Rediseñar sección casos/landing con fondo claro y logos reales de clientes |
| CHG-016 | NovusDevFrameworkDemo | functional | Alta | **Alta** | Nuevo modal con simulación animada; componente aislado lazy-loaded |
| CHG-017 | Hero | functional | Media | Baja | Reemplazar CTA secundario; logo clickable abre demo |
| CHG-018 | Header | functional | Baja | Baja | Evento custom o state lift para abrir demo desde nav Inicio |
| CHG-019 | client-logos | content | Media | Baja | Copiar assets reales (permitido); no URLs CDN Lovable en prod |

---

## CHG-014: Variante clara en contacto

### Intención visual

- Contraste deliberado: el resto del sitio es dark-first; la sección de formulario usa **fondo claro** (oklch ~0.98) con cards blancas.
- Gradiente radial sutil con acentos cyan y púrpura en esquinas.
- Labels y títulos con `text-card-foreground` para legibilidad sobre fondo claro.
- Tarjeta "Partner principal" usa acento secondary (púrpura) en lugar de primary.

### Traducción recomendada

| Lovable | Productivo |
|---------|------------|
| `@utility contact-light` con override de CSS vars | Clase/variante en design system o wrapper `<ContactSection variant="light">` |
| `bg-gradient-light-radial` | Utility equivalente en Tailwind config o CSS module del proyecto |
| Valores oklch inline | Tokens semánticos: `--contact-bg`, `--contact-card`, etc. |

**Prohibido:** copiar bloque `@utility contact-light` literal de `src/styles.css`.

**Rutas de paridad visual:** `/contact` en viewports 1440×900, 768×1024, 390×844 (gate `visual_exact_parity`).

---

## CHG-015: Testimonials / casos de éxito

### Intención visual

- Sección con **fondo claro** que rompe el patrón oscuro de landing (similar estrategia a contacto).
- Tarjetas blancas con sombra suave, header con logo 80×80, industria, país (MapPin), sitio web (Globe).
- Hover: `-translate-y-1` y rotación de icono ArrowUpRight.
- Logos: Banco Santa Cruz (`bancosantacruz.com.do`), doevents (`doevents.com`).

### Traducción recomendada

- Usar assets reales del proyecto (PNG/JPG de logos); **no** hotlink a CDN Lovable.
- Mantener datos de `cases.ts` como fuente de contenido; validar contra memoria de marca.
- Considerar reutilizar tokens de la variante clara (contact-light) para consistencia entre secciones claras.

---

## CHG-016/017/018: NovusDevFrameworkDemo en Hero

### Intención funcional

- Modal Dialog fullscreen-ish (`max-w-6xl`) con simulación educativa del framework NADF.
- **4 columnas:** Triggers → NovusAIDevelopmentFramework (engine) → Agentes IA → Entregables.
- **9 pasos** auto-advance cada 1.2s; controles play/pausa/reiniciar; barra de progreso clickable.
- SVG mini-canvas estilo n8n con `animateMotion` en edges activos.
- Al finalizar: tarjeta "Producto entregado" (Lead Manager B2B MVP — contenido fictivo/demo).

### Puntos de entrada

| Trigger | Comportamiento |
|---------|----------------|
| Botón Hero "Ver simulación" | `setOpen(true)` |
| Click en logo Hero | Mismo modal |
| Nav "Inicio" estando en `/` | `CustomEvent('novus:open-dev-framework')` |

### Traducción recomendada

- Implementar como `NovusDevFrameworkDemo.tsx` aislado en NovusIntelligenceWEB.
- Usar Dialog/modal del design system productivo (no shadcn copiado de Lovable).
- Respetar `prefers-reduced-motion`: pausar SVG animateMotion y auto-advance.
- **Contenido del producto demo** ("Lead Manager B2B", "leadmgr.novus.dev") es ilustrativo — no implementar como producto real.
- Complejidad comparable a MultiAgentDemo (CHG-009); secuenciar en plan si recursos limitados.

---

## Impacto acumulado (snapshot + delta)

| Sección | Ruta | Estado vs Lovable | Prioridad |
|---------|------|---------------------|-----------|
| Landing / Hero | `/` | Delta: demo modal + CTA simulación | Alta |
| Testimonials | `/` (sección) | Delta: rediseño claro + logos | Media |
| Contacto | `/contact` | Delta: tema claro | Alta |
| MultiAgentDemo | `/solutions/ai-agents` | Sin cambios en delta | Alta |
| Resto del sitio | Varias | Sin cambios en delta | Según plan previo |

---

## Design tokens nuevos (referencia, no CSS literal)

```yaml
# Variante clara (contact + testimonials)
light-background: oklch(0.98 0.005 240)
light-background-end: oklch(0.94 0.01 245)
light-card: oklch(1 0 0)
light-foreground: oklch(0.16 0.04 264)
light-muted-foreground: oklch(0.35 0.02 265)
light-border: oklch(0.9 0.01 265)
radial-accent-cyan: oklch(0.82 0.16 220 / 0.15)
radial-accent-purple: oklch(0.65 0.22 295 / 0.12)
```

Referencia normativa: `novus-nexus/reglasDiseno/tokens.yml` (prohíbe tokens locales fuera de styles.css en Lovable; en WEB usar design system centralizado).

---

## Componentes a crear o extender

| Componente (intención) | Acción |
|------------------------|--------|
| ContactSection (variant light) | Nuevo o extender página contacto |
| TestimonialsSection | Rediseñar con variante clara |
| NovusDevFrameworkDemo | **Nuevo** — modal simulación framework |
| Hero | Actualizar CTAs y logo interactivo |
| Header | Wiring evento abrir demo |

---

## Restricciones NADF

- **NO_LOVABLE_CODE_COPY:** Traducir intención; no importar `@/components/sections/NovusDevFrameworkDemo` de novus-nexus.
- **NO_PRODUCTIVE_CODE:** Este agente solo documenta impacto.
- **NO_MOCK:** El contenido "Lead Manager B2B" del demo es narrativa educativa; no usar como datos productivos ni fixtures en rutas reales.

---

## Próximo agente

**planner-agent** debe priorizar en el plan:

1. Variante clara `/contact` (paridad visual gate).
2. Rediseño Testimonials con assets reales.
3. NovusDevFrameworkDemo (alta complejidad; puede ser fase 2 si bloquea contacto).
