<!-- NADF-GUIDE
Propósito: Documenta Base de conocimiento NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Base de conocimiento NADF

## Propósito

La base de conocimiento compartida acumula patrones, errores comunes y componentes reutilizables descubiertos durante la ejecución de workflows. Su objetivo es acelerar futuras implementaciones y evitar repetir errores.

## Estructura

```
knowledge-base/
├── README.md                    # Este archivo
├── architecture-patterns/       # Patrones arquitectónicos documentados
├── common-errors/               # Errores frecuentes y soluciones
└── reusable-components/         # Componentes reutilizables entre proyectos
```

## Cómo contribuir

Los agentes (especialmente Documentation Agent) alimentan la knowledge-base cuando:

- Se identifica un patrón arquitectónico reutilizable
- Se resuelve un error que puede repetirse
- Se crea un componente genérico aplicable a múltiples proyectos

## Formato de entradas

### Patrones arquitectónicos

Archivo: `architecture-patterns/<nombre-patron>.md`

```markdown
# Patrón: Nombre

## Contexto
Cuándo aplicar este patrón.

## Solución
Descripción del patrón.

## Ejemplo
Referencia a implementación.

## Proyectos donde se usa
- novus-intelligence
```

### Errores comunes

Archivo: `common-errors/<codigo-error>.md`

```markdown
# Error: CODIGO-XXX

## Síntoma
Qué se observa.

## Causa
Por qué ocurre.

## Solución
Cómo resolverlo.

## Prevención
Cómo evitarlo en el futuro.
```

### Componentes reutilizables

Archivo: `reusable-components/<nombre-componente>.md`

```markdown
# Componente: Nombre

## Descripción
Qué hace.

## Props / API
Interfaz pública.

## Proyectos
Dónde está implementado.

## Notas
Consideraciones de uso.
```

## Mantenimiento

- Revisar periódicamente entradas obsoletas
- Consolidar patrones similares
- Priorizar entradas verificadas en producción

## Referencias

- Documentation Agent: `.claude/agents/documentation-agent.md`
- ADRs: `.nadf/global/decision-history/adr/`
