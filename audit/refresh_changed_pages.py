"""Import the three changed live Pixieset pages from audited HTML snapshots.

Every Pixieset image variant is mapped to an already-hosted Supabase blog
object with the same source filename, so the result has no Pixieset image
dependency. No external service is mutated.
"""

import collections
import datetime
import html
import json
import pathlib
import re
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
SNAPSHOTS = pathlib.Path("/private/tmp/cameraboss-changed-pages")
PATHS = ["/contact-copy/", "/Lonodon-wedding-photographer/", "/monthly-master-class-copy-copy/"]
STORAGE = "https://htwwyqfattodfaybqgev.supabase.co/storage/v1/object/public/blog/"
PIXIESET_ASSET = re.compile(r"https://(?:images-pw|assets-pw)\.pixieset\.com/[^\"'<>\s)]+", re.I)

pages_path = ROOT / "src/data/pages.json"
seo_path = ROOT / "src/data/seo-baseline.json"
pages = json.loads(pages_path.read_text())
seo = json.loads(seo_path.read_text())

catalog = collections.defaultdict(list)
for source in (ROOT / "src/data/posts.json", pages_path, ROOT / "src/data/client-area.json"):
    for url in set(re.findall(re.escape(STORAGE) + r"[^\\\"\s<>]+", source.read_text())):
        stem = pathlib.PurePosixPath(urllib.parse.urlparse(url).path).stem
        catalog[stem.split("_", 1)[-1]].append(url)

def main_body(source: str) -> str:
    start = re.search(r'<div\s+role="main"\s+class="main-body"[^>]*>', source, re.I)
    if not start:
        raise ValueError("Live page main body missing")
    depth = 1
    for tag in re.finditer(r"</?div\b[^>]*>", source[start.end():], re.I):
        depth += -1 if tag.group().lower().startswith("</") else 1
        if depth == 0:
            body = source[start.end():start.end() + tag.start()]
            if len(body) < 2000:
                raise ValueError("Live page body implausibly short")
            return body
    raise ValueError("Live page main body does not close")

def mapped(url: str, old_html: str) -> str:
    stem = pathlib.PurePosixPath(urllib.parse.urlparse(url).path).stem
    candidates = sorted(set(catalog[stem]))
    if not candidates:
        raise ValueError(f"No hosted image for {url}")
    old_candidates = [candidate for candidate in candidates if candidate in old_html]
    return old_candidates[0] if old_candidates else candidates[0]

report = []
for path in PATHS:
    page = next(page for page in pages if page["path"] == path)
    source = (SNAPSHOTS / (path.strip("/") + ".html")).read_text()
    title = html.unescape(re.search(r"<title>(.*?)</title>", source, re.I | re.S).group(1).strip())
    description_match = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', source, re.I)
    description = html.unescape(description_match.group(1)) if description_match else ""
    original = page["html"]
    body = main_body(source)
    assets = set(PIXIESET_ASSET.findall(body))
    replacements = {url: mapped(url, original) for url in assets}
    for from_url, to_url in replacements.items():
        body = body.replace(from_url, to_url)
    if PIXIESET_ASSET.search(body):
        raise ValueError(f"Pixieset image URL remains in {path}")
    cover = re.search(r'<meta\s+property="og:image"\s+content="([^"]+)"', source, re.I)
    if cover and PIXIESET_ASSET.fullmatch(cover.group(1)):
        page["og_image"] = mapped(cover.group(1), original)
    page["html"] = body
    page["title"] = title
    page["meta_description"] = description
    seo[path] = {"title": title, "description": description}
    report.append({"path": path, "source_blocks": len(set(re.findall(r'id="block-container-[^"]+"', body))), "mapped_image_urls": len(replacements), "title": title})

pages_path.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + "\n")
seo_path.write_text(json.dumps(seo, ensure_ascii=False, indent=2) + "\n")
(ROOT / "audit/live-page-refresh-2026-09-29.json").write_text(json.dumps({"at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "pages": report}, indent=2) + "\n")
for entry in report:
    print(entry["path"], entry["source_blocks"], "blocks,", entry["mapped_image_urls"], "hosted image variants")
