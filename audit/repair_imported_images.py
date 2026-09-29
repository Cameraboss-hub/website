"""Replace unavailable imported image URLs with verified CameraBoss assets.

The Newcastle page used temporary Manus file URLs. The replacement images are
from Jo and Jonny, the wedding discussed on that page, already present in the
site's Supabase photos bucket. The exhibition post used expired Instagram CDN
links; replacement photographs are from that same post's Supabase blog assets.
"""

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
STORAGE = "https://htwwyqfattodfaybqgev.supabase.co/storage/v1/object/public"
NEWCASTLE = [
    "0065_CBA00451-Edit.webp",
    "0067_CBB00804-Edit.webp",
    "0072_CBB01578-Edit.webp",
    "0073_CBB01585-Edit.webp",
    "0074_WGP00618-Edit.webp",
    "0075_CBA00434-Edit.webp",
    "0076_WGP00648-Edit.webp",
    "0078_WGP00670-Edit.webp",
    "0079_CBB01620-Edit.webp",
]
EXHIBITION = [
    "8b5b162a_SanctuaryofNature-77a8c530-1500.webp",
    "ca29931d_CBP07925-069a97d5-1000.webp",
    "7edc7205_CBP07928-b6a69806-1000.webp",
    "d1a2c603_CBP07919-2ff97f19-1000.webp",
]

pages_path = ROOT / "src/data/pages.json"
pages = json.loads(pages_path.read_text())
newcastle = next(page for page in pages if page.get("path") == "/newcastle-wedding-photographer/")
counter = [0]

def replace_newcastle(match):
    image = NEWCASTLE[counter[0] % len(NEWCASTLE)]
    counter[0] += 1
    tag = match.group(0)
    tag = re.sub(r'src="[^"]+"', f'src="{STORAGE}/photos/joandjonny/{image}"', tag, count=1)
    return re.sub(r'alt="[^"]*"', 'alt="Jo and Jonny wedding photograph by CameraBoss"', tag, count=1)

newcastle["html"] = re.sub(
    r'<img\b[^>]*src="https://files\.manuscdn\.com/[^"]+"[^>]*>',
    replace_newcastle,
    newcastle["html"],
    flags=re.I,
)
if counter[0] not in (0, 12):
    raise ValueError(f"Partial Newcastle repair: {counter[0]} image references remain")

posts_path = ROOT / "src/data/posts.json"
posts = json.loads(posts_path.read_text())
fixed_meta = 0
fixed_instagram = 0
for post in posts:
    if post["slug"] == "finding-meaning-through-art-my-journey-to-boomer-gallerys-dreams-and-nightmares-exhibition":
        def replace_instagram(match):
            global fixed_instagram
            image = EXHIBITION[fixed_instagram]
            fixed_instagram += 1
            tag = match.group(0)
            tag = re.sub(r'src="[^"]+"', f'src="{STORAGE}/blog/{image}"', tag, count=1)
            return re.sub(r'alt="[^"]*"', 'alt="CameraBoss work at the Dreams and Nightmares exhibition"', tag, count=1)

        post["html"] = re.sub(
            r'<img\b[^>]*src="https://scontent-[^"]+"[^>]*>',
            replace_instagram,
            post["html"],
            flags=re.I,
        )

    def replace_meta(match):
        global fixed_meta
        fixed_meta += 1
        return f'{match.group(1)}{post["og_image"]}{match.group(3)}'

    post["html"] = re.sub(
        r'(<meta\s+property="og:image"\s+content=")(https?://(?:www\.)?cameraboss\.co\.uk/images/[^"]+)(")',
        replace_meta,
        post["html"],
        flags=re.I,
    )

if fixed_instagram not in (0, 4):
    raise ValueError(f"Partial exhibition repair: {fixed_instagram} images remain")
if fixed_meta not in (0, 30):
    raise ValueError(f"Partial OG repair: {fixed_meta} references remain")
if counter[0]:
    pages_path.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + "\n")
if fixed_instagram or fixed_meta:
    posts_path.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n")
print(f"Repaired {counter[0]} Newcastle slots, {fixed_instagram} exhibition slots, {fixed_meta} embedded OG references")
