/* NADF-GUIDE
 * Propósito: Factory de RuntimeAdapter según NADF_CODING_RUNTIME (provider-agnostic).
 * Configuración: CURSOR_API_KEY | ANTHROPIC_API_KEY | NADF_MODEL; default cursor-cloud.
 */
import { AnthropicInferenceAdapter } from "../adapters/AnthropicInferenceAdapter.js";
import { CursorCloudAdapter } from "../adapters/CursorCloudAdapter.js";
import { NoopAdapter } from "../adapters/NoopAdapter.js";
import type { RuntimeAdapter } from "../types.js";
import {
  CODING_RUNTIME_CAPABILITIES,
  type CodingRuntimeId,
} from "./types.js";

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Falta ${name} para el coding runtime seleccionado`);
  return v;
}

export function resolveCodingRuntimeId(
  raw?: string | null,
): CodingRuntimeId {
  const v = (raw ?? process.env.NADF_CODING_RUNTIME ?? "cursor-cloud")
    .trim()
    .toLowerCase();
  if (v === "cursor-cloud" || v === "cursor" || v === "cloud") {
    return "cursor-cloud";
  }
  if (v === "anthropic" || v === "claude") return "anthropic";
  if (v === "noop" || v === "dry-run" || v === "dryrun") return "noop";
  throw new Error(
    `NADF_CODING_RUNTIME desconocido: ${v}. Use cursor-cloud | anthropic | noop`,
  );
}

export function runtimeSupports(
  id: CodingRuntimeId,
  capability: keyof typeof CODING_RUNTIME_CAPABILITIES extends never
    ? never
    : "pr" | "repo_write" | "invoke" | "stream" | "resume",
): boolean {
  return CODING_RUNTIME_CAPABILITIES[id].includes(capability);
}

/**
 * Crea el adaptador de coding runtime. Default = Cursor Cloud (comportamiento histórico).
 */
export function createRuntimeAdapter(options?: {
  codingRuntime?: string | null;
  apiKey?: string;
  modelId?: string;
}): RuntimeAdapter {
  const id = resolveCodingRuntimeId(options?.codingRuntime);
  const model =
    options?.modelId?.trim() ||
    process.env.NADF_MODEL?.trim() ||
    (id === "anthropic" ? "claude-sonnet-4-20250514" : "composer-2.5");

  switch (id) {
    case "noop":
      return new NoopAdapter();
    case "anthropic": {
      const key = options?.apiKey?.trim() || requireEnv("ANTHROPIC_API_KEY");
      return new AnthropicInferenceAdapter(key, model);
    }
    case "cursor-cloud":
    default: {
      const key = options?.apiKey?.trim() || requireEnv("CURSOR_API_KEY");
      return new CursorCloudAdapter(key, model);
    }
  }
}

/** Alias corto usado por invokes. */
export const createAdapter = createRuntimeAdapter;
