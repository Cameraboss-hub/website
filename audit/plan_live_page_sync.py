"""Snapshot changed Pixieset pages and check whether their images are hosted."""

import collections
import concurrent.futures
import json
import pathlib
import re
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
SNAPSHOTS = pathlib.Path("/private/tmp/cameraboss-drift-pages")
SNAPSHOTS.mkdir(exist_ok=True)
PREFIX = "https://htwwyqfattodfaybqgev.supabase.co/storage/v1/object/public/blog/"
PIX = re.compile(r"https://(?:images-pw|assets-pw)\.pixieset\.com/[^\"'<>\s)]+", re.I)
SKIP = {"/blog/", "/client-area/", "/gallery-a/", "/Wedding-videos/", "/weddings/"}
routes = [row["path"] for row in json.loads((ROOT / "audit/editorial-text-parity-2026-09-30.json").read_text())["records"]
          if row["kind"] == "page" and not row.get("matches") and row["path"] not in SKIP]
pages = {row["path"]: row for row in json.loads((ROOT / "src/data/pages.json").read_text())}


def parts(url):
    stem = pathlib.PurePosixPath(urllib.parse.urlparse(url).path).stem
    stem = re.sub(r"^[0-9a-f]{8}_", "", stem, flags=re.I)
    base = re.sub(r"-[0-9a-f]{8}(?:-(?:300|500|1000|1500|2500))?$", "", stem, flags=re.I)
    size = re.search(r"-(300|500|1000|1500|2500)$", stem)
    return base, size.group(1) if size else ""


catalog = collections.defaultdict(list)
for source in ["src/data/posts.json", "src/data/pages.json", "src/data/client-area.json"]:
    text = (ROOT / source).read_text()
    for url in set(re.findall(re.escape(PREFIX) + r'[^\"\s<>]+', text)):
        catalog[parts(url)[0]].append(url)


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


def inspect(path):
    req = urllib.request.Request("https://www.cameraboss.co.uk" + path,
                                 headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        source = response.read().decode("utf-8", "replace")
    (SNAPSHOTS / (path.strip("/") + ".html")).write_text(source)
    body = main_body(source)
    urls = set(PIX.findall(body))
    missing = sorted({parts(url)[0] for url in urls if parts(url)[0] not in catalog})
    title = re.search(r"<title>(.*?)</title>", source, re.I | re.S)
    return {"path": path, "image_variants": len(urls), "unmapped": missing,
            "title_changed": title.group(1).strip() != pages[path]["title"] if title else None,
            "blocks": len(set(re.findall(r'id="block-container-[^"]+"', body)))}


with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records = list(pool.map(inspect, routes))
(ROOT / "audit/live-page-sync-plan-2026-09-30.json").write_text(json.dumps(records, indent=2) + "\n")
for row in records:
    print(row["path"], row["image_variants"], "images,", len(row["unmapped"]),
          "unmapped,", row["blocks"], "blocks; title changed:", row["title_changed"])
    if row["unmapped"]:
        print("  missing:", ", ".join(row["unmapped"][:10]))
