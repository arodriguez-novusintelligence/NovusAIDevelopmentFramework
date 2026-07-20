/* NADF-GUIDE
 * Propósito: Corpus mínimo domain-scope DoEvents.
 */
import assert from "node:assert/strict";
import {
  findScopeViolations,
  resolveDomainScope,
} from "../../src/doevents/domain-scope.js";

const onlyEvents = resolveDomainScope(
  "Descubre: eventos cercanos a mi ubicación",
  "Solo deben mostrarse eventos en mi rango.\n\n## Fuera de alcance\n- lugares\n- servicios",
);
assert.deepEqual(onlyEvents.allowed, ["eventos"]);
assert.ok(onlyEvents.forbidden.includes("lugares"));
assert.ok(onlyEvents.forbidden.includes("servicios"));
assert.ok(onlyEvents.pathDenyGlobs.some((g) => g.includes("venue")));

const violations = findScopeViolations(
  [
    "packages/shell/src/pages/EventsPage.tsx",
    "packages/shell/src/lovable-bridge/useNearbyVenues.ts",
    "packages/shell/src/lovable-bridge/useNearbyServices.ts",
  ],
  onlyEvents,
);
assert.ok(violations.includes("packages/shell/src/lovable-bridge/useNearbyVenues.ts"));
assert.ok(violations.includes("packages/shell/src/lovable-bridge/useNearbyServices.ts"));
assert.ok(!violations.includes("packages/shell/src/pages/EventsPage.tsx"));

const broad = resolveDomainScope("Mejora Descubre", "Ajustar UI general");
assert.equal(broad.pathDenyGlobs.length, 0);

console.log("domain-scope corpus OK");
