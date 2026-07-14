# Resumen Cloud — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-08-propuesta-infra  
**Agente:** cloud-agent  
**Fecha:** 2026-07-14  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Rama:** `cursor/propuesta-infra-dev-4cd7`

---

## Resumen ejecutivo

Se generó y actualizó la **propuesta de infraestructura IaC** para el entorno DEV en AWS **sa-east-1**, alineada con `environments/dev.yml` (región ya reconciliada — TASK-INFRA-001 cumplido).

**Despliegue:** No realizado (`NO_DEPLOY`). La publicación requiere aprobación según gates NADF y ejecución del checklist en `propuesta-infra.md`.

---

## Artefactos producidos

| Artefacto | Descripción |
|-----------|-------------|
| `artifacts/propuesta-infra.md` | Propuesta detallada: recursos, stacks, secrets, Serverless template, checklist deploy |
| `artifacts/resumen-cloud.md` | Este resumen |

---

## Recursos propuestos (DEV sa-east-1)

### Backend

| Componente | Nombre / identificador |
|------------|----------------------|
| Stack Serverless / CloudFormation | **`novus-intelligence-back-dev`** |
| HTTP API Gateway | **`novus-intelligence-api-dev`** |
| Lambda | **`novus-contact-handler`** (Node.js 20, arm64, 256 MB, 10 s) |
| Endpoint | `POST /api/v1/contact` |
| URL pública | `https://api-dev.novusintelligence.com` |
| Email | AWS SES — `noreply-dev@novusintelligence.com` |
| Logs | `/aws/lambda/novus-contact-handler` |

### Frontend

| Componente | Nombre / identificador |
|------------|----------------------|
| Bucket SPA | **`novus-intelligence-web-dev-519010577666`** |
| CloudFront | **`E8IN00J3MFCNO`** |
| URL activa | `https://d1bfu6klutpp8m.cloudfront.net` |
| URL DNS pendiente | `https://dev.novusintelligence.com` |
| Certificado ACM (CloudFront) | `dev.novusintelligence.com` (us-east-1) |

### Assets

| Componente | Nombre / identificador |
|------------|----------------------|
| Bucket assets | **`novus-intelligence-assets-dev`** |
| Alternativa MVP | Assets en bucket SPA (`public/assets/novus/`) |

### Secrets y configuración

| Tipo | Path / nombre |
|------|---------------|
| Secrets Manager | `/novus-intelligence/dev/contact-email` |
| Secrets Manager | `/novus-intelligence/dev/captcha` (condicional) |
| Secrets Manager | `/novus-intelligence/dev/crm` (opcional) |
| SSM | `/novus-intelligence/dev/*` (CORS, rate limit, captcha flags, log level) |

**Variables normalizadas (canónicas):** `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`.

---

## Reconciliación regional (TASK-INFRA-001)

| Campo | Estado |
|-------|--------|
| `environments/dev.yml` → `region` | **`sa-east-1`** ✅ |
| `backend.region` | **`sa-east-1`** ✅ |
| Recursos compute/API/SES/S3 | sa-east-1 |
| Certificado CloudFront | us-east-1 (requisito AWS) |

---

## Estado infraestructura

| Recurso | Estado |
|---------|--------|
| Bucket frontend + CloudFront | Existente / operativo |
| Stack backend API | Pendiente deploy |
| SES + Secrets/SSM | Pendiente configuración humana |
| DNS `dev.novusintelligence.com` | Pendiente alias Route 53 |
| DNS `api-dev.novusintelligence.com` | Pendiente custom domain API |

---

## Tareas NADF completadas

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| TASK-INFRA-001 | ✅ | Región sa-east-1 confirmada en `dev.yml` |
| TASK-INFRA-002 | ✅ | API Gateway + Lambda + SES en propuesta |
| TASK-INFRA-003 | ✅ | S3 + CloudFront frontend documentado |
| TASK-INFRA-004 | ✅ | Bucket assets documentado |
| TASK-INFRA-005 | ✅ | Secrets/SSM — solo nombres, sin valores |

---

## Hallazgos de seguridad incorporados

| ID | Hallazgo | Acción en propuesta |
|----|----------|---------------------|
| SEC-001 | IAM SES `Resource: '*'` | Acotar ARN identity en `serverless.yml` |
| SEC-001 | Sin permisos secrets/ssm | Agregar statements IAM documentados |
| SEC-002 | Rate limit por IP no conectado | Conectar `RATE_LIMIT_PER_IP` en handler |

---

## Quality gates verificados

| Gate | Estado | Evidencia |
|------|--------|-----------|
| `plan_approved` | ✅ | Plan status `approved` |
| `NO_DEPLOY` | ✅ | Sin apply ni recursos creados |
| `NO_SECRETS_IN_REPO` | ✅ | Solo nombres y paths documentados |
| `deploy_human_approval` | ✅ | Checklist explícito para humano |
| `TARGET_DEV_REGION_SA_EAST_1` | ✅ | Propuesta alineada a sa-east-1 |

---

## Dependencias y bloqueos

| Dependencia | Estado | Impacto |
|-------------|--------|---------|
| Backend implementado (`TASK-BE-*`) | En progreso (backend-agent) | Deploy API requiere handler listo |
| Secrets creados en AWS | Pendiente humano | Lambda no puede enviar email sin secrets |
| SES dominio verificado | Pendiente humano | Bloqueante para envío real |
| SEC-001/SEC-002 corregidos | Pendiente backend-agent | Bloqueante security_pass |
| Frontend build CI | Pendiente devops-agent | Deploy SPA requiere pipeline |

**Despliegue DEV bloqueado hasta:** gates NADF completos + prerrequisitos Fase A del checklist.

---

## Variables clave (referencia rápida)

### Lambda / backend

- `NODE_ENV`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`
- `CORS_ALLOWED_ORIGINS`, `RATE_LIMIT_PER_IP`
- `CAPTCHA_ENABLED`, `CAPTCHA_PROVIDER`, `CAPTCHA_SECRET`
- `CRM_WEBHOOK_URL` (opcional), `LOG_LEVEL`, `AWS_REGION`

### Frontend (build-time)

- `VITE_NOVUS_API_URL=https://api-dev.novusintelligence.com`
- `VITE_DEMO_MODE=false` (obligatorio — R-001)

---

## Costo estimado DEV

**USD 5–10/mes** (tráfico corporativo bajo, un endpoint, SES limitado).

---

## Próximos pasos sugeridos

| Agente | Acción |
|--------|--------|
| **backend-agent** | Corregir SEC-001/SEC-002; alinear `serverless.yml` con propuesta |
| **devops-agent** | Pipeline CI + variables build; deploy tras gates |
| **Humano (ops)** | Ejecutar checklist Fases A–F |
| **qa-agent** | Validación end-to-end post-deploy (Fase 9) |
| **security-agent** | Re-validar tras correcciones IAM y rate limit |

---

## Referencias

- `artifacts/propuesta-infra.md`
- `artifacts/plan-implementacion.md`
- `artifacts/especificacion-backend.md`
- `artifacts/security-result.json`
- `.nadf/projects/novus-intelligence/environments/dev.yml`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Propuesta infra DEV sa-east-1 + resumen cloud | cloud-agent |
| 2026-07-14 | Actualización alineada a `dev.yml` vigente y hallazgos SEC-001/002 | cloud-agent |
