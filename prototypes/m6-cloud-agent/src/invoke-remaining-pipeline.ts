/**
 * Ejecuta el resto del workflow lovable-to-web (post Plan Review approved)
 * en secuencia vía Cursor Cloud Agent.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { NadfAgentRuntime } from "./AgentRuntime.js";
import { CursorCloudAdapter } from "./adapters/CursorCloudAdapter.js";
import { buildPipelinePrompt } from "./prompts/pipeline.js";
import { buildAgentPrompt } from "./prompts/lovable-analyzer.js";
import type {
  AgentInvocation,
  AgentPattern,
  AgentResult,
  RepoRef,
} from "./types.js";

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

const PROJECT = "novus-intelligence";
const ART = `.nadf/projects/${PROJECT}/artifacts`;
const WF = "novus-intelligence-lovable-to-web";

type Step = {
  agentId: string;
  stepId: string;
  pattern: AgentPattern;
  expectedOutputs: string[];
  repos: ("framework" | "frontend" | "backend" | "lovable")[];
  frameworkRefEnv?: string;
};

const STEPS: Step[] = [
  {
    agentId: "frontend-integration-agent",
    stepId: "paso-04-implementar-frontend",
    pattern: "executor",
    expectedOutputs: [`${ART}/resumen-frontend.md`],
    repos: ["framework", "frontend", "lovable"],
  },
  {
    agentId: "backend-agent",
    stepId: "paso-06-implementar-backend",
    pattern: "executor",
    expectedOutputs: [`${ART}/resumen-backend.md`],
    repos: ["framework", "backend"],
  },
  {
    agentId: "cloud-agent",
    stepId: "paso-08-propuesta-infra",
    pattern: "executor",
    expectedOutputs: [`${ART}/propuesta-infra.md`, `${ART}/resumen-cloud.md`],
    repos: ["framework"],
  },
  {
    agentId: "qa-agent",
    stepId: "paso-09-validar-qa",
    pattern: "validator",
    expectedOutputs: [`${ART}/informe-qa.md`, `${ART}/qa-result.json`],
    repos: ["framework", "frontend", "backend"],
  },
  {
    agentId: "visual-parity-agent",
    stepId: "paso-12-paridad-visual",
    pattern: "validator",
    expectedOutputs: [
      `${ART}/visual-parity-result.json`,
      `${ART}/informe-paridad-visual.md`,
      `${ART}/gaps-paridad.json`,
    ],
    repos: ["framework", "frontend", "lovable"],
  },
  {
    agentId: "security-agent",
    stepId: "paso-10-revision-seguridad",
    pattern: "validator",
    expectedOutputs: [
      `${ART}/informe-seguridad.md`,
      `${ART}/security-result.json`,
    ],
    repos: ["framework", "frontend", "backend"],
  },
  {
    agentId: "documentation-agent",
    stepId: "paso-11-documentar",
    pattern: "blackboard",
    expectedOutputs: [`${ART}/resumen-ejecucion.md`],
    repos: ["framework"],
  },
  {
    agentId: "metrics-agent",
    stepId: "paso-12-metricas",
    pattern: "blackboard",
    expectedOutputs: [
      `${ART}/metricas-ejecucion.json`,
      `${ART}/resumen-metricas.md`,
    ],
    repos: ["framework"],
  },
  {
    agentId: "reflection-agent",
    stepId: "paso-13-reflexion",
    pattern: "reflection",
    expectedOutputs: [
      `${ART}/reflexion-ejecucion.md`,
      `${ART}/recomendaciones-kb.json`,
    ],
    repos: ["framework"],
  },
  {
    agentId: "knowledge-base-agent",
    stepId: "paso-14-actualizar-kb",
    pattern: "blackboard",
    expectedOutputs: [`${ART}/actualizacion-kb.md`],
    repos: ["framework"],
  },
  {
    agentId: "adr-agent",
    stepId: "paso-15-registrar-adrs",
    pattern: "blackboard",
    expectedOutputs: [`${ART}/registro-adr.md`],
    repos: ["framework"],
  },
];

function buildRepos(
  kinds: Step["repos"],
  frameworkRef: string,
): RepoRef[] {
  const map: Record<string, RepoRef> = {
    framework: {
      role: "framework",
      url: requireEnv("NADF_REPO_FRAMEWORK"),
      ref: frameworkRef,
    },
    frontend: {
      role: "frontend",
      url:
        process.env.NADF_REPO_FRONTEND?.trim() ||
        "https://github.com/arodriguez-novusintelligence/NovusIntelligenceWEB.git",
      ref: "main",
    },
    backend: {
      role: "backend",
      url:
        process.env.NADF_REPO_BACKEND?.trim() ||
        "https://github.com/arodriguez-novusintelligence/NovusIntelligenceBack.git",
      ref: "main",
    },
    lovable: {
      role: "lovable_source",
      url: requireEnv("NADF_REPO_LOVABLE"),
      ref: process.env.NADF_REF_LOVABLE?.trim() || "main",
    },
  };
  return kinds.map((k) => map[k]);
}

async function runStep(
  runtime: NadfAgentRuntime,
  step: Step,
  frameworkRef: string,
): Promise<{ result: AgentResult; frameworkRef: string }> {
  const invocation: AgentInvocation = {
    agentId: step.agentId,
    projectId: PROJECT,
    workflowId: WF,
    stepId: step.stepId,
    pattern: step.pattern,
    repos: buildRepos(step.repos, frameworkRef),
    inputs: [
      `${ART}/plan-implementacion.md`,
      `${ART}/impacto-arquitectonico.md`,
      `${ART}/tareas-ejecutor.json`,
    ],
    expectedOutputs: step.expectedOutputs,
    constraints: [
      "NO_DEPLOY",
      "NO_SECRETS_IN_REPO",
      "NO_LOVABLE_CODE_COPY",
      "PLAN_MUST_BE_APPROVED",
      "TARGET_DEV_REGION_SA_EAST_1",
      step.pattern === "executor" ? "ALLOW_PRODUCTIVE_CODE" : "NO_PRODUCTIVE_CODE",
    ],
    autoCreatePR: true,
    dryRun: false,
  };

  // Use pipeline prompts for remaining agents; fall back to registry prompts.
  const known = new Set([
    "lovable-analyzer-agent",
    "planner-agent",
    "backend-impact-agent",
    "architect-agent",
  ]);
  const originalBuild = buildAgentPrompt;
  // Monkey-patch via wrapper in runtime — we pass prompt by adapter path:
  // NadfAgentRuntime uses buildAgentPrompt; temporarily we call adapter after
  // building pipeline prompt ourselves.
  console.log(`\n[nadf:m6] === ${step.stepId} / ${step.agentId} ===`);
  console.log(
    JSON.stringify(
      {
        agentId: step.agentId,
        frameworkRef,
        repos: invocation.repos.map((r) => ({ role: r.role, ref: r.ref })),
      },
      null,
      2,
    ),
  );

  // Inline invoke using pipeline prompt for these agents
  const { assertPatternGuards } = await import("./guards.js");
  const blockers = assertPatternGuards(invocation);
  if (blockers.length) {
    return {
      result: {
        status: "blocked",
        runtime: "other",
        filesChanged: [],
        artifactsProduced: [],
        summary: blockers.join("; "),
        blockers,
      },
      frameworkRef,
    };
  }

  const prompt = known.has(step.agentId)
    ? originalBuild(invocation)
    : buildPipelinePrompt(invocation);

  const adapter = (runtime as any).adapter as CursorCloudAdapter;
  const result = await adapter.execute(invocation, prompt);

  // Prefer continuing framework from latest agent branch if git info present
  // (SDK may not surface it in our AgentResult yet — keep same ref chain:
  // user merges PRs later; we pass previous PR head via env update if set)
  return { result, frameworkRef };
}

async function main(): Promise<void> {
  loadDotEnv();
  const apiKey = requireEnv("CURSOR_API_KEY");
  const model = process.env.NADF_MODEL?.trim() || "composer-2.5";
  let frameworkRef =
    process.env.NADF_REF_FRAMEWORK?.trim() ||
    "cursor/validar-arquitectura-paso03-5e70";

  const adapter = new CursorCloudAdapter(apiKey, model);
  const runtime = new NadfAgentRuntime(adapter);

  const results: { step: string; status: string; summary: string; agentRuntimeId?: string; runId?: string }[] =
    [];

  for (const step of STEPS) {
    const { result } = await runStep(runtime, step, frameworkRef);
    results.push({
      step: step.stepId,
      status: result.status,
      summary: (result.summary || "").slice(0, 280),
      agentRuntimeId: result.agentRuntimeId,
      runId: result.runId,
    });
    console.log(`[nadf:m6] ${step.stepId} => ${result.status}`);
    writeFileSync(
      resolve(process.cwd(), "pipeline-results.json"),
      JSON.stringify(results, null, 2),
      "utf8",
    );
    if (result.status === "blocked" || result.status === "error") {
      console.error(`[nadf:m6] Pipeline detenida en ${step.stepId}`);
      process.exit(result.status === "blocked" ? 3 : 2);
    }

    // After each successful step, try to discover latest open PR head for framework
    // via gh if available — keeps artifacts chain. Soft-fail.
    try {
      const { execSync } = await import("node:child_process");
      const out = execSync(
        'gh pr list --repo arodriguez-novusintelligence/NovusAIDevelopmentFramework --state open --limit 1 --json headRefName -q ".[0].headRefName"',
        { encoding: "utf8" },
      ).trim();
      if (out) {
        frameworkRef = out;
        console.log(`[nadf:m6] frameworkRef actualizado → ${frameworkRef}`);
      }
    } catch {
      /* keep previous ref */
    }
  }

  console.log("\n[nadf:m6] PIPELINE COMPLETE");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
