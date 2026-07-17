# Visión: control plane y consola

La consola multi-tenant es una evolución, no parte de esta reestructuración.
Consumirá los contratos `execution-report` y `metrics-summary` para mostrar
instancias, gates, budget, riesgo y evidencia.

El MVP operativo sigue siendo GitHub labels/comments + YAML/JSON + Cursor/CI.
Esto permite vender e implantar NADF en empresas aisladas sin esperar un SaaS.

Una futura consola deberá aislar tenants, usar RBAC, no almacenar secretos de
ejecución y respetar que cada cliente opera su propia Customer Distribution.
