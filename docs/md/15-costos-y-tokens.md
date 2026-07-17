# Costos, budget y selección de agentes

Estimaciones internas (no SLA ni precio de venta), suponiendo referencia de
USD 6 por millón de tokens:

- Full-quality: ~USD 380/mes.
- Balanced: ~USD 280/mes.
- Cost-optimized con poda: ~USD 205/mes.
- Smoke-heavy: ~USD 110/mes.

El cliente debe contrastar con facturación real de Cursor/modelos. AWS de un
sample serverless inactivo suele ser de bajo coste, pero se mide aparte.

`budget-policy.yml` bloquea nuevas invocaciones al alcanzar topes y
`agent-selection.yml` registra el efecto NONE/LOW/MEDIUM/HIGH/BLOCKING al
desactivar agentes. Security y QA son BLOCKING en presets productivos.
