"""Repair two confirmed live/source prose drifts from saved public snapshots.

The wedding page images are mapped to the variants already uploaded to the
Supabase blog bucket; no storage is changed. Re-running this is deterministic.
"""

import collections
import html
import json
import pathlib
import re
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
SNAPSHOTS = pathlib.Path("/private/tmp")
BLOG_PREFIX = "https://htwwyqfattodfaybqgev.supabase.co/storage/v1/object/public/blog/"
PIXIESET = re.compile(r"https://(?:images-pw|assets-pw)\.pixieset\.com/[^\"'<>\s)]+", re.I)
FILM_SLUG = "grain-warmth-the-feeling-you-cannot-fake-why-35mm-film-is-having-a-renaissance-at-uk-weddings-in-2026-cameraboss"


def source_body(source):
    start = re.search(r'<div\s+role="main"\s+class="main-body"[^>]*>', source, re.I)
    if not start:
        raise ValueError("Live page has no main body")
    depth = 1
    for tag in re.finditer(r"</?div\b[^>]*>", source[start.end():], re.I):
        depth += -1 if tag.group().lower().startswith("</") else 1
        if depth == 0:
            return source[start.end():start.end() + tag.start()]
    raise ValueError("Unclosed main body")


def stem_parts(url):
    stem = pathlib.PurePosixPath(urllib.parse.urlparse(url).path).stem
    stem = re.sub(r"^[0-9a-f]{8}_", "", stem, flags=re.I)
    base = re.sub(r"-[0-9a-f]{8}(?:-(?:300|500|1000|1500|2500))?$", "", stem, flags=re.I)
    size = re.search(r"-(300|500|1000|1500|2500)$", stem)
    return base, size.group(1) if size else ""


def map_existing_images(body, old_html):
    existing = set(re.findall(re.escape(BLOG_PREFIX) + r'[^\"\s<>]+', old_html))
    catalog = collections.defaultdict(list)
    for url in existing:
        catalog[stem_parts(url)[0]].append(url)
    replacements = {}
    for url in set(PIXIESET.findall(body)):
        base, size = stem_parts(url)
        candidates = catalog[base]
        if not candidates:
            raise ValueError(f"No previously hosted image for {url}")
        same_size = [candidate for candidate in candidates if stem_parts(candidate)[1] == size]
        replacements[url] = sorted(same_size or candidates)[0]
    for original, hosted in replacements.items():
        body = body.replace(original, hosted)
    if PIXIESET.search(body):
        raise ValueError("An unmapped Pixieset asset remains")
    return body, len(replacements)


def metadata(source):
    title = re.search(r"<title>(.*?)</title>", source, re.I | re.S)
    desc = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', source, re.I)
    if not title or not desc:
        raise ValueError("Title or description missing")
    return html.unescape(title.group(1).strip()), html.unescape(desc.group(1))


def remove_client_gallery(source):
    """The old post embeds a 12-card client-gallery widget, now retired."""
    opening = re.search(r'<div\b[^>]*class="[^"]*\bblock-client-gallery\b[^"]*"[^>]*>', source, re.I)
    if not opening:
        raise ValueError("Expected embedded client gallery missing")
    depth = 1
    for tag in re.finditer(r"</?div\b[^>]*>", source[opening.end():], re.I):
        depth += -1 if tag.group().lower().startswith("</") else 1
        if depth == 0:
            return source[:opening.start()] + source[opening.end() + tag.end():]
    raise ValueError("Embedded client gallery did not close")


posts_path = ROOT / "src/data/posts.json"
pages_path = ROOT / "src/data/pages.json"
seo_path = ROOT / "src/data/seo-baseline.json"
posts = json.loads(posts_path.read_text())
pages = json.loads(pages_path.read_text())
seo = json.loads(seo_path.read_text())

film = next(post for post in posts if post["slug"] == FILM_SLUG)
film_source = (SNAPSHOTS / f"drift-blog-{FILM_SLUG}.html").read_text()
film_body = source_body(film_source)
if len(re.sub(r"<[^>]+>", " ", film_body).split()) < 500:
    raise ValueError("Film article source is implausibly short")
if re.search(r"<img\b", film_body, re.I):
    raise ValueError("Film article unexpectedly contains images")
film["html"] = film_body
film["meta_title"], film["meta_description"] = metadata(film_source)
film["title"] = film["meta_title"]
film["internal_links"] = [html.unescape(value) for value in re.findall(r'<a\b[^>]*href="([^"]+)"', film_body, re.I)]
seo[f"/blog/{FILM_SLUG}/"] = {"title": film["meta_title"], "description": film["meta_description"]}

wedding = next(page for page in pages if page["path"] == "/weddings/")
wedding_source = (SNAPSHOTS / "drift-weddings.html").read_text()
wedding_body, mapped = map_existing_images(source_body(wedding_source), wedding["html"])
if mapped < 80:
    raise ValueError(f"Only {mapped} wedding image variants mapped")
wedding["html"] = wedding_body
wedding["title"], wedding["meta_description"] = metadata(wedding_source)
seo["/weddings/"] = {"title": wedding["title"], "description": wedding["meta_description"]}

att = next(post for post in posts if post["slug"] == "pre-wedding-at-attingham-park")
att_source = (SNAPSHOTS / "drift-blog-pre-wedding-at-attingham-park.html").read_text()
att_body, att_mapped = map_existing_images(source_body(att_source), att["html"])
if att_mapped < 20:
    raise ValueError(f"Only {att_mapped} Attingham Park image variants mapped")
att_body = remove_client_gallery(att_body)
if re.search(r'<img\b[^>]*src="//images\.pixieset\.com', att_body, re.I):
    raise ValueError("A Pixieset client cover still appears in the post")
att["html"] = att_body
att["meta_title"], att["meta_description"] = metadata(att_source)
att["title"] = att["meta_title"]
att["internal_links"] = [html.unescape(value) for value in re.findall(r'<a\b[^>]*href="([^"]+)"', att_body, re.I)]
seo["/blog/pre-wedding-at-attingham-park/"] = {"title": att["meta_title"], "description": att["meta_description"]}

posts_path.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n")
pages_path.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + "\n")
seo_path.write_text(json.dumps(seo, ensure_ascii=False, indent=2) + "\n")
print("Repaired film article, Attingham Park post and weddings page; mapped", mapped + att_mapped, "existing image variants")
