/**
 * Build-time YouTube data.
 *
 * Reads each channel's public RSS feed when the site is built, so the latest videos appear without
 * anyone editing the site. If a feed can't be read, the build still succeeds and that channel shows
 * its "coming soon" state instead.
 *
 * Test modes (set before `astro dev` / `astro build`):
 *   LFP_FIXTURES=1      simulate a live long-form channel with public sample videos (never deploy this)
 *   LFP_FIXTURES=empty  simulate both channels with no uploads
 */
import { XMLParser } from 'fast-xml-parser';
import { LONG, SHORTS, SITE, TOP_SHORTS, type Channel } from '~/config/site';

export interface Video {
  id: string;
  title: string;
  published: Date;
  url: string;
  isShort: boolean;
  /** Landscape thumbnail (16:9 where available). */
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
  /** Vertical thumbnail for Shorts (9:16) when YouTube provides one. */
  thumbVertical?: string;
  /** Public counts from the feed (refreshed every build). */
  views?: number;
  likes?: number;
}

export interface ChannelData {
  channel: Channel;
  ok: boolean;
  /** The playlist the player continues through: the long-only/Shorts-only one if YouTube has it, else all uploads, else none. */
  playlist: string | null;
  /** Newest entry in the feed, whatever its type (used by the auto-update check). */
  newestId: string | null;
  longVideos: Video[];
  shorts: Video[];
}

const MODE = (process.env.LFP_FIXTURES ?? '').toLowerCase();
const FEED = (id: string) => `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`;
const IMG = (id: string, file: string) => `https://i.ytimg.com/vi/${id}/${file}`;

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 12000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (site build)' } });
  } finally {
    clearTimeout(t);
  }
}

async function exists(url: string): Promise<boolean> {
  try {
    const r = await fetchWithTimeout(url, { method: 'HEAD' }, 8000);
    return r.ok;
  } catch {
    return false;
  }
}

