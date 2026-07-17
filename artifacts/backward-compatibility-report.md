# Backward Compatibility Report — NADF v1.1.0-rc.1

**Fecha:** 2026-07-15

## Política

- Requirement Intake **opt-in**.
- Proyectos sin `requirement-sources/` deben validar como en v1.0.
- IDs de agentes/workflows core inmutables.
- Cambios de Meta Model: MINOR 1.0 → 1.1.

## Matriz preliminar

| Componente | Compatible con 1.0 | Notas |
|------------|--------------------|-------|
| Core agents (20) | Sí | + visual-parity |
| Workflows legacy (8) | Sí | + requirement-intake |
| lovable-to-web | Sí | Pasos 18/19: alinear docs |
| Intake agents (7) | N/A v1.0 | Solo si opt-in |
| Cursor adapter M6 | Experimental | No bloquea core |
| InterfazNADF | Fuera del repo | Compatible a nivel contrato |

## Riesgos de ruptura

| Riesgo | Impacto | Mitigación RC |
|--------|---------|---------------|
| Contar 19 agentes en integración | Bajo/Medio | Actualizar living docs |
| Referencias Documentacion/ | Bajo | Relativizar / nota |
| Declarar Mission como entidad | Medio | Alias explícito |

## Conclusión

Compatibilidad hacia atrás **viable** para RC si Intake sigue opt-in y se documenta matrix oficial.
