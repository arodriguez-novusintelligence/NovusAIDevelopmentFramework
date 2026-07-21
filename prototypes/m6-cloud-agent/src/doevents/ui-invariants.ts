/* NADF-GUIDE
 * Propósito: Invariantes de UI Descubre — secciones y cableado que un fix acotado NO debe romper.
 * Configuración: Usado por validate-doevents-ui y el prompt del agente.
 */

/** Títulos / anclas que deben seguir presentes en Descubre. */
export const DISCOVER_SECTION_TITLES = [
  "Eventos Favoritos",
  "Lugares cercanos a mi ubicación",
  "Eventos cercanos a mi ubicación",
  "Perfiles que prestan servicios",
  "Eventos recomendados",
  "Otros eventos",
] as const;

/** El título de servicios vive en FeedServicesCarousel, no en EventsView. */
export const DISCOVER_SERVICES_ANCHORS = [
  "FeedServicesCarousel",
  "Servicios cercanos",
] as const;

export const DISCOVER_UI_INVARIANT_FILES = [
  "packages/shell/src/lovable/components/feed/EventsView.tsx",
  "packages/shell/src/lovable/components/feed/FeedServicesCarousel.tsx",
  "packages/shell/src/pages/EventsPage.tsx",
] as const;

/**
 * Símbolos de cableado marketplace que EventsPage DEBE conservar.
 * Un agente puede dejar los títulos y aún así vaciar lugares/servicios.
 */
export const DISCOVER_MARKETPLACE_WIRING = [
  "fetchNearbyVenues",
  "fetchNearbyServices",
  "publishedVenues",
  "nearbyServiceCards",
  "setPublishedVenues",
  "setNearbyServiceCards",
] as const;

/** Props mínimas que EventsPage debe seguir pasando a EventsView. */
export const DISCOVER_EVENTS_PAGE_PROPS = [
  "favoriteEvents",
  "publishedVenues",
  "nearbyServiceCards",
  "serviceProviders",
  "recommendedEvents",
  "otherEvents",
  "nearbyEvents",
] as const;

/**
 * Comprueba cableado y anti-patrones en el contenido de EventsPage.
 * Detecta el fallo real de la cascada NADF: skip de red / enrich bloqueante / pérdida de fetches.
 */
export function findDiscoverPageWiringViolations(pageSource: string): string[] {
  const missing: string[] = [];
  if (!pageSource.trim()) return missing;

  for (const sym of DISCOVER_MARKETPLACE_WIRING) {
    if (!pageSource.includes(sym)) {
      missing.push(`EventsPage debe conservar cableado marketplace: ${sym}`);
    }
  }

  for (const prop of DISCOVER_EVENTS_PAGE_PROPS) {
    if (!pageSource.includes(prop)) {
      missing.push(`EventsPage prop ${prop}`);
    }
  }

  // Enrich de avatares NO puede ir antes de pintar venues/services.
  const enrichAwait = pageSource.indexOf("await enrichProviderAvatars");
  const paintVenues = pageSource.indexOf("setPublishedVenues");
  if (enrichAwait >= 0 && paintVenues >= 0 && enrichAwait < paintVenues) {
    missing.push(
      "await enrichProviderAvatars no debe ejecutarse antes de setPublishedVenues (bloquea Descubre)",
    );
  }

  // Skip de red debe exigir fetch geo completo (locationBoundFetched) o no saltar marketplace.
  if (
    pageSource.includes("shouldSkipDiscoverNetworkRefresh") &&
    !pageSource.includes("locationBoundFetched")
  ) {
    missing.push(
      "shouldSkipDiscoverNetworkRefresh debe considerar locationBoundFetched (no saltar lugares/servicios)",
    );
  }

  return missing;
}

/**
 * En un diff unificado, detecta eliminación neta de cableado marketplace.
 * Ej.: quitar fetchNearbyVenues “porque el issue solo pide eventos”.
 */
export function findMarketplaceWiringRemovedInDiff(unifiedDiff: string): string[] {
  const violations: string[] = [];
  for (const sym of DISCOVER_MARKETPLACE_WIRING) {
    const minus = (unifiedDiff.match(new RegExp(`^-.*${escapeRegExp(sym)}`, "gm")) || [])
      .length;
    const plus = (unifiedDiff.match(new RegExp(`^\\+.*${escapeRegExp(sym)}`, "gm")) || [])
      .length;
    if (minus > plus) {
      violations.push(`diff elimina cableado marketplace: ${sym} (−${minus}/+${plus})`);
    }
  }
  return violations;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatUiInvariantsForPrompt(): string {
  return [
    "## UI INVARIANTS (HARD — regresiones = fallo)",
    "- NO elimines, ocultes ni dejes de pasar props de secciones existentes de Descubre.",
    "- Tras tu cambio, la vista `/events` debe seguir mostrando (con datos o empty state) estas secciones:",
    ...DISCOVER_SECTION_TITLES.map((t) => `  - "${t}"`),
    '  - "Servicios cercanos a mi ubicación" (vía FeedServicesCarousel)',
    "- Si el issue pide SOLO eventos cercanos: puedes cambiar la lógica de esa sección;",
    "  PROHIBIDO alterar, vaciar, timeout-a-[] o skippear el fetch/paint de lugares y servicios.",
    "- PROHIBIDO `await enrichProviderAvatars` antes de setPublishedVenues / setNearbyServiceCards.",
    "- PROHIBIDO shouldSkip de red que ignore locationBoundFetched (caché con eventos ≠ Descubre completo).",
    "- Cableado obligatorio en EventsPage:",
    ...DISCOVER_MARKETPLACE_WIRING.map((s) => `  - ${s}`),
    "- Validación obligatoria antes de OK: `node scripts/smoke-discover-marketplace.mjs`",
    "  (API DEV debe devolver ≥1 lugar y ≥1 servicio cerca de la coordenada de referencia).",
    "- Empty state de lugares/servicios SOLO es aceptable si ese smoke API también está vacío.",
    "- Principio blast-radius: un fix de 1 sección no puede apagar 7. Si dudas, NO toques caché/skip/loading global.",
  ].join("\n");
}
