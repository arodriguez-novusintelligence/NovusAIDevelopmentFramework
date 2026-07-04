# Artefactos — Novus Intelligence Solutions

## Propósito

Este directorio almacena los artefactos generados por los agentes NADF durante la ejecución de workflows. Cada artefacto es la salida documentada de un agente y sirve como input para agentes downstream.

## Artefactos por workflow

### lovable-to-web (novus-lovable-sync)

| Artefacto | Agente | Descripción |
|-----------|--------|-------------|
| `cambios-lovable.json` | Lovable Analyzer | Cambios detectados en Lovable, estructurados |
| `frontend-impact.md` | Lovable Analyzer | Impacto en frontend productivo |
| `backend-impact.md` | Lovable Analyzer | Impacto en backend |
| `riesgos.md` | Lovable Analyzer | Riesgos identificados |
| `resumen-frontend.md` | Frontend Integration | Resumen de cambios implementados |
| `evaluacion-backend.md` | Backend Impact | Evaluación de necesidad backend |
| `especificacion-backend.md` | Backend Impact | Especificación backend (condicional) |
| `informe-qa.md` | QA | Informe de validaciones |
| `qa-result.json` | QA | Resultado estructurado QA |
| `resumen-ejecucion.md` | Documentation | Resumen consolidado del workflow |

## Convenciones

- Los artefactos **no se eliminan** entre ejecuciones; se sobrescriben con la última ejecución.
- Formato JSON para datos estructurados; Markdown para informes legibles.
- Todo contenido en español.
- Sin secrets, credenciales ni datos personales reales.

## Nota

Este directorio se popula automáticamente al ejecutar workflows. Inicialmente está vacío (solo este README).
