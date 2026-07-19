#!/usr/bin/env python3
# NADF-GUIDE
# Propósito: Ciclo NADF light/automático para sample2 — intake → 1 Cloud Agent → verify →
#            deploy DEV sin aprobaciones → smoke REST → entregables en .nadf/.../output.
# Configuración: CURSOR_API_KEY en el entorno; AWS CLI autenticado; pip install cursor-sdk PyYAML.
#                Modo approval_mode=automatic (sin gates humanos).
"""NADF light automatic cycle for sample2."""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
SAMPLE_DIR = REPO_ROOT / "examples" / "sample2-manual-aws"
PROJECT_DIR = REPO_ROOT / ".nadf" / "projects" / "sample2-manual-aws"
OUTPUT_DIR = PROJECT_DIR / "output"
REPORTER = REPO_ROOT / "tools" / "nadf-output-reporter" / "reporter.py"
DEFAULT_TARGET = "https://github.com/arodriguez-novusintelligence/sample2.git"
WORKTREE = Path(
    os.environ.get("NADF_WORKTREE", str(REPO_ROOT.parent / "sample2-work"))
).resolve()


def load_yaml(path: Path) -> dict:
    with path.open(encoding="utf-8") as stream:
        return yaml.safe_load(stream)


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def step(steps: list[dict], step_id: str, status: str, start: float, detail: str = "", **extra) -> None:
    entry = {
        "id": step_id,
        "status": status,
        "durationMs": int((time.monotonic() - start) * 1000),
        "estimatedCostUsd": 0,
        "detail": detail,
    }
    entry.update(extra)
    steps.append(entry)
    print(f"[{status}] {step_id}: {detail}")


def complexity_routing_for_sample2(requirements: list[dict]) -> dict:
    """Minimum Sufficient Execution: sample2 light = develop → test → deploy (sin arquitectura)."""
    blob = " ".join(
        f"{r.get('title', '')} {r.get('description', '')}" for r in requirements
    ).lower()
    critical = any(
        k in blob
        for k in ("auth", "payment", "migración", "migration", "producción", "production", "pii")
    )
    if critical:
        profile = "FULL"
        lightweight = False
        rationale = ["Criticality override detectado en requerimientos; no usar light cycle ciego."]
    else:
        profile = "LIGHTWEIGHT_BACKEND"
        lightweight = True
        rationale = [
            "Ciclo sample2 light: un Cloud Agent + unit tests + SAM deploy + smoke REST.",
            "Omitidos: architecture, frontend design, knowledge-base, reflection.",
        ]
    decision = {
        "profile": profile,
        "route": "full" if not lightweight else "selective",
        "lightweight": lightweight,
        "level": "HIGH" if critical else "LOW",
        "mode": "FULL" if critical else "SELECTIVE",
        "selectedAgents": ["cloud-agent"] if lightweight else ["all_applicable"],
        "excludedDomains": (
            ["architecture", "frontend_design", "knowledge", "reflection"]
            if lightweight
            else []
        ),
        "deployTargets": ["sample2-aws-dev"],
        "requiresHumanApproval": critical,
        "confidence": 0.9 if lightweight else 0.95,
        "rationale": rationale,
        "changeTypes": [r.get("id", "") for r in requirements],
        "criticalityOverride": critical,
        "source": "sample2-fast-cycle",
    }
    write_json(OUTPUT_DIR / "routing-decision.json", decision)
    return decision


