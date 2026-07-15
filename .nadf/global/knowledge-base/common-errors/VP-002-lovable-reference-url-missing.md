# Error: VP-002

## Síntoma

Paridad visual ejecutada con referencia Lovable ad-hoc (p. ej. novus-nexus local en `http://127.0.0.1:5173`) en lugar de URL estandarizada. Resultados no reproducibles entre corridas Cloud Agent ni entre agentes.

## Causa

Variable `NADF_LOVABLE_REFERENCE_URL` no configurada en `environments/dev.yml` ni en pipeline Cloud Agent. El visual-parity-agent usa fallback local documentado en `informe-paridad-visual.md`.

## Solución

1. Definir `NADF_LOVABLE_REFERENCE_URL` en `.nadf/projects/<proyecto>/environments/dev.yml`.
2. Inyectar la variable en invocaciones Cloud Agent (M6) según `docs/cloud-agent-integration.md`.
3. Alternativas válidas: preview URL de Lovable, build estático versionado en S3/CloudFront.

## Prevención

1. Incluir `reference_url_env: NADF_LOVABLE_REFERENCE_URL` en `project-context.yml` (visual_parity section).
2. Validar presencia de la variable en pre-handoff antes de visual-parity-agent.
3. Documentar URL de referencia y commit baseline en `cambios-lovable.json`.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/informe-paridad-visual.md`, `project-context.yml`
- Agente responsable configuración: devops-agent / workflow-agent

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-013, ANTI-006, VP-002 |
| Severidad | medium |
| Gate bloqueante | no (reproducibilidad) |
| Fecha | 2026-07-15 |
