"""HTTP-check every recorded source route and legacy redirect on a preview."""

import concurrent.futures
import datetime
import json
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else ""
if not BASE.startswith("https://"):
    raise SystemExit("Usage: python3 audit/verify_preview.py https://preview-host")
PATHS = sorted(set(json.loads((ROOT / "tests/legacy-urls.json").read_text())) |
               set(json.loads((ROOT / "src/data/cms-routes.json").read_text()).values()) | {"/admin/"})
ALIASES = json.loads((ROOT / "src/data/legacy-aliases.json").read_text())


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None


opener = urllib.request.build_opener(NoRedirect)


def fetch(item):
    kind, path, expected = item
    request = urllib.request.Request(BASE + path, headers={"User-Agent": "CameraBoss migration QA"})
    try:
        with opener.open(request, timeout=30) as response:
            code = response.status
            location = response.headers.get("Location", "")
            content_type = response.headers.get("Content-Type", "")
            if kind == "page":
                response.read(1024)
    except urllib.error.HTTPError as error:
        code = error.code
        location = error.headers.get("Location", "")
        content_type = error.headers.get("Content-Type", "")
    except Exception as error:
        return {"kind": kind, "path": path, "ok": False, "error": str(error)}
    if kind == "page":
        ok = code == 200 and "text/html" in content_type
    else:
        actual = urllib.parse.urlparse(urllib.parse.urljoin(BASE, location)).path
        ok = code == 301 and actual == expected
    return {"kind": kind, "path": path, "status": code, "location": location,
            "content_type": content_type, "ok": ok}


items = [("page", path, None) for path in PATHS]
items += [("redirect", old, new) for old, new in ALIASES.items()]
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    records = list(pool.map(fetch, items))
result = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
          "preview": BASE, "routes": records}
date = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
target = ROOT / f"audit/preview-crawl-{date}.json"
target.write_text(json.dumps(result, indent=2) + "\n")
errors = [record for record in records if not record["ok"]]
print("pages", len(PATHS), "redirects", len(ALIASES), "failed", len(errors))
for record in errors:
    print(record)
if errors:
    raise SystemExit(1)