def build_agent_prompt(initiative: dict, requirements: list[dict]) -> str:
    req_block = "\n".join(
        f"- {r['id']}: {r['endpoint']} — {r['title']}\n"
        f"  {r['description']}\n"
        f"  Criterios: {'; '.join(r['acceptance_criteria'])}"
        for r in requirements
    )
    return f"""Eres el agente backend/cloud del NADF (modo light automático).

Iniciativa: {initiative['id']} — {initiative['title']}
Entorno: {initiative['environment']} (PROD prohibido)
Stack: {initiative.get('stack_name')} · región {initiative.get('aws_region')}

Requerimientos:
{req_block}

Genera y COMMIT en main (directo, sin PR) el código fuente completo de esta app serverless:

1. `src/calculator.py` — handler Lambda Python 3.12:
   - POST /calculate: body JSON {{operation, left, right}} con add/subtract/multiply/divide
   - GET /health: {{status: ok, service: sample2-calculator}}
   - División por cero → 400; errores de input → 400
   - Persistencia opcional en DynamoDB si env TABLE_NAME está definida (put_item con id, operation, left, right, result)

2. `src/history.py` — handler Lambda:
   - GET /history: scan DynamoDB (Limit 50) o lista vacía sin TABLE_NAME
   - Respuesta {{items, count}}

3. `template.yml` — AWS SAM:
   - HTTP API + DynamoDB sample2-calculations-${{Stage}} + 2 Functions (calculator y history)
   - Stage solo AllowedValues: [dev]
   - Events: POST /calculate, GET /health, GET /history
   - Outputs: ApiUrl, CalculateUrl, HistoryUrl, HealthUrl

4. `tests/test_calculator.py` y `tests/test_history.py` — unittest sin AWS real

5. Actualiza README.md con cómo construir/desplegar

Restricciones: solo este repo; no secretos; no PROD; prefijo sample2-*.
Al terminar, confirma los archivos creados en el mensaje final.
"""


def load_api_key() -> str:
    """Resolve CURSOR_API_KEY from env or local .env.nadf (never committed)."""
    key = os.environ.get("CURSOR_API_KEY", "").strip()
    if key:
        return key
    for candidate in (REPO_ROOT / ".env.nadf", Path.home() / ".nadf" / "cursor.env"):
        if not candidate.exists():
            continue
        for line in candidate.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("CURSOR_API_KEY="):
                value = line.split("=", 1)[1].strip().strip('"').strip("'")
                if value:
                    return value
    return ""


