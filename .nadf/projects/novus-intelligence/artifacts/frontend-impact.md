# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `749430f` (delta desde `e3a9819`)  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-15  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El delta incremental introduce **tres áreas de impacto frontend prioritarias**: (1) variante visual clara en la página de contacto, (2) nueva simulación interactiva `NovusDevFrameworkDemo` en el Hero de landing, y (3) rediseño de la sección Testimonials/casos con fondo claro y logos de clientes. Ningún cambio altera el contrato del formulario de contacto ni añade rutas nuevas. La traducción sigue exigiendo **reimplementar intención sin copiar código** de Lovable.

---

## Cambios del delta y su impacto

### 1. Contacto — variante light (CHG-014) — Prioridad alta

| Aspecto | Intención Lovable | Acción en NovusIntelligenceWEB |
|---------|-------------------|--------------------------------|
| Fondo sección | Gradiente claro con radiales cyan/púrpura sutiles | Crear variante de sección o theme scope equivalente en design system WEB |
| Cards | Fondo blanco, sombra card, texto navy | Traducir tokens semánticos light (no copiar `@utility contact-light`) |
| Labels formulario | `text-card-foreground` explícito | Asegurar contraste WCAG en inputs sobre fondo claro |
| Partner box | `border-secondary/30 bg-secondary/10` | Mantener jerarquía visual secondary vs primary |

**Rutas afectadas:** `/contact`  
**Paridad visual:** incluir en checklist de `visual-parity-agent` para viewport contacto.

### 2. NovusDevFrameworkDemo en Hero (CHG-015, CHG-017) — Prioridad alta

| Aspecto | Intención Lovable | Acción en NovusIntelligenceWEB |
|---------|-------------------|--------------------------------|
| Trigger | CTA "Ver simulación", logo clickeable, evento desde Header | Replicar tres puntos de entrada con patrón event bus o state lifting |
| UI | Modal Dialog 4 columnas, nodos con iconos, progreso animado | Componente aislado; usar modal del design system productivo |
| Simulación | 9 pasos, 1.2s/step, play/pausa/reset | Estado React local; respetar `prefers-reduced-motion` |
| Contenido | Flujo NADF: Lovable prompt → Framework → Agents → Deploy | Textos educativos; no implica backend real |

**Rutas afectadas:** `/`  
**Complejidad:** Alta — segundo componente interactivo educativo (además de `MultiAgentDemo` en `/solutions/ai-agents`).

### 3. Header — evento custom (CHG-016) — Prioridad baja

- Disparo de `novus:open-dev-framework` al clic en Inicio estando en `/`.
- En productivo: equivalente con callback/context o custom event documentado.
- Sin impacto visual directo.

### 4. Testimonials rediseñados (CHG-018, CHG-019) — Prioridad alta

| Aspecto | Intención Lovable | Acción en NovusIntelligenceWEB |
|---------|-------------------|--------------------------------|
| Contraste | Sección clara dentro de página oscura | Patrón "light band" reutilizable para otras secciones |
| Cards | Logo cliente + metadata + impact bullets | Consumir datos de `cases` / CMS; logos reales en assets |
| Estilos | oklch inline en style={{}} | **Traducir a tokens del design system** — no copiar inline styles |
| Hover | translate-y, rotate icon, sombra | Animaciones CSS/Tailwind del stack productivo |

**Rutas afectadas:** `/` (sección Testimonials en landing)  
**Assets requeridos:** logos Banco Santa Cruz y doevents (formato optimizado WebP/PNG).

### 5. CI notify-nadf (CHG-020) — Sin impacto frontend productivo

Workflow en repo Lovable; no requiere cambios en NovusIntelligenceWEB.

---

## Matriz de impacto actualizada

| Componente | Tipo | Ruta WEB | Prioridad | Complejidad | Nuevo en delta |
|------------|------|----------|-----------|-------------|----------------|
| Contact light theme | visual | `/contact` | Alta | Media | Sí |
| NovusDevFrameworkDemo | functional + visual | `/` | Alta | Alta | Sí |
| Hero CTAs | visual | `/` | Media | Baja | Sí |
| Testimonials/casos | visual + content | `/` | Alta | Media | Sí |
| Header event bridge | functional | `/` | Baja | Baja | Sí |
| MultiAgentDemo | functional | `/solutions/ai-agents` | Alta | Alta | No (snapshot previo) |
| Resto del sitio | varios | múltiples | Alta | Media–Alta | No (snapshot previo) |

---

## Design tokens a incorporar (referencia, no CSS literal)

### Variante light (contact + testimonials)

```
background-light: oklch(0.98 0.005 240)
card-light: oklch(1 0 0)
foreground-light: oklch(0.16 0.04 264)
muted-foreground-light: oklch(0.4 0.04 260)
gradient-light-radial: radial cyan 15% + radial purple 12% sobre base clara
```

### Mantener del snapshot previo

- Paleta dark-first navy + cyan + purple
- Space Grotesk / Inter
- Utilities: gradient-brand, shadow-glow, grid-bg, animate-novus-pulse/float

---

## Componentes productivos sugeridos (intención, no nombres Lovable)

| Intención | Ubicación WEB | Notas |
|-----------|---------------|-------|
| `ContactLightSection` | `/contact` | Scope de tokens light localizado |
| `FrameworkSimulationModal` | `/` Hero | Modal educativo; sin dependencia API |
| `ClientCaseCards` | `/` landing | Grid 2 cols, logos + impacto |
| `HeroSimulationTrigger` | `/` | Botón + logo interactivo |

---

## Quality gates afectados

| Gate | Estado esperado tras implementación |
|------|-----------------------------------|
| `no_lovable_code_copy` | Reimplementar utilities light y demo sin copiar TSX/CSS |
| `visual_exact_parity` | Añadir `/contact` y sección Testimonials en landing a rutas de paridad |
| `responsive_validation` | Modal demo y cards casos en 390px / 768px / 1440px |
| `no_mock_data_in_production` | Logos y contenido de casos deben ser assets reales |

---

## Dependencias downstream

1. **planner-agent** — priorizar delta (contact light, demo Hero, testimonials) sobre snapshot completo si WEB ya parcialmente implementado.
2. **frontend-integration-agent** — traducir sin copiar; dos demos interactivos requieren plan de componentes separados.
3. **visual-parity-agent** — validar contraste light sections vs dark page.

---

## Referencias

- Delta: `novus-nexus` commits `e3a9819..749430f`
- Snapshot previo: `artifacts/cambios-lovable.json` (baseline `e3a9819`, 13 cambios)
- Tokens: `novus-nexus/reglasDiseno/tokens.yml`
- Mapeo rutas: `novus-nexus/reglasEmpalme/port-map.yml`
