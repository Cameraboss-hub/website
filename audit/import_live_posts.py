"""Import the eight public posts missing from the 29 September live-site audit.

Uses downloaded HTML snapshots and an explicit image map. It never contacts
Pixieset or overwrites an existing post. Re-running it is safe.
"""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "src/data/posts.json"
MISSING = [
    "/blog/10-stunning-outdoor-wedding-photography-locations-in-oxford/",
    "/blog/best-uk-wedding-photography-locations/",
    "/blog/best-wedding-venues-event-halls-bristol/",
    "/blog/birmingham-wedding-venues-a-photographers-view/",
    "/blog/nigerian-wedding-photographer-sheffield/",
    "/blog/planning-african-nigerian-wedding-photography-uk/",
    "/blog/top-event-halls-in-leicester-for-weddings-and-receptions/",
    "/blog/nigerian-wedding-photographer-birmingham/",
]


def find(pattern: str, source: str) -> str:
    match = re.search(pattern, source, re.I | re.S)
    if not match:
        raise ValueError(f"Source field missing: {pattern}")
    return html.unescape(match.group(1).strip())


def article_html(source: str) -> str:
    # These eight public posts all place their prose in a custom-code .container.
    # Copy the article, not Pixieset's site chrome or its global body CSS.
    main = source.find('class="main-body"')
    start = source.find('<div class="container">', main)
    if main < 0 or start < 0:
        raise ValueError("Cannot locate article container")
    depth = 0
    for tag in re.finditer(r"</?div\b[^>]*>", source[start:], re.I):
        depth += -1 if tag.group().lower().startswith("</div") else 1
        if depth == 0:
            body = source[start : start + tag.end()]
            if len(re.sub(r"<[^>]+>", " ", body).split()) < 300:
                raise ValueError("Suspiciously short article")
            if re.search(r"<(?:script|style)\b", body, re.I):
                raise ValueError("Article unexpectedly includes executable markup")
            return f'<div class="seo-article">{body}</div>'
    raise ValueError("Article container does not close")


def import_posts(snapshot: Path, image_map: dict[str, str]) -> int:
    comparisons = json.loads((snapshot / "comparison.json").read_text())
    old = json.loads(POSTS.read_text())
    slugs = {row["slug"] for row in old}
    additions = []
    for path in MISSING:
        slug = path.strip("/").split("/")[-1]
        if slug in slugs:
            continue
        match = next((i for i, row in enumerate(comparisons) if row["path"] == path), None)
        if match is None:
            raise ValueError(f"No snapshot for {path}")
        source = (snapshot / f"{match:02d}-source.html").read_text()
        source_image = find(r'<div class="post-header__photo".*?<img[^>]+src="([^"]+)"', source)
        image = image_map.get(slug)
        if not image or not (ROOT / "public" / image.lstrip("/")).is_file():
            raise ValueError(f"Local cover image missing for {slug}")
        date = re.sub(r"<[^>]+>", "", find(r'<p class="post-header__date[^>]*>(.*?)</p>', source)).strip()
        body = article_html(source)
        links = [html.unescape(x) for x in re.findall(r'<a\b[^>]*href="([^"]+)"', body, re.I)]
        additions.append({
            "slug": slug,
            "title": re.sub(r"\s+", " ", find(r'<title>(.*?)</title>', source)),
            "date": date,
            "meta_title": re.sub(r"\s+", " ", find(r'<title>(.*?)</title>', source)),
            "meta_description": find(r'<meta name="description" content="([^"]+)"', source),
            "og_image": image,
            "original_url": f"https://www.cameraboss.co.uk{path}",
            "html": body,
            "internal_links": links,
        })
        print(f"{slug}: {len(body)} HTML characters; local cover {image}; source {urlparse(source_image).netloc}")
    if len(old) + len(additions) != 191:
        raise ValueError(f"Expected 191 total posts, got {len(old) + len(additions)}")
    POSTS.write_text(json.dumps(old + additions, ensure_ascii=False, indent=2) + "\n")
    return len(additions)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--image-map", type=Path, required=True)
    args = parser.parse_args()
    print(f"Added {import_posts(args.snapshot, json.loads(args.image_map.read_text()))} posts")
