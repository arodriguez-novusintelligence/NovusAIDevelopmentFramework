/* NADF-GUIDE
 * Propósito: Decide visual-fast|full desde el artifact fresco del analyzer.
 * Configuración: GH_TOKEN y opcional NADF_FRAMEWORK_REPO.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

type Change = {
  type?: string;
  requiresBackend?: boolean;
};

type ChangesArtifact = {
  analysisDate?: string;
  changes?: Change[];
  summary?: {
    backendRequired?: boolean;
    route?: string;
    latestDelta?: {
      changeTypes?: string[];
      backendRequired?: boolean;
    };
  };
};

function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8" }).trim();
}

function frameworkRepo(): string {
  return (
    process.env.NADF_FRAMEWORK_REPO?.trim() ||
    "arodriguez-novusintelligence/NovusAIDevelopmentFramework"
  );
}

function latestAnalyzerArtifact(): {
  artifact: ChangesArtifact | null;
  source: string;
  ref: string | null;
} {
  const repo = frameworkRepo();
  const raw = gh([
    "pr",
    "list",
    "--repo",
    repo,
    "--state",
    "open",
    "--limit",
    "20",
    "--json",
    "headRefName,updatedAt",
  ]);
  const prs = (
    JSON.parse(raw) as Array<{ headRefName: string; updatedAt: string }>
  )
    .filter((pr) => pr.headRefName.startsWith("cursor/"))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  const path =
    ".nadf/projects/novus-intelligence/artifacts/cambios-lovable.json";
  for (const pr of prs) {
    try {
      const encoded = gh([
        "api",
        `repos/${repo}/contents/${path}?ref=${encodeURIComponent(pr.headRefName)}`,
        "--jq",
        ".content",
      ]);
      const decoded = Buffer.from(
        encoded.replace(/\n/g, ""),
        "base64",
      ).toString("utf8");
      return {
        artifact: JSON.parse(decoded) as ChangesArtifact,
        source: `${repo}@${pr.headRefName}:${path}`,
        ref: pr.headRefName,
      };
    } catch {
      // Try the next fresh agent PR.
    }
  }
  return { artifact: null, source: "missing", ref: null };
}

function decide(artifact: ChangesArtifact | null): {
  route: "visual-fast" | "full";
  reason: string;
  types: string[];
} {
  if (!artifact) {
    return { route: "full", reason: "analyzer_artifact_missing", types: [] };
  }

  const explicit = artifact.summary?.route;
  const latest = artifact.summary?.latestDelta;
  const types =
    latest?.changeTypes?.map((type) => type.toLowerCase()) ??
    artifact.changes?.map((change) => String(change.type).toLowerCase()) ??
    [];
  const backend =
    latest?.backendRequired ??
    artifact.summary?.backendRequired ??
    artifact.changes?.some((change) => change.requiresBackend === true) ??
    true;
  const allowed = new Set(["visual", "content"]);
  const visualOnly =
    types.length > 0 && types.every((type) => allowed.has(type)) && !backend;

  if (explicit === "visual-fast" && visualOnly) {
    return { route: "visual-fast", reason: "explicit_visual_only", types };
  }
  if (visualOnly) {
    return { route: "visual-fast", reason: "visual_content_only", types };
  }
  return {
    route: "full",
    reason: explicit === "full" ? "analyzer_selected_full" : "functional_or_structural",
    types,
  };
}

const hit = latestAnalyzerArtifact();
const decision = { ...decide(hit.artifact), source: hit.source, ref: hit.ref };
writeFileSync(
  "route-decision.json",
  JSON.stringify(decision, null, 2),
  "utf8",
);
console.log(JSON.stringify(decision));
