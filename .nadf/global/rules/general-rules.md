<!-- NADF-GUIDE
Propósito: Documenta Reglas generales del framework NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Reglas generales del framework NADF

Estas reglas aplican a **todos los agentes** en **todos los proyectos** del NovusAIDevelopmentFramework.

## 1. Contexto obligatorio

- Todo agente debe leer `project-context.yml` del proyecto activo antes de ejecutar cualquier acción.
- Todo agente debe consultar las reglas globales (este directorio) y las reglas específicas del proyecto.
- Todo agente debe revisar la memoria del proyecto para decisiones y contexto previos.

## 2. Separación diseño / implementación

- Lovable (`novus-nexus`) es fuente de **intención visual y funcional**, nunca de código productivo.
- Está **prohibido** copiar código, componentes, estilos o dependencias de Lovable a repositorios productivos.
- La traducción de intención a implementación debe usar el stack y convenciones del proyecto productivo.

## 3. Idioma y comunicación

- Documentación, artefactos y comunicación entre agentes: **español**.
- Código, nombres de variables, funciones y archivos: **inglés** (convención estándar).
- Comentarios en código: español o inglés según convención del repositorio productivo.

## 4. Alcance de acción

- Los agentes ejecutan tareas dentro de su rol definido en `.claude/agents/`.
- Un agente no debe asumir responsabilidades de otro agente.
- Cambios fuera del alcance del agente deben reportarse, no ejecutarse.

## 5. Artefactos

- Toda salida de un agente debe ser un artefacto nombrado y ubicado en la ruta definida.
- Los artefactos deben ser autocontenidos y comprensibles sin contexto adicional.
- No eliminar artefactos de ejecuciones anteriores; archivar si es necesario.

## 6. Arquitectura multiagente

- Todo workflow debe separar fases de **Planning**, **Plan Review**, **Execution** y **Validation**.
- Agentes **Planner** y **Architect** no modifican código productivo.
- Agentes **Executor** no cambian arquitectura sin ADR.
- Agentes **Validator** no modifican lógica productiva salvo autorización explícita.
- Los agentes no se comunican directamente; el Orquestador coordina y el Blackboard comparte artefactos.
- Referencia: `docs/multiagent-architecture.md`, ADR-0002.

## 7. Integración MCP

- Todo acceso externo a GitHub, AWS, bases de datos, Terraform, Jira y contenedores debe realizarse **vía MCP** cuando el servidor esté disponible.
- Referencia: `docs/mcp-integration.md`.

## 8. Trazabilidad

- Decisiones arquitectónicas relevantes → ADR (ADR Agent).
- Decisiones de proyecto → `memory/decision-log.md`.
- Métricas de ejecución → Metrics Agent según `metrics-schema.json`.
- Aprendizaje reutilizable → Knowledge Base (Reflection + KB Agent).

## 9. Calidad

- Ningún cambio se considera completado sin pasar los quality gates definidos en `project-context.yml`.
- Los gates críticos (no mocks, no secrets, no lovable copy) son bloqueantes.
- El informe QA es obligatorio al final de cada workflow de implementación.

## 10. Prohibiciones globales

| Prohibición | Motivo |
|-------------|--------|
| Copiar código de Lovable | Separación diseño/implementación |
| Mocks en producción | Política no-mock |
| Despliegue autónomo | Requiere aprobación humana |
| Crear secrets/API keys | Seguridad |
| Modificar framework sin rol Architect | Gobernanza del framework |
| Ignorar quality gates | Calidad by design |

## 11. Evolución del framework

- Cambios en reglas globales requieren rol de Framework Architect Agent.
- Cambios en reglas de proyecto pueden ser realizados por el agente correspondiente con documentación.
- Toda modificación de reglas debe registrarse en decision-log o ADR según corresponda.

## Referencias

- CLAUDE.md (reglas para agentes IA)
- security-rules.md
- no-mock-policy.md
- provider-independence.md
