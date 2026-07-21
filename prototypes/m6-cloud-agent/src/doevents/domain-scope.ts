/* NADF-GUIDE
 * Propósito: Inferir entidades de producto (eventos|lugares|servicios) y políticas de path.
 * Configuración: Usado por routing, prompt y gate pre-merge DoEvents.
 */

export type DoEventsEntity = "eventos" | "lugares" | "servicios";

export type DomainScope = {
  allowed: DoEventsEntity[];
  forbidden: DoEventsEntity[];
  outOfScopeNotes: string[];
  pathAllowGlobs: string[];
  pathDenyGlobs: string[];
  rationale: string[];
};

const ALL: DoEventsEntity[] = ["eventos", "lugares", "servicios"];

/** Paths típicos de cada entidad en DoEventsWEB / DoEventsBack. */
export const ENTITY_PATH_POLICY: Record<
  DoEventsEntity,
  { allow: string[]; denyWhenOther: string[] }
> = {
  eventos: {
    allow: [
      "**/EventsPage.*",
      "**/EventsView.*",
      "**/discoverEvent*",
      "**/eventsService*",
      "**/eventsFeed*",
      "**/eventsCache*",
      "**/discoverCache*",
      "**/discoverAdapter*",
      "**/discoverSections*",
      "**/FeedBanner*",
      "**/FeedEvent*",
    ],
    denyWhenOther: [
      "**/venue*",
      "**/Venue*",
      "**/venues*",
      "**/Venues*",
      "**/useNearbyVenues*",
      "**/FeedVenues*",
      "**/Place*",
      "**/place*",
      "**/service*",
      "**/Service*",
      "**/services*",
      "**/Services*",
      "**/useNearbyServices*",
      "**/FeedServices*",
      "**/servicesService*",
      "**/venueService*",
    ],
  },
  lugares: {
    allow: [
      "**/venue*",
      "**/Venue*",
      "**/venues*",
      "**/Venues*",
      "**/useNearbyVenues*",
      "**/FeedVenues*",
      "**/Place*",
      "**/place*",
      "**/venueService*",
      "**/ProfileVenues*",
    ],
    denyWhenOther: [
      "**/EventsPage.*",
      "**/discoverEvent*",
      "**/eventsService*",
      "**/useNearbyServices*",
      "**/FeedServices*",
      "**/servicesService*",
    ],
  },
  servicios: {
    allow: [
      "**/service*",
      "**/Service*",
      "**/services*",
      "**/Services*",
      "**/useNearbyServices*",
      "**/FeedServices*",
      "**/servicesService*",
      "**/UserServices*",
    ],
    denyWhenOther: [
      "**/EventsPage.*",
      "**/discoverEvent*",
      "**/eventsService*",
      "**/useNearbyVenues*",
      "**/FeedVenues*",
      "**/venueService*",
    ],
  },
};

