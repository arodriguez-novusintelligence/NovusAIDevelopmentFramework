# Informe de paridad visual — Novus Intelligence

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-12-paridad-visual  
**Agente:** visual-parity-agent  
**Fecha:** 2026-07-14  
**Gate:** `visual_exact_parity`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)

---

## Resultado

| Campo | Valor |
|-------|-------|
| **Status** | **FAIL** |
| **Umbral maxDiffRatio** | 0.002 (0.2%) |
| **maxDiffRatio observado** | 0.12307 (12.31%) — `/about` @ 390×844 |
| **Capturas evaluadas** | 12 (4 rutas × 3 viewports) |
| **Capturas PASS** | 0 / 12 |
| **Remediación requerida** | Sí |
| **Próximo agente** | `frontend-integration-agent` |

---

## URLs comparadas

| Rol | URL |
|-----|-----|
| Referencia Lovable | `http://127.0.0.1:5173` (novus-nexus local @ baseline `e3a9819`) |
| Candidato DEV | `https://d1bfu6klutpp8m.cloudfront.net` |

> **Nota:** `NADF_LOVABLE_REFERENCE_URL` no estaba definida en el entorno Cloud Agent. Se usó build local de `novus-nexus` como referencia autorizada según `project-context.yml` (`lovable_source: novus-nexus`).

---

## Métricas por ruta y viewport

| Ruta | Viewport | Diff ratio | Umbral | Pass | Diff image |
|------|----------|------------|--------|------|------------|
| `/` | 1440×900 | 0.063416 | 0.002 | NO | `visual-parity-shots/desktop-home-diff.png` |
| `/about` | 1440×900 | 0.066117 | 0.002 | NO | `visual-parity-shots/desktop-about-diff.png` |
| `/services` | 1440×900 | 0.066206 | 0.002 | NO | `visual-parity-shots/desktop-services-diff.png` |
| `/contact` | 1440×900 | 0.042823 | 0.002 | NO | `visual-parity-shots/desktop-contact-diff.png` |
| `/` | 768×1024 | 0.088866 | 0.002 | NO | `visual-parity-shots/tablet-home-diff.png` |
| `/about` | 768×1024 | 0.101771 | 0.002 | NO | `visual-parity-shots/tablet-about-diff.png` |
| `/services` | 768×1024 | 0.087895 | 0.002 | NO | `visual-parity-shots/tablet-services-diff.png` |
| `/contact` | 768×1024 | 0.061095 | 0.002 | NO | `visual-parity-shots/tablet-contact-diff.png` |
| `/` | 390×844 | 0.107082 | 0.002 | NO | `visual-parity-shots/mobile-home-diff.png` |
| `/about` | 390×844 | 0.123070 | 0.002 | NO | `visual-parity-shots/mobile-about-diff.png` |
| `/services` | 390×844 | 0.105514 | 0.002 | NO | `visual-parity-shots/mobile-services-diff.png` |
| `/contact` | 390×844 | 0.073206 | 0.002 | NO | `visual-parity-shots/mobile-contact-diff.png` |

Todas las capturas superan el umbral entre **31×** y **61×** el límite permitido.

---

## Hallazgos principales (inspección visual)

### 1. Design system global (P0)

- Paleta de fondo y acentos (navy profundo, cyan, púrpura oklch) no coincide pixel-a-pixel.
- Tipografía: headlines y body con pesos/tamaños distintos; posible FOUT o fuentes no cargadas idénticamente.
- Sombras glow y gradientes de marca aplicados con intensidad diferente.

### 2. Header / Footer compartidos (P0)

- CTA del header: referencia usa **"Agendar una demo"**; candidato **"Solicita una demo"**.
- Footer: estructura de columnas y distribución de enlaces (servicios, soluciones, legales) difiere.
- Underline gradiente en navegación activa ausente o distinto en candidato.

### 3. Landing `/` (P0)

- Hero: copy principal distinto; falta botón **"Ver simulación"** y componente interactivo NADF en panel derecho.
- Stats inline (Partners Cloud, Foco, Sede) con layout diferente.
- Sección impacto: referencia usa 4 cards (Productividad, Costos, Calidad, Escalabilidad); candidato usa stats numéricos (3+, 6, 24/7, Bogotá).
- Títulos de sección con copy alternativo en pilares, soluciones y casos.

### 4. `/about` (P0 — peor resultado)

- Hero 2 columnas con colisión de headings y perfil founder duplicado.
- Cards misión/visión/valores con espaciado incorrecto.
- CTA final con copy y botones superpuestos respecto a referencia.

### 5. `/services` (P0)

- Grid de 5 pilares con columnas, iconos y tags tech desalineados respecto a Lovable.

### 6. `/contact` (P1)

- Sidebar de 3 cards (contacto, horario, partner AWS) con ratio de columnas distinto.
- Formulario con espaciado y labels desalineados; menor diff relativo (4.3% desktop).

### 7. Responsive (P0)

- Móvil y tablet muestran diffs mayores que desktop en todas las rutas, señal de breakpoints y menú móvil no remediados.

---

## Gaps accionables

Ver lista priorizada en `gaps-paridad.json` (8 gaps: 7 P0, 1 P1).

---

## Decisión del gate

**BLOQUEADO** — No se autoriza merge ni deploy DEV automático hasta `status: PASS` en `visual-parity-result.json`.

### Próximos pasos

1. Invocar **`frontend-integration-agent`** con `gaps-paridad.json`.
2. Remediar gaps P0/P1 **sin copiar código Lovable** (reimplementar intención en React/TS/Tailwind).
3. Re-ejecutar `visual-parity-check` tras nuevo deploy DEV.
4. Solo con PASS → continuar workflow (merge + deploy DEV automático).

---

## Artefactos generados

- `visual-parity-result.json`
- `informe-paridad-visual.md` (este documento)
- `gaps-paridad.json`
- `visual-parity-shots/` (36 PNG: reference, candidate, diff × 12 capturas)

---

## Restricciones respetadas

- [x] NO_DEPLOY — no se desplegó
- [x] NO_LOVABLE_CODE_COPY — solo comparación visual
- [x] PLAN_MUST_BE_APPROVED — plan en status `approved`
- [x] NO_SECRETS_IN_REPO — sin credenciales en artefactos
