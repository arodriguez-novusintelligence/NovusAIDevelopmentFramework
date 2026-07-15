# Error: VP-GAP-CONTACT-LAYOUT

## Síntoma

Gate `visual_exact_parity` falla en ruta `/contact` con diff hasta **6,1 %** en viewport 390×844. Grid 2-columnas formulario/sidebar desalineado respecto a referencia Lovable en desktop, tablet y móvil.

## Causa

Desalineación en `ContactPage.tsx`: ratio de columnas, padding de cards (contacto, horario, partner), alturas de inputs, ancho del formulario y espaciado entre secciones.

## Solución

1. Igualar grid 2-col y breakpoints con referencia Lovable en los 3 viewports gate (1440×900, 768×1024, 390×844).
2. Ajustar padding interno de cards y altura consistente de inputs/select.
3. Validar `/contact` en las 3 capturas tras cada iteración.
4. Coordinar con **VP-GAP-TOKENS** si colores de cards amplifican el diff.

## Prevención

1. Incluir `/contact` en checklist pre-merge (no solo landing).
2. Verificar layout contacto tras cambios globales de tokens o tipografía.
3. Ejecutar visual-parity-agent antes de merge cuando `visual_parity.enabled: true`.

## Evidencia

- Workflow: novus-intelligence-lovable-to-web
- Artefactos: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`
- Agente responsable corrección: frontend-integration-agent
- Prioridad: P0

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | VP-001, KB-012 |
| Severidad | high |
| Gate bloqueante | visual_exact_parity |
| Fecha | 2026-07-15 |
