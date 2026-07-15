# Informe de Seguridad — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-10-revision-seguridad (revalidación post-remediación CORS)  
**Agente:** security-agent  
**Fecha:** 2026-07-15  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Resultado global:** **FAIL** (gate bloqueante: SEC-CORS-001 en `main`)  
**securityScore:** 78

---

## Resumen ejecutivo

Revalidación focalizada en **SEC-CORS-001** sobre `NovusIntelligenceBack` en `main` y en la rama de remediación más reciente.

| Rama evaluada | Commit | SEC-CORS-001 |
|---------------|--------|--------------|
| `main` | `bf3bd2b` | **FAIL** — wildcard `*` en default de `CORS_ALLOWED_ORIGINS` |
| `cursor/remediate-sec-cors-001-19c5` | `f705e36` | **PASS** — remediación verificada, sin wildcard |

**Conclusión:** La remediación existe en PR head pero **no está mergeada a `main`**. El gate `security_pass` permanece **bloqueado** hasta merge del fix. **NO se desplegó** infraestructura en esta ejecución.

**Otros controles (registrados, no bloqueantes en esta revalidación):**

- Secrets: PASS  
- Rate limit por IP: PASS (implementado en `main`)  
- IAM SES: PASS (acotado a `identity/*`, no `Resource: '*'`)  
- Secrets Manager / SSM: pendiente alineación IaC (SEC-003, no bloqueante)

---

## Alcance analizado

| Repositorio | Rama evaluada | Enfoque |
|-------------|--------------|---------|
| NovusIntelligenceBack | `main` (`bf3bd2b`) | SEC-CORS-001 — gate bloqueante |
| NovusIntelligenceBack | `cursor/remediate-sec-cors-001-19c5` (`f705e36`) | Verificación remediación CORS |
| NovusAIDevelopmentFramework | `cursor/security-cors-revalidation-a366` | Artefactos NADF |

---

## Metodología

| Área | Método |
|------|--------|
| SEC-CORS-001 | Inspección `serverless.yml` (default `CORS_ALLOWED_ORIGINS`, `httpApi.cors.allowedOrigins`), `httpResponse.corsHeaders()`, `.env.example` |
| Secrets | Escaneo regex + revisión `.env.example` / `.gitignore` |
| Rate limit | Revisión `contact.ts` + `ipRateLimiter.ts` |
| IAM | Revisión `serverless.yml` statements SES / CloudWatch |
| Dependencias | `npm audit --audit-level=high` en Back |

---

## SEC-CORS-001 — CORS sin wildcard en defaults (GATE BLOQUEANTE)

### Criterio NADF

- Prohibido wildcard `*` en defaults de `CORS_ALLOWED_ORIGINS` (`.nadf/global/rules/security-rules.md`, criterio security-agent: CORS abierto a `*`).
- Lista blanca explícita; `allowCredentials: false`.

### Evidencia en `main` — FAIL

**`serverless.yml` línea 34:**

```yaml
CORS_ALLOWED_ORIGINS: ${env:CORS_ALLOWED_ORIGINS, 'https://dev.novusintelligence.com,http://localhost:5173,*'}
```

Introducido en commit `fe4a395` (`fix(dev): EMAIL_DRY_RUN + CORS wildcard until SES and custom domain are ready`).

**`httpResponse.ts` líneas 95-106:** lógica `allowAny = allowedOrigins.includes('*')` que refleja cualquier origen cuando la env contiene `*`.

**Impacto:** Si el deploy no define `CORS_ALLOWED_ORIGINS` (secret vacío o ausente), el default incluye `*` y el handler acepta cualquier `Origin` — violación de lista blanca estricta.

**Nota:** `httpApi.cors.allowedOrigins` (API Gateway) en `main` sí lista orígenes explícitos (sin `*`), pero la capa Lambda **sí** puede emitir `Access-Control-Allow-Origin` para orígenes arbitrarios vía env default.

### Evidencia en PR head — PASS

Rama `cursor/remediate-sec-cors-001-19c5` (`f705e36`):

