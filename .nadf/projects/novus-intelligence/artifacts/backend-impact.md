# Impacto Backend — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `e2aa094`  
**Destino:** NovusIntelligenceBack (Serverless Framework, Node.js 20, AWS sa-east-1)  
**Fecha:** 2026-07-16  
**Agente:** lovable-analyzer-agent

---

## Resumen ejecutivo

El delta `e2aa094` **amplía significativamente** los requisitos backend. Además del formulario de contacto (`POST /api/v1/contact`), Lovable introduce un **portal de empresas** con autenticación y persistencia de perfiles corporativos vía **Supabase** (solo prototipo).

En producción, según `port-lovable-to-aws.md` y `port-map.yml`:

- **Sin Supabase en producción.**
- Auth y datos de empresas deben implementarse en **AWS** (Cognito + Lambda + DynamoDB/RDS o equivalente).

**backendRequired: true** — contacto + auth + registro empresas.

---

## Endpoints requeridos (existentes)

### POST /api/v1/contact

| Atributo | Valor |
|----------|-------|
| Operación | `submitContact` |
| Contrato | `novus-nexus/src/integrations/aws/contact-api.contract.ts` |
| OpenAPI | `novus-nexus/reglasInfra/backend-endpoints.yml` |
| Lambda sugerida | `novus-contact-handler` |
| Estado | Pendiente de implementación productiva |

Sin cambios en el contrato respecto al análisis anterior. Ver detalle en commit baseline `e3a9819`.

---

## Endpoints requeridos (nuevos — delta e2aa094)

### Autenticación de empresas

Lovable implementa auth vía Supabase (`signUp`, `signInWithPassword`, `signOut`, `getSession`). En producción se requiere equivalente AWS:

| Capacidad Lovable | Traducción AWS sugerida |
|-------------------|-------------------------|
| `signUp(email, password)` | Cognito User Pool `SignUp` o API `POST /api/v1/auth/signup` |
| `signInWithPassword` | Cognito `InitiateAuth` o API `POST /api/v1/auth/login` |
| `getSession` / refresh | JWT en cookie httpOnly + refresh token |
| `signOut` | `POST /api/v1/auth/logout` + invalidar sesión |
| `emailRedirectTo` | Cognito email verification callback URL |

**Nota:** El planner y architect-agent deben decidir Cognito directo vs API custom. Esto probablemente requiere **ADR**.

### CRUD perfil de empresa

Lovable persiste en tabla `public.companies` vía Supabase client con RLS.

#### Esquema detectado (migración SQL)

