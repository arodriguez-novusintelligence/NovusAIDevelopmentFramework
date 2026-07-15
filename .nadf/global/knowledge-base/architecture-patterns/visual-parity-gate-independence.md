# Patrón: Gate visual_exact_parity desacoplado de gates técnicos

## Contexto

Workflows con gate `visual_exact_parity` (ADR-0006, umbral `threshold_max_diff_ratio: 0.002`). Aplica cuando QA, Security y build pasan pero el workflow permanece `blocked` por paridad visual.

## Solución

1. **Tratar visual_exact_parity como gate dominante post-funcional.** Es independiente de:
   - `build_success` (lint, compilación)
   - `security_pass` (IAM, rate limit, secrets)
   - `no_lovable_code_copy` / `no_mock_data_in_production`

2. **Separar qualityScore de workflowStatus** en informes y métricas:
   - `qualityScore: 78` puede coexistir con `status: blocked` si un gate bloqueante falla.
   - Documentar ambos explícitamente en `metricas-ejecucion.json`.

3. **No inferir readiness para deploy** desde gates técnicos PASS. El gate visual bloquea auto-deploy DEV (ADR-0006) aunque el código sea funcionalmente correcto.

4. **Orden de evaluación recomendado** en Validation:
   ```
   build/lint → security → visual_exact_parity → reviewer
   ```

## Ejemplo

Corrida novus-intelligence (2026-07-15):
- QA re-validación: `qualityScore: 100`, lint 0 errores en `main`.
- Security re-validación: `securityScore: 88`, PASS.
- Visual parity: 0/12 capturas PASS, `maxDiffRatio: 0.486653`.
- Workflow status: **blocked** (88,9 % gates bloqueantes pass).
- Evidencia: `artifacts/metricas-ejecucion.json`, `artifacts/resumen-metricas.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006-visual-parity-and-auto-dev-deploy
- `project-context.yml` → `visual_parity`, `quality_gates`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-010, ANTI-008, VP-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