| Verificación | Resultado |
|--------------|-----------|
| Sin `*` en default `CORS_ALLOWED_ORIGINS` | ✅ |
| Orígenes explícitos incl. CloudFront DEV | ✅ `https://d1bfu6klutpp8m.cloudfront.net`, `https://dev.novusintelligence.com`, `http://localhost:5173` |
| `httpApi.cors.allowedOrigins` alineado | ✅ |
| `corsHeaders()` sin rama `allowAny` | ✅ Rechaza orígenes no listados |
| `.env.example` sin wildcard | ✅ |

**Acción requerida:** Merge de PR `cursor/remediate-sec-cors-001-19c5` → `main` y re-ejecutar security-agent para confirmar PASS en rama desplegada.

---

## Resultados por área (registro, no gate en esta corrida)

### 1. Secrets y credenciales — PASS

| Verificación | Resultado |
|--------------|-----------|
| API keys / tokens en código | ✅ Sin hallazgos |
| `.env` versionados | ✅ No presentes |
| `.env.example` | ✅ Sin valores reales |
| `deploy-dev.yml` | ✅ Referencias por secret name |

### 2. Rate limiting — PASS (`main`)

| Capa | Estado |
|------|--------|
| API Gateway throttle | ✅ `burstLimit: 20`, `rateLimit: 10` |
| App-level `RATE_LIMIT_PER_IP` | ✅ `isIpRateLimited()` invocado en `contact.ts` (SEC-002 remediado) |

### 3. Permisos IAM — PASS (`main`)

| Recurso | Estado |
|---------|--------|
| SES | ✅ `arn:aws:ses:...:identity/*` (no `Resource: '*'`) |
| CloudWatch | ✅ Log group acotado al handler |
| secretsmanager / ssm | ⚠️ No presentes (SEC-003, no bloqueante DEV) |

### 4. Captcha — PASS (DEV)

`CAPTCHA_ENABLED=false` por defecto; servicio implementado. Obligatorio pre-prod (R-008).

### 5. Dependencias — ADVERTENCIA

`npm audit --audit-level=high`: 1 high, 3 critical en cadena `serverless` devDependency. No afecta bundle Lambda runtime (SEC-004, no bloqueante).

### 6. NO_DEPLOY — PASS

Constraint respetado: sin despliegue ni rotación de credenciales en esta ejecución.

---

## Matriz de hallazgos

| ID | Hallazgo | Severidad | Bloqueante | Estado |
|----|----------|-----------|------------|--------|
| SEC-CORS-001 | Wildcard `*` en default `CORS_ALLOWED_ORIGINS` en `main` | Alta | **Sí** | Abierto en `main`; remediado en PR head |
| SEC-001 | IAM SES (histórico) | Alta | No (remediado) | PASS en `main` |
| SEC-002 | Rate limit por IP (histórico) | Alta | No (remediado) | PASS en `main` |
| SEC-003 | Secretos vía env vs SSM/Secrets Manager | Media | No | Pendiente |
| SEC-004 | CVEs devDependencies Serverless | Media | No | Pendiente |
| SEC-005 | `clientIp` en logs sin hash | Media | No | Pendiente |
| SEC-006 | Captcha deshabilitado DEV | Media | No (pre-prod sí) | Aceptable DEV |

---

## Métricas de seguridad

| Métrica | Valor |
|---------|-------|
| agentName | security-agent |
| securityScore | 78 |
| checksTotal | 8 |
| checksPassed | 6 |
| checksFailed | 1 |
| checksWarning | 1 |
| blockingGate | SEC-CORS-001 |
| gateStatus | fail |

---

## Próximo agente sugerido

**none** — Merge humano del PR `cursor/remediate-sec-cors-001-19c5` y re-ejecución de security-agent post-merge.

---

## Referencias

- `NovusIntelligenceBack@main` — `bf3bd2b`
- `NovusIntelligenceBack@cursor/remediate-sec-cors-001-19c5` — `f705e36`
- `.nadf/global/rules/security-rules.md`
- `.claude/agents/security-agent.md`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Revisión inicial — FAIL (IAM + rate limit) | security-agent |
| 2026-07-15 | Revalidación post-remediación CORS — FAIL en `main`; PASS en PR head | security-agent |
