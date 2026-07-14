# Error: VP-001

## Síntoma

Gate `visual_exact_parity` falla con 0/N capturas PASS. `maxDiffRatio` muy por encima del umbral (p. ej. 0.234509 vs 0.002). El frontend es funcionalmente correcto y pasa gates de código, pero la comparación pixel-a-pixel detecta desalineación masiva en layout, copy y tokens.

## Causa

Desalineación entre implementación productiva y referencia Lovable:
- Copy propio (`brand-context.md`, `src/content/`) diverge de headlines, CTAs y secciones de novus-nexus.
- Design tokens (colores, gradientes, sombras, tipografías) no producen el mismo render.
- Layout de componentes (grids, hero, header/footer) reimplementado con estructura distinta a la intención visual actual.

No es copia directa de código Lovable — es **desalineación visual** en reimplementación legítima.

## Solución

1. Consultar `gaps-paridad.json` como checklist priorizado (P0/P1).
2. Sincronizar copy, tokens y layout según checklist pre-paridad visual (KB-008).
3. Reimplementar componentes afectados sin copiar JSX/CSS literal de novus-nexus.
4. Re-ejecutar `visual-parity-agent` en rutas y viewports gate hasta `maxDiffRatio ≤ 0.002`.

Áreas críticas identificadas en novus-intelligence: Hero, Partners, secciones landing, Header/Footer, About, Services, Contact.

## Prevención

1. Ejecutar checklist pre-paridad visual antes del pixel-diff.
2. No usar solo `brand-context.md` propio si difiere de la referencia Lovable actual.
3. Fijar `NADF_LOVABLE_REFERENCE_URL` alineada con baseline del plan.
4. No declarar fase frontend completa sin PASS de `visual_exact_parity` (ver VP-002).

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/informe-paridad-visual.md`, `artifacts/gaps-paridad.json`, `artifacts/visual-parity-result.json`
- Agente responsable corrección: frontend-integration-agent
- Estado: **activo** (bloqueante)

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | VP-001, ANTI-006, KB-008 |
| Severidad | critical |
| Gate bloqueante | visual_exact_parity |
| Fecha | 2026-07-14 |
| Estado | active |
