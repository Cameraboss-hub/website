"""Apply audited live-page snapshots using existing hosted image variants."""

import collections
import html
import json
import pathlib
import re
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
SNAPSHOTS = pathlib.Path("/private/tmp/cameraboss-drift-pages")
PREFIX = "https://htwwyqfattodfaybqgev.supabase.co/storage/v1/object/public/blog/"
PIX = re.compile(r"https://(?:images-pw|assets-pw)\.pixieset\.com/[^\"'<>\s)]+", re.I)
page_path = ROOT / "src/data/pages.json"
seo_path = ROOT / "src/data/seo-baseline.json"
pages = json.loads(page_path.read_text())
seo = json.loads(seo_path.read_text())
plan = json.loads((ROOT / "audit/live-page-sync-plan-2026-09-30.json").read_text())
covers = json.loads((ROOT / "audit/live-post-cover-map-2026-09-29.json").read_text())


def parts(url):
    stem = pathlib.PurePosixPath(urllib.parse.urlparse(url).path).stem
    stem = re.sub(r"^[0-9a-f]{8}_", "", stem, flags=re.I)
    base = re.sub(r"-[0-9a-f]{8}(?:-(?:300|500|1000|1500|2500))?$", "", stem, flags=re.I)
    size = re.search(r"-(300|500|1000|1500|2500)$", stem)
    return base, size.group(1) if size else ""


catalog = collections.defaultdict(list)
for file in ["src/data/posts.json", "src/data/pages.json", "src/data/client-area.json"]:
    for url in set(re.findall(re.escape(PREFIX) + r'[^\"\s<>]+', (ROOT / file).read_text())):
        catalog[parts(url)[0]].append(url)

local_covers = {
    "BestUKWeddingPhotographyLocationsANigerianWeddingPhotographersCityGuide": covers["best-uk-wedding-photography-locations"],
    "BristolWeddingVenuesAPhotographersGuidetotheBestEventHalls": covers["best-wedding-venues-event-halls-bristol"],
    "NigerianWeddingPhotographerinSheffieldAPhotographersGuide": covers["nigerian-wedding-photographer-sheffield"],
}
for cover in local_covers.values():
    if not (ROOT / "public" / cover.lstrip("/")).is_file():
        raise ValueError(f"Local blog cover missing: {cover}")


def replacement(url, existing):
    base, size = parts(url)
    if base in local_covers:
        return local_covers[base]
    candidates = [candidate for candidate in existing if parts(candidate)[0] == base]
    candidates = candidates or catalog[base]
    if not candidates:
        raise ValueError(f"No hosted replacement for {url}")
    same_size = [candidate for candidate in candidates if parts(candidate)[1] == size]
    return sorted(same_size or candidates)[0]


def main_body(source):
    start = re.search(r'<div\s+role="main"\s+class="main-body"[^>]*>', source, re.I)
    if not start:
        raise ValueError("Missing main body")
    depth = 1
    for tag in re.finditer(r"</?div\b[^>]*>", source[start.end():], re.I):
        depth += -1 if tag.group().lower().startswith("</") else 1
        if depth == 0:
            return source[start.end():start.end() + tag.start()]
    raise ValueError("Unclosed main body")


report = []
for item in plan:
    path = item["path"]
    page = next(page for page in pages if page["path"] == path)
    source = (SNAPSHOTS / (path.strip("/") + ".html")).read_text()
    body = main_body(source)
    current = set(re.findall(re.escape(PREFIX) + r'[^\"\s<>]+', page["html"]))
    urls = set(PIX.findall(body))
    for url in urls:
        body = body.replace(url, replacement(url, current))
    if PIX.search(body):
        raise ValueError(f"Pixieset assets remain in {path}")
    title = re.search(r"<title>(.*?)</title>", source, re.I | re.S)
    desc = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', source, re.I)
    if not title or not desc:
        raise ValueError(f"Missing metadata in {path}")
    page["html"] = body
    page["title"] = html.unescape(title.group(1).strip())
    page["meta_description"] = html.unescape(desc.group(1))
    seo[path] = {"title": page["title"], "description": page["meta_description"]}
    og = re.search(r'<meta\s+property="og:image"\s+content="([^"]+)"', source, re.I)
    if og and PIX.fullmatch(og.group(1)):
        page["og_image"] = replacement(og.group(1), current)
    report.append({"path": path, "mapped_image_variants": len(urls),
                   "blocks": item["blocks"], "title": page["title"]})

page_path.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + "\n")
seo_path.write_text(json.dumps(seo, ensure_ascii=False, indent=2) + "\n")
(ROOT / "audit/live-page-sync-applied-2026-09-30.json").write_text(json.dumps(report, indent=2) + "\n")
print("Updated", len(report), "live pages; mapped", sum(x["mapped_image_variants"] for x in report), "image variants")
