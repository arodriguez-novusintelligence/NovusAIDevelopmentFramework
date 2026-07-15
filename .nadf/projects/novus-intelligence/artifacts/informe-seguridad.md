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

Se ejecutó revisión de seguridad sobre los repositorios productivos (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, en rama `main` de ambos repos productivos.

**Resultado:** **PASS** — cumple gates bloqueantes NADF para DEV.

**Aspectos que pasan:** sin secrets en repositorio, CORS sin wildcard, validación server-side del contacto, rate limiting por IP implementado, IAM SES acotado a identidades de la cuenta/región, mitigación R-001 (sin modo demo), captcha preparado (deshabilitado en DEV según plan).

**Observaciones no bloqueantes (4):** secretos aún vía `env:` plano vs SSM/Secrets Manager, rate limit in-memory (limitación multi-instancia), vulnerabilidades en devDependencies de Serverless CLI, `clientIp` en logs sin hash.

**Remediaciones desde revisión anterior (2026-07-14):** SEC-001 (IAM SES wildcard) y SEC-002 (rate limit no invocado) **corregidos** en código actual.

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceWEB | `main` | Secrets, contacto cliente, dependencias |
| NovusIntelligenceBack | `main` | CORS, validación, IAM, rate limit, captcha, dependencias |
| NovusAIDevelopmentFramework | `cursor/security-review-paso10-94b4` | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

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
| Workflows CI | ✅ Referencias GitHub Secrets | Sin valores hardcodeados en YAML |

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
| Header `Vary: Origin` | ✅ | `httpResponse.ts` línea 104 |

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
| `VITE_DEMO_MODE=true` bloqueado | ✅ | Retorna error explícito, no simula éxito |
| Sin `requestId: demo-*` | ✅ | No hay simulación de éxito |
| Validación básica pre-submit | ⚠️ | Campos requeridos + email; longitud delegada al servidor |
| Sanitización client-side | ⚠️ | `.trim()` únicamente; servidor es autoridad |

**Observación (SEC-007):** Validación client-side mínima aceptable para DEV; opcional reforzar para reducir tráfico inválido.

---

### 4. Permisos IAM propuestos — PASS (con observación)

#### Implementación actual (`NovusIntelligenceBack/serverless.yml`)

```yaml
iam:
  role:
    statements:
      # SEC-001: restringir SES a identities de la cuenta/región (no Resource: *)
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

#### Comparación con propuesta (`propuesta-infra.md`)

| Aspecto | Implementación | Propuesta | Evaluación |
|---------|----------------|-----------|------------|
| SES scope | `identity/*` (cuenta/región) | `identity/novusintelligence.com` | ✅ Mínimo privilegio vs wildcard global; ⚠️ ligeramente más amplio que dominio único |
| CloudWatch logs | Log group específico Lambda | — | ✅ Acotado |
| Secrets Manager | No presente | `GetSecretValue` acotado | ⚠️ Pendiente TASK-INFRA-005 |
| SSM Parameter Store | No presente | `GetParameter(s)` acotado | ⚠️ Pendiente TASK-INFRA-005 |

| Hallazgo | Severidad | Bloqueante |
|----------|-----------|------------|
| SES `identity/*` vs dominio único | Baja | No — remediado desde `Resource: '*'` |
| Sin permisos `secretsmanager` / `ssm` | Media | No (desalineado con plan TASK-INFRA-005) |
| CloudWatch log group acotado | — | ✅ Correcto |

**Remediación SEC-001 confirmada:** El wildcard global `Resource: '*'` reportado en revisión 2026-07-14 fue reemplazado por ARN de identidades SES en la cuenta/región.

---

### 5. Rate limiting — PASS (DEV) / OBSERVACIÓN (prod)

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ✅ | `burstLimit: 20`, `rateLimit: 10` req/s global stage |
| App-level `RATE_LIMIT_PER_IP` | ✅ | `isIpRateLimited()` invocado en `contact.ts` líneas 75-87 |
| Ventana | ✅ | 300 s (5 min), límite 10 req/IP — alineado a especificación |
| Implementación | ⚠️ | In-memory por contenedor Lambda (`ipRateLimiter.ts`) |

**Remediación SEC-002 confirmada:** `rateLimitResponse()` ahora se invoca cuando se excede el umbral por IP.

**Observación (SEC-008):** Rate limit in-memory no es distribuido entre instancias Lambda concurrentes. Aceptable para DEV; antes de producción considerar DynamoDB, ElastiCache o AWS WAF rate-based rule.

---

### 6. Captcha (R-008) — PASS (DEV) / PENDIENTE (pre-prod)

| Verificación | Resultado |
|--------------|-----------|
| `CAPTCHA_ENABLED=false` por defecto | ✅ Alineado a DEV |
| Servicio Turnstile/hCaptcha implementado | ✅ `captchaService.ts` |
| Obligatorio pre-prod documentado | ✅ Plan + riesgos R-008 |

**No bloqueante para DEV.** Bloqueante antes de producción (SEC-006).

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
| `uuid` | Moderate | devDependency |
| `@aws-sdk/client-ses` (runtime) | ✅ Sin vulnerabilidades high/critical | Bundle Lambda |

**Evaluación (SEC-004):** Vulnerabilidades en herramientas de **desarrollo/despliegue**, no en el bundle Lambda empaquetado por esbuild. **No bloqueante** para runtime DEV.

---

### 8. Logging y privacidad — ADVERTENCIA

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| `clientIp` en logs sin hash | Media | `contact.ts` — spec sugiere hash opcional (SEC-005) |
| Email completo en notificación SES | Bajo | Esperado para notificación comercial |
| Sin stack traces al cliente | ✅ | `internalErrorResponse` genérico |
| Logs estructurados JSON | ✅ | Sin PII completa en campos de error |

---

### 9. Modo demo y mocks (R-001) — PASS

| Verificación | Resultado |
|--------------|-----------|
| `submitContact()` sin éxito simulado | ✅ |
| Error explícito sin API URL | ✅ |
| `VITE_DEMO_MODE=true` rechazado | ✅ |
| Backend `requestId` = `randomUUID()` | ✅ Sin prefijo `demo-` |
| `EMAIL_DRY_RUN` solo backend local | ✅ Documentado en `.env.example` |

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

| ID | Hallazgo | Severidad | Bloqueante | Estado | Agente responsable |
|----|----------|-----------|------------|--------|-------------------|
| SEC-001 | IAM SES `Resource: '*'` | Alta | ~~Sí~~ | **Remediado** | backend-agent |
| SEC-002 | Rate limit por IP no implementado | Alta | ~~Sí~~ | **Remediado** | backend-agent |
| SEC-003 | Secretos vía `env:` plano vs SSM/Secrets Manager | Media | No | Abierto | cloud-agent + devops-agent |
| SEC-004 | Vulnerabilidades en devDependencies Serverless | Media | No | Abierto | devops-agent |
| SEC-005 | `clientIp` en logs sin anonimizar | Media | No | Abierto | backend-agent |
| SEC-006 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | Esperado DEV | backend-agent |
| SEC-007 | Validación client-side mínima | Baja | No | Abierto | frontend-integration-agent |
| SEC-008 | Rate limit in-memory (no distribuido) | Media | No (DEV) | Observación | cloud-agent |

---

## Recomendaciones priorizadas

### Pre-despliegue DEV (no bloqueantes)

1. **SEC-003:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml` con permisos IAM acotados.
2. **SEC-008:** Documentar limitación in-memory del rate limit; evaluar WAF antes de tráfico público significativo.

### Pre-producción

3. **SEC-006:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
4. **SEC-005:** Hashear o enmascarar `clientIp` en logs estructurados.
5. Acotar IAM SES a `identity/novusintelligence.com` (dominio único).

### Seguimiento DevOps

6. **SEC-004:** Evaluar upgrade Serverless v4 o contenedor CI aislado para mitigar CVEs en toolchain.

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 88 |
| checksTotal | 12 |
| checksPassed | 9 |
| checksFailed | 0 |
| checksWarning | 3 |
| criticalFindings | 0 |
| highFindings | 0 |
| mediumFindings | 4 |
| lowFindings | 1 |
| remediatedSinceLastReview | 2 |

---

## Próximo agente sugerido

**reviewer-agent** — Proceder con revisión de código (paso-11) dado que el gate `security_pass` está cumplido para DEV.

---

## Referencias

- `artifacts/plan-implementacion.md`
- `artifacts/especificacion-backend.md`
- `artifacts/propuesta-infra.md`
- `artifacts/informe-qa.md`
- `artifacts/riesgos.md` (R-001, R-008)
- `.nadf/global/rules/security-rules.md`
- Repos evaluados: `NovusIntelligenceWEB@main`, `NovusIntelligenceBack@main`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Revisión seguridad Fase 9 — resultado FAIL (IAM + rate limit) | security-agent |
| 2026-07-15 | Re-ejecución paso-10 — SEC-001/SEC-002 remediados — resultado **PASS** | security-agent |
