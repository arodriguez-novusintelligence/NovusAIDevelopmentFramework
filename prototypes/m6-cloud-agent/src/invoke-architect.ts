/* NADF-GUIDE
 * Propósito: Implementa o configura invoke architect dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NadfAgentRuntime } from "./AgentRuntime.js";
import { CursorCloudAdapter } from "./adapters/CursorCloudAdapter.js";
import type { AgentInvocation, RepoRef } from "./types.js";

function loadDotEnv(path = ".env"): void {
  const full = resolve(process.cwd(), path);
  if (!existsSync(full)) return;
  const text = readFileSync(full, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`[nadf:m6] Falta ${name}.`);
    process.exit(1);
  }
  return v;
}

function boolEnv(name: string, fallback = false): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === undefined || v === "") return fallback;
  return v === "1" || v === "true" || v === "yes";
}

function buildRepos(): RepoRef[] {
  return [
    {
      role: "framework",
      url: requireEnv("NADF_REPO_FRAMEWORK"),
      ref:
        process.env.NADF_REF_FRAMEWORK?.trim() ||
        "cursor/evaluar-backend-paso05-dd13",
    },
  ];
}

async function main(): Promise<void> {
  loadDotEnv();

  const apiKey = requireEnv("CURSOR_API_KEY");
  const modelId = process.env.NADF_MODEL?.trim() || "composer-2.5";
  const projectId = process.env.NADF_PROJECT_ID?.trim() || "novus-intelligence";
  const artifactRoot = `.nadf/projects/${projectId}/artifacts`;

  const invocation: AgentInvocation = {
    agentId: "architect-agent",
    projectId,
    workflowId: "novus-intelligence-lovable-to-web",
    stepId: "paso-03-validar-arquitectura",
    pattern: "planner",
    repos: buildRepos(),
    inputs: [
      `${artifactRoot}/plan-implementacion.md`,
      `${artifactRoot}/tareas-ejecutor.json`,
      `${artifactRoot}/evaluacion-backend.md`,
      `${artifactRoot}/especificacion-backend.md`,
      `${artifactRoot}/riesgos.md`,
      `.nadf/global/decision-history/adr/`,
      `.nadf/projects/${projectId}/environments/dev.yml`,
    ],
    expectedOutputs: [
      `${artifactRoot}/impacto-arquitectonico.md`,
      `${artifactRoot}/plan-implementacion.md`,
    ],
    constraints: [
      "NO_PRODUCTIVE_CODE",
      "NO_LOVABLE_CODE_COPY",
      "NO_DEPLOY",
      "NO_SECRETS_IN_REPO",
      "TARGET_DEV_REGION_SA_EAST_1",
      "MAY_SET_PLAN_APPROVED_OR_REJECTED",
    ],
    autoCreatePR: boolEnv("NADF_AUTO_CREATE_PR", true),
    dryRun: false,
  };

  console.log("[nadf:m6] Invocando architect-agent vía Cursor Cloud…");
  console.log(
    JSON.stringify(
      {
        agentId: invocation.agentId,
        projectId: invocation.projectId,
        stepId: invocation.stepId,
        repos: invocation.repos.map((r) => ({
          role: r.role,
          url: r.url,
          ref: r.ref,
        })),
        model: modelId,
      },
      null,
      2,
    ),
  );

  const runtime = new NadfAgentRuntime(
    new CursorCloudAdapter(apiKey, modelId),
  );
  const result = await runtime.invoke(invocation);

  console.log("\n[nadf:m6] AgentResult:");
  console.log(JSON.stringify(result, null, 2));

  if (result.status === "blocked") process.exit(3);
  if (result.status === "error") {
    const startup = result.blockers.includes("cursor_startup_error");
    process.exit(startup ? 1 : 2);
  }
  if (result.status !== "finished") process.exit(2);
}

main().catch((err) => {
  console.error("[nadf:m6] Unexpected error:", err);
  process.exit(1);
});
