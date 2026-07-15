# Error: VP-GAP-HERO-MOBILE

## Síntoma

Gate `visual_exact_parity` falla con `maxDiffRatio` elevado en landing `/` @ viewport 390×844. En la corrida novus-intelligence alcanzó **0,096091** (9,6 %) — la peor captura del run (12/12 FAIL).

## Causa

Desalineación pixel en stack hero/demo móvil: grid responsive, padding vertical, dimensiones del panel `NovusDevFrameworkDemo`, badges (PARTNERS CLOUD/FOCO/SEDE) y relación Hero ↔ Header sticky.

Componentes típicos afectados: `Hero.tsx`, `NovusDevFrameworkDemo.tsx`, `Header.tsx` (variante móvil).

## Solución

1. Comparar layout móvil contra referencia Lovable (`novus-nexus` @ 4173 o `NADF_LOVABLE_REFERENCE_URL`).
2. Ajustar en orden: grid `sm:` breakpoints → padding vertical hero → altura/padding header sticky → panel demo y badges.
3. Re-ejecutar `visual-parity-check` en `/` @ 390×844 tras cada cambio hasta `maxDiffRatio ≤ 0.002`.
4. No cerrar gap hasta PASS en captura piloto móvil.

## Prevención

1. Captura piloto `/` @ 390×844 en Fase 0 (ver `visual-parity-pre-merge-checklist.md`).
2. No confiar en QA responsive estático para validar hero móvil.
3. Congelar animaciones antes de capturar (referencia estable).

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`, `artifacts/visual-parity-result.json`
- Agente responsable corrección: frontend-integration-agent
- Prioridad: P0

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | VP-001, KB-011 |
| Severidad | critical |
| Gate bloqueante | visual_exact_parity |
| Fecha | 2026-07-15 |
