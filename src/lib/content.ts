import postsData from "../data/posts.json";
import imageDimsData from "../data/image-dims.json";
import pagesData from "../data/pages.json";
import galleriesData from "../data/galleries.json";

export interface Post {
  slug: string;
  title: string;
  date: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  original_url: string;
  html: string;
  internal_links: string[];
}

export interface Page {
  path: string;
  url: string;
  title: string;
  meta_description: string;
  og_image: string;
  h1: string;
  html: string;
}

export interface GalleryMeta {
  collection_id: string;
  slug: string;
  name: string;
  event_date: string | null;
  photo_count: number;
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** "25 Aug, 2026" -> Date */
export function parseDate(s: string): Date | null {
  const m = /^(\d{1,2})\s+(\w{3}),\s*(\d{4})$/.exec((s || "").trim());
  if (!m) return null;
  const mo = MONTHS[m[2]];
  if (mo === undefined) return null;
  return new Date(Number(m[3]), mo, Number(m[1]));
}

export function formatDate(s: string): string {
  const d = parseDate(s);
  if (!d) return s || "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function isoDate(s: string): string {
  const d = parseDate(s);
  return d ? d.toISOString().slice(0, 10) : "";
}

/**
 * Imported Pixieset HTML carries the whole page shell: analytics tags,
 * Sentry init, the cookie-consent banner, slick-carousel bootstrapping and
 * inline styles. None of it should run — or render — on the new site, so
 * it is stripped before the body is injected.
 */
const STRIP: RegExp[] = [
  /<script\b[^>]*>[\s\S]*?<\/script>/gi,
  // NOTE: <style> is NOT stripped here — see keepAuthorStyles() below. Pixieset's
  // own theme CSS never appears inside the imported body, but the author's
  // custom-code blocks do carry real stylesheets (the Area We Cover map ships
  // 13KB of its own, already scoped to .cbl-dir). Stripping those left the map
  // as overlapping text on an unstyled page.
  /<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,
  /<link\b[^>]*>/gi,
  /<meta\b[^>]*>/gi,
  /<!--[\s\S]*?-->/g,
  // Any cookie/consent markup that survives the above
  /<div[^>]*class="[^"]*(?:cookie|consent)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
  // Bare consent copy, if it ever lands as text
  /We use cookies to optimize your experience[\s\S]*?Save Preferences/gi,
];

/**
 * Remove a whole <div class="… name …"> subtree, matching its nested divs
 * properly rather than guessing where it ends.
 */
function dropBlock(html: string, name: string): string {
  const open = new RegExp(`<div[^>]*class="[^"]*\\b${name}\\b[^"]*"[^>]*>`, "i");
  let out = html;
  for (let guard = 0; guard < 20; guard++) {
    const m = open.exec(out);
    if (!m) break;
    let i = m.index + m[0].length, depth = 1;
    const tag = /<\/?div\b[^>]*>/gi;
    tag.lastIndex = i;
    let t: RegExpExecArray | null;
    while ((t = tag.exec(out))) {
      depth += t[0][1] === "/" ? -1 : 1;
      if (depth === 0) { i = t.index + t[0].length; break; }
    }
    if (depth !== 0) i = out.length;
    out = out.slice(0, m.index) + out.slice(i);
  }
  return out;
}

/** Attributes that re-introduce Pixieset behaviour or absolute positioning. */
const STRIP_ATTRS: RegExp[] = [
  /\son[a-z]+="[^"]*"/gi,          // inline event handlers
  /\sdata-(?:slick|sentry|gtm|ps-)[a-z-]*="[^"]*"/gi,
];

/**
 * Scope a stylesheet so it can only affect the block that shipped it.
 *
 * The custom-code blocks were written as standalone HTML documents, so they
 * carry rules like `* { margin: 0 }`, `body { font-family: Georgia; padding: 40px }`,
 * `article { max-width: 780px }` and bare `h1 / h2 / p / hr` declarations.
 * Inlined as-is those applied to the ENTIRE page: every heading, paragraph and
 * rule on 63 blog posts and 3 pages was restyled by whichever block happened to
 * load, and the 780px `article` cap squeezed the flex-builder grid it sat in.
 *
 * Every selector is therefore rewritten to sit under the custom-code container.
 * Document-level selectors (html / body / :root) become the container itself,
 * so `body { padding }` styles the block, not the site.
 */
const AUTHOR_SCOPE = ".fb-element-type-custom-code__content";

function splitTop(list: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0, quote = "", buf = "";
  for (const ch of list) {
    if (quote) { buf += ch; if (ch === quote) quote = ""; continue; }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    if (ch === sep && depth === 0) { out.push(buf); buf = ""; continue; }
    buf += ch;
  }
  out.push(buf);
  return out;
}

