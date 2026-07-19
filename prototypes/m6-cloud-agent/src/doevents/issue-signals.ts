/* NADF-GUIDE
 * Propósito: Inferir señales de Complexity Routing desde un issue de DoEventsWEB.
 * Configuración: Labels area:web|back|full; cuerpo del issue como evidencia.
 */
import type { ComplexitySignals } from "../complexity-routing/types.js";

export type DoEventsIssue = {
  number: number;
  title: string;
  body?: string | null;
  labels: string[];
  html_url?: string;
};

export type DoEventsTarget = "web" | "back" | "both";

const WEB_HINT =
  /\b(ui|ux|frontend|front-end|web|css|banner|color|texto|tipograf|pantalla|p[aá]gina|bot[oó]n|mfe|shell|react|vite)\b/i;
const BACK_HINT =
  /\b(api|lambda|backend|back-end|dynamodb|endpoint|serverless|auth|login|ticket|order|checkout|websocket)\b/i;
const VISUAL_HINT =
  /\b(color|banner|texto|tipograf|imagen|logo|estilo|spacing|margen|padding|copy|t[ií]tulo)\b/i;

export function normalizeLabels(labels: Array<string | { name?: string }>): string[] {
  return labels
    .map((l) => (typeof l === "string" ? l : l.name || ""))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveTarget(labels: string[], text: string): DoEventsTarget {
  if (labels.includes("area:full") || labels.includes("area:ambos")) return "both";
  if (labels.includes("area:web") && labels.includes("area:back")) return "both";
  if (labels.includes("area:web")) return "web";
  if (labels.includes("area:back")) return "back";

  // Plantilla NADF: dropdown Área → aparece en el body
  const areaBlock = text.match(/\b[ÁA]rea\b[:\s]*\n?\s*(web|back|ambos|both)/i);
  if (areaBlock) {
    const v = areaBlock[1].toLowerCase();
    if (v === "ambos" || v === "both") return "both";
    if (v === "back") return "back";
    return "web";
  }
  if (/\b-\s*\[\s*x\s*\]\s*ambos\b/i.test(text)) return "both";
  if (/\b-\s*\[\s*x\s*\]\s*back\b/i.test(text)) return "back";
  if (/\b-\s*\[\s*x\s*\]\s*web\b/i.test(text)) return "web";

  const web = WEB_HINT.test(text);
  const back = BACK_HINT.test(text);
  if (web && back) return "both";
  if (back && !web) return "back";
  if (web) return "web";
  return "web";
}

export function issueToSignals(issue: DoEventsIssue): {
  signals: ComplexitySignals;
  target: DoEventsTarget;
} {
  const labels = normalizeLabels(issue.labels);
  const text = `${issue.title}\n${issue.body || ""}`;
  const target = resolveTarget(labels, text);

  const changeTypes: string[] = [];
  if (VISUAL_HINT.test(text) && target === "web") {
    changeTypes.push("visual", "content");
  } else if (target === "web") {
    changeTypes.push("component", "navigation");
  } else if (target === "back") {
    changeTypes.push("query", "read_endpoint");
  } else {
    changeTypes.push("business_logic", "contract");
  }

  // Labels explícitas de tipología
  if (labels.some((l) => l.includes("visual") || l.includes("cosmetic"))) {
    changeTypes.length = 0;
    changeTypes.push("visual", "content");
  }

  const backendRequired = target === "back" || target === "both";
  const frontendRequired = target === "web" || target === "both";

  return {
    target,
    signals: {
      source: "github-issue",
      description: text.slice(0, 4000),
      changeTypes,
      backendRequired,
      frontendRequired,
      layers:
        target === "both"
          ? ["FRONTEND", "BACKEND"]
          : target === "back"
            ? ["BACKEND"]
            : ["FRONTEND"],
      ambiguous: !issue.title?.trim() || !(issue.body || "").trim(),
    },
  };
}

export function hasNadfTriggerLabel(labels: string[]): boolean {
  const set = new Set(normalizeLabels(labels));
  return set.has("nadf") || set.has("nadf:approved");
}
