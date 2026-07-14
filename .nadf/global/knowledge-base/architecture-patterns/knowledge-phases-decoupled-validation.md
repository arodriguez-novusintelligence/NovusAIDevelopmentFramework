# Patrón: Fases Knowledge desacopladas de validación operativa

## Contexto

Workflows NADF bloqueados por gates de Validation (paridad visual, reviewer pendiente) donde la cadena operativa se detiene pero el aprendizaje de la corrida debe consolidarse.

## Solución

1. **Completar fases Knowledge con workflow blocked.** Metrics, Reflection, KB update y evaluación ADR documentan aprendizajes aunque reviewer-agent no ejecute.
2. **Blackboard como insumo.** Publicar `resumen-ejecucion.md`, `metricas-ejecucion.json`, informes QA/Security/Paridad y `reflexion-ejecucion.md` antes de KB update.
3. **Reflexión explícita del estado blocked.** Documentar gates fallidos, secuencia de desbloqueo y `nextAgentSuggested`.
4. **KB update desde reflexión consolidada.** knowledge-base-agent incorpora patrones verificados sin esperar PASS completo de Validation.

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- Workflow blocked (`qualityScore: 62`) por VP-001 (paridad visual 0/12).
- QA y Security remediados en `main`; reviewer-agent pendiente.
- Fases Knowledge completadas: reflexión paso-13, métricas paso-12, KB update paso-14.
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/metricas-ejecucion.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `docs/reflection-learning.md`
- ADR-0002 (patrones multiagente — Blackboard)

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | PAT-006 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
