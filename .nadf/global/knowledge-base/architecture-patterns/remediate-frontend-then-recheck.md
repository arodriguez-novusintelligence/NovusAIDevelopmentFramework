# Patrón: Flujo remediate_frontend_then_recheck

## Contexto

Workflows `lovable-to-web` bloqueados por gate `visual_exact_parity` con gaps P0 identificados en rutas gate. Aplica tras fallo de visual-parity-agent cuando QA y Security ya están en PASS.

## Solución

Secuencia reutilizable de desbloqueo:

```mermaid
flowchart LR
    GAP[GAP-P0 identificados] --> FE[frontend-integration-agent]
    FE --> VP[visual-parity-agent re-run]
    VP --> REV[reviewer-agent]
    REV --> DEPLOY[deploy_human_approval]
```

| Orden | Agente | Acción |
|-------|--------|--------|
| 1 | reflection-agent / metrics-agent | Consolidar gaps P0 por ruta y viewport en Blackboard |
| 2 | frontend-integration-agent | Remediar divergencias (assets, tema, copy, estructura) |
| 3 | visual-parity-agent | Re-ejecutar capturas (rutas gate × viewports configurados) |
| 4 | reviewer-agent | Revisión de coherencia si visual parity PASS |
| 5 | reflection-agent | Re-ejecutar si cambia bloqueante dominante |

**Paralelizable:** devops-agent (`pipeline-config.md`, DEVOPS-001) no bloquea pasos 2–3.

**Complemento:** `resumen-frontend.md` documenta iteraciones proactivas previas al gate formal; acelera convergencia pero no sustituye visual-parity-agent (PAT-007).

## Ejemplo

Corrida novus-intelligence (2026-07-15):
- Bloqueante activo: VP-001 (0/12 capturas).
- Gaps P0: GAP-P0-001 (assets), GAP-P0-002 (contacto claro), GAP-P0-003 (testimonios), GAP-P0-004 (landing copy).
- QA-001, SEC-001, SEC-002 remediados en `main` independientemente de paridad.
- Próximo agente: frontend-integration-agent.
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/recomendaciones-kb.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `architecture-patterns/visual-parity-brand-assets-checklist.md`
- `architecture-patterns/hybrid-theme-section-alternation.md`
- ADR-0006

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-011, PAT-007, VP-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
