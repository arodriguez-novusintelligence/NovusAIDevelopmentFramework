<!-- NADF-GUIDE
Propósito: Documenta Informe final — Ola 1 + Ola 2.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Informe final — Ola 1 + Ola 2

Fecha: 2026-07-17

## Estado

- Ola 1 (fundación): PASS.
- Ola 2 (demos locales, reporter y paralelo): PASS.
- Deploy AWS DEV: SKIPPED por diseño seguro. La sesión tiene credenciales de
  usuario IAM, no el rol OIDC requerido, y SAM CLI no está instalado.
- Deploy PROD: FORBIDDEN.

## Evidencia ejecutada

- Validator NADF: 0 warnings, 0 errors.
- Sample 1: 2 unit tests PASS.
- Sample 2: 2 unit tests PASS.
- Reporter: PASS para `sample1-dry-run-001` y `sample2-dry-run-001`.
- Orquestador fan-out/fan-in: 8 nodos PASS, `maxConcurrency=3`.
- HTML Enterprise: 11 páginas generadas.

## Estructura resultante

```text
enterprise-governance/       approval, RACI, budget, agent-selection
docs/md/                     documentación canónica
docs/html/                   versión navegable generada
examples/sample1-app/        app demo GitHub Issue → AWS DEV
examples/sample1-github-issues/
examples/sample2-manual-aws/ Lambda + DynamoDB
tools/nadf-output-reporter/
tools/nadf-parallel-orchestrator/
.nadf/projects/sample1-github-issues/
.nadf/projects/sample2-manual-aws/
```

## Para completar deploy real

1. Crear rol OIDC `nadf-sample-dev-deploy`.
2. Configurar `AWS_ROLE_ARN` en environment GitHub `dev`.
3. Revisar permisos mínimos sobre stacks `sample1-*` y `sample2-*`.
4. Ejecutar workflow `NADF samples DEV`, primero sample1 y luego sample2.
5. Registrar URLs y métricas en output. No usar keys de usuario.