async function withThumbs(base: Omit<Video, 'thumb' | 'thumbWidth' | 'thumbHeight' | 'thumbVertical'> & { views?: number; likes?: number }): Promise<Video> {
  const hq720 = IMG(base.id, 'hq720.jpg');
  const vertical = IMG(base.id, 'oardefault.jpg');
  const [has720, hasVertical] = await Promise.all([exists(hq720), base.isShort ? exists(vertical) : Promise.resolve(false)]);
  return {
    ...base,
    thumb: has720 ? hq720 : IMG(base.id, 'hqdefault.jpg'),
    thumbWidth: has720 ? 1280 : 480,
    thumbHeight: has720 ? 720 : 360,
    thumbVertical: hasVertical ? vertical : undefined,
  };
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

/** YouTube only creates the long-only / Shorts-only playlists once a channel has that kind of video. */
async function playlistExists(list: string): Promise<boolean> {
  try {
    const r = await fetchWithTimeout(`https://www.youtube.com/playlist?list=${list}`, { headers: { 'accept-language': 'en-US' } });
    if (!r.ok) return false;
    const html = await r.text();
    return !/playlist does not exist|playlist type is unviewable/i.test(html);
  } catch {
    return false;
  }
}

async function pickPlaylist(channel: Channel, hasVideos: boolean): Promise<string | null> {
  if (!hasVideos) return null;
  if (await playlistExists(channel.playlistPreferred)) return channel.playlistPreferred;
  if (await playlistExists(channel.playlistAll)) return channel.playlistAll;
  return null;
}

async function readFeed(channel: Channel): Promise<ChannelData> {
  const empty: ChannelData = { channel, ok: false, playlist: null, newestId: null, longVideos: [], shorts: [] };
  try {
    const res = await fetchWithTimeout(FEED(channel.channelId));
    if (!res.ok) {
      console.warn(`[youtube] ${channel.name}: feed returned ${res.status}; using the empty state.`);
      return empty;
    }
    const xml = parser.parse(await res.text());
    const raw = xml?.feed?.entry;
    const entries: any[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
    const videos = await Promise.all(
      entries.map((e) => {
        const id: string = e['yt:videoId'];
        const link: string = (Array.isArray(e.link) ? e.link[0] : e.link)?.['@_href'] ?? '';
        const community = e['media:group']?.['media:community'];
        return withThumbs({
          id,
          title: String(e.title ?? '').trim(),
          published: new Date(e.published),
          url: link || `https://www.youtube.com/watch?v=${id}`,
          isShort: link.includes('/shorts/'),
          views: Number(community?.['media:statistics']?.['@_views'] ?? 0) || 0,
          likes: Number(community?.['media:starRating']?.['@_count'] ?? 0) || 0,
        });
      }),
    );
    const longVideos = videos.filter((v) => !v.isShort);
    const shorts = videos.filter((v) => v.isShort);
    const relevant = channel.key === 'long' ? longVideos.length > 0 : shorts.length > 0;
    return {
      channel,
      ok: true,
      playlist: await pickPlaylist(channel, relevant),
      newestId: videos[0]?.id ?? null,
      longVideos,
      shorts,
    };
  } catch (err) {
    console.warn(`[youtube] ${channel.name}: feed unavailable (${(err as Error).message}); using the empty state.`);
    return empty;
  }
}

/** Public sample videos for testing the "live" layout locally. Never shipped. */
async function fixtureLong(): Promise<ChannelData> {
  // Creative Commons Blender open movies: neutral test footage (no Rockstar artwork, even in test mode).
  const samples = [
    { id: 'aqz-KE-bpKQ', title: 'Sample video: your first long-form upload appears here' },
    { id: 'eRsGyueVLvQ', title: 'Sample video: a second long-form upload' },
  ];
  const now = Date.now();
  const longVideos = await Promise.all(
    samples.map((s, i) =>
      withThumbs({ id: s.id, title: s.title, published: new Date(now - i * 86400000 * 3), url: `https://www.youtube.com/watch?v=${s.id}`, isShort: false }),
    ),
  );
  return { channel: LONG, ok: true, playlist: null, newestId: longVideos[0].id, longVideos, shorts: [] };
}

let cache: Promise<{ long: ChannelData; shorts: ChannelData }> | undefined;

export function getChannels() {
  cache ??= (async () => {
    if (MODE === 'empty') {
      return {
        long: { channel: LONG, ok: true, playlist: null, newestId: null, longVideos: [], shorts: [] },
        shorts: { channel: SHORTS, ok: true, playlist: null, newestId: null, longVideos: [], shorts: [] },
      };
    }
    const [long, shorts] = await Promise.all([MODE === '1' || MODE === 'live' ? fixtureLong() : readFeed(LONG), readFeed(SHORTS)]);
    return { long, shorts };
  })();
  return cache;
}

// ---------------------------------------------------------------------------
// Top Shorts: only high performers, never every upload.
// ---------------------------------------------------------------------------
export interface TopShort {
  id: string;
  title: string;
  url: string;
  published: string;
  views: number;
  likes: number;
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
  thumbVertical?: string;
}

const toTop = (v: Video): TopShort => ({
  id: v.id,
  title: v.title,
  url: v.url,
  published: v.published.toISOString(),
  views: v.views ?? 0,
  likes: v.likes ?? 0,
  thumb: v.thumb,
  thumbWidth: v.thumbWidth,
  thumbHeight: v.thumbHeight,
  thumbVertical: v.thumbVertical,
});

/** The previous build's ranking, read from the live site, so proven Shorts survive leaving the 15-video feed. */
async function previousHallOfFame(): Promise<TopShort[]> {
  if (MODE === 'empty') return [];
  try {
    const r = await fetchWithTimeout(new URL('/top-shorts.json', SITE.url).toString(), {}, 8000);
    if (!r.ok) return [];
    const data = await r.json();
    const ok = (s: any): s is TopShort =>
      s && /^[A-Za-z0-9_-]{11}$/.test(s.id) && typeof s.title === 'string' && Number.isFinite(s.views) &&
      typeof s.thumb === 'string' && s.thumb.startsWith('https://i.ytimg.com/') &&
      (!s.thumbVertical || String(s.thumbVertical).startsWith('https://i.ytimg.com/'));
    return Array.isArray(data?.memory) ? (data.memory as unknown[]).filter(ok).map((s) => ({ ...s, url: `https://www.youtube.com/shorts/${s.id}` })) : [];
  } catch {
    return [];
  }
}

const median = (nums: number[]) => {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

let topCache: Promise<{ shown: TopShort[]; memory: TopShort[]; threshold: number }> | undefined;

/**
 * The Shorts worth showing on the site, ranked by views.
 * `shown` is what the site displays; `memory` is saved to /top-shorts.json for the next build.
 */
export function getTopShorts() {
  topCache ??= (async () => {
    const { shorts } = await getChannels();
    const fresh = shorts.shorts.map(toTop);
    const prior = await previousHallOfFame();
    // Merge: fresh counts win; remembered Shorts keep their last known counts.
    const byId = new Map<string, TopShort>();
    for (const s of prior) byId.set(s.id, s);
    for (const s of fresh) byId.set(s.id, s);
    const pool = [...byId.values()].sort((a, b) => b.views - a.views || b.likes - a.likes);
    const threshold = Math.max(TOP_SHORTS.minViews, median(fresh.map((s) => s.views)));
    let shown = pool.filter((s) => s.views >= threshold).slice(0, TOP_SHORTS.limit);
    if (shown.length < TOP_SHORTS.minShown) shown = pool.slice(0, Math.max(TOP_SHORTS.minShown, shown.length)).slice(0, TOP_SHORTS.limit);
    const memory = pool.slice(0, TOP_SHORTS.memory);
    return { shown, memory, threshold };
  })();
  return topCache;
}

/** "26.3K views" */
export const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, '')}K views`;
  return `${n} view${n === 1 ? '' : 's'}`;
};

/** A specific video (e.g. the one paired with a guide), with checked thumbnails. */
export async function videoById(id: string, title: string): Promise<Video> {
  const { long, shorts } = await getChannels();
  const known = [...long.longVideos, ...long.shorts, ...shorts.shorts].find((v) => v.id === id);
  if (known) return known;
  return withThumbs({ id, title, published: new Date(), url: `https://www.youtube.com/watch?v=${id}`, isShort: false });
}

/** Player URL for one video (click-to-play, privacy-enhanced domain). */
export const embedUrl = (id: string, params: Record<string, string> = {}) =>
  `https://www.youtube-nocookie.com/embed/${id}?${new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1', playsinline: '1', ...params })}`;

/** Player URL that plays a video and then continues through the channel's uploads. */
export const embedWithPlaylist = (id: string, playlist: string) => embedUrl(id, { list: playlist });

export const fixtureMode = MODE;
