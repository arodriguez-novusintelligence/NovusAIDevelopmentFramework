/* NADF-GUIDE
 * Propósito: Tras el Cloud Agent, verifica PRs abiertos por issue/target; falla tipado si falta push/PR.
 * Configuración: GH_TOKEN, NADF_ISSUE_NUMBER, route-decision.json; opcional agent-result.json.
 */
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import {
  classifyAgentBlockers,
  ERROR_FIX_HINTS,
  type NadfErrorCode,
} from "./doevents/error-codes.js";

type AgentResultFile = {
  status: string;
  results?: Array<{
    repo?: string;
    status?: string;
    summary?: string;
    blockers?: string[];
  }>;
};

function ghJson<T>(args: string[]): T {
  const out = execFileSync("gh", args, { encoding: "utf8" });
  return JSON.parse(out) as T;
}

function countIssuePrs(repo: string, issue: string, base: string): number {
  const prs = ghJson<Array<{ number: number; title: string; body: string }>>([
    "pr",
    "list",
    "--repo",
    repo,
    "--state",
    "open",
    "--base",
    base,
    "--limit",
    "30",
    "--json",
    "number,title,body",
  ]);
  const reTitle = new RegExp(`#${issue}\\b`);
  const reBody = new RegExp(
    `(?i)(fixes|closes|resolves)\\s*#${issue}\\b|#${issue}\\b`,
  );
  return prs.filter(
    (p) => reTitle.test(p.title || "") || reBody.test(p.body || ""),
  ).length;
}

async function main(): Promise<void> {
  const routePath = process.argv[2] || "route-decision.json";
  const issue = process.env.NADF_ISSUE_NUMBER?.trim();
  const base =
    process.env.NADF_STARTING_REF?.trim() ||
    "feature/NovusAIDevelopmentFramework";
  const agentResultPath =
    process.env.NADF_AGENT_RESULT_FILE?.trim() || "agent-result.json";
  const outPath =
    process.env.NADF_AGENT_VERIFY_FILE?.trim() || "agent-verify.json";

  if (!issue) throw new Error("Falta NADF_ISSUE_NUMBER");
  if (!process.env.GH_TOKEN?.trim()) {
    throw new Error("Falta GH_TOKEN para verificar PRs");
  }

  const route = JSON.parse(await readFile(routePath, "utf8")) as {
    target?: string;
    targetRepos?: string[];
  };
  const target = route.target || "web";

  let agent: AgentResultFile | null = null;
  try {
    agent = JSON.parse(await readFile(agentResultPath, "utf8")) as AgentResultFile;
  } catch {
    agent = null;
  }

  const expectedRepos: string[] = [];
  if (target === "web" || target === "both") {
    expectedRepos.push("arodriguez-novusintelligence/DoEventsWEB");
  }
  if (target === "back" || target === "both") {
    expectedRepos.push("arodriguez-novusintelligence/DoEventsBack");
  }

  const details: Array<Record<string, unknown>> = [];
  let code: NadfErrorCode = "OK";
  let why = "PRs del agente verificados.";

  for (const result of agent?.results || []) {
    const classified = classifyAgentBlockers(
      result.blockers || [],
      result.summary || "",
    );
    if (classified !== "OK" && code === "OK") {
      code = classified;
      why = `${result.repo}: ${classified} — ${(result.summary || "").slice(0, 200)}`;
    }
    details.push({
      repo: result.repo,
      agentStatus: result.status,
      code: classified,
    });
  }

  let prOpened = false;
  for (const repo of expectedRepos) {
    const count = countIssuePrs(repo, issue, base);
    details.push({ repo, openPrsForIssue: count });
    if (count > 0) prOpened = true;
  }

  // Si el agente marcó PASS pero no hay PR en un target esperado → tipificar.
  if (code === "OK" && expectedRepos.length > 0 && !prOpened) {
    const summaries = (agent?.results || [])
      .map((r) => r.summary || "")
      .join("\n")
      .toLowerCase();
    const noop =
      /already (fixed|applied)|ya (estaba |fue )?corrig|sin cambios|no changes needed|nothing to (do|change)|no-op|nada que hacer/.test(
        summaries,
      );
    if (noop || process.env.NADF_ALLOW_NO_PR === "true") {
      why =
        "Sin PR nuevo (no-op o NADF_ALLOW_NO_PR=true); se asume código ya en rama DEV.";
    } else {
      const pushDenied = (agent?.results || []).some((r) =>
        /push|permisos|write access|permission denied/i.test(
          `${(r.blockers || []).join(" ")} ${r.summary || ""}`,
        ),
      );
      code = pushDenied ? "REPO_PUSH_DENIED" : "PR_NOT_CREATED";
      why =
        code === "REPO_PUSH_DENIED"
          ? "El agente no pudo pushear al repo target; no hay PR abierto para el issue."
          : `No hay PR abierto hacia ${base} para el issue #${issue} en targets esperados (${expectedRepos.join(", ")}).`;
    }
  }

  // Si algún repo del agent-result falló explícitamente
  if (agent?.status === "FAILED" && code === "OK") {
    code = "AGENT_RUN_ERROR";
    why = "NADF_AGENT_RESULT.status=FAILED";
  }

  const payload = {
    status: code === "OK" ? "PASS" : "FAIL",
    code,
    why,
    fixHint: ERROR_FIX_HINTS[code],
    prOpened,
    details,
  };

  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`NADF_AGENT_VERIFY=${JSON.stringify(payload)}`);

  if (code !== "OK") {
    console.error(`::error::${code}: ${why}`);
    console.error(`fix: ${ERROR_FIX_HINTS[code]}`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("[nadf:doevents] verify agent PRs:", err);
  process.exit(1);
});
