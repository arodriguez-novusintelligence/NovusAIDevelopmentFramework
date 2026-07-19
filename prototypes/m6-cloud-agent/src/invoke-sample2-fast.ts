/* NADF-GUIDE
 * Propósito: Invoca coding runtime (default Cursor Cloud) para sample2.
 * Configuración: NADF_CODING_RUNTIME, CURSOR_API_KEY|ANTHROPIC_API_KEY, NADF_PROMPT_FILE, NADF_TARGET_REPO.
 */
import { readFile } from "node:fs/promises";
import { executeCodingPrompt } from "./execute-coding-prompt.js";

async function main(): Promise<void> {
  const promptFile = process.env.NADF_PROMPT_FILE?.trim();
  const repo = process.env.NADF_TARGET_REPO?.trim();
  const startingRef = process.env.NADF_STARTING_REF?.trim() || "main";

  if (!promptFile || !repo) {
    throw new Error("Faltan NADF_PROMPT_FILE o NADF_TARGET_REPO");
  }

  const prompt = await readFile(promptFile, "utf8");
  const startedAt = Date.now();

  const result = await executeCodingPrompt({
    prompt,
    agentId: "sample2-fast-agent",
    projectId: "sample2-manual-aws",
    stepId: "sample2-generate",
    autoCreatePR: true,
    repos: [{ role: "other", url: repo, ref: startingRef }],
  });

  const status =
    result.status === "finished"
      ? "PASS"
      : result.status === "blocked"
        ? "BLOCKED"
        : "FAILED";
  console.log(
    `\nNADF_AGENT_RESULT=${JSON.stringify({
      status,
      agentId: result.agentRuntimeId,
      runId: result.runId,
      runtime: result.runtime,
      durationMs: Date.now() - startedAt,
      summary: result.summary?.slice(0, 800),
      blockers: result.blockers,
    })}`,
  );
  if (status !== "PASS") process.exitCode = status === "BLOCKED" ? 3 : 2;
}

await main();
