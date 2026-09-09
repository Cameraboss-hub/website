import baseline from '../data/seo-baseline.json';
const records = baseline as Record<string, { title: string; description: string }>;
export const SITE = 'https://www.cameraboss.co.uk';
export function seoFor(path: string, fallback: { title: string; description?: string }) {
  const key = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`;
  const saved = records[key];
  return {
    title: saved?.title.trim() || fallback.title,
    description: saved?.description.trim() || fallback.description || '',
  };
}
