# Patrón: Plan approved antes de ejecución productiva

## Contexto

Workflows NADF de implementación (Lovable→Web, feature-implementation) deben respetar la separación Planning → Plan Review → Execution del Meta Model. Ningún agente ejecutor modifica repos productivos sin plan `approved`.

## Solución

1. **Planning:** lovable-analyzer-agent + planner-agent + backend-impact-agent generan plan e impacto.
2. **Plan Review:** architect-agent evalúa y aprueba (`status: approved`) o rechaza.
3. **Execution:** Solo tras aprobación, frontend/backend/cloud agents modifican código productivo.

### Beneficios verificados

- Trazabilidad CHG-xxx verificable en cada fase
- Autorización explícita antes de merge a `main`
- Gates `PLAN_MUST_BE_APPROVED` verificables en métricas

### Evidencia en métricas

```json
{
  "planId": "PLAN-NOVUS-LOVABLE-2026-07-14",
  "planApproved": true
}
```

## Ejemplo

- Plan: PLAN-NOVUS-LOVABLE-2026-07-14 — 9 fases, mitigaciones R-001 a R-008
- Aprobación: architect-agent en paso 06

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Patrón: PAT-001 en `artifacts/recomendaciones-kb.json`
- Meta Model: separación semántica planificación/ejecución
