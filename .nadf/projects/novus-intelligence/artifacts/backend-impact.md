# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `20d79e1`  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS sa-east-1)  
**Fecha:** 2026-07-14  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El prototipo Lovable **requiere un único endpoint backend** para funcionalidad productiva: el formulario de contacto. Los componentes interactivos nuevos (`NovusDevFrameworkDemo`, `MultiAgentDemo`) y el rediseño de Testimonials son **puramente frontend** y no requieren API adicional. El workflow CI `notify-nadf.yml` opera a nivel DevOps/Framework, no en NovusIntelligenceBack.

**backendRequired: true** — condicionado exclusivamente al formulario de contacto.

---

## Evaluación del delta reciente (e3a9819 → 20d79e1)

| Cambio | Requiere backend | Motivo |
|--------|------------------|--------|
| CHG-014 NovusDevFrameworkDemo | No | Simulación visual local con estado React |
| CHG-015 Hero demo triggers | No | Evento DOM + estado modal |
| CHG-016 Testimonials | No | Contenido estático + assets |
| CHG-017 Bank logos | No | Assets estáticos |
| CHG-018 notify-nadf.yml | No (Back) | CI → Framework dispatch; secret `NADF_DISPATCH_TOKEN` en novus-nexus |

**Conclusión:** El delta no introduce nuevos endpoints ni cambios en contratos backend existentes.

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

| Variable | Uso |
|----------|-----|
| `CONTACT_SES_FROM` | Email remitente verificado en SES |
| `CONTACT_SES_TO` | Destino (arodriguez@novusintelligencesolutions.com) |
| `CRM_WEBHOOK_URL` | Opcional — integración CRM |
| `RATE_LIMIT_PER_IP` | Opcional — protección anti-spam |

### Variable frontend (no backend)

| Variable | Uso |
|----------|-----|
| `VITE_NOVUS_API_URL` | Base URL del API Gateway en NovusIntelligenceWEB |
| `VITE_DEMO_MODE` | **Prohibido en producción** — ver riesgos R-001 |

---

## Riesgo de modo demo (sin cambios en delta)

`src/lib/api/contact.ts` mantiene fallback demo:

```typescript
if (!API_URL) {
  if (DEMO_MODE || import.meta.env.DEV) {
    return { ok: true, requestId: `demo-${Date.now()}`, message: "..." };
  }
}
```

**Acción requerida en implementación productiva:**

1. Backend-agent implementa endpoint real.
2. Frontend-integration-agent elimina fallback demo en builds de staging/prod.
3. QA valida que sin API_URL el formulario muestra error, no éxito.

---

## Componentes sin impacto backend

| Componente | Tipo | Notas |
|------------|------|-------|
| NovusDevFrameworkDemo | Educativo/marketing | Simula flujo NADF; no persiste datos |
| MultiAgentDemo | Educativo/marketing | Diagrama SVG; sin API |
| Testimonials | Contenido estático | Datos en `cases.ts` |
| Páginas legales | Contenido estático | Sin formularios que persistan |
| About / Services / Solutions | Contenido estático | CTAs navegan a contacto |

---

## Integración CI (CHG-018) — Alcance DevOps

El workflow `notify-nadf.yml` en novus-nexus:

- Dispara `repository_dispatch` con `event_type: lovable-commit` al Framework.
- Requiere secret `NADF_DISPATCH_TOKEN` en repo novus-nexus (no en Back).
- Habilita orquestación multiagente; **no modifica NovusIntelligenceBack**.

Responsable downstream: `devops-agent` / orquestador GitHub Actions del Framework.

---

## Checklist para backend-impact-agent (paso 05)

- [ ] Confirmar que `POST /api/v1/contact` cubre todos los campos del formulario actualizado
- [ ] Validar enum `solutionInterest` contra slugs en `solutions.ts`
- [ ] Definir rate limiting y captcha (ver riesgo R-008)
- [ ] Verificar región sa-east-1 para SES y Lambda
- [ ] Documentar en `evaluacion-backend.md` si CRM webhook es necesario

---

## Próximo agente

**planner-agent** debe incluir la dependencia backend del formulario de contacto en el plan. **backend-impact-agent** (paso 05) profundizará la especificación sin duplicar este análisis.
