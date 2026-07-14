# Informe de paridad visual — Novus Intelligence

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-12-paridad-visual  
**Agente:** visual-parity-agent  
**Fecha:** 2026-07-14  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Gate:** `visual_exact_parity`  
**Umbral:** `maxDiffRatio <= 0.002` (0,2 % por captura)

---

## Resumen ejecutivo

La comparación pixel-a-pixel entre la **referencia Lovable** (`novus-nexus` servido localmente en `http://127.0.0.1:4173`) y el **frontend DEV productivo** (`https://d1bfu6klutpp8m.cloudfront.net`) resultó en **FAIL** en las **12 capturas** evaluadas (4 rutas × 3 viewports).

El `maxDiffRatio` global fue **0,234509** (ruta `/`, viewport `390x844`), **117× por encima** del umbral. No se detectó ninguna combinación ruta/viewport que cumpla paridad exacta.

**Decisión:** Bloquear merge/deploy DEV hasta remediación por `frontend-integration-agent`.

---

## Metodología

| Parámetro | Valor |
|-----------|-------|
| Checker | `prototypes/m6-cloud-agent/src/visual-parity-check.ts` |
| Referencia | `novus-nexus` @ commit `746c129` (build local `npm run dev`) |
| Candidato | CloudFront DEV `sa-east-1` |
| Rutas | `/`, `/about`, `/services`, `/contact` |
| Viewports | `1440x900`, `768x1024`, `390x844` |
| Animaciones | Congeladas (`prefers-reduced-motion` + CSS override) |
| Tolerancia color | RGB ≤ 16 (pixelmatch) |

> **Nota:** `NADF_LOVABLE_REFERENCE_URL` no estaba definida en el entorno Cloud Agent; se usó build local de `novus-nexus` como referencia válida según `visual-parity-rules.md` (*preview o build de novus-nexus*).

---

## Resultados por ruta/viewport

| Ruta | Viewport | Diff ratio | Umbral | Pass | Severidad |
|------|----------|------------|--------|------|-----------|
| `/` | 1440x900 | 0,190696 | 0,002 | NO | P0 |
| `/` | 768x1024 | 0,214702 | 0,002 | NO | P0 |
| `/` | 390x844 | 0,234509 | 0,002 | NO | P0 |
| `/about` | 1440x900 | 0,066117 | 0,002 | NO | P0 |
| `/about` | 768x1024 | 0,101771 | 0,002 | NO | P0 |
| `/about` | 390x844 | 0,123070 | 0,002 | NO | P0 |
| `/services` | 1440x900 | 0,066206 | 0,002 | NO | P0 |
| `/services` | 768x1024 | 0,087895 | 0,002 | NO | P0 |
| `/services` | 390x844 | 0,105514 | 0,002 | NO | P0 |
| `/contact` | 1440x900 | 0,042823 | 0,002 | NO | P1 |
| `/contact` | 768x1024 | 0,061095 | 0,002 | NO | P0 |
| `/contact` | 390x844 | 0,073206 | 0,002 | NO | P0 |

**maxDiffRatio global:** `0,234509`  
**Capturas PASS:** `0 / 12`

Screenshots y diffs en: `artifacts/visual-parity-shots/` (no versionados; generados en runtime).

---

## Hallazgos materiales por componente

### 1. Landing `/` — P0 (mayor impacto)

| Área | Referencia Lovable | Candidato DEV | Acción |
|------|-------------------|---------------|--------|
| Hero badge | «BUILDING AUTONOMOUS INTELLIGENCE» | «INNOVACIÓN AUTÓNOMA INTELIGENTE» | Alinear copy y estilo del overline |
| Hero headline | «Transformamos empresas con **inteligencia que genera resultados**» | «Inteligencia que **genera resultados**» (sin prefijo) | Restaurar headline completo y gradiente en frase correcta |
| CTA secundario | «Ver simulación» (icono play) | «Ver soluciones» | Restaurar CTA y evento de demo NADF |
| Hero visual | Imagen de marca 3D (logo.jpeg animado) | Icono checkmark genérico en caja glow | Reimplementar `NovusDevFrameworkDemo` / asset de marca |
| Partners cloud | Logos AWS/Azure/GCP con badges | Texto plano «AWS», «Microsoft Azure», «Google Cloud» | Usar assets de partners y layout de banner Lovable |
| Sección servicios | «Cinco capacidades que **mueven la aguja**» — grid 5 columnas | «Cinco pilares para **transformar tu operación**» — grid 3 columnas | Título, copy y layout 5-col como `ServicesGrid` Lovable |
| Sección soluciones | «Inteligencia aplicada para **empresas en evolución**» | «Productos listos para **impacto inmediato**» | Alinear títulos, descripciones y cards |
| Impacto | 4 iconos + títulos (Productividad, Costos, Calidad, Escalabilidad) | Fila numérica (3+, 6, 24/7, Bogotá) | Reimplementar `ImpactStats` con iconografía Lovable |
| Testimonios | Sección fondo **blanco** con 2 cards (Banco Santa Cruz, doevents) | Cards oscuras sobre fondo oscuro | Cambiar contraste de sección y estilo de cards |
| CTA inferior | «Hablemos sobre cómo la IA puede **transformar tu negocio**» | «¿Listo para construir inteligencia autónoma?» | Alinear copy y botones secundarios |
| Footer | 5 columnas (logo, Servicios, Soluciones, Contacto, legales) | 4 columnas (Contacto, Navegación, Legal) | Reestructurar `Footer.tsx` a 5 columnas Lovable |

