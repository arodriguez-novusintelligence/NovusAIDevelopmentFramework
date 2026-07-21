/* NADF-GUIDE
 * Corpus: cableado Descubre / anti-patrones de blast-radius.
 * npm run test:ui-invariants
 */
import assert from "node:assert/strict";
import {
  findDiscoverPageWiringViolations,
  findMarketplaceWiringRemovedInDiff,
} from "../../src/doevents/ui-invariants.js";

const goodPage = `
fetchNearbyVenues
fetchNearbyServices
publishedVenues
nearbyServiceCards
setPublishedVenues(merged)
setNearbyServiceCards(cards)
favoriteEvents
serviceProviders
recommendedEvents
otherEvents
nearbyEvents
function shouldSkipDiscoverNetworkRefresh(cached) {
  if (loc && !cached.locationBoundFetched) return false;
  return true;
}
void enrichProviderAvatars(providers)
`;

assert.deepEqual(findDiscoverPageWiringViolations(goodPage), []);

const enrichBlocks = goodPage.replace(
  "void enrichProviderAvatars(providers)",
  "await enrichProviderAvatars(providers);\nsetPublishedVenues(merged)",
).replace("setPublishedVenues(merged)", "/* moved */");
// reconstruct bad order: await enrich then setPublishedVenues
const badOrder = `
fetchNearbyVenues
fetchNearbyServices
publishedVenues
nearbyServiceCards
favoriteEvents
serviceProviders
recommendedEvents
otherEvents
nearbyEvents
await enrichProviderAvatars(providers);
setPublishedVenues(x);
setNearbyServiceCards(y);
locationBoundFetched
`;
const badOrderViolations = findDiscoverPageWiringViolations(badOrder);
assert.ok(
  badOrderViolations.some((v) => v.includes("enrichProviderAvatars")),
  "debe detectar enrich bloqueante",
);

const skipWithoutFlag = goodPage.replace("locationBoundFetched", "/* removed */");
assert.ok(
  findDiscoverPageWiringViolations(skipWithoutFlag).some((v) =>
    v.includes("locationBoundFetched"),
  ),
);

const diff = `
--- a/EventsPage.tsx
+++ b/EventsPage.tsx
-        fetchNearbyVenues(loc.lat, loc.lng)
-        setPublishedVenues(mergedVenues)
+        // skip venues for nearby-events-only fix
`;
const removed = findMarketplaceWiringRemovedInDiff(diff);
assert.ok(removed.some((r) => r.includes("fetchNearbyVenues")));
assert.ok(removed.some((r) => r.includes("setPublishedVenues")));

console.log("PASS ui-invariants corpus");
