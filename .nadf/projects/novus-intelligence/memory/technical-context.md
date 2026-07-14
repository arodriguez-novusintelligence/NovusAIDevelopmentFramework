# Contexto técnico — Novus Intelligence Solutions

## Arquitectura multiagente NADF

El proyecto opera bajo el modelo multiagente de NADF (ADR-0002) con workflow `lovable-to-web` de **18 pasos** y 9 fases, alineado al canónico global (ADR-0003).

```
Evento novus-nexus → Workflow Agent → Planning → Plan Review → Execution → Validation → Knowledge → PR → Cursor
```

Referencia: `docs/multiagent-architecture.md`

## Arquitectura productiva

```
[Usuario] → [CloudFront/CDN] → [S3] → NovusIntelligenceWEB (React SPA)
                                              ↓ API
                                         [API Gateway] → [Lambda] → NovusIntelligenceBack
```

## Frontend — NovusIntelligenceWEB

| Aspecto | Detalle |
|---------|---------|
| Framework | React 18+ |
| Lenguaje | TypeScript (strict) |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Build | Vite |
| Agente executor | frontend-integration-agent |

## Backend — NovusIntelligenceBack

| Aspecto | Detalle |
|---------|---------|
| Framework | Serverless Framework |
| Runtime | Node.js 20.x |
| Cloud | AWS **sa-east-1** (DEV) — ver `environments/dev.yml` |
| Agente planner | backend-impact-agent |
| Agente executor | backend-agent |

### Endpoints planificados (Fase 1)

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| POST | /contact | Formulario de contacto | Planificado |

## Agentes activos en workflow principal

| Paso | Agente | Fase |
|------|--------|------|
| 1 | Workflow Agent | Event Trigger |
| 2 | (cargar contexto) | Event Trigger |
| 3 | Lovable Analyzer | Planning |
| 4 | Planner | Planning |
| 5 | Backend Impact | Planning |
| 6 | Architect | Plan Review |
| 7 | Frontend Integration | Execution (cond.) |
| 8-10 | Backend, Database, Cloud | Execution (cond.) |
| 11-13 | QA, Security, Reviewer | Validation |
| 14-18 | Docs, Metrics, Reflection, KB, ADR | Knowledge |

## Integración MCP

| Servidor | Uso |
|----------|-----|
| GitHub | Diffs novus-nexus, PRs |
| AWS | Lectura recursos (Cloud Agent) |

## Diseño — novus-nexus (Lovable)

Fuente de intención únicamente. Event trigger: `lovable.commit`.

## Variables de entorno

Solo nombres documentados en project-context y environments/. Nunca valores reales.

## Decisiones técnicas

| Decisión | Elección | ADR |
|----------|----------|-----|
| Cloud provider | AWS | ADR-0001 |
| Arquitectura multiagente | 7 capas, 19 agentes | ADR-0002 |
| Separación Lovable/prod | Intención vs implementación | ADR-0001 |
| Workflow principal | 18 pasos lovable-to-web | ADR-0003 |
| Orden de fases | Canónico global vía extends | ADR-0003 |

## Referencias

- project-context.yml
- docs/multiagent-architecture.md
- Workflow canónico: `.nadf/global/workflow-library/lovable-to-web.yml`
- Workflow proyecto: `.nadf/projects/novus-intelligence/workflows/lovable-to-web.yml`
