# Error: VP-001

## Síntoma

Gate `visual_exact_parity` falla: 0/N capturas PASS. `maxDiffRatio` supera el threshold 0.002 (0.2 %). En novus-intelligence: 0/12 capturas; maxDiffRatio 0.449 en `/contact` 390×844.

## Causa

Combinación típica de gaps P0 en traducción Lovable→Web:

| ID gap | Categoría | Impacto |
|--------|-----------|---------|
| GAP-P0-001 | Assets de marca no conectados | Transversal (logo placeholder) |
| GAP-P0-002 | Tema híbrido ignorado (`/contact`) | Diff crítico 42–45 % |
| GAP-P0-003 | Secciones con fondo claro ausentes | Landing testimonios |
| GAP-P0-004 | Deriva copy/estructura vs Lovable | Solutions, Impact, CTA |

Los gates técnicos (build, lint, security) pueden estar en PASS simultáneamente.

## Solución

1. frontend-integration-agent remedia gaps P0 documentados en `gaps-paridad.json`.
2. Verificar checklist assets de marca (`architecture-patterns/brand-assets-pre-visual-parity.md`).
3. Aplicar tema híbrido por sección (`architecture-patterns/hybrid-light-dark-section-theming.md`).
4. Re-ejecutar visual-parity-agent; gate PASS obligatorio antes de reviewer-agent.

## Prevención

1. Prerequisito `brand_assets_wired` antes de paridad visual.
2. Checklist tema híbrido en planning (WF-004).
3. Paridad visual advisory tras Fase 1 layout (WF-003).
4. Configurar `NADF_LOVABLE_REFERENCE_URL` para referencia reproducible.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`, `artifacts/visual-parity-result.json`
- Agente responsable corrección: frontend-integration-agent

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | VP-001, ANTI-001, ANTI-002, ANTI-003, ANTI-004 |
| Severidad | critical |
| Gate bloqueante | visual_exact_parity |
| Fecha | 2026-07-15 |
