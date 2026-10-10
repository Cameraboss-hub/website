"""HTTP-check every recorded source route and legacy redirect on a preview."""

import concurrent.futures
import datetime
import json
import pathlib
import subprocess
import sys
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else ""
if not BASE.startswith("https://"):
    raise SystemExit("Usage: python3 audit/verify_preview.py https://preview-host [--retry-failed]")
RETRY_FAILED = len(sys.argv) > 2 and sys.argv[2] == "--retry-failed"
if len(sys.argv) > 2 and not RETRY_FAILED:
    raise SystemExit("Unknown option; use --retry-failed")
PATHS = sorted(set(json.loads((ROOT / "tests/legacy-urls.json").read_text())) |
               set(json.loads((ROOT / "src/data/cms-routes.json").read_text()).values()) | {"/admin/"})
ALIASES = json.loads((ROOT / "src/data/legacy-aliases.json").read_text())


def fetch(item):
    kind, path, expected = item
    try:
        response = subprocess.run([
            "curl", "--globoff", "-sS", "--connect-timeout", "15" if RETRY_FAILED else "8",
            "--max-time", "35" if RETRY_FAILED else "20",
            "--output", "/dev/null", "--write-out", "%{response_code}\\n%{content_type}\\n%{redirect_url}",
            "--user-agent", "CameraBoss migration QA", BASE + path,
        ], capture_output=True, text=True, timeout=38 if RETRY_FAILED else 22)
        if response.returncode:
            return {"kind": kind, "path": path, "ok": False, "error": response.stderr.strip()}
        status, content_type, location = response.stdout.split("\n", 2)
        code = int(status)
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
date = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
target = ROOT / f"audit/preview-crawl-{date}.json"
if RETRY_FAILED:
    previous = json.loads(target.read_text())
    if previous["preview"] != BASE:
        raise SystemExit("The saved crawl belongs to another preview")
    failed_paths = {(row["kind"], row["path"]) for row in previous["routes"] if not row["ok"]}
    items = [item for item in items if (item[0], item[1]) in failed_paths]
with concurrent.futures.ThreadPoolExecutor(max_workers=3 if RETRY_FAILED else 12) as pool:
    checked = list(pool.map(fetch, items))
if RETRY_FAILED:
    replacements = {(row["kind"], row["path"]): row for row in checked}
    records = [replacements.get((row["kind"], row["path"]), row) for row in previous["routes"]]
else:
    records = checked
result = {"checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
          "preview": BASE, "routes": records}
target.write_text(json.dumps(result, indent=2) + "\n")
errors = [record for record in records if not record["ok"]]
print("pages", len(PATHS), "redirects", len(ALIASES), "retried", len(checked) if RETRY_FAILED else 0, "failed", len(errors))
for record in errors:
    print(record)
if errors:
    raise SystemExit(1)
