// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://leonidafrontpage.netlify.app';

/**
 * Pages marked `placeholder: true` or `draft: true` stay out of the sitemap (and carry noindex),
 * so unfinished pages never count against the site in Google.
 */
function hiddenContentPaths() {
  const hidden = new Set();
  /** category -> has at least one finished guide */
  const realByCategory = new Map();
  let realNews = false;
  for (const [folder, base] of [['guides', '/guides/'], ['news', '/news/']]) {
    const dir = path.resolve('src/content', folder);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const front = readFileSync(path.join(dir, file), 'utf8').split('---')[1] ?? '';
      const unfinished = /^\s*(placeholder|draft):\s*true\s*$/m.test(front);
      if (unfinished) hidden.add(`${base}${file.replace(/\.md$/, '')}/`);
      if (folder === 'guides') {
        const cat = (front.match(/^\s*category:\s*([\w-]+)/m) ?? [])[1];
        if (cat) realByCategory.set(cat, (realByCategory.get(cat) ?? false) || !unfinished);
      } else if (!unfinished) realNews = true;
    }
  }
  // Category and news pages that only hold unfinished posts are noindex too, so keep them out as well.
  for (const cat of ['money', 'secrets', 'getting-started', 'vehicles', 'weapons', 'map']) {
    if (!realByCategory.get(cat)) hidden.add(`/guides/${cat}/`);
  }
  if (!realNews) hidden.add('/news/');
  // Database sections stay out of the sitemap until they have real (non-sample) entries.
  const hasEntries = (folder, ext) => {
    const dir = path.resolve('src/content', folder);
    return existsSync(dir) && readdirSync(dir).some((f) => f.endsWith(ext) && !f.startsWith('_'));
  };
  const vehicles = hasEntries('vehicles', '.json');
  const weapons = hasEntries('weapons', '.json');
  if (!vehicles) ['/vehicles/', '/vehicles/compare/'].forEach((p) => hidden.add(p));
  if (!weapons) ['/weapons/', '/weapons/compare/'].forEach((p) => hidden.add(p));
  if (!vehicles && !weapons) hidden.add('/tier-lists/');
  if (!hasEntries('characters', '.json')) hidden.add('/characters/');
  if (!hasEntries('missions', '.md')) hidden.add('/missions/');
  if (!hasEntries('checklist', '.json')) hidden.add('/checklist/');
  hidden.add('/subscribed/');
  return hidden;
}
const hidden = hiddenContentPaths();

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  image: {
    domains: ['i.ytimg.com'],
  },
  fonts: [
    // Only the weights the design uses (fewer files = faster pages). Broadsheet: Oswald + Newsreader. Night Desk: Barlow Condensed + Inter.
    { provider: fontProviders.fontsource(), name: 'Oswald', cssVariable: '--font-oswald', weights: ['600', '700'], subsets: ['latin'], fallbacks: ['Arial Narrow', 'sans-serif'] },
    { provider: fontProviders.fontsource(), name: 'Newsreader', cssVariable: '--font-newsreader', weights: ['400', '600'], styles: ['normal'], subsets: ['latin'], fallbacks: ['Georgia', 'serif'] },
    { provider: fontProviders.fontsource(), name: 'Barlow Condensed', cssVariable: '--font-barlow-condensed', weights: ['700'], subsets: ['latin'], fallbacks: ['Arial Narrow', 'sans-serif'] },
    { provider: fontProviders.fontsource(), name: 'Inter', cssVariable: '--font-inter', weights: ['400', '600', '700'], subsets: ['latin'], fallbacks: ['system-ui', 'sans-serif'] },
  ],
  integrations: [
    sitemap({
      filter: (page) => {
        const p = new URL(page).pathname;
        // Sample entries only exist in test mode; never list them.
        return !hidden.has(p) && !/\/sample-/.test(p);
      },
    }),
  ],
});
