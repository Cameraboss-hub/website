"""Compare live Pixieset prose, excluding its changing recent-posts widget."""

from __future__ import annotations

import concurrent.futures
import datetime
import difflib
import html
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
POSTS = json.loads((ROOT / "src/data/posts.json").read_text())
PAGES = json.loads((ROOT / "src/data/pages.json").read_text())
EXPECTED_DIFFERENCES = {
    "/blog/": "Blog listing is a redesigned page with current post cards.",
    "/client-area/": "Full client index was replaced by a curated portfolio.",
    "/Wedding-videos/": "The dedicated video page does not copy Pixieset widgets.",
    "/blog/pre-wedding-at-attingham-park/": "Retired the embedded client-gallery widget; article prose is retained.",
    "/blog/a-timeless-celebration-at-borough-hall-greenwich-ionie-pauls-wedding/": "Two adjacent source anchor text nodes split words in the plain-text extractor.",
    "/blog/camila-and-will-wedding-at-the-priest-house-hotel/": "Adjacent source anchor text nodes split a word in the plain-text extractor.",
    "/blog/top-wedding-venues-in-luton-where-love-meets-unforgettable-backdrops/": "Two adjacent source anchor text nodes split words in the plain-text extractor.",
    "/blog/nigerian-wedding-photographer-bristol-yoruba-african-weddings-across-the-south-west/": "Replaced a dead Clifton Pavilion link and its text with Bristol City Council's current venue list.",
}


def drop_recent_posts(source: str) -> str:
    opening = re.compile(r'<div\b[^>]*class="[^"]*\b(?:block-recent-posts|block-custom-blog-feed)\b[^"]*"[^>]*>', re.I)
    for _ in range(20):
        match = opening.search(source)
        if not match:
            break
        depth = 1
        for tag in re.finditer(r"</?div\b[^>]*>", source[match.end():], re.I):
            depth += -1 if tag.group().lower().startswith("</") else 1
            if depth == 0:
                source = source[:match.start()] + source[match.end() + tag.end():]
                break
        else:
            raise ValueError("Unclosed recent-posts widget")
    return source


def main_body(source: str) -> str:
    start = re.search(r'<div\s+role="main"\s+class="main-body"[^>]*>', source, re.I)
    if not start:
        raise ValueError("Missing main body")
    depth = 1
    for tag in re.finditer(r"</?div\b[^>]*>", source[start.end():], re.I):
        depth += -1 if tag.group().lower().startswith("</") else 1
        if depth == 0:
            return source[start.end():start.end() + tag.start()]
    raise ValueError("Unclosed main body")


def visible(source: str) -> str:
    source = drop_recent_posts(source)
    source = re.sub(r"<(?:script|style|title)\b[^>]*>[\s\S]*?</(?:script|style|title)>", " ", source, flags=re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", source))).strip()


def inspect(item: tuple[str, str]) -> dict:
    kind, path = item
    data = next(row for row in (POSTS if kind == "post" else PAGES)
                if (f"/blog/{row['slug']}/" if kind == "post" else row["path"]) == path)
    req = urllib.request.Request("https://www.cameraboss.co.uk" + path,
                                 headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            live = visible(main_body(response.read().decode("utf-8", "replace")))
        local = visible(data["html"].split('<div role="footer">', 1)[0])
        matcher = difflib.SequenceMatcher(None, live, local)
        return {"kind": kind, "path": path, "matches": live == local,
                "ratio": round(matcher.quick_ratio(), 4),
                "live_chars": len(live), "local_chars": len(local),
                "expected_difference": EXPECTED_DIFFERENCES.get(path) if live != local else None}
    except Exception as error:
        return {"kind": kind, "path": path, "error": str(error)}


targets = [("post", f"/blog/{post['slug']}/") for post in POSTS]
targets += [("page", page["path"]) for page in PAGES]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    records = list(pool.map(inspect, targets))
result = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
          "source": "https://www.cameraboss.co.uk", "records": records}
(ROOT / "audit/editorial-text-parity-2026-09-30.json").write_text(
    json.dumps(result, indent=2, ensure_ascii=False) + "\n")
changed = [row for row in records if not row.get("matches")]
unexpected = [row for row in changed if not row.get("expected_difference")]
print(f"Checked {len(records)} routes; {len(records)-len(changed)} exact after widget exclusion; {len(changed)-len(unexpected)} explained differences; {len(unexpected)} unexpected drift/errors")
for row in changed:
    print(row["kind"], row["path"], row.get("ratio", "error"),
          row.get("live_chars"), row.get("local_chars"), row.get("expected_difference") or row.get("error", ""))
