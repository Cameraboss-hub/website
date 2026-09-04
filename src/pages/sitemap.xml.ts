import type { APIRoute } from "astro";
import { posts, pages, isoDate } from "../lib/content";

export const prerender = true;

const SITE = "https://www.cameraboss.co.uk";

export const GET: APIRoute = () => {
  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: `${SITE}/`, priority: "1.0" },
    { loc: `${SITE}/blog/`, priority: "0.9" },
  ];

  // Every static page (Pixieset's sitemap had these; keep parity)
  for (const p of pages) {
    if (p.path === "/" || p.path === "/blog/") continue;
    urls.push({ loc: `${SITE}${p.path.endsWith("/") ? p.path : p.path + "/"}`, priority: "0.8" });
  }

  // Every blog post — Pixieset's sitemap listed NONE of these.
  for (const p of posts) {
    urls.push({
      loc: `${SITE}/blog/${p.slug}/`,
      lastmod: isoDate(p.date) || undefined,
      priority: "0.7",
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
