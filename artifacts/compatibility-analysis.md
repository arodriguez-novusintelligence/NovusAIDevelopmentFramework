# Compatibility Analysis — Requirement Intake Layer

**Fecha:** 2026-07-14  
**Versión objetivo:** Meta Model v1.1.0

---

## Matriz de compatibilidad

| Componente | ¿Modificado? | ¿Ruptura? | Notas |
|------------|--------------|-----------|-------|
| IDs agentes existentes | No | No | Solo adición |
| Skill registries existentes | No | No | Solo nuevos YAML |
| Workflows existentes | No | No | + `requirement-intake.yml` |
| Fases (9) | No | No | Steps intake mapeados dentro |
| Artefactos lovable-to-web | No | No | Nuevos nombres convencionales |
| Rutas `.nadf/` existentes | No | No | Nueva carpeta opt-in |
| ADR-0001…0006 | No | No | ADR-0007 añade |
| `novus-intelligence` sin sources | N/A | No | Ausencia = no-op |
| Intent v1.0 | Extensión opcional | No | `requirement_id` opcional |
| Provider independence | Preservado | No | MCP First + adapters |

---

## Criterio opt-in

Un proyecto activa intake solo si existe:

```text
.nadf/projects/<project>/requirement-sources/sources.yml
```

Sin ese archivo:

1. Triggers `requirement.*.received` no se configuran.
2. Workflows actuales no cambian.
3. Validadores de intake no bloquean el proyecto.

---

## Interfaz futura (contrato estable)

La UI/API futura podrá:

- listar / crear / probar / habilitar / deshabilitar conectores
- usando `RequirementSourceDefinition` + `RequirementSourceInstance` + `RequirementSourceConnector`

sin conocer el proveedor concreto.

---

## Migración

| Paso | Acción | Obligatorio |
|------|--------|-------------|
| 1 | Adoptar docs + ADR-0007 | Sí (framework) |
| 2 | Añadir `requirement-sources/` por proyecto | No |
| 3 | Configurar CredentialReference en secret manager | Solo si se habilitan fuentes |
| 4 | Conectar MCP o adapters HTTP | Solo si se habilitan fuentes |

No se requiere migración de datos históricos: la capa es nueva.
