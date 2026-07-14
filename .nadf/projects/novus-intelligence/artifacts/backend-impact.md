# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `e3a9819`  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS us-east-1)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable **requiere un único endpoint backend** para funcionalidad productiva: el formulario de contacto. No se detectan otros endpoints, bases de datos ni integraciones backend en el snapshot actual. El componente `MultiAgentDemo` es puramente frontend (visualización educativa) y no requiere API.

**backendRequired: true** — condicionado al formulario de contacto.

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

**Este fallback demo NO debe replicarse en el frontend productivo.** Es un riesgo documentado en `riesgos.md`.

---

## Funcionalidades sin impacto backend

| Componente | Motivo |
|------------|--------|
| MultiAgentDemo | Visualización estática/animada; datos hardcoded en componente |
| Navegación y routing | Client-side only |
| Contenido estático (services, solutions, cases) | Archivos TS estáticos; migrar a content/ del frontend |
| Páginas legales | Contenido estático |
| SEO meta tags | Generados en build/SSR del frontend |
| Header/Footer/Layout | Sin datos dinámicos |

---

## Seguridad y validación

Requisitos detectados en Lovable y reglas de infra:

| Requisito | Estado en Lovable | Requerido en backend |
|-----------|-------------------|----------------------|
| Validación campos required | Client-side | Server-side obligatorio |
| Rate limiting | No implementado | Recomendado (429) |
| Captcha (hCaptcha/Turnstile) | Pendiente (gap documentado) | Recomendado pre-prod |
| Sanitización input | No visible | Obligatorio |
| CORS | No definido en Lovable | Configurar en API Gateway |
| Secrets en código | No detectados | Mantener en AWS Secrets/SSM |

---

## Dependencias AWS

| Servicio | Uso | Prioridad |
|----------|-----|-----------|
| Lambda | Handler de contacto | Alta |
| API Gateway | Exposición REST | Alta |
| SES | Notificación email | Alta |
| CloudWatch | Logs y alarmas | Media |
| Amplify (frontend) | Hosting | Media (DevOps, no backend logic) |

Dominios esperados (según `reglasInfra/aws-prod.yml`):

- API prod: `https://api.novusintelligencesolutions.com`
- API dev: `https://dev-api.novusintelligencesolutions.com`

---

## Evaluación de necesidad backend por cambio

| ID Cambio | Componente | requiresBackend | Justificación |
|-----------|------------|-----------------|---------------|
| CHG-008 | contact-form | **Sí** | Submit a API real |
| CHG-011 | api-contract | **Sí** | Define contrato a implementar |
| CHG-009 | MultiAgentDemo | No | Solo visualización |
| CHG-001–007, 010, 012–013 | Resto | No | Frontend/contenido estático |

---

## Gaps pendientes (handoff a backend-impact-agent)

1. **Captcha:** Lovable documenta como TODO pre-prod; backend debe soportar validación de token.
2. **CRM webhook:** Opcional; definir si se implementa en MVP.
3. **i18n:** No requiere backend en alcance actual.
4. **Blog/recursos:** Fuera de alcance inicial.

---

## Recomendación para planner-agent

1. Incluir implementación de `POST /api/v1/contact` como **tarea bloqueante** para la página de contacto productiva.
2. Coordinar con **backend-impact-agent** (paso 5) para `evaluacion-backend.md` y `especificacion-backend.md`.
3. El MultiAgentDemo puede implementarse en frontend sin esperar backend.
4. Secuenciar: backend contact API → frontend contacto con API real → validación QA.

---

## Próximo agente

**backend-impact-agent** (paso 5 del workflow) debe detallar la especificación Lambda, IAM y despliegue.  
**planner-agent** (paso 4) debe incluir la dependencia backend en el plan de implementación.
