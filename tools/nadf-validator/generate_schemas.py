"""Generate NADF normative JSON Schemas for v1.1.0-rc.1 stabilization."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "schemas"


def schema(
    name: str,
    title: str,
    description: str,
    properties: dict,
    required: list[str],
    enums: dict | None = None,
    additional: bool = False,
) -> dict:
    props = dict(properties)
    if enums:
        for k, vals in enums.items():
            props.setdefault(k, {})["enum"] = vals
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": f"https://nadf.novusintelligence.local/schemas/{name}",
        "title": title,
        "description": description,
        "schemaVersion": "1.1.0-rc.1",
        "type": "object",
        "additionalProperties": additional,
        "required": required,
        "properties": {
            "schemaVersion": {
                "type": "string",
                "const": "1.1.0-rc.1",
                "description": "Schema package version",
            },
            **props,
        },
    }


def write(name: str, doc: dict) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    path.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")
    print("wrote", path.relative_to(ROOT))


COMMON_ID = {"type": "string", "minLength": 3, "pattern": "^[A-Z]{2,6}-[0-9]{4}-[0-9]{6}$|^[a-z0-9][a-z0-9_.:-]{2,}$"}
ISO = {"type": "string", "format": "date-time"}
CORREL = {"type": "string", "minLength": 8}

write(
    "raw-requirement-event.schema.json",
    schema(
        "raw-requirement-event.schema.json",
        "RawRequirementEvent",
        "Immutable event prior to normalization (ADR-0007)",
        {
            "id": COMMON_ID,
            "source_instance_id": {"type": "string"},
            "external_id": {"type": ["string", "null"]},
            "event_type": {"type": "string"},
            "received_at": ISO,
            "payload_reference": {"type": "string"},
            "payload_hash": {"type": "string"},
            "signature_valid": {"type": ["boolean", "null"]},
            "correlation_id": CORREL,
            "deduplication_key": {"type": "string"},
            "processing_status": {"type": "string"},
        },
        [
            "id",
            "source_instance_id",
            "event_type",
            "received_at",
            "correlation_id",
            "deduplication_key",
            "processing_status",
            "schemaVersion",
        ],
        {
            "processing_status": [
                "RECEIVED",
                "AUTHENTICATING",
                "VALIDATING",
                "REJECTED",
                "NORMALIZING",
                "DUPLICATE",
                "ACCEPTED",
                "FAILED",
                "QUARANTINED",
            ]
        },
    ),
)

write(
    "requirement.schema.json",
    schema(
        "requirement.schema.json",
        "Requirement",
        "Normalized requirement; mutable until APPROVED",
        {
            "id": COMMON_ID,
            "source_event_id": {"type": "string"},
            "source_type": {"type": "string"},
            "external_reference": {"type": ["string", "null"]},
            "title": {"type": "string", "minLength": 3},
            "description": {"type": "string", "minLength": 3},
            "requester": {"type": ["string", "null"]},
            "priority": {"type": ["string", "null"]},
            "labels": {"type": "array", "items": {"type": "string"}},
            "acceptance_criteria": {"type": "array", "items": {"type": "string"}},
            "status": {"type": "string"},
            "created_at": ISO,
            "updated_at": ISO,
            "correlation_id": CORREL,
        },
        [
            "id",
            "source_event_id",
            "source_type",
            "title",
            "description",
            "status",
            "correlation_id",
            "schemaVersion",
        ],
        {
            "status": [
                "RECEIVED",
                "CLASSIFYING",
                "NEEDS_CLARIFICATION",
                "AWAITING_APPROVAL",
                "APPROVED",
                "REJECTED",
                "CONVERTED_TO_INTENT",
                "IN_EXECUTION",
                "VALIDATING",
                "COMPLETED",
                "BLOCKED",
                "CANCELLED",
            ]
        },
    ),
)

write(
    "context.schema.json",
    schema(
        "context.schema.json",
        "Context",
        "Assembled project context snapshot",
        {
            "id": COMMON_ID,
            "project_id": {"type": "string"},
            "sources": {"type": "array", "items": {"type": "string"}},
            "assembled_at": ISO,
            "correlation_id": CORREL,
        },
        ["id", "project_id", "assembled_at", "correlation_id", "schemaVersion"],
    ),
)

write(
    "intent.schema.json",
    schema(
        "intent.schema.json",
        "Intent",
        "Immutable after acceptance; may link to Requirement",
        {
            "id": COMMON_ID,
            "requirement_id": {"type": ["string", "null"]},
            "title": {"type": "string"},
            "description": {"type": "string"},
            "status": {"type": "string"},
            "correlation_id": CORREL,
            "created_at": ISO,
        },
        ["id", "title", "description", "status", "correlation_id", "schemaVersion"],
        {
            "status": [
                "DRAFT",
                "ACCEPTED",
                "CANCELLED",
                "IN_PLANNING",
                "FULFILLED",
            ]
        },
    ),
)

# Aliases — not new core entities
write(
    "mission.schema.json",
    {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "https://nadf.novusintelligence.local/schemas/mission.schema.json",
        "title": "Mission (Plan alias)",
        "description": "Compatibility alias of Plan with kind=mission. Not a separate Meta Model entity.",
        "schemaVersion": "1.1.0-rc.1",
        "allOf": [
            {"$ref": "execution-plan.schema.json"},
            {
                "type": "object",
                "properties": {"kind": {"const": "mission"}},
                "required": ["kind"],
            },
        ],
    },
)

write(
    "execution-plan.schema.json",
    schema(
        "execution-plan.schema.json",
        "ExecutionPlan (Plan alias)",
        "Approved Plan + task list; alias of Meta Model Plan after approval",
        {
            "id": COMMON_ID,
            "intent_id": {"type": "string"},
            "kind": {"type": "string", "enum": ["plan", "execution-plan", "mission"]},
            "status": {"type": "string"},
            "tasks": {"type": "array", "items": {"type": "string"}},
            "correlation_id": CORREL,
            "version": {"type": "string"},
        },
        [
            "id",
            "intent_id",
            "kind",
            "status",
            "tasks",
            "correlation_id",
            "schemaVersion",
        ],
        {
            "status": [
                "DRAFT",
                "PENDING_REVIEW",
                "APPROVED",
                "REJECTED",
                "SUPERSEDED",
            ]
        },
    ),
)

write(
    "execution.schema.json",
    schema(
        "execution.schema.json",
        "Execution",
        "Immutable historical execution record",
        {
            "id": COMMON_ID,
            "plan_id": {"type": "string"},
            "agent_id": {"type": "string"},
            "status": {"type": "string"},
            "started_at": ISO,
            "ended_at": {"type": ["string", "null"], "format": "date-time"},
            "correlation_id": CORREL,
        },
        ["id", "plan_id", "status", "started_at", "correlation_id", "schemaVersion"],
        {
            "status": [
                "STARTED",
                "RUNNING",
                "COMPLETED",
                "FAILED",
                "BLOCKED",
                "CANCELLED",
            ]
        },
    ),
)

write(
    "task.schema.json",
    schema(
        "task.schema.json",
        "Task",
        "Unit of work under a Plan",
        {
            "id": COMMON_ID,
            "plan_id": {"type": "string"},
            "agent_id": {"type": ["string", "null"]},
            "title": {"type": "string"},
            "status": {"type": "string"},
            "correlation_id": CORREL,
        },
        ["id", "plan_id", "title", "status", "correlation_id", "schemaVersion"],
        {
            "status": [
                "PENDING",
                "READY",
                "IN_PROGRESS",
                "DONE",
                "BLOCKED",
                "CANCELLED",
            ]
        },
    ),
)

write(
    "agent-definition.schema.json",
    schema(
        "agent-definition.schema.json",
        "AgentDefinition",
        "Official or workspace agent definition",
        {
            "id": {"type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*-agent$"},
            "name": {"type": "string"},
            "layer": {"type": "string"},
            "pattern": {"type": "string"},
            "official": {"type": "boolean"},
            "version": {"type": "string"},
        },
        ["id", "name", "layer", "pattern", "official", "schemaVersion"],
    ),
)

write(
    "agent-version.schema.json",
    schema(
        "agent-version.schema.json",
        "AgentVersion",
        "Published immutable agent version",
        {
            "agent_id": {"type": "string"},
            "version": {"type": "string"},
            "status": {"type": "string"},
            "published_at": ISO,
        },
        ["agent_id", "version", "status", "published_at", "schemaVersion"],
        {"status": ["DRAFT", "PUBLISHED", "DEPRECATED", "RETIRED"]},
    ),
)

write(
    "workflow.schema.json",
    schema(
        "workflow.schema.json",
        "Workflow",
        "Declarative workflow definition",
        {
            "id": {"type": "string"},
            "name": {"type": "string"},
            "version": {"type": "string"},
            "phases": {"type": "array", "minItems": 1, "items": {"type": "string"}},
            "triggers": {"type": "array", "items": {"type": "object"}},
        },
        ["id", "name", "version", "phases", "schemaVersion"],
        additional=True,
    ),
)

write(
    "event.schema.json",
    schema(
        "event.schema.json",
        "EventEnvelope",
        "Typed NADF event envelope",
        {
            "name": {"type": "string"},
            "version": {"type": "string"},
            "id": COMMON_ID,
            "correlation_id": CORREL,
            "causation_id": {"type": ["string", "null"]},
            "occurred_at": ISO,
            "producer": {"type": "string"},
            "payload": {"type": "object"},
        },
        [
            "name",
            "version",
            "id",
            "correlation_id",
            "occurred_at",
            "producer",
            "schemaVersion",
        ],
        additional=True,
    ),
)

write(
    "artifact.schema.json",
    schema(
        "artifact.schema.json",
        "Artifact",
        "Blackboard artifact envelope",
        {
            "id": COMMON_ID,
            "name": {"type": "string"},
            "producerAgent": {"type": "string"},
            "correlationId": CORREL,
            "createdAt": ISO,
            "status": {"type": "string"},
            "integrity": {"type": "object"},
        },
        [
            "id",
            "name",
            "producerAgent",
            "correlationId",
            "createdAt",
            "schemaVersion",
        ],
        additional=True,
    ),
)

write(
    "traceability-link.schema.json",
    schema(
        "traceability-link.schema.json",
        "TraceabilityLink",
        "Append-only link between entities",
        {
            "id": COMMON_ID,
            "from_type": {"type": "string"},
            "from_id": {"type": "string"},
            "to_type": {"type": "string"},
            "to_id": {"type": "string"},
            "relation": {"type": "string"},
            "created_at": ISO,
            "correlation_id": CORREL,
        },
        [
            "id",
            "from_type",
            "from_id",
            "to_type",
            "to_id",
            "relation",
            "created_at",
            "correlation_id",
            "schemaVersion",
        ],
    ),
)

for fname, title, desc, extra_req in [
    (
        "requirement-source-definition.schema.json",
        "RequirementSourceDefinition",
        "Reusable source type",
        ["id", "name", "type", "provider", "version", "status"],
    ),
    (
        "requirement-source-instance.schema.json",
        "RequirementSourceInstance",
        "Configured connection in a project",
        ["id", "definition_id", "project_id", "enabled"],
    ),
    (
        "requirement-mapping.schema.json",
        "RequirementMapping",
        "Field mapping definition",
        ["id", "source_definition_id", "version", "field_mappings"],
    ),
    (
        "requirement-policy.schema.json",
        "RequirementPolicy",
        "Security and approval policy",
        ["id", "source_type", "requires_human_approval"],
    ),
    (
        "credential-reference.schema.json",
        "CredentialReference",
        "Secret reference only — never stores secret values",
        ["id", "provider", "secret_manager", "secret_path", "credential_type"],
    ),
]:
    props = {
        "id": {"type": "string"},
        "name": {"type": "string"},
        "type": {"type": "string"},
        "provider": {"type": "string"},
        "version": {"type": "string"},
        "status": {"type": "string"},
        "definition_id": {"type": "string"},
        "project_id": {"type": "string"},
        "enabled": {"type": "boolean"},
        "source_definition_id": {"type": "string"},
        "field_mappings": {"type": "object"},
        "source_type": {"type": "string"},
        "requires_human_approval": {"type": "boolean"},
        "secret_manager": {"type": "string"},
        "secret_path": {
            "type": "string",
            "pattern": "^secret://",
            "description": "Opaque path; never the secret itself",
        },
        "credential_type": {"type": "string"},
    }
    write(
        fname,
        schema(fname, title, desc, props, extra_req + ["schemaVersion"], additional=True),
    )

print("done schemas", len(list(OUT.glob('*.json'))))
