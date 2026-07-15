# Patrón: Mapeo tokens oklch Lovable a CSS productivo sin copia

## Contexto

Workflows `lovable-to-web` donde el prototipo Lovable (`novus-nexus`) define design tokens en espacio de color **oklch** (`--gradient-brand`, `navy-deep`, `shadow-glow`, etc.) y el stack productivo (React + Tailwind + Vite) requiere variables CSS equivalentes sin copiar `styles.css` literal de Lovable.

Aplica cuando el gate `visual_exact_parity` (ADR-0006) está habilitado y el umbral `threshold_max_diff_ratio` es estricto (p. ej. 0,002).

## Solución

1. **Preferir oklch nativo en CSS productivo.** Definir tokens en `index.css` con `oklch()` directamente, mapeando desde `reglasDiseno/tokens.yml` o la intención documentada en planning — no desde archivos CSS de novus-nexus.
2. **Si se usa HSL/Tailwind, validar pixel-a-pixel.** Conversiones aproximadas HSL de valores oklch producen diff masivo en gradientes, CTA y fondos aunque la semántica sea correcta.
3. **Captura piloto antes de layout completo.** Tras definir tokens en Fase 0, ejecutar `visual-parity-check` en `/` @ 390×844; si `maxDiffRatio > 0.002`, corregir antes de continuar.
4. **Tabla de conversión verificada.** Si HSL es obligatorio por tooling, documentar cada conversión con evidencia de captura, no estimaciones manuales.

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-15):
- Gap **VP-GAP-TOKENS** afectó las 4 rutas gate (`/`, `/about`, `/services`, `/contact`).
- `maxDiffRatio` global 0,096091; tokens oklch vs HSL aproximado identificado como causa raíz.
- Evidencia: `artifacts/gaps-paridad.json`, `artifacts/informe-paridad-visual.md`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006 (paridad visual y auto-deploy DEV)
- `architecture-patterns/visual-parity-pre-merge-checklist.md`
- `common-errors/VP-GAP-HERO-MOBILE.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | ANTI-001, KB-008 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
