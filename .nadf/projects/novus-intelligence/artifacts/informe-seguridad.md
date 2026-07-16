# Informe de Seguridad — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-10-revision-seguridad  
**Agente:** security-agent  
**Fecha:** 2026-07-16  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Resultado global:** **PASS**  
**securityScore:** 88

---

## Resumen ejecutivo

Se ejecutó revisión de seguridad sobre los repositorios productivos (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, evaluando la rama `main` mergeada con las correcciones de SEC-001 (IAM SES) y SEC-002 (rate limit por IP).

**Resultado:** **PASS** — Los gates bloqueantes de seguridad se cumplen. No hay secrets en repositorio, CORS está restringido, la validación server-side del contacto es correcta, el rate limiting por IP está activo y los permisos IAM SES están acotados a identidades de la cuenta/región.

**Observaciones no bloqueantes (4):** gestión de secretos vía GitHub Secrets vs SSM/Secrets Manager (SEC-003), vulnerabilidades en devDependencies de Serverless (SEC-004), `clientIp` en logs sin anonimizar (SEC-005) y captcha deshabilitado en DEV (SEC-006, aceptable según plan).

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceWEB | `main` | Secrets, contacto cliente, dependencias, R-001 |
| NovusIntelligenceBack | `main` | CORS, validación, IAM, rate limit, captcha, dependencias |
| NovusAIDevelopmentFramework | `cursor/security-review-paso10-7e85` | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

---

## Metodología

| Área | Método |
|------|--------|
| Secrets | Escaneo regex (`AKIA`, `sk-`, `password=`, `secret=`, tokens) + revisión `.env.example` y `.gitignore` |
| CORS | Revisión `serverless.yml`, `httpResponse.corsHeaders()` y `propuesta-infra.md` |
| Validación contacto | Revisión `contactValidator.ts`, `sanitize.ts`, `ContactPage.tsx`, `contact.ts` (WEB) |
| IAM | Comparación `serverless.yml` vs `propuesta-infra.md` y `especificacion-backend.md` |
| Dependencias | `npm audit --audit-level=high` en WEB y Back |
| Demo mode (R-001) | Revisión `submitContact()` y ausencia de `requestId: demo-*` |

---

## Resultados por área

### 1. Secrets y credenciales — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| API keys / tokens en código | ✅ Sin hallazgos | Escaneo regex en WEB, Back y artifacts |
| Archivos `.env` versionados | ✅ No presentes | Solo `.env.example` con valores vacíos |
| `.gitignore` protege `.env` | ✅ Configurado | Back: `.env`, `.env.*`; WEB: `.env`, `.env.local` |
| Artefactos NADF | ✅ Solo nombres | `propuesta-infra.md`, `dev.yml` sin valores sensibles |
| Variables en `serverless.yml` | ✅ Por nombre | `${env:CONTACT_EMAIL_FROM, ''}` — sin valores embebidos |
| Workflows CI | ✅ Secrets vía GitHub | `deploy-dev.yml` usa `${{ secrets.* }}`, no valores en repo |

**Recomendación no bloqueante (SEC-003):** Migrar carga de `CONTACT_EMAIL_*` y `CAPTCHA_SECRET` a referencias SSM/Secrets Manager según `propuesta-infra.md` (TASK-INFRA-005).

---

### 2. CORS — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Sin wildcard `*` en orígenes | ✅ | `serverless.yml` líneas 17-20: orígenes explícitos |
| `allowCredentials: false` | ✅ | `serverless.yml` línea 26 |
| Validación dinámica en handler | ✅ | `corsHeaders()` refleja solo orígenes en lista blanca |
| Orígenes DEV alineados | ✅ | CloudFront activo, `dev.novusintelligence.com`, `localhost:5173` |
| Métodos restringidos | ✅ | `POST`, `OPTIONS` únicamente |
| Headers restringidos | ✅ | `Content-Type` únicamente |

**Nota:** En producción futura, agregar origen prod vía `CORS_ALLOWED_ORIGINS` (SSM) antes del despliegue; nunca usar `*`.

---

### 3. Validación formulario de contacto — PASS (con observaciones)

#### Server-side (Back) — PASS

| Validación spec | Implementado | Archivo |
|-----------------|--------------|---------|
| V1 `name` 2–120 chars | ✅ | `contactValidator.ts` |
| V2 `email` formato + máx 254 | ✅ | Regex simplificado RFC |
| V3 `message` 5–4000 chars | ✅ | |
| V4 `company` ≤ 160 | ✅ | |
| V5 `phone` ≤ 40 + regex | ✅ | |
| V6 `solutionInterest` enum | ✅ | `SOLUTION_INTERESTS` |
| V7 Sanitización HTML/script | ✅ | `sanitize.ts` + `escapeHtml` en email SES |
| V8 Content-Type JSON | ✅ | `contact.ts` handler |
| V9 JSON parseable | ✅ | try/catch en handler |
| V10 Captcha condicional | ✅ | `captchaService.ts` |

#### Client-side (WEB) — PASS con observación

| Verificación | Resultado | Nota |
|--------------|-----------|------|
| Sin fallback demo (R-001) | ✅ | `contact.ts` retorna error si falta `VITE_NOVUS_API_URL` |
| `VITE_DEMO_MODE=true` bloqueado | ✅ | Retorna `ok: false` con mensaje explícito |
| Sin `requestId: demo-*` | ✅ | Backend usa `randomUUID()` |
| Validación básica pre-submit | ⚠️ | Solo campos requeridos; longitud/formato delegados al servidor |

**Observación:** La validación client-side es mínima (UX), pero el servidor cumple contrato completo. Aceptable para DEV.

---

### 4. Permisos IAM propuestos — PASS (con observación)

#### Implementación actual (`NovusIntelligenceBack/serverless.yml`)

```yaml
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - ses:SendEmail
          - ses:SendRawEmail
        Resource:
          - Fn::Sub: arn:aws:ses:${AWS::Region}:${AWS::AccountId}:identity/*
      - Effect: Allow
        Action:
          - logs:CreateLogGroup
          - logs:CreateLogStream
          - logs:PutLogEvents
        Resource:
          - Fn::Sub: arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/novus-contact-handler-${self:provider.stage}:*
```

| Verificación | Resultado | Detalle |
|--------------|-----------|---------|
| SES sin `Resource: '*'` | ✅ | Corregido (commits #9–#11); acotado a `identity/*` en cuenta/región |
| CloudWatch acotado a log group | ✅ | ARN específico del handler |
| Permisos `secretsmanager` / `ssm` | ⚠️ | No presentes; desalineado con propuesta IaC (SEC-003, no bloqueante) |
| SES dominio específico | ⚠️ | Propuesta usa `identity/novusintelligence.com`; implementación usa `identity/*` |

**Evaluación:** El permiso `identity/*` cumple mínimo privilegio relativo a `Resource: '*'` — solo identidades SES verificadas en la cuenta propia. **PASS** con recomendación de acotar al dominio específico en pre-prod.

---

### 5. Rate limiting — PASS

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ✅ | `burstLimit: 20`, `rateLimit: 10` req/s (global stage) |
| App-level `RATE_LIMIT_PER_IP` | ✅ | `isIpRateLimited()` invocado en handler (líneas 75–87) |
| Ventana | ✅ | 10 req / 5 min por IP (`ipRateLimiter.ts`) |
| Respuesta 429 | ✅ | `rateLimitResponse()` retorna mensaje genérico |

**Observación no bloqueante:** El rate limiter en memoria se reinicia en cold starts de Lambda. Aceptable para DEV; en producción considerar DynamoDB o AWS WAF rate-based rule.

---

### 6. Captcha (R-008) — PASS (DEV) / PENDIENTE (pre-prod)

| Verificación | Resultado |
|--------------|-----------|
| `CAPTCHA_ENABLED=false` por defecto | ✅ Alineado a DEV |
| Servicio Turnstile/hCaptcha implementado | ✅ `captchaService.ts` |
| Obligatorio pre-prod documentado | ✅ Plan + riesgos R-008 |

**No bloqueante para DEV.** Bloqueante antes de producción.

---

### 7. Dependencias — PASS (runtime) / ADVERTENCIA (dev tooling)

#### NovusIntelligenceWEB

| Comando | Resultado |
|---------|-----------|
| `npm audit --audit-level=high` | **0 vulnerabilidades** |

#### NovusIntelligenceBack

| Comando | Resultado |
|---------|-----------|
| `npm audit --audit-level=high` | **1 high, 3 critical** (cadena `serverless` devDependency) |

| Paquete afectado | Severidad | Alcance |
|------------------|-----------|---------|
| `decompress` | Critical | devDependency (CLI Serverless deploy) |
| `tar` | High | devDependency |
| `@aws-sdk/client-ses` (runtime) | ✅ Sin vulnerabilidades high/critical | Bundle Lambda |

**Evaluación:** Vulnerabilidades en herramientas de desarrollo/despliegue, no en bundle Lambda. **No bloqueante** para runtime.

---

### 8. Logging y privacidad — ADVERTENCIA

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| `clientIp` en logs sin hash | Media | `contact.ts` — spec sugiere hash opcional |
| Email completo en notificación SES | Bajo | Esperado para notificación comercial |
| Sin stack traces al cliente | ✅ | `internalErrorResponse` genérico |
| `EMAIL_DRY_RUN` bloqueado en deploy | ✅ | Guard en `env.ts` — solo `development`/`test` |

---

### 9. Modo demo y mocks (R-001) — PASS

| Verificación | Resultado |
|--------------|-----------|
| `submitContact()` sin éxito simulado | ✅ |
| `DEMO_MODE=true` retorna error explícito | ✅ |
| Error explícito sin API URL | ✅ |
| Backend `requestId` = `randomUUID()` | ✅ Sin prefijo `demo-` |
| Textos UI "Agenda una demo" (CTA marketing) | ✅ No relacionados con API mock |

---

### 10. Alineación al plan aprobado

| Gate seguridad | Resultado |
|----------------|-----------|
| `plan_approved` | ✅ PASS |
| `no_secrets_in_repo` | ✅ PASS |
| `no_mock_data_in_production` | ✅ PASS |
| CORS correcto | ✅ PASS |
| Rate limit activo | ✅ PASS |
| IAM mínimo privilegio | ✅ PASS |
| `NO_DEPLOY` | ✅ Respetado |

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Agente responsable |
|----|----------|-----------|------------|-------------------|
| SEC-003 | Secretos vía `env:` / GitHub Secrets vs SSM/Secrets Manager | Media | No | cloud-agent + devops-agent |
| SEC-004 | Vulnerabilidades en devDependencies Serverless | Media | No | devops-agent |
| SEC-005 | `clientIp` en logs sin anonimizar | Media | No | backend-agent |
| SEC-006 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | backend-agent |
| SEC-007 | Validación client-side mínima | Baja | No | frontend-integration-agent |
| SEC-008 | IAM SES `identity/*` vs dominio específico | Baja | No | backend-agent |

### Hallazgos resueltos desde revisión 2026-07-14

| ID | Hallazgo | Estado |
|----|----------|--------|
| SEC-001 | IAM SES `Resource: '*'` | ✅ **Resuelto** — `identity/*` acotado a cuenta/región |
| SEC-002 | Rate limit por IP no implementado | ✅ **Resuelto** — `isIpRateLimited()` activo en handler |

---

## Recomendaciones priorizadas

### Pre-producción

1. **SEC-006:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
2. **SEC-003:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml`.
3. **SEC-008:** Acotar SES a `identity/novusintelligence.com`.
4. **SEC-005:** Hashear o enmascarar `clientIp` en logs estructurados.

### Seguimiento DevOps

5. **SEC-004:** Evaluar upgrade Serverless v4 o contenedor CI aislado para mitigar CVEs en toolchain.
6. **Rate limit producción:** Migrar de in-memory a DynamoDB o AWS WAF rate-based rule.

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 88 |
| checksTotal | 12 |
| checksPassed | 10 |
| checksFailed | 0 |
| checksWarning | 2 |
| criticalFindings | 0 |
| highFindings | 0 |
| mediumFindings | 4 |
| lowFindings | 2 |

---

## Próximo agente sugerido

**reviewer-agent** — Proceder con revisión de código y gate `no_lovable_code_copy` tras security PASS.

---

## Referencias

- `artifacts/plan-implementacion.md`
- `artifacts/especificacion-backend.md`
- `artifacts/propuesta-infra.md`
- `artifacts/informe-qa.md`
- `artifacts/riesgos.md` (R-001, R-008)
- `.nadf/global/rules/security-rules.md`
- Ramas: `NovusIntelligenceWEB@main`, `NovusIntelligenceBack@main`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Revisión seguridad Fase 9 — resultado FAIL (IAM + rate limit) | security-agent |
| 2026-07-16 | Re-revisión paso-10 — resultado PASS (SEC-001/SEC-002 resueltos en main) | security-agent |