const ENTITY_HINTS: Record<DoEventsEntity, RegExp> = {
  eventos:
    /\b(evento|eventos|event\b|events\b|cercanos?\s+a\s+mi\s+ubicaci[oó]n|nearby\s+events?|descubre.*evento)\b/i,
  lugares:
    /\b(lugar|lugares|venue|venues|sitio|sitios|establecimiento)\b/i,
  servicios:
    /\b(servicio|servicios|provider|providers|dj|catering|fotograf)\b/i,
};

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function extractOutOfScope(body: string): string[] {
  const m = body.match(
    /##\s*Fuera\s+de\s+alcance\s*\n([\s\S]*?)(?=\n##\s|\n---\s*$|$)/i,
  );
  if (!m) return [];
  return m[1]
    .split(/\n/)
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter((l) => l.length > 2 && !/^\[/.test(l));
}

function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "{{DS}}")
    .replace(/\*/g, "[^/]*")
    .replace(/{{DS}}/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

export function pathMatchesAny(path: string, globs: string[]): boolean {
  const normalized = path.replace(/\\/g, "/");
  return globs.some((g) => globToRegExp(g).test(normalized));
}

/**
 * Infieres entidades pedidas. Si solo menciona una, las otras quedan forbidden.
 * Si menciona varias o ninguna clara → allowed = todas (modo amplio, solo prompt soft).
 */
export function resolveDomainScope(title: string, body = ""): DomainScope {
  const text = `${title}\n${body}`;
  const outOfScopeNotes = extractOutOfScope(body);

  const mentioned = ALL.filter((e) => ENTITY_HINTS[e].test(text));
  const rationale: string[] = [];

  // Fuera de alcance explícito → forzar forbidden
  const forcedForbidden = ALL.filter((e) =>
    outOfScopeNotes.some((n) => ENTITY_HINTS[e].test(n) || n.toLowerCase().includes(e)),
  );

  let allowed: DoEventsEntity[];
  if (mentioned.length === 1) {
    allowed = [...mentioned];
    rationale.push(`Entidad única detectada: ${mentioned[0]}`);
  } else if (mentioned.length > 1) {
    allowed = [...mentioned];
    rationale.push(`Varias entidades detectadas: ${mentioned.join(", ")}`);
  } else {
    allowed = [...ALL];
    rationale.push(
      "Sin entidad clara en título/cuerpo → alcance amplio (especifica eventos|lugares|servicios).",
    );
  }

  // Si el issue dice "solo eventos" / "únicamente eventos"
  if (/\b(solo|únicamente|unicamente|solamente)\s+.*\beventos?\b/i.test(text)) {
    allowed = ["eventos"];
    rationale.push("Restricción explícita: solo eventos");
  }
  if (/\b(solo|únicamente|unicamente|solamente)\s+.*\blugares?\b/i.test(text)) {
    allowed = ["lugares"];
    rationale.push("Restricción explícita: solo lugares");
  }
  if (/\b(solo|únicamente|unicamente|solamente)\s+.*\bservicios?\b/i.test(text)) {
    allowed = ["servicios"];
    rationale.push("Restricción explícita: solo servicios");
  }

  allowed = unique(allowed.filter((e) => !forcedForbidden.includes(e)));
  if (allowed.length === 0) allowed = ["eventos"];

  const forbidden = unique([
    ...ALL.filter((e) => !allowed.includes(e)),
    ...forcedForbidden,
  ]);

  const pathAllowGlobs = unique(allowed.flatMap((e) => ENTITY_PATH_POLICY[e].allow));
  // Gate estricto solo con una entidad: deniega paths típicos de las otras.
  const pathDenyGlobs =
    allowed.length === 1
      ? unique(ENTITY_PATH_POLICY[allowed[0]].denyWhenOther)
      : [];

  return {
    allowed,
    forbidden,
    outOfScopeNotes,
    pathAllowGlobs,
    pathDenyGlobs,
    rationale,
  };
}

export function formatDomainScopeForPrompt(scope: DomainScope): string {
  const lines = [
    "## DOMAIN SCOPE (HARD — incumplimiento = fallo)",
    `- ALLOWED_ENTITIES: ${scope.allowed.join(", ")}`,
    `- FORBIDDEN_ENTITIES: ${scope.forbidden.length ? scope.forbidden.join(", ") : "(ninguna)"}`,
    ...scope.rationale.map((r) => `- Motivo: ${r}`),
  ];
  if (scope.outOfScopeNotes.length) {
    lines.push("- Fuera de alcance del issue:");
    for (const n of scope.outOfScopeNotes) lines.push(`  - ${n}`);
  }
  lines.push(
    "- NO modifiques UI, adapters, hooks ni APIs de entidades FORBIDDEN.",
    "- NO “aproveches” para alinear lugares/servicios/mapa si no están en ALLOWED.",
    "- Si el bug parece estar en código compartido (EventsPage, discoverCache),",
    "  limita el diff a la rama de la entidad ALLOWED y NO rompas el cableado de las otras.",
    "- BLAST RADIUS: un fix de 1 entidad no puede apagar fetch/paint/skip de las demás.",
    "- Si tocas shouldSkip / caché / loading global en Descubre → FALLARÁS el gate UI",
    "  salvo que conserves locationBoundFetched + fetchNearbyVenues + fetchNearbyServices.",
  );
  if (scope.pathDenyGlobs.length) {
    lines.push("- Paths prohibidos (globs):");
    for (const g of scope.pathDenyGlobs.slice(0, 24)) lines.push(`  - ${g}`);
  }
  if (scope.pathAllowGlobs.length && scope.allowed.length === 1) {
    lines.push("- Paths preferidos (globs):");
    for (const g of scope.pathAllowGlobs.slice(0, 16)) lines.push(`  - ${g}`);
  }
  return lines.join("\n");
}

/** Devuelve paths que violan deny (y no están claramente allow). */
export function findScopeViolations(
  files: string[],
  scope: DomainScope,
): string[] {
  if (!scope.pathDenyGlobs.length) return [];
  return files.filter((f) => {
    const denied = pathMatchesAny(f, scope.pathDenyGlobs);
    if (!denied) return false;
    // Si también matchea allow de la entidad permitida, no bloquear (p.ej. overlap raro)
    if (scope.pathAllowGlobs.length && pathMatchesAny(f, scope.pathAllowGlobs)) {
      return false;
    }
    return true;
  });
}
