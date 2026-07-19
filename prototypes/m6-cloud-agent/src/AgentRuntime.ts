/* NADF-GUIDE
 * Propósito: Implementa o configura AgentRuntime dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
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
  readonly adapter: RuntimeAdapter;

  constructor(adapter: RuntimeAdapter) {
    this.adapter = adapter;
  }

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

    // Capability gate: PR / repo write requiere coding runtime compatible.
    if (
      (invocation.autoCreatePR ||
        (invocation.pattern === "executor" && !invocation.dryRun)) &&
      !this.adapter.supports("pr")
    ) {
      return {
        status: "blocked",
        runtime: "other",
        filesChanged: [],
        artifactsProduced: [],
        summary: `Coding runtime '${this.adapter.name}' no soporta pr/repo_write. Configure NADF_CODING_RUNTIME=cursor-cloud (u otro con PR).`,
        blockers: [
          `CODING_RUNTIME_CAPABILITY_MISSING:pr (adapter=${this.adapter.name})`,
        ],
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
