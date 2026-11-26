import { SITE, LONG, SHORTS } from '~/config/site';

export const absolute = (path: string) => new URL(path, SITE.url).toString();

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url + '/',
  logo: { '@type': 'ImageObject', url: absolute('/icon-512.png'), width: 512, height: 512 },
  description: SITE.description,
  sameAs: [LONG.url, SHORTS.url, SITE.social.tiktok, SITE.social.x].filter(Boolean),
});

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url + '/',
  inLanguage: 'en',
  publisher: { '@id': `${SITE.url}/#organization` },
});

export const breadcrumbs = (items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.href) })),
});

export const article = (a: { title: string; description: string; href: string; image: string; date: Date; updated?: Date; section: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  description: a.description,
  mainEntityOfPage: absolute(a.href),
  image: [absolute(a.image)],
  datePublished: a.date.toISOString(),
  dateModified: (a.updated ?? a.date).toISOString(),
  articleSection: a.section,
  author: { '@id': `${SITE.url}/#organization` },
  publisher: { '@id': `${SITE.url}/#organization` },
});

export const faqPage = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const itemList = (name: string, items: { name: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absolute(it.href) })),
});

export const videoObject =(v: { id: string; title: string; description: string; uploadDate?: Date }) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: v.title,
  description: v.description,
  thumbnailUrl: [`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`],
  ...(v.uploadDate ? { uploadDate: v.uploadDate.toISOString() } : {}),
  embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
  contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
  publisher: { '@id': `${SITE.url}/#organization` },
});
