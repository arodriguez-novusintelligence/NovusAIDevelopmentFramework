# Error: VP-001

## Síntoma

Gate `visual_exact_parity` en FAIL. Comparación pixel-a-pixel reporta 0/N capturas PASS con `maxDiffRatio` muy por encima del umbral `0.002`. En novus-intelligence: 0/12 capturas FAIL, `maxDiffRatio: 0.234509` (117× sobre umbral).

Rutas afectadas: `/`, `/about`, `/services`, `/contact` en viewports `1440x900`, `768x1024`, `390x844`.

## Causa

Combinación de anti-patrones detectados en reflexión:

1. **Paridad visual diferida** — Frontend mergeado a `main` sin validación visual previa (ANTI-001).
2. **Copy y layout divergentes** — Executor usó interpretación propia (`brand-context.md`) en lugar de alinear con referencia Lovable (ANTI-002).
3. **Candidato desactualizado** — CloudFront evaluado puede no reflejar `main` más reciente cuando `NO_DEPLOY` impide sincronización (ANTI-003).

## Solución

1. Consultar `gaps-paridad.json` — 13 gaps P0/P1 con acciones específicas por componente.
2. **frontend-integration-agent** remedia tokens, layout, copy y componentes según checklist en `visual-parity-remediation-checklist.md`.
3. Re-ejecutar `visual-parity-agent` hasta 12/12 capturas PASS (`diff_ratio ≤ 0.002`).
4. Solo entonces activar **reviewer-agent**.

## Prevención

1. Ejecutar paridad visual en rama feature **antes** de merge a `main` (`visual-parity-pre-merge.md`).
2. Validar copy contra preview Lovable, no solo `brand-context.md`.
3. Documentar `referenceUrl`, `referenceCommit` y `candidateCommit` en `visual-parity-result.json`.
4. Usar build local del candidato cuando `NO_DEPLOY` impide actualizar CloudFront.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`, `artifacts/visual-parity-result.json`
- Agente responsable corrección: frontend-integration-agent

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | VP-001, ANTI-001, ANTI-002, ANTI-003, KB-001 |
| Severidad | critical |
| Gate bloqueante | visual_exact_parity |
| Fecha | 2026-07-14 |
