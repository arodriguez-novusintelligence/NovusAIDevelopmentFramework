# Error: VP-003

## Síntoma

`visual-parity-agent` usa referencia Lovable distinta al baseline del plan (p. ej. commit `746c129` vs `e3a9819`). `NADF_LOVABLE_REFERENCE_URL` ausente en entorno. Riesgo de drift entre planning y validación visual.

## Causa

Variable de entorno `NADF_LOVABLE_REFERENCE_URL` no definida en `project-context.yml` ni en runtime del agente de paridad. El agente recurre a build local o URL por defecto que puede no coincidir con el commit analizado por `lovable-analyzer-agent`.

## Solución

1. Definir `NADF_LOVABLE_REFERENCE_URL` en entorno de paridad apuntando al commit/URL del baseline del plan.
2. Documentar en `informe-paridad-visual.md` la referencia usada y su alineación con `cambios-lovable.json`.
3. Si el baseline cambia, re-ejecutar planning o actualizar variable antes de nueva comparación.

## Prevención

1. Workflow improvement WF-004: `NADF_LOVABLE_REFERENCE_URL` obligatoria cuando `visual_parity.enabled: true`.
2. Incluir commit de referencia en `plan-implementacion.md` y verificar coincidencia en paridad.
3. Checklist pre-paridad visual (KB-008, ítem 1): referencia fijada y alineada.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/informe-paridad-visual.md`, `artifacts/gaps-paridad.json`
- Config: `project-context.yml` → `visual_parity.reference_url_env`
- Estado: **activo** (seguimiento)

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-008 |
| Severidad | medium |
| Gate bloqueante | no (riesgo de falsos positivos/negativos en paridad) |
| Fecha | 2026-07-14 |
| Estado | active |
