# Patrón: Mapeo tokens oklch Lovable a CSS productivo sin copia

## Contexto

Workflows `lovable-to-web` donde el prototipo Lovable (`novus-nexus`) define design tokens en espacio de color **oklch** (`--gradient-brand`, `--gradient-text`, `--gradient-hero`, `--navy-*`, etc.) y el stack productivo (React + Tailwind + Vite) requiere variables CSS equivalentes sin copiar `styles.css` literal de Lovable.

Aplica cuando el gate `visual_exact_parity` (ADR-0006) está habilitado y el umbral `threshold_max_diff_ratio` es estricto (p. ej. 0,002).

## Solución

1. **Preferir oklch nativo en CSS productivo.** Definir tokens en `index.css` con `oklch()` directamente, mapeando desde la intención documentada en planning — no desde archivos CSS de novus-nexus.
2. **Si se usa HSL/Tailwind, validar pixel-a-pixel.** Conversiones aproximadas HSL de valores oklch producen drift acumulado en gradientes cyan→púrpura, CTA y fondos aunque la semántica sea correcta.
3. **Tokens prioritarios a mapear.** Extraer intención de `novus-nexus/src/styles.css`: `--primary`, `--secondary`, `--gradient-brand` (135deg cyan→púrpura), `--gradient-text`, `--gradient-hero`, `--navy-*`. Declarar en `NovusIntelligenceWEB/src/index.css` como `oklch()` o valores convertidos exactos. Ajustar `.text-gradient-brand`.
4. **Captura piloto tras Fase 0.** Ejecutar `visual-parity-check` en `/` @ 390×844; si `maxDiffRatio > 0.002`, corregir tokens antes de layout completo.

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-16):
- Gap **VP-GAP-001** afectó las 4 rutas gate (`/`, `/about`, `/services`, `/contact`).
- `maxDiffRatio` global 0,096091; tokens HSL aproximados vs oklch identificados como causa raíz.
- Evidencia: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006 (paridad visual y auto-deploy DEV)
- `architecture-patterns/visual-parity-remediation-order.md`
- `common-errors/VP-001-visual-parity-without-checker.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-VP-002, KB-008 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-16 |