def invoke_cloud_agent(prompt: str, repo_url: str, model: str) -> dict:
    """Invoke the TypeScript Cursor Cloud Agent and auto-merge its generated PR."""
    api_key = load_api_key()
    if not api_key:
        raise RuntimeError(
            "CURSOR_API_KEY no está definida. Opciones:\n"
            "  1) setx CURSOR_API_KEY cursor_...  (nueva terminal)\n"
            "  2) crear NovusAIDevelopmentFramework/.env.nadf con CURSOR_API_KEY=cursor_...\n"
            "  3) re-ejecutar: python tools/nadf-fast-cycle/run_auto.py"
        )

    start = time.monotonic()
    runtime_dir = REPO_ROOT / "prototypes" / "m6-cloud-agent"
    prompt_file = OUTPUT_DIR / "agent-prompt.txt"
    prompt_file.parent.mkdir(parents=True, exist_ok=True)
    prompt_file.write_text(prompt, encoding="utf-8")
    env = os.environ.copy()
    env.update({
        "CURSOR_API_KEY": api_key,
        "NADF_PROMPT_FILE": str(prompt_file),
        "NADF_TARGET_REPO": repo_url,
        "NADF_MODEL": model,
    })
    node = shutil.which("node")
    tsx_cli = runtime_dir / "node_modules" / "tsx" / "dist" / "cli.mjs"
    if not node or not tsx_cli.exists():
        raise RuntimeError("Node/tsx no disponible en prototypes/m6-cloud-agent")
    process = subprocess.run(
        [node, str(tsx_cli), "src/invoke-sample2-fast.ts"],
        cwd=runtime_dir,
        env=env,
        capture_output=True,
        text=True,
    )
    output = (process.stdout or "") + (process.stderr or "")
    if output:
        print(output)

    marker = "NADF_AGENT_RESULT="
    result_line = next(
        (line[len(marker):] for line in reversed(output.splitlines()) if line.startswith(marker)),
        "",
    )
    try:
        result = json.loads(result_line) if result_line else {}
    except json.JSONDecodeError:
        result = {}
    if process.returncode != 0 or result.get("status") != "PASS":
        return {
            "status": "FAILED",
            "agentId": result.get("agentId"),
            "runId": result.get("runId"),
            "durationMs": int((time.monotonic() - start) * 1000),
            "summary": result.get("summary") or output[-800:] or "Cloud Agent failed",
        }

    # Fast mode: the Cloud Agent opens a PR and NADF merges it automatically.
    repo_slug = repo_url.removesuffix(".git").split("github.com/")[-1]
    pr_query = subprocess.run(
        [
            "gh", "pr", "list", "-R", repo_slug, "--state", "open",
            "--json", "number,url,createdAt", "--limit", "10",
        ],
        capture_output=True,
        text=True,
    )
    try:
        prs = json.loads(pr_query.stdout) if pr_query.returncode == 0 else []
    except json.JSONDecodeError:
        prs = []
    if not prs:
        # In automatic mode the agent can honor the prompt and push straight to main.
        remote_check = subprocess.run(
            [
                "gh", "api", f"repos/{repo_slug}/contents/src/calculator.py",
                "--jq", ".path",
            ],
            capture_output=True,
            text=True,
        )
        if remote_check.returncode == 0:
            return {
                **result,
                "status": "PASS",
                "delivery": "direct-main",
                "durationMs": int((time.monotonic() - start) * 1000),
                "summary": f"{result.get('summary', 'finished')} | entregado directo a main",
            }
        return {
            **result,
            "status": "FAILED",
            "durationMs": int((time.monotonic() - start) * 1000),
            "summary": "Cloud Agent terminó sin PR ni código verificable en main",
        }
    latest = sorted(prs, key=lambda item: item.get("createdAt", ""), reverse=True)[0]
    merge = subprocess.run(
        [
            "gh", "pr", "merge", str(latest["number"]), "-R", repo_slug,
            "--squash", "--delete-branch",
        ],
        capture_output=True,
        text=True,
    )
    if merge.returncode != 0:
        return {
            **result,
            "status": "FAILED",
            "pr": latest.get("url"),
            "durationMs": int((time.monotonic() - start) * 1000),
            "summary": f"No se pudo auto-merge PR: {(merge.stderr or merge.stdout)[-500:]}",
        }
    return {
        **result,
        "status": "PASS",
        "pr": latest.get("url"),
        "durationMs": int((time.monotonic() - start) * 1000),
        "summary": f"{result.get('summary', 'finished')} | auto-merged {latest.get('url')}",
    }


def sync_worktree(repo_url: str) -> Path:
    if WORKTREE.exists():
        subprocess.run(["git", "fetch", "origin"], cwd=WORKTREE, check=False)
        subprocess.run(["git", "checkout", "main"], cwd=WORKTREE, check=False)
        subprocess.run(["git", "pull", "--ff-only", "origin", "main"], cwd=WORKTREE, check=False)
    else:
        subprocess.run(["git", "clone", repo_url, str(WORKTREE)], check=True)
    return WORKTREE


def expected_files_present(root: Path) -> list[str]:
    expected = [
        "src/calculator.py",
        "src/history.py",
        "template.yml",
        "tests/test_calculator.py",
        "tests/test_history.py",
    ]
    return [p for p in expected if not (root / p).exists()]


def run_unit_tests(root: Path) -> tuple[str, int, str]:
    start = time.monotonic()
    proc = subprocess.run(
        [sys.executable, "-m", "unittest", "discover", "-s", "tests"],
        cwd=root,
        capture_output=True,
        text=True,
    )
    duration = int((time.monotonic() - start) * 1000)
    detail = (proc.stdout or "") + (proc.stderr or "")
    return ("PASS" if proc.returncode == 0 else "FAILED"), duration, detail[-500:]


def ensure_sam() -> str:
    sam = shutil.which("sam")
    if sam:
        return sam
    print("[nadf] instalando aws-sam-cli …")
    subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "aws-sam-cli"], check=True)
    sam = shutil.which("sam")
    if not sam:
        # Windows Scripts path
        scripts = Path(sys.executable).parent / "Scripts" / "sam.exe"
        if scripts.exists():
            return str(scripts)
        raise RuntimeError("sam CLI no disponible tras pip install aws-sam-cli")
    return sam


