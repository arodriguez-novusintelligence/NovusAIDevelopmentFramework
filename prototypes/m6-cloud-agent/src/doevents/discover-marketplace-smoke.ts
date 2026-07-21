/** Pure helpers for discover marketplace smoke (importable). */
const API = (process.env.DISCOVER_SMOKE_API || "https://api-dev.doeventsapp.com").replace(/\/$/, "");
const LAT = Number(process.env.DISCOVER_SMOKE_LAT || "4.2805");
const LNG = Number(process.env.DISCOVER_SMOKE_LNG || "-74.7740");
const RADIUS_KM = Number(process.env.DISCOVER_SMOKE_RADIUS_KM || "100");

async function postJson(path: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json: json as Record<string, unknown> };
}

async function getJson(path: string, headers: Record<string, string> = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: "application/json", ...headers },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json: json as Record<string, unknown> };
}

export async function runDiscoverMarketplaceSmoke(): Promise<{
  pass: boolean;
  venuesCount: number;
  servicesCount: number;
  detail: string;
  api: string;
  lat: number;
  lng: number;
}> {
  const tokenRes = await postJson("/auth/generateToken", {});
  const token = String(tokenRes.json.token || tokenRes.json.accessToken || "");
  if (!token) {
    return {
      pass: false,
      venuesCount: 0,
      servicesCount: 0,
      detail: "no service token",
      api: API,
      lat: LAT,
      lng: LNG,
    };
  }
  const auth = { Authorization: token };
  const venuesRes = await getJson(
    `/venues/venues?latitude=${LAT}&longitude=${LNG}&maxDistance=${RADIUS_KM}&limit=40&status=active`,
    auth,
  );
  const venues = (venuesRes.json.venues || venuesRes.json.items || []) as unknown[];
  const servicesRes = await postJson(
    "/services/nearby",
    { latitude: LAT, longitude: LNG, maxDistanceKm: RADIUS_KM, limit: 40 },
    auth,
  );
  const services = (servicesRes.json.services || servicesRes.json.items || []) as unknown[];
  const venuesCount = Array.isArray(venues) ? venues.length : 0;
  const servicesCount = Array.isArray(services) ? services.length : 0;
  const pass = venuesRes.ok && servicesRes.ok && venuesCount > 0 && servicesCount > 0;
  return {
    pass,
    venuesCount,
    servicesCount,
    detail: pass
      ? `PASS venues=${venuesCount} services=${servicesCount}`
      : `FAIL venues=${venuesCount} (${venuesRes.status}) services=${servicesCount} (${servicesRes.status})`,
    api: API,
    lat: LAT,
    lng: LNG,
  };
}
