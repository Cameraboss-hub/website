# Curated portfolio photographs

The public gallery at `/client-area/` keeps the established website URL. It has
18 featured cover photographs and a searchable directory of the other 259
collections in `src/data/client-area.json`. Every gallery card links directly
to its complete collection at `gallery.cameraboss.co.uk`, which stays on
Pixieset when the main website's DNS changes. Five featured cards also have a
separate on-site `View selected photographs` link to a short photo story at
`/stories/<slug>/`; those five stories currently contain 51 display images.

Google Drive is the source library for future story exports, not the image
server visitors load from. Website images are resized, stripped of camera/GPS
metadata, and committed under `public/images/stories/` so the site serves them
as static files. Full-resolution client originals remain on Pixieset while
Drive and NAS backups are verified. Public Pixieset gallery links are in the
portfolio data; no client PINs or private download tokens are.

The first four stories were made from the 1,600-pixel public web copies that
already existed in the Supabase `photos` bucket. This was a way to build and
review the story layout without moving any full client collection or increasing
storage use in Supabase. The fifth story, Vanessa Wedding, uses nine selected
originals from its Google Drive folder to make public display copies. This does
**not** prove that all five stories' originals are safely archived in the
designated `CAMERABOSS CLIENT GALLERIES` Drive folder. That folder still
contained only `_backup_test.txt` when checked on 30 September 2026.

To add a Drive-sourced story:

1. Find and verify the correct original gallery in My Drive. Confirm the
   photographs are approved for public display, and select a short sequence
   by looking at the images, not by filename order. Include setting, people,
   details and atmosphere. Do not publish the full client delivery set.
2. Add the cover to `src/data/portfolio.json` and
   `public/images/selected-work/`, if it is not already in the index.
3. Add one entry to `curation/portfolio-stories.json` with `source: "drive"`,
   a `folder` path relative to My Drive, and each selected photo's `file` and
   descriptive `alt`. Keep client share URLs and PINs out of this file.
4. Run the exporter with Pillow installed:

   ```bash
   python3 scripts/optimize-portfolio.py --stories --drive-root "$HOME/Library/CloudStorage/GoogleDrive-camerabossphotos@gmail.com/My Drive"
   ```

   It creates 480-, 960- and 1600-pixel WebP variants and regenerates
   `src/data/portfolio-stories.json`. The build uses those committed files;
   it never needs an authenticated Drive connection at request time.
5. Review every generated image, its crop, order and alt text; run
   `npm run check` and `npm test`; then review the preview deployment on a
   phone and desktop. Only entries in the generated story manifest receive
   links and sitemap entries. Existing blog URLs and old client gallery links
   are separate and remain as they were.

The selected copies are display assets, not a way to prevent saving: any image
shown in a browser can be copied. Never put full-resolution delivery files in
`public/`. To replace a story later, update its curation entry and regenerate
the images. The archive and NAS backup require their own verified counts and
checksums before Pixieset can be retired.
