<!-- NADF-GUIDE
Propósito: Documenta Reglas de integración Lovable — Novus Intelligence Solutions.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Reglas de integración Lovable — Novus Intelligence Solutions

Reglas específicas del proyecto para la interacción con la fuente de diseño Lovable (`novus-nexus`).

## Principio fundamental

Lovable define **cómo debe verse y comportarse** el sitio. NovusIntelligenceWEB define **cómo se implementa** en producción. Nunca son intercambiables.

## Reglas de análisis

1. Analizar **todos** los cambios en `novus-nexus` antes de implementar.
2. Clasificar cada cambio: visual, funcional, contenido o estructural.
3. Marcar mock data detectado en Lovable como riesgo en `riesgos.md`.
4. Documentar tokens de diseño (colores, tipografía) como referencia, no como CSS literal.

## Reglas de traducción

1. **Prohibido** copiar JSX, CSS, imports o dependencias de Lovable.
2. Usar componentes existentes de NovusIntelligenceWEB siempre que sea posible.
3. Contenido textual debe provenir de `memory/brand-context.md` o `memory/business-context.md`.
4. Imágenes deben usar assets reales del proyecto, no placeholders de Lovable.
5. Formularios deben conectarse a APIs reales o mostrar empty states legítimos.

## Alcance inicial del sitio

Los cambios Lovable deben mapearse a estas secciones:

| Sección Lovable | Página/Ruta WEB | Prioridad |
|-----------------|-----------------|-----------|
| Landing / Hero | `/` | Alta |
| Perfil de empresa | `/about` o sección en `/` | Alta |
| Servicios | `/services` o sección en `/` | Alta |
| Formulario de contacto | `/contact` o sección en `/` | Alta |
| Call to action | Componente reutilizable | Media |
| Footer / Header | Layout compartido | Alta |

## Frecuencia de sincronización

- Ejecutar `novus-lovable-sync` tras cada cambio significativo en Lovable.
- Cambios menores de contenido pueden agruparse en una sola sincronización.

## Referencias

- Integración global: `docs/lovable-integration.md`
- Agente: `.claude/agents/lovable-analyzer-agent.md`
- Política no-mock: `.nadf/global/rules/no-mock-policy.md`
