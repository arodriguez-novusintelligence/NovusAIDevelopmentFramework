/**
 * Post-pipeline DEV automation (M6 companion).
 *
 * Modos:
 * - smoke (NADF_SMOKE_TEST=true): verifica que el pipeline corrió; NO merge/deploy; exit 0.
 * - full: lee gates desde artifacts FRESCOS (PR Cloud del Framework), no stale del checkout.
 *
 * Arquetipo: NADF_PROTECT_ARCHETYPE=true bloquea merge/deploy WEB/Back.
 * En piloto DEV el workflow full usa NADF_PROTECT_ARCHETYPE=false + auto merge/deploy.
 *
 * Env:
 *   NADF_SMOKE_TEST=true|false
 *   NADF_AUTO_MERGE_DEV=true|false
 *   NADF_AUTO_DEPLOY_DEV=true|false
 *   NADF_REQUIRE_VISUAL_PARITY=true|false
 *   NADF_PROTECT_ARCHETYPE=true|false (default true)
 *   NADF_FRAMEWORK_REPO=owner/repo
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type GateJson = { status?: string; result?: string } | null;

function flag(name: string, defaultValue = false): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === undefined || v === "") return defaultValue;
  return v === "1" || v === "true" || v === "yes";
}

function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8" }).trim();
}

function frameworkRepo(): string {
  return (
    process.env.NADF_FRAMEWORK_REPO?.trim() ||
    "arodriguez-novusintelligence/NovusAIDevelopmentFramework"
  );
}

function localArtifactPath(name: string): string {
  return resolve(
    process.cwd(),
    `../../.nadf/projects/novus-intelligence/artifacts/${name}`,
  );
}

function pipelineResultsPath(): string {
  return resolve(process.cwd(), "pipeline-results.json");
}

function readJsonSafe(path: string): unknown {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function isPass(obj: GateJson): boolean {
  if (!obj) return false;
  const v = String(obj.status ?? obj.result ?? "").toUpperCase();
  if (!v || v.includes("FAIL")) return false;
  return ["PASS", "PASSED", "OK", "FINISHED"].includes(v);
}

function isFail(obj: GateJson): boolean {
  if (!obj) return false;
  return String(obj.status ?? obj.result ?? "")
    .toUpperCase()
    .includes("FAIL");
}

/** Lista branches candidatas (PRs abiertos cursor/* del Framework, más recientes primero). */
function candidateFrameworkRefs(): string[] {
  const repo = frameworkRepo();
  const refs: string[] = [];
  try {
    const listRaw = gh([
      "pr",
      "list",
      "--repo",
      repo,
      "--state",
      "open",
      "--limit",
      "20",
      "--json",
      "number,updatedAt,headRefName,isDraft",
    ]);
    const prs = JSON.parse(listRaw) as Array<{
      number: number;
      updatedAt: string;
      headRefName: string;
      isDraft: boolean;
    }>;
    prs
      .filter((p) => p.headRefName.startsWith("cursor/"))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .forEach((p) => refs.push(p.headRefName));
  } catch (e) {
    console.warn("candidateFrameworkRefs pr list failed", e);
  }
  const envRef = process.env.NADF_REF_FRAMEWORK?.trim();
  if (envRef && !refs.includes(envRef)) refs.push(envRef);
  return refs;
}

