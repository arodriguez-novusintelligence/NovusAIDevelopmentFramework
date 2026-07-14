# Resumen Backend — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-06-implementar-backend  
**Agente:** backend-agent  
**Fecha:** 2026-07-14  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Repositorio:** NovusIntelligenceBack  
**Rama:** `cursor/implement-contact-backend-f57a`

---

## Resumen ejecutivo

Se implementó y endureció el endpoint **`POST /api/v1/contact`** en **NovusIntelligenceBack** según `especificacion-backend.md` y `evaluacion-backend.md`. El handler valida y sanitiza el payload, envía notificación por email vía abstracción SES, aplica rate limiting por IP, soporta captcha opcional y webhook CRM no bloqueante.

Esta iteración corrige desviaciones **R-001** (sin modo demo en stages desplegados): `EMAIL_DRY_RUN` deshabilitado por defecto, bloqueado fuera de `NODE_ENV=development|test`, y CORS sin wildcard `*`.

**Build:** `npm run typecheck` y `npm run lint` exitosos.  
**Despliegue:** No realizado (`NO_DEPLOY`).

---

## Endpoint implementado

| Método | Ruta | Handler | Timeout |
|--------|------|---------|---------|
| POST | `/api/v1/contact` | `novus-contact-handler` | 10s |
| OPTIONS | `/api/v1/contact` | `novus-contact-handler` | CORS preflight |

---

## Arquitectura

```
API Gateway (HTTP API, sa-east-1)
  → Lambda novus-contact-handler (Node.js 20, arm64)
    → Validación + sanitización (contactValidator)
    → Captcha opcional (Turnstile / hCaptcha)
    → EmailService → SesEmailService (AWS SES)
    → CrmWebhookService (opcional, fire-and-forget)
```

**Abstracciones provider-agnostic:**

- `EmailService` / `SesEmailService` — email transaccional
- `DryRunEmailService` — solo `NODE_ENV=development|test` + `EMAIL_DRY_RUN=true` (local)

---

## Contrato API

### Request (`ContactRequest`)

Campos requeridos: `name` (2–120), `email` (RFC simplificado), `message` (5–4000).  
Opcionales: `company` (≤160), `phone` (≤40), `solutionInterest` (enum 6 slugs), `captchaToken` (obligatorio si `CAPTCHA_ENABLED=true`).

### Response (`ContactResponse`)

| Código | Condición |
|--------|-----------|
| 200 | Validación OK + email enviado — `{ ok: true, requestId: UUID, message }` |
| 400 | Validación / captcha / Content-Type inválido — `{ ok: false, errors[] }` |
| 405 | Método distinto a POST |
| 429 | Rate limit excedido (10 req / 5 min por IP) |
| 500 | Fallo SES, secrets ausentes, error interno |

**R-001:** `requestId` siempre UUID v4 real; nunca prefijo `demo-`.

---

## Variables de entorno

| Variable | Obligatorio | Uso |
|----------|-------------|-----|
| `CONTACT_EMAIL_FROM` | Sí (excepto dry-run local) | Remitente SES |
| `CONTACT_EMAIL_TO` | Sí (excepto dry-run local) | Destinatario comercial |
| `CORS_ALLOWED_ORIGINS` | Sí | Orígenes permitidos (coma-separados) |
| `RATE_LIMIT_PER_IP` | No | Default 10 / ventana 5 min |
| `CAPTCHA_ENABLED` | No | Default `false` |
| `CAPTCHA_PROVIDER` | Condicional | `turnstile` o `hcaptcha` |
| `CAPTCHA_SECRET` | Condicional | Secret verificación |
| `CRM_WEBHOOK_URL` | No | Webhook CRM opcional |
| `EMAIL_DRY_RUN` | No | Solo local dev; bloqueado en stages desplegados |
| `LOG_LEVEL` | No | Default `info` |

Valores sensibles en AWS Secrets Manager / SSM — **nunca en repositorio**.

---

## Archivos del backend

