# Resumen Cloud — Novus Intelligence Solutions

**Proyecto:** novus-intelligence  
**Workflow:** novus-intelligence-lovable-to-web  
**Paso:** paso-08-propuesta-infra  
**Agente:** cloud-agent  
**Fecha:** 2026-07-16  
**Runtime:** Cursor Cloud Agent (M6)  
**Target environment:** DEV — AWS `sa-east-1`  
**Plan:** PLAN-NOVUS-LOVABLE-2026-07-14 (`approved`)  
**Rama:** `cursor/propuesta-infra-paso08-fa5e`

---

## Resumen ejecutivo

Se generó y revalidó la **propuesta de infraestructura IaC** para el entorno DEV en AWS **sa-east-1**, alineada con `environments/dev.yml` (región ya reconciliada, recursos frontend parcialmente existentes).

**Despliegue:** No realizado (`NO_DEPLOY`). La publicación requiere aprobación humana explícita y ejecución del checklist en `propuesta-infra.md`.

---

## Artefactos producidos

| Artefacto | Descripción |
|-----------|-------------|
| `artifacts/propuesta-infra.md` | Propuesta detallada: recursos, stacks, secrets, Serverless template, checklist deploy |
| `artifacts/resumen-cloud.md` | Este resumen |

---

## Recursos propuestos (DEV sa-east-1)

### Backend

| Componente | Nombre / identificador | Estado |
|------------|----------------------|--------|
| Stack Serverless / CloudFormation | **`novus-intelligence-back-dev`** | Pendiente |
| HTTP API Gateway | **`novus-intelligence-api-dev`** | Pendiente |
| Lambda | **`novus-contact-handler`** (Node.js 20, arm64, 256 MB, 10 s) | Pendiente |
| Endpoint | `POST /api/v1/contact` | Pendiente |
| URL pública | `https://api-dev.novusintelligence.com` | DNS pendiente |
| Email | AWS SES — `noreply-dev@novusintelligence.com` | Pendiente verificación |
| Logs | `/aws/lambda/novus-contact-handler` | Pendiente |

### Frontend

| Componente | Nombre / identificador | Estado |
|------------|----------------------|--------|
| Bucket SPA | **`novus-intelligence-web-dev-519010577666`** | Existente |
| CloudFront | **`E8IN00J3MFCNO`** | Activo |
| URL activa | `https://d1bfu6klutpp8m.cloudfront.net` | Operativa |
| URL DNS objetivo | `https://dev.novusintelligence.com` | Pendiente alias |
| Certificado ACM (CloudFront) | `dev.novusintelligence.com` (us-east-1) | Verificar |

### Assets

| Componente | Nombre / identificador | Estado |
|------------|----------------------|--------|
| Bucket assets | **`novus-intelligence-assets-dev`** | Pendiente |
| Alternativa MVP | Assets en bucket SPA (`public/assets/novus/`) | Opcional |

### Secrets y configuración

| Tipo | Path / nombre |
|------|---------------|
| Secrets Manager | `/novus-intelligence/dev/contact-email` |
| Secrets Manager | `/novus-intelligence/dev/captcha` (condicional) |
| Secrets Manager | `/novus-intelligence/dev/crm` (opcional) |
| SSM | `/novus-intelligence/dev/*` (CORS, rate limit, captcha flags, log level) |

**Variables canónicas:** `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO` (normalización D-003).

---

## Reconciliación regional (TASK-INFRA-001)

| Campo | Estado |
|-------|--------|
| `environments/dev.yml` → `region` | **`sa-east-1`** ✅ Completado |
| `backend.region` | **`sa-east-1`** ✅ |
| Recursos compute/API/SES/S3 | sa-east-1 |
| Certificado CloudFront | us-east-1 (requisito AWS) |

---

## Tareas NADF completadas

| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| TASK-INFRA-001 | ✅ | `dev.yml` en sa-east-1 |
| TASK-INFRA-002 | ✅ | API Gateway + Lambda + SES en propuesta |
| TASK-INFRA-003 | ✅ | S3 + CloudFront documentado (CDN activo) |
| TASK-INFRA-004 | ✅ | Bucket assets documentado |
| TASK-INFRA-005 | ✅ | Secrets/SSM — solo nombres, sin valores |

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
| Backend implementado (`TASK-BE-*`) | Pendiente backend-agent | Deploy API requiere handler listo |
| Secrets creados en AWS | Pendiente humano | Lambda no puede enviar email sin secrets |
| SES dominio verificado | Pendiente humano | Bloqueante para envío real |
| Frontend build CI | Pendiente devops-agent | Sync SPA requiere pipeline |
| DNS custom `dev.novusintelligence.com` | Pendiente | Alias Route 53 → CloudFront |

**Despliegue DEV bloqueado hasta:** `deploy_human_approval` + prerrequisitos Fase A del checklist.

---

## Variables clave (referencia rápida)

### Lambda / backend

- `NODE_ENV`, `AWS_REGION`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`
- `CORS_ALLOWED_ORIGINS`, `RATE_LIMIT_PER_IP`
- `CAPTCHA_ENABLED`, `CAPTCHA_PROVIDER`, `CAPTCHA_SECRET`
- `CRM_WEBHOOK_URL` (opcional), `LOG_LEVEL`

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
| **devops-agent** | Pipeline CI + variables build; deploy solo con aprobación |
| **Humano (ops)** | Ejecutar checklist Fases A–F tras `deploy_human_approval` |
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
| 2026-07-16 | Revalidación paso-08; alineación con dev.yml reconciliado y recursos existentes | cloud-agent |
