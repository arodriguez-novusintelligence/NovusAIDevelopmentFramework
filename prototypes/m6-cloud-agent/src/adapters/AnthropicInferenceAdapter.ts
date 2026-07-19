/* NADF-GUIDE
 * Propósito: Anthropic Messages API como Coding Runtime de solo inferencia (v1).
 * Configuración: ANTHROPIC_API_KEY; NADF_CODING_RUNTIME=anthropic.
 *               No soporta pr/repo_write — Claude.ai login no autentica este adaptador.
 */
import type {
  AgentInvocation,
  AgentResult,
  RuntimeAdapter,
} from "../types.js";

function requiresRepoMutation(invocation: AgentInvocation): boolean {
  if (invocation.autoCreatePR) return true;
  if (invocation.dryRun) return false;
  // Executor con repos productivos implica mutación esperada en el contrato M6.
  if (
    invocation.pattern === "executor" &&
    invocation.repos.some((r) => r.role === "frontend" || r.role === "backend")
  ) {
    return true;
  }
  return false;
}

/**
 * Inferencia vía Anthropic HTTP API (sin SDK obligatorio).
 * Pasos con PR / escritura de repos → blocked con mensaje claro.
 */
export class AnthropicInferenceAdapter implements RuntimeAdapter {
  readonly name = "anthropic";

  constructor(
    private readonly apiKey: string,
    private readonly modelId: string,
  ) {}

  supports(capability: "invoke" | "resume" | "stream" | "pr"): boolean {
    return capability === "invoke";
  }

  async execute(
    invocation: AgentInvocation,
    prompt: string,
  ): Promise<AgentResult> {
    const startTime = new Date().toISOString();

    if (requiresRepoMutation(invocation)) {
      return {
        status: "blocked",
        runtime: "other",
        filesChanged: [],
        artifactsProduced: [],
        summary:
          "Anthropic v1 es solo inferencia: no soporta pr/repo_write. Use NADF_CODING_RUNTIME=cursor-cloud (u otro Coding Runtime con PR).",
        blockers: [
          "CODING_RUNTIME_CAPABILITY_MISSING:pr",
          "CODING_RUNTIME_CAPABILITY_MISSING:repo_write",
          "Claude.ai web login is not a valid auth for this adapter; use ANTHROPIC_API_KEY for inference-only steps.",
        ],
        metrics: {
          agentName: invocation.agentId,
          status: "blocked",
          startTime,
          endTime: new Date().toISOString(),
        },
      };
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.modelId,
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return {
          status: "error",
          runtime: "other",
          filesChanged: [],
          artifactsProduced: [],
          summary: `Anthropic API HTTP ${res.status}: ${body.slice(0, 400)}`,
          blockers: [],
          metrics: {
            agentName: invocation.agentId,
            status: "error",
            startTime,
            endTime: new Date().toISOString(),
          },
        };
      }
      const data = (await res.json()) as {
        id?: string;
        content?: Array<{ type: string; text?: string }>;
      };
      const text =
        data.content
          ?.filter((c) => c.type === "text")
          .map((c) => c.text || "")
          .join("\n") || "";
      return {
        status: "finished",
        runtime: "anthropic",
        agentRuntimeId: "anthropic",
        runId: data.id,
        filesChanged: [],
        artifactsProduced: [],
        summary: text.slice(0, 800) || "Anthropic inference completed",
        blockers: [],
        metrics: {
          agentName: invocation.agentId,
          status: "finished",
          startTime,
          endTime: new Date().toISOString(),
        },
      };
    } catch (e) {
      return {
        status: "error",
        runtime: "other",
        filesChanged: [],
        artifactsProduced: [],
        summary: e instanceof Error ? e.message : String(e),
        blockers: [],
        metrics: {
          agentName: invocation.agentId,
          status: "error",
          startTime,
          endTime: new Date().toISOString(),
        },
      };
    }
  }
}
