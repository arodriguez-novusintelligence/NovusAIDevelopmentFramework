# Patrón: Fases Knowledge desacopladas de validación operativa

## Contexto

Workflows NADF bloqueados por gates de Validation (lint, security, paridad visual) donde reviewer-agent no puede ejecutarse. Aplica cuando la política de gates bloqueantes detiene la cadena operativa pero el aprendizaje de la corrida no debe perderse.

## Solución

1. **Completar fases Knowledge independientemente del estado blocked.** Metrics, reflection, KB update y evaluación ADR documentan aprendizajes aunque reviewer-agent no ejecute.
2. **Blackboard como memoria compartida.** Publicar `resumen-ejecucion.md`, `metricas-ejecucion.json`, informes QA/Security y `reflexion-ejecucion.md` antes de KB update.
3. **Reflexión explícita del estado blocked.** `reflexion-ejecucion.md` debe documentar gates fallidos, secuencia de desbloqueo y `nextAgentSuggested`.
4. **KB update desde reflexión consolidada.** knowledge-base-agent incorpora patrones y errores verificados sin esperar merge productivo.

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- Workflow blocked (qualityScore: 62) por QA-001, SEC-001/002, VP-001.
- reviewer-agent no ejecutado.
- Fases Knowledge completadas: 15 entradas KB, reflexión paso-17, ADR «No required».
- Evidencia: `artifacts/reflexion-ejecucion.md`, `artifacts/actualizacion-kb.md`, `artifacts/registro-adr.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `docs/reflection-learning.md`
- ADR-0002 (patrones multiagente — Blackboard)

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | PAT-007 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