const DOC_LEVEL = /^(?::root|html|body)(?![\w-])/i;

function scopeSelector(sel: string): string {
  const parts = splitTop(sel, ",").map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  const scope = AUTHOR_SCOPE;
  for (const part of parts) {
    if (part === "*") {
      // `* { box-sizing: border-box }` must still reach the container itself.
      out.push(scope, `${scope} *`);
    } else if (part === ":root" || part === "html" || part === "body") {
      // `body { padding: 40px }` styles the block box, not everything in it.
      out.push(scope);
    } else if (DOC_LEVEL.test(part)) {
      out.push(scope + part.replace(DOC_LEVEL, ""));
    } else {
      out.push(`${scope} ${part}`);
    }
  }
  return [...new Set(out)].join(", ");
}

/** Rewrite a stylesheet so every rule is confined to the custom-code block. */
/**
 * True when the sheet reaches outside its own block — a document-level or bare
 * element selector. A sheet whose every selector starts with a class, id or
 * attribute (the Area We Cover map, the /weddings/ location columns) already
 * confines itself and is left byte-for-byte alone.
 */
export function leaksGlobally(css: string): boolean {
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("/*", i)) { const e = css.indexOf("*/", i + 2); i = e < 0 ? css.length : e + 2; continue; }
    const brace = css.indexOf("{", i);
    if (brace < 0) return false;
    const prelude = css.slice(i, brace).trim();
    // Walk to the matching close brace so a declaration body is never read as a selector.
    let depth = 0, j = brace, quote = "";
    for (; j < css.length; j++) {
      const ch = css[j];
      if (quote) { if (ch === quote) quote = ""; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) break; }
    }
    const body = css.slice(brace + 1, j);
    i = j + 1;
    if (prelude.startsWith("@")) {
      const name = prelude.slice(1).split(/[\s(]/)[0].toLowerCase();
      if (name === "media" || name === "supports" || name === "layer" || name === "container") {
        if (leaksGlobally(body)) return true;
      }
      continue;                                     // keyframes / font-face reach nothing
    }
    for (const part of splitTop(prelude, ",")) {
      const t = part.trim();
      if (!t) continue;
      if (!/^[.#\[:]/.test(t)) return true;         // a bare tag name, or *
      if (/^:root\b/i.test(t)) return true;
    }
  }
  return false;
}

export function scopeAuthorCss(css: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    // Skip comments and whitespace between rules
    if (css.startsWith("/*", i)) { const e = css.indexOf("*/", i + 2); i = e < 0 ? css.length : e + 2; continue; }
    const braceRel = css.indexOf("{", i);
    const semiRel = css.indexOf(";", i);
    if (braceRel < 0) break;
    // A statement at-rule (@import, @charset) ends at the semicolon.
    if (semiRel >= 0 && semiRel < braceRel && css.slice(i, semiRel).trim().startsWith("@")) {
      i = semiRel + 1; continue;                       // dropped: no external imports
    }
    const prelude = css.slice(i, braceRel).trim();
    // Find the matching close brace
    let depth = 0, j = braceRel, quote = "";
    for (; j < css.length; j++) {
      const ch = css[j];
      if (quote) { if (ch === quote) quote = ""; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth === 0) break; }
    }
    const body = css.slice(braceRel + 1, j);
    i = j + 1;
    if (prelude.startsWith("@")) {
      const name = prelude.slice(1).split(/[\s(]/)[0].toLowerCase();
      if (name === "media" || name === "supports" || name === "layer" || name === "container") {
        out += `${prelude}{${scopeAuthorCss(body)}}`;      // recurse into the block
      } else {
        out += `${prelude}{${body}}`;                      // keyframes, font-face: leave alone
      }
      continue;
    }
    out += `${scopeSelector(prelude)}{${body}}`;
  }
  return out;
}

/**
 * Pull the author's own stylesheets out of the imported body, scope them to the
 * block that shipped them, and hand them back to be re-inserted. Pixieset's own
 * theme CSS never appears inside the imported body, but custom-code blocks do
 * carry real stylesheets (the Area We Cover map ships 13KB of its own).
 */
function keepAuthorStyles(html: string): { stripped: string; styles: string[] } {
  const styles: string[] = [];
  const stripped = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_tag, css: string) => {
    const text = String(css);
    // Skip anything that is plainly Pixieset chrome rather than page content.
    if (/cookie|consent|js-dom-cleanup|\.ca-[A-Za-z0-9]/.test(text)) return "";
    const remapped = text
      .replace(/'Quincy CF'\s*,?\s*(serif)?/g, "var(--font-display), Georgia, serif")
      .replace(/'Work Sans'\s*,?\s*(sans-serif)?/g, "var(--font-sans), system-ui, sans-serif");
    styles.push(leaksGlobally(remapped) ? scopeAuthorCss(remapped) : remapped);
    return "";
  });
  return { stripped, styles };
}

