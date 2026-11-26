/**
 * The site's Top Shorts ranking. The next build reads this back from the live site, so Shorts that
 * proved themselves stay on the site even after they drop out of YouTube's 15-video feed.
 */
import type { APIRoute } from 'astro';
import { getTopShorts } from '~/lib/youtube';

export const GET: APIRoute = async () => {
  const { shown, memory, threshold } = await getTopShorts();
  return new Response(
    JSON.stringify({ builtAt: new Date().toISOString(), threshold, shown: shown.map((s) => s.id), memory }, null, 2),
    { headers: { 'content-type': 'application/json' } },
  );
};
