#!/usr/bin/env python3
# NADF-GUIDE
# Propósito: Implementa Generate NADF requirement source definition YAML files.
# Configuración: No requiere configuración directa; conservar rutas relativas y ejecución determinista.
"""Generate NADF requirement source definition YAML files."""
from __future__ import annotations

import os

BASE = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    ".nadf",
    "global",
    "requirement-sources",
    "definitions",
)

SOURCES = [
    {
        "id": "manual",
        "name": "Manual Requirement",
        "type": "manual",
        "provider": "nadf",
        "modes": ["MANUAL"],
        "events": ["manual_submitted"],
        "auth": ["none"],
        "mcp": None,
        "fallback": "ui/form",
        "caps": ["manual_entry"],
        "limitations": ["Requires human author"],
        "risks": ["Incomplete acceptance criteria"],
        "mapping": {
            "title": "title",
            "description": "description",
            "acceptance_criteria": "acceptance_criteria",
            "priority": "priority",
            "requester": "requester",
        },
        "cred_required": False,
    },
    {
        "id": "jira",
        "name": "Jira",
        "type": "ticketing",
        "provider": "atlassian",
        "modes": ["WEBHOOK", "POLLING"],
        "events": ["issue_created", "issue_updated", "issue_commented"],
        "auth": ["oauth2", "api_token_reference"],
        "mcp": "jira",
        "fallback": "REST Jira API",
        "caps": [
            "webhook",
            "polling",
            "fetch_attachments",
            "update_external_status",
            "add_external_comment",
        ],
        "limitations": ["Cloud vs Server schema differences"],
        "risks": ["Privilege escalation via issue fields"],
        "mapping": {
            "external_reference": "key",
            "title": "summary",
            "description": "description",
            "priority": "priority.name",
            "labels": "labels",
            "requester": "reporter.emailAddress",
            "acceptance_criteria": "customfield_acceptance",
            "attachments": "attachment",
            "project": "fields.project.key",
            "assignee": "assignee.displayName",
            "components": "components",
            "issue_type": "issuetype.name",
            "status": "status.name",
        },
        "cred_required": True,
    },
    {
        "id": "slack",
        "name": "Slack",
        "type": "messaging",
        "provider": "slack",
        "modes": ["WEBHOOK", "API_PUSH"],
        "events": ["app_mention", "slash_command", "reaction_added", "view_submission"],
        "auth": ["bot_token_reference", "signing_secret_reference"],
        "mcp": "slack",
        "fallback": "Slack Events API",
        "caps": ["command", "reaction_gate", "modal_form", "thread_context"],
        "limitations": ["Not every message is a requirement"],
        "risks": ["Channel spam, unauthorized users"],
        "mapping": {
            "workspace": "team_id",
            "channel": "channel_id",
            "thread": "thread_ts",
            "user": "user_id",
            "message": "text",
            "attachments": "files",
            "command": "command",
            "reactions": "reaction",
            "timestamp": "ts",
        },
        "authz": [
            "authorized_command",
            "authorized_reaction",
            "authorized_channel",
            "modal_form",
            "authorized_role",
        ],
        "cred_required": True,
    },
    {
        "id": "microsoft-teams",
        "name": "Microsoft Teams",
        "type": "messaging",
        "provider": "microsoft",
        "modes": ["WEBHOOK", "API_PUSH"],
        "events": ["message", "adaptive_card_submit", "channel_mention"],
        "auth": ["azure_ad_app_reference"],
        "mcp": "microsoft-teams",
        "fallback": "Bot Framework / Graph API",
        "caps": ["adaptive_card", "channel_filter"],
        "limitations": ["Tenant admin consent"],
        "risks": ["Cross-tenant spoofing"],
        "mapping": {
            "tenant": "tenant_id",
            "team": "team_id",
            "channel": "channel_id",
            "conversation": "conversation_id",
            "user": "from.id",
            "adaptive_card": "value",
            "message": "text",
            "attachments": "attachments",
        },
        "cred_required": True,
    },
    {
        "id": "github-issue",
        "name": "GitHub Issue",
        "type": "vcs_issue",
        "provider": "github",
        "modes": ["WEBHOOK", "POLLING"],
        "events": ["issues.opened", "issues.edited", "issues.labeled"],
        "auth": ["app_or_pat_reference"],
        "mcp": "github",
        "fallback": "GitHub REST API",
        "caps": ["webhook", "polling", "fetch_attachments", "link_pr"],
        "limitations": ["Private repo permissions"],
        "risks": ["Malicious issue body or scripts"],
        "mapping": {
            "repository": "repository.full_name",
            "external_reference": "issue.number",
            "title": "issue.title",
            "description": "issue.body",
            "labels": "issue.labels",
            "assignee": "issue.assignee.login",
            "milestone": "issue.milestone.title",
            "branch_reference": "issue.pull_request.head.ref",
            "pull_request_reference": "issue.pull_request.url",
        },
        "cred_required": True,
    },
    {
        "id": "gitlab-issue",
        "name": "GitLab Issue",
        "type": "vcs_issue",
        "provider": "gitlab",
        "modes": ["WEBHOOK", "POLLING"],
        "events": ["Issue Hook", "Note Hook"],
        "auth": ["token_reference"],
        "mcp": "gitlab",
        "fallback": "GitLab REST API",
        "caps": ["webhook", "polling"],
        "limitations": ["Self-managed URL variance"],
        "risks": ["Webhook secret missing"],
        "mapping": {
            "repository": "project.path_with_namespace",
            "external_reference": "object_attributes.iid",
            "title": "object_attributes.title",
            "description": "object_attributes.description",
            "labels": "labels",
            "assignee": "assignees",
            "milestone": "object_attributes.milestone_id",
        },
        "cred_required": True,
    },
    {
        "id": "bitbucket",
        "name": "Bitbucket Issue",
        "type": "vcs_issue",
        "provider": "atlassian",
        "modes": ["WEBHOOK", "POLLING"],
        "events": ["issue:created", "issue:updated"],
        "auth": ["app_password_reference", "oauth2"],
        "mcp": "bitbucket",
        "fallback": "Bitbucket REST API",
        "caps": ["webhook", "polling"],
        "limitations": ["Cloud vs Data Center"],
        "risks": ["Workspace mis-scoping"],
        "mapping": {
            "repository": "repository.full_name",
            "external_reference": "issue.id",
            "title": "issue.title",
            "description": "issue.content.raw",
            "labels": "issue.labels",
            "assignee": "issue.assignee.display_name",
        },
        "cred_required": True,
    },
    {
        "id": "email",
        "name": "Email Inbound",
        "type": "email",
        "provider": "smtp_imap",
        "modes": ["EMAIL_INBOUND", "POLLING"],
        "events": ["message_received"],
        "auth": ["mailbox_credential_reference"],
        "mcp": "email",
        "fallback": "IMAP/Graph Mail API",
        "caps": ["allowlist_sender", "attachment_fetch"],
        "limitations": ["HTML sanitization required"],
        "risks": ["Phishing, malware attachments"],
        "mapping": {
            "external_reference": "message_id",
            "requester": "from",
            "recipients": "to",
            "title": "subject",
            "description": "text_body",
            "html_reference": "sanitized_html_ref",
            "attachments": "attachments",
            "thread_id": "thread_id",
        },
        "cred_required": True,
    },
    {
        "id": "generic-webhook",
        "name": "Generic Webhook",
        "type": "webhook",
        "provider": "any",
        "modes": ["WEBHOOK"],
        "events": ["webhook_received"],
        "auth": ["hmac_signature_reference", "bearer_reference"],
        "mcp": "generic-webhook",
        "fallback": "HTTP listener",
        "caps": [
            "schema_validation",
            "idempotency_key",
            "correlation_id",
            "rate_limit",
        ],
        "limitations": ["Caller must version payload"],
        "risks": ["Unsigned payloads"],
        "mapping": {
            "title": "payload.title",
            "description": "payload.description",
            "external_reference": "payload.id",
            "priority": "payload.priority",
            "idempotency_key": "headers.Idempotency-Key",
            "correlation_id": "headers.X-Correlation-Id",
        },
        "cred_required": True,
    },
    {
        "id": "rest-api",
        "name": "REST API",
        "type": "api",
        "provider": "nadf",
        "modes": ["API_PUSH"],
        "events": ["api_requirement_created"],
        "auth": ["oauth2", "api_key_reference"],
        "mcp": "rest-api",
        "fallback": "NADF Intake HTTP API",
        "caps": [
            "versioned_payload",
            "schema_validation",
            "idempotency_key",
            "correlation_id",
            "rate_limit",
        ],
        "limitations": ["Client contract versioning"],
        "risks": ["Abuse without rate limit"],
        "mapping": {
            "title": "body.title",
            "description": "body.description",
            "acceptance_criteria": "body.acceptance_criteria",
            "priority": "body.priority",
            "requester": "body.requester",
            "external_reference": "body.external_id",
        },
        "cred_required": True,
    },
    {
        "id": "file-upload",
        "name": "File Upload",
        "type": "file",
        "provider": "nadf",
        "modes": ["FILE_UPLOAD"],
        "events": ["file_uploaded"],
        "auth": ["session_or_signed_url"],
        "mcp": None,
        "fallback": "filesystem upload gateway",
        "caps": ["type_allowlist", "size_limit", "virus_scan_hook"],
        "limitations": ["No macro or script execution; PDF as documentary reference only"],
        "risks": ["Malicious files"],
        "mapping": {
            "title": "metadata.title",
            "description": "extracted_text_or_ref",
            "attachments": "file",
            "external_reference": "file_id",
        },
        "allowed": ["md", "txt", "json", "yaml", "yml", "csv", "pdf"],
        "cred_required": False,
    },
    {
        "id": "servicenow",
        "name": "ServiceNow",
        "type": "itsm",
        "provider": "servicenow",
        "modes": ["WEBHOOK", "POLLING"],
        "events": ["incident_created", "incident_updated", "story_created"],
        "auth": ["oauth2", "basic_ref"],
        "mcp": "servicenow",
        "fallback": "ServiceNow Table API",
        "caps": ["webhook", "polling", "update_external_status"],
        "limitations": ["Custom table schemas"],
        "risks": ["Over-privileged integration user"],
        "mapping": {
            "table": "sys_class_name",
            "external_reference": "number",
            "sys_id": "sys_id",
            "title": "short_description",
            "description": "description",
            "priority": "priority",
            "status": "state",
            "requester": "caller_id",
            "assignment_group": "assignment_group",
            "acceptance_criteria": "u_acceptance_criteria",
        },
        "cred_required": True,
    },
    {
        "id": "enterprise-form",
        "name": "Enterprise Form",
        "type": "form",
        "provider": "nadf",
        "modes": ["API_PUSH", "WEBHOOK"],
        "events": ["form_submitted"],
        "auth": ["form_signing_reference"],
        "mcp": None,
        "fallback": "form webhook",
        "caps": ["configurable_schema", "field_validation"],
        "limitations": ["Schema must be pre-registered"],
        "risks": ["Field injection"],
        "mapping": {
            "title": "fields.title",
            "description": "fields.description",
            "acceptance_criteria": "fields.acceptance_criteria",
            "priority": "fields.priority",
            "requester": "fields.requester",
            "labels": "fields.labels",
        },
        "cred_required": True,
    },
    {
        "id": "database",
        "name": "Database Events",
        "type": "database",
        "provider": "any_rdbms",
        "modes": ["DATABASE_CDC", "POLLING"],
        "events": ["row_inserted", "row_updated", "cdc_change"],
        "auth": ["db_credential_reference"],
        "mcp": "database-events",
        "fallback": "authorized view polling",
        "caps": ["parameterized_query", "authorized_view", "cdc", "checkpoint"],
        "limitations": ["No arbitrary SQL from agents"],
        "risks": ["Data exfiltration via wide views"],
        "mapping": {
            "external_reference": "row.id",
            "title": "row.title",
            "description": "row.description",
            "priority": "row.priority",
            "status": "row.status",
        },
        "cred_required": True,
    },
    {
        "id": "scheduled-event",
        "name": "Scheduled Event",
        "type": "scheduler",
        "provider": "nadf",
        "modes": ["SCHEDULED"],
        "events": ["schedule_fired"],
        "auth": ["none"],
        "mcp": "scheduler",
        "fallback": "cron runner",
        "caps": ["template_based_requirement"],
        "limitations": ["Produces Requirement from template, never direct Execution"],
        "risks": ["Misconfigured cron flooding"],
        "mapping": {
            "title": "template.title",
            "description": "template.description",
            "acceptance_criteria": "template.acceptance_criteria",
            "priority": "template.priority",
            "external_reference": "schedule_run_id",
        },
        "cred_required": False,
    },
]


