/**
 * ONE place for everything about the brand and its channels.
 * Change a value here and the whole site updates on the next build.
 */

export const SITE = {
  name: 'Leonida Front Page',
  /** Live address. Must stay one word, in brand order: leonida → front → page. */
  url: 'https://leonidafrontpage.netlify.app',
  tagline: 'Shorts give you the headline. We give you the complete picture.',
  shortDescription: 'GTA 6 guides, secrets and news from the front page of Leonida.',
  description:
    'Leonida Front Page is the complete picture on GTA 6: money guides, hidden secrets, map and vehicle guides, plus the news that matters. Long-form breakdowns and daily Shorts.',
  locale: 'en_US',
  edition: 'Leonida Edition',
  /** Contact shown in the footer. Use a channel/business address, never a personal one. Leave empty to hide. */
  contactEmail: '',
  /** Social profiles. An icon only appears when a URL is filled in. */
  social: {
    tiktok: '',
    x: '',
  },
  disclaimer:
    'Leonida Front Page is a fan-made channel and is not affiliated with Rockstar Games or Take-Two Interactive.',
} as const;

export interface Channel {
  key: 'long' | 'shorts';
  name: string;
  handle: string;
  url: string;
  channelId: string;
  /** Playlist with only this channel's long videos (UULF…) or only its Shorts (UUSH…). */
  playlistPreferred: string;
  /** Every upload (UU…), used if the preferred playlist doesn't load. */
  playlistAll: string;
  role: string;
  blurb: string;
}

const uploads = (channelId: string, prefix: 'UU' | 'UULF' | 'UUSH') => prefix + channelId.slice(2);

export const LONG: Channel = {
  key: 'long',
  name: 'Leonida Front Page',
  handle: '@FrontPageLeonida',
  url: 'https://www.youtube.com/@FrontPageLeonida',
  channelId: 'UCYQrsIQpKIGQuLw9PMO68nw',
  playlistPreferred: uploads('UCYQrsIQpKIGQuLw9PMO68nw', 'UULF'),
  playlistAll: uploads('UCYQrsIQpKIGQuLw9PMO68nw', 'UU'),
  role: 'The full-coverage hub',
  blurb: 'Guides, secrets and breakdowns, 10 to 25 minutes, done properly.',
};

export const SHORTS: Channel = {
  key: 'shorts',
  name: 'Leonida FP',
  handle: '@LeonidaFP',
  url: 'https://www.youtube.com/@LeonidaFP',
  channelId: 'UCDgujTykhKXMQbi8-mmuncQ',
  playlistPreferred: uploads('UCDgujTykhKXMQbi8-mmuncQ', 'UUSH'),
  playlistAll: uploads('UCDgujTykhKXMQbi8-mmuncQ', 'UU'),
  role: 'The official daily Shorts channel',
  blurb: 'The headline in 60 seconds, every day.',
};

/**
 * Which Shorts the site shows. Only high performers, never every upload.
 * A Short qualifies when its views are at or above BOTH the median of the channel's recent Shorts
 * and `minViews`. Ranked by views (likes break ties). If fewer than `minShown` qualify, the
 * highest-viewed fill the gap so the strip never looks empty.
 */
export const TOP_SHORTS = {
  limit: 8,
  minViews: 1000,
  minShown: 4,
  /** How many proven Shorts the rolling "hall of fame" remembers between builds. */
  memory: 40,
} as const;

/** Opens YouTube's own "Subscribe?" confirmation for the channel. */
export const subscribeUrl = (c: Channel) => `${c.url}?sub_confirmation=1`;

export const GUIDE_CATEGORIES = {
  money: {
    label: 'Money',
    title: 'GTA 6 Money Guides',
    intro: 'How to make money in GTA 6: methods that are worth your time, ranked by what they pay and what they cost you.',
  },
  secrets: {
    label: 'Secrets & Easter Eggs',
    title: 'GTA 6 Secrets & Easter Eggs',
    intro: 'Hidden locations, easter eggs and the details most players drive straight past. Every one shown, not just described.',
  },
  'getting-started': {
    label: 'Getting Started',
    title: 'GTA 6 Beginner Guides',
    intro: 'Your first hours in Leonida: what to do first, what to skip, and the habits from older GTAs that will cost you.',
  },
  vehicles: {
    label: 'Vehicles',
    title: 'GTA 6 Vehicle Guides',
    intro: 'The cars, bikes and boats worth owning, where to find them, and which ones are only good for the trailer.',
  },
  weapons: {
    label: 'Weapons',
    title: 'GTA 6 Weapon Guides',
    intro: 'What to carry, where to get it, and how the new weapon systems change the way you fight.',
  },
  map: {
    label: 'Map',
    title: 'GTA 6 Map Guides',
    intro: 'Leonida region by region: what is where, how to get around, and what each area is actually good for.',
  },
} as const;

export type GuideCategory = keyof typeof GUIDE_CATEGORIES;
export const GUIDE_CATEGORY_KEYS = Object.keys(GUIDE_CATEGORIES) as [GuideCategory, ...GuideCategory[]];

export const NEWS_CATEGORIES = {
  news: 'News',
  update: 'Update',
  theory: 'Theory',
  breakdown: 'Breakdown',
} as const;
export type NewsCategory = keyof typeof NEWS_CATEGORIES;
export const NEWS_CATEGORY_KEYS = Object.keys(NEWS_CATEGORIES) as [NewsCategory, ...NewsCategory[]];

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/guides/', label: 'Guides' },
  { href: '/news/', label: 'News' },
  { href: '/channels/', label: 'Channels' },
  { href: '/about/', label: 'About' },
] as const;
