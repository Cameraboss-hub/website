# CameraBoss launch readiness — 30 September 2026

**DNS has not been changed in this work.** The public `www` and `gallery`
hosts still resolve through `domain.pixieset.com`; the nameservers are
`nsa.whogohost.com` and `nsb.whogohost.com`. Recheck records and registrar
ownership before any later cutover.

## What has been prepared

- Live Pixieset sitemap: 237 URLs. The rebuilt sitemap matches it exactly:
  191 posts plus the blog index and 45 other routes. Eight posts missing from
  the earlier clone were imported at their original paths. Their covers are
  now local files. The old incorrect Birmingham blog redirect was removed.
- All 45 imported page block sets were compared with the public site. Three
  pages with changed block structure and 17 pages with changed prose were
  refreshed. A wedding-services page and a film article with unrelated
  copied text were also repaired. This work reuses existing Supabase image
  variants; no new objects were uploaded to Supabase. A 236-route visible-text
  comparison found 228 exact matches and eight documented differences, with
  no unexpected drift.
- The homepage now has a clear photography proposition, 12 linked gallery
  covers, wedding and portrait paths, journal links and enquiry calls to action.
  `/client-area/` has 18 featured covers (12 weddings and six portraits) plus
  a searchable directory for the other 259 recorded collections. Every card
  opens its complete Pixieset collection. Five featured galleries also have
  on-site selected-photo stories. The public portfolio contains no client PIN
  or download interface; Pixieset retains those collection settings.
- Broken third-party image slots on the Newcastle page were replaced with
  verified images from the same Jo and Jonny wedding; four expired Instagram
  embeds in an exhibition article were replaced with images already attached
  to that story. The original Manus-hosted files were not recoverable.
- The production build generates 238 HTML files including the 404 page. Its
  output is about 85 MB in `.vercel/output/static`. A full generated-site scan
  found zero unresolved internal page links and zero missing local `<img>`
  files. Build, Astro check, unit tests and migration tests pass locally.
- Vercel built the feature branch as a Ready **preview** at
  `https://website-clv99dq3l-cameraboss.vercel.app/`. An HTTP crawl returned
  200 for all 237 recorded source paths and the expected 301 destination for
  all 43 historical redirects. All 27 checked local portfolio, blog-cover and
  about images returned 200 with image content. No production deployment or
  custom-domain assignment was made.
- An outbound-link audit of the rebuilt HTML checked 118 distinct non-map
  external targets after repairing a dead Bodleian URL, a retired Clifton
  Pavilion URL, an obsolete Boomer Gallery domain, and a mistaken
  `cameraboss.com` self-link. No target returned 404 or 410 on the final pass;
  15 returned an access block or transport error and remain unverified. See
  `audit/outbound-link-check-2026-09-30.json`. Dynamic Google Maps search links
  were outside this check.

## What remains before a safe change of provider

1. **Choose Astro or WordPress as the launch target.** WordPress is reasonable
   if an SEO agency requires direct editing, but no WordPress host, theme,
   content import or staging crawl exists yet. See `WORDPRESS-MIGRATION.md`.
2. **Choose and verify the final host.** The Astro Vercel preview passes its
   route and image checks, but still needs the real enquiry and visual review
   before a production cutover. A WordPress staging site has not been built.
3. **Verify client originals in two destinations.** The mounted Google Drive
   folder `CAMERABOSS CLIENT GALLERIES` currently contains only a test file.
   No verified Ugreen NAS archive mount was found. Local Mac storage has
   about 32 GiB free. No full-resolution client-gallery transfer or
   server-side Drive verification happened in this run. Pixieset remains
   the only verified client archive and must stay available.
4. **Keep the gallery subdomain on Pixieset.** Hundreds of
   `gallery.cameraboss.co.uk` links in messages, invoices and the new portfolio
   depend on it. Change only the apex and `www` records during the later site
   cutover. Do not cancel Pixieset or change the gallery record.
5. **Test a real enquiry on preview** and check inbox receipt. The current
   local tests prove form placement and fallback paths, not delivery.
6. **Confirm commercial hosting terms.** The Vercel project currently shows
   the Hobby plan; Vercel's published terms restrict Hobby to personal,
   non-commercial use. A business launch needs an appropriate plan or host.
7. **Check public-image choices and rights.** The selection is based on
   existing publicly displayed gallery covers; individual photographs across
   every collection were not exhaustively reviewed. Browser-visible images
   can always be saved by visitors, even without a download button. Keep
   full-resolution originals off the public site.
8. **Review external links that blocked automation.** Fifteen targets in the
   outbound-link report could not be verified from this environment. These
   are not proven broken, but need a human browser check before cutover.

No DNS records, Pixieset collections, Google Drive files, or NAS files were
changed by this preparation.
