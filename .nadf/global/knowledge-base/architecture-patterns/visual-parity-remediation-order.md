# Patrón: Orden de remediación paridad visual Lovable→Web

## Contexto

Workflow `lovable-to-web` bloqueado por gate `visual_exact_parity` FAIL (p. ej. VP-001 con 0/12 capturas PASS). Los gaps visuales se acumulan: corregir componentes individuales antes de tokens globales o geometría base multiplica iteraciones y no reduce `maxDiffRatio` de forma efectiva.

Aplica cuando `visual_parity.enabled: true` en `project-context.yml` y existe `gaps-paridad.json` con items P0 abiertos.

## Solución

### Secuencia P0 (orden obligatorio)

| Orden | Gap ID | Área | Razón |
|-------|--------|------|-------|
| 1 | VP-GAP-001 | design-tokens | Gradientes y colores afectan todas las rutas y viewports |
| 2 | VP-GAP-002 | Button | Geometría pill vs `rounded-md` impacta Header, Hero, CTA y formulario |
| 3 | VP-GAP-003 | Header | Nav incompleta (6 vs 7 links) y spacing global |
| 4 | VP-GAP-004 | Hero | Eyebrow, H1, stats row y glow — peor caso en 390×844 |
| 5 | VP-GAP-005 | ContactForm | Inputs `h-11 rounded-xl` vs referencia `h-9 rounded-md` |
| 6 | VP-GAP-006 | Testimonials | Logos, badge flecha y fondo sección clara |

### Secuencia P1 (tras P0 en PASS)

VP-GAP-007 a VP-GAP-012: ServicesGrid, SolutionsGrid, ImpactStats, Footer, About, Services page.

### Reglas operativas

1. **Viewport más sensible:** `/` @ 390×844 es el peor caso observado (`maxDiffRatio` 0,096091).
2. **Re-ejecutar visual-parity-agent** tras cada lote P0 completo; objetivo 12/12 PASS con `maxDiffRatio ≤ 0.002`.
3. **CloudFront como candidato fiable.** Diff 0 entre build local y CloudFront DEV aísla fallos de implementación vs despliegue desactualizado.
4. **No declarar paridad** sin artefacto `visual-parity-result.json` (ver `common-errors/VP-001-visual-parity-without-checker.md`).

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-16):
- 0/12 capturas FAIL; bloqueo activo VP-001.
- QA lint remediado y security PASS (88); paridad visual impide `reviewer-agent`.
- Evidencia: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`, `artifacts/reflexion-ejecucion.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006
- `architecture-patterns/oklch-token-mapping-lovable-to-web.md`
- `architecture-patterns/visual-parity-revalidation-chain.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-009, VP-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-16 |
