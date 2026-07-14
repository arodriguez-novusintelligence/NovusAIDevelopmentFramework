# Patrón: Checklist de remediación de paridad visual Lovable→Web

## Contexto

Workflows `lovable-to-web` donde `visual-parity-agent` reporta FAIL en gate `visual_exact_parity` (ADR-0006). Aplica cuando la reimplementación funcional pasa QA estático pero difiere sistemáticamente del prototipo Lovable en copy, layout, tokens o componentes.

## Solución

Remediar **sin copiar CSS/JSX literal de novus-nexus**. Usar `gaps-paridad.json` como checklist obligatorio, priorizando P0 antes de P1:

| # | Gap ID | Componente | Acción |
|---|--------|------------|--------|
| 1 | GAP-GLOBAL-TOKENS | DesignTokens | Refinar tokens oklch: `shadow-glow`, `shadow-card`, `grid-bg`, gradientes y tipografía |
| 2 | GAP-GLOBAL-HEADER | Header | Logo «NOVUS INTELLIGENCE», underline gradiente en nav activo |
| 3 | GAP-GLOBAL-FOOTER | Footer | 5 columnas (Servicios, Soluciones, Contacto) + tagline «BUILDING AUTONOMOUS INTELLIGENCE» |
| 4 | GAP-HOME-HERO | Hero | Overline, headline completo, CTA «Ver simulación», visual de marca |
| 5 | GAP-HOME-PARTNERS | PartnersBanner | Logos AWS/Azure/GCP con badges, no texto plano |
| 6 | GAP-HOME-SERVICES-GRID | ServicesGrid | Título «Cinco capacidades…», layout 5-col desktop |
| 7 | GAP-HOME-SOLUTIONS-GRID | SolutionsGrid | Título «Inteligencia aplicada…», iconografía y enlaces «EXPLORAR →» |
| 8 | GAP-HOME-IMPACT | ImpactStats | 4 bloques icono+título (Productividad, Costos, Calidad, Escalabilidad) |
| 9 | GAP-HOME-TESTIMONIALS | Testimonials | Fondo blanco, cards con logos de clientes |
| 10 | GAP-HOME-CTA | CTA | Headline gradiente, botones «Agenda una demo» + «Explorar soluciones» |
| 11 | GAP-ABOUT-HERO-VALUES | AboutPage | Hero + 3 cards Misión/Visión/Valores |
| 12 | GAP-SERVICES-PAGE | ServicesPage | Hero, grid 5 pilares, espaciado y tipografía |
| 13 | GAP-CONTACT-SIDEBAR | ContactPage | 3 cards laterales (Datos, Horario, Partner AWS), ratio 1:1.4 |

Tras cada ciclo de remediación, re-ejecutar `visual-parity-agent` hasta `diff_ratio ≤ 0.002` en las 12 capturas (4 rutas × 3 viewports).

## Ejemplo

Primera corrida novus-intelligence (2026-07-14):
- 0/12 capturas PASS; `maxDiffRatio: 0.234509` (117× sobre umbral 0.002).
- 13 gaps documentados en `gaps-paridad.json`.
- Evidencia: `artifacts/informe-paridad-visual.md`, `artifacts/visual-parity-result.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- ADR-0006 (visual parity y auto-deploy DEV)
- `.nadf/projects/novus-intelligence/project-context.yml` → `visual_parity`

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-001, ANTI-002, VP-001 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
