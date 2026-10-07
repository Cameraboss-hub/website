"""Probe every remote image URL rendered by the latest local build.

Run ``python3 audit/check_rendered_images.py --inventory`` first.
"""

import collections
import concurrent.futures
import datetime
import json
import pathlib
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
INVENTORY = ROOT / f"audit/rendered-images-{datetime.date.today().isoformat()}.json"
ROWS = json.loads(INVENTORY.read_text())["images"]
REMOTE = [row for row in ROWS if urllib.parse.urlparse(row["url"]).hostname not in
          {"www.cameraboss.co.uk", "cameraboss.co.uk"}]


def probe(row):
    url = row["url"]
    last = {}
    for method in ("HEAD", "GET"):
        try:
            headers = {"User-Agent": "Mozilla/5.0 CameraBoss owner image QA"}
            if method == "GET":
                headers["Range"] = "bytes=0-1023"
            request = urllib.request.Request(url, method=method, headers=headers)
            with urllib.request.urlopen(request, timeout=20) as response:
                media = response.headers.get("Content-Type", "")
                return {"url": url, "status": response.status, "content_type": media,
                        "ok": response.status in (200, 206) and media.startswith("image/")}
        except urllib.error.HTTPError as error:
            last = {"url": url, "status": error.code, "ok": False}
        except Exception as error:
            last = {"url": url, "error": str(error), "ok": False}
        time.sleep(.12)
    return last


results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for row in pool.map(probe, REMOTE):
        results.append(row)
        if len(results) % 500 == 0:
            print(f"Checked {len(results)}/{len(REMOTE)}", flush=True)
failures = [row for row in results if not row["ok"]]
now = datetime.datetime.now(datetime.timezone.utc)
report = {"checked_at": now.isoformat(), "total": len(results),
          "passed": len(results) - len(failures),
          "statuses": dict(collections.Counter(str(row.get("status", "error")) for row in results)),
          "failures": failures}
target = ROOT / f"audit/remote-images-{now.date().isoformat()}.json"
target.write_text(json.dumps(report, indent=2) + "\n")
print(f"Remote images {report['passed']}/{report['total']} passed; failures {len(failures)}")
if failures:
    raise SystemExit(1)
