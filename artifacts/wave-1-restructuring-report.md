<!-- NADF-GUIDE
Propósito: Documenta Ola 1 — Informe de reestructuración.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Ola 1 — Informe de reestructuración

Fecha: 2026-07-17

## Resultado

PASS. Se construyó la fundación empresarial sin mover ni borrar el proyecto
vivo durante la implementación.

## Entregado

- Documentación Enterprise en `docs/md` y 11 páginas generadas en `docs/html`.
- Human Approval consolidado en un único capítulo.
- Governance: nueve gates, RACI, budget/kill switch y selección de agentes.
- Customer Distribution definida como framework limpio + proyecto implantado.
- Reporter determinista en `tools/nadf-output-reporter`.
- `examples/sample1-app` dentro del Framework.
- Sample 1 GitHub Issues y Sample 2 Manual/AWS, aislados de Novus.
- Hub `Documentacion/README.md` apuntando a la fuente empresarial canónica.

## Validación

- `python tools/nadf-validator/__main__.py repository`: PASS, 0 warnings,
  0 errors.
- Unit tests sample1: 2 PASS.
- Unit tests sample2: 2 PASS.
- Build HTML: 11 páginas.

## Clasificación

- Framework/distribución: `.nadf/global`, agents, schemas, tools, governance,
  docs Enterprise, samples y project templates.
- Proyecto vivo: `.nadf/projects/novus-intelligence`, workflow Lovable y
  runtime M6 específico.
- Evidencia externa: `../Documentacion`.

La separación de ramas se realiza después de validar Ola 2 para no perder el
trabajo previo no committeado.
