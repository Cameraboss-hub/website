# WordPress decision and staging requirements

The 30 September 2026 rebuild is an Astro site. WordPress could make routine
editing easier for a third-party SEO team, especially if they must change
landing pages and templates themselves. It would also be a **second content
migration**, so the editor benefit should be agreed with that team before the
live domain moves. Keeping the Astro site and giving the agency a review and
change-request workflow is a viable alternative if they mainly edit titles,
copy, links, and blog posts.

Do not point DNS at a WordPress site until a staging copy passes these gates:

1. Choose a maintained WordPress host with PHP, MySQL/MariaDB, HTTPS, backups,
   staging, and a clear owner for updates. Google Drive and the NAS are backup
   and client-delivery destinations; neither is a suitable public WordPress
   application host without an independently operated web stack.
2. Build the approved home and `/client-area/` designs as editable templates.
   Import all 191 posts and 45 page records. Decide which legacy thin/duplicate
   pages stay public, but keep a path-preserving response or relevant 301 for
   every URL in `tests/legacy-urls.json`.
3. Set a permalink pattern that serves `/blog/<slug>/`. Test the exact
   mixed-case paths too: WordPress often normalizes slugs, whereas this source
   includes URLs such as `/blog/nigerian-wedding-photographer-in-Leicester/`
   and `/London-wedding-photographer/`. A redirect is acceptable only after
   its destination, canonical, sitemap entry, and analytics are checked.
4. Migrate or retain every referenced image with a durable URL. The imported
   content currently references Supabase blog objects, and the selected
   portfolio images are local files. Do not hotlink Pixieset assets as the
   final media plan. Verify image dimensions, alt text, open-graph images,
   structured data, responsive image variants, and media permissions.
5. Preserve per-page title, meta description, canonical, index/noindex choice,
   internal links, redirects, and the 237 live sitemap URLs. Use one agreed SEO
   plugin and import metadata into its actual fields; test rendered output,
   not just values in the editor.
6. Integrate the enquiry form and test a real message. Reproduce the curated
   portfolio filters at mobile and desktop sizes. Keep client-delivery images
   and originals out of the public media library.
7. Crawl every source URL and the staging equivalent, compare status, title,
   canonical, meta robots, headings, body copy, image responses and redirects.
   Freeze content changes briefly and repeat the crawl before cutover.

If the agency needs WordPress, ask it to confirm its hosting and editor
requirements, then implement and test this as its own staging project. The
current Astro preview remains the reference design and rollback candidate.
No WordPress staging deployment has yet been created.
