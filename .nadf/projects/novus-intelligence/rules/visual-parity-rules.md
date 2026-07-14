# Reglas de paridad visual — novus-intelligence

## Objetivo

El frontend productivo debe verse **exactamente igual** a la intención visual de Lovable en las rutas y viewports definidos, usando **código propio** (React/TS/Tailwind del design system productivo). Prohibido copiar código Lovable.

## Umbral (exacto)

| Parámetro | Valor |
|-----------|-------|
| `thresholdMaxDiffRatio` | `0.002` (0.2% de píxeles distintos por captura) |
| Viewports | `1440x900` (desktop), `768x1024` (tablet), `390x844` (móvil) |
| Rutas | `/`, `/about`, `/services`, `/contact` |
| Anti-aliasing | Permitido; se usa umbral de color por píxel ≤ 16 en RGB |

Cualquier ruta/viewport por encima del umbral → **FAIL** del gate `visual_exact_parity`.

## Qué se mide

1. Layout y grid (posición de secciones, hero, footer)
2. Tipografía (familia, peso, tamaño, line-height aparente)
3. Color (fondos, textos, acentos)
4. Espaciado y alineación
5. Componentes CTA / formularios (estructura visual)
6. Breakpoints responsive

## Qué NO cuenta como “diferencia aceptable”

- “El design system productivo usa otras fuentes” → **no** exime; hay que igualar tipografía/espaciado
- Animaciones pequeñas → freeze CSS animations / `prefers-reduced-motion` en captura
- Contenido dinámico (fecha/hora) → enmascarar selectores en el checker

## Flujo de remediación

1. `visual-parity-agent` genera `gaps-paridad.json`
2. `frontend-integration-agent` re-trabaja **solo** gaps P0/P1
3. Re-ejecutar checker
4. Solo con `status: PASS` → merge + deploy DEV automático

## URLs

| Rol | Variable / default |
|-----|--------------------|
| Referencia Lovable | `NADF_LOVABLE_REFERENCE_URL` (preview o build de novus-nexus) |
| Candidato productivo DEV | `NADF_DEV_FRONTEND_URL` = `https://d1bfu6klutpp8m.cloudfront.net` |

## Relación con no_lovable_code_copy

- Paridad exacta = resultado visual, **no** igualdad de código fuente.
- Se permite inspeccionar Lovable (estructura, tokens, spacing) como referencia.
- Se prohíbe pegar componentes/CSS/JSX de Lovable en WEB/Back.
