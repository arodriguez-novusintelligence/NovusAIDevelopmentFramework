# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `61bb6d8`  
**Baseline anterior:** `e3a9819`  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS sa-east-1)  
**Fecha:** 2026-07-15  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El delta desde `e3a9819` **no introduce nuevos requisitos backend**. Los cambios son exclusivamente frontend: estilos de contacto, componente interactivo NovusDevFrameworkDemo, rediseño Testimonials y workflow CI de notificación NADF. El único endpoint backend requerido sigue siendo `POST /api/v1/contact` (documentado en análisis previo como CHG-008/CHG-011).

**backendRequired: true** — condicionado únicamente al formulario de contacto (sin cambios en este delta).

---

## Evaluación delta por cambio

| ID | Componente | requiresBackend | Justificación |
|----|------------|-----------------|---------------|
| CHG-014 | contact-page (visual) | No | Solo tokens CSS; misma lógica submitContact |
| CHG-015 | NovusDevFrameworkDemo | No | Simulación frontend; datos hardcoded en STEPS |
| CHG-016 | Hero triggers | No | CustomEvent client-side |
| CHG-017 | Header event | No | CustomEvent client-side |
| CHG-018 | Testimonials | No | Contenido estático + assets |
| CHG-019 | client-logos | No | Assets estáticos |
| CHG-020 | bg-gradient-section | No | CSS utility |
| CHG-021 | notify-nadf-workflow | No* | CI/DevOps; no lógica de aplicación |

\* CHG-021 es infraestructura de integración NADF (repository_dispatch). Requiere secret `NADF_DISPATCH_TOKEN` en GitHub, no cambios en NovusIntelligenceBack.

---

## Endpoint vigente (sin cambios)

### POST /api/v1/contact

| Atributo | Valor |
|----------|-------|
| Operación | `submitContact` |
| Contrato | `novus-nexus/src/integrations/aws/contact-api.contract.ts` |
| OpenAPI | `novus-nexus/reglasInfra/backend-endpoints.yml` |
| Campos | name*, company, email*, phone, message*, solutionInterest (enum) |

El formulario de contacto mantiene los mismos campos y validación client-side. La unificación visual a Navy Neón no altera el payload ni el contrato API.

---

## Comportamiento demo (sin cambios — riesgo persistente)

`src/lib/api/contact.ts` sigue implementando fallback demo:
- `VITE_DEMO_MODE=true` o `DEV` sin API → éxito simulado con `requestId: demo-{timestamp}`
- Producción sin API → `{ ok: false }`

**Acción requerida downstream:** mantener política no-mock en frontend productivo (R-001).

---

## Funcionalidades sin impacto backend (delta)

| Componente | Motivo |
|------------|--------|
| NovusDevFrameworkDemo | Dialog con steps hardcoded; simula flujo Lovable→Framework→Deploy sin API real |
| Testimonials + logos | Render estático desde `cases.ts` y asset.json |
| Hero/Header events | Comunicación intra-componente vía CustomEvent |
| notify-nadf.yml | Dispara workflow NADF externo; no endpoint de aplicación |

---

## Infraestructura / DevOps (informativo)

El workflow `notify-nadf.yml` en novus-nexus:
- Trigger: push a main/master
- Acción: `repository_dispatch` → NovusAIDevelopmentFramework con `event_type: lovable-commit`
- Payload: source, sha, ref

Esto alimenta el orquestador MVP (`lovable-sync-dev.yml`) documentado en `project-context.yml`. No requiere cambios en Lambda ni API Gateway del backend productivo.

---

## Seguridad — estado sin cambios

| Requisito | Delta | Acción |
|-----------|-------|--------|
| Validación server-side contact | Sin cambio | Mantener en backend-agent |
| Captcha | Sin cambio | Pendiente pre-prod (R-008) |
| CORS | Sin cambio | Configurar en API Gateway |
| NADF_DISPATCH_TOKEN | Nuevo (CI) | Secret en GitHub, no en repo |

---

## Recomendación para planner-agent

1. **No añadir** tareas backend por este delta.
2. Mantener `POST /api/v1/contact` como dependencia bloqueante para contacto productivo (heredado de CHG-008).
3. NovusDevFrameworkDemo y Testimonials pueden implementarse en frontend sin esperar backend.
4. Secuencia sin cambios: backend contact API → frontend contacto con API real → validación QA.

---

## Próximo agente

**planner-agent** (paso 4) — incorporar delta frontend sin nuevas dependencias backend.  
**backend-impact-agent** (paso 5) — solo si el plan previo no cubrió CHG-008/CHG-011.