export function clean(html: string): string {
  // Pixieset's Instagram Graph block server-renders <img data-src="…cdninstagram…">
  // and swaps in the real src with its own script, using signed URLs that expire
  // within days. Without that integration the block can only ever show four
  // broken images, so it goes — the footer already links the Instagram profile.
  html = dropBlock(html || "", "block-instagram-graph");
  const { stripped, styles } = keepAuthorStyles(html || "");
  let out = stripped;
  for (const re of STRIP) out = out.replace(re, "");
  for (const re of STRIP_ATTRS) out = out.replace(re, "");
  // Collapse only the truly empty wrappers left behind by the strip above.
  // An empty <div> that still carries attributes is NOT decoration: Pixieset
  // uses them as sized elements — info__photo holds a background-image,
  // fb-block__block-sizer establishes the flex grid's row heights, and
  // photo-cover paints the image. Deleting those collapsed whole sections.
  out = out.replace(/<div>\s*<\/div>/gi, "");
  if (styles.length) out = `<style>${styles.join("\n")}</style>` + out;
  return out.trim();
}

/**
 * Imported images arrive with no alt text, no loading hints and no intrinsic
 * size. All three matter here:
 *
 *  - Descriptive alt text feeds image search, which is where a lot of a
 *    photographer's traffic comes from.
 *  - width/height let the browser reserve space before the file arrives.
 *    Without them, Pixieset's photo blocks (which size from the image's own
 *    aspect ratio) collapse to zero height — and a lazy image inside a
 *    zero-height box never scrolls into view, so it never loads at all.
 *    That deadlock left most of the Aworan gallery invisible. It also
 *    removes layout shift, which counts toward Core Web Vitals.
 *  - lazy/async decoding keeps image-heavy pages fast.
 */
const imageDims = imageDimsData as unknown as Record<string, [number, number]>;

export function enhanceImages(html: string, context: string): string {
  let n = 0;
  return (html || "").replace(/<img\b([^>]*)>/gi, (tag, attrs: string) => {
    n += 1;
    let a: string = attrs;

    const altMatch = /\salt="([^"]*)"/i.exec(a);
    const hasAlt = altMatch && altMatch[1].trim().length > 0;
    if (!hasAlt) {
      const label = n === 1 ? context : `${context} — photograph ${n}`;
      const safe = label.replace(/"/g, "&quot;");
      a = altMatch ? a.replace(/\salt="[^"]*"/i, ` alt="${safe}"`) : `${a} alt="${safe}"`;
    }

    // Reserve the box before the bytes arrive.
    const srcMatch = /\ssrc="([^"]+)"/i.exec(a);
    const dims = srcMatch ? imageDims[srcMatch[1]] : undefined;
    if (dims && !/\swidth=/i.test(a) && !/\sheight=/i.test(a)) {
      a += ` width="${dims[0]}" height="${dims[1]}"`;
    }

    // First image is usually above the fold; the rest can wait — but only
    // once the box is reserved, otherwise they never come into view.
    if (!/\sloading=/i.test(a)) {
      a += n === 1 ? ' loading="eager" fetchpriority="high"' : dims ? ' loading="lazy"' : ' loading="eager"';
    }
    if (!/\sdecoding=/i.test(a)) a += ' decoding="async"';
    return `<img${a}>`;
  });
}


/**
 * Three pages were duplicated inside Pixieset and kept their editor's "Copy"
 * suffix in the <title> — which is what Google is showing for them today.
 * The suffix is editing residue, not a choice, so it is trimmed; and the two
 * that duplicate a fuller page point their canonical at the original so the
 * ranking consolidates instead of splitting.
 */
const DUPLICATE_OF: Record<string, string> = {
  "/contact-copy/": "/contact/",
  "/monthly-master-class-copy-copy/": "/photography-masterclass/",
};

export function canonicalFor(path: string): string | undefined {
  const target = DUPLICATE_OF[path];
  return target ? `https://www.cameraboss.co.uk${target}` : undefined;
}

/** A near-empty duplicate should not compete in search. */
export function isThinDuplicate(path: string): boolean {
  return path === "/monthly-master-class-copy-copy/";
}

function tidyTitle(t: string): string {
  return (t || "").replace(/(\s+Copy)+\s*$/i, "").trim();
}

