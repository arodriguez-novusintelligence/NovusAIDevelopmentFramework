# Patrón: Validación responsive/SEO sin browser automation

## Contexto

En runtime Cursor Cloud Agent (M6) sin browser automation disponible, qa-agent debe validar responsive design y SEO básico mediante análisis estático del código fuente.

## Solución

### Checklist de análisis estático

| Dimensión | Qué verificar en código | Evidencia |
|-----------|------------------------|-----------|
| Responsive | Clases Tailwind `sm:`, `md:`, `lg:` en layouts críticos | `informe-qa.md` |
| Menú móvil | Componente hamburger/drawer con breakpoint | Código Header/Nav |
| Accesibilidad motion | `prefers-reduced-motion` en animaciones | CSS/Tailwind |
| SEO — h1 | Un `<h1>` por página en componentes Page | Análisis por ruta |
| SEO — meta | `PageMetaTags` con `title`, `description`, `og:*` | Helmet por página |

### Declaración de limitación

En `qa-result.json`, marcar explícitamente:

```json
{
  "method": "static_code_review",
  "browserAutomation": false,
  "limitations": ["No viewport rendering", "No Lighthouse score"]
}
```

Esto evita confundir PASS estático con validación visual pixel-a-pixel (responsabilidad de visual-parity-agent).

## Ejemplo

- novus-intelligence: QA PASS (qualityScore 100) con método estático
- Paridad visual: FAIL independiente (0/12 capturas) — dimensiones distintas

## Proyectos donde se usa

- novus-intelligence

## Referencias

- Recomendación: KB-007 en `artifacts/recomendaciones-kb.json`
- Patrón: PAT-006 (gate paridad visual independiente)
