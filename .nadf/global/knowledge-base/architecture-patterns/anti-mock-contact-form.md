# Patrón: Política anti-mock en formularios de contacto

## Contexto

Workflows NADF prohíben datos simulados en rutas de producción (regla `no_mock_data_in_production`). Los formularios de contacto son punto crítico: el usuario espera envío real, no respuestas demo.

## Solución

Patrón verificado en corrida Lovable→Web de novus-intelligence:

### Frontend

- `submitContact()` **falla con mensaje explícito** si `VITE_NOVUS_API_URL` no está configurada.
- Sin fallback que simule éxito ni genere `requestId` con prefijo `demo-`.
- UI muestra error claro al usuario, no estado "enviado" falso.

### Backend

- `requestId` generado con `crypto.randomUUID()` sin prefijo identificable como demo.
- Validación server-side V1–V10 antes de procesar.
- Rate limiting por IP conectado (SEC-002).

### Verificación en gates

| Gate | Qué verificar |
|------|---------------|
| `no_mock_data_in_production` | Ausencia de fixtures/placeholders en rutas productivas |
| `security_pass` | Sin respuestas simuladas en handler |
| QA estático | Búsqueda de `demo-`, `mock`, `fake` en código de contacto |

### Coherencia plan → implementación

La mitigación R-001 del plan debe reflejarse en ambos repos (WEB + Back) antes del merge.

## Ejemplo

- Frontend: UI contacto en `main` sin fallback demo
- Backend: `novus-contact-handler` con UUID real y rate limit activo

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Recomendación: KB-006 en `artifacts/recomendaciones-kb.json`
- Patrón exitoso: PAT-003 (mitigación R-001) en `artifacts/recomendaciones-kb.json`
