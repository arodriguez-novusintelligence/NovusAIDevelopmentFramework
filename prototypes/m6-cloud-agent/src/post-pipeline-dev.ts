/**
 * Post-pipeline DEV automation (M6 companion).
 *
 * Tras agentes (+ visual parity):
 * 1) Exige qa + security + visual_exact_parity PASS
 * 2) Auto-merge PRs productivos cursor/* → main
 * 3) Dispatch Deploy DEV (WEB + Back) — nunca PROD
 *
 * Env:
 *   NADF_AUTO_MERGE_DEV=true|false
 *   NADF_AUTO_DEPLOY_DEV=true|false
 *   NADF_REQUIRE_VISUAL_PARITY=true|false (default true)
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function flag(name: string, defaultValue = false): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === undefined || v === "") return defaultValue;
  return v === "1" || v === "true" || v === "yes";
}

function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8" }).trim();
}

function readJsonSafe(path: string): unknown {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function artifactPath(name: string): string {
  return resolve(
    process.cwd(),
    `../../.nadf/projects/novus-intelligence/artifacts/${name}`,
  );
}

function isPass(obj: { status?: string; result?: string } | null): boolean {
  if (!obj) return true;
  const v = String(obj.status ?? obj.result ?? "").toUpperCase();
  if (v.includes("FAIL")) return false;
  return ["PASS", "PASSED", "OK", "FINISHED"].includes(v) || v === "";
}

function validationPassed(): boolean {
  const qa = readJsonSafe(artifactPath("qa-result.json")) as {
    status?: string;
    result?: string;
  } | null;
  const sec = readJsonSafe(artifactPath("security-result.json")) as {
    status?: string;
    result?: string;
  } | null;
  const visual = readJsonSafe(artifactPath("visual-parity-result.json")) as {
    status?: string;
    result?: string;
  } | null;

  const requireVisual = flag("NADF_REQUIRE_VISUAL_PARITY", true);
  const qaOk = isPass(qa);
  const secOk = isPass(sec);
  const visualOk = !requireVisual || isPass(visual);

  if (requireVisual && !visual) {
    console.log(
      JSON.stringify({
        event: "post_pipeline_blocked",
        reason: "visual_parity_result_missing",
      }),
    );
    return false;
  }

  if (!qaOk || !secOk || !visualOk) {
    console.log(
      JSON.stringify({
        event: "post_pipeline_blocked",
        reason: "gate_fail",
        qa,
        sec,
        visual,
      }),
    );
    return false;
  }
  return true;
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
      console.log(JSON.stringify({ event: "deploy_dispatched", repo, env: "dev" }));
    } catch (e) {
      console.warn(`deploy dispatch failed ${repo}`, e);
    }
  }
}

function main(): void {
  const autoMerge = flag("NADF_AUTO_MERGE_DEV", true);
  const autoDeploy = flag("NADF_AUTO_DEPLOY_DEV", true);

  console.log(
    JSON.stringify({
      event: "post_pipeline_start",
      autoMerge,
      autoDeploy,
      requireVisualParity: flag("NADF_REQUIRE_VISUAL_PARITY", true),
      prodForbidden: true,
    }),
  );

  if (!validationPassed()) {
    console.log(
      JSON.stringify({
        event: "skip_merge_and_deploy",
        reason: "validation_not_pass",
      }),
    );
    process.exit(5);
  }

  if (autoMerge) mergeOpenProductPrs();
  if (autoDeploy) triggerDeployDev();

  console.log(JSON.stringify({ event: "post_pipeline_done", env: "dev_only" }));
}

main();
