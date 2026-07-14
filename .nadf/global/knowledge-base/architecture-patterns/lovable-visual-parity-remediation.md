# Patrón: Remediación paridad visual Lovable→Web

## Contexto

El gate `visual_exact_parity` compara capturas Playwright del sitio productivo contra referencia Lovable (novus-nexus) con pixelmatch. Umbral estricto: `maxDiffRatio ≤ 0.002`. QA estático no sustituye esta validación.

## Solución

### Metodología de remediación sistemática

1. **Tokens globales (P0)** — Alinear colores oklch (navy, cyan, púrpura), tipografías (Space Grotesk + Inter) y variables CSS.
2. **Layout estructural (P0)** — Header/footer 5 columnas; grids de pilares/soluciones/impacto según referencia.
3. **Copy y CTAs (P0)** — Strings exactos (p. ej. 'Agendar una demo' vs 'Solicita'); hero con componente demo NADF.
4. **Por ruta** — Remediar `/`, `/about`, `/services`, `/contact` × 3 viewports (desktop, tablet, mobile).
5. **Re-ejecutar checker** — 12 capturas totales antes de considerar PASS.

### Gaps P0 identificados (novus-intelligence)

| ID | Ámbito | Descripción |
|----|--------|-------------|
| VP-GLOBAL-01 | Tokens | oklch navy/cyan/púrpura, Space Grotesk+Inter |
| VP-GLOBAL-02 | Layout | Header/footer 5-col, CTA 'Agendar una demo' |
| VP-HOME-01 | Home | Hero con NovusDevFrameworkDemo, stats inline |
| VP-HOME-02 | Home | Grids pilares/soluciones/impacto |
| VP-ABOUT-01 | About | Diff 6–12% en contenido y layout |
| VP-SERVICES-01 | Services | Diff en secciones de servicios |
| VP-CONTACT-01 | Contact | Paridad formulario y layout |
| VP-RESPONSIVE-01 | Global | Breakpoints y comportamiento móvil |

### Herramientas

- Playwright para capturas
- pixelmatch para diff
- `gaps-paridad.json` como backlog de remediación

## Ejemplo

- Primera corrida: 0/12 PASS, maxDiffRatio 0.234509 (umbral 0.002)
- Fuente de gaps: `artifacts/gaps-paridad.json`

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Recomendación: KB-009 en `artifacts/recomendaciones-kb.json`
- Anti-patrón: ANTI-002, ANTI-005 en `artifacts/recomendaciones-kb.json`
- ADR pendiente: ADR-REC-003 (umbral y metodología)
