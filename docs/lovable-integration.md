# Integración con Lovable

## Rol de Lovable en NADF

Lovable es la herramienta de prototipado visual y funcional que el equipo de diseño utiliza para definir **cómo debe verse y comportarse** la aplicación. En NADF, Lovable ocupa la **Design Source Layer** y dispara workflows **event-driven** ante cambios en `novus-nexus`.

## Repositorios y responsabilidades

| Repositorio | Rol | Tipo de código |
|-------------|-----|----------------|
| `novus-nexus` | Prototipo Lovable | Intención visual/funcional |
| `NovusIntelligenceWEB` | Frontend productivo | React/TypeScript real |
| `NovusIntelligenceBack` | Backend productivo | API serverless real |

## Flujo multiagente (15 pasos)

Evento: **Cambio detectado en novus-nexus**

```mermaid
flowchart TB
    A["Evento: lovable.commit"] --> B["1. Lovable Analyzer"]
    B --> C["2. Planner Agent"]
    C --> D["3. Architect Agent"]
    D --> E["4. Frontend Integration"]
    E --> F["5. Backend Impact"]
    F --> G{"¿Backend?"}
    G -->|Sí| H["6. Backend Agent"]
    G -->|No| I["7-8. DB/Cloud cond."]
    H --> I
    I --> J["9. QA"]
    J --> K["10. Security"]
    K --> L["11. Documentation"]
    L --> M["12. Metrics"]
    M --> N["13. Reflection"]
    N --> O["14. Knowledge Base"]
    O --> P["15. ADR Agent"]
    P --> Q["PR → Cursor Review"]
```

## Fases del workflow

| Fase | Pasos | Agentes |
|------|-------|---------|
| Planning | 1-2, 5 | Lovable Analyzer, Planner, Backend Impact |
| Plan Review | 3 | Architect |
| Execution | 4, 6-8 | Frontend, Backend, Database, Cloud |
| Validation | 9-10 | QA, Security |
| Documentation | 11 | Documentation |
| Metrics | 12 | Metrics |
| Reflection | 13 | Reflection |
| KB Update | 14-15 | Knowledge Base, ADR |

## Qué se extrae de Lovable

El Lovable Analyzer Agent extrae de `novus-nexus` vía MCP GitHub:

- Estructura de layout, componentes, contenido, comportamiento funcional
- Tokens de diseño (como referencia, no CSS literal)

## Qué NO se copia de Lovable

| Prohibido | Motivo |
|-----------|--------|
| Código fuente de componentes | Stack diferente |
| Estilos CSS/Tailwind literales | Design system del proyecto |
| Datos mock / placeholders | Política no-mock |
| Lógica de routing Lovable | React Router del proyecto |
| Dependencias de Lovable | Solo stack productivo |

## Artefactos generados (Planning)

| Artefacto | Productor |
|-----------|-----------|
| cambios-lovable.json | Lovable Analyzer |
| frontend-impact.md | Lovable Analyzer |
| backend-impact.md | Lovable Analyzer |
| riesgos.md | Lovable Analyzer |
| plan-implementacion.md | Planner Agent |
| impacto-arquitectonico.md | Architect Agent |

## Comando de sincronización

```
.claude/commands/novus-lovable-sync.md
```

Invoca: `.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml`

## ADRs relacionados

- [ADR-0001](../.nadf/global/decision-history/adr/ADR-0001-nadf-foundation.md) — Separación Lovable/productivo
- [ADR-0002](../.nadf/global/decision-history/adr/ADR-0002-multiagent-patterns.md) — Arquitectura multiagente
