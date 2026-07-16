# Informe de paridad visual — Novus Intelligence

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-12-paridad-visual  
**Agente:** visual-parity-agent  
**Fecha:** 2026-07-16  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Gate:** `visual_exact_parity`  
**Status:** **FAIL**

---

## Resumen ejecutivo

Se ejecutó el checker `visual-parity-check` (Playwright + pixelmatch) comparando la referencia Lovable (`novus-nexus` @ dev local `http://127.0.0.1:5173`, baseline `e3a9819`) contra el candidato productivo DEV (`https://d1bfu6klutpp8m.cloudfront.net`).

**Ninguna** de las 12 capturas (4 rutas × 3 viewports) cumple el umbral `maxDiffRatio ≤ 0.002`. El `maxDiffRatio` global observado es **0.096091** (home móvil `390×844`).

CloudFront DEV coincide pixel-a-pixel con el build local de `NovusIntelligenceWEB` @ `main` (diff 0.000000 en `/`). El fallo es de **implementación frontend**, no de despliegue desactualizado.

**Acción requerida:** remediación por `frontend-integration-agent` usando `gaps-paridad.json`. Re-ejecutar este gate tras correcciones.

---

## Parámetros de validación

| Parámetro | Valor |
|-----------|-------|
| `thresholdMaxDiffRatio` | 0.002 (0,2 % píxeles distintos) |
| Referencia | `http://127.0.0.1:5173` (novus-nexus dev) |
| Candidato | `https://d1bfu6klutpp8m.cloudfront.net` |
| Rutas | `/`, `/about`, `/services`, `/contact` |
| Viewports | 1440×900, 768×1024, 390×844 |
| Anti-aliasing | Umbral color ≤ 16 RGB; `includeAA: false` |
| Animaciones | Congeladas (`prefers-reduced-motion` + CSS override) |

---

## Resultados por ruta/viewport

| Ruta | Viewport | Diff ratio | Umbral | Pass | Prioridad |
|------|----------|------------|--------|------|-----------|
| `/` | 1440×900 | 0.042558 | 0.002 | NO | P1 |
| `/about` | 1440×900 | 0.033663 | 0.002 | NO | P1 |
| `/services` | 1440×900 | 0.026785 | 0.002 | NO | P1 |
| `/contact` | 1440×900 | 0.047996 | 0.002 | NO | P1 |
| `/` | 768×1024 | 0.065992 | 0.002 | NO | P0 |
| `/about` | 768×1024 | 0.037118 | 0.002 | NO | P1 |
| `/services` | 768×1024 | 0.030712 | 0.002 | NO | P1 |
| `/contact` | 768×1024 | 0.052481 | 0.002 | NO | P0 |
| `/` | 390×844 | **0.096091** | 0.002 | NO | **P0** |
| `/about` | 390×844 | 0.050972 | 0.002 | NO | P0 |
| `/services` | 390×844 | 0.039585 | 0.002 | NO | P1 |
| `/contact` | 390×844 | 0.061399 | 0.002 | NO | P0 |

**Capturas:** `.nadf/projects/novus-intelligence/artifacts/visual-parity-shots/`  
Patrón de archivos: `{viewport}-{route}-{reference|candidate|diff}.png`

---

## Hallazgos principales (análisis visual)

### 1. Design tokens y tipografía (P0 — transversal)

- La referencia Lovable usa tokens **oklch** con gradientes cyan→púrpura (`135deg`).
- El candidato productivo aproxima con **HSL** (`220 85% 55%` / `295 70% 55%`), produciendo matiz azul-magenta distinto en headlines, CTAs y acentos.
- El diff muestra ghosting en casi todo el texto → métricas tipográficas (line-height, letter-spacing) no coinciden con la referencia.

**Remediación:** sincronizar tokens semánticos en `NovusIntelligenceWEB/src/index.css` con valores oklch de `novus-nexus/src/styles.css` (sin copiar el archivo literal).

### 2. Componente Button — geometría global (P0)

- Referencia: botones `rounded-md`, alturas compactas (h-8/h-10).
- Candidato: botones **pill** (`rounded-full`), más altos y anchos.
- Impacto: Header, Hero, CTA final, formulario contacto.

**Remediación:** ajustar `src/components/ui/Button.tsx` a geometría shadcn de referencia.

### 3. Header / navegación (P0)

- Falta ítem **“Registro empresas”** (7 links en referencia vs 6 en productivo).
- CTA header con gradiente y footprint distintos.
- Indicador activo de ruta con peso/color diferente.

**Remediación:** `src/content/site.ts` + `src/components/layout/Header.tsx`.

### 4. Hero landing (P0)

- Badge eyebrow, saltos de línea H1 y stats row desalineados.
- CTAs con forma pill vs rect en referencia.
- Glow del contenedor logo con intensidad púrpura excesiva.

**Remediación:** `src/components/sections/Hero.tsx` tras corrección de Button/tokens.

### 5. Formulario contacto (P0)

- Inputs referencia: `h-9 rounded-md px-3`.
- Inputs candidato: `h-11 rounded-xl px-4` → ~8 px extra por campo, drift acumulado en toda la columna derecha.
- Botón submit con forma distinta.

**Remediación:** `ContactPage.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`.

### 6. Secciones landing (P1)

- **ServicesGrid:** iconos 44×44, tags con ritmo vertical distinto.
- **SolutionsGrid:** padding card, link “EXPLORAR →” desplazado.
- **ImpactStats:** iconos con `bg-primary/10` vs gradiente en candidato.
- **Testimonials:** logos cliente, badge flecha superior-derecha, fondo sección clara.
- **Footer:** grid columnas, año copyright dinámico (2026 vs 2024 referencia).

### 7. Mobile (P0 — peor viewport)

- Home móvil con diffRatio **9,6 %** — acumulación de drift de tokens + Button + espaciado vertical entre secciones.
- Footer y formulario contacto con desalineación severa en 390×844.

---

## Orden de remediación recomendado

1. Design tokens oklch (`index.css`)
2. Button geometry (`Button.tsx`)
3. Form controls (`Input`, `Select`, `Textarea`)
4. Nav — añadir “Registro empresas”
5. Secciones: Hero → Testimonials → Footer
6. Re-ejecutar `visual-parity-check` en los 3 viewports

---

## Restricciones respetadas

- ✅ Plan `approved` verificado
- ✅ Sin copia de código Lovable
- ✅ Sin despliegue (`NO_DEPLOY`)
- ✅ Sin secrets en artefactos
- ✅ Comparación contra URL DEV sa-east-1 (CloudFront)
- ❌ Gate `visual_exact_parity` — **bloqueado**

---

## Próximo agente

**`frontend-integration-agent`** — aplicar `gaps-paridad.json` y solicitar re-validación de este gate.
