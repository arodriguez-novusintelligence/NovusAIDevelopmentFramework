# Error: SEC-002

## Síntoma

Gate `security_pass` falla: rate limiting por IP no implementado. Funciones como `rateLimitResponse()` y constantes `RATE_LIMIT_PER_IP` existen en el código pero no se invocan en el handler de contacto.

## Causa

Patrón «dead code security»: utilidades de protección definidas durante desarrollo pero no conectadas al flujo de request. Pasa revisión superficial porque el código «parece» tener rate limiting.

## Solución

1. Conectar `rateLimitResponse()` al inicio del handler antes de procesar el body.
2. O implementar alternativa documentada (DynamoDB TTL, WAF rate-based) según matriz en `architecture-patterns/rate-limiting-serverless-public-apis.md`.
3. Eliminar código muerto si la decisión es usar solo WAF en IaC.

## Prevención

1. security-agent verifica invocación, no solo existencia de funciones de seguridad.
2. Especificación backend debe incluir criterio verificable (p. ej. «10 req/5min por IP»).
3. Considerar ADR para formalizar estrategia antes de deploy DEV.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/informe-seguridad.md`, `artifacts/security-result.json`, `artifacts/especificacion-backend.md`
- Agentes responsables: backend-agent, cloud-agent (si WAF)

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-002, KB-003 |
| Severidad | high |
| Gate bloqueante | security_pass |
| Fecha | 2026-07-14 |
