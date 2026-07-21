/* NADF-GUIDE
 * Propósito: Invariantes de UI Descubre — secciones que un fix acotado NO debe eliminar.
 * Configuración: Usado por validate-doevents-ui-invariants y el prompt.
 */

/** Títulos de sección que deben seguir presentes en EventsView (Descubre). */
export const DISCOVER_SECTION_TITLES = [
  'Eventos Favoritos',
  'Lugares cercanos a mi ubicación',
  'Eventos cercanos a mi ubicación',
  'Servicios cercanos a mi ubicación',
  'Perfiles que prestan servicios',
  'Eventos recomendados',
  'Otros eventos',
] as const;

export const DISCOVER_UI_INVARIANT_FILES = [
  'packages/shell/src/lovable/components/feed/EventsView.tsx',
  'packages/shell/src/pages/EventsPage.tsx',
] as const;

export function formatUiInvariantsForPrompt(): string {
  return [
    '## UI INVARIANTS (HARD — regresiones = fallo)',
    '- NO elimines, ocultes ni dejes de pasar props de secciones existentes de Descubre.',
    '- Tras tu cambio, la vista `/events` debe seguir mostrando (con datos o empty state) estas secciones:',
    ...DISCOVER_SECTION_TITLES.map((t) => `  - "${t}"`),
    '- Si solo pediste eventos cercanos: puedes cambiar la lógica de esa sección; NO alters el render/carga de lugares, servicios, favoritos, recomendados u otros.',
    '- Si tocas caché/skip de red en Descubre, asegúrate de no impedir el fetch de places/services.',
    '- Prohibido “simplificar” la página quitando secciones no pedidas.',
  ].join('\n');
}
