/* NADF-GUIDE
 * Propósito: Tipos del Complexity Routing (perfiles y RoutingDecision).
 * Configuración: Mantener alineado con .nadf/global/complexity-routing/*.yml.
 */
export type ExecutionProfileId =
  | "TRIVIAL_VISUAL"
  | "LIGHTWEIGHT_FRONTEND"
  | "LIGHTWEIGHT_BACKEND"
  | "STANDARD"
  | "FULL"
  | "BLOCKED";

export type ComplexityLevel =
  | "TRIVIAL"
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "CRITICAL"
  | "BLOCKED";

export type RoutingMode =
  | "DIRECT"
  | "SELECTIVE"
  | "STANDARD"
  | "FULL"
  | "BLOCKED";

/** Señales normalizadas — agnósticas a Lovable / Issues / initiative. */
export type ComplexitySignals = {
  source?: string;
  description?: string;
  changeTypes?: string[];
  backendRequired?: boolean;
  frontendRequired?: boolean;
  layers?: string[];
  /** Ruta explícita del analyzer (visual-fast|full) u perfil. */
  explicitRoute?: string;
  ambiguous?: boolean;
};

export type RoutingDecision = {
  profile: ExecutionProfileId;
  /** Alias legacy para Actions: visual-fast | full | blocked */
  route: "visual-fast" | "full" | "blocked";
  lightweight: boolean;
  level: ComplexityLevel;
  mode: RoutingMode;
  selectedAgents: string[];
  excludedDomains: string[];
  deployTargets: string[];
  requiresHumanApproval: boolean;
  confidence: number;
  rationale: string[];
  escalationOn: string[];
  changeTypes: string[];
  criticalityOverride: boolean;
};
