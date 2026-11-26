import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { GUIDE_CATEGORY_KEYS, NEWS_CATEGORY_KEYS } from './config/site';
import { VEHICLE_CLASS_KEYS, WEAPON_CATEGORY_KEYS, TIERS, CONFIRMED_KEYS } from './config/database';

/**
 * Sample database entries (clearly fictional, labelled SAMPLE) live in each folder's `samples/`
 * subfolder and are only loaded in test mode (LFP_FIXTURES=1). They never ship to the live site.
 */
const withSamples = ['1', 'live'].includes((process.env.LFP_FIXTURES ?? '').toLowerCase());
const pattern = (ext: string) => (withSamples ? [`**/*.${ext}`, `!**/_*.${ext}`] : [`*.${ext}`, `!_*.${ext}`]);
/** The page address is the file name (without its folder), e.g. vehicles/vapid-stanier.json → /vehicles/vapid-stanier/ */
const fileId = ({ entry }: { entry: string }) => entry.split('/').pop()!.replace(/\.(json|md)$/, '').toLowerCase();

/** A YouTube video ID is exactly 11 characters: letters, numbers, - and _. */
const youtubeId = z
  .string()
  .regex(/^[A-Za-z0-9_-]{11}$/, 'youtubeId must be the 11-character ID from the video URL (the part after "v=" or "/shorts/").')
  .optional();

const shared = {
  title: z.string().min(5).max(110),
  description: z.string().min(40, 'Write a description of at least 40 characters (it is used by Google).').max(170),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  youtubeId,
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  /** true = not finished yet: shown on the site with a "coming with the video" note, hidden from Google. */
  placeholder: z.boolean().default(false),
  /** true = not published at all. */
  draft: z.boolean().default(false),
};

const guides = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/guides' }),
  schema: z.object({
    ...shared,
    category: z.enum(GUIDE_CATEGORY_KEYS),
    featured: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/news' }),
  schema: z.object({
    ...shared,
    category: z.enum(NEWS_CATEGORY_KEYS),
  }),
});

// ---------------------------------------------------------------------------
// Database entries: one JSON file per entry
// ---------------------------------------------------------------------------
const stat = z.number().min(0).max(100).nullable().optional();
const image = z.object({ src: z.string(), alt: z.string() });
const dbShared = {
  name: z.string().min(2).max(60),
  /** The answer, in one or two sentences. Leave empty to have it written from the facts. */
  summary: z.string().max(260).optional(),
  tier: z.enum(TIERS).optional(),
  images: z.array(image).default([]),
  youtubeId,
  shortId: youtubeId,
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  confirmedIn: z.enum(CONFIRMED_KEYS),
  lastVerified: z.coerce.date(),
  sample: z.boolean().default(false),
  draft: z.boolean().default(false),
};

const vehicles = defineCollection({
  loader: glob({ pattern: pattern('json'), base: './src/content/vehicles', generateId: fileId }),
  schema: z.object({
    ...dbShared,
    class: z.enum(VEHICLE_CLASS_KEYS),
    manufacturer: z.string().optional(),
    realLife: z.string().optional(),
    topSpeedMph: z.number().positive().nullable().optional(),
    price: z.number().nonnegative().nullable().optional(),
    priceNote: z.string().optional(),
    location: z.string().optional(),
    seats: z.number().int().positive().optional(),
    stats: z.object({ speed: stat, acceleration: stat, braking: stat, handling: stat }).default({}),
  }),
});

const weapons = defineCollection({
  loader: glob({ pattern: pattern('json'), base: './src/content/weapons', generateId: fileId }),
  schema: z.object({
    ...dbShared,
    category: z.enum(WEAPON_CATEGORY_KEYS),
    ammo: z.string().optional(),
    magazine: z.number().int().positive().optional(),
    price: z.number().nonnegative().nullable().optional(),
    location: z.string().optional(),
    attachments: z.array(z.string()).default([]),
    stats: z.object({ damage: stat, fireRate: stat, range: stat, accuracy: stat }).default({}),
  }),
});

const characters = defineCollection({
  loader: glob({ pattern: pattern('json'), base: './src/content/characters', generateId: fileId }),
  schema: z.object({
    ...dbShared,
    role: z.string().max(60),
    bio: z.string().max(1200).optional(),
    /** true = story details are hidden until the reader reveals them. */
    spoiler: z.boolean().default(false),
    spoilerText: z.string().max(1200).optional(),
    relatedCharacters: z.array(z.string()).default([]),
  }),
});

const missions = defineCollection({
  loader: glob({ pattern: pattern('md'), base: './src/content/missions', generateId: fileId }),
  schema: z.object({
    name: z.string().min(2).max(80),
    summary: z.string().max(260).optional(),
    chapter: z.string().optional(),
    order: z.number().int().optional(),
    giver: z.string().optional(),
    objectives: z.array(z.string()).default([]),
    rewards: z.string().optional(),
    /** Missions hide their walkthrough behind a spoiler toggle by default. */
    spoiler: z.boolean().default(true),
    youtubeId,
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    confirmedIn: z.enum(CONFIRMED_KEYS),
    lastVerified: z.coerce.date(),
    sample: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const checklist = defineCollection({
  loader: glob({ pattern: pattern('json'), base: './src/content/checklist', generateId: fileId }),
  schema: z.object({
    title: z.string(),
    order: z.number().int().default(0),
    description: z.string().optional(),
    items: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), label: z.string(), note: z.string().optional(), link: z.string().optional() })),
    sample: z.boolean().default(false),
  }),
});

export const collections = { guides, news, vehicles, weapons, characters, missions, checklist };
