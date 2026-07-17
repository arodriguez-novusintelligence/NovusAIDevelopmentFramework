<!-- NADF-GUIDE
Propósito: Documenta Patrón: Rate limiting en APIs públicas serverless.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Patrón: Rate limiting en APIs públicas serverless

## Contexto

Endpoints públicos sin autenticación (p. ej. `POST /api/v1/contact`) expuestos vía API Gateway + Lambda. El throttle global de stage (burst/rate) es complementario, no sustituto de rate limit por IP.

## Solución

### Matriz de decisión

| Opción | Pros | Contras | Cuándo usar |
|--------|------|---------|-------------|
| A — Handler in-app + DynamoDB TTL | Control fino por IP; sin WAF extra | Complejidad en código; costo DynamoDB | Volúmenes moderados; lógica custom |
| B — AWS WAF rate-based rule | Protección en edge; sin cambios handler | Costo WAF; menos granular por endpoint | APIs públicas de alto riesgo |
| C — ElastiCache/Redis ventana deslizante | Alta precisión temporal | Infra adicional; cold start impact | Alta concurrencia |
| D — Solo API Gateway throttle | Simple | No distingue IPs; insuficiente solo | Complemento, no solución única |

### Reglas obligatorias

1. Si se define `rateLimitResponse()` o constantes `RATE_LIMIT_PER_IP`, deben invocarse en el handler.
2. Documentar decisión en especificación backend y, si aplica, ADR.
3. security-agent debe verificar conexión código-definición ↔ implementación.

## Ejemplo

novus-intelligence SEC-002: `rateLimitResponse()` definido pero no invocado en `contact.ts`.
- Evidencia: `artifacts/informe-seguridad.md`, `artifacts/especificacion-backend.md`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-003, ANTI-002, SEC-002 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
