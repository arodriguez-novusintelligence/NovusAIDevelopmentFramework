# Open Risks — NADF v1.1.0-rc.1

| ID | Riesgo | Severidad | Mitigación / próximo paso |
|----|--------|-----------|---------------------------|
| R1 | Connectors MCP / orquestador E2E no probados en runtime | Media | Gate para GA `1.1.0`; mantener experimental |
| R2 | Detección de ciclos profundos en workflows genéricos limitada | Baja | Extender validator post-RC |
| R3 | Dualidad versión producto histórica `2.x` vs distribución `1.1.0-rc.1` | Baja | Documentada en migration guide; usar manifiesto como fuente |
| R4 | Schemas `$id` usan host lógico `nadf.novusintelligence.local` | Baja | Registry local offline en validator |
| R5 | Referencias a `Documentacion/` fuera del repo Framework | Baja | Paths externos; no bloquean validate repository |
| R6 | Tag git `v1.1.0-rc.1` aún no creado | Info | Manual bajo solicitud explícita |

Ningún riesgo abre **BLOCKED** para release candidate contractual.
