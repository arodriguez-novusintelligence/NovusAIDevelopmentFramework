/* NADF-GUIDE
 * Propósito: Implementa o configura post pipeline dev dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
/**
 * Post-pipeline DEV automation (M6 companion).
 *
 * Modos:
 * - smoke (NADF_SMOKE_TEST=true): verifica que el pipeline corrió; NO merge/deploy; exit 0.
 * - full: lee gates desde artifacts FRESCOS (PR Cloud del Framework), no stale del checkout.
 *
 * Contrato piloto DEV:
 * - Si gates PASS → merge de PRs productivos cursor/* pendientes + Deploy DEV.
 * - Código WEB/Back solo debe quedar pendiente si este post falla (gates o merge bloqueado).
 *
 * Env:
 *   NADF_SMOKE_TEST=true|false
 *   NADF_AUTO_MERGE_DEV=true|false
 *   NADF_AUTO_DEPLOY_DEV=true|false
 *   NADF_REQUIRE_VISUAL_PARITY=true|false
 *   NADF_PROTECT_ARCHETYPE=true|false (default true en callers; workflow full usa false)
 *   NADF_FRAMEWORK_REPO=owner/repo
 *   NADF_ARTIFACTS_REMOTE_ONLY=true|false
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type GateJson = {
  status?: string;
  result?: string;
  timestamp?: string;
} | null;

type ProductPr = {
  number: number;
  title: string;
  isDraft: boolean;
  headRefName: string;
  updatedAt: string;
  mergeable?: string;
  mergeStateStatus?: string;
};

function flag(name: string, defaultValue = false): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === undefined || v === "") return defaultValue;
  return v === "1" || v === "true" || v === "yes";
}

function visualFast(): boolean {
  return process.env.NADF_EXECUTION_PROFILE?.trim() === "visual-fast";
}

function productRepos(): string[] {
  if (visualFast() || process.env.NADF_DEPLOY_TARGETS?.trim() === "web") {
    return ["arodriguez-novusintelligence/NovusIntelligenceWEB"];
  }
  return [
    "arodriguez-novusintelligence/NovusIntelligenceWEB",
    "arodriguez-novusintelligence/NovusIntelligenceBack",
  ];
}

function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8" }).trim();
}

/** Como gh(), pero no lanza: para merges conflictivos opcionales. */
function ghSoft(args: string[]): { ok: boolean; out: string } {
  try {
    return { ok: true, out: gh(args) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, out: msg.split("\n")[0] ?? msg };
  }
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

function gateTimestamp(obj: GateJson): number {
  const t = obj?.timestamp;
  if (!t) return 0;
  const ms = Date.parse(t);
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Branches candidatas: PRs cursor/* abiertos primero, luego cerrados recientes
 * (los agentes a veces dejan PASS en PRs que ya no están abiertos).
 */
function candidateFrameworkRefs(): string[] {
  const repo = frameworkRepo();
  const refs: string[] = [];
  const seen = new Set<string>();

  const pushRef = (ref: string) => {
    if (!ref || seen.has(ref)) return;
    seen.add(ref);
    refs.push(ref);
  };

  const load = (state: "open" | "closed", limit: number) => {
    try {
      const listRaw = gh([
        "pr",
        "list",
        "--repo",
        repo,
        "--state",
        state,
        "--limit",
        String(limit),
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
        .forEach((p) => pushRef(p.headRefName));
    } catch (e) {
      console.warn(`candidateFrameworkRefs pr list (${state}) failed`, e);
    }
  };

  load("open", 30);
  load("closed", 40);

  const envRef = process.env.NADF_REF_FRAMEWORK?.trim();
  if (envRef) pushRef(envRef);
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

function persistArtifact(fileName: string, data: GateJson): void {
  try {
    const local = localArtifactPath(fileName);
    mkdirSync(dirname(local), { recursive: true });
    writeFileSync(local, JSON.stringify(data, null, 2), "utf8");
  } catch {
    /* ignore */
  }
}

function resolveGateArtifact(fileName: string): {
  data: GateJson;
  source: string;
} {
  // Preferir el PASS más reciente (timestamp) entre PRs cursor/*; nunca un FAIL stale
  // solo porque el último agente (p.ej. ADR) reabrió un branch con JSON viejo.
  let bestPass: { data: GateJson; source: string; ts: number } | null = null;
  let bestFail: { data: GateJson; source: string } | null = null;

  for (const ref of candidateFrameworkRefs()) {
    const hit = fetchArtifactFromRef(ref, fileName);
    if (!hit?.data) continue;
    if (isPass(hit.data)) {
      const ts = gateTimestamp(hit.data);
      if (!bestPass || ts >= bestPass.ts) {
        bestPass = { ...hit, ts };
      }
      continue;
    }
    if (!bestFail) bestFail = hit;
  }

  if (bestPass) {
    persistArtifact(fileName, bestPass.data);
    console.log(
      JSON.stringify({
        event: "artifact_selected_pass",
        fileName,
        source: bestPass.source,
        timestamp: bestPass.data?.timestamp ?? null,
      }),
    );
    return { data: bestPass.data, source: bestPass.source };
  }

  if (bestFail) {
    console.log(
      JSON.stringify({
        event: "artifact_using_fail_candidate",
        fileName,
        source: bestFail.source,
      }),
    );
    return bestFail;
  }

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
    return anyFinished;
  }

  try {
    gh(["auth", "status"]);
    console.log(
      JSON.stringify({
        event: "smoke_minimal_ok",
        reason: "no_pipeline_results_but_gh_ok_assume_prior_steps_ok",
      }),
    );
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
  // El perfil visual-fast no toca backend, APIs, dependencias ni infraestructura;
  // QA lite valida diff + secretos. Security full queda reservado al profile full.
  const secOk = visualFast() || isPass(secHit.data);
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

  if (!qaHit.data || (!visualFast() && !secHit.data)) {
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

function listProductCursorPrs(repo: string): ProductPr[] {
  const listRaw = gh([
    "pr",
    "list",
    "--repo",
    repo,
    "--state",
    "open",
    "--json",
    "number,title,isDraft,headRefName,updatedAt,mergeable,mergeStateStatus",
  ]);
  const prs = JSON.parse(listRaw) as ProductPr[];
  const pipelineStartedAt = Date.parse(
    process.env.NADF_PIPELINE_STARTED_AT?.trim() || "",
  );
  return prs
    .filter((p) => p.headRefName.startsWith("cursor/"))
    .filter(
      (p) =>
        !Number.isFinite(pipelineStartedAt) ||
        new Date(p.updatedAt).getTime() >= pipelineStartedAt,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

function isPrMergeable(pr: ProductPr): boolean {
  // Solo MERGEABLE explícito. UNKNOWN/CONFLICTING no cuentan como pendientes mergeables.
  if (pr.mergeable !== "MERGEABLE") return false;
  if (
    pr.mergeStateStatus === "DIRTY" ||
    pr.mergeStateStatus === "BLOCKED" ||
    pr.mergeStateStatus === "DRAFT"
  ) {
    return false;
  }
  return true;
}

function isPrStaleConflict(pr: ProductPr): boolean {
  return (
    pr.mergeable === "CONFLICTING" ||
    pr.mergeStateStatus === "DIRTY" ||
    pr.mergeStateStatus === "BLOCKED"
  );
}

/**
 * Merges pending cursor/* PRs on WEB/Back (newest first).
 * Close conflicting leftovers as superseded after a successful merge on that repo.
 * Returns whether any mergeable PR remains open (should be false after gates PASS).
 */
function mergeOpenProductPrs(): {
  merged: number;
  skipped: number;
  remainingMergeable: Array<{ repo: string; number: number; title: string }>;
} {
  const repos = productRepos();

  let merged = 0;
  let skipped = 0;
  const remainingMergeable: Array<{
    repo: string;
    number: number;
    title: string;
  }> = [];

  for (const repo of repos) {
    const prs = listProductCursorPrs(repo);
    let repoMerged = 0;

    for (const pr of prs) {
      if (!isPrMergeable(pr)) {
        skipped += 1;
        console.warn(
          JSON.stringify({
            event: "pr_merge_deferred_conflict",
            repo,
            number: pr.number,
            mergeable: pr.mergeable,
            mergeStateStatus: pr.mergeStateStatus,
          }),
        );
        continue;
      }

      if (pr.isDraft) {
        const ready = ghSoft([
          "pr",
          "ready",
          String(pr.number),
          "--repo",
          repo,
        ]);
        if (!ready.ok) {
          console.warn(
            `ready failed ${repo}#${pr.number}: ${ready.out}`,
          );
        }
      }

      const mergeResult = ghSoft([
        "pr",
        "merge",
        String(pr.number),
        "--repo",
        repo,
        "--squash",
        "--delete-branch",
      ]);

      if (mergeResult.ok) {
        merged += 1;
        repoMerged += 1;
        console.log(
          JSON.stringify({
            event: "pr_merged",
            repo,
            number: pr.number,
            title: pr.title,
          }),
        );
      } else {
        skipped += 1;
        console.warn(
          JSON.stringify({
            event: "pr_merge_skipped",
            repo,
            number: pr.number,
            reason: mergeResult.out,
          }),
        );
      }
    }

    // Tras merge exitoso, cerrar leftovers no-mergeables (conflicto/UNKNOWN stale).
    if (repoMerged > 0) {
      for (const pr of listProductCursorPrs(repo)) {
        if (isPrMergeable(pr)) continue; // quedan para exit 7
        const closed = ghSoft([
          "pr",
          "close",
          String(pr.number),
          "--repo",
          repo,
          "--comment",
          "Superseded by newer cursor/* merge from Lovable sync DEV post-pipeline.",
        ]);
        console.log(
          JSON.stringify({
            event: closed.ok ? "pr_closed_superseded" : "pr_close_failed",
            repo,
            number: pr.number,
            mergeable: pr.mergeable,
            mergeStateStatus: pr.mergeStateStatus,
            staleConflict: isPrStaleConflict(pr),
            detail: closed.out,
          }),
        );
      }
    }

    for (const pr of listProductCursorPrs(repo)) {
      if (isPrMergeable(pr)) {
        remainingMergeable.push({
          repo,
          number: pr.number,
          title: pr.title,
        });
      }
    }
  }

  console.log(
    JSON.stringify({
      event: "product_merge_summary",
      merged,
      skipped,
      remainingMergeable,
    }),
  );

  return { merged, skipped, remainingMergeable };
}

function triggerDeployDev(): void {
  for (const repo of productRepos()) {
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
      executionProfile: visualFast() ? "visual-fast" : "full",
      productRepos: productRepos(),
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
        pendingProductAllowed: true,
        note: "Código WEB/Back puede quedar en PRs cursor/* solo mientras falle el post-pipeline.",
      }),
    );
    process.exit(5);
  }

  if (protectArchetype) {
    console.log(
      JSON.stringify({
        event: "gates_pass_archetype_protected",
        message:
          "Gates OK pero NADF_PROTECT_ARCHETYPE=true — no merge/deploy WEB/Back. Usar instancia o NADF_PROTECT_ARCHETYPE=false.",
        sources: gates.sources,
      }),
    );
    process.exit(0);
  }

  let mergeSummary = {
    merged: 0,
    skipped: 0,
    remainingMergeable: [] as Array<{
      repo: string;
      number: number;
      title: string;
    }>,
  };

  if (autoMerge) {
    mergeSummary = mergeOpenProductPrs();
  }

  if (autoDeploy) {
    // Deploy siempre tras gates PASS: acopla a DEV lo versionado en main
    // (incluye merges recién hechos de esta corrida).
    triggerDeployDev();
  }

  if (autoMerge && mergeSummary.remainingMergeable.length > 0) {
    console.log(
      JSON.stringify({
        event: "post_pipeline_incomplete",
        reason: "mergeable_product_prs_remain",
        remainingMergeable: mergeSummary.remainingMergeable,
        hint: "Gates PASS pero quedó código productivable sin merge — no debería quedar pendiente.",
      }),
    );
    process.exit(7);
  }

  console.log(
    JSON.stringify({
      event: "post_pipeline_done",
      env: "dev_only",
      merged: mergeSummary.merged,
      deployed: autoDeploy,
      sources: gates.sources,
    }),
  );
}

main();
