/**
 * Gallery data is fetched from Supabase at BUILD time and baked into static
 * pages, so the published site makes no runtime database calls.
 */
const URL = import.meta.env.PUBLIC_SUPABASE_URL;
const KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export interface Photo {
  id: string;
  url: string;
  thumb: string;
  date: string;
  resolution: string;
}

export interface Gallery {
  id: string;
  name: string;
  pin: string;
  slug: string;
  photos: Photo[];
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

let cache: Gallery[] | null = null;

export async function loadGalleries(): Promise<Gallery[]> {
  if (cache) return cache;
  if (!URL || !KEY) {
    console.warn("[galleries] Supabase env vars missing — building with no galleries.");
    return (cache = []);
  }
  const h = { apikey: KEY, Authorization: `Bearer ${KEY}` };

  const gRes = await fetch(`${URL}/rest/v1/galleries?select=id,name,pin&limit=200`, { headers: h });
  if (!gRes.ok) throw new Error(`galleries fetch failed: ${gRes.status}`);
  const gRows: any[] = await gRes.json();

  // PostgREST caps responses at 1000 rows — page through everything.
  const photos: any[] = [];
  for (let offset = 0; offset < 20000; offset += 1000) {
    const r = await fetch(
      `${URL}/rest/v1/photos?select=id,gallery_id,url,thumbnail_url,date,resolution&limit=1000&offset=${offset}`,
      { headers: h },
    );
    if (!r.ok) throw new Error(`photos fetch failed: ${r.status}`);
    const batch: any[] = await r.json();
    photos.push(...batch);
    if (batch.length < 1000) break;
  }

  const byGallery = new Map<string, Photo[]>();
  for (const p of photos) {
    const list = byGallery.get(p.gallery_id) ?? [];
    list.push({
      id: p.id,
      url: p.url,
      thumb: p.thumbnail_url || p.url,
      date: p.date || "",
      resolution: p.resolution || "",
    });
    byGallery.set(p.gallery_id, list);
  }

  cache = gRows
    .map((g) => ({
      id: g.id,
      name: (g.name || "").trim(),
      pin: g.pin,
      slug: slugify(g.name || g.id),
      photos: byGallery.get(g.id) ?? [],
    }))
    .filter((g) => g.photos.length > 0)
    .sort((a, b) => b.photos.length - a.photos.length);

  console.log(`[galleries] ${cache.length} galleries, ${photos.length} photos`);
  return cache;
}
