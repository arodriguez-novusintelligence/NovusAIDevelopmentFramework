import { runDiscoverMarketplaceSmoke } from "./discover-marketplace-smoke.js";

const result = await runDiscoverMarketplaceSmoke();
console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exit(1);
