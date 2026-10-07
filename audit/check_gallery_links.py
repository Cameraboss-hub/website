"""Read-only HTTP check of every Pixieset link in the client-area cards."""

import concurrent.futures
import datetime
import json
import pathlib
import subprocess
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
CARDS = json.loads((ROOT / "src/data/client-area.json").read_text())["items"]


def inspect(card):
    url = card["href"]
    if urllib.parse.urlparse(url).hostname != "gallery.cameraboss.co.uk":
        return {"slug": card["slug"], "url": url, "ok": False, "error": "Unexpected gallery host"}
    try:
        response = subprocess.run(
            ["curl", "--location", "--silent", "--show-error", "--head",
             "--connect-timeout", "8", "--max-time", "25", "--output", "/dev/null",
             "--write-out", "%{http_code}\n%{url_effective}",
             "--user-agent", "Mozilla/5.0 CameraBoss owner gallery-link QA", url],
            capture_output=True, text=True, timeout=28,
        )
        code, final = response.stdout.split("\n", 1)
        return {"slug": card["slug"], "name": card["title"], "url": url,
                "status": int(code), "final_url": final, "ok": response.returncode == 0 and int(code) == 200,
                "error": response.stderr.strip() or None}
    except Exception as error:
        return {"slug": card["slug"], "name": card["title"], "url": url, "ok": False,
                "error": str(error)}


with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records = list(pool.map(inspect, CARDS))
now = datetime.datetime.now(datetime.timezone.utc)
report = {"checked_at": now.isoformat(), "cards": len(CARDS), "records": records}
target = ROOT / f"audit/gallery-links-{now.date().isoformat()}.json"
target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
failed = [row for row in records if not row["ok"]]
print(f"Gallery links: {len(records)-len(failed)}/{len(records)} HTTP 200; {len(failed)} need review")
for row in failed:
    print(row["slug"], row.get("status"), row.get("error"))
if failed:
    raise SystemExit(1)
