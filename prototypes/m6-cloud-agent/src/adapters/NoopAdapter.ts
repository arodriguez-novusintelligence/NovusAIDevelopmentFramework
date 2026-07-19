/* NADF-GUIDE
 * Propósito: NoopAdapter — dry-run / CI sin llamar vendors de IA.
 * Configuración: NADF_CODING_RUNTIME=noop.
 */
import type {
  AgentInvocation,
  AgentResult,
  RuntimeAdapter,
} from "../types.js";

export class NoopAdapter implements RuntimeAdapter {
  readonly name = "noop";

  supports(capability: "invoke" | "resume" | "stream" | "pr"): boolean {
    return capability === "invoke";
  }

  async execute(
    invocation: AgentInvocation,
    _prompt: string,
  ): Promise<AgentResult> {
    const now = new Date().toISOString();
    return {
      status: "finished",
      runtime: "noop",
      agentRuntimeId: "noop",
      runId: `noop-${invocation.stepId}`,
      filesChanged: [],
      artifactsProduced: [],
      summary: `NoopAdapter: dry-run para ${invocation.agentId} (sin vendor).`,
      blockers: [],
      metrics: {
        agentName: invocation.agentId,
        status: "finished",
        startTime: now,
        endTime: now,
      },
    };
  }
}
