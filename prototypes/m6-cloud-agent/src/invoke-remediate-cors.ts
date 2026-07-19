/* NADF-GUIDE
 * Propósito: Implementa o configura invoke remediate cors dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
/**
 * Remediación DEV: SEC-CORS-001 → security re-check → post-pipeline (merge+deploy).
 * No toca arquetipo a mano: Cloud Agent (backend) abre PR en Back.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createAdapter } from "./ai-runtime/index.js";
import { assertPatternGuards } from "./guards.js";
import type { AgentInvocation, RepoRef, RuntimeAdapter } from "./types.js";

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

function runNpm(script: string): void {
  console.log(`\n[nadf:remediate] >>> npm run ${script}`);
  const r = spawnSync("npm", ["run", script], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (r.status !== 0) {
    throw new Error(`Step failed: ${script} (exit ${r.status})`);
  }
}

function buildCorsRemediationPrompt(inv: AgentInvocation): string {
  const a = `.nadf/projects/${inv.projectId}/artifacts`;
  return `
Eres el agente NADF: backend-agent (remediación SEC-CORS-001).

ANTES DE ACTUAR LEE: CLAUDE.md → docs/meta-model/meta-model-overview.md →
.nadf/projects/${inv.projectId}/project-context.yml → .claude/agents/backend-agent.md

PROYECTO: ${inv.projectId}
PASO: remediate-sec-cors-001
RUNTIME: Cursor Cloud Agent (M6)
TARGET: DEV sa-east-1

HALLAZGO BLOQUEANTE:
SEC-CORS-001 — en NovusIntelligenceBack/serverless.yml el default de
CORS_ALLOWED_ORIGINS incluye wildcard '*':
  '\${env:CORS_ALLOWED_ORIGINS, 'https://dev.novusintelligence.com,http://localhost:5173,*'}'

DEBES (solo esto):
1. Quitar '*' del default en serverless.yml.
2. Incluir en allowlist explícita:
   - https://d1bfu6klutpp8m.cloudfront.net
   - https://dev.novusintelligence.com
   - http://localhost:5173
3. Verificar que corsHeaders NO trata '*' como allow-any deseado en prod/DEV piloto
   (permitido: lista blanca estricta).
4. Abrir/actualizar PR en NovusIntelligenceBack (branch cursor/*).
5. Escribir ${a}/resumen-remediacion-cors.md en el repo FRAMEWORK.

PROHIBIDO: desplegar, secrets en repo, copiar Lovable, cambios fuera de CORS/seguridad mínima.

AL TERMINAR:
\`\`\`nadf-result
status: finished|error|blocked
filesChanged: <lista>
artifactsProduced: <lista>
blockers: <lista o none>
summary: <una frase>
nextAgentSuggested: security-agent
\`\`\`
`;
}

function buildSecurityRecheckPrompt(inv: AgentInvocation): string {
  const a = `.nadf/projects/${inv.projectId}/artifacts`;
  return `
Eres el agente NADF: security-agent (revalidación post remediación CORS).

Lee CLAUDE.md, Meta Model, project-context.yml y .claude/agents/security-agent.md.

FOCO: confirmar que SEC-CORS-001 está resuelto en NovusIntelligenceBack (main o PR head reciente).
Sin wildcard '*' en defaults de CORS_ALLOWED_ORIGINS.
Secrets / rate-limit / IAM: registra status pero CORS es el gate bloqueante a desbloquear.

Genera/actualiza:
- ${a}/informe-seguridad.md
- ${a}/security-result.json  (status PASS|FAIL)

Si CORS OK → status PASS. NO desplegar.

\`\`\`nadf-result
status: finished|error|blocked
filesChanged: <lista>
artifactsProduced: <lista>
blockers: <lista o none>
summary: <una frase>
nextAgentSuggested: none
\`\`\`
`;
}

async function invokeAgent(
  adapter: RuntimeAdapter,
  agentId: string,
  stepId: string,
  prompt: string,
  repos: RepoRef[],
): Promise<void> {
  const projectId = process.env.NADF_PROJECT_ID?.trim() || "novus-intelligence";
  const art = `.nadf/projects/${projectId}/artifacts`;
  const invocation: AgentInvocation = {
    agentId,
    projectId,
    workflowId: "novus-intelligence-lovable-to-web",
    stepId,
    pattern: agentId.includes("security") ? "validator" : "executor",
    repos,
    inputs: [`${art}/informe-seguridad.md`, `${art}/security-result.json`],
    expectedOutputs:
      agentId === "security-agent"
        ? [`${art}/informe-seguridad.md`, `${art}/security-result.json`]
        : [`${art}/resumen-remediacion-cors.md`],
    constraints: [
      "NO_DEPLOY",
      "NO_SECRETS_IN_REPO",
      "NO_LOVABLE_CODE_COPY",
      agentId === "backend-agent" ? "ALLOW_PRODUCTIVE_CODE" : "NO_PRODUCTIVE_CODE",
    ],
    autoCreatePR: boolEnv("NADF_AUTO_CREATE_PR", true),
    dryRun: false,
  };
  const blockers = assertPatternGuards(invocation);
  if (blockers.length) throw new Error(blockers.join("; "));
  console.log(`[nadf:remediate] === ${stepId} / ${agentId} ===`);
  const result = await adapter.execute(invocation, prompt);
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "finished") {
    throw new Error(`${agentId} status=${result.status}: ${result.summary}`);
  }
}

async function main(): Promise<void> {
  loadDotEnv();
  const apiKey = requireEnv("CURSOR_API_KEY");
  const model = process.env.NADF_MODEL?.trim() || "composer-2.5";
  const adapter = createAdapter({ apiKey, modelId: model });

  const framework: RepoRef = {
    role: "framework",
    url: requireEnv("NADF_REPO_FRAMEWORK"),
    ref: process.env.NADF_REF_FRAMEWORK?.trim() || "feature/nadf-foundation",
  };
  const backend: RepoRef = {
    role: "backend",
    url:
      process.env.NADF_REPO_BACKEND?.trim() ||
      "https://github.com/arodriguez-novusintelligence/NovusIntelligenceBack.git",
    ref: "main",
  };

  // 1) Backend remedia CORS
  await invokeAgent(
    adapter,
    "backend-agent",
    "remediate-sec-cors-001",
    buildCorsRemediationPrompt({
      agentId: "backend-agent",
      projectId: process.env.NADF_PROJECT_ID?.trim() || "novus-intelligence",
      workflowId: "novus-intelligence-lovable-to-web",
      stepId: "remediate-sec-cors-001",
      pattern: "executor",
      repos: [framework, backend],
      inputs: [],
      expectedOutputs: [],
      constraints: [],
      autoCreatePR: true,
      dryRun: false,
    }),
    [framework, backend],
  );

  // 2) Security re-check
  await invokeAgent(
    adapter,
    "security-agent",
    "revalidate-security-after-cors",
    buildSecurityRecheckPrompt({
      agentId: "security-agent",
      projectId: process.env.NADF_PROJECT_ID?.trim() || "novus-intelligence",
      workflowId: "novus-intelligence-lovable-to-web",
      stepId: "revalidate-security-after-cors",
      pattern: "validator",
      repos: [framework, backend],
      inputs: [],
      expectedOutputs: [],
      constraints: [],
      autoCreatePR: true,
      dryRun: false,
    }),
    [framework, backend],
  );

  // 3) Merge + deploy DEV (gates frescos vía post-pipeline)
  process.env.NADF_SMOKE_TEST = "false";
  process.env.NADF_PROTECT_ARCHETYPE = "false";
  process.env.NADF_AUTO_MERGE_DEV = "true";
  process.env.NADF_AUTO_DEPLOY_DEV = "true";
  process.env.NADF_REQUIRE_VISUAL_PARITY = "false";
  process.env.NADF_ARTIFACTS_REMOTE_ONLY = "true";
  runNpm("post-pipeline-dev");

  console.log("\n[nadf:remediate] COMPLETE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
