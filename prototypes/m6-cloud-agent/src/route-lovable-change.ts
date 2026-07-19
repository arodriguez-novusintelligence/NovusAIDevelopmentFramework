/* NADF-GUIDE
 * Propósito: Router Lovable → Complexity Routing (perfil mínimo suficiente).
 * Configuración: GH_TOKEN; emite route-decision.json compatible con Actions.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  decideComplexity,
  type ComplexitySignals,
  type RoutingDecision,
} from "./complexity-routing/index.js";

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
  const path =
    ".nadf/projects/novus-intelligence/artifacts/cambios-lovable.json";

  const local = process.env.NADF_CHANGES_ARTIFACT?.trim();
  if (local && existsSync(local)) {
    return {
      artifact: JSON.parse(readFileSync(local, "utf8")) as ChangesArtifact,
      source: local,
      ref: process.env.NADF_REF_FRAMEWORK?.trim() || null,
    };
  }

  try {
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
        // next PR
      }
    }
  } catch {
    // gh unavailable
  }
  return { artifact: null, source: "missing", ref: null };
}

function signalsFromArtifact(
  artifact: ChangesArtifact | null,
): ComplexitySignals {
  if (!artifact) {
    return { source: "lovable", changeTypes: [], backendRequired: true };
  }
  const latest = artifact.summary?.latestDelta;
  const types =
    latest?.changeTypes?.map((t) => String(t).toLowerCase()) ??
    artifact.changes?.map((c) => String(c.type).toLowerCase()) ??
    [];
  const backend =
    latest?.backendRequired ??
    artifact.summary?.backendRequired ??
    artifact.changes?.some((c) => c.requiresBackend === true) ??
    true;
  return {
    source: "lovable",
    changeTypes: types,
    backendRequired: backend,
    explicitRoute: artifact.summary?.route,
    description: types.join(" "),
  };
}

const hit = latestAnalyzerArtifact();
const decision: RoutingDecision & { source: string; ref: string | null } = {
  ...decideComplexity(signalsFromArtifact(hit.artifact)),
  source: hit.source,
  ref: hit.ref,
};

writeFileSync(
  "route-decision.json",
  JSON.stringify(decision, null, 2),
  "utf8",
);
console.log(JSON.stringify(decision));
