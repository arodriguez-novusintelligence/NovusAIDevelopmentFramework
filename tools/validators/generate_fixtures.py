#!/usr/bin/env python3
"""Generate requirement-intake fixtures."""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "tests" / "requirement-intake" / "fixtures"

FIXTURES = [
    {
        "id": "01-manual-valid",
        "scenario": {
            "source": {
                "definition": "manual",
                "credential_reference": None,
                "mapping": "mappings/manual.yml",
                "policy": {"requires_human_approval": True},
            },
            "event": {
                "correlation_id": "corr-01",
                "idempotency_key": "manual|man-1|manual_submitted|abc",
                "signature_valid": True,
            },
            "requirement": {
                "title": "Añadir FAQ",
                "description": "Sección FAQ en landing",
                "source_type": "manual",
                "external_reference": "man-1",
                "source_event_id": "raw-01",
                "status": "RECEIVED",
                "acceptance_criteria": ["FAQ visible in desktop and mobile"],
            },
        },
        "expected": {"pass": True},
    },
    {
        "id": "02-jira-valid",
        "scenario": {
            "source": {
                "definition": "jira",
                "credential_reference": "secret://nadf/dev/jira-main",
                "mapping": "mappings/jira.yml",
                "policy": {"requires_human_approval": True},
            },
            "event": {
                "correlation_id": "corr-02",
                "deduplication_key": "jira|NOVUS-10|issue_created|hash2",
                "signature_valid": True,
            },
            "requirement": {
                "title": "Contact API rate limit",
                "description": "Limitar /contact",
                "source_type": "jira",
                "external_reference": "NOVUS-10",
                "source_event_id": "raw-02",
                "acceptance_criteria": ["429 after threshold"],
            },
        },
        "expected": {"pass": True},
    },
    {
        "id": "03-slack-unauthorized",
        "scenario": {
            "slack_authorized": False,
            "event": {
                "correlation_id": "corr-03",
                "idempotency_key": "slack|msg-1|message|h",
                "signature_valid": True,
            },
        },
        "expected": {"pass": False, "raw_status": "REJECTED"},
    },
    {
        "id": "04-slack-authorized-command",
        "scenario": {
            "slack_authorized": True,
            "event": {
                "correlation_id": "corr-04",
                "idempotency_key": "slack|cmd-1|slash_command|h",
                "signature_valid": True,
                "command": "/nadf-req",
            },
            "requirement": {
                "title": "Req from Slack",
                "description": "/nadf-req create FAQ update",
                "source_type": "slack",
                "external_reference": "cmd-1",
                "source_event_id": "raw-04",
            },
        },
        "expected": {"pass": True},
    },
    {
        "id": "05-github-issue-duplicate",
        "scenario": {
            "duplicate": True,
            "event": {
                "correlation_id": "corr-05",
                "deduplication_key": "github|42|issues.opened|samehash",
                "signature_valid": True,
            },
            "requirement": {
                "title": "Dup issue",
                "description": "Already seen",
                "source_type": "github-issue",
                "external_reference": "42",
                "source_event_id": "raw-05",
            },
        },
        "expected": {"pass": False, "raw_status": "DUPLICATE", "dedup": True},
    },
    {
        "id": "06-webhook-invalid-signature",
        "scenario": {
            "event": {
                "correlation_id": "corr-06",
                "idempotency_key": "webhook|w1|webhook_received|h",
                "signature_valid": False,
                "expect_reject_signature": True,
            }
        },
        "expected": {"pass": False, "raw_status": "REJECTED"},
    },
    {
        "id": "07-api-idempotency-replay",
        "scenario": {
            "idempotency_replay": True,
            "event": {
                "correlation_id": "corr-07",
                "idempotency_key": "api|ext-9|api_requirement_created|hashX",
                "signature_valid": True,
            },
        },
        "expected": {"pass": False, "duplicate_or_ignored": True},
    },
    {
        "id": "08-email-unauthorized-domain",
        "scenario": {
            "email_domain_allowed": False,
            "event": {
                "correlation_id": "corr-08",
                "idempotency_key": "email|m1|message_received|h",
                "signature_valid": True,
            },
        },
        "expected": {"pass": False, "raw_status": "REJECTED"},
    },
    {
        "id": "09-file-forbidden-type",
        "scenario": {
            "attachment": {"name": "payload.exe", "mime_type": "application/octet-stream"},
            "allowed_file_types": ["md", "txt", "json", "yaml", "csv", "pdf"],
            "event": {
                "correlation_id": "corr-09",
                "idempotency_key": "file|f1|file_uploaded|h",
            },
        },
        "expected": {"pass": False, "attachment_status": "rejected"},
    },
    {
        "id": "10-servicenow-valid",
        "scenario": {
            "source": {
                "definition": "servicenow",
                "credential_reference": "secret://nadf/dev/snow",
                "mapping": "mappings/servicenow.yml",
                "policy": {"requires_human_approval": True},
            },
            "event": {
                "correlation_id": "corr-10",
                "deduplication_key": "servicenow|INC001|incident_created|h",
                "signature_valid": True,
            },
            "requirement": {
                "title": "Incident portal timeout",
                "description": "Timeouts on contact form",
                "source_type": "servicenow",
                "external_reference": "INC001",
                "source_event_id": "raw-10",
            },
        },
        "expected": {"pass": True},
    },
    {
        "id": "11-scheduled-event-requirement",
        "scenario": {
            "event": {
                "correlation_id": "corr-11",
                "idempotency_key": "scheduled|run-1|schedule_fired|h",
                "signature_valid": True,
            },
            "requirement": {
                "title": "Weekly dependency audit",
                "description": "Template-based scheduled requirement",
                "source_type": "scheduled-event",
                "external_reference": "run-1",
                "source_event_id": "raw-11",
                "status": "RECEIVED",
            },
        },
        "expected": {"pass": True, "creates_execution_directly": False},
    },
    {
        "id": "12-incomplete-needs-clarification",
        "scenario": {
            "require_acceptance_criteria": True,
            "requirement": {
                "title": "Something vague",
                "description": "Do the thing",
                "source_type": "manual",
                "external_reference": "man-12",
                "source_event_id": "raw-12",
                "acceptance_criteria": [],
                "status": "NEEDS_CLARIFICATION",
            },
            "event": {
                "correlation_id": "corr-12",
                "idempotency_key": "manual|man-12|manual_submitted|h",
            },
        },
        "expected": {"pass": False, "status": "NEEDS_CLARIFICATION"},
    },
    {
        "id": "13-approved-creates-intent",
        "scenario": {
            "requirement": {
                "title": "Approved feature",
                "description": "Ready",
                "source_type": "manual",
                "external_reference": "man-13",
                "source_event_id": "raw-13",
                "acceptance_criteria": ["AC1"],
                "status": "APPROVED",
            },
            "intent": {"id": "intent-13", "requirement_id": "req-13"},
            "event": {
                "correlation_id": "corr-13",
                "idempotency_key": "manual|man-13|manual_submitted|h",
            },
        },
        "expected": {"pass": True, "creates_intent": True},
    },
    {
        "id": "14-full-traceability",
        "scenario": {
            "requirement": {
                "title": "Traced",
                "description": "Full chain",
                "source_type": "jira",
                "external_reference": "NOVUS-99",
                "source_event_id": "raw-14",
                "status": "APPROVED",
            },
            "intent": {"id": "intent-14", "requirement_id": "req-14"},
            "traceability": {
                "links": [
                    {
                        "from_entity_type": "RawRequirementEvent",
                        "to_entity_type": "Requirement",
                        "relation": "normalized_to",
                    },
                    {
                        "from_entity_type": "Requirement",
                        "to_entity_type": "Intent",
                        "relation": "converted_to",
                    },
                    {
                        "from_entity_type": "Intent",
                        "to_entity_type": "Plan",
                        "relation": "planned_as",
                    },
                ]
            },
            "event": {
                "correlation_id": "corr-14",
                "deduplication_key": "jira|NOVUS-99|issue_created|h",
            },
        },
        "expected": {"pass": True, "creates_intent": True, "full_trace": True},
    },
    {
        "id": "15-project-without-sources",
        "scenario": {},
        "expected": {"pass": True, "project_without_sources_ok": True},
    },
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for fx in FIXTURES:
        path = OUT / f"{fx['id']}.json"
        path.write_text(json.dumps(fx, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("wrote", path.name)
    # ensure servicenow mapping path referenced exists as stub for project example optional
    print("done", len(FIXTURES))


if __name__ == "__main__":
    main()
