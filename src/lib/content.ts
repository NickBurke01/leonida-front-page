import { getCollection } from 'astro:content';

const byDate = <T extends { data: { date: Date; updated?: Date } }>(a: T, b: T) =>
  (b.data.updated ?? b.data.date).getTime() - (a.data.updated ?? a.data.date).getTime();

/** Published guides, newest first. Real (non-placeholder) guides always come before placeholders. */
export async function getGuides() {
  const all = await getCollection('guides', ({ data }) => !data.draft);
  return all.sort((a, b) => Number(a.data.placeholder) - Number(b.data.placeholder) || byDate(a, b));
}

/** Guides for the home page: featured first, then the rest. */
export async function getHomeGuides(limit = 6) {
  const guides = await getGuides();
  return [...guides.filter((g) => g.data.featured), ...guides.filter((g) => !g.data.featured)].slice(0, limit);
}

export async function getNews() {
  const all = await getCollection('news', ({ data }) => !data.draft);
  return all.sort(byDate);
}
