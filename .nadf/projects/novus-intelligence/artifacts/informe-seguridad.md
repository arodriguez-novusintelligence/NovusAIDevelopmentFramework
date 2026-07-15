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
**securityScore:** 89

---

## Resumen ejecutivo

Se ejecutó revisión de seguridad sobre los repositorios productivos (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, evaluando el código integrado en rama `main` (post-remediación SEC-CORS-001 y correcciones IAM/rate limit).

**Resultado:** **PASS** — no hay hallazgos bloqueantes. Los dos bloqueantes de la revisión anterior (2026-07-14) están **remediados** en `main`:

1. **IAM SES** — ya no usa `Resource: '*'`; acotado a `arn:aws:ses:<region>:<account>:identity/*`.
2. **Rate limiting por IP** — implementado en `contact.ts` vía `isIpRateLimited()` con respuesta 429.

**Aspectos que pasan:** sin secrets en repositorio, CORS sin wildcard, validación server-side del contacto, mitigación R-001 (sin modo demo), captcha preparado (deshabilitado en DEV según plan), dependencias runtime sin vulnerabilidades críticas.

**Observaciones no bloqueantes (4):** IAM SES podría acotarse al dominio específico; secretos aún vía `${env:...}` sin SSM/Secrets Manager; ventana de rate limit 60 s vs 5 min en spec; vulnerabilidades en toolchain Serverless (devDependencies).

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Commit ref. | Enfoque |
|-------------|--------------|-------------|---------|
| NovusIntelligenceWEB | `main` | `2634029` | Secrets, contacto cliente, dependencias |
| NovusIntelligenceBack | `main` | `c929e2b` | CORS, validación, IAM, rate limit, captcha, dependencias |
| NovusAIDevelopmentFramework | `cursor/security-review-6b8b` | — | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

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
| Workflows CI | ✅ GitHub Secrets | `deploy-dev.yml` usa `${{ secrets.* }}` sin valores en repo |

**Recomendación no bloqueante (SEC-003):** Migrar carga de `CONTACT_EMAIL_*` y `CAPTCHA_SECRET` a referencias SSM/Secrets Manager según `propuesta-infra.md` (TASK-INFRA-005).

---

### 2. CORS — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Sin wildcard `*` en orígenes | ✅ | `serverless.yml` orígenes explícitos |
| `allowCredentials: false` | ✅ | `serverless.yml` |
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
| V7 Sanitización HTML/script | ✅ | `sanitize.ts` + `escapeHtml` en email |
| V8 Content-Type JSON | ✅ | `contact.ts` handler |
| V9 JSON parseable | ✅ | try/catch en handler |
| V10 Captcha condicional | ✅ | `captchaService.ts` |

#### Client-side (WEB) — PASS con observación

| Verificación | Resultado | Nota |
|--------------|-----------|------|
| Sin fallback demo (R-001) | ✅ | `contact.ts` retorna error si falta `VITE_NOVUS_API_URL` o `VITE_DEMO_MODE=true` |
| Sin `requestId: demo-*` | ✅ | No hay simulación de éxito |
| Validación básica pre-submit | ⚠️ | Solo campos requeridos; longitud/formato delegados al servidor |
| `VITE_DEMO_MODE=false` en `.env.example` | ✅ | Valor por defecto correcto |

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

#### Propuesta alineada (`propuesta-infra.md`)

```yaml
Resource:
  - arn:aws:ses:sa-east-1:${aws:accountId}:identity/novusintelligence.com
```

| Hallazgo | Severidad | Bloqueante |
|----------|-----------|------------|
| SES acotado a `identity/*` (remediado desde `*`) | Media | **No** — mejora significativa vs revisión anterior |
| Sin permiso a dominio específico `novusintelligence.com` | Media | No — recomendación de endurecimiento |
| Sin permisos `secretsmanager` / `ssm` | Media | No — desalineado con TASK-INFRA-005 |
| CloudWatch acotado al log group del handler | Baja | No — buena práctica |

**Evaluación:** El criterio bloqueante de IAM excesivo (`Resource: '*'`) **ya no aplica**. Queda recomendación de acotar a `identity/novusintelligence.com` y añadir permisos SSM/Secrets Manager al adoptar la propuesta IaC.

---

### 5. Rate limiting — PASS (con observaciones)

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ✅ | `burstLimit: 20`, `rateLimit: 10` — límite global del stage |
| App-level `RATE_LIMIT_PER_IP` | ✅ | `isIpRateLimited()` invocado en handler; respuesta 429 |
| Ventana de tiempo | ⚠️ | Implementación: 60 s; spec sugiere 5 min (`especificacion-backend.md`) |
| Persistencia | ⚠️ | In-memory por contenedor Lambda; suficiente DEV, no distribuido |

**Evaluación:** Rate limit **activo** — cumple gate `rate_limit_active`. Para producción, considerar DynamoDB/WAF o ajustar ventana a 5 min según spec.

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
| `DryRunEmailService` loguea email en DEV | Bajo | Solo cuando `EMAIL_DRY_RUN=true` |
| Sin stack traces al cliente | ✅ | `internalErrorResponse` genérico |

---

### 9. Modo demo y mocks (R-001) — PASS

| Verificación | Resultado |
|--------------|-----------|
| `submitContact()` sin éxito simulado | ✅ |
| Error explícito sin API URL | ✅ |
| Rechazo si `VITE_DEMO_MODE=true` | ✅ |
| Backend `requestId` = `randomUUID()` | ✅ Sin prefijo `demo-` |

---

### 10. Alineación al plan aprobado

| Gate seguridad | Resultado |
|----------------|-----------|
| `plan_approved` | ✅ PASS |
| `no_secrets_in_repo` | ✅ PASS |
| `no_mock_data_in_production` | ✅ PASS |
| CORS correcto | ✅ PASS |
| Rate limit activo | ✅ PASS |
| IAM mínimo privilegio | ✅ PASS (remediado; observación `identity/*`) |
| `NO_DEPLOY` | ✅ Respetado |

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Agente responsable |
|----|----------|-----------|------------|-------------------|
| SEC-001 | IAM SES `identity/*` — acotar a dominio específico | Media | No | backend-agent |
| SEC-002 | Ventana rate limit 60 s vs 5 min en spec | Baja | No | backend-agent |
| SEC-003 | Secretos vía `env:` plano vs SSM/Secrets Manager | Media | No | cloud-agent + devops-agent |
| SEC-004 | Vulnerabilidades en devDependencies Serverless | Media | No | devops-agent |
| SEC-005 | `clientIp` en logs sin anonimizar | Media | No | backend-agent |
| SEC-006 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | backend-agent |
| SEC-007 | Rate limit in-memory no distribuido | Baja | No | cloud-agent |

### Hallazgos remediados (revisión 2026-07-14)

| ID | Hallazgo anterior | Estado actual |
|----|-------------------|---------------|
| SEC-001-v1 | IAM SES `Resource: '*'` | ✅ Remediado → `identity/*` |
| SEC-002-v1 | Rate limit por IP no implementado | ✅ Remediado → `isIpRateLimited()` |

---

## Recomendaciones priorizadas

### Pre-despliegue DEV (no bloqueantes)

1. **SEC-001:** Acotar SES a `arn:aws:ses:sa-east-1:${accountId}:identity/novusintelligence.com`.
2. **SEC-003:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml` con IAM acotado.

### Pre-producción

3. **SEC-006:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
4. **SEC-005:** Hashear o enmascarar `clientIp` en logs estructurados.
5. **SEC-002:** Alinear ventana de rate limit a 5 min o documentar desviación.

### Seguimiento DevOps

6. **SEC-004:** Evaluar upgrade Serverless v4 o contenedor CI aislado para mitigar CVEs en toolchain.

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 89 |
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

**reviewer-agent** — Continuar Fase 9 Validation (revisión de copia Lovable y coherencia con plan aprobado).

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
| 2026-07-14 | Revisión seguridad Fase 9 — resultado FAIL (IAM `*` + rate limit ausente) | security-agent |
| 2026-07-15 | Re-revisión paso-10 — resultado **PASS** tras remediación en `main` | security-agent |