def deploy_stack(root: Path, stack: str, region: str) -> tuple[str, int, dict[str, str]]:
    start = time.monotonic()
    sam = ensure_sam()
    build = subprocess.run([sam, "build", "-t", "template.yml"], cwd=root, capture_output=True, text=True)
    if build.returncode != 0:
        return "FAILED", int((time.monotonic() - start) * 1000), {"error": build.stderr[-800:]}
    deploy_args = [
        sam, "deploy",
        "--stack-name", stack,
        "--region", region,
        "--capabilities", "CAPABILITY_IAM",
        "--no-confirm-changeset",
        "--no-fail-on-empty-changeset",
        "--tags", "nadf-example=sample2",
    ]
    sam_bucket = os.environ.get("NADF_SAM_BUCKET", "").strip()
    deploy_args.extend(["--s3-bucket", sam_bucket] if sam_bucket else ["--resolve-s3"])
    deploy = subprocess.run(
        deploy_args,
        cwd=root,
        capture_output=True,
        text=True,
    )
    duration = int((time.monotonic() - start) * 1000)
    if deploy.returncode != 0:
        return "FAILED", duration, {"error": (deploy.stderr or deploy.stdout)[-1200:]}
    outputs = fetch_stack_endpoints(stack, region) or {}
    return "PASS", duration, outputs


