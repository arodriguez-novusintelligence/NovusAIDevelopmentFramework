/* NADF-GUIDE
 * Propósito: Helpers de perfiles de ejecución y compatibilidad visual-fast.
 * Configuración: NADF_EXECUTION_PROFILE acepta alias legacy y perfiles canónicos.
 */
import type { ExecutionProfileId, RoutingDecision } from "./types.js";

const LIGHTWEIGHT: ReadonlySet<string> = new Set([
  "visual-fast",
  "TRIVIAL_VISUAL",
  "LIGHTWEIGHT_FRONTEND",
  "LIGHTWEIGHT_BACKEND",
]);

const PROFILE_AGENTS: Record<ExecutionProfileId, string[]> = {
  TRIVIAL_VISUAL: ["frontend-integration-agent", "qa-agent"],
  LIGHTWEIGHT_FRONTEND: ["frontend-integration-agent", "qa-agent"],
  LIGHTWEIGHT_BACKEND: ["backend-agent", "qa-agent"],
  STANDARD: [
    "planner-agent",
    "frontend-integration-agent",
    "backend-agent",
    "qa-agent",
    "security-agent",
  ],
  FULL: [],
  BLOCKED: [],
};

const PROFILE_EXCLUDED: Record<ExecutionProfileId, string[]> = {
  TRIVIAL_VISUAL: [
    "architecture",
    "backend",
    "database",
    "api",
    "cloud",
    "security_full",
  ],
  LIGHTWEIGHT_FRONTEND: ["architecture", "backend", "database", "api", "cloud"],
  LIGHTWEIGHT_BACKEND: ["architecture", "frontend_design", "cloud_full"],
  STANDARD: [],
  FULL: [],
  BLOCKED: ["all"],
};

const PROFILE_DEPLOY: Record<ExecutionProfileId, string[]> = {
  TRIVIAL_VISUAL: ["frontend"],
  LIGHTWEIGHT_FRONTEND: ["frontend"],
  LIGHTWEIGHT_BACKEND: ["backend"],
  STANDARD: ["frontend", "backend"],
  FULL: ["frontend", "backend"],
  BLOCKED: [],
};

const ESCALATION: Record<ExecutionProfileId, string[]> = {
  TRIVIAL_VISUAL: [
    "BACKEND_FILES_TOUCHED",
    "CONTRACT_CHANGE",
    "AUTH_TOUCHED",
    "BUILD_FAILURE",
    "BUSINESS_LOGIC_DETECTED",
  ],
  LIGHTWEIGHT_FRONTEND: [
    "BACKEND_REQUIRED",
    "API_CONTRACT_CHANGE",
    "BUILD_FAILURE",
  ],
  LIGHTWEIGHT_BACKEND: [
    "SCHEMA_CHANGE",
    "MIGRATION_REQUIRED",
    "SECURITY_SENSITIVE",
  ],
  STANDARD: ["AUTH_TOUCHED", "DATA_MIGRATION", "CROSS_LAYER_EXPANSION"],
  FULL: ["CRITICAL_OVERRIDE"],
  BLOCKED: [],
};

export function normalizeProfile(
  raw: string | undefined | null,
): ExecutionProfileId | null {
  if (!raw) return null;
  const v = raw.trim();
  if (v === "visual-fast") return "TRIVIAL_VISUAL";
  if (v === "full") return "FULL";
  if (v === "blocked") return "BLOCKED";
  const upper = v.toUpperCase().replace(/-/g, "_");
  const known: ExecutionProfileId[] = [
    "TRIVIAL_VISUAL",
    "LIGHTWEIGHT_FRONTEND",
    "LIGHTWEIGHT_BACKEND",
    "STANDARD",
    "FULL",
    "BLOCKED",
  ];
  return known.includes(upper as ExecutionProfileId)
    ? (upper as ExecutionProfileId)
    : null;
}

/** True si el perfil omite arquitectura y corre solo desarrollo+pruebas+deploy acotado. */
export function isLightweightProfile(
  profileOrEnv?: string | null,
): boolean {
  const fromEnv =
    profileOrEnv ?? process.env.NADF_EXECUTION_PROFILE?.trim() ?? "";
  const normalized = normalizeProfile(fromEnv) ?? fromEnv;
  return LIGHTWEIGHT.has(normalized) || LIGHTWEIGHT.has(fromEnv);
}

export function isFrontendOnlyProfile(
  profileOrEnv?: string | null,
): boolean {
  const fromEnv =
    profileOrEnv ?? process.env.NADF_EXECUTION_PROFILE?.trim() ?? "";
  const p = normalizeProfile(fromEnv) ?? fromEnv;
  return (
    p === "TRIVIAL_VISUAL" ||
    p === "LIGHTWEIGHT_FRONTEND" ||
    fromEnv === "visual-fast"
  );
}

export function legacyRouteFor(
  profile: ExecutionProfileId,
): "visual-fast" | "full" | "blocked" {
  if (profile === "BLOCKED") return "blocked";
  if (profile === "TRIVIAL_VISUAL" || profile === "LIGHTWEIGHT_FRONTEND") {
    return "visual-fast";
  }
  return "full";
}

export function baseDecision(
  profile: ExecutionProfileId,
  extras: Partial<RoutingDecision> & {
    rationale: string[];
    changeTypes: string[];
    confidence: number;
  },
): RoutingDecision {
  const lightweight = isLightweightProfile(profile);
  return {
    profile,
    route: legacyRouteFor(profile),
    lightweight,
    level:
      profile === "TRIVIAL_VISUAL"
        ? "TRIVIAL"
        : profile === "LIGHTWEIGHT_FRONTEND" ||
            profile === "LIGHTWEIGHT_BACKEND"
          ? "LOW"
          : profile === "STANDARD"
            ? "MODERATE"
            : profile === "BLOCKED"
              ? "BLOCKED"
              : "HIGH",
    mode:
      profile === "TRIVIAL_VISUAL"
        ? "DIRECT"
        : profile === "LIGHTWEIGHT_FRONTEND" ||
            profile === "LIGHTWEIGHT_BACKEND"
          ? "SELECTIVE"
          : profile === "STANDARD"
            ? "STANDARD"
            : profile === "BLOCKED"
              ? "BLOCKED"
              : "FULL",
    selectedAgents: PROFILE_AGENTS[profile],
    excludedDomains: PROFILE_EXCLUDED[profile],
    deployTargets: PROFILE_DEPLOY[profile],
    requiresHumanApproval: profile === "BLOCKED",
    escalationOn: ESCALATION[profile],
    criticalityOverride: false,
    ...extras,
  };
}
