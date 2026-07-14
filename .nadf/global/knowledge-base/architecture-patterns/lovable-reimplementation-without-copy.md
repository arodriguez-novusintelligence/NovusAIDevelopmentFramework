# Patrón: Reimplementación Lovable sin copia directa

## Contexto

Lovable (novus-nexus) es fuente de **intención visual y funcional únicamente**. El stack productivo NADF (React + TypeScript + Tailwind) requiere traducción deliberada, nunca copia literal de código, componentes o estilos.

## Solución

### Proceso verificado

1. **Análisis de cambios** — lovable-analyzer-agent detecta CHG-xxx en commit baseline.
2. **Plan de traducción** — planner-agent mapea rutas, componentes y APIs sin referenciar código Lovable.
3. **Reimplementación** — frontend-integration-agent crea componentes propios con design system dark-first.
4. **Validación** — gates `no_lovable_code_copy` y `no_mock_data_in_production` en QA y Security.

### Qué verificar

| Verificación | Método |
|-------------|--------|
| Sin imports de novus-nexus | Grep en repo productivo |
| Sin código literal copiado | Diff semántico + security scan |
| Design system propio | Tokens, componentes, rutas propias |
| Funcionalidad equivalente | Paridad visual + QA funcional |

### Resultado novus-intelligence

- 10 rutas, design system completo, `MultiAgentDemo` lazy-loaded
- Gates `no_lovable_code_copy` y `no_mock_data_in_production`: PASS
- Paridad visual: pendiente (dimensión independiente)

## Ejemplo

- Baseline Lovable: novus-nexus @ `e3a9819`
- Productivo: NovusIntelligenceWEB @ `cdd9f95`

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Patrón: PAT-002 en `artifacts/recomendaciones-kb.json`
- ADR-0003: canonicalización Lovable→Web
- Regla: `.nadf/global/rules/general-rules.md` (prohibición copia Lovable)
