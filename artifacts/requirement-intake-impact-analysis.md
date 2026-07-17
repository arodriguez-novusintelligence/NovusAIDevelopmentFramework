<!-- NADF-GUIDE
Propósito: Documenta Impact Analysis — Requirement Intake Layer.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Impact Analysis — Requirement Intake Layer

**Fecha:** 2026-07-14  
**Meta Model vigente:** v1.0.0  
**Meta Model propuesto:** v1.1.0 (MINOR)  
**ADR propuesto:** ADR-0007  
**Estado:** Pre-implementación

---

## Resumen

NADF no dispone hoy de un modelo normativo común para ingerir requerimientos empresariales multi-fuente. Existen referencias conceptuales a Jira/GitHub/Lovable y el flujo `Context → Intent → Plan → …`, pero las entradas externas pueden saltar semántica de “requerimiento” e ir directo a Intent/Plan. La evolución introduce una **Requirement Intake Layer** opt-in, aditiva y no disruptiva.

---

## Hallazgos del estado actual

| Área | Estado | Impacto |
|------|--------|---------|
| Meta Model | v1.0 — 24+ entidades Core | Extensión MINOR prevista en versioning.md (entidad `Requirement` como ejemplo) |
| ADRs | ADR-0001 … ADR-0006 | ADR-0007 libre |
| Agentes | ~20 (19 catálogo + visual-parity) | +7 agentes de intake; IDs existentes intactos |
| Workflows | 8 globales + lovable-to-web proyecto | +1 workflow `requirement-intake`; 9 fases preservadas |
| Intent | Nace desde evento/contexto | Requirement queda **antes** de Intent; no sustituye Intent |
| Credential / TraceabilityLink | No existen | Nuevas entidades; no duplican Policy/Rule/Artifact |
| Project `novus-intelligence` | Sin `requirement-sources/` | Opt-in; sin carpeta = comportamiento idéntico |
| Validadores / tests | Ausentes para intake | Nuevos scripts + fixtures |

---

## Entidades reutilizables (no duplicar)

| Entidad existente | Uso en intake |
|-------------------|---------------|
| `Event` | Catálogo ampliado; RawRequirementEvent es especialización tipada |
| `Context` | Ensamblaje post-aprobación incluyendo Requirement |
| `Intent` | Destino de conversión; atributo opcional `requirement_id` |
| `Policy` / `Rule` | `RequirementPolicy` especializa gobernanza de fuentes |
| `Artifact` | Contratos Blackboard de intake |
| `Provider` / `MCP Server` / `Tool` | Conectores vía MCP o adapter HTTP |
| `Validation` | Validación de completitud/seguridad del Requirement |
| `Project` | Ámbito de `RequirementSourceInstance` |

---

## Superficie de cambio

### Aditivo (seguro)

- Nuevas entidades Requirement*
- Nuevos agentes, skill registries, workflow
- Catálogo global de fuentes
- Eventos nuevos
- Docs y reglas de seguridad
- Carpeta opt-in `requirement-sources/`

### Extensivo (compatible)

- Intent: atributo opcional `requirement_id`
- Context: fuente `requirement`
- Flujo semántico: rama opcional `… → Requirement → Intent → …`
- Conteos de agentes/workflows en README/CLAUDE

### Prohibido (destructivo)

- Cambiar IDs de agentes/workflows existentes
- Hacer Requirement obligatorio en v1.0 flows
- Alterar orden de 9 fases
- Romper artefactos lovable-to-web

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Confundir Requirement con Intent | Documentación + validadores + ADR |
| Ejecución directa desde Slack/webhook | Política: solo Intent tras aprobación |
| Secretos en logs/artefacts | CredentialReference + redacción PII |
| Explosion de agentes por proveedor | Un contrato + 7 agentes funcionales |
| Proyectos sin fuentes | Opt-in estricto |

---

## Conclusión

Impacto **MEDIUM** documentado; evolución **MINOR v1.1.0** compatible. Proceder con ADR-0007 e implementación aditiva.
