/* NADF-GUIDE
 * Propósito: Tipos del AI Runtime factory (Coding Runtime ids).
 * Configuración: Alineado a .nadf/global/ai-runtime/providers.yml.
 */
export type CodingRuntimeId = "cursor-cloud" | "anthropic" | "noop";

export type RuntimeCapability =
  | "invoke"
  | "resume"
  | "stream"
  | "pr"
  | "repo_write";

export const CODING_RUNTIME_CAPABILITIES: Record<
  CodingRuntimeId,
  RuntimeCapability[]
> = {
  "cursor-cloud": ["invoke", "resume", "stream", "pr", "repo_write"],
  anthropic: ["invoke"],
  noop: ["invoke"],
};
