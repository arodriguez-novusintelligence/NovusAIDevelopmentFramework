# NADF — reglas globales para agentes

Estas reglas aplican a cualquier Customer Distribution.

## Orden obligatorio

1. Cargar `.nadf/projects/<project>/project-context.yml`.
2. Normalizar la entrada a Requirement/Intent.
3. Verificar scope, Human Gates, budget y kill switch.
4. Planificar antes de modificar código.
5. Ejecutar solo agentes habilitados.
6. Validar QA y Security antes de merge.
7. Generar evidencia con `tools/nadf-output-reporter`.

## Invariantes

- Core y adapters no contienen datos de clientes.
- Cada proyecto escribe únicamente en sus repos/paths permitidos.
- Agentes no se autoaprueban.
- No secrets en código, prompts o artifacts.
- Cloud Agent no recibe AWS keys; CI despliega con OIDC.
- PROD siempre requiere Change Authority y nunca es automático.
- Un fallo preserva artifacts, bloquea dependientes y exige re-run.
- Planner no implementa; Executor no cambia arquitectura sin ADR.
- Lovable, GitHub Issues, Manual y Jira son fuentes reemplazables.

## Calidad

- Sin mocks en producción.
- Tests y linters proporcionales al cambio.
- Toda decisión arquitectónica se registra como ADR.
- Todo skip HIGH/BLOCKING requiere `riskAcknowledgements`.
- Budget y métricas separan coste del modelo, cloud y espera humana.

## Referencias

- `docs/md/09-aprobaciones-y-responsabilidades.md`
- `enterprise-governance/`
- `.nadf/global/workflow-library/`
- `docs/meta-model/specification.md`
