# Patrón: Paridad visual pre-merge en rama feature

## Contexto

Workflows `lovable-to-web` donde frontend-integration-agent mergea a `main` sin validación visual previa. El gate `visual_exact_parity` falla tardíamente en Validation, generando ciclos de re-trabajo costosos post-merge.

## Solución

Flujo recomendado:

```
frontend-integration-agent (implementación)
  → visual-parity-agent (rama cursor/*)
  → remediar gaps P0 en gaps-paridad.json
  → visual-parity-agent re-run (12/12 PASS)
  → merge a main
  → qa-agent + security-agent (revalidación post-merge)
  → reviewer-agent
```

Reglas:

1. No mergear a `main` con `visual_exact_parity` FAIL o sin artefacto formal.
2. Ejecutar paridad en la misma rama donde se implementó el frontend.
3. Usar `gaps-paridad.json` como handoff obligatorio entre frontend-integration-agent y visual-parity-agent.

## Ejemplo

Anti-patrón detectado en novus-intelligence (2026-07-14):
- Frontend mergeado a `main` @ `cdd9f95` sin paridad previa.
- 0/12 capturas FAIL; `maxDiffRatio: 0.234509`.
- reviewer-agent y despliegue DEV automático bloqueados.
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006
- Workflow improvement WF-001 en `recomendaciones-kb.json`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-008, ANTI-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
