/* NADF-GUIDE
 * Propósito: Exporta el API público de Complexity Routing.
 * Configuración: Usar decideComplexity desde routers y CLIs.
 */
export type {
  ComplexityLevel,
  ComplexitySignals,
  ExecutionProfileId,
  RoutingDecision,
  RoutingMode,
} from "./types.js";
export {
  decideComplexity,
  escalateProfile,
} from "./decide.js";
export {
  baseDecision,
  isFrontendOnlyProfile,
  isLightweightProfile,
  legacyRouteFor,
  normalizeProfile,
} from "./profile.js";
