/* NADF-GUIDE
 * Propósito: Implementa o configura invoke visual parity dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
/**
 * Invoca visual-parity-agent vía Cursor Cloud Agent.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NadfAgentRuntime } from "./AgentRuntime.js";
import { CursorCloudAdapter } from "./adapters/CursorCloudAdapter.js";
import { buildPipelinePrompt } from "./prompts/pipeline.js";
import { assertPatternGuards } from "./guards.js";
import type { AgentInvocation, RepoRef } from "./types.js";

function loadDotEnv(path = ".env"): void {
  const full = resolve(process.cwd(), path);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Falta ${name}`);
  return v;
}

function boolEnv(name: string, fallback = false): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === undefined || v === "") return fallback;
  return v === "1" || v === "true" || v === "yes";
}

async function main(): Promise<void> {
  loadDotEnv();
  const apiKey = requireEnv("CURSOR_API_KEY");
  const model = process.env.NADF_MODEL?.trim() || "composer-2.5";
  const projectId = process.env.NADF_PROJECT_ID?.trim() || "novus-intelligence";
  const art = `.nadf/projects/${projectId}/artifacts`;

  const repos: RepoRef[] = [
    {
      role: "framework",
      url: requireEnv("NADF_REPO_FRAMEWORK"),
      ref: process.env.NADF_REF_FRAMEWORK?.trim() || undefined,
    },
    {
      role: "lovable_source",
      url: requireEnv("NADF_REPO_LOVABLE"),
      ref: process.env.NADF_REF_LOVABLE?.trim() || "main",
    },
    {
      role: "frontend",
      url:
        process.env.NADF_REPO_FRONTEND?.trim() ||
        "https://github.com/arodriguez-novusintelligence/NovusIntelligenceWEB.git",
      ref: "main",
    },
  ];

  const invocation: AgentInvocation = {
    agentId: "visual-parity-agent",
    projectId,
    workflowId: "novus-intelligence-lovable-to-web",
    stepId: "paso-12-paridad-visual",
    pattern: "validator",
    repos,
    inputs: [
      `${art}/cambios-lovable.json`,
      `${art}/resumen-frontend.md`,
      `.nadf/projects/${projectId}/rules/visual-parity-rules.md`,
    ],
    expectedOutputs: [
      `${art}/visual-parity-result.json`,
      `${art}/informe-paridad-visual.md`,
      `${art}/gaps-paridad.json`,
    ],
    constraints: [
      "NO_LOVABLE_CODE_COPY",
      "NO_DEPLOY",
      "NO_SECRETS_IN_REPO",
      "VISUAL_EXACT_PARITY_REQUIRED",
      "NO_PRODUCTIVE_CODE",
    ],
    autoCreatePR: boolEnv("NADF_AUTO_CREATE_PR", true),
    dryRun: false,
  };

  const blockers = assertPatternGuards(invocation);
  if (blockers.length) {
    console.error(blockers);
    process.exit(3);
  }

  console.log("[nadf:m6] Invocando visual-parity-agent…");
  const adapter = new CursorCloudAdapter(apiKey, model);
  const prompt = buildPipelinePrompt(invocation);
  const result = await adapter.execute(invocation, prompt);
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "finished") process.exit(result.status === "blocked" ? 3 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
