<!-- NADF-GUIDE
Propósito: Documenta Informe de Seguridad — Novus Intelligence Solutions.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
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
**securityScore:** 72

---

## Resumen ejecutivo

Se ejecutó revisión de seguridad sobre los repositorios productivos (**NovusIntelligenceWEB**, **NovusIntelligenceBack**), artefactos NADF y propuesta de infraestructura, en ramas feature no mergeadas a `main`.

**Hallazgos críticos/bloqueantes (2):**

1. **IAM excesivo en SES** — `serverless.yml` concede `ses:SendEmail` / `ses:SendRawEmail` sobre `Resource: '*'`, en desalineación con `propuesta-infra.md` (principio de mínimo privilegio).
2. **Rate limiting por IP no implementado** — La variable `RATE_LIMIT_PER_IP` se carga pero el handler nunca invoca `rateLimitResponse()`; solo existe throttling global de API Gateway (no por IP).

**Aspectos que pasan:** sin secrets en repositorio, CORS sin wildcard, validación server-side del contacto, mitigación R-001 (sin modo demo), captcha preparado (deshabilitado en DEV según plan).

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se crearon secretos.

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceWEB | `cursor/implement-novus-frontend-2d22` | Secrets, contacto cliente, dependencias |
| NovusIntelligenceBack | `cursor/implement-contact-api-04c8` | CORS, validación, IAM, rate limit, captcha, dependencias |
| NovusAIDevelopmentFramework | `cursor/security-review-361e` | Artefactos, `environments/dev.yml`, `propuesta-infra.md` |

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

**Recomendación no bloqueante:** Migrar carga de `CONTACT_EMAIL_*` y `CAPTCHA_SECRET` a referencias SSM/Secrets Manager según `propuesta-infra.md` (TASK-INFRA-005), evitando pasar secretos por variables de entorno planas en deploy.

---

### 2. CORS — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Sin wildcard `*` en orígenes | ✅ | `serverless.yml` líneas 17-19: orígenes explícitos |
| `allowCredentials: false` | ✅ | `serverless.yml` línea 25 |
| Validación dinámica en handler | ✅ | `corsHeaders()` refleja solo orígenes en lista blanca |
| Orígenes DEV alineados | ✅ | `https://dev.novusintelligence.com`, `http://localhost:5173` |
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
| Sin fallback demo (R-001) | ✅ | `contact.ts` retorna error si falta `VITE_NOVUS_API_URL` |
| Sin `requestId: demo-*` | ✅ | No hay simulación de éxito |
| Validación básica pre-submit | ⚠️ | Solo campos requeridos; longitud/formato delegados al servidor |
| `VITE_DEMO_MODE` en código | ✅ | Declarado en `.env.example` pero **no usado** en lógica (correcto) |

**Observación:** La validación client-side es mínima (UX), pero el servidor cumple contrato completo. Aceptable para DEV; opcional reforzar validación client-side para reducir tráfico inválido.

---

### 4. Permisos IAM propuestos — FAIL

#### Implementación actual (`NovusIntelligenceBack/serverless.yml`)

```yaml
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - ses:SendEmail
          - ses:SendRawEmail
        Resource: '*'          # ❌ BLOQUEANTE — alcance excesivo
      - Effect: Allow
        Action:
          - logs:CreateLogGroup
          - logs:CreateLogStream
          - logs:PutLogEvents
        Resource: '*'          # ⚠️ Aceptable para CloudWatch (convención Lambda)
```

#### Propuesta alineada (`propuesta-infra.md`)

```yaml
- Effect: Allow
  Action:
    - ses:SendEmail
    - ses:SendRawEmail
  Resource:
    - arn:aws:ses:sa-east-1:${aws:accountId}:identity/novusintelligence.com
- Effect: Allow
  Action:
    - secretsmanager:GetSecretValue
  Resource:
    - arn:aws:secretsmanager:sa-east-1:${aws:accountId}:secret:/novus-intelligence/dev/*
- Effect: Allow
  Action:
    - ssm:GetParameter
    - ssm:GetParameters
  Resource:
    - arn:aws:ssm:sa-east-1:${aws:accountId}:parameter/novus-intelligence/dev/*
```

| Hallazgo | Severidad | Bloqueante |
|----------|-----------|------------|
| SES con `Resource: '*'` | **Alta** | **Sí** — viola criterio NADF de mínimo privilegio |
| Sin permisos `secretsmanager` / `ssm` | Media | No (pero desalineado con plan TASK-INFRA-005) |
| CloudWatch `Resource: '*'` | Baja | No — patrón estándar Lambda |

