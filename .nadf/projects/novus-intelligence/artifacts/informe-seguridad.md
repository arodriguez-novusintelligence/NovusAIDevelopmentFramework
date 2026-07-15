# Informe de Seguridad — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-12-revision-seguridad-revalidacion-cors  
**Agente:** security-agent (NADF)  
**Fecha:** 2026-07-15  
**Runtime:** Cursor Cloud Agent (NADF)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Resultado global:** **PASS**  
**securityScore:** 92

---

## Resumen ejecutivo

Revalidación de seguridad tras el merge de **SEC-CORS-001** en `NovusIntelligenceBack@main` (commit `c929e2b`, PR #8).

**Conclusión:** El gate bloqueante **SEC-CORS-001** queda **cerrado**. La configuración CORS cumple lista blanca estricta sin wildcard `*`, incluye **CloudFront DEV** (`https://d1bfu6klutpp8m.cloudfront.net`) y la capa Lambda rechaza orígenes no listados.

**Aspectos que pasan:** sin secrets en repositorio, CORS restringido (API Gateway + handler), IAM SES con mínimo privilegio, rate limiting por IP activo, validación server-side del contacto, captcha preparado (deshabilitado en DEV según plan).

**Hallazgos no bloqueantes abiertos:** SEC-003 (SSM/Secrets Manager), SEC-004 (devDependencies Serverless), SEC-005 (anonimización IP en logs), SEC-006 (captcha pre-prod).

**Constraint respetado:** `NO_DEPLOY` — no se desplegó infraestructura ni se modificaron secretos en AWS.

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceBack | `main` (`c929e2b`) | Revalidación SEC-CORS-001 post-merge |
| NovusAIDevelopmentFramework | `cursor/security-cors-revalidation-2c37` | Generación de artefactos NADF |

---

## Metodología

| Área | Método |
|------|--------|
| CORS | Revisión estática de `serverless.yml`, `.env.example`, `httpResponse.corsHeaders()` y `env.ts` en `main` |
| SEC-CORS-001 | Verificación ausencia de `*` en defaults y lógica `allowAny` eliminada |
| CloudFront DEV | Confirmación de `https://d1bfu6klutpp8m.cloudfront.net` en `httpApi.cors.allowedOrigins` y default `CORS_ALLOWED_ORIGINS` |
| Secrets | Escaneo regex (`AKIA`, `sk-`, `password=`, `secret=`) + revisión `.env.example` |
| IAM / Rate limit | Revisión `serverless.yml` y `contact.ts` en `main` |
| Despliegue | Confirmación de no ejecución de `serverless deploy` en esta corrida |

---

## Resultados por área

### 1. SEC-CORS-001 — CORS lista blanca estricta — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Sin wildcard `*` en default `CORS_ALLOWED_ORIGINS` | ✅ | `serverless.yml:35` — default sin `,*` ni `*` |
| Sin rama `allowAny` en handler | ✅ | `httpResponse.ts:95-97` — solo `allowedOrigins.includes(origin)` |
| CloudFront DEV en allowlist API Gateway | ✅ | `serverless.yml:18` — `https://d1bfu6klutpp8m.cloudfront.net` |
| CloudFront DEV en default Lambda env | ✅ | Mismo origen en default de `CORS_ALLOWED_ORIGINS` |
| CloudFront DEV en `.env.example` | ✅ | `.env.example:5` |
| `allowCredentials: false` | ✅ | `serverless.yml:26` |
| Orígenes adicionales DEV | ✅ | `https://dev.novusintelligence.com`, `http://localhost:5173` |
| Métodos restringidos | ✅ | `POST`, `OPTIONS` |
| Headers restringidos | ✅ | `Content-Type` |
| Origen no listado → sin headers CORS | ✅ | `corsHeaders()` retorna `{}` |

**Diff remediación (PR #8):**

- Eliminado `,*` del fallback `CORS_ALLOWED_ORIGINS` (antes: `...,*`).
- Añadido `https://d1bfu6klutpp8m.cloudfront.net` a `httpApi.cors.allowedOrigins` y defaults.
- Simplificado `corsHeaders()`: eliminada lógica `allowAny` que habilitaba CORS abierto cuando `*` estaba en la lista.

**Recomendación operativa (no bloqueante):** Verificar que el secret `CORS_ALLOWED_ORIGINS` en GitHub Actions (environment `dev`) no incluya `*` y refleje la misma allowlist que `serverless.yml`.

---

### 2. Secrets y credenciales — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| API keys / tokens en código | ✅ Sin hallazgos | Escaneo en `NovusIntelligenceBack@main` |
| Archivos `.env` versionados | ✅ No presentes | Solo `.env.example` con valores vacíos |
| Variables en `serverless.yml` | ✅ Por nombre | `${env:CONTACT_EMAIL_FROM, ''}` — sin valores embebidos |
| CI deploy | ✅ Secrets por nombre | `deploy-dev.yml` usa `${{ secrets.CORS_ALLOWED_ORIGINS }}` |

---

### 3. IAM y permisos — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| SES sin `Resource: '*'` | ✅ | `serverless.yml:50-51` — `arn:aws:ses:...:identity/*` |
| Logs Lambda acotados | ✅ | Log group específico del handler |
| Sin permisos excesivos adicionales | ✅ | Solo SES + CloudWatch logs necesarios |

---

### 4. Rate limiting — PASS

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Rate limit por IP en handler | ✅ | `contact.ts:77-86` — `isIpRateLimited()` + `rateLimitResponse()` |
| Throttle API Gateway | ✅ | `serverless.yml:27-29` — burst 20, rate 10 |

---

### 5. Validación contacto y captcha — PASS (DEV)

| Verificación | Resultado | Evidencia |
|--------------|-----------|-----------|
| Validación server-side V1-V10 | ✅ | `contactValidator.ts` |
| Sanitización HTML | ✅ | `sanitize.ts` |
| Captcha implementado | ✅ | `captchaService.ts` |
| Captcha habilitado | ⚠️ DEV off | `CAPTCHA_ENABLED=false` — aceptable DEV, obligatorio pre-prod (SEC-006 / R-008) |

---

### 6. Dependencias — WARNING (no bloqueante)

`npm audit` en `NovusIntelligenceBack`: 8 vulnerabilidades (4 moderate, 1 high, 3 critical) en cadena **devDependency** de Serverless CLI (`decompress`, `tar`, `uuid`). No afectan el bundle runtime de Lambda.

**Finding:** SEC-004 — evaluar upgrade Serverless v4 en CI aislado.

---

## Hallazgos

| ID | Severidad | Bloqueante | Estado | Descripción |
|----|-----------|------------|--------|-------------|
| SEC-CORS-001 | Alta | No (resuelto) | **Cerrado** | Wildcard en CORS — remediado en main `c929e2b` |
| SEC-003 | Media | No | Abierto | Secretos vía env plano vs SSM/Secrets Manager |
| SEC-004 | Media | No | Abierto | Vulnerabilidades devDependencies Serverless |
| SEC-005 | Media | No | Abierto | IP cliente en logs sin anonimizar |
| SEC-006 | Media | No | Abierto | Captcha deshabilitado en DEV (requerido pre-prod) |

---

## Quality gates de seguridad

| Gate | Estado |
|------|--------|
| `sec_cors_001` | ✅ PASS |
| `no_secrets_in_repo` | ✅ PASS |
| `cors_configured` | ✅ PASS |
| `iam_least_privilege` | ✅ PASS |
| `rate_limit_active` | ✅ PASS |
| `deploy_human_approval` | ✅ PASS |

**Bloqueantes activos:** ninguno.

---

## Próximos pasos sugeridos

1. **Reviewer Agent** — continuar workflow con `informe-revision.md` usando este informe PASS.
2. **DevOps / Cloud Agent** — alinear secret `CORS_ALLOWED_ORIGINS` en GitHub con allowlist sin wildcard (si aún no actualizado tras merge).
3. **Pre-prod** — habilitar captcha (SEC-006 / R-008) y evaluar migración a SSM (SEC-003).

---

## Artefactos generados

- `artifacts/informe-seguridad.md` (este documento)
- `artifacts/security-result.json` (`status: PASS`)

---

*Generado por security-agent NADF — revalidación post-merge SEC-CORS-001. Sin despliegue.*
