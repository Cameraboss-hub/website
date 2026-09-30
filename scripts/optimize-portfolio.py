"""Export small, metadata-free website copies of curated photographs.

Requires Pillow. Cover images are local; story originals remain in mounted Drive.
Usage: python3 scripts/optimize-portfolio.py [--drive-root '/path/to/My Drive']
The generated WebP files and public story manifest are committed with the site,
so deployment never needs access to Drive or its API.
"""

import argparse
from io import BytesIO
import json
from pathlib import Path
import re
from urllib.request import urlopen

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SIZES = (480, 960, 1600)


def export(source: Path | BytesIO, base: Path) -> tuple[int, int]:
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        width, height = image.size
        for target_width in SIZES:
            destination = base.parent / f"{base.name}-{target_width}.webp"
            destination.parent.mkdir(parents=True, exist_ok=True)
            resized = image.copy()
            resized.thumbnail((target_width, target_width * 3), Image.Resampling.LANCZOS)
            resized.save(destination, "WEBP", quality=76, method=6)
        return width, height


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--drive-root", type=Path, help="Mounted My Drive path for Drive-sourced stories")
    parser.add_argument("--stories", action="store_true", help="Export public story photographs as well as covers")
    args = parser.parse_args()

    covers = json.loads((ROOT / "src/data/portfolio.json").read_text())
    for cover in covers:
        source = PUBLIC / cover["image"].lstrip("/")
        if not source.is_file():
            raise FileNotFoundError(source)
        export(source, PUBLIC / "images/selected-work/web" / cover["slug"])
    print(f"Optimised {len(covers)} selected-work covers")

    if not args.stories:
        return
    drive_root = args.drive_root.expanduser().resolve(strict=True) if args.drive_root else None
    selection = json.loads((ROOT / "curation/portfolio-stories.json").read_text())
    published = []
    for story in selection:
        if story["slug"] not in {cover["slug"] for cover in covers}:
            raise ValueError(f"Story has no portfolio cover: {story['slug']}")
        if len(story["photos"]) < 2:
            raise ValueError(f"A published story needs multiple photographs: {story['slug']}")
        photos = []
        for number, photo in enumerate(story["photos"], 1):
            if story["source"] == "drive":
                if drive_root is None:
                    raise ValueError(f"--drive-root is needed for {story['slug']}")
                source = (drive_root / story["folder"] / photo["file"]).resolve(strict=True)
                if not source.is_relative_to(drive_root):
                    raise ValueError(f"Source escaped Drive root: {source}")
            elif story["source"] == "existing-public-web":
                url = photo["url"]
                if not re.fullmatch(r"https://htwwyqfattodfaybqgev\.supabase\.co/storage/v1/object/public/photos/[A-Za-z0-9_./-]+\.webp", url):
                    raise ValueError(f"Unexpected public photo URL: {url}")
                with urlopen(url, timeout=30) as response:
                    source = BytesIO(response.read())
            else:
                raise ValueError(f"Unknown source for {story['slug']}")
            base = PUBLIC / "images/stories" / story["slug"] / f"{number:02d}"
            width, height = export(source, base)
            photos.append({
                "alt": photo["alt"],
                "src": f"/images/stories/{story['slug']}/{number:02d}-960.webp",
                "srcset": ", ".join(
                    f"/images/stories/{story['slug']}/{number:02d}-{size}.webp {size}w"
                    for size in SIZES
                ),
                "width": width,
                "height": height,
            })
        published.append({"slug": story["slug"], "description": story["description"], "photos": photos})
    (ROOT / "src/data/portfolio-stories.json").write_text(json.dumps(published, indent=2) + "\n")
    print(f"Exported {len(published)} public stories from their curated sources")


if __name__ == "__main__":
    main()
