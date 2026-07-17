#!/usr/bin/env python3
"""NADF repository validator — v1.1.0-rc.1 stabilization."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

SECRET_PATTERNS = [
    re.compile(r"(?i)(api[_-]?key|secret|password|token)\s*=\s*['\"]?[A-Za-z0-9_\-]{16,}"),
    re.compile(r"crsr_[A-Za-z0-9]{20,}"),
    re.compile(r"ghp_[A-Za-z0-9]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
]

SKIP_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "__pycache__",
    ".venv",
    "coverage",
    "prototypes",  # contains local .env by design; scanned separately for gitignore
}


def load_yaml_simple(text: str) -> dict:
    """Minimal YAML subset loader for our catalogs (no external deps)."""
    try:
        import yaml  # type: ignore

        return yaml.safe_load(text) or {}
    except Exception:
        # Fallback: only support our shallow catalogs poorly — require pyyaml ideally
        return {}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def build_schema_registry(schemas_dir: Path):
    """Offline-capable registry so $ref resolves without network."""
    from referencing import Registry, Resource

    registry: Registry = Registry()
    for path in schemas_dir.glob("*.schema.json"):
        contents = json.loads(read(path))
        resource = Resource.from_contents(contents)
        schema_id = contents.get("$id") or path.name
        registry = registry.with_resource(schema_id, resource)
        registry = registry.with_resource(path.name, resource)
    return registry


def validate_instance(instance: dict, schema: dict, registry) -> None:
    import jsonschema

    validator = jsonschema.Draft202012Validator(schema, registry=registry)
    validator.validate(instance)


class Validator:
    def __init__(self, root: Path):
        self.root = root
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def err(self, code: str, msg: str) -> None:
        self.errors.append(f"{code}: {msg}")

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)

    def validate_manifest(self) -> None:
        p = self.root / "nadf-manifest.yml"
        if not p.exists():
            self.err("NADF-CMP-001", "nadf-manifest.yml missing")
            return
        text = read(p)
        if "1.1.0-rc.1" not in text:
            self.err("NADF-CMP-001", "manifest must declare version 1.1.0-rc.1")

    def validate_agent_parity(self) -> None:
        agents = {p.stem for p in (self.root / ".claude/agents").glob("*.md")}
        skills = {p.stem for p in (self.root / ".nadf/global/skill-registry").glob("*.yml")}
        for a in sorted(agents - skills):
            self.err("NADF-AGT-001", f"agent without skill: {a}")
        for s in sorted(skills - agents):
            self.err("NADF-AGT-001", f"skill without agent md: {s}")
        if len(agents) < 27:
            self.warn(f"expected >=27 agents, found {len(agents)}")

    def validate_schemas(self) -> None:
        schemas = self.root / "schemas"
        required = [
            "raw-requirement-event.schema.json",
            "requirement.schema.json",
            "intent.schema.json",
            "mission.schema.json",
            "execution-plan.schema.json",
            "execution.schema.json",
            "traceability-link.schema.json",
            "credential-reference.schema.json",
        ]
        for name in required:
            if not (schemas / name).exists():
                self.err("NADF-SCH-001", f"missing schema {name}")
                continue
            try:
                json.loads(read(schemas / name))
            except json.JSONDecodeError as e:
                self.err("NADF-SCH-001", f"invalid JSON {name}: {e}")

        # Fixtures
        fix = self.root / "tests/schemas"
        if fix.exists():
            try:
                import jsonschema  # type: ignore  # noqa: F401
                from referencing import Registry  # type: ignore  # noqa: F401
            except ImportError:
                self.warn("jsonschema/referencing not installed; skipping instance validation")
                return
            registry = build_schema_registry(schemas)
            for valid in (fix / "valid").glob("*.json"):
                data = json.loads(read(valid))
                schema_name = data.get("$schemaRef")
                if not schema_name:
                    continue
                schema = json.loads(read(schemas / schema_name))
                try:
                    validate_instance(data["instance"], schema, registry)
                except Exception as e:
                    self.err("NADF-VAL-001", f"valid fixture failed {valid.name}: {e}")
            for invalid in (fix / "invalid").glob("*.json"):
                data = json.loads(read(invalid))
                schema_name = data.get("$schemaRef")
                schema = json.loads(read(schemas / schema_name))
                try:
                    validate_instance(data["instance"], schema, registry)
                    self.err(
                        "NADF-VAL-001",
                        f"invalid fixture unexpectedly passed {invalid.name}",
                    )
                except Exception:
                    pass

    def validate_state_machines(self) -> None:
        sm_dir = self.root / ".nadf/global/state-machines"
        if not sm_dir.exists():
            self.err("NADF-EXE-001", "state-machines directory missing")
            return
        count = len(list(sm_dir.glob("*.yml")))
        if count < 8:
            self.err("NADF-EXE-001", f"expected >=8 state machines, found {count}")
        # Transition sample checks via embedded tests file
        tests = self.root / "tests/state-machines/transitions.json"
        if tests.exists():
            data = json.loads(read(tests))
            for case in data.get("cases", []):
                sm_path = sm_dir / case["machine"]
                text = read(sm_path)
                transitions = re.findall(r"-\s*\[([A-Z_]+),\s*([A-Z_]+)\]", text)
                pair = (case["from"], case["to"])
                allowed = {(a, b) for a, b in transitions}
                if case.get("expect") == "allow" and pair not in allowed:
                    self.err(
                        "NADF-EXE-001",
                        f"expected allow {pair} in {case['machine']}",
                    )
                if case.get("expect") == "deny" and pair in allowed:
                    self.err(
                        "NADF-EXE-001",
                        f"expected deny {pair} in {case['machine']}",
                    )

    def validate_event_catalog(self) -> None:
        p = self.root / ".nadf/global/event-catalog.yml"
        if not p.exists():
            self.err("NADF-WF-001", "event-catalog.yml missing")
            return
        text = read(p)
        for required in [
            "requirement.manual.received",
            "intent.created.v1",
            "execution.completed.v1",
            "lovable.commit",
        ]:
            if required not in text:
                self.err("NADF-WF-001", f"event not cataloged: {required}")

        # Workflow requirement-intake triggers must be cataloged
        wf = self.root / ".nadf/global/workflow-library/requirement-intake.yml"
        if wf.exists():
            for line in read(wf).splitlines():
                line = line.strip()
                if line.startswith("- event:"):
                    ev = line.split(":", 1)[1].strip()
                    if ev not in text:
                        self.err("NADF-WF-001", f"workflow event not in catalog: {ev}")

    def validate_error_catalog(self) -> None:
        p = self.root / ".nadf/global/error-catalog.yml"
        if not p.exists():
            self.err("NADF-SCH-001", "error-catalog.yml missing")
            return
        if "NADF-SEC-001" not in read(p):
            self.err("NADF-SEC-001", "error catalog missing NADF-SEC-001")

    def validate_security(self) -> None:
        gitignore = self.root / ".gitignore"
        if not gitignore.exists():
            self.err("NADF-SEC-002", ".gitignore missing")
        else:
            gi = read(gitignore)
            for token in [".env", "node_modules", "__pycache__", "dist"]:
                if token not in gi:
                    self.err("NADF-SEC-002", f".gitignore missing pattern {token}")

        # Scan tracked-like files (skip heavy dirs)
        for path in self.root.rglob("*"):
            if not path.is_file():
                continue
            if any(part in SKIP_DIRS for part in path.parts):
                continue
            if path.suffix.lower() not in {
                ".md",
                ".yml",
                ".yaml",
                ".json",
                ".py",
                ".ts",
                ".js",
                ".env",
                ".txt",
            }:
                continue
            if path.name.startswith(".env") and path.name != ".env.example":
                # local env files should not be committed; warn if present
                self.warn(f"local env file present (ensure not committed): {path.relative_to(self.root)}")
                continue
            try:
                text = read(path)
            except Exception:
                continue
            # Skip pure documentation/catalogs that discuss secrets conceptually
            rel = str(path.relative_to(self.root)).replace("\\", "/")
            if any(
                part in rel
                for part in (
                    "docs/",
                    "artifacts/",
                    "CHANGELOG",
                    "SECURITY",
                    "error-catalog",
                    "requirement-intake-security",
                    ".env.example",
                )
            ):
                continue
            for pat in SECRET_PATTERNS:
                if pat.search(text):
                    if "crsr_" in text or "ghp_" in text or "AKIA" in text:
                        self.err(
                            "NADF-SEC-002",
                            f"possible secret material in {path.relative_to(self.root)}",
                        )
                        break

    def validate_compatibility(self) -> None:
        projects = self.root / ".nadf/projects"
        contexts = sorted(projects.glob("*/project-context.yml"))
        if not contexts:
            self.err("NADF-CMP-001", "at least one project context or sample is required")
            return
        for pc in contexts:
            text = read(pc)
            if not any(
                token in text
                for token in ("metaModel", "meta_model", "metaModelVersion", "project:")
            ):
                self.warn(f"{pc.parent.name}: project-context lacks version/project metadata")

    def validate_golden_path(self) -> None:
        gp = self.root / "examples/golden-path-manual-requirement"
        if not gp.exists():
            self.err("NADF-VAL-001", "golden-path-manual-requirement missing")
            return
        for name in [
            "01-raw-event.json",
            "02-requirement.json",
            "03-intent.json",
            "04-mission.json",
            "05-execution-plan.json",
            "06-execution.json",
            "07-artifact.json",
            "08-traceability.json",
            "README.md",
        ]:
            if not (gp / name).exists():
                self.err("NADF-VAL-001", f"golden path missing {name}")
        fail = self.root / "examples/golden-failure-missing-credential"
        if not (fail / "result.yml").exists():
            self.err("NADF-SEC-001", "golden failure path missing result.yml")
            return
        fail_text = read(fail / "result.yml")
        if "NADF-SEC-001" not in fail_text or "BLOCKED" not in fail_text:
            self.err("NADF-SEC-001", "golden failure must report BLOCKED + NADF-SEC-001")

        # Instance + traceability integrity
        try:
            import jsonschema  # type: ignore  # noqa: F401
        except ImportError:
            self.warn("jsonschema not installed; skipping golden instance validation")
            return
        schemas = self.root / "schemas"
        registry = build_schema_registry(schemas)
        pairs = [
            ("01-raw-event.json", "raw-requirement-event.schema.json"),
            ("02-requirement.json", "requirement.schema.json"),
            ("03-intent.json", "intent.schema.json"),
            ("04-mission.json", "mission.schema.json"),
            ("05-execution-plan.json", "execution-plan.schema.json"),
            ("06-execution.json", "execution.schema.json"),
            ("07-artifact.json", "artifact.schema.json"),
        ]
        for fname, sname in pairs:
            path = gp / fname
            if not path.exists():
                continue
            try:
                validate_instance(
                    json.loads(read(path)),
                    json.loads(read(schemas / sname)),
                    registry,
                )
            except Exception as e:
                self.err("NADF-VAL-001", f"golden path schema fail {fname}: {e}")
        trace = gp / "08-traceability.json"
        if trace.exists():
            links = json.loads(read(trace))
            blob = json.dumps(links)
            for token in [
                "REQ-2026-000001",
                "INT-2026-000001",
                "MIS-2026-000001",
                "PLAN-2026-000001",
                "EXEC-2026-000001",
                "ART-2026-000001",
            ]:
                if token not in blob:
                    self.err("NADF-VAL-001", f"golden traceability missing {token}")

    def validate_intake_fixtures(self) -> None:
        script = self.root / "tools/validators/requirement_intake_validator.py"
        if not script.exists():
            self.warn("requirement_intake_validator.py missing")
            return
        import subprocess

        proc = subprocess.run(
            [sys.executable, str(script)],
            cwd=str(self.root),
            capture_output=True,
            text=True,
        )
        if proc.returncode != 0:
            self.err("NADF-VAL-001", f"intake fixture validator failed:\n{proc.stdout}\n{proc.stderr}")

    def run(self, only: str | None = None) -> int:
        mapping = {
            "manifest": self.validate_manifest,
            "agents": self.validate_agent_parity,
            "schemas": self.validate_schemas,
            "states": self.validate_state_machines,
            "events": self.validate_event_catalog,
            "errors": self.validate_error_catalog,
            "security": self.validate_security,
            "compatibility": self.validate_compatibility,
            "golden": self.validate_golden_path,
            "intake": self.validate_intake_fixtures,
        }
        if only:
            keys = [only]
        else:
            keys = list(mapping.keys())
        for k in keys:
            mapping[k]()
        print("=== NADF Validator ===")
        print(f"Root: {self.root}")
        for w in self.warnings:
            print(f"  [WARN] {w}")
        for e in self.errors:
            print(f"  [ERROR] {e}")
        print(f"Warnings: {len(self.warnings)}  Errors: {len(self.errors)}")
        print("RESULT:", "FAILED" if self.errors else "PASSED")
        return 1 if self.errors else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="nadf-validate")
    parser.add_argument(
        "command",
        nargs="?",
        default="repository",
        choices=[
            "validate",
            "repository",
            "project",
            "meta-model",
            "workflow",
            "agent",
            "artifact",
            "event",
            "requirement-source",
            "traceability",
            "compatibility",
            "security",
            "schemas",
            "states",
            "golden",
            "intake",
            "manifest",
            "errors",
            "agents",
        ],
    )
    args = parser.parse_args(argv)
    cmd = args.command
    if cmd in {"validate", "repository"}:
        only = None
    elif cmd == "project":
        only = "compatibility"
    elif cmd == "meta-model":
        only = "schemas"
    elif cmd == "workflow":
        only = "events"
    elif cmd == "agent":
        only = "agents"
    elif cmd == "artifact":
        only = "schemas"
    elif cmd == "event":
        only = "events"
    elif cmd == "requirement-source":
        only = "intake"
    elif cmd == "traceability":
        only = "golden"
    else:
        only = cmd
    return Validator(ROOT).run(only)


if __name__ == "__main__":
    raise SystemExit(main())
