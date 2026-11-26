/**
 * What goes on the front page. Everything is real content from the channels and the site:
 * the lead is the newest long-form video once there is one, otherwise the most-watched Short.
 */
import { getChannels, getTopShorts, type TopShort, type Video } from './youtube';
import { getGuides, getNews } from './content';
import { GUIDE_CATEGORIES, NEWS_CATEGORIES } from '~/config/site';

export interface Story {
  kind: 'video' | 'short' | 'guide' | 'news';
  title: string;
  href: string;
  external: boolean;
  date: Date;
  label: string;
  views?: number;
  videoId?: string;
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
  thumbVertical?: string;
  placeholder?: boolean;
}

const clean = (t: string) => t.replace(/\s*#\w+/g, '').replace(/\s{2,}/g, ' ').trim();

const fromVideo = (v: Video): Story => ({
  kind: 'video', title: v.title, href: v.url, external: true, date: v.published, label: 'Leonida Front Page', views: v.views,
  videoId: v.id, thumb: v.thumb, thumbWidth: v.thumbWidth, thumbHeight: v.thumbHeight,
});
const fromShort = (s: TopShort): Story => ({
  kind: 'short', title: clean(s.title), href: s.url, external: true, date: new Date(s.published), label: 'Leonida FP Short', views: s.views,
  videoId: s.id, thumb: s.thumb, thumbWidth: s.thumbWidth, thumbHeight: s.thumbHeight, thumbVertical: s.thumbVertical,
});

export async function getFrontPage() {
  const [{ long }, top, guides, news] = await Promise.all([getChannels(), getTopShorts(), getGuides(), getNews()]);
  const videos = long.longVideos.map(fromVideo);
  const shorts = top.shown.map(fromShort);
  const guideStories: Story[] = guides.map((g) => ({
    kind: 'guide', title: g.data.title, href: `/guides/${g.id}/`, external: false, date: g.data.updated ?? g.data.date,
    label: `Guide · ${GUIDE_CATEGORIES[g.data.category].label}`, thumb: g.data.image ?? `/images/placeholders/guide-${g.data.category}.webp`,
    thumbWidth: 1600, thumbHeight: 900, placeholder: g.data.placeholder,
  }));
  const newsStories: Story[] = news.map((n) => ({
    kind: 'news', title: n.data.title, href: `/news/${n.id}/`, external: false, date: n.data.updated ?? n.data.date,
    label: NEWS_CATEGORIES[n.data.category], thumb: n.data.image ?? '/images/placeholders/news-lead.webp',
    thumbWidth: 1600, thumbHeight: 900, placeholder: n.data.placeholder,
  }));

  // Lead: newest long-form video, else the most-watched Short, else the best guide.
  const lead: Story | undefined = videos[0] ?? shorts[0] ?? guideStories[0];

  // Secondary: real content only (videos, top Shorts, finished guides/news), never repeating the lead.
  // Unfinished "coming with the video" pages are only used if there's nothing real to fill the slots.
  const rest = (list: Story[]) => list.filter((s) => s !== lead);
  const finished = [...guideStories, ...newsStories].filter((s) => !s.placeholder).sort((a, b) => b.date.getTime() - a.date.getTime());
  const unfinished = [...guideStories, ...newsStories].filter((s) => s.placeholder);
  const media = [...rest(videos), ...rest(shorts)];
  const secondary: Story[] = [];
  // Alternate: two videos/Shorts for every written piece, so the column always mixes formats.
  while (secondary.length < 4 && (media.length || finished.length)) {
    if (media.length) secondary.push(media.shift()!);
    if (secondary.length < 4 && media.length) secondary.push(media.shift()!);
    if (secondary.length < 4 && finished.length) secondary.push(finished.shift()!);
  }
  while (secondary.length < 4 && unfinished.length) secondary.push(unfinished.shift()!);

  // Latest: real posts newest first, so the page changes every time something is published.
  // (Shorts here are the high performers only, per the site's Top Shorts rule.)
  const latest = [...videos, ...shorts, ...guideStories.filter((s) => !s.placeholder), ...newsStories.filter((s) => !s.placeholder)]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  // Most watched: real YouTube view counts across both channels.
  const mostWatched = [...videos, ...shorts].filter((s) => (s.views ?? 0) > 0).sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);

  return { lead, secondary, latest, mostWatched, hasLongForm: videos.length > 0 };
}