```
NovusIntelligenceBack/
├── serverless.yml                          # HTTP API, Lambda, IAM SES, alarmas CW
├── src/handlers/contact.ts                 # Handler principal
├── src/types/contact.ts                    # Tipos ContactRequest/Response
├── src/lib/config/env.ts                   # Carga config + guard R-001
├── src/lib/validation/contactValidator.ts
├── src/lib/sanitize/sanitize.ts
├── src/lib/response/httpResponse.ts        # Respuestas + CORS + logs JSON
├── src/lib/rateLimit/ipRateLimiter.ts      # 10 req / 5 min por IP
├── src/services/email/
│   ├── emailService.ts                     # Interfaz
│   ├── sesEmailService.ts                  # Implementación AWS SES
│   └── dryRunEmailService.ts               # Solo dev local
├── src/services/captcha/captchaService.ts
└── src/services/crm/crmWebhookService.ts
```

---

## Cambios en esta iteración (R-001 + spec)

| Archivo | Cambio |
|---------|--------|
| `serverless.yml` | `EMAIL_DRY_RUN` default `false`; CORS sin `*` |
| `src/lib/config/env.ts` | Bloquea dry-run fuera de development/test |
| `src/lib/rateLimit/ipRateLimiter.ts` | Ventana 5 min (spec: 10 req / 5 min) |
| `.github/workflows/deploy-dev.yml` | `EMAIL_DRY_RUN` default `false` en CI |
| `.env.example` | Documenta `EMAIL_DRY_RUN=false` |
| `README.md` | Documenta variable `EMAIL_DRY_RUN` |

---

## Criterios de aceptación (especificacion-backend.md)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-01 | POST válido → 200 + UUID | ✅ Implementado |
| AC-02 | Campos inválidos → 400 + errors[] | ✅ Implementado |
| AC-03 | Rate limit → 429 | ✅ IP limiter + API GW throttle |
| AC-04 | Email vía SES a CONTACT_EMAIL_TO | ✅ SesEmailService |
| AC-05 | CORS preflight OPTIONS | ✅ Handler + serverless cors |
| AC-06 | Sin secrets en código | ✅ Solo nombres en repo |
| AC-07 | Sin requestId demo-* | ✅ randomUUID(); R-001 enforced |
| AC-08 | Logs con requestId | ✅ logStructured JSON |
| AC-09 | Captcha cuando habilitado | ✅ turnstile/hcaptcha |

Verificación en DEV desplegado pendiente de `cloud-agent` + aprobación humana.

---

## Quality gates

| Gate | Cumplimiento |
|------|--------------|
| `plan_approved` | ✅ PLAN-NOVUS-LOVABLE-2026-07-14 approved |
| `no_mock_data_in_production` | ✅ R-001: dry-run bloqueado en stages |
| `no_secrets_in_repo` | ✅ Solo `.env.example` con placeholders |
| `NO_DEPLOY` | ✅ Sin despliegue en esta ejecución |
| `NO_LOVABLE_CODE_COPY` | ✅ Contrato reimplementado en TS |
| `TARGET_DEV_REGION_SA_EAST_1` | ✅ region default sa-east-1 |

---

## Próximos pasos

| Agente | Acción |
|--------|--------|
| **cloud-agent** | Desplegar stack DEV sa-east-1; configurar secrets SES |
| **devops-agent** | Pipeline CI; `VITE_NOVUS_API_URL` en frontend |
| **frontend-integration-agent** | Integrar formulario tras API DEV disponible (Fase 6) |
| **qa-agent** | Validar AC-01–AC-09 en entorno DEV |
| **security-agent** | Validar CORS, rate limit, captcha pre-prod (R-008) |

---

## Referencias

- `artifacts/especificacion-backend.md`
- `artifacts/evaluacion-backend.md`
- `artifacts/plan-implementacion.md` (Fase 5)
- `artifacts/backend-impact.md`
- PR: NovusIntelligenceBack `cursor/implement-contact-backend-f57a`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Scaffold + endpoint inicial en main | backend-agent (iteración previa) |
| 2026-07-14 | Endurecimiento R-001 + alineación spec | backend-agent |
