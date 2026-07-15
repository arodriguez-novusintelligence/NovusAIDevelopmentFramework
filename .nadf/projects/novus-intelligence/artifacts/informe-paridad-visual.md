# Informe de paridad visual — novus-intelligence

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-12-paridad-visual  
**Agente:** visual-parity-agent  
**Fecha:** 2026-07-15  
**Gate:** `visual_exact_parity`  
**Status:** **FAIL**  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)

---

## Resumen ejecutivo

Se ejecutó el checker `visual-parity-check` (Playwright + pixelmatch) comparando **12 capturas** (4 rutas × 3 viewports) entre la referencia Lovable (`novus-nexus` servido en `http://127.0.0.1:4173`, commit local main) y el candidato DEV (`https://d1bfu6klutpp8m.cloudfront.net`).

**Ninguna captura** cumple el umbral `maxDiffRatio ≤ 0.002`. El gate `visual_exact_parity` queda **bloqueado**. Se recomienda re-trabajo por `frontend-integration-agent` usando `gaps-paridad.json`.

| Métrica | Valor |
|---------|-------|
| Umbral | 0.002 (0,2 % píxeles distintos) |
| Capturas evaluadas | 12 |
| Capturas PASS | 0 |
| maxDiffRatio global | **0,486653** (`/contact` @ 390×844) |
| remediationRequired | true |

---

## Entorno de comparación

| Rol | URL | Notas |
|-----|-----|-------|
| Referencia Lovable | `http://127.0.0.1:4173` | `novus-nexus` — `npm run dev` (NADF_LOVABLE_REFERENCE_URL no definida en runtime; build local como referencia canónica) |
| Candidato DEV | `https://d1bfu6klutpp8m.cloudfront.net` | CloudFront sa-east-1 (project-context) |
| Animaciones | Congeladas | `prefers-reduced-motion` + CSS override en captura |

---

## Resultados por ruta y viewport

| Ruta | Viewport | diffRatio | Pass | Severidad |
|------|----------|-----------|------|-----------|
| `/` | 1440×900 | 0,090383 | NO | Alta |
| `/` | 768×1024 | 0,125190 | NO | Alta |
| `/` | 390×844 | 0,199459 | NO | Crítica |
| `/about` | 1440×900 | 0,042828 | NO | Media |
| `/about` | 768×1024 | 0,042150 | NO | Media |
| `/about` | 390×844 | 0,113666 | NO | Alta |
| `/services` | 1440×900 | 0,048502 | NO | Media |
| `/services` | 768×1024 | 0,081773 | NO | Alta |
| `/services` | 390×844 | 0,064882 | NO | Media |
| `/contact` | 1440×900 | 0,473607 | NO | **Crítica** |
| `/contact` | 768×1024 | 0,443244 | NO | **Crítica** |
| `/contact` | 390×844 | 0,486653 | NO | **Crítica** |

Screenshots de diff disponibles localmente en `.nadf/projects/novus-intelligence/artifacts/visual-parity-shots/` (no versionados).

---

## Hallazgos principales (inspección visual)

### P0 — `/contact` (diff ~44–49 %)

La divergencia más grave: el candidato DEV renderiza la zona de formulario con **tema claro** (cards blancas, fondo lavanda/blanco) mientras la referencia Lovable mantiene el **dark-first** continuo (cards semitransparentes navy, inputs oscuros, grid-bg). Afecta sidebar (Datos de contacto, Horario, Partner AWS) y formulario completo.

### P0 — `/` landing (diff ~9–20 %)

- Hero: diferencias en badge, proporción demo card, pills de stats y espaciado vertical.
- Secciones Solutions / Impact / Testimonials: copy, grid o contraste distinto (testimonios en cards claras vs referencia oscura).
- CTA final y Partners bar con alineación distinta.

### P1 — `/services`, `/about`, global

- **Services:** grid de pilares y hero con espaciado/tipografía desalineados.
- **About:** layout 2-col hero y cards misión/visión/valores con proporciones distintas.
- **Header/Footer:** copyright 2024 vs 2026, email footer distinto, posibles diferencias en columnas footer.

### P1 — Design tokens globales

El candidato alterna bloques de fondo claro donde la referencia mantiene `navy-deep` + acentos `gradient-brand`. Requiere auditoría de tokens antes de re-ejecutar checker.

---

## Gaps accionables

Ver lista priorizada en `gaps-paridad.json` (6 ítems: 2× P0, 4× P1).

---

## Remediación y siguiente agente

1. `frontend-integration-agent` corrige gaps P0 → P1 en NovusIntelligenceWEB (sin copiar código Lovable).
2. Re-desplegar DEV (fuera de alcance de este agente; `NO_DEPLOY`).
3. Re-ejecutar `visual-parity-check` hasta `status: PASS` en las 12 capturas.
4. Solo entonces proceder merge + auto-deploy DEV del workflow.

**nextAgentSuggested:** `frontend-integration-agent`

---

## Restricciones respetadas

- [x] Plan `approved` verificado
- [x] Sin copia de código Lovable
- [x] Sin despliegue (`NO_DEPLOY`)
- [x] Sin secrets en artefactos
- [x] Sin modificación de código productivo (Validator Pattern)
