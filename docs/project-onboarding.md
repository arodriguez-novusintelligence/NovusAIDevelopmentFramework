<!-- NADF-GUIDE
Propósito: Documenta Incorporación de nuevos proyectos a NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Incorporación de nuevos proyectos a NADF

## Cuándo usar este proceso

Cuando un nuevo producto o aplicación de Novus Intelligence debe operar bajo el framework NADF multiagente, con agentes, workflows de 9 fases, skill registry y quality gates.

## Prerrequisitos

- Repositorio frontend productivo definido
- Repositorio backend productivo definido (si aplica)
- Repositorio Lovable o fuente de diseño (si aplica)
- Stack tecnológico documentado
- Alcance inicial definido

## Pasos de incorporación

### 1. Crear estructura de proyecto

```
.nadf/projects/<nombre-proyecto>/
├── project-context.yml
├── environments/
├── rules/
├── workflows/
├── memory/
└── artifacts/
```

### 2. Configurar project-context.yml

Incluir referencias multiagente:

```yaml
architecture:
  model: multiagent
  primary_workflow: lovable-to-web
  agents_enabled: [...]
  mcp_servers: [github, aws]
```

Usar `.nadf/projects/novus-intelligence/project-context.yml` como referencia.

### 3. Configurar entornos, reglas y memoria

Igual que antes, adaptando reglas globales (`.nadf/global/rules/`) al proyecto.

### 4. Crear workflows específicos

Extender workflows globales de `.nadf/global/workflow-library/` con pasos y agentes del proyecto. Todo workflow debe seguir el **modelo de 9 fases**.

### 5. Registrar agentes en skill registry

Verificar que los agentes necesarios están en `.nadf/global/skill-registry/` con esquema unificado (pattern, layer, mcp_servers).

### 6. Ejecutar workflow create-project

Invocar comando `setup-project-context` o workflow `create-project.yml` que usa Framework Architect, Planner, Architect, ADR Agent.

### 7. Registrar ADR de onboarding

```
.nadf/global/decision-history/adr/ADR-NNNN-<nombre-proyecto>-onboarding.md
```

### 8. Validación final

- [ ] project-context.yml con referencias multiagente
- [ ] Workflows con 9 fases
- [ ] Agentes y skill registry alineados
- [ ] MCP servers documentados
- [ ] Quality gates incluyen plan_approved y security_pass
- [ ] ADR de incorporación registrado

## Proyecto de referencia

**Novus Intelligence Solutions** (`.nadf/projects/novus-intelligence/`) — workflow de 18 pasos multiagente (canónico global; [ADR-0003](../.nadf/global/decision-history/adr/ADR-0003-lovable-to-web-canonicalization.md)).

## Referencias

- [Arquitectura multiagente](multiagent-architecture.md)
- [Modelo de workflows](workflow-model.md)
- Workflow: `.nadf/global/workflow-library/create-project.yml`
