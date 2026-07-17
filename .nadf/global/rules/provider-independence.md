<!-- NADF-GUIDE
Propósito: Documenta Independencia de proveedor.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Independencia de proveedor

## Principio

El NovusAIDevelopmentFramework debe diseñarse para operar con **cualquier proveedor de nube e IA**, sin acoplamiento exclusivo a un vendor. AWS es el proveedor inicial, pero la arquitectura, reglas y workflows deben permitir migración futura.

## Ámbitos de independencia

### 1. Proveedor de nube

| Servicio | AWS (inicial) | Alternativas futuras |
|----------|---------------|---------------------|
| Hosting frontend | S3 + CloudFront | Azure Static Web Apps, GCP Cloud Storage + CDN |
| Compute (API) | Lambda | Azure Functions, Cloud Functions |
| API Gateway | API Gateway | Azure API Management, Cloud Endpoints |
| Base de datos | DynamoDB | Cosmos DB, Firestore |
| Almacenamiento | S3 | Azure Blob, GCS |
| Email | SES | SendGrid, Mailgun, Azure Communication |
| DNS | Route 53 | Cloudflare, Azure DNS |

### 2. Proveedor de IA y herramientas (MCP)

- El framework no debe depender de un único modelo o proveedor de IA.
- Los agentes se definen por **rol y capacidad**, no por modelo específico.
- La integración con servicios externos (GitHub, AWS, DB, Terraform, Jira) se realiza vía **MCP (Model Context Protocol)**.
- Cada agente declara `mcp_servers` permitidos en su skill registry.
- Referencia: `docs/mcp-integration.md`.

## Reglas de diseño

### 1. Abstracción en configuración

- Los archivos de entorno (dev.yml, qa.yml, prod.yml) referencian servicios por **capacidad**, no por nombre AWS:
  ```yaml
  # Correcto
  storage:
    provider: aws  # configurable
    service: object_storage
    bucket_name: novus-intelligence-assets-dev

  # Incorrecto
  s3_bucket: novus-intelligence-assets-dev  # acoplado a AWS
  ```

### 2. APIs provider-agnostic

- Diseñar endpoints y contratos de API independientes del runtime serverless específico.
- Usar OpenAPI/Swagger para definir contratos.
- Evitar features propietarias de AWS en lógica de negocio (ej: DynamoDB-specific queries en capa de dominio).

### 3. Infraestructura como configuración

- Serverless Framework con plugins multi-cloud cuando sea posible.
- Variables de entorno para configuración de proveedor, no hardcoding.
- Templates de despliegue parametrizados por proveedor.

### 4. Agentes agnósticos

- Las definiciones de agentes no referencian servicios cloud específicos.
- El Backend Impact Agent evalúa **capacidades necesarias** (storage, email, DB), no servicios AWS concretos.
- Los workflows usan nombres genéricos de servicio.

### 5. Documentación neutral

- La documentación describe capacidades, no implementaciones vendor-specific.
- Cuando se mencione AWS, indicar que es el proveedor **actual**, no el único posible.

## Proveedor inicial: AWS

| Decisión | Valor | ADR |
|----------|-------|-----|
| Cloud provider | AWS | ADR-0001 |
| Región | us-east-1 | project-context.yml |
| Runtime backend | Node.js 20 Lambda | project-context.yml |
| IaC | Serverless Framework | project-context.yml |

## Migración futura

Para migrar a otro proveedor:

1. Actualizar archivos de entorno con nuevo provider
2. Adaptar templates de infraestructura
3. Verificar que APIs no usan features propietarias
4. Crear ADR documentando la migración
5. Ejecutar QA completo en nuevo entorno

## Restricciones

- No usar SDK de AWS directamente en frontend
- No hardcodear ARNs, account IDs ni regiones en código
- No diseñar workflows que asuman exclusivamente servicios AWS
- Documentar dependencias de vendor cuando sean inevitables

## Referencias

- ADR-0001: `.nadf/global/decision-history/adr/ADR-0001-nadf-foundation.md`
- Arquitectura: `docs/architecture.md`
- Entornos del proyecto: `.nadf/projects/novus-intelligence/environments/`
