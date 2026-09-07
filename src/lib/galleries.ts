/**
 * Gallery data is fetched from Supabase at BUILD time and baked into static
 * pages, so the published site makes no runtime database calls.
 */
import ca from "../data/client-area.json";

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

/** Exact row count for a table via PostgREST's `Prefer: count=exact` header. */
async function countRows(table: string, headers: Record<string, string>): Promise<number> {
  const r = await fetch(`${URL}/rest/v1/${table}?select=id&limit=1`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  if (!r.ok) throw new Error(`${table} count failed: ${r.status}`);
  const range = r.headers.get("content-range"); // e.g. "0-0/1234"
  const total = range ? Number(range.split("/")[1]) : NaN;
  if (!Number.isFinite(total)) throw new Error(`${table} count: missing/unparseable Content-Range header`);
  return total;
}

/** PostgREST caps responses at 1000 rows — page through a query until a short batch ends it. */
async function fetchAllPaged(pathWithQuery: string, headers: Record<string, string>): Promise<any[]> {
  const sep = pathWithQuery.includes("?") ? "&" : "?";
  const rows: any[] = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await fetch(`${URL}/rest/v1/${pathWithQuery}${sep}limit=1000&offset=${offset}`, { headers });
    if (!r.ok) throw new Error(`${pathWithQuery} fetch failed: ${r.status}`);
    const batch: any[] = await r.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

export async function loadGalleries(): Promise<Gallery[]> {
  if (cache) return cache;
  if (!URL || !KEY) {
    console.warn("[galleries] Supabase env vars missing — building with no galleries.");
    return (cache = []);
  }
  const h = { apikey: KEY, Authorization: `Bearer ${KEY}` };

  const [galleriesCount, gRows] = await Promise.all([
    countRows("galleries", h),
    fetchAllPaged("galleries?select=id,name,pin", h),
  ]);
  if (gRows.length !== galleriesCount) {
    throw new Error(`[galleries] expected ${galleriesCount} galleries but fetched ${gRows.length} — pagination bug`);
  }

  const [photosCount, photos] = await Promise.all([
    countRows("photos", h),
    fetchAllPaged("photos?select=id,gallery_id,url,thumbnail_url,date,resolution", h),
  ]);
  if (photos.length !== photosCount) {
    throw new Error(`[galleries] expected ${photosCount} photos but fetched ${photos.length} — pagination bug`);
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

  const all = gRows.map((g) => ({
    id: g.id,
    name: (g.name || "").trim(),
    pin: g.pin,
    slug: slugify(g.name || g.id),
    photos: byGallery.get(g.id) ?? [],
  }));

  const empty = all.filter((g) => g.photos.length === 0);
  const nonEmpty = all.filter((g) => g.photos.length > 0);

  if (empty.length > 0) {
    console.warn(`[galleries] ${empty.length} gallery(ies) have zero photos and are being dropped from the build:`);
    for (const g of empty) console.warn(`  - "${g.name}" (slug: ${g.slug}, id: ${g.id})`);

    // client-area.json cards marked hosted:true must resolve to a real gallery.
    // A dropped-but-hosted gallery means a migration silently lost its photos.
    const hostedItems = (ca.items as any[]).filter((i) => i.hosted);
    const hostedSlugs = new Set(hostedItems.map((i) => i.href.replace(/^\/galleries\/|\/$/g, "")));
    const hostedNames = new Set(hostedItems.map((i) => (i.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "")));
    const droppedButHosted = empty.filter(
      (g) => hostedSlugs.has(g.slug) || hostedNames.has(g.name.toLowerCase().replace(/[^a-z0-9]+/g, "")),
    );
    if (droppedButHosted.length > 0) {
      throw new Error(
        `[galleries] ${droppedButHosted.length} gallery(ies) marked hosted:true in client-area.json have zero photos: ` +
          droppedButHosted.map((g) => g.slug).join(", "),
      );
    }
  }

  cache = nonEmpty.sort((a, b) => b.photos.length - a.photos.length);

  console.log(`[galleries] ${cache.length} galleries, ${photos.length} photos`);
  return cache;
}
