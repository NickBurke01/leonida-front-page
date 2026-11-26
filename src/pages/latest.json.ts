/**
 * The newest video IDs the site was built with. The hourly GitHub check compares these with
 * YouTube and only asks Netlify to rebuild when something new has been uploaded.
 */
import type { APIRoute } from 'astro';
import { getChannels } from '~/lib/youtube';

export const GET: APIRoute = async () => {
  const { long, shorts } = await getChannels();
  const body = {
    builtAt: new Date().toISOString(),
    long: long.newestId,
    shorts: shorts.newestId,
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'content-type': 'application/json' } });
};
