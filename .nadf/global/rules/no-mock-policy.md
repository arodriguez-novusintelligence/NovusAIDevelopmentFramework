# Política de no-mocks en producción

## Principio

El código desplegado en entornos de QA y producción debe operar con **datos reales** o **estructuras vacías legítimas**. Los datos simulados, placeholders y fixtures están **prohibidos** en rutas y componentes productivos.

## Definiciones

| Término | Definición | Permitido en prod |
|---------|------------|-------------------|
| Mock data | Datos ficticios que simulan respuestas de API o contenido | **No** |
| Placeholder | Texto temporal como "Lorem ipsum", "TODO", "TBD" | **No** |
| Fixture | Archivos JSON/JS con datos de prueba embebidos | **No** |
| Empty state | UI legítima cuando no hay datos reales (ej: "No hay resultados") | **Sí** |
| Loading state | Indicador de carga mientras se obtienen datos reales | **Sí** |
| Dev-only mock | Mock explícitamente limitado a entorno de desarrollo local | Solo dev local |

## Reglas

### 1. Prohibición en producción

- Ningún componente renderizado en rutas productivas puede contener:
  - Arrays hardcodeados de datos ficticios presentados como reales
  - Texto placeholder (lorem ipsum, "example@email.com", "John Doe")
  - Imágenes placeholder (via.placeholder.com, picsum.photos en prod)
  - Comentarios `// TODO: replace with real data` en código productivo

### 2. Origen de Lovable

- Lovable frecuentemente incluye mock data para demostración visual.
- El Lovable Analyzer Agent debe **identificar y marcar** mock data detectado en `riesgos.md`.
- El Frontend Integration Agent debe **reemplazar** mock data con:
  - Contenido real proporcionado en memoria del proyecto (brand-context, business-context)
  - Estructuras vacías legítimas (empty states)
  - Integración con APIs reales (cuando backend esté disponible)

### 3. Excepción: desarrollo local

- En entorno de desarrollo local, mocks están permitidos **solo si**:
  - Están claramente marcados (ej: variable `IS_DEV`, archivo en carpeta `__mocks__/`)
  - No son importados en rutas de producción
  - Están documentados en technical-context.md

### 4. Validación QA

- El QA Agent ejecuta escaneo de patrones mock en código modificado:
  - Palabras clave: `mock`, `fake`, `dummy`, `placeholder`, `lorem`, `TODO: replace`
  - URLs de placeholder: `placeholder`, `picsum`, `dummyimage`
  - Datos hardcodeados sospechosos en componentes de página
- Gate: `no_mock_data_in_production` — **bloqueante**

### 5. Contenido estático legítimo

- Contenido estático real (textos de marketing, descripciones de servicios, información de contacto) **no es mock**.
- Debe provenir de la memoria del proyecto o ser proporcionado explícitamente.
- Debe documentarse en brand-context.md o business-context.md.

## Flujo de detección

```
Lovable (puede tener mocks)
    → Lovable Analyzer (marca mocks en riesgos.md)
    → Frontend Integration (reemplaza con contenido real)
    → QA Agent (valida ausencia de mocks)
    → PASS / FAIL
```

## Acciones ante violación

| Situación | Acción |
|-----------|--------|
| Mock detectado en QA | Bloquear workflow, reportar archivos afectados |
| Placeholder en contenido | Solicitar contenido real al contexto del proyecto |
| Mock heredado de Lovable | Reemplazar antes de implementar |

## Referencias

- Reglas generales: `general-rules.md`
- Integración Lovable: `docs/lovable-integration.md`
- QA Agent: `.claude/agents/qa-agent.md`
