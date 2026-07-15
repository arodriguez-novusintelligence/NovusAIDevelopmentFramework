# Patrón: Gate visual_exact_parity independiente de gates técnicos

## Contexto

Workflows `lovable-to-web` con múltiples quality gates. Build, lint, seguridad y anti-mock pueden pasar mientras paridad visual falla al 100 %. El threshold 0.2 % (`maxDiffRatio ≤ 0.002`) es el gate más estricto y no se infiere de gates técnicos.

## Solución

1. **Orden de ejecución recomendado:**
   - Gates técnicos: `build_success`, `security_pass`, `no_mock_data_in_production`, `no_lovable_code_copy`.
   - Gate visual: `visual_exact_parity` (visual-parity-agent).
   - Revisión: reviewer-agent (solo tras paridad PASS).

2. **No declarar implementación completa** hasta paridad visual PASS, aunque QA y Security estén en PASS.

3. **Ejecución advisory temprana:** considerar visual-parity-agent tras Fase 1 (layout) para detectar gaps de tema y assets antes de contenido completo (WF-003).

4. **Documentar limitación de QA estático:** responsive/SEO por análisis de código no sustituye paridad visual pixel-a-pixel.

## Ejemplo

Corrida novus-intelligence (2026-07-15):
- QA re-validado: qualityScore 100 (build+lint PASS).
- Security re-validado: securityScore 89 (PASS).
- Paridad visual: 0/12 capturas PASS; maxDiffRatio 0.449 en `/contact` móvil.
- qualityScore global: 78 (8/9 gates bloqueantes PASS).
- Evidencia: `artifacts/metricas-ejecucion.json`, `artifacts/visual-parity-result.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006
- `architecture-patterns/static-qa-responsive-seo.md` (complementario, no sustituto)
- `.nadf/projects/novus-intelligence/rules/visual-parity-rules.md`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-012, ANTI-004 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-15 |
