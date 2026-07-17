<!-- NADF-GUIDE
Propósito: Documenta Reglas QA — Novus Intelligence Solutions.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Reglas QA — Novus Intelligence Solutions

Reglas específicas de validación de calidad para el proyecto Novus Intelligence Solutions.

## Quality gates del proyecto

| Gate | Bloqueante | Descripción |
|------|------------|-------------|
| `no_lovable_code_copy` | Sí | Sin código copiado de Lovable |
| `no_mock_data_in_production` | Sí | Sin mocks en rutas productivas |
| `build_success` | Sí | Build frontend sin errores |
| `responsive_validation` | Sí | Diseño responsive en 3 breakpoints |
| `seo_basic_validation` | No | Meta tags, headings, alt texts |

## Validaciones específicas

### Build

```bash
cd NovusIntelligenceWEB && npm run build
```

- Debe completar sin errores
- Warnings aceptables si no afectan funcionalidad

### Lint

```bash
cd NovusIntelligenceWEB && npm run lint
```

- Cero errores de lint
- Warnings documentados si existen

### Responsive

Verificar en breakpoints:

| Breakpoint | Ancho | Verificaciones |
|------------|-------|----------------|
| Mobile | 375px | Sin overflow, navegación accesible, CTAs visibles |
| Tablet | 768px | Layout adaptado, imágenes proporcionales |
| Desktop | 1280px | Layout completo, espaciado correcto |

### No mocks

Patrones a detectar en archivos modificados:

- `mock`, `fake`, `dummy`, `placeholder`
- `lorem ipsum`, `TODO: replace`
- URLs: `placeholder`, `picsum`, `dummyimage`
- Arrays hardcodeados presentados como datos reales

### No secrets

Patrones a detectar:

- `sk-`, `AKIA`, `api_key`, `apikey`
- `password=`, `secret=`, `token=`
- Cadenas de conexión con credenciales

### SEO básico

Por cada página modificada:

- [ ] `<title>` presente y descriptivo (50-60 caracteres)
- [ ] `<meta name="description">` presente (150-160 caracteres)
- [ ] Un solo `<h1>` por página
- [ ] Jerarquía h2/h3 coherente
- [ ] `alt` en imágenes

## Cálculo de qualityScore

```
qualityScore = (gates_passed / gates_total) * 100
```

Gates bloqueantes fallidos → qualityScore = 0 y workflow bloqueado.

## Informe

Generar siempre:

- `artifacts/informe-qa.md` — Informe legible
- `artifacts/qa-result.json` — Resultado estructurado

## Referencias

- Agente: `.claude/agents/qa-agent.md`
- Quality gates: `project-context.yml`
- Política no-mock: `.nadf/global/rules/no-mock-policy.md`
