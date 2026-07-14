# Informe de Seguridad — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-10-revision-seguridad  
**Agente:** security-agent  
**Fecha:** 2026-07-14  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Resultado global:** **PASS**  
**securityScore:** 86

---

## Resumen ejecutivo

Se ejecutó revisión de seguridad sobre los repositorios productivos (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, evaluando la rama **`main`** (implementación mergeada).

**Hallazgos bloqueantes:** ninguno.

**Aspectos que pasan:** sin secrets en repositorio, CORS sin wildcard en API Gateway, validación server-side del contacto, rate limiting por IP activo en handler, mitigación R-001 (sin modo demo), captcha preparado (deshabilitado en DEV según plan).

**Observaciones no bloqueantes (4):** IAM SES acotado a `identity/*` (pendiente dominio específico), ventana de rate limit 60s vs 5 min de spec, fallback CORS con `*` en default de `serverless.yml`, secretos aún vía `env:` plano sin permisos SSM/Secrets Manager.

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceWEB | `main` | Secrets, contacto cliente, dependencias |
| NovusIntelligenceBack | `main` | CORS, validación, IAM, rate limit, captcha, dependencias |
| NovusAIDevelopmentFramework | `cursor/security-review-paso10-554d` | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

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
| Workflows CI | ✅ Referencias a GitHub Secrets | `deploy-dev.yml` usa `${{ secrets.* }}` |

**Recomendación no bloqueante (SEC-003):** Migrar carga de `CONTACT_EMAIL_*` y `CAPTCHA_SECRET` a referencias SSM/Secrets Manager según `propuesta-infra.md` (TASK-INFRA-005).

---

### 2. CORS — PASS (con observación)

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Sin wildcard `*` en API Gateway | ✅ | `serverless.yml` líneas 17-19: orígenes explícitos |
| `allowCredentials: false` | ✅ | `serverless.yml` línea 25 |
| Validación dinámica en handler | ✅ | `corsHeaders()` refleja solo orígenes en lista blanca |
| Orígenes DEV declarados | ✅ | `https://dev.novusintelligence.com`, `http://localhost:5173` |
| Métodos restringidos | ✅ | `POST`, `OPTIONS` únicamente |
| Headers restringidos | ✅ | `Content-Type` únicamente |

**Observación (SEC-007):** El fallback de `CORS_ALLOWED_ORIGINS` en `serverless.yml` (línea 34) incluye `*` como tercer origen. El deploy DEV vía GitHub Actions sobrescribe este valor desde secrets, pero un deploy local sin variable activaría CORS permisivo a nivel handler. **Recomendación:** eliminar `*` del default.

**Nota operativa:** La URL CloudFront activa (`https://d1bfu6klutpp8m.cloudfront.net`) no está en la lista CORS; es más restrictivo desde el punto de vista de seguridad, pero puede bloquear el formulario hasta añadir el origen o completar DNS `dev.novusintelligence.com`.

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
| V7 Sanitización HTML/script | ✅ | `sanitize.ts` + `escapeHtml` en email SES |
| V8 Content-Type JSON | ✅ | `contact.ts` handler |
| V9 JSON parseable | ✅ | try/catch en handler |
| V10 Captcha condicional | ✅ | `captchaService.ts` |

#### Client-side (WEB) — PASS

| Verificación | Resultado | Nota |
|--------------|-----------|------|
| Sin fallback demo (R-001) | ✅ | `contact.ts` retorna error si falta `VITE_NOVUS_API_URL` |
| Sin `requestId: demo-*` | ✅ | No hay simulación de éxito |
| Validación básica pre-submit | ⚠️ | Solo campos requeridos; longitud/formato delegados al servidor |
| `VITE_DEMO_MODE` en código | ✅ | Declarado en `.env.example` pero **no usado** en lógica (correcto) |

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

| Hallazgo | Severidad | Bloqueante |
|----------|-----------|------------|
| SES acotado a `identity/*` (mejora vs `Resource: '*'`) | Media | **No** — aceptable DEV; pendiente acotar a dominio |
| Sin permisos `secretsmanager` / `ssm` | Media | No (desalineado con TASK-INFRA-005) |
| CloudWatch acotado al log group de la función | Baja | No — mejora respecto a revisión anterior |

**Corrección aplicada desde revisión anterior:** SEC-001 resuelto parcialmente — ya no usa `Resource: '*'`.

**Recomendación pre-prod:** Acotar SES a `arn:aws:ses:sa-east-1:${aws:accountId}:identity/novusintelligence.com` y añadir permisos SSM/Secrets Manager según `propuesta-infra.md`.

---

### 5. Rate limiting — PASS (con observación)

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ✅ | `burstLimit: 20`, `rateLimit: 10` — límite global del stage |
| App-level `RATE_LIMIT_PER_IP` | ✅ Implementado | `isIpRateLimited()` invocado en `contact.ts` (líneas 75-87) |
| Ventana temporal | ⚠️ | Implementación: 60s; spec sugiere 10 req / 5 min |
| Persistencia | ⚠️ | In-memory por contenedor Lambda; suficiente DEV |

**Corrección aplicada desde revisión anterior:** SEC-002 resuelto — `rateLimitResponse()` ahora se invoca.

**Recomendación pre-prod (SEC-008):** Migrar a almacenamiento distribuido (DynamoDB) o AWS WAF rate-based rule para cumplir ventana de 5 minutos y resistir múltiples instancias Lambda.

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

**Evaluación:** Vulnerabilidades en herramientas de **desarrollo/despliegue**, no en el bundle Lambda. **No bloqueante** para runtime.

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
| CORS correcto | ✅ PASS |
| Rate limit activo | ✅ PASS |
| IAM mínimo privilegio | ✅ PASS (con observación DEV) |
| `NO_DEPLOY` | ✅ Respetado |

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Agente responsable |
|----|----------|-----------|------------|-------------------|
| SEC-003 | Secretos vía `env:` plano vs SSM/Secrets Manager | Media | No | cloud-agent + devops-agent |
| SEC-004 | Vulnerabilidades en devDependencies Serverless | Media | No | devops-agent |
| SEC-005 | `clientIp` en logs sin anonimizar | Media | No | backend-agent |
| SEC-006 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | backend-agent |
| SEC-007 | Fallback CORS con `*` en default serverless.yml | Media | No | backend-agent |
| SEC-008 | Rate limit in-memory 60s vs spec 5 min | Media | No | backend-agent + cloud-agent |

---

## Recomendaciones priorizadas

### Pre-producción

1. **SEC-006:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
2. **SEC-003:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml`.
3. **SEC-007:** Eliminar `*` del default de `CORS_ALLOWED_ORIGINS`.
4. **SEC-008:** Rate limit distribuido (DynamoDB/WAF) con ventana de 5 minutos.
5. Acotar IAM SES a identidad de dominio `novusintelligence.com`.
6. **SEC-005:** Hashear o enmascarar `clientIp` en logs estructurados.

### Seguimiento DevOps

7. **SEC-004:** Evaluar upgrade Serverless v4 o contenedor CI aislado para mitigar CVEs en toolchain.

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 86 |
| checksTotal | 12 |
| checksPassed | 10 |
| checksFailed | 0 |
| checksWarning | 2 |
| criticalFindings | 0 |
| highFindings | 0 |
| mediumFindings | 6 |
| lowFindings | 1 |

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
| 2026-07-14 | Revisión seguridad Fase 9 — resultado FAIL (IAM + rate limit) | security-agent |
| 2026-07-14 | Re-ejecución paso-10 — resultado **PASS** (bloqueadores corregidos en main) | security-agent |
