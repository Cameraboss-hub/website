"""Fetch a fresh public source inventory without modifying website content.

The dated snapshots and report preserve the previous audit evidence. Run again
after applying an inspected update to prove source parity.
"""
import concurrent.futures
import datetime
import difflib
import hashlib
import html
import json
import pathlib
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
STAMP = "2026-10-02"
OUT = pathlib.Path("/private/tmp/cameraboss-final-live-" + STAMP)
OUT.mkdir(exist_ok=True)
SITE = "https://www.cameraboss.co.uk"
posts = json.loads((ROOT / "src/data/posts.json").read_text())
pages = json.loads((ROOT / "src/data/pages.json").read_text())
seo = json.loads((ROOT / "src/data/seo-baseline.json").read_text())
rows = {p["path"]: ("page", p) for p in pages}
rows.update({f"/blog/{p['slug']}/": ("post", p) for p in posts})

def fetch(path):
    request = urllib.request.Request(SITE + path, headers={"User-Agent": "Mozilla/5.0 (CameraBoss owner requested content verification)"})
    try:
        with urllib.request.urlopen(request, timeout=35) as response:
            return response.status, response.url, response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, error.url, ""

def main_body(source):
    start = re.search(r'<div\s+role="main"\s+class="main-body"[^>]*>', source, re.I)
    if not start:
        raise ValueError("Missing Pixieset main body")
    depth = 1
    for tag in re.finditer(r"</?div\b[^>]*>", source[start.end():], re.I):
        depth += -1 if tag.group().lower().startswith("</") else 1
        if depth == 0:
            return source[start.end():start.end() + tag.start()]
    raise ValueError("Unclosed source main body")

def visible(source):
    for _ in range(30):
        opening = re.search(r'<div\b[^>]*class="[^"]*\b(?:block-recent-posts|block-custom-blog-feed|block-client-gallery)\b[^"]*"[^>]*>', source, re.I)
        if not opening:
            break
        depth = 1
        for tag in re.finditer(r"</?div\b[^>]*>", source[opening.end():], re.I):
            depth += -1 if tag.group().lower().startswith("</") else 1
            if depth == 0:
                source = source[:opening.start()] + source[opening.end() + tag.end():]
                break
        else:
            raise ValueError("Unclosed dynamic source widget")
    source = re.sub(r"<(?:script|style|title)\b[^>]*>[\s\S]*?</(?:script|style|title)>", " ", source, flags=re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", source))).strip()

def asset_key(url):
    stem = pathlib.PurePosixPath(urllib.parse.urlparse(html.unescape(url)).path).stem
    stem = re.sub(r"^[0-9a-f]{8}_", "", stem, flags=re.I)
    return re.sub(r"-[0-9a-f]{8}(?:-(?:300|500|1000|1500|2500))?$", "", stem, flags=re.I)

known_assets = {asset_key(url) for p in posts + pages for url in re.findall(r'https://htwwyqfattodfaybqgev\.supabase\.co/[^\"\s<>]+', p["html"])}

def inspect(path):
    try:
        status, final_url, source = fetch(path)
        snapshot = hashlib.sha256(path.encode()).hexdigest() + ".html"
        (OUT / snapshot).write_text(source)
        if status != 200:
            return {"path": path, "status": status, "final_url": final_url}
        body = main_body(source)
        title = re.search(r"<title>(.*?)</title>", source, re.I | re.S)
        desc = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', source, re.I)
        live_title = html.unescape(title.group(1).strip()) if title else ""
        live_desc = html.unescape(desc.group(1)) if desc else ""
        live = visible(body)
        kind, row = rows.get(path, ("new", None))
        local = visible(row["html"].split('<div role="footer">', 1)[0]) if row else ""
        saved = seo.get(path, {})
        images = sorted(set(re.findall(r'https://(?:images-pw|assets-pw)\.pixieset\.com/[^\"\s<>]+', body)))
        unmatched = sorted({asset_key(url) for url in images if asset_key(url) not in known_assets})
        links = sorted(set(html.unescape(x) for x in re.findall(r'<a\b[^>]*href="([^"]+)"', body, re.I)))
        return {"path": path, "kind": kind, "status": status, "final_url": final_url, "snapshot": snapshot,
                "title": live_title, "description": live_desc,
                "title_changed": live_title != saved.get("title"), "description_changed": live_desc != saved.get("description"),
                "text_matches": live == local, "text_similarity": round(difflib.SequenceMatcher(None, live, local).quick_ratio(), 5),
                "live_chars": len(live), "local_chars": len(local), "image_variants": len(images),
                "unmapped_image_keys": unmatched, "links": links,
                "changes": [line[:220] for line in difflib.unified_diff(live.split(". "), local.split(". "), n=0) if line.startswith(("+", "-"))][:12] if live != local else []}
    except Exception as error:
        return {"path": path, "error": str(error)}

status, _, sitemap = fetch("/sitemap.xml")
if status != 200:
    raise SystemExit("Source sitemap is unavailable")
(OUT / "sitemap.xml").write_text(sitemap)
urls = [e.text for e in ET.fromstring(sitemap).iter() if e.tag.endswith("}loc") and e.text]
source_paths = {urllib.parse.urlparse(url).path for url in urls if urllib.parse.urlparse(url).hostname in {"cameraboss.co.uk", "www.cameraboss.co.uk"}}
targets = sorted(set(rows) | source_paths | {"/"})
records = []
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for record in pool.map(inspect, targets):
        records.append(record)
        if len(records) % 40 == 0:
            print("Fetched", len(records), "of", len(targets), flush=True)
result = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": SITE,
          "snapshot_directory": str(OUT), "sitemap_paths": sorted(source_paths), "records": records}
(ROOT / f"audit/live-refresh-{STAMP}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
changed = [r for r in records if r.get("status") != 200 or r.get("kind") == "new" or not r.get("text_matches") or r.get("title_changed") or r.get("description_changed")]
print("Source sitemap", len(source_paths), "paths; checked", len(records), "; differences/errors", len(changed))
for r in changed:
    print(json.dumps({k:r.get(k) for k in ["path","kind","status","text_similarity","title_changed","description_changed","error"]}))
