<!-- NADF-GUIDE
Propósito: Documenta Ejemplos ejecutables.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Ejemplos ejecutables

## Sample 1

GitHub Issue con label `sample1` → Requirement → aprobación → cambio limitado
a `examples/sample1-app/` → pruebas → AWS DEV `sample1-*`.

Nunca escribe en repositorios del producto Novus.

## Sample 2

Entrada `initiative.yml` (iniciativa con varios requerimientos en
`requests/REQ-*.yml`) → intake y gate de aprobación por requerimiento →
pruebas por requerimiento → API REST (2 Lambdas + DynamoDB) → AWS DEV
`sample2-*`. El runner `run_nadf.py` genera la evidencia y reporta las URLs
de los endpoints desplegados.

## Uso

Los samples sirven para demostración y capacitación. Una Customer Distribution
puede copiarlos como plantilla, pero no comparte sus stacks con Novus ni con
otro cliente. Ambos prohíben PROD y esperan deploy CI/OIDC.
