/* NADF-GUIDE
 * Propósito: Implementa o configura CursorCloudAdapter dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
import { Agent, CursorAgentError } from "@cursor/sdk";
import type {
  AgentInvocation,
  AgentResult,
  RuntimeAdapter,
} from "../types.js";

/**
 * Adaptador Cursor Cloud Agent (M6 v0.1).
 * Siempre pasa `cloud:` explícitamente para no caer en local por omisión.
 * Docs: https://cursor.com/docs/sdk/typescript
 */
export class CursorCloudAdapter implements RuntimeAdapter {
  readonly name = "cursor-cloud";

  constructor(
    private readonly apiKey: string,
    private readonly modelId: string,
  ) {}

  supports(capability: "invoke" | "resume" | "stream" | "pr"): boolean {
    return (
      capability === "invoke" ||
      capability === "stream" ||
      capability === "pr" ||
      capability === "resume"
    );
  }

  async execute(
    invocation: AgentInvocation,
    prompt: string,
  ): Promise<AgentResult> {
    const startTime = new Date().toISOString();
    const repos = invocation.repos.map((r) => ({
      url: r.url,
      ...(r.ref ? { startingRef: r.ref } : {}),
    }));

    let agentRuntimeId: string | undefined;
    let runId: string | undefined;

    try {
      await using agent = await Agent.create({
        apiKey: this.apiKey,
        model: { id: this.modelId },
        cloud: {
          repos,
          ...(invocation.autoCreatePR
            ? { autoCreatePR: true, skipReviewerRequest: true }
            : {}),
        },
      });

      agentRuntimeId = agent.agentId;
      console.log(`[nadf:m6] cloud agentId=${agentRuntimeId}`);

      const run = await agent.send(prompt);
      runId = run.id;
      console.log(`[nadf:m6] runId=${runId}`);

      // Stream opcional (observabilidad); wait() es obligatorio.
      for await (const event of run.stream()) {
        if (event.type === "assistant") {
          for (const block of event.message.content) {
            if (block.type === "text") {
              process.stdout.write(block.text);
            }
          }
        }
      }

      const result = await run.wait();
      const endTime = new Date().toISOString();

      if (result.status === "error") {
        return {
          status: "error",
          runtime: "cursor-cloud",
          agentRuntimeId,
          runId,
          filesChanged: [],
          artifactsProduced: [],
          summary: `Run falló: ${runId}`,
          blockers: ["cursor_run_error"],
          metrics: {
            agentName: invocation.agentId,
            status: "error",
            startTime,
            endTime,
          },
        };
      }

      return {
        status: "finished",
        runtime: "cursor-cloud",
        agentRuntimeId,
        runId,
        filesChanged: [],
        artifactsProduced: invocation.expectedOutputs,
        summary:
          typeof result.result === "string"
            ? result.result.slice(0, 500)
            : `Run finished: ${runId}`,
        blockers: [],
        metrics: {
          agentName: invocation.agentId,
          status: "finished",
          startTime,
          endTime,
        },
      };
    } catch (err) {
      if (err instanceof CursorAgentError) {
        return {
          status: "error",
          runtime: "cursor-cloud",
          agentRuntimeId,
          runId,
          filesChanged: [],
          artifactsProduced: [],
          summary: `Startup failed: ${err.message} (retryable=${err.isRetryable})`,
          blockers: ["cursor_startup_error"],
          metrics: {
            agentName: invocation.agentId,
            status: "error",
            startTime,
            endTime: new Date().toISOString(),
          },
        };
      }
      throw err;
    }
  }
}
