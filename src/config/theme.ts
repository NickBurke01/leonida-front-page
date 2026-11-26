/**
 * Visual style per page type (chosen 2026-11-26):
 *   'a' = Broadsheet (classic newspaper: condensed all-caps headlines, serif reading text, cream paper panels)
 *   'b' = Night Desk (modern news network: crisp, normal-case headlines, clean sans text)
 *
 * The top bar, ticker and footer always use CHROME, so the brand feels the same on every page.
 * Change a value here to restyle that whole type of page.
 */
export type Style = 'a' | 'b';

export const CHROME: Style = 'a';

export const PAGE_STYLE = {
  /** The home page */
  home: 'a',
  /** Lists: vehicles/weapons/characters/missions hubs, tier lists, checklist, compare, guides & news lists */
  hub: 'a',
  /** Single database entries: a vehicle, weapon, character or mission */
  entry: 'b',
  /** Reading pages: a guide or a news article */
  article: 'b',
  /** Brand pages: channels, about, privacy, 404, thank-you */
  page: 'a',
} as const satisfies Record<string, Style>;

export type PageKind = keyof typeof PAGE_STYLE;
