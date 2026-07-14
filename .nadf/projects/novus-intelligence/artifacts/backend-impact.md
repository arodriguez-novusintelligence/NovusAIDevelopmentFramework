# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `746c129`  
**Delta desde:** `e3a9819` (17 commits)  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS sa-east-1)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El delta reciente (`e3a9819` → `746c129`) **no introduce nuevos requisitos backend**. Los cambios son exclusivamente frontend: modal de simulación, rediseño de Testimonials, assets de logos y workflow CI.

El prototipo Lovable sigue requiriendo **un único endpoint backend** para funcionalidad productiva: el formulario de contacto. Los componentes interactivos (`NovusDevFrameworkDemo`, `MultiAgentDemo`) son puramente frontend (visualización educativa) y no requieren API.

**backendRequired: true** — condicionado únicamente al formulario de contacto (sin cambios respecto al análisis anterior).

---

## Evaluación del delta

| Cambio | ID | ¿Requiere backend? | Motivo |
|--------|-----|-------------------|--------|
| NovusDevFrameworkDemo | CHG-014 | No | Simulación visual local, sin persistencia |
| Hero CTA simulación | CHG-015 | No | Abre modal client-side |
| Header demo trigger | CHG-016 | No | CustomEvent local |
| Testimonials redesign | CHG-017 | No | Contenido estático de cases.ts |
| Logos CDN Lovable | CHG-018 | No | Assets estáticos; servir desde WEB/CDN |
| CI notify-nadf | CHG-019 | No | Infraestructura CI, no API productiva |
| Hero badge removal | CHG-020 | No | Cambio visual |

---

## Endpoints requeridos (sin cambios)

### POST /api/v1/contact

| Atributo | Valor |
|----------|-------|
| Operación | `submitContact` |
| Contrato | `novus-nexus/src/integrations/aws/contact-api.contract.ts` |
| OpenAPI | `novus-nexus/reglasInfra/backend-endpoints.yml` |
| Lambda sugerida | `novus-contact-handler` |
| Runtime | Node.js 20.x |
| Timeout | 10s |

#### Request body (ContactRequest)

```json
{
  "name": "string (2–120, required)",
  "company": "string (max 160)",
  "email": "string (email, required)",
  "phone": "string (max 40)",
  "message": "string (5–4000, required)",
  "solutionInterest": "enum: ai-agents | automation | integrations | analytics | documents-ai | customer-ai"
}
```

#### Response body (ContactResponse)

```json
{
  "ok": true,
  "requestId": "string",
  "message": "string"
}
```

#### Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 | Mensaje recibido correctamente |
| 400 | Validación fallida |
| 429 | Rate limit excedido |
| 500 | Error interno |

---

## Servicios AWS implicados

| Servicio | Uso | Nuevo en delta |
|----------|-----|----------------|
| API Gateway | Exponer POST /api/v1/contact | No |
| Lambda | Handler de contacto | No |
| SES o SNS | Notificación de leads | No |
| DynamoDB (opcional) | Persistencia de leads | No |
| WAF / Rate limiting | Protección formulario | No |

---

## Riesgos backend del delta

| Riesgo | Severidad | Nota |
|--------|-----------|------|
| Ninguno nuevo | — | Delta 100% frontend |

Los riesgos preexistentes (modo demo en Lovable, falta de captcha) siguen vigentes. Ver `riesgos.md` (R-001, R-008).

---

## Recomendaciones para backend-impact-agent (paso 05)

1. **Sin acción** para CHG-014 a CHG-020 — no generan endpoints nuevos.
2. Mantener prioridad en `POST /api/v1/contact` como blocker del formulario productivo.
3. Evaluar captcha (hCaptcha/Turnstile) antes de habilitar formulario en prod.
4. El workflow `notify-nadf.yml` (CHG-019) es responsabilidad DevOps/CI, no backend API.

---

## Próximo agente

**planner-agent** — el plan de implementación puede ejecutar cambios frontend del delta sin esperar backend, excepto el formulario de contacto que sigue bloqueado por API.
