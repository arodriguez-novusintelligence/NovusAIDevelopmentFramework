/* NADF-GUIDE
 * Propósito: Invoca coding runtime(s) DoEvents vía factory (default Cursor Cloud).
 * Configuración: NADF_CODING_RUNTIME, NADF_PROMPT_FILE, NADF_TARGET_REPOS, NADF_STARTING_REF,
 *                NADF_AGENT_RESULT_FILE (JSON para evidence/report).
 */
import { readFile, writeFile } from "node:fs/promises";
import { executeCodingPrompt } from "./execute-coding-prompt.js";
import { classifyAgentBlockers } from "./doevents/error-codes.js";

async function main(): Promise<void> {
  const promptFile = process.env.NADF_PROMPT_FILE?.trim();
  const reposCsv = process.env.NADF_TARGET_REPOS?.trim();
  const startingRef =
    process.env.NADF_STARTING_REF?.trim() ||
    "feature/NovusAIDevelopmentFramework";
  const autoCreatePR =
    (process.env.NADF_AUTO_CREATE_PR || "true").toLowerCase() !== "false";
  const resultFile =
    process.env.NADF_AGENT_RESULT_FILE?.trim() || "agent-result.json";

  if (!promptFile || !reposCsv) {
    const missing = [
      !promptFile ? "NADF_PROMPT_FILE" : null,
      !reposCsv ? "NADF_TARGET_REPOS" : null,
    ].filter(Boolean);
    throw new Error(`Faltan variables: ${missing.join(", ")}`);
  }

  const repos = reposCsv
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const prompt = await readFile(promptFile, "utf8");
  const startedAt = Date.now();
  const results: Array<Record<string, unknown>> = [];

  for (const repo of repos) {
    const repoStarted = Date.now();
    console.log(`[nadf:doevents] repo=${repo} ref=${startingRef}`);
    const result = await executeCodingPrompt({
      prompt,
      agentId: "doevents-issue-agent",
      projectId: "doevents",
      stepId: `doevents-${repo.split("/").pop()?.replace(/\.git$/, "")}`,
      autoCreatePR,
      repos: [{ role: "other", url: repo, ref: startingRef }],
    });
    const errorCode = classifyAgentBlockers(
      result.blockers,
      result.summary || "",
    );
    const status =
      result.status === "finished" && errorCode === "OK"
        ? "PASS"
        : result.status === "blocked"
          ? "BLOCKED"
          : "FAILED";
    results.push({
      repo,
      status,
      errorCode,
      agentId: result.agentRuntimeId,
      runId: result.runId,
      runtime: result.runtime,
      durationMs: Date.now() - repoStarted,
      summary: (result.summary || "").slice(0, 800),
      blockers: result.blockers,
    });
    if (status !== "PASS") process.exitCode = status === "BLOCKED" ? 3 : 2;
    if (errorCode !== "OK") {
      console.error(`::error::${errorCode}: ${(result.summary || "").slice(0, 240)}`);
    }
  }

  const payload = {
    status: results.every((r) => r.status === "PASS") ? "PASS" : "FAILED",
    durationMs: Date.now() - startedAt,
    results,
  };
  await writeFile(resultFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`\nNADF_AGENT_RESULT=${JSON.stringify(payload)}`);
}

main().catch((err) => {
  console.error("[nadf:doevents] Unexpected error:", err);
  process.exit(1);
});
