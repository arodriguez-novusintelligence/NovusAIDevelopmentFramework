# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `dd9f5e2`  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS sa-east-1)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable **requiere un único endpoint backend** para funcionalidad productiva: el formulario de contacto. Los componentes interactivos añadidos recientemente — **`NovusDevFrameworkDemo`** (modal en Hero) y **`MultiAgentDemo`** (página ai-agents) — son **puramente frontend** con datos hardcoded y no requieren API.

**backendRequired: true** — condicionado exclusivamente al formulario de contacto.

---

## Evaluación del delta reciente (dd9f5e2)

| Cambio | requiresBackend | Justificación |
|--------|-----------------|---------------|
| CHG-017: eliminación badge logo | No | Cambio visual en Hero |
| CHG-014: NovusDevFrameworkDemo | No | Modal con steps hardcoded; sin fetch ni persistencia |
| CHG-015: integración Hero simulación | No | Estado React local + CustomEvent |
| CHG-016: Header demo trigger | No | Disparo de evento DOM; sin API |

**Conclusión:** El delta reciente **no incrementa** el alcance backend respecto al análisis anterior.

---

## Endpoints requeridos

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

## Implementación backend esperada

Según `reglasInfra/backend-endpoints.yml`:

| Componente | Especificación |
|------------|----------------|
| **Lambda** | `novus-contact-handler`, handler `index.handler` |
| **API Gateway** | REST o HTTP API con ruta `/api/v1/contact` |
| **SES** | Envío de email a `CONTACT_SES_TO` desde `CONTACT_SES_FROM` |
| **CRM (opcional)** | Webhook a `CRM_WEBHOOK_URL` |
| **Permisos IAM** | `ses:SendEmail`, `logs:*` |
| **Observabilidad** | CloudWatch alarms (lambda errors, API 5xx) |

### Variables de entorno requeridas

| Variable | Tipo | Uso |
|----------|------|-----|
| `CONTACT_SES_FROM` | Secreto | Email remitente SES |
| `CONTACT_SES_TO` | Secreto | Email destino notificaciones |
| `CRM_WEBHOOK_URL` | Secreto (opcional) | Integración CRM externa |

### Variables frontend (públicas)

| Variable | Valor prod | Uso |
|----------|------------|-----|
| `VITE_NOVUS_API_URL` | `https://api.novusintelligencesolutions.com` | Base URL API |
| `VITE_DEMO_MODE` | `false` | **Obligatorio false en producción** |

---

## Comportamiento actual en Lovable (no productivo)

El archivo `src/lib/api/contact.ts` implementa un fallback demo:

- Si `VITE_NOVUS_API_URL` no está definida **y** (`VITE_DEMO_MODE=true` o `import.meta.env.DEV`), retorna éxito simulado con `requestId: demo-{timestamp}`.
- En producción sin API, retorna `{ ok: false, message: "Servicio de contacto no configurado." }`.

**Este fallback demo NO debe replicarse en el frontend productivo.**

---

## Funcionalidades sin impacto backend

| Componente | Motivo |
|------------|--------|
| NovusDevFrameworkDemo | Modal educativo; steps y logs hardcoded |
| MultiAgentDemo | Visualización SVG/animada; datos en componente |
| Hero simulación (click logo, CTA) | Abre modal local; sin persistencia |
| Header demo trigger | CustomEvent DOM; sin API |
| Navegación y routing | Client-side only |
| Contenido estático (services, solutions, cases) | Archivos TS estáticos |
| Páginas legales | Contenido estático |
| Header/Footer/Layout | Sin datos dinámicos |

---

## Seguridad y validación

| Requisito | Estado en Lovable | Requerido en backend |
|-----------|-------------------|----------------------|
| Validación campos required | Client-side | Server-side obligatorio |
| Rate limiting | No implementado | Recomendado (429) |
| Captcha (hCaptcha/Turnstile) | Pendiente | Recomendado pre-prod |
| Sanitización input | No visible | Obligatorio |
| CORS | No definido en Lovable | Configurar en API Gateway |
| Secrets en código | No detectados | Mantener en AWS Secrets/SSM |

---

## Evaluación de necesidad backend por cambio

| ID Cambio | Componente | requiresBackend | Justificación |
|-----------|------------|-----------------|---------------|
| CHG-008 | contact-form | **Sí** | Submit a API real |
| CHG-011 | api-contract | **Sí** | Define contrato a implementar |
| CHG-009 | MultiAgentDemo | No | Solo visualización |
| CHG-014 | NovusDevFrameworkDemo | No | Modal educativo local |
| CHG-015–017 | Hero/Header simulación | No | Interacción client-side |
| CHG-001–007, 010, 012–013 | Resto | No | Frontend/contenido estático |

---

## Gaps pendientes (handoff a backend-impact-agent)

1. **Captcha:** documentado como TODO pre-prod; backend debe validar token.
2. **CRM webhook:** opcional; definir si se implementa en MVP.
3. **Demos interactivos:** no requieren endpoints; evitar confundir con APIs reales.

---

## Recomendación para planner-agent

1. Mantener `POST /api/v1/contact` como **única dependencia backend bloqueante** para contacto productivo.
2. Los demos `NovusDevFrameworkDemo` y `MultiAgentDemo` pueden implementarse en frontend sin esperar backend.
3. Secuenciar: backend contact API → frontend contacto con API real → validación QA.

**Próximo agente sugerido:** `planner-agent` (planificación) → `backend-impact-agent` (paso 5, especificación detallada).
