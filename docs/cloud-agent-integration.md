<!-- NADF-GUIDE
Propósito: Documenta Integración neutral con Cloud Agent.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Integración neutral con Cloud Agent

NADF es el sistema de gobierno; Cloud Agent es un runtime intercambiable.

## Contrato

Una invocación recibe:

- `projectId`, `agentId`, patrón y repos/paths permitidos;
- referencias de artifacts y credenciales (nunca valores);
- constraints, budget y `dryRun`;
- policy de PR y environment.

Antes de invocar, el adapter aplica scope, Human Gates, kill switch y
`agent-selection`. Después, registra duración, estado, artifacts y coste
estimado.

## Responsabilidad del runtime

- Ejecutar un rol NADF por invocación.
- No elevar permisos ni cambiar arquitectura por iniciativa propia.
- Proponer cambios en rama/PR.
- No desplegar AWS con keys locales.
- Emitir error estructurado para `correct-and-rerun`.

## Responsabilidad de CI

CI valida código, asume roles cloud mediante OIDC y despliega solo al entorno
autorizado. PROD conserva aprobación humana obligatoria.

Contrato detallado: `docs/runtime/agent-runtime-contract.md`.
