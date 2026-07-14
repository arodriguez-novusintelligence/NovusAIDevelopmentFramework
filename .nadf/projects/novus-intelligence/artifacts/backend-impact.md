# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `f97e53e`  
**Delta desde:** `e3a9819`  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS sa-east-1)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El commit `f97e53e` **no introduce nuevos requisitos backend**. Los componentes añadidos (`NovusDevFrameworkDemo`) y modificados (`Hero`, `Header`) son interacciones puramente frontend con contenido estático y datos ficticios de demostración. El único endpoint backend requerido sigue siendo el **formulario de contacto**.

**backendRequired: true** — condicionado exclusivamente al formulario de contacto (CHG-008, CHG-011).

---

## Evaluación del delta f97e53e

| Cambio | ¿Requiere backend? | Motivo |
|--------|-------------------|--------|
| NovusDevFrameworkDemo (CHG-014) | No | Modal con simulación local; logs y producto ficticio hardcodeados |
| Hero CTAs interactivos (CHG-015, CHG-016) | No | Estado React local + apertura de Dialog |
| Header CustomEvent (CHG-017) | No | Comunicación intra-frontend |
| Bump vite-tanstack-config (CHG-018) | No | Dependencia de build Lovable |

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

## Componentes frontend sin impacto backend

| Componente | Ubicación | Naturaleza |
|------------|-----------|------------|
| MultiAgentDemo | `/solutions/ai-agents` | Visualización educativa SVG |
| NovusDevFrameworkDemo | Hero `/` (modal) | Simulación marketing con producto ficticio "Lead Manager B2B" |

**Nota:** Los logs de la simulación mencionan deploy AWS, repos GitHub y URL `leadmgr.novus.dev`. Son **narrativa de demo**, no integraciones reales a implementar en backend.

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

| Variable | Uso |
|----------|-----|
| `CONTACT_SES_FROM` | Email remitente verificado en SES |
| `CONTACT_SES_TO` | Destino de mensajes de contacto |
| `CRM_WEBHOOK_URL` | (Opcional) Integración CRM |
| `STAGE` | dev / prod |

---

## Riesgos backend específicos

1. **Modo demo en Lovable:** `submitContact()` simula éxito con `requestId: demo-*`. No replicar en producción.
2. **Sin captcha:** El contrato OpenAPI no define protección anti-spam; recomendar hCaptcha/Turnstile antes de prod.
3. **Rate limiting:** Implementar en API Gateway o Lambda para evitar abuso del endpoint de contacto.

---

## Recomendaciones para backend-impact-agent (paso 05)

- Confirmar que `evaluacion-backend.md` existente sigue vigente; el delta `f97e53e` no altera el alcance.
- No crear endpoints para simulaciones NADF ni para tracking de interacciones del modal (fuera de alcance inicial).
- Si en el futuro se requiere analytics de clicks en "Ver simulación", tratarlo como decisión arquitectónica separada (ADR).

---

## Siguiente agente

**planner-agent** — el plan de implementación no necesita tareas backend adicionales por este delta; mantener prioridad en `POST /api/v1/contact` para habilitar el formulario.
