# Informe de Seguridad — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-10-revision-seguridad  
**Agente:** security-agent  
**Fecha:** 2026-07-14  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Resultado global:** **FAIL**  
**securityScore:** 84

---

## Resumen ejecutivo

Se ejecutó revisión de seguridad sobre los repositorios productivos en **`main`** (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, comparando con la revisión anterior (2026-07-14).

**Mejoras confirmadas desde revisión previa:**

1. **SEC-002 resuelto** — Rate limiting por IP conectado en `contact.ts` (`isIpRateLimited` + `rateLimitResponse()`).
2. **SEC-001 parcialmente mitigado** — IAM SES ya no usa `Resource: '*'`; ahora acota a `identity/*` en la región/cuenta.

**Hallazgo bloqueante actual (1):**

1. **CORS wildcard en configuración por defecto** — `serverless.yml` define fallback `CORS_ALLOWED_ORIGINS` con `*`; `corsHeaders()` habilita cualquier origen si `*` está en la lista.

**Aspectos que pasan:** sin secrets en repositorio, validación server-side del contacto, mitigación R-001 (sin modo demo), captcha preparado (deshabilitado en DEV), rate limit activo, IAM SES acotado a identities (mejora sustancial).

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Commit | Enfoque |
|-------------|--------------|--------|---------|
| NovusIntelligenceWEB | `main` | `cdd9f95` | Secrets, contacto cliente, dependencias |
| NovusIntelligenceBack | `main` | `bf3bd2b` | CORS, validación, IAM, rate limit, captcha, dependencias |
| NovusAIDevelopmentFramework | `cursor/security-review-paso10-a8d8` | — | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

---

## Metodología

| Área | Método |
|------|--------|
| Secrets | Escaneo regex (`AKIA`, `sk-`, `password=`, `secret=`, tokens) + revisión `.env.example`, `.gitignore` y workflows CI |
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
| API keys / tokens en código | ✅ Sin hallazgos | Escaneo en WEB, Back y artifacts |
| Archivos `.env` versionados | ✅ No presentes | Solo `.env.example` con valores vacíos |
| `.gitignore` protege `.env` | ✅ Configurado | Back: `.env`, `.env.*`; WEB: `.env`, `.env.local` |
| Artefactos NADF | ✅ Solo nombres | `propuesta-infra.md`, `dev.yml` sin valores sensibles |
| Variables en `serverless.yml` | ✅ Por nombre | `${env:CONTACT_EMAIL_FROM, ''}` — sin valores embebidos |
| Workflows CI | ✅ Referencias por nombre | GitHub Secrets/Vars; sin valores en YAML |

**Recomendación no bloqueante (SEC-003):** Migrar carga de `CONTACT_EMAIL_*` y `CAPTCHA_SECRET` a referencias SSM/Secrets Manager según `propuesta-infra.md` (TASK-INFRA-005).

---

### 2. CORS — FAIL

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| API Gateway `httpApi.cors` sin wildcard | ✅ | Orígenes explícitos: `dev.novusintelligence.com`, `localhost:5173` |
| `allowCredentials: false` | ✅ | `serverless.yml` |
| Validación dinámica en handler | ⚠️ | `corsHeaders()` permite cualquier origen si `*` está en lista |
| **Fallback default con `*`** | ❌ **BLOQUEANTE** | `serverless.yml` línea 34: `'...,http://localhost:5173,*'` |
| Origen CloudFront activo DEV | ⚠️ | Falta `https://d1bfu6klutpp8m.cloudfront.net` en `httpApi.cors` y `.env.example` |
| Métodos restringidos | ✅ | `POST`, `OPTIONS` |
| Headers restringidos | ✅ | `Content-Type` |

**Impacto:** Si el deploy no inyecta `CORS_ALLOWED_ORIGINS` explícito (p. ej. deploy local), cualquier origen recibe `Access-Control-Allow-Origin` reflejado. Viola criterio NADF «CORS abierto a `*` en producción» (incluye DEV desplegado).

**Acción requerida:** Eliminar `*` del fallback; alinear orígenes con `propuesta-infra.md` (incluir CloudFront activo).

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
| Sin `requestId: demo-*` | ✅ | No hay simulación de éxito |
| Validación básica pre-submit | ⚠️ | Solo campos requeridos; longitud/formato delegados al servidor |
| `VITE_DEMO_MODE` en código | ✅ | Declarado en `.env.example` pero no usado en lógica (correcto) |

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
| SES con `identity/*` (mejora vs `Resource: '*'`) | Media | **No** — acotado a identities SES de la cuenta/región |
| Sin ARN dominio específico `novusintelligence.com` | Baja | No — recomendable antes de prod |
| Sin permisos `secretsmanager` / `ssm` | Media | No — desalineado con TASK-INFRA-005 futuro |
| CloudWatch scoped a log group Lambda | ✅ | Correcto — no wildcard global |

**Evaluación SEC-001:** Resuelto respecto al anti-patrón `Resource: '*'`. Observación: estrechar a `identity/novusintelligence.com` cuando se confirme única identidad verificada.

---

### 5. Rate limiting — PASS

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ✅ | `burstLimit: 20`, `rateLimit: 10` |
| App-level `RATE_LIMIT_PER_IP` | ✅ | `isIpRateLimited()` invocado antes de procesar body (líneas 75–87) |
| Respuesta 429 | ✅ | `rateLimitResponse()` retorna mensaje genérico |
| Ventana | ⚠️ | 60 s in-memory por contenedor Lambda (aceptable DEV; documentado) |

**SEC-002:** Resuelto respecto a revisión anterior.

---

### 6. Captcha (R-008) — PASS (DEV) / PENDIENTE (pre-prod)

| Verificación | Resultado |
|--------------|-----------|
| `CAPTCHA_ENABLED=false` por defecto | ✅ Alineado a DEV |
| Servicio Turnstile/hCaptcha implementado | ✅ `captchaService.ts` |
| Obligatorio pre-prod documentado | ✅ Plan + riesgos R-008 |

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

**Evaluación SEC-004:** No bloqueante para runtime; recomendable upgrade Serverless o CI aislado.

---

### 8. Logging y privacidad — ADVERTENCIA

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| `clientIp` en logs sin hash | Media | `contact.ts` — spec sugiere hash opcional |
| `email_dry_run` loguea email en DEV | Baja | Aceptable con `EMAIL_DRY_RUN=true` |
| Sin stack traces al cliente | ✅ | `internalErrorResponse` genérico |

---

### 9. Modo demo y mocks (R-001) — PASS

| Verificación | Resultado |
|--------------|-----------|
| `submitContact()` sin éxito simulado | ✅ |
| Error explícito sin API URL | ✅ |
| Backend `requestId` = `randomUUID()` | ✅ Sin prefijo `demo-` |
| `EMAIL_DRY_RUN` en DEV | ✅ No simula éxito al cliente; solo omite SES |

---

### 10. Alineación al plan aprobado

| Gate seguridad | Resultado |
|----------------|-----------|
| `plan_approved` | ✅ PASS |
| `no_secrets_in_repo` | ✅ PASS |
| `no_mock_data_in_production` | ✅ PASS |
| CORS correcto | ❌ **FAIL** (wildcard en default) |
| Rate limit activo | ✅ PASS |
| IAM mínimo privilegio | ✅ PASS (con observación `identity/*`) |
| `NO_DEPLOY` | ✅ Respetado |

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Agente responsable |
|----|----------|-----------|------------|-------------------|
| SEC-CORS-001 | Fallback `CORS_ALLOWED_ORIGINS` incluye `*` en `serverless.yml` | Alta | **Sí** | backend-agent |
| SEC-CORS-002 | Falta origen CloudFront activo en CORS API Gateway | Media | No | backend-agent |
| SEC-001 | IAM SES usa `identity/*` vs dominio específico | Baja | No | backend-agent |
| SEC-003 | Secretos vía `env:` plano vs SSM/Secrets Manager | Media | No | cloud-agent + devops-agent |
| SEC-004 | Vulnerabilidades en devDependencies Serverless | Media | No | devops-agent |
| SEC-005 | `clientIp` en logs sin anonimizar | Media | No | backend-agent |
| SEC-006 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | backend-agent |
| SEC-007 | Validación client-side mínima | Baja | No | frontend-integration-agent |

---

## Recomendaciones priorizadas

### Bloqueantes (antes de gate `security_pass`)

1. **SEC-CORS-001:** Eliminar `*` del fallback en `serverless.yml` línea 34; usar lista explícita alineada a `propuesta-infra.md`.
2. **SEC-CORS-002:** Agregar `https://d1bfu6klutpp8m.cloudfront.net` a `httpApi.cors.allowedOrigins` y `.env.example`.

### Pre-producción

3. **SEC-006:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
4. **SEC-003:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml`.
5. **SEC-001:** Estrechar IAM SES a `identity/novusintelligence.com`.
6. **SEC-005:** Hashear o enmascarar `clientIp` en logs estructurados.

### Seguimiento DevOps

7. **SEC-004:** Evaluar upgrade Serverless v4 o contenedor CI aislado para mitigar CVEs en toolchain.

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 84 |
| checksTotal | 12 |
| checksPassed | 9 |
| checksFailed | 1 |
| checksWarning | 2 |
| criticalFindings | 0 |
| highFindings | 1 |
| mediumFindings | 5 |
| lowFindings | 2 |

---

## Próximo agente sugerido

**backend-agent** — Corregir CORS wildcard default (SEC-CORS-001) y alinear orígenes CloudFront (SEC-CORS-002) antes de re-ejecutar security-agent.

---

## Referencias

- `artifacts/plan-implementacion.md`
- `artifacts/especificacion-backend.md`
- `artifacts/propuesta-infra.md`
- `artifacts/informe-qa.md`
- `artifacts/riesgos.md` (R-001, R-008)
- `.nadf/global/rules/security-rules.md`
- `.nadf/global/knowledge-base/common-errors/SEC-001-iam-ses-wildcard.md`
- `.nadf/global/knowledge-base/common-errors/SEC-002-rate-limit-not-connected.md`
- Repos evaluados: `NovusIntelligenceWEB@main`, `NovusIntelligenceBack@main`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Revisión inicial — FAIL (IAM `*` + rate limit) | security-agent |
| 2026-07-14 | Revisión revalidada en `main` — FAIL (CORS default `*`); SEC-002 resuelto | security-agent |
