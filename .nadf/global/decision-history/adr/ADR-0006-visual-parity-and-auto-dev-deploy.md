# ADR-0006 — Paridad visual exacta + deploy automático solo a DEV

**Estado:** Accepted  
**Fecha:** 2026-07-14  
**Decisores:** framework-architect-agent, product owner Novus Intelligence  

## Contexto

1. El sitio DEV (`https://d1bfu6klutpp8m.cloudfront.net`) no iguala visualmente el diseño Lovable.
2. NADF prohíbe copiar código Lovable (`no_lovable_code_copy`).
3. El orquestador seguía en modo manual; el evento `lovable.commit` no disparaba el pipeline.
4. Se requiere automatización Lovable → FE/BE → deploy **solo DEV**.

## Decisión

1. Añadir agente **`visual-parity-agent`** (Validator) con gate bloqueante `visual_exact_parity` (diff ≤ 0.2% por captura).
2. Mantener **código productivo propio**; la paridad se mide por captura/diff, no por clonación de fuentes Lovable.
3. Activar MVP event-driven: push `novus-nexus` → `repository_dispatch` → workflow `Lovable sync DEV` → pipeline M6 → post-pipeline (merge gated + deploy DEV).
4. **`deploy.dev.auto_after_gates: true`**; PROD/QA siguen con aprobación humana.

## Consecuencias

### Positivas
- Feedback automático ante drift visual Lovable↔WEB.
- Cadena end-to-end usable sin orquestador M5 completo.
- Política de prod intacta.

### Negativas / trade-offs
- “Exacto” depende de URL de referencia Lovable estable y freeze de animaciones.
- El pipeline Cloud Agent puede superar horas; concurrency group evita solapes.
- Remediación puede requerir 1–N ciclos frontend hasta PASS.

## Alternativas rechazadas

| Alternativa | Motivo de rechazo |
|-------------|-------------------|
| Copiar CSS/JSX Lovable | Viola ADR-0001 / `no_lovable_code_copy` |
| Auto-deploy a PROD | Riesgo; fuera de política NADF |
| Solo QA subjetiva sin screenshots | No garantiza paridad exacta |

## Implementación

- Agente: `.claude/agents/visual-parity-agent.md`
- Checker: `prototypes/m6-cloud-agent/src/visual-parity-check.ts`
- Workflow GH: `.github/workflows/lovable-sync-dev.yml`
- Post: `prototypes/m6-cloud-agent/src/post-pipeline-dev.ts`
- Env DEV: `.nadf/projects/novus-intelligence/environments/dev.yml`
