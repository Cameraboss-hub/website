"""Preserve live Pixieset portfolio covers as local, curated website assets."""

import json
import mimetypes
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
inventory = json.loads((ROOT / "audit/live-gallery-inventory-2026-09-29.json").read_text())
by_slug = {item["slug"]: item for item in inventory["items"]}

# The first seven wedding stories and Dana were explicitly featured in the
# Pixieset Wedding/Portrait tabs. The other choices add recent weddings and
# editorial portrait work from the same public collection index.
selection = [
    ("faithandjack-1", "wedding", "recent wedding"),
    ("felixandlina", "wedding", "recent wedding"),
    ("carmenandben", "wedding", "recent wedding"),
    ("cynthiaandoswaldo", "wedding", "recent wedding"),
    ("temiandfiyin", "wedding", "recent wedding"),
    ("joandjonny", "wedding", "recent wedding"),
    ("bambna", "wedding", "Pixieset featured wedding"),
    ("akinpelu", "wedding", "Pixieset featured wedding"),
    ("iyanuwedding", "wedding", "Pixieset featured wedding"),
    ("jumokeandstephen", "wedding", "Pixieset featured wedding"),
    ("vanessawedding", "wedding", "Pixieset featured wedding"),
    ("mayoandemmanuel", "wedding", "Pixieset featured wedding"),
    ("dana", "portrait", "Pixieset featured portrait"),
    ("bridalshoot", "portrait", "bridal editorial"),
    ("opeyemiweddingportrait", "portrait", "bridal portrait"),
    ("princessweddingportraits", "portrait", "bridal portrait"),
    ("finemodelbluesuit", "portrait", "fashion portrait"),
    ("reddressmodel", "portrait", "fashion portrait"),
]

out_dir = ROOT / "public/images/selected-work"
out_dir.mkdir(parents=True, exist_ok=True)
cards = []
for slug, category, why in selection:
    item = by_slug[slug]
    extension = pathlib.PurePosixPath(item["cover"].split("?", 1)[0]).suffix.lower()
    if extension not in (".jpg", ".jpeg", ".png", ".webp"):
        raise ValueError(f"Unexpected image extension for {slug}")
    output = out_dir / f"{slug}{extension}"
    if not output.exists():
        request = urllib.request.Request(item["cover"], headers={"User-Agent": "Mozilla/5.0 CameraBossSiteMigration/1.0"})
        with urllib.request.urlopen(request, timeout=45) as response:
            content = response.read()
            if not (response.headers.get("Content-Type") or "").startswith("image/"):
                raise ValueError(f"Non-image response for {slug}")
            if len(content) < 1000:
                raise ValueError(f"Implausibly small image for {slug}")
            output.write_bytes(content)
    cards.append({
        "slug": slug,
        "title": item["title"],
        "date": item["date"],
        "category": category,
        "image": f"/images/selected-work/{output.name}",
        "source": item["cover"],
        "source_gallery": item["href"],
        "reason": why,
    })

(ROOT / "src/data/portfolio.json").write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n")
print(f"Prepared {len(cards)} curated local images, {sum(p.stat().st_size for p in out_dir.iterdir())/1e6:.1f} MB")
