<!-- NADF-GUIDE
Propósito: Plantilla de issue DoEvents para intake NADF.
Configuración: Usar en DoEventsWEB; label nadf para disparar el ciclo.
-->
# Issue seed — DoEvents (NADF)

## Título
Cambio concreto y acotado (una sola funcionalidad).

## Cuerpo (copiar)

```markdown
## Qué cambiar
Descripción clara del ajuste (solo esta funcionalidad).

## Área
- [ ] web
- [ ] back
- [ ] ambos

## Criterios de aceptación
- [ ] …
- [ ] No se eliminan ni rompen otras funcionalidades

## Fuera de alcance
Listar lo que NO debe tocarse.

## Entorno
DEV únicamente
```

## Labels
- `nadf` — dispara el ciclo NADF
- `area:web` / `area:back` / `area:full` — opcional (si falta, Complexity Routing infiere)
- `nadf:approved` — también dispara (alias)

## Rama de trabajo
`feature/NovusAIDevelopmentFramework` en DoEventsWEB y/o DoEventsBack.
