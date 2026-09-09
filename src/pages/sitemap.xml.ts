import type { APIRoute } from "astro";
import { posts, pages, isoDate, thumbFor, isThinDuplicate } from "../lib/content";

import videos from "../data/videos.json";


export const prerender = true;

const SITE = "https://www.cameraboss.co.uk";

export const GET: APIRoute = async () => {
  const urls: { loc: string; lastmod?: string; priority: string; images?: string[] }[] = [
    { loc: `${SITE}/`, priority: "1.0" },
    { loc: `${SITE}/blog/`, priority: "0.9" },
  ];

  // Every static page (Pixieset's sitemap had these; keep parity).
  // The client-area index stays at its original URL; video aliases are excluded.
  const redirected = new Set(["/videos/", "/wedding-videos/", "/Wedding-videos/"]);
  for (const p of pages) {
    if (p.path === "/" || p.path === "/blog/") continue;
    const path = p.path.endsWith("/") ? p.path : p.path + "/";
    if (redirected.has(path)) continue;
    // A page marked noindex must not be advertised in the sitemap.
    if (isThinDuplicate(path)) continue;
    urls.push({ loc: `${SITE}${path}`, priority: "0.8" });
  }

  // Wedding films page, with a thumbnail per film.
  urls.push({
    loc: `${SITE}/Wedding-videos/`,
    priority: "0.8",
    images: (videos as any[]).slice(0, 10).map((v) => `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`),
  });

  // Every imported blog post, preserving its original case-sensitive path.
  for (const p of posts) {
    // Image entries help Google surface a photographer's work in image search.
    const imgs = [...p.html.matchAll(/<img[^>]+src="(https:\/\/[^"]+)"/gi)].map((m) => m[1]);
    const hero = thumbFor(p);
    urls.push({
      loc: `${SITE}/blog/${p.slug}/`,
      lastmod: isoDate(p.date) || undefined,
      priority: "0.7",
      images: [...new Set([hero, ...imgs].filter(Boolean) as string[])].slice(0, 10),
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}\n    <priority>${u.priority}</priority>` +
      (u.images ?? []).map((i) => `\n    <image:image><image:loc>${i.replace(/&/g, "&amp;")}</image:loc></image:image>`).join("") +
      `\n  </url>`,
  )
  .join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
