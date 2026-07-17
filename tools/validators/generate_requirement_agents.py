#!/usr/bin/env python3
# NADF-GUIDE
# Propósito: Implementa Generate requirement-* agent definitions and skill registries.
# Configuración: No requiere configuración directa; conservar rutas relativas y ejecución determinista.
"""Generate requirement-* agent definitions and skill registries."""
from __future__ import annotations

import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AGENTS_MD = os.path.join(ROOT, ".claude", "agents")
SKILLS = os.path.join(ROOT, ".nadf", "global", "skill-registry")

AGENTS = [
    {
        "id": "requirement-intake-agent",
        "name": "Requirement Intake Agent",
        "pattern": "Event Driven",
        "layer": "Planning",
        "description": "Recibe RawRequirementEvent, verifica seguridad y coordina normalización sin crear código ni aprobar",
        "responsibilities": [
            "Recibir RawRequirementEvent",
            "Verificar estado de seguridad y firma",
            "Coordinar normalización",
            "Cargar configuración de fuente",
            "Ensamblar Context post-aprobación",
        ],
        "forbidden": [
            "modify_productive_repos",
            "deploy",
            "create_secrets",
            "approve_requirements",
            "create_code",
            "create_plan_from_raw_event",
        ],
        "inputs": "Raw event / source instance config",
        "outputs": ["artifacts/raw-requirement-event.json", "artifacts/source-connection-test.json"],
        "mcp": ["jira", "github", "slack", "generic-webhook"],
        "tools": ["read_source_config", "receive_event", "write_intake_artifacts"],
    },
    {
        "id": "requirement-normalization-agent",
        "name": "Requirement Normalization Agent",
        "pattern": "Planner",
        "layer": "Planning",
        "description": "Transforma payload externo en Requirement aplicando RequirementMapping",
        "responsibilities": [
            "Aplicar RequirementMapping",
            "Detectar campos faltantes",
            "Generar artefacto normalizado",
            "Sanitizar HTML/Markdown",
        ],
        "forbidden": [
            "modify_productive_repos",
            "deploy",
            "approve_requirements",
            "create_intent",
            "execute_code_from_payload",
        ],
        "inputs": "artifacts/raw-requirement-event.json + mapping",
        "outputs": ["artifacts/requirement-normalized.yml"],
        "mcp": [],
        "tools": ["read_artifacts", "apply_mapping", "write_requirement_artifacts"],
    },
    {
        "id": "requirement-classification-agent",
        "name": "Requirement Classification Agent",
        "pattern": "Planner",
        "layer": "Planning",
        "description": "Clasifica tipo, dominio, prioridad, impacto y riesgo; sugiere workflow candidato sin ejecutarlo",
        "responsibilities": [
            "Clasificar tipo y dominio",
            "Evaluar prioridad, impacto y riesgo",
            "Determinar workflow candidato",
        ],
        "forbidden": [
            "execute_workflow",
            "modify_productive_repos",
            "deploy",
            "approve_requirements",
        ],
        "inputs": "artifacts/requirement-normalized.yml",
        "outputs": ["artifacts/requirement-classification.yml"],
        "mcp": [],
        "tools": ["read_artifacts", "write_classification_artifacts"],
    },
    {
        "id": "requirement-deduplication-agent",
        "name": "Requirement Deduplication Agent",
        "pattern": "Planner",
        "layer": "Planning",
        "description": "Detecta duplicados exactos y semánticos; recomienda fusionar, rechazar o vincular",
        "responsibilities": [
            "Comparar deduplication_key y payload_hash",
            "Detectar similitud semántica",
            "Recomendar merge/reject/link",
        ],
        "forbidden": [
            "auto_merge_without_policy",
            "modify_productive_repos",
            "deploy",
        ],
        "inputs": "artifacts/requirement-normalized.yml",
        "outputs": ["artifacts/requirement-deduplication.json"],
        "mcp": [],
        "tools": ["read_artifacts", "write_dedup_artifacts"],
    },
    {
        "id": "requirement-validation-agent",
        "name": "Requirement Validation Agent",
        "pattern": "Validator",
        "layer": "Validation",
        "description": "Valida completitud, criterios de aceptación y ambigüedad; marca NEEDS_CLARIFICATION",
        "responsibilities": [
            "Validar titulo/descripcion/source",
            "Validar acceptance criteria cuando política lo exige",
            "Detectar ambigüedad",
            "Validar trazabilidad Intent",
        ],
        "forbidden": [
            "modify_productive_repos",
            "approve_requirements",
            "deploy",
        ],
        "inputs": "requirement-normalized + classification",
        "outputs": ["artifacts/requirement-validation.json"],
        "mcp": [],
        "tools": ["read_artifacts", "write_validation_artifacts"],
    },
    {
        "id": "requirement-approval-agent",
        "name": "Requirement Approval Agent",
        "pattern": "Mediator",
        "layer": "Planning",
        "description": "Prepara solicitud de aprobación humana y aplica RequirementPolicy; no autoaprueba críticos salvo política explícita",
        "responsibilities": [
            "Preparar solicitud de aprobación",
            "Aplicar RequirementPolicy",
            "Registrar actor de aprobación",
        ],
        "forbidden": [
            "auto_approve_critical_without_explicit_policy",
            "modify_productive_repos",
            "deploy",
            "create_code",
        ],
        "inputs": "validation + policy",
        "outputs": ["artifacts/requirement-approval.yml"],
        "mcp": ["jira", "slack", "microsoft-teams"],
        "tools": ["read_policy", "write_approval_artifacts", "notify_approvers"],
    },
    {
        "id": "requirement-traceability-agent",
        "name": "Requirement Traceability Agent",
        "pattern": "Blackboard",
        "layer": "Knowledge",
        "description": "Crea TraceabilityLink Requirement → Intent → Plan → Execution → Artifact",
        "responsibilities": [
            "Crear Intent desde Requirement aprobado",
            "Registrar TraceabilityLink",
            "Publicar requirement-to-intent-map y requirement-traceability",
        ],
        "forbidden": [
            "create_intent_without_approved_requirement",
            "modify_productive_repos",
            "deploy",
            "break_trace_chain",
        ],
        "inputs": "requirement-approval.yml approved",
        "outputs": [
            "artifacts/requirement-to-intent-map.yml",
            "artifacts/requirement-traceability.json",
        ],
        "mcp": [],
        "tools": ["read_artifacts", "write_trace_artifacts", "create_intent_record"],
    },
]


