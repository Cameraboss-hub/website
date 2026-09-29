"""Read-only check of non-map outbound links in generated HTML.

4xx access blocks from social/commerce sites are recorded as uncertain, not
declared broken. Run only when a local production build exists.
"""

import concurrent.futures
import datetime
import html.parser
import json
import pathlib
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
BUILD = ROOT / ".vercel/output/static"
OWNED = {"www.cameraboss.co.uk", "cameraboss.co.uk"}
SKIP = {"www.google.com", "maps.google.com"}


class Links(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = set()

    def handle_starttag(self, tag, attributes):
        if tag != "a":
            return
        value = dict(attributes).get("href", "")
        host = urllib.parse.urlparse(value).netloc
        if host and host not in OWNED | SKIP:
            self.links.add(value)


urls = set()
for path in BUILD.rglob("*.html"):
    parser = Links()
    parser.feed(path.read_text(errors="ignore"))
    urls.update(parser.links)


def probe(url):
    for method in ("HEAD", "GET"):
        request = urllib.request.Request(url, method=method, headers={"User-Agent": "Mozilla/5.0 CameraBoss link audit"})
        try:
            with urllib.request.urlopen(request, timeout=12) as response:
                return {"url": url, "status": response.status, "final_url": response.url, "method": method}
        except urllib.error.HTTPError as error:
            if method == "HEAD" and error.code in (404, 405, 410, 500, 501):
                continue
            return {"url": url, "status": error.code, "final_url": error.url, "method": method}
        except Exception as error:
            if method == "HEAD":
                continue
            return {"url": url, "error": str(error)}


with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    records = sorted(pool.map(probe, sorted(urls)), key=lambda row: row["url"])
target = ROOT / "audit/outbound-link-check-2026-09-30.json"
target.write_text(json.dumps({"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                              "links": records}, indent=2) + "\n")
broken = [row for row in records if row.get("status") in (404, 410)]
uncertain = [row for row in records if "error" in row or row.get("status", 0) >= 400 and row not in broken]
print("checked", len(records), "confirmed 404/410", len(broken), "blocked/uncertain", len(uncertain))
for row in broken:
    print(row["status"], row["url"])