```sql
companies (
  id UUID PK,
  user_id UUID FK → auth.users (UNIQUE),
  company_name TEXT NOT NULL,
  tax_id TEXT,
  country TEXT,
  city TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT,
  founded_year INTEGER,
  solution_interest TEXT,
  budget_range TEXT,      -- en schema, no usado en formulario actual
  timeframe TEXT,         -- en schema, no usado en formulario actual
  message TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

#### Políticas RLS (Lovable/Supabase)

- Usuario autenticado solo puede SELECT/INSERT/UPDATE/DELETE su propio registro (`auth.uid() = user_id`).

#### API productiva sugerida

| Método | Ruta | Operación | Auth |
|--------|------|-----------|------|
| GET | `/api/v1/companies/me` | Obtener perfil del usuario autenticado | JWT required |
| PUT | `/api/v1/companies/me` | Crear/actualizar perfil (upsert) | JWT required |
| DELETE | `/api/v1/companies/me` | Eliminar perfil (opcional) | JWT required |

#### Request body (CompanyUpsert) — intención del formulario

```json
{
  "company_name": "string (required)",
  "tax_id": "string (optional)",
  "country": "string (optional)",
  "city": "string (optional)",
  "website": "string (optional, url)",
  "industry": "string (optional)",
  "company_size": "string (optional)",
  "founded_year": "integer (optional, 1900–current)",
  "solution_interest": "enum: ai-agents | automation | integrations | analytics | documents-ai | customer-ai",
  "message": "string (optional)"
}
```

#### Response body

```json
{
  "ok": true,
  "company": { "...": "CompanyRow" },
  "message": "Perfil de empresa guardado."
}
```

#### Lambda sugerida

| Componente | Especificación |
|------------|----------------|
| Lambda | `novus-company-handler` |
| Runtime | Node.js 20.x |
| Storage | DynamoDB (userId PK) o RDS Postgres |
| Auth | Validar JWT Cognito en API Gateway authorizer |
| IAM | Permisos read/write storage, logs |

---

## Implementación en Lovable (no productiva)

| Archivo | Rol |
|---------|-----|
| `src/integrations/supabase/client.ts` | Cliente browser con VITE_SUPABASE_* |
| `src/integrations/supabase/client.server.ts` | Cliente admin server-side |
| `src/integrations/supabase/auth-middleware.ts` | Middleware SSR con getClaims |
| `src/integrations/supabase/auth-attacher.ts` | Attach session en start.ts |
| `src/integrations/supabase/types.ts` | Tipos generados tabla companies |
| `supabase/migrations/*.sql` | DDL + RLS |

**Prohibido portar** estos archivos al stack productivo.

---

## Variables de entorno

### Lovable (prototipo — no replicar en prod)

| Variable | Uso |
|----------|-----|
| `VITE_SUPABASE_URL` | URL proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública Supabase |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | SSR fallback |

### Productivo (AWS — sin secretos en repo)

| Variable | Uso |
|----------|-----|
| `CONTACT_SES_FROM` / `CONTACT_SES_TO` | Email contacto |
| `COGNITO_USER_POOL_ID` | Auth empresas |
| `COGNITO_CLIENT_ID` | Auth empresas |
| `COMPANIES_TABLE_NAME` | DynamoDB o conexión RDS |
| `JWT_ISSUER` | Validación tokens |

---

## Funcionalidades sin impacto backend

| Componente | Motivo |
|------------|--------|
| NovusDevFrameworkDemo | Visualización educativa; datos hardcoded |
| MultiAgentDemo | Solo frontend |
| Navegación, contenido estático, legales | Client-side |
| Header con link "Registro empresas" | Solo navegación |

---

## Seguridad y validación (ampliado)

| Requisito | Lovable | Requerido en backend productivo |
|-----------|---------|--------------------------------|
| Auth password min 6 chars | Client-side | Política Cognito más estricta (≥8, complejidad) |
| RLS por user_id | Supabase RLS | Authorizer JWT + filtro por sub en Lambda |
| Validación server-side | Parcial (Supabase constraints) | Obligatorio en Lambda |
| Rate limiting auth | No | Obligatorio (brute force) |
| Captcha en signup | No | Recomendado |
| CORS | Supabase managed | API Gateway |
| Secrets en .env Lovable | Presentes (prototipo) | **Nunca en repo productivo** |

---

## Evaluación de necesidad backend por cambio

| ID Cambio | Componente | requiresBackend | Justificación |
|-----------|------------|-----------------|---------------|
| CHG-008 | contact-form | **Sí** | POST /api/v1/contact |
| CHG-011 | api-contract | **Sí** | Contrato contacto |
| CHG-014 | auth-portal | **Sí** | Signup/login/logout |
| CHG-015 | register-company-form | **Sí** | CRUD perfil empresa |
| CHG-016 | supabase-integration | **Sí** | Traducir a AWS, no copiar |
| CHG-009, CHG-017 | Demos interactivos | No | Solo frontend |
| CHG-001–007, 010, 012–013, 018 | Resto | No | Frontend/contenido |

---

## Gaps pendientes (handoff)

1. **ADR auth:** Decidir Cognito vs proveedor externo para portal empresas.
2. **ADR storage:** DynamoDB vs RDS para tabla companies.
3. **OpenAPI:** Extender `backend-endpoints.yml` con rutas auth y companies.
4. **Alcance:** Portal empresas no está en `initial_scope` — validar con stakeholder.
5. **Captcha:** Aplicar a signup y registro empresa.
6. **Notificación:** ¿Email interno al guardar perfil empresa? (Lovable muestra toast; no hay webhook).

---

## Recomendación para planner-agent

1. Tratar portal empresas como **épica separada** con dependencia auth → companies API → frontend.
2. Mantener `POST /api/v1/contact` como tarea bloqueante para contacto.
3. **No** incluir Supabase en plan productivo; documentar traducción AWS explícitamente.
4. Secuenciar: ADR auth/storage → backend APIs → frontend auth UI → frontend registro → QA security.

---

## Próximo agente

**backend-impact-agent** (paso 5) debe detallar especificación Lambda auth + companies, IAM y almacenamiento.  
**planner-agent** (paso 4) debe incluir ambas dependencias backend y flag de expansión de alcance.
