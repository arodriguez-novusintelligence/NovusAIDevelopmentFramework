# Informe de paridad visual — novus-intelligence

**Agente:** visual-parity-agent  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-12-paridad-visual  
**Fecha:** 2026-07-14  
**Gate:** `visual_exact_parity`  
**Status:** **FAIL**  
**Plan:** `approved` (PLAN-NOVUS-LOVABLE-2026-07-14)

---

## Resumen ejecutivo

La comparación pixel-a-pixel entre la referencia Lovable (`novus-nexus` @ `746c129`, servido localmente en `http://127.0.0.1:4173`) y el frontend DEV productivo (`https://d1bfu6klutpp8m.cloudfront.net`) **no cumple** el umbral `maxDiffRatio ≤ 0.002` en ninguna de las 12 capturas (4 rutas × 3 viewports).

| Métrica | Valor |
|---------|-------|
| Umbral | 0.002 (0,2 % píxeles distintos) |
| maxDiffRatio observado | **0.234509** (`/`, 390×844) |
| Capturas evaluadas | 12 |
| Capturas PASS | 0 |
| Capturas FAIL | 12 |

**Decisión:** Bloquear merge/deploy DEV automático. Remediación obligatoria por `frontend-integration-agent`.

> **Nota de referencia:** `NADF_LOVABLE_REFERENCE_URL` no estaba definida en el entorno. Se usó `novus-nexus` en modo dev local como fuente de intención visual (commit actual `746c129`, posterior al baseline `e3a9819` del plan). Esto es válido según reglas: paridad = resultado visual, no igualdad de código.

---

## Configuración de la comparación

| Parámetro | Valor |
|-----------|-------|
| Referencia | `http://127.0.0.1:4173` (novus-nexus dev local) |
| Candidato | `https://d1bfu6klutpp8m.cloudfront.net` |
| Rutas | `/`, `/about`, `/services`, `/contact` |
| Viewports | 1440×900, 768×1024, 390×844 |
| Anti-aliasing | Umbral color ≤ 16 RGB (pixelmatch) |
| Animaciones | Congeladas (`prefers-reduced-motion` + CSS override) |

Screenshots y diffs: `.nadf/projects/novus-intelligence/artifacts/visual-parity-shots/` (no versionados).

---

## Resultados por ruta/viewport

| Ruta | Viewport | diffRatio | Pass | Severidad |
|------|----------|-----------|------|-----------|
| `/` | 1440×900 | 0.190696 | NO | P0 |
| `/` | 768×1024 | 0.214702 | NO | P0 |
| `/` | 390×844 | 0.234509 | NO | P0 |
| `/about` | 1440×900 | 0.066117 | NO | P0 |
| `/about` | 768×1024 | 0.101771 | NO | P0 |
| `/about` | 390×844 | 0.123070 | NO | P0 |
| `/services` | 1440×900 | 0.066206 | NO | P0 |
| `/services` | 768×1024 | 0.087895 | NO | P0 |
| `/services` | 390×844 | 0.105514 | NO | P0 |
| `/contact` | 1440×900 | 0.042823 | NO | P1 |
| `/contact` | 768×1024 | 0.061095 | NO | P0 |
| `/contact` | 390×844 | 0.073206 | NO | P0 |

---

## Hallazgos visuales materiales (inspección manual)

### 1. Landing `/` — mayor desviación (P0)

| Área | Referencia Lovable | Candidato DEV | Impacto |
|------|-------------------|---------------|---------|
| Hero headline | «Transformamos empresas con **inteligencia que genera resultados**» | «Inteligencia que **genera resultados**» (copy distinto, sin «Transformamos empresas») | Alto |
| CTA secundario | «Ver simulación» con icono play | «Ver soluciones» | Alto |
| Hero visual | Logo/marca en card oscura con glow | Icono checkmark genérico en card | Alto |
| Barra partners | Franja «CONSTRUIMOS SOBRE INFRAESTRUCTURA CLOUD…» con logos AWS/Azure/GCP visibles | Texto partners simplificado sin logos gráficos | Alto |
| Sección servicios | «Cinco capacidades que **mueven la aguja**» | «Cinco pilares para **transformar tu operación**» | Alto |
| Sección soluciones | «Inteligencia aplicada para **empresas en evolución**» | «Productos listos para **impacto inmediato**» | Alto |
| Impacto | Iconos + frases (Productividad, Costos, Calidad, Escalabilidad) | Stats numéricos (3+, 6, 24/7, Bogotá) | Alto |
| Testimonios | Fondo **blanco**, cards Banco Santa Cruz / doevents con logos y tags | Fondo **oscuro**, cards con copy distinto (daevents vs doevents) | Alto |
| CTA final | «Hablemos sobre cómo la IA puede **transformar tu negocio**» | «¿Listo para construir inteligencia autónoma?» | Medio |
| Footer | 5 columnas (logo, servicios, soluciones, contacto, legales) + slogan BUILDING AUTONOMOUS INTELLIGENCE | 4 columnas (logo, contacto, navegación, legal) | Medio |

