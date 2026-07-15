# Resumen Cloud — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-08-propuesta-infra  
**Agente:** cloud-agent  
**Fecha:** 2026-07-15  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Rama:** `cursor/propuesta-infra-dev-a1e7`

---

## Resumen ejecutivo

Se generó/actualizó la **propuesta de infraestructura IaC** para el entorno DEV en AWS **sa-east-1**, alineada con `environments/dev.yml` (TASK-INFRA-001 **completada**).

**Estado infra DEV:**

| Capa | Estado |
|------|--------|
| Frontend (S3 + CloudFront) | Parcialmente desplegado — CloudFront activo |
| Backend (API Gateway + Lambda) | Pendiente deploy |
| SES | Pendiente verificación dominio/remitente |
| Secrets / SSM | Pendiente creación |
| DNS custom (`dev.novusintelligence.com`) | Pendiente |

**Despliegue:** No realizado en esta ejecución (`NO_DEPLOY`). Publicación backend/API requiere gates NADF o aprobación humana según checklist en `propuesta-infra.md`.

---

## Artefactos producidos

| Artefacto | Descripción |
|-----------|-------------|
| `artifacts/propuesta-infra.md` | Propuesta detallada: recursos, stacks, secrets, Serverless template, checklist deploy |
| `artifacts/resumen-cloud.md` | Este resumen |

---

## Recursos propuestos (DEV sa-east-1)

### Backend (pendiente)

| Componente | Nombre / identificador |
|------------|----------------------|
| Stack Serverless / CloudFormation | **`novus-intelligence-back-dev`** |
| HTTP API Gateway | **`novus-intelligence-api-dev`** |
| Lambda | **`novus-contact-handler`** (Node.js 20, arm64, 256 MB, 10 s) |
| Endpoint | `POST /api/v1/contact` |
| URL pública | `https://api-dev.novusintelligence.com` |
| Email | AWS SES — `noreply-dev@novusintelligence.com` |
| Logs | `/aws/lambda/novus-contact-handler` |

### Frontend (parcialmente desplegado)

| Componente | Nombre / identificador |
|------------|----------------------|
| Bucket SPA | **`novus-intelligence-web-dev-519010577666`** |
| CloudFront | **`E8IN00J3MFCNO`** |
| URL activa | `https://d1bfu6klutpp8m.cloudfront.net` |
| URL DNS pendiente | `https://dev.novusintelligence.com` |
| Certificado ACM (CloudFront) | `dev.novusintelligence.com` (us-east-1) — pendiente |

### Assets (pendiente)

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

| Campo | Antes | Después |
|-------|-------|---------|
| `environments/dev.yml` → `region` | `us-east-1` | **`sa-east-1`** ✅ |
| `backend.region` | — | **`sa-east-1`** ✅ |
| Recursos compute/API/SES/S3 | — | sa-east-1 |
| Certificado CloudFront | — | us-east-1 (requisito AWS) |

---

## Tareas NADF completadas

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| TASK-INFRA-001 | ✅ Completada | `dev.yml` declara `sa-east-1` |
| TASK-INFRA-002 | ✅ Documentada | API Gateway + Lambda + SES en propuesta |
| TASK-INFRA-003 | ✅ Documentada | S3 + CloudFront frontend (CloudFront activo) |
| TASK-INFRA-004 | ✅ Documentada | Bucket assets documentado |
| TASK-INFRA-005 | ✅ Documentada | Secrets/SSM — solo nombres, sin valores |

---

## Quality gates verificados

| Gate | Estado | Evidencia |
|------|--------|-----------|
| `plan_approved` | ✅ | Plan status `approved` |
| `NO_DEPLOY` | ✅ | Sin apply ni recursos creados en esta ejecución |
| `NO_SECRETS_IN_REPO` | ✅ | Solo nombres y paths documentados |
| `deploy_human_approval` | ✅ | Checklist explícito; backend pendiente aprobación/gates |
| `TARGET_DEV_REGION_SA_EAST_1` | ✅ | Propuesta alineada a sa-east-1 |

---

## Dependencias y bloqueos

| Dependencia | Estado | Impacto |
|-------------|--------|---------|
| Backend implementado (`TASK-BE-*`) | Pendiente ejecución backend-agent | Deploy API requiere handler listo |
| Secrets creados en AWS | Pendiente humano | Lambda no puede enviar email sin secrets |
| SES dominio verificado | Pendiente humano | Bloqueante para envío real |
| Frontend build CI | Pendiente devops-agent | Sync SPA a bucket existente |
| DNS alias `dev.novusintelligence.com` | Pendiente | CloudFront activo vía URL default |

**Despliegue backend bloqueado hasta:** gates NADF (`qa_pass`, `security_pass`, `visual_exact_parity`) o `deploy_human_approval` + prerrequisitos Fase A del checklist.

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
| **backend-agent** | Implementar handler y `serverless.yml` según propuesta |
| **devops-agent** | Pipeline CI + variables build; deploy post-gates |
| **Humano (ops)** | Ejecutar checklist Fases A–F (backend, SES, DNS, secrets) |
| **qa-agent** | Validación end-to-end post-deploy (Fase 9) |
| **security-agent** | Revisar secrets, CORS, rate limit, captcha pre-prod |

---

## Referencias

- `artifacts/propuesta-infra.md`
- `artifacts/plan-implementacion.md`
- `artifacts/especificacion-backend.md`
- `.nadf/projects/novus-intelligence/environments/dev.yml`

---

## Historial

| Fecha | Acción | Agente |
|-------|--------|--------|
| 2026-07-14 | Propuesta infra DEV sa-east-1 + resumen cloud | cloud-agent |
| 2026-07-15 | Actualización con dev.yml reconciliado e IDs infra existentes | cloud-agent |
