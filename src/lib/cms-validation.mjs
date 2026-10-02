import sanitizeHtml from 'sanitize-html';

const plain = (value, label, maximum) => {
  if (typeof value !== 'string' || value.length > maximum || /[<>\u0000-\u0008]/.test(value)) {
    throw new Error(`CMS: invalid ${label}`);
  }
  return value.trim();
};

/** Route identity comes from the owner-managed registry, never an editor field. */
export function validateSeoEntries(entries, routes) {
  /** @type {Record<string, {title: string, description: string}>} */
  const result = {};
  for (const [filename, record] of Object.entries(entries)) {
    const id = filename.split('/').pop().replace(/\.json$/, '');
    const path = routes[id];
    if (!path || record.path !== path) throw new Error(`CMS: SEO route changed or unknown: ${id}`);
    const title = plain(record.title, `SEO title for ${path}`, 300);
    const description = plain(record.description, `description for ${path}`, 600);
    if (!title) throw new Error(`CMS: SEO title is required for ${path}`);
    if (/HERO IMAGE ALT TEXT|og:description|verified by QA/i.test(description)) {
      throw new Error(`CMS: editorial notes in description for ${path}`);
    }
    result[path] = { title, description };
  }
  for (const path of Object.values(routes)) {
    if (!result[path]) throw new Error(`CMS: protected SEO record missing for ${path}`);
  }
  return result;
}

/** Only new articles are edited here; imported article bodies remain intact. */
export function validatePostEntries(entries, archiveSlugs) {
  const result = [];
  const existing = new Set(archiveSlugs);
  for (const [filename, record] of Object.entries(entries)) {
    const slug = filename.split('/').pop().replace(/\.json$/, '');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 180 || existing.has(slug)) {
      throw new Error(`CMS: invalid or conflicting blog URL: ${slug}`);
    }
    if (typeof record.published !== 'boolean') throw new Error(`CMS: publication status missing for ${slug}`);
    if (!record.published) continue;
    const title = plain(record.title, `article title for ${slug}`, 300);
    const meta_title = plain(record.meta_title || title, `article SEO title for ${slug}`, 300);
    const meta_description = plain(record.meta_description, `article description for ${slug}`, 600);
    if (!title || !meta_description) throw new Error(`CMS: title and description required for ${slug}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date || '')) throw new Error(`CMS: date required for ${slug}`);
    const date = new Date(`${record.date}T12:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== record.date) throw new Error(`CMS: invalid date for ${slug}`);
    const og_image = plain(record.og_image || '', `cover image for ${slug}`, 1000);
    if (og_image && !/^(?:\/images\/|https:\/\/)/.test(og_image)) throw new Error(`CMS: invalid image URL for ${slug}`);
    if (typeof record.html !== 'string' || record.html.length > 500000) throw new Error(`CMS: article body missing or too large for ${slug}`);
    const html = sanitizeHtml(record.html, {
      allowedTags: ['p','h2','h3','h4','br','hr','strong','em','u','s','blockquote','ul','ol','li','a','img','figure','figcaption','table','thead','tbody','tr','th','td','span'],
      allowedAttributes: { a:['href','title'], img:['src','alt','width','height','loading','decoding'], th:['colspan','rowspan'], td:['colspan','rowspan'] },
      allowedSchemes: ['https','http','mailto','tel'], allowProtocolRelative: false,
      transformTags: { img: sanitizeHtml.simpleTransform('img', { loading:'lazy', decoding:'async' }) },
    });
    if (!html.replace(/<[^>]*>/g, '').trim()) throw new Error(`CMS: article body is empty for ${slug}`);
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    result.push({ slug,title,meta_title,meta_description,og_image,
      date:`${date.getUTCDate()} ${months[date.getUTCMonth()]}, ${date.getUTCFullYear()}`,
      original_url:`https://www.cameraboss.co.uk/blog/${slug}/`,html:`<div class="seo-article">${html}</div>`,
      internal_links:[...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>m[1]),
    });
    existing.add(slug);
  }
  return result;
}
