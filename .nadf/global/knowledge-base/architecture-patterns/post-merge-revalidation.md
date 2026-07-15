# Patrón: Re-validación post-merge obligatoria

## Contexto

Workflows multi-repo donde la corrida inicial de Validation falla en ramas `cursor/*` y el código se integra después a `main`. Los artefactos `qa-result.json` y `security-result.json` de la corrida inicial quedan obsoletos.

## Solución

Tras merge de ramas feature a `main`:

1. **Re-ejecutar qa-agent** sobre `main` (no sobre ramas feature).
2. **Re-ejecutar security-agent** sobre `main`.
3. **Conservar IDs de hallazgo trazables** (QA-001, SEC-001-v1, SEC-002-v1) para verificar remediación.
4. **Actualizar métricas** con qualityScore post-merge antes de declarar gates técnicos en PASS.

No asumir que gates PASS en feature branch implican PASS en `main` tras merge.

## Ejemplo

Corrida novus-intelligence (2026-07-14 → 2026-07-15):
- Corrida inicial: qualityScore 62 (QA-001 lint FAIL, SEC-001/002 FAIL).
- Merge a `main`: frontend @ `2634029`, backend @ `c929e2b`.
- Re-validación 2026-07-15: QA PASS (100), Security PASS (89).
- qualityScore elevado a 78; paridad visual sigue FAIL (independiente).
- Evidencia: `artifacts/informe-qa.md`, `artifacts/informe-seguridad.md`, `artifacts/metricas-ejecucion.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `architecture-patterns/multi-repo-feature-branch-validation.md` (validación en feature branch)
- `docs/reflection-learning.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-011, PAT-005 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
