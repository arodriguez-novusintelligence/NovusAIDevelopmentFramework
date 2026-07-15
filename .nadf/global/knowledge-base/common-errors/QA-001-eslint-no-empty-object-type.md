# Error: QA-001

## Síntoma

Gate `build_success` falla con 4 errores ESLint `@typescript-eslint/no-empty-object-type` en componentes UI (`Input`, `Label`, `Select`, `Textarea`). El build Vite puede compilar exitosamente mientras lint bloquea el workflow.

## Causa

Uso de interfaces vacías que solo extienden otro tipo sin añadir props:

```typescript
// Incorrecto
interface InputProps extends React.ComponentProps<'input'> {}
```

La regla `no-empty-object-type` prohíbe interfaces sin miembros propios.

## Solución

Reemplazar por type alias:

```typescript
// Correcto
type InputProps = React.ComponentProps<'input'>;
```

Alternativa: añadir al menos una prop semántica explícita a la interface.

## Prevención

1. Ejecutar `npm run lint` como criterio de aceptación en `tareas-ejecutor.json` antes del handoff a qa-agent.
2. Al reimplementar componentes estilo shadcn/ui en workflows Lovable→Web, usar `type` alias por defecto.
3. Incluir lint en checklist pre-handoff executor → validation.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/informe-qa.md`, `artifacts/qa-result.json`
- Agente responsable corrección: frontend-integration-agent

## Estado de remediación

| Campo | Valor |
|-------|-------|
| `remediationStatus` | **resolved** |
| `remediatedAt` | 2026-07-15 |
| Evidencia | Lint 0 errores en NovusIntelligenceWEB `main` @ `783acea` |
| Artefacto | `artifacts/informe-qa.md` |

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-001, ANTI-005, KB-001, KB-UPDATE-001 |
| Severidad | critical |
| Gate bloqueante | build_success |
| Fecha | 2026-07-14 |
| Última actualización | 2026-07-15 |
