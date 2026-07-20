/* NADF-GUIDE
 * Propósito: Router DoEvents — issue → Complexity Routing + targets WEB/Back.
 * Configuración: NADF_ISSUE_JSON o --input issue.json; escribe route-decision.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { decideComplexity } from "./complexity-routing/index.js";
import {
  hasNadfTriggerLabel,
  issueToSignals,
  type DoEventsIssue,
} from "./doevents/issue-signals.js";
import { resolveDomainScope } from "./doevents/domain-scope.js";

function loadIssue(): DoEventsIssue {
  const path = process.argv.includes("--input")
    ? process.argv[process.argv.indexOf("--input") + 1]
    : process.env.NADF_ISSUE_JSON?.trim();
  if (!path) {
    const raw = process.env.NADF_ISSUE_PAYLOAD?.trim();
    if (raw) return JSON.parse(raw) as DoEventsIssue;
    throw new Error("Falta --input issue.json o NADF_ISSUE_JSON / NADF_ISSUE_PAYLOAD");
  }
  return JSON.parse(
    readFileSync(path, "utf8").replace(/^\uFEFF/, ""),
  ) as DoEventsIssue;
}

const issue = loadIssue();
if (!hasNadfTriggerLabel(issue.labels || [])) {
  const blocked = {
    profile: "BLOCKED",
    route: "blocked",
    lightweight: false,
    rationale: ["Falta label nadf o nadf:approved"],
    target: "web",
    issue: issue.number,
  };
  writeFileSync("route-decision.json", JSON.stringify(blocked, null, 2));
  console.log(JSON.stringify(blocked));
  process.exit(5);
}

const { signals, target } = issueToSignals(issue);
const decision = decideComplexity(signals);
const domainScope = resolveDomainScope(issue.title, issue.body || "");

const WEB = "https://github.com/arodriguez-novusintelligence/DoEventsWEB.git";
const BACK = "https://github.com/arodriguez-novusintelligence/DoEventsBack.git";
const BRANCH = "feature/NovusAIDevelopmentFramework";

const repos: string[] = [];
if (target === "web" || target === "both") repos.push(WEB);
if (target === "back" || target === "both") repos.push(BACK);

const out = {
  ...decision,
  target,
  issue: {
    number: issue.number,
    title: issue.title,
    url: issue.html_url || null,
  },
  workBranch: BRANCH,
  targetRepos: repos,
  domainScope,
  isolation:
    "Solo implementar el alcance de este issue; no eliminar ni alterar otras funcionalidades. " +
    `ALLOWED=${domainScope.allowed.join(",")}; FORBIDDEN=${domainScope.forbidden.join(",") || "none"}.`,
};

writeFileSync("route-decision.json", JSON.stringify(out, null, 2), "utf8");
console.log(JSON.stringify(out));
if (decision.profile === "BLOCKED") process.exit(5);
