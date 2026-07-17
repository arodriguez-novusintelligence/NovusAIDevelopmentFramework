<!-- NADF-GUIDE
Propósito: Documenta Enterprise governance.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Enterprise governance

Controles reutilizables para implantar NADF en una organización sin copiar
configuración de otro cliente.

- `human-approval-model.yml`: gates y evidencia exigida.
- `raci.yml`: responsabilidades humanas y de agentes.
- `budget-policy.yml`: límites y kill switch.
- `agent-selection.yml`: preset y efecto de desactivar agentes.

Cada Customer Distribution copia estas plantillas a
`.nadf/projects/<project>/` y registra sus excepciones como decisiones
auditables. Ninguna plantilla autoriza despliegues a producción.
