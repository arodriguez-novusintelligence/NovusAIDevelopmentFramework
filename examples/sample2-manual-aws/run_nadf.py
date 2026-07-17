#!/usr/bin/env python3
# NADF-GUIDE
# Propósito: Runner NADF de sample2 — procesa la iniciativa multi-requerimiento con intake,
#            gates de aprobación, pruebas por requerimiento, verificación de deploy y evidencia.
# Configuración: Requiere PyYAML. Usa initiative.yml como entrada; el deploy se verifica vía
#                AWS CLI (stack sample2-calculator-dev) y se marca SKIPPED si no hay stack.
"""NADF governed runner for sample2 (initiative with multiple requirements)."""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

import yaml

SAMPLE_DIR = Path(__file__).resolve().parent
REPO_ROOT = SAMPLE_DIR.parents[1]
REPORTER = REPO_ROOT / "tools" / "nadf-output-reporter" / "reporter.py"
PROJECT_DIR = REPO_ROOT / ".nadf" / "projects" / "sample2-manual-aws"


def load_yaml(path: Path) -> dict:
    with path.open(encoding="utf-8") as stream:
        return yaml.safe_load(stream)


def run_tests(test_paths: list[str]) -> tuple[str, int]:
    start = time.monotonic()
    files = [str(REPO_ROOT / p) for p in test_paths]
    proc = subprocess.run(
        [sys.executable, "-m", "unittest", *files],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    duration = int((time.monotonic() - start) * 1000)
    return ("PASS" if proc.returncode == 0 else "FAILED"), duration


def fetch_stack_endpoints(stack_name: str, region: str) -> dict[str, str] | None:
    """Return CloudFormation outputs (endpoint URLs) if the stack is deployed."""
    if not shutil.which("aws"):
        return None
    proc = subprocess.run(
        ["aws", "cloudformation", "describe-stacks", "--stack-name", stack_name,
         "--region", region, "--query", "Stacks[0].Outputs", "--output", "json"],
        capture_output=True, text=True,
    )
    if proc.returncode != 0 or not proc.stdout.strip():
        return None
    try:
        outputs = json.loads(proc.stdout)
        return {o["OutputKey"]: o["OutputValue"] for o in outputs or []}
    except (json.JSONDecodeError, KeyError, TypeError):
        return None


def main() -> int:
    initiative_file = SAMPLE_DIR / "initiative.yml"
    data = load_yaml(initiative_file)
    initiative = data["initiative"]
    run_id = f"{initiative['id']}-{int(time.time())}"

    if initiative.get("production_deploy") != "forbidden" or initiative.get("environment") != "dev":
        print("BLOCKED: la iniciativa debe ser dev con PROD prohibido")
        return 1

    steps: list[dict] = []
    approvals: list[dict] = []
    endpoints: list[dict] = []
    requirements = []

    # 1. Intake: normaliza cada requerimiento de la iniciativa
    start = time.monotonic()
    for entry in data["requirements"]:
        req = load_yaml(SAMPLE_DIR / entry["file"])
        for field in ("id", "title", "endpoint", "acceptance_criteria", "approval", "tests"):
            if field not in req:
                print(f"BLOCKED: {entry['file']} sin campo obligatorio '{field}'")
                return 1
        requirements.append(req)
    steps.append({
        "id": "intake", "status": "PASS",
        "durationMs": int((time.monotonic() - start) * 1000), "estimatedCostUsd": 0,
        "detail": f"{len(requirements)} requerimientos normalizados de {initiative_file.name}",
    })

    # 2. Gate de aprobación humana por requerimiento
    for req in requirements:
        approval = req["approval"]
        status = "GRANTED" if approval.get("status") == "granted" else "PENDING"
        approvals.append({
            "gate": f"requirement:{req['id']}",
            "status": status,
            "approver": approval.get("approver", "unknown"),
        })
        if status != "GRANTED":
            steps.append({"id": f"gate-{req['id']}", "status": "BLOCKED",
                          "durationMs": 0, "estimatedCostUsd": 0})

    if any(step["status"] == "BLOCKED" for step in steps):
        print("BLOCKED: hay requerimientos sin aprobación humana")
        return 1

    # 3. Ejecución: pruebas unitarias por requerimiento
    for req in requirements:
        status, duration = run_tests(req["tests"])
        steps.append({
            "id": f"tests-{req['id']}", "status": status,
            "durationMs": duration, "estimatedCostUsd": 0,
            "detail": f"{req['endpoint']} — {req['title']}",
        })

    # 4. Verificación de deploy: URLs reales si el stack existe en AWS
    stack = initiative.get("stack_name", "sample2-calculator-dev")
    region = initiative.get("aws_region", "sa-east-1")
    outputs = fetch_stack_endpoints(stack, region)
    url_keys = {"REQ-001-calculadora": "CalculateUrl",
                "REQ-002-historial": "HistoryUrl",
                "REQ-003-health": "HealthUrl"}
    if outputs:
        for req in requirements:
            url = outputs.get(url_keys.get(req["id"], ""), outputs.get("ApiUrl", ""))
            endpoints.append({"requirement": req["id"], "api": req["endpoint"], "url": url})
        steps.append({"id": "deploy-dev", "status": "PASS", "durationMs": 0,
                      "estimatedCostUsd": 0, "detail": f"stack {stack} desplegado en {region}"})
    else:
        for req in requirements:
            endpoints.append({
                "requirement": req["id"], "api": req["endpoint"],
                "url": f"PENDIENTE-DEPLOY (ejecutar workflow samples-dev con sample2; stack {stack})",
            })
        steps.append({"id": "deploy-dev", "status": "SKIPPED", "durationMs": 0,
                      "estimatedCostUsd": 0,
                      "detail": "sin stack en AWS; URLs disponibles tras el deploy aprobado"})

    # 5. Evidencia: genera el run y lo publica con el output reporter
    run_payload = {
        "schemaVersion": "1.0",
        "projectId": "sample2-manual-aws",
        "runId": run_id,
        "source": {"adapter": "manual", "reference": "initiative.yml",
                   "initiative": initiative["id"]},
        "environment": "dev",
        "humanWaitMs": 0,
        "estimatedTokens": 0,
        "skippedAgents": ["frontend", "visual-parity"],
        "approvals": approvals,
        "steps": steps,
        "endpoints": endpoints,
        "artifacts": [
            "examples/sample2-manual-aws/template.yml",
            "examples/sample2-manual-aws/initiative.yml",
        ],
    }
    run_file = SAMPLE_DIR / "last-run.json"
    run_file.write_text(json.dumps(run_payload, indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8")
    result = subprocess.run(
        [sys.executable, str(REPORTER), "--input", str(run_file),
         "--project-dir", str(PROJECT_DIR)],
        cwd=REPO_ROOT,
    )

    print("\n=== Endpoints REST de la iniciativa ===")
    for endpoint in endpoints:
        print(f"  {endpoint['requirement']}: {endpoint['api']} -> {endpoint['url']}")
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