def render(s: dict) -> str:
    lines: list[str] = []
    lines.append(f"id: {s['id']}")
    lines.append(f"name: {s['name']}")
    lines.append(f"type: {s['type']}")
    lines.append(f"provider: {s['provider']}")
    lines.append('version: "1.0.0"')
    lines.append("status: active")
    lines.append(
        f"description: Requirement source definition for {s['name']} (see ADR-0007)"
    )
    lines.append("supported_events:")
    for e in s["events"]:
        lines.append(f"  - {e}")
    lines.append("ingestion_modes:")
    for m in s["modes"]:
        lines.append(f"  - {m}")
    lines.append("authentication_modes:")
    for a in s["auth"]:
        lines.append(f"  - {a}")
    lines.append("capabilities:")
    for c in s["caps"]:
        lines.append(f"  - {c}")
    if s.get("authz"):
        lines.append("authorization_gates:")
        for g in s["authz"]:
            lines.append(f"  - {g}")
    if s.get("allowed"):
        lines.append("allowed_file_types:")
        for t in s["allowed"]:
            lines.append(f"  - {t}")
    lines.append("configuration_schema:")
    lines.append("  required:")
    lines.append("    - definition_id")
    lines.append("    - project_id")
    lines.append("    - enabled")
    lines.append("    - ingestion_mode")
    lines.append(f"  credential_required: {str(s['cred_required']).lower()}")
    lines.append("payload_schema:")
    lines.append("  versioned: true")
    lines.append("  must_include:")
    lines.append("    - external_id_or_generated")
    lines.append("    - event_type")
    lines.append("initial_mapping:")
    for k, v in s["mapping"].items():
        lines.append(f"  {k}: {v}")
    lines.append("limitations:")
    for lim in s["limitations"]:
        lines.append(f'  - "{lim}"')
    lines.append("risks:")
    for r in s["risks"]:
        lines.append(f'  - "{r}"')
    mcp = "null" if not s["mcp"] else s["mcp"]
    lines.append(f"mcp_server_recommended: {mcp}")
    lines.append(f'fallback_api: "{s["fallback"]}"')
    lines.append("security:")
    lines.append("  signature_validation: required_when_supported")
    lines.append("  idempotent: true")
    lines.append("  never_auto_execute: true")
    lines.append("  secrets: credential_reference_only")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    out = os.path.abspath(BASE)
    os.makedirs(out, exist_ok=True)
    for s in SOURCES:
        path = os.path.join(out, f"{s['id']}.yml")
        with open(path, "w", encoding="utf-8") as f:
            f.write(render(s))
        print("wrote", path)
    print("done", len(SOURCES))


if __name__ == "__main__":
    main()
