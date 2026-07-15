# Informe de paridad visual

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-12-paridad-visual  
**Agente:** visual-parity-agent  
**Fecha:** 2026-07-15  
**Gate:** `visual_exact_parity`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)

---

## Resultado

| Campo | Valor |
|-------|-------|
| **Status** | **FAIL** |
| **Umbral maxDiffRatio** | 0.002 (0,2 % píxeles distintos por captura) |
| **maxDiffRatio observado** | 0.096091 (`/` @ 390×844) |
| **Rutas evaluadas** | 4 |
| **Viewports evaluados** | 3 (1440×900, 768×1024, 390×844) |
| **Capturas totales** | 12 |
| **Capturas PASS** | 0 |
| **Capturas FAIL** | 12 |
| **Referencia Lovable** | `http://127.0.0.1:4173` (novus-nexus dev local, build @ HEAD) |
| **Candidato DEV** | `https://d1bfu6klutpp8m.cloudfront.net` |
| **remediationRequired** | true |

> **Nota metodológica:** `NADF_LOVABLE_REFERENCE_URL` no estaba definida en el entorno Cloud Agent. Se levantó **novus-nexus** en modo dev (`npm run dev -- --port 4173`) como referencia de intención visual Lovable, conforme a `project-context.yml` y `visual-parity-rules.md`. El checker `visual-parity-check` congeló animaciones (`prefers-reduced-motion`, CSS `animation/transition: none`) antes de capturar.

---

## Tabla de resultados por ruta/viewport

| Ruta | Viewport | Diff ratio | Umbral | Pass | Píxeles distintos |
|------|----------|------------|--------|------|-------------------|
| `/` | 1440×900 | 0.042495 | 0.002 | NO | 290 607 / 6 838 560 |
| `/about` | 1440×900 | 0.033486 | 0.002 | NO | 92 195 / 2 753 280 |
| `/services` | 1440×900 | 0.026615 | 0.002 | NO | 73 700 / 2 769 120 |
| `/contact` | 1440×900 | 0.047789 | 0.002 | NO | 107 216 / 2 243 520 |
| `/` | 768×1024 | 0.066087 | 0.002 | NO | 350 461 / 5 303 040 |
| `/about` | 768×1024 | 0.037322 | 0.002 | NO | 91 951 / 2 463 744 |
| `/services` | 768×1024 | 0.030922 | 0.002 | NO | 73 691 / 2 383 104 |
| `/contact` | 768×1024 | 0.052720 | 0.002 | NO | 111 101 / 2 107 392 |
| `/` | 390×844 | 0.096091 | 0.002 | NO | 349 460 / 3 636 750 |
| `/about` | 390×844 | 0.050972 | 0.002 | NO | 71 545 / 1 403 610 |
| `/services` | 390×844 | 0.039585 | 0.002 | NO | 59 977 / 1 515 150 |
| `/contact` | 390×844 | 0.061399 | 0.002 | NO | 72 603 / 1 182 480 |

Capturas de evidencia: `.nadf/projects/novus-intelligence/artifacts/visual-parity-shots/` (`*-reference.png`, `*-candidate.png`, `*-diff.png`).

---

## Hallazgos principales (análisis visual de diffs)

### 1. Tokens de color y gradientes (P0 — transversal)

Los diffs muestran divergencia masiva en **gradientes de marca**, fondos y acentos. Lovable (`novus-nexus`) define tokens en **oklch** (`--gradient-brand: linear-gradient(135deg, oklch(0.82 0.16 220) … oklch(0.65 0.22 295))`), mientras el productivo (`NovusIntelligenceWEB`) usa equivalentes **HSL** en `index.css`. La conversión no es pixel-perfect y afecta headlines con `text-gradient-brand`, botones CTA, iconos de cards y el panel `NovusDevFrameworkDemo`.

**Acción:** Mapear tokens semánticos de `novus-nexus/reglasDiseno/tokens.yml` y `src/styles.css` a valores oklch-equivalentes en WEB (sin copiar el archivo literal).

### 2. Tipografía y métricas de texto (P0 — transversal)

Diferencias visibles en peso, tracking y line-height de headings (`font-display` / Space Grotesk) y body (Inter). Causa probable: carga de fuentes, `font-feature-settings` o clases Tailwind distintas entre stacks TanStack Start vs React Router.

**Acción:** Auditar `@font-face` / Google Fonts, `letter-spacing`, `line-height` y tamaños en Header, Hero y títulos de sección frente a referencia.

### 3. Hero + simulación NADF (P0 — `/` desktop/tablet/mobile)

El panel derecho (`NovusDevFrameworkDemo`) y la columna hero presentan offsets de padding, tamaño del logo animado y altura total de la sección. En móvil (390×844) el diff alcanza **9,6 %** — el peor resultado — por reordenamiento del stack hero/demo y márgenes verticales.

**Acción:** Igualar grid 2-col / stack móvil, dimensiones del demo y badges inferiores (PARTNERS CLOUD / FOCO / SEDE).

### 4. Layout global y altura de página (P1 — todas las rutas)

Las capturas `fullPage: true` revelan **scroll height distinto** entre referencia y candidato en landing, about y services. Secciones Partners, ServicesGrid, Testimonials y CTA no terminan en la misma posición vertical, amplificando el diff ratio aunque el contenido sea semánticamente similar.

**Acción:** Revisar `py-*`, `gap-*`, alturas mínimas de cards y contenedores `max-w-*` en secciones compartidas.

### 5. Contacto — grid formulario / sidebar (P0 — `/contact`)

En desktop y tablet, el layout 2 columnas (3 cards informativas + formulario) muestra desalineación en labels, selects, textarea y botón submit. En móvil, el orden y espaciado de cards vs form difieren de Lovable.

**Acción:** Ajustar `ContactPage.tsx` — ratio columnas, padding de cards, alturas de inputs y ancho del formulario hasta paridad pixel.

### 6. Header / navegación móvil (P0 — móvil transversal)

Ghosting en diffs móviles sugiere diferencias en altura del header sticky, hamburger y padding horizontal que desplaza todo el contenido subsiguiente.

**Acción:** Igualar `Header.tsx` mobile breakpoint (390px) con referencia Lovable.

---

## Decisión del gate

| Criterio | Cumple |
|----------|--------|
| Plan `approved` | Sí |
| Umbral maxDiffRatio ≤ 0.002 en todas las capturas | **No** |
| Sin copia de código Lovable en esta validación | Sí (solo checker + artifacts) |
| Comparación documentada con evidencia | Sí |

**Veredicto:** Gate `visual_exact_parity` **BLOQUEADO**. No proceder merge/deploy DEV automático hasta remediación y re-ejecución con `status: PASS`.

---

## Remediación requerida

1. Handoff a **frontend-integration-agent** con `gaps-paridad.json` (prioridades P0/P1).
2. Corregir gaps en orden P0 → P1.
3. Re-ejecutar `visual-parity-check` con las mismas rutas/viewports.
4. Solo con `status: PASS` → continuar workflow (merge + deploy DEV).

**nextAgentSuggested:** `frontend-integration-agent`
