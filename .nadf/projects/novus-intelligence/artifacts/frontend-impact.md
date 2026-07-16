# Impacto Frontend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `e2aa094`  
**Destino:** NovusIntelligenceWEB (React + TypeScript + Tailwind + React Router + Vite)  
**Fecha:** 2026-07-16  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable define un **sitio corporativo B2B completo** con design system dark-first (navy + cyan + púrpura), **12 rutas navegables** y dos capacidades nuevas en el delta `e2aa094`:

1. **Portal de empresas** (`/auth` + `/register-company`) con autenticación y formulario de perfil corporativo.
2. **NovusDevFrameworkDemo** — modal interactivo en Hero que simula el flujo NADF multiagente.

La traducción al frontend productivo requiere **reimplementar la intención visual y funcional** sin copiar código. La integración Supabase de Lovable **está prohibida en producción** según `port-map.yml` y `.ai/prompts/port-lovable-to-aws.md`; debe traducirse a APIs AWS.

---

## Alcance de impacto por sección

| Sección Lovable | Ruta Lovable | Ruta WEB esperada | Prioridad | Complejidad |
|-----------------|--------------|-------------------|-----------|-------------|
| Landing / Hero | `/` | `/` | Alta | Alta |
| Header / Footer | Layout | Layout compartido | Alta | Media |
| Servicios (5 pilares) | `/services` | `/services` | Alta | Baja |
| Soluciones (grid) | `/solutions` | `/solutions` | Alta | Baja |
| Detalle solución | `/solutions/$slug` | `/solutions/:slug` | Alta | Media |
| MultiAgentDemo | `/solutions/ai-agents` | `/solutions/ai-agents` | Alta | Alta |
| NovusDevFrameworkDemo | Modal en `/` | Modal en `/` | Alta | Alta |
| Nosotros | `/about` | `/about` | Alta | Baja |
| Casos de éxito | `/cases` | `/cases` | Media | Baja |
| Contacto | `/contact` | `/contact` | Alta | Media |
| **Auth empresas** | `/auth` | `/auth` o `/empresas/acceso` | **Alta** | **Alta** |
| **Registro empresa** | `/register-company` | `/register-company` o `/empresas/registro` | **Alta** | **Alta** |
| Páginas legales | `/privacy`, `/data-treatment`, `/terms` | Rutas equivalentes | Media | Baja |

---

## Delta principal: Portal de empresas (CHG-014, CHG-015, CHG-018)

### Intención funcional

- Flujo: usuario sin sesión → `/auth` → signup/login → `/register-company` → formulario → confirmación.
- Protección de ruta: redirección a `/auth` si no hay sesión activa.
- Formulario con 3 bloques visuales (datos básicos, perfil corporativo, necesidad/interés).
- Prefill si el usuario ya tiene perfil guardado (upsert por `user_id`).
- Estados: loading inicial, saving, done con opción editar, logout.
- Meta `robots: noindex` en auth y registro.

### Intención visual

- Hero section con badge "Portal de empresas", headline con gradiente de marca.
- Cards elevadas (`bg-navy-elevated`, `border-border/60`, `shadow-elevated`).
- Inputs con fondo `bg-navy-surface/50`.
- CTA principal con `bg-gradient-brand` y `shadow-glow`.
- Pantalla de éxito con icono CheckCircle2 y CTAs secundarios.

### Traducción al stack productivo

| Lovable (prototipo) | Productivo (requerido) |
|---------------------|------------------------|
| `supabase.auth.signUp/signIn` | Cognito, Auth0, o API custom AWS — **no Supabase** |
| `supabase.from("companies").upsert()` | `POST/PUT /api/v1/companies` vía Lambda |
| `localStorage` session Supabase | Tokens JWT en httpOnly cookies o Amplify Auth |
| Tabs shadcn login/signup | Reutilizar componentes UI existentes en WEB |
| Selects con listas hardcoded | Mismas listas como constantes en WEB (INDUSTRIES, SIZES, COUNTRIES) |

### Prohibiciones explícitas

- **No copiar** `src/integrations/supabase/*` (listado en `port-map.yml` forbidden).
- **No añadir** `@supabase/supabase-js` al frontend productivo.
- **No exponer** `VITE_SUPABASE_*` en build productivo.

---

## Delta secundario: NovusDevFrameworkDemo (CHG-017)

### Intención

- Modal Dialog con simulación educativa del framework NADF en 4 columnas.
- 9 pasos animados con logs técnicos, controles play/pause/reset.
- Disparado desde Hero ("Ver simulación") y desde Header (clic en "Inicio" cuando ya está en `/`).

### Traducción

