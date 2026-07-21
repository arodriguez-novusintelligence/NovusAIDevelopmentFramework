/* NADF-GUIDE
 * Propósito: Invariantes de UI Descubre — secciones que un fix acotado NO debe eliminar.
 * Configuración: Usado por validate-doevents-ui-invariants y el prompt.
 */

/** Títulos / anclas que deben seguir presentes en Descubre. */
export const DISCOVER_SECTION_TITLES = [
  'Eventos Favoritos',
  'Lugares cercanos a mi ubicación',
  'Eventos cercanos a mi ubicación',
  'Perfiles que prestan servicios',
  'Eventos recomendados',
  'Otros eventos',
] as const;

/** El título de servicios vive en FeedServicesCarousel, no en EventsView. */
export const DISCOVER_SERVICES_ANCHORS = [
  'FeedServicesCarousel',
  'Servicios cercanos',
] as const;

export const DISCOVER_UI_INVARIANT_FILES = [
  'packages/shell/src/lovable/components/feed/EventsView.tsx',
  'packages/shell/src/lovable/components/feed/FeedServicesCarousel.tsx',
  'packages/shell/src/pages/EventsPage.tsx',
] as const;

export function formatUiInvariantsForPrompt(): string {
  return [
    '## UI INVARIANTS (HARD — regresiones = fallo)',
    '- NO elimines, ocultes ni dejes de pasar props de secciones existentes de Descubre.',
    '- Tras tu cambio, la vista `/events` debe seguir mostrando (con datos o empty state) estas secciones:',
    ...DISCOVER_SECTION_TITLES.map((t) => `  - "${t}"`),
    '  - "Servicios cercanos a mi ubicación" (vía FeedServicesCarousel)',
    '- Si solo pediste eventos cercanos: puedes cambiar la lógica de esa sección; NO alters el render/carga de lugares, servicios, favoritos, recomendados u otros.',
    '- Si tocas caché/skip/loading en Descubre, no ocultes secciones enteras con loading eterno.',
    '- Prohibido “simplificar” la página quitando secciones no pedidas.',
  ].join('\n');
}
