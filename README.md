# CameraBoss website

This is the CameraBoss marketing-site rebuild. The public domain currently
serves Pixieset; this repository is a deployment candidate, **not** a signal
to change DNS. See [LAUNCH-READINESS.md](LAUNCH-READINESS.md) for the current
checks and remaining decisions.

As audited on 30 September 2026, the site contains 191 blog posts at their
original `/blog/<slug>/` paths, 45 imported page records, a redesigned home
page, and a curated 18-photograph wedding and portrait portfolio at
`/client-area/`. Imported blog and page images are served from Supabase's
`blog` bucket or local assets. The enquiry form is provided by CameraBoss CRM
on `/contact/` and pages that retained an embed. Historical client-gallery
links still lead to Pixieset while original-photo delivery is prepared on
Google Drive and the NAS.

The Astro site uses the Vercel adapter and prerenders the marketing content.
The current source sitemap has 237 URLs. `tests/legacy-urls.json` and
`src/data/seo-baseline.json` record route and metadata parity. Portfolio
selection and source attribution live in `src/data/portfolio.json`; the full
historical card list is retained as data in `src/data/client-area.json` but is
no longer shown as a public client-download index.

The current branch preview is
`https://website-6g9hte0fv-cameraboss.vercel.app/`. It is a preview only;
the public domain remains on Pixieset.

## Development and verification

```bash
npm install
./node_modules/.bin/astro dev --background
./node_modules/.bin/astro dev status
./node_modules/.bin/astro dev stop
npm run check
npm test
```

`npm test` runs the unit tests, production build, and migration checks against
`.vercel/output/static`. The public domain and DNS are outside this workflow.

## Hosting choice

This codebase is Astro, not a WordPress theme. If the SEO agency needs to edit
pages and templates in WordPress, follow [WORDPRESS-MIGRATION.md](WORDPRESS-MIGRATION.md)
and prove URL, metadata, image, and form parity on a WordPress staging site
before any cutover. No WordPress host or staging instance is configured here.
