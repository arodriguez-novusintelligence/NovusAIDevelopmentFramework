<!-- NADF-GUIDE
Propósito: Documenta Adopción y Customer Distribution.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Adopción y Customer Distribution

## Oferta

El **NADF Enterprise Adoption Program** es una implantación aproximada de tres
meses. No es SaaS por usuario.

## Entrega física

El cliente recibe dos capas:

1. **NADF Distribution en blanco:** core, gobierno, agents, workflows,
   adapters, project templates, documentación y samples didácticos.
2. **Su proyecto implantado:** `.nadf/projects/<su-app>/` con memoria, reglas,
   environments, sources, budget, selección de agentes y Human Gates,
   conectado a sus repositorios, CI y cloud.

No recibe `novus-intelligence`, `NovusIntelligenceWEB`,
`NovusIntelligenceBack`, `novus-nexus`, secretos ni datos de otros clientes.

## Modelo multiempresa

Novus mantiene un upstream versionado. Cada empresa opera una distribución
aislada en su organización y actualiza por releases con changelog y guía de
migración. No se mezclan proyectos en una instancia compartida ni se mantiene
un fork divergente del monorepo operativo de Novus.

El cliente asume el consumo de modelos, Cursor e infraestructura cloud.
