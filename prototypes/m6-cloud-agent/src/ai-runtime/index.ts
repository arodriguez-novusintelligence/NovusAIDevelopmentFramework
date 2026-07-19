/* NADF-GUIDE
 * Propósito: API pública del AI Runtime (factory provider-agnostic).
 * Configuración: NADF_CODING_RUNTIME + secrets del provider.
 */
export {
  createAdapter,
  createRuntimeAdapter,
  resolveCodingRuntimeId,
  runtimeSupports,
} from "./createAdapter.js";
export {
  CODING_RUNTIME_CAPABILITIES,
  type CodingRuntimeId,
  type RuntimeCapability,
} from "./types.js";
