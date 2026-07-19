/* NADF-GUIDE
 * Propósito: Implementa o configura invoke revalidate security deploy dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
/**
 * Revalida security tras merge de SEC-CORS-001 y lanza post-pipeline DEV.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createAdapter } from "./ai-runtime/index.js";
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

async function main(): Promise<void> {
  loadDotEnv();
  process.env.NADF_REF_FRAMEWORK =
    process.env.NADF_REF_FRAMEWORK || "feature/nadf-foundation";
  process.env.NADF_PROTECT_ARCHETYPE = "false";
  process.env.NADF_AUTO_MERGE_DEV = "true";
  process.env.NADF_AUTO_DEPLOY_DEV = "true";
  process.env.NADF_REQUIRE_VISUAL_PARITY = "false";
  process.env.NADF_ARTIFACTS_REMOTE_ONLY = "true";

  const apiKey = requireEnv("CURSOR_API_KEY");
  const model = process.env.NADF_MODEL?.trim() || "composer-2.5";
  const adapter = createAdapter({ apiKey, modelId: model });
  const projectId = process.env.NADF_PROJECT_ID?.trim() || "novus-intelligence";
  const a = `.nadf/projects/${projectId}/artifacts`;

  const repos: RepoRef[] = [
    {
      role: "framework",
      url: requireEnv("NADF_REPO_FRAMEWORK"),
      ref: process.env.NADF_REF_FRAMEWORK,
    },
    {
      role: "backend",
      url:
        process.env.NADF_REPO_BACKEND?.trim() ||
        "https://github.com/arodriguez-novusintelligence/NovusIntelligenceBack.git",
      ref: "main",
    },
  ];

  const invocation: AgentInvocation = {
    agentId: "security-agent",
    projectId,
    workflowId: "novus-intelligence-lovable-to-web",
    stepId: "revalidate-security-cors-main",
    pattern: "validator",
    repos,
    inputs: [],
    expectedOutputs: [`${a}/security-result.json`, `${a}/informe-seguridad.md`],
    constraints: ["NO_DEPLOY", "NO_SECRETS_IN_REPO", "NO_PRODUCTIVE_CODE"],
    autoCreatePR: true,
    dryRun: false,
  };

  const prompt = `Eres security-agent NADF.
SEC-CORS-001 está mergeado en NovusIntelligenceBack@main (sin wildcard '*'; CloudFront DEV en allowlist).
Revalida main y escribe ${a}/security-result.json con status PASS si CORS OK, más ${a}/informe-seguridad.md.
NO desplegar. autoCreatePR=true en Framework.`;

  const blockers = assertPatternGuards(invocation);
  if (blockers.length) throw new Error(blockers.join("; "));

  console.log("[nadf] Invocando security-agent revalidación…");
  const result = await adapter.execute(invocation, prompt);
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "finished") {
    process.exit(2);
  }

  console.log("[nadf] post-pipeline-dev…");
  const r = spawnSync("npm", ["run", "post-pipeline-dev"], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  process.exit(r.status ?? 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
