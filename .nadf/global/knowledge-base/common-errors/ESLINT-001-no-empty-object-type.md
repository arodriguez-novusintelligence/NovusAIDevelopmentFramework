# Error: ESLINT-001

## Síntoma

El gate `build_success` falla con 4+ errores `@typescript-eslint/no-empty-object-type` al ejecutar `npm run lint` en el frontend React + TypeScript.

```
error  An interface declaring no members is equivalent to its supertype  @typescript-eslint/no-empty-object-type
```

Ocurre típicamente en componentes UI estilo shadcn/ui reimplementados durante workflows Lovable→Web.

## Causa

Se define una interfaz vacía que solo extiende otro tipo sin añadir props propias:

```typescript
interface InputProps extends React.ComponentProps<'input'> {}
```

ESLint 9+ con `@typescript-eslint/no-empty-object-type` considera esto redundante y bloqueante.

## Solución

Reemplazar la interfaz vacía por un type alias:

```typescript
// Incorrecto
interface InputProps extends React.ComponentProps<'input'> {}

// Correcto
type InputProps = React.ComponentProps<'input'>
```

Alternativa: añadir al menos una prop semántica explícita si la interfaz debe documentar extensibilidad futura.

## Prevención

1. Al reimplementar componentes shadcn/ui, usar `type` alias por defecto para props que solo delegan en `React.ComponentProps`.
2. Ejecutar `npm run lint` antes del handoff executor → validation.
3. Incluir verificación ESLint en checklist pre-merge (ver KB-004).

## Proyectos donde se observó

- novus-intelligence (workflow `novus-intelligence-lovable-to-web`, iteración 2 — resuelto)

## Referencias

- Fuente: `artifacts/resumen-ejecucion.md` (QA-001)
- Recomendación: KB-001 en `artifacts/recomendaciones-kb.json`
