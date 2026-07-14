# Informe de paridad visual — novus-intelligence

**Agente:** visual-parity-agent  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-12-paridad-visual  
**Fecha:** 2026-07-14  
**Gate:** `visual_exact_parity`  
**Status:** **FAIL** (bloqueante)

---

## Resumen ejecutivo

Se ejecutó el checker `visual-parity-check` (Playwright + pixelmatch) comparando **novus-nexus** (referencia Lovable) contra el frontend DEV productivo en CloudFront. **Ninguna** de las 12 capturas (4 rutas × 3 viewports) cumple el umbral `maxDiffRatio ≤ 0.002`.

| Métrica | Valor |
|---------|-------|
| Umbral | 0.002 (0,2%) |
| maxDiffRatio global | **0.234509** (23,45%) |
| Capturas evaluadas | 12 |
| PASS | 0 |
| FAIL | 12 |
| Referencia | `http://127.0.0.1:4173` (novus-nexus @ `20d79e1`, dev local — `NADF_LOVABLE_REFERENCE_URL` no configurada) |
| Candidato DEV | `https://d1bfu6klutpp8m.cloudfront.net` |

**Decisión:** Gate bloqueado. Deploy DEV y merge automático **no autorizados** hasta remediación por `frontend-integration-agent` y re-ejecución con PASS.

---

## Resultados por ruta y viewport

| Ruta | Viewport | Diff ratio | Umbral | Pass |
|------|----------|------------|--------|------|
| `/` | 1440×900 | 0.190696 | 0.002 | NO |
| `/about` | 1440×900 | 0.066117 | 0.002 | NO |
| `/services` | 1440×900 | 0.066206 | 0.002 | NO |
| `/contact` | 1440×900 | 0.042823 | 0.002 | NO |
| `/` | 768×1024 | 0.214702 | 0.002 | NO |
| `/about` | 768×1024 | 0.101771 | 0.002 | NO |
| `/services` | 768×1024 | 0.087895 | 0.002 | NO |
| `/contact` | 768×1024 | 0.061095 | 0.002 | NO |
| `/` | 390×844 | 0.234509 | 0.002 | NO |
| `/about` | 390×844 | 0.123070 | 0.002 | NO |
| `/services` | 390×844 | 0.105514 | 0.002 | NO |
| `/contact` | 390×844 | 0.073206 | 0.002 | NO |

Screenshots y diffs en: `.nadf/projects/novus-intelligence/artifacts/visual-parity-shots/`

---

## Hallazgos principales (inspección visual)

### 1. Landing `/` — diferencias materiales (P0)

- **Hero:** copy, badge y CTAs no coinciden; productivo usa headline distinto («Inteligencia artificial…» vs «Transformamos empresas con…»), icono checkmark vs logo foto animado, stats con labels diferentes.
- **Testimonials:** referencia incluye sección **fondo blanco** con cards Banco Santa Cruz y doevents.com; productivo mantiene tema oscuro sin esa estructura.
- **Secciones:** títulos de Partners, Services, Solutions, Impact y CTA final usan copy y jerarquía distintos a Lovable.
- **Footer:** grid 3 columnas vs 5 columnas de referencia.

### 2. `/about` y `/services` (P0)

- Layout de hero, grids y espaciado de sección difieren de forma consistente (6,6%–12,3% diff).
- Services: grid de 5 pilares y headings no alineados con `ServicesGrid` Lovable.

### 3. `/contact` (P1)

- Título de página, sidebar (cards contacto/horario/partner) y proporción formulario vs referencia.
- Estilos de inputs y botón submit con delta visual moderado (4,3%–7,3%).

### 4. Responsive (P1)

- Móvil y tablet muestran **mayor** diff que desktop en todas las rutas; home móvil es el peor caso (23,45%).

---

## Gaps accionables

Lista consolidada en `gaps-paridad.json` (8 P0 + 2 P1). Prioridad de remediación:

1. **VP-P0-001** — Design system (tokens, tipografías, gradientes)
2. **VP-P0-002** — Header + NovusLogo
3. **VP-P0-003** — Hero landing
4. **VP-P0-004** — Testimonials (fondo claro)
5. **VP-P0-005** — Secciones landing restantes
6. **VP-P0-006** — Footer 5 columnas
7. **VP-P0-007** — AboutPage
8. **VP-P0-008** — ServicesPage
9. **VP-P1-001** — ContactPage
10. **VP-P1-002** — Responsive breakpoints

---

## Remediación y siguiente agente

| Acción | Responsable |
|--------|-------------|
| Corregir gaps P0/P1 en NovusIntelligenceWEB | **frontend-integration-agent** |
| Re-ejecutar `visual-parity-check` | visual-parity-agent |
| Merge + deploy DEV automático | Solo tras `status: PASS` (ADR-0006) |

**nextAgentSuggested:** `frontend-integration-agent`

---

## Notas metodológicas

- Plan `approved` verificado (`plan-implementacion.md`).
- Sin copia de código Lovable; comparación pixel-a-pixel sobre intención visual.
- Animaciones congeladas (`prefers-reduced-motion` + CSS override) según reglas.
- Referencia servida vía dev local por ausencia de `NADF_LOVABLE_REFERENCE_URL` en el entorno Cloud Agent; se recomienda configurar URL preview Lovable desplegada en CI para reproducibilidad.

---

## Referencias

- `.nadf/projects/novus-intelligence/rules/visual-parity-rules.md`
- `.nadf/projects/novus-intelligence/project-context.yml`
- `prototypes/m6-cloud-agent/src/visual-parity-check.ts`
- ADR-0006-visual-parity-and-auto-dev-deploy
