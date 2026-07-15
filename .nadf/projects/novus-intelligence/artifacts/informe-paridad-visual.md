# Informe de paridad visual — novus-intelligence

**Agente:** visual-parity-agent  
**Paso:** paso-12-paridad-visual  
**Fecha:** 2026-07-15  
**Plan:** `plan-implementacion.md` — status `approved`  
**Gate:** `visual_exact_parity`

## Resultado

| Campo | Valor |
|-------|-------|
| **Status** | **FAIL** |
| **Umbral maxDiffRatio** | 0.002 (0,2 % píxeles distintos por captura) |
| **maxDiffRatio observado** | 0.448786 (`/contact`, 390×844) |
| **Capturas evaluadas** | 12 (4 rutas × 3 viewports) |
| **Capturas PASS** | 0 |
| **Referencia** | `http://127.0.0.1:5173` (novus-nexus dev local — `NADF_LOVABLE_REFERENCE_URL` no definida en runtime) |
| **Candidato DEV** | `https://d1bfu6klutpp8m.cloudfront.net` |

> **Nota de referencia:** La variable `NADF_LOVABLE_REFERENCE_URL` no estaba disponible en el entorno Cloud Agent. Se usó el build local de **novus-nexus** (`npm run dev`) como fuente de intención Lovable, conforme a `visual-parity-rules.md` (preview o build de novus-nexus).

## Métricas por ruta/viewport

| Ruta | Viewport | Diff ratio | Umbral | Pass |
|------|----------|------------|--------|------|
| `/` | 1440×900 | 0.187420 | 0.002 | NO |
| `/about` | 1440×900 | 0.042955 | 0.002 | NO |
| `/services` | 1440×900 | 0.048594 | 0.002 | NO |
| `/contact` | 1440×900 | 0.428979 | 0.002 | NO |
| `/` | 768×1024 | 0.181712 | 0.002 | NO |
| `/about` | 768×1024 | 0.042408 | 0.002 | NO |
| `/services` | 768×1024 | 0.082172 | 0.002 | NO |
| `/contact` | 768×1024 | 0.412139 | 0.002 | NO |
| `/` | 390×844 | 0.215616 | 0.002 | NO |
| `/about` | 390×844 | 0.113603 | 0.002 | NO |
| `/services` | 390×844 | 0.064966 | 0.002 | NO |
| `/contact` | 390×844 | 0.448786 | 0.002 | NO |

Screenshots y diffs generados en `artifacts/visual-parity-shots/` (no versionados; regenerables con `npm run visual-parity-check`).

## Hallazgos principales (análisis visual)

### P0 — Bloqueantes de paridad

1. **Logo de marca ausente/incorrecto (global)**  
   El candidato DEV muestra un icono genérico (checkmark circular) en header y footer. La referencia Lovable usa el logo **Novus Intelligence** con monograma en gradiente y wordmark. Impacto transversal en las 4 rutas.

2. **`/contact` — inversión de tema en zona de formulario (crítico)**  
   Referencia: hero oscuro + **sección clara/blanca** con tarjetas de información y formulario en fondo blanco con sombra.  
   Candidato: **tema oscuro continuo** en toda la página; tarjetas y formulario sobre superficie oscura.  
   Diff ratio 42–45 % en todos los viewports — el gap más severo del gate.

3. **`/` — sección testimonios/casos con fondo claro ausente**  
   Referencia: bloque «Clientes que confían» con **fondo blanco/gris claro** y cards blancas (Banco Santa Cruz, doevents.com).  
   Candidato: sección «Resultados que hablan por sí solos» permanece en tema oscuro; estructura y copy distintos.

4. **`/` — secciones de contenido no alineadas con Lovable**  
   - Título soluciones: referencia «Inteligencia aplicada para empresas en evolución» vs candidato «Productos listos para impacto inmediato».  
   - Bloque impacto: referencia «Impacto que generamos» con 4 cards descriptivas vs candidato con métricas numéricas (3+, 6, 24/7, Bogotá).  
   - CTA final: copy y botones difieren («Hablemos sobre cómo la IA puede transformar tu negocio» vs «¿Listo para construir inteligencia autónoma?»).

### P1 — Diferencias materiales secundarias

5. **`/about` — bloque CTA inferior**  
   Referencia usa sección «Empieza hoy» con headline y botones distintos al candidato. Diff ~4–11 % según viewport.

6. **`/services` — tokens y espaciado**  
   Layout general coherente pero diff 4,9–8,2 % por variaciones en tipografía, padding de cards y gradientes.

7. **Footer — datos de contacto inconsistentes**  
   Referencia landing usa `hola@novusintelligence.co`; candidato y otras rutas usan `arodriguez@novusintelligencesolutions.com`. Año copyright varía (2024 vs 2026 en contact).

8. **Gradientes y tipografía**  
   Matiz de gradientes brand (cyan→purple) y pesos de fuente display ligeramente distintos entre stacks.

## Decisión del gate

**FAIL** — Ninguna captura cumple `maxDiffRatio ≤ 0.002`. El workflow queda **bloqueado** para merge/deploy DEV automático hasta remediación.

## Remediación requerida

1. **`frontend-integration-agent`** debe abordar gaps P0/P1 en `gaps-paridad.json` **sin copiar código Lovable**.
2. Priorizar `/contact` (tema claro en formulario) y logo de marca (assets en `public/assets/novus/`).
3. Re-alinear secciones landing (`/`) con intención Lovable: testimonios fondo claro, títulos y bloque impacto.
4. Re-ejecutar `visual-parity-check` tras cambios; gate PASS obligatorio para continuar pipeline.

## Comando de re-verificación

```bash
cd prototypes/m6-cloud-agent
NADF_LOVABLE_REFERENCE_URL=http://127.0.0.1:5173 \
NADF_DEV_FRONTEND_URL=https://d1bfu6klutpp8m.cloudfront.net \
npm run visual-parity-check
```

## Referencias

- `rules/visual-parity-rules.md`
- `project-context.yml` → `visual_parity`
- Checker: `prototypes/m6-cloud-agent/src/visual-parity-check.ts`
- ADR-0006-visual-parity-and-auto-dev-deploy
