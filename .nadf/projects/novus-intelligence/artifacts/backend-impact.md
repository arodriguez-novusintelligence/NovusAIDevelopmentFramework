# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `f97e53e`  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS sa-east-1)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable **requiere un único endpoint backend** para funcionalidad productiva: el formulario de contacto. El delta del commit `f97e53e` añade `NovusDevFrameworkDemo` y triggers de simulación en landing, pero **no introduce nuevos endpoints ni integraciones backend**. Los componentes `NovusDevFrameworkDemo` y `MultiAgentDemo` son puramente frontend (visualización educativa con datos hardcoded).

**backendRequired: true** — condicionado exclusivamente al formulario de contacto.

---

## Delta reciente (commit f97e53e)

| Componente | requiresBackend | Justificación |
|------------|-----------------|---------------|
| NovusDevFrameworkDemo | **No** | Modal con simulación local; 9 pasos hardcoded, sin fetch |
| hero-simulation-triggers | **No** | Eventos UI client-side |
| notify-nadf.yml | **No** | CI en repo Lovable; dispatch a Framework, no API productiva |
| package.json bump | **No** | Solo devDependency de Lovable |

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
| **NovusDevFrameworkDemo** (nuevo) | Simulación local; logs y producto ficticio hardcoded |
| MultiAgentDemo | Visualización estática/animada; datos en componente |
| Triggers Hero/Header | CustomEvent client-side |
| Navegación y routing | Client-side only |
| Contenido estático (services, solutions, cases) | Archivos TS estáticos |
| Páginas legales | Contenido estático |
| notify-nadf.yml | Orquestación CI; secret `NADF_DISPATCH_TOKEN` en GitHub, no en código |

---

## Contenido ficticio en demos (riesgo de confusión, no backend)

`NovusDevFrameworkDemo` muestra al finalizar:

- URL: `leadmgr.novus.dev`
- Producto: "Lead Manager B2B — MVP funcional"
- Deploy: "Amplify + API Gateway + Lambda"

Estos datos son **demostrativos**. No requieren backend real, pero el frontend productivo no debe presentarlos como servicios reales de Novus sin validación de negocio.

---

## Seguridad y validación

| Requisito | Estado en Lovable | Requerido en backend |
|-----------|-------------------|----------------------|
| Validación campos required | Client-side | Server-side obligatorio |
| Rate limiting | No implementado | Recomendado (429) |
| Captcha (hCaptcha/Turnstile) | Pendiente | Recomendado pre-prod |
| Sanitización input | No visible | Obligatorio |
| CORS | No definido | Configurar en API Gateway |
| Secrets en código | No detectados | Mantener en AWS Secrets/SSM |

---

## Evaluación de necesidad backend por cambio

| ID Cambio | Componente | requiresBackend | Justificación |
|-----------|------------|-----------------|---------------|
| CHG-008 | contact-form | **Sí** | Submit a API real |
| CHG-011 | api-contract | **Sí** | Define contrato a implementar |
| CHG-014 | NovusDevFrameworkDemo | No | Simulación UI local |
| CHG-015 | hero-simulation-triggers | No | Solo estado React/eventos |
| CHG-016 | ci-notify-nadf | No | CI cross-repo |
| CHG-009 | MultiAgentDemo | No | Solo visualización |
| Resto (CHG-001–007, 010, 012–013) | — | No | Frontend/contenido estático |

---

## Recomendación para planner-agent

1. Mantener `POST /api/v1/contact` como **tarea bloqueante** para contacto productivo.
2. `NovusDevFrameworkDemo` y `MultiAgentDemo` pueden implementarse en frontend **sin esperar backend**.
3. Secuenciar: demos interactivas (paralelo) → backend contact API → frontend contacto con API real → QA.
4. El workflow `notify-nadf.yml` es responsabilidad DevOps/Framework; no bloquea implementación WEB.

---

## Próximo agente

**backend-impact-agent** (paso 5) detalla Lambda, IAM y despliegue.  
**planner-agent** (paso 4) incluye dependencias y secuencia de tareas frontend/backend.
