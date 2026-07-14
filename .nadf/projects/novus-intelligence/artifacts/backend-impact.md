# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `746c129`  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS sa-east-1)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent  
**Delta desde:** `e3a9819` (sin nuevos endpoints)

---

## Resumen ejecutivo

El delta reciente (NovusDevFrameworkDemo, Testimonials redesign, logos CDN, CI notify-nadf) **no introduce nuevos requisitos backend**. El prototipo Lovable sigue requiriendo un único endpoint productivo: el formulario de contacto. Los componentes interactivos (`NovusDevFrameworkDemo`, `MultiAgentDemo`) y los assets de logos son puramente frontend.

**backendRequired: true** — condicionado exclusivamente al formulario de contacto (CHG-008, CHG-011).

---

## Evaluación del delta reciente

| Cambio | ¿Requiere backend? | Motivo |
|--------|-------------------|--------|
| CHG-014 NovusDevFrameworkDemo | No | Simulación visual educativa; sin API |
| CHG-015 Hero CTA/interacción | No | Estado React + CustomEvent local |
| CHG-016 Header home trigger | No | Evento DOM local |
| CHG-017 Testimonials redesign | No | Renderizado estático de `cases.ts` |
| CHG-018 Logos clientes CDN | No | Assets estáticos; hosting en frontend/CDN |
| CHG-019 CI notify-nadf | No (infra CI) | GitHub Actions → repository_dispatch; fuera de API productiva |

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

| Variable | Uso | Secret |
|----------|-----|--------|
| `CONTACT_SES_FROM` | Email remitente verificado en SES | No |
| `CONTACT_SES_TO` | Destino de leads | No |
| `CRM_WEBHOOK_URL` | Integración CRM opcional | Sí (SSM/Secrets Manager) |
| `RATE_LIMIT_PER_IP` | Límite anti-abuso | No |

---

## Riesgo de modo demo (sin cambio en delta)

`src/lib/api/contact.ts` en Lovable mantiene fallback demo:

- Activo si `VITE_DEMO_MODE=true` o DEV sin `VITE_NOVUS_API_URL`.
- Retorna `requestId: demo-{timestamp}`.

**Acción backend:** implementar endpoint real antes de habilitar formulario en producción. El frontend productivo debe rechazar submit sin API configurada.

---

## Integración CI (CHG-019) — Nota infraestructura

El workflow `notify-nadf.yml` dispara `repository_dispatch` al Framework con:

- `event_type: lovable-commit`
- `client_payload: { source, sha, ref }`
- Secret: `NADF_DISPATCH_TOKEN` (PAT, no en código)

Esto es **orquestación de pipeline**, no endpoint de aplicación. El rol `devops-agent` o `workflow-agent` gestiona la configuración del secret en GitHub.

---

## Matriz de impacto backend por página

| Página | Endpoints | Estado |
|--------|-----------|--------|
| `/` (landing + modal demo) | Ninguno | Solo frontend |
| `/contact` | POST /api/v1/contact | **Pendiente** |
| `/solutions/*` | Ninguno | Solo frontend |
| Resto | Ninguno | Contenido estático |

---

## Recomendaciones para backend-impact-agent (paso 05)

1. Confirmar si `POST /api/v1/contact` ya existe en NovusIntelligenceBack.
2. Si no existe, priorizar implementación antes del formulario en WEB.
3. Evaluar rate limiting y captcha (ver riesgos R-008, R-011).
4. No crear endpoints para NovusDevFrameworkDemo ni logos — son concerns de frontend/assets.

---

## Conclusión

| Métrica | Valor |
|---------|-------|
| Endpoints nuevos en delta | 0 |
| Endpoints totales requeridos | 1 |
| Bases de datos | 0 |
| Servicios externos (además SES) | CRM webhook (opcional) |
| Bloqueo backend para delta visual | No |
