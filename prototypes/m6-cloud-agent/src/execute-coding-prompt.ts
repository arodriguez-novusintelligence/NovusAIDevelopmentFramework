/* NADF-GUIDE
 * Propósito: Ejecutar un prompt de coding sobre uno o más repos vía RuntimeAdapter.
 * Configuración: Usa createAdapter(); Cursor Cloud soporta multi-repo; otros runtimes bloquean PR.
 */
import { createAdapter } from "./ai-runtime/index.js";
import type {
  AgentInvocation,
  AgentResult,
  RepoRef,
  RuntimeAdapter,
} from "./types.js";

export async function executeCodingPrompt(options: {
  prompt: string;
  repos: RepoRef[];
  agentId?: string;
  projectId?: string;
  stepId?: string;
  autoCreatePR?: boolean;
  adapter?: RuntimeAdapter;
}): Promise<AgentResult> {
  const adapter = options.adapter ?? createAdapter();
  const invocation: AgentInvocation = {
    agentId: options.agentId ?? "coding-agent",
    projectId: options.projectId ?? "nadf",
    workflowId: "ai-runtime-coding",
    stepId: options.stepId ?? "execute-coding-prompt",
    pattern: "executor",
    repos: options.repos,
    inputs: [],
    expectedOutputs: [],
    constraints: ["PROVIDER_AGNOSTIC_RUNTIME"],
    autoCreatePR: options.autoCreatePR ?? true,
    dryRun: false,
  };

  if (invocation.autoCreatePR && !adapter.supports("pr")) {
    return {
      status: "blocked",
      runtime: "other",
      filesChanged: [],
      artifactsProduced: [],
      summary: `Coding runtime '${adapter.name}' no soporta PR. Use NADF_CODING_RUNTIME=cursor-cloud.`,
      blockers: [`CODING_RUNTIME_CAPABILITY_MISSING:pr (adapter=${adapter.name})`],
    };
  }

  // Un repo por execute cuando el adapter es Cursor (multi-repo en un Agent.create).
  // Para varios repos secuenciales, el caller puede iterar; aquí un solo execute con todos.
  return adapter.execute(invocation, options.prompt);
}