### 2. `/about` — estructura de página distinta (P0)

| Área | Referencia | Candidato | Impacto |
|------|-----------|-----------|---------|
| Hero | «Somos **Novus Intelligence Solutions**» + párrafo + tagline | «Construimos **inteligencia autónoma** con propósito» | Alto |
| Layout hero | 2 columnas: copy + card liderazgo | Hero centrado + misión/liderazgo en 2 cols debajo | Alto |
| Misión/visión/valores | 3 cards horizontales + CTAs «Ver soluciones» / «Hablemos» | Solo bloque «Nuestra misión»; **faltan** visión y valores | Alto |
| CTA intermedio | Sección «EMPIEZA HOY» con grid-bg y glow | Card CTA genérica «¿Listo para construir…?» | Medio |
| Footer | 5 columnas alineadas a Lovable | 4 columnas (contacto/navegación/legal) | Medio |

### 3. `/services` — copy y grid (P0)

| Área | Referencia | Candidato | Impacto |
|------|-----------|-----------|---------|
| Hero title | «Cinco capacidades que **construyen ventaja competitiva**» | «Expertise integral en **inteligencia artificial**» | Alto |
| Grid servicios | 5 cards en fila única desktop | Grid 2 columnas (5 cards en layout distinto) | Alto |
| CTA | «EMPIEZA HOY» + «Hablemos sobre cómo la IA…» | CTA genérica «¿Listo para construir inteligencia autónoma?» | Medio |

### 4. `/contact` — menor diff relativo (P1)

Diferencias en sidebar (cards contacto/horario/AWS partner vs estructura Lovable), ratio del formulario y espaciado. Aun con el menor `diffRatio` (4,28 % desktop), supera ~21× el umbral.

### 5. Global — design system y layout (P0)

- **Header:** logo distinto (N gradiente + «NOVUS INTELLIGENCE» vs icono check + «Novus»); indicador activo (underline gradiente vs pill).
- **Tipografía/copy:** múltiples headings y párrafos no alineados a `src/content/` de novus-nexus.
- **Tokens:** fondos, gradientes y sombras no coinciden pixel-perfect con referencia.
- **Responsive:** desviaciones amplificadas en tablet/móvil (home hasta 23,45 %).

---

## Causa raíz

El frontend DEV desplegado refleja una **implementación parcial** con copy, estructura de secciones y componentes que divergen de la intención visual actual de `novus-nexus`. El `resumen-frontend.md` declaraba remediación completada, pero el checker objetivo demuestra que las rutas gate **no alcanzan paridad exacta**.

No se detectó copia literal de código Lovable; el problema es **desalineación visual** en layout, contenido y tokens.

---

## Remediación requerida

1. `frontend-integration-agent` debe trabajar **solo** los gaps de `gaps-paridad.json` (P0 primero).
2. Alinear copy y estructura con `novus-nexus/src/content/*` y componentes de referencia (inspección, no copia).
3. Re-desplegar DEV tras cambios (fuera de alcance de este agente; `NO_DEPLOY`).
4. Re-ejecutar `visual-parity-check` hasta `status: PASS` en las 12 capturas.
5. Solo entonces proceder merge + deploy DEV automático.

**Siguiente agente sugerido:** `frontend-integration-agent`

---

## Artefactos generados

- `visual-parity-result.json`
- `gaps-paridad.json`
- `informe-paridad-visual.md` (este documento)
- `visual-parity-shots/*` (capturas locales, no versionadas)
