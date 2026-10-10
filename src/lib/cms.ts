import archivedPosts from '../data/posts.json';
import routes from '../data/cms-routes.json';
import { validateSeoEntries, validatePostEntries } from './cms-validation.mjs';

const seoEntries = import.meta.glob('../../cms/seo/*.json', { eager: true, import: 'default' });
const postEntries = import.meta.glob('../../cms/posts/*.json', { eager: true, import: 'default' });

// Loaded at build time. A deployment retains exactly the content it shipped.
export const cmsSeo: Record<string, { title: string; description: string }> = validateSeoEntries(seoEntries, routes);
export const cmsPosts = validatePostEntries(postEntries, archivedPosts.map(p => p.slug));
