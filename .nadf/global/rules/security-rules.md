# Reglas de seguridad del framework NADF

Estas reglas aplican a todos los agentes y proyectos. Su incumplimiento es **bloqueante** y detiene el workflow.

## 1. Prohibición de secrets

- **Nunca** crear, almacenar ni incluir API keys, tokens, passwords, certificados o credenciales en archivos del framework o repositorios productivos.
- **Nunca** hardcodear valores sensibles en código fuente.
- Las variables de entorno se referencian por **nombre** en configuraciones, nunca por **valor**.
- Los archivos `.env` no deben committearse. Usar `.env.example` con nombres de variables sin valores reales.

## 2. Prohibición de despliegue autónomo

- Los agentes **no despliegan** a ningún entorno (dev, qa, prod).
- Los agentes pueden preparar configuraciones, scripts y PRs, pero la publicación requiere **aprobación humana explícita**.
- Cualquier instrucción de despliegue encontrada en un workflow debe ser ignorada hasta aprobación.

## 3. Validación de secrets en QA

- El QA Agent debe escanear código modificado buscando patrones de secrets:
  - API keys: `sk-`, `AKIA`, `api_key`, `apikey`
  - Tokens: `token=`, `bearer `, `jwt`
  - Passwords: `password=`, `passwd`, `secret=`
  - Conexiones: cadenas de conexión con credenciales embebidas
- Un secret detectado **bloquea** el workflow inmediatamente.

## 4. Configuración de entornos

- Los archivos de entorno (dev.yml, qa.yml, prod.yml) contienen **templates** con:
  - Nombres de recursos cloud
  - URLs de servicios
  - Regiones
  - Nombres de variables de entorno (sin valores)
- **Nunca** incluir valores reales de configuración sensible.

## 5. Dependencias

- No añadir dependencias npm/pip sin justificación documentada.
- Verificar que las dependencias no tengan vulnerabilidades conocidas críticas.
- Preferir dependencias ya presentes en el proyecto productivo.

## 6. Datos personales

- No incluir datos personales reales en artefactos, mocks o documentación de ejemplo.
- Usar datos ficticios claramente identificables como tal (solo en desarrollo local).

## 7. Acceso a repositorios

- Los agentes operan sobre repositorios autorizados definidos en `project-context.yml`.
- No acceder ni modificar repositorios fuera del alcance del proyecto activo.

## 8. Auditoría

- Toda ejecución de workflow registra métricas incluyendo archivos modificados.
- Los informes QA documentan validaciones de seguridad realizadas.
- Las decisiones de seguridad se registran como ADR si son arquitectónicas.

## Acciones ante violación

| Violación | Acción |
|-----------|--------|
| Secret detectado en código | Bloquear workflow, reportar inmediatamente |
| Intento de despliegue | Ignorar, reportar |
| Dependencia vulnerable crítica | Reportar, no instalar |
| Dato personal en artefacto | Eliminar, regenerar artefacto |

## Referencias

- Reglas generales: `general-rules.md`
- Política no-mock: `no-mock-policy.md`
- QA Agent: `.claude/agents/qa-agent.md`