def fetch_stack_endpoints(stack_name: str, region: str) -> dict[str, str] | None:
    if not shutil.which("aws"):
        return None
    proc = subprocess.run(
        [
            "aws", "cloudformation", "describe-stacks",
            "--stack-name", stack_name, "--region", region,
            "--query", "Stacks[0].Outputs", "--output", "json",
        ],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0 or not proc.stdout.strip():
        return None
    try:
        outputs = json.loads(proc.stdout)
        return {o["OutputKey"]: o["OutputValue"] for o in outputs or []}
    except (json.JSONDecodeError, KeyError, TypeError):
        return None


def http_json(method: str, url: str, body: dict | None = None, timeout: int = 20) -> tuple[int, dict]:
    data = None
    headers = {"content-type": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as err:
        raw = err.read().decode("utf-8")
        try:
            payload = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            payload = {"error": raw}
        return err.code, payload


def smoke_tests(urls: dict[str, str]) -> tuple[str, list[dict]]:
    results: list[dict] = []
    calc = urls.get("CalculateUrl")
    hist = urls.get("HistoryUrl")
    health = urls.get("HealthUrl")
    ok = True

    if health:
        code, payload = http_json("GET", health)
        passed = code == 200 and payload.get("status") == "ok"
        ok = ok and passed
        results.append({"api": "GET /health", "url": health, "statusCode": code, "pass": passed, "body": payload})

    if calc:
        code, payload = http_json("POST", calc, {"operation": "add", "left": 2, "right": 3})
        passed = code == 200 and str(payload.get("result")) in {"5", "5.0"}
        ok = ok and passed
        results.append({"api": "POST /calculate add", "url": calc, "statusCode": code, "pass": passed, "body": payload})
        code2, payload2 = http_json("POST", calc, {"operation": "divide", "left": 1, "right": 0})
        passed2 = code2 == 400
        ok = ok and passed2
        results.append({"api": "POST /calculate div0", "url": calc, "statusCode": code2, "pass": passed2, "body": payload2})

    if hist:
        code, payload = http_json("GET", hist)
        passed = code == 200 and "items" in payload
        ok = ok and passed
        results.append({"api": "GET /history", "url": hist, "statusCode": code, "pass": passed, "body": payload})

    return ("PASS" if ok and results else "FAILED"), results


def build_endpoints_doc(urls: dict[str, str], smoke: list[dict]) -> str:
    api = urls.get("ApiUrl", "")
    calc = urls.get("CalculateUrl", f"{api}/calculate")
    hist = urls.get("HistoryUrl", f"{api}/history")
    health = urls.get("HealthUrl", f"{api}/health")
    lines = [
        "# Endpoints REST — sample2",
        "",
        "Entregable NADF (modo automático). Stack `sample2-calculator-dev`, región `sa-east-1`.",
        "",
        "## URLs",
        "",
        f"| API | URL |",
        f"|-----|-----|",
        f"| Base | `{api}` |",
        f"| POST /calculate | `{calc}` |",
        f"| GET /history | `{hist}` |",
        f"| GET /health | `{health}` |",
        "",
        "## Ejemplos de consumo",
        "",
        "```bash",
        f"# REQ-001: sumar",
        f'curl -s -X POST "{calc}" -H "content-type: application/json" \\',
        "  -d '{\"operation\": \"add\", \"left\": 2, \"right\": 3}'",
        "",
        f"# REQ-001: división por cero (espera 400)",
        f'curl -s -X POST "{calc}" -H "content-type: application/json" \\',
        "  -d '{\"operation\": \"divide\", \"left\": 1, \"right\": 0}'",
        "",
        f"# REQ-002: historial",
        f'curl -s "{hist}"',
        "",
        f"# REQ-003: salud",
        f'curl -s "{health}"',
        "```",
        "",
        "## Smoke tests",
        "",
    ]
    for item in smoke:
        mark = "PASS" if item.get("pass") else "FAIL"
        lines.append(f"- [{mark}] {item['api']} → HTTP {item.get('statusCode')}")
    lines.append("")
    return "\n".join(lines)


def publish_report(payload: dict) -> int:
    run_file = SAMPLE_DIR / "last-run.json"
    write_json(run_file, payload)
    return subprocess.run(
        [sys.executable, str(REPORTER), "--input", str(run_file), "--project-dir", str(PROJECT_DIR)],
        cwd=REPO_ROOT,
    ).returncode


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", default=os.environ.get("NADF_MODEL", "composer-2.5"))
    parser.add_argument("--skip-agent", action="store_true", help="Usar código ya presente en el worktree")
    parser.add_argument("--skip-deploy", action="store_true")
    args = parser.parse_args()

    # Prefer initiative from target worktree; fallback to framework sample
    sync_worktree(DEFAULT_TARGET)
    initiative_path = WORKTREE / "nadf" / "initiative.yml"
    if not initiative_path.exists():
        initiative_path = SAMPLE_DIR / "initiative.yml"
        req_root = SAMPLE_DIR
    else:
        req_root = WORKTREE / "nadf"

    data = load_yaml(initiative_path)
    initiative = data["initiative"]
    # Force automatic mode
    initiative["approval_mode"] = "automatic"
    run_id = f"{initiative['id']}-auto-{int(time.time())}"
    repo_url = initiative.get("target_repo", DEFAULT_TARGET)

    if initiative.get("production_deploy") != "forbidden" or initiative.get("environment") != "dev":
        print("BLOCKED: solo DEV con PROD prohibido")
        return 1

    steps: list[dict] = []
    requirements: list[dict] = []

    # 1. Intake
    start = time.monotonic()
    for entry in data["requirements"]:
        req_path = req_root / entry["file"] if (req_root / entry["file"]).exists() else SAMPLE_DIR / entry["file"]
        # requests/ relative under nadf/
        if not req_path.exists() and str(entry["file"]).startswith("requests/"):
            req_path = req_root / entry["file"]
        req = load_yaml(req_path)
        for field in ("id", "title", "endpoint", "acceptance_criteria"):
            if field not in req:
                print(f"BLOCKED: {entry['file']} sin '{field}'")
                return 1
        requirements.append(req)
    step(steps, "intake", "PASS", start, f"{len(requirements)} requerimientos; approval_mode=automatic")

    # 1b. Complexity Routing — perfil mínimo (sample2 = light por defecto)
    start = time.monotonic()
    routing = complexity_routing_for_sample2(requirements)
    if not routing.get("lightweight"):
        print("BLOCKED: Complexity Routing exige FULL/aprobación; no continuar light ciego")
        step(steps, "complexity-routing", "BLOCKED", start, routing.get("profile", "FULL"))
        return 1
    step(
        steps,
        "complexity-routing",
        "PASS",
        start,
        f"profile={routing['profile']}; agents=develop+test+deploy",
    )

    # 2. Approvals — automatic (no human wait)
    approvals = [
        {
            "gate": f"requirement:{r['id']}",
            "status": "AUTO_GRANTED",
            "approver": "nadf-automatic-mode",
            "mode": "automatic",
        }
        for r in requirements
    ]
    approvals.append({
        "gate": "deploy-dev",
        "status": "AUTO_GRANTED",
        "approver": "nadf-automatic-mode",
        "mode": "automatic",
    })
    step(steps, "approvals", "PASS", time.monotonic(), "modo automatico: gates auto-granted (0 ms wait)")

    # 3. Cloud Agent (light: un solo agente)
    agent_meta: dict = {}
    if args.skip_agent:
        cached_agent = OUTPUT_DIR / "agent-result.json"
        if cached_agent.exists():
            agent_meta = json.loads(cached_agent.read_text(encoding="utf-8"))
            step(
                steps, "cloud-agent", "PASS", time.monotonic(),
                f"reanudado: agentId={agent_meta.get('agentId')} runId={agent_meta.get('runId')}",
                agentId=agent_meta.get("agentId"),
                runId=agent_meta.get("runId"),
            )
        else:
            step(steps, "cloud-agent", "SKIPPED", time.monotonic(), "skip-agent solicitado")
    else:
        start = time.monotonic()
        prompt = build_agent_prompt(initiative, requirements)
        try:
            agent_meta = invoke_cloud_agent(prompt, repo_url, args.model)
        except RuntimeError as err:
            step(steps, "cloud-agent", "FAILED", start, str(err))
            payload = _final_payload(run_id, initiative, approvals, steps, [], agent_meta, [])
            publish_report(payload)
            print(f"\nERROR: {err}")
            return 1
        status = agent_meta.get("status", "FAILED")
        if status == "PASS":
            write_json(OUTPUT_DIR / "agent-result.json", agent_meta)
        step(
            steps, "cloud-agent", status, start,
            agent_meta.get("summary", "")[:200],
            agentId=agent_meta.get("agentId"),
            runId=agent_meta.get("runId"),
        )
        if status != "PASS":
            payload = _final_payload(run_id, initiative, approvals, steps, [], agent_meta, [])
            publish_report(payload)
            return 1

    # 4. Sync + verify
    start = time.monotonic()
    root = sync_worktree(repo_url)
    missing = expected_files_present(root)
    if missing:
        step(steps, "verify-code", "FAILED", start, f"faltan archivos: {', '.join(missing)}")
        payload = _final_payload(run_id, initiative, approvals, steps, [], agent_meta, [])
        publish_report(payload)
        return 1
    test_status, test_ms, test_detail = run_unit_tests(root)
    steps.append({
        "id": "unit-tests",
        "status": test_status,
        "durationMs": test_ms,
        "estimatedCostUsd": 0,
        "detail": test_detail[:200],
    })
    print(f"[{test_status}] unit-tests: {test_detail[:200]}")
    if test_status != "PASS":
        payload = _final_payload(run_id, initiative, approvals, steps, [], agent_meta, [])
        publish_report(payload)
        return 1
    step(steps, "verify-code", "PASS", start, "archivos presentes + unit tests OK")

    # 5. Deploy automático DEV
    stack = initiative.get("stack_name", "sample2-calculator-dev")
    region = initiative.get("aws_region", "sa-east-1")
    urls: dict[str, str] = {}
    smoke: list[dict] = []
    if args.skip_deploy:
        step(steps, "deploy-dev", "SKIPPED", time.monotonic(), "skip-deploy")
    else:
        start = time.monotonic()
        deploy_status, deploy_ms, urls_or_err = deploy_stack(root, stack, region)
        if deploy_status != "PASS":
            step(steps, "deploy-dev", "FAILED", start, str(urls_or_err)[:400])
            steps[-1]["durationMs"] = deploy_ms
            payload = _final_payload(run_id, initiative, approvals, steps, [], agent_meta, [])
            publish_report(payload)
            return 1
        urls = urls_or_err
        step(steps, "deploy-dev", "PASS", start, f"stack {stack} en {region}", **{k: v for k, v in urls.items()})
        steps[-1]["durationMs"] = deploy_ms

        # 6. Smoke
        start = time.monotonic()
        smoke_status, smoke = smoke_tests(urls)
        step(steps, "smoke-rest", smoke_status, start, f"{len(smoke)} checks")
        if smoke_status != "PASS":
            payload = _final_payload(run_id, initiative, approvals, steps, _endpoints(urls), agent_meta, smoke)
            publish_report(payload)
            _write_endpoints_md(urls, smoke)
            return 1

    endpoints = _endpoints(urls)
    _write_endpoints_md(urls, smoke)

    payload = _final_payload(run_id, initiative, approvals, steps, endpoints, agent_meta, smoke)
    payload["usageExamples"] = {
        "calculate": f'curl -s -X POST "{urls.get("CalculateUrl", "")}" -H "content-type: application/json" -d \'{{"operation":"add","left":2,"right":3}}\'',
        "history": f'curl -s "{urls.get("HistoryUrl", "")}"',
        "health": f'curl -s "{urls.get("HealthUrl", "")}"',
    }
    code = publish_report(payload)

    print("\n=== Entregables NADF ===")
    print(f"Output: {OUTPUT_DIR}")
    for ep in endpoints:
        print(f"  {ep['requirement']}: {ep['api']} -> {ep['url']}")
    print(f"  ENDPOINTS.md: {OUTPUT_DIR / 'ENDPOINTS.md'}")
    return code


def _endpoints(urls: dict[str, str]) -> list[dict]:
    mapping = [
        ("REQ-001-calculadora", "POST /calculate", "CalculateUrl"),
        ("REQ-002-historial", "GET /history", "HistoryUrl"),
        ("REQ-003-health", "GET /health", "HealthUrl"),
    ]
    result = []
    for req_id, api, key in mapping:
        result.append({
            "requirement": req_id,
            "api": api,
            "url": urls.get(key, urls.get("ApiUrl", "PENDIENTE")),
            "example": _example_for(api, urls.get(key, "")),
        })
    return result


def _example_for(api: str, url: str) -> str:
    if api.startswith("POST"):
        return f'curl -s -X POST "{url}" -H "content-type: application/json" -d \'{{"operation":"add","left":2,"right":3}}\''
    return f'curl -s "{url}"'


def _write_endpoints_md(urls: dict[str, str], smoke: list[dict]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "ENDPOINTS.md").write_text(build_endpoints_doc(urls, smoke), encoding="utf-8")
    write_json(OUTPUT_DIR / "endpoints.json", {
        "urls": urls,
        "smoke": smoke,
        "examples": {
            "calculate": _example_for("POST /calculate", urls.get("CalculateUrl", "")),
            "history": _example_for("GET /history", urls.get("HistoryUrl", "")),
            "health": _example_for("GET /health", urls.get("HealthUrl", "")),
        },
    })


def _final_payload(run_id, initiative, approvals, steps, endpoints, agent_meta, smoke) -> dict:
    return {
        "schemaVersion": "1.0",
        "projectId": "sample2-manual-aws",
        "runId": run_id,
        "source": {
            "adapter": "manual",
            "reference": "nadf/initiative.yml",
            "initiative": initiative["id"],
            "targetRepo": initiative.get("target_repo", DEFAULT_TARGET),
            "approvalMode": "automatic",
        },
        "environment": "dev",
        "humanWaitMs": 0,
        "estimatedTokens": 0,
        "skippedAgents": ["frontend", "visual-parity", "planner", "architect", "security", "reviewer"],
        "agent": agent_meta,
        "approvals": approvals,
        "steps": steps,
        "endpoints": endpoints,
        "smokeTests": smoke,
        "artifacts": [
            "https://github.com/arodriguez-novusintelligence/sample2",
            str(OUTPUT_DIR / "ENDPOINTS.md"),
            str(OUTPUT_DIR / "endpoints.json"),
        ],
    }


if __name__ == "__main__":
    raise SystemExit(main())
