import type { APIRoute } from 'astro';
import { galleryDestination } from '../../lib/gallery-links';
export const prerender = false;
export const GET: APIRoute = ({ params, url }) => {
  const destination = galleryDestination(params.slug || '');
  if (!destination) return new Response('Gallery not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  return new Response(null, { status: 302, headers: { Location: `${destination}${url.search}` } });
};
