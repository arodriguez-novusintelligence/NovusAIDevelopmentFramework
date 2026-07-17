<!-- NADF-GUIDE
Propósito: Documenta Patrón: Validación en ramas feature multi-repo.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Patrón: Validación en ramas feature multi-repo

## Contexto

Workflows que modifican múltiples repositorios productivos (frontend + backend) manteniendo `main` en estado scaffold o estable. Aplica cuando QA y Security deben evaluar código sin merge prematuro.

## Solución

1. Implementar en ramas `cursor/*` por repositorio (p. ej. `cursor/implement-novus-frontend-2d22`, `cursor/implement-contact-api-04c8`).
2. Publicar artefactos de resumen en el Blackboard del Framework antes de activar Validation.
3. Ejecutar qa-agent y security-agent contra las ramas feature, no contra `main`.
4. Merge a `main` solo tras gates PASS y aprobación de reviewer-agent.

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- 2 ramas productivas pendientes de merge.
- QA y Security evaluaron código en feature branches sin contaminar scaffold.
- Evidencia: `artifacts/qa-result.json`, `artifacts/security-result.json`.

## Proyectos donde se usa

- novus-intelligence

## Metadatos

| Campo | Valor |
|-------|-------|
| ID reflexión | PAT-005 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