- Componente lazy-loaded en landing; no requiere backend.
- Respetar `prefers-reduced-motion`.
- Reimplementar diagrama y animaciones sin copiar las ~467 líneas de Lovable.
- Evento custom `novus:open-dev-framework` puede traducirse a contexto React o state lifting.

---

## Cambios visuales previos (mantienen vigencia)

### Design system (CHG-002)

- Paleta navy + cyan + púrpura en oklch (ver `reglasDiseno/tokens.yml`).
- Tipografía Space Grotesk + Inter.
- Utilities: gradientes de marca, sombras glow, grid background, animaciones pulse/float.

### Contacto — Navy Neón (CHG-008, delta visual)

- Hero y formulario alineados con tokens navy-elevated/navy-surface.
- Misma estructura de campos; integración con `submitContact()` (API AWS, no Supabase).

### Layout (CHG-003)

- Header ahora con **7 ítems** de navegación (añadido "Registro empresas").
- CTA persistente "Agenda una demo" → `/contact`.

---

## Cambios funcionales a traducir

### Routing (CHG-010)

| Lovable (TanStack) | Productivo (React Router) |
|--------------------|---------------------------|
| `createFileRoute("/auth")` | `<Route path="/auth" />` |
| `createFileRoute("/register-company")` | `<Route path="/register-company" />` |
| Guard por sesión en useEffect | ProtectedRoute o loader con verificación auth |
| `head()` meta noindex | React Helmet `robots: noindex` |

**Nota:** `port-map.yml` no incluye aún mapeo para `/auth` ni `/register-company`. El planner debe extender la tabla de rutas.

### Formulario de contacto (CHG-008, CHG-011)

- Sin cambios funcionales respecto al análisis anterior.
- Integración con `POST /api/v1/contact` (AWS Lambda).
- **Sin modo demo en producción.**

### MultiAgentDemo (CHG-009)

- Sin cambios; permanece en `/solutions/ai-agents`.
- Esfuerzo alto de traducción SVG + animaciones.

---

## Contenido a sincronizar (CHG-005, CHG-018)

- Nuevo ítem nav: `{ label: "Registro empresas", to: "/register-company" }`.
- Listas de formulario registro: 13 industrias, 6 rangos de tamaño, 10 países.
- Validar coherencia con `memory/brand-context.md`.

---

## Componentes reutilizables sugeridos

| Componente Lovable (intención) | Acción en WEB |
|--------------------------------|---------------|
| AuthPage (tabs login/signup) | **Nuevo** — requiere proveedor auth AWS |
| RegisterCompanyPage | **Nuevo** — requiere API companies |
| NovusDevFrameworkDemo | **Nuevo** — modal en landing |
| Hero (con trigger demo) | Extender existente |
| MultiAgentDemo | Nuevo (ai-agents) |
| CTA | Extraer como compartido |

---

## Dependencias y stack

| Lovable | Productivo | Acción |
|---------|------------|--------|
| `@supabase/supabase-js` | **Prohibido** | Traducir a AWS Cognito + API Gateway |
| TanStack Router/Start | React Router | Traducir rutas (+2 nuevas) |
| shadcn/ui (Dialog, Tabs) | Verificar en WEB | Reutilizar si existe |
| sonner (toast) | Verificar en WEB | Equivalente |

---

## SEO y meta

- Rutas `/auth` y `/register-company`: **noindex** (no indexar en producción).
- Resto de rutas: mantener titles/descriptions/og:* del análisis anterior.

---

## Estimación de esfuerzo relativo (actualizada)

| Área | Esfuerzo | Notas |
|------|----------|-------|
| Portal auth + registro empresa | **Muy alto** | Requiere decisión arquitectónica auth (ADR) |
| NovusDevFrameworkDemo | Alto | Modal + animaciones |
| Design tokens + layout | Alto | Base del sitio |
| Landing completa | Alto | Hero actualizado + demo |
| Contacto | Medio | API backend contact |
| MultiAgentDemo | Alto | SVG + animaciones |
| Resto páginas estáticas | Medio-Bajo | Sin cambios mayores |

---

## Restricciones NADF aplicables

- **NO_LOVABLE_CODE_COPY:** Reimplementar intención, no JSX/CSS literal.
- **NO_PRODUCTIVE_CODE:** Este agente no implementa; solo documenta impacto.
- **Supabase prohibido en producción:** Ver `port-map.yml` y `port-lovable-to-aws.md`.
- Portal empresas **expande alcance** fuera de `initial_scope` en `project-context.yml` — requiere validación de stakeholder.

---

## Próximo agente

**planner-agent** debe usar este documento junto con `cambios-lovable.json` y `backend-impact.md` para generar `plan-implementacion.md`, incluyendo decisión sobre auth/registro empresas y extensión de `port-map.yml`.
