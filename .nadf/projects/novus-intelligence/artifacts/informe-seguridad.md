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
**securityScore:** 78

---

## Resumen ejecutivo

Se ejecutó revisión de seguridad sobre los repositorios productivos (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, evaluando el código en rama `main` de ambos repos productivos.

**Hallazgo bloqueante (1):**

1. **CORS con wildcard en valor por defecto** — `serverless.yml` incluye `*` en el default de `CORS_ALLOWED_ORIGINS`; `corsHeaders()` refleja cualquier origen cuando la lista contiene `*`, violando el criterio NADF de no usar wildcard.

**Mejoras respecto a revisión anterior:**

- IAM SES acotado de `Resource: '*'` a `identity/*` (parcial; aún no al nivel de dominio específico).
- Rate limiting por IP conectado en el handler (`isIpRateLimited()` + `rateLimitResponse()`).

**Aspectos que pasan:** sin secrets en repositorio, validación server-side del contacto, mitigación R-001 (sin modo demo), captcha preparado (deshabilitado en DEV), dependencias runtime sin vulnerabilidades críticas.

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceWEB | `main` | Secrets, contacto cliente, dependencias |
| NovusIntelligenceBack | `main` | CORS, validación, IAM, rate limit, captcha, dependencias |
| NovusAIDevelopmentFramework | `cursor/security-review-4842` | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

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
| API keys / tokens en código | ✅ Sin hallazgos | Escaneo en WEB, Back y artifacts |
| Archivos `.env` versionados | ✅ No presentes | Solo `.env.example` con valores vacíos |
| `.gitignore` protege `.env` | ✅ Configurado | Back: `.env`, `.env.*`; WEB: `.env`, `.env.local` |
| Artefactos NADF | ✅ Solo nombres | `propuesta-infra.md`, `dev.yml` sin valores sensibles |
| Variables en `serverless.yml` | ✅ Por nombre | `${env:CONTACT_EMAIL_FROM, ''}` — sin valores embebidos |
| Workflows CI | ✅ Referencias por nombre | `secrets.AWS_ACCESS_KEY_ID` en GitHub Actions, no en código |

**Recomendación no bloqueante:** Migrar carga de `CONTACT_EMAIL_*` y `CAPTCHA_SECRET` a referencias SSM/Secrets Manager según `propuesta-infra.md` (TASK-INFRA-005).

---

### 2. CORS — FAIL

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Sin wildcard `*` en orígenes (httpApi) | ✅ | `serverless.yml` líneas 17-19: orígenes explícitos en API Gateway |
| **Default `CORS_ALLOWED_ORIGINS` con `*`** | ❌ **Bloqueante** | `serverless.yml` línea 34: default incluye `*` al final |
| `corsHeaders()` con lógica wildcard | ❌ | `httpResponse.ts` líneas 96-102: si lista contiene `*`, refleja cualquier `Origin` |
| `allowCredentials: false` | ✅ | `serverless.yml` línea 25 |
| Origen CloudFront DEV | ⚠️ Ausente | `https://d1bfu6klutpp8m.cloudfront.net` no está en httpApi ni en default env |
| Métodos restringidos | ✅ | `POST`, `OPTIONS` únicamente |

**Impacto:** Si se despliega sin sobrescribir `CORS_ALLOWED_ORIGINS`, cualquier origen recibirá `Access-Control-Allow-Origin` reflejado, abriendo el endpoint a sitios maliciosos (CSRF cross-origin desde navegador).

**Acción requerida:** Eliminar `*` del default; alinear orígenes con `propuesta-infra.md` (incluir CloudFront DEV).

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
| Sin `requestId: demo-*` | ✅ | No hay simulación de éxito |
| Validación básica pre-submit | ⚠️ | Solo campos requeridos; longitud/formato delegados al servidor |
| `VITE_DEMO_MODE` en código | ✅ | Declarado en `.env.example` pero no usado en lógica (correcto) |

---

### 4. Permisos IAM propuestos — WARNING (mejorado, no bloqueante)

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
- Effect: Allow
  Action:
    - ses:SendEmail
    - ses:SendRawEmail
  Resource:
    - arn:aws:ses:sa-east-1:${aws:accountId}:identity/novusintelligence.com
```

| Hallazgo | Severidad | Bloqueante |
|----------|-----------|------------|
| SES con `identity/*` (antes `Resource: '*'`) | Media | No — mejora parcial; aún más amplio que dominio específico |
| Sin permisos `secretsmanager` / `ssm` | Media | No — desalineado con plan TASK-INFRA-005 |
| CloudWatch acotado a log group | Baja | No — cumple mínimo privilegio |

**Acción recomendada:** Acotar SES a `identity/novusintelligence.com` y añadir permisos SSM/Secrets Manager si se adopta la propuesta IaC.

---

### 5. Rate limiting — WARNING (implementado con limitaciones)

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ⚠️ Parcial | `burstLimit: 20`, `rateLimit: 10` — límite global del stage |
| App-level `isIpRateLimited()` | ✅ Conectado | Invocado en `contact.ts` líneas 75-87 |
| Ventana de tiempo | ⚠️ Desalineada | Implementación: 60 s; especificación: 10 req / **5 min** |
| Persistencia | ⚠️ In-memory | `Map` por contenedor Lambda; no distribuido entre instancias |

**Evaluación:** El rate limit por IP está **implementado y conectado** (SEC-002 resuelto a nivel código). Para DEV es aceptable con advertencias; pre-prod requiere DynamoDB/WAF según `propuesta-infra.md`.

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

**Evaluación:** No bloqueante para runtime Lambda; recomendable actualizar Serverless Framework en pipeline CI.

---

### 8. Logging y privacidad — ADVERTENCIA

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| `clientIp` en logs sin hash | Media | `contact.ts` línea 167 — spec sugiere hash opcional |
| Email completo en notificación SES | Bajo | Esperado para notificación comercial |
| Sin stack traces al cliente | ✅ | `internalErrorResponse` genérico |

---

### 9. Modo demo y mocks (R-001) — PASS

| Verificación | Resultado |
|--------------|-----------|
| `submitContact()` sin éxito simulado | ✅ |
| Error explícito sin API URL | ✅ |
| Backend `requestId` = `randomUUID()` | ✅ Sin prefijo `demo-` |
| Textos UI "demo" (CTA marketing) | ✅ No relacionados con API mock |

---

### 10. Alineación al plan aprobado

| Gate seguridad | Resultado |
|----------------|-----------|
| `plan_approved` | ✅ PASS |
| `no_secrets_in_repo` | ✅ PASS |
| `no_mock_data_in_production` | ✅ PASS |
| CORS correcto | ❌ **FAIL** (wildcard en default) |
| Rate limit activo | ⚠️ WARNING (implementado, ventana/persistencia desalineadas) |
| IAM mínimo privilegio | ⚠️ WARNING (mejorado; pendiente dominio específico) |
| `NO_DEPLOY` | ✅ Respetado |

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Agente responsable |
|----|----------|-----------|------------|-------------------|
| SEC-003 | CORS default con wildcard `*` | Alta | **Sí** | backend-agent |
| SEC-001 | IAM SES `identity/*` (mejorado desde `*`) | Media | No | backend-agent |
| SEC-002 | Rate limit in-memory / ventana 60s vs 5 min | Media | No | backend-agent + cloud-agent |
| SEC-004 | Origen CloudFront ausente en CORS | Media | No | backend-agent |
| SEC-005 | Secretos vía `env:` plano vs SSM/Secrets Manager | Media | No | cloud-agent + devops-agent |
| SEC-006 | Vulnerabilidades en devDependencies Serverless | Media | No | devops-agent |
| SEC-007 | `clientIp` en logs sin anonimizar | Media | No | backend-agent |
| SEC-008 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | backend-agent |
| SEC-009 | Validación client-side mínima | Baja | No | frontend-integration-agent |

---

## Recomendaciones priorizadas

### Bloqueantes (antes de deploy DEV)

1. **SEC-003:** Eliminar `*` del default de `CORS_ALLOWED_ORIGINS` en `serverless.yml`; usar lista explícita alineada a `propuesta-infra.md`.

### Pre-deploy DEV (no bloqueantes pero recomendadas)

2. **SEC-001:** Acotar SES a `arn:aws:ses:sa-east-1:${AccountId}:identity/novusintelligence.com`.
3. **SEC-004:** Incluir `https://d1bfu6klutpp8m.cloudfront.net` en orígenes CORS.
4. **SEC-002:** Ajustar ventana a 5 minutos o documentar WAF rate-based en IaC.

### Pre-producción

5. **SEC-008:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
6. **SEC-005:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml`.
7. **SEC-007:** Hashear o enmascarar `clientIp` en logs estructurados.

### Seguimiento DevOps

8. **SEC-006:** Evaluar upgrade Serverless v4 o contenedor CI aislado para mitigar CVEs en toolchain.

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 78 |
| checksTotal | 12 |
| checksPassed | 8 |
| checksFailed | 1 |
| checksWarning | 3 |
| criticalFindings | 0 |
| highFindings | 1 |
| mediumFindings | 6 |
| lowFindings | 1 |

---

## Próximo agente sugerido

**backend-agent** — Corregir CORS wildcard default (SEC-003) y acotar IAM SES a dominio específico (SEC-001) antes de re-ejecutar security-agent o proceder con deploy DEV.

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
| 2026-07-14 | Revisión seguridad Fase 9 — resultado FAIL (IAM + rate limit) | security-agent |
| 2026-07-14 | Re-ejecución paso-10 — FAIL por CORS wildcard default; IAM y rate limit parcialmente corregidos | security-agent |
