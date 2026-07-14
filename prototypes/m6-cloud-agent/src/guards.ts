import type { AgentInvocation, AgentPattern } from "./types.js";

/**
 * Guardas NADF por patrón — bloquean antes de llamar al motor.
 * Ver docs/runtime/agent-runtime-contract.md §4
 */
export function assertPatternGuards(invocation: AgentInvocation): string[] {
  const blockers: string[] = [];
  const p = invocation.pattern;

  const writesCode =
    invocation.constraints.includes("ALLOW_PRODUCTIVE_CODE") ||
    p === "executor";

  if (
    (p === "planner" || p === "event_driven") &&
    writesCode &&
    !invocation.dryRun
  ) {
    blockers.push(
      `Patrón ${p} no puede modificar código productivo. Quita ALLOW_PRODUCTIVE_CODE o usa dryRun.`,
    );
  }

  if (invocation.autoCreatePR && (p === "planner" || p === "event_driven")) {
    // Permitido solo si el caller lo fuerza conscientemente para artifacts;
    // avisamos, no bloqueamos — Analyzer puede commitear artifacts.
  }

  if (!invocation.repos.some((r) => r.role === "framework")) {
    blockers.push("Debe incluirse el repo framework (role=framework) en repos.");
  }

  if (!invocation.agentId || !invocation.projectId) {
    blockers.push("agentId y projectId son obligatorios.");
  }

  return blockers;
}

export function patternAllowsProductiveCode(pattern: AgentPattern): boolean {
  return pattern === "executor";
}