/**
 * Link repair for imported content.
 *
 * The Pixieset export contains links to slugs that were renamed, to routes
 * that never existed on this site (/home, /gallery, /pricing-UK), and a
 * number of literal `null` hrefs. Only high-confidence slug matches are
 * remapped — a city named in the source must appear in the target, so
 * "…-sheffield" is never silently pointed at a Leicester post. Anything
 * without a confident target is left to 404 rather than sent somewhere wrong.
 */
const LINK_FIXES: Record<string, string> = {
  "/blog/jumoke-dami-yoruba-wedding-edgbaston-hall-birmingham-december-2025": "/blog/jumoke-dami-yoruba-wedding-at-edgbaston-hall-birmingham-cameraboss",
  "/blog/nigerian-wedding-photographer-uk.": "/blog/nigerian-wedding-photography-in-the-uk",
  "/blog/how-to-choose-a-wedding-photographer-nigerian-african-couples-uk": "/blog/how-to-choose-a-wedding-photographer-as-a-nigerian-or-african-couple-in-the-uk",
  "/blog/how-to-hire-nigerian-wedding-photographer-uk": "/blog/how-to-hire-a-nigerian-wedding-photographer-in-the-uk",
  "/blog/yoruba-wedding-uk-complete-planning-guide": "/blog/yoruba-wedding-in-the-uk-your-complete-planning-guide",
  "/blog/nigerian-wedding-photographer-birmingham-yoruba-african-weddings-west-midlands-cameraboss": "/blog/nigerian-wedding-photographer-birmingham-yoruba-african-weddings-across-the-west-midlands",
  "/blog/nigerian-wedding-photographer-bristol-yoruba-african-weddings-south-west-cameraboss": "/blog/nigerian-wedding-photographer-bristol-yoruba-african-weddings-across-the-south-west",
  "/blog/nigerian-wedding-photographer-leicester": "/blog/nigerian-wedding-photographer-in-Leicester",
  "/blog/nigerian-wedding-photographer-liverpool-yoruba-african-weddings-merseyside-cameraboss": "/blog/nigerian-wedding-photographer-liverpool-yoruba-african-weddings-across-merseyside-cameraboss",
  "/blog/nottingham-wedding-venues-photographers-view": "/blog/nottingham-wedding-venues-a-photographers-view",
  "/blog/wedding-photography-costs-birmingham-2026": "/blog/wedding-photography-costs-in-birmingham-2026",
  "/blog/event-halls-leeds-weddings-receptions": "/blog/top-event-halls-in-leeds-for-weddings-and-receptions",
  // /client-area/ still answers with a 301 for links indexed under the old
  // structure, but in-content links go straight to the new route.
  "/client-area": "/galleries",
  "/home": "/",
  "/gallery": "/galleries",
  "/pricing-UK": "/pricing"
};

/**
 * Anchors Pixieset shipped with an empty href. The link text names the target
 * unambiguously, so they are restored rather than dropped — on the live site
 * these three are dead links.
 */
const EMPTY_HREF_TEXT: Array<[RegExp, string]> = [
  [/see my london work/i, "/London-wedding-photographer/"],
  [/see my leicester work/i, "/Leicester-Wedding-Photographer/"],
  [/see my manchester work/i, "/manchester-wedding-photographer/"],
];

