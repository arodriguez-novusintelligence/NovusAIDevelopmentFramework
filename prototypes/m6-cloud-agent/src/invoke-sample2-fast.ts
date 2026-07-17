/* NADF-GUIDE
 * Propósito: Invoca un único Cursor Cloud Agent para generar sample2 y abrir PR.
 * Configuración: CURSOR_API_KEY, NADF_PROMPT_FILE, NADF_TARGET_REPO y NADF_MODEL.
 */
import { readFile } from "node:fs/promises";
import { Agent, CursorAgentError } from "@cursor/sdk";

async function main(): Promise<void> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  const promptFile = process.env.NADF_PROMPT_FILE?.trim();
  const repo = process.env.NADF_TARGET_REPO?.trim();
  const model = process.env.NADF_MODEL?.trim() || "composer-2.5";

  if (!apiKey || !promptFile || !repo) {
    throw new Error("Faltan CURSOR_API_KEY, NADF_PROMPT_FILE o NADF_TARGET_REPO");
  }

  const prompt = await readFile(promptFile, "utf8");
  const startedAt = Date.now();
  let agentId: string | undefined;
  let runId: string | undefined;

  try {
    await using agent = await Agent.create({
      apiKey,
      model: { id: model },
      cloud: {
        repos: [{ url: repo, startingRef: "main" }],
        autoCreatePR: true,
        skipReviewerRequest: true,
      },
    });
    agentId = agent.agentId;
    console.log(`[nadf:sample2] cloud agentId=${agentId}`);

    const run = await agent.send(prompt);
    runId = run.id;
    console.log(`[nadf:sample2] runId=${runId}`);

    for await (const event of run.stream()) {
      if (event.type !== "assistant") continue;
      for (const block of event.message.content) {
        if (block.type === "text") process.stdout.write(block.text);
      }
    }

    const result = await run.wait();
    const status = result.status === "error" ? "FAILED" : "PASS";
    console.log(
      `\nNADF_AGENT_RESULT=${JSON.stringify({
        status,
        agentId,
        runId,
        durationMs: Date.now() - startedAt,
        summary:
          typeof result.result === "string"
            ? result.result.slice(0, 800)
            : `Cloud Agent ${result.status}`,
      })}`,
    );
    if (status !== "PASS") process.exitCode = 2;
  } catch (error) {
    const summary =
      error instanceof CursorAgentError
        ? `CursorAgentError: ${error.message} (retryable=${error.isRetryable})`
        : error instanceof Error
          ? error.message
          : String(error);
    console.log(
      `NADF_AGENT_RESULT=${JSON.stringify({
        status: "FAILED",
        agentId,
        runId,
        durationMs: Date.now() - startedAt,
        summary,
      })}`,
    );
    process.exitCode = 1;
  }
}

await main();
