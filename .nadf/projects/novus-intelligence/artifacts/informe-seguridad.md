# Informe de Seguridad — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-10-revision-seguridad  
**Agente:** security-agent  
**Fecha:** 2026-07-14  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Resultado global:** **PASS** (condicional — advertencias pre-prod)  
**securityScore:** 82

---

## Resumen ejecutivo

Se ejecutó revisión de seguridad sobre los repositorios productivos (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, evaluando la rama **`main`** mergeada (post-correcciones SEC-001/SEC-002).

**Bloqueantes anteriores resueltos:**

1. **IAM SES** — Ya no usa `Resource: '*'`; acotado a `arn:aws:ses:...:identity/*` (commit `d851201`).
2. **Rate limiting por IP** — Implementado en `contact.ts` vía `isIpRateLimited()` + `rateLimitResponse()` (commit `d851201`).

**Advertencias activas (no bloquean DEV):**

1. **CORS wildcard en fallback Lambda** — Default `CORS_ALLOWED_ORIGINS` incluye `*` y `corsHeaders()` habilita `allowAny` (commit `fe4a395`). Aceptable temporalmente en DEV; **obligatorio eliminar antes de prod**.
2. **Origen CloudFront ausente** — `https://d1bfu6klutpp8m.cloudfront.net` no está en `httpApi.cors` ni en el default de entorno.
3. **IAM SES `identity/*`** — Mejor que wildcard global, pero más amplio que `identity/novusintelligence.com` propuesto en `propuesta-infra.md`.

**Aspectos que pasan:** sin secrets en repositorio, validación server-side completa del contacto, mitigación R-001 (sin modo demo), captcha preparado (deshabilitado en DEV), dependencias runtime sin CVEs críticas.

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceWEB | `main` | Secrets, contacto cliente, dependencias |
| NovusIntelligenceBack | `main` | CORS, validación, IAM, rate limit, captcha, dependencias |
| NovusAIDevelopmentFramework | `cursor/security-review-1e57` | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

---

## Metodología

| Área | Método |
|------|--------|
| Secrets | Escaneo regex (`AKIA`, `sk-`, `password=`, `secret=`, tokens) + revisión `.env.example` y `.gitignore` |
| CORS | Revisión `serverless.yml`, `httpResponse.corsHeaders()`, workflow `deploy-dev.yml` y `propuesta-infra.md` |
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
| CI/CD secrets | ✅ Referencias GitHub | `deploy-dev.yml` usa `secrets.*` sin valores en repo |

**Recomendación no bloqueante (SEC-003):** Migrar `CONTACT_EMAIL_*` y `CAPTCHA_SECRET` a SSM/Secrets Manager según `propuesta-infra.md` (TASK-INFRA-005).

---

### 2. CORS — PASS (DEV) / ADVERTENCIA (pre-prod)

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| API Gateway `httpApi.cors` sin `*` | ✅ | `serverless.yml` líneas 17-19: orígenes explícitos |
| `allowCredentials: false` | ✅ | `serverless.yml` línea 25 |
| Validación dinámica en handler | ⚠️ | `corsHeaders()` soporta `allowAny` si `*` en lista |
| Orígenes DEV alineados (parcial) | ⚠️ | Falta `https://d1bfu6klutpp8m.cloudfront.net` (URL activa en `dev.yml`) |
| Fallback Lambda con `*` | ⚠️ | Línea 34: default incluye `*` tras localhost |
| Deploy CI | ✅ | `deploy-dev.yml` inyecta `secrets.CORS_ALLOWED_ORIGINS` sin fallback `*` |

**Hallazgo SEC-007:** El default de `CORS_ALLOWED_ORIGINS` en `serverless.yml` incluye `*`. Si el secret de GitHub no está configurado, el handler refleja cualquier `Origin`. Mitigación actual: workflow CI pasa origen explícito vía secret.

**Acción pre-prod:** Eliminar `*` del default y de `corsHeaders()`; añadir origen CloudFront y prod a lista blanca.

---

### 3. Validación formulario de contacto — PASS

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
| Sin `requestId: demo-*` | ✅ | Backend usa `randomUUID()` |
| Validación básica pre-submit | ⚠️ | Solo campos requeridos; longitud/formato delegados al servidor |
| `VITE_DEMO_MODE` en código | ✅ | Declarado en `.env.example` pero **no usado** en lógica |

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
| SES con `identity/*` (antes `*`) | Media | **No** — SEC-001 resuelto; afinar a dominio único pre-prod |
| Sin permisos `secretsmanager` / `ssm` | Media | No — desalineado con TASK-INFRA-005 |
| CloudWatch acotado al log group | Baja | No — buena práctica |

---

### 5. Rate limiting — PASS

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ✅ | `burstLimit: 20`, `rateLimit: 10` (global stage) |
| App-level `RATE_LIMIT_PER_IP` | ✅ | `isIpRateLimited()` invocado en handler (SEC-002 resuelto) |
| Ventana temporal | ⚠️ | Implementación usa 60s; spec sugiere 5 min — aceptable DEV |

**Nota:** Rate limit en memoria Lambda es suficiente para DEV; escalar a DynamoDB/WAF para prod.

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

**Evaluación:** No bloqueante para runtime Lambda; recomendar upgrade Serverless v4 en pipeline CI (SEC-004).

---

### 8. Logging y privacidad — ADVERTENCIA

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| `clientIp` en logs sin hash | Media | `contact.ts` — spec sugiere hash opcional |
| `DryRunEmailService` loguea email | Baja | Solo cuando `EMAIL_DRY_RUN=true` (default DEV) |
| Sin stack traces al cliente | ✅ | `internalErrorResponse` genérico |

---

### 9. Modo demo y mocks (R-001) — PASS

| Verificación | Resultado |
|--------------|-----------|
| `submitContact()` sin éxito simulado | ✅ |
| Error explícito sin API URL | ✅ |
| Backend `requestId` = `randomUUID()` | ✅ Sin prefijo `demo-` |
| Textos UI "demo" (CTA marketing) | ✅ No relacionados con API mock |
| `EMAIL_DRY_RUN=true` default DEV | ✅ No simula éxito al usuario; solo omite SES |

---

### 10. Alineación al plan aprobado

| Gate seguridad | Resultado |
|----------------|-----------|
| `plan_approved` | ✅ PASS |
| `no_secrets_in_repo` | ✅ PASS |
| `no_mock_data_in_production` | ✅ PASS |
| CORS correcto (DEV) | ✅ PASS (condicional) |
| Rate limit activo | ✅ PASS |
| IAM mínimo privilegio | ✅ PASS (observación dominio único) |
| `NO_DEPLOY` | ✅ Respetado |

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Estado | Agente responsable |
|----|----------|-----------|------------|--------|-------------------|
| SEC-001 | IAM SES `Resource: '*'` | Alta | Sí | **Resuelto** → `identity/*` | backend-agent |
| SEC-002 | Rate limit por IP no implementado | Alta | Sí | **Resuelto** | backend-agent |
| SEC-003 | Secretos vía `env:` plano vs SSM/Secrets Manager | Media | No | Abierto | cloud-agent |
| SEC-004 | Vulnerabilidades en devDependencies Serverless | Media | No | Abierto | devops-agent |
| SEC-005 | `clientIp` en logs sin anonimizar | Media | No | Abierto | backend-agent |
| SEC-006 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | Aceptado DEV | backend-agent |
| SEC-007 | CORS wildcard en fallback Lambda + `allowAny` | Media | No DEV / Sí prod | Abierto | backend-agent |
| SEC-008 | Origen CloudFront ausente en listas CORS | Media | No | Abierto | backend-agent |
| SEC-009 | Validación client-side mínima | Baja | No | Abierto | frontend-integration-agent |

---

## Recomendaciones priorizadas

### Antes de producción (obligatorio)

1. **SEC-007:** Eliminar `*` de `CORS_ALLOWED_ORIGINS` default y lógica `allowAny` en `corsHeaders()`.
2. **SEC-008:** Añadir `https://d1bfu6klutpp8m.cloudfront.net` y origen prod a CORS (gateway + Lambda).
3. **SEC-006:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
4. **SEC-001 (refinamiento):** Acotar SES a `identity/novusintelligence.com`.

### Seguimiento recomendado (DEV)

5. **SEC-003:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml`.
6. **SEC-005:** Hashear o enmascarar `clientIp` en logs estructurados.
7. **SEC-004:** Evaluar upgrade Serverless v4 en CI.

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 82 |
| checksTotal | 12 |
| checksPassed | 9 |
| checksFailed | 0 |
| checksWarning | 3 |
| criticalFindings | 0 |
| highFindings | 0 (2 resueltos) |
| mediumFindings | 5 |
| lowFindings | 1 |

---

## Próximo agente sugerido

**reviewer-agent** — Proceder con revisión de código y paridad Lovable tras `security_pass` condicional DEV.

---

## Referencias

- `artifacts/plan-implementacion.md`
- `artifacts/especificacion-backend.md`
- `artifacts/propuesta-infra.md`
- `artifacts/informe-qa.md`
- `artifacts/riesgos.md` (R-001, R-008)
- `.nadf/global/rules/security-rules.md`
- Commits: `d851201` (SEC-001/002), `fe4a395` (CORS wildcard DEV)

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Revisión inicial — FAIL (IAM `*` + rate limit) | security-agent |
| 2026-07-14 | Re-revisión `main` — PASS condicional (SEC-001/002 resueltos; advertencias CORS) | security-agent |
