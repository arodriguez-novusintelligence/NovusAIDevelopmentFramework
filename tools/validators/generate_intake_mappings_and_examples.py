from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[2]
defs = root / ".nadf/global/requirement-sources/definitions"
maps = root / ".nadf/global/requirement-sources/mappings"
maps.mkdir(parents=True, exist_ok=True)

for f in sorted(defs.glob("*.yml")):
    text = f.read_text(encoding="utf-8")
    sid = re.search(r"^id:\s*(.+)$", text, re.M).group(1).strip()
    out = maps / f"{sid}.yml"
    m = re.search(r"initial_mapping:\n((?:  .+\n)+)", text)
    fields = {}
    if m:
        for line in m.group(1).splitlines():
            line = line.strip()
            if not line or line.startswith("#") or ":" not in line:
                continue
            k, v = line.split(":", 1)
            fields[k.strip()] = v.strip().strip('"')
    lines = [
        f"id: {sid}-default-mapping",
        f"source_definition_id: {sid}",
        'version: "1.0.0"',
        "field_mappings:",
    ]
    if fields:
        for k, v in fields.items():
            lines.append(f"  {k}: {v}")
    else:
        lines.append("  title: title")
        lines.append("  description: description")
    lines.extend(
        [
            "transformations: []",
            "defaults:",
            f"  source_type: {sid}",
            "validation_rules:",
            "  - title_required",
            "  - description_required",
            "",
        ]
    )
    out.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", out.relative_to(root))

art = root / ".nadf/global/artifact-contracts/requirement-intake/examples"
art.mkdir(parents=True, exist_ok=True)


def envelope(producer: str, extra: dict) -> dict:
    return {
        "id": "art-demo",
        "schemaVersion": "1.1.0",
        "correlationId": "corr-demo",
        "source": "manual",
        "producerAgent": producer,
        "createdAt": "2026-07-15T00:00:00Z",
        "status": "OK",
        "references": {},
        "integrity": {"payloadHash": "sha256:demo"},
        **extra,
    }


def to_yaml(obj, indent=0) -> str:
    sp = "  " * indent
    if isinstance(obj, dict):
        lines = []
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                lines.append(f"{sp}{k}:")
                lines.append(to_yaml(v, indent + 1))
            else:
                lines.append(f"{sp}{k}: {json.dumps(v)}")
        return "\n".join(lines)
    if isinstance(obj, list):
        lines = []
        for item in obj:
            if isinstance(item, (dict, list)):
                lines.append(f"{sp}-")
                lines.append(to_yaml(item, indent + 1))
            else:
                lines.append(f"{sp}- {json.dumps(item)}")
        return "\n".join(lines)
    return f"{sp}{json.dumps(obj)}"


examples = {
    "raw-requirement-event.json": envelope(
        "requirement-intake-agent",
        {"rawEvent": {"id": "raw-001", "processing_status": "ACCEPTED"}},
    ),
    "requirement-normalized.yml": envelope(
        "requirement-normalization-agent",
        {"requirement": {"id": "req-001", "title": "Demo", "status": "RECEIVED"}},
    ),
    "requirement-validation.json": envelope(
        "requirement-validation-agent", {"findings": []}
    ),
    "requirement-classification.yml": envelope(
        "requirement-classification-agent",
        {"classification": {"type": "feature", "risk": "low"}},
    ),
    "requirement-deduplication.json": envelope(
        "requirement-deduplication-agent", {"deduplication": {"duplicate": False}}
    ),
    "requirement-approval.yml": envelope(
        "requirement-approval-agent",
        {"approval": {"decision": "APPROVED", "actor": "human"}},
    ),
    "requirement-to-intent-map.yml": envelope(
        "requirement-traceability-agent",
        {"map": {"requirement_id": "req-001", "intent_id": "int-001"}},
    ),
    "requirement-traceability.json": envelope(
        "requirement-traceability-agent",
        {
            "links": [
                {"from": "req-001", "to": "int-001", "type": "converted_to"}
            ]
        },
    ),
    "source-connection-test.json": envelope(
        "requirement-intake-agent", {"connectionTest": {"ok": True}}
    ),
}

for name, payload in examples.items():
    p = art / name
    if name.endswith(".json"):
        p.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    else:
        p.write_text(to_yaml(payload) + "\n", encoding="utf-8")
    print("example", p.relative_to(root))

schemas = root / "docs/meta-model/schemas"
schemas.mkdir(parents=True, exist_ok=True)
(schemas / "jira-config.json").write_text(
    json.dumps(
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "JiraRequirementSourceConfig",
            "type": "object",
            "required": [
                "definition_id",
                "project_id",
                "ingestion_mode",
                "credential_reference",
            ],
            "properties": {
                "definition_id": {"const": "jira"},
                "project_id": {"type": "string"},
                "ingestion_mode": {"enum": ["WEBHOOK", "POLLING"]},
                "credential_reference": {
                    "type": "string",
                    "pattern": "^secret://",
                },
                "enabled": {"type": "boolean"},
            },
        },
        indent=2,
    )
    + "\n",
    encoding="utf-8",
)
(schemas / "jira-payload.json").write_text(
    json.dumps(
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "JiraIssueWebhookPayload",
            "type": "object",
            "required": ["issue"],
            "properties": {
                "issue": {
                    "type": "object",
                    "required": ["key", "fields"],
                }
            },
        },
        indent=2,
    )
    + "\n",
    encoding="utf-8",
)
print("schemas ok")
