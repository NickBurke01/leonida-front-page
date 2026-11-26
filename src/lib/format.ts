export const formatDate = (d: Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(d);

export const isoDate = (d: Date) => d.toISOString();

/** Editorial edition line, e.g. "Thursday, November 26, 2026". */
export const editionDate = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(d);

/** Minutes to read at ~230 words per minute (minimum 1). */
export function readingMinutes(markdown: string | undefined): number {
  if (!markdown) return 1;
  const words = markdown.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`\-[\]()!]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export const relativeDays = (d: Date, now = new Date()) => {
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(d);
};
