#!/usr/bin/env python3
# NADF-GUIDE
# Propósito: Implementa NADF fan-out/fan-in prototype. Dry-run by default.
# Configuración: Configurar mediante argumentos CLI documentados; no hardcodear proyectos o secretos.
"""NADF fan-out/fan-in prototype. Dry-run by default."""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class Node:
    node_id: str
    dependencies: tuple[str, ...] = ()


GRAPH = (
    Node("intake"),
    Node("plan", ("intake",)),
    Node("backend", ("plan",)),
    Node("cloud", ("plan",)),
    Node("qa", ("backend", "cloud")),
    Node("security", ("backend", "cloud")),
    Node("review", ("backend", "cloud")),
    Node("report", ("qa", "security", "review")),
)


def execute(node: Node) -> dict:
    started = time.perf_counter()
    time.sleep(0.01)
    return {
        "id": node.node_id,
        "status": "PASS",
        "durationMs": round((time.perf_counter() - started) * 1000),
        "mode": "dry-run",
    }


def run(max_concurrency: int) -> list[dict]:
    pending = {node.node_id: node for node in GRAPH}
    completed: set[str] = set()
    results: list[dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrency) as pool:
        while pending:
            ready = [
                node for node in pending.values() if set(node.dependencies) <= completed
            ]
            if not ready:
                raise RuntimeError("dependency cycle or failed dependency")
            futures = {pool.submit(execute, node): node for node in ready}
            for future in concurrent.futures.as_completed(futures):
                node = futures[future]
                result = future.result()
                results.append(result)
                completed.add(node.node_id)
                pending.pop(node.node_id)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--max-concurrency", type=int, default=3)
    args = parser.parse_args()
    if not 1 <= args.max_concurrency <= 8:
        parser.error("max-concurrency debe estar entre 1 y 8")
    print(json.dumps({"maxConcurrency": args.max_concurrency, "steps": run(args.max_concurrency)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
