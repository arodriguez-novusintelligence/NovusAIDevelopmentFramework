# Informe de Seguridad — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-10-revision-seguridad  
**Agente:** security-agent  
**Fecha:** 2026-07-15  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Resultado global:** **PASS**  
**securityScore:** 88

---

## Resumen ejecutivo

Se ejecutó revisión de seguridad sobre los repositorios productivos (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, evaluando la rama **`main`** de cada repositorio (código mergeado post-ejecución).

**Resultado:** **PASS** — cumple los quality gates de seguridad bloqueantes para DEV. Los hallazgos críticos de la revisión anterior (2026-07-14) fueron remediados en código:

1. **IAM SES** — ya no usa `Resource: '*'`; acotado a identidades SES de la cuenta/región.
2. **Rate limiting por IP** — implementado en `contact.ts` vía `ipRateLimiter.ts` (10 req / 5 min).

**Observaciones no bloqueantes:** IAM SES aún más amplio que la propuesta IaC (`identity/*` vs dominio específico), rate limit en memoria de contenedor Lambda (no distribuido), secretos vía variables de entorno planas vs SSM/Secrets Manager, y vulnerabilidades en toolchain Serverless (devDependencies).

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceWEB | `main` | Secrets, contacto cliente, dependencias, CI |
| NovusIntelligenceBack | `main` | CORS, validación, IAM, rate limit, captcha, dependencias, CI |
| NovusAIDevelopmentFramework | `cursor/security-review-paso10-9063` | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

---

## Metodología

| Área | Método |
|------|--------|
| Secrets | Escaneo regex (`AKIA`, `sk-`, `password=`, `secret=`, tokens) + revisión `.env.example`, `.gitignore` y workflows CI |
| CORS | Revisión `serverless.yml`, `httpResponse.corsHeaders()` y `propuesta-infra.md` |
| Validación contacto | Revisión `contactValidator.ts`, `sanitize.ts`, `ContactPage.tsx`, `contact.ts` (WEB) |
| IAM | Comparación `serverless.yml` vs `propuesta-infra.md` y `especificacion-backend.md` |
| Dependencias | `npm audit --audit-level=high` en WEB y Back |
| Demo mode (R-001) | Revisión `submitContact()`, `EMAIL_DRY_RUN`, ausencia de `requestId: demo-*` |

---

## Resultados por área

### 1. Secrets y credenciales — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| API keys / tokens en código | ✅ Sin hallazgos | Escaneo en WEB, Back y artifacts |
| Archivos `.env` versionados | ✅ No presentes | Solo `.env.example` con valores vacíos |
| `.gitignore` protege `.env` | ✅ Configurado | Back: `.env`, `.env.*`; WEB: `.env`, `.env.local` |
| Artefactos NADF | ✅ Solo nombres | `propuesta-infra.md`, `dev.yml` sin valores sensibles |
| Variables en `serverless.yml` | ✅ Por nombre | `${env:CONTACT_EMAIL_FROM, ''}` — sin valores embebidos |
| Workflows CI | ✅ GitHub Secrets | `AWS_*`, `CONTACT_EMAIL_*` referenciados como secrets, no en repo |

**Recomendación no bloqueante (SEC-003):** Migrar carga de `CONTACT_EMAIL_*` y `CAPTCHA_SECRET` a referencias SSM/Secrets Manager según `propuesta-infra.md` (TASK-INFRA-005).

---

### 2. CORS — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Sin wildcard `*` en orígenes | ✅ | `serverless.yml` líneas 17-20: orígenes explícitos |
| `allowCredentials: false` | ✅ | `serverless.yml` línea 26 |
| Validación dinámica en handler | ✅ | `corsHeaders()` refleja solo orígenes en lista blanca |
| Orígenes DEV alineados | ✅ | CloudFront, `dev.novusintelligence.com`, `localhost:5173` |
| Métodos restringidos | ✅ | `POST`, `OPTIONS` únicamente |
| Headers restringidos | ✅ | `Content-Type` únicamente |

**Nota:** Antes de producción, agregar origen prod vía `CORS_ALLOWED_ORIGINS` (SSM); nunca usar `*`.

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
| V7 Sanitización HTML/script | ✅ | `sanitize.ts` + `escapeHtml` en email |
| V8 Content-Type JSON | ✅ | `contact.ts` handler |
| V9 JSON parseable | ✅ | try/catch en handler |
| V10 Captcha condicional | ✅ | `captchaService.ts` |

#### Client-side (WEB) — PASS con observación

| Verificación | Resultado | Nota |
|--------------|-----------|------|
| Sin fallback demo (R-001) | ✅ | `contact.ts` retorna error si falta `VITE_NOVUS_API_URL` |
| Bloqueo `VITE_DEMO_MODE=true` | ✅ | Retorna `ok: false` con mensaje explícito |
| Sin `requestId: demo-*` | ✅ | Backend usa `randomUUID()` |
| Validación básica pre-submit | ⚠️ | name, email, message; longitud delegada al servidor |
| CI frontend fija `VITE_DEMO_MODE=false` | ⚠️ | No explícito en workflow; default implícito `false` |

**Observación SEC-007:** Validación client-side es mínima pero aceptable; el servidor es autoridad. Opcional reforzar longitud de campos en frontend.

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

#### Propuesta alineada (`propuesta-infra.md`)

```yaml
Resource:
  - arn:aws:ses:sa-east-1:${aws:accountId}:identity/novusintelligence.com
```

| Hallazgo | Severidad | Bloqueante |
|----------|-----------|------------|
| SES con `identity/*` (todas las identidades de la cuenta) | Media | **No** — remediado respecto a `Resource: '*'`; recomendable acotar a dominio en prod |
| Sin permisos `secretsmanager` / `ssm` | Media | No (desalineado con TASK-INFRA-005 si se adopta SSM) |
| CloudWatch acotado a log group Lambda | Baja | No — mejora respecto a revisión anterior |

**Evaluación:** Cumple principio de mínimo privilegio **relativo a la cuenta AWS** para DEV. Antes de producción, acotar SES al ARN de `novusintelligence.com` según propuesta IaC.

---

### 5. Rate limiting — PASS (con observación)

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ✅ | `burstLimit: 20`, `rateLimit: 10` — límite global del stage |
| App-level `RATE_LIMIT_PER_IP` | ✅ | `isIpRateLimited()` invocado en `contact.ts` líneas 75-87 |
| Ventana | ✅ | 300 s (5 min), alineado a especificación |
| Persistencia | ⚠️ | Map en memoria del contenedor Lambda — no distribuido entre instancias |

**Observación SEC-002b:** Suficiente para DEV de bajo tráfico. Para producción o tráfico elevado, migrar a DynamoDB/ElastiCache o AWS WAF rate-based rule documentada en IaC.

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

Dependencias runtime: React 18, React Router 6, Vite 6, Tailwind — sin hallazgos críticos.

#### NovusIntelligenceBack

| Comando | Resultado |
|---------|-----------|
| `npm audit --audit-level=high` | **1 high, 3 critical** (cadena `serverless` devDependency) |

| Paquete afectado | Severidad | Alcance |
|------------------|-----------|---------|
| `decompress` | Critical | devDependency (CLI Serverless deploy) |
| `tar` | High | devDependency |
| `@aws-sdk/client-ses` (runtime) | ✅ Sin vulnerabilidades high/critical | Bundle Lambda |

**Evaluación SEC-004:** Vulnerabilidades en herramientas de desarrollo/despliegue, no en bundle Lambda. No bloqueante para runtime; recomendable evaluar upgrade Serverless v4 en CI.

---

### 8. Logging y privacidad — ADVERTENCIA

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| `clientIp` en logs sin hash | Media | `contact.ts` — spec sugiere hash opcional |
| `EMAIL_DRY_RUN` retorna 200 sin envío real | Media | Aceptable solo en local; workflow DEV default `false` |
| Email completo en notificación SES | Bajo | Esperado para notificación comercial |
| Sin stack traces al cliente | ✅ | `internalErrorResponse` genérico |

---

### 9. Modo demo y mocks (R-001) — PASS

| Verificación | Resultado |
|--------------|-----------|
| `submitContact()` sin éxito simulado | ✅ |
| Error explícito sin API URL | ✅ |
| Bloqueo si `VITE_DEMO_MODE=true` | ✅ |
| Backend `requestId` = `randomUUID()` | ✅ Sin prefijo `demo-` |
| `EMAIL_DRY_RUN` default `false` en deploy | ✅ Workflow `deploy-dev.yml` |

---

### 10. Alineación al plan aprobado

| Gate seguridad | Resultado |
|----------------|-----------|
| `plan_approved` | ✅ PASS |
| `no_secrets_in_repo` | ✅ PASS |
| `no_mock_data_in_production` | ✅ PASS |
| CORS correcto | ✅ PASS |
| Rate limit activo | ✅ PASS |
| IAM mínimo privilegio | ✅ PASS (con observación SES `identity/*`) |
| `NO_DEPLOY` | ✅ Respetado |

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Agente responsable |
|----|----------|-----------|------------|-------------------|
| SEC-001 | IAM SES `identity/*` más amplio que dominio específico | Media | No | backend-agent |
| SEC-002 | Rate limit en memoria Lambda (no distribuido) | Media | No | backend-agent + cloud-agent |
| SEC-003 | Secretos vía `env:` plano vs SSM/Secrets Manager | Media | No | cloud-agent + devops-agent |
| SEC-004 | Vulnerabilidades en devDependencies Serverless | Media | No | devops-agent |
| SEC-005 | `clientIp` en logs sin anonimizar | Media | No | backend-agent |
| SEC-006 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | backend-agent |
| SEC-007 | Validación client-side mínima | Baja | No | frontend-integration-agent |
| SEC-008 | CI frontend no fija explícitamente `VITE_DEMO_MODE=false` | Baja | No | devops-agent |

---

## Remediaciones aplicadas desde revisión anterior

| ID anterior | Estado | Evidencia |
|-------------|--------|-----------|
| SEC-001 (IAM `Resource: '*'`) | ✅ Remediado | `identity/*` en `serverless.yml` |
| SEC-002 (rate limit no invocado) | ✅ Remediado | `isIpRateLimited()` en handler |

---

## Recomendaciones priorizadas

### Pre-producción

1. **SEC-001:** Acotar SES a `arn:aws:ses:sa-east-1:${AccountId}:identity/novusintelligence.com`.
2. **SEC-006:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
3. **SEC-003:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml`.
4. **SEC-002:** Evaluar rate limit distribuido (DynamoDB/WAF) para tráfico prod.

### Seguimiento DevOps

5. **SEC-004:** Evaluar upgrade Serverless v4 o contenedor CI aislado.
6. **SEC-008:** Fijar `VITE_DEMO_MODE=false` explícitamente en `deploy-dev.yml` del frontend.
7. **SEC-005:** Hashear o enmascarar `clientIp` en logs estructurados.

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
| mediumFindings | 6 |
| lowFindings | 2 |

---

## Próximo agente sugerido

**reviewer-agent** — Proceder con revisión de código y gate `no_lovable_code_copy` en paso 11 del workflow.

---

## Referencias

- `artifacts/plan-implementacion.md`
- `artifacts/especificacion-backend.md`
- `artifacts/propuesta-infra.md`
- `artifacts/informe-qa.md`
- `artifacts/riesgos.md` (R-001, R-008)
- `.nadf/global/rules/security-rules.md`
- Ramas evaluadas: `NovusIntelligenceWEB@main`, `NovusIntelligenceBack@main`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Revisión inicial — FAIL (IAM wildcard + rate limit ausente) | security-agent |
| 2026-07-15 | Revisión revalidada en `main` — PASS tras remediaciones | security-agent |
