<!-- NADF-GUIDE
Propósito: Documenta Reglas de impacto backend — Novus Intelligence Solutions.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Reglas de impacto backend — Novus Intelligence Solutions

Reglas específicas para evaluación e implementación backend en `NovusIntelligenceBack`.

## Stack backend

| Tecnología | Uso |
|------------|-----|
| Serverless Framework | IaC y despliegue |
| Node.js 20 | Runtime Lambda |
| TypeScript | Lenguaje |
| AWS Lambda | Compute |
| API Gateway | REST API |
| DynamoDB | Base de datos (si aplica) |
| S3 | Almacenamiento (si aplica) |
| SES | Email (si aplica) |

## Cuándo evaluar backend

| Funcionalidad frontend | Requiere backend | Servicio |
|------------------------|------------------|----------|
| Formulario de contacto | Sí | API + SES |
| Landing estática | No | — |
| Sección servicios estática | No | — |
| Perfil de empresa estático | No | — |
| Blog / CMS | Sí (futuro) | API + DynamoDB |
| Autenticación | Sí (futuro) | API + Cognito |

## Alcance inicial (Fase 1)

En la fase inicial, el único endpoint backend esperado es:

### POST /contact

- **Propósito:** Recibir datos del formulario de contacto
- **Input:** `{ name, email, company, message }`
- **Acción:** Enviar email via SES al destinatario configurado
- **Validación:** Campos requeridos, formato email, sanitización
- **Respuesta:** `{ success: boolean, message: string }`

## Convenciones API

- RESTful, JSON request/response
- Códigos HTTP estándar (200, 400, 500)
- Validación de input en handler
- Errores con mensajes descriptivos (sin stack traces al cliente)
- CORS configurado para dominios del frontend

## Reglas de evaluación

1. Evaluar **cada cambio funcional** del Lovable Analyzer.
2. Si no requiere backend, documentar justificación en `evaluacion-backend.md`.
3. Si requiere backend, generar `especificacion-backend.md` con:
   - Endpoints necesarios
   - Modelo de datos
   - Servicios cloud requeridos
   - Estimación de complejidad
4. **No implementar** backend en Fase 1 del framework — solo especificar.
5. Respetar independencia de proveedor en diseño de APIs.

## Prohibiciones

- No desplegar a ningún entorno
- No crear secrets ni API keys
- No hardcodear credenciales AWS
- No acoplar lógica de negocio a features propietarias de DynamoDB

## Referencias

- Agente: `.claude/agents/backend-impact-agent.md`
- Contexto técnico: `memory/technical-context.md`
- Entornos: `environments/`
- Independencia proveedor: `.nadf/global/rules/provider-independence.md`
