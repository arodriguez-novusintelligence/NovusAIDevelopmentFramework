/* NADF-GUIDE
 * Propósito: Valida que PRs DoEvents no eliminen invariantes ni cableado de Descubre.
 * Uso: npm run validate:doevents-ui -- route-decision.json
 * Exit 11 = bloqueo auto-merge.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import {
  DISCOVER_SECTION_TITLES,
  DISCOVER_SERVICES_ANCHORS,
  DISCOVER_UI_INVARIANT_FILES,
  findDiscoverPageWiringViolations,
  findMarketplaceWiringRemovedInDiff,
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

function ghText(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
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
  return paths.some(
    (p) =>
      DISCOVER_UI_INVARIANT_FILES.some(
        (inv) => p === inv || p.endsWith(inv.replace(/^packages\//, "")),
      ) || /EventsPage|EventsView|discoverCache|discoverEventFilters|FeedServicesCarousel/.test(p),
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
  }

  if (page) {
    missing.push(...findDiscoverPageWiringViolations(page));
  } else if (view) {
    // PR tocó vista pero no page: igual exigir anclas de servicios en el blob
  }

  const servicesBlob = `${view || ""}\n${page || ""}\n${servicesCarousel || ""}`;
  if (
    (view || page) &&
    !DISCOVER_SERVICES_ANCHORS.some((anchor) => servicesBlob.includes(anchor))
  ) {
    missing.push('sección "Servicios cercanos" (FeedServicesCarousel)');
  }

  // Diff: detectar eliminación neta de cableado aunque el archivo “aún compile”.
  try {
    const diff = ghText(["pr", "diff", String(pr), "--repo", repo]);
    missing.push(...findMarketplaceWiringRemovedInDiff(diff));
  } catch {
    // sin diff → no bloquear por esto
  }

  if (missing.length) {
    violations.push({ pr, missing: [...new Set(missing)] });
  }
}

const report = { issue: issueNumber, violations };
writeFileSync("ui-invariants-validation.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (violations.length) {
  console.error(
    "::error::UI invariants: el PR elimina o deja de cablear secciones/marketplace de Descubre. Auto-merge bloqueado.",
  );
  for (const v of violations) {
    console.error(`  PR #${v.pr}: ${v.missing.join(", ")}`);
  }
  process.exit(11);
}

console.log("UI invariants OK");
