/* NADF-GUIDE
 * Propósito: Valida que PRs DoEvents no eliminen invariantes de UI Descubre.
 * Uso: npm run validate:doevents-ui -- route-decision.json
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import {
  DISCOVER_SECTION_TITLES,
  DISCOVER_SERVICES_ANCHORS,
  DISCOVER_UI_INVARIANT_FILES,
} from "./doevents/ui-invariants.js";

type Route = {
  target?: string;
  issue?: { number?: number };
};

const routePath = process.argv[2] || "route-decision.json";
const route = JSON.parse(readFileSync(routePath, "utf8")) as Route;
const issueNumber = route.issue?.number;

if (!issueNumber) {
  console.log("Sin issue → skip UI invariants");
  process.exit(0);
}

function ghJson(args: string[]): unknown {
  return JSON.parse(execFileSync("gh", args, { encoding: "utf8" }));
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

function getFileAtPr(repo: string, pr: number, path: string): string | null {
  try {
    const meta = ghJson([
      "pr",
      "view",
      String(pr),
      "--repo",
      repo,
      "--json",
      "headRefOid",
    ]) as { headRefOid: string };
    const encoded = path
      .split("/")
      .map(encodeURIComponent)
      .join("/");
    const content = ghJson([
      "api",
      `repos/${repo}/contents/${encoded}?ref=${meta.headRefOid}`,
    ]) as { content?: string; encoding?: string };
    if (!content.content) return null;
    return Buffer.from(content.content, "base64").toString("utf8");
  } catch {
    return null;
  }
}

function prTouchesInvariantFiles(repo: string, pr: number): boolean {
  const data = ghJson([
    "pr",
    "view",
    String(pr),
    "--repo",
    repo,
    "--json",
    "files",
  ]) as { files: Array<{ path: string }> };
  const paths = (data.files || []).map((f) => f.path.replace(/\\/g, "/"));
  return paths.some((p) =>
    DISCOVER_UI_INVARIANT_FILES.some(
      (inv) => p === inv || p.endsWith(inv.replace(/^packages\//, "")),
    ) || /EventsPage|EventsView|discoverCache|discoverEventFilters/.test(p),
  );
}

const repo = "arodriguez-novusintelligence/DoEventsWEB";
const target = route.target || "web";
if (target !== "web" && target !== "both") {
  console.log("Target no web → skip UI invariants");
  process.exit(0);
}

const prs = listIssuePrNumbers(repo, issueNumber);
const violations: Array<{ pr: number; missing: string[] }> = [];

for (const pr of prs) {
  if (!prTouchesInvariantFiles(repo, pr)) continue;
  const view = getFileAtPr(
    repo,
    pr,
    "packages/shell/src/lovable/components/feed/EventsView.tsx",
  );
  const page = getFileAtPr(repo, pr, "packages/shell/src/pages/EventsPage.tsx");
  const servicesCarousel = getFileAtPr(
    repo,
    pr,
    "packages/shell/src/lovable/components/feed/FeedServicesCarousel.tsx",
  );
  const missing: string[] = [];

  if (view) {
    for (const title of DISCOVER_SECTION_TITLES) {
      if (!view.includes(title)) missing.push(`section "${title}"`);
    }
    if (!view.includes("FeedServicesCarousel")) {
      missing.push("EventsView debe renderizar FeedServicesCarousel");
    }
  } else if (page) {
    const missingProps = [
      "favoriteEvents",
      "publishedVenues",
      "nearbyServiceCards",
      "serviceProviders",
      "recommendedEvents",
      "otherEvents",
      "nearbyEvents",
    ].filter((prop) => !page.includes(prop));
    missing.push(...missingProps.map((p) => `EventsPage prop ${p}`));
  }

  const servicesBlob = `${view || ""}\n${page || ""}\n${servicesCarousel || ""}`;
  if (
    (view || page) &&
    !DISCOVER_SERVICES_ANCHORS.some((anchor) => servicesBlob.includes(anchor))
  ) {
    missing.push('sección "Servicios cercanos" (FeedServicesCarousel)');
  }

  if (missing.length) {
    violations.push({ pr, missing });
  }
}

const report = { issue: issueNumber, violations };
writeFileSync("ui-invariants-validation.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (violations.length) {
  console.error(
    "::error::UI invariants: el PR elimina o deja de cablear secciones de Descubre. Auto-merge bloqueado.",
  );
  for (const v of violations) {
    console.error(`  PR #${v.pr}: ${v.missing.join(", ")}`);
  }
  process.exit(11);
}

console.log("UI invariants OK");
