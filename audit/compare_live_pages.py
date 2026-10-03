"""Read-only comparison of Pixieset page blocks with the imported pages."""

import concurrent.futures
import datetime
import html
import json
import pathlib
import re
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
PAGES = json.loads((ROOT / "src/data/pages.json").read_text())
BLOCK = re.compile(r'id="(block-container-[^"]+)"')

def visible_text(source):
    stripped = re.sub(r"<(?:script|style)\b[^>]*>[\s\S]*?</(?:script|style)>", " ", source, flags=re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", stripped))).strip()

def main_body(source):
    start = re.search(r'<div\s+role="main"\s+class="main-body"[^>]*>', source, re.I)
    if not start:
        raise ValueError("Live page has no main body")
    depth = 1
    for tag in re.finditer(r"</?div\b[^>]*>", source[start.end():], re.I):
        depth += -1 if tag.group().lower().startswith("</") else 1
        if depth == 0:
            return source[start.end():start.end() + tag.start()]
    raise ValueError("Live page main body does not close")

def inspect(page):
    path = page["path"]
    req = urllib.request.Request("https://www.cameraboss.co.uk" + path, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            source = response.read().decode("utf-8", "replace")
            status = response.status
    except Exception as error:
        return {"path": path, "error": str(error)}
    try:
        live_main = main_body(source)
        current = set(BLOCK.findall(live_main))
    except ValueError as error:
        return {"path": path, "error": str(error)}
    # Earlier imports sometimes included the Pixieset footer after the main
    # body; that footer is removed at render time and is not page content.
    local_main = page["html"].split('<div role="footer">', 1)[0]
    imported = set(BLOCK.findall(local_main))
    title_match = re.search(r"<title>(.*?)</title>", source, re.I | re.S)
    title = html.unescape(re.sub(r"\s+", " ", title_match.group(1)).strip()) if title_match else ""
    return {
        "path": path,
        "status": status,
        "live_title": title,
        "local_title": page["title"],
        "local_blocks": len(imported),
        "live_blocks": len(current),
        "missing_local_blocks": sorted(current - imported),
        "removed_live_blocks": sorted(imported - current),
        "visible_text_matches": visible_text(live_main) == visible_text(local_main),
        "live_text_chars": len(visible_text(live_main)),
        "local_text_chars": len(visible_text(local_main)),
    }

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records = list(pool.map(inspect, PAGES))
report = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": "https://www.cameraboss.co.uk", "pages": records}
target = ROOT / "audit/live-page-blocks-2026-09-29.json"
target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
for row in records:
    print(row["path"], "error" if row.get("error") else f"+{len(row['missing_local_blocks'])} -{len(row['removed_live_blocks'])} text={row['visible_text_matches']}", row.get("error", ""))
