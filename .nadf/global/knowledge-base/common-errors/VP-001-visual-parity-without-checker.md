# Error: VP-001 — Paridad visual declarada sin checker automatizado

## Síntoma

Gate `visual_exact_parity` falla con 0/12 capturas PASS y `maxDiffRatio` hasta 0,096091 (umbral 0,002), mientras `resumen-frontend.md` reportó paridad ✅ por comparación manual subjetiva.

En la corrida novus-intelligence: peor captura en `/` @ 390×844; `reviewer-agent` bloqueado correctamente.

## Causa

Anti-patrón **ANTI-VP-001**: `frontend-integration-agent` declaró paridad visual sin artefacto `visual-parity-result.json` generado por checker Playwright+pixelmatch. La revisión manual no detecta drift en tokens oklch, geometría de botones ni layout móvil.

## Solución

1. **No declarar paridad PASS** en `resumen-frontend.md` sin `visual-parity-result.json`.
2. Ejecutar **visual-parity-agent** con rutas gate × viewports según `project-context.yml`:
   - Rutas: `/`, `/about`, `/services`, `/contact`
   - Viewports: 1440×900, 768×1024, 390×844
3. Remediar gaps según `gaps-paridad.json` y orden en `visual-parity-remediation-order.md`.
4. Re-ejecutar checker hasta 12/12 PASS con `maxDiffRatio ≤ 0.002`.

## Prevención

1. Gate WF-002: obligatoriedad de `visual-parity-result.json` en handoff frontend → validation.
2. Incluir visual-parity-agent en checklist pre-handoff cuando `visual_parity.enabled: true`.
3. No sustituir pixelmatch por QA responsive estático (ver `static-qa-responsive-seo.md`).

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/resumen-frontend.md`, `artifacts/informe-paridad-visual.md`, `artifacts/visual-parity-result.json`, `artifacts/gaps-paridad.json`
- Agente responsable corrección: frontend-integration-agent → visual-parity-agent

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-VP-001, KB-010, VP-001 |
| Severidad | critical |
| Gate bloqueante | visual_exact_parity |
| Fecha | 2026-07-16 |
