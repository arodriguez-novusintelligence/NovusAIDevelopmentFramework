# Patrón: Rate limiting en APIs públicas serverless

## Contexto

APIs públicas expuestas vía API Gateway HTTP API en arquitectura serverless (p. ej. formulario de contacto `POST /api/v1/contact`) requieren protección contra abuso sin depender únicamente del throttle global del stage.

## Solución

Implementar rate limiting por IP en el handler, complementado (no sustituido) por throttle de API Gateway:

| Capa | Rol | Limitación |
|------|-----|------------|
| API Gateway stage throttle | Protección global | No distingue por IP |
| Handler in-app (`isIpRateLimited`) | Límite por IP en ventana temporal | Implementación inmediata |
| DynamoDB TTL | Persistencia entre invocaciones frías | Escalable, stateless-friendly |
| AWS WAF rate-based rule | Protección en edge | Requiere ADR para prod |

### Verificación obligatoria

1. La utilidad de rate limit debe estar **conectada** en el handler (no solo definida).
2. `rateLimitResponse()` debe retornar 429 con headers apropiados.
3. Security-agent debe validar conexión, no solo existencia del código.

### Ejemplo (novus-intelligence)

```typescript
// contact.ts — verificar que isIpRateLimited() se invoca antes del procesamiento
if (await isIpRateLimited(clientIp)) {
  return rateLimitResponse();
}
```

## Ejemplo

- Proyecto: novus-intelligence — `novus-contact-handler` en NovusIntelligenceBack
- Hallazgo SEC-002 resuelto en iteración 2 con `isIpRateLimited()` conectado

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Recomendación: KB-003 en `artifacts/recomendaciones-kb.json`
- ADR pendiente: ADR-REC-001 (estrategia definitiva antes de prod)
