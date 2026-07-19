/* NADF-GUIDE
 * Propósito: Motor de Complexity Routing — elige perfil mínimo suficiente.
 * Configuración: Reglas embebidas alineadas a routing-rules.yml; fail-safe FULL.
 */
import type { ComplexitySignals, RoutingDecision } from "./types.js";
import { baseDecision, normalizeProfile } from "./profile.js";

const TRIVIAL = new Set([
  "visual",
  "content",
  "cosmetic",
  "copy",
  "typography",
  "color",
  "asset",
  "image",
  "banner",
  "spacing",
  "style",
]);

const LW_FE = new Set([
  "static_page",
  "navigation",
  "component",
  "frontend_validation",
  "accessibility",
]);

const LW_BE = new Set(["query", "read_endpoint", "backend_config"]);

const CRITICAL_RE =
  /\b(authentication|autenticaci[oó]n|\bauth\b|oauth|jwt|payment|pago|billing|migration|migraci[oó]n|schema|pii|gdpr|production|producci[oó]n|secrets?|secretos|iam|rbac|encryption|cifrado)\b/i;

const BLOCKED_RE =
  /\b(ambiguous|ambiguo|incomplete|incompleto|unknown[_\s-]?dependency|missing[_\s-]?acceptance|contradictorio)\b/i;

function normTypes(types: string[] | undefined): string[] {
  return (types ?? [])
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean);
}

function textBlob(signals: ComplexitySignals): string {
  return [signals.description ?? "", ...(signals.changeTypes ?? [])]
    .join(" ")
    .toLowerCase();
}

/**
 * Decide el perfil de ejecución a partir de señales normalizadas.
 * Ante duda → FULL. No implementa el cambio; solo enruta.
 */