export function fixLinks(html: string): string {
  let out = html || "";
  // Dead hrefs Pixieset emitted for unlinked elements
  out = out.replace(/href="null"/gi, 'href="#"').replace(/href="undefined"/gi, 'href="#"');

  // Pixieset's own template default, left behind on two pages.
  out = out.replace(/href="https?:\/\/(?:website|www)\.pixieset\.com\/contact\/?"/gi, 'href="/contact/"');
  // ...and again inside an escaped JSON payload in one custom-code block.
  out = out.split('https:\\/\\/website.pixieset.com\\/contact\\/').join('\\/contact\\/');

  for (const [from, to] of Object.entries(LINK_FIXES)) {
    const esc = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // `to` may already be "/" — appending another slash produced href="//",
    // which is a protocol-relative URL to an empty host and 404s everywhere.
    const dest = to.endsWith("/") ? to : to + "/";
    out = out.replace(new RegExp(`href="(?:https?://(?:www\\.)?cameraboss\\.co\\.uk)?${esc}/?"`, "gi"), `href="${dest}"`);
  }

  // Normalise absolute self-links to relative
  out = out.replace(/href="https?:\/\/(?:www\.)?cameraboss\.co\.uk\/?"/gi, 'href="/"');
  out = out.replace(/href="https?:\/\/(?:www\.)?cameraboss\.co\.uk\//gi, 'href="/');

  // Restore the empty-href anchors by their link text.
  out = out.replace(/<a\s([^>]*?)href=""([^>]*)>([\s\S]{0,120}?)<\/a>/gi, (m, pre, post, text) => {
    const plain = String(text).replace(/<[^>]+>/g, " ");
    for (const [re, dest] of EMPTY_HREF_TEXT) if (re.test(plain)) {
      return `<a ${pre}href="${dest}"${String(post).replace(/\starget="_blank"/i, "")}>${text}</a>`;
    }
    return `<span ${String(pre + post).replace(/\s(target|rel)="[^"]*"/gi, "")}>${text}</span>`;
  });

  // Defensive: never emit a protocol-relative link to an empty host.
  out = out.replace(/href="\/\/(?=["#?]|$)/g, 'href="/');
  return out;
}

/**
 * A blog post renders its title in the page header, but 107 of the 183 imported
 * bodies open with an <h1> of their own (the custom-code articles were written
 * as standalone documents). That gave every one of them two <h1>s — the same
 * headline printed twice on 52 of them.
 *
 * Where the body heading repeats the title it is dropped; where it says
 * something different it is demoted to <h2>, so the page keeps exactly one <h1>
 * and no wording is lost.
 */
function normHeading(t: string): string {
  return (t || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function dedupeHeadings(html: string, title: string): string {
  const want = normHeading(title);
  let first = true;
  return (html || "").replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi, (m, attrs = "", inner) => {
    const got = normHeading(inner);
    const same = first && want && (got === want || (got.length > 12 && (want.includes(got) || got.includes(want))));
    first = false;
    if (same) return "";
    return `<h2${attrs || ""}>${inner}</h2>`;
  });
}

export const posts: Post[] = (postsData as Post[])
  .map((p) => ({ ...p, html: enhanceImages(fixLinks(dedupeHeadings(clean(p.html), p.title)), p.title) }))
  .sort((a, b) => {
    const da = parseDate(a.date)?.getTime() ?? 0;
    const db = parseDate(b.date)?.getTime() ?? 0;
    return db - da;
  });

/**
 * Pixieset used <h1> for section headings inside flex blocks, so 21 imported
 * pages ship three to six of them. Keep the first — it is the hero heading —
 * and demote the rest to <h2>: same appearance, one primary heading per page.
 */
function demoteExtraH1s(html: string): string {
  let seen = 0;
  return (html || "").replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi, (m, attrs = "", inner) => {
    if (seen++ === 0) return m;
    return `<h2${attrs || ""}>${inner}</h2>`;
  });
}

/**
 * Pixieset left one page (/locations/) with an empty meta description, so it
 * shipped with none at all. Supplied here rather than edited into the imported
 * data, which is regenerated on every re-import.
 */
const META_FALLBACK: Record<string, string> = {
  "/locations/":
    "Wedding photography across the UK — London, Birmingham, Leicester, Manchester, Sheffield, Nottingham, Derby, Leeds, Liverpool, Newcastle and beyond. See every city CameraBoss covers, and travel for destination weddings.",
};

export const pages: Page[] = (pagesData as Page[]).map((p) => ({
  ...p,
  meta_description: p.meta_description?.trim() || META_FALLBACK[p.path] || "",
  title: tidyTitle(p.title),
  html: enhanceImages(fixLinks(demoteExtraH1s(clean(p.html))), p.h1 || tidyTitle(p.title).split("|")[0].trim()),
}));
export const galleries: GalleryMeta[] = galleriesData as GalleryMeta[];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

/** First image in the body, used as a card thumbnail when og_image is missing. */
export function firstImage(html: string): string | null {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || "");
  return m ? m[1] : null;
}

export function thumbFor(p: Post): string | null {
  return p.og_image || firstImage(p.html);
}

/** Plain-text excerpt from the post body. */
export function excerpt(p: Post, len = 155): string {
  if (p.meta_description) return p.meta_description.slice(0, len);
  const txt = (p.html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return txt.slice(0, len);
}

/** Related posts, cheaply scored on shared title words. */
export function related(p: Post, n = 3): Post[] {
  const stop = new Set(["the","and","for","with","your","from","this","that","what","how","why","are","you","a","an","in","of","to","on","at","is","it","be","as"]);
  const words = (t: string) =>
    new Set(t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !stop.has(w)));
  const target = words(p.title);
  return posts
    .filter((o) => o.slug !== p.slug)
    .map((o) => {
      const w = words(o.title);
      let score = 0;
      target.forEach((t) => { if (w.has(t)) score++; });
      return { o, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.o);
}
