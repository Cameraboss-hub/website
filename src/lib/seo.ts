import baseline from '../data/seo-baseline.json';
import { cmsSeo } from './cms';
const records = baseline as Record<string, { title: string; description: string }>;
export const SITE = 'https://www.cameraboss.co.uk';
export function seoFor(path: string, fallback: { title: string; description?: string }) {
  const key = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`;
  const saved = cmsSeo[key] || records[key];
  return {
    title: saved?.title.trim() || fallback.title,
    description: saved?.description.trim() || fallback.description || '',
  };
}
