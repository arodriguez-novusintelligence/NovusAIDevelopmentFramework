/* NADF-GUIDE
 * Propósito: CLI genérico de Complexity Routing (Issues / initiative / Lovable).
 * Configuración: --input signals.json o NADF_COMPLEXITY_SIGNALS / stdin.
 */
import { readFileSync, writeFileSync } from "node:fs";
import {
  decideComplexity,
  escalateProfile,
  type ComplexitySignals,
} from "./complexity-routing/index.js";

function parseArgs(argv: string[]): {
  input?: string;
  output: string;
  escalate?: string[];
} {
  let input: string | undefined;
  let output = "routing-decision.json";
  let escalate: string[] | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--input" && argv[i + 1]) input = argv[++i];
    else if (a === "--output" && argv[i + 1]) output = argv[++i];
    else if (a === "--escalate" && argv[i + 1]) {
      escalate = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return { input, output, escalate };
}

function loadSignals(input?: string): ComplexitySignals {
  if (input) {
    return JSON.parse(readFileSync(input, "utf8")) as ComplexitySignals;
  }
  const env = process.env.NADF_COMPLEXITY_SIGNALS?.trim();
  if (env) {
    return JSON.parse(env) as ComplexitySignals;
  }
  // stdin empty → fail-safe signals
  return { changeTypes: [], backendRequired: true, source: "cli" };
}

const { input, output, escalate } = parseArgs(process.argv.slice(2));
let decision = decideComplexity(loadSignals(input));
if (escalate && escalate.length > 0) {
  decision = escalateProfile(decision, escalate);
}
writeFileSync(output, JSON.stringify(decision, null, 2), "utf8");
console.log(JSON.stringify(decision));
