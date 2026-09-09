import type { APIRoute } from 'astro';
export const prerender = false;
export const GET: APIRoute = ({ url }) => new Response(null, { status: 302, headers: { Location: `/client-area/${url.search}` } });
