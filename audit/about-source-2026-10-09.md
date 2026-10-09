# About page source check — 9 October 2026

The current `www.cameraboss.co.uk/about/` domain returned `DNS_PROBE_FINISHED_NXDOMAIN` during this run. The preserved Pixieset HTML in `src/data/pages.json` (`/about/`) and a recent indexed copy of the live page provide the original team names and order. The saved HTML places each image immediately before its name and role:

| Name | Role on source page | Source image |
| --- | --- | --- |
| Taiwo T. | Business manager photographer | `CBP03614` |
| Godfather Ope | Lead Videographer | `IMG_4022` |
| Shugar D | Make-up Artist / Comm Manager | `CBP02666` |
| John D | Lead Creative photographer | `CBP03659` |

The previous About implementation paired Godfather Ope with `CBP02666`, Shugar D with `CBP03659`, and John D with `4C8A1664`, which the source page actually used in a press block. The new page follows the saved source pairings and its recorded object positions.

The behind-the-scenes reel is the user-provided Instagram post `DbnVNZmjLvB`. It shows John photographing a client outdoors with another team member beside him. A frame already exposed by Instagram's embed was saved as `public/images/about/cameraboss-bts-reel-cover.jpg` (640 × 1136, 137 KB). The page loads the Instagram player only when a visitor selects Play film. Reem Photography's About page informed the editorial sequence of film, founder story and finished photographs; no Reem text or media was reused.

The three additional wedding portraits are already hosted locally in `public/images/stories/`. The two Aworan images and their media-outlet names come from the saved Pixieset About page. The recognition photograph uses the image from CameraBoss's own award article. The original SEO baseline in `src/data/seo-baseline.json` remains a record of Pixieset metadata; the editable Pages CMS SEO entry was updated for the new page.