export function decideComplexity(
  signals: ComplexitySignals,
): RoutingDecision {
  const types = normTypes(signals.changeTypes);
  const blob = textBlob(signals);
  const backend =
    signals.backendRequired === true ||
    (signals.layers ?? []).some((l) =>
      ["backend", "database", "api"].includes(String(l).toLowerCase()),
    );

  if (signals.ambiguous === true || BLOCKED_RE.test(blob)) {
    return baseDecision("BLOCKED", {
      confidence: 0.3,
      changeTypes: types,
      rationale: [
        "Requerimiento ambiguo o señales de bloqueo detectadas.",
        "Falta información crítica para enrutar con seguridad.",
      ],
      requiresHumanApproval: true,
    });
  }

  if (CRITICAL_RE.test(blob)) {
    return baseDecision("FULL", {
      confidence: 0.95,
      changeTypes: types,
      criticalityOverride: true,
      rationale: [
        "Criticality override: autenticación, pagos, migración, secretos o producción.",
        "Un cambio pequeño en superficie puede ser CRITICAL en riesgo.",
      ],
      level: "CRITICAL",
      requiresHumanApproval: true,
    });
  }

  const explicit = normalizeProfile(signals.explicitRoute ?? null);
  if (explicit === "FULL") {
    return baseDecision("FULL", {
      confidence: 0.9,
      changeTypes: types,
      rationale: ["Ruta explícita FULL del intake/analyzer."],
    });
  }
  if (explicit === "BLOCKED") {
    return baseDecision("BLOCKED", {
      confidence: 0.9,
      changeTypes: types,
      rationale: ["Ruta explícita BLOCKED."],
      requiresHumanApproval: true,
    });
  }

  const allTrivial =
    types.length > 0 && types.every((t) => TRIVIAL.has(t)) && !backend;
  const allLwFe =
    types.length > 0 &&
    types.every((t) => TRIVIAL.has(t) || LW_FE.has(t)) &&
    types.some((t) => LW_FE.has(t)) &&
    !backend;
  const allLwBe =
    types.length > 0 &&
    types.every((t) => LW_BE.has(t)) &&
    backend !== false &&
    signals.frontendRequired !== true;

  if (
    (explicit === "TRIVIAL_VISUAL" ||
      signals.explicitRoute === "visual-fast") &&
    allTrivial
  ) {
    return baseDecision("TRIVIAL_VISUAL", {
      confidence: 0.94,
      changeTypes: types,
      rationale: [
        "Cambio visual/content explícito sin backend.",
        "Flujo mínimo: desarrollo FE → pruebas ligeras → deploy.",
        "Omitidos: arquitectura, backend, database, API, cloud, security-full.",
      ],
    });
  }

  if (allTrivial) {
    return baseDecision("TRIVIAL_VISUAL", {
      confidence: 0.92,
      changeTypes: types,
      rationale: [
        "Solo tipos triviales (visual/content) y backendRequired=false.",
        "Minimum Sufficient Execution: sin arquitectura ni agentes de dominio.",
      ],
    });
  }

  if (allLwFe || (explicit === "LIGHTWEIGHT_FRONTEND" && !backend)) {
    return baseDecision("LIGHTWEIGHT_FRONTEND", {
      confidence: 0.88,
      changeTypes: types,
      rationale: [
        "Cambio frontend acotado sin persistencia ni API nueva.",
        "Agentes: frontend + QA; sin arquitectura completa.",
      ],
    });
  }

  if (allLwBe || explicit === "LIGHTWEIGHT_BACKEND") {
    return baseDecision("LIGHTWEIGHT_BACKEND", {
      confidence: 0.86,
      changeTypes: types,
      rationale: [
        "Cambio backend/query acotado sin UI.",
        "Agentes: backend + QA; sin diseño FE ni cloud full.",
      ],
    });
  }

  if (explicit === "STANDARD") {
    return baseDecision("STANDARD", {
      confidence: 0.85,
      changeTypes: types,
      rationale: ["Perfil STANDARD solicitado explícitamente."],
    });
  }

  // Tipos mixtos FE+BE o funcionales → no ahorrar.
  if (types.length === 0) {
    return baseDecision("FULL", {
      confidence: 0.55,
      changeTypes: types,
      rationale: [
        "Sin changeTypes claros: fail-safe FULL.",
        "Preferir gastar agentes a subclasificar.",
      ],
    });
  }

  if (backend && types.some((t) => TRIVIAL.has(t) || LW_FE.has(t))) {
    return baseDecision("STANDARD", {
      confidence: 0.8,
      changeTypes: types,
      rationale: [
        "Señales FE junto a backendRequired: perfil STANDARD (1–2 capas).",
      ],
    });
  }

  return baseDecision("FULL", {
    confidence: 0.75,
    changeTypes: types,
    rationale: [
      "Cambio funcional/estructural o cross-layer.",
      "Se ejecuta el flujo multiagente completo.",
    ],
  });
}

/** Reevaluación tras evidencia nueva (escalamiento). Nunca baja el perfil aquí. */
export function escalateProfile(
  current: RoutingDecision,
  evidence: string[],
): RoutingDecision {
  if (current.profile === "FULL" || current.profile === "BLOCKED") {
    return {
      ...current,
      rationale: [
        ...current.rationale,
        `Reassessment: evidencia=${evidence.join(",") || "none"} (sin cambio de perfil).`,
      ],
    };
  }
  const hit = evidence.some((e) =>
    current.escalationOn.includes(e.toUpperCase()),
  );
  if (!hit && evidence.length === 0) return current;
  return baseDecision("FULL", {
    confidence: Math.min(current.confidence, 0.7),
    changeTypes: current.changeTypes,
    criticalityOverride: evidence.some((e) =>
      ["AUTH_TOUCHED", "SECURITY_SENSITIVE", "DATA_MIGRATION"].includes(
        e.toUpperCase(),
      ),
    ),
    rationale: [
      ...current.rationale,
      `Escalado desde ${current.profile} por evidencia: ${evidence.join(", ")}.`,
      "No se continúa con el perfil ligero tras nueva evidencia de riesgo.",
    ],
  });
}
