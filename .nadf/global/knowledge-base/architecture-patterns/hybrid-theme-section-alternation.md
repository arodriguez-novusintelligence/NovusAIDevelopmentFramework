# Patrón: Alternancia tema claro/oscuro por sección en sitios híbridos

## Contexto

Prototipos Lovable con design system **dark-first** que incluyen secciones con fondo claro (formularios, testimonios, cards blancas) dentro de un sitio predominantemente oscuro. Aplica en workflows `lovable-to-web` cuando el gate `visual_exact_parity` evalúa rutas con alternancia de tema.

## Solución

1. **Mapear por ruta** qué secciones requieren fondo claro vs oscuro antes de definir tokens globales. Documentar en `frontend-impact.md` o plan de implementación:

| Ruta | Sección | Tema esperado |
|------|---------|---------------|
| `/contact` | Formulario de contacto | Fondo claro (surface-light) |
| `/` | Testimonios | Bloque claro con cards blancas |
| `/` | Hero, CTA, footer | Dark-first (surface-dark) |

2. **No aplicar dark-first global** a todas las secciones. Usar tokens semánticos diferenciados:
   - `surface-dark`, `surface-light`, `card-light`, `text-on-light`
3. **Validar en rutas gate** del visual-parity-agent antes de declarar design system completo.

## Ejemplo

Corrida novus-intelligence (2026-07-15):
- GAP-P0-002: `/contact` implementado con fondo oscuro global vs referencia Lovable con sección formulario clara → diff >40 %.
- GAP-P0-003: bloque testimonios con cards blancas ausente en landing.
- Evidencia: `artifacts/resumen-ejecucion.md`, `artifacts/resumen-metricas.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `artifacts/plan-implementacion.md` (CHG-002, R-005)
- ADR-0006

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-009, ANTI-006, GAP-P0-002, GAP-P0-003 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
