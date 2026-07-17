<!-- NADF-GUIDE
Propósito: Documenta Error: EXEC-001.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Error: EXEC-001

## Síntoma

frontend-integration-agent (u otro executor) entrega fase con build exitoso (`npm run build`) pero lint fallido (`npm run lint`). qa-agent detecta el fallo y bloquea el workflow, generando ciclo de re-validación evitable.

## Causa

Criterios de aceptación en `tareas-ejecutor.json` no incluyen lint como prerequisito de handoff. El executor considera «build OK» suficiente para marcar fase completa.

## Solución

1. Ejecutar `npm run lint` localmente antes de declarar fase terminada.
2. Corregir errores lint (p. ej. QA-001) antes de activar qa-agent.

## Prevención

1. Añadir `npm run lint` como criterio de aceptación en tareas de frontend-integration-agent y backend-agent.
2. Aplicar patrón `pre-handoff-executor-validation.md`.
3. Workflow improvement WF-002 en `recomendaciones-kb.json`.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/informe-qa.md`, `artifacts/resumen-frontend.md`
- Agente responsable: frontend-integration-agent

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | ANTI-005 |
| Severidad | medium |
| Gate bloqueante | indirecto (vía build_success) |
| Fecha | 2026-07-14 |