def md(a: dict) -> str:
    outs = "\n".join(f"| `{o}` | Blackboard | Contrato ADR-0007 |" for o in a["outputs"])
    mcp_rows = (
        "\n".join(f"| {m} | Operaciones de lectura / notify según contrato |" for m in a["mcp"])
        if a["mcp"]
        else "| — | Sin MCP obligatorio |"
    )
    forbid = "\n".join(f"- {f}" for f in a["forbidden"])
    can = "\n".join(f"- {r}" for r in a["responsibilities"])
    return f"""# {a['name']}

## Identidad

| Campo | Valor |
|-------|-------|
| Identificador | `{a['id']}` |
| Nombre | {a['name']} |
| Capa | {a['layer']} Layer |
| Patrón | {a['pattern']} Pattern |

### Reglas obligatorias previas a la ejecución

Antes de ejecutar cualquier tarea:
- Leer CLAUDE.md
- Leer Meta Model (docs/meta-model/meta-model-overview.md y docs/meta-model/requirement-model.md)
- Leer Project Context (project-context.yml del proyecto activo)
- Si aplica, leer `.nadf/projects/<proyecto>/requirement-sources/`

## Responsabilidad

{a['description']}.

## Patrón arquitectónico usado

**{a['pattern']} Pattern**

## Qué puede hacer

{can}

## Qué tiene prohibido hacer

{forbid}

## Entradas

| Input | Ubicación | Obligatorio |
|-------|-----------|-------------|
| project-context.yml | `.nadf/projects/<proyecto>/` | Sí |
| requirement-sources | `.nadf/projects/<proyecto>/requirement-sources/` | Sí (opt-in) |
| Entrada tipada | {a['inputs']} | Sí |

## Salidas

| Output | Ubicación | Descripción |
|--------|-----------|-------------|
{outs}

## Herramientas MCP permitidas

| Servidor | Operaciones |
|----------|-------------|
{mcp_rows}

## Archivos de contexto que debe leer

- `.nadf/projects/<proyecto>/project-context.yml`
- `.nadf/global/rules/general-rules.md`
- `.nadf/global/rules/requirement-intake-security.md`
- `.nadf/global/requirement-sources/connector-contract.yml`
- Artefactos upstream del workflow `requirement-intake`

## Criterios de bloqueo

- Proyecto sin carpeta `requirement-sources/` cuando el trigger es de intake
- Evento sin `correlation_id` o sin clave de idempotencia
- Payload con secreto embebido detectado
- Intento de crear código o Plan desde RawRequirementEvent

## Artifacts que debe generar

{chr(10).join('- `' + o + '`' for o in a['outputs'])}

## Métricas

Registrar según `metrics-schema.json` con `agentName: {a['id']}`.

## Referencias

- Skill registry: `.nadf/global/skill-registry/{a['id']}.yml`
- ADR-0007
- [Modelo de requerimientos](../../docs/meta-model/requirement-model.md)
"""


def yml(a: dict) -> str:
    resp = "\n".join(f"    - {r}" for r in a["responsibilities"])
    forb = "\n".join(f"    - {f}" for f in a["forbidden"])
    tools = "\n".join(f"    - {t}" for t in a["tools"])
    mcp = "\n".join(f"    - {m}" for m in a["mcp"]) if a["mcp"] else "    []"
    outs = "\n".join(f"      - {o.replace('artifacts/', '')}" for o in a["outputs"])
    return f"""agent:
  name: {a['id']}
  pattern: {a['pattern']}
  layer: {a['layer']}
  description: {a['description']}
  definition: .claude/agents/{a['id']}.md
  responsibilities:
{resp}
  forbidden_actions:
{forb}
  allowed_tools:
{tools}
  mcp_servers:
{mcp}
  required_context:
    - .nadf/projects/*/project-context.yml
    - .nadf/projects/*/requirement-sources/sources.yml
    - .nadf/global/rules/requirement-intake-security.md
    - docs/meta-model/requirement-model.md
  input_contract:
    artifacts: raw-requirement-event.json, requirement-normalized.yml
    event_or_request: required
    opt_in: requirement-sources/
  output_contract:
    artifacts:
{outs}
  quality_gates:
    - no_secrets_in_artifacts
    - never_auto_execute_external_content
  escalation_rules:
    - security_failure: quarantine_and_notify
    - missing_approval_policy: block
    - high_risk: escalate_to_human_review
"""


def main() -> None:
    os.makedirs(AGENTS_MD, exist_ok=True)
    os.makedirs(SKILLS, exist_ok=True)
    for a in AGENTS:
        md_path = os.path.join(AGENTS_MD, f"{a['id']}.md")
        yml_path = os.path.join(SKILLS, f"{a['id']}.yml")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md(a))
        with open(yml_path, "w", encoding="utf-8") as f:
            f.write(yml(a))
        print("wrote", a["id"])


if __name__ == "__main__":
    main()
