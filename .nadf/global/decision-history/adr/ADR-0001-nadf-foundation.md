<!-- NADF-GUIDE
Propósito: Documenta ADR-0001: Fundación del NovusAIDevelopmentFramework.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# ADR-0001: Fundación del NovusAIDevelopmentFramework

## Estado

Superseded by ADR-0002

> **Nota:** Este ADR documenta la fundación inicial de NADF (6 capas, 6 agentes). Fue reemplazado por ADR-0002, que introduce la arquitectura multiagente de 7 capas y 19 agentes. Las decisiones sobre separación Lovable/productivo permanecen vigentes.

## Fecha

2026-07-04

## Contexto

Novus Intelligence necesita automatizar el desarrollo de software utilizando agentes de IA. El primer proyecto es **Novus Intelligence Solutions**, un sitio web corporativo cuyo diseño se prototipa en Lovable (repositorio `novus-nexus`).

Surge la necesidad de definir un framework que:

- Separe claramente la intención de diseño del código productivo
- Goberne el comportamiento de los agentes IA con reglas explícitas
- Permita trazabilidad de decisiones y métricas de ejecución
- Sea extensible a futuros proyectos y proveedores de nube

## Decisión

Se crea el **NovusAIDevelopmentFramework (NADF)** con las siguientes decisiones fundamentales:

### 1. Separación Lovable / Implementación productiva

- **Lovable** (`novus-nexus`) es la fuente de **intención visual y funcional**.
- **NovusIntelligenceWEB** es la implementación productiva frontend (React + TypeScript + Tailwind).
- **NovusIntelligenceBack** es la implementación productiva backend (Serverless Framework + Node.js 20 + AWS).
- Está **prohibido** copiar código de Lovable directamente a repositorios productivos.

### 2. Arquitectura en capas

El framework se organiza en 6 capas:

1. Design Source Layer (Lovable)
2. Source Control Layer (repositorios productivos + framework)
3. Intelligence Layer (modelos IA, multi-proveedor)
4. Agent Layer (agentes especializados)
5. Execution Layer (workflows, commands, artifacts)
6. Runtime Layer (AWS inicial, multi-proveedor futuro)

### 3. Agentes especializados

Se definen 6 agentes iniciales con roles acotados:

- Framework Architect
- Lovable Analyzer
- Frontend Integration
- Backend Impact
- QA
- Documentation

### 4. Workflows declarativos

Los flujos de trabajo se definen en YAML (workflow-library global + workflows por proyecto), no en código imperativo.

### 5. Quality gates obligatorios

Todo cambio debe pasar gates de calidad antes de considerarse completado:

- No copia de código Lovable
- No mocks en producción
- Build exitoso
- Validación responsive
- Validación SEO básica

### 6. AWS como proveedor inicial

AWS es el proveedor de nube inicial (región us-east-1), pero el framework mantiene abstracción para soportar otros proveedores en el futuro.

### 7. Sin despliegue autónomo

Los agentes preparan cambios pero **no despliegan**. La publicación requiere aprobación humana explícita.

## Consecuencias

### Positivas

- Separación clara de responsabilidades entre diseño e implementación
- Agentes IA operan con reglas explícitas y contexto estructurado
- Trazabilidad completa via ADRs, decision-log y métricas
- Framework extensible a nuevos proyectos sin reestructuración
- Calidad verificable mediante gates automatizados
- Preparado para multi-proveedor cloud e IA

### Negativas

- Overhead inicial de documentación y configuración
- Curva de aprendizaje para el equipo sobre el modelo de agentes
- Traducción Lovable → productivo requiere más esfuerzo que copia directa
- Orquestación manual inicial (sin orquestador automático en Fase 1)

## Alternativas consideradas

| Alternativa | Descartada porque |
|-------------|-------------------|
| Copiar código Lovable directamente | Genera deuda técnica, stack incompatible, mocks en prod |
| Framework sin reglas (agentes libres) | Sin gobernanza, resultados inconsistentes, riesgos de seguridad |
| Monolito de agente único | Sin especialización, difícil de mantener y escalar |
| Despliegue automático | Riesgo de publicar código no validado |

## Referencias

- README.md
- docs/architecture.md
- docs/lovable-integration.md
- CLAUDE.md
- project-context.yml (novus-intelligence)
