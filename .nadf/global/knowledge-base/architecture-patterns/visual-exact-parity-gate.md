# Patrón: Gate visual_exact_parity como filtro independiente

## Contexto

Workflows `lovable-to-web` con validación estática (build, lint, responsive, SEO) en PASS pero desviaciones visuales materiales respecto al prototipo Lovable. Aplica cuando `visual_parity.enabled: true` en `project-context.yml`.

## Solución

1. **Gate independiente de QA estático.** El checker pixel-a-pixel detecta desviaciones en copy, layout, tokens y componentes que análisis de código no captura.
2. **Umbral bloqueante.** `threshold_max_diff_ratio: 0.002` por ruta/viewport (ADR-0006).
3. **Rutas y viewports fijos.** Definidos en `project-context.yml`: `/`, `/about`, `/services`, `/contact` × `1440x900`, `768x1024`, `390x844`.
4. **Bloqueo en cadena.** FAIL en `visual_exact_parity` impide reviewer-agent y despliegue DEV automático aunque otros gates pasen.
5. **Artefactos obligatorios.** `visual-parity-result.json`, `gaps-paridad.json`, `informe-paridad-visual.md`.

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- QA `qualityScore: 100`; Security `securityScore: 82` (PASS condicional DEV).
- Paridad: 0/12 capturas PASS; `maxDiffRatio: 0.234509`.
- Desviaciones: hero copy/CTA, grids 3-col vs 5-col, testimonios fondo oscuro vs blanco, footer 4 vs 5 columnas.
- Evidencia: `artifacts/informe-paridad-visual.md`, `artifacts/gaps-paridad.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006 (visual parity y auto-deploy DEV)

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | PAT-007 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
