import postsData from "../data/posts.json";
import pagesData from "../data/pages.json";
import galleriesData from "../data/galleries.json";

export interface Post {
  slug: string;
  title: string;
  date: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  original_url: string;
  html: string;
  internal_links: string[];
}

export interface Page {
  path: string;
  url: string;
  title: string;
  meta_description: string;
  og_image: string;
  h1: string;
  html: string;
}

export interface GalleryMeta {
  collection_id: string;
  slug: string;
  name: string;
  event_date: string | null;
  photo_count: number;
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** "25 Aug, 2026" -> Date */
export function parseDate(s: string): Date | null {
  const m = /^(\d{1,2})\s+(\w{3}),\s*(\d{4})$/.exec((s || "").trim());
  if (!m) return null;
  const mo = MONTHS[m[2]];
  if (mo === undefined) return null;
  return new Date(Number(m[3]), mo, Number(m[1]));
}

export function formatDate(s: string): string {
  const d = parseDate(s);
  if (!d) return s || "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function isoDate(s: string): string {
  const d = parseDate(s);
  return d ? d.toISOString().slice(0, 10) : "";
}

/**
 * Pixieset shipped its cookie-consent banner and a few other chrome
 * fragments inside the page body. Strip them so they don't render as
 * stray paragraphs at the top of every imported page.
 */
const JUNK_PATTERNS: RegExp[] = [
  /We use cookies to optimize your experience[\s\S]*?Save Preferences/gi,
  /Accept All\s*Decline All\s*Manage/gi,
  /Essential\s*-\s*strictly necessary[\s\S]*?other websites\./gi,
  /<div[^>]*(?:cookie|consent)[^>]*>[\s\S]*?<\/div>/gi,
];

export function clean(html: string): string {
  let out = html || "";
  for (const re of JUNK_PATTERNS) out = out.replace(re, "");
  return out.trim();
}

export const posts: Post[] = (postsData as Post[])
  .map((p) => ({ ...p, html: clean(p.html) }))
  .sort((a, b) => {
    const da = parseDate(a.date)?.getTime() ?? 0;
    const db = parseDate(b.date)?.getTime() ?? 0;
    return db - da;
  });

export const pages: Page[] = (pagesData as Page[]).map((p) => ({ ...p, html: clean(p.html) }));
export const galleries: GalleryMeta[] = galleriesData as GalleryMeta[];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

/** First image in the body, used as a card thumbnail when og_image is missing. */
export function firstImage(html: string): string | null {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || "");
  return m ? m[1] : null;
}

export function thumbFor(p: Post): string | null {
  return p.og_image || firstImage(p.html);
}

/** Plain-text excerpt from the post body. */
export function excerpt(p: Post, len = 155): string {
  if (p.meta_description) return p.meta_description.slice(0, len);
  const txt = (p.html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return txt.slice(0, len);
}

/** Related posts, cheaply scored on shared title words. */
export function related(p: Post, n = 3): Post[] {
  const stop = new Set(["the","and","for","with","your","from","this","that","what","how","why","are","you","a","an","in","of","to","on","at","is","it","be","as"]);
  const words = (t: string) =>
    new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !stop.has(w)));
  const target = words(p.title);
  return posts
    .filter((o) => o.slug !== p.slug)
    .map((o) => {
      const w = words(o.title);
      let score = 0;
      target.forEach((t) => { if (w.has(t)) score++; });
      return { o, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.o);
}
