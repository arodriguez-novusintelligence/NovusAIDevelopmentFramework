/* NADF-GUIDE
 * Propósito: Valida que los PRs del issue no toquen paths de entidades FORBIDDEN.
 * Configuración: route-decision.json con domainScope; GH_TOKEN; issue number.
 * Uso: npm run validate:doevents-scope -- route-decision.json
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import {
  findScopeViolations,
  type DomainScope,
} from "./doevents/domain-scope.js";

type Route = {
  target?: string;
  domainScope?: DomainScope;
  issue?: { number?: number };
};

const routePath = process.argv[2] || "route-decision.json";
const route = JSON.parse(readFileSync(routePath, "utf8")) as Route;
const scope = route.domainScope;
const issueNumber = route.issue?.number;

if (!scope || !issueNumber) {
  console.log("Sin domainScope o issue → skip validate");
  process.exit(0);
}

if (!scope.pathDenyGlobs?.length) {
  console.log(
    `Scope amplio (allowed=${scope.allowed.join(",")}) → sin gate de paths`,
  );
  process.exit(0);
}

function ghJson(args: string[]): unknown {
  const json = execFileSync("gh", args, { encoding: "utf8" });
  return JSON.parse(json);
}

function listIssuePrNumbers(repo: string, issue: number): number[] {
  const prs = ghJson([
    "pr",
    "list",
    "--repo",
    repo,
    "--state",
    "open",
    "--base",
    "feature/NovusAIDevelopmentFramework",
    "--limit",
    "30",
    "--json",
    "number,title,body",
  ]) as Array<{ number: number; title: string; body: string }>;
  const re = new RegExp(`#${issue}\\b`);
  return prs
    .filter((p) => re.test(p.title) || re.test(p.body || ""))
    .map((p) => p.number);
}

function listPrFiles(repo: string, pr: number): string[] {
  const data = ghJson([
    "pr",
    "view",
    String(pr),
    "--repo",
    repo,
    "--json",
    "files",
  ]) as { files: Array<{ path: string }> };
  return (data.files || []).map((f) => f.path);
}

const repos: string[] = [];
const target = route.target || "web";
if (target === "web" || target === "both") {
  repos.push("arodriguez-novusintelligence/DoEventsWEB");
}
if (target === "back" || target === "both") {
  repos.push("arodriguez-novusintelligence/DoEventsBack");
}

const violations: Array<{ repo: string; pr: number; files: string[] }> = [];

for (const repo of repos) {
  const prNumbers = listIssuePrNumbers(repo, issueNumber);
  for (const pr of prNumbers) {
    const files = listPrFiles(repo, pr);
    const bad = findScopeViolations(files, scope);
    if (bad.length) violations.push({ repo, pr, files: bad });
  }
}

const report = {
  issue: issueNumber,
  allowed: scope.allowed,
  forbidden: scope.forbidden,
  violations,
};

writeFileSync("scope-validation.json", JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));

if (violations.length) {
  console.error(
    "::error::Scope isolation: el PR toca paths de entidades FORBIDDEN. Auto-merge bloqueado.",
  );
  for (const v of violations) {
    console.error(`  ${v.repo}#${v.pr}: ${v.files.join(", ")}`);
  }
  process.exit(10);
}

console.log("Scope isolation OK");
