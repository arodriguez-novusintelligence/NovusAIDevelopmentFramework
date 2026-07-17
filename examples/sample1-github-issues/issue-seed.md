---
title: "[sample1] Añadir endpoint health"
labels: ["sample1"]
---
<!-- NADF-GUIDE
Propósito: Documenta issue seed.
Configuración: Adaptar IDs, paths y criterios del sample manteniendo aislamiento y PROD prohibido.
-->

## Necesidad

Como operador quiero consultar `GET /health` para verificar la disponibilidad.

## Criterios de aceptación

- Responde HTTP 200.
- El JSON contiene `status: ok`.
- Incluye prueba automatizada.
- Solo modifica `examples/sample1-app/`.
- No despliega a PROD.