### 2. About `/about` — P0

| Área | Referencia Lovable | Candidato DEV | Acción |
|------|-------------------|---------------|--------|
| Hero | «Somos **Novus Intelligence** Solutions» + párrafo + tagline | «Construimos **inteligencia autónoma** con propósito» | Reestructurar hero 2-col con copy Lovable |
| Valores | Fila 3 cards: Misión, Visión, Valores + CTAs «Ver soluciones» / «Hablemos» | Solo bloque «Nuestra misión» (1 col) | Añadir cards misión/visión/valores y botones |
| CTA | «Hablemos sobre cómo la IA puede **transformar tu negocio**» con grid-bg | CTA genérico «¿Listo para construir…?» | Alinear sección CTA con landing Lovable |
| Footer | 5 columnas + tagline «BUILDING AUTONOMOUS INTELLIGENCE» | 4 columnas sin tagline | Igualar footer global |

### 3. Services `/services` — P0

| Área | Hallazgo | Acción |
|------|----------|--------|
| Hero / intro | Títulos y espaciado difieren de referencia | Alinear hero y subtítulo con página Lovable |
| Grid servicios | Layout y densidad de cards no coinciden | Verificar `ServicesPage` vs `ServicesGrid` Lovable (5 pilares, iconos, tags) |
| CTA / footer | Mismas desviaciones globales de layout | Aplicar correcciones compartidas Header/Footer/CTA |

### 4. Contact `/contact` — P1 (menor diff, aún material)

| Área | Referencia Lovable | Candidato DEV | Acción |
|------|-------------------|---------------|--------|
| Sidebar | 3 cards: Datos, **Horario**, **Partner principal** | 1 bloque «Datos de contacto» plano | Añadir cards Horario y Partner AWS con borde glow |
| Layout | Ratio ~1:1.4 (sidebar : formulario) | Columnas más equilibradas | Ajustar grid y proporciones |
| Formulario | Placeholder «Selecciona una solución (opcional)» | «Seleccionar…» | Alinear labels/placeholders |
| Footer | 5 columnas | 4 columnas | Igualar footer global |

### 5. Global (todas las rutas) — P0

- **Header:** logo «NOVUS INTELLIGENCE» vs «Novus» con icono checkmark; indicador activo con underline gradiente vs pill oscuro.
- **Tipografía:** pesos y tamaños de headings difieren sistemáticamente (Space Grotesk/Inter).
- **Tokens:** sombras (`shadow-glow`, `shadow-card`), gradientes y `grid-bg` no coinciden pixel-level.
- **Responsive:** desviaciones amplificadas en tablet/móvil (diff > 20 % en `/`).

---

## Archivos productivos a remediar (sugeridos)

```
NovusIntelligenceWEB/src/
  components/layout/Header.tsx
  components/layout/Footer.tsx
  components/sections/Hero.tsx
  components/sections/PartnersBanner.tsx (o equivalente)
  components/sections/ServicesGrid.tsx
  components/sections/SolutionsGrid.tsx
  components/sections/ImpactStats.tsx
  components/sections/Testimonials.tsx
  components/sections/CTA.tsx
  pages/AboutPage.tsx
  pages/ServicesPage.tsx
  pages/ContactPage.tsx
  index.css
  tailwind.config.js
```

---

## Remediación y siguiente paso

1. `frontend-integration-agent` debe corregir gaps P0/P1 en `gaps-paridad.json` **sin copiar código Lovable**.
2. Re-desplegar frontend DEV (tras gates previos) o validar build local contra referencia.
3. Re-ejecutar `visual-parity-check` hasta `status: PASS` en las 12 capturas.
4. Solo entonces proceder merge + deploy DEV automático (ADR-0006).

**nextAgentSuggested:** `frontend-integration-agent`