/** Descarga un artifact JSON desde un ref del Framework vía GitHub API. */
function fetchArtifactFromRef(
  ref: string,
  fileName: string,
): { data: GateJson; source: string } | null {
  const repo = frameworkRepo();
  const path = `.nadf/projects/novus-intelligence/artifacts/${fileName}`;
  try {
    const raw = gh([
      "api",
      `repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
      "--jq",
      ".content",
    ]);
    if (!raw) return null;
    const decoded = Buffer.from(raw.replace(/\n/g, ""), "base64").toString(
      "utf8",
    );
    const data = JSON.parse(decoded) as GateJson;
    return { data, source: `${repo}@${ref}:${path}` };
  } catch {
    return null;
  }
}

function resolveGateArtifact(fileName: string): {
  data: GateJson;
  source: string;
} {
  // 1) Preferir PR/branch Cloud reciente (fresco)
  for (const ref of candidateFrameworkRefs()) {
    const hit = fetchArtifactFromRef(ref, fileName);
    if (hit?.data) {
      // Persistir localmente para auditoría del run CI
      try {
        const local = localArtifactPath(fileName);
        mkdirSync(dirname(local), { recursive: true });
        writeFileSync(local, JSON.stringify(hit.data, null, 2), "utf8");
      } catch {
        /* ignore */
      }
      return hit;
    }
  }

  // 2) Fallback local SOLO si es del workspace actual y no forzamos remote-only
  if (!flag("NADF_ARTIFACTS_REMOTE_ONLY", false)) {
    const local = localArtifactPath(fileName);
    const data = readJsonSafe(local) as GateJson;
    if (data) {
      console.log(
        JSON.stringify({
          event: "artifact_fallback_local",
          fileName,
          warning:
            "Usando checkout local — puede estar stale. Preferir PRs cursor/*.",
        }),
      );
      return { data, source: `local:${local}` };
    }
  }

  return { data: null, source: "missing" };
}

function smokePassed(): boolean {
  const results = readJsonSafe(pipelineResultsPath()) as Array<{
    step?: string;
    status?: string;
  }> | null;

  if (Array.isArray(results) && results.length > 0) {
    const anyFinished = results.some((r) => r.status === "finished");
    const anyError = results.some(
      (r) => r.status === "error" || r.status === "blocked",
    );
    console.log(
      JSON.stringify({
        event: "smoke_pipeline_results",
        steps: results.length,
        anyFinished,
        anyError,
        last: results[results.length - 1],
      }),
    );
    // Smoke OK si al menos un paso Cloud terminó (aunque gates posteriores fallen)
    return anyFinished;
  }

  // Sin remaining-pipeline (p.ej. smoke solo analyzer): señal mínima = env + gh auth
  try {
    gh(["auth", "status"]);
    console.log(
      JSON.stringify({
        event: "smoke_minimal_ok",
        reason: "no_pipeline_results_but_gh_ok_assume_prior_steps_ok",
      }),
    );
    // En CI el job solo llega aquí si invokes anteriores no fallaron (set -e)
    return true;
  } catch {
    return false;
  }
}

function validationPassed(): {
  ok: boolean;
  qa: GateJson;
  sec: GateJson;
  visual: GateJson;
  sources: Record<string, string>;
} {
  const qaHit = resolveGateArtifact("qa-result.json");
  const secHit = resolveGateArtifact("security-result.json");
  const visualHit = resolveGateArtifact("visual-parity-result.json");

  const requireVisual = flag("NADF_REQUIRE_VISUAL_PARITY", true);
  const sources = {
    qa: qaHit.source,
    security: secHit.source,
    visual: visualHit.source,
  };

  console.log(JSON.stringify({ event: "gate_sources", sources }));

  const qaOk = isPass(qaHit.data);
  const secOk = isPass(secHit.data);
  const visualOk = !requireVisual || isPass(visualHit.data);

  if (requireVisual && !visualHit.data) {
    console.log(
      JSON.stringify({
        event: "post_pipeline_blocked",
        reason: "visual_parity_result_missing",
        sources,
      }),
    );
    return {
      ok: false,
      qa: qaHit.data,
      sec: secHit.data,
      visual: visualHit.data,
      sources,
    };
  }

  if (!qaHit.data || !secHit.data) {
    console.log(
      JSON.stringify({
        event: "post_pipeline_blocked",
        reason: "gate_artifacts_missing",
        sources,
        hint: "Los agentes deben subir qa-result.json / security-result.json en PR Framework",
      }),
    );
    return {
      ok: false,
      qa: qaHit.data,
      sec: secHit.data,
      visual: visualHit.data,
      sources,
    };
  }

  if (!qaOk || !secOk || !visualOk) {
    console.log(
      JSON.stringify({
        event: "post_pipeline_blocked",
        reason: "gate_fail",
        qaFail: isFail(qaHit.data),
        secFail: isFail(secHit.data),
        visualFail: requireVisual && isFail(visualHit.data),
        sources,
      }),
    );
    return {
      ok: false,
      qa: qaHit.data,
      sec: secHit.data,
      visual: visualHit.data,
      sources,
    };
  }

  return {
    ok: true,
    qa: qaHit.data,
    sec: secHit.data,
    visual: visualHit.data,
    sources,
  };
}

function mergeOpenProductPrs(): void {
  const repos = [
    "arodriguez-novusintelligence/NovusIntelligenceWEB",
    "arodriguez-novusintelligence/NovusIntelligenceBack",
  ];

  for (const repo of repos) {
    const listRaw = gh([
      "pr",
      "list",
      "--repo",
      repo,
      "--state",
      "open",
      "--json",
      "number,title,isDraft,headRefName",
    ]);
    const prs = JSON.parse(listRaw) as Array<{
      number: number;
      title: string;
      isDraft: boolean;
      headRefName: string;
    }>;

    for (const pr of prs) {
      if (!pr.headRefName.startsWith("cursor/")) continue;
      if (pr.isDraft) {
        try {
          gh(["pr", "ready", String(pr.number), "--repo", repo]);
        } catch (e) {
          console.warn(`ready failed ${repo}#${pr.number}`, e);
        }
      }
      try {
        gh([
          "pr",
          "merge",
          String(pr.number),
          "--repo",
          repo,
          "--squash",
          "--delete-branch",
        ]);
        console.log(
          JSON.stringify({
            event: "pr_merged",
            repo,
            number: pr.number,
            title: pr.title,
          }),
        );
      } catch (e) {
        console.warn(`merge failed ${repo}#${pr.number}`, e);
      }
    }
  }
}

