# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `dd9f5e2`  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable mantiene un **sitio corporativo B2B completo** con design system dark-first y 10 rutas navegables. Desde el baseline anterior (`e3a9819`) se añadió **`NovusDevFrameworkDemo`**: un modal interactivo en el Hero que simula el flujo NADF multiagente. El último commit (`dd9f5e2`) **simplifica el Hero** eliminando el badge overlay sobre el logo, manteniendo la simulación accesible por botón y click en logo.

La traducción al frontend productivo requiere **reimplementar la intención visual y funcional** sin copiar código, adaptando routing (TanStack → React Router) y tokens al design system existente.

---

## Delta reciente (dd9f5e2)

| Cambio | Tipo | Impacto WEB |
|--------|------|-------------|
| Eliminación badge overlay en logo | Visual (CHG-017) | Hero productivo sin pill "Click para simular"; conservar affordance vía hover scale y botón "Ver simulación" |
| NovusDevFrameworkDemo en Hero | Funcional (CHG-014) | Nuevo componente modal a traducir; alta complejidad (~467 líneas de intención) |
| CTA secundario → "Ver simulación" | Funcional (CHG-015) | Reemplazar "Ver soluciones" por acción que abre modal educativo |
| Header dispara evento demo | Funcional (CHG-016) | Patrón CustomEvent; traducir a contexto React o estado global ligero |

---

## Alcance de impacto por sección

| Sección Lovable | Ruta Lovable | Ruta WEB esperada | Prioridad | Complejidad |
|-----------------|--------------|-------------------|-----------|-------------|
| Landing / Hero | `/` | `/` | Alta | **Alta** (demo modal) |
| Header / Footer | Layout | Layout compartido | Alta | Media |
| Servicios (5 pilares) | `/services` | `/services` o sección `/` | Alta | Baja |
| Soluciones (grid) | `/solutions` | `/services` o `/solutions` | Alta | Baja |
| Detalle solución | `/solutions/$slug` | `/solutions/:slug` | Alta | Media |
| MultiAgentDemo | `/solutions/ai-agents` | `/solutions/ai-agents` | Alta | **Alta** |
| NovusDevFrameworkDemo | Modal en `/` | Modal en `/` | Alta | **Alta** |
| Nosotros | `/about` | `/about` | Alta | Baja |
| Casos de éxito | `/cases` | `/cases` o sección | Media | Baja |
| Contacto | `/contact` | `/contact` | Alta | Media |
| Páginas legales | `/privacy`, `/data-treatment`, `/terms` | Rutas equivalentes | Media | Baja |

---

## Cambios visuales a traducir

### Hero actualizado (CHG-004, CHG-017)

- Badge superior "Building Autonomous Intelligence" **se mantiene**.
- Logo clickeable con animaciones pulse/float y hover scale — **sin** overlay badge inferior (eliminado).
- Dos CTAs: "Agenda una demo" (link a contacto) y "Ver simulación" (abre modal).
- Stats inline: Partners cloud, Foco Enterprise B2B, Sede Bogotá.

### NovusDevFrameworkDemo (CHG-014) — Nueva complejidad alta

- Modal Dialog con diagrama de 4 columnas: Triggers, Framework, Agentes IA, Entregables.
- 9 pasos secuenciales con auto-advance cada 1.2s; controles play/pausa/reset.
- Columnas con estados active/reached; items con iconos Lucide y highlight animado.
- Panel de log con mensajes técnicos del flujo NADF.
- Canvas estilo n8n en columna Framework con nodos conectados.
- **Recomendación:** componente aislado con props `open`/`onOpenChange`; soportar `prefers-reduced-motion`.
- **Prohibido:** copiar JSX/CSS literal de Lovable; traducir intención del diagrama y timeline.

### MultiAgentDemo (CHG-009) — Sin cambios en este delta

- Diagrama SVG con nodos, conexiones animadas y timeline de 8 pasos en `/solutions/ai-agents`.
- Complejidad alta; independiente del nuevo demo del Hero.

### Design system (CHG-002)

- Paleta oklch: navy profundo, cyan primary, púrpura secondary.
- Tipografía: Space Grotesk (headings), Inter (body).
- Utilities conceptuales: gradientes de marca, shadow-glow, grid-bg, animaciones pulse/float.

---

## Cambios funcionales a traducir

### Integración simulación Hero ↔ Header (CHG-015, CHG-016)

| Lovable | Traducción productiva sugerida |
|---------|--------------------------------|
| `CustomEvent('novus:open-dev-framework')` | React Context o event bus ligero |
| `NOVUS_DEMO_EVENT` en Hero | Hook compartido `useDevFrameworkDemo()` |
| Header click "Inicio" en `/` | Misma lógica con `useLocation().pathname` |

### Routing (CHG-010)

| Lovable (TanStack) | Productivo (React Router) |
|--------------------|---------------------------|
| `createFileRoute("/")` | `<Route path="/" />` |
| `src/routes/solutions.$slug.tsx` | `/solutions/:slug` con `useParams()` |
| `Link` de TanStack | `Link` de react-router-dom |

Referencia: `novus-nexus/reglasEmpalme/port-map.yml`.

### Formulario de contacto (CHG-008)

- Validación client-side; submit a `POST /api/v1/contact`.
- **No replicar** fallback demo de `contact.ts` en producción.

---

## Componentes a crear o actualizar en NovusIntelligenceWEB

| Componente | Acción | Prioridad |
|------------|--------|-----------|
| Hero | Actualizar: quitar badge overlay, añadir modal demo | Alta |
| NovusDevFrameworkDemo | Crear (traducción intención) | Alta |
| Header | Añadir trigger demo en nav Inicio | Media |
| MultiAgentDemo | Crear si no existe | Alta |
| Layout (Header/Footer) | Alinear navegación y CTAs | Alta |
| ContactForm | Conectar API real | Alta |

---

## Paridad visual (ADR-0006)

Rutas bajo gate `visual_exact_parity`:

- `/` — **atención**: cambio en Hero (sin badge overlay) debe reflejarse en productivo
- `/about`, `/services`, `/contact`

Viewports: 1440×900, 768×1024, 390×844. Threshold maxDiffRatio ≤ 0.002.

---

## Dependencias y restricciones

- **Prohibido:** copiar código, CSS o componentes de Lovable.
- **Prohibido:** mocks en rutas productivas.
- Contenido textual: validar contra `memory/brand-context.md`.
- Assets: usar `public/assets/novus/` reales, no placeholders Lovable.

---

## Handoff a planner-agent

1. Priorizar traducción de `NovusDevFrameworkDemo` y actualización del Hero (delta dd9f5e2).
2. Mantener `MultiAgentDemo` en plan de `/solutions/ai-agents`.
3. Definir estrategia de estado compartido Hero/Header para apertura del modal.
4. Secuenciar contacto con dependencia backend (`POST /api/v1/contact`).
5. Incluir validación de paridad visual en `/` tras cambio del Hero.

**Próximo agente sugerido:** `planner-agent`
