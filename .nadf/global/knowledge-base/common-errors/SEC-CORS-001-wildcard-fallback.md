# Error: SEC-CORS-001

## Síntoma

El gate `security_pass` falla aunque `httpApi.cors` en `serverless.yml` liste orígenes explícitos. El security-agent detecta que el fallback de `CORS_ALLOWED_ORIGINS` incluye `*` y que `corsHeaders()` habilita cualquier origen si no se inyecta la variable de entorno.

Hallazgo bloqueante en workflow `novus-intelligence-lovable-to-web` (iteración 2 post-merge).

## Causa

**Configuración dual inconsistente** — anti-patrón donde dos capas de CORS contradicen la intención de seguridad:

1. `httpApi.cors` en Serverless: orígenes explícitos (aparentemente seguro).
2. Fallback `CORS_ALLOWED_ORIGINS` en `serverless.yml` o código handler: incluye `*`.
3. Función `corsHeaders()` interpreta `*` como permitir cualquier origen.

Si el entorno no inyecta `CORS_ALLOWED_ORIGINS` explícitamente, el fallback inseguro prevalece.

## Solución

Checklist de remediación (4 pasos):

1. **Eliminar `*` de defaults** en `serverless.yml` — usar lista explícita de orígenes DEV/QA.
2. **Alinear `.env.example`** con los mismos orígenes (sin wildcard).
3. **Incluir orígenes activos** — p. ej. CloudFront (`https://d1bfu6klutpp8m.cloudfront.net`) según `propuesta-infra.md`.
4. **Revalidar con security-agent** tras cada fix; no asumir PASS por correcciones parciales de otros hallazgos (SEC-001, SEC-002).

```yaml
# Incorrecto
environment:
  CORS_ALLOWED_ORIGINS: ${env:CORS_ALLOWED_ORIGINS, '*'}

# Correcto
environment:
  CORS_ALLOWED_ORIGINS: ${env:CORS_ALLOWED_ORIGINS, 'https://localhost:5173,https://d1bfu6klutpp8m.cloudfront.net'}
```

## Prevención

1. Checklist CORS obligatorio en backend-agent antes de handoff a security-agent.
2. Verificar coherencia entre: `httpApi.cors`, env defaults, `corsHeaders()` y `.env.example`.
3. Tras cada fix de seguridad en serverless.yml, ejecutar revisión exhaustiva (no solo el hallazgo corregido).
4. Gate de workflow: checklist CORS sin wildcard (ver WF-001 en reflexión).

## Proyectos donde se observó

- novus-intelligence (SEC-CORS-001 bloqueante; SEC-CORS-002 seguimiento CloudFront)

## Referencias

- Fuente: `artifacts/informe-seguridad.md`, `artifacts/security-result.json`
- Recomendación: KB-008 en `artifacts/recomendaciones-kb.json`
- Anti-patrón: ANTI-001, ANTI-003 en `artifacts/recomendaciones-kb.json`
