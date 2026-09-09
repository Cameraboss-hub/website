import clientArea from '../data/client-area.json';
// Pixieset remains the delivery system. These exact URLs are the public client links.
export const galleryLinks = Object.fromEntries(clientArea.items.map(item => [item.slug, item.href]));
// Compatibility with the two name-derived routes in the previous clone.
export const galleryAliases: Record<string, string> = {
  kachyoge: 'kachyandoge',
  familyshoot: 'familyshoot-1',
};
export function galleryDestination(slug: string): string | undefined {
  const key = Object.hasOwn(galleryAliases, slug) ? galleryAliases[slug] : slug;
  return Object.hasOwn(galleryLinks, key) ? galleryLinks[key] : undefined;
}
