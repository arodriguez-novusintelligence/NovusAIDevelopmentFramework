#!/usr/bin/env python3
# NADF-GUIDE
# Propósito: Implementa Deterministic NADF execution reporter (no LLM calls).
# Configuración: Configurar mediante argumentos CLI documentados; no hardcodear proyectos o secretos.
"""Deterministic NADF execution reporter (no LLM calls)."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def read_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as stream:
        value = json.load(stream)
    if not isinstance(value, dict):
        raise ValueError("El input debe ser un objeto JSON")
    return value


def build_report(data: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    steps = data.get("steps", [])
    if not isinstance(steps, list):
        raise ValueError("'steps' debe ser una lista")
    durations = [int(step.get("durationMs", 0)) for step in steps if isinstance(step, dict)]
    costs = [float(step.get("estimatedCostUsd", 0)) for step in steps if isinstance(step, dict)]
    failures = [
        str(step.get("id", "unknown"))
        for step in steps
        if isinstance(step, dict) and str(step.get("status", "")).upper() not in {"PASS", "SKIPPED"}
    ]
    generated_at = datetime.now(timezone.utc).isoformat()
    metrics = {
        "schemaVersion": "1.0",
        "projectId": data.get("projectId", "unknown"),
        "runId": data.get("runId", "unknown"),
        "generatedAt": generated_at,
        "durationMs": sum(durations),
        "humanWaitMs": int(data.get("humanWaitMs", 0)),
        "estimatedTokens": int(data.get("estimatedTokens", 0)),
        "estimatedCostUsd": round(sum(costs), 4),
        "stepCount": len(steps),
        "failedSteps": failures,
        "skippedAgents": data.get("skippedAgents", []),
    }
    report = {
        **metrics,
        "status": "FAILED" if failures else "PASS",
        "source": data.get("source", {}),
        "environment": data.get("environment", "dev"),
        "approvals": data.get("approvals", []),
        "agent": data.get("agent", {}),
        "steps": steps,
        "endpoints": data.get("endpoints", []),
        "smokeTests": data.get("smokeTests", []),
        "usageExamples": data.get("usageExamples", {}),
        "artifacts": data.get("artifacts", []),
        "nextAction": "correct-and-rerun" if failures else "review-evidence",
    }
    return report, metrics


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--project-dir", required=True, type=Path)
    args = parser.parse_args()

    report, metrics = build_report(read_json(args.input))
    output = args.project_dir / "output"
    run_id = str(report["runId"])
    write_json(output / "execution-report.json", report)
    write_json(output / "metrics-summary.json", metrics)
    write_json(output / "runs" / f"{run_id}.json", report)
    write_json(output / "latest" / "execution-report.json", report)
    print(f"NADF report {report['status']}: {output}")
    return 1 if report["status"] == "FAILED" else 0


if __name__ == "__main__":
    raise SystemExit(main())
