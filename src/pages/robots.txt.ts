import type { APIRoute } from "astro";
export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /

Sitemap: https://www.cameraboss.co.uk/sitemap.xml
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
