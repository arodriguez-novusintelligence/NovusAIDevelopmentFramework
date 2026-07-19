/* NADF-GUIDE
 * Propósito: Implementa o configura types dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
/**
 * Tipos del contrato AgentRuntime (M6) — subset usado por el prototipo.
 * Fuente normativa: docs/runtime/agent-runtime-contract.md
 */

export type AgentPattern =
  | "planner"
  | "executor"
  | "validator"
  | "event_driven"
  | "blackboard"
  | "reflection"
  | "mediator";

export type RepoRole =
  | "framework"
  | "lovable_source"
  | "frontend"
  | "backend"
  | "other";

export interface RepoRef {
  role: RepoRole;
  url: string;
  ref?: string;
}

export interface AgentInvocation {
  agentId: string;
  projectId: string;
  workflowId: string;
  stepId: string;
  pattern: AgentPattern;
  repos: RepoRef[];
  inputs: string[];
  expectedOutputs: string[];
  constraints: string[];
  autoCreatePR: boolean;
  dryRun: boolean;
}

export interface AgentResult {
  status: "finished" | "error" | "cancelled" | "blocked";
  runtime:
    | "cursor-cloud"
    | "cursor-local"
    | "claude-code"
    | "anthropic"
    | "noop"
    | "other";
  agentRuntimeId?: string;
  runId?: string;
  filesChanged: string[];
  artifactsProduced: string[];
  summary: string;
  blockers: string[];
  metrics?: {
    agentName: string;
    status: string;
    startTime?: string;
    endTime?: string;
  };
}

export interface AgentRuntime {
  invoke(invocation: AgentInvocation): Promise<AgentResult>;
  /** Expuesto para pipelines que necesitan el adapter sin cast a Cursor. */
  readonly adapter: RuntimeAdapter;
}

export interface RuntimeAdapter {
  readonly name: string;
  supports(capability: "invoke" | "resume" | "stream" | "pr"): boolean;
  execute(invocation: AgentInvocation, prompt: string): Promise<AgentResult>;
}
