/* NADF-GUIDE
 * Propósito: Corpus de regresión del Complexity Routing.
 * Configuración: npm run test:complexity-routing
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  decideComplexity,
  type ComplexitySignals,
  type ExecutionProfileId,
} from "../../src/complexity-routing/index.js";

type Case = {
  id: string;
  signals: ComplexitySignals;
  expectProfile: ExecutionProfileId;
  expectLightweight?: boolean;
  expectRoute?: string;
  expectCriticalityOverride?: boolean;
};

const dir = dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(
  readFileSync(join(dir, "corpus.json"), "utf8"),
) as Case[];

let failed = 0;
for (const c of corpus) {
  const d = decideComplexity(c.signals);
  const errors: string[] = [];
  if (d.profile !== c.expectProfile) {
    errors.push(`profile=${d.profile} expected=${c.expectProfile}`);
  }
  if (
    c.expectLightweight !== undefined &&
    d.lightweight !== c.expectLightweight
  ) {
    errors.push(
      `lightweight=${d.lightweight} expected=${c.expectLightweight}`,
    );
  }
  if (c.expectRoute && d.route !== c.expectRoute) {
    errors.push(`route=${d.route} expected=${c.expectRoute}`);
  }
  if (
    c.expectCriticalityOverride !== undefined &&
    d.criticalityOverride !== c.expectCriticalityOverride
  ) {
    errors.push(
      `criticalityOverride=${d.criticalityOverride} expected=${c.expectCriticalityOverride}`,
    );
  }
  if (errors.length) {
    failed++;
    console.error(`FAIL ${c.id}: ${errors.join("; ")}`);
  } else {
    console.log(`PASS ${c.id} → ${d.profile} (route=${d.route})`);
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${corpus.length} cases failed`);
  process.exit(1);
}
console.log(`\nAll ${corpus.length} complexity-routing cases passed`);
