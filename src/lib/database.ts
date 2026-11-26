import { getCollection, type CollectionEntry } from 'astro:content';
import { TIERS, VEHICLE_CLASSES, WEAPON_CATEGORIES, type Tier } from '~/config/database';

export type Vehicle = CollectionEntry<'vehicles'>;
export type Weapon = CollectionEntry<'weapons'>;
export type Character = CollectionEntry<'characters'>;
export type Mission = CollectionEntry<'missions'>;

const tierRank = (t?: Tier) => (t ? TIERS.indexOf(t) : TIERS.length);
const byName = (a: { data: { name: string } }, b: { data: { name: string } }) => a.data.name.localeCompare(b.data.name);

export const getVehicles = async () => (await getCollection('vehicles', ({ data }) => !data.draft)).sort(byName);
export const getWeapons = async () => (await getCollection('weapons', ({ data }) => !data.draft)).sort(byName);
export const getCharacters = async () => (await getCollection('characters', ({ data }) => !data.draft)).sort(byName);
export const getMissions = async () =>
  (await getCollection('missions', ({ data }) => !data.draft)).sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.name.localeCompare(b.data.name));
export const getChecklistGroups = async () => (await getCollection('checklist')).sort((a, b) => a.data.order - b.data.order);

/** Which database sections have content (empty sections are hidden from the nav and from Google). */
export async function databaseAvailability() {
  const [v, w, c, m, k] = await Promise.all([getVehicles(), getWeapons(), getCharacters(), getMissions(), getChecklistGroups()]);
  return { vehicles: v.length > 0, weapons: w.length > 0, characters: c.length > 0, missions: m.length > 0, checklist: k.length > 0, tierLists: v.some((x) => x.data.tier) || w.some((x) => x.data.tier) };
}

export const byTier = <T extends { data: { tier?: Tier; name: string } }>(list: T[]) =>
  [...list].sort((a, b) => tierRank(a.data.tier) - tierRank(b.data.tier) || a.data.name.localeCompare(b.data.name));

export const money = (n?: number | null) => (n == null ? null : n === 0 ? 'Free' : `$${n.toLocaleString('en-US')}`);
export const mph = (n?: number | null) => (n == null ? null : `${n} mph`);

/** "The X tops out at Y mph, costs $Z and is found at W." Only states facts that are filled in. */
export function vehicleAnswer(v: Vehicle['data']) {
  if (v.summary) return v.summary;
  const parts: string[] = [];
  if (v.topSpeedMph) parts.push(`tops out at ${v.topSpeedMph} mph`);
  if (v.price != null) parts.push(v.price === 0 ? 'costs nothing' : `costs ${money(v.price)}`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
  const cls = VEHICLE_CLASSES[v.class].toLowerCase();
  let s = list ? `The ${v.name} ${list}.` : `The ${v.name} is a ${cls.replace(/s$/, '')} vehicle in GTA 6.`;
  if (v.location) s += ` Where to find it: ${v.location.replace(/\.$/, '')}.`;
  if (!v.topSpeedMph || v.price == null) s += ' Some stats are not confirmed yet.';
  return s;
}

export function weaponAnswer(w: Weapon['data']) {
  if (w.summary) return w.summary;
  const cat = WEAPON_CATEGORIES[w.category].replace(/s$/, '').toLowerCase();
  let s = `The ${w.name} is a${/^[aeiou]/i.test(cat) ? 'n' : ''} ${cat} in GTA 6`;
  s += w.tier ? `, ranked ${w.tier}-tier.` : '.';
  if (w.location) s += ` Get it: ${w.location.replace(/\.$/, '')}.`;
  if (w.price != null) s += ` Price: ${money(w.price)}.`;
  return s;
}

/** Related entries: same class/category first, then others, never the entry itself. */
export function related<T extends { id: string; data: Record<string, any> }>(all: T[], current: T, key: string, n = 6) {
  const same = all.filter((x) => x.id !== current.id && x.data[key] === current.data[key]);
  const rest = all.filter((x) => x.id !== current.id && x.data[key] !== current.data[key]);
  return [...same, ...rest].slice(0, n);
}

/** Lightweight JSON for the client-side compare tool and filters. */
export const vehicleIndex = (list: Vehicle[]) =>
  list.map((v) => ({ id: v.id, name: v.data.name, group: v.data.class, groupLabel: VEHICLE_CLASSES[v.data.class], tier: v.data.tier ?? null, image: v.data.images[0]?.src ?? null, stats: v.data.stats, facts: { 'Top speed': mph(v.data.topSpeedMph), Price: money(v.data.price), Seats: v.data.seats ?? null, 'Based on': v.data.realLife ?? null }, sample: v.data.sample }));
export const weaponIndex = (list: Weapon[]) =>
  list.map((w) => ({ id: w.id, name: w.data.name, group: w.data.category, groupLabel: WEAPON_CATEGORIES[w.data.category], tier: w.data.tier ?? null, image: w.data.images[0]?.src ?? null, stats: w.data.stats, facts: { Ammo: w.data.ammo ?? null, Magazine: w.data.magazine ?? null, Price: money(w.data.price), Attachments: w.data.attachments.length || null }, sample: w.data.sample }));