**Acción requerida:** `backend-agent` debe acotar SES al ARN de identidad de dominio y añadir permisos SSM/Secrets Manager si se adopta la propuesta IaC.

---

### 5. Rate limiting — FAIL

| Capa | Estado | Detalle |
|------|--------|---------|
| API Gateway throttle | ⚠️ Parcial | `burstLimit: 20`, `rateLimit: 10` — límite **global del stage**, no por IP |
| App-level `RATE_LIMIT_PER_IP` | ❌ No implementado | `rateLimitResponse()` existe pero no se invoca en `contact.ts` |
| Especificación | Requerido | 10 req / 5 min por IP (`especificacion-backend.md`) |

**Impacto:** Endpoint público sin autenticación vulnerable a abuso por IP (spam, costo SES).

**Acción requerida:** Implementar rate limit por IP (ElastiCache/DynamoDB/WAF) o documentar binding WAF en IaC antes de deploy DEV.

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
| `aws-sdk` v2 | Moderate | devDependency |
| `@aws-sdk/client-ses` (runtime) | ✅ Sin vulnerabilidades high/critical | Bundle Lambda |

**Evaluación:** Las vulnerabilidades críticas están en herramientas de **desarrollo/despliegue**, no en el bundle Lambda empaquetado por esbuild. **No bloqueante** para runtime, pero se recomienda actualizar Serverless Framework o aislar pipeline CI en paso DevOps.

---

### 8. Logging y privacidad — ADVERTENCIA

| Hallazgo | Severidad | Detalle |
|----------|-----------|---------|
| `clientIp` en logs sin hash | Media | `contact.ts` línea 151 — spec sugiere hash opcional |
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
| Rate limit activo | ❌ **FAIL** |
| IAM mínimo privilegio | ❌ **FAIL** |
| `NO_DEPLOY` | ✅ Respetado |

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Agente responsable |
|----|----------|-----------|------------|-------------------|
| SEC-001 | IAM SES `Resource: '*'` | Alta | **Sí** | backend-agent |
| SEC-002 | Rate limit por IP no implementado | Alta | **Sí** | backend-agent + cloud-agent |
| SEC-003 | Secretos vía `env:` plano vs SSM/Secrets Manager | Media | No | cloud-agent + devops-agent |
| SEC-004 | Vulnerabilidades en devDependencies Serverless | Media | No | devops-agent |
| SEC-005 | `clientIp` en logs sin anonimizar | Media | No | backend-agent |
| SEC-006 | Captcha deshabilitado (aceptable DEV) | Media | No (pre-prod sí) | backend-agent |
| SEC-007 | Validación client-side mínima | Baja | No | frontend-integration-agent |

---

## Recomendaciones priorizadas

### Bloqueantes (antes de deploy DEV)

1. **SEC-001:** Reemplazar `Resource: '*'` en SES por ARN de identidad `novusintelligence.com` en `sa-east-1`.
2. **SEC-002:** Implementar rate limiting por IP o configurar AWS WAF con regla rate-based documentada en IaC.

### Pre-producción

3. **SEC-006:** Habilitar `CAPTCHA_ENABLED=true` y validar flujo E2E.
4. **SEC-003:** Referenciar secretos desde Secrets Manager/SSM en `serverless.yml`.
5. **SEC-005:** Hashear o enmascarar `clientIp` en logs estructurados.

### Seguimiento DevOps

6. **SEC-004:** Evaluar upgrade Serverless v4 o contenedor CI aislado para mitigar CVEs en toolchain.

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 72 |
| checksTotal | 10 |
| checksPassed | 7 |
| checksFailed | 2 |
| checksWarning | 1 |
| criticalFindings | 0 |
| highFindings | 2 |
| mediumFindings | 4 |
| lowFindings | 1 |

---

## Próximo agente sugerido

**backend-agent** — Corregir IAM SES (SEC-001) e implementar rate limit por IP (SEC-002) antes de re-ejecutar security-agent o proceder con deploy DEV.

---

## Referencias

- `artifacts/plan-implementacion.md`
- `artifacts/especificacion-backend.md`
- `artifacts/propuesta-infra.md`
- `artifacts/informe-qa.md`
- `artifacts/riesgos.md` (R-001, R-008)
- `.nadf/global/rules/security-rules.md`
- Ramas: `NovusIntelligenceWEB@cursor/implement-novus-frontend-2d22`, `NovusIntelligenceBack@cursor/implement-contact-api-04c8`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Revisión seguridad Fase 9 — resultado FAIL (IAM + rate limit) | security-agent |
