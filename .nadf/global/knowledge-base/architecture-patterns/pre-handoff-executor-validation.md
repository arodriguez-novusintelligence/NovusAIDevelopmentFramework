# Patrón: Checklist pre-handoff executor → validation

## Contexto

Antes de activar agentes de validación (qa-agent, security-agent, visual-parity-agent) en workflows multi-repo, los ejecutores deben verificar que el código y los artefactos del Blackboard están listos. Omitir este handoff provoca revalidaciones costosas post-merge.

## Solución

Checklist de 5 puntos antes de handoff:

| # | Verificación | Responsable | Gate relacionado |
|---|-------------|-------------|------------------|
| 1 | `npm run lint` sin errores en repos productivos | frontend/backend-agent | `build_success` |
| 2 | Diff `serverless.yml` ↔ `propuesta-infra.md` (IAM, CORS, región) | backend/cloud-agent | `security_pass` |
| 3 | Artefactos `resumen-{frontend,backend,cloud}.md` publicados en Blackboard | documentation-agent | trazabilidad |
| 4 | `pipeline-config.md` existe si `requires_infra: true` | devops-agent | `execution_completion` |
| 5 | Smoke paridad visual en `/` y `/about` (1–2 rutas) | frontend-integration-agent | `visual_exact_parity` |

### Criterio de avance

Solo activar validation cuando los puntos 1–3 están en PASS. Los puntos 4–5 son recomendados pero su omisión ha causado bloqueos en novus-intelligence (DEVOPS-001, VP-001).

## Ejemplo

Workflow `novus-intelligence-lovable-to-web`: QA alcanzó PASS tras merge pero security y paridad visual fallaron por gaps no detectados en Execution.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Recomendación: KB-004 en `artifacts/recomendaciones-kb.json`
- Anti-patrón: ANTI-002, ANTI-004 en `artifacts/recomendaciones-kb.json`
