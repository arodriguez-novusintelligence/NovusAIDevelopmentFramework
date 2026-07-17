<!-- NADF-GUIDE
Propósito: Documenta Patrón: Reimplementación Lovable → Web sin copia directa.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Patrón: Reimplementación Lovable → Web sin copia directa

## Contexto

Workflows `lovable-to-web` que traducen intención visual y funcional de un prototipo Lovable (`novus-nexus`) al stack productivo (React + TypeScript + Tailwind + React Router + Vite). Aplica cuando `design_source.role` es `visual_and_functional_intent_only` y el gate `no_lovable_code_copy` es bloqueante.

## Solución

1. **Plan approved antes de código productivo.** Completar Planning → Plan Review con `status: approved` del architect-agent. Cada fase de ejecución mapea a tareas con IDs CHG-xxx verificables.
2. **Reimplementar, no importar.** Traducir layout, rutas, design system y componentes interactivos con implementación propia. Verificar ausencia de imports y código literal de Lovable en gates QA y Security.
3. **Mitigar riesgos anti-mock desde diseño.** Especificar en planning (p. ej. R-001) y verificar en validation:
   - Frontend: `submitContact()` retorna error explícito sin `VITE_NOVUS_API_URL`.
   - Backend: `randomUUID()` para `requestId` sin prefijo `demo-`.
   - `VITE_DEMO_MODE` solo en `.env.example`, nunca en lógica productiva.

## Ejemplo

Primera corrida **novus-intelligence-lovable-to-web** (2026-07-14):
- 10 rutas, design system dark-first, `MultiAgentDemo` lazy-loaded.
- Gates `no_lovable_code_copy` y `no_mock_data_in_production` en PASS.
- Evidencia: `artifacts/resumen-frontend.md`, `artifacts/informe-qa.md`, `artifacts/informe-seguridad.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0003 (canonicalización Lovable→Web)
- `docs/lovable-integration.md`
- `.nadf/global/rules/general-rules.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | PAT-001, PAT-002, PAT-003, KB-006 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
