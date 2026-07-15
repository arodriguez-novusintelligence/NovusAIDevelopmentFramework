# Error: VP-001

## Síntoma

Gate `visual_exact_parity` falla: 0/N capturas PASS. Umbral `threshold_max_diff_ratio ≤ 0.002` no alcanzado. En corrida novus-intelligence: 0/12 capturas (4 rutas × 3 viewports), `maxDiffRatio: 0.486653` en `/contact` @ 390×844.

QA y Security pueden estar en PASS simultáneamente; el workflow permanece `blocked`.

## Causa

Combinación típica de factores (no excluyentes):

1. **Assets de marca no integrados** (GAP-P0-001): logo, favicon, OG image ausentes en layout global.
2. **Alternancia tema ignorada** (GAP-P0-002/003): secciones con fondo claro implementadas como dark-first global.
3. **Copy/estructura divergente** (GAP-P0-004): secciones landing con contenido distinto a referencia Lovable.
4. **Candidato DEV desactualizado**: URL CloudFront puede ser despliegue previo, no de la corrida actual (coherente con `NO_DEPLOY`).

## Solución

1. Identificar gaps P0 por ruta/viewport en `resumen-metricas.md`.
2. Aplicar patrón `remediate_frontend_then_recheck`:
   - frontend-integration-agent remedia gaps.
   - visual-parity-agent re-ejecuta capturas.
3. Consultar checklists:
   - `architecture-patterns/visual-parity-brand-assets-checklist.md`
   - `architecture-patterns/hybrid-theme-section-alternation.md`

## Prevención

1. Checklist assets de marca en Fase 1 (CHG-013) antes de Validation paso 12.
2. Mapear secciones claro/oscuro por ruta gate en planning o `frontend-impact.md`.
3. No activar reviewer-agent hasta PASS de visual-parity-agent.
4. Documentar `visual_exact_parity` como gate independiente de build/lint/security.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/resumen-ejecucion.md`, `artifacts/resumen-metricas.md`, `artifacts/metricas-ejecucion.json`
- Agente responsable corrección: frontend-integration-agent
- Agente validación: visual-parity-agent

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-006, ANTI-007, ANTI-008, KB-008, KB-009, KB-010 |
| Severidad | critical |
| Gate bloqueante | visual_exact_parity |
| Status | active (2026-07-15) |
| Fecha | 2026-07-15 |
