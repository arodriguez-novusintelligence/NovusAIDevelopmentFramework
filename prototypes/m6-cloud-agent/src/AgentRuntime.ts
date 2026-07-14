import { assertPatternGuards } from "./guards.js";
import { buildAgentPrompt } from "./prompts/lovable-analyzer.js";
import type {
  AgentInvocation,
  AgentResult,
  AgentRuntime,
  RuntimeAdapter,
} from "./types.js";

/**
 * Implementación mínima de AgentRuntime (M6).
 * Delega en un RuntimeAdapter tras aplicar guardas NADF.
 */
export class NadfAgentRuntime implements AgentRuntime {
  constructor(private readonly adapter: RuntimeAdapter) {}

  async invoke(invocation: AgentInvocation): Promise<AgentResult> {
    const blockers = assertPatternGuards(invocation);
    if (blockers.length > 0) {
      return {
        status: "blocked",
        runtime: "other",
        filesChanged: [],
        artifactsProduced: [],
        summary: "Bloqueado por guardas NADF antes de invocar el motor.",
        blockers,
        metrics: {
          agentName: invocation.agentId,
          status: "blocked",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        },
      };
    }

    const prompt = buildAgentPrompt(invocation);
    return this.adapter.execute(invocation, prompt);
  }
}
