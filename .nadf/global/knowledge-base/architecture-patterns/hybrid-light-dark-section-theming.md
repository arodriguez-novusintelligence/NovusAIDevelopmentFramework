# Patrón: Tema híbrido claro/oscuro por sección

## Contexto

Prototipos Lovable con design system dark-first que **alternan** secciones oscuras y claras en la misma página. Aplicar tema oscuro uniforme en toda la página genera diffs severos en el gate `visual_exact_parity`.

## Solución

1. **Identificar en planning** rutas con alternancia claro/oscuro; no asumir dark-first global.
2. **Definir tokens por sección** en Tailwind/design system:
   - `gradient-hero` / fondo oscuro para hero.
   - `surface/light`, `bg-white`, `bg-gray-50` para secciones post-hero.
   - Cards blancas con `shadow` en formularios sobre fondo claro.
3. **Mapear secciones** contra `cambios-lovable.json` y `memory/brand-context.md` antes de implementar.

### Rutas típicas híbridas (novus-intelligence)

| Ruta | Sección oscura | Sección clara |
|------|----------------|---------------|
| `/contact` | Hero con gradient-hero | Zona formulario + info cards (fondo blanco) |
| `/` (landing) | Hero, Solutions (parcial) | Testimonios «Clientes que confían» (fondo blanco/gris) |

## Ejemplo

GAP-P0-002 en `/contact` (390×844): diff 42–45 % por tema oscuro continuo vs referencia Lovable con formulario en fondo claro.
- Evidencia: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`.
- Mitigación: `ContactPage` con hero oscuro + sección post-hero `bg-surface-light`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Workflow improvement WF-004 (checklist tema híbrido en planning)
- `.nadf/projects/novus-intelligence/memory/brand-context.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-009, ANTI-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