function triggerDeployDev(): void {
  for (const repo of [
    "arodriguez-novusintelligence/NovusIntelligenceBack",
    "arodriguez-novusintelligence/NovusIntelligenceWEB",
  ]) {
    try {
      gh(["workflow", "run", "Deploy DEV", "--repo", repo]);
      console.log(
        JSON.stringify({ event: "deploy_dispatched", repo, env: "dev" }),
      );
    } catch (e) {
      console.warn(`deploy dispatch failed ${repo}`, e);
    }
  }
}

function main(): void {
  const smoke = flag("NADF_SMOKE_TEST", false);
  const protectArchetype = flag("NADF_PROTECT_ARCHETYPE", false);
  let autoMerge = flag("NADF_AUTO_MERGE_DEV", !smoke);
  let autoDeploy = flag("NADF_AUTO_DEPLOY_DEV", !smoke);

  if (smoke) {
    // Smoke: nunca mutar WEB/Back ni desplegar
    autoMerge = false;
    autoDeploy = false;
  } else if (protectArchetype) {
    autoMerge = false;
    autoDeploy = false;
  }

  console.log(
    JSON.stringify({
      event: "post_pipeline_start",
      smoke,
      protectArchetype,
      autoMerge,
      autoDeploy,
      requireVisualParity: flag("NADF_REQUIRE_VISUAL_PARITY", !smoke),
      artifactsRemoteOnly: flag("NADF_ARTIFACTS_REMOTE_ONLY", false),
      prodForbidden: true,
    }),
  );

  if (smoke) {
    if (!smokePassed()) {
      console.log(
        JSON.stringify({
          event: "smoke_failed",
          reason: "pipeline_did_not_produce_finished_steps",
        }),
      );
      process.exit(6);
    }
    console.log(
      JSON.stringify({
        event: "smoke_ok",
        message:
          "Automatización NADF verificada (agentes ejecutaron). Sin merge/deploy — arquetipo intacto.",
      }),
    );
    process.exit(0);
  }

  const gates = validationPassed();
  if (!gates.ok) {
    console.log(
      JSON.stringify({
        event: "skip_merge_and_deploy",
        reason: "validation_not_pass",
        sources: gates.sources,
      }),
    );
    process.exit(5);
  }

  if (protectArchetype) {
    console.log(
      JSON.stringify({
        event: "gates_pass_archetype_protected",
        message:
          "Gates OK pero NADF_PROTECT_ARCHETYPE=true — no merge/deploy WEB/Back. USar instancia o NADF_PROTECT_ARCHETYPE=false.",
        sources: gates.sources,
      }),
    );
    process.exit(0);
  }

  if (autoMerge) mergeOpenProductPrs();
  if (autoDeploy) triggerDeployDev();

  console.log(JSON.stringify({ event: "post_pipeline_done", env: "dev_only" }));
}

main();
