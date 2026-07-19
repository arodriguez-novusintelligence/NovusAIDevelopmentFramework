/* NADF-GUIDE
 * Propósito: Corpus de regresión de la factory AI Runtime.
 * Configuración: npm run test:ai-runtime
 */
import {
  createAdapter,
  resolveCodingRuntimeId,
  runtimeSupports,
} from "../../src/ai-runtime/index.js";
import type { AgentInvocation } from "../../src/types.js";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const baseInv: AgentInvocation = {
  agentId: "test-agent",
  projectId: "test",
  workflowId: "test-wf",
  stepId: "paso-test",
  pattern: "blackboard",
  repos: [],
  inputs: [],
  expectedOutputs: [],
  constraints: [],
  autoCreatePR: false,
  dryRun: true,
};

assert(resolveCodingRuntimeId("cursor-cloud") === "cursor-cloud", "cursor id");
assert(resolveCodingRuntimeId("anthropic") === "anthropic", "anthropic id");
assert(resolveCodingRuntimeId("noop") === "noop", "noop id");
assert(runtimeSupports("cursor-cloud", "pr") === true, "cursor has pr");
assert(runtimeSupports("anthropic", "pr") === false, "anthropic no pr");

process.env.NADF_CODING_RUNTIME = "noop";
const noop = createAdapter({ codingRuntime: "noop" });
assert(noop.name === "noop", "noop adapter name");
const noopResult = await noop.execute(baseInv, "hello");
assert(noopResult.status === "finished", "noop finishes");
assert(noopResult.runtime === "noop", "noop runtime tag");

process.env.NADF_CODING_RUNTIME = "anthropic";
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "test-key-not-called";
const anth = createAdapter({
  codingRuntime: "anthropic",
  apiKey: "test-key-not-called",
});
assert(anth.name === "anthropic", "anthropic name");
const blocked = await anth.execute(
  { ...baseInv, pattern: "executor", autoCreatePR: true, dryRun: false, repos: [{ role: "frontend", url: "https://example.com/r.git" }] },
  "mutate",
);
assert(blocked.status === "blocked", "anthropic blocks PR missions");
assert(
  blocked.blockers.some((b) => b.includes("CODING_RUNTIME_CAPABILITY_MISSING")),
  "capability blocker present",
);

console.log("All ai-runtime factory cases passed");
