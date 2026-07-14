/**
 * Post-pipeline DEV automation (M6 companion).
 *
 * After Cloud Agents finish:
 * 1) Mark gated PRs ready + squash-merge when QA/Security no longer FAIL
 * 2) Optionally dispatch Deploy DEV on WEB/Back
 *
 * Controlled by:
 *   NADF_AUTO_MERGE_DEV=true|false
 *   NADF_AUTO_DEPLOY_DEV=true|false
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

function validationPassed(): boolean {
  // Prefer artifacts from workspace if present; otherwise assume human/CI previously fixed.
  const qaPath = resolve(
    process.cwd(),
    "../../.nadf/projects/novus-intelligence/artifacts/qa-result.json",
  );
  const secPath = resolve(
    process.cwd(),
    "../../.nadf/projects/novus-intelligence/artifacts/security-result.json",
  );
  const qa = readJsonSafe(qaPath) as { status?: string; result?: string } | null;
  const sec = readJsonSafe(secPath) as { status?: string; result?: string } | null;

  const qaOk =
    !qa ||
    ["PASS", "pass", "passed", "ok"].includes(
      String(qa.status ?? qa.result ?? "").toUpperCase(),
    );
  const secOk =
    !sec ||
    ["PASS", "pass", "passed", "ok"].includes(
      String(sec.status ?? sec.result ?? "").toUpperCase(),
    );

  // If artifacts still say FAIL from an older run, do not auto-merge.
  const qaFail = String(qa?.status ?? qa?.result ?? "")
    .toUpperCase()
    .includes("FAIL");
  const secFail = String(sec?.status ?? sec?.result ?? "")
    .toUpperCase()
    .includes("FAIL");

  if (qaFail || secFail) {
    console.log(
      JSON.stringify({
        event: "post_pipeline_blocked",
        reason: "qa_or_security_fail_artifact",
        qa,
        sec,
      }),
    );
    return false;
  }

  return qaOk && secOk;
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
      console.log(JSON.stringify({ event: "deploy_dispatched", repo }));
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
    }),
  );

  if (autoMerge) {
    if (!validationPassed()) {
      console.log(
        JSON.stringify({
          event: "skip_merge",
          reason: "validation_not_pass",
        }),
      );
    } else {
      mergeOpenProductPrs();
    }
  }

  if (autoDeploy) {
    // Deploy workflows fire on merge to main; still allow explicit dispatch.
    triggerDeployDev();
  }

  console.log(JSON.stringify({ event: "post_pipeline_done" }));
}

main();
