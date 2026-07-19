/* NADF-GUIDE
 * Propósito: Invoca Cloud Agent(s) DoEvents en feature/NovusAIDevelopmentFramework.
 * Configuración: CURSOR_API_KEY, NADF_PROMPT_FILE, NADF_TARGET_REPOS (CSV), NADF_STARTING_REF.
 */
import { readFile } from "node:fs/promises";
import { Agent, CursorAgentError } from "@cursor/sdk";

async function main(): Promise<void> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  const promptFile = process.env.NADF_PROMPT_FILE?.trim();
  const reposCsv = process.env.NADF_TARGET_REPOS?.trim();
  const startingRef =
    process.env.NADF_STARTING_REF?.trim() ||
    "feature/NovusAIDevelopmentFramework";
  const model = process.env.NADF_MODEL?.trim() || "composer-2.5";
  const autoCreatePR =
    (process.env.NADF_AUTO_CREATE_PR || "true").toLowerCase() !== "false";

  if (!apiKey || !promptFile || !reposCsv) {
    throw new Error(
      "Faltan CURSOR_API_KEY, NADF_PROMPT_FILE o NADF_TARGET_REPOS",
    );
  }

  const repos = reposCsv
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const prompt = await readFile(promptFile, "utf8");
  const startedAt = Date.now();
  const results: Array<Record<string, unknown>> = [];

  for (const repo of repos) {
    let agentId: string | undefined;
    let runId: string | undefined;
    const repoStarted = Date.now();
    try {
      await using agent = await Agent.create({
        apiKey,
        model: { id: model },
        cloud: {
          repos: [{ url: repo, startingRef }],
          autoCreatePR,
          skipReviewerRequest: true,
        },
      });
      agentId = agent.agentId;
      console.log(`[nadf:doevents] repo=${repo} agentId=${agentId} ref=${startingRef}`);

      const run = await agent.send(prompt);
      runId = run.id;
      for await (const event of run.stream()) {
        if (event.type !== "assistant") continue;
        for (const block of event.message.content) {
          if (block.type === "text") process.stdout.write(block.text);
        }
      }
      const result = await run.wait();
      const status = result.status === "error" ? "FAILED" : "PASS";
      results.push({
        repo,
        status,
        agentId,
        runId,
        durationMs: Date.now() - repoStarted,
        summary:
          typeof result.result === "string"
            ? result.result.slice(0, 800)
            : `Cloud Agent ${result.status}`,
      });
      if (status !== "PASS") process.exitCode = 2;
    } catch (error) {
      const summary =
        error instanceof CursorAgentError
          ? `CursorAgentError: ${error.message}`
          : error instanceof Error
            ? error.message
            : String(error);
      results.push({
        repo,
        status: "FAILED",
        agentId,
        runId,
        durationMs: Date.now() - repoStarted,
        summary,
      });
      process.exitCode = 1;
    }
  }

  console.log(
    `\nNADF_AGENT_RESULT=${JSON.stringify({
      status: results.every((r) => r.status === "PASS") ? "PASS" : "FAILED",
      durationMs: Date.now() - startedAt,
      results,
    })}`,
  );
}

main();
