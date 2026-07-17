<!-- NADF-GUIDE
Propósito: Documenta Comando: setup-project-context.
Configuración: Ajustar proyecto activo, workflow, gates y rutas sin incorporar secretos.
-->
# Comando: setup-project-context

## Descripción

Comando reutilizable para configurar y validar el contexto de un nuevo proyecto bajo NADF.

## Uso

```
Ejecutar setup-project-context --project=<nombre-proyecto> [--from-template=novus-intelligence]
```

## Parámetros

| Parámetro | Obligatorio | Descripción |
|-----------|-------------|-------------|
| `--project` | Sí | Nombre del proyecto (kebab-case) |
| `--from-template` | No | Proyecto plantilla (default: `novus-intelligence`) |

## Workflow invocado

`.nadf/global/workflow-library/create-project.yml`

## Precondiciones

- Nombre del proyecto definido y acordado
- Repositorios frontend/backend identificados
- Stack tecnológico documentado
- Alcance inicial definido

## Pasos de ejecución

### Paso 1: Crear estructura de directorios

Crear bajo `.nadf/projects/<nombre-proyecto>/`:

```
project-context.yml
environments/dev.yml
environments/qa.yml
environments/prod.yml
rules/lovable-rules.md
rules/frontend-rules.md
rules/backend-impact-rules.md
rules/qa-rules.md
workflows/
memory/business-context.md
memory/brand-context.md
memory/technical-context.md
memory/decision-log.md
artifacts/README.md
```

### Paso 2: Generar project-context.yml

- Copiar estructura del template indicado
- Adaptar campos: application, repositories, frontend, backend, design_source, initial_scope, quality_gates

### Paso 3: Configurar entornos

- Completar dev.yml, qa.yml, prod.yml con templates (sin secrets)
- Definir URLs, regiones y nombres de recursos

### Paso 4: Definir reglas del proyecto

- Adaptar reglas globales al contexto específico
- Documentar convenciones de código, patrones y restricciones

### Paso 5: Documentar memoria

- business-context.md: objetivos, usuarios, funcionalidades
- brand-context.md: identidad visual, tono, guidelines
- technical-context.md: stack, patrones, dependencias
- decision-log.md: inicializar con entrada de incorporación

### Paso 6: Validar coherencia

Checklist de validación:

- [ ] project-context.yml completo y YAML válido
- [ ] Todos los repositorios referenciados existen o están planificados
- [ ] Entornos configurados sin secrets
- [ ] Reglas del proyecto definidas
- [ ] Memoria del proyecto documentada
- [ ] Quality gates definidos
- [ ] artifacts/README.md presente

### Paso 7: Registrar ADR

- Crear ADR de incorporación: `ADR-NNNN-<proyecto>-onboarding.md`
- Documentar motivo, alcance y configuración inicial

### Paso 8: Generar resumen

- Crear `artifacts/setup-resumen.md` con estructura creada y pendientes

## Salida esperada

```
✓ Estructura de proyecto creada en .nadf/projects/<nombre-proyecto>/
✓ project-context.yml configurado
✓ Entornos: dev, qa, prod
✓ Reglas del proyecto definidas
✓ Memoria del proyecto documentada
✓ ADR de incorporación registrado
✓ Validación: PASS
```

## Referencias

- Guía de onboarding: `docs/project-onboarding.md`
- Template: `.nadf/projects/novus-intelligence/`
- Workflow: `.nadf/global/workflow-library/create-project.yml`
